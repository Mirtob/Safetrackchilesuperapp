/**
 * Google Drive Integration Service
 * SafeTrack Chile - Bóveda Documental
 * 
 * Este servicio proporciona funciones para integrar la bóveda documental
 * con Google Drive, permitiendo acceso de solo lectura a carpetas por empresa.
 * 
 * CONFIGURACIÓN REQUERIDA:
 * 1. Crear proyecto en Google Cloud Console
 * 2. Habilitar Google Drive API
 * 3. Configurar OAuth 2.0 credentials
 * 4. Agregar scopes: https://www.googleapis.com/auth/drive.readonly
 */

// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

export interface GoogleDriveConfig {
  clientId: string;
  apiKey: string;
  scopes: string[];
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink?: string;
  thumbnailLink?: string;
  iconLink?: string;
  parents?: string[];
}

export interface DriveFolder {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  createdTime: string;
  modifiedTime: string;
  fileCount?: number;
}

export interface DriveSyncStatus {
  isOnline: boolean;
  lastSync: string | null;
  pendingFiles: number;
  syncInProgress: boolean;
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const GOOGLE_DRIVE_CONFIG: GoogleDriveConfig = {
  clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  apiKey: 'YOUR_GOOGLE_API_KEY',
  scopes: [
    'https://www.googleapis.com/auth/drive.readonly', // Solo lectura
    'https://www.googleapis.com/auth/drive.metadata.readonly'
  ]
};

// MIME Types comunes
export const MIME_TYPES = {
  FOLDER: 'application/vnd.google-apps.folder',
  PDF: 'application/pdf',
  WORD: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  IMAGE: 'image/',
  GOOGLE_DOC: 'application/vnd.google-apps.document',
  GOOGLE_SHEET: 'application/vnd.google-apps.spreadsheet',
  GOOGLE_SLIDES: 'application/vnd.google-apps.presentation'
};

// ============================================================================
// ESTADO DE LA SESIÓN
// ============================================================================

let gapiLoaded = false;
let gisLoaded = false;
let tokenClient: any = null;
let accessToken: string | null = null;

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

/**
 * Carga el script de Google API
 */
export const loadGoogleAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (gapiLoaded) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      gapiLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Error al cargar Google API'));
    document.body.appendChild(script);
  });
};

/**
 * Carga el script de Google Identity Services
 */
export const loadGoogleIdentityServices = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (gisLoaded) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      gisLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error('Error al cargar Google Identity Services'));
    document.body.appendChild(script);
  });
};

/**
 * Inicializa Google Drive API
 */
export const initializeGoogleDrive = async (): Promise<void> => {
  try {
    await Promise.all([
      loadGoogleAPI(),
      loadGoogleIdentityServices()
    ]);

    // Inicializar gapi
    await new Promise<void>((resolve) => {
      (window as any).gapi.load('client', async () => {
        await (window as any).gapi.client.init({
          apiKey: GOOGLE_DRIVE_CONFIG.apiKey,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
        });
        resolve();
      });
    });

    // Inicializar token client
    tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_DRIVE_CONFIG.clientId,
      scope: GOOGLE_DRIVE_CONFIG.scopes.join(' '),
      callback: (response: any) => {
        if (response.access_token) {
          accessToken = response.access_token;
        }
      }
    });

    console.log('✅ Google Drive API inicializada correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar Google Drive:', error);
    throw error;
  }
};

// ============================================================================
// AUTENTICACIÓN
// ============================================================================

/**
 * Solicita autorización al usuario para acceder a Google Drive
 */
export const authorizeGoogleDrive = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Token client no inicializado'));
      return;
    }

    tokenClient.callback = (response: any) => {
      if (response.error) {
        reject(response);
        return;
      }
      accessToken = response.access_token;
      resolve(response.access_token);
    };

    // Solicitar token
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

/**
 * Verifica si hay un token de acceso válido
 */
export const isAuthorized = (): boolean => {
  return accessToken !== null;
};

/**
 * Cierra la sesión de Google Drive
 */
export const signOutGoogleDrive = (): void => {
  if (accessToken) {
    (window as any).google.accounts.oauth2.revoke(accessToken);
    accessToken = null;
  }
};

// ============================================================================
// OPERACIONES CON CARPETAS
// ============================================================================

/**
 * Lista todas las carpetas principales (una por empresa)
 */
export const listCompanyFolders = async (): Promise<DriveFolder[]> => {
  try {
    if (!isAuthorized()) {
      throw new Error('No autorizado. Llame a authorizeGoogleDrive() primero.');
    }

    const response = await (window as any).gapi.client.drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed=false",
      fields: 'files(id, name, createdTime, modifiedTime)',
      orderBy: 'name'
    });

    const folders: DriveFolder[] = response.result.files.map((file: any) => ({
      id: file.id,
      name: file.name,
      companyId: file.id, // Usar el ID de Drive como ID de empresa
      companyName: file.name,
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime
    }));

    return folders;
  } catch (error) {
    console.error('Error al listar carpetas de empresas:', error);
    throw error;
  }
};

/**
 * Obtiene los archivos de una carpeta específica (empresa)
 */
export const listFilesInFolder = async (
  folderId: string,
  pageToken?: string
): Promise<{ files: DriveFile[]; nextPageToken?: string }> => {
  try {
    if (!isAuthorized()) {
      throw new Error('No autorizado. Llame a authorizeGoogleDrive() primero.');
    }

    const query = `'${folderId}' in parents and trashed=false`;

    const response = await (window as any).gapi.client.drive.files.list({
      q: query,
      fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, thumbnailLink, iconLink, parents)',
      orderBy: 'folder,name',
      pageSize: 50,
      pageToken: pageToken || undefined
    });

    return {
      files: response.result.files || [],
      nextPageToken: response.result.nextPageToken
    };
  } catch (error) {
    console.error('Error al listar archivos:', error);
    throw error;
  }
};

/**
 * Busca archivos por nombre en una carpeta específica
 */
export const searchFilesInFolder = async (
  folderId: string,
  searchTerm: string
): Promise<DriveFile[]> => {
  try {
    if (!isAuthorized()) {
      throw new Error('No autorizado. Llame a authorizeGoogleDrive() primero.');
    }

    const query = `'${folderId}' in parents and name contains '${searchTerm}' and trashed=false`;

    const response = await (window as any).gapi.client.drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, thumbnailLink, iconLink)',
      orderBy: 'name'
    });

    return response.result.files || [];
  } catch (error) {
    console.error('Error al buscar archivos:', error);
    throw error;
  }
};

// ============================================================================
// OPERACIONES CON ARCHIVOS
// ============================================================================

/**
 * Obtiene los metadatos de un archivo
 */
export const getFileMetadata = async (fileId: string): Promise<DriveFile> => {
  try {
    if (!isAuthorized()) {
      throw new Error('No autorizado. Llame a authorizeGoogleDrive() primero.');
    }

    const response = await (window as any).gapi.client.drive.files.get({
      fileId: fileId,
      fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, thumbnailLink, iconLink, parents'
    });

    return response.result;
  } catch (error) {
    console.error('Error al obtener metadatos del archivo:', error);
    throw error;
  }
};

/**
 * Abre un archivo en Google Drive (solo lectura)
 */
export const openFileInDrive = (file: DriveFile): void => {
  if (file.webViewLink) {
    window.open(file.webViewLink, '_blank');
  } else {
    console.warn('El archivo no tiene un enlace de visualización');
  }
};

/**
 * Obtiene la URL de visualización de un archivo
 */
export const getFileViewUrl = (fileId: string): string => {
  return `https://drive.google.com/file/d/${fileId}/view`;
};

/**
 * Obtiene la URL de previsualización de un archivo (thumbnail)
 */
export const getFileThumbnailUrl = async (fileId: string): Promise<string | null> => {
  try {
    const metadata = await getFileMetadata(fileId);
    return metadata.thumbnailLink || null;
  } catch (error) {
    console.error('Error al obtener thumbnail:', error);
    return null;
  }
};

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Convierte bytes a formato legible
 */
export const formatFileSize = (bytes: string | number | undefined): string => {
  if (!bytes) return 'Desconocido';
  
  const numBytes = typeof bytes === 'string' ? parseInt(bytes) : bytes;
  
  if (numBytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(numBytes) / Math.log(k));
  
  return Math.round((numBytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Obtiene el icono apropiado según el tipo MIME
 */
export const getFileIcon = (mimeType: string): string => {
  if (mimeType.includes('folder')) return '📁';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
  if (mimeType.includes('document') || mimeType.includes('word')) return '📝';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📊';
  if (mimeType.includes('image')) return '🖼️';
  return '📎';
};

/**
 * Formatea la fecha de modificación
 */
export const formatModifiedDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;

  return date.toLocaleDateString('es-CL');
};

// ============================================================================
// INTEGRACIÓN CON SAFETRACK
// ============================================================================

/**
 * Mapea una carpeta de Drive a una empresa de SafeTrack
 */
export const mapDriveFolderToCompany = (
  folder: DriveFolder,
  companies: Array<{ id: string; name: string }>
): { folderId: string; companyId: string; companyName: string } | null => {
  // Buscar empresa por coincidencia de nombre
  const matchedCompany = companies.find(company =>
    folder.name.toLowerCase().includes(company.name.toLowerCase()) ||
    company.name.toLowerCase().includes(folder.name.toLowerCase())
  );

  if (matchedCompany) {
    return {
      folderId: folder.id,
      companyId: matchedCompany.id,
      companyName: matchedCompany.name
    };
  }

  return null;
};

/**
 * Sincroniza los documentos de Drive con el estado local de SafeTrack
 */
export const syncDriveDocuments = async (
  companyId: string,
  folderId: string
): Promise<DriveFile[]> => {
  try {
    const { files } = await listFilesInFolder(folderId);
    
    // Aquí se integraría con el estado local/Supabase
    // Por ahora solo retornamos los archivos
    console.log(`✅ Sincronizados ${files.length} documentos para empresa ${companyId}`);
    
    return files;
  } catch (error) {
    console.error('Error al sincronizar documentos:', error);
    throw error;
  }
};

// ============================================================================
// EXPORTACIONES
// ============================================================================

export const GoogleDriveService = {
  // Inicialización
  initialize: initializeGoogleDrive,
  authorize: authorizeGoogleDrive,
  isAuthorized,
  signOut: signOutGoogleDrive,

  // Carpetas
  listCompanyFolders,
  listFilesInFolder,
  searchFilesInFolder,

  // Archivos
  getFileMetadata,
  openFileInDrive,
  getFileViewUrl,
  getFileThumbnailUrl,

  // Utilidades
  formatFileSize,
  getFileIcon,
  formatModifiedDate,

  // Integración SafeTrack
  mapDriveFolderToCompany,
  syncDriveDocuments
};

export default GoogleDriveService;
