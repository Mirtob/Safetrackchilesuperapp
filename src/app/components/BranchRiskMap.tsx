import { ArrowLeft, AlertTriangle, CheckCircle2, TrendingDown, MapPin } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';

interface BranchRiskMapProps {
  onBack: () => void;
}

export function BranchRiskMap({ onBack }: BranchRiskMapProps) {
  const branches = [
    { name: 'Casa Matriz - Santiago Centro', compliance: 95, risk: 'low', incidents: 0, workers: 450 },
    { name: 'Planta Industrial - Maipú', compliance: 88, risk: 'low', incidents: 1, workers: 320 },
    { name: 'Sucursal - Concepción', compliance: 82, risk: 'medium', incidents: 2, workers: 180 },
    { name: 'Bodega - San Bernardo', compliance: 72, risk: 'medium', incidents: 3, workers: 95 },
    { name: 'Oficina Regional - Valparaíso', compliance: 68, risk: 'high', incidents: 5, workers: 120 },
    { name: 'Centro Logístico - Quilicura', compliance: 65, risk: 'high', incidents: 4, workers: 210 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20 lg:pb-6">
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
          <button onClick={onBack} className="flex items-center gap-2 text-white/70 hover:text-white mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
          <h1 className="text-white text-xl lg:text-2xl font-bold">Mapa de Riesgo por Sucursal</h1>
          <p className="text-sm text-white/60">Ranking de cumplimiento normativo</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-4">
        {/* Summary Card */}
        <Card className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border-blue-500/30">
          <div className="p-6">
            <h3 className="text-white font-bold text-lg mb-3">📍 Vista General del Mapa de Riesgo</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="text-3xl font-bold text-emerald-400 mb-1">{branches.filter(b => b.compliance >= 85).length}</div>
                <p className="text-white/80 text-sm">Sucursales en verde (≥85%)</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="text-3xl font-bold text-yellow-400 mb-1">{branches.filter(b => b.compliance >= 75 && b.compliance < 85).length}</div>
                <p className="text-white/80 text-sm">Sucursales en alerta (75-84%)</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="text-3xl font-bold text-red-400 mb-1">{branches.filter(b => b.compliance < 75).length}</div>
                <p className="text-white/80 text-sm">Sucursales críticas (&lt;75%)</p>
              </div>
            </div>
          </div>
        </Card>

        {branches.map((branch, index) => {
          const isHigh = branch.compliance < 75;
          const isMedium = branch.compliance >= 75 && branch.compliance < 85;
          
          return (
            <Card key={index} className={`bg-white/5 border-l-4 ${isHigh ? 'border-l-red-500 animate-pulse' : isMedium ? 'border-l-yellow-500' : 'border-l-green-500'} border-white/10`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="w-5 h-5 text-white/60" />
                      <h3 className="text-white font-bold text-lg">{branch.name}</h3>
                      {isHigh && <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />}
                    </div>
                    <div className="flex gap-2">
                      <Badge className={`${isHigh ? 'bg-red-500/20 text-red-400' : isMedium ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'} border-0`}>
                        {branch.compliance}% Cumplimiento
                      </Badge>
                      <Badge className="bg-white/10 text-white border-0">{branch.workers} trabajadores</Badge>
                      <Badge className="bg-white/10 text-white border-0">{branch.incidents} incidentes</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">#{ index + 1}</div>
                    <div className="text-xs text-white/60">Ranking</div>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-white/60 mb-1">
                    <span>Progreso hacia meta (85%)</span>
                    <span>{branch.compliance}%</span>
                  </div>
                  <Progress value={branch.compliance} className="h-3" />
                </div>
                {isHigh && (
                  <div className="mt-3 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                    <p className="text-red-400 text-sm font-semibold">⚠️ ACCIÓN REQUERIDA: Cumplimiento bajo 75%</p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}