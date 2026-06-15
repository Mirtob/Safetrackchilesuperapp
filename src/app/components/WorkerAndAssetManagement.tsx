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
  Shield,
  X,
  Save,
  User,
  IdCard,
  Briefcase,
  MapPin,
  Eye,
  Package,
  Wrench,
  BarChart3,
  QrCode,
  Settings,
  Plus,
  BoxSelect
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { toast } from 'sonner';

interface WorkerAndAssetManagementProps {
  onBack: () => void;
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
  department: string;
  sector: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  contractType: 'indefinido' | 'plazo-fijo' | 'honorarios';
  startDate: string;
  status: 'active' | 'inactive';
  trainings: Training[];
  alertCount: number;
}

interface Asset {
  id: string;
  code: string;
  name: string;
  type: string;
  category: 'maquinaria' | 'herramienta' | 'equipo' | 'vehiculo' | 'instalacion';
  brand: string;
  model: string;
  serialNumber: string;
  sector: string;
  location: string;
  acquisitionDate: string;
  acquisitionCost: number;
  status: 'operativo' | 'mantenimiento' | 'fuera-servicio' | 'baja';
  condition: 'excelente' | 'bueno' | 'regular' | 'malo';
  responsible: string;
  nextInspectionDate: string;
  lastInspectionDate: string;
  inspectionFrequency: 'semanal' | 'quincenal' | 'mensual' | 'trimestral' | 'semestral' | 'anual';
  maintenanceHistory: MaintenanceRecord[];
  documents: string[];
  notes: string;
  alertCount: number;
}

interface MaintenanceRecord {
  date: string;
  type: 'preventivo' | 'correctivo' | 'predictivo';
  description: string;
  technician: string;
  cost: number;
}

type FormMode = 'create' | 'edit' | 'view' | null;
type ManagementType = 'workers' | 'assets';

export function WorkerAndAssetManagement({ onBack }: WorkerAndAssetManagementProps) {
  const [activeTab, setActiveTab] = useState<ManagementType>('workers');
  
  // Estados para trabajadores
  const [workers, setWorkers] = useState<Worker[]>([
    {
      id: 'W001',
      rut: '12.345.678-9',
      name: 'Pedro Martínez López',
      position: 'Operador de Maquinaria Pesada',
      company: 'Constructora Los Andes S.A.',
      department: 'Operaciones',
      sector: 'Obra Centro',
      phone: '+56 9 8765 4321',
      email: 'p.martinez@losandes.cl',
      address: 'Av. Los Conquistadores 1234, Santiago',
      emergencyContact: 'María Martínez (Esposa)',
      emergencyPhone: '+56 9 8765 1111',
      contractType: 'indefinido',
      startDate: '2023-01-15',
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
          date: '2024-06-20',
          expiryDate: '2025-06-20',
          status: 'vencida',
          daysRemaining: -220,
          requiredBy: 'D.S. 594'
        }
      ]
    },
    {
      id: 'W002',
      rut: '18.765.432-1',
      name: 'Ana Silva González',
      position: 'Supervisora de Seguridad',
      company: 'Constructora Los Andes S.A.',
      department: 'Seguridad y Salud Ocupacional',
      sector: 'Todas',
      phone: '+56 9 7654 3210',
      email: 'a.silva@losandes.cl',
      address: 'Calle San Martín 567, Providencia',
      emergencyContact: 'Carlos Silva (Hermano)',
      emergencyPhone: '+56 9 7654 2222',
      contractType: 'indefinido',
      startDate: '2022-03-10',
      status: 'active',
      alertCount: 0,
      trainings: [
        {
          type: 'Inducción General',
          date: '2025-03-10',
          expiryDate: '2026-03-10',
          status: 'vigente',
          daysRemaining: 408,
          requiredBy: 'D.S. 40 Art. 21'
        },
        {
          type: 'Prevención de Riesgos',
          date: '2025-04-15',
          expiryDate: '2026-04-15',
          status: 'vigente',
          daysRemaining: 444,
          requiredBy: 'Ley 16.744'
        }
      ]
    }
  ]);

  // Estados para activos
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: 'A001',
      code: 'EXC-2024-001',
      name: 'Excavadora Hidráulica',
      type: 'Excavadora',
      category: 'maquinaria',
      brand: 'Caterpillar',
      model: '320D',
      serialNumber: 'CAT320D2024001',
      sector: 'Obra Centro',
      location: 'Patio de Maquinarias - Zona A',
      acquisitionDate: '2024-03-15',
      acquisitionCost: 85000000,
      status: 'operativo',
      condition: 'excelente',
      responsible: 'Pedro Martínez López',
      nextInspectionDate: '2026-02-15',
      lastInspectionDate: '2026-01-15',
      inspectionFrequency: 'mensual',
      alertCount: 0,
      maintenanceHistory: [
        {
          date: '2026-01-10',
          type: 'preventivo',
          description: 'Cambio de aceite y filtros',
          technician: 'Carlos Rojas',
          cost: 450000
        }
      ],
      documents: ['Manual de usuario', 'Certificado de inspección'],
      notes: 'Unidad nueva, en excelente estado'
    },
    {
      id: 'A002',
      code: 'AND-2023-045',
      name: 'Andamio Tubular',
      type: 'Andamio',
      category: 'equipo',
      brand: 'Layher',
      model: 'Allround',
      serialNumber: 'LAY2023045',
      sector: 'Obra Norte',
      location: 'Edificio B - Piso 5',
      acquisitionDate: '2023-08-20',
      acquisitionCost: 3500000,
      status: 'operativo',
      condition: 'bueno',
      responsible: 'Ana Silva González',
      nextInspectionDate: '2026-02-01',
      lastInspectionDate: '2026-01-20',
      inspectionFrequency: 'quincenal',
      alertCount: 1,
      maintenanceHistory: [
        {
          date: '2025-12-15',
          type: 'correctivo',
          description: 'Reemplazo de plataformas dañadas',
          technician: 'Luis Fernández',
          cost: 280000
        }
      ],
      documents: ['Certificado de carga', 'Planos de montaje'],
      notes: 'Requiere revisión de plataformas'
    },
    {
      id: 'A003',
      code: 'VEH-2025-010',
      name: 'Camioneta Pick-up',
      type: 'Vehículo',
      category: 'vehiculo',
      brand: 'Toyota',
      model: 'Hilux 4x4',
      serialNumber: 'TOY2025HILUX010',
      sector: 'Administración',
      location: 'Estacionamiento Principal',
      acquisitionDate: '2025-01-10',
      acquisitionCost: 28000000,
      status: 'operativo',
      condition: 'excelente',
      responsible: 'Roberto Muñoz',
      nextInspectionDate: '2026-02-10',
      lastInspectionDate: '2026-01-27',
      inspectionFrequency: 'mensual',
      alertCount: 0,
      maintenanceHistory: [],
      documents: ['Permiso de circulación', 'Seguro obligatorio', 'Revisión técnica'],
      notes: 'Vehículo nuevo, primera mantención a los 5.000 km'
    },
    {
      id: 'A004',
      code: 'EXT-2022-078',
      name: 'Extintor CO2 10kg',
      type: 'Extintor',
      category: 'equipo',
      brand: 'Kidde',
      model: 'CO2-10K',
      serialNumber: 'KID2022078',
      sector: 'Oficinas Administrativas',
      location: 'Pasillo Principal - Piso 2',
      acquisitionDate: '2022-05-15',
      acquisitionCost: 85000,
      status: 'operativo',
      condition: 'regular',
      responsible: 'Ana Silva González',
      nextInspectionDate: '2026-01-30',
      lastInspectionDate: '2025-12-28',
      inspectionFrequency: 'mensual',
      alertCount: 2,
      maintenanceHistory: [
        {
          date: '2025-05-15',
          type: 'preventivo',
          description: 'Recarga y prueba hidrostática',
          technician: 'Empresa Extintores Chile',
          cost: 45000
        }
      ],
      documents: ['Certificado de recarga', 'Hoja de datos de seguridad'],
      notes: 'Próximo a vencer certificación, programar recarga'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'alerts'>('all');
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [workerFormData, setWorkerFormData] = useState<Partial<Worker>>({
    rut: '',
    name: '',
    position: '',
    company: 'Constructora Los Andes S.A.',
    department: '',
    sector: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    contractType: 'indefinido',
    startDate: new Date().toISOString().split('T')[0],
    status: 'active',
    trainings: [],
    alertCount: 0
  });

  const [assetFormData, setAssetFormData] = useState<Partial<Asset>>({
    code: '',
    name: '',
    type: '',
    category: 'equipo',
    brand: '',
    model: '',
    serialNumber: '',
    sector: '',
    location: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    acquisitionCost: 0,
    status: 'operativo',
    condition: 'excelente',
    responsible: '',
    nextInspectionDate: '',
    lastInspectionDate: '',
    inspectionFrequency: 'mensual',
    maintenanceHistory: [],
    documents: [],
    notes: '',
    alertCount: 0
  });

  // Filtrar trabajadores
  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = 
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.rut.includes(searchTerm) ||
      worker.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterStatus === 'all' ? true :
      filterStatus === 'alerts' ? worker.alertCount > 0 :
      worker.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  // Filtrar activos
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.sector.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterStatus === 'all' ? true :
      filterStatus === 'alerts' ? asset.alertCount > 0 :
      filterStatus === 'active' ? asset.status === 'operativo' :
      filterStatus === 'inactive' ? asset.status !== 'operativo' :
      true;

    return matchesSearch && matchesFilter;
  });

  const handleCreateWorker = () => {
    setFormMode('create');
    setSelectedWorker(null);
    setWorkerFormData({
      rut: '',
      name: '',
      position: '',
      company: 'Constructora Los Andes S.A.',
      department: '',
      sector: '',
      phone: '',
      email: '',
      address: '',
      emergencyContact: '',
      emergencyPhone: '',
      contractType: 'indefinido',
      startDate: new Date().toISOString().split('T')[0],
      status: 'active',
      trainings: [],
      alertCount: 0
    });
  };

  const handleCreateAsset = () => {
    setFormMode('create');
    setSelectedAsset(null);
    setAssetFormData({
      code: '',
      name: '',
      type: '',
      category: 'equipo',
      brand: '',
      model: '',
      serialNumber: '',
      sector: '',
      location: '',
      acquisitionDate: new Date().toISOString().split('T')[0],
      acquisitionCost: 0,
      status: 'operativo',
      condition: 'excelente',
      responsible: '',
      nextInspectionDate: '',
      lastInspectionDate: '',
      inspectionFrequency: 'mensual',
      maintenanceHistory: [],
      documents: [],
      notes: '',
      alertCount: 0
    });
  };

  const handleSaveWorker = () => {
    if (!workerFormData.rut || !workerFormData.name) {
      toast.error('Por favor complete los campos obligatorios');
      return;
    }

    if (formMode === 'create') {
      const newWorker: Worker = {
        id: `W${String(workers.length + 1).padStart(3, '0')}`,
        ...workerFormData as Worker
      };
      setWorkers([...workers, newWorker]);
      toast.success('Trabajador creado exitosamente');
    } else if (formMode === 'edit' && selectedWorker) {
      setWorkers(workers.map(w => 
        w.id === selectedWorker.id ? { ...w, ...workerFormData } : w
      ));
      toast.success('Trabajador actualizado exitosamente');
    }

    setFormMode(null);
    setSelectedWorker(null);
  };

  const handleSaveAsset = () => {
    if (!assetFormData.code || !assetFormData.name || !assetFormData.type) {
      toast.error('Por favor complete los campos obligatorios');
      return;
    }

    if (formMode === 'create') {
      const newAsset: Asset = {
        id: `A${String(assets.length + 1).padStart(3, '0')}`,
        ...assetFormData as Asset
      };
      setAssets([...assets, newAsset]);
      toast.success('Activo creado exitosamente', {
        description: 'El activo está listo para inspecciones'
      });
    } else if (formMode === 'edit' && selectedAsset) {
      setAssets(assets.map(a => 
        a.id === selectedAsset.id ? { ...a, ...assetFormData } : a
      ));
      toast.success('Activo actualizado exitosamente');
    }

    setFormMode(null);
    setSelectedAsset(null);
  };

  const handleEditWorker = (worker: Worker) => {
    setFormMode('edit');
    setSelectedWorker(worker);
    setWorkerFormData(worker);
  };

  const handleEditAsset = (asset: Asset) => {
    setFormMode('edit');
    setSelectedAsset(asset);
    setAssetFormData(asset);
  };

  const handleDeleteWorker = (workerId: string) => {
    setWorkers(workers.filter(w => w.id !== workerId));
    toast.success('Trabajador eliminado');
  };

  const handleDeleteAsset = (assetId: string) => {
    setAssets(assets.filter(a => a.id !== assetId));
    toast.success('Activo eliminado');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'operativo':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Activo</Badge>;
      case 'inactive':
      case 'fuera-servicio':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Inactivo</Badge>;
      case 'mantenimiento':
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Mantenimiento</Badge>;
      case 'baja':
        return <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">Baja</Badge>;
      default:
        return null;
    }
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'excelente':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Excelente</Badge>;
      case 'bueno':
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Bueno</Badge>;
      case 'regular':
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Regular</Badge>;
      case 'malo':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Malo</Badge>;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'maquinaria':
        return <Settings className="w-4 h-4" />;
      case 'herramienta':
        return <Wrench className="w-4 h-4" />;
      case 'equipo':
        return <Package className="w-4 h-4" />;
      case 'vehiculo':
        return <MapPin className="w-4 h-4" />;
      case 'instalacion':
        return <Building2 className="w-4 h-4" />;
      default:
        return <BoxSelect className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-zinc-950 dark:via-blue-950/20 dark:to-zinc-950 pb-20 lg:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
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
                {activeTab === 'workers' ? (
                  <Users className="w-6 h-6 text-white" />
                ) : (
                  <Package className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Gestión de {activeTab === 'workers' ? 'Trabajadores' : 'Activos'}
                </h1>
                <p className="text-sm text-slate-600 dark:text-zinc-400">
                  {activeTab === 'workers' 
                    ? `${workers.length} trabajadores registrados`
                    : `${assets.length} activos en inventario`
                  }
                </p>
              </div>
            </div>

            <Button
              onClick={activeTab === 'workers' ? handleCreateWorker : handleCreateAsset}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {activeTab === 'workers' ? 'Nuevo Trabajador' : 'Nuevo Activo'}
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ManagementType)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
              <TabsTrigger value="workers" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Trabajadores</span>
              </TabsTrigger>
              <TabsTrigger value="assets" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>Activos por Sector</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Barra de búsqueda y filtros */}
        {!formMode && (
          <Card className="p-4 mb-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder={activeTab === 'workers' ? 'Buscar por nombre, RUT, cargo...' : 'Buscar por código, nombre, tipo, sector...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  Todos
                </Button>
                <Button
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('active')}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Activos
                </Button>
                <Button
                  variant={filterStatus === 'alerts' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('alerts')}
                >
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Alertas
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Lista de Trabajadores */}
        {activeTab === 'workers' && !formMode && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredWorkers.map(worker => (
              <Card
                key={worker.id}
                className="p-4 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                      <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {worker.name}
                        </h3>
                        {getStatusBadge(worker.status)}
                        {worker.alertCount > 0 && (
                          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            {worker.alertCount} alertas
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-zinc-400 mb-1">
                        {worker.position}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-zinc-500">
                        <span className="flex items-center gap-1">
                          <IdCard className="w-3 h-3" />
                          {worker.rut}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {worker.department}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {worker.sector}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEditWorker(worker)}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => handleDeleteWorker(worker.id)}
                    size="sm"
                    variant="outline"
                    className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Lista de Activos */}
        {activeTab === 'assets' && !formMode && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredAssets.map(asset => (
              <Card
                key={asset.id}
                className="p-4 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                      {getCategoryIcon(asset.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {asset.name}
                        </h3>
                        {getStatusBadge(asset.status)}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-zinc-400 mb-1">
                        {asset.type} • {asset.brand} {asset.model}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-zinc-500 mb-2">
                        <span className="flex items-center gap-1">
                          <QrCode className="w-3 h-3" />
                          {asset.code}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {asset.sector}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getConditionBadge(asset.condition)}
                        {asset.alertCount > 0 && (
                          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {asset.alertCount} alertas
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-zinc-500">Responsable:</span>
                      <p className="font-medium text-slate-900 dark:text-white">{asset.responsible}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-zinc-500">Próxima Inspección:</span>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {new Date(asset.nextInspectionDate).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEditAsset(asset)}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => toast.info('Generando código QR...')}
                    size="sm"
                    variant="outline"
                    className="text-purple-600 dark:text-purple-400"
                  >
                    <QrCode className="w-3 h-3" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteAsset(asset.id)}
                    size="sm"
                    variant="outline"
                    className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Formulario de Trabajador */}
        {activeTab === 'workers' && formMode && (
          <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {formMode === 'create' ? 'Nuevo Trabajador' : 'Editar Trabajador'}
              </h2>
              <Button
                onClick={() => setFormMode(null)}
                variant="ghost"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rut">RUT *</Label>
                    <Input
                      id="rut"
                      value={workerFormData.rut}
                      onChange={(e) => setWorkerFormData({ ...workerFormData, rut: e.target.value })}
                      placeholder="12.345.678-9"
                    />
                  </div>

                  <div>
                    <Label htmlFor="name">Nombre Completo *</Label>
                    <Input
                      id="name"
                      value={workerFormData.name}
                      onChange={(e) => setWorkerFormData({ ...workerFormData, name: e.target.value })}
                      placeholder="Juan Pérez López"
                    />
                  </div>

                  <div>
                    <Label htmlFor="position">Cargo</Label>
                    <Input
                      id="position"
                      value={workerFormData.position}
                      onChange={(e) => setWorkerFormData({ ...workerFormData, position: e.target.value })}
                      placeholder="Operador de Maquinaria"
                    />
                  </div>

                  <div>
                    <Label htmlFor="department">Departamento</Label>
                    <Input
                      id="department"
                      value={workerFormData.department}
                      onChange={(e) => setWorkerFormData({ ...workerFormData, department: e.target.value })}
                      placeholder="Operaciones"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sector">Sector</Label>
                    <Input
                      id="sector"
                      value={workerFormData.sector}
                      onChange={(e) => setWorkerFormData({ ...workerFormData, sector: e.target.value })}
                      placeholder="Obra Centro"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={workerFormData.phone}
                      onChange={(e) => setWorkerFormData({ ...workerFormData, phone: e.target.value })}
                      placeholder="+56 9 1234 5678"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={workerFormData.email}
                      onChange={(e) => setWorkerFormData({ ...workerFormData, email: e.target.value })}
                      placeholder="trabajador@empresa.cl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="startDate">Fecha de Ingreso</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={workerFormData.startDate}
                      onChange={(e) => setWorkerFormData({ ...workerFormData, startDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
                    <Input
                      id="emergencyContact"
                      value={workerFormData.emergencyContact}
                      onChange={(e) => setWorkerFormData({ ...workerFormData, emergencyContact: e.target.value })}
                      placeholder="María Pérez (Esposa)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
                    <Input
                      id="emergencyPhone"
                      value={workerFormData.emergencyPhone}
                      onChange={(e) => setWorkerFormData({ ...workerFormData, emergencyPhone: e.target.value })}
                      placeholder="+56 9 8765 4321"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={workerFormData.address}
                    onChange={(e) => setWorkerFormData({ ...workerFormData, address: e.target.value })}
                    placeholder="Av. Principal 1234, Santiago"
                  />
                </div>
              </div>
            </ScrollArea>

            <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-zinc-800">
              <Button
                onClick={() => setFormMode(null)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveWorker}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </div>
          </Card>
        )}

        {/* Formulario de Activo */}
        {activeTab === 'assets' && formMode && (
          <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {formMode === 'create' ? 'Nuevo Activo' : 'Editar Activo'}
              </h2>
              <Button
                onClick={() => setFormMode(null)}
                variant="ghost"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                {/* Información Básica */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Información Básica
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="code">Código de Activo *</Label>
                      <Input
                        id="code"
                        value={assetFormData.code}
                        onChange={(e) => setAssetFormData({ ...assetFormData, code: e.target.value })}
                        placeholder="EXC-2024-001"
                      />
                    </div>

                    <div>
                      <Label htmlFor="name">Nombre del Activo *</Label>
                      <Input
                        id="name"
                        value={assetFormData.name}
                        onChange={(e) => setAssetFormData({ ...assetFormData, name: e.target.value })}
                        placeholder="Excavadora Hidráulica"
                      />
                    </div>

                    <div>
                      <Label htmlFor="type">Tipo *</Label>
                      <Input
                        id="type"
                        value={assetFormData.type}
                        onChange={(e) => setAssetFormData({ ...assetFormData, type: e.target.value })}
                        placeholder="Excavadora"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Categoría *</Label>
                      <select
                        id="category"
                        value={assetFormData.category}
                        onChange={(e) => setAssetFormData({ ...assetFormData, category: e.target.value as any })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="maquinaria">Maquinaria</option>
                        <option value="herramienta">Herramienta</option>
                        <option value="equipo">Equipo</option>
                        <option value="vehiculo">Vehículo</option>
                        <option value="instalacion">Instalación</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="brand">Marca</Label>
                      <Input
                        id="brand"
                        value={assetFormData.brand}
                        onChange={(e) => setAssetFormData({ ...assetFormData, brand: e.target.value })}
                        placeholder="Caterpillar"
                      />
                    </div>

                    <div>
                      <Label htmlFor="model">Modelo</Label>
                      <Input
                        id="model"
                        value={assetFormData.model}
                        onChange={(e) => setAssetFormData({ ...assetFormData, model: e.target.value })}
                        placeholder="320D"
                      />
                    </div>

                    <div>
                      <Label htmlFor="serialNumber">Número de Serie</Label>
                      <Input
                        id="serialNumber"
                        value={assetFormData.serialNumber}
                        onChange={(e) => setAssetFormData({ ...assetFormData, serialNumber: e.target.value })}
                        placeholder="CAT320D2024001"
                      />
                    </div>

                    <div>
                      <Label htmlFor="acquisitionDate">Fecha de Adquisición</Label>
                      <Input
                        id="acquisitionDate"
                        type="date"
                        value={assetFormData.acquisitionDate}
                        onChange={(e) => setAssetFormData({ ...assetFormData, acquisitionDate: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="acquisitionCost">Costo de Adquisición (CLP)</Label>
                      <Input
                        id="acquisitionCost"
                        type="number"
                        value={assetFormData.acquisitionCost}
                        onChange={(e) => setAssetFormData({ ...assetFormData, acquisitionCost: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Ubicación */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Ubicación
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sector">Sector *</Label>
                      <Input
                        id="sector"
                        value={assetFormData.sector}
                        onChange={(e) => setAssetFormData({ ...assetFormData, sector: e.target.value })}
                        placeholder="Obra Centro"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Ubicación Específica</Label>
                      <Input
                        id="location"
                        value={assetFormData.location}
                        onChange={(e) => setAssetFormData({ ...assetFormData, location: e.target.value })}
                        placeholder="Patio de Maquinarias - Zona A"
                      />
                    </div>
                  </div>
                </div>

                {/* Estado y Condición */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Estado y Condición
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Estado Operativo</Label>
                      <select
                        id="status"
                        value={assetFormData.status}
                        onChange={(e) => setAssetFormData({ ...assetFormData, status: e.target.value as any })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="operativo">Operativo</option>
                        <option value="mantenimiento">En Mantenimiento</option>
                        <option value="fuera-servicio">Fuera de Servicio</option>
                        <option value="baja">Dado de Baja</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="condition">Condición Física</Label>
                      <select
                        id="condition"
                        value={assetFormData.condition}
                        onChange={(e) => setAssetFormData({ ...assetFormData, condition: e.target.value as any })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="excelente">Excelente</option>
                        <option value="bueno">Bueno</option>
                        <option value="regular">Regular</option>
                        <option value="malo">Malo</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="responsible">Responsable</Label>
                      <Input
                        id="responsible"
                        value={assetFormData.responsible}
                        onChange={(e) => setAssetFormData({ ...assetFormData, responsible: e.target.value })}
                        placeholder="Pedro Martínez López"
                      />
                    </div>
                  </div>
                </div>

                {/* Inspecciones */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    Inspecciones y Mantenimiento
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="inspectionFrequency">Frecuencia de Inspección</Label>
                      <select
                        id="inspectionFrequency"
                        value={assetFormData.inspectionFrequency}
                        onChange={(e) => setAssetFormData({ ...assetFormData, inspectionFrequency: e.target.value as any })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="semanal">Semanal</option>
                        <option value="quincenal">Quincenal</option>
                        <option value="mensual">Mensual</option>
                        <option value="trimestral">Trimestral</option>
                        <option value="semestral">Semestral</option>
                        <option value="anual">Anual</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="lastInspectionDate">Última Inspección</Label>
                      <Input
                        id="lastInspectionDate"
                        type="date"
                        value={assetFormData.lastInspectionDate}
                        onChange={(e) => setAssetFormData({ ...assetFormData, lastInspectionDate: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="nextInspectionDate">Próxima Inspección</Label>
                      <Input
                        id="nextInspectionDate"
                        type="date"
                        value={assetFormData.nextInspectionDate}
                        onChange={(e) => setAssetFormData({ ...assetFormData, nextInspectionDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Notas */}
                <div>
                  <Label htmlFor="notes">Notas y Observaciones</Label>
                  <Textarea
                    id="notes"
                    value={assetFormData.notes}
                    onChange={(e) => setAssetFormData({ ...assetFormData, notes: e.target.value })}
                    placeholder="Información adicional sobre el activo..."
                    rows={4}
                  />
                </div>
              </div>
            </ScrollArea>

            <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-zinc-800">
              <Button
                onClick={() => setFormMode(null)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveAsset}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar Activo
              </Button>
            </div>
          </Card>
        )}

        {/* Banner informativo */}
        {!formMode && (
          <Card className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-900">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 dark:bg-blue-500 flex-shrink-0">
                {activeTab === 'workers' ? (
                  <Users className="w-5 h-5 text-white" />
                ) : (
                  <Package className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1 text-sm">
                <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  {activeTab === 'workers' ? '👷 Gestión Integral de Trabajadores' : '📦 Gestión de Activos por Sector'}
                </p>
                <p className="text-blue-800 dark:text-blue-200">
                  {activeTab === 'workers' 
                    ? 'Registra y administra toda la información de tus trabajadores incluyendo capacitaciones, contactos de emergencia y asignación por sector.'
                    : 'Registra todos los activos de la empresa por sector para facilitar las inspecciones futuras. Incluye información completa como ubicación, responsable, fechas de inspección, historial de mantenimiento y condición actual.'
                  }
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
