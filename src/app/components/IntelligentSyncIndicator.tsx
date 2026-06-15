import { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  Download, 
  CheckCircle2, 
  Clock,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  Wifi,
  WifiOff,
  Upload,
  Database
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Progress } from '@/app/components/ui/progress';
import { toast } from 'sonner';

interface PendingItem {
  id: string;
  type: 'accident' | 'inspection' | 'talk' | 'epp' | 'document';
  title: string;
  timestamp: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  size?: number; // bytes
}

interface IntelligentSyncIndicatorProps {
  pendingItems: PendingItem[];
  isOnline: boolean;
  onSync?: () => void;
  onViewDetails?: (item: PendingItem) => void;
}

export function IntelligentSyncIndicator({ 
  pendingItems, 
  isOnline,
  onSync,
  onViewDetails 
}: IntelligentSyncIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  
  // Usar ref para rastrear el número anterior de items
  const prevItemsLengthRef = useRef(pendingItems.length);

  // Categorizar items
  const criticalItems = pendingItems.filter(item => item.priority === 'critical' || item.type === 'accident');
  const highItems = pendingItems.filter(item => item.priority === 'high' && item.type !== 'accident');
  const routineItems = pendingItems.filter(item => item.priority === 'medium' || item.priority === 'low');

  const hasCritical = criticalItems.length > 0;
  const totalSize = pendingItems.reduce((sum, item) => sum + (item.size || 0), 0);
  const formattedSize = totalSize > 1024 * 1024 
    ? `${(totalSize / (1024 * 1024)).toFixed(1)} MB`
    : `${(totalSize / 1024).toFixed(0)} KB`;

  // Efecto para auto-expandir cuando hay items críticos
  // Solo se ejecuta cuando cambia la cantidad de items
  useEffect(() => {
    const prevLength = prevItemsLengthRef.current;
    const currentLength = pendingItems.length;
    
    // Solo actualizar si la longitud cambió
    if (prevLength !== currentLength) {
      prevItemsLengthRef.current = currentLength;
      
      // Si hay nuevos items críticos, expandir
      if (hasCritical && !isDismissed) {
        setIsExpanded(true);
      }
      
      // Si se agregaron nuevos items, resetear dismissed
      if (currentLength > prevLength && isDismissed) {
        setIsDismissed(false);
      }
    }
  }, [pendingItems.length, hasCritical, isDismissed]);

  // Simular sincronización CON FEEDBACK DETALLADO
  const handleSync = async () => {
    setIsSyncing(true);
    setSyncProgress(0);

    // Usar setTimeout para evitar setState durante render
    setTimeout(() => {
      // Mostrar toast inicial
      toast.info('🔄 Iniciando sincronización...', {
        description: `Subiendo ${pendingItems.length} documento${pendingItems.length !== 1 ? 's' : ''} al servidor`,
        duration: 2000
      });
    }, 0);

    // Simular sincronización de cada item con feedback
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        const newProgress = prev + 10;
        
        // Mostrar progreso de items específicos CON DURACIÓN LIMITADA
        if (newProgress === 30 && criticalItems.length > 0) {
          setTimeout(() => {
            toast.info('📋 Sincronizando reportes críticos...', {
              description: `${criticalItems.length} reporte${criticalItems.length !== 1 ? 's' : ''} de accidente`,
              duration: 1500
            });
          }, 0);
        } else if (newProgress === 60 && highItems.length > 0) {
          setTimeout(() => {
            toast.info('⚡ Sincronizando documentos prioritarios...', {
              description: `${highItems.length} documento${highItems.length !== 1 ? 's' : ''} de alta prioridad`,
              duration: 1500
            });
          }, 0);
        } else if (newProgress === 90 && routineItems.length > 0) {
          setTimeout(() => {
            toast.info('📄 Sincronizando documentos rutinarios...', {
              description: `${routineItems.length} documento${routineItems.length !== 1 ? 's' : ''} restante${routineItems.length !== 1 ? 's' : ''}`,
              duration: 1500
            });
          }, 0);
        }
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsSyncing(false);
          
          // Toast de éxito con detalles
          setTimeout(() => {
            toast.success('✅ Sincronización completada', {
              description: `${pendingItems.length} documento${pendingItems.length !== 1 ? 's' : ''} subido${pendingItems.length !== 1 ? 's' : ''} al servidor (${formattedSize})`,
              duration: 4000
            });
          }, 0);
          
          // Llamar callback si existe
          if (onSync) {
            setTimeout(() => onSync(), 0);
          }
          
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };

  if (pendingItems.length === 0) {
    return null; // No mostrar nada cuando está todo sincronizado
  }

  // Vista Crítica (Accidentes pendientes)
  if (hasCritical && !isDismissed) {
    return (
      <div className="fixed top-20 left-0 right-0 z-40 px-4 animate-in fade-in slide-in-from-top-4">
        <Card className="max-w-2xl mx-auto p-4 bg-red-600 border-red-700 shadow-2xl">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20 flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg mb-1">
                  🚨 Reportes de Accidente Pendientes
                </h3>
                <p className="text-white/90 text-sm mb-3">
                  Hay {criticalItems.length} reporte{criticalItems.length !== 1 ? 's' : ''} de accidente laboral sin sincronizar. 
                  Esto requiere tu atención inmediata.
                </p>

                {/* Lista de accidentes pendientes */}
                <div className="space-y-2 mb-3">
                  {criticalItems.slice(0, 3).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onViewDetails?.(item)}
                      className="w-full p-3 bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg text-left transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-white font-medium">{item.title}</p>
                          <p className="text-white/70 text-xs mt-1">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {new Date(item.timestamp).toLocaleString('es-CL')}
                          </p>
                        </div>
                        <div className="text-white/60 group-hover:text-white transition-colors">
                          →
                        </div>
                      </div>
                    </button>
                  ))}
                  {criticalItems.length > 3 && (
                    <p className="text-white/70 text-xs text-center">
                      y {criticalItems.length - 3} más...
                    </p>
                  )}
                </div>

                {isOnline ? (
                  isSyncing ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-white text-sm">
                        <span>Sincronizando...</span>
                        <span>{syncProgress}%</span>
                      </div>
                      <Progress value={syncProgress} className="bg-white/20" />
                    </div>
                  ) : (
                    <Button
                      onClick={handleSync}
                      className="w-full bg-white text-red-600 hover:bg-white/90 font-semibold"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Sincronizar Ahora
                    </Button>
                  )
                ) : (
                  <div className="p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                    <p className="text-yellow-100 text-sm">
                      ⚠️ Sin conexión. Los reportes se sincronizarán automáticamente cuando estés online.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsDismissed(true)}
              className="text-white/80 hover:text-white transition-colors ml-2 p-1 hover:bg-white/10 rounded"
              aria-label="Cerrar alerta"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // Vista Normal (Items rutinarios)
  return (
    <div className="fixed top-20 right-4 z-30 animate-in fade-in slide-in-from-top-2">
      <Card className={`
        transition-all duration-300 shadow-lg
        ${isExpanded ? 'w-80' : 'w-auto'}
        ${highItems.length > 0 
          ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800' 
          : 'bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800'
        }
      `}>
        {/* Collapsed View */}
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="p-3 flex items-center gap-3 hover:bg-white/20 dark:hover:bg-white/10 rounded-lg transition-colors w-full"
          >
            <Download className={`w-4 h-4 ${
              highItems.length > 0 
                ? 'text-amber-600 dark:text-amber-400' 
                : 'text-blue-600 dark:text-blue-400'
            } animate-bounce`} />
            <div className="text-left flex-1">
              <div className={`text-sm font-semibold ${
                highItems.length > 0 
                  ? 'text-amber-900 dark:text-amber-100' 
                  : 'text-blue-900 dark:text-blue-100'
              }`}>
                {pendingItems.length} pendiente{pendingItems.length !== 1 ? 's' : ''}
              </div>
              {highItems.length > 0 && (
                <div className="text-xs text-amber-700 dark:text-amber-300">
                  {highItems.length} prioritario{highItems.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 ${
              highItems.length > 0 
                ? 'text-amber-600 dark:text-amber-400' 
                : 'text-blue-600 dark:text-blue-400'
            }`} />
          </button>
        )}

        {/* Expanded View */}
        {isExpanded && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Download className={`w-5 h-5 ${
                  highItems.length > 0 
                    ? 'text-amber-600 dark:text-amber-400' 
                    : 'text-blue-600 dark:text-blue-400'
                }`} />
                <h3 className={`font-semibold ${
                  highItems.length > 0 
                    ? 'text-amber-900 dark:text-amber-100' 
                    : 'text-blue-900 dark:text-blue-100'
                }`}>
                  Pendiente de Sincronizar
                </h3>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className={`${
                  highItems.length > 0 
                    ? 'text-amber-600 dark:text-amber-400' 
                    : 'text-blue-600 dark:text-blue-400'
                } hover:opacity-70 transition-opacity`}
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>

            {/* High Priority Items */}
            {highItems.length > 0 && (
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-100 mb-2 uppercase tracking-wide">
                  ⚡ Alta Prioridad ({highItems.length})
                </h4>
                <div className="space-y-1">
                  {highItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onViewDetails?.(item)}
                      className="w-full p-2 bg-white dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded text-left text-xs transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <FileText className="w-3 h-3 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                          <span className="text-amber-900 dark:text-amber-100 truncate">{item.title}</span>
                        </div>
                        <div className="text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                          →
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Routine Items */}
            {routineItems.length > 0 && (
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2 uppercase tracking-wide">
                  📄 Rutinarios ({routineItems.length})
                </h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {routineItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 bg-white dark:bg-blue-900/20 rounded text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-blue-900 dark:text-blue-100 truncate">{item.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-blue-800 dark:text-blue-300 mb-3">
              <span>{pendingItems.length} documento{pendingItems.length !== 1 ? 's' : ''}</span>
              <span>{formattedSize}</span>
            </div>

            {/* Sync Button */}
            {isOnline ? (
              isSyncing ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-blue-900 dark:text-blue-100 text-xs">
                    <span>Sincronizando...</span>
                    <span>{syncProgress}%</span>
                  </div>
                  <Progress value={syncProgress} className="bg-blue-200 dark:bg-blue-800" />
                </div>
              ) : (
                <Button
                  onClick={handleSync}
                  size="sm"
                  className={`w-full ${
                    highItems.length > 0 
                      ? 'bg-amber-600 hover:bg-amber-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  <Download className="w-3 h-3 mr-2" />
                  Sincronizar {pendingItems.length} elemento{pendingItems.length !== 1 ? 's' : ''}
                </Button>
              )
            ) : (
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 rounded text-xs text-yellow-900 dark:text-yellow-100 text-center">
                ⚠️ Sin conexión
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}