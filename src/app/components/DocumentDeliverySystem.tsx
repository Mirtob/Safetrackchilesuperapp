import { useState } from 'react';
import { 
  Send, 
  Mail, 
  Phone,
  CheckCircle2,
  Clock,
  FileText,
  Users,
  ArrowLeft,
  Download,
  Eye,
  AlertCircle,
  Shield,
  MessageSquare,
  Building2,
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Separator } from '@/app/components/ui/separator';
import { Switch } from '@/app/components/ui/switch';
import { toast } from 'sonner';

interface DocumentDeliverySystemProps {
  onBack: () => void;
}

interface DeliveryRecord {
  id: string;
  documentType: string;
  documentName: string;
  workerName: string;
  workerRut: string;
  workerPhone: string;
  workerEmail: string;
  company: string;
  deliveryDate: string;
  whatsappStatus: 'sent' | 'delivered' | 'read' | 'failed';
  emailStatus: 'sent' | 'delivered' | 'failed';
  hrCopyStatus: 'sent' | 'delivered' | 'failed';
  hrEmail: string;
  signatureUrl?: string;
  certificateUrl?: string;
  ipAddress: string;
  geoLocation?: string;
}

interface HRConfig {
  companyId: string;
  companyName: string;
  hrEmails: string[];
  autoSendCopy: boolean;
  includePDF: boolean;
  includeSignature: boolean;
}

export function DocumentDeliverySystem({ onBack }: DocumentDeliverySystemProps) {
  const [activeTab, setActiveTab] = useState<'deliveries' | 'config' | 'stats'>('deliveries');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'pending' | 'failed'>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');

  // Mock data - En producción vendría de Supabase
  const deliveryRecords: DeliveryRecord[] = [
    {
      id: 'del-001',
      documentType: 'Charla de Seguridad',
      documentName: 'Uso Correcto de EPP',
      workerName: 'Pedro Martínez',
      workerRut: '12.345.678-9',
      workerPhone: '+56912345678',
      workerEmail: 'pmartinez@example.com',
      company: 'Constructora Los Andes S.A.',
      deliveryDate: '2026-01-26T10:30:00',
      whatsappStatus: 'read',
      emailStatus: 'delivered',
      hrCopyStatus: 'delivered',
      hrEmail: 'rrhh@losandes.cl',
      signatureUrl: 'https://example.com/signature-001.png',
      certificateUrl: 'https://example.com/cert-001.pdf',
      ipAddress: '190.45.23.156',
      geoLocation: '-33.4489, -70.6693'
    },
    {
      id: 'del-002',
      documentType: 'Entrega EPP',
      documentName: 'Casco + Arnés + Guantes',
      workerName: 'Ana López',
      workerRut: '18.765.432-1',
      workerPhone: '+56987654321',
      workerEmail: 'alopez@example.com',
      company: 'Constructora Los Andes S.A.',
      deliveryDate: '2026-01-26T09:15:00',
      whatsappStatus: 'delivered',
      emailStatus: 'delivered',
      hrCopyStatus: 'delivered',
      hrEmail: 'rrhh@losandes.cl',
      signatureUrl: 'https://example.com/signature-002.png',
      certificateUrl: 'https://example.com/cert-002.pdf',
      ipAddress: '190.45.23.157',
      geoLocation: '-33.4489, -70.6693'
    },
    {
      id: 'del-003',
      documentType: 'Inducción',
      documentName: 'Inducción General de Seguridad',
      workerName: 'Carlos Rojas',
      workerRut: '16.234.567-8',
      workerPhone: '+56923456789',
      workerEmail: 'crojas@example.com',
      company: 'Minera Escondida Ltda.',
      deliveryDate: '2026-01-26T08:00:00',
      whatsappStatus: 'sent',
      emailStatus: 'sent',
      hrCopyStatus: 'sent',
      hrEmail: 'rrhh@escondida.cl',
      ipAddress: '181.76.89.23',
      geoLocation: '-23.3783, -69.1319'
    },
    {
      id: 'del-004',
      documentType: 'Charla de Seguridad',
      documentName: 'Trabajo en Altura',
      workerName: 'Luis González',
      workerRut: '14.567.890-2',
      workerPhone: '+56934567890',
      workerEmail: 'lgonzalez@invalid',
      company: 'Constructora Los Andes S.A.',
      deliveryDate: '2026-01-25T16:45:00',
      whatsappStatus: 'read',
      emailStatus: 'failed',
      hrCopyStatus: 'delivered',
      hrEmail: 'rrhh@losandes.cl',
      signatureUrl: 'https://example.com/signature-004.png',
      ipAddress: '190.45.23.158'
    }
  ];

  const hrConfigs: HRConfig[] = [
    {
      companyId: '1',
      companyName: 'Constructora Los Andes S.A.',
      hrEmails: ['rrhh@losandes.cl', 'prevencion@losandes.cl'],
      autoSendCopy: true,
      includePDF: true,
      includeSignature: true
    },
    {
      companyId: '2',
      companyName: 'Minera Escondida Ltda.',
      hrEmails: ['rrhh@escondida.cl'],
      autoSendCopy: true,
      includePDF: true,
      includeSignature: true
    },
    {
      companyId: '3',
      companyName: 'Forestal Chile S.A.',
      hrEmails: ['rrhh@forestal.cl', 'seguridad@forestal.cl'],
      autoSendCopy: false,
      includePDF: true,
      includeSignature: false
    }
  ];

  const filteredRecords = deliveryRecords.filter(record => {
    const matchesSearch = 
      record.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.documentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.workerRut.includes(searchQuery);
    
    const matchesCompany = selectedCompany === 'all' || record.company === selectedCompany;
    
    let matchesStatus = true;
    if (filterStatus === 'success') {
      matchesStatus = record.whatsappStatus === 'delivered' || record.whatsappStatus === 'read';
    } else if (filterStatus === 'pending') {
      matchesStatus = record.whatsappStatus === 'sent';
    } else if (filterStatus === 'failed') {
      matchesStatus = record.whatsappStatus === 'failed' || record.emailStatus === 'failed';
    }
    
    return matchesSearch && matchesCompany && matchesStatus;
  });

  const handleResendDocument = (recordId: string, method: 'whatsapp' | 'email') => {
    toast.success(`Reenviando documento por ${method === 'whatsapp' ? 'WhatsApp' : 'Email'}`, {
      description: 'El documento será enviado nuevamente al trabajador'
    });
  };

  const handleDownloadCertificate = (recordId: string) => {
    toast.success('Descargando certificado de entrega', {
      description: 'El certificado incluye firma digital, timestamp y geolocalización'
    });
  };

  const handleViewSignature = (recordId: string) => {
    toast.info('Abriendo firma digital del trabajador');
  };

  const handleExportReport = () => {
    toast.success('Generando reporte de entregas', {
      description: 'Se creará un Excel con todas las entregas para auditoría'
    });
  };

  const handleUpdateHRConfig = (companyId: string) => {
    toast.success('Configuración de RRHH actualizada', {
      description: 'Los cambios se aplicarán en las próximas entregas'
    });
  };

  // Stats calculation
  const totalDeliveries = deliveryRecords.length;
  const successfulDeliveries = deliveryRecords.filter(r => 
    (r.whatsappStatus === 'delivered' || r.whatsappStatus === 'read') && 
    r.emailStatus === 'delivered'
  ).length;
  const failedDeliveries = deliveryRecords.filter(r => 
    r.whatsappStatus === 'failed' || r.emailStatus === 'failed'
  ).length;
  const hrCopiesSent = deliveryRecords.filter(r => r.hrCopyStatus === 'delivered').length;

  const getStatusBadge = (status: string, type: 'whatsapp' | 'email' | 'hr') => {
    switch (status) {
      case 'read':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Leído</Badge>;
      case 'delivered':
        return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Entregado</Badge>;
      case 'sent':
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Enviado</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Fallido</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-400">Desconocido</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-50 dark:from-zinc-950 dark:via-green-950/20 dark:to-zinc-950 pb-20 lg:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
              <Send className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Sistema de Entrega de Documentos
              </h1>
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                WhatsApp + Email + Copia RRHH
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-900 dark:text-blue-300">Total Entregas</span>
              </div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalDeliveries}</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-900 dark:text-green-300">Exitosas</span>
              </div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">{successfulDeliveries}</div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-xs font-medium text-red-900 dark:text-red-300">Fallidas</span>
              </div>
              <div className="text-2xl font-bold text-red-900 dark:text-red-100">{failedDeliveries}</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-medium text-purple-900 dark:text-purple-300">Copias RRHH</span>
              </div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{hrCopiesSent}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
            <TabsTrigger value="deliveries" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Entregas
            </TabsTrigger>
            <TabsTrigger value="config" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <Building2 className="w-4 h-4 mr-2" />
              Config RRHH
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <Shield className="w-4 h-4 mr-2" />
              Estadísticas
            </TabsTrigger>
          </TabsList>

          {/* Deliveries Tab */}
          <TabsContent value="deliveries" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar por trabajador, documento o RUT..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">Todos los estados</option>
                <option value="success">Exitosos</option>
                <option value="pending">Pendientes</option>
                <option value="failed">Fallidos</option>
              </select>
              <Button
                onClick={handleExportReport}
                size="sm"
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>

            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredRecords.map(record => (
                    <div
                      key={record.id}
                      className="p-4 border border-slate-200 dark:border-zinc-700 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900 dark:text-white">
                              {record.workerName}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {record.workerRut}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-zinc-400 mb-1">
                            {record.documentType}: {record.documentName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-zinc-500">
                            {record.company}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-500 dark:text-zinc-500 mb-1">
                            {new Date(record.deliveryDate).toLocaleString('es-CL')}
                          </div>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg">
                        <div className="flex items-center gap-2 text-xs">
                          <Phone className="w-3 h-3 text-green-600 dark:text-green-400" />
                          <span className="text-slate-700 dark:text-zinc-300">{record.workerPhone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Mail className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          <span className="text-slate-700 dark:text-zinc-300 truncate">{record.workerEmail}</span>
                        </div>
                      </div>

                      {/* Delivery Status */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                        <div className="p-2 bg-white dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-700">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="w-3 h-3 text-green-600 dark:text-green-400" />
                            <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">WhatsApp</span>
                          </div>
                          {getStatusBadge(record.whatsappStatus, 'whatsapp')}
                        </div>
                        <div className="p-2 bg-white dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-700">
                          <div className="flex items-center gap-2 mb-1">
                            <Mail className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">Email Trabajador</span>
                          </div>
                          {getStatusBadge(record.emailStatus, 'email')}
                        </div>
                        <div className="p-2 bg-white dark:bg-zinc-900 rounded border border-slate-200 dark:border-zinc-700">
                          <div className="flex items-center gap-2 mb-1">
                            <Building2 className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                            <span className="text-xs font-medium text-slate-700 dark:text-zinc-300">Copia RRHH</span>
                          </div>
                          {getStatusBadge(record.hrCopyStatus, 'hr')}
                        </div>
                      </div>

                      {/* HR Email */}
                      <div className="mb-3 p-2 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded text-xs text-purple-800 dark:text-purple-300">
                        <strong>RRHH:</strong> {record.hrEmail}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        {record.signatureUrl && (
                          <Button
                            onClick={() => handleViewSignature(record.id)}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Ver Firma
                          </Button>
                        )}
                        {record.certificateUrl && (
                          <Button
                            onClick={() => handleDownloadCertificate(record.id)}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Certificado
                          </Button>
                        )}
                        {record.whatsappStatus === 'failed' && (
                          <Button
                            onClick={() => handleResendDocument(record.id, 'whatsapp')}
                            size="sm"
                            variant="outline"
                            className="text-xs text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Reenviar WhatsApp
                          </Button>
                        )}
                        {record.emailStatus === 'failed' && (
                          <Button
                            onClick={() => handleResendDocument(record.id, 'email')}
                            size="sm"
                            variant="outline"
                            className="text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                          >
                            <Mail className="w-3 h-3 mr-1" />
                            Reenviar Email
                          </Button>
                        )}
                      </div>

                      {/* Audit Trail */}
                      {record.geoLocation && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-700 text-xs text-slate-500 dark:text-zinc-500">
                          <div className="flex items-center gap-4">
                            <span>📍 GPS: {record.geoLocation}</span>
                            <span>🌐 IP: {record.ipAddress}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {filteredRecords.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-700 mb-3" />
                      <p className="text-slate-500 dark:text-zinc-400">
                        No se encontraron entregas con los filtros aplicados
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* HR Config Tab */}
          <TabsContent value="config" className="space-y-4">
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Configuración de Correos RRHH por Empresa
              </h3>
              
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {hrConfigs.map(config => (
                    <div
                      key={config.companyId}
                      className="p-4 border border-slate-200 dark:border-zinc-700 rounded-lg"
                    >
                      <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                        {config.companyName}
                      </h4>

                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2 block">
                            Correos de RRHH (uno por línea)
                          </label>
                          <div className="space-y-2">
                            {config.hrEmails.map((email, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <Input
                                  type="email"
                                  value={email}
                                  className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700"
                                  readOnly
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm text-slate-900 dark:text-white">
                                Envío automático de copias
                              </div>
                              <div className="text-xs text-slate-600 dark:text-zinc-400">
                                Enviar automáticamente copia a RRHH en cada entrega
                              </div>
                            </div>
                            <Switch checked={config.autoSendCopy} />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm text-slate-900 dark:text-white">
                                Incluir PDF completo
                              </div>
                              <div className="text-xs text-slate-600 dark:text-zinc-400">
                                Adjuntar el documento PDF en el correo a RRHH
                              </div>
                            </div>
                            <Switch checked={config.includePDF} />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm text-slate-900 dark:text-white">
                                Incluir imagen de firma
                              </div>
                              <div className="text-xs text-slate-600 dark:text-zinc-400">
                                Adjuntar imagen de firma digital del trabajador
                              </div>
                            </div>
                            <Switch checked={config.includeSignature} />
                          </div>
                        </div>

                        <Button
                          onClick={() => handleUpdateHRConfig(config.companyId)}
                          size="sm"
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          Guardar Configuración
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            {/* Important Notice */}
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-900">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    🔒 Cumplimiento Normativo y Auditorías
                  </div>
                  <div className="text-blue-800 dark:text-blue-300 space-y-1">
                    <p>
                      • Todas las entregas quedan registradas con timestamp, firma digital y geolocalización
                    </p>
                    <p>
                      • Las copias a RRHH aseguran respaldo permanente para inspecciones de la DT o Mutual
                    </p>
                    <p>
                      • Los certificados de entrega son documentos legales válidos ante autoridades fiscalizadoras
                    </p>
                    <p>
                      • El sistema cumple con Ley 16.744 y normativa SUSESO sobre registro de capacitaciones
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Entregas por Canal
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-slate-700 dark:text-zinc-300">WhatsApp</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {deliveryRecords.filter(r => r.whatsappStatus !== 'failed').length} / {totalDeliveries}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(deliveryRecords.filter(r => r.whatsappStatus !== 'failed').length / totalDeliveries) * 100}%` 
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-slate-700 dark:text-zinc-300">Email Trabajador</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {deliveryRecords.filter(r => r.emailStatus === 'delivered').length} / {totalDeliveries}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(deliveryRecords.filter(r => r.emailStatus === 'delivered').length / totalDeliveries) * 100}%` 
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-slate-700 dark:text-zinc-300">Copia RRHH</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {hrCopiesSent} / {totalDeliveries}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(hrCopiesSent / totalDeliveries) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Tasa de Éxito General
                </h3>
                <div className="text-center">
                  <div className="text-6xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {Math.round((successfulDeliveries / totalDeliveries) * 100)}%
                  </div>
                  <div className="text-sm text-slate-600 dark:text-zinc-400 mb-4">
                    {successfulDeliveries} de {totalDeliveries} entregas exitosas
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="text-xs text-green-700 dark:text-green-400 mb-1">Con Firma</div>
                      <div className="text-xl font-bold text-green-900 dark:text-green-100">
                        {deliveryRecords.filter(r => r.signatureUrl).length}
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <div className="text-xs text-purple-700 dark:text-purple-400 mb-1">Con GPS</div>
                      <div className="text-xl font-bold text-purple-900 dark:text-purple-100">
                        {deliveryRecords.filter(r => r.geoLocation).length}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Actividad Reciente (Últimas 24h)
              </h3>
              <div className="space-y-3">
                {deliveryRecords.slice(0, 5).map(record => (
                  <div key={record.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {record.workerName} - {record.documentType}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-zinc-500">
                        {new Date(record.deliveryDate).toLocaleString('es-CL')}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                      <Mail className="w-4 h-4 text-blue-600" />
                      <Building2 className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
