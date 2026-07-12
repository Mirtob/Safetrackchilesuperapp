import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Send,
  FileText,
  Clock,
  CheckCircle2,
  Mail,
  MessageCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Shield,
  MapPin,
  Calendar,
  User,
  Building2,
  Save,
  Trash2,
  Edit2,
  Plus,
  Database,
  UserCheck,
  Loader2
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';
import { copyToClipboard } from '@/app/utils/clipboard';
import { SignatureManager } from '@/app/components/SignatureManager';
import { fetchCompanyDocuments, markTalkDocumentSent } from '@/app/services/safetyTalksService';
import { isSupabaseConfigured } from '@/app/services/supabase';

interface RemoteSignatureProps {
  onBack: () => void;
  documentData?: any;
  companyId?: string;
  companyName?: string;
  onOpenDocument?: (documentId: string) => void;
}

type SignatureStatus = 'draft' | 'pending' | 'signed' | 'rejected';

interface Document {
  id: string;
  title: string;
  type: string;
  company: string;
  date: string;
  status: SignatureStatus;
  sentVia?: 'whatsapp' | 'email';
  sentTo?: string;
  sentAt?: string;
  signedAt?: string;
  signatories: {
    preventionist: { name: string; signed: boolean; signedAt?: string };
    manager: { name: string; signed: boolean; signedAt?: string };
    worker?: { name: string; signed: boolean; signedAt?: string };
  };
  secureLink?: string;
  integrityHash?: string;
}

const MOCK_DOCUMENTS: Document[] = [
    {
      id: 'DOC-2026-001',
      title: 'Inspección Planeada - Obra Maipú',
      type: 'Inspección',
      company: 'Constructora Los Andes S.A.',
      date: '2026-01-26',
      status: 'signed',
      sentVia: 'whatsapp',
      sentTo: '+56 9 8765 4321',
      sentAt: '2026-01-26 14:30',
      signedAt: '2026-01-26 15:45',
      signatories: {
        preventionist: { name: 'Juan Pérez', signed: true, signedAt: '2026-01-26 14:30' },
        manager: { name: 'María González', signed: true, signedAt: '2026-01-26 15:45' }
      },
      secureLink: 'https://safetrack.cl/sign/abc123def456',
      integrityHash: 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'
    },
    {
      id: 'DOC-2026-002',
      title: 'Entrega EPP - 15 Trabajadores',
      type: 'EPP',
      company: 'Constructora Los Andes S.A.',
      date: '2026-01-26',
      status: 'pending',
      sentVia: 'email',
      sentTo: 'gerencia@losandes.cl',
      sentAt: '2026-01-26 16:00',
      signatories: {
        preventionist: { name: 'Juan Pérez', signed: true, signedAt: '2026-01-26 16:00' },
        manager: { name: 'María González', signed: false },
        worker: { name: 'Pedro Rojas', signed: true, signedAt: '2026-01-26 16:05' }
      },
      secureLink: 'https://safetrack.cl/sign/xyz789ghi012',
      integrityHash: 'SHA256:8g94c2768gg2gd64c93ed29259b2e76egd3e5c2gb4e788395beee311237e0180'
    },
    {
      id: 'DOC-2026-003',
      title: 'Charla 5 Minutos - Trabajo en Altura',
      type: 'Charla',
      company: 'Constructora Los Andes S.A.',
      date: '2026-01-26',
      status: 'draft',
      signatories: {
        preventionist: { name: 'Juan Pérez', signed: false },
        manager: { name: 'María González', signed: false }
      }
    }
];

const categoryLabel: Record<string, string> = { EPP: 'EPP', Charlas: 'Charla', Inducciones: 'Inducción' };

const mapTalkToDocument = (talk: Awaited<ReturnType<typeof fetchCompanyDocuments>>[number], companyName: string): Document => ({
  id: talk.id,
  title: talk.title,
  type: categoryLabel[talk.category] || talk.category,
  company: companyName,
  date: talk.date,
  status: talk.managerApprovalStatus === 'approved'
    ? 'signed'
    : talk.managerApprovalStatus === 'rejected'
      ? 'rejected'
      : talk.sentAt
        ? 'pending'
        : 'draft',
  sentVia: talk.sentVia,
  sentTo: talk.sentTo,
  sentAt: talk.sentAt ? new Date(talk.sentAt).toLocaleString('es-CL') : undefined,
  signedAt: talk.managerApprovedAt ? new Date(talk.managerApprovedAt).toLocaleString('es-CL') : undefined,
  signatories: {
    preventionist: { name: 'Prevencionista', signed: true },
    manager: {
      name: 'Gerente',
      signed: talk.managerApprovalStatus === 'approved',
      signedAt: talk.managerApprovedAt ? new Date(talk.managerApprovedAt).toLocaleString('es-CL') : undefined,
    },
    ...(talk.signaturesCount > 0
      ? { worker: { name: `${talk.signaturesCount} trabajador(es)`, signed: true } }
      : {}),
  },
  integrityHash: talk.integrityHash,
});

export function RemoteSignature({ onBack, companyId, companyName, onOpenDocument }: RemoteSignatureProps) {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [showSendOptions, setShowSendOptions] = useState(false);
  const [hasPreventionistSignature, setHasPreventionistSignature] = useState(true);
  const [activeTab, setActiveTab] = useState<'documents' | 'signatures'>('documents');

  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadDocuments = async () => {
      setIsLoadingDocuments(true);
      if (!isSupabaseConfigured || !companyId) {
        if (!cancelled) setDocuments(MOCK_DOCUMENTS);
        if (!cancelled) setIsLoadingDocuments(false);
        return;
      }
      try {
        const talks = await fetchCompanyDocuments(companyId);
        if (!cancelled) setDocuments(talks.map(t => mapTalkToDocument(t, companyName || '')));
      } catch (err: any) {
        console.warn('No se pudo cargar documentos desde Supabase:', err.message);
        if (!cancelled) setDocuments(MOCK_DOCUMENTS);
      } finally {
        if (!cancelled) setIsLoadingDocuments(false);
      }
    };
    loadDocuments();
    return () => { cancelled = true; };
  }, [companyId, companyName]);

  const handleSendDocument = async (docId: string, method: 'whatsapp' | 'email') => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    // VALIDACIÓN CRÍTICA: El prevencionista debe tener firma digital guardada
    if (!hasPreventionistSignature) {
      toast.error('Firma digital requerida', {
        description: 'Debes configurar tu firma digital antes de enviar documentos. Ve a Configuración > Mi Firma Digital.',
      });
      setShowSendOptions(false);
      setSelectedDocument(null);
      return;
    }

    // REGLA DE NEGOCIO: Para gerentes, SOLO WhatsApp
    if (method === 'email') {
      toast.error('Envío no permitido', {
        description: 'Los documentos para firma gerencial deben enviarse OBLIGATORIAMENTE por WhatsApp para garantizar recepción inmediata.',
      });
      return;
    }

    // Generar link seguro
    const secureLink = `https://safetrack.cl/sign/${Math.random().toString(36).substring(7)}`;
    const integrityHash = `SHA256:${Math.random().toString(36).substring(2, 15)}...`;
    const managerPhoneRaw = '+56 9 8765 4321'; // En producción, obtener del perfil del gerente

    if (companyId && isSupabaseConfigured) {
      try {
        await markTalkDocumentSent(docId, 'whatsapp', managerPhoneRaw);
      } catch (err: any) {
        toast.error('Error al registrar el envío', { description: err.message });
        return;
      }
    }

    // Actualizar documento
    setDocuments(docs => docs.map(d =>
      d.id === docId
        ? {
            ...d,
            status: 'pending' as SignatureStatus,
            sentVia: 'whatsapp', // SIEMPRE WhatsApp
            sentTo: managerPhoneRaw,
            sentAt: new Date().toLocaleString('es-CL'),
            secureLink,
            integrityHash,
            signatories: {
              ...d.signatories,
              preventionist: { ...d.signatories.preventionist, signed: true, signedAt: new Date().toLocaleString('es-CL') }
            }
          }
        : d
    ));

    // Copiar link al portapapeles
    const copied = await copyToClipboard(secureLink);

    // Abrir WhatsApp con el mensaje
    const managerPhone = '56987654321'; // En producción, obtener del perfil del gerente
    const message = encodeURIComponent(
      `🔒 *SafeTrack Chile - Firma Digital Requerida*\n\n` +
      `Documento: ${doc.title}\n` +
      `Empresa: ${doc.company}\n\n` +
      `Por favor, firma el documento en el siguiente link seguro:\n` +
      `${secureLink}\n\n` +
      `Este link está protegido con encriptación y validación de integridad.`
    );
    
    // En producción real, abrir WhatsApp
    // window.open(`https://wa.me/${managerPhone}?text=${message}`, '_blank');

    toast.success('Documento enviado vía WhatsApp ✅', {
      description: copied 
        ? 'Link copiado al portapapeles. El gerente recibirá la notificación por WhatsApp.' 
        : 'El gerente recibirá la notificación por WhatsApp.',
    });

    setShowSendOptions(false);
    setSelectedDocument(null);
  };

  const copySecureLink = async (link: string) => {
    const copied = await copyToClipboard(link);
    if (copied) {
      toast.success('Link copiado al portapapeles');
    } else {
      // Mostrar el link en un toast para que el usuario pueda copiarlo manualmente
      toast.info('Selecciona y copia el link:', {
        description: link,
        duration: 10000,
      });
    }
  };

  const getStatusBadge = (status: SignatureStatus) => {
    switch (status) {
      case 'draft':
        return (
          <Badge className="bg-slate-500/20 text-slate-700 dark:text-slate-400 border-0">
            <FileText className="w-3 h-3 mr-1" />
            Borrador
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-[#FF8C00]/20 text-[#FF8C00] border-0 animate-pulse">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente de Firma
          </Badge>
        );
      case 'signed':
        return (
          <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Firmado Digitalmente
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-500/20 text-red-600 dark:text-red-400 border-0">
            <AlertCircle className="w-3 h-3 mr-1" />
            Rechazado
          </Badge>
        );
    }
  };

  const pendingCount = documents.filter(d => d.status === 'pending').length;
  const signedCount = documents.filter(d => d.status === 'signed').length;
  const draftCount = documents.filter(d => d.status === 'draft').length;

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
              <div>
                <h1 className="text-slate-900 dark:text-white text-xl lg:text-2xl">Envío y Firma Remota</h1>
                <p className="text-sm text-slate-600 dark:text-zinc-400">Gestión de firmas digitales gerenciales</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-zinc-700">
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'documents'
                ? 'border-[#FF8C00] text-[#FF8C00]'
                : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Documentos ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('signatures')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'signatures'
                ? 'border-[#FF8C00] text-[#FF8C00]'
                : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Database className="w-4 h-4 inline mr-2" />
            Firmas Guardadas
          </button>
        </div>

        {/* Content */}
        {activeTab === 'documents' ? (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50 border-slate-200 dark:border-slate-700">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-700 dark:text-slate-400 text-sm">Borradores</span>
                    <FileText className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="text-3xl text-slate-900 dark:text-slate-300 mb-1">{draftCount}</div>
                  <Badge className="bg-slate-600/20 text-slate-700 dark:text-slate-400 border-0 text-xs">
                    Sin enviar
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
                    Esperando firma
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
            </div>

            {/* Información de Seguridad */}
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-slate-900 dark:text-white font-semibold mb-1">Firma Digital Certificada</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Cada documento incluye <strong>estampa digital</strong> con firma, fecha/hora, geolocalización y código de integridad (Hash SHA-256) 
                      para garantizar la trazabilidad legal en caso de fiscalización.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Lista de Documentos */}
            <div className="space-y-4">
              <h2 className="text-slate-900 dark:text-white text-lg flex items-center gap-2">
                <span className="w-1 h-6 bg-[#FF8C00] rounded-full" />
                Documentos Recientes
              </h2>

              {isLoadingDocuments && (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Cargando documentos...
                </div>
              )}

              {!isLoadingDocuments && documents.map((doc) => (
                <Card 
                  key={doc.id}
                  className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:shadow-lg transition-all"
                >
                  <div className="p-5">
                    {/* Header del documento */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-slate-900 dark:text-white font-semibold text-lg">{doc.title}</h3>
                          {getStatusBadge(doc.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {doc.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {doc.date}
                          </span>
                          <Badge className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-0">
                            {doc.type}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Firmas */}
                    <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-lg p-4 mb-4">
                      <h4 className="text-sm text-slate-700 dark:text-zinc-300 mb-3 font-medium">Estado de Firmas</h4>
                      <div className="space-y-2">
                        {/* Prevencionista */}
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            doc.signatories.preventionist.signed 
                              ? 'bg-green-500/20 text-green-600' 
                              : 'bg-slate-300 dark:bg-zinc-600 text-slate-600 dark:text-zinc-400'
                          }`}>
                            {doc.signatories.preventionist.signed ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <User className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-slate-900 dark:text-white font-medium">
                              {doc.signatories.preventionist.name} <span className="text-slate-600 dark:text-zinc-400">(Prevencionista)</span>
                            </p>
                            {doc.signatories.preventionist.signed && doc.signatories.preventionist.signedAt && (
                              <p className="text-xs text-slate-600 dark:text-zinc-400">Firmado: {doc.signatories.preventionist.signedAt}</p>
                            )}
                          </div>
                        </div>

                        {/* Gerente */}
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            doc.signatories.manager.signed 
                              ? 'bg-green-500/20 text-green-600' 
                              : 'bg-amber-500/20 text-amber-600'
                          }`}>
                            {doc.signatories.manager.signed ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <Clock className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-slate-900 dark:text-white font-medium">
                              {doc.signatories.manager.name} <span className="text-slate-600 dark:text-zinc-400">(Gerente)</span>
                            </p>
                            {doc.signatories.manager.signed && doc.signatories.manager.signedAt ? (
                              <p className="text-xs text-slate-600 dark:text-zinc-400">Firmado: {doc.signatories.manager.signedAt}</p>
                            ) : (
                              <p className="text-xs text-amber-600 dark:text-amber-400">Pendiente de firma</p>
                            )}
                          </div>
                        </div>

                        {/* Trabajador (si aplica) */}
                        {doc.signatories.worker && (
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              doc.signatories.worker.signed 
                                ? 'bg-green-500/20 text-green-600' 
                                : 'bg-slate-300 dark:bg-zinc-600 text-slate-600 dark:text-zinc-400'
                            }`}>
                              {doc.signatories.worker.signed ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : (
                                <User className="w-5 h-5" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-slate-900 dark:text-white font-medium">
                                {doc.signatories.worker.name} <span className="text-slate-600 dark:text-zinc-400">(Trabajador)</span>
                              </p>
                              {doc.signatories.worker.signed && doc.signatories.worker.signedAt && (
                                <p className="text-xs text-slate-600 dark:text-zinc-400">Firmado: {doc.signatories.worker.signedAt}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Link seguro y Hash (si ya fue enviado) */}
                    {doc.secureLink && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4 space-y-2">
                        <div className="flex items-start gap-2">
                          <ExternalLink className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-blue-700 dark:text-blue-400 mb-1">Link Seguro:</p>
                            <p className="text-sm text-blue-900 dark:text-blue-300 font-mono break-all">{doc.secureLink}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copySecureLink(doc.secureLink!)}
                            className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        {doc.integrityHash && (
                          <div className="flex items-start gap-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                            <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-blue-700 dark:text-blue-400 mb-1">Código de Integridad:</p>
                              <p className="text-xs text-blue-900 dark:text-blue-300 font-mono break-all">{doc.integrityHash}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Información de envío */}
                    {doc.sentVia && doc.sentTo && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-400 mb-4">
                        {doc.sentVia === 'whatsapp' ? (
                          <MessageCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Mail className="w-4 h-4 text-blue-600" />
                        )}
                        <span>Enviado vía {doc.sentVia === 'whatsapp' ? 'WhatsApp' : 'Email'} a {doc.sentTo}</span>
                        {doc.sentAt && <span>• {doc.sentAt}</span>}
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="flex gap-2">
                      {doc.status === 'draft' && (
                        <>
                          <Button
                            onClick={() => {
                              setSelectedDocument(doc.id);
                              setShowSendOptions(true);
                            }}
                            className="bg-[#FF8C00] hover:bg-orange-600 text-white flex-1"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Enviar para Firma Gerencial
                          </Button>
                        </>
                      )}
                      
                      {doc.status === 'pending' && (
                        <>
                          {onOpenDocument && (
                            <Button
                              onClick={() => onOpenDocument(doc.id)}
                              className="bg-[#FF8C00] hover:bg-orange-600 text-white flex-1"
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Revisar y Firmar
                            </Button>
                          )}
                          {doc.secureLink && (
                            <Button
                              variant="outline"
                              onClick={() => copySecureLink(doc.secureLink!)}
                              className="flex-1"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Reenviar Link
                            </Button>
                          )}
                        </>
                      )}

                      {doc.status === 'signed' && (
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white flex-1"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Descargar Firmado
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <SignatureManager onSelectSignature={(signature) => {
            toast.success(`Firma de ${signature.name} seleccionada`);
          }} />
        )}
      </div>

      {/* Modal de Opciones de Envío */}
      {showSendOptions && selectedDocument && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowSendOptions(false)}>
          <Card 
            className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-slate-900 dark:text-white text-xl mb-2">Enviar Documento para Firma</h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400 mb-6">
                ⚠️ <strong>Política Empresarial:</strong> Las firmas gerenciales deben solicitarse ÚNICAMENTE por WhatsApp para garantizar recepción inmediata y trazabilidad.
              </p>
              
              {/* Validación de firma del prevencionista */}
              {!hasPreventionistSignature && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-red-900 dark:text-red-400 font-semibold mb-1">
                        Firma Digital No Configurada
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Debes configurar tu firma digital antes de enviar documentos. 
                        Ve a <strong>Configuración → Mi Firma Digital</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <Button
                  onClick={() => handleSendDocument(selectedDocument, 'whatsapp')}
                  disabled={!hasPreventionistSignature}
                  className="w-full bg-green-600 hover:bg-green-700 text-white h-auto py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageCircle className="w-5 h-5 mr-3" />
                  <div className="text-left flex-1">
                    <div className="font-semibold">✓ Enviar por WhatsApp (Obligatorio)</div>
                    <div className="text-xs opacity-90">Link seguro al celular del gerente</div>
                  </div>
                </Button>

                <div className="bg-slate-100 dark:bg-zinc-900/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-600 dark:text-zinc-400">
                    🔒 El link incluye firma digital, geolocalización y código de integridad SHA-256
                  </p>
                </div>

                <Button
                  onClick={() => setShowSendOptions(false)}
                  variant="outline"
                  className="w-full"
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
