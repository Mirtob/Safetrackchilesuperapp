import { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Users,
  CheckCircle2,
  Pencil,
  Save,
  UserPlus,
  FileText,
  AlertCircle,
  Clock,
  MapPin,
  Calendar,
  ChevronDown,
  Shield
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { DocumentPreviewAndSend } from '@/app/components/DocumentPreviewAndSend';
import { RecurrenceScheduler, RecurrenceData } from '@/app/components/RecurrenceScheduler';
import { GroupedWorkerSelector } from '@/app/components/GroupedWorkerSelector';
import { WorkerGroupManager } from '@/app/components/WorkerGroupManager';
import { toast } from 'sonner';
import { createSafetyTalkWithSignatures } from '@/app/services/safetyTalksService';
import { isSupabaseConfigured } from '@/app/services/supabase';

interface TalkAndDeliveryProps {
  onBack: () => void;
  type: 'talk' | 'epp' | 'induction';
  companyId?: string;
  companyName?: string;
  branchId?: string;
}

interface Worker {
  id: string;
  rut: string;
  name: string;
  position: string;
  company: string;
  phone: string;
  email: string;
  signed: boolean;
  signedAt?: string;
  signature?: string;
  groupId?: string; // Grupo asignado
}

interface WorkerGroup {
  id: string;
  name: string;
  color: string;
  icon: string;
  count?: number;
}

// Tipos de charla disponibles
const TALK_TYPES = [
  { value: 'trabajo-altura', label: 'Trabajo en Altura' },
  { value: 'espacios-confinados', label: 'Espacios Confinados' },
  { value: 'riesgo-electrico', label: 'Riesgo Eléctrico' },
  { value: 'manejo-sustancias', label: 'Manejo de Sustancias Peligrosas' },
  { value: 'prevencion-incendios', label: 'Prevención de Incendios' },
  { value: 'uso-epp', label: 'Uso Correcto de EPP' },
  { value: 'ergonomia', label: 'Ergonomía y Manejo Manual de Cargas' },
  { value: 'bloqueo-etiquetado', label: 'Bloqueo y Etiquetado (LOTO)' },
  { value: 'orden-limpieza', label: 'Orden y Limpieza (5S)' },
  { value: 'primeros-auxilios', label: 'Primeros Auxilios Básicos' }
];

// Catálogo de EPPs disponibles
const EPP_CATALOG = [
  // Protección de Cabeza
  { id: 'casco-obra', name: 'Casco de Obra', category: 'Protección de Cabeza', icon: '🪖' },
  { id: 'casco-diel', name: 'Casco Dieléctrico', category: 'Protección de Cabeza', icon: '⚡' },
  
  // Protección Ocular
  { id: 'lentes-seg', name: 'Lentes de Seguridad', category: 'Protección Ocular', icon: '🥽' },
  { id: 'antiparra', name: 'Antiparras', category: 'Protección Ocular', icon: '👓' },
  
  // Protección de Manos
  { id: 'guantes-cuero', name: 'Guantes de Cuero', category: 'Protección de Manos', icon: '🧤' },
  { id: 'guantes-diel', name: 'Guantes Dieléctricos', category: 'Protección de Manos', icon: '⚡' },
  { id: 'guantes-quim', name: 'Guantes Químicos', category: 'Protección de Manos', icon: '🧪' },
  
  // Protección de Pies
  { id: 'zapatos-seg', name: 'Zapatos de Seguridad', category: 'Protección de Pies', icon: '👞' },
  { id: 'botas-diel', name: 'Botas Dieléctricas', category: 'Protección de Pies', icon: '👢' },
  { id: 'botas-minera', name: 'Botas Mineras', category: 'Protección de Pies', icon: '⛏️' },
  
  // Protección Respiratoria
  { id: 'respirador-media', name: 'Respirador Media Cara', category: 'Protección Respiratoria', icon: '😷' },
  { id: 'respirador-cara', name: 'Respirador Cara Completa', category: 'Protección Respiratoria', icon: '🎭' },
  { id: 'mascarilla', name: 'Mascarilla Desechable', category: 'Protección Respiratoria', icon: '😷' },
  
  // Protección Auditiva
  { id: 'tapones-aud', name: 'Tapones Auditivos', category: 'Protección Auditiva', icon: '👂' },
  { id: 'fonos-aud', name: 'Fonos de Copa', category: 'Protección Auditiva', icon: '🎧' },
  
  // Protección Corporal
  { id: 'chaleco-ref', name: 'Chaleco Reflectante', category: 'Protección Corporal', icon: '🦺' },
  { id: 'overol', name: 'Overol de Trabajo', category: 'Protección Corporal', icon: '👔' },
  { id: 'arnes', name: 'Arnés de Seguridad', category: 'Protección Corporal', icon: '🪢' },
  
  // Protección Solar
  { id: 'protector-sol', name: 'Protector Solar FPS 50+', category: 'Protección Solar', icon: '☀️' },
  { id: 'jockey-legionario', name: 'Jockey Legionario', category: 'Protección Solar', icon: '🧢' }
];

export function TalkAndDelivery({ onBack, type, companyId, companyName, branchId }: TalkAndDeliveryProps) {
  const [selectedTalkType, setSelectedTalkType] = useState(TALK_TYPES[0].value);
  const [showTalkTypeDropdown, setShowTalkTypeDropdown] = useState(false);
  const [selectedEPPs, setSelectedEPPs] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: 'Sucursal Maipú - Av. Pajaritos 1234',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5) // Hora actual en formato HH:MM
  });

  const [showWorkerSelector, setShowWorkerSelector] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showRecurrenceModal, setShowRecurrenceModal] = useState(false);
  const [showGroupManager, setShowGroupManager] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Grupos de trabajadores personalizables
  const [workerGroups, setWorkerGroups] = useState<WorkerGroup[]>([
    { id: 'supervisores', name: 'Supervisores', color: 'bg-purple-100 dark:bg-purple-950/20', icon: '👨‍💼' },
    { id: 'operarios', name: 'Operarios de Maquinaria', color: 'bg-blue-100 dark:bg-blue-950/20', icon: '🚜' },
    { id: 'bodega', name: 'Personal de Bodega', color: 'bg-green-100 dark:bg-green-950/20', icon: '📦' },
    { id: 'grueros', name: 'Grueros', color: 'bg-orange-100 dark:bg-orange-950/20', icon: '🏗️' },
    { id: 'mantencion', name: 'Mantención', color: 'bg-cyan-100 dark:bg-cyan-950/20', icon: '🔧' },
    { id: 'soldadores', name: 'Soldadores', color: 'bg-red-100 dark:bg-red-950/20', icon: '⚡' }
  ]);

  // Base de datos de trabajadores con grupos asignados (en producción vendría del componente WorkerManagement)
  const availableWorkers: Worker[] = [
    {
      id: 'W001',
      rut: '12.345.678-9',
      name: 'Pedro Rojas González',
      position: 'Operador de Maquinaria',
      company: 'Constructora Los Andes S.A.',
      phone: '9 1234 5678',
      email: 'pedro.rojas@constructoraandes.cl',
      signed: false,
      groupId: 'operarios'
    },
    {
      id: 'W002',
      rut: '11.222.333-4',
      name: 'Carlos Muñoz Soto',
      position: 'Maestro Albañil',
      company: 'Constructora Los Andes S.A.',
      phone: '9 8765 4321',
      email: 'carlos.munoz@constructoraandes.cl',
      signed: false,
      groupId: 'supervisores'
    },
    {
      id: 'W003',
      rut: '13.444.555-6',
      name: 'Luis Fernández Pérez',
      position: 'Soldador',
      company: 'Constructora Los Andes S.A.',
      phone: '9 5555 5555',
      email: 'luis.fernandez@constructoraandes.cl',
      signed: false,
      groupId: 'soldadores'
    },
    {
      id: 'W004',
      rut: '14.555.666-7',
      name: 'Jorge Silva Campos',
      position: 'Electricista',
      company: 'Constructora Los Andes S.A.',
      phone: '9 4444 4444',
      email: 'jorge.silva@constructoraandes.cl',
      signed: false,
      groupId: 'mantencion'
    },
    {
      id: 'W005',
      rut: '15.666.777-8',
      name: 'Manuel Torres Ruiz',
      position: 'Ayudante General',
      company: 'Constructora Los Andes S.A.',
      phone: '9 3333 3333',
      email: 'manuel.torres@constructoraandes.cl',
      signed: false
    },
    {
      id: 'W006',
      rut: '16.777.888-9',
      name: 'Roberto Díaz Morales',
      position: 'Gruero',
      company: 'Constructora Los Andes S.A.',
      phone: '9 2222 2222',
      email: 'roberto.diaz@constructoraandes.cl',
      signed: false,
      groupId: 'grueros'
    },
    {
      id: 'W007',
      rut: '17.888.999-0',
      name: 'Francisco Gómez López',
      position: 'Encargado de Bodega',
      company: 'Constructora Los Andes S.A.',
      phone: '9 1111 1111',
      email: 'francisco.gomez@constructoraandes.cl',
      signed: false,
      groupId: 'bodega'
    },
    {
      id: 'W008',
      rut: '18.999.000-1',
      name: 'Diego Vargas Soto',
      position: 'Supervisor de Obra',
      company: 'Constructora Los Andes S.A.',
      phone: '9 9999 9999',
      email: 'diego.vargas@constructoraandes.cl',
      signed: false,
      groupId: 'supervisores'
    }
  ];

  const [selectedWorkers, setSelectedWorkers] = useState<Worker[]>([]);

  const titles = {
    talk: 'Charla de 5 Minutos',
    epp: 'Entrega de EPP',
    induction: 'Inducción de Seguridad'
  };

  const descriptions = {
    talk: 'Registro de asistencia y firma digital de participantes',
    epp: 'Registro de entrega de elementos de protección personal',
    induction: 'Registro de inducción inicial en prevención de riesgos'
  };

  const toggleWorkerSelection = (worker: Worker) => {
    const exists = selectedWorkers.find(w => w.id === worker.id);
    if (exists) {
      setSelectedWorkers(selectedWorkers.filter(w => w.id !== worker.id));
    } else {
      setSelectedWorkers([...selectedWorkers, worker]);
    }
  };

  const selectAllWorkers = () => {
    if (selectedWorkers.length === availableWorkers.length) {
      setSelectedWorkers([]);
    } else {
      setSelectedWorkers([...availableWorkers]);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const signatureDataUrl = canvas.toDataURL();
    
    if (showSignatureModal) {
      setSelectedWorkers(workers => 
        workers.map(w => 
          w.id === showSignatureModal 
            ? { ...w, signed: true, signedAt: new Date().toLocaleString('es-CL'), signature: signatureDataUrl }
            : w
        )
      );
      
      toast.success('Firma registrada exitosamente');
      setShowSignatureModal(null);
      clearSignature();
    }
  };

  const handleSubmit = () => {
    if (!formData.title || selectedWorkers.length === 0) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    const unsignedWorkers = selectedWorkers.filter(w => !w.signed);
    if (unsignedWorkers.length > 0) {
      toast.error(`Faltan ${unsignedWorkers.length} firma(s)`, {
        description: 'Todos los trabajadores deben firmar el documento.'
      });
      return;
    }

    // Mostrar previsualización del documento
    setShowPreview(true);
  };

  const handleApproveAndSend = async (workers: Worker[]) => {
    if (companyId && isSupabaseConfigured) {
      try {
        await createSafetyTalkWithSignatures(
          {
            companyId,
            branchId,
            title: formData.title,
            topic: type === 'talk' ? TALK_TYPES.find(t => t.value === selectedTalkType)?.label : type,
            talkType: type,
            talkDate: formData.date,
            location: formData.location,
            eppItems: type === 'epp' ? selectedEPPs : undefined,
          },
          workers.filter(w => w.signature).map(w => ({
            workerId: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(w.id) ? w.id : undefined,
            workerName: w.name,
            workerRut: w.rut,
            signatureData: w.signature!,
          }))
        );
      } catch (err: any) {
        toast.error('Error al guardar en la base de datos', { description: err.message });
        return;
      }
    } else {
      // Sin Supabase configurado: solo simula el guardado (modo demo)
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    toast.success('✅ Proceso completado exitosamente', {
      description: 'Documento guardado y enviado a todos los destinatarios'
    });
    
    // Cerrar preview y mostrar modal de recurrencia
    setShowPreview(false);
    setTimeout(() => {
      setShowRecurrenceModal(true);
    }, 500);
  };

  const handleRecurrenceConfirm = (recurrenceData: RecurrenceData) => {
    console.log('Recurrencia programada:', recurrenceData);
    
    // Calcular todas las fechas futuras
    const scheduledDates = calculateScheduledDates(recurrenceData);
    
    toast.success('🤖 Agenda auto-alimentada exitosamente', {
      description: `${scheduledDates.length} tareas programadas automáticamente`,
      duration: 4000
    });

    // En producción: guardar en calendario y plan de trabajo
    setTimeout(() => {
      toast.info('📅 Tareas agregadas al calendario', {
        description: 'Las actividades aparecerán en tu plan de trabajo mensual',
        duration: 3000
      });
    }, 1000);
    
    setShowRecurrenceModal(false);
    
    // Volver al field action center
    setTimeout(() => {
      onBack();
    }, 2000);
  };

  const handleRecurrenceSkip = () => {
    toast.info('Actividad guardada sin programación', {
      description: 'Podrás programar repeticiones desde el calendario'
    });
    
    setShowRecurrenceModal(false);
    
    // Volver al field action center
    setTimeout(() => {
      onBack();
    }, 1500);
  };

  const calculateScheduledDates = (recurrence: RecurrenceData): Date[] => {
    const dates: Date[] = [];
    const now = new Date();
    
    for (let i = 1; i <= recurrence.totalOccurrences!; i++) {
      const nextDate = new Date(now);
      
      switch (recurrence.intervalUnit) {
        case 'days':
          nextDate.setDate(now.getDate() + (recurrence.intervalValue * i));
          break;
        case 'weeks':
          nextDate.setDate(now.getDate() + (recurrence.intervalValue * 7 * i));
          break;
        case 'months':
          nextDate.setMonth(now.getMonth() + (recurrence.intervalValue * i));
          break;
        case 'years':
          nextDate.setFullYear(now.getFullYear() + (recurrence.intervalValue * i));
          break;
      }
      
      dates.push(nextDate);
    }
    
    return dates;
  };

  const handleEditDocument = () => {
    setShowPreview(false);
    toast.info('Editando documento', {
      description: 'Realiza los cambios necesarios antes de enviar'
    });
  };

  const handleCancelPreview = () => {
    setShowPreview(false);
    toast.info('Vista previa cancelada');
  };

  const signedCount = selectedWorkers.filter(w => w.signed).length;
  const pendingCount = selectedWorkers.length - signedCount;

  // Si está en modo previsualización, mostrar el componente de preview
  if (showPreview) {
    return (
      <DocumentPreviewAndSend
        documentType={titles[type]}
        documentTitle={formData.title}
        company="Constructora Los Andes S.A."
        workers={selectedWorkers}
        documentData={{
          ...formData,
          content: formData.description,
          preventionist: 'Juan Pérez Silva',
          branch: 'Sucursal Maipú',
          location: formData.location || 'Sucursal Maipú - Av. Pajaritos 1234',
          gps: '-33.4489, -70.6693',
          selectedEPPs: type === 'epp' ? selectedEPPs : undefined,
          eppCatalog: type === 'epp' ? EPP_CATALOG : undefined
        }}
        onClose={() => setShowPreview(false)}
        onSendComplete={() => {
          setShowPreview(false);
          
          // Mostrar modal de recurrencia después del envío
          setTimeout(() => {
            setShowRecurrenceModal(true);
          }, 500);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-900 transition-colors pb-20 lg:pb-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
              </button>
              <div className="flex-1">
                {/* Título con selector de tipo de charla */}
                {type === 'talk' ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowTalkTypeDropdown(!showTalkTypeDropdown)}
                      className="flex items-center gap-2 text-slate-900 dark:text-white text-xl lg:text-2xl hover:text-[#FF8C00] dark:hover:text-[#FF8C00] transition-colors group"
                    >
                      <span>{TALK_TYPES.find(t => t.value === selectedTalkType)?.label || 'Seleccionar tipo'}</span>
                      <ChevronDown className={`w-5 h-5 transition-transform ${showTalkTypeDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">{descriptions[type]}</p>
                    
                    {/* Dropdown de tipos de charla */}
                    {showTalkTypeDropdown && (
                      <>
                        {/* Overlay para cerrar el dropdown */}
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowTalkTypeDropdown(false)}
                        />
                        
                        <div className="absolute top-full left-0 mt-2 w-full max-w-md bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg shadow-xl z-20 overflow-hidden">
                          <div className="max-h-96 overflow-y-auto">
                            {TALK_TYPES.map((talkType) => (
                              <button
                                key={talkType.value}
                                onClick={() => {
                                  setSelectedTalkType(talkType.value);
                                  setShowTalkTypeDropdown(false);
                                  toast.success(`Tipo de charla: ${talkType.label}`);
                                }}
                                className={`w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors ${
                                  selectedTalkType === talkType.value 
                                    ? 'bg-[#FF8C00]/10 text-[#FF8C00] border-l-4 border-[#FF8C00]' 
                                    : 'text-slate-900 dark:text-white'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{talkType.label}</span>
                                  {selectedTalkType === talkType.value && (
                                    <CheckCircle2 className="w-4 h-4 text-[#FF8C00]" />
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div>
                    <h1 className="text-slate-900 dark:text-white text-xl lg:text-2xl">{titles[type]}</h1>
                    <p className="text-sm text-slate-600 dark:text-zinc-400">{descriptions[type]}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-700 dark:text-blue-400 text-sm">Participantes</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl text-blue-900 dark:text-blue-300 mb-1">{selectedWorkers.length}</div>
              <Badge className="bg-blue-600/20 text-blue-700 dark:text-blue-400 border-0 text-xs">
                Seleccionados
              </Badge>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-700 dark:text-green-400 text-sm">Firmados</span>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-3xl text-green-900 dark:text-green-300 mb-1">{signedCount}</div>
              <Badge className="bg-green-600/20 text-green-700 dark:text-green-400 border-0 text-xs">
                Completados
              </Badge>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-orange-700 dark:text-orange-400 text-sm">Pendientes</span>
                <Clock className="w-4 h-4 text-[#FF8C00]" />
              </div>
              <div className="text-3xl text-orange-900 dark:text-orange-300 mb-1">{pendingCount}</div>
              <Badge className="bg-[#FF8C00]/20 text-[#FF8C00] border-0 text-xs">
                Sin firmar
              </Badge>
            </div>
          </Card>
        </div>

        {/* Información del Documento */}
        <Card className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
          <div className="p-5">
            <h2 className="text-slate-900 dark:text-white text-lg mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#FF8C00] rounded-full" />
              Información del Documento
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Grupo de Trabajadores *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder={`Ej: ${type === 'talk' ? 'Grueros, Operadores de Bodega, Montacarguistas' : type === 'epp' ? 'Soldadores, Personal de Mantención' : 'Personal Nuevo - Enero 2025'}`}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="date">Fecha</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="time">Hora</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe los temas tratados, equipos entregados o contenido de la inducción..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="location">Ubicación</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Checklist de EPPs - Solo visible cuando type === 'epp' */}
        {type === 'epp' && (
          <Card className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-slate-900 dark:text-white text-lg flex items-center gap-2">
                  <span className="w-1 h-6 bg-green-600 rounded-full" />
                  Elementos de Protección Personal
                </h2>
                <Badge className="bg-green-600/20 text-green-700 dark:text-green-400 border-0">
                  {selectedEPPs.length} seleccionados
                </Badge>
              </div>

              {selectedEPPs.length === 0 && (
                <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-amber-900 dark:text-amber-400 font-semibold mb-1">
                        Selecciona los EPPs a entregar
                      </h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Marca todos los elementos de protección que serán entregados a los trabajadores en esta actividad.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Agrupar EPPs por categoría */}
              {Array.from(new Set(EPP_CATALOG.map(epp => epp.category))).map((category) => {
                const categoryEPPs = EPP_CATALOG.filter(epp => epp.category === category);
                const allCategorySelected = categoryEPPs.every(epp => selectedEPPs.includes(epp.id));
                const someCategorySelected = categoryEPPs.some(epp => selectedEPPs.includes(epp.id)) && !allCategorySelected;

                return (
                  <div key={category} className="mb-6 last:mb-0">
                    {/* Header de categoría con checkbox para seleccionar todos */}
                    <div className="flex items-center gap-3 mb-3 pb-2 border-b border-slate-200 dark:border-zinc-700">
                      <input
                        type="checkbox"
                        checked={allCategorySelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someCategorySelected;
                        }}
                        onChange={() => {
                          if (allCategorySelected) {
                            // Deseleccionar todos de esta categoría
                            setSelectedEPPs(prev => prev.filter(id => !categoryEPPs.find(epp => epp.id === id)));
                          } else {
                            // Seleccionar todos de esta categoría
                            const categoryIds = categoryEPPs.map(epp => epp.id);
                            setSelectedEPPs(prev => [...new Set([...prev, ...categoryIds])]);
                          }
                        }}
                        className="w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-600 cursor-pointer"
                      />
                      <h3 className="text-slate-900 dark:text-white font-semibold text-base flex-1">
                        {category}
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          allCategorySelected 
                            ? 'bg-green-600/20 text-green-700 dark:text-green-400 border-green-600' 
                            : someCategorySelected
                            ? 'bg-blue-600/20 text-blue-700 dark:text-blue-400 border-blue-600'
                            : 'bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-400 border-slate-300 dark:border-zinc-600'
                        }`}
                      >
                        {categoryEPPs.filter(epp => selectedEPPs.includes(epp.id)).length}/{categoryEPPs.length}
                      </Badge>
                    </div>

                    {/* Lista de EPPs de la categoría */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-8">
                      {categoryEPPs.map((epp) => {
                        const isSelected = selectedEPPs.includes(epp.id);
                        
                        return (
                          <div
                            key={epp.id}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedEPPs(prev => prev.filter(id => id !== epp.id));
                              } else {
                                setSelectedEPPs(prev => [...prev, epp.id]);
                              }
                            }}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-600 dark:border-green-700'
                                : 'bg-slate-50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-700 hover:border-green-400 dark:hover:border-green-600'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-5 h-5 rounded border-slate-300 text-green-600 focus:ring-green-600 cursor-pointer"
                            />
                            <span className="text-2xl">{epp.icon}</span>
                            <div className="flex-1">
                              <p className={`font-medium ${
                                isSelected 
                                  ? 'text-green-900 dark:text-green-300' 
                                  : 'text-slate-900 dark:text-white'
                              }`}>
                                {epp.name}
                              </p>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Resumen de EPPs seleccionados */}
              {selectedEPPs.length > 0 && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-green-900 dark:text-green-300 font-semibold mb-2">
                        EPPs seleccionados para entrega ({selectedEPPs.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEPPs.map((eppId) => {
                          const epp = EPP_CATALOG.find(e => e.id === eppId);
                          return epp ? (
                            <Badge 
                              key={eppId}
                              className="bg-white dark:bg-zinc-800 text-green-700 dark:text-green-400 border border-green-600 dark:border-green-700"
                            >
                              <span className="mr-1">{epp.icon}</span>
                              {epp.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Selector de Trabajadores */}
        <Card className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-slate-900 dark:text-white text-lg flex items-center gap-2">
                <span className="w-1 h-6 bg-[#0055A4] rounded-full" />
                Participantes ({selectedWorkers.length})
              </h2>
              <Button
                onClick={() => setShowWorkerSelector(true)}
                className="bg-[#0055A4] hover:bg-blue-700 text-white"
                size="sm"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Agregar Participantes
              </Button>
            </div>

            {selectedWorkers.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-zinc-900/50 rounded-lg">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-zinc-400 mb-1">
                  No hay participantes seleccionados
                </p>
                <p className="text-sm text-slate-500 dark:text-zinc-500">
                  Haz clic en "Agregar Participantes" para comenzar
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedWorkers.map((worker) => (
                  <Card 
                    key={worker.id}
                    className="bg-slate-50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-700"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-slate-900 dark:text-white font-medium">{worker.name}</h3>
                            {worker.signed ? (
                              <Badge className="bg-green-500/20 text-green-600 border-0">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Firmado
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500/20 text-amber-600 border-0">
                                <Clock className="w-3 h-3 mr-1" />
                                Pendiente
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-zinc-400">
                            <span className="font-mono">{worker.rut}</span>
                            <span>•</span>
                            <span>{worker.position}</span>
                            {worker.signedAt && (
                              <>
                                <span>•</span>
                                <span className="text-green-600 dark:text-green-400">Firmado: {worker.signedAt}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {worker.signed ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedWorkers(workers => 
                                  workers.map(w => 
                                    w.id === worker.id 
                                      ? { ...w, signed: false, signedAt: undefined, signature: undefined }
                                      : w
                                  )
                                );
                                toast.info('Firma eliminada');
                              }}
                              className="text-slate-600"
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Editar
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => setShowSignatureModal(worker.id)}
                              className="bg-[#FF8C00] hover:bg-orange-600 text-white"
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Firmar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Botón de Guardar */}
        {selectedWorkers.length > 0 && (
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={pendingCount > 0}
              className="bg-green-600 hover:bg-green-700 text-white flex-1 h-12 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5 mr-2" />
              Guardar y Enviar para Firma Gerencial
            </Button>
          </div>
        )}

        {pendingCount > 0 && selectedWorkers.length > 0 && (
          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <div className="p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-amber-900 dark:text-amber-400 font-semibold mb-1">
                  Faltan {pendingCount} firma(s)
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Todos los participantes deben firmar antes de enviar el documento para firma gerencial.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Modal de Selector de Trabajadores Agrupados */}
      {showWorkerSelector && (
        <GroupedWorkerSelector
          workers={availableWorkers}
          selectedWorkerIds={selectedWorkers.map(w => w.id)}
          onSelectionChange={(workerIds) => {
            const newSelectedWorkers = availableWorkers.filter(w => workerIds.includes(w.id));
            setSelectedWorkers(newSelectedWorkers);
          }}
          onClose={() => setShowWorkerSelector(false)}
          onManageGroups={() => {
            setShowWorkerSelector(false);
            setShowGroupManager(true);
          }}
          groups={workerGroups}
        />
      )}

      {/* Modal de Gestión de Grupos */}
      {showGroupManager && (
        <WorkerGroupManager
          groups={workerGroups}
          onSave={(newGroups) => {
            setWorkerGroups(newGroups);
            setShowGroupManager(false);
            toast.success('Grupos actualizados exitosamente');
          }}
          onClose={() => setShowGroupManager(false)}
          workerCounts={workerGroups.reduce((acc, group) => {
            acc[group.id] = availableWorkers.filter(w => w.groupId === group.id).length;
            return acc;
          }, {} as Record<string, number>)}
        />
      )}

      {/* Modal de Firma Digital */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowSignatureModal(null)}>
          <Card 
            className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-slate-900 dark:text-white text-xl mb-4">Firma Digital del Trabajador</h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400 mb-4">
                Trabajador: <strong>{selectedWorkers.find(w => w.id === showSignatureModal)?.name}</strong>
              </p>
              
              <div className="border-2 border-slate-300 dark:border-zinc-600 rounded-lg overflow-hidden mb-4">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[200px] bg-white dark:bg-zinc-900 cursor-crosshair touch-none"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={saveSignature}
                  className="bg-[#FF8C00] hover:bg-orange-600 text-white flex-1"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Guardar Firma
                </Button>
                <Button
                  onClick={clearSignature}
                  variant="outline"
                >
                  Limpiar
                </Button>
                <Button
                  onClick={() => setShowSignatureModal(null)}
                  variant="outline"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de Recurrencia */}
      {showRecurrenceModal && (
        <RecurrenceScheduler
          activityType={type === 'talk' ? 'talk' : type === 'epp' ? 'epp' : 'talk'}
          activityTitle={formData.title}
          onConfirm={handleRecurrenceConfirm}
          onCancel={() => setShowRecurrenceModal(false)}
          onSkip={handleRecurrenceSkip}
        />
      )}
    </div>
  );
}