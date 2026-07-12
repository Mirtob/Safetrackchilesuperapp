import { useState, useRef, useEffect } from 'react';
import { VoiceInput } from '@/app/components/VoiceInput';
import { DocumentPreviewAndSend } from '@/app/components/DocumentPreviewAndSend';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Card } from '@/app/components/ui/card';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { 
  ArrowLeft, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Building2, 
  ChevronDown,
  Users,
  Plus,
  X,
  Camera,
  Pencil,
  Send,
  CheckCircle,
  Search,
  Ambulance
} from 'lucide-react';

interface IncidentReportFormEnhancedProps {
  onBack: () => void;
  onSubmit: (data: FormData & { affectedWorkersDetails: Worker[] }) => void;
}

interface FormData {
  sector: string;
  sectorName: string;
  incidentType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedPersons: string[];
  immediateActions: string;
  location: string;
  photos: string[];
  signature: string | null;
  timestamp: string;
}

interface Sector {
  id: string;
  name: string;
  icon: string;
}

interface Worker {
  id: string;
  name: string;
  rut: string;
  position: string;
  department: string;
  email: string;
}

interface IncidentType {
  id: string;
  name: string;
  icon: string;
  defaultSeverity: 'low' | 'medium' | 'high' | 'critical';
}

// Sectores (mismos que en inspecciones)
const SECTORS: Sector[] = [
  { id: 'bodega-a', name: 'Bodega A - Almacenamiento', icon: '📦' },
  { id: 'bodega-b', name: 'Bodega B - Productos Químicos', icon: '⚗️' },
  { id: 'produccion', name: 'Área de Producción', icon: '🏭' },
  { id: 'oficinas', name: 'Oficinas Administrativas', icon: '🏢' },
  { id: 'mantención', name: 'Taller de Mantención', icon: '🔧' },
  { id: 'exterior', name: 'Áreas Exteriores', icon: '🌳' }
];

// Base de datos simulada de trabajadores
const WORKERS: Worker[] = [
  { id: '1', name: 'Juan Pérez González', rut: '12.345.678-9', position: 'Operario', department: 'Producción', email: 'jperez@empresa.cl' },
  { id: '2', name: 'María Soto Díaz', rut: '13.456.789-0', position: 'Supervisora', department: 'Producción', email: 'msoto@empresa.cl' },
  { id: '3', name: 'Carlos Torres Muñoz', rut: '14.567.890-1', position: 'Bodeguero', department: 'Logística', email: 'ctorres@empresa.cl' },
  { id: '4', name: 'Ana López Rojas', rut: '15.678.901-2', position: 'Técnico', department: 'Mantención', email: 'alopez@empresa.cl' },
  { id: '5', name: 'Pedro Ramírez Silva', rut: '16.789.012-3', position: 'Operario', department: 'Producción', email: 'pramirez@empresa.cl' },
  { id: '6', name: 'Sofía Vargas Morales', rut: '17.890.123-4', position: 'Administradora', department: 'Oficinas', email: 'svargas@empresa.cl' },
  { id: '7', name: 'Roberto Castro Pino', rut: '18.901.234-5', position: 'Operario', department: 'Producción', email: 'rcastro@empresa.cl' },
  { id: '8', name: 'Claudia Núñez Vega', rut: '19.012.345-6', position: 'Operario', department: 'Bodega', email: 'cnunez@empresa.cl' }
];

// Tipos de incidentes
const INCIDENT_TYPES: IncidentType[] = [
  { id: 'accident', name: 'Accidente Laboral', icon: '🚑', defaultSeverity: 'high' },
  { id: 'near-miss', name: 'Casi Accidente', icon: '⚠️', defaultSeverity: 'medium' },
  { id: 'unsafe-condition', name: 'Condición Insegura', icon: '🚧', defaultSeverity: 'medium' },
  { id: 'unsafe-act', name: 'Acto Inseguro', icon: '👤', defaultSeverity: 'medium' },
  { id: 'equipment-failure', name: 'Falla de Equipo', icon: '⚙️', defaultSeverity: 'low' },
  { id: 'spill', name: 'Derrame', icon: '💧', defaultSeverity: 'high' },
  { id: 'fire', name: 'Incendio/Amago', icon: '🔥', defaultSeverity: 'critical' },
  { id: 'environmental', name: 'Ambiental', icon: '🌍', defaultSeverity: 'medium' },
  { id: 'other', name: 'Otro', icon: '📋', defaultSeverity: 'low' }
];

export function IncidentReportFormEnhanced({ onBack, onSubmit }: IncidentReportFormEnhancedProps) {
  const [formData, setFormData] = useState<FormData>({
    sector: '',
    sectorName: '',
    incidentType: '',
    severity: 'medium',
    title: '',
    description: '',
    affectedPersons: [],
    immediateActions: '',
    location: 'Sucursal Maipú - Av. Pajaritos 1234',
    photos: [],
    signature: null,
    timestamp: new Date().toISOString()
  });
  
  const [isRecording, setIsRecording] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showSectorPicker, setShowSectorPicker] = useState(false);
  const [showIncidentTypePicker, setShowIncidentTypePicker] = useState(false);
  const [showSeverityPicker, setShowSeverityPicker] = useState(false);
  const [showWorkerPicker, setShowWorkerPicker] = useState(false);
  const [workerSearchTerm, setWorkerSearchTerm] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showDocumentWorkflow, setShowDocumentWorkflow] = useState(false);

  const selectedSector = SECTORS.find(s => s.id === formData.sector);
  const selectedIncidentType = INCIDENT_TYPES.find(t => t.id === formData.incidentType);
  const selectedWorkers = WORKERS.filter(w => formData.affectedPersons.includes(w.id));

  const filteredWorkers = WORKERS.filter(worker => 
    worker.name.toLowerCase().includes(workerSearchTerm.toLowerCase()) ||
    worker.rut.includes(workerSearchTerm) ||
    worker.department.toLowerCase().includes(workerSearchTerm.toLowerCase())
  );

  const severityConfig = {
    low: { label: 'Baja', color: 'bg-green-600', textColor: 'text-green-900 dark:text-green-100', bgColor: 'bg-green-50 dark:bg-green-950/20', icon: '🟢' },
    medium: { label: 'Media', color: 'bg-yellow-600', textColor: 'text-yellow-900 dark:text-yellow-100', bgColor: 'bg-yellow-50 dark:bg-yellow-950/20', icon: '🟡' },
    high: { label: 'Alta', color: 'bg-orange-600', textColor: 'text-orange-900 dark:text-orange-100', bgColor: 'bg-orange-50 dark:bg-orange-950/20', icon: '🟠' },
    critical: { label: 'Crítica', color: 'bg-red-600', textColor: 'text-red-900 dark:text-red-100', bgColor: 'bg-red-50 dark:bg-red-950/20', icon: '🔴' }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setFormData(prev => ({
      ...prev,
      description: prev.description + ' ' + transcript
    }));
    toast.success('✅ Audio transcrito', { duration: 2000 });
  };

  const handleAddPhoto = () => {
    const newPhoto = `https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop`;
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, newPhoto]
    }));
    toast.success('📷 Foto agregada', { duration: 1500 });
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSelectSector = (sectorId: string, sectorName: string) => {
    setFormData(prev => ({
      ...prev,
      sector: sectorId,
      sectorName: sectorName
    }));
    setShowSectorPicker(false);
    toast.success('📍 Sector seleccionado', { duration: 1500 });
  };

  const handleSelectIncidentType = (type: IncidentType) => {
    setFormData(prev => ({
      ...prev,
      incidentType: type.id,
      severity: type.defaultSeverity
    }));
    setShowIncidentTypePicker(false);
    toast.success(`🚨 ${type.name}`, { duration: 2000 });
  };

  const handleSelectSeverity = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    setFormData(prev => ({
      ...prev,
      severity: severity
    }));
    setShowSeverityPicker(false);
  };

  const handleToggleWorker = (workerId: string) => {
    setFormData(prev => ({
      ...prev,
      affectedPersons: prev.affectedPersons.includes(workerId)
        ? prev.affectedPersons.filter(id => id !== workerId)
        : [...prev.affectedPersons, workerId]
    }));
  };

  const handleRemoveWorker = (workerId: string) => {
    setFormData(prev => ({
      ...prev,
      affectedPersons: prev.affectedPersons.filter(id => id !== workerId)
    }));
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
    ctx.strokeStyle = '#000';
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
    const signature = canvas.toDataURL();
    setFormData(prev => ({ ...prev, signature }));
    setShowSignatureModal(false);
    toast.success('✍️ Firma guardada', { duration: 2000 });
  };

  const generateIncidentPDF = (): jsPDF => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Header con logo SafeTrack
    doc.setFillColor(255, 140, 0);
    doc.rect(0, 0, pageWidth, 8, 'F');
    
    doc.setFontSize(22);
    doc.setTextColor(41, 41, 41);
    doc.setFont('helvetica', 'bold');
    doc.text('SafeTrack Chile', 15, yPos);
    
    yPos += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Sistema de Prevención de Riesgos', 15, yPos);

    // Badge de Severidad
    const severityColors: Record<string, { r: number; g: number; b: number; label: string }> = {
      low: { r: 34, g: 197, b: 94, label: 'BAJA' },
      medium: { r: 234, g: 179, b: 8, label: 'MEDIA' },
      high: { r: 249, g: 115, b: 22, label: 'ALTA' },
      critical: { r: 220, g: 38, b: 38, label: 'CRÍTICA' }
    };
    const sevColor = severityColors[formData.severity];
    doc.setFillColor(sevColor.r, sevColor.g, sevColor.b);
    doc.roundedRect(pageWidth - 55, 12, 40, 8, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(`SEVERIDAD ${sevColor.label}`, pageWidth - 53, 17);

    // Fecha y hora
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    const now = new Date();
    doc.text(`Fecha: ${now.toLocaleDateString('es-CL')}`, pageWidth - 55, 23);
    doc.text(`Hora: ${now.toLocaleTimeString('es-CL')}`, pageWidth - 55, 27);

    // Línea divisoria
    yPos = 35;
    doc.setDrawColor(255, 140, 0);
    doc.setLineWidth(1);
    doc.line(15, yPos, pageWidth - 15, yPos);

    // TÍTULO
    yPos += 10;
    doc.setFontSize(18);
    doc.setTextColor(220, 38, 38);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE INCIDENTE', pageWidth / 2, yPos, { align: 'center' });

    yPos += 8;
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'bold');
    const titleLines = doc.splitTextToSize(formData.title, pageWidth - 30);
    titleLines.forEach((line: string) => {
      doc.text(line, pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;
    });

    // Código de verificación
    yPos += 5;
    const verificationCode = `INC-${Date.now().toString(36).toUpperCase()}`;
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPos - 5, pageWidth - 30, 8, 'F');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'bold');
    doc.text(`Código de Verificación: ${verificationCode}`, pageWidth / 2, yPos, { align: 'center' });

    // SECCIÓN 1: CLASIFICACIÓN DEL INCIDENTE
    yPos += 15;
    doc.setFillColor(0, 85, 164);
    doc.rect(15, yPos - 4, pageWidth - 30, 7, 'F');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('1. CLASIFICACIÓN DEL INCIDENTE', 17, yPos);

    yPos += 10;
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'bold');
    doc.text('Tipo de Incidente:', 17, yPos);
    doc.setFont('helvetica', 'normal');
    const incidentType = INCIDENT_TYPES.find(t => t.id === formData.incidentType);
    doc.text(incidentType?.name || formData.incidentType, 55, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Nivel de Severidad:', 17, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(sevColor.label, 55, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Sector:', 17, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.sectorName || formData.sector, 55, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Ubicación:', 17, yPos);
    doc.setFont('helvetica', 'normal');
    const locationLines = doc.splitTextToSize(formData.location, pageWidth - 65);
    locationLines.forEach((line: string, index: number) => {
      if (index === 0) {
        doc.text(line, 55, yPos);
      } else {
        yPos += 5;
        doc.text(line, 17, yPos);
      }
    });

    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha y Hora:', 17, yPos);
    doc.setFont('helvetica', 'normal');
    const timestamp = new Date(formData.timestamp);
    doc.text(`${timestamp.toLocaleDateString('es-CL')} ${timestamp.toLocaleTimeString('es-CL')}`, 55, yPos);

    // SECCIÓN 2: DESCRIPCIÓN DEL INCIDENTE
    yPos += 12;
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFillColor(0, 85, 164);
    doc.rect(15, yPos - 4, pageWidth - 30, 7, 'F');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('2. DESCRIPCIÓN DEL INCIDENTE', 17, yPos);

    yPos += 10;
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(formData.description, pageWidth - 34);
    descLines.forEach((line: string) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, 17, yPos);
      yPos += 5;
    });

    // SECCIÓN 3: PERSONAS AFECTADAS
    if (formData.affectedPersons.length > 0) {
      yPos += 8;
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFillColor(0, 85, 164);
      doc.rect(15, yPos - 4, pageWidth - 30, 7, 'F');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('3. PERSONAS AFECTADAS', 17, yPos);

      yPos += 10;
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      formData.affectedPersons.forEach((workerId) => {
        const worker = WORKERS.find(w => w.id === workerId);
        if (worker) {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.setFont('helvetica', 'bold');
          doc.text(`• ${worker.name}`, 17, yPos);
          yPos += 5;
          doc.setFont('helvetica', 'normal');
          doc.text(`  RUT: ${worker.rut} | Cargo: ${worker.position} | Dpto: ${worker.department}`, 17, yPos);
          yPos += 6;
        }
      });
    }

    // SECCIÓN 4: ACCIONES INMEDIATAS
    if (formData.immediateActions) {
      yPos += 8;
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFillColor(0, 85, 164);
      doc.rect(15, yPos - 4, pageWidth - 30, 7, 'F');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('4. ACCIONES INMEDIATAS TOMADAS', 17, yPos);

      yPos += 10;
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'normal');
      const actionsLines = doc.splitTextToSize(formData.immediateActions, pageWidth - 34);
      actionsLines.forEach((line: string) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 17, yPos);
        yPos += 5;
      });
    }

    // SECCIÓN 5: EVIDENCIA FOTOGRÁFICA
    if (formData.photos.length > 0) {
      yPos += 8;
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFillColor(0, 85, 164);
      doc.rect(15, yPos - 4, pageWidth - 30, 7, 'F');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('5. EVIDENCIA FOTOGRÁFICA', 17, yPos);

      yPos += 10;
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'italic');
      doc.text(`${formData.photos.length} fotografía(s) capturada(s)`, 17, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.text('Las imágenes están disponibles en el sistema digital.', 17, yPos);
    }

    // SECCIÓN 6: FIRMA DIGITAL
    if (formData.signature) {
      yPos += 12;
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFillColor(0, 85, 164);
      doc.rect(15, yPos - 4, pageWidth - 30, 7, 'F');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('6. FIRMA DEL REPORTANTE', 17, yPos);

      yPos += 10;
      try {
        doc.addImage(formData.signature, 'PNG', 17, yPos, 50, 20);
      } catch (e) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        doc.text('[Firma Digital Capturada]', 17, yPos + 10);
      }
      yPos += 23;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Firmado digitalmente el ${now.toLocaleDateString('es-CL')} a las ${now.toLocaleTimeString('es-CL')}`, 17, yPos);
    }

    // Footer en todas las páginas
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `SafeTrack Chile - Reporte de Incidente | Página ${i} de ${pageCount} | ${verificationCode}`,
        pageWidth / 2,
        290,
        { align: 'center' }
      );
      doc.setDrawColor(255, 140, 0);
      doc.setLineWidth(0.5);
      doc.line(15, 287, pageWidth - 15, 287);
    }

    return doc;
  };

  const handleSubmit = () => {
    console.log('🔍 handleSubmit ejecutado');
    console.log('FormData:', formData);
    
    // Validaciones
    if (!formData.sector) {
      toast.error('Sector requerido', { description: 'Selecciona el sector donde ocurrió el incidente' });
      return;
    }
    if (!formData.incidentType) {
      toast.error('Tipo de incidente requerido', { description: 'Selecciona el tipo de incidente' });
      return;
    }
    if (!formData.title) {
      toast.error('Título requerido', { description: 'Proporciona un título breve del incidente' });
      return;
    }
    if (!formData.description) {
      toast.error('Descripción requerida', { description: 'Describe qué ocurrió' });
      return;
    }

    console.log('✅ Validaciones pasadas, activando flujo de documento');
    // Activar flujo de documento universal
    setShowDocumentWorkflow(true);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          location: `${prev.location} (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`
        }));
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors pb-20 lg:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-700 dark:to-orange-700 border-b border-red-500 dark:border-red-600 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver</span>
            </button>
            
            {/* Badge de severidad en el header */}
            {formData.severity && (
              <Badge className={`${severityConfig[formData.severity].color} text-white border-0`}>
                {severityConfig[formData.severity].icon} Severidad {severityConfig[formData.severity].label}
              </Badge>
            )}
          </div>

          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-white text-xl lg:text-2xl mb-1 font-bold">
                {formData.title 
                  ? `🚨 ${formData.title}` 
                  : '🚨 Reporte de Incidente'}
              </h1>
              <p className="text-white/80 text-sm">
                {selectedSector 
                  ? `${selectedSector.icon} ${selectedSector.name}` 
                  : 'Selecciona sector y tipo de incidente'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Location Badge */}
        <Badge className="bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 py-2 px-3">
          <MapPin className="w-3 h-3 mr-1" />
          {formData.location}
        </Badge>

        {/* Timestamp */}
        <Badge className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 py-2 px-3">
          <Clock className="w-3 h-3 mr-1" />
          {new Date(formData.timestamp).toLocaleString('es-CL')}
        </Badge>

        {/* PASO 1: Selector de Sector */}
        <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label className="text-slate-900 dark:text-white mb-1 block">
                PASO 1: Sector Donde Ocurrió *
              </Label>
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                Selecciona el área donde sucedió el incidente
              </p>
            </div>
            <Building2 className="w-5 h-5 text-red-600" />
          </div>

          {formData.sector ? (
            <div 
              onClick={() => setShowSectorPicker(true)}
              className="p-4 bg-red-50 dark:bg-red-950/20 border-2 border-red-300 dark:border-red-800 rounded-lg cursor-pointer hover:border-red-500 dark:hover:border-red-600 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{selectedSector?.icon}</div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {selectedSector?.name}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-zinc-400">
                      Click para cambiar
                    </div>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setShowSectorPicker(true)}
              variant="outline"
              className="w-full h-auto py-4 border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-red-500 dark:hover:border-red-600"
            >
              <Building2 className="w-5 h-5 mr-2" />
              Seleccionar Sector
            </Button>
          )}
        </Card>

        {/* PASO 2: Tipo de Incidente (solo si hay sector) */}
        {formData.sector && (
          <>
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label className="text-slate-900 dark:text-white mb-1 block">
                    PASO 2: Tipo de Incidente *
                  </Label>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">
                    Clasifica el tipo de incidente ocurrido
                  </p>
                </div>
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>

              {formData.incidentType ? (
                <div 
                  onClick={() => setShowIncidentTypePicker(true)}
                  className="p-4 bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-300 dark:border-orange-800 rounded-lg cursor-pointer hover:border-orange-500 dark:hover:border-orange-600 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{selectedIncidentType?.icon}</div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {selectedIncidentType?.name}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-zinc-400">
                          Click para cambiar
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setShowIncidentTypePicker(true)}
                  variant="outline"
                  className="w-full h-auto py-4 border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-orange-500 dark:hover:border-orange-600"
                >
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Seleccionar Tipo de Incidente
                </Button>
              )}
            </Card>

            {/* PASO 3: Severidad */}
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label className="text-slate-900 dark:text-white mb-1 block">
                    PASO 3: Nivel de Severidad *
                  </Label>
                  <p className="text-xs text-slate-600 dark:text-zinc-400">
                    Evalúa la gravedad del incidente
                  </p>
                </div>
              </div>

              <div 
                onClick={() => setShowSeverityPicker(true)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  severityConfig[formData.severity].bgColor
                } border-${formData.severity === 'low' ? 'green' : formData.severity === 'medium' ? 'yellow' : formData.severity === 'high' ? 'orange' : 'red'}-300 hover:border-${formData.severity === 'low' ? 'green' : formData.severity === 'medium' ? 'yellow' : formData.severity === 'high' ? 'orange' : 'red'}-500`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{severityConfig[formData.severity].icon}</div>
                    <div>
                      <div className={`font-semibold ${severityConfig[formData.severity].textColor}`}>
                        Severidad {severityConfig[formData.severity].label}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-zinc-400">
                        Click para cambiar
                      </div>
                    </div>
                  </div>
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            </Card>
          </>
        )}

        {/* PASO 4: Detalles del Incidente (solo si hay tipo) */}
        {formData.incidentType && (
          <>
            {/* Título breve */}
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <Label className="text-slate-900 dark:text-white mb-3 block">
                PASO 4: Título del Incidente *
              </Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ej: Trabajador se golpeó con material mal apilado"
                className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white h-12"
              />
            </Card>

            {/* Descripción con dictado */}
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-slate-900 dark:text-white">
                  ¿Qué ocurrió? *
                </Label>
              </div>
              
              <VoiceInput
                onTranscript={handleVoiceTranscript}
                variant="card"
              />

              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe detalladamente: ¿qué sucedió? ¿cómo ocurrió? ¿cuál fue la causa inmediata?"
                className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white placeholder:text-zinc-500 min-h-[120px] mt-3"
              />
            </Card>

            {/* Personas afectadas con selector */}
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <Label className="text-slate-900 dark:text-white">
                    Personas Afectadas (Opcional)
                  </Label>
                </div>
                <Button
                  onClick={() => setShowWorkerPicker(true)}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar
                </Button>
              </div>

              {selectedWorkers.length > 0 ? (
                <div className="space-y-2">
                  {selectedWorkers.map(worker => (
                    <div
                      key={worker.id}
                      className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 dark:text-white text-sm">
                          {worker.name}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-zinc-400">
                          {worker.rut} • {worker.position} • {worker.department}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveWorker(worker.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 dark:text-zinc-400 text-sm">
                  No hay personas afectadas registradas
                </div>
              )}
            </Card>

            {/* Acciones inmediatas */}
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 mb-3">
                <Ambulance className="w-5 h-5 text-green-600" />
                <Label className="text-slate-900 dark:text-white">
                  Acciones Inmediatas Tomadas (Opcional)
                </Label>
              </div>
              <Textarea
                value={formData.immediateActions}
                onChange={(e) => setFormData(prev => ({ ...prev, immediateActions: e.target.value }))}
                placeholder="¿Qué medidas se tomaron inmediatamente? Primeros auxilios, aislamiento de área, etc."
                className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white placeholder:text-zinc-500 min-h-[80px]"
              />
            </Card>

            {/* Fotos */}
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-slate-900 dark:text-white">
                  Fotos de Evidencia (Opcional)
                </Label>
                <Button onClick={handleAddPhoto} size="sm" variant="outline">
                  <Camera className="w-4 h-4 mr-1" />
                  Tomar Foto
                </Button>
              </div>

              {formData.photos.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Evidencia ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Firma Digital */}
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <Label className="text-slate-900 dark:text-white mb-4 block">
                Firma del Reportante (Opcional)
              </Label>
              {formData.signature ? (
                <div className="space-y-3">
                  <img
                    src={formData.signature}
                    alt="Firma"
                    className="border-2 border-slate-200 dark:border-zinc-700 rounded-lg p-2 bg-white"
                  />
                  <Button
                    onClick={() => setShowSignatureModal(true)}
                    variant="outline"
                    className="w-full"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Modificar Firma
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowSignatureModal(true)}
                  variant="outline"
                  className="w-full h-20 border-2 border-dashed border-slate-300 dark:border-zinc-700"
                >
                  <Pencil className="w-5 h-5 mr-2" />
                  Agregar Firma Digital
                </Button>
              )}
            </Card>

            {/* Advertencia de severidad crítica */}
            {formData.severity === 'critical' && (
              <Card className="p-4 bg-red-50 dark:bg-red-950/20 border-2 border-red-500 dark:border-red-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div className="text-sm text-red-800 dark:text-red-300">
                    <strong className="block mb-1">🚨 INCIDENTE CRÍTICO</strong>
                    Este reporte será enviado inmediatamente a gerencia y al Comité Paritario.
                    Se activará el protocolo de investigación de accidentes graves.
                  </div>
                </div>
              </Card>
            )}

            {/* Botón Enviar */}
            <Button
              onClick={handleSubmit}
              className="w-full bg-red-600 hover:bg-red-700 text-white h-14 text-lg"
            >
              <Send className="w-5 h-5 mr-2" />
              Enviar Reporte de Incidente
            </Button>
          </>
        )}
      </div>

      {/* Modal: Selector de Sector */}
      {showSectorPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-t-2xl lg:rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Seleccionar Sector
                </h3>
                <button
                  onClick={() => setShowSectorPicker(false)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-3 overflow-y-auto max-h-[60vh]">
              {SECTORS.map(sector => (
                <button
                  key={sector.id}
                  onClick={() => handleSelectSector(sector.id, sector.name)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    formData.sector === sector.id
                      ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                      : 'border-slate-200 dark:border-zinc-800 hover:border-red-300 dark:hover:border-red-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{sector.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {sector.name}
                      </div>
                    </div>
                    {formData.sector === sector.id && (
                      <CheckCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Selector de Tipo de Incidente */}
      {showIncidentTypePicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-t-2xl lg:rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Tipo de Incidente
                </h3>
                <button
                  onClick={() => setShowIncidentTypePicker(false)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-3 overflow-y-auto max-h-[60vh]">
              {INCIDENT_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => handleSelectIncidentType(type)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    formData.incidentType === type.id
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                      : 'border-slate-200 dark:border-zinc-800 hover:border-orange-300 dark:hover:border-orange-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{type.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {type.name}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-zinc-400">
                        Severidad sugerida: {severityConfig[type.defaultSeverity].icon} {severityConfig[type.defaultSeverity].label}
                      </div>
                    </div>
                    {formData.incidentType === type.id && (
                      <CheckCircle className="w-5 h-5 text-orange-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Selector de Severidad */}
      {showSeverityPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-t-2xl lg:rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Nivel de Severidad
                </h3>
                <button
                  onClick={() => setShowSeverityPicker(false)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-3">
              {(Object.keys(severityConfig) as Array<'low' | 'medium' | 'high' | 'critical'>).map(severity => (
                <button
                  key={severity}
                  onClick={() => handleSelectSeverity(severity)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    severityConfig[severity].bgColor
                  } ${
                    formData.severity === severity
                      ? `border-${severity === 'low' ? 'green' : severity === 'medium' ? 'yellow' : severity === 'high' ? 'orange' : 'red'}-500`
                      : 'border-slate-200 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{severityConfig[severity].icon}</div>
                    <div className="flex-1">
                      <div className={`font-semibold ${severityConfig[severity].textColor}`}>
                        {severityConfig[severity].label}
                      </div>
                    </div>
                    {formData.severity === severity && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Selector de Trabajadores */}
      {showWorkerPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-t-2xl lg:rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Seleccionar Personas Afectadas
                </h3>
                <button
                  onClick={() => setShowWorkerPicker(false)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Buscador */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={workerSearchTerm}
                  onChange={(e) => setWorkerSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, RUT o departamento..."
                  className="pl-10 bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700"
                />
              </div>
            </div>

            <div className="p-6 space-y-2 overflow-y-auto max-h-[50vh]">
              {filteredWorkers.map(worker => {
                const isSelected = formData.affectedPersons.includes(worker.id);
                return (
                  <button
                    key={worker.id}
                    onClick={() => handleToggleWorker(worker.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                        : 'border-slate-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        isSelected ? 'bg-blue-600' : 'bg-slate-200 dark:bg-zinc-700'
                      }`}>
                        {isSelected ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <Users className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {worker.name}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-zinc-400">
                          {worker.rut} • {worker.position} • {worker.department}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-zinc-800">
              <Button
                onClick={() => setShowWorkerPicker(false)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Confirmar ({formData.affectedPersons.length} seleccionados)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Firma Digital */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white dark:bg-zinc-900">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Firma Digital
                </h3>
                <button
                  onClick={() => setShowSignatureModal(false)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="border-2 border-slate-200 dark:border-zinc-700 rounded-lg mb-4 bg-white">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={200}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full touch-none"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={clearSignature} variant="outline" className="flex-1">
                  Limpiar
                </Button>
                <Button onClick={saveSignature} className="flex-1 bg-green-600 hover:bg-green-700">
                  Guardar Firma
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Flujo de Documento Universal */}
      {showDocumentWorkflow && (
        <DocumentPreviewAndSend
          documentType="REPORTE DE INCIDENTE"
          documentTitle={formData.title}
          company="Constructora Los Andes S.A."
          documentData={{
            sector: formData.sectorName,
            incidentType: selectedIncidentType?.name || '',
            severity: severityConfig[formData.severity].label,
            description: formData.description,
            immediateActions: formData.immediateActions,
            location: formData.location,
            gps: formData.location,
            timestamp: new Date(formData.timestamp).toLocaleString('es-CL'),
            photos: formData.photos.length
          }}
          workers={selectedWorkers.map(worker => ({
            id: worker.id,
            name: worker.name,
            rut: worker.rut,
            position: worker.position,
            department: worker.department,
            email: worker.email,
            signed: false,
            signedAt: '',
            signature: undefined
          }))}
          onClose={() => setShowDocumentWorkflow(false)}
          onSendComplete={() => {
            setShowDocumentWorkflow(false);
            onSubmit({ ...formData, affectedWorkersDetails: selectedWorkers });
          }}
        />
      )}
    </div>
  );
}