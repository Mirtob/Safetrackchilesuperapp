import { useState } from 'react';
import { Building2, MapPin, Users, CheckCircle2, Search, X, ArrowRight } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';

interface Branch {
  id: string;
  name: string;
  city: string;
  address: string;
  type: 'planta' | 'obra' | 'oficina' | 'sucursal';
  workers: number;
  sectors: number;
  isActive: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface BranchSelectorProps {
  companyName: string;
  onSelectBranch: (branchId: string, branchName: string) => void;
  onBack: () => void;
  currentLocation?: {
    lat: number;
    lng: number;
  };
}

// Mock data - En producción vendría de la API
const MOCK_BRANCHES: Branch[] = [
  {
    id: 'branch-1',
    name: 'Planta Principal',
    city: 'Santiago',
    address: 'Av. Providencia 1234',
    type: 'planta',
    workers: 245,
    sectors: 12,
    isActive: true,
    coordinates: { lat: -33.4372, lng: -70.6506 }
  },
  {
    id: 'branch-2',
    name: 'Obra Valle Norte',
    city: 'Chicureo',
    address: 'Camino Valle Norte km 5',
    type: 'obra',
    workers: 89,
    sectors: 6,
    isActive: true,
    coordinates: { lat: -33.3000, lng: -70.6800 }
  },
  {
    id: 'branch-3',
    name: 'Sucursal Valparaíso',
    city: 'Valparaíso',
    address: 'Av. Brasil 1890',
    type: 'sucursal',
    workers: 156,
    sectors: 8,
    isActive: true,
    coordinates: { lat: -33.0472, lng: -71.6127 }
  },
  {
    id: 'branch-4',
    name: 'Planta Concepción',
    city: 'Concepción',
    address: 'Av. Colón 5678',
    type: 'planta',
    workers: 198,
    sectors: 10,
    isActive: true,
    coordinates: { lat: -36.8201, lng: -73.0444 }
  },
  {
    id: 'branch-5',
    name: 'Oficina Central',
    city: 'Santiago',
    address: 'Av. Apoquindo 3456',
    type: 'oficina',
    workers: 45,
    sectors: 4,
    isActive: true,
    coordinates: { lat: -33.4126, lng: -70.5693 }
  }
];

export function BranchSelector({ companyName, onSelectBranch, onBack, currentLocation }: BranchSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<Branch['type'] | 'all'>('all');
  const [branches] = useState<Branch[]>(MOCK_BRANCHES);

  // Calcular distancia aproximada si tenemos ubicación
  const calculateDistance = (branchCoords?: { lat: number; lng: number }) => {
    if (!currentLocation || !branchCoords) return null;
    
    const R = 6371; // Radio de la Tierra en km
    const dLat = (branchCoords.lat - currentLocation.lat) * Math.PI / 180;
    const dLng = (branchCoords.lng - currentLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(currentLocation.lat * Math.PI / 180) * Math.cos(branchCoords.lat * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  };

  // Filtrar sucursales
  const filteredBranches = branches
    .filter(branch => {
      const matchesSearch = 
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || branch.type === selectedType;
      return matchesSearch && matchesType && branch.isActive;
    })
    .sort((a, b) => {
      // Ordenar por distancia si está disponible
      const distA = calculateDistance(a.coordinates);
      const distB = calculateDistance(b.coordinates);
      if (distA !== null && distB !== null) {
        return distA - distB;
      }
      return a.name.localeCompare(b.name);
    });

  const typeLabels = {
    planta: 'Planta',
    obra: 'Obra',
    oficina: 'Oficina',
    sucursal: 'Sucursal'
  };

  const typeColors = {
    planta: 'bg-blue-500',
    obra: 'bg-orange-500',
    oficina: 'bg-purple-500',
    sucursal: 'bg-green-500'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-zinc-900 dark:via-blue-950/20 dark:to-zinc-900 pb-20 lg:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600 dark:text-zinc-400" />
              </button>
              <div>
                <h1 className="text-lg lg:text-xl font-semibold text-slate-900 dark:text-white">
                  Seleccionar Instalación
                </h1>
                <p className="text-sm text-slate-600 dark:text-zinc-400">
                  {companyName}
                </p>
              </div>
            </div>
            
            <Badge variant="outline" className="hidden sm:flex gap-1.5 bg-white dark:bg-zinc-800">
              <Building2 className="w-3.5 h-3.5" />
              {filteredBranches.length} instalaciones
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Search and Filters */}
        <Card className="p-4 bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar por nombre, ciudad o dirección..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#0055A4] dark:focus:ring-blue-500"
              />
            </div>

            {/* Type Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedType === 'all'
                    ? 'bg-[#0055A4] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-600'
                }`}
              >
                Todas
              </button>
              {Object.entries(typeLabels).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type as Branch['type'])}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedType === type
                      ? 'bg-[#0055A4] text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Branch Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBranches.map((branch) => {
            const distance = calculateDistance(branch.coordinates);
            
            return (
              <Card
                key={branch.id}
                className="group relative overflow-hidden bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-[#0055A4] dark:hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => onSelectBranch(branch.id, branch.name)}
              >
                {/* Header con tipo */}
                <div className="p-4 border-b border-slate-100 dark:border-zinc-700">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-[#0055A4] dark:group-hover:text-blue-400 transition-colors">
                        {branch.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-600 dark:text-zinc-400">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{branch.city}</span>
                      </div>
                    </div>
                    
                    <div className={`w-2 h-2 rounded-full ${typeColors[branch.type]} flex-shrink-0 mt-2`} />
                  </div>
                  
                  <Badge 
                    variant="outline" 
                    className="mt-3 text-xs"
                  >
                    {typeLabels[branch.type]}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                      <Users className="w-4 h-4" />
                      <span>Trabajadores</span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {branch.workers}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                      <Building2 className="w-4 h-4" />
                      <span>Sectores</span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {branch.sectors}
                    </span>
                  </div>

                  {distance !== null && (
                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-700">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>A {distance} km de tu ubicación</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer con dirección y botón */}
                <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 border-t border-slate-100 dark:border-zinc-700">
                  <p className="text-xs text-slate-500 dark:text-zinc-500 mb-3 line-clamp-1">
                    {branch.address}
                  </p>
                  
                  <Button
                    className="w-full bg-[#0055A4] hover:bg-[#004494] text-white"
                    size="sm"
                  >
                    Seleccionar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {/* Indicador de selección visual */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#0055A4]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredBranches.length === 0 && (
          <Card className="p-12 text-center bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
            <Building2 className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No se encontraron instalaciones
            </h3>
            <p className="text-sm text-slate-600 dark:text-zinc-400">
              Intenta ajustar los filtros de búsqueda
            </p>
          </Card>
        )}
      </div>

      {/* Indicador de ubicación actual */}
      {currentLocation && (
        <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:w-auto">
          <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-2 shadow-lg flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-slate-600 dark:text-zinc-400">
              Ordenado por distancia
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
