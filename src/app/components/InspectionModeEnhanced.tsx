import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ArrowLeft, 
  QrCode, 
  Link2, 
  FileText, 
  Download, 
  Shield, 
  CheckCircle, 
  Send,
  AlertTriangle,
  Calendar,
  Printer,
  Mail,
  MessageCircle,
  Users,
  Building2,
  Clock,
  FileCheck,
  X,
  AlertCircle,
  ChevronDown,
  Eye,
  FileSignature
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Label } from '@/app/components/ui/label';
import { DocumentPreviewAndSend } from '@/app/components/DocumentPreviewAndSend';
import { toast } from 'sonner';

interface InspectionModeEnhancedProps {
  onBack: () => void;
}

interface DocumentItem {
  id: string;
  name: string;
  category: string;
  hasSigned: boolean;
  missingSignatures: string[];
  date: string;
  signers: string[];
}

type Period = 'month' | 'semester' | 'year';

// Base de datos simulada de documentos
const MOCK_DOCUMENTS: DocumentItem[] = [
  // Último mes
  { 
    id: '1', 
    name: 'Charla de Seguridad - Trabajo en Altura', 
    category: 'Capacitación', 
    hasSigned: true, 
    missingSignatures: [], 
    date: '2026-01-20',
    signers: ['Prevencionista', 'Trabajador (12)', 'Supervisor']
  },
  { 
    id: '2', 
    name: 'Inspección de Extintores - Bodega A', 
    category: 'Equipos de Emergencia', 
    hasSigned: true, 
    missingSignatures: [], 
    date: '2026-01-18',
    signers: ['Prevencionista', 'Jefe de Mantención']
  },
  { 
    id: '3', 
    name: 'Entrega de EPP - Cascos y Arneses', 
    category: 'Elementos de Protección', 
    hasSigned: false, 
    missingSignatures: ['Supervisor'], 
    date: '2026-01-15',
    signers: ['Prevencionista', 'Trabajador (5)']
  },
  { 
    id: '4', 
    name: 'Observación de Riesgo - Escalera Dañada', 
    category: 'ODI', 
    hasSigned: true, 
    missingSignatures: [], 
    date: '2026-01-12',
    signers: ['Prevencionista', 'Gerente']
  },
  { 
    id: '5', 
    name: 'Charla de Seguridad - Manejo Manual de Cargas', 
    category: 'Capacitación', 
    hasSigned: true, 
    missingSignatures: [], 
    date: '2026-01-10',
    signers: ['Prevencionista', 'Trabajador (15)', 'Supervisor']
  },
  
  // Último semestre (meses anteriores)
  { 
    id: '6', 
    name: 'Inspección Anual de Escaleras', 
    category: 'Equipos de Trabajo', 
    hasSigned: true, 
    missingSignatures: [], 
    date: '2025-12-28',
    signers: ['Prevencionista', 'Jefe de Mantención']
  },
  { 
    id: '7', 
    name: 'Charla de Seguridad - Riesgos Eléctricos', 
    category: 'Capacitación', 
    hasSigned: true, 
    missingSignatures: [], 
    date: '2025-12-15',
    signers: ['Prevencionista', 'Trabajador (18)', 'Supervisor']
  },
  { 
    id: '8', 
    name: 'Entrega de EPP - Guantes Dieléctricos', 
    category: 'Elementos de Protección', 
    hasSigned: false, 
    missingSignatures: ['Gerente'], 
    date: '2025-12-10',
    signers: ['Prevencionista', 'Trabajador (3)']
  },
  { 
    id: '9', 
    name: 'Inspección de Extintores - Todas las Áreas', 
    category: 'Equipos de Emergencia', 
    hasSigned: true, 
    missingSignatures: [], 
    date: '2025-11-20',
    signers: ['Prevencionista', 'Jefe de Mantención']
  },
  { 
    id: '10', 
    name: 'Simulacro de Evacuación', 
    category: 'Plan de Emergencia', 
    hasSigned: true, 
    missingSignatures: [], 
    date: '2025-10-15',
    signers: ['Prevencionista', 'Gerente', 'Comité Paritario']
  },
  
  // Último año (meses anteriores adicionales)
  { 
    id: '11', 
    name: 'Charla de Seguridad - Espacios Confinados', 
    category: 'Capacitación', 
    hasSigned: true, 
    missingSignatures: [], 
    date: '2025-09-20',
    signers: ['Prevencionista', 'Trabajador (10)', 'Supervisor']
  },
  { 
    id: '12', 
    name: 'Evaluación de Riesgos - Nuevas Instalaciones', 
    category: 'Gestión de Riesgos', 
    hasSigned: true, 
    missingSignatures: [], 
    date: '2025-08-10',
    signers: ['Prevencionista', 'Gerente', 'Mutual de Seguridad']
  },
  { 
    id: '13', 
    name: 'Entrega de EPP - Zapatos de Seguridad', 
    category: 'Elementos de Protección', 
    hasSigned: true, 
    missingSignatures: [], 
    date: '2025-07-15',
    signers: ['Prevencionista', 'Trabajador (25)', 'RRHH']
  },
  { 
    id: '14', 
    name: 'Inspección de Vehículos', 
    category: 'Equipos de Trabajo', 
    hasSigned: true, 
    missingSignatures: [], 
    date: '2025-06-20',
    signers: ['Prevencionista', 'Jefe de Transporte']
  },
  { 
    id: '15', 
    name: 'Capacitación Comité Paritario', 
    category: 'Capacitación', 
    hasSigned: true, 
    missingSignatures: [], 
    date: '2025-05-10',
    signers: ['Prevencionista', 'Comité Paritario (6)', 'Mutual']
  }
];

export function InspectionModeEnhanced({ onBack }: InspectionModeEnhancedProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDocumentList, setShowDocumentList] = useState(false);
  const [generatedPackageUrl, setGeneratedPackageUrl] = useState<string>('');
  const qrRef = useRef<HTMLDivElement>(null);

  const getPeriodLabel = (period: Period): string => {
    switch (period) {
      case 'month':
        return 'Último Mes';
      case 'semester':
        return 'Último Semestre (6 meses)';
      case 'year':
        return 'Último Año';
    }
  };

  const getPeriodDates = (period: Period): { from: Date; to: Date } => {
    const now = new Date();
    let from = new Date();

    switch (period) {
      case 'month':
        from.setMonth(now.getMonth() - 1);
        break;
      case 'semester':
        from.setMonth(now.getMonth() - 6);
        break;
      case 'year':
        from.setFullYear(now.getFullYear() - 1);
        break;
    }

    return { from, to: now };
  };

  const getFilteredDocuments = (): DocumentItem[] => {
    const { from } = getPeriodDates(selectedPeriod);
    
    return MOCK_DOCUMENTS.filter(doc => {
      const docDate = new Date(doc.date);
      return docDate >= from;
    });
  };

  const filteredDocs = getFilteredDocuments();
  const totalDocs = filteredDocs.length;
  const signedDocs = filteredDocs.filter(d => d.hasSigned).length;
  const unsignedDocs = filteredDocs.filter(d => !d.hasSigned);
  const canGenerate = unsignedDocs.length === 0;

  const handleGeneratePackage = () => {
    if (!canGenerate) {
      toast.error('❌ Documentos sin firmar', {
        description: `Hay ${unsignedDocs.length} documento(s) pendiente(s) de firma. Completa las firmas antes de generar el paquete.`,
        duration: 5000
      });
      return;
    }

    // Generar token único para el paquete
    const token = `INSP-PKG-${Date.now().toString(36).toUpperCase()}`;
    const baseUrl = window.location.origin;
    const packageUrl = `${baseUrl}/fiscalizacion/${token}`;

    setGeneratedPackageUrl(packageUrl);
    setShowQRModal(true);

    toast.success('✅ Paquete generado', {
      description: 'QR y enlace creados exitosamente',
      duration: 3000
    });
  };

  const handleDownloadPDF = () => {
    toast.success('📄 Descargando PDF...', {
      description: `Preparando ${totalDocs} documentos firmados`,
      duration: 3000
    });

    setTimeout(() => {
      toast.success('✅ PDF descargado', {
        description: `${totalDocs} documentos incluidos con todas las firmas`,
        duration: 4000
      });
    }, 2000);
  };

  const handleSendPackage = () => {
    if (!canGenerate) {
      toast.error('❌ No se puede enviar', {
        description: 'Completa las firmas pendientes primero',
        duration: 5000
      });
      return;
    }

    toast.success('📤 Enviando paquete...', { duration: 2000 });

    setTimeout(() => {
      toast.success('✅ Paquete enviado', {
        description: 'Notificaciones enviadas a Gerencia y RRHH',
        duration: 4000
      });
    }, 2500);

    setTimeout(() => {
      toast.info('📧 Email enviado a:', {
        description: '• Gerencia General\n• Recursos Humanos',
        duration: 4000
      });
    }, 3500);

    setTimeout(() => {
      toast.info('💬 WhatsApp enviado a:', {
        description: '• Gerencia General\n• Recursos Humanos',
        duration: 4000
      });
    }, 4500);
  };

  const handlePrintQR = () => {
    window.print();
    toast.success('🖨️ Imprimiendo código QR');
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(generatedPackageUrl);
    toast.success('✅ URL copiada al portapapeles');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Capacitación':
        return '📚';
      case 'Equipos de Emergencia':
        return '🧯';
      case 'Elementos de Protección':
        return '🦺';
      case 'ODI':
        return '⚠️';
      case 'Equipos de Trabajo':
        return '🔧';
      case 'Plan de Emergencia':
        return '🚨';
      case 'Gestión de Riesgos':
        return '📊';
      default:
        return '📄';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors pb-20 lg:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-700 dark:to-orange-700 border-b border-red-600 dark:border-red-700 sticky top-0 z-10">
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
              <Shield className="w-3 h-3 mr-1" />
              Modo Activo
            </Badge>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
              <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div className="flex-1">
              <h1 className="text-white text-xl lg:text-2xl mb-1 font-bold">
                🚨 Modo Fiscalización
              </h1>
              <p className="text-white/80 text-sm">
                Botón de pánico documental - Preparación de documentación
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Información importante */}
        <Card className="p-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
                ⚠️ Validación de Firmas Obligatoria
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-300 mb-2">
                <strong>IMPORTANTE:</strong> Solo se pueden enviar documentos con todas las firmas completas. Esta medida garantiza la validez legal de la documentación ante el ente fiscalizador.
              </p>
              <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-1">
                <li>• Verifica que todos los documentos estén firmados por las partes correspondientes</li>
                <li>• Los documentos sin firma aparecerán bloqueados y no se incluirán en el paquete</li>
                <li>• El sistema notificará automáticamente a Gerencia y RRHH por email y WhatsApp</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Selector de Periodo */}
        <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label className="text-slate-900 dark:text-white mb-1 block">
                Periodo de Documentación a Enviar
              </Label>
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                Selecciona según requerimiento del ente fiscalizador
              </p>
            </div>
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>

          {showPeriodSelector ? (
            <div className="space-y-2">
              {(['month', 'semester', 'year'] as Period[]).map((period) => (
                <button
                  key={period}
                  onClick={() => {
                    setSelectedPeriod(period);
                    setShowPeriodSelector(false);
                    toast.success('✅ Periodo seleccionado', {
                      description: getPeriodLabel(period)
                    });
                  }}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedPeriod === period
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                      : 'border-slate-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {getPeriodLabel(period)}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                        {period === 'month' && 'Últimos 30 días de actividad'}
                        {period === 'semester' && 'Últimos 6 meses de actividad'}
                        {period === 'year' && 'Últimos 12 meses de actividad'}
                      </div>
                    </div>
                    {selectedPeriod === period && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
              <Button
                onClick={() => setShowPeriodSelector(false)}
                variant="outline"
                className="w-full"
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setShowPeriodSelector(true)}
              className="w-full p-4 bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-300 dark:border-blue-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-600 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {getPeriodLabel(selectedPeriod)}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                    Click para cambiar periodo
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-slate-400" />
              </div>
            </button>
          )}
        </Card>

        {/* Resumen de Documentos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 dark:text-zinc-400">
                Total de Documentos
              </span>
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {totalDocs}
            </div>
            <Button
              onClick={() => setShowDocumentList(!showDocumentList)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Eye className="w-4 h-4 mr-1" />
              {showDocumentList ? 'Ocultar' : 'Ver'} Lista
            </Button>
          </Card>

          <Card className="p-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-800 dark:text-green-300">
                Con Firma Completa
              </span>
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-900 dark:text-green-300 mb-2">
              {signedDocs}
            </div>
            <div className="text-xs text-green-700 dark:text-green-400">
              ✅ Listos para envío
            </div>
          </Card>

          <Card className={`p-6 ${
            unsignedDocs.length > 0 
              ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800' 
              : 'bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${
                unsignedDocs.length > 0
                  ? 'text-red-800 dark:text-red-300'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}>
                Sin Firma Completa
              </span>
              <AlertTriangle className={`w-5 h-5 ${
                unsignedDocs.length > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-slate-400 dark:text-zinc-600'
              }`} />
            </div>
            <div className={`text-3xl font-bold mb-2 ${
              unsignedDocs.length > 0
                ? 'text-red-900 dark:text-red-300'
                : 'text-slate-900 dark:text-white'
            }`}>
              {unsignedDocs.length}
            </div>
            <div className={`text-xs ${
              unsignedDocs.length > 0
                ? 'text-red-700 dark:text-red-400'
                : 'text-slate-500 dark:text-zinc-500'
            }`}>
              {unsignedDocs.length > 0 ? '⚠️ Requieren atención' : '✅ Todo en orden'}
            </div>
          </Card>
        </div>

        {/* Lista de documentos */}
        {showDocumentList && (
          <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              📋 Documentos del Periodo Seleccionado
            </h3>

            <div className="space-y-3">
              {filteredDocs.map((doc) => (
                <Card 
                  key={doc.id} 
                  className={`p-4 ${
                    doc.hasSigned
                      ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getCategoryIcon(doc.category)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            {doc.name}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                            {doc.category} • {new Date(doc.date).toLocaleDateString('es-CL', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        {doc.hasSigned ? (
                          <Badge className="bg-green-600 text-white border-0">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Firmado
                          </Badge>
                        ) : (
                          <Badge className="bg-red-600 text-white border-0">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Sin Firmar
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <FileSignature className="w-3 h-3 text-slate-400" />
                        <span className="text-slate-600 dark:text-zinc-400">
                          Firmantes: {doc.signers.join(', ')}
                        </span>
                      </div>

                      {!doc.hasSigned && doc.missingSignatures.length > 0 && (
                        <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded border border-red-200 dark:border-red-800">
                          <p className="text-xs text-red-800 dark:text-red-300">
                            <strong>Falta firma de:</strong> {doc.missingSignatures.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Documentos sin firma (alerta) */}
        {unsignedDocs.length > 0 && (
          <Card className="p-6 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2">
                  ⚠️ Documentos Pendientes de Firma
                </h3>
                <p className="text-sm text-red-800 dark:text-red-300 mb-3">
                  Los siguientes documentos <strong>no pueden ser incluidos</strong> en el paquete hasta que estén completamente firmados:
                </p>
                <div className="space-y-2">
                  {unsignedDocs.map((doc) => (
                    <div 
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-lg border border-red-200 dark:border-red-800"
                    >
                      <div className="flex items-center gap-2">
                        <span>{getCategoryIcon(doc.category)}</span>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {doc.name}
                          </p>
                          <p className="text-xs text-red-700 dark:text-red-400">
                            Falta: {doc.missingSignatures.join(', ')}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="border-red-300 dark:border-red-700">
                        Gestionar Firmas
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Acciones */}
        <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            📤 Generar Paquete de Documentación
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Button
                onClick={handleGeneratePackage}
                disabled={!canGenerate}
                className={`h-auto py-4 ${
                  canGenerate
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-300 dark:bg-zinc-700 text-slate-500 dark:text-zinc-500 cursor-not-allowed'
                }`}
              >
                <QrCode className="w-5 h-5 mr-2" />
                <div className="text-left">
                  <div className="font-semibold">Generar QR y Enlace</div>
                  <div className="text-xs opacity-90">Para compartir digitalmente</div>
                </div>
              </Button>

              <Button
                onClick={handleDownloadPDF}
                disabled={!canGenerate}
                variant="outline"
                className="h-auto py-4"
              >
                <Download className="w-5 h-5 mr-2" />
                <div className="text-left">
                  <div className="font-semibold">Descargar PDF</div>
                  <div className="text-xs opacity-90">Entrega física firmada</div>
                </div>
              </Button>

              <Button
                onClick={handleSendPackage}
                disabled={!canGenerate}
                className={`h-auto py-4 ${
                  canGenerate
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-slate-300 dark:bg-zinc-700 text-slate-500 dark:text-zinc-500 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5 mr-2" />
                <div className="text-left">
                  <div className="font-semibold">Enviar Paquete</div>
                  <div className="text-xs opacity-90">Email + WhatsApp</div>
                </div>
              </Button>
            </div>

            {!canGenerate && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-900 dark:text-amber-200">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  <strong>No se puede generar el paquete.</strong> Primero completa las firmas pendientes en los {unsignedDocs.length} documento(s) sin firmar.
                </p>
              </div>
            )}
          </div>

          {canGenerate && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                    El paquete se enviará automáticamente a:
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-green-600" />
                        <p className="font-medium text-sm text-slate-900 dark:text-white">
                          Por Email:
                        </p>
                      </div>
                      <ul className="text-xs text-slate-600 dark:text-zinc-400 space-y-1">
                        <li>• Gerencia General</li>
                        <li>• Recursos Humanos</li>
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="w-4 h-4 text-green-600" />
                        <p className="font-medium text-sm text-slate-900 dark:text-white">
                          Por WhatsApp:
                        </p>
                      </div>
                      <ul className="text-xs text-slate-600 dark:text-zinc-400 space-y-1">
                        <li>• Gerencia General</li>
                        <li>• Recursos Humanos</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Modal: QR Code generado */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-white dark:bg-zinc-900 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  📦 Paquete de Documentación Generado
                </h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Info del paquete */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-lg">
                    <p className="text-xs text-slate-600 dark:text-zinc-400 mb-1">
                      Periodo
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {getPeriodLabel(selectedPeriod)}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-lg">
                    <p className="text-xs text-slate-600 dark:text-zinc-400 mb-1">
                      Documentos
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {signedDocs} firmados
                    </p>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center">
                  <div 
                    ref={qrRef}
                    className="p-6 bg-white rounded-lg border-4 border-blue-500 mb-4"
                  >
                    <QRCodeSVG
                      value={generatedPackageUrl}
                      size={280}
                      level="H"
                      includeMargin={true}
                    />
                  </div>

                  <p className="text-sm text-slate-600 dark:text-zinc-400 text-center mb-4">
                    Escanea este código QR para acceder al paquete de documentación
                  </p>

                  {/* URL */}
                  <div className="w-full p-3 bg-slate-100 dark:bg-zinc-800 rounded-lg">
                    <p className="text-xs text-slate-600 dark:text-zinc-400 mb-1">
                      URL de acceso directo:
                    </p>
                    <p className="text-xs font-mono text-slate-900 dark:text-white break-all">
                      {generatedPackageUrl}
                    </p>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={handlePrintQR}
                    variant="outline"
                    className="w-full"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir QR
                  </Button>
                  <Button
                    onClick={handleCopyUrl}
                    variant="outline"
                    className="w-full"
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    Copiar URL
                  </Button>
                </div>

                <Button
                  onClick={handleSendPackage}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar a Gerencia y RRHH
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}