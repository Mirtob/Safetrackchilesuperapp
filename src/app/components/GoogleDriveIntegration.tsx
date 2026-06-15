/**
 * Componente de Integración con Google Drive
 * SafeTrack Chile - Bóveda Documental
 * 
 * Este componente demuestra cómo integrar Google Drive
 * en la Bóveda Documental de SafeTrack Chile.
 */

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  HardDrive,
  FolderOpen,
  FileText,
  RefreshCw,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Lock,
  Eye,
  Download
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { useGoogleDrive } from '@/app/hooks/useGoogleDrive';
import GoogleDriveService from '@/app/services/googleDrive';

interface GoogleDriveIntegrationProps {
  onBack: () => void;
  companyId?: string;
  companyName?: string;
}

export function GoogleDriveIntegration({
  onBack,
  companyId,
  companyName
}: GoogleDriveIntegrationProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const {
    isInitialized,
    isAuthorized,
    isLoading,
    error,
    folders,
    files,
    syncStatus,
    initialize,
    authorize,
    signOut,
    loadCompanyFolders,
    loadFiles,
    searchFiles,
    openFile,
    syncDocuments,
    clearError
  } = useGoogleDrive({ autoInitialize: false });

  // ============================================================================
  // EFECTOS
  // ============================================================================

  // Cargar carpetas después de autorizar
  useEffect(() => {
    if (isAuthorized && folders.length === 0) {
      loadCompanyFolders();
    }
  }, [isAuthorized, folders.length, loadCompanyFolders]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleConnect = async () => {
    if (!isInitialized) {
      await initialize();
    }
    await authorize();
  };

  const handleSelectFolder = async (folderId: string) => {
    setSelectedFolder(folderId);
    await loadFiles(folderId);
  };

  const handleSearch = async () => {
    if (selectedFolder && searchTerm.trim()) {
      await searchFiles(searchTerm, selectedFolder);
    }
  };

  const handleClearSearch = async () => {
    setSearchTerm('');
    if (selectedFolder) {
      await loadFiles(selectedFolder);
    }
  };

  const handleSync = async () => {
    if (companyId && selectedFolder) {
      await syncDocuments(companyId, selectedFolder);
    }
  };

  // ============================================================================
  // RENDERIZADO
  // ============================================================================

  // Estado: No inicializado
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419] text-white">
        {/* Header */}
        <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border-b border-white/10 sticky top-0 z-40">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="size-5" />
              </Button>
              <div>
                <h1 className="font-bold text-lg">Integración Google Drive</h1>
                <p className="text-sm text-white/60">Bóveda Documental</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 max-w-2xl mx-auto">
          <Card className="bg-white/5 border-white/10 p-8 text-center">
            <HardDrive className="size-16 mx-auto mb-4 text-[#0055A4]" />
            <h2 className="text-xl font-bold mb-2">
              Conectar con Google Drive
            </h2>
            <p className="text-white/70 mb-6">
              Accede a los documentos de tus empresas almacenados en Google Drive
              de forma segura con permisos de solo lectura.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
                <AlertCircle className="size-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <Button
              onClick={handleConnect}
              disabled={isLoading}
              className="bg-[#0055A4] hover:bg-[#0055A4]/80 text-white w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="size-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <HardDrive className="size-4 mr-2" />
                  Conectar con Google Drive
                </>
              )}
            </Button>

            <div className="mt-6 p-4 bg-white/5 rounded-lg text-left space-y-2 text-sm text-white/70">
              <div className="flex items-start gap-2">
                <Lock className="size-4 mt-0.5 flex-shrink-0 text-green-400" />
                <span>Acceso de solo lectura (sin permisos de modificación)</span>
              </div>
              <div className="flex items-start gap-2">
                <FolderOpen className="size-4 mt-0.5 flex-shrink-0 text-[#FF8C00]" />
                <span>Una carpeta por empresa</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="size-4 mt-0.5 flex-shrink-0 text-[#0055A4]" />
                <span>Sincronización automática de documentos</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Estado: Inicializado pero no autorizado
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419] text-white">
        <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border-b border-white/10 sticky top-0 z-40">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="size-5" />
              </Button>
              <div>
                <h1 className="font-bold text-lg">Autorización Requerida</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 max-w-2xl mx-auto">
          <Card className="bg-white/5 border-white/10 p-8 text-center">
            <AlertCircle className="size-16 mx-auto mb-4 text-[#FF8C00]" />
            <h2 className="text-xl font-bold mb-2">
              Autoriza el acceso a Google Drive
            </h2>
            <p className="text-white/70 mb-6">
              SafeTrack Chile necesita tu autorización para acceder a tus
              carpetas de Google Drive de forma segura.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400">
                <AlertCircle className="size-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <Button
              onClick={authorize}
              disabled={isLoading}
              className="bg-[#0055A4] hover:bg-[#0055A4]/80 text-white w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="size-4 mr-2 animate-spin" />
                  Autorizando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4 mr-2" />
                  Autorizar Acceso
                </>
              )}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Estado: Autorizado - Mostrar carpetas y archivos
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419] text-white">
      {/* Header */}
      <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border-b border-white/10 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="size-5" />
              </Button>
              <div>
                <h1 className="font-bold text-lg">Google Drive</h1>
                {companyName && (
                  <p className="text-sm text-white/60">{companyName}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`${
                  syncStatus.isOnline
                    ? 'border-green-500/50 text-green-400'
                    : 'border-red-500/50 text-red-400'
                }`}
              >
                {syncStatus.isOnline ? 'En línea' : 'Sin conexión'}
              </Badge>

              <Button
                onClick={signOut}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                Cerrar sesión
              </Button>
            </div>
          </div>

          {/* Barra de búsqueda */}
          {selectedFolder && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Buscar documentos..."
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              {searchTerm && (
                <Button
                  onClick={handleClearSearch}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                >
                  Limpiar
                </Button>
              )}
              <Button
                onClick={handleSync}
                variant="ghost"
                size="sm"
                disabled={isLoading || syncStatus.syncInProgress}
                className="text-white hover:bg-white/10"
              >
                <RefreshCw
                  className={`size-4 ${
                    syncStatus.syncInProgress ? 'animate-spin' : ''
                  }`}
                />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-4 pb-24 space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between text-red-400">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
            <Button
              onClick={clearError}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:bg-red-500/10"
            >
              Cerrar
            </Button>
          </div>
        )}

        {/* Vista de carpetas */}
        {!selectedFolder && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Carpetas de Empresas</h2>
              <Button
                onClick={loadCompanyFolders}
                variant="ghost"
                size="sm"
                disabled={isLoading}
                className="text-white hover:bg-white/10"
              >
                <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="size-8 mx-auto mb-2 animate-spin text-[#0055A4]" />
                <p className="text-white/60">Cargando carpetas...</p>
              </div>
            ) : folders.length === 0 ? (
              <Card className="bg-white/5 border-white/10 p-8 text-center">
                <FolderOpen className="size-12 mx-auto mb-2 text-white/40" />
                <p className="text-white/60">No se encontraron carpetas</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {folders.map((folder) => (
                  <Card
                    key={folder.id}
                    onClick={() => handleSelectFolder(folder.id)}
                    className="bg-white/5 border-white/10 p-4 cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FolderOpen className="size-10 text-[#FF8C00]" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{folder.name}</h3>
                        <p className="text-sm text-white/60">
                          Modificado:{' '}
                          {GoogleDriveService.formatModifiedDate(folder.modifiedTime)}
                        </p>
                      </div>
                      <ExternalLink className="size-5 text-white/40" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Vista de archivos */}
        {selectedFolder && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <Button
                onClick={() => {
                  setSelectedFolder(null);
                  setSearchTerm('');
                }}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="size-4 mr-2" />
                Volver a carpetas
              </Button>

              {syncStatus.lastSync && (
                <p className="text-xs text-white/60">
                  Última sincronización:{' '}
                  {GoogleDriveService.formatModifiedDate(syncStatus.lastSync)}
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <RefreshCw className="size-8 mx-auto mb-2 animate-spin text-[#0055A4]" />
                <p className="text-white/60">Cargando archivos...</p>
              </div>
            ) : files.length === 0 ? (
              <Card className="bg-white/5 border-white/10 p-8 text-center">
                <FileText className="size-12 mx-auto mb-2 text-white/40" />
                <p className="text-white/60">
                  {searchTerm ? 'No se encontraron archivos' : 'Carpeta vacía'}
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <Card
                    key={file.id}
                    className="bg-white/5 border-white/10 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {GoogleDriveService.getFileIcon(file.mimeType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{file.name}</h3>
                        <div className="flex items-center gap-3 text-xs text-white/60">
                          <span>{GoogleDriveService.formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>
                            {GoogleDriveService.formatModifiedDate(file.modifiedTime)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-white/20 text-white/60">
                          <Eye className="size-3 mr-1" />
                          Solo lectura
                        </Badge>
                        <Button
                          onClick={() => openFile(file)}
                          size="sm"
                          className="bg-[#0055A4] hover:bg-[#0055A4]/80 text-white"
                        >
                          <ExternalLink className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default GoogleDriveIntegration;
