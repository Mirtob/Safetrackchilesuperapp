/**
 * Google Drive Integration Service — SafeTrack Chile
 *
 * Usa la Drive REST API v3 directamente con el access token OAuth2
 * obtenido al iniciar sesión con Google (scope: drive.file).
 *
 * Scope drive.file: solo accede a archivos creados por esta app,
 * no al Drive completo del usuario.
 */

import {
  refreshDriveAccessToken,
  ReconnectRequiredError,
} from '@/app/services/googleTokenRefresh';

// ============================================================
// TIPOS
// ============================================================

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink?: string;
  thumbnailLink?: string;
  parents?: string[];
}

export interface DriveFolder {
  id: string;
  name: string;
  createdTime: string;
  modifiedTime: string;
}

export const MIME_TYPES = {
  FOLDER: 'application/vnd.google-apps.folder',
  PDF: 'application/pdf',
  WORD: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  GOOGLE_DOC: 'application/vnd.google-apps.document',
  GOOGLE_SHEET: 'application/vnd.google-apps.spreadsheet',
};

// ============================================================
// TOKEN DE ACCESO
// ============================================================

/**
 * Supabase entrega `session.provider_token` (el access token de Google) UNA sola
 * vez: en el redirect del OAuth. Las sesiones restauradas desde localStorage no
 * lo traen. Por eso lo persistimos aquí; si no, Drive dejaba de funcionar en
 * cuanto el usuario recargaba la página.
 *
 * El token vive ~1h. Al caducar se renueva solo contra la Edge Function
 * `google-token-refresh`, que guarda el client_secret del lado del servidor. Si
 * esa función no está desplegada o Google revocó el permiso, se marca Drive como
 * desconectado y la UI ofrece reconectar: nunca se falla en silencio.
 */

const TOKEN_STORAGE_KEY = 'safetrack_drive_token';

/** Margen bajo la hora real de vida del token, para no usarlo justo al filo. */
const TOKEN_TTL_MS = 55 * 60 * 1000;

/** Se renueva de forma anticipada dentro de esta ventana previa al vencimiento. */
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

interface StoredToken {
  token: string;
  expiresAt: number;
}

/** Error de autorización de Drive, distinguible de un fallo de red o de API. */
export class DriveAuthError extends Error {
  constructor(message = 'Se perdió la autorización de Google Drive. Vuelve a conectar tu cuenta.') {
    super(message);
    this.name = 'DriveAuthError';
  }
}

let _accessToken = '';
let _expiresAt = 0;

type AuthListener = (authorized: boolean) => void;
const _listeners = new Set<AuthListener>();

const notify = (): void => {
  const authorized = isAuthorized();
  _listeners.forEach(fn => fn(authorized));
};

/** Suscribe a cambios de autorización. Devuelve la función para desuscribir. */
export const onAuthChange = (fn: AuthListener): (() => void) => {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
};

const readStoredToken = (): StoredToken | null => {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredToken;
    if (!parsed?.token || typeof parsed.expiresAt !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
};

/**
 * Guarda el access token de Drive. Pasar '' lo borra (logout).
 * `expiresAt` permite restaurar un token ya persistido sin reiniciar su reloj.
 */
export const setAccessToken = (token: string, expiresAt?: number): void => {
  _accessToken = token;
  _expiresAt = token ? (expiresAt ?? Date.now() + TOKEN_TTL_MS) : 0;

  try {
    if (token) {
      localStorage.setItem(
        TOKEN_STORAGE_KEY,
        JSON.stringify({ token, expiresAt: _expiresAt } satisfies StoredToken)
      );
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // localStorage lleno o bloqueado: seguimos con el token solo en memoria.
  }

  notify();
};

/**
 * Restaura el token persistido en cargas donde Supabase no entrega
 * `provider_token`. Devuelve true si quedó un token válido.
 */
export const restoreAccessToken = (): boolean => {
  const stored = readStoredToken();
  if (!stored) return false;

  if (stored.expiresAt <= Date.now()) {
    setAccessToken('');
    return false;
  }

  _accessToken = stored.token;
  _expiresAt = stored.expiresAt;
  notify();
  return true;
};

const isAuthorized = (): boolean => Boolean(_accessToken) && _expiresAt > Date.now();

/** Descarta el token actual: expiró o Google lo rechazó. */
const invalidateToken = (): void => {
  if (_accessToken) setAccessToken('');
};

// ============================================================
// RENOVACIÓN AUTOMÁTICA
// ============================================================

/**
 * Una sola renovación en vuelo a la vez. Sin esto, abrir una pantalla que hace
 * cinco llamadas a Drive con el token recién vencido dispararía cinco canjes
 * simultáneos contra Google.
 */
let _refreshInFlight: Promise<boolean> | null = null;

/**
 * Intenta renovar el token contra la Edge Function.
 * Devuelve true si quedó un token utilizable.
 */
const tryRefresh = async (): Promise<boolean> => {
  if (_refreshInFlight) return _refreshInFlight;

  _refreshInFlight = (async () => {
    try {
      const result = await refreshDriveAccessToken();
      if (!result) return false;

      // Se respeta la vida real que informa Google, con el mismo margen.
      const ttl = Math.max(result.expiresIn * 1000 - REFRESH_MARGIN_MS, 60_000);
      setAccessToken(result.accessToken, Date.now() + ttl);
      return true;
    } catch (err) {
      // Permiso revocado: el token guardado ya no vale y hay que reconectar.
      if (err instanceof ReconnectRequiredError) invalidateToken();
      return false;
    } finally {
      _refreshInFlight = null;
    }
  })();

  return _refreshInFlight;
};

/**
 * Asegura un token vigente antes de llamar a Drive: si caducó (o está por
 * caducar) lo renueva. Lanza DriveAuthError solo cuando no queda alternativa.
 */
const requireAuth = async (): Promise<void> => {
  if (isAuthorized() && _expiresAt - Date.now() > REFRESH_MARGIN_MS) return;

  // Vencido o a punto de vencer: se intenta renovar antes de rendirse.
  if (await tryRefresh()) return;

  if (isAuthorized()) return; // sigue vigente aunque la renovación no prosperara

  invalidateToken();
  throw new DriveAuthError();
};

/**
 * Deja el acceso a Drive listo si es posible, sin lanzar excepciones.
 *
 * Devuelve true cuando hay un token utilizable —ya sea el guardado o uno recién
 * renovado— y false cuando el usuario debe reconectar. Pensado para el arranque
 * de la app, donde un fallo no debe interrumpir nada.
 */
export const ensureAccess = async (): Promise<boolean> => {
  if (isAuthorized() && _expiresAt - Date.now() > REFRESH_MARGIN_MS) return true;
  if (await tryRefresh()) return true;
  return isAuthorized();
};

/**
 * Ejecuta una petición a Drive y, si Google responde 401, renueva el token una
 * vez y reintenta. Así una sesión larga no interrumpe al usuario en terreno.
 */
const withRetry = async (send: () => Promise<Response>): Promise<Response> => {
  const res = await send();
  if (res.status !== 401) return res;

  // El token pudo caducar antes de lo previsto (revocación, cambio de clave).
  invalidateToken();
  if (!(await tryRefresh())) return res;

  return send();
};

/** Convierte un 401/403 de Drive en DriveAuthError y limpia el token. */
const assertOk = async (res: Response, fallback: string): Promise<void> => {
  if (res.ok) return;

  if (res.status === 401 || res.status === 403) {
    invalidateToken();
    throw new DriveAuthError();
  }

  const err = await res.json().catch(() => ({}));
  throw new Error(err?.error?.message || `${fallback}: ${res.status}`);
};

// ============================================================
// HELPER DE REQUEST
// ============================================================

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

async function driveGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  await requireAuth();

  const url = new URL(`${DRIVE_API}/${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await withRetry(() =>
    fetch(url.toString(), { headers: { Authorization: `Bearer ${_accessToken}` } })
  );

  await assertOk(res, 'Error Drive API');
  return res.json();
}

async function drivePost<T>(path: string, body: unknown): Promise<T> {
  await requireAuth();

  const res = await withRetry(() =>
    fetch(`${DRIVE_API}/${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${_accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  );

  await assertOk(res, 'Error Drive API');
  return res.json();
}

// ============================================================
// ESTRUCTURA DE CARPETAS
// ============================================================

export const COMPANY_SUBFOLDERS = [
  'Inspecciones',
  'Accidentes e Incidentes',
  'Capacitaciones y Charlas',
  'Documentos Legales',
  'EPP y Activos',
  'Planes de Acción',
  'Firmas',
] as const;

export const PORTFOLIO_SUBFOLDERS = [
  'Honorarios',
  'Gastos',
  'Reportes',
] as const;

export type CompanySubfolder = (typeof COMPANY_SUBFOLDERS)[number];
export type PortfolioSubfolder = (typeof PORTFOLIO_SUBFOLDERS)[number];

// ============================================================
// CARPETAS
// ============================================================

const FILE_FIELDS = 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,thumbnailLink,parents';

/** Crea o reutiliza una carpeta por nombre dentro de un folder padre. */
async function ensureFolder(name: string, parentId: string): Promise<string> {
  const safeName = name.replace(/['"\\]/g, '');
  const data = await driveGet<{ files: { id: string }[] }>('files', {
    q: `name='${safeName}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
    fields: 'files(id)',
  });
  if (data.files?.length > 0) return data.files[0].id;
  const folder = await drivePost<{ id: string }>('files', {
    name,
    mimeType: MIME_TYPES.FOLDER,
    parents: [parentId],
  });
  return folder.id;
}

/**
 * Lista carpetas en la raíz del Drive del usuario.
 */
export const listCompanyFolders = async (): Promise<DriveFolder[]> => {
  const data = await driveGet<{ files: DriveFolder[] }>('files', {
    q: "mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed=false",
    fields: `files(id,name,createdTime,modifiedTime)`,
    orderBy: 'name',
  });
  return data.files || [];
};

/**
 * Crea (o reutiliza) la carpeta raíz "SafeTrack Chile" en el Drive del usuario.
 */
export const ensureSafeTrackFolder = async (): Promise<string> => {
  const data = await driveGet<{ files: { id: string }[] }>('files', {
    q: "name='SafeTrack Chile' and mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed=false",
    fields: 'files(id)',
  });

  if (data.files?.length > 0) return data.files[0].id;

  const folder = await drivePost<{ id: string }>('files', {
    name: 'SafeTrack Chile',
    mimeType: MIME_TYPES.FOLDER,
  });
  return folder.id;
};

/**
 * Crea (o reutiliza) una subcarpeta de empresa dentro de "SafeTrack Chile/".
 */
export const ensureCompanyFolder = async (
  companyName: string,
  parentFolderId: string
): Promise<string> => ensureFolder(companyName, parentFolderId);

/**
 * Inicializa la estructura raíz en el primer login del usuario:
 *
 *   SafeTrack Chile/
 *     _Portafolio Profesional/
 *       Honorarios/  Gastos/  Reportes/
 *
 * Idempotente: si las carpetas ya existen, las reutiliza.
 */
export const bootstrapDriveStructure = async (): Promise<{
  rootId: string;
  portfolioId: string;
}> => {
  const rootId = await ensureSafeTrackFolder();
  const portfolioId = await ensureFolder('_Portafolio Profesional', rootId);
  await Promise.all(PORTFOLIO_SUBFOLDERS.map(name => ensureFolder(name, portfolioId)));
  return { rootId, portfolioId };
};

/**
 * Crea (o reutiliza) la estructura de subcarpetas para una empresa:
 *
 *   SafeTrack Chile/[Empresa]/
 *     Inspecciones/  Accidentes e Incidentes/  Capacitaciones y Charlas/
 *     Documentos Legales/  EPP y Activos/  Planes de Acción/  Firmas/
 *
 * Llama esto al agregar una empresa nueva al portafolio.
 */
export const ensureCompanyStructure = async (
  companyName: string,
  rootId: string
): Promise<{ companyId: string; folders: Record<CompanySubfolder, string> }> => {
  const companyId = await ensureCompanyFolder(companyName, rootId);
  const entries = await Promise.all(
    COMPANY_SUBFOLDERS.map(async name => {
      const id = await ensureFolder(name, companyId);
      return [name, id] as [CompanySubfolder, string];
    })
  );
  return {
    companyId,
    folders: Object.fromEntries(entries) as Record<CompanySubfolder, string>,
  };
};

// ============================================================
// ARCHIVOS
// ============================================================

/**
 * Lista archivos dentro de una carpeta.
 */
export const listFilesInFolder = async (
  folderId: string,
  pageToken?: string
): Promise<{ files: DriveFile[]; nextPageToken?: string }> => {
  const params: Record<string, string> = {
    q: `'${folderId}' in parents and trashed=false`,
    fields: `nextPageToken,files(${FILE_FIELDS})`,
    orderBy: 'folder,name',
    pageSize: '50',
  };
  if (pageToken) params.pageToken = pageToken;

  const data = await driveGet<{ files: DriveFile[]; nextPageToken?: string }>('files', params);
  return { files: data.files || [], nextPageToken: data.nextPageToken };
};

/**
 * Busca archivos por nombre dentro de una carpeta.
 */
export const searchFilesInFolder = async (
  folderId: string,
  searchTerm: string
): Promise<DriveFile[]> => {
  const safe = searchTerm.replace(/'/g, "\\'");
  const data = await driveGet<{ files: DriveFile[] }>('files', {
    q: `'${folderId}' in parents and name contains '${safe}' and trashed=false`,
    fields: `files(${FILE_FIELDS})`,
    orderBy: 'name',
  });
  return data.files || [];
};

/**
 * Sube un Blob (p.ej. un PDF generado) a una carpeta de Drive.
 * Retorna el DriveFile creado.
 */
export const uploadFile = async (
  blob: Blob,
  fileName: string,
  parentFolderId: string,
  mimeType = 'application/pdf'
): Promise<DriveFile> => {
  await requireAuth();

  const metadata = { name: fileName, parents: [parentFolderId], mimeType };

  // El FormData se arma en cada intento: un body ya consumido no se puede
  // reenviar en el reintento posterior a la renovación.
  const buildForm = (): FormData => {
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);
    return form;
  };

  const res = await withRetry(() =>
    fetch(`${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=${FILE_FIELDS}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${_accessToken}` },
      body: buildForm(),
    })
  );

  await assertOk(res, 'Error al subir archivo');
  return res.json();
};

/**
 * Sube un documento PDF de SafeTrack a la carpeta de la empresa.
 * Crea las carpetas SafeTrack/<empresa>/ si no existen.
 */
export const uploadSafeTrackDocument = async (
  blob: Blob,
  fileName: string,
  companyName: string
): Promise<DriveFile> => {
  const rootId = await ensureSafeTrackFolder();
  const companyId = await ensureCompanyFolder(companyName, rootId);
  return uploadFile(blob, fileName, companyId);
};

// ============================================================
// UTILIDADES
// ============================================================

export const openFileInDrive = (file: DriveFile): void => {
  if (file.webViewLink) {
    window.open(file.webViewLink, '_blank', 'noopener,noreferrer');
  }
};

export const formatFileSize = (bytes: string | number | undefined): string => {
  if (!bytes) return 'Desconocido';
  const n = typeof bytes === 'string' ? parseInt(bytes) : bytes;
  if (!n) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(n) / Math.log(k));
  return `${Math.round((n / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

export const getFileIcon = (mimeType: string): string => {
  if (mimeType.includes('folder')) return '📁';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
  if (mimeType.includes('document') || mimeType.includes('word')) return '📝';
  if (mimeType.includes('image')) return '🖼️';
  return '📎';
};

export const formatModifiedDate = (dateString: string): string => {
  const date = new Date(dateString);
  const diffDays = Math.ceil(Math.abs(Date.now() - date.getTime()) / 86_400_000);
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
  return date.toLocaleDateString('es-CL');
};

// ============================================================
// EXPORT PRINCIPAL
// ============================================================

export const GoogleDriveService = {
  setAccessToken,
  restoreAccessToken,
  isAuthorized,
  ensureAccess,
  onAuthChange,

  // Carpetas
  listCompanyFolders,
  ensureSafeTrackFolder,
  ensureCompanyFolder,
  bootstrapDriveStructure,
  ensureCompanyStructure,

  // Archivos
  listFilesInFolder,
  searchFilesInFolder,
  uploadFile,
  uploadSafeTrackDocument,
  openFileInDrive,

  // Utilidades
  formatFileSize,
  getFileIcon,
  formatModifiedDate,
};

export default GoogleDriveService;
