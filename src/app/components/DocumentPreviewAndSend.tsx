import { useState, useEffect } from 'react';
import { 
  FileText,
  CheckCircle2,
  Send,
  Edit2,
  X,
  Download,
  Eye,
  Mail,
  MessageSquare,
  Building2,
  Users,
  Clock,
  MapPin,
  Shield,
  Loader2,
  ArrowLeft,
  Check,
  FileDown,
  Pencil
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { toast } from 'sonner';
import { generatePDF, downloadPDF } from '@/app/utils/pdfGenerator';

interface Worker {
  id: string;
  name: string;
  rut: string;
  phone?: string;
  email: string;
  signature?: string;
  position?: string;
  signedAt?: string;
  department?: string;
}

// Destinatarios adicionales para el documento
interface AdditionalRecipient {
  id: string;
  name: string;
  role: string;
  email: string;
  required: boolean; // Si es obligatorio (Gerencia, RRHH)
}

interface DocumentPreviewAndSendProps {
  documentType: string;
  documentTitle: string;
  company: string;
  workers: Worker[];
  documentData: any;
  onClose: () => void;
  onSendComplete: () => void;
}

export function DocumentPreviewAndSend({
  documentType,
  documentTitle,
  company,
  workers,
  documentData,
  onClose,
  onSendComplete
}: DocumentPreviewAndSendProps) {
  const [isSending, setIsSending] = useState(false);
  const [sendingStep, setSendingStep] = useState<'preview' | 'saving' | 'sending' | 'complete'>('preview');
  const [selectedWorkers, setSelectedWorkers] = useState<Set<string>>(new Set(workers.map(w => w.id)));
  const [generatedPDF, setGeneratedPDF] = useState<any>(null);

  // Lista de destinatarios adicionales disponibles (gerencia, bodega, mandos medios)
  const [additionalRecipients] = useState<AdditionalRecipient[]>([
    { id: 'rrhh', name: 'RRHH y Prevención', role: 'RRHH', email: 'rrhh@losandes.cl, prevencion@losandes.cl', required: true },
    { id: 'gerencia', name: 'Gerencia General', role: 'Gerencia', email: 'gerencia@losandes.cl', required: true },
    { id: 'bodega', name: 'Encargado de Bodega', role: 'Bodega', email: 'bodega@losandes.cl', required: false },
    { id: 'jefe-obra', name: 'Jefe de Obra', role: 'Mando Medio', email: 'jefe.obra@losandes.cl', required: false },
    { id: 'supervisor', name: 'Supervisor de Terreno', role: 'Mando Medio', email: 'supervisor@losandes.cl', required: false },
    { id: 'coordinador', name: 'Coordinador SSO', role: 'Coordinación', email: 'coordinador.sso@losandes.cl', required: false }
  ]);

  // Estado para destinatarios adicionales seleccionados
  const [selectedAdditionalRecipients, setSelectedAdditionalRecipients] = useState<Set<string>>(
    new Set(additionalRecipients.filter(r => r.required).map(r => r.id))
  );

  const toggleAdditionalRecipient = (recipientId: string) => {
    const recipient = additionalRecipients.find(r => r.id === recipientId);
    if (recipient?.required) {
      // No permitir deseleccionar destinatarios obligatorios
      toast.warning('Este destinatario es obligatorio', {
        description: 'No se puede deseleccionar según normativa chilena'
      });
      return;
    }

    const newSelected = new Set(selectedAdditionalRecipients);
    if (newSelected.has(recipientId)) {
      newSelected.delete(recipientId);
    } else {
      newSelected.add(recipientId);
    }
    setSelectedAdditionalRecipients(newSelected);
  };

  const handleApproveAndSend = async () => {
    console.log('🚀 handleApproveAndSend iniciado');
    setIsSending(true);
    
    try {
      // Step 1: Saving to vault
      setSendingStep('saving');
      toast.loading('Guardando en bóveda documental...', { id: 'saving' });
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('✅ Documento guardado en bóveda', { id: 'saving' });
      console.log('✅ Paso 1: Guardado en bóveda completado');
      
      // Step 2: Sending documents
      setSendingStep('sending');
      const selectedWorkersList = workers.filter(w => selectedWorkers.has(w.id));
      
      toast.loading(`Enviando a ${selectedWorkersList.length} trabajador(es)...`, { id: 'sending' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 3: Complete
      setSendingStep('complete');
      toast.success(`✅ Documentos enviados exitosamente`, { id: 'sending' });
      console.log('✅ Paso 2: Envío completado');
      
      // Esperar 2 segundos en el paso de complete antes de cerrar
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ Ejecutando onSendComplete');
      
      onSendComplete();
      
    } catch (error) {
      console.error('❌ Error en handleApproveAndSend:', error);
      toast.error('Error al procesar el documento', { id: 'sending' });
      setIsSending(false);
      setSendingStep('preview');
    }
  };

  const toggleWorker = (workerId: string) => {
    const newSelected = new Set(selectedWorkers);
    if (newSelected.has(workerId)) {
      newSelected.delete(workerId);
    } else {
      newSelected.add(workerId);
    }
    setSelectedWorkers(newSelected);
  };

  const handleDownloadPDF = () => {
    if (!generatedPDF) {
      toast.error('Error al generar el PDF');
      return;
    }

    try {
      const filename = `${documentType}_${documentTitle}`.replace(/\s+/g, '_');
      downloadPDF(generatedPDF, filename);
      
      toast.success('📄 PDF descargado exitosamente', {
        description: 'El documento se ha guardado en tu dispositivo'
      });
    } catch (error) {
      toast.error('Error al descargar el PDF', {
        description: 'Por favor intenta nuevamente'
      });
    }
  };

  // Get HR emails from company config (mock data)
  const hrEmails = ['rrhh@losandes.cl', 'prevencion@losandes.cl'];

  const renderPreviewStep = () => (
    <div className="space-y-6">
      {/* PDF Preview */}
      <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Previsualización del Documento
              </h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                {documentType} - {documentTitle}
              </p>
            </div>
          </div>
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar
          </Button>
        </div>

        {/* PDF Viewer Simulation */}
        <div className="border-2 border-slate-200 dark:border-zinc-700 rounded-lg bg-slate-50 dark:bg-zinc-800/50 overflow-hidden">
          <ScrollArea className="h-[500px]">
            <div className="p-8 bg-white dark:bg-zinc-900">
              {/* Header with Logo */}
              <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-orange-500">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    SafeTrack Chile
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-zinc-400">
                    Plataforma de Prevención de Riesgos
                  </p>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 mb-2">
                    Documento Oficial
                  </Badge>
                  <p className="text-xs text-slate-500 dark:text-zinc-500">
                    {new Date().toLocaleDateString('es-CL')}
                  </p>
                </div>
              </div>

              {/* Document Title */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {documentType.toUpperCase()}
                </h2>
                <h3 className="text-xl text-slate-700 dark:text-zinc-300">
                  {documentTitle}
                </h3>
              </div>

              {/* Company Info */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-600 dark:text-zinc-400">Empresa:</span>
                    <div className="font-semibold text-slate-900 dark:text-white">{company}</div>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-zinc-400">Fecha:</span>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {new Date().toLocaleDateString('es-CL', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-zinc-400">Prevencionista:</span>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {documentData.preventionist || 'Juan Pérez Silva'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-zinc-400">Hora:</span>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Summary */}
              {documentData.content && (
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                    Contenido:
                  </h4>
                  <div className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-lg text-sm text-slate-700 dark:text-zinc-300">
                    {documentData.content}
                  </div>
                </div>
              )}

              {/* EPP List - Solo para entregas de EPP */}
              {documentData.selectedEPPs && documentData.eppCatalog && documentData.selectedEPPs.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    Elementos de Protección Personal Entregados ({documentData.selectedEPPs.length}):
                  </h4>
                  <div className="border border-green-200 dark:border-green-900 rounded-lg overflow-hidden bg-green-50 dark:bg-green-950/20">
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {documentData.selectedEPPs.map((eppId: string) => {
                          const epp = documentData.eppCatalog?.find((e: any) => e.id === eppId);
                          if (!epp) return null;
                          
                          return (
                            <div 
                              key={eppId}
                              className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800 rounded-lg border border-green-300 dark:border-green-800"
                            >
                              <span className="text-2xl flex-shrink-0">{epp.icon}</span>
                              <div className="flex-1">
                                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                                  {epp.name}
                                </p>
                                <p className="text-xs text-slate-600 dark:text-zinc-400">
                                  {epp.category}
                                </p>
                              </div>
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Workers List */}
              <div className="mb-6">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                  Trabajadores Participantes ({workers.length}):
                </h4>
                <div className="border border-slate-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 dark:bg-zinc-800">
                      <tr>
                        <th className="text-left p-3 text-slate-700 dark:text-zinc-300">N°</th>
                        <th className="text-left p-3 text-slate-700 dark:text-zinc-300">Nombre</th>
                        <th className="text-left p-3 text-slate-700 dark:text-zinc-300">RUT</th>
                        <th className="text-left p-3 text-slate-700 dark:text-zinc-300">Cargo</th>
                        <th className="text-center p-3 text-slate-700 dark:text-zinc-300">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-zinc-700">
                      {workers.map((worker, idx) => (
                        <tr key={worker.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                          <td className="p-3 text-slate-900 dark:text-white">{idx + 1}</td>
                          <td className="p-3 text-slate-900 dark:text-white">{worker.name}</td>
                          <td className="p-3 text-slate-600 dark:text-zinc-400">{worker.rut}</td>
                          <td className="p-3 text-slate-600 dark:text-zinc-400">{worker.position || '-'}</td>
                          <td className="p-3 text-center">
                            {worker.signature ? (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                <Check className="w-3 h-3 mr-1" />
                                Firmado
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Sin firma
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Firmas Digitales - Mostrar las firmas reales de puño y letra */}
              {workers.some(w => w.signature) && (
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Pencil className="w-5 h-5 text-blue-600" />
                    Firmas Digitales de los Trabajadores:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {workers.filter(w => w.signature).map((worker, idx) => (
                      <div 
                        key={worker.id}
                        className="border border-slate-300 dark:border-zinc-700 rounded-lg p-4 bg-slate-50 dark:bg-zinc-800/50"
                      >
                        <div className="mb-3">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">
                            {worker.name}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-zinc-400">
                            RUT: {worker.rut} • {worker.position || 'Trabajador'}
                          </p>
                          {worker.signedAt && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                              Firmado: {worker.signedAt}
                            </p>
                          )}
                        </div>
                        <div className="border-2 border-blue-300 dark:border-blue-700 rounded-lg bg-white dark:bg-zinc-900 p-2">
                          <img 
                            src={worker.signature} 
                            alt={`Firma de ${worker.name}`}
                            className="w-full h-24 object-contain"
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-center gap-2">
                          <Check className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            Firma Digital Verificada
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location & Timestamp */}
              {documentData.location && (
                <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-lg">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <div>
                        <span className="text-slate-600 dark:text-zinc-400 block">Ubicación:</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {documentData.location}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <div>
                        <span className="text-slate-600 dark:text-zinc-400 block">GPS:</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {documentData.gps || '-33.4489, -70.6693'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-slate-200 dark:border-zinc-700 text-center text-xs text-slate-500 dark:text-zinc-500">
                <p className="mb-1">
                  <strong>Documento generado electrónicamente con validez legal</strong>
                </p>
                <p>
                  SafeTrack Chile - Cumplimiento Ley 16.744 - Timestamp: {new Date().toISOString()}
                </p>
                <p className="mt-2">
                  🔒 Este documento contiene firmas digitales verificables y geolocalización
                </p>
              </div>
            </div>
          </ScrollArea>
        </div>
      </Card>

      {/* Recipients Selection */}
      <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Destinatarios del Documento
        </h3>
        
        <div className="space-y-4">
          {/* Workers */}
          <div>
            <div className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-3">
              Trabajadores ({selectedWorkers.size} seleccionados)
            </div>
            <div className="space-y-2">
              {workers.map(worker => (
                <div
                  key={worker.id}
                  className={`p-3 border rounded-lg transition-all cursor-pointer ${
                    selectedWorkers.has(worker.id)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                      : 'border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                  }`}
                  onClick={() => toggleWorker(worker.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                      selectedWorkers.has(worker.id)
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-slate-300 dark:border-zinc-600'
                    }`}>
                      {selectedWorkers.has(worker.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {worker.name}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-zinc-400 mt-1">
                        {worker.phone && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {worker.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {worker.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HR Copy */}
          <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="font-medium text-purple-900 dark:text-purple-300">
                Copia automática a RRHH
              </span>
            </div>
            <div className="space-y-1 text-sm text-purple-800 dark:text-purple-300">
              {hrEmails.map((email, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{email}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Recipients */}
          <div className="border-t border-slate-200 dark:border-zinc-800 pt-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="font-medium text-slate-900 dark:text-white">
                  Destinatarios Adicionales de la Empresa
                </span>
              </div>
              <Badge className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                {selectedAdditionalRecipients.size} / {additionalRecipients.length} seleccionados
              </Badge>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-zinc-400 mb-3">
              Personaliza los destinatarios según tus necesidades. Los marcados con 🔒 son obligatorios por normativa.
            </p>
            
            <div className="space-y-2">
              {additionalRecipients.map(recipient => (
                <div
                  key={recipient.id}
                  className={`p-3 border rounded-lg transition-all ${
                    recipient.required 
                      ? 'bg-slate-50 dark:bg-zinc-800/50 border-slate-300 dark:border-zinc-700' 
                      : selectedAdditionalRecipients.has(recipient.id)
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20 cursor-pointer'
                        : 'border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer'
                  }`}
                  onClick={() => !recipient.required && toggleAdditionalRecipient(recipient.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                      selectedAdditionalRecipients.has(recipient.id)
                        ? recipient.required
                          ? 'border-slate-400 bg-slate-400 cursor-not-allowed'
                          : 'border-orange-600 bg-orange-600'
                        : 'border-slate-300 dark:border-zinc-600'
                    }`}>
                      {selectedAdditionalRecipients.has(recipient.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {recipient.name}
                        </span>
                        {recipient.required && (
                          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs">
                            🔒 Obligatorio
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-zinc-400 mt-1">
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          {recipient.role}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {recipient.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-800 dark:text-amber-300">
                  <strong>Normativa chilena:</strong> Los destinatarios obligatorios (RRHH y Gerencia) no pueden ser removidos por cumplimiento de la Ley 16.744.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={onClose}
          variant="outline"
          className="flex-1 border-slate-300 dark:border-zinc-600"
          disabled={isSending}
        >
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button
          onClick={onClose}
          variant="outline"
          className="flex-1 border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20"
          disabled={isSending}
        >
          <Edit2 className="w-4 h-4 mr-2" />
          Editar Documento
        </Button>
        <Button
          onClick={handleApproveAndSend}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          disabled={isSending || selectedWorkers.size === 0}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Aprobar y Enviar
        </Button>
      </div>

      {selectedWorkers.size === 0 && (
        <div className="text-center text-sm text-red-600 dark:text-red-400">
          ⚠️ Debes seleccionar al menos un trabajador para enviar el documento
        </div>
      )}
    </div>
  );

  const renderSavingStep = () => (
    <div className="text-center py-12">
      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        Guardando en Bóveda Documental
      </h3>
      <p className="text-slate-600 dark:text-zinc-400">
        Almacenando documento con firma digital y metadatos...
      </p>
    </div>
  );

  const renderSendingStep = () => (
    <div className="text-center py-12">
      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30">
        <Loader2 className="w-8 h-8 text-green-600 dark:text-green-400 animate-spin" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        Enviando Documentos
      </h3>
      <p className="text-slate-600 dark:text-zinc-400 mb-4">
        Enviando por WhatsApp y Email a {selectedWorkers.size} trabajador(es)...
      </p>
      
      <div className="max-w-md mx-auto space-y-2">
        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-sm text-slate-700 dark:text-zinc-300">
            Enviando vía WhatsApp...
          </span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-slate-700 dark:text-zinc-300">
            Enviando vía Email...
          </span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
          <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span className="text-sm text-slate-700 dark:text-zinc-300">
            Enviando copia a RRHH...
          </span>
        </div>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center py-12">
      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        ✅ Proceso Completado
      </h3>
      <p className="text-slate-600 dark:text-zinc-400 mb-6">
        El documento ha sido guardado y enviado exitosamente
      </p>
      
      <div className="max-w-md mx-auto space-y-3 mb-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-blue-900 dark:text-blue-300">
              Guardado en Bóveda
            </span>
          </div>
          <p className="text-xs text-blue-800 dark:text-blue-300">
            Documento almacenado con firma digital y timestamp
          </p>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Send className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="font-medium text-green-900 dark:text-green-300">
              Enviado a Trabajadores
            </span>
          </div>
          <p className="text-xs text-green-800 dark:text-green-300">
            {selectedWorkers.size} trabajador(es) recibieron el documento por WhatsApp y Email
          </p>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="font-medium text-purple-900 dark:text-purple-300">
              Copia a RRHH
            </span>
          </div>
          <p className="text-xs text-purple-800 dark:text-purple-300">
            Respaldo enviado a {hrEmails.length} correo(s) de RRHH
          </p>
        </div>
      </div>

      {/* Botón de descarga del PDF */}
      <div className="max-w-md mx-auto mb-6">
        <Button
          onClick={handleDownloadPDF}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Descargar Copia del Documento (PDF)
        </Button>
      </div>

      <p className="text-xs text-slate-500 dark:text-zinc-500">
        Este documento quedará disponible para auditorías y cumplimiento normativo
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-zinc-950 dark:via-blue-950/20 dark:to-zinc-950 pb-20 lg:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {sendingStep === 'preview' ? 'Previsualización del Documento' :
                 sendingStep === 'saving' ? 'Guardando Documento' :
                 sendingStep === 'sending' ? 'Enviando Documento' :
                 'Documento Enviado'}
              </h1>
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                {company}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {sendingStep === 'preview' && renderPreviewStep()}
        {sendingStep === 'saving' && renderSavingStep()}
        {sendingStep === 'sending' && renderSendingStep()}
        {sendingStep === 'complete' && renderCompleteStep()}
      </div>
    </div>
  );
}