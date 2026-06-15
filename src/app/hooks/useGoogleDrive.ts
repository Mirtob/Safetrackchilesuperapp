/**
 * Hook personalizado para Google Drive
 * SafeTrack Chile - Bóveda Documental
 * 
 * Este hook facilita el uso de Google Drive en componentes React,
 * proporcionando estado y funciones para gestionar la conexión.
 */

import { useState, useEffect, useCallback } from 'react';
import GoogleDriveService, {
  DriveFile,
  DriveFolder,
  DriveSyncStatus
} from '@/app/services/googleDrive';

interface UseGoogleDriveOptions {
  autoInitialize?: boolean;
  companyId?: string;
  folderId?: string;
}

export const useGoogleDrive = (options: UseGoogleDriveOptions = {}) => {
  const { autoInitialize = false, companyId, folderId } = options;

  // Estados
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [syncStatus, setSyncStatus] = useState<DriveSyncStatus>({
    isOnline: navigator.onLine,
    lastSync: null,
    pendingFiles: 0,
    syncInProgress: false
  });

  // ============================================================================
  // INICIALIZACIÓN
  // ============================================================================

  const initialize = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await GoogleDriveService.initialize();
      setIsInitialized(true);
      console.log('✅ Google Drive inicializado desde hook');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al inicializar Google Drive';
      setError(errorMessage);
      console.error('❌ Error en hook:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-inicializar si está habilitado
  useEffect(() => {
    if (autoInitialize && !isInitialized) {
      initialize();
    }
  }, [autoInitialize, isInitialized, initialize]);

  // ============================================================================
  // AUTENTICACIÓN
  // ============================================================================

  const authorize = useCallback(async () => {
    if (!isInitialized) {
      setError('Google Drive no está inicializado. Llame a initialize() primero.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await GoogleDriveService.authorize();
      setIsAuthorized(true);
      console.log('✅ Usuario autorizado en Google Drive');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al autorizar';
      setError(errorMessage);
      console.error('❌ Error de autorización:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const signOut = useCallback(() => {
    GoogleDriveService.signOut();
    setIsAuthorized(false);
    setFolders([]);
    setFiles([]);
    console.log('✅ Sesión cerrada');
  }, []);

  // ============================================================================
  // CARPETAS
  // ============================================================================

  const loadCompanyFolders = useCallback(async () => {
    if (!isAuthorized) {
      setError('No autorizado. Llame a authorize() primero.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const loadedFolders = await GoogleDriveService.listCompanyFolders();
      setFolders(loadedFolders);
      console.log(`✅ Cargadas ${loadedFolders.length} carpetas de empresas`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar carpetas';
      setError(errorMessage);
      console.error('❌ Error al cargar carpetas:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthorized]);

  // ============================================================================
  // ARCHIVOS
  // ============================================================================

  const loadFiles = useCallback(async (targetFolderId?: string) => {
    const folderToLoad = targetFolderId || folderId;

    if (!folderToLoad) {
      setError('No se especificó un folderId');
      return;
    }

    if (!isAuthorized) {
      setError('No autorizado. Llame a authorize() primero.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { files: loadedFiles } = await GoogleDriveService.listFilesInFolder(folderToLoad);
      setFiles(loadedFiles);
      console.log(`✅ Cargados ${loadedFiles.length} archivos`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar archivos';
      setError(errorMessage);
      console.error('❌ Error al cargar archivos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [folderId, isAuthorized]);

  const searchFiles = useCallback(async (searchTerm: string, targetFolderId?: string) => {
    const folderToSearch = targetFolderId || folderId;

    if (!folderToSearch) {
      setError('No se especificó un folderId');
      return;
    }

    if (!isAuthorized) {
      setError('No autorizado. Llame a authorize() primero.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchResults = await GoogleDriveService.searchFilesInFolder(
        folderToSearch,
        searchTerm
      );
      setFiles(searchResults);
      console.log(`✅ Encontrados ${searchResults.length} archivos`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al buscar archivos';
      setError(errorMessage);
      console.error('❌ Error al buscar:', err);
    } finally {
      setIsLoading(false);
    }
  }, [folderId, isAuthorized]);

  const openFile = useCallback((file: DriveFile) => {
    GoogleDriveService.openFileInDrive(file);
  }, []);

  // ============================================================================
  // SINCRONIZACIÓN
  // ============================================================================

  const syncDocuments = useCallback(async (targetCompanyId?: string, targetFolderId?: string) => {
    const companyToSync = targetCompanyId || companyId;
    const folderToSync = targetFolderId || folderId;

    if (!companyToSync || !folderToSync) {
      setError('Se requieren companyId y folderId para sincronizar');
      return;
    }

    if (!isAuthorized) {
      setError('No autorizado. Llame a authorize() primero.');
      return;
    }

    setSyncStatus(prev => ({ ...prev, syncInProgress: true }));
    setError(null);

    try {
      const syncedFiles = await GoogleDriveService.syncDriveDocuments(
        companyToSync,
        folderToSync
      );

      setFiles(syncedFiles);
      setSyncStatus({
        isOnline: true,
        lastSync: new Date().toISOString(),
        pendingFiles: 0,
        syncInProgress: false
      });

      console.log(`✅ Sincronizados ${syncedFiles.length} documentos`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al sincronizar';
      setError(errorMessage);
      setSyncStatus(prev => ({ ...prev, syncInProgress: false }));
      console.error('❌ Error de sincronización:', err);
    }
  }, [companyId, folderId, isAuthorized]);

  // ============================================================================
  // MONITOREO DE CONEXIÓN
  // ============================================================================

  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      console.log('🌐 Conexión restaurada');
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
      console.log('📴 Conexión perdida');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ============================================================================
  // RETORNO
  // ============================================================================

  return {
    // Estado
    isInitialized,
    isAuthorized,
    isLoading,
    error,
    folders,
    files,
    syncStatus,

    // Funciones de inicialización
    initialize,
    authorize,
    signOut,

    // Funciones de carpetas
    loadCompanyFolders,

    // Funciones de archivos
    loadFiles,
    searchFiles,
    openFile,

    // Funciones de sincronización
    syncDocuments,

    // Utilidades
    clearError: () => setError(null)
  };
};

export default useGoogleDrive;
