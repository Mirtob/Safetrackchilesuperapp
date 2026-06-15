/**
 * Google Drive Integration Service — SafeTrack Chile
 *
 * Usa la Drive REST API v3 directamente con el access token OAuth2
 * obtenido al iniciar sesión con Google (scope: drive.file).
 *
 * Scope drive.file: solo accede a archivos creados por esta app,
 * no al Drive completo del usuario.
 */

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

let _accessToken = '';

export const setAccessToken = (token: string): void => {
  _accessToken = token;
};

const isAuthorized = (): boolean => Boolean(_accessToken);

// ============================================================
// HELPER DE REQUEST
// ============================================================

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

async function driveGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  if (!isAuthorized()) throw new Error('Sin autorización de Google Drive. Inicia sesión primero.');

  const url = new URL(`${DRIVE_API}/${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${_accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Error Drive API: ${res.status}`);
  }

  return res.json();
}

async function drivePost<T>(path: string, body: unknown): Promise<T> {
  if (!isAuthorized()) throw new Error('Sin autorización de Google Drive. Inicia sesión primero.');

  const res = await fetch(`${DRIVE_API}/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${_accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Error Drive API: ${res.status}`);
  }

  return res.json();
}

// ============================================================
// CARPETAS
// ============================================================

const FILE_FIELDS = 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,thumbnailLink,parents';

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
 * Crea (o reutiliza) la carpeta raíz "SafeTrack" en el Drive del usuario.
 */
export const ensureSafeTrackFolder = async (): Promise<string> => {
  const data = await driveGet<{ files: { id: string }[] }>('files', {
    q: "name='SafeTrack' and mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed=false",
    fields: 'files(id)',
  });

  if (data.files?.length > 0) return data.files[0].id;

  const folder = await drivePost<{ id: string }>('files', {
    name: 'SafeTrack',
    mimeType: MIME_TYPES.FOLDER,
  });
  return folder.id;
};

/**
 * Crea (o reutiliza) una subcarpeta de empresa dentro de "SafeTrack/".
 */
export const ensureCompanyFolder = async (
  companyName: string,
  parentFolderId: string
): Promise<string> => {
  const safeName = companyName.replace(/['"]/g, '');
  const data = await driveGet<{ files: { id: string }[] }>('files', {
    q: `name='${safeName}' and mimeType='application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed=false`,
    fields: 'files(id)',
  });

  if (data.files?.length > 0) return data.files[0].id;

  const folder = await drivePost<{ id: string }>('files', {
    name: companyName,
    mimeType: MIME_TYPES.FOLDER,
    parents: [parentFolderId],
  });
  return folder.id;
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
  if (!isAuthorized()) throw new Error('Sin autorización de Google Drive. Inicia sesión primero.');

  const metadata = { name: fileName, parents: [parentFolderId], mimeType };
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', blob);

  const res = await fetch(`${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=${FILE_FIELDS}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${_accessToken}` },
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Error al subir archivo: ${res.status}`);
  }

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
  isAuthorized,

  // Carpetas
  listCompanyFolders,
  ensureSafeTrackFolder,
  ensureCompanyFolder,

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
