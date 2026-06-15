import { useState } from 'react';
import { 
  Shield,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Mail,
  Plus,
  X,
  Eye,
  DollarSign,
  Building2,
  User,
  Calendar,
  Loader2,
  Send,
  Link,
  Key,
  Settings,
  RefreshCw
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { toast } from 'sonner';

interface ClientCompany {
  id: string;
  name: string;
  rut: string;
  email?: string;
  contactPerson?: string;
}

interface BoletaHonorarios {
  id: string;
  folio: number;
  clientId: string;
  clientName: string;
  clientRut: string;
  issueDate: string;
  amount: number;
  netAmount: number;
  retentionAmount: number;
  description: string;
  status: 'emitida' | 'enviada' | 'pagada' | 'anulada';
  pdfUrl?: string;
  xmlUrl?: string;
  siiTimestamp?: string;
  trackId?: string;
}

interface SIIIntegrationProps {
  clients: ClientCompany[];
  onBoletaGenerated?: (boleta: BoletaHonorarios) => void;
}

export function SIIIntegration({ clients, onBoletaGenerated }: SIIIntegrationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showNewBoletaModal, setShowNewBoletaModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Datos de conexión SII (simulados)
  const [siiCredentials, setSiiCredentials] = useState({
    rut: '',
    password: '',
    certificado: null as File | null
  });

  // Datos del prevencionista
  const [preventionistData] = useState({
    rut: '12.345.678-9',
    name: 'Juan Pérez Silva',
    email: 'juan.perez@prevencionistriesgos.cl',
    direccion: 'Av. Apoquindo 4800, Las Condes, Santiago',
    actividadEconomica: 'Consultor en Prevención de Riesgos',
    codigoActividad: '702002'
  });

  // Formulario de nueva boleta
  const [boletaForm, setBoletaForm] = useState({
    clientId: '',
    amount: '',
    description: '',
    serviceDate: new Date().toISOString().split('T')[0]
  });

  // Historial de boletas (mock data)
  const [boletas] = useState<BoletaHonorarios[]>([
    {
      id: 'BH-001',
      folio: 1234567,
      clientId: 'minera-1',
      clientName: 'Minera Los Andes S.A.',
      clientRut: '76.123.456-7',
      issueDate: '2026-02-05',
      amount: 2500000,
      netAmount: 2500000,
      retentionAmount: 262500, // 10.5% de retención
      description: 'Servicios de prevención de riesgos - Enero 2026',
      status: 'emitida',
      pdfUrl: '#',
      xmlUrl: '#',
      siiTimestamp: '2026-02-05T10:30:00Z',
      trackId: 'SII-2026-001234567'
    },
    {
      id: 'BH-002',
      folio: 1234566,
      clientId: 'const-1',
      clientName: 'Constructora Paredes Ltda.',
      clientRut: '77.234.567-8',
      issueDate: '2026-02-01',
      amount: 980000,
      netAmount: 980000,
      retentionAmount: 102900,
      description: 'Consultoría en prevención de riesgos - 28 horas',
      status: 'pagada',
      pdfUrl: '#',
      xmlUrl: '#',
      siiTimestamp: '2026-02-01T15:20:00Z',
      trackId: 'SII-2026-001234566'
    },
    {
      id: 'BH-003',
      folio: 1234565,
      clientId: 'food-1',
      clientName: 'Alimentos del Sur SpA',
      clientRut: '78.345.678-9',
      issueDate: '2026-01-15',
      amount: 1200000,
      netAmount: 1200000,
      retentionAmount: 126000,
      description: 'Asesoría mensual prevención de riesgos',
      status: 'pagada',
      pdfUrl: '#',
      xmlUrl: '#',
      siiTimestamp: '2026-01-15T09:15:00Z',
      trackId: 'SII-2026-001234565'
    }
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleConnectSII = async () => {
    setIsGenerating(true);
    
    try {
      // Simular conexión con SII
      toast.loading('Conectando con SII...', { id: 'sii-connect' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('✅ Conectado con SII exitosamente', { id: 'sii-connect' });
      setIsConnected(true);
      setShowConnectionModal(false);
    } catch (error) {
      toast.error('Error al conectar con SII', { id: 'sii-connect' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateBoleta = async () => {
    if (!boletaForm.clientId || !boletaForm.amount || !boletaForm.description) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    setIsGenerating(true);
    
    try {
      const selectedClient = clients.find(c => c.id === boletaForm.clientId);
      const amount = parseInt(boletaForm.amount);
      const retentionAmount = Math.round(amount * 0.105); // 10.5% retención
      
      // Paso 1: Generar XML
      toast.loading('Generando XML para el SII...', { id: 'generate' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Paso 2: Firmar digitalmente
      toast.loading('Firmando digitalmente con certificado...', { id: 'generate' });
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Paso 3: Enviar al SII
      toast.loading('Enviando al SII para timbrado...', { id: 'generate' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Paso 4: Generar PDF
      toast.loading('Generando PDF con timbre electrónico...', { id: 'generate' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newBoleta: BoletaHonorarios = {
        id: `BH-${Date.now()}`,
        folio: 1234568 + boletas.length,
        clientId: boletaForm.clientId,
        clientName: selectedClient?.name || '',
        clientRut: selectedClient?.rut || '',
        issueDate: new Date().toISOString().split('T')[0],
        amount: amount,
        netAmount: amount,
        retentionAmount: retentionAmount,
        description: boletaForm.description,
        status: 'emitida',
        pdfUrl: '#',
        xmlUrl: '#',
        siiTimestamp: new Date().toISOString(),
        trackId: `SII-${Date.now()}`
      };
      
      toast.success('✅ Boleta electrónica generada exitosamente', { id: 'generate' });
      
      // Paso 5: Enviar por email
      toast.loading('Enviando boleta por email...', { id: 'email' });
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`✅ Boleta enviada a ${selectedClient?.email || 'cliente'}`, { id: 'email' });
      
      if (onBoletaGenerated) {
        onBoletaGenerated(newBoleta);
      }
      
      setShowNewBoletaModal(false);
      setBoletaForm({
        clientId: '',
        amount: '',
        description: '',
        serviceDate: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      toast.error('Error al generar la boleta');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = (boleta: BoletaHonorarios) => {
    toast.success(`📄 Descargando boleta N° ${boleta.folio}`, {
      description: 'PDF con timbre electrónico del SII'
    });
  };

  const handleDownloadXML = (boleta: BoletaHonorarios) => {
    toast.success(`📄 Descargando XML de boleta N° ${boleta.folio}`, {
      description: 'Archivo XML firmado digitalmente'
    });
  };

  const handleResendEmail = (boleta: BoletaHonorarios) => {
    toast.success(`📧 Reenviando boleta N° ${boleta.folio}`, {
      description: `Email enviado a ${boleta.clientName}`
    });
  };

  const getStatusBadge = (status: BoletaHonorarios['status']) => {
    const badges = {
      emitida: { label: 'Emitida', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400', icon: FileText },
      enviada: { label: 'Enviada', color: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400', icon: Mail },
      pagada: { label: 'Pagada', color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400', icon: CheckCircle2 },
      anulada: { label: 'Anulada', color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400', icon: X }
    };
    return badges[status];
  };

  const totalEmitido = boletas.reduce((sum, b) => sum + b.amount, 0);
  const totalPagado = boletas.filter(b => b.status === 'pagada').reduce((sum, b) => sum + b.amount, 0);
  const totalPendiente = boletas.filter(b => b.status === 'emitida' || b.status === 'enviada').reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-6">
      {/* Conexión SII */}
      <Card className={`p-6 border-2 ${
        isConnected 
          ? 'bg-green-50 dark:bg-green-950/20 border-green-500 dark:border-green-800' 
          : 'bg-orange-50 dark:bg-orange-950/20 border-orange-500 dark:border-orange-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${
              isConnected 
                ? 'bg-green-500' 
                : 'bg-orange-500'
            }`}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`font-semibold ${
                isConnected 
                  ? 'text-green-900 dark:text-green-100' 
                  : 'text-orange-900 dark:text-orange-100'
              }`}>
                {isConnected ? '✅ Conectado con SII' : '⚠️ No conectado con SII'}
              </h3>
              <p className={`text-sm ${
                isConnected 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-orange-700 dark:text-orange-300'
              }`}>
                {isConnected 
                  ? `RUT: ${preventionistData.rut} • Certificado digital activo`
                  : 'Conecta tu cuenta del SII para emitir boletas electrónicas'
                }
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {isConnected && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowConnectionModal(true)}
                className="border-green-500 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-400"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurar
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setShowConnectionModal(true)}
              className={`${
                isConnected 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-orange-600 hover:bg-orange-700'
              } text-white`}
            >
              {isConnected ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reconectar
                </>
              ) : (
                <>
                  <Link className="w-4 h-4 mr-2" />
                  Conectar SII
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Resumen Financiero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-blue-500 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-100">Total Emitido</h3>
            <FileText className="w-5 h-5 text-blue-100" />
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalEmitido)}</p>
          <p className="text-xs text-blue-100 mt-1">
            {boletas.length} boletas emitidas
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 border-green-500 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-100">Total Cobrado</h3>
            <CheckCircle2 className="w-5 h-5 text-green-100" />
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalPagado)}</p>
          <p className="text-xs text-green-100 mt-1">
            {boletas.filter(b => b.status === 'pagada').length} boletas pagadas
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 border-yellow-500 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-yellow-100">Por Cobrar</h3>
            <DollarSign className="w-5 h-5 text-yellow-100" />
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalPendiente)}</p>
          <p className="text-xs text-yellow-100 mt-1">
            {boletas.filter(b => b.status === 'emitida' || b.status === 'enviada').length} boletas pendientes
          </p>
        </Card>
      </div>

      {/* Acciones Rápidas */}
      <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">
              Emisión de Boletas Electrónicas
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Sistema integrado con el SII para emisión automática de boletas de honorarios
            </p>
          </div>
          <Button
            onClick={() => {
              if (!isConnected) {
                toast.error('Primero debes conectarte con el SII');
                return;
              }
              setShowNewBoletaModal(true);
            }}
            className="bg-[#0055A4] hover:bg-[#004080] text-white"
            disabled={!isConnected}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Boleta Electrónica
          </Button>
        </div>
      </Card>

      {/* Historial de Boletas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Historial de Boletas ({boletas.length})
          </h3>
          <Button size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar Libro de Honorarios
          </Button>
        </div>

        {boletas.map(boleta => {
          const statusBadge = getStatusBadge(boleta.status);
          const StatusIcon = statusBadge.icon;

          return (
            <Card
              key={boleta.id}
              className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Izquierda: Info de la boleta */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-bold text-lg text-zinc-900 dark:text-white">
                          Folio N° {boleta.folio}
                        </h4>
                        <Badge className={statusBadge.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusBadge.label}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {boleta.clientName}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        RUT: {boleta.clientRut}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#0055A4]">
                        {formatCurrency(boleta.amount)}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Retención: {formatCurrency(boleta.retentionAmount)}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                    {boleta.description}
                  </p>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-zinc-500">Fecha Emisión</p>
                      <p className="font-medium text-zinc-900 dark:text-white">
                        {new Date(boleta.issueDate).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Track ID SII</p>
                      <p className="font-mono text-xs font-medium text-zinc-900 dark:text-white">
                        {boleta.trackId?.slice(-8)}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Timbre Electrónico</p>
                      <p className="font-medium text-green-600 dark:text-green-400">
                        ✓ Verificado
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Estado SII</p>
                      <p className="font-medium text-blue-600 dark:text-blue-400">
                        ✓ Aceptado
                      </p>
                    </div>
                  </div>
                </div>

                {/* Derecha: Acciones */}
                <div className="flex lg:flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadPDF(boleta)}
                    className="flex-1 lg:flex-none"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadXML(boleta)}
                    className="flex-1 lg:flex-none"
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    XML
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleResendEmail(boleta)}
                    className="flex-1 lg:flex-none"
                  >
                    <Mail className="w-3 h-3 mr-1" />
                    Enviar
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal: Conexión SII */}
      {showConnectionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white dark:bg-zinc-900 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-[#0055A4] p-2 rounded-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                      Conectar con SII
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Servicio de Impuestos Internos
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowConnectionModal(false)}
                  className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-zinc-900 dark:text-white">RUT del Contribuyente</Label>
                  <Input
                    value={siiCredentials.rut}
                    onChange={(e) => setSiiCredentials({...siiCredentials, rut: e.target.value})}
                    placeholder="12.345.678-9"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-zinc-900 dark:text-white">Contraseña SII</Label>
                  <Input
                    type="password"
                    value={siiCredentials.password}
                    onChange={(e) => setSiiCredentials({...siiCredentials, password: e.target.value})}
                    placeholder="••••••••"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-zinc-900 dark:text-white">Certificado Digital (.pfx)</Label>
                  <Input
                    type="file"
                    accept=".pfx,.p12"
                    onChange={(e) => setSiiCredentials({...siiCredentials, certificado: e.target.files?.[0] || null})}
                    className="mt-1"
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    Archivo de certificado digital para firma electrónica
                  </p>
                </div>

                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                      <p className="font-medium mb-1">Seguridad de Credenciales</p>
                      <p className="text-xs">
                        Tus credenciales se almacenan de forma segura y encriptada. SafeTrack Chile 
                        nunca tendrá acceso a tu contraseña del SII.
                      </p>
                    </div>
                  </div>
                </Card>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowConnectionModal(false)}
                    className="flex-1"
                    disabled={isGenerating}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleConnectSII}
                    className="flex-1 bg-[#0055A4] hover:bg-[#004080] text-white"
                    disabled={isGenerating || !siiCredentials.rut || !siiCredentials.password}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <Link className="w-4 h-4 mr-2" />
                        Conectar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal: Nueva Boleta */}
      {showNewBoletaModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-white dark:bg-zinc-900 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-[#0055A4] p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                      Nueva Boleta Electrónica de Honorarios
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Emisión con timbre electrónico del SII
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewBoletaModal(false)}
                  className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  disabled={isGenerating}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Datos del emisor */}
                <Card className="bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
                    <h4 className="font-medium text-slate-900 dark:text-white">Emisor</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-600 dark:text-zinc-400">Nombre</p>
                      <p className="font-medium text-slate-900 dark:text-white">{preventionistData.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-zinc-400">RUT</p>
                      <p className="font-medium text-slate-900 dark:text-white">{preventionistData.rut}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-600 dark:text-zinc-400">Actividad Económica</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {preventionistData.actividadEconomica} ({preventionistData.codigoActividad})
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Selección de cliente */}
                <div>
                  <Label className="text-zinc-900 dark:text-white">Cliente *</Label>
                  <select
                    value={boletaForm.clientId}
                    onChange={(e) => setBoletaForm({...boletaForm, clientId: e.target.value})}
                    className="w-full mt-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white"
                    disabled={isGenerating}
                  >
                    <option value="">Selecciona un cliente</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name} - {client.rut}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Monto */}
                <div>
                  <Label className="text-zinc-900 dark:text-white">Monto Bruto *</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      type="number"
                      value={boletaForm.amount}
                      onChange={(e) => setBoletaForm({...boletaForm, amount: e.target.value})}
                      placeholder="0"
                      className="pl-10"
                      disabled={isGenerating}
                    />
                  </div>
                  {boletaForm.amount && (
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-blue-600 dark:text-blue-400">Monto Bruto</p>
                          <p className="font-semibold text-blue-900 dark:text-blue-200">
                            {formatCurrency(parseInt(boletaForm.amount || '0'))}
                          </p>
                        </div>
                        <div>
                          <p className="text-blue-600 dark:text-blue-400">Retención (10.5%)</p>
                          <p className="font-semibold text-blue-900 dark:text-blue-200">
                            {formatCurrency(Math.round(parseInt(boletaForm.amount || '0') * 0.105))}
                          </p>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                          <p className="text-blue-600 dark:text-blue-400">Líquido a Recibir</p>
                          <p className="font-bold text-lg text-blue-900 dark:text-blue-200">
                            {formatCurrency(Math.round(parseInt(boletaForm.amount || '0') * 0.895))}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Descripción */}
                <div>
                  <Label className="text-zinc-900 dark:text-white">Descripción del Servicio *</Label>
                  <Textarea
                    value={boletaForm.description}
                    onChange={(e) => setBoletaForm({...boletaForm, description: e.target.value})}
                    placeholder="Ej: Servicios profesionales de prevención de riesgos - Febrero 2026"
                    className="mt-1 min-h-[100px]"
                    disabled={isGenerating}
                  />
                </div>

                {/* Fecha de servicio */}
                <div>
                  <Label className="text-zinc-900 dark:text-white">Fecha del Servicio</Label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      type="date"
                      value={boletaForm.serviceDate}
                      onChange={(e) => setBoletaForm({...boletaForm, serviceDate: e.target.value})}
                      className="pl-10"
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                {/* Información legal */}
                <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-800 dark:text-green-300">
                      <p className="font-medium mb-2">Proceso de Emisión Automático:</p>
                      <ol className="list-decimal list-inside space-y-1 text-xs">
                        <li>Generación de XML con formato SII</li>
                        <li>Firma digital con certificado autorizado</li>
                        <li>Envío al SII para timbrado electrónico</li>
                        <li>Generación de PDF con timbre</li>
                        <li>Envío automático por email al cliente</li>
                        <li>Registro en libro de honorarios electrónico</li>
                      </ol>
                    </div>
                  </div>
                </Card>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowNewBoletaModal(false)}
                    className="flex-1"
                    disabled={isGenerating}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleGenerateBoleta}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    disabled={isGenerating || !boletaForm.clientId || !boletaForm.amount || !boletaForm.description}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Generar y Enviar Boleta
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
