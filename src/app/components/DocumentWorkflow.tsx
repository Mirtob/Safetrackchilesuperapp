import { useState } from 'react';
import { 
  X, 
  FileText, 
  PenTool, 
  Send, 
  CheckCircle2,
  Download,
  Eye,
  Mail,
  MessageCircle,
  Building2,
  Users,
  User,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Shield,
  Clock,
  MapPin,
  Calendar,
  CheckSquare,
  Loader2
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

interface DocumentMetadata {
  type: 'incident' | 'talk' | 'epp-delivery' | 'inspection' | 'monthly-plan' | 'certificate' | 'other';
  title: string;
  subtitle?: string;
  code: string;
  date: string;
  location?: string;
  company: string;
  branch: string;
  author: {
    name: string;
    role: string;
    rut: string;
  };
  relatedWorkers?: {
    name: string;
    rut: string;
    email?: string;
    phone?: string;
  }[];
}

interface DocumentRecipient {
  name: string;
  email: string;
  phone?: string;
  role: 'rrhh' | 'management' | 'worker' | 'preventionist';
  required: boolean;
}

interface DocumentWorkflowProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: DocumentMetadata;
  documentContent: React.ReactNode; // El contenido del documento para previsualizar
  onComplete: (result: {
    signed: boolean;
    savedToVault: boolean;
    sentTo: string[];
    downloadPath: string;
  }) => void;
}

type WorkflowStep = 'preview' | 'signature' | 'recipients' | 'processing' | 'complete';

export function DocumentWorkflow({ 
  isOpen, 
  onClose, 
  metadata, 
  documentContent,
  onComplete 
}: DocumentWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('preview');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<DocumentRecipient[]>([
    {
      name: 'María González',
      email: 'rrhh@empresa.cl',
      phone: '+56912345678',
      role: 'rrhh',
      required: true
    },
    {
      name: 'Carlos Pérez',
      email: 'gerencia@empresa.cl',
      phone: '+56912345679',
      role: 'management',
      required: true
    },
    {
      name: metadata.author.name,
      email: 'prevencionista@empresa.cl',
      phone: '+56912345680',
      role: 'preventionist',
      required: true
    },
    ...(metadata.relatedWorkers?.map(worker => ({
      name: worker.name,
      email: worker.email || 'no-email@empresa.cl',
      phone: worker.phone,
      role: 'worker' as const,
      required: false
    })) || [])
  ]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>(
    recipients.filter(r => r.required).map(r => r.email)
  );
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [downloadPath, setDownloadPath] = useState('');

  if (!isOpen) return null;

  const getDocumentTypeIcon = () => {
    switch (metadata.type) {
      case 'incident': return <AlertCircle className="w-6 h-6" />;
      case 'talk': return <Users className="w-6 h-6" />;
      case 'epp-delivery': return <Shield className="w-6 h-6" />;
      case 'inspection': return <CheckSquare className="w-6 h-6" />;
      case 'monthly-plan': return <Calendar className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  const getDocumentTypeColor = () => {
    switch (metadata.type) {
      case 'incident': return 'text-red-600 dark:text-red-400';
      case 'talk': return 'text-blue-600 dark:text-blue-400';
      case 'epp-delivery': return 'text-green-600 dark:text-green-400';
      case 'inspection': return 'text-orange-600 dark:text-orange-400';
      case 'monthly-plan': return 'text-purple-600 dark:text-purple-400';
      default: return 'text-slate-600 dark:text-zinc-400';
    }
  };

  const getStepStatus = (step: WorkflowStep) => {
    const steps: WorkflowStep[] = ['preview', 'signature', 'recipients', 'processing', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(step);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'preview':
        setCurrentStep('signature');
        break;
      case 'signature':
        if (signatureData) {
          setCurrentStep('recipients');
        }
        break;
      case 'recipients':
        if (selectedRecipients.length > 0) {
          handleProcessDocument();
        }
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'signature':
        setCurrentStep('preview');
        break;
      case 'recipients':
        setCurrentStep('signature');
        break;
    }
  };

  const handleProcessDocument = async () => {
    setCurrentStep('processing');
    setProcessing(true);

    // Simular proceso de guardado y envío
    const steps = [
      { message: 'Generando PDF del documento...', delay: 1000 },
      { message: 'Guardando en bóveda documental...', delay: 1500 },
      { message: 'Enviando por correo electrónico...', delay: 1200 },
      { message: 'Enviando por WhatsApp...', delay: 1000 },
      { message: 'Finalizando proceso...', delay: 800 }
    ];

    for (const step of steps) {
      setProcessingStep(step.message);
      await new Promise(resolve => setTimeout(resolve, step.delay));
    }

    // Generar path de descarga
    const filename = `${metadata.code}_${metadata.type}_${new Date().toISOString().split('T')[0]}.pdf`;
    setDownloadPath(`/documents/${filename}`);

    setProcessing(false);
    setCurrentStep('complete');

    // Notificar al componente padre
    setTimeout(() => {
      onComplete({
        signed: true,
        savedToVault: true,
        sentTo: selectedRecipients,
        downloadPath: filename
      });
    }, 500);
  };

  const toggleRecipient = (email: string) => {
    if (selectedRecipients.includes(email)) {
      // No permitir deseleccionar destinatarios requeridos
      const recipient = recipients.find(r => r.email === email);
      if (recipient?.required) return;
      setSelectedRecipients(selectedRecipients.filter(e => e !== email));
    } else {
      setSelectedRecipients([...selectedRecipients, email]);
    }
  };

  const handleDownloadPDF = () => {
    // Simular descarga de PDF
    const link = document.createElement('a');
    link.href = '#'; // En producción, aquí iría la URL real del PDF
    link.download = downloadPath.split('/').pop() || 'documento.pdf';
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-zinc-800 dark:to-zinc-900 px-6 py-5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 ${getDocumentTypeColor()}`}>
              {getDocumentTypeIcon()}
            </div>
            <div>
              <h2 className="text-white text-xl font-bold">
                Gestión Documental
              </h2>
              <p className="text-white/70 text-sm">
                {metadata.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={processing}
            className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="bg-slate-50 dark:bg-zinc-800/50 px-6 py-4 border-b border-slate-200 dark:border-zinc-700">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {[
              { id: 'preview' as const, label: 'Previsualizar', icon: Eye },
              { id: 'signature' as const, label: 'Firmar', icon: PenTool },
              { id: 'recipients' as const, label: 'Enviar', icon: Send },
              { id: 'processing' as const, label: 'Procesando', icon: Loader2 },
              { id: 'complete' as const, label: 'Completado', icon: CheckCircle2 }
            ].map((step, index) => {
              const status = getStepStatus(step.id);
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                        status === 'completed'
                          ? 'bg-green-600 border-green-600 text-white'
                          : status === 'active'
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-slate-200 dark:bg-zinc-700 border-slate-300 dark:border-zinc-600 text-slate-400 dark:text-zinc-500'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${step.id === 'processing' && status === 'active' ? 'animate-spin' : ''}`} />
                    </div>
                    <p
                      className={`text-xs mt-2 font-medium ${
                        status === 'active'
                          ? 'text-blue-600 dark:text-blue-400'
                          : status === 'completed'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-slate-500 dark:text-zinc-500'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                  {index < 4 && (
                    <div
                      className={`w-12 h-0.5 mx-2 -mt-6 transition-all ${
                        getStepStatus(
                          ['preview', 'signature', 'recipients', 'processing', 'complete'][index + 1] as WorkflowStep
                        ) === 'completed' || getStepStatus(
                          ['preview', 'signature', 'recipients', 'processing', 'complete'][index + 1] as WorkflowStep
                        ) === 'active'
                          ? 'bg-green-600'
                          : 'bg-slate-300 dark:bg-zinc-600'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Document Metadata */}
          <Card className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-blue-800 dark:text-blue-300 mb-1">Código</p>
                <p className="font-semibold text-blue-900 dark:text-blue-100">{metadata.code}</p>
              </div>
              <div>
                <p className="text-xs text-blue-800 dark:text-blue-300 mb-1">Fecha</p>
                <p className="font-semibold text-blue-900 dark:text-blue-100">{metadata.date}</p>
              </div>
              <div>
                <p className="text-xs text-blue-800 dark:text-blue-300 mb-1">Empresa</p>
                <p className="font-semibold text-blue-900 dark:text-blue-100">{metadata.company}</p>
              </div>
              <div>
                <p className="text-xs text-blue-800 dark:text-blue-300 mb-1">Sucursal</p>
                <p className="font-semibold text-blue-900 dark:text-blue-100">{metadata.branch}</p>
              </div>
            </div>
          </Card>

          {/* Step Content */}
          {currentStep === 'preview' && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Previsualización del Documento
                </h3>
              </div>
              <Card className="p-6 bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 max-h-[400px] overflow-y-auto">
                {documentContent}
              </Card>
              <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  ℹ️ Revisa cuidadosamente el documento antes de continuar. Una vez firmado, no podrá ser modificado.
                </p>
              </div>
            </div>
          )}

          {currentStep === 'signature' && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Firma Digital del Documento
                </h3>
              </div>
              
              <Card className="p-6">
                <div className="mb-6">
                  <p className="text-sm text-slate-600 dark:text-zinc-400 mb-4">
                    Firma digitalmente el documento para certificar su autenticidad y validez legal.
                  </p>
                  <div className="bg-slate-100 dark:bg-zinc-800 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-slate-600 dark:text-zinc-400 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{metadata.author.name}</p>
                        <p className="text-sm text-slate-600 dark:text-zinc-400">{metadata.author.role}</p>
                        <p className="text-xs text-slate-500 dark:text-zinc-500">RUT: {metadata.author.rut}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signature Canvas */}
                <div className="border-2 border-dashed border-slate-300 dark:border-zinc-600 rounded-lg p-8 bg-white dark:bg-zinc-900 min-h-[200px] flex items-center justify-center">
                  {!signatureData ? (
                    <div className="text-center">
                      <PenTool className="w-12 h-12 text-slate-400 dark:text-zinc-500 mx-auto mb-3" />
                      <p className="text-slate-600 dark:text-zinc-400 mb-4">
                        Haz clic para agregar tu firma digital
                      </p>
                      <Button
                        onClick={() => setSignatureData(`signature-${Date.now()}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <PenTool className="w-4 h-4 mr-2" />
                        Firmar Documento
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center w-full">
                      <div className="font-signature text-4xl text-blue-600 dark:text-blue-400 mb-4">
                        {metadata.author.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-zinc-500 mb-4">
                        Firmado el {new Date().toLocaleString('es-CL')}
                      </div>
                      <Badge className="bg-green-600 text-white border-0">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Firma válida
                      </Badge>
                      <Button
                        onClick={() => setSignatureData(null)}
                        variant="ghost"
                        className="mt-4 text-sm"
                      >
                        Firmar nuevamente
                      </Button>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-300">
                    🔒 Tu firma digital tiene validez legal según la Ley 19.799 de firma electrónica en Chile.
                  </p>
                </div>
              </Card>
            </div>
          )}

          {currentStep === 'recipients' && (
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Configuración de Envío
                </h3>
              </div>

              <Card className="p-6">
                <p className="text-sm text-slate-600 dark:text-zinc-400 mb-6">
                  Selecciona los destinatarios que recibirán el documento por correo electrónico y WhatsApp.
                </p>

                <div className="space-y-3">
                  {recipients.map((recipient) => {
                    const isSelected = selectedRecipients.includes(recipient.email);
                    const getRoleInfo = () => {
                      switch (recipient.role) {
                        case 'rrhh':
                          return { icon: Users, color: 'text-blue-600 dark:text-blue-400', label: 'Recursos Humanos' };
                        case 'management':
                          return { icon: Building2, color: 'text-purple-600 dark:text-purple-400', label: 'Gerencia' };
                        case 'preventionist':
                          return { icon: Shield, color: 'text-green-600 dark:text-green-400', label: 'Prevencionista' };
                        case 'worker':
                          return { icon: User, color: 'text-orange-600 dark:text-orange-400', label: 'Trabajador' };
                      }
                    };
                    const roleInfo = getRoleInfo();
                    const Icon = roleInfo.icon;

                    return (
                      <div
                        key={recipient.email}
                        onClick={() => toggleRecipient(recipient.email)}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/20'
                            : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-slate-300'
                        } ${recipient.required ? 'opacity-100' : 'opacity-100'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 dark:bg-zinc-700 ${roleInfo.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {recipient.name}
                              </p>
                              {recipient.required && (
                                <Badge className="bg-red-600 text-white border-0 text-xs">
                                  Obligatorio
                                </Badge>
                              )}
                              {isSelected && (
                                <Badge className="bg-green-600 text-white border-0 text-xs">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Seleccionado
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-zinc-500 mb-2">
                              {roleInfo.label}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-zinc-400">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {recipient.email}
                              </span>
                              {recipient.phone && (
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="w-3 h-3" />
                                  {recipient.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    📧 El documento será enviado automáticamente a {selectedRecipients.length} destinatario(s) seleccionado(s).
                  </p>
                </div>
              </Card>
            </div>
          )}

          {currentStep === 'processing' && (
            <div>
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-16 h-16 text-blue-600 dark:text-blue-400 animate-spin mb-6" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Procesando Documento
                </h3>
                <p className="text-slate-600 dark:text-zinc-400 mb-6 text-center max-w-md">
                  {processingStep}
                </p>
                <div className="w-full max-w-md bg-slate-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full animate-pulse" style={{ width: '70%' }} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 'complete' && (
            <div>
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  ¡Proceso Completado!
                </h3>
                <p className="text-slate-600 dark:text-zinc-400 mb-8 text-center max-w-md">
                  El documento ha sido firmado, guardado en la bóveda y enviado exitosamente.
                </p>

                <Card className="w-full max-w-2xl p-6 mb-6">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-4">
                    Resumen del Proceso
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-zinc-300">
                        Documento firmado digitalmente por {metadata.author.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-zinc-300">
                        Guardado en Bóveda Documental con código {metadata.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-zinc-300">
                        Enviado a {selectedRecipients.length} destinatario(s) por correo y WhatsApp
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-zinc-300">
                        PDF disponible para descarga
                      </span>
                    </div>
                  </div>
                </Card>

                <div className="flex gap-3">
                  <Button
                    onClick={handleDownloadPDF}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar PDF
                  </Button>
                  <Button
                    onClick={onClose}
                    variant="outline"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {currentStep !== 'processing' && currentStep !== 'complete' && (
          <div className="bg-slate-50 dark:bg-zinc-800/50 px-6 py-4 border-t border-slate-200 dark:border-zinc-700 flex items-center justify-between">
            <Button
              onClick={handleBack}
              variant="outline"
              disabled={currentStep === 'preview'}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Atrás
            </Button>

            <div className="text-sm text-slate-600 dark:text-zinc-400">
              {currentStep === 'preview' && 'Revisa el documento antes de continuar'}
              {currentStep === 'signature' && signatureData && '✅ Documento firmado correctamente'}
              {currentStep === 'recipients' && `${selectedRecipients.length} destinatario(s) seleccionado(s)`}
            </div>

            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 'signature' && !signatureData) ||
                (currentStep === 'recipients' && selectedRecipients.length === 0)
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {currentStep === 'recipients' ? 'Enviar Documento' : 'Continuar'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
