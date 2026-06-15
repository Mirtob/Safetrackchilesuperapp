import { AlertTriangle, TrendingUp, ArrowRight, Search, FileSearch } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

interface CausalityAlertProps {
  type: 'caidas' | 'golpes' | 'cortes' | 'quemaduras' | 'atrapamientos';
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  currentValue: number;
  previousValue: number;
  relatedInspections: {
    total: number;
    failed: number;
    category: string;
  };
  onViewCausalAnalysis: () => void;
  onViewRelatedInspections: () => void;
}

const alertConfig = {
  caidas: {
    title: 'Caídas',
    emoji: '⚠️',
    color: 'red',
    inspectionCategory: 'superficies_trabajo',
    inspectionLabel: 'Superficies de Trabajo',
    recommendation: 'Revisar inspecciones de superficies, andamios y escaleras'
  },
  golpes: {
    title: 'Golpes',
    emoji: '⚡',
    color: 'orange',
    inspectionCategory: 'orden_aseo',
    inspectionLabel: 'Orden y Aseo',
    recommendation: 'Revisar inspecciones de orden, señalización y espacios'
  },
  cortes: {
    title: 'Cortes',
    emoji: '✂️',
    color: 'yellow',
    inspectionCategory: 'herramientas',
    inspectionLabel: 'Herramientas y EPP',
    recommendation: 'Revisar inspecciones de herramientas y elementos cortantes'
  },
  quemaduras: {
    title: 'Quemaduras',
    emoji: '🔥',
    color: 'red',
    inspectionCategory: 'equipos_calientes',
    inspectionLabel: 'Equipos y Superficies Calientes',
    recommendation: 'Revisar inspecciones de soldadura, hornos y equipos térmicos'
  },
  atrapamientos: {
    title: 'Atrapamientos',
    emoji: '⚙️',
    color: 'purple',
    inspectionCategory: 'maquinaria',
    inspectionLabel: 'Maquinaria y Equipos',
    recommendation: 'Revisar inspecciones de protecciones de máquinas'
  }
};

export function CausalityAlert({
  type,
  trend,
  percentage,
  currentValue,
  previousValue,
  relatedInspections,
  onViewCausalAnalysis,
  onViewRelatedInspections
}: CausalityAlertProps) {
  const config = alertConfig[type];
  const isIncreasing = trend === 'up';
  
  if (!isIncreasing) return null; // Solo mostrar si hay aumento

  const colorClasses = {
    red: {
      bg: 'bg-red-50 dark:bg-red-950/20',
      border: 'border-red-300 dark:border-red-800',
      text: 'text-red-900 dark:text-red-100',
      textLight: 'text-red-700 dark:text-red-300',
      badge: 'bg-red-600',
      button: 'bg-red-600 hover:bg-red-700'
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-950/20',
      border: 'border-orange-300 dark:border-orange-800',
      text: 'text-orange-900 dark:text-orange-100',
      textLight: 'text-orange-700 dark:text-orange-300',
      badge: 'bg-orange-600',
      button: 'bg-orange-600 hover:bg-orange-700'
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-950/20',
      border: 'border-yellow-300 dark:border-yellow-800',
      text: 'text-yellow-900 dark:text-yellow-100',
      textLight: 'text-yellow-700 dark:text-yellow-300',
      badge: 'bg-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/20',
      border: 'border-purple-300 dark:border-purple-800',
      text: 'text-purple-900 dark:text-purple-100',
      textLight: 'text-purple-700 dark:text-purple-300',
      badge: 'bg-purple-600',
      button: 'bg-purple-600 hover:bg-purple-700'
    }
  };

  const colors = colorClasses[config.color as keyof typeof colorClasses];
  const failRate = Math.round((relatedInspections.failed / relatedInspections.total) * 100);

  return (
    <Card className={`${colors.bg} ${colors.border} border-2 shadow-lg mb-6 animate-in fade-in slide-in-from-top-2`}>
      <div className="p-5">
        {/* Header con alerta */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${colors.badge}/20 flex-shrink-0`}>
            <AlertTriangle className={`w-6 h-6 ${colors.textLight}`} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`text-lg font-bold ${colors.text}`}>
                {config.emoji} Alerta: Aumento de {config.title}
              </h3>
              <Badge className={`${colors.badge} text-white border-0`}>
                <TrendingUp className="w-3 h-3 mr-1" />
                +{percentage}%
              </Badge>
            </div>
            
            <p className={`text-sm ${colors.textLight} mb-3`}>
              Se ha detectado un incremento significativo en los accidentes por {config.title.toLowerCase()}.
              De {previousValue} a {currentValue} casos en el último período.
            </p>

            {/* Estadísticas relacionadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${colors.badge}/20 flex items-center justify-center flex-shrink-0`}>
                  <FileSearch className={`w-4 h-4 ${colors.textLight}`} />
                </div>
                <div>
                  <p className={`text-xs ${colors.textLight} font-medium`}>
                    Inspecciones de {config.inspectionLabel}
                  </p>
                  <p className={`text-sm font-bold ${colors.text}`}>
                    {relatedInspections.total} realizadas • {relatedInspections.failed} con observaciones
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${colors.badge}/20 flex items-center justify-center flex-shrink-0`}>
                  <AlertTriangle className={`w-4 h-4 ${colors.textLight}`} />
                </div>
                <div>
                  <p className={`text-xs ${colors.textLight} font-medium`}>
                    Tasa de No Conformidad
                  </p>
                  <p className={`text-sm font-bold ${colors.text}`}>
                    {failRate}% de inspecciones con problemas
                  </p>
                </div>
              </div>
            </div>

            {/* Recomendación */}
            <div className={`p-3 rounded-lg ${colors.badge}/10 border ${colors.border} mb-4`}>
              <p className={`text-sm ${colors.text} font-medium mb-1`}>
                💡 Recomendación del Sistema:
              </p>
              <p className={`text-sm ${colors.textLight}`}>
                {config.recommendation}. Las inspecciones muestran una correlación directa con el aumento de accidentes.
              </p>
            </div>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={onViewCausalAnalysis}
                className={`${colors.button} text-white flex-1`}
              >
                <Search className="w-4 h-4 mr-2" />
                Ver Análisis Causal Completo
              </Button>
              
              <Button
                onClick={onViewRelatedInspections}
                variant="outline"
                className={`${colors.border} ${colors.text} hover:${colors.bg} flex-1`}
              >
                <FileSearch className="w-4 h-4 mr-2" />
                Revisar Inspecciones de {config.inspectionLabel}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
