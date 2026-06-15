import { useState } from 'react';
import { 
  ArrowLeft, 
  Building2, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  FileText,
  Calendar,
  MapPin,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { CompanyOnboarding } from '@/app/components/portfolio/CompanyOnboarding';
import { AssetManagement } from '@/app/components/portfolio/AssetManagement';
import { AnnualPlanGenerator } from '@/app/components/portfolio/AnnualPlanGenerator';

interface Client {
  id: string;
  name: string;
  logo?: string;
  location: string;
  riskLevel: 'low' | 'medium' | 'high';
  compliance: number; // 0-100
  activeTasks: number;
  nextVisit: string;
  lastActivity: string;
  brandColor: string;
  sectors?: any[];
  assets?: any[];
}

interface ClientPortfolioDashboardProps {
  onBack: () => void;
  onSelectClient: (clientId: string) => void;
}

type View = 'dashboard' | 'onboarding' | 'asset-management' | 'annual-plan';

export function ClientPortfolioDashboard({ onBack, onSelectClient }: ClientPortfolioDashboardProps) {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [assetData, setAssetData] = useState<any[]>([]);

  const [clients] = useState<Client[]>([
    {
      id: 'minera-1',
      name: 'Minera Los Andes S.A.',
      location: 'Calama, Región de Antofagasta',
      riskLevel: 'high',
      compliance: 67,
      activeTasks: 8,
      nextVisit: '2026-01-29',
      lastActivity: 'Hace 2 días',
      brandColor: '#DC2626'
    },
    {
      id: 'const-1',
      name: 'Constructora Paredes Ltda.',
      location: 'Santiago, Región Metropolitana',
      riskLevel: 'medium',
      compliance: 82,
      activeTasks: 3,
      nextVisit: '2026-02-01',
      lastActivity: 'Hace 5 días',
      brandColor: '#F59E0B'
    },
    {
      id: 'food-1',
      name: 'Alimentos del Sur SpA',
      location: 'Puerto Montt, Los Lagos',
      riskLevel: 'low',
      compliance: 94,
      activeTasks: 1,
      nextVisit: '2026-02-05',
      lastActivity: 'Hace 1 día',
      brandColor: '#10B981'
    },
    {
      id: 'logis-1',
      name: 'Transportes Rápidos Chile',
      location: 'Valparaíso',
      riskLevel: 'medium',
      compliance: 75,
      activeTasks: 5,
      nextVisit: '2026-01-30',
      lastActivity: 'Hace 3 días',
      brandColor: '#F59E0B'
    }
  ]);

  const getRiskBadge = (level: 'low' | 'medium' | 'high') => {
    const config = {
      low: { label: 'Bajo Riesgo', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
      medium: { label: 'Riesgo Medio', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      high: { label: 'Alto Riesgo', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
    };
    return config[level];
  };

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 90) return 'text-green-400';
    if (compliance >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleOnboardingComplete = (companyData: any) => {
    setOnboardingData(companyData);
    setCurrentView('asset-management');
  };

  const handleAssetManagementComplete = (assets: any[]) => {
    setAssetData(assets);
    setCurrentView('annual-plan');
  };

  const handleAnnualPlanComplete = () => {
    // Guardar todo en la base de datos
    setCurrentView('dashboard');
    setOnboardingData(null);
    setAssetData([]);
  };

  // Renderizar vista condicional
  if (currentView === 'onboarding') {
    return (
      <CompanyOnboarding
        onBack={() => setCurrentView('dashboard')}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  if (currentView === 'asset-management' && onboardingData) {
    return (
      <AssetManagement
        companyName={onboardingData.name}
        sectors={onboardingData.sectors}
        onBack={() => setCurrentView('onboarding')}
        onComplete={handleAssetManagementComplete}
      />
    );
  }

  if (currentView === 'annual-plan' && onboardingData) {
    return (
      <AnnualPlanGenerator
        companyName={onboardingData.name}
        sectors={onboardingData.sectors}
        assets={assetData}
        onBack={() => setCurrentView('asset-management')}
        onComplete={handleAnnualPlanComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Header */}
      <div className="bg-zinc-800 border-b border-zinc-700 sticky top-0 z-10">
        <div className="p-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
          <h1 className="text-white text-2xl font-bold">Cartera de Clientes</h1>
          <p className="text-zinc-400 text-sm mt-1">Asesorías de Prevención de Riesgos</p>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-24">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400 mb-1">Total Clientes</p>
                <p className="text-2xl font-bold text-white">{clients.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-[#FF8C00]" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400 mb-1">Tareas Activas</p>
                <p className="text-2xl font-bold text-white">
                  {clients.reduce((sum, c) => sum + c.activeTasks, 0)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400 mb-1">Riesgo Alto</p>
                <p className="text-2xl font-bold text-red-400">
                  {clients.filter(c => c.riskLevel === 'high').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400 mb-1">Cumplimiento Prom.</p>
                <p className="text-2xl font-bold text-green-400">
                  {Math.round(clients.reduce((sum, c) => sum + c.compliance, 0) / clients.length)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </Card>
        </div>

        {/* Client List */}
        <div className="space-y-3">
          {clients.map(client => {
            const riskBadge = getRiskBadge(client.riskLevel);
            return (
              <Card
                key={client.id}
                onClick={() => onSelectClient(client.id)}
                className="bg-zinc-800 border-zinc-700 p-4 cursor-pointer hover:border-[#FF8C00] transition-all group"
              >
                <div className="flex items-start gap-4">
                  {/* Logo/Icon */}
                  <div 
                    className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                    style={{ backgroundColor: client.brandColor }}
                  >
                    {client.name.charAt(0)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-white font-semibold group-hover:text-[#FF8C00] transition-colors">
                          {client.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-zinc-400 mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{client.location}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-[#FF8C00] transition-colors" />
                    </div>

                    {/* Risk Badge */}
                    <Badge className={`${riskBadge.color} mb-3 text-xs`}>
                      {riskBadge.label}
                    </Badge>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-zinc-500">Cumplimiento</p>
                        <p className={`text-lg font-bold ${getComplianceColor(client.compliance)}`}>
                          {client.compliance}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Tareas Activas</p>
                        <p className="text-lg font-bold text-white">{client.activeTasks}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Próxima Visita</p>
                        <p className="text-xs font-medium text-zinc-300 mt-1">
                          {new Date(client.nextVisit).toLocaleDateString('es-CL', { 
                            day: '2-digit', 
                            month: 'short' 
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-700">
                      <span className="text-xs text-zinc-500">
                        Última actividad: {client.lastActivity}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-zinc-400 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Acción: Ver informe
                          }}
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Informe
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* FAB - Agregar Nueva Empresa */}
      <button
        onClick={() => setCurrentView('onboarding')}
        className="fixed bottom-20 right-6 lg:bottom-8 lg:right-8 z-50 w-14 h-14 bg-gradient-to-br from-[#FF8C00] to-[#FF8C00]/80 hover:from-[#FF8C00]/90 hover:to-[#FF8C00]/70 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
        aria-label="Agregar nueva empresa"
      >
        <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
}
