import { useState, useEffect } from 'react';
import {
  fetchIncidentsForCompanies,
  fetchIncidentActions,
  createIncidentAction,
  updateIncidentActionStatus,
  fetchIncidentMedicalRecords,
  createIncidentMedicalRecord,
} from '@/app/services/incidentsService';
import { isSupabaseConfigured } from '@/app/services/supabase';
import {
  ArrowLeft, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  User,
  Calendar,
  Activity,
  Stethoscope,
  Briefcase,
  HardHat,
  MessageSquare,
  Camera,
  TrendingUp,
  Filter,
  Download,
  Edit,
  X,
  ChevronDown,
  Building2,
  Users,
  Shield
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { toast } from 'sonner';

interface IncidentFollowUpProps {
  onBack: () => void;
  companyId?: string;
  initialIncidentId?: string;
}

interface Incident {
  id: string;
  code: string;
  type: 'accident' | 'incident';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  sector: string;
  date: string;
  reportedBy: string;
  affectedPersons: string[];
  status: 'open' | 'investigating' | 'corrective-actions' | 'monitoring' | 'closed';
  daysOpen: number;
}

interface Action {
  id: string;
  incidentId: string;
  type: 'medical' | 'investigation' | 'corrective' | 'preventive' | 'training' | 'infrastructure' | 'communication' | 'other';
  title: string;
  description: string;
  responsible: string;
  deadline: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  completedAt?: string;
  evidence?: string[];
  notes?: string;
}

interface MedicalRecord {
  id: string;
  incidentId: string;
  workerName: string;
  injuryType: string;
  injurySeverity: 'leve' | 'moderada' | 'grave' | 'fatal';
  medicalAttention: 'primeros-auxilios' | 'centro-medico' | 'hospital' | 'mutualidad' | 'no-requerida';
  diagnosis: string;
  treatment: string;
  medicalLeave: boolean;
  leaveDays?: number;
  leaveStartDate?: string;
  leaveEndDate?: string;
  workRestrictions?: string;
  followUpRequired: boolean;
  nextCheckup?: string;
  createdAt: string;
}

const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'INC-001',
    code: 'ACC-2025-001',
    type: 'accident',
    title: 'Trabajador golpeado por material mal apilado',
    description: 'Durante el almacenamiento de materiales en Bodega A, un trabajador fue golpeado en el hombro por cajas que cayeron de una altura de 2 metros.',
    severity: 'high',
    sector: 'Bodega A',
    date: '2025-01-15T10:30:00',
    reportedBy: 'Juan Pérez Silva',
    affectedPersons: ['Pedro Rojas González'],
    status: 'investigating',
    daysOpen: 13
  },
  {
    id: 'INC-002',
    code: 'INC-2025-002',
    type: 'incident',
    title: 'Casi accidente con montacargas',
    description: 'Operador de montacargas estuvo cerca de colisionar con trabajador que no respetó zona de circulación.',
    severity: 'medium',
    sector: 'Área de Producción',
    date: '2025-01-20T14:15:00',
    reportedBy: 'María Soto Díaz',
    affectedPersons: [],
    status: 'corrective-actions',
    daysOpen: 8
  },
  {
    id: 'INC-003',
    code: 'INC-2025-003',
    type: 'incident',
    title: 'Derrame menor de aceite',
    description: 'Pequeño derrame de aceite hidráulico en zona de mantención.',
    severity: 'low',
    sector: 'Taller de Mantención',
    date: '2025-01-25T09:00:00',
    reportedBy: 'Carlos Torres Muñoz',
    affectedPersons: [],
    status: 'monitoring',
    daysOpen: 3
  }
];

const ACTION_TYPES = [
  { id: 'medical', name: 'Atención Médica', icon: '🏥', color: 'red' },
  { id: 'investigation', name: 'Investigación', icon: '🔍', color: 'blue' },
  { id: 'corrective', name: 'Acción Correctiva', icon: '🔧', color: 'orange' },
  { id: 'preventive', name: 'Acción Preventiva', icon: '🛡️', color: 'green' },
  { id: 'training', name: 'Capacitación', icon: '👥', color: 'purple' },
  { id: 'infrastructure', name: 'Mejora Infraestructura', icon: '🏗️', color: 'indigo' },
  { id: 'communication', name: 'Comunicación', icon: '📢', color: 'cyan' },
  { id: 'other', name: 'Otro', icon: '📋', color: 'slate' }
];

const INCIDENT_STATUS_CONFIG = {
  open: { label: 'Abierto', color: 'bg-red-600', icon: '🔴' },
  investigating: { label: 'En Investigación', color: 'bg-blue-600', icon: '🔍' },
  'corrective-actions': { label: 'Acciones Correctivas', color: 'bg-orange-600', icon: '🔧' },
  monitoring: { label: 'En Monitoreo', color: 'bg-yellow-600', icon: '👁️' },
  closed: { label: 'Cerrado', color: 'bg-green-600', icon: '✅' }
};

const MOCK_ACTIONS: Action[] = [
  {
    id: 'ACT-001',
    incidentId: 'INC-001',
    type: 'medical',
    title: 'Evaluación médica inicial',
    description: 'Trabajador derivado a mutualidad para evaluación de lesión en hombro',
    responsible: 'Mutual de Seguridad',
    deadline: '2025-01-15T16:00:00',
    status: 'completed',
    priority: 'urgent',
    createdAt: '2025-01-15T10:45:00',
    completedAt: '2025-01-15T15:30:00'
  },
  {
    id: 'ACT-002',
    incidentId: 'INC-001',
    type: 'investigation',
    title: 'Investigación de causas raíz',
    description: 'Entrevistas con testigos y análisis de condiciones de apilamiento',
    responsible: 'Juan Pérez Silva',
    deadline: '2025-01-20T17:00:00',
    status: 'in-progress',
    priority: 'high',
    createdAt: '2025-01-15T11:00:00'
  },
  {
    id: 'ACT-003',
    incidentId: 'INC-001',
    type: 'corrective',
    title: 'Reestiba de materiales',
    description: 'Reorganizar bodega con sistema de estanterías seguras',
    responsible: 'Supervisor Bodega',
    deadline: '2025-01-30T17:00:00',
    status: 'pending',
    priority: 'high',
    createdAt: '2025-01-15T12:00:00'
  }
];

const MOCK_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: 'MED-001',
    incidentId: 'INC-001',
    workerName: 'Pedro Rojas González',
    injuryType: 'Contusión hombro derecho',
    injurySeverity: 'moderada',
    medicalAttention: 'mutualidad',
    diagnosis: 'Contusión muscular hombro derecho, sin fractura',
    treatment: 'Reposo relativo, antiinflamatorios, fisioterapia',
    medicalLeave: true,
    leaveDays: 7,
    leaveStartDate: '2025-01-16',
    leaveEndDate: '2025-01-23',
    workRestrictions: 'No levantar objetos sobre 5kg por 2 semanas',
    followUpRequired: true,
    nextCheckup: '2025-01-30',
    createdAt: '2025-01-15T15:30:00'
  }
];

export function IncidentFollowUp({ onBack, companyId, initialIncidentId }: IncidentFollowUpProps) {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const canPersist = Boolean(isSupabaseConfigured && companyId);

  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadIncidents = async () => {
      setIsLoadingIncidents(true);
      if (!canPersist) {
        if (!cancelled) setIncidents(MOCK_INCIDENTS);
        if (!cancelled) setIsLoadingIncidents(false);
        return;
      }
      try {
        const data = await fetchIncidentsForCompanies([companyId!]);
        if (!cancelled) {
          setIncidents(data.map((inc): Incident => ({
            id: inc.id,
            code: inc.code,
            type: inc.type,
            title: inc.title,
            description: inc.description,
            severity: inc.severity,
            sector: inc.sector,
            date: inc.date,
            reportedBy: inc.reportedBy,
            affectedPersons: inc.affectedPersons,
            status: inc.status,
            daysOpen: inc.daysOpen,
          })));
        }
      } catch (err: any) {
        console.warn('No se pudo cargar incidentes desde Supabase:', err.message);
        if (!cancelled) setIncidents(MOCK_INCIDENTS);
      } finally {
        if (!cancelled) setIsLoadingIncidents(false);
      }
    };
    loadIncidents();
    return () => { cancelled = true; };
  }, [companyId, canPersist]);

  useEffect(() => {
    if (initialIncidentId && incidents.length > 0 && !selectedIncident) {
      const match = incidents.find(i => i.id === initialIncidentId);
      if (match) setSelectedIncident(match);
    }
  }, [initialIncidentId, incidents]);

  const [actions, setActions] = useState<Action[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);

  useEffect(() => {
    let cancelled = false;
    const loadIncidentDetail = async () => {
      if (!selectedIncident) return;
      if (!canPersist) {
        if (!cancelled) {
          setActions(MOCK_ACTIONS.filter(a => a.incidentId === selectedIncident.id));
          setMedicalRecords(MOCK_MEDICAL_RECORDS.filter(m => m.incidentId === selectedIncident.id));
        }
        return;
      }
      try {
        const [actionsData, medicalData] = await Promise.all([
          fetchIncidentActions(selectedIncident.id),
          fetchIncidentMedicalRecords(selectedIncident.id),
        ]);
        if (!cancelled) {
          setActions(actionsData);
          setMedicalRecords(medicalData);
        }
      } catch (err: any) {
        toast.error('No se pudo cargar el detalle del incidente', { description: err.message });
      }
    };
    loadIncidentDetail();
    return () => { cancelled = true; };
  }, [selectedIncident, canPersist]);

  const [newAction, setNewAction] = useState({
    type: 'corrective',
    title: '',
    description: '',
    responsible: '',
    deadline: new Date().toISOString().split('T')[0],
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });

  const [newMedicalRecord, setNewMedicalRecord] = useState({
    workerName: '',
    injuryType: '',
    injurySeverity: 'leve' as 'leve' | 'moderada' | 'grave' | 'fatal',
    medicalAttention: 'primeros-auxilios' as 'primeros-auxilios' | 'centro-medico' | 'hospital' | 'mutualidad' | 'no-requerida',
    diagnosis: '',
    treatment: '',
    medicalLeave: false,
    leaveDays: 0,
    leaveStartDate: '',
    leaveEndDate: '',
    workRestrictions: '',
    followUpRequired: false,
    nextCheckup: ''
  });

  const filteredIncidents = incidents.filter(incident => {
    if (filterStatus !== 'all' && incident.status !== filterStatus) return false;
    if (filterType !== 'all' && incident.type !== filterType) return false;
    return true;
  });

  const getIncidentActions = (incidentId: string) => {
    return actions.filter(action => action.incidentId === incidentId);
  };

  const getIncidentMedicalRecords = (incidentId: string) => {
    return medicalRecords.filter(record => record.incidentId === incidentId);
  };

  const handleAddAction = async () => {
    if (!selectedIncident) return;

    if (!newAction.title || !newAction.responsible) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    try {
      let action: Action;
      if (canPersist) {
        action = await createIncidentAction(selectedIncident.id, newAction as Action);
      } else {
        action = {
          id: `ACT-${Date.now()}`,
          incidentId: selectedIncident.id,
          ...newAction,
          status: 'pending',
          createdAt: new Date().toISOString()
        };
      }

      setActions([...actions, action]);
      setShowActionModal(false);
      setNewAction({
        type: 'corrective',
        title: '',
        description: '',
        responsible: '',
        deadline: new Date().toISOString().split('T')[0],
        priority: 'medium'
      });

      toast.success('✅ Acción agregada exitosamente', {
        description: `${action.title} - Responsable: ${action.responsible}`
      });
    } catch (err: any) {
      toast.error('Error al agregar la acción', { description: err.message });
    }
  };

  const handleAddMedicalRecord = async () => {
    if (!selectedIncident) return;

    if (!newMedicalRecord.workerName || !newMedicalRecord.injuryType) {
      toast.error('Completa los campos obligatorios');
      return;
    }

    try {
      let record: MedicalRecord;
      if (canPersist) {
        record = await createIncidentMedicalRecord(selectedIncident.id, newMedicalRecord);
      } else {
        record = {
          id: `MED-${Date.now()}`,
          incidentId: selectedIncident.id,
          ...newMedicalRecord,
          createdAt: new Date().toISOString()
        };
      }

      setMedicalRecords([...medicalRecords, record]);
      setShowMedicalModal(false);
      setNewMedicalRecord({
        workerName: '',
        injuryType: '',
        injurySeverity: 'leve',
        medicalAttention: 'primeros-auxilios',
        diagnosis: '',
        treatment: '',
        medicalLeave: false,
        leaveDays: 0,
        leaveStartDate: '',
        leaveEndDate: '',
        workRestrictions: '',
        followUpRequired: false,
        nextCheckup: ''
      });

      toast.success('🏥 Registro médico agregado exitosamente');
    } catch (err: any) {
      toast.error('Error al agregar el registro médico', { description: err.message });
    }
  };

  const handleUpdateActionStatus = async (actionId: string, newStatus: Action['status']) => {
    try {
      if (canPersist) {
        await updateIncidentActionStatus(actionId, newStatus);
      }
      setActions(actions.map(action =>
        action.id === actionId
          ? {
              ...action,
              status: newStatus,
              completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
            }
          : action
      ));
    } catch (err: any) {
      toast.error('Error al actualizar la acción', { description: err.message });
      return;
    }

    const statusLabels = {
      pending: 'Pendiente',
      'in-progress': 'En Progreso',
      completed: 'Completada',
      cancelled: 'Cancelada'
    };

    toast.success(`Estado actualizado a: ${statusLabels[newStatus]}`);
  };

  const calculateProgress = (incident: Incident) => {
    const incidentActions = getIncidentActions(incident.id);
    if (incidentActions.length === 0) return 0;
    
    const completed = incidentActions.filter(a => a.status === 'completed').length;
    return Math.round((completed / incidentActions.length) * 100);
  };

  // Vista de lista de incidentes
  if (!selectedIncident) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors pb-20 lg:pb-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-zinc-900 dark:to-zinc-800 border-b border-slate-600 dark:border-zinc-700">
          <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
              </button>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-white text-xl lg:text-2xl mb-1 font-bold">
                  Gestión de Incidentes/Accidentes
                </h1>
                <p className="text-white/80 text-sm">
                  Seguimiento, investigación y acciones correctivas
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-red-700 dark:text-red-400 text-xs font-medium">Abiertos</span>
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-red-900 dark:text-red-300">
                  {incidents.filter(i => i.status === 'open' || i.status === 'investigating').length}
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-700 dark:text-blue-400 text-xs font-medium">En Proceso</span>
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                  {incidents.filter(i => i.status === 'corrective-actions' || i.status === 'monitoring').length}
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-700 dark:text-green-400 text-xs font-medium">Cerrados</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-900 dark:text-green-300">
                  {incidents.filter(i => i.status === 'closed').length}
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-700 dark:text-purple-400 text-xs font-medium">Total Mes</span>
                  <FileText className="w-4 h-4 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                  {incidents.length}
                </div>
              </div>
            </Card>
          </div>

          {/* Filtros */}
          <Card className="p-4 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
                <span className="text-sm font-medium text-slate-900 dark:text-white">Filtros:</span>
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-slate-900 dark:text-white"
              >
                <option value="all">Todos los estados</option>
                <option value="open">Abierto</option>
                <option value="investigating">En Investigación</option>
                <option value="corrective-actions">Acciones Correctivas</option>
                <option value="monitoring">En Monitoreo</option>
                <option value="closed">Cerrado</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-slate-900 dark:text-white"
              >
                <option value="all">Todos los tipos</option>
                <option value="accident">Accidentes</option>
                <option value="incident">Incidentes</option>
              </select>

              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </Card>

          {/* Lista de incidentes */}
          {isLoadingIncidents && (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Clock className="w-5 h-5 mr-2 animate-spin" />
              Cargando incidentes...
            </div>
          )}
          <div className="space-y-4">
            {!isLoadingIncidents && filteredIncidents.map(incident => {
              const progress = calculateProgress(incident);
              const incidentActions = getIncidentActions(incident.id);
              const medicalRecords = getIncidentMedicalRecords(incident.id);
              
              return (
                <Card 
                  key={incident.id}
                  className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedIncident(incident)}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge 
                            className={`${INCIDENT_STATUS_CONFIG[incident.status].color} text-white border-0`}
                          >
                            {INCIDENT_STATUS_CONFIG[incident.status].icon} {INCIDENT_STATUS_CONFIG[incident.status].label}
                          </Badge>
                          
                          <Badge variant="outline" className="font-mono text-xs">
                            {incident.code}
                          </Badge>

                          <Badge 
                            className={incident.type === 'accident' ? 'bg-red-600 text-white' : 'bg-orange-600 text-white'}
                          >
                            {incident.type === 'accident' ? '🚑 Accidente' : '⚠️ Incidente'}
                          </Badge>

                          {medicalRecords.length > 0 && (
                            <Badge className="bg-blue-600 text-white">
                              🏥 Con atención médica
                            </Badge>
                          )}
                        </div>

                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                          {incident.title}
                        </h3>

                        <p className="text-sm text-slate-600 dark:text-zinc-400 mb-3">
                          {incident.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {incident.sector}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(incident.date).toLocaleDateString('es-CL')}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {incident.reportedBy}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {incident.daysOpen} días abierto
                          </span>
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {progress}%
                        </div>
                        <div className="text-xs text-slate-600 dark:text-zinc-400">
                          {incidentActions.filter(a => a.status === 'completed').length}/{incidentActions.length} acciones
                        </div>
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-2 mb-3">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Acciones rápidas */}
                    <div className="flex gap-2 text-xs">
                      {incidentActions.filter(a => a.status === 'pending').length > 0 && (
                        <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400">
                          {incidentActions.filter(a => a.status === 'pending').length} pendiente(s)
                        </Badge>
                      )}
                      {incidentActions.filter(a => a.status === 'in-progress').length > 0 && (
                        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400">
                          {incidentActions.filter(a => a.status === 'in-progress').length} en proceso
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Vista de detalle de incidente
  const incidentActions = getIncidentActions(selectedIncident.id);
  const incidentMedicalRecords = getIncidentMedicalRecords(selectedIncident.id);
  const progress = calculateProgress(selectedIncident);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors pb-20 lg:pb-6">
      {/* Header del detalle */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-zinc-900 dark:to-zinc-800 border-b border-slate-600 dark:border-zinc-700">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setSelectedIncident(null)}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver a la lista</span>
            </button>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge 
                  className={`${INCIDENT_STATUS_CONFIG[selectedIncident.status].color} text-white border-0`}
                >
                  {INCIDENT_STATUS_CONFIG[selectedIncident.status].icon} {INCIDENT_STATUS_CONFIG[selectedIncident.status].label}
                </Badge>
                
                <Badge variant="outline" className="font-mono bg-white/20 text-white border-white/30">
                  {selectedIncident.code}
                </Badge>

                <Badge 
                  className={selectedIncident.type === 'accident' ? 'bg-red-600 text-white' : 'bg-orange-600 text-white'}
                >
                  {selectedIncident.type === 'accident' ? '🚑 Accidente Laboral' : '⚠️ Incidente'}
                </Badge>
              </div>

              <h1 className="text-white text-xl lg:text-2xl mb-2 font-bold">
                {selectedIncident.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {selectedIncident.sector}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedIncident.date).toLocaleDateString('es-CL', { 
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedIncident.daysOpen} días abierto
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-4xl font-bold text-white mb-1">
                {progress}%
              </div>
              <div className="text-sm text-white/80">
                Progreso general
              </div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-white/20 rounded-full h-3 mt-4">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Descripción */}
        <Card className="p-5 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Descripción del Incidente
          </h2>
          <p className="text-slate-700 dark:text-zinc-300">
            {selectedIncident.description}
          </p>
          
          {selectedIncident.affectedPersons.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  Personas Afectadas:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedIncident.affectedPersons.map((person, index) => (
                  <Badge key={index} variant="outline">
                    {person}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Botones de acción rápida */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Button
            onClick={() => setShowMedicalModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white h-auto py-4"
          >
            <Stethoscope className="w-5 h-5 mr-2" />
            <div className="text-left">
              <div className="font-semibold">Atención Médica</div>
              <div className="text-xs opacity-90">Registrar atención</div>
            </div>
          </Button>

          <Button
            onClick={() => {
              setNewAction({ ...newAction, type: 'investigation' });
              setShowActionModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white h-auto py-4"
          >
            <HardHat className="w-5 h-5 mr-2" />
            <div className="text-left">
              <div className="font-semibold">Investigación</div>
              <div className="text-xs opacity-90">Analizar causas</div>
            </div>
          </Button>

          <Button
            onClick={() => {
              setNewAction({ ...newAction, type: 'corrective' });
              setShowActionModal(true);
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white h-auto py-4"
          >
            <Shield className="w-5 h-5 mr-2" />
            <div className="text-left">
              <div className="font-semibold">Acción Correctiva</div>
              <div className="text-xs opacity-90">Corregir problema</div>
            </div>
          </Button>

          <Button
            onClick={() => setShowActionModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white h-auto py-4"
          >
            <Plus className="w-5 h-5 mr-2" />
            <div className="text-left">
              <div className="font-semibold">Otra Acción</div>
              <div className="text-xs opacity-90">Agregar tarea</div>
            </div>
          </Button>
        </div>

        {/* Registros Médicos */}
        {incidentMedicalRecords.length > 0 && (
          <Card className="p-5 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-red-600" />
              Registros Médicos ({incidentMedicalRecords.length})
            </h2>

            <div className="space-y-4">
              {incidentMedicalRecords.map(record => (
                <Card key={record.id} className="p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                        {record.workerName}
                      </h3>
                      <div className="flex gap-2 mb-2">
                        <Badge className={
                          record.injurySeverity === 'fatal' ? 'bg-black text-white' :
                          record.injurySeverity === 'grave' ? 'bg-red-600 text-white' :
                          record.injurySeverity === 'moderada' ? 'bg-orange-600 text-white' :
                          'bg-yellow-600 text-white'
                        }>
                          {record.injurySeverity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {record.injuryType}
                        </Badge>
                      </div>
                    </div>
                    <Badge className="bg-blue-600 text-white">
                      {record.medicalAttention === 'primeros-auxilios' ? '🩹 Primeros Auxilios' :
                       record.medicalAttention === 'centro-medico' ? '🏥 Centro Médico' :
                       record.medicalAttention === 'hospital' ? '🚑 Hospital' :
                       record.medicalAttention === 'mutualidad' ? '⚕️ Mutualidad' :
                       '❌ No Requerida'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-slate-700 dark:text-zinc-300">Diagnóstico:</span>
                      <p className="text-slate-600 dark:text-zinc-400">{record.diagnosis}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700 dark:text-zinc-300">Tratamiento:</span>
                      <p className="text-slate-600 dark:text-zinc-400">{record.treatment}</p>
                    </div>
                  </div>

                  {record.medicalLeave && (
                    <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-red-900 dark:text-red-300">
                          Licencia Médica: {record.leaveDays} días
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-400">
                        Desde {new Date(record.leaveStartDate!).toLocaleDateString('es-CL')} hasta {new Date(record.leaveEndDate!).toLocaleDateString('es-CL')}
                      </p>
                      {record.workRestrictions && (
                        <p className="text-xs text-orange-700 dark:text-orange-400 mt-2">
                          ⚠️ Restricciones: {record.workRestrictions}
                        </p>
                      )}
                    </div>
                  )}

                  {record.followUpRequired && (
                    <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
                      <p className="text-xs text-blue-700 dark:text-blue-400">
                        📅 Próximo control: {new Date(record.nextCheckup!).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Timeline de Acciones */}
        <Card className="p-5 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Acciones y Seguimiento ({incidentActions.length})
          </h2>

          {incidentActions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-zinc-400">
              No hay acciones registradas aún. Agrega la primera acción.
            </div>
          ) : (
            <div className="space-y-4">
              {incidentActions
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((action, index) => {
                  const actionType = ACTION_TYPES.find(t => t.id === action.type);
                  const isLast = index === incidentActions.length - 1;

                  return (
                    <div key={action.id} className="flex gap-4">
                      {/* Timeline line */}
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                          action.status === 'completed' ? 'bg-green-100 dark:bg-green-950/20' :
                          action.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-950/20' :
                          action.status === 'cancelled' ? 'bg-gray-100 dark:bg-gray-950/20' :
                          'bg-yellow-100 dark:bg-yellow-950/20'
                        }`}>
                          {actionType?.icon}
                        </div>
                        {!isLast && (
                          <div className="w-0.5 flex-1 bg-slate-200 dark:bg-zinc-800 min-h-[40px]" />
                        )}
                      </div>

                      {/* Action content */}
                      <Card className="flex-1 p-4 bg-slate-50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-900 dark:text-white">
                                {action.title}
                              </h3>
                              <Badge 
                                variant="outline"
                                className={
                                  action.status === 'completed' ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-600' :
                                  action.status === 'in-progress' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-600' :
                                  action.status === 'cancelled' ? 'bg-gray-50 dark:bg-gray-950/20 text-gray-700 dark:text-gray-400 border-gray-600' :
                                  'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border-yellow-600'
                                }
                              >
                                {action.status === 'completed' ? '✅ Completada' :
                                 action.status === 'in-progress' ? '🔄 En Progreso' :
                                 action.status === 'cancelled' ? '❌ Cancelada' :
                                 '⏳ Pendiente'}
                              </Badge>
                              <Badge 
                                variant="outline"
                                className={
                                  action.priority === 'urgent' ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-600' :
                                  action.priority === 'high' ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border-orange-600' :
                                  action.priority === 'medium' ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-600' :
                                  'bg-slate-50 dark:bg-slate-950/20 text-slate-700 dark:text-slate-400 border-slate-600'
                                }
                              >
                                {action.priority === 'urgent' ? '🚨 Urgente' :
                                 action.priority === 'high' ? '⚡ Alta' :
                                 action.priority === 'medium' ? '🔵 Media' :
                                 '🟢 Baja'}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-zinc-400 mb-2">
                              {action.description}
                            </p>
                            <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-zinc-400">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                Responsable: {action.responsible}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Plazo: {new Date(action.deadline).toLocaleDateString('es-CL')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Creada: {new Date(action.createdAt).toLocaleDateString('es-CL')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {action.status !== 'completed' && action.status !== 'cancelled' && (
                          <div className="flex gap-2 mt-3">
                            {action.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateActionStatus(action.id, 'in-progress')}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                              >
                                Iniciar
                              </Button>
                            )}
                            {(action.status === 'pending' || action.status === 'in-progress') && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateActionStatus(action.id, 'completed')}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs"
                              >
                                ✓ Completar
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateActionStatus(action.id, 'cancelled')}
                              className="text-xs"
                            >
                              Cancelar
                            </Button>
                          </div>
                        )}

                        {action.completedAt && (
                          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
                            <p className="text-xs text-green-600 dark:text-green-400">
                              ✅ Completada el {new Date(action.completedAt).toLocaleDateString('es-CL')} a las {new Date(action.completedAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        )}
                      </Card>
                    </div>
                  );
                })}
            </div>
          )}
        </Card>
      </div>

      {/* Modal: Agregar Acción */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="w-full max-w-2xl bg-white dark:bg-zinc-900 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Nueva Acción de Seguimiento
                </h2>
                <button
                  onClick={() => setShowActionModal(false)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Tipo de Acción *</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {ACTION_TYPES.map(type => (
                      <button
                        key={type.id}
                        onClick={() => setNewAction({ ...newAction, type: type.id as any })}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          newAction.type === type.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                            : 'border-slate-200 dark:border-zinc-800 hover:border-blue-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{type.icon}</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {type.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="action-title">Título *</Label>
                  <Input
                    id="action-title"
                    value={newAction.title}
                    onChange={(e) => setNewAction({ ...newAction, title: e.target.value })}
                    placeholder="Ej: Instalación de barandas de seguridad"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="action-description">Descripción</Label>
                  <Textarea
                    id="action-description"
                    value={newAction.description}
                    onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
                    placeholder="Describe en detalle la acción a realizar..."
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="action-responsible">Responsable *</Label>
                    <Input
                      id="action-responsible"
                      value={newAction.responsible}
                      onChange={(e) => setNewAction({ ...newAction, responsible: e.target.value })}
                      placeholder="Nombre del responsable"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="action-deadline">Plazo *</Label>
                    <Input
                      id="action-deadline"
                      type="date"
                      value={newAction.deadline}
                      onChange={(e) => setNewAction({ ...newAction, deadline: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label>Prioridad</Label>
                  <div className="grid grid-cols-4 gap-3 mt-2">
                    {[
                      { value: 'low', label: 'Baja', color: 'slate' },
                      { value: 'medium', label: 'Media', color: 'blue' },
                      { value: 'high', label: 'Alta', color: 'orange' },
                      { value: 'urgent', label: 'Urgente', color: 'red' }
                    ].map(priority => (
                      <button
                        key={priority.value}
                        onClick={() => setNewAction({ ...newAction, priority: priority.value as any })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          newAction.priority === priority.value
                            ? `border-${priority.color}-500 bg-${priority.color}-50 dark:bg-${priority.color}-950/20`
                            : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {priority.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleAddAction}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Acción
                </Button>
                <Button
                  onClick={() => setShowActionModal(false)}
                  variant="outline"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal: Registro Médico */}
      {showMedicalModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="w-full max-w-3xl bg-white dark:bg-zinc-900 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Stethoscope className="w-6 h-6 text-red-600" />
                  Registro de Atención Médica
                </h2>
                <button
                  onClick={() => setShowMedicalModal(false)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="med-worker">Trabajador Afectado *</Label>
                    <Input
                      id="med-worker"
                      value={newMedicalRecord.workerName}
                      onChange={(e) => setNewMedicalRecord({ ...newMedicalRecord, workerName: e.target.value })}
                      placeholder="Nombre completo"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="med-injury">Tipo de Lesión *</Label>
                    <Input
                      id="med-injury"
                      value={newMedicalRecord.injuryType}
                      onChange={(e) => setNewMedicalRecord({ ...newMedicalRecord, injuryType: e.target.value })}
                      placeholder="Ej: Contusión, Fractura, Corte"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Gravedad de la Lesión</Label>
                    <select
                      value={newMedicalRecord.injurySeverity}
                      onChange={(e) => setNewMedicalRecord({ ...newMedicalRecord, injurySeverity: e.target.value as any })}
                      className="w-full mt-2 px-3 py-2 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white"
                    >
                      <option value="leve">Leve</option>
                      <option value="moderada">Moderada</option>
                      <option value="grave">Grave</option>
                      <option value="fatal">Fatal</option>
                    </select>
                  </div>

                  <div>
                    <Label>Tipo de Atención Médica</Label>
                    <select
                      value={newMedicalRecord.medicalAttention}
                      onChange={(e) => setNewMedicalRecord({ ...newMedicalRecord, medicalAttention: e.target.value as any })}
                      className="w-full mt-2 px-3 py-2 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-900 dark:text-white"
                    >
                      <option value="no-requerida">No Requerida</option>
                      <option value="primeros-auxilios">Primeros Auxilios</option>
                      <option value="centro-medico">Centro Médico</option>
                      <option value="hospital">Hospital</option>
                      <option value="mutualidad">Mutualidad</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="med-diagnosis">Diagnóstico</Label>
                  <Textarea
                    id="med-diagnosis"
                    value={newMedicalRecord.diagnosis}
                    onChange={(e) => setNewMedicalRecord({ ...newMedicalRecord, diagnosis: e.target.value })}
                    placeholder="Diagnóstico médico detallado..."
                    rows={2}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="med-treatment">Tratamiento</Label>
                  <Textarea
                    id="med-treatment"
                    value={newMedicalRecord.treatment}
                    onChange={(e) => setNewMedicalRecord({ ...newMedicalRecord, treatment: e.target.value })}
                    placeholder="Tratamiento indicado..."
                    rows={2}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center gap-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <input
                    type="checkbox"
                    id="med-leave"
                    checked={newMedicalRecord.medicalLeave}
                    onChange={(e) => setNewMedicalRecord({ ...newMedicalRecord, medicalLeave: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <Label htmlFor="med-leave" className="cursor-pointer">
                    ¿Requiere Licencia Médica?
                  </Label>
                </div>

                {newMedicalRecord.medicalLeave && (
                  <div className="grid grid-cols-3 gap-4 p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
                    <div>
                      <Label htmlFor="med-days">Días de Licencia</Label>
                      <Input
                        id="med-days"
                        type="number"
                        min="1"
                        value={newMedicalRecord.leaveDays}
                        onChange={(e) => setNewMedicalRecord({ ...newMedicalRecord, leaveDays: parseInt(e.target.value) || 0 })}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="med-start">Fecha Inicio</Label>
                      <Input
                        id="med-start"
                        type="date"
                        value={newMedicalRecord.leaveStartDate}
                        onChange={(e) => setNewMedicalRecord({ ...newMedicalRecord, leaveStartDate: e.target.value })}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="med-end">Fecha Fin</Label>
                      <Input
                        id="med-end"
                        type="date"
                        value={newMedicalRecord.leaveEndDate}
                        onChange={(e) => setNewMedicalRecord({ ...newMedicalRecord, leaveEndDate: e.target.value })}
                        className="mt-2"
                      />
                    </div>

                    <div className="col-span-3">
                      <Label htmlFor="med-restrictions">Restricciones Laborales</Label>
                      <Input
                        id="med-restrictions"
                        value={newMedicalRecord.workRestrictions}
                        onChange={(e) => setNewMedicalRecord({ ...newMedicalRecord, workRestrictions: e.target.value })}
                        placeholder="Ej: No levantar peso, No trabajar en altura"
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <input
                    type="checkbox"
                    id="med-followup"
                    checked={newMedicalRecord.followUpRequired}
                    onChange={(e) => setNewMedicalRecord({ ...newMedicalRecord, followUpRequired: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <Label htmlFor="med-followup" className="cursor-pointer">
                    ¿Requiere Control Médico de Seguimiento?
                  </Label>
                </div>

                {newMedicalRecord.followUpRequired && (
                  <div>
                    <Label htmlFor="med-checkup">Fecha Próximo Control</Label>
                    <Input
                      id="med-checkup"
                      type="date"
                      value={newMedicalRecord.nextCheckup}
                      onChange={(e) => setNewMedicalRecord({ ...newMedicalRecord, nextCheckup: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleAddMedicalRecord}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Guardar Registro Médico
                </Button>
                <Button
                  onClick={() => setShowMedicalModal(false)}
                  variant="outline"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
