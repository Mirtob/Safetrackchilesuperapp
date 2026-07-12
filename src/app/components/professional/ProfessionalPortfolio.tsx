import { useState, useEffect } from 'react';
import {
  fetchClientPortfolio,
  upsertBillingProfile,
  ClientCompany,
} from '@/app/services/clientPortfolioService';
import { fetchTimeEntries, TimeEntry } from '@/app/services/hoursTrackingService';
import { fetchInvoices, Invoice } from '@/app/services/billingService';
import { isSupabaseConfigured } from '@/app/services/supabase';
import { toast } from 'sonner';
import {
  ArrowLeft, 
  Building2, 
  DollarSign,
  Clock,
  Receipt,
  TrendingUp,
  Calendar,
  MapPin,
  Plus,
  ChevronRight,
  Eye,
  FileText,
  Briefcase,
  Download,
  Phone,
  Mail,
  User,
  BarChart3,
  Activity
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { CompanyOnboarding } from '@/app/components/portfolio/CompanyOnboarding';
import { AssetManagement } from '@/app/components/portfolio/AssetManagement';
import { AnnualPlanGenerator } from '@/app/components/portfolio/AnnualPlanGenerator';
import { ExpenseTracking } from '@/app/components/professional/ExpenseTracking';
import { HoursTracking } from '@/app/components/professional/HoursTracking';
import { BillingManagement } from '@/app/components/professional/BillingManagement';
import { PortfolioExportModal } from '@/app/components/professional/PortfolioExportModal';
import { SIIIntegration } from '@/app/components/professional/SIIIntegration';

interface ProfessionalPortfolioProps {
  onBack: () => void;
}

type View = 'overview' | 'client-detail' | 'onboarding' | 'asset-management' | 'annual-plan';

// Cartera de demostración: se usa solo si Supabase no está configurado
const MOCK_CLIENTS: ClientCompany[] = [
  {
    id: 'minera-1',
    name: 'Minera Los Andes S.A.',
    rut: '76.123.456-7',
    location: 'Calama, Región de Antofagasta',
    contractType: 'completo',
    hourlyRate: 0,
    monthlyFee: 2500000,
    paymentDay: 30,
    lastPayment: '2025-12-30',
    nextPayment: '2026-01-30',
    hoursThisMonth: 45,
    pendingAmount: 2500000,
    expensesThisMonth: 180000,
    status: 'active',
    brandColor: '#DC2626',
    startDate: '2025-06-01',
    hasBillingProfile: true
  },
  {
    id: 'const-1',
    name: 'Constructora Paredes Ltda.',
    rut: '77.234.567-8',
    location: 'Santiago, Región Metropolitana',
    contractType: 'consultoria',
    hourlyRate: 35000,
    paymentDay: 15,
    lastPayment: '2025-12-15',
    nextPayment: '2026-01-15',
    hoursThisMonth: 28,
    pendingAmount: 980000,
    expensesThisMonth: 45000,
    status: 'active',
    brandColor: '#F59E0B',
    startDate: '2025-08-15',
    hasBillingProfile: true
  },
  {
    id: 'food-1',
    name: 'Alimentos del Sur SpA',
    rut: '78.345.678-9',
    location: 'Puerto Montt, Los Lagos',
    contractType: 'asesoria',
    hourlyRate: 30000,
    monthlyFee: 800000,
    paymentDay: 5,
    lastPayment: '2026-01-05',
    nextPayment: '2026-02-05',
    hoursThisMonth: 18,
    pendingAmount: 1340000,
    expensesThisMonth: 95000,
    status: 'active',
    brandColor: '#10B981',
    startDate: '2025-09-01',
    hasBillingProfile: true
  }
];

export function ProfessionalPortfolio({ onBack }: ProfessionalPortfolioProps) {
  const [currentView, setCurrentView] = useState<View>('overview');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('clients');
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [assetData, setAssetData] = useState<any[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [clients, setClients] = useState<ClientCompany[]>(MOCK_CLIENTS);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [activatingClientId, setActivatingClientId] = useState<string | null>(null);
  const [billingForm, setBillingForm] = useState({
    contractType: 'consultoria' as ClientCompany['contractType'],
    hourlyRate: '',
    monthlyFee: '',
    paymentDay: '30',
  });
  const [isSavingBilling, setIsSavingBilling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadClients = async () => {
      setIsLoadingClients(true);
      if (!isSupabaseConfigured) {
        if (!cancelled) setClients(MOCK_CLIENTS);
        if (!cancelled) setIsLoadingClients(false);
        return;
      }
      try {
        const data = await fetchClientPortfolio();
        if (!cancelled) setClients(data);
      } catch (err: any) {
        console.warn('No se pudo cargar la cartera desde Supabase:', err.message);
        if (!cancelled) setClients(MOCK_CLIENTS);
      } finally {
        if (!cancelled) setIsLoadingClients(false);
      }
    };
    loadClients();
    return () => { cancelled = true; };
  }, []);

  const [clientActivities, setClientActivities] = useState<TimeEntry[]>([]);
  const [clientPayments, setClientPayments] = useState<Invoice[]>([]);

  useEffect(() => {
    let cancelled = false;
    const loadClientDetail = async () => {
      if (!selectedClient || !isSupabaseConfigured) {
        if (!cancelled) { setClientActivities([]); setClientPayments([]); }
        return;
      }
      const client = clients.find(c => c.id === selectedClient);
      if (!client) return;
      try {
        const [entries, invoicesData] = await Promise.all([
          fetchTimeEntries([{ id: client.id, name: client.name }]),
          fetchInvoices([{ id: client.id, name: client.name }]),
        ]);
        if (!cancelled) {
          setClientActivities(entries.filter(e => e.status === 'completed').slice(0, 5));
          setClientPayments(invoicesData.filter(i => i.status === 'paid').slice(0, 5));
        }
      } catch (err: any) {
        console.warn('No se pudo cargar el detalle del cliente:', err.message);
      }
    };
    loadClientDetail();
    return () => { cancelled = true; };
  }, [selectedClient, clients]);

  const handleActivateBilling = async (clientId: string) => {
    if (!billingForm.hourlyRate && !billingForm.monthlyFee) {
      toast.error('Ingresa una tarifa por hora o un honorario mensual');
      return;
    }
    setIsSavingBilling(true);
    try {
      await upsertBillingProfile(clientId, {
        contractType: billingForm.contractType,
        hourlyRate: parseInt(billingForm.hourlyRate || '0'),
        monthlyFee: billingForm.monthlyFee ? parseInt(billingForm.monthlyFee) : undefined,
        paymentDay: parseInt(billingForm.paymentDay || '30'),
        status: 'active',
        brandColor: clients.find(c => c.id === clientId)?.brandColor || '#0055A4',
      });
      const data = await fetchClientPortfolio();
      setClients(data);
      toast.success('✅ Facturación activada para este cliente');
      setActivatingClientId(null);
      setBillingForm({ contractType: 'consultoria', hourlyRate: '', monthlyFee: '', paymentDay: '30' });
    } catch (err: any) {
      toast.error('Error al activar la facturación', { description: err.message });
    } finally {
      setIsSavingBilling(false);
    }
  };

  // Calcular métricas totales
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'active').length;
  const totalHoursThisMonth = clients.reduce((sum, c) => sum + c.hoursThisMonth, 0);
  const totalPendingAmount = clients.reduce((sum, c) => sum + c.pendingAmount, 0);
  const totalExpensesThisMonth = clients.reduce((sum, c) => sum + c.expensesThisMonth, 0);
  const estimatedMonthlyIncome = clients.reduce((sum, c) => {
    if (c.monthlyFee) return sum + c.monthlyFee;
    return sum + (c.hourlyRate * c.hoursThisMonth);
  }, 0);

  const getContractTypeLabel = (type: ClientCompany['contractType']) => {
    const labels = {
      consultoria: 'Consultoría (Por Hora)',
      asesoria: 'Asesoría (Mixto)',
      completo: 'Servicio Completo (Mensual)'
    };
    return labels[type];
  };

  const getContractTypeBadge = (type: ClientCompany['contractType']) => {
    const badges = {
      consultoria: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
      asesoria: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
      completo: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
    };
    return badges[type];
  };

  const getStatusBadge = (status: ClientCompany['status']) => {
    const badges = {
      active: { label: 'Activo', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
      pending: { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      inactive: { label: 'Inactivo', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' }
    };
    return badges[status];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
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
    setCurrentView('overview');
    setOnboardingData(null);
    setAssetData([]);
  };

  // Renderizar vistas condicionales
  if (currentView === 'onboarding') {
    return (
      <CompanyOnboarding
        onBack={() => setCurrentView('overview')}
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

  // Vista de detalle de cliente
  if (currentView === 'client-detail' && selectedClient) {
    const client = clients.find(c => c.id === selectedClient);
    if (!client) {
      setCurrentView('overview');
      return null;
    }

    const statusBadge = getStatusBadge(client.status);

    const usingRealDetail = isSupabaseConfigured && client.hasBillingProfile;

    const recentActivities = usingRealDetail
      ? clientActivities.map(e => ({ date: e.date, type: 'Registro de horas', description: e.activity || 'Sin descripción', hours: e.duration }))
      : [
          { date: '2026-01-27', type: 'Inspección', description: 'Inspección de obra - Piso 3', hours: 3 },
          { date: '2026-01-25', type: 'Charla', description: 'Charla de seguridad EPP', hours: 2 },
          { date: '2026-01-22', type: 'Asesoría', description: 'Reunión gerencial', hours: 1.5 },
          { date: '2026-01-20', type: 'Inspección', description: 'Revisión de equipos', hours: 4 },
        ];

    const paymentHistory = usingRealDetail
      ? clientPayments.map(inv => ({ month: inv.description, amount: inv.amount, status: 'Pagado', date: inv.paidDate || inv.issueDate }))
      : [
          { month: 'Diciembre 2025', amount: client.monthlyFee || client.hourlyRate * 40, status: 'Pagado', date: '2025-12-30' },
          { month: 'Noviembre 2025', amount: client.monthlyFee || client.hourlyRate * 38, status: 'Pagado', date: '2025-11-30' },
          { month: 'Octubre 2025', amount: client.monthlyFee || client.hourlyRate * 42, status: 'Pagado', date: '2025-10-30' },
        ];

    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        {/* Header */}
        <div className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 sticky top-0 z-10">
          <div className="p-4 md:p-6">
            <button
              onClick={() => setCurrentView('overview')}
              className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver a Cartera</span>
            </button>

            <div className="flex items-start gap-4">
              <div 
                className="flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-2xl"
                style={{ backgroundColor: client.brandColor }}
              >
                {client.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">
                  {client.name}
                </h1>
                <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  <span>{client.rut}</span>
                  <span>•</span>
                  <MapPin className="w-4 h-4" />
                  <span>{client.location}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge className={statusBadge.color}>
                    {statusBadge.label}
                  </Badge>
                  <Badge className={getContractTypeBadge(client.contractType)}>
                    {getContractTypeLabel(client.contractType)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 pb-24 space-y-6">
          {/* Métricas del Cliente */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-600 p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-white opacity-80" />
                <Badge className="bg-white/20 text-white border-white/30">Este Mes</Badge>
              </div>
              <p className="text-sm text-green-100 mb-1">Por Cobrar</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(client.pendingAmount)}</p>
              {client.nextPayment && (
                <p className="text-xs text-green-100 mt-2">
                  Próximo pago: {new Date(client.nextPayment).toLocaleDateString('es-CL')}
                </p>
              )}
            </Card>

            <Card className="bg-gradient-to-br from-[#FF8C00] to-[#FF8C00]/80 border-[#FF8C00] p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-white opacity-80" />
                <Badge className="bg-white/20 text-white border-white/30">Este Mes</Badge>
              </div>
              <p className="text-sm text-orange-100 mb-1">Horas Trabajadas</p>
              <p className="text-3xl font-bold text-white">{client.hoursThisMonth}h</p>
              {client.hourlyRate > 0 && (
                <p className="text-xs text-orange-100 mt-2">
                  Tarifa: {formatCurrency(client.hourlyRate)}/hora
                </p>
              )}
            </Card>

            <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-purple-600 p-6">
              <div className="flex items-center justify-between mb-2">
                <Receipt className="w-8 h-8 text-white opacity-80" />
                <Badge className="bg-white/20 text-white border-white/30">Este Mes</Badge>
              </div>
              <p className="text-sm text-purple-100 mb-1">Gastos</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(client.expensesThisMonth)}</p>
              <p className="text-xs text-purple-100 mt-2">
                Transporte, equipos, etc.
              </p>
            </Card>
          </div>

          {/* Información del Contrato */}
          <Card className="p-6 bg-white dark:bg-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Información del Contrato
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Tipo de Contrato</p>
                <p className="font-medium text-zinc-900 dark:text-white">
                  {getContractTypeLabel(client.contractType)}
                </p>
              </div>
              {client.monthlyFee && (
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Honorario Mensual</p>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {formatCurrency(client.monthlyFee)}
                  </p>
                </div>
              )}
              {client.hourlyRate > 0 && (
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Tarifa por Hora</p>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {formatCurrency(client.hourlyRate)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Día de Pago</p>
                <p className="font-medium text-zinc-900 dark:text-white">
                  Cada {client.paymentDay} del mes
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Fecha de Inicio</p>
                <p className="font-medium text-zinc-900 dark:text-white">
                  {new Date(client.startDate).toLocaleDateString('es-CL', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </Card>

          {/* Actividades Recientes */}
          <Card className="p-6 bg-white dark:bg-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Actividades Recientes
            </h2>
            <div className="space-y-3">
              {recentActivities.map((activity, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-3 p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#0055A4]/10 dark:bg-[#0055A4]/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-[#0055A4]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-white">{activity.description}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                          {activity.type} • {new Date(activity.date).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.hours}h
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Historial de Pagos */}
          <Card className="p-6 bg-white dark:bg-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Historial de Pagos
            </h2>
            <div className="space-y-3">
              {paymentHistory.map((payment, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">{payment.month}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Fecha: {new Date(payment.date).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-zinc-900 dark:text-white">
                      {formatCurrency(payment.amount)}
                    </p>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 mt-1">
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 sticky top-0 z-10">
        <div className="p-4 md:p-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al Dashboard</span>
          </button>
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-[#0055A4] to-[#0055A4]/80 p-3 rounded-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">
                  Mi Cartera Profesional
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Gestión de clientes, facturación, horas y gastos
                </p>
              </div>
            </div>
            
            {/* Botón de Exportación destacado */}
            <Button
              onClick={() => setIsExportModalOpen(true)}
              className="hidden md:flex bg-gradient-to-r from-[#FF8C00] to-[#FF8C00]/80 hover:from-[#FF8C00]/90 hover:to-[#FF8C00]/70 text-white shadow-lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Resumen
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-5 bg-zinc-100 dark:bg-zinc-900">
              <TabsTrigger value="clients" className="text-xs md:text-sm">
                <Building2 className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Clientes</span>
              </TabsTrigger>
              <TabsTrigger value="sii" className="text-xs md:text-sm">
                <FileText className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">SII Boletas</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="text-xs md:text-sm">
                <DollarSign className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Facturación</span>
              </TabsTrigger>
              <TabsTrigger value="hours" className="text-xs md:text-sm">
                <Clock className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Horas</span>
              </TabsTrigger>
              <TabsTrigger value="expenses" className="text-xs md:text-sm">
                <Receipt className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Gastos</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="p-4 md:p-6 pb-24">
        <Tabs value={activeTab} className="w-full">
          {/* TAB: Clientes */}
          <TabsContent value="clients" className="space-y-6">
            {/* Financial Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <Card className="bg-gradient-to-br from-[#0055A4] to-[#0055A4]/80 border-[#0055A4] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-100 mb-1">Clientes Activos</p>
                    <p className="text-2xl font-bold text-white">{activeClients}</p>
                    <p className="text-xs text-blue-200">de {totalClients} total</p>
                  </div>
                  <Building2 className="w-8 h-8 text-white opacity-80" />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-600 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-green-100 mb-1">Por Cobrar</p>
                    <p className="text-xl md:text-2xl font-bold text-white">
                      {formatCurrency(totalPendingAmount)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-white opacity-80" />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-[#FF8C00] to-[#FF8C00]/80 border-[#FF8C00] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-orange-100 mb-1">Horas este Mes</p>
                    <p className="text-2xl font-bold text-white">{totalHoursThisMonth}h</p>
                  </div>
                  <Clock className="w-8 h-8 text-white opacity-80" />
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-purple-600 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-purple-100 mb-1">Gastos del Mes</p>
                    <p className="text-xl md:text-2xl font-bold text-white">
                      {formatCurrency(totalExpensesThisMonth)}
                    </p>
                  </div>
                  <Receipt className="w-8 h-8 text-white opacity-80" />
                </div>
              </Card>
            </div>

            {/* Estimated Income */}
            <Card className="bg-gradient-to-br from-zinc-800 to-zinc-900 dark:from-zinc-900 dark:to-black border-zinc-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400 mb-1">Ingresos Estimados este Mes</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(estimatedMonthlyIncome)}</p>
                  <p className="text-xs text-zinc-500 mt-2">
                    Basado en horas trabajadas y honorarios fijos
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-400" />
              </div>
            </Card>

            {/* Client List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                  Mis Clientes ({clients.length})
                </h2>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => setIsExportModalOpen(true)}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Exportar
                </Button>
              </div>

              {isLoadingClients && (
                <div className="flex items-center justify-center py-12 text-zinc-400">
                  <Clock className="w-5 h-5 mr-2 animate-spin" />
                  Cargando cartera...
                </div>
              )}

              {!isLoadingClients && isSupabaseConfigured && clients.length === 0 && (
                <Card className="p-8 text-center bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                  <Building2 className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                    No tienes empresas registradas todavía. Agrega una empresa desde el selector para poder facturarle.
                  </p>
                </Card>
              )}

              {!isLoadingClients && clients.map(client => {
                const statusBadge = getStatusBadge(client.status);

                if (isSupabaseConfigured && !client.hasBillingProfile) {
                  const isActivating = activatingClientId === client.id;
                  return (
                    <Card
                      key={client.id}
                      className="bg-white dark:bg-zinc-800 border-dashed border-2 border-zinc-300 dark:border-zinc-700 p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: client.brandColor }}
                        >
                          {client.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-zinc-900 dark:text-white">{client.name}</h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                            {client.rut} • Sin facturación activada
                          </p>

                          {!isActivating ? (
                            <Button size="sm" variant="outline" onClick={() => setActivatingClientId(client.id)}>
                              <Plus className="w-3 h-3 mr-1" />
                              Activar facturación
                            </Button>
                          ) : (
                            <div className="space-y-3 mt-2">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <Label className="text-xs">Tipo de contrato</Label>
                                  <select
                                    value={billingForm.contractType}
                                    onChange={(e) => setBillingForm({ ...billingForm, contractType: e.target.value as ClientCompany['contractType'] })}
                                    className="w-full mt-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm"
                                  >
                                    <option value="consultoria">Consultoría (Por Hora)</option>
                                    <option value="asesoria">Asesoría (Mixto)</option>
                                    <option value="completo">Servicio Completo (Mensual)</option>
                                  </select>
                                </div>
                                <div>
                                  <Label className="text-xs">Tarifa por hora (CLP)</Label>
                                  <Input
                                    type="number"
                                    value={billingForm.hourlyRate}
                                    onChange={(e) => setBillingForm({ ...billingForm, hourlyRate: e.target.value })}
                                    placeholder="35000"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Honorario mensual (CLP)</Label>
                                  <Input
                                    type="number"
                                    value={billingForm.monthlyFee}
                                    onChange={(e) => setBillingForm({ ...billingForm, monthlyFee: e.target.value })}
                                    placeholder="Opcional"
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  disabled={isSavingBilling}
                                  onClick={() => handleActivateBilling(client.id)}
                                  className="bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-white"
                                >
                                  {isSavingBilling ? 'Guardando...' : 'Guardar'}
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setActivatingClientId(null)}>
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                }

                return (
                  <Card
                    key={client.id}
                    className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-4 hover:border-[#FF8C00] transition-all group cursor-pointer"
                    onClick={() => {
                      setSelectedClient(client.id);
                      setCurrentView('client-detail');
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Logo */}
                      <div 
                        className="flex-shrink-0 w-14 h-14 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: client.brandColor }}
                      >
                        {client.name.charAt(0)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-semibold text-zinc-900 dark:text-white group-hover:text-[#FF8C00] transition-colors">
                              {client.name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                              <span>{client.rut}</span>
                              <span>•</span>
                              <MapPin className="w-3 h-3" />
                              <span>{client.location}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-[#FF8C00] transition-colors" />
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className={statusBadge.color}>
                            {statusBadge.label}
                          </Badge>
                          <Badge className={getContractTypeBadge(client.contractType)}>
                            {getContractTypeLabel(client.contractType).split('(')[0].trim()}
                          </Badge>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          <div>
                            <p className="text-xs text-zinc-500">Por Cobrar</p>
                            <p className="font-semibold text-green-600 dark:text-green-400">
                              {formatCurrency(client.pendingAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500">Horas/Mes</p>
                            <p className="font-semibold text-zinc-900 dark:text-white">
                              {client.hoursThisMonth}h
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500">Gastos/Mes</p>
                            <p className="font-semibold text-zinc-900 dark:text-white">
                              {formatCurrency(client.expensesThisMonth)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500">Próximo Cobro</p>
                            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                              {client.nextPayment ? new Date(client.nextPayment).toLocaleDateString('es-CL', {
                                day: '2-digit',
                                month: 'short'
                              }) : 'N/A'}
                            </p>
                          </div>
                        </div>

                        {/* Pricing Info */}
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-700">
                          <div className="text-xs text-zinc-600 dark:text-zinc-400">
                            {client.monthlyFee ? (
                              <>Honorario: <span className="font-semibold">{formatCurrency(client.monthlyFee)}/mes</span></>
                            ) : (
                              <>Tarifa: <span className="font-semibold">{formatCurrency(client.hourlyRate)}/hora</span></>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedClient(client.id);
                              setCurrentView('client-detail');
                            }}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Ver Detalle
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* TAB: SII Boletas */}
          <TabsContent value="sii">
            <SIIIntegration clients={clients} />
          </TabsContent>

          {/* TAB: Facturación */}
          <TabsContent value="billing">
            <BillingManagement clients={clients} />
          </TabsContent>

          {/* TAB: Horas */}
          <TabsContent value="hours">
            <HoursTracking clients={clients} />
          </TabsContent>

          {/* TAB: Gastos */}
          <TabsContent value="expenses">
            <ExpenseTracking clients={clients} />
          </TabsContent>
        </Tabs>
      </div>

      {/* FAB - Agregar Nuevo Cliente */}
      <button
        onClick={() => setCurrentView('onboarding')}
        className="fixed bottom-20 right-6 md:bottom-8 md:right-8 z-50 w-14 h-14 bg-gradient-to-br from-[#FF8C00] to-[#FF8C00]/80 hover:from-[#FF8C00]/90 hover:to-[#FF8C00]/70 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
        aria-label="Agregar nuevo cliente"
      >
        <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Modal de Exportación */}
      <PortfolioExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        clients={clients}
        totalHoursThisMonth={totalHoursThisMonth}
        totalPendingAmount={totalPendingAmount}
        totalExpensesThisMonth={totalExpensesThisMonth}
        estimatedMonthlyIncome={estimatedMonthlyIncome}
      />
    </div>
  );
}