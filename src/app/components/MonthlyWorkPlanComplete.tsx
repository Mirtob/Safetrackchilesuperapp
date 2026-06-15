import { useState } from 'react';
import { 
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  AlertTriangle,
  FileText,
  Send,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  Target,
  BarChart3,
  Users,
  Building2,
  FileSignature,
  Archive,
  Shield,
  Check
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ReportGenerating } from '@/app/components/ReportGenerating';
import { generateVerificationCode, generateMonthlyWorkPlanPDF, downloadPDF } from '@/app/utils/pdfGenerator';
import { toast } from 'sonner';

interface MonthlyWorkPlanCompleteProps {
  onBack: () => void;
  company?: string;
}

interface Activity {
  id: string;
  type: 'inspection' | 'training' | 'maintenance' | 'meeting' | 'drill' | 'audit' | 'other';
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  month: number; // 1-12
  year: number;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  responsible: string;
  participants?: string[];
  location?: string;
  estimatedHours?: number;
  requiredBy?: string; // Normativa
  notes?: string;
}

interface Signature {
  role: 'preventionist' | 'manager';
  name: string;
  rut: string;
  signedAt: string;
  ipAddress?: string;
}

interface MonthlyPlan {
  id: string;
  month: number;
  year: number;
  activities: Activity[];
  status: 'draft' | 'pending-signatures' | 'approved' | 'archived';
  createdAt: string;
  updatedAt: string;
  signatures: Signature[];
  sentToManagement?: boolean;
  savedToVault?: boolean;
}

type ViewMode = 'calendar' | 'list' | 'annual';
type FormMode = 'view' | 'create' | 'edit' | null;

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const ACTIVITY_TYPES = {
  inspection: { label: 'Inspección', icon: '🔍', color: 'bg-orange-100 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400' },
  training: { label: 'Capacitación', icon: '📚', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400' },
  maintenance: { label: 'Mantención', icon: '🔧', color: 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400' },
  meeting: { label: 'Reunión', icon: '👥', color: 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400' },
  drill: { label: 'Simulacro', icon: '🚨', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400' },
  audit: { label: 'Auditoría', icon: '📋', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400' },
  other: { label: 'Otro', icon: '📌', color: 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-400' }
};

export function MonthlyWorkPlanComplete({ onBack, company = 'Constructora Los Andes S.A.' }: MonthlyWorkPlanCompleteProps) {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportProgress, setReportProgress] = useState(0);
  const [reportStep, setReportStep] = useState('');

  // Mock data - Plan de trabajo con actividades
  const [monthlyPlans, setMonthlyPlans] = useState<MonthlyPlan[]>([
    {
      id: 'PLAN-2026-01',
      month: 1,
      year: 2026,
      status: 'approved',
      createdAt: '2026-01-05T10:00:00',
      updatedAt: '2026-01-15T14:30:00',
      signatures: [
        {
          role: 'preventionist',
          name: 'Juan Pérez González',
          rut: '12.345.678-9',
          signedAt: '2026-01-15T10:00:00',
          ipAddress: '192.168.1.100'
        },
        {
          role: 'manager',
          name: 'Carlos Rodríguez Silva',
          rut: '18.765.432-1',
          signedAt: '2026-01-15T14:30:00',
          ipAddress: '192.168.1.50'
        }
      ],
      sentToManagement: true,
      savedToVault: true,
      activities: [
        {
          id: 'ACT-001',
          type: 'drill',
          title: 'Simulacro de Evacuación por Sismo',
          description: 'Simulacro general de evacuación. Participación de todo el personal.',
          date: '2026-01-30',
          month: 1,
          year: 2026,
          status: 'pending',
          priority: 'high',
          responsible: 'Juan Pérez',
          participants: ['Todo el personal'],
          location: 'Todas las instalaciones',
          estimatedHours: 2,
          requiredBy: 'D.S. 594 Art. 42'
        },
        {
          id: 'ACT-002',
          type: 'training',
          title: 'Capacitación: Trabajo en Altura',
          description: 'Capacitación teórico-práctica para trabajos en altura física superior a 1.8m',
          date: '2026-01-20',
          month: 1,
          year: 2026,
          status: 'completed',
          priority: 'high',
          responsible: 'Juan Pérez',
          participants: ['Equipo de mantención', 'Supervisores'],
          location: 'Sala de capacitaciones',
          estimatedHours: 4,
          requiredBy: 'D.S. 594 Art. 11'
        },
        {
          id: 'ACT-003',
          type: 'inspection',
          title: 'Inspección Mensual de Extintores',
          description: 'Revisión visual y funcional de todos los extintores de la planta',
          date: '2026-01-15',
          month: 1,
          year: 2026,
          status: 'completed',
          priority: 'high',
          responsible: 'Juan Pérez',
          location: 'Todas las áreas',
          estimatedHours: 3,
          requiredBy: 'D.S. 594 Art. 44'
        },
        {
          id: 'ACT-004',
          type: 'meeting',
          title: 'Comité Paritario - Sesión Mensual',
          description: 'Reunión ordinaria del Comité Paritario de Higiene y Seguridad',
          date: '2026-01-10',
          month: 1,
          year: 2026,
          status: 'completed',
          priority: 'medium',
          responsible: 'Juan Pérez',
          participants: ['Comité Paritario', 'Gerencia'],
          location: 'Sala de reuniones',
          estimatedHours: 2,
          requiredBy: 'D.S. 54'
        },
        {
          id: 'ACT-005',
          type: 'maintenance',
          title: 'Mantención de Equipos de Emergencia',
          description: 'Revisión y mantención de camillas, botiquines y equipos de primeros auxilios',
          date: '2026-01-25',
          month: 1,
          year: 2026,
          status: 'in-progress',
          priority: 'medium',
          responsible: 'Ana Silva',
          location: 'Enfermería y puntos de emergencia',
          estimatedHours: 3,
          requiredBy: 'D.S. 594 Art. 43'
        }
      ]
    },
    {
      id: 'PLAN-2026-02',
      month: 2,
      year: 2026,
      status: 'draft',
      createdAt: '2026-01-20T09:00:00',
      updatedAt: '2026-01-20T09:00:00',
      signatures: [],
      sentToManagement: false,
      savedToVault: false,
      activities: [
        {
          id: 'ACT-006',
          type: 'training',
          title: 'Capacitación: Uso de EPP',
          description: 'Capacitación sobre uso correcto de equipos de protección personal',
          date: '2026-02-15',
          month: 2,
          year: 2026,
          status: 'pending',
          priority: 'high',
          responsible: 'Juan Pérez',
          estimatedHours: 3,
          requiredBy: 'D.S. 594 Art. 53'
        },
        {
          id: 'ACT-007',
          type: 'inspection',
          title: 'Inspección de Riesgos Eléctricos',
          description: 'Inspección de tableros, enchufes y sistemas eléctricos',
          date: '2026-02-20',
          month: 2,
          year: 2026,
          status: 'pending',
          priority: 'high',
          responsible: 'Juan Pérez',
          estimatedHours: 4,
          requiredBy: 'D.S. 594 Art. 261'
        }
      ]
    }
  ]);

  // Formulario de actividad
  const [formData, setFormData] = useState<Partial<Activity>>({
    type: 'inspection',
    title: '',
    description: '',
    date: '',
    status: 'pending',
    priority: 'medium',
    responsible: 'Juan Pérez',
    estimatedHours: 2
  });

  // Obtener plan actual
  const currentPlan = monthlyPlans.find(p => p.month === selectedMonth && p.year === selectedYear);

  // Obtener actividades del mes actual
  const currentActivities = currentPlan?.activities || [];

  // Filtrar actividades
  const filteredActivities = filterType === 'all' 
    ? currentActivities 
    : currentActivities.filter(a => a.type === filterType);

  // Estadísticas
  const stats = {
    total: currentActivities.length,
    completed: currentActivities.filter(a => a.status === 'completed').length,
    inProgress: currentActivities.filter(a => a.status === 'in-progress').length,
    pending: currentActivities.filter(a => a.status === 'pending').length,
    cancelled: currentActivities.filter(a => a.status === 'cancelled').length,
    completionRate: currentActivities.length > 0 
      ? Math.round((currentActivities.filter(a => a.status === 'completed').length / currentActivities.length) * 100)
      : 0
  };

  // Navegación de meses
  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // CRUD de actividades
  const handleCreateActivity = () => {
    setFormMode('create');
    setSelectedActivity(null);
    setFormData({
      type: 'inspection',
      title: '',
      description: '',
      date: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`,
      status: 'pending',
      priority: 'medium',
      responsible: 'Juan Pérez',
      estimatedHours: 2,
      month: selectedMonth,
      year: selectedYear
    });
  };

  const handleEditActivity = (activity: Activity) => {
    setFormMode('edit');
    setSelectedActivity(activity);
    setFormData(activity);
  };

  const handleViewActivity = (activity: Activity) => {
    setFormMode('view');
    setSelectedActivity(activity);
    setFormData(activity);
  };

  const handleDeleteActivity = (activity: Activity) => {
    if (confirm(`¿Eliminar la actividad "${activity.title}"?\n\nEsta acción no se puede deshacer.`)) {
      setMonthlyPlans(prev => prev.map(plan => {
        if (plan.month === selectedMonth && plan.year === selectedYear) {
          return {
            ...plan,
            activities: plan.activities.filter(a => a.id !== activity.id),
            updatedAt: new Date().toISOString()
          };
        }
        return plan;
      }));

      toast.success('✅ Actividad eliminada', {
        description: `${activity.title} ha sido eliminada del plan`
      });
    }
  };

  const handleSaveActivity = () => {
    // Validaciones
    if (!formData.title?.trim()) {
      toast.error('Título requerido');
      return;
    }
    if (!formData.date) {
      toast.error('Fecha requerida');
      return;
    }

    const activityData: Activity = {
      ...formData as Activity,
      id: formMode === 'create' ? `ACT-${Date.now()}` : selectedActivity!.id,
      month: selectedMonth,
      year: selectedYear
    };

    setMonthlyPlans(prev => {
      const existingPlanIndex = prev.findIndex(p => p.month === selectedMonth && p.year === selectedYear);

      if (existingPlanIndex >= 0) {
        // Actualizar plan existente
        const updatedPlans = [...prev];
        const plan = updatedPlans[existingPlanIndex];

        if (formMode === 'create') {
          plan.activities.push(activityData);
        } else {
          plan.activities = plan.activities.map(a => 
            a.id === activityData.id ? activityData : a
          );
        }

        plan.updatedAt = new Date().toISOString();
        return updatedPlans;
      } else {
        // Crear nuevo plan
        return [...prev, {
          id: `PLAN-${selectedYear}-${String(selectedMonth).padStart(2, '0')}`,
          month: selectedMonth,
          year: selectedYear,
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          signatures: [],
          activities: [activityData],
          sentToManagement: false,
          savedToVault: false
        }];
      }
    });

    toast.success(formMode === 'create' ? '✅ Actividad creada' : '✅ Actividad actualizada');
    setFormMode(null);
    setSelectedActivity(null);
  };

  const handleCancelForm = () => {
    setFormMode(null);
    setSelectedActivity(null);
  };

  // Firma digital
  const handleSignPlan = () => {
    if (!currentPlan) {
      toast.error('No hay plan para firmar');
      return;
    }

    if (currentActivities.length === 0) {
      toast.error('El plan debe tener al menos una actividad');
      return;
    }

    setShowSignatureModal(true);
  };

  const handleConfirmSignature = (role: 'preventionist' | 'manager') => {
    if (!currentPlan) return;

    const signature: Signature = {
      role,
      name: role === 'preventionist' ? 'Juan Pérez González' : 'Carlos Rodríguez Silva',
      rut: role === 'preventionist' ? '12.345.678-9' : '18.765.432-1',
      signedAt: new Date().toISOString(),
      ipAddress: '192.168.1.100'
    };

    setMonthlyPlans(prev => prev.map(plan => {
      if (plan.id === currentPlan.id) {
        const updatedSignatures = [...plan.signatures, signature];
        const allSigned = updatedSignatures.some(s => s.role === 'preventionist') && 
                         updatedSignatures.some(s => s.role === 'manager');

        return {
          ...plan,
          signatures: updatedSignatures,
          status: allSigned ? 'approved' : 'pending-signatures',
          updatedAt: new Date().toISOString()
        };
      }
      return plan;
    }));

    toast.success(`✅ Firma ${role === 'preventionist' ? 'del Prevencionista' : 'de Gerencia'} registrada`);
    setShowSignatureModal(false);

    // Si ambas firmas están completas, proceder con envío
    const bothSigned = currentPlan.signatures.length + 1 >= 2;
    if (bothSigned) {
      setTimeout(() => handleSendToManagement(), 1000);
    }
  };

  // Envío a gerencia y RRHH
  const handleSendToManagement = () => {
    if (!currentPlan) return;

    const hasAllSignatures = currentPlan.signatures.some(s => s.role === 'preventionist') && 
                            currentPlan.signatures.some(s => s.role === 'manager');

    if (!hasAllSignatures) {
      toast.error('Se requieren ambas firmas para enviar el plan');
      return;
    }

    // Simular envío
    setMonthlyPlans(prev => prev.map(plan => {
      if (plan.id === currentPlan.id) {
        return {
          ...plan,
          sentToManagement: true,
          savedToVault: true,
          status: 'approved'
        };
      }
      return plan;
    }));

    toast.success('📧 Plan enviado exitosamente', {
      description: `Enviado a Gerencia y RRHH. Guardado en Bóveda Documental.`,
      duration: 5000
    });

    // Mostrar detalles del envío
    setTimeout(() => {
      toast.info('✅ Detalles del envío', {
        description: `
          • Email a Gerencia
          • Copia a RRHH
          • WhatsApp a Gerencia
          • Guardado en Bóveda (con firmas)
          • Disponible en Modo Fiscalización
        `,
        duration: 6000
      });
    }, 1000);
  };

  // Exportar PDF
  const handleExportPDF = async () => {
    if (!currentPlan) {
      toast.error('No hay plan para exportar');
      return;
    }

    setIsGeneratingReport(true);
    setReportProgress(0);
    setReportStep('Iniciando generación...');

    // Simular progreso paso a paso
    const steps = [
      { progress: 10, step: 'Recopilando información del plan...' },
      { progress: 30, step: 'Procesando actividades...' },
      { progress: 50, step: 'Generando tablas y gráficos...' },
      { progress: 70, step: 'Agregando firmas digitales...' },
      { progress: 90, step: 'Finalizando documento...' },
      { progress: 100, step: 'PDF generado exitosamente' }
    ];

    try {
      // Simular el progreso
      for (const { progress, step } of steps) {
        setReportProgress(progress);
        setReportStep(step);
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      // Preparar datos para el PDF
      const verificationCode = generateVerificationCode();
      
      const pdfData = {
        month: MONTHS[selectedMonth - 1],
        year: selectedYear,
        company,
        status: currentPlan.status === 'approved' ? 'Aprobado' : 
                currentPlan.status === 'pending-signatures' ? 'Pendiente de Firmas' : 'Borrador',
        activities: currentPlan.activities,
        signatures: currentPlan.signatures,
        verificationCode
      };

      // Generar el PDF usando la función especializada
      const pdf = generateMonthlyWorkPlanPDF(pdfData);
      
      // Descargar el PDF
      const filename = `Plan_Trabajo_${MONTHS[selectedMonth - 1]}_${selectedYear}`;
      downloadPDF(pdf, filename);

      toast.success('📥 PDF generado y descargado exitosamente', {
        description: `Plan de Trabajo ${MONTHS[selectedMonth - 1]} ${selectedYear}`,
        duration: 3000
      });
    } catch (error: any) {
      toast.error('❌ Error al generar PDF', {
        description: error.message || 'Error desconocido',
        duration: 5000
      });
    } finally {
      setTimeout(() => {
        setIsGeneratingReport(false);
        setReportProgress(0);
        setReportStep('');
      }, 500);
    }
  };

  // Renderizar formulario
  if (formMode !== null) {
    const isViewMode = formMode === 'view';
    const title = formMode === 'create' ? 'Nueva Actividad' : formMode === 'edit' ? 'Editar Actividad' : 'Detalles de Actividad';

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20 lg:pb-6">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 border-b border-blue-600 dark:border-blue-700 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 pt-16 pb-4">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={handleCancelForm}
                className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
              </button>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white text-xl lg:text-2xl mb-1 font-bold">
                  {title}
                </h1>
                <p className="text-white/80 text-sm">
                  {MONTHS[selectedMonth - 1]} {selectedYear}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 lg:p-6">
          <Card className="p-6 bg-white dark:bg-zinc-900">
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Tipo de Actividad *</Label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    disabled={isViewMode}
                    className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                  >
                    {Object.entries(ACTIVITY_TYPES).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.icon} {value.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="mb-2 block">Fecha *</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    disabled={isViewMode}
                  />
                </div>

                <div className="lg:col-span-2">
                  <Label className="mb-2 block">Título *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej: Inspección mensual de extintores"
                    disabled={isViewMode}
                  />
                </div>

                <div className="lg:col-span-2">
                  <Label className="mb-2 block">Descripción</Label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe la actividad..."
                    rows={3}
                    disabled={isViewMode}
                    className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Responsable</Label>
                  <Input
                    value={formData.responsible}
                    onChange={(e) => setFormData(prev => ({ ...prev, responsible: e.target.value }))}
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Prioridad</Label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    disabled={isViewMode}
                    className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                  >
                    <option value="high">Alta</option>
                    <option value="medium">Media</option>
                    <option value="low">Baja</option>
                  </select>
                </div>

                <div>
                  <Label className="mb-2 block">Estado</Label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    disabled={isViewMode}
                    className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="in-progress">En Progreso</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>

                <div>
                  <Label className="mb-2 block">Horas Estimadas</Label>
                  <Input
                    type="number"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) }))}
                    disabled={isViewMode}
                    min="1"
                  />
                </div>

                <div className="lg:col-span-2">
                  <Label className="mb-2 block">Ubicación</Label>
                  <Input
                    value={formData.location || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Ej: Sala de capacitaciones"
                    disabled={isViewMode}
                  />
                </div>

                <div className="lg:col-span-2">
                  <Label className="mb-2 block">Normativa Aplicable</Label>
                  <Input
                    value={formData.requiredBy || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, requiredBy: e.target.value }))}
                    placeholder="Ej: D.S. 594 Art. 42"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-zinc-700">
                {!isViewMode ? (
                  <>
                    <Button onClick={handleSaveActivity} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      {formMode === 'create' ? 'Crear Actividad' : 'Guardar Cambios'}
                    </Button>
                    <Button onClick={handleCancelForm} variant="outline" className="flex-1">
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => setFormMode('edit')} className="flex-1">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button onClick={handleCancelForm} variant="outline" className="flex-1">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Volver
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20 lg:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 border-b border-blue-600 dark:border-blue-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver</span>
            </button>

            <div className="flex gap-2">
              <Button
                onClick={handleExportPDF}
                size="sm"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-1" />
                Exportar PDF
              </Button>
              <Button
                onClick={handleSignPlan}
                size="sm"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                disabled={!currentPlan || currentActivities.length === 0}
              >
                <FileSignature className="w-4 h-4 mr-1" />
                Firmar Plan
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-white text-xl lg:text-2xl mb-1 font-bold">
                📅 Plan de Trabajo Mensual
              </h1>
              <p className="text-white/80 text-sm">
                {company}
              </p>
            </div>
          </div>

          {/* Navegación de meses */}
          <div className="flex items-center justify-between bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <button
              onClick={handlePreviousMonth}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            <div className="text-center">
              <div className="text-white font-bold text-lg">
                {MONTHS[selectedMonth - 1]} {selectedYear}
              </div>
              {currentPlan && (
                <div className="flex items-center justify-center gap-2 mt-1">
                  {currentPlan.status === 'approved' && (
                    <Badge className="bg-green-600 text-white border-0 text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Aprobado
                    </Badge>
                  )}
                  {currentPlan.status === 'pending-signatures' && (
                    <Badge className="bg-amber-600 text-white border-0 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      Pendiente Firmas
                    </Badge>
                  )}
                  {currentPlan.status === 'draft' && (
                    <Badge className="bg-slate-600 text-white border-0 text-xs">
                      <FileText className="w-3 h-3 mr-1" />
                      Borrador
                    </Badge>
                  )}
                  {currentPlan.savedToVault && (
                    <Badge className="bg-purple-600 text-white border-0 text-xs">
                      <Archive className="w-3 h-3 mr-1" />
                      En Bóveda
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleNextMonth}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                viewMode === 'calendar'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Vista Calendario
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-1" />
              Vista Lista
            </button>
            <button
              onClick={() => setViewMode('annual')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                viewMode === 'annual'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-1" />
              Proyección Anual
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4 bg-white dark:bg-zinc-900">
            <div className="text-sm text-slate-600 dark:text-zinc-400 mb-1">Total</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
          </Card>
          <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <div className="text-sm text-green-800 dark:text-green-300 mb-1">Completadas</div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.completed}</div>
          </Card>
          <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <div className="text-sm text-blue-800 dark:text-blue-300 mb-1">En Progreso</div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.inProgress}</div>
          </Card>
          <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <div className="text-sm text-amber-800 dark:text-amber-300 mb-1">Pendientes</div>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{stats.pending}</div>
          </Card>
          <Card className="p-4 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
            <div className="text-sm text-purple-800 dark:text-purple-300 mb-1">Cumplimiento</div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.completionRate}%</div>
          </Card>
        </div>

        {/* Información de Firmas */}
        {currentPlan && currentPlan.signatures.length > 0 && (
          <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
            <div className="flex items-start gap-3">
              <FileSignature className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  ✅ Plan Firmado Digitalmente
                </h3>
                <div className="space-y-2">
                  {currentPlan.signatures.map((sig, index) => (
                    <div key={index} className="text-sm text-green-800 dark:text-green-300">
                      <Check className="w-4 h-4 inline mr-1" />
                      <strong>{sig.role === 'preventionist' ? 'Prevencionista:' : 'Gerencia:'}</strong> {sig.name} • {new Date(sig.signedAt).toLocaleString('es-CL')}
                    </div>
                  ))}
                </div>
                {currentPlan.savedToVault && (
                  <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                    <Archive className="w-4 h-4 inline mr-1" />
                    Guardado en Bóveda Documental • Disponible en Modo Fiscalización
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Botón Agregar + Filtros */}
        <div className="flex flex-col lg:flex-row gap-4">
          <Button onClick={handleCreateActivity} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Actividad
          </Button>

          <div className="flex gap-2 flex-wrap flex-1">
            <Button
              onClick={() => setFilterType('all')}
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
            >
              Todas ({stats.total})
            </Button>
            {Object.entries(ACTIVITY_TYPES).map(([key, value]) => {
              const count = currentActivities.filter(a => a.type === key).length;
              if (count === 0) return null;
              return (
                <Button
                  key={key}
                  onClick={() => setFilterType(key)}
                  variant={filterType === key ? 'default' : 'outline'}
                  size="sm"
                >
                  {value.icon} {value.label} ({count})
                </Button>
              );
            })}
          </div>
        </div>

        {/* Vista Calendario */}
        {viewMode === 'calendar' && (
          <div className="space-y-3">
            {filteredActivities.length === 0 ? (
              <Card className="p-12 text-center bg-white dark:bg-zinc-900">
                <Calendar className="w-16 h-16 text-slate-300 dark:text-zinc-600 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-zinc-400 mb-4">
                  No hay actividades planificadas para este mes
                </p>
                <Button onClick={handleCreateActivity}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Primera Actividad
                </Button>
              </Card>
            ) : (
              filteredActivities.map((activity) => {
                const typeInfo = ACTIVITY_TYPES[activity.type];
                return (
                  <Card key={activity.id} className="p-4 bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex-shrink-0">
                        <span className="text-2xl">{typeInfo.icon}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                              {activity.title}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-zinc-400">
                              {activity.description}
                            </p>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Badge className={typeInfo.color}>
                              {typeInfo.label}
                            </Badge>
                            <Badge className={
                              activity.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-0' :
                              activity.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border-0' :
                              activity.status === 'cancelled' ? 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border-0' :
                              'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-0'
                            }>
                              {activity.status === 'completed' ? 'Completada' :
                               activity.status === 'in-progress' ? 'En Progreso' :
                               activity.status === 'cancelled' ? 'Cancelada' :
                               'Pendiente'}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 text-sm mb-3">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(activity.date).toLocaleDateString('es-CL')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                            <Users className="w-4 h-4" />
                            <span>{activity.responsible}</span>
                          </div>
                          {activity.estimatedHours && (
                            <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                              <Clock className="w-4 h-4" />
                              <span>{activity.estimatedHours}h estimadas</span>
                            </div>
                          )}
                        </div>

                        {activity.requiredBy && (
                          <div className="mb-3 text-xs text-slate-500 dark:text-zinc-500">
                            <Shield className="w-3 h-3 inline mr-1" />
                            {activity.requiredBy}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button onClick={() => handleViewActivity(activity)} size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                          <Button onClick={() => handleEditActivity(activity)} size="sm" variant="outline">
                            <Edit2 className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            onClick={() => handleDeleteActivity(activity)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/20"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Vista Lista */}
        {viewMode === 'list' && (
          <Card className="bg-white dark:bg-zinc-900">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 dark:border-zinc-700">
                  <tr className="text-left">
                    <th className="p-4 text-sm font-semibold text-slate-900 dark:text-white">Fecha</th>
                    <th className="p-4 text-sm font-semibold text-slate-900 dark:text-white">Actividad</th>
                    <th className="p-4 text-sm font-semibold text-slate-900 dark:text-white">Tipo</th>
                    <th className="p-4 text-sm font-semibold text-slate-900 dark:text-white">Responsable</th>
                    <th className="p-4 text-sm font-semibold text-slate-900 dark:text-white">Estado</th>
                    <th className="p-4 text-sm font-semibold text-slate-900 dark:text-white">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivities.map((activity) => {
                    const typeInfo = ACTIVITY_TYPES[activity.type];
                    return (
                      <tr key={activity.id} className="border-b border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                        <td className="p-4 text-sm text-slate-900 dark:text-white">
                          {new Date(activity.date).toLocaleDateString('es-CL')}
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-slate-900 dark:text-white">{activity.title}</div>
                          <div className="text-xs text-slate-600 dark:text-zinc-400">{activity.description}</div>
                        </td>
                        <td className="p-4">
                          <Badge className={typeInfo.color}>
                            {typeInfo.icon} {typeInfo.label}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-slate-900 dark:text-white">{activity.responsible}</td>
                        <td className="p-4">
                          <Badge className={
                            activity.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-0' :
                            activity.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border-0' :
                            activity.status === 'cancelled' ? 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border-0' :
                            'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-0'
                          }>
                            {activity.status === 'completed' ? '✅ Completada' :
                             activity.status === 'in-progress' ? '⏳ En Progreso' :
                             activity.status === 'cancelled' ? '❌ Cancelada' :
                             '⏸️ Pendiente'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button onClick={() => handleViewActivity(activity)} className="text-blue-600 hover:text-blue-700">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleEditActivity(activity)} className="text-slate-600 hover:text-slate-700">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteActivity(activity)} className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Vista Proyección Anual */}
        {viewMode === 'annual' && (
          <div className="space-y-4">
            <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
              <div className="flex items-start gap-3">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    📊 Proyección Anual {selectedYear}
                  </h3>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Resumen de actividades planificadas para todo el año
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {MONTHS.map((monthName, index) => {
                const monthNum = index + 1;
                const planForMonth = monthlyPlans.find(p => p.month === monthNum && p.year === selectedYear);
                const activitiesCount = planForMonth?.activities.length || 0;
                const completedCount = planForMonth?.activities.filter(a => a.status === 'completed').length || 0;
                const completionRate = activitiesCount > 0 ? Math.round((completedCount / activitiesCount) * 100) : 0;

                return (
                  <Card
                    key={monthNum}
                    className={`p-4 cursor-pointer transition-all ${
                      monthNum === selectedMonth
                        ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700'
                        : 'bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800'
                    }`}
                    onClick={() => {
                      setSelectedMonth(monthNum);
                      setViewMode('calendar');
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                          {monthName}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-zinc-400">
                          {activitiesCount} actividades
                        </p>
                      </div>
                      {planForMonth?.status === 'approved' && (
                        <Badge className="bg-green-600 text-white border-0 text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          OK
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-zinc-400">Completitud</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{completionRate}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-green-600"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>

                    {planForMonth && planForMonth.savedToVault && (
                      <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                        <Archive className="w-3 h-3 inline mr-1" />
                        En Bóveda
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Firma */}
      {showSignatureModal && currentPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6 bg-white dark:bg-zinc-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Firmar Plan de Trabajo
              </h3>
              <button
                onClick={() => setShowSignatureModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                Plan: <strong>{MONTHS[selectedMonth - 1]} {selectedYear}</strong><br />
                Actividades: <strong>{currentActivities.length}</strong>
              </p>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      Prevencionista de Riesgos
                    </span>
                    {currentPlan.signatures.some(s => s.role === 'preventionist') ? (
                      <Badge className="bg-green-600 text-white border-0">
                        <Check className="w-3 h-3 mr-1" />
                        Firmado
                      </Badge>
                    ) : (
                      <Button
                        onClick={() => handleConfirmSignature('preventionist')}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <FileSignature className="w-3 h-3 mr-1" />
                        Firmar
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">
                    Juan Pérez González • RUT: 12.345.678-9
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      Gerencia
                    </span>
                    {currentPlan.signatures.some(s => s.role === 'manager') ? (
                      <Badge className="bg-green-600 text-white border-0">
                        <Check className="w-3 h-3 mr-1" />
                        Firmado
                      </Badge>
                    ) : (
                      <Button
                        onClick={() => handleConfirmSignature('manager')}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <FileSignature className="w-3 h-3 mr-1" />
                        Firmar
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">
                    Carlos Rodríguez Silva • RUT: 18.765.432-1
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-zinc-700">
                <p className="text-xs text-slate-500 dark:text-zinc-500 mb-3">
                  ⚠️ Al firmar este documento, usted certifica que el plan de trabajo ha sido revisado y aprobado.
                </p>
                <Button
                  onClick={() => setShowSignatureModal(false)}
                  variant="outline"
                  className="w-full"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Generación de Reporte */}
      {isGeneratingReport && (
        <ReportGenerating
          progress={reportProgress}
          step={reportStep}
          onClose={() => setIsGeneratingReport(false)}
        />
      )}
    </div>
  );
}