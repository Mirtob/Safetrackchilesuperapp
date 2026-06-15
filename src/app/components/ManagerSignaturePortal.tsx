import { useState } from 'react';
import { 
  CheckCircle2, 
  FileText, 
  Shield,
  MapPin,
  Clock,
  User,
  Building2,
  AlertTriangle,
  X,
  Check,
  Download
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';

interface ManagerSignaturePortalProps {
  documentId?: string;
  onBack?: () => void;
}

interface DocumentPreview {
  id: string;
  title: string;
  type: string;
  company: string;
  date: string;
  preventionist: string;
  content: string;
  findings?: string[];
  recommendations?: string[];
}

export function ManagerSignaturePortal({ documentId, onBack }: ManagerSignaturePortalProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Documento de ejemplo
  const document: DocumentPreview = {
    id: documentId || 'DOC-2026-001',
    title: 'Inspección Planeada - Obra Maipú',
    type: 'Inspección de Seguridad',
    company: 'Constructora Los Andes S.A.',
    date: '26 de Enero, 2026',
    preventionist: 'Juan Pérez Rodríguez',
    content: 'Se realizó inspección de seguridad en obra de construcción ubicada en Av. Pajaritos 1234, Maipú. Se verificaron condiciones generales de seguridad, uso de EPP, orden y aseo.',
    findings: [
      'Zona de acopio de materiales sin señalización adecuada',
      '3 trabajadores sin uso correcto de arnés en zona de altura',
      'Escalera con peldaño deteriorado en sector oriente',
      'Falta extintor ABC en bodega de herramientas'
    ],
    recommendations: [
      'Instalar señalética de seguridad en zona de acopio (Plazo: 48 horas)',
      'Capacitación inmediata sobre uso de arnés (Plazo: 24 horas)',
      'Reemplazar escalera deteriorada (Plazo: Inmediato)',
      'Adquirir e instalar extintor ABC 10kg (Plazo: 72 horas)'
    ]
  };

  const handleApprove = () => {
    setIsApproving(true);
    
    // Simular proceso de firma digital
    setTimeout(() => {
      // Obtener geolocalización (simulada)
      const location = { lat: -33.5082, lng: -70.7598 };
      const timestamp = new Date().toLocaleString('es-CL');
      const hash = `SHA256:${Math.random().toString(36).substring(2, 15)}...`;

      setApproved(true);
      setIsApproving(false);

      toast.success('Documento Firmado Digitalmente', {
        description: 'Se ha registrado tu aprobación con estampa digital certificada',
      });

      // En producción: enviar firma al backend
      console.log('Firma Digital Aplicada:', {
        documentId: document.id,
        signedBy: 'María González (Gerente)',
        timestamp,
        location,
        integrityHash: hash
      });
    }, 2000);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Debes especificar el motivo del rechazo');
      return;
    }

    toast.success('Documento rechazado', {
      description: 'El prevencionista recibirá una notificación con tus observaciones',
    });

    setShowRejectModal(false);
    // En producción: enviar rechazo al backend
  };

  if (approved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 flex items-center justify-center p-4">
        <Card className="bg-white dark:bg-zinc-800 border-green-200 dark:border-green-800 max-w-2xl w-full">
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            
            <h1 className="text-slate-900 dark:text-white text-2xl font-bold mb-2">
              ✅ Documento Legalmente Archivado
            </h1>
            <p className="text-slate-600 dark:text-zinc-400 mb-6">
              Tu firma digital ha sido registrada exitosamente
            </p>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 mb-6 text-left">
              <h3 className="text-slate-900 dark:text-white font-semibold mb-4">Detalles de la Firma Digital</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-slate-600 dark:text-zinc-400">Firmado por</p>
                    <p className="text-slate-900 dark:text-white font-medium">María González Contreras (Gerente General)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-slate-600 dark:text-zinc-400">Fecha y hora</p>
                    <p className="text-slate-900 dark:text-white font-medium">{new Date().toLocaleString('es-CL')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-slate-600 dark:text-zinc-400">Geolocalización</p>
                    <p className="text-slate-900 dark:text-white font-medium">-33.5082, -70.7598 (Santiago, Chile)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-slate-600 dark:text-zinc-400">Código de Integridad</p>
                    <p className="text-slate-900 dark:text-white font-mono text-xs break-all">
                      SHA256:{Math.random().toString(36).substring(2, 15)}7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar PDF Firmado
              </Button>
              {onBack && (
                <Button
                  onClick={onBack}
                  variant="outline"
                  className="flex-1"
                >
                  Volver
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-900">
      {/* Header Corporativo */}
      <div className="bg-gradient-to-r from-[#1A2B48] to-[#0055A4] text-white py-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">SafeTrack Chile</h1>
              <p className="text-blue-100 text-sm">Portal de Firma Digital para Gerencia</p>
            </div>
            <Shield className="w-12 h-12 opacity-50" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 lg:p-6 -mt-4">
        {/* Card Principal del Documento */}
        <Card className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 shadow-xl mb-6">
          <div className="p-6 lg:p-8">
            {/* Header del Documento */}
            <div className="border-b border-slate-200 dark:border-zinc-700 pb-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-slate-900 dark:text-white text-2xl font-bold mb-2">{document.title}</h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-0">
                      {document.type}
                    </Badge>
                    <span className="text-slate-600 dark:text-zinc-400 text-sm">ID: {document.id}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-600 dark:text-zinc-400">Empresa:</span>
                  <span className="text-slate-900 dark:text-white font-medium">{document.company}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-600 dark:text-zinc-400">Fecha:</span>
                  <span className="text-slate-900 dark:text-white font-medium">{document.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-600 dark:text-zinc-400">Prevencionista:</span>
                  <span className="text-slate-900 dark:text-white font-medium">{document.preventionist}</span>
                </div>
              </div>
            </div>

            {/* Contenido del Documento */}
            <div className="space-y-6">
              {/* Resumen */}
              <div>
                <h3 className="text-slate-900 dark:text-white font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Resumen de la Inspección
                </h3>
                <p className="text-slate-700 dark:text-zinc-300 text-sm leading-relaxed">
                  {document.content}
                </p>
              </div>

              {/* Hallazgos */}
              {document.findings && document.findings.length > 0 && (
                <div>
                  <h3 className="text-slate-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    Hallazgos Identificados ({document.findings.length})
                  </h3>
                  <div className="space-y-2">
                    {document.findings.map((finding, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3"
                      >
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-amber-700 dark:text-amber-400 text-xs font-semibold">{index + 1}</span>
                        </div>
                        <p className="text-slate-700 dark:text-zinc-300 text-sm">{finding}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recomendaciones */}
              {document.recommendations && document.recommendations.length > 0 && (
                <div>
                  <h3 className="text-slate-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    Acciones Correctivas Requeridas ({document.recommendations.length})
                  </h3>
                  <div className="space-y-2">
                    {document.recommendations.map((recommendation, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 rounded-lg p-3"
                      >
                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-green-700 dark:text-green-400 text-xs font-semibold">{index + 1}</span>
                        </div>
                        <p className="text-slate-700 dark:text-zinc-300 text-sm">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Información de Seguridad */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 mb-6">
          <div className="p-5">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-slate-900 dark:text-white font-semibold mb-1">Firma Digital Certificada</h4>
                <p className="text-sm text-slate-700 dark:text-zinc-300">
                  Al aprobar este documento, se aplicará una <strong>estampa digital</strong> que incluye:
                  tu firma electrónica, fecha y hora exacta, tu ubicación GPS actual, y un código hash SHA-256 
                  que garantiza la integridad del documento ante cualquier fiscalización de la Dirección del Trabajo.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Botones de Acción Flotantes */}
        <div className="sticky bottom-4 lg:bottom-6 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-2xl p-4">
          <div className="flex gap-3">
            <Button
              onClick={() => setShowRejectModal(true)}
              variant="outline"
              className="flex-1 border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 h-14"
            >
              <X className="w-5 h-5 mr-2" />
              <div className="text-left">
                <div className="font-semibold">Rechazar</div>
                <div className="text-xs opacity-80">Enviar observaciones</div>
              </div>
            </Button>

            <Button
              onClick={handleApprove}
              disabled={isApproving}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-14"
            >
              {isApproving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  <div className="text-left">
                    <div className="font-semibold">Procesando...</div>
                    <div className="text-xs opacity-90">Aplicando firma digital</div>
                  </div>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  <div className="text-left">
                    <div className="font-semibold">Aprobar y Firmar</div>
                    <div className="text-xs opacity-90">Estampar firma digital</div>
                  </div>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Rechazo */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowRejectModal(false)}>
          <Card 
            className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-slate-900 dark:text-white text-xl mb-2">Rechazar Documento</h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400 mb-4">
                Por favor especifica el motivo del rechazo. El prevencionista recibirá tus observaciones.
              </p>
              
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ejemplo: Es necesario incluir fotografías de los hallazgos y replantear los plazos de las acciones correctivas..."
                className="w-full h-32 px-3 py-2 border border-slate-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => setShowRejectModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleReject}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Confirmar Rechazo
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
