import { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Mic, 
  MapPin, 
  Send, 
  X, 
  ArrowLeft,
  AlertTriangle,
  Pencil,
  Building2,
  ChevronDown,
  Users,
  Clock,
  Video,
  Image as ImageIcon,
  Plus,
  Trash2,
  Search,
  CheckCircle,
  User,
  PlayCircle,
  StopCircle,
  Shield,
  Mail,
  MessageCircle,
  FileText
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { VoiceInput } from '@/app/components/VoiceInput';
import { DocumentPreviewAndSend } from '@/app/components/DocumentPreviewAndSend';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface AccidentReportFormCompleteProps {
  onBack: () => void;
  onSubmit: (data: AccidentFormData) => void;
}

interface AccidentFormData {
  // Ubicación
  sector: string;
  sectorName: string;
  specificLocation: string;
  
  // Trabajador accidentado
  injuredWorker: Worker | null;
  
  // Fecha y hora (automáticas)
  accidentDate: string;
  accidentTime: string;
  reportDate: string;
  reportTime: string;
  
  // Descripción del accidente
  description: string;
  causeAnalysis: string;
  
  // Evidencia multimedia
  scenePhotos: MediaItem[];
  injuryPhotos: MediaItem[];
  evidencePhotos: MediaItem[];
  
  // Declaraciones
  witnessStatements: WitnessStatement[];
  
  // Firmas
  preventionistSignature: string | null;
  managerSignature: string | null;
  witnessSignatures: { [key: string]: string };
  injuredWorkerSignature: string | null;
  injuredWorkerCanSign: boolean;
  
  // Acciones inmediatas
  immediateActions: string;
  medicalAttention: string;
  
  // Geolocalización
  location: string;
}

interface Worker {
  id: string;
  name: string;
  rut: string;
  position: string;
  department: string;
  email: string;
}

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnail?: string;
  timestamp: string;
}

interface WitnessStatement {
  id: string;
  witness: Worker | null;
  statement: string;
  timestamp: string;
  recordingUrl?: string;
}

interface Sector {
  id: string;
  name: string;
  icon: string;
}

// Sectores (mismos que inspecciones/incidentes)
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

export function AccidentReportFormComplete({ onBack, onSubmit }: AccidentReportFormCompleteProps) {
  const now = new Date();
  
  const [formData, setFormData] = useState<AccidentFormData>({
    sector: '',
    sectorName: '',
    specificLocation: '',
    injuredWorker: null,
    accidentDate: now.toISOString().split('T')[0],
    accidentTime: now.toTimeString().slice(0, 5),
    reportDate: now.toISOString().split('T')[0],
    reportTime: now.toTimeString().slice(0, 5),
    description: '',
    causeAnalysis: '',
    scenePhotos: [],
    injuryPhotos: [],
    evidencePhotos: [],
    witnessStatements: [],
    preventionistSignature: null,
    managerSignature: null,
    witnessSignatures: {},
    injuredWorkerSignature: null,
    injuredWorkerCanSign: true,
    immediateActions: '',
    medicalAttention: '',
    location: 'Sucursal Maipú - Av. Pajaritos 1234'
  });

  // Estados de UI
  const [showSectorPicker, setShowSectorPicker] = useState(false);
  const [showWorkerPicker, setShowWorkerPicker] = useState(false);
  const [workerSearchQuery, setWorkerSearchQuery] = useState('');
  const [showWitnessPicker, setShowWitnessPicker] = useState(false);
  const [witnessSearchQuery, setWitnessSearchQuery] = useState('');
  const [currentStatementIndex, setCurrentStatementIndex] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [currentSignatureType, setCurrentSignatureType] = useState<'preventionist' | 'manager' | 'injured' | 'witness'>('preventionist');
  const [currentWitnessSignatureId, setCurrentWitnessSignatureId] = useState<string>('');
  const [showDocumentWorkflow, setShowDocumentWorkflow] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const selectedSector = SECTORS.find(s => s.id === formData.sector);
  
  // Filtrar trabajadores según búsqueda
  const filteredWorkers = WORKERS.filter(worker =>
    worker.name.toLowerCase().includes(workerSearchQuery.toLowerCase()) ||
    worker.rut.includes(workerSearchQuery) ||
    worker.position.toLowerCase().includes(workerSearchQuery.toLowerCase())
  );

  const filteredWitnesses = WORKERS.filter(worker =>
    worker.id !== formData.injuredWorker?.id &&
    (worker.name.toLowerCase().includes(witnessSearchQuery.toLowerCase()) ||
     worker.rut.includes(witnessSearchQuery))
  );

  const handleSelectSector = (sectorId: string, sectorName: string) => {
    setFormData(prev => ({
      ...prev,
      sector: sectorId,
      sectorName: sectorName
    }));
    setShowSectorPicker(false);
    toast.success('📍 Sector seleccionado');
  };

  const handleSelectWorker = (worker: Worker) => {
    setFormData(prev => ({
      ...prev,
      injuredWorker: worker
    }));
    setShowWorkerPicker(false);
    setWorkerSearchQuery('');
    toast.success(`👤 ${worker.name} registrado como trabajador accidentado`);
  };

  const handleAddPhoto = (category: 'scenePhotos' | 'injuryPhotos' | 'evidencePhotos') => {
    const newPhoto: MediaItem = {
      id: Date.now().toString(),
      type: 'photo',
      url: `https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop`,
      timestamp: new Date().toISOString()
    };
    
    setFormData(prev => ({
      ...prev,
      [category]: [...prev[category], newPhoto]
    }));
    
    toast.success('📷 Foto agregada');
  };

  const handleAddVideo = (category: 'scenePhotos' | 'injuryPhotos' | 'evidencePhotos') => {
    const newVideo: MediaItem = {
      id: Date.now().toString(),
      type: 'video',
      url: 'video-placeholder.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=200&h=150&fit=crop',
      timestamp: new Date().toISOString()
    };
    
    setFormData(prev => ({
      ...prev,
      [category]: [...prev[category], newVideo]
    }));
    
    toast.success('🎥 Video grabado');
  };

  const handleRemoveMedia = (category: 'scenePhotos' | 'injuryPhotos' | 'evidencePhotos', id: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item.id !== id)
    }));
  };

  const handleAddWitnessStatement = () => {
    const newStatement: WitnessStatement = {
      id: Date.now().toString(),
      witness: null,
      statement: '',
      timestamp: new Date().toISOString()
    };
    
    setFormData(prev => ({
      ...prev,
      witnessStatements: [...prev.witnessStatements, newStatement]
    }));
    
    setCurrentStatementIndex(formData.witnessStatements.length);
  };

  const handleSelectWitness = (witness: Worker, statementIndex: number) => {
    setFormData(prev => {
      const newStatements = [...prev.witnessStatements];
      newStatements[statementIndex] = {
        ...newStatements[statementIndex],
        witness: witness
      };
      return { ...prev, witnessStatements: newStatements };
    });
    
    setShowWitnessPicker(false);
    setWitnessSearchQuery('');
    toast.success(`👤 ${witness.name} agregado como testigo`);
  };

  const handleRecordStatement = (statementIndex: number) => {
    setCurrentStatementIndex(statementIndex);
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      toast.info('🎤 Grabando declaración...');
      // Simular grabación
      setTimeout(() => {
        setIsRecording(false);
        toast.success('✅ Declaración grabada');
      }, 3000);
    }
  };

  const handleWitnessTranscript = (transcript: string, statementIndex: number) => {
    setFormData(prev => {
      const newStatements = [...prev.witnessStatements];
      newStatements[statementIndex] = {
        ...newStatements[statementIndex],
        statement: newStatements[statementIndex].statement + ' ' + transcript
      };
      return { ...prev, witnessStatements: newStatements };
    });
  };

  const handleRemoveStatement = (id: string) => {
    setFormData(prev => ({
      ...prev,
      witnessStatements: prev.witnessStatements.filter(s => s.id !== id)
    }));
  };

  const openSignatureModal = (type: 'preventionist' | 'manager' | 'injured' | 'witness', witnessId?: string) => {
    setCurrentSignatureType(type);
    if (witnessId) {
      setCurrentWitnessSignatureId(witnessId);
    }
    setShowSignatureModal(true);
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
    
    switch (currentSignatureType) {
      case 'preventionist':
        setFormData(prev => ({ ...prev, preventionistSignature: signature }));
        toast.success('✍️ Firma del prevencionista guardada');
        break;
      case 'manager':
        setFormData(prev => ({ ...prev, managerSignature: signature }));
        toast.success('✍️ Firma del gerente guardada');
        break;
      case 'injured':
        setFormData(prev => ({ ...prev, injuredWorkerSignature: signature }));
        toast.success('✍️ Firma del trabajador accidentado guardada');
        break;
      case 'witness':
        setFormData(prev => ({
          ...prev,
          witnessSignatures: {
            ...prev.witnessSignatures,
            [currentWitnessSignatureId]: signature
          }
        }));
        toast.success('✍️ Firma del testigo guardada');
        break;
    }
    
    setShowSignatureModal(false);
  };

  const generateAccidentPDF = (): jsPDF => {
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

    // Badge "CRÍTICO"
    doc.setFillColor(220, 38, 38);
    doc.roundedRect(pageWidth - 55, 12, 40, 8, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('ACCIDENTE CRÍTICO', pageWidth - 53, 17);

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
    doc.text('INFORME DE ACCIDENTE LABORAL', pageWidth / 2, yPos, { align: 'center' });

    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(`DIAT N° ${formData.diatNumber || 'Pendiente'}`, pageWidth / 2, yPos, { align: 'center' });

    // Código de verificación
    yPos += 8;
    const verificationCode = `VER-${Date.now().toString(36).toUpperCase()}`;
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPos - 5, pageWidth - 30, 8, 'F');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'bold');
    doc.text(`Código de Verificación: ${verificationCode}`, pageWidth / 2, yPos, { align: 'center' });

    // SECCIÓN 1: INFORMACIÓN DEL ACCIDENTE
    yPos += 15;
    doc.setFillColor(0, 85, 164);
    doc.rect(15, yPos - 4, pageWidth - 30, 7, 'F');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('1. INFORMACIÓN DEL ACCIDENTE', 17, yPos);

    yPos += 10;
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'bold');
    doc.text('Sector:', 17, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.sectorName || formData.sector, 50, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Ubicación Específica:', 17, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.specificLocation, 55, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha del Accidente:', 17, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${formData.date} ${formData.time}`, 55, yPos);

    // SECCIÓN 2: TRABAJADOR ACCIDENTADO
    yPos += 12;
    doc.setFillColor(0, 85, 164);
    doc.rect(15, yPos - 4, pageWidth - 30, 7, 'F');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('2. TRABAJADOR ACCIDENTADO', 17, yPos);

    const worker = MOCK_WORKERS.find(w => w.id === formData.injuredWorker);
    if (worker) {
      yPos += 10;
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'bold');
      doc.text('Nombre:', 17, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(worker.name, 50, yPos);

      yPos += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('RUT:', 17, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(worker.rut, 50, yPos);

      yPos += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('Cargo:', 17, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(worker.position, 50, yPos);

      yPos += 6;
      doc.setFont('helvetica', 'bold');
      doc.text('Departamento:', 17, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(worker.department, 50, yPos);
    }

    // SECCIÓN 3: DESCRIPCIÓN DEL ACCIDENTE
    yPos += 12;
    doc.setFillColor(0, 85, 164);
    doc.rect(15, yPos - 4, pageWidth - 30, 7, 'F');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('3. DESCRIPCIÓN DEL ACCIDENTE', 17, yPos);

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

    // SECCIÓN 4: TESTIGOS
    if (formData.witnessStatements.length > 0) {
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
      doc.text('4. DECLARACIONES DE TESTIGOS', 17, yPos);

      formData.witnessStatements.forEach((statement, index) => {
        if (statement.witness && statement.statement) {
          yPos += 10;
          const witness = MOCK_WORKERS.find(w => w.id === statement.witness);
          if (witness) {
            doc.setFontSize(9);
            doc.setTextColor(60, 60, 60);
            doc.setFont('helvetica', 'bold');
            doc.text(`Testigo ${index + 1}: ${witness.name}`, 17, yPos);
            yPos += 6;
            doc.setFont('helvetica', 'normal');
            const stmtLines = doc.splitTextToSize(statement.statement, pageWidth - 34);
            stmtLines.forEach((line: string) => {
              if (yPos > 270) {
                doc.addPage();
                yPos = 20;
              }
              doc.text(line, 17, yPos);
              yPos += 5;
            });
          }
        }
      });
    }

    // SECCIÓN 5: FIRMAS
    yPos += 12;
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFillColor(0, 85, 164);
    doc.rect(15, yPos - 4, pageWidth - 30, 7, 'F');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('5. FIRMAS Y VALIDACIÓN', 17, yPos);

    yPos += 15;
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);

    // Firma Prevencionista
    if (formData.preventionistSignature) {
      doc.setFont('helvetica', 'bold');
      doc.text('Prevencionista de Riesgos:', 17, yPos);
      yPos += 6;
      try {
        doc.addImage(formData.preventionistSignature, 'PNG', 17, yPos, 40, 15);
      } catch (e) {
        doc.setFont('helvetica', 'italic');
        doc.text('[Firma Digital]', 17, yPos + 7);
      }
      yPos += 18;
      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha: ${now.toLocaleDateString('es-CL')} ${now.toLocaleTimeString('es-CL')}`, 17, yPos);
    }

    // Firma Gerente
    yPos += 10;
    if (formData.managerSignature) {
      doc.setFont('helvetica', 'bold');
      doc.text('Gerente / Supervisor:', 17, yPos);
      yPos += 6;
      try {
        doc.addImage(formData.managerSignature, 'PNG', 17, yPos, 40, 15);
      } catch (e) {
        doc.setFont('helvetica', 'italic');
        doc.text('[Firma Digital]', 17, yPos + 7);
      }
      yPos += 18;
      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha: ${now.toLocaleDateString('es-CL')} ${now.toLocaleTimeString('es-CL')}`, 17, yPos);
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `SafeTrack Chile - Informe de Accidente Laboral | Página ${i} de ${pageCount} | ${verificationCode}`,
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
    // Validaciones
    if (!formData.sector) {
      toast.error('Sector requerido', { description: 'Selecciona el sector donde ocurrió el accidente' });
      return;
    }
    if (!formData.specificLocation) {
      toast.error('Ubicación específica requerida', { description: 'Indica el lugar exacto del accidente' });
      return;
    }
    if (!formData.injuredWorker) {
      toast.error('Trabajador accidentado requerido', { description: 'Selecciona el trabajador afectado' });
      return;
    }
    if (!formData.description) {
      toast.error('Descripción requerida', { description: 'Describe cómo ocurrió el accidente' });
      return;
    }
    if (!formData.preventionistSignature) {
      toast.error('Firma del prevencionista requerida');
      return;
    }
    if (!formData.managerSignature) {
      toast.error('Firma del gerente requerida');
      return;
    }

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
      <div className="bg-gradient-to-r from-red-700 to-orange-600 dark:from-red-800 dark:to-orange-700 border-b border-red-600 dark:border-red-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver</span>
            </button>
            
            <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
              <Clock className="w-3 h-3 mr-1" />
              {formData.accidentDate} {formData.accidentTime}
            </Badge>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-white text-xl lg:text-2xl mb-1 font-bold">
                🚨 Reporte de Accidente Laboral
              </h1>
              <p className="text-white/80 text-sm">
                {formData.injuredWorker 
                  ? `Trabajador: ${formData.injuredWorker.name}` 
                  : 'Registro oficial según Ley 16.744'}
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

        {/* PASO 1: Sector */}
        <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label className="text-slate-900 dark:text-white mb-1 block">
                PASO 1: Sector Donde Ocurrió el Accidente *
              </Label>
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                Selecciona el área donde sucedió el accidente
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

          {formData.sector && (
            <div className="mt-4">
              <Label className="text-slate-900 dark:text-white mb-2 block">
                Lugar Específico Dentro del Sector *
              </Label>
              <Input
                value={formData.specificLocation}
                onChange={(e) => setFormData(prev => ({ ...prev, specificLocation: e.target.value }))}
                placeholder="Ej: Pasillo central, junto a máquina cortadora #3"
                className="h-12"
              />
            </div>
          )}
        </Card>

        {/* PASO 2: Trabajador Accidentado */}
        {formData.sector && formData.specificLocation && (
          <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Label className="text-slate-900 dark:text-white mb-1 block">
                  PASO 2: Trabajador Accidentado *
                </Label>
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  Busca y selecciona el trabajador afectado
                </p>
              </div>
              <User className="w-5 h-5 text-orange-600" />
            </div>

            {formData.injuredWorker ? (
              <div 
                onClick={() => setShowWorkerPicker(true)}
                className="p-4 bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-300 dark:border-orange-800 rounded-lg cursor-pointer hover:border-orange-500 dark:hover:border-orange-600 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-600 text-white font-bold">
                      {formData.injuredWorker.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {formData.injuredWorker.name}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-zinc-400">
                        RUT: {formData.injuredWorker.rut} • {formData.injuredWorker.position}
                      </div>
                    </div>
                  </div>
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setShowWorkerPicker(true)}
                variant="outline"
                className="w-full h-auto py-4 border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-orange-500 dark:hover:border-orange-600"
              >
                <User className="w-5 h-5 mr-2" />
                Buscar Trabajador
              </Button>
            )}
          </Card>
        )}

        {/* PASO 3: Fecha y Hora (Automáticas) */}
        {formData.injuredWorker && (
          <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                  Fecha y Hora del Accidente (Capturadas Automáticamente)
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600 dark:text-zinc-400 mb-1">Fecha del accidente:</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {new Date(formData.accidentDate).toLocaleDateString('es-CL', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 dark:text-zinc-400 mb-1">Hora del accidente:</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{formData.accidentTime}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* PASO 4: Descripción del Accidente */}
        {formData.injuredWorker && (
          <>
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <Label className="text-slate-900 dark:text-white mb-3 block">
                PASO 3: ¿Cómo Ocurrió el Accidente? *
              </Label>
              
              <VoiceInput
                onTranscript={(transcript) => setFormData(prev => ({ 
                  ...prev, 
                  description: prev.description + ' ' + transcript 
                }))}
                variant="card"
              />

              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe detalladamente: secuencia de eventos, actividad que realizaba, factores que contribuyeron..."
                className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 min-h-[120px] mt-3"
              />
            </Card>

            {/* Fotos del Lugar del Accidente */}
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-slate-900 dark:text-white">
                  Fotos del Lugar del Accidente
                </Label>
                <div className="flex gap-2">
                  <Button onClick={() => handleAddPhoto('scenePhotos')} size="sm" variant="outline">
                    <Camera className="w-4 h-4 mr-1" />
                    Foto
                  </Button>
                  <Button onClick={() => handleAddVideo('scenePhotos')} size="sm" variant="outline">
                    <Video className="w-4 h-4 mr-1" />
                    Video
                  </Button>
                </div>
              </div>

              {formData.scenePhotos.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {formData.scenePhotos.map((item) => (
                    <div key={item.id} className="relative group">
                      {item.type === 'photo' ? (
                        <img
                          src={item.url}
                          alt="Lugar del accidente"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="relative w-full h-32 bg-slate-200 dark:bg-zinc-800 rounded-lg overflow-hidden">
                          <img
                            src={item.thumbnail}
                            alt="Video thumbnail"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <PlayCircle className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => handleRemoveMedia('scenePhotos', item.id)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {item.type === 'photo' ? '📷' : '🎥'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-zinc-500 italic text-center py-4">
                  No hay fotos o videos del lugar
                </p>
              )}
            </Card>

            {/* Fotos de Lesiones */}
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-slate-900 dark:text-white">
                  Fotos de Lesiones (si aplica)
                </Label>
                <div className="flex gap-2">
                  <Button onClick={() => handleAddPhoto('injuryPhotos')} size="sm" variant="outline">
                    <Camera className="w-4 h-4 mr-1" />
                    Foto
                  </Button>
                  <Button onClick={() => handleAddVideo('injuryPhotos')} size="sm" variant="outline">
                    <Video className="w-4 h-4 mr-1" />
                    Video
                  </Button>
                </div>
              </div>

              {formData.injuryPhotos.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {formData.injuryPhotos.map((item) => (
                    <div key={item.id} className="relative group">
                      {item.type === 'photo' ? (
                        <img
                          src={item.url}
                          alt="Lesión"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="relative w-full h-32 bg-slate-200 dark:bg-zinc-800 rounded-lg overflow-hidden">
                          <img
                            src={item.thumbnail}
                            alt="Video thumbnail"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <PlayCircle className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => handleRemoveMedia('injuryPhotos', item.id)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {item.type === 'photo' ? '📷' : '🎥'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-zinc-500 italic text-center py-4">
                  No hay fotos o videos de lesiones
                </p>
              )}
            </Card>

            {/* Evidencia Adicional */}
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-slate-900 dark:text-white">
                  Evidencia Adicional (EPP, herramientas, etc.)
                </Label>
                <div className="flex gap-2">
                  <Button onClick={() => handleAddPhoto('evidencePhotos')} size="sm" variant="outline">
                    <Camera className="w-4 h-4 mr-1" />
                    Foto
                  </Button>
                  <Button onClick={() => handleAddVideo('evidencePhotos')} size="sm" variant="outline">
                    <Video className="w-4 h-4 mr-1" />
                    Video
                  </Button>
                </div>
              </div>

              {formData.evidencePhotos.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {formData.evidencePhotos.map((item) => (
                    <div key={item.id} className="relative group">
                      {item.type === 'photo' ? (
                        <img
                          src={item.url}
                          alt="Evidencia"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="relative w-full h-32 bg-slate-200 dark:bg-zinc-800 rounded-lg overflow-hidden">
                          <img
                            src={item.thumbnail}
                            alt="Video thumbnail"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <PlayCircle className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      )}
                      <button
                        onClick={() => handleRemoveMedia('evidencePhotos', item.id)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {item.type === 'photo' ? '📷' : '🎥'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-zinc-500 italic text-center py-4">
                  No hay evidencia adicional
                </p>
              )}
            </Card>

            {/* Declaraciones de Testigos */}
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-slate-900 dark:text-white">
                  <Users className="w-4 h-4 inline mr-1" />
                  Declaraciones de Testigos
                </Label>
                <Button onClick={handleAddWitnessStatement} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar Testigo
                </Button>
              </div>

              {formData.witnessStatements.length > 0 ? (
                <div className="space-y-4">
                  {formData.witnessStatements.map((statement, index) => (
                    <Card key={statement.id} className="p-4 bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          {statement.witness ? (
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold">
                                {statement.witness.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">
                                  {statement.witness.name}
                                </p>
                                <p className="text-xs text-slate-600 dark:text-zinc-400">
                                  {statement.witness.position} • {statement.witness.rut}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <Button
                              onClick={() => {
                                setCurrentStatementIndex(index);
                                setShowWitnessPicker(true);
                              }}
                              size="sm"
                              variant="outline"
                              className="mb-2"
                            >
                              <User className="w-4 h-4 mr-1" />
                              Seleccionar Testigo
                            </Button>
                          )}

                          <VoiceInput
                            onTranscript={(transcript) => handleWitnessTranscript(transcript, index)}
                            variant="compact"
                          />

                          <Textarea
                            value={statement.statement}
                            onChange={(e) => {
                              const newStatements = [...formData.witnessStatements];
                              newStatements[index].statement = e.target.value;
                              setFormData(prev => ({ ...prev, witnessStatements: newStatements }));
                            }}
                            placeholder="Declaración del testigo: qué vio, qué escuchó, en qué momento..."
                            className="min-h-[80px] mt-2"
                          />

                          {statement.witness && (
                            <div className="mt-3">
                              {formData.witnessSignatures[statement.witness.id] ? (
                                <div>
                                  <p className="text-xs text-slate-600 dark:text-zinc-400 mb-2">
                                    Firma del testigo:
                                  </p>
                                  <img
                                    src={formData.witnessSignatures[statement.witness.id]}
                                    alt="Firma testigo"
                                    className="border border-slate-200 dark:border-zinc-700 rounded p-1 bg-white h-16"
                                  />
                                  <Button
                                    onClick={() => openSignatureModal('witness', statement.witness!.id)}
                                    size="sm"
                                    variant="outline"
                                    className="mt-2"
                                  >
                                    <Pencil className="w-3 h-3 mr-1" />
                                    Modificar Firma
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  onClick={() => openSignatureModal('witness', statement.witness!.id)}
                                  size="sm"
                                  variant="outline"
                                >
                                  <Pencil className="w-4 h-4 mr-1" />
                                  Firmar Declaración
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleRemoveStatement(statement.id)}
                          className="text-red-600 hover:text-red-700 ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-zinc-500 italic text-center py-4">
                  No hay declaraciones de testigos
                </p>
              )}
            </Card>

            {/* Acciones Inmediatas */}
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <Label className="text-slate-900 dark:text-white mb-3 block">
                Acciones Inmediatas Tomadas
              </Label>
              <Textarea
                value={formData.immediateActions}
                onChange={(e) => setFormData(prev => ({ ...prev, immediateActions: e.target.value }))}
                placeholder="Primeros auxilios prestados, aislamiento de área, llamada a emergencias, etc."
                className="min-h-[80px]"
              />
            </Card>

            {/* Atención Médica */}
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <Label className="text-slate-900 dark:text-white mb-3 block">
                Atención Médica Recibida
              </Label>
              <Textarea
                value={formData.medicalAttention}
                onChange={(e) => setFormData(prev => ({ ...prev, medicalAttention: e.target.value }))}
                placeholder="Mutual, clínica, hospital, diagnóstico preliminar, derivación..."
                className="min-h-[80px]"
              />
            </Card>

            {/* Análisis de Causas */}
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <Label className="text-slate-900 dark:text-white mb-3 block">
                Análisis Preliminar de Causas
              </Label>
              <Textarea
                value={formData.causeAnalysis}
                onChange={(e) => setFormData(prev => ({ ...prev, causeAnalysis: e.target.value }))}
                placeholder="Causas inmediatas y básicas identificadas..."
                className="min-h-[100px]"
              />
            </Card>

            {/* Firmas */}
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                <Shield className="w-5 h-5 inline mr-2" />
                Firmas Requeridas
              </h3>

              <div className="space-y-4">
                {/* Firma Prevencionista */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white mb-1">
                        Prevencionista de Riesgos *
                      </p>
                      {formData.preventionistSignature ? (
                        <img
                          src={formData.preventionistSignature}
                          alt="Firma prevencionista"
                          className="border border-slate-200 dark:border-zinc-700 rounded p-1 bg-white h-16 mb-2"
                        />
                      ) : (
                        <p className="text-sm text-slate-600 dark:text-zinc-400 mb-2">
                          Sin firma
                        </p>
                      )}
                      <Button
                        onClick={() => openSignatureModal('preventionist')}
                        size="sm"
                        variant="outline"
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        {formData.preventionistSignature ? 'Modificar' : 'Firmar'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Firma Gerente */}
                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white mb-1">
                        Gerente General *
                      </p>
                      {formData.managerSignature ? (
                        <img
                          src={formData.managerSignature}
                          alt="Firma gerente"
                          className="border border-slate-200 dark:border-zinc-700 rounded p-1 bg-white h-16 mb-2"
                        />
                      ) : (
                        <p className="text-sm text-slate-600 dark:text-zinc-400 mb-2">
                          Sin firma
                        </p>
                      )}
                      <Button
                        onClick={() => openSignatureModal('manager')}
                        size="sm"
                        variant="outline"
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        {formData.managerSignature ? 'Modificar' : 'Firmar'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Firma Trabajador Accidentado */}
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white mb-1">
                        Trabajador Accidentado
                      </p>
                      <p className="text-sm text-slate-600 dark:text-zinc-400 mb-2">
                        {formData.injuredWorker?.name}
                      </p>
                    </div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.injuredWorkerCanSign}
                        onChange={(e) => setFormData(prev => ({ ...prev, injuredWorkerCanSign: e.target.checked }))}
                      />
                      <span className="text-xs text-slate-600 dark:text-zinc-400">
                        En condiciones de firmar
                      </span>
                    </label>
                  </div>

                  {formData.injuredWorkerCanSign ? (
                    <>
                      {formData.injuredWorkerSignature ? (
                        <img
                          src={formData.injuredWorkerSignature}
                          alt="Firma trabajador"
                          className="border border-slate-200 dark:border-zinc-700 rounded p-1 bg-white h-16 mb-2"
                        />
                      ) : (
                        <p className="text-sm text-slate-600 dark:text-zinc-400 mb-2">
                          Sin firma
                        </p>
                      )}
                      <Button
                        onClick={() => openSignatureModal('injured')}
                        size="sm"
                        variant="outline"
                      >
                        <Pencil className="w-4 h-4 mr-1" />
                        {formData.injuredWorkerSignature ? 'Modificar' : 'Firmar'}
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-amber-700 dark:text-amber-300 italic">
                      El trabajador no está en condiciones de firmar (derivado a centro médico)
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* Resumen de Envío */}
            <Card className="p-6 bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 dark:text-white mb-3">
                    Este informe se enviará a:
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-green-600" />
                        <p className="font-medium text-slate-900 dark:text-white text-sm">
                          Email a:
                        </p>
                      </div>
                      <ul className="text-sm text-slate-600 dark:text-zinc-400 space-y-1 ml-6">
                        <li>• Gerencia General</li>
                        <li>• Recursos Humanos</li>
                        <li>• TI (para revisión de cámaras de seguridad)</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="w-4 h-4 text-green-600" />
                        <p className="font-medium text-slate-900 dark:text-white text-sm">
                          WhatsApp a:
                        </p>
                      </div>
                      <ul className="text-sm text-slate-600 dark:text-zinc-400 space-y-1 ml-6">
                        <li>• Gerencia General</li>
                        <li>• Recursos Humanos</li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      <strong>Importante:</strong> Este informe se registrará automáticamente en el sistema de SUSESO según normativa vigente.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Botón Enviar */}
            <Button
              onClick={handleSubmit}
              className="w-full bg-red-600 hover:bg-red-700 text-white h-14 text-lg"
              disabled={!formData.preventionistSignature || !formData.managerSignature}
            >
              <Send className="w-5 h-5 mr-2" />
              Enviar Informe de Accidente
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
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Selector de Trabajador */}
      {showWorkerPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-t-2xl lg:rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Buscar Trabajador
                </h3>
                <button
                  onClick={() => {
                    setShowWorkerPicker(false);
                    setWorkerSearchQuery('');
                  }}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={workerSearchQuery}
                  onChange={(e) => setWorkerSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre, RUT o cargo..."
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>

            <div className="p-6 space-y-3 overflow-y-auto max-h-[50vh]">
              {filteredWorkers.length > 0 ? (
                filteredWorkers.map(worker => (
                  <button
                    key={worker.id}
                    onClick={() => handleSelectWorker(worker)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      formData.injuredWorker?.id === worker.id
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                        : 'border-slate-200 dark:border-zinc-800 hover:border-orange-300 dark:hover:border-orange-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-600 text-white font-bold">
                        {worker.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {worker.name}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-zinc-400">
                          RUT: {worker.rut} • {worker.position} • {worker.department}
                        </div>
                      </div>
                      {formData.injuredWorker?.id === worker.id && (
                        <CheckCircle className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-slate-400 dark:text-zinc-600 mx-auto mb-3" />
                  <p className="text-slate-600 dark:text-zinc-400">
                    No se encontraron trabajadores
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Selector de Testigo */}
      {showWitnessPicker && currentStatementIndex !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-t-2xl lg:rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Seleccionar Testigo
                </h3>
                <button
                  onClick={() => {
                    setShowWitnessPicker(false);
                    setWitnessSearchQuery('');
                  }}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={witnessSearchQuery}
                  onChange={(e) => setWitnessSearchQuery(e.target.value)}
                  placeholder="Buscar testigo por nombre o RUT..."
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>

            <div className="p-6 space-y-3 overflow-y-auto max-h-[50vh]">
              {filteredWitnesses.length > 0 ? (
                filteredWitnesses.map(worker => (
                  <button
                    key={worker.id}
                    onClick={() => handleSelectWitness(worker, currentStatementIndex)}
                    className="w-full p-4 rounded-lg border-2 border-slate-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-800 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold">
                        {worker.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {worker.name}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-zinc-400">
                          {worker.position} • {worker.rut}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-400 dark:text-zinc-600 mx-auto mb-3" />
                  <p className="text-slate-600 dark:text-zinc-400">
                    No se encontraron testigos
                  </p>
                </div>
              )}
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
          documentType="INFORME DE ACCIDENTE LABORAL"
          documentTitle={`Accidente de ${formData.injuredWorker?.name || 'Trabajador'} - ${formData.sectorName}`}
          company="Constructora Los Andes S.A."
          documentData={{
            sector: formData.sectorName,
            specificLocation: formData.specificLocation,
            branch: formData.location,
            preventionist: 'Juan Pérez Silva',
            content: formData.description,
            causeAnalysis: formData.causeAnalysis,
            immediateActions: formData.immediateActions,
            medicalAttention: formData.medicalAttention,
            location: formData.specificLocation,
            gps: formData.location,
            accidentDate: formData.accidentDate,
            accidentTime: formData.accidentTime,
            reportDate: formData.reportDate,
            reportTime: formData.reportTime,
            scenePhotos: formData.scenePhotos.length,
            injuryPhotos: formData.injuryPhotos.length,
            evidencePhotos: formData.evidencePhotos.length
          }}
          workers={formData.injuredWorker ? [{
            id: formData.injuredWorker.id,
            name: formData.injuredWorker.name,
            rut: formData.injuredWorker.rut,
            position: formData.injuredWorker.position,
            department: formData.injuredWorker.department,
            email: formData.injuredWorker.email,
            signed: true,
            signedAt: new Date().toLocaleString('es-CL'),
            signature: formData.injuredWorkerSignature || undefined
          }] : []}
          onClose={() => setShowDocumentWorkflow(false)}
          onSendComplete={() => {
            setShowDocumentWorkflow(false);
            onSubmit(formData);
          }}
        />
      )}
    </div>
  );
}
