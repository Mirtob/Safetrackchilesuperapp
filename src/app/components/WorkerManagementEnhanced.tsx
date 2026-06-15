import { useState } from 'react';
import { 
  ArrowLeft, 
  UserPlus, 
  Search,
  Users,
  Building2,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Download,
  Upload,
  Trash2,
  Edit2,
  Clock,
  FileText,
  Calendar,
  XCircle,
  AlertCircle,
  ChevronRight,
  Shield
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { toast } from 'sonner';

interface WorkerManagementEnhancedProps {
  onBack: () => void;
  onViewAlerts?: () => void;
  onScheduleTraining?: (workerId: string, trainingType: string) => void;
  companyId?: string;
}

interface Training {
  type: string;
  date: string;
  expiryDate: string;
  status: 'vigente' | 'por-vencer' | 'vencida';
  daysRemaining?: number;
  requiredBy: string;
}

interface Worker {
  id: string;
  rut: string;
  name: string;
  position: string;
  company: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  trainings: Training[];
  alertCount: number; // Número de capacitaciones vencidas o por vencer
}

export function WorkerManagementEnhanced({ 
  onBack, 
  onViewAlerts,
  onScheduleTraining,
  companyId 
}: WorkerManagementEnhancedProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'alerts'>('all');
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [selectedWorkers, setSelectedWorkers] = useState<Set<string>>(new Set());

  // Mock data con sistema de capacitaciones
  const [workers] = useState<Worker[]>([
    {
      id: 'W001',
      rut: '12.345.678-9',
      name: 'Pedro Martínez López',
      position: 'Operador de Maquinaria Pesada',
      company: 'Constructora Los Andes S.A.',
      phone: '+56 9 8765 4321',
      email: 'p.martinez@losandes.cl',
      status: 'active',
      alertCount: 2,
      trainings: [
        {
          type: 'Inducción General',
          date: '2025-01-15',
          expiryDate: '2026-01-15',
          status: 'vigente',
          daysRemaining: 354,
          requiredBy: 'D.S. 40 Art. 21'
        },
        {
          type: 'Trabajo en Altura',
          date: '2025-01-20',
          expiryDate: '2026-01-20',
          status: 'vencida',
          daysRemaining: -6,
          requiredBy: 'D.S. 594 Art. 42'
        },
        {
          type: 'Uso de EPP',
          date: '2024-06-10',
          expiryDate: '2025-06-10',
          status: 'vencida',
          daysRemaining: -230,
          requiredBy: 'Ley 16.744 Art. 68'
        },
        {
          type: 'Manejo de Maquinaria Pesada',
          date: '2025-09-01',
          expiryDate: '2026-09-01',
          status: 'vigente',
          daysRemaining: 218,
          requiredBy: 'D.S. 594 Art. 37'
        }
      ]
    },
    {
      id: 'W002',
      rut: '18.765.432-1',
      name: 'Ana García Rojas',
      position: 'Técnico en Prevención de Riesgos',
      company: 'Constructora Los Andes S.A.',
      phone: '+56 9 7654 3210',
      email: 'a.garcia@losandes.cl',
      status: 'active',
      alertCount: 1,
      trainings: [
        {
          type: 'Inducción General',
          date: '2025-02-01',
          expiryDate: '2026-02-01',
          status: 'vigente',
          daysRemaining: 371,
          requiredBy: 'D.S. 40 Art. 21'
        },
        {
          type: 'Uso de EPP',
          date: '2025-08-05',
          expiryDate: '2026-08-05',
          status: 'por-vencer',
          daysRemaining: 10,
          requiredBy: 'Ley 16.744 Art. 68'
        },
        {
          type: 'Primeros Auxilios',
          date: '2025-03-10',
          expiryDate: '2026-03-10',
          status: 'vigente',
          daysRemaining: 409,
          requiredBy: 'D.S. 594 Art. 29'
        },
        {
          type: 'Investigación de Accidentes',
          date: '2025-11-20',
          expiryDate: '2026-11-20',
          status: 'vigente',
          daysRemaining: 298,
          requiredBy: 'D.S. 40 Art. 25'
        }
      ]
    },
    {
      id: 'W003',
      rut: '16.234.567-8',
      name: 'Carlos Muñoz Soto',
      position: 'Operario Nuevo Ingreso',
      company: 'Minera Escondida Ltda.',
      phone: '+56 9 6543 2109',
      email: 'c.munoz@escondida.cl',
      status: 'active',
      alertCount: 1,
      trainings: [
        {
          type: 'Inducción General',
          date: '',
          expiryDate: '',
          status: 'vencida',
          requiredBy: 'D.S. 40 Reglamento sobre Prevención de Riesgos Profesionales'
        }
      ]
    },
    {
      id: 'W004',
      rut: '14.567.890-2',
      name: 'Luis González Pérez',
      position: 'Supervisor de Terreno',
      company: 'Constructora Los Andes S.A.',
      phone: '+56 9 5432 1098',
      email: 'l.gonzalez@losandes.cl',
      status: 'active',
      alertCount: 1,
      trainings: [
        {
          type: 'Inducción General',
          date: '2025-01-10',
          expiryDate: '2026-01-10',
          status: 'vigente',
          daysRemaining: 349,
          requiredBy: 'D.S. 40 Art. 21'
        },
        {
          type: 'Espacios Confinados',
          date: '2024-07-15',
          expiryDate: '2026-01-15',
          status: 'vencida',
          daysRemaining: -11,
          requiredBy: 'D.S. 594 Art. 48'
        },
        {
          type: 'Trabajo en Altura',
          date: '2025-05-20',
          expiryDate: '2026-05-20',
          status: 'vigente',
          daysRemaining: 114,
          requiredBy: 'D.S. 594 Art. 42'
        }
      ]
    },
    {
      id: 'W005',
      rut: '19.876.543-2',
      name: 'María Fernández Silva',
      position: 'Químico de Laboratorio',
      company: 'Minera Escondida Ltda.',
      phone: '+56 9 4321 0987',
      email: 'm.fernandez@escondida.cl',
      status: 'active',
      alertCount: 1,
      trainings: [
        {
          type: 'Inducción General',
          date: '2025-01-05',
          expiryDate: '2026-01-05',
          status: 'vigente',
          daysRemaining: 344,
          requiredBy: 'D.S. 40 Art. 21'
        },
        {
          type: 'Manejo de Sustancias Peligrosas',
          date: '2025-02-15',
          expiryDate: '2026-02-15',
          status: 'por-vencer',
          daysRemaining: 20,
          requiredBy: 'D.S. 298'
        },
        {
          type: 'Uso de EPP Químico',
          date: '2025-02-20',
          expiryDate: '2026-02-20',
          status: 'vigente',
          daysRemaining: 390,
          requiredBy: 'Ley 16.744 Art. 68'
        }
      ]
    },
    {
      id: 'W006',
      rut: '13.456.789-0',
      name: 'Jorge Ramírez Castro',
      position: 'Electricista',
      company: 'Forestal Chile S.A.',
      phone: '+56 9 3210 9876',
      email: 'j.ramirez@forestal.cl',
      status: 'active',
      alertCount: 0,
      trainings: [
        {
          type: 'Inducción General',
          date: '2025-01-08',
          expiryDate: '2026-01-08',
          status: 'vigente',
          daysRemaining: 347,
          requiredBy: 'D.S. 40 Art. 21'
        },
        {
          type: 'Riesgo Eléctrico',
          date: '2025-06-15',
          expiryDate: '2026-06-15',
          status: 'vigente',
          daysRemaining: 140,
          requiredBy: 'D.S. 594 Art. 45'
        },
        {
          type: 'Primeros Auxilios',
          date: '2024-02-28',
          expiryDate: '2026-02-28',
          status: 'por-vencer',
          daysRemaining: 33,
          requiredBy: 'D.S. 594 Art. 29'
        }
      ]
    }
  ]);

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = 
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.rut.includes(searchTerm) ||
      worker.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (filterStatus === 'active') matchesStatus = worker.status === 'active';
    if (filterStatus === 'inactive') matchesStatus = worker.status === 'inactive';
    if (filterStatus === 'alerts') matchesStatus = worker.alertCount > 0;
    
    return matchesSearch && matchesStatus;
  });

  const totalWorkers = workers.length;
  const activeWorkers = workers.filter(w => w.status === 'active').length;
  const workersWithAlerts = workers.filter(w => w.alertCount > 0).length;
  const totalAlerts = workers.reduce((sum, w) => sum + w.alertCount, 0);

  const getTrainingStatusBadge = (status: string) => {
    switch (status) {
      case 'vigente':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Vigente</Badge>;
      case 'por-vencer':
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Por Vencer</Badge>;
      case 'vencida':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Vencida</Badge>;
      default:
        return null;
    }
  };

  const getWorkerStatusIndicator = (alertCount: number) => {
    if (alertCount === 0) {
      return <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />;
    } else if (alertCount <= 2) {
      return <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
    }
  };

  const handleScheduleTraining = (workerId: string, trainingType: string) => {
    toast.success('Abriendo calendario', {
      description: `Se abrirá el calendario para agendar "${trainingType}"`
    });
    onScheduleTraining?.(workerId, trainingType);
  };

  const handleBulkExport = () => {
    toast.success('Exportando datos de trabajadores', {
      description: 'Se generará un Excel con la información de todos los trabajadores'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-zinc-950 dark:via-blue-950/20 dark:to-zinc-950 pb-20 lg:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Nómina de Trabajadores
                </h1>
                <p className="text-sm text-slate-600 dark:text-zinc-400">
                  Gestión de capacitaciones y cumplimiento normativo
                </p>
              </div>
            </div>
            {onViewAlerts && totalAlerts > 0 && (
              <Button
                onClick={onViewAlerts}
                className="bg-orange-600 hover:bg-orange-700 text-white relative"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Ver Alertas
                <Badge className="absolute -top-2 -right-2 bg-red-600 text-white border-2 border-white dark:border-zinc-900">
                  {totalAlerts}
                </Badge>
              </Button>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-900 dark:text-blue-300">Total</span>
              </div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalWorkers}</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-900 dark:text-green-300">Activos</span>
              </div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">{activeWorkers}</div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200 dark:border-orange-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-xs font-medium text-orange-900 dark:text-orange-300">Con Alertas</span>
              </div>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{workersWithAlerts}</div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border border-red-200 dark:border-red-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-xs font-medium text-red-900 dark:text-red-300">Total Alertas</span>
              </div>
              <div className="text-2xl font-bold text-red-900 dark:text-red-100">{totalAlerts}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre, RUT o cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los trabajadores</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="alerts">Con alertas</option>
          </select>
          <Button
            onClick={handleBulkExport}
            variant="outline"
            size="sm"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>

        {/* Workers List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredWorkers.map(worker => (
            <Card
              key={worker.id}
              className="p-4 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedWorker(worker)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">
                    {getWorkerStatusIndicator(worker.alertCount)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {worker.name}
                      </h3>
                      {worker.alertCount > 0 && (
                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          {worker.alertCount} alerta{worker.alertCount > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-zinc-400 mb-1">
                      {worker.position}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-500">
                      <span>{worker.rut}</span>
                      <span>•</span>
                      <span>{worker.company}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-2 mb-3 p-2 bg-slate-50 dark:bg-zinc-800/50 rounded">
                <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-zinc-400">
                  <Phone className="w-3 h-3" />
                  <span className="truncate">{worker.phone}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-zinc-400">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{worker.email}</span>
                </div>
              </div>

              {/* Training Summary */}
              <div className="border-t border-slate-200 dark:border-zinc-700 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                    Capacitaciones ({worker.trainings.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {worker.trainings.slice(0, 3).map((training, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className={`text-xs ${
                        training.status === 'vencida'
                          ? 'border-red-300 text-red-700 dark:border-red-800 dark:text-red-400'
                          : training.status === 'por-vencer'
                          ? 'border-yellow-300 text-yellow-700 dark:border-yellow-800 dark:text-yellow-400'
                          : 'border-green-300 text-green-700 dark:border-green-800 dark:text-green-400'
                      }`}
                    >
                      {training.type}
                    </Badge>
                  ))}
                  {worker.trainings.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{worker.trainings.length - 3} más
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {filteredWorkers.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-700 mb-3" />
              <p className="text-slate-500 dark:text-zinc-400">
                No se encontraron trabajadores con los filtros aplicados
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Worker Detail Modal */}
      {selectedWorker && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedWorker(null)}
        >
          <div 
            className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getWorkerStatusIndicator(selectedWorker.alertCount)}
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {selectedWorker.name}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-zinc-400">
                      {selectedWorker.position}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedWorker(null)}
                  variant="ghost"
                  size="sm"
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg">
                <div className="text-sm">
                  <div className="text-xs text-slate-500 dark:text-zinc-500">RUT</div>
                  <div className="font-medium text-slate-900 dark:text-white">{selectedWorker.rut}</div>
                </div>
                <div className="text-sm">
                  <div className="text-xs text-slate-500 dark:text-zinc-500">Empresa</div>
                  <div className="font-medium text-slate-900 dark:text-white">{selectedWorker.company}</div>
                </div>
                <div className="text-sm">
                  <div className="text-xs text-slate-500 dark:text-zinc-500">Teléfono</div>
                  <div className="font-medium text-slate-900 dark:text-white">{selectedWorker.phone}</div>
                </div>
                <div className="text-sm">
                  <div className="text-xs text-slate-500 dark:text-zinc-500">Email</div>
                  <div className="font-medium text-slate-900 dark:text-white truncate">{selectedWorker.email}</div>
                </div>
              </div>
            </div>

            <ScrollArea className="h-[400px] p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Registro de Capacitaciones
              </h3>
              <div className="space-y-3">
                {selectedWorker.trainings.map((training, idx) => (
                  <div
                    key={idx}
                    className={`p-4 border rounded-lg ${
                      training.status === 'vencida'
                        ? 'border-red-300 dark:border-red-900 bg-red-50/50 dark:bg-red-950/10'
                        : training.status === 'por-vencer'
                        ? 'border-yellow-300 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-950/10'
                        : 'border-green-300 dark:border-green-900 bg-green-50/50 dark:bg-green-950/10'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            {training.type}
                          </h4>
                          {getTrainingStatusBadge(training.status)}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-zinc-400 mb-2">
                          📋 {training.requiredBy}
                        </p>
                      </div>
                    </div>

                    {training.date && (
                      <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                        <div>
                          <span className="text-slate-500 dark:text-zinc-500">Realizada:</span>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {new Date(training.date).toLocaleDateString('es-CL')}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-zinc-500">Vencimiento:</span>
                          <div className={`font-medium ${
                            training.status === 'vencida'
                              ? 'text-red-600 dark:text-red-400'
                              : training.status === 'por-vencer'
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            {new Date(training.expiryDate).toLocaleDateString('es-CL')}
                            {training.daysRemaining !== undefined && (
                              <span className="block text-xs">
                                ({training.daysRemaining < 0 
                                  ? `${Math.abs(training.daysRemaining)} días vencida` 
                                  : `${training.daysRemaining} días restantes`})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {(training.status === 'vencida' || training.status === 'por-vencer' || !training.date) && (
                      <Button
                        onClick={() => handleScheduleTraining(selectedWorker.id, training.type)}
                        size="sm"
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <Calendar className="w-3 h-3 mr-2" />
                        Agendar Capacitación
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Help Notice */}
      <Card className="max-w-7xl mx-auto mt-4 mx-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-900">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              🎯 Sistema de Alertas Automáticas
            </div>
            <div className="text-blue-800 dark:text-blue-300">
              El sistema monitorea automáticamente las capacitaciones y genera alertas cuando están vencidas o próximas a vencer, 
              permitiéndote agendar las charlas necesarias y mantener el cumplimiento normativo de la Ley 16.744.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
