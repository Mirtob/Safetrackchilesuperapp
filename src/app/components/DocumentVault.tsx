import { useState } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Search, 
  FolderOpen,
  Shield,
  CheckCircle2,
  AlertCircle,
  WifiOff,
  Lock
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';

interface DocumentVaultProps {
  onBack: () => void;
  isOnline: boolean;
}

// Estructura de la Carpeta de Arranque Digital
const documentFolders = [
  {
    id: 'legal',
    name: 'Documentos Legales Obligatorios',
    description: 'Ley 16.744 - DS 54 - DS 594',
    icon: Shield,
    color: 'red',
    documents: [
      {
        id: 1,
        name: 'Ley 16.744 - Accidentes del Trabajo',
        type: 'PDF',
        size: '2.4 MB',
        status: 'updated',
        lastUpdate: '2026-01-15',
        offlineAvailable: true
      },
      {
        id: 2,
        name: 'DS 54 - Reglamento Comités Paritarios',
        type: 'PDF',
        size: '1.8 MB',
        status: 'updated',
        lastUpdate: '2026-01-10',
        offlineAvailable: true
      },
      {
        id: 3,
        name: 'DS 594 - Condiciones Sanitarias',
        type: 'PDF',
        size: '3.2 MB',
        status: 'updated',
        lastUpdate: '2026-01-12',
        offlineAvailable: true
      },
      {
        id: 4,
        name: 'DS 40 - Radiaciones Ultravioleta',
        type: 'PDF',
        size: '0.9 MB',
        status: 'updated',
        lastUpdate: '2026-01-08',
        offlineAvailable: true
      }
    ]
  },
  {
    id: 'company',
    name: 'Documentos por Empresa',
    description: 'Reglamentos internos y matrices IPER',
    icon: FolderOpen,
    color: 'blue',
    documents: [
      {
        id: 5,
        name: 'Reglamento Interno - Constructora Los Andes',
        type: 'PDF',
        size: '4.5 MB',
        status: 'updated',
        lastUpdate: '2026-01-20',
        offlineAvailable: true
      },
      {
        id: 6,
        name: 'Matriz IPER - Constructora Los Andes',
        type: 'XLSX',
        size: '1.2 MB',
        status: 'pending',
        lastUpdate: '2025-12-15',
        offlineAvailable: true
      },
      {
        id: 7,
        name: 'Reglamento Interno - Minera del Norte',
        type: 'PDF',
        size: '3.8 MB',
        status: 'updated',
        lastUpdate: '2026-01-18',
        offlineAvailable: true
      },
      {
        id: 8,
        name: 'Matriz IPER - Minera del Norte',
        type: 'XLSX',
        size: '2.1 MB',
        status: 'updated',
        lastUpdate: '2026-01-22',
        offlineAvailable: true
      },
      {
        id: 9,
        name: 'Procedimiento Trabajo en Altura',
        type: 'PDF',
        size: '1.5 MB',
        status: 'updated',
        lastUpdate: '2026-01-19',
        offlineAvailable: true
      }
    ]
  },
  {
    id: 'templates',
    name: 'Plantillas y Formularios',
    description: 'Formularios SUSESO y reportes',
    icon: FileText,
    color: 'green',
    documents: [
      {
        id: 10,
        name: 'DIAT - Denuncia Individual Accidente del Trabajo',
        type: 'PDF',
        size: '0.5 MB',
        status: 'updated',
        lastUpdate: '2026-01-01',
        offlineAvailable: true
      },
      {
        id: 11,
        name: 'Plantilla Acta Comité Paritario',
        type: 'DOCX',
        size: '0.3 MB',
        status: 'updated',
        lastUpdate: '2026-01-01',
        offlineAvailable: true
      },
      {
        id: 12,
        name: 'Checklist Inspección SUSESO',
        type: 'PDF',
        size: '0.8 MB',
        status: 'updated',
        lastUpdate: '2026-01-05',
        offlineAvailable: true
      },
      {
        id: 13,
        name: 'Registro Entrega EPP',
        type: 'XLSX',
        size: '0.4 MB',
        status: 'updated',
        lastUpdate: '2026-01-01',
        offlineAvailable: true
      }
    ]
  },
  {
    id: 'training',
    name: 'Material de Capacitación',
    description: 'Charlas y presentaciones',
    icon: CheckCircle2,
    color: 'purple',
    documents: [
      {
        id: 14,
        name: 'Charla 5 Minutos - Uso de EPP',
        type: 'PPTX',
        size: '5.2 MB',
        status: 'updated',
        lastUpdate: '2026-01-15',
        offlineAvailable: true
      },
      {
        id: 15,
        name: 'Presentación Trabajo en Altura',
        type: 'PPTX',
        size: '8.7 MB',
        status: 'updated',
        lastUpdate: '2026-01-18',
        offlineAvailable: true
      },
      {
        id: 16,
        name: 'Manual Prevención COVID-19',
        type: 'PDF',
        size: '2.3 MB',
        status: 'updated',
        lastUpdate: '2025-12-10',
        offlineAvailable: true
      }
    ]
  }
];

export function DocumentVault({ onBack, isOnline }: DocumentVaultProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const allDocuments = documentFolders.flatMap(folder => 
    folder.documents.map(doc => ({ ...doc, folderName: folder.name, folderId: folder.id }))
  );

  const filteredDocuments = searchQuery
    ? allDocuments.filter(doc => 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : selectedFolder
    ? allDocuments.filter(doc => doc.folderId === selectedFolder)
    : allDocuments;

  const totalDocuments = allDocuments.length;
  const offlineDocuments = allDocuments.filter(d => d.offlineAvailable).length;
  const pendingUpdates = allDocuments.filter(d => d.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-900 transition-colors pb-20 lg:pb-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-slate-900 dark:text-white text-xl lg:text-2xl">Bóveda Documental</h1>
                  {!isOnline && (
                    <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-0">
                      <WifiOff className="w-3 h-3 mr-1" />
                      Modo Offline
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-zinc-400">Carpeta de Arranque Digital - Acceso sin internet</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-700 dark:text-blue-400 text-sm">Total Documentos</span>
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl text-blue-900 dark:text-blue-300 mb-1">{totalDocuments}</div>
              <Badge className="bg-blue-600/20 text-blue-700 dark:text-blue-400 border-0 text-xs">
                4 categorías
              </Badge>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-700 dark:text-green-400 text-sm">Disponibles Offline</span>
                <Lock className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-3xl text-green-900 dark:text-green-300 mb-1">{offlineDocuments}</div>
              <Badge className="bg-green-600/20 text-green-700 dark:text-green-400 border-0 text-xs">
                100% sincronizados
              </Badge>
            </div>
          </Card>

          <Card className={`bg-gradient-to-br ${
            pendingUpdates > 0 
              ? 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800' 
              : 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
          }`}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${
                  pendingUpdates > 0 
                    ? 'text-amber-700 dark:text-amber-400' 
                    : 'text-green-700 dark:text-green-400'
                }`}>
                  Actualizaciones Pendientes
                </span>
                {pendingUpdates > 0 ? (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                )}
              </div>
              <div className={`text-3xl mb-1 ${
                pendingUpdates > 0 
                  ? 'text-amber-900 dark:text-amber-300' 
                  : 'text-green-900 dark:text-green-300'
              }`}>
                {pendingUpdates}
              </div>
              <Badge className={`border-0 text-xs ${
                pendingUpdates > 0 
                  ? 'bg-amber-600/20 text-amber-700 dark:text-amber-400' 
                  : 'bg-green-600/20 text-green-700 dark:text-green-400'
              }`}>
                {pendingUpdates > 0 ? 'Requiere atención' : 'Todo actualizado'}
              </Badge>
            </div>
          </Card>
        </div>

        {/* Búsqueda */}
        <Card className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
          <div className="p-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar documentos, reglamentos, matrices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-700"
              />
            </div>
          </div>
        </Card>

        {/* Carpetas */}
        {!searchQuery && !selectedFolder && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {documentFolders.map((folder) => {
              const FolderIcon = folder.icon;
              return (
                <Card
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-[#003366] dark:hover:border-blue-600 transition-all cursor-pointer interactive"
                >
                  <div className="p-5">
                    <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${
                      folder.color === 'red' ? 'bg-red-100 dark:bg-red-900/20' :
                      folder.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' :
                      folder.color === 'green' ? 'bg-green-100 dark:bg-green-900/20' :
                      'bg-purple-100 dark:bg-purple-900/20'
                    }`}>
                      <FolderIcon className={`w-6 h-6 ${
                        folder.color === 'red' ? 'text-[#D32F2F]' :
                        folder.color === 'blue' ? 'text-[#003366]' :
                        folder.color === 'green' ? 'text-green-600' :
                        'text-purple-600'
                      }`} />
                    </div>
                    <h3 className="text-slate-900 dark:text-white font-medium mb-2">
                      {folder.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 mb-3">
                      {folder.description}
                    </p>
                    <Badge className="bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 border-0 text-xs">
                      {folder.documents.length} documentos
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Lista de Documentos */}
        {(searchQuery || selectedFolder) && (
          <div>
            {selectedFolder && (
              <div className="mb-4 flex items-center gap-2">
                <Button
                  onClick={() => setSelectedFolder(null)}
                  variant="outline"
                  size="sm"
                  className="border-slate-200 dark:border-zinc-600"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Ver todas las carpetas
                </Button>
              </div>
            )}

            <Card className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
              <div className="divide-y divide-slate-200 dark:divide-zinc-700">
                {filteredDocuments.length === 0 ? (
                  <div className="p-8 text-center">
                    <FileText className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
                    <p className="text-slate-600 dark:text-zinc-400">
                      No se encontraron documentos
                    </p>
                  </div>
                ) : (
                  filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <FileText className="w-5 h-5 text-[#003366]" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-slate-900 dark:text-white font-medium mb-1">
                              {doc.name}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-zinc-400">
                              <span>{doc.type}</span>
                              <span>•</span>
                              <span>{doc.size}</span>
                              <span>•</span>
                              <span>Actualizado: {doc.lastUpdate}</span>
                            </div>
                            {searchQuery && (
                              <Badge className="bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 border-0 text-xs mt-2">
                                {doc.folderName}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.offlineAvailable && (
                            <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-0 text-xs">
                              <Lock className="w-3 h-3 mr-1" />
                              Offline
                            </Badge>
                          )}
                          {doc.status === 'pending' && (
                            <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-0 text-xs">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Actualizar
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#003366] text-[#003366] dark:border-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}