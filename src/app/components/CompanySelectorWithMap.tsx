import { useState } from 'react';
import { Building2, ChevronRight, AlertCircle, CheckCircle, MapPin, Users } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { GoogleMapView } from '@/app/components/GoogleMapView';
import { Company, Branch } from '@/app/context/CompanyContext';
import { Coordinates } from '@/app/hooks/useGeolocation';

interface CompanySelectorWithMapProps {
  companies: Company[];
  onSelectCompany: (company: Company, branch?: Branch) => void;
  currentLocation?: Coordinates | null;
  isTrackingLocation?: boolean;
}

export function CompanySelectorWithMap({
  companies,
  onSelectCompany,
  currentLocation,
  isTrackingLocation = false
}: CompanySelectorWithMapProps) {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const getStatusColor = (level: Company['riskLevel']) => {
    switch (level) {
      case 'Alto':
        return 'bg-red-500';
      case 'Medio':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  const getStatusIcon = (level: Company['riskLevel']) => {
    return level === 'Alto' ? (
      <AlertCircle className="w-5 h-5 text-red-500" />
    ) : (
      <CheckCircle className="w-5 h-5 text-green-500" />
    );
  };

  const handleLocationSelect = (company: Company, branch?: Branch) => {
    setSelectedCompany(company);
    setSelectedBranch(branch || null);
  };

  const handleConfirmSelection = () => {
    if (selectedCompany) {
      onSelectCompany(selectedCompany, selectedBranch || undefined);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 transition-colors">
      <div className="max-w-6xl mx-auto p-4 pb-20">
        {/* Header */}
        <div className="mb-6 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-zinc-900 dark:text-white text-2xl mb-2">Mis Empresas</h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Selecciona una empresa para gestionar
              </p>
            </div>
            
            {/* Toggle View Mode */}
            <div className="flex gap-2">
              <Button
                onClick={() => setViewMode('list')}
                variant={viewMode === 'list' ? 'default' : 'outline'}
                className={viewMode === 'list' 
                  ? 'bg-[#0055A4] hover:bg-[#004080] text-white' 
                  : 'border-slate-300 dark:border-zinc-600'
                }
              >
                <Building2 className="w-4 h-4 mr-2" />
                Lista
              </Button>
              <Button
                onClick={() => setViewMode('map')}
                variant={viewMode === 'map' ? 'default' : 'outline'}
                className={viewMode === 'map' 
                  ? 'bg-[#0055A4] hover:bg-[#004080] text-white' 
                  : 'border-slate-300 dark:border-zinc-600'
                }
              >
                <MapPin className="w-4 h-4 mr-2" />
                Mapa
              </Button>
            </div>
          </div>
        </div>

        {/* GPS Status Indicator */}
        {isTrackingLocation && currentLocation && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                <div className="relative bg-green-500 p-2 rounded-full">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-green-900 dark:text-green-300 font-semibold text-sm">
                  GPS Activo
                </p>
                <p className="text-xs text-green-700 dark:text-green-400">
                  Precisión: ±{Math.round(currentLocation.accuracy)}m • Lat: {currentLocation.latitude.toFixed(4)} • Lng: {currentLocation.longitude.toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Map View */}
        {viewMode === 'map' ? (
          <div className="space-y-4">
            <GoogleMapView
              companies={companies}
              currentLocation={currentLocation}
              selectedCompany={selectedCompany}
              selectedBranch={selectedBranch}
              onSelectLocation={handleLocationSelect}
              showCurrentLocation={isTrackingLocation}
              height="500px"
              zoom={currentLocation ? 13 : 6}
            />

            {/* Selected Location Card */}
            {selectedCompany && (
              <Card className="bg-white dark:bg-zinc-800 border-2 border-[#FF8C00]">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="bg-[#FF8C00]/20 p-2.5 rounded-lg">
                        <Building2 className="w-6 h-6 text-[#FF8C00]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-zinc-900 dark:text-white font-semibold mb-1">
                          {selectedBranch ? selectedBranch.name : selectedCompany.name}
                        </h3>
                        {selectedBranch && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                            Empresa: {selectedCompany.name}
                          </p>
                        )}
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          {selectedBranch ? selectedBranch.address : selectedCompany.address}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      className={`${getStatusColor(selectedCompany.riskLevel)} text-white border-0`}
                    >
                      Riesgo {selectedCompany.riskLevel}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-zinc-700">
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <Users className="w-4 h-4" />
                      <span>
                        {selectedBranch ? selectedBranch.workerCount : selectedCompany.workerCount} trabajadores
                      </span>
                    </div>
                    <Button
                      onClick={handleConfirmSelection}
                      className="bg-[#0055A4] hover:bg-[#004080] text-white"
                    >
                      Ingresar
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {companies.map((company) => (
              <Card
                key={company.id}
                className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-[#FF8C00] transition-all cursor-pointer active:scale-[0.98]"
                onClick={() => onSelectCompany(company)}
              >
                <div className="p-5">
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="bg-zinc-100 dark:bg-zinc-700 p-2.5 rounded-lg">
                        <Building2 className="w-6 h-6 text-zinc-900 dark:text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-zinc-900 dark:text-white font-semibold mb-1">
                          {company.name}
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                          RUT: {company.rut}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs">
                            {company.branches?.length || 0} sucursales
                          </Badge>
                          <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs">
                            {company.industry}
                          </Badge>
                          <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs">
                            {company.workerCount} trabajadores
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusIcon(company.riskLevel)}
                      <ChevronRight className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                    </div>
                  </div>

                  {/* Footer Row */}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-700">
                    <Badge 
                      className={`${getStatusColor(company.riskLevel)} text-white border-0`}
                    >
                      Riesgo {company.riskLevel}
                    </Badge>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Contrato desde {new Date(company.contractStart).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
