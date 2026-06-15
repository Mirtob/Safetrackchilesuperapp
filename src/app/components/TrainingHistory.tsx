import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  FileText,
  Users,
  Download,
  Filter,
  Search,
  Calendar,
  Building2,
  User,
  ChevronDown,
  CheckCircle2,
  Clock,
  Eye,
  TrendingUp,
  BarChart3,
  FileDown,
  X,
  Shield
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Label } from '@/app/components/ui/label';
import { toast } from 'sonner';

interface TrainingRecord {
  id: string;
  type: 'talk' | 'epp' | 'induction';
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  company: string;
  branch: string;
  preventionist: string;
  workers: {
    id: string;
    name: string;
    rut: string;
    position: string;
    signed: boolean;
    signedAt?: string;
  }[];
  epps?: string[];
  status: 'completed' | 'pending' | 'cancelled';
  createdAt: string;
  documentUrl?: string;
}

interface TrainingHistoryProps {
  onBack: () => void;
}

// Datos de ejemplo
const MOCK_RECORDS: TrainingRecord[] = [
  {
    id: 'TRN-001',
    type: 'talk',
    title: 'Trabajo en Altura - Grueros',
    description: 'Charla de 5 minutos sobre procedimientos seguros en trabajo en altura',
    date: '2025-02-13',
    time: '08:30',
    location: 'Sucursal Maipú - Sector A',
    company: 'Constructora Los Andes S.A.',
    branch: 'Maipú',
    preventionist: 'Juan Pérez Silva',
    workers: [
      { id: 'W006', name: 'Roberto Díaz Morales', rut: '16.777.888-9', position: 'Gruero', signed: true, signedAt: '2025-02-13 08:35' },
      { id: 'W008', name: 'Diego Vargas Soto', rut: '18.999.000-1', position: 'Supervisor de Obra', signed: true, signedAt: '2025-02-13 08:33' }
    ],
    status: 'completed',
    createdAt: '2025-02-13T08:35:00'
  },
  {
    id: 'TRN-002',
    type: 'epp',
    title: 'Entrega EPP - Soldadores',
    description: 'Entrega de elementos de protección personal para soldadores',
    date: '2025-02-12',
    time: '09:00',
    location: 'Bodega Central',
    company: 'Constructora Los Andes S.A.',
    branch: 'Maipú',
    preventionist: 'Juan Pérez Silva',
    workers: [
      { id: 'W003', name: 'Luis Fernández Pérez', rut: '13.444.555-6', position: 'Soldador', signed: true, signedAt: '2025-02-12 09:05' }
    ],
    epps: ['Casco Dieléctrico', 'Guantes Dieléctricos', 'Lentes de Seguridad', 'Protector Solar FPS 50+'],
    status: 'completed',
    createdAt: '2025-02-12T09:05:00'
  },
  {
    id: 'TRN-003',
    type: 'talk',
    title: 'Prevención de Incendios - Personal de Bodega',
    description: 'Procedimientos de emergencia y uso de extintores',
    date: '2025-02-11',
    time: '14:00',
    location: 'Sala de Capacitación',
    company: 'Constructora Los Andes S.A.',
    branch: 'Maipú',
    preventionist: 'Juan Pérez Silva',
    workers: [
      { id: 'W007', name: 'Francisco Gómez López', rut: '17.888.999-0', position: 'Encargado de Bodega', signed: true, signedAt: '2025-02-11 14:25' },
      { id: 'W005', name: 'Manuel Torres Ruiz', rut: '15.666.777-8', position: 'Ayudante General', signed: true, signedAt: '2025-02-11 14:23' }
    ],
    status: 'completed',
    createdAt: '2025-02-11T14:25:00'
  },
  {
    id: 'TRN-004',
    type: 'induction',
    title: 'Inducción de Seguridad - Personal Nuevo Febrero',
    description: 'Inducción inicial en prevención de riesgos para personal nuevo',
    date: '2025-02-10',
    time: '10:00',
    location: 'Oficina Principal',
    company: 'Constructora Los Andes S.A.',
    branch: 'Maipú',
    preventionist: 'Juan Pérez Silva',
    workers: [
      { id: 'W001', name: 'Pedro Rojas González', rut: '12.345.678-9', position: 'Operador de Maquinaria', signed: true, signedAt: '2025-02-10 11:30' },
      { id: 'W004', name: 'Jorge Silva Campos', rut: '14.555.666-7', position: 'Electricista', signed: true, signedAt: '2025-02-10 11:28' }
    ],
    status: 'completed',
    createdAt: '2025-02-10T11:30:00'
  },
  {
    id: 'TRN-005',
    type: 'epp',
    title: 'Entrega EPP - Operadores de Maquinaria',
    description: 'Renovación de EPPs para operadores',
    date: '2025-02-09',
    time: '08:00',
    location: 'Bodega Central',
    company: 'Constructora Los Andes S.A.',
    branch: 'Maipú',
    preventionist: 'Juan Pérez Silva',
    workers: [
      { id: 'W001', name: 'Pedro Rojas González', rut: '12.345.678-9', position: 'Operador de Maquinaria', signed: true, signedAt: '2025-02-09 08:15' }
    ],
    epps: ['Casco de Obra', 'Zapatos de Seguridad', 'Chaleco Reflectante', 'Guantes de Cuero', 'Lentes de Seguridad'],
    status: 'completed',
    createdAt: '2025-02-09T08:15:00'
  }
];

const COMPANIES = ['Todas', 'Constructora Los Andes S.A.', 'Minera San José', 'Forestal del Sur'];
const BRANCHES = ['Todas', 'Maipú', 'Quilicura', 'San Bernardo', 'Puente Alto'];
const ACTIVITY_TYPES = [
  { value: 'all', label: 'Todas las Actividades', icon: '📋' },
  { value: 'talk', label: 'Charlas de 5 Min', icon: '💬' },
  { value: 'epp', label: 'Entregas de EPP', icon: '🦺' },
  { value: 'induction', label: 'Inducciones', icon: '📚' }
];

export function TrainingHistory({ onBack }: TrainingHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('Todas');
  const [selectedBranch, setSelectedBranch] = useState('Todas');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedWorker, setSelectedWorker] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TrainingRecord | null>(null);

  // Obtener lista de trabajadores únicos para filtro
  const allWorkers = useMemo(() => {
    const workersMap = new Map<string, { id: string; name: string; rut: string }>();
    MOCK_RECORDS.forEach(record => {
      record.workers.forEach(worker => {
        if (!workersMap.has(worker.id)) {
          workersMap.set(worker.id, {
            id: worker.id,
            name: worker.name,
            rut: worker.rut
          });
        }
      });
    });
    return Array.from(workersMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Filtrar registros
  const filteredRecords = useMemo(() => {
    let filtered = [...MOCK_RECORDS];

    // Filtro por empresa
    if (selectedCompany !== 'Todas') {
      filtered = filtered.filter(r => r.company === selectedCompany);
    }

    // Filtro por sucursal
    if (selectedBranch !== 'Todas') {
      filtered = filtered.filter(r => r.branch === selectedBranch);
    }

    // Filtro por tipo de actividad
    if (selectedType !== 'all') {
      filtered = filtered.filter(r => r.type === selectedType);
    }

    // Filtro por trabajador
    if (selectedWorker) {
      filtered = filtered.filter(r => 
        r.workers.some(w => w.id === selectedWorker)
      );
    }

    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term) ||
        r.id.toLowerCase().includes(term) ||
        r.workers.some(w => 
          w.name.toLowerCase().includes(term) ||
          w.rut.includes(term)
        )
      );
    }

    // Filtro por rango de fechas
    if (dateFrom) {
      filtered = filtered.filter(r => r.date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(r => r.date <= dateTo);
    }

    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [searchTerm, selectedCompany, selectedBranch, selectedType, selectedWorker, dateFrom, dateTo]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = filteredRecords.length;
    const talks = filteredRecords.filter(r => r.type === 'talk').length;
    const epps = filteredRecords.filter(r => r.type === 'epp').length;
    const inductions = filteredRecords.filter(r => r.type === 'induction').length;
    const totalWorkers = new Set(
      filteredRecords.flatMap(r => r.workers.map(w => w.id))
    ).size;

    return { total, talks, epps, inductions, totalWorkers };
  }, [filteredRecords]);

  const getTypeLabel = (type: string) => {
    const typeConfig = {
      talk: { label: 'Charla 5 Min', color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400', icon: '💬' },
      epp: { label: 'Entrega EPP', color: 'bg-green-500/20 text-green-600 dark:text-green-400', icon: '🦺' },
      induction: { label: 'Inducción', color: 'bg-purple-500/20 text-purple-600 dark:text-purple-400', icon: '📚' }
    };
    return typeConfig[type as keyof typeof typeConfig] || typeConfig.talk;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCompany('Todas');
    setSelectedBranch('Todas');
    setSelectedType('all');
    setSelectedWorker('');
    setDateFrom('');
    setDateTo('');
    toast.info('Filtros limpiados');
  };

  const handleExportAll = () => {
    toast.success('Exportando registros...', {
      description: `Generando Excel con ${filteredRecords.length} registros`
    });
    // En producción: generar Excel real
  };

  const handleExportRecord = (record: TrainingRecord) => {
    toast.success('Descargando documento PDF', {
      description: `${record.title} - ${record.id}`
    });
    // En producción: descargar PDF real
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Vista de detalle de registro
  if (selectedRecord) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-900 pb-20 lg:pb-6">
        {/* Header */}
        <div className="bg-white dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700">
          <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setSelectedRecord(null)}
                className="flex items-center gap-2 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver al Historial</span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-slate-900 dark:text-white text-xl lg:text-2xl mb-2">
                  {selectedRecord.title}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className={getTypeLabel(selectedRecord.type).color}>
                    {getTypeLabel(selectedRecord.type).icon} {getTypeLabel(selectedRecord.type).label}
                  </Badge>
                  <span className="text-sm text-slate-600 dark:text-zinc-400">
                    ID: {selectedRecord.id}
                  </span>
                </div>
              </div>
              <Button
                onClick={() => handleExportRecord(selectedRecord)}
                className="bg-[#FF8C00] hover:bg-orange-600 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
          {/* Información General */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#FF8C00]" />
                Información General
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-slate-600 dark:text-zinc-400">Fecha y Hora</Label>
                  <p className="text-slate-900 dark:text-white mt-1">
                    {formatDate(selectedRecord.date)} - {selectedRecord.time}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-600 dark:text-zinc-400">Ubicación</Label>
                  <p className="text-slate-900 dark:text-white mt-1">{selectedRecord.location}</p>
                </div>
                <div>
                  <Label className="text-slate-600 dark:text-zinc-400">Empresa</Label>
                  <p className="text-slate-900 dark:text-white mt-1">{selectedRecord.company}</p>
                </div>
                <div>
                  <Label className="text-slate-600 dark:text-zinc-400">Sucursal</Label>
                  <p className="text-slate-900 dark:text-white mt-1">{selectedRecord.branch}</p>
                </div>
                <div>
                  <Label className="text-slate-600 dark:text-zinc-400">Prevencionista</Label>
                  <p className="text-slate-900 dark:text-white mt-1">{selectedRecord.preventionist}</p>
                </div>
                <div>
                  <Label className="text-slate-600 dark:text-zinc-400">Estado</Label>
                  <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 mt-1">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Completado
                  </Badge>
                </div>
              </div>
              <div className="mt-6">
                <Label className="text-slate-600 dark:text-zinc-400">Descripción</Label>
                <p className="text-slate-900 dark:text-white mt-2">{selectedRecord.description}</p>
              </div>
            </div>
          </Card>

          {/* EPPs Entregados (si aplica) */}
          {selectedRecord.epps && selectedRecord.epps.length > 0 && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Elementos de Protección Personal Entregados
                </h2>
                <div className="flex flex-wrap gap-2">
                  {selectedRecord.epps.map((epp, index) => (
                    <Badge key={index} className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {epp}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Participantes */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0055A4]" />
                Participantes ({selectedRecord.workers.length})
              </h2>
              <div className="space-y-3">
                {selectedRecord.workers.map((worker) => (
                  <Card key={worker.id} className="bg-slate-50 dark:bg-zinc-900/50">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-slate-900 dark:text-white">
                            {worker.name}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-zinc-400 mt-1">
                            <span className="font-mono">{worker.rut}</span>
                            <span>•</span>
                            <span>{worker.position}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {worker.signed ? (
                            <Badge className="bg-green-500/20 text-green-600 dark:text-green-400">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Firmado
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400">
                              <Clock className="w-3 h-3 mr-1" />
                              Pendiente
                            </Badge>
                          )}
                        </div>
                      </div>
                      {worker.signedAt && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                          Firmado: {worker.signedAt}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-900 pb-20 lg:pb-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver</span>
            </button>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-slate-900 dark:text-white text-xl lg:text-2xl mb-2">
                Historial de Capacitaciones
              </h1>
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                Registro completo de charlas, entregas de EPP e inducciones
              </p>
            </div>
            <Button
              onClick={handleExportAll}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Exportar Todo
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-700 dark:text-blue-400 text-sm">Total</span>
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl text-blue-900 dark:text-blue-300 mb-1">{stats.total}</div>
              <Badge className="bg-blue-600/20 text-blue-700 dark:text-blue-400 border-0 text-xs">
                Actividades
              </Badge>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-700 dark:text-green-400 text-sm">Charlas</span>
                <FileText className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-2xl text-green-900 dark:text-green-300 mb-1">{stats.talks}</div>
              <Badge className="bg-green-600/20 text-green-700 dark:text-green-400 border-0 text-xs">
                5 Minutos
              </Badge>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-orange-700 dark:text-orange-400 text-sm">EPPs</span>
                <Shield className="w-4 h-4 text-[#FF8C00]" />
              </div>
              <div className="text-2xl text-orange-900 dark:text-orange-300 mb-1">{stats.epps}</div>
              <Badge className="bg-[#FF8C00]/20 text-[#FF8C00] border-0 text-xs">
                Entregas
              </Badge>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-700 dark:text-purple-400 text-sm">Inducciones</span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl text-purple-900 dark:text-purple-300 mb-1">{stats.inductions}</div>
              <Badge className="bg-purple-600/20 text-purple-700 dark:text-purple-400 border-0 text-xs">
                Completadas
              </Badge>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-slate-50 to-zinc-50 dark:from-slate-900/20 dark:to-zinc-900/20 border-slate-200 dark:border-zinc-800">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-700 dark:text-zinc-400 text-sm">Trabajadores</span>
                <TrendingUp className="w-4 h-4 text-slate-600" />
              </div>
              <div className="text-2xl text-slate-900 dark:text-zinc-300 mb-1">{stats.totalWorkers}</div>
              <Badge className="bg-slate-600/20 text-slate-700 dark:text-zinc-400 border-0 text-xs">
                Únicos
              </Badge>
            </div>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Filter className="w-5 h-5 text-[#FF8C00]" />
                Filtros
              </h2>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  size="sm"
                >
                  {showFilters ? <ChevronDown className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 rotate-180" />}
                  {showFilters ? 'Ocultar' : 'Mostrar'}
                </Button>
                {(selectedCompany !== 'Todas' || selectedBranch !== 'Todas' || selectedType !== 'all' || selectedWorker || dateFrom || dateTo || searchTerm) && (
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Limpiar
                  </Button>
                )}
              </div>
            </div>

            {/* Búsqueda rápida siempre visible */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar por título, descripción, ID, nombre o RUT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Filtro por Empresa */}
                <div>
                  <Label>Empresa</Label>
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-slate-900 dark:text-white"
                  >
                    {COMPANIES.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Sucursal */}
                <div>
                  <Label>Sucursal</Label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-slate-900 dark:text-white"
                  >
                    {BRANCHES.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Tipo */}
                <div>
                  <Label>Tipo de Actividad</Label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-slate-900 dark:text-white"
                  >
                    {ACTIVITY_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Trabajador */}
                <div>
                  <Label>Trabajador</Label>
                  <select
                    value={selectedWorker}
                    onChange={(e) => setSelectedWorker(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-slate-900 dark:text-white"
                  >
                    <option value="">Todos los Trabajadores</option>
                    {allWorkers.map(worker => (
                      <option key={worker.id} value={worker.id}>
                        {worker.name} ({worker.rut})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fecha Desde */}
                <div>
                  <Label>Desde</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Fecha Hasta */}
                <div>
                  <Label>Hasta</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Lista de Registros */}
        {filteredRecords.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-zinc-400 mb-1">
                No se encontraron registros
              </p>
              <p className="text-sm text-slate-500 dark:text-zinc-500">
                Intenta ajustar los filtros de búsqueda
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((record) => {
              const typeInfo = getTypeLabel(record.type);
              return (
                <Card key={record.id} className="hover:shadow-md transition-shadow">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <Badge className={typeInfo.color}>
                            {typeInfo.icon} {typeInfo.label}
                          </Badge>
                          <span className="text-xs text-slate-500 dark:text-zinc-500 font-mono">
                            {record.id}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                          {record.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-zinc-400 mb-3">
                          {record.description}
                        </p>
                        <div className="flex items-center gap-4 flex-wrap text-sm text-slate-600 dark:text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(record.date)} - {record.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {record.branch}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {record.workers.length} participante(s)
                          </span>
                          {record.epps && (
                            <span className="flex items-center gap-1">
                              <Shield className="w-4 h-4" />
                              {record.epps.length} EPP(s)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setSelectedRecord(record)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalle
                        </Button>
                        <Button
                          onClick={() => handleExportRecord(record)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
