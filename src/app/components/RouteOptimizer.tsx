import { useState } from 'react';
import { ArrowLeft, Navigation, MapPin, Clock, TrendingDown, Fuel, Calendar, Route } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

interface RouteOptimizerProps {
  onBack: () => void;
}

// Sucursales con ubicación y nivel de riesgo
const branches = [
  {
    id: 1,
    name: 'Sucursal Maipú',
    company: 'Constructora Los Andes',
    address: 'Av. Pajaritos 3000, Maipú',
    zone: 'Zona Oeste',
    riskLevel: 'critical',
    riskScore: 92,
    pendingTasks: 3,
    lastVisit: '2026-01-20',
    coordinates: { lat: -33.51, lng: -70.76 },
    urgentDeadline: 'Comité Paritario mañana'
  },
  {
    id: 2,
    name: 'Sucursal Puente Alto',
    company: 'Constructora Los Andes',
    address: 'Av. Concha y Toro 1500, Puente Alto',
    zone: 'Zona Sur',
    riskLevel: 'high',
    riskScore: 78,
    pendingTasks: 2,
    lastVisit: '2026-01-22',
    coordinates: { lat: -33.61, lng: -70.58 },
    urgentDeadline: 'Capacitación en 3 días'
  },
  {
    id: 3,
    name: 'Sucursal Centro',
    company: 'Transportes Veloz',
    address: 'Av. Libertador Bernardo O\'Higgins 1200',
    zone: 'Zona Centro',
    riskLevel: 'medium',
    riskScore: 65,
    pendingTasks: 1,
    lastVisit: '2026-01-25',
    coordinates: { lat: -33.45, lng: -70.66 },
    urgentDeadline: null
  },
  {
    id: 4,
    name: 'Sucursal Las Condes',
    company: 'Minera del Norte',
    address: 'Av. Apoquindo 4800, Las Condes',
    zone: 'Zona Oriente',
    riskLevel: 'medium',
    riskScore: 58,
    pendingTasks: 2,
    lastVisit: '2026-01-23',
    coordinates: { lat: -33.41, lng: -70.57 },
    urgentDeadline: null
  },
  {
    id: 5,
    name: 'Sucursal Providencia',
    company: 'Retail ModaChic',
    address: 'Av. Providencia 2100, Providencia',
    zone: 'Zona Centro',
    riskLevel: 'low',
    riskScore: 42,
    pendingTasks: 1,
    lastVisit: '2026-01-24',
    coordinates: { lat: -33.43, lng: -70.61 },
    urgentDeadline: null
  }
];

// Rutas optimizadas sugeridas
const optimizedRoutes = [
  {
    id: 1,
    name: 'Ruta Oeste-Sur',
    branches: ['Sucursal Maipú', 'Sucursal Puente Alto'],
    distance: '32 km',
    duration: '1h 15min',
    fuelSavings: '45%',
    timeSavings: '45 min',
    priority: 'critical',
    date: '2026-01-27',
    description: 'Agrupa visitas urgentes con vencimiento legal'
  },
  {
    id: 2,
    name: 'Ruta Centro',
    branches: ['Sucursal Centro', 'Sucursal Providencia'],
    distance: '8 km',
    duration: '25 min',
    fuelSavings: '60%',
    timeSavings: '1h 20min',
    priority: 'medium',
    date: '2026-01-28',
    description: 'Maximiza productividad en zona céntrica'
  },
  {
    id: 3,
    name: 'Ruta Oriente',
    branches: ['Sucursal Las Condes'],
    distance: '18 km',
    duration: '40 min',
    fuelSavings: '0%',
    timeSavings: '0 min',
    priority: 'low',
    date: '2026-01-29',
    description: 'Visita individual - Sin optimización disponible'
  }
];

export function RouteOptimizer({ onBack }: RouteOptimizerProps) {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const filteredBranches = selectedZone 
    ? branches.filter(b => b.zone === selectedZone)
    : branches;

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
                <h1 className="text-slate-900 dark:text-white text-xl lg:text-2xl">Optimización de Rutas</h1>
                <p className="text-sm text-slate-600 dark:text-zinc-400">Mapa de calor de riesgo y rutas inteligentes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* KPIs de Optimización */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-700 dark:text-green-400 text-sm">Ahorro Potencial</span>
                <TrendingDown className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-3xl text-green-900 dark:text-green-300 mb-1">2h 5min</div>
              <Badge className="bg-green-600/20 text-green-700 dark:text-green-400 border-0 text-xs">
                Por semana
              </Badge>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-700 dark:text-blue-400 text-sm">Combustible</span>
                <Fuel className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl text-blue-900 dark:text-blue-300 mb-1">-52%</div>
              <Badge className="bg-blue-600/20 text-blue-700 dark:text-blue-400 border-0 text-xs">
                58 km menos
              </Badge>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-700 dark:text-amber-400 text-sm">Visitas Agrupadas</span>
                <Route className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl text-amber-900 dark:text-amber-300 mb-1">7</div>
              <Badge className="bg-amber-600/20 text-amber-700 dark:text-amber-400 border-0 text-xs">
                En 3 rutas
              </Badge>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-700 dark:text-red-400 text-sm">Prioridad Crítica</span>
                <Calendar className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-3xl text-red-900 dark:text-red-300 mb-1">2</div>
              <Badge className="bg-red-600/20 text-red-700 dark:text-red-400 border-0 text-xs">
                Vencimiento legal
              </Badge>
            </div>
          </Card>
        </div>

        {/* Filtros por Zona */}
        <Card className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
          <div className="p-5">
            <h3 className="text-slate-900 dark:text-white font-semibold mb-4">Filtrar por Zona Geográfica</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => setSelectedZone(null)}
                variant={selectedZone === null ? 'default' : 'outline'}
                size="sm"
                className={selectedZone === null ? 'bg-[#003366] hover:bg-[#002244] text-white' : ''}
              >
                Todas las Zonas
              </Button>
              <Button
                onClick={() => setSelectedZone('Zona Oeste')}
                variant={selectedZone === 'Zona Oeste' ? 'default' : 'outline'}
                size="sm"
                className={selectedZone === 'Zona Oeste' ? 'bg-[#003366] hover:bg-[#002244] text-white' : ''}
              >
                Zona Oeste
              </Button>
              <Button
                onClick={() => setSelectedZone('Zona Sur')}
                variant={selectedZone === 'Zona Sur' ? 'default' : 'outline'}
                size="sm"
                className={selectedZone === 'Zona Sur' ? 'bg-[#003366] hover:bg-[#002244] text-white' : ''}
              >
                Zona Sur
              </Button>
              <Button
                onClick={() => setSelectedZone('Zona Centro')}
                variant={selectedZone === 'Zona Centro' ? 'default' : 'outline'}
                size="sm"
                className={selectedZone === 'Zona Centro' ? 'bg-[#003366] hover:bg-[#002244] text-white' : ''}
              >
                Zona Centro
              </Button>
              <Button
                onClick={() => setSelectedZone('Zona Oriente')}
                variant={selectedZone === 'Zona Oriente' ? 'default' : 'outline'}
                size="sm"
                className={selectedZone === 'Zona Oriente' ? 'bg-[#003366] hover:bg-[#002244] text-white' : ''}
              >
                Zona Oriente
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mapa de Calor de Riesgo */}
          <div className="space-y-4">
            <Card className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
              <div className="p-5">
                <h3 className="text-slate-900 dark:text-white font-semibold mb-4">
                  Mapa de Calor de Riesgo
                </h3>
                
                {/* Mapa Simplificado */}
                <div className="bg-slate-100 dark:bg-zinc-900 rounded-lg p-6 mb-4 relative h-80">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
                      <p className="text-slate-600 dark:text-zinc-400 text-sm">
                        Mapa Interactivo de Santiago
                      </p>
                      <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">
                        {filteredBranches.length} sucursales en vista
                      </p>
                    </div>
                  </div>

                  {/* Marcadores simulados */}
                  {filteredBranches.map((branch, index) => (
                    <div
                      key={branch.id}
                      className={`absolute w-4 h-4 rounded-full ${
                        branch.riskLevel === 'critical' ? 'bg-[#D32F2F] animate-pulse' :
                        branch.riskLevel === 'high' ? 'bg-amber-500' :
                        branch.riskLevel === 'medium' ? 'bg-blue-500' :
                        'bg-green-500'
                      }`}
                      style={{
                        top: `${20 + index * 15}%`,
                        left: `${25 + index * 12}%`
                      }}
                      title={branch.name}
                    />
                  ))}
                </div>

                {/* Leyenda */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#D32F2F]" />
                    <span className="text-slate-600 dark:text-zinc-400">Crítico (90+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-slate-600 dark:text-zinc-400">Alto (70-89)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-slate-600 dark:text-zinc-400">Medio (50-69)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-slate-600 dark:text-zinc-400">{'Bajo (<50)'}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Sucursales por Nivel de Riesgo */}
            <Card className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
              <div className="p-5">
                <h3 className="text-slate-900 dark:text-white font-semibold mb-4">Sucursales</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredBranches
                    .sort((a, b) => b.riskScore - a.riskScore)
                    .map((branch) => (
                      <div
                        key={branch.id}
                        className={`p-4 rounded-lg border-l-4 transition-all interactive ${
                          branch.riskLevel === 'critical'
                            ? 'border-l-[#D32F2F] bg-red-50 dark:bg-red-900/20'
                            : branch.riskLevel === 'high'
                            ? 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/20'
                            : branch.riskLevel === 'medium'
                            ? 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-l-green-500 bg-green-50 dark:bg-green-900/20'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-slate-900 dark:text-white font-medium text-sm">
                              {branch.name}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-zinc-400">{branch.company}</p>
                          </div>
                          <Badge className={`${
                            branch.riskLevel === 'critical' ? 'bg-[#D32F2F]' :
                            branch.riskLevel === 'high' ? 'bg-amber-500' :
                            branch.riskLevel === 'medium' ? 'bg-blue-500' :
                            'bg-green-500'
                          } text-white border-0 text-xs`}>
                            {branch.riskScore}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400 mb-2">
                          <MapPin className="w-3 h-3" />
                          {branch.address}
                        </div>
                        {branch.urgentDeadline && (
                          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-zinc-600">
                            <p className="text-xs text-[#D32F2F] dark:text-red-400 font-medium">
                              ⚠️ {branch.urgentDeadline}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Rutas Optimizadas */}
          <div>
            <Card className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
              <div className="p-5">
                <h3 className="text-slate-900 dark:text-white font-semibold mb-4">
                  Rutas Optimizadas Sugeridas
                </h3>
                <div className="space-y-4">
                  {optimizedRoutes.map((route) => (
                    <div
                      key={route.id}
                      className={`p-5 rounded-lg border-2 transition-all interactive ${
                        route.priority === 'critical'
                          ? 'border-[#D32F2F] bg-red-50 dark:bg-red-900/20'
                          : route.priority === 'medium'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-700/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-slate-900 dark:text-white font-medium mb-1">
                            {route.name}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-zinc-400">
                            {route.description}
                          </p>
                        </div>
                        <Badge className={`${
                          route.priority === 'critical' ? 'bg-[#D32F2F]' :
                          route.priority === 'medium' ? 'bg-blue-600' :
                          'bg-slate-500'
                        } text-white border-0 text-xs`}>
                          {route.date}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        {route.branches.map((branchName, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#003366] text-white text-xs">
                              {index + 1}
                            </div>
                            <span className="text-slate-700 dark:text-zinc-300">{branchName}</span>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg">
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400 mb-1">
                            <Navigation className="w-3 h-3" />
                            Distancia
                          </div>
                          <div className="text-slate-900 dark:text-white font-medium">
                            {route.distance}
                          </div>
                        </div>
                        <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg">
                          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400 mb-1">
                            <Clock className="w-3 h-3" />
                            Duración
                          </div>
                          <div className="text-slate-900 dark:text-white font-medium">
                            {route.duration}
                          </div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                          <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400 mb-1">
                            <Fuel className="w-3 h-3" />
                            Ahorro Combustible
                          </div>
                          <div className="text-green-900 dark:text-green-300 font-medium">
                            {route.fuelSavings}
                          </div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                          <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400 mb-1">
                            <Clock className="w-3 h-3" />
                            Ahorro Tiempo
                          </div>
                          <div className="text-green-900 dark:text-green-300 font-medium">
                            {route.timeSavings}
                          </div>
                        </div>
                      </div>

                      <Button className="w-full bg-[#003366] hover:bg-[#002244] text-white">
                        <Navigation className="w-4 h-4 mr-2" />
                        Iniciar Ruta
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}