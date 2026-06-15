import { useState } from 'react';
import { 
  ArrowLeft,
  Building2,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Calendar,
  Shield,
  Eye,
  Download,
  Ban
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Progress } from '@/app/components/ui/progress';
import { toast } from 'sonner';

interface ContractorPortalProps {
  onBack: () => void;
}

interface Contractor {
  id: string;
  name: string;
  rut: string;
  status: 'authorized' | 'pending' | 'blocked';
  workers: number;
  documents: Document[];
}

interface Document {
  id: string;
  type: string;
  name: string;
  uploadDate: string;
  expiryDate?: string;
  status: 'valid' | 'expired' | 'pending-review';
  validatedBy: string;
}

export function ContractorPortal({ onBack }: ContractorPortalProps) {
  const [contractors] = useState<Contractor[]>([
    {
      id: 'C001',
      name: 'Transportes Rápidos S.A.',
      rut: '76.123.456-7',
      status: 'authorized',
      workers: 15,
      documents: [
        {
          id: 'D001',
          type: 'F30-1',
          name: 'Certificado_F30_2026.pdf',
          uploadDate: '2026-01-15',
          expiryDate: '2026-12-31',
          status: 'valid',
          validatedBy: 'OCR Automático'
        },
        {
          id: 'D002',
          type: 'Inducción ODI',
          name: 'Charla_ODI_Empresa.pdf',
          uploadDate: '2026-01-10',
          expiryDate: '2026-07-10',
          status: 'valid',
          validatedBy: 'OCR Automático'
        }
      ]
    },
    {
      id: 'C002',
      name: 'Servicios Eléctricos Ltda.',
      rut: '77.234.567-8',
      status: 'blocked',
      workers: 8,
      documents: [
        {
          id: 'D003',
          type: 'Antecedentes',
          name: 'Cert_Antecedentes_2025.pdf',
          uploadDate: '2025-12-20',
          expiryDate: '2026-01-20',
          status: 'expired',
          validatedBy: 'OCR Automático'
        },
        {
          id: 'D004',
          type: 'Curso SEC',
          name: 'Curso_SEC_Electricista.pdf',
          uploadDate: '2025-10-15',
          expiryDate: '2026-01-15',
          status: 'expired',
          validatedBy: 'OCR Automático'
        }
      ]
    },
    {
      id: 'C003',
      name: 'Construcción y Montaje SpA',
      rut: '78.345.678-9',
      status: 'pending',
      workers: 12,
      documents: [
        {
          id: 'D005',
          type: 'F30-1',
          name: 'F30_Pendiente.pdf',
          uploadDate: '2026-01-25',
          status: 'pending-review',
          validatedBy: 'Pendiente'
        }
      ]
    }
  ]);

  const authorizedCount = contractors.filter(c => c.status === 'authorized').length;
  const blockedCount = contractors.filter(c => c.status === 'blocked').length;
  const pendingCount = contractors.filter(c => c.status === 'pending').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'authorized':
        return <Badge className="bg-green-100 text-green-700">Autorizado</Badge>;
      case 'blocked':
        return <Badge className="bg-red-100 text-red-700">Bloqueado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pendiente</Badge>;
      default:
        return null;
    }
  };

  const getDocStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-700">Vigente</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-700">Vencido</Badge>;
      case 'pending-review':
        return <Badge className="bg-yellow-100 text-yellow-700">En Revisión</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-zinc-950 dark:via-blue-950/20 dark:to-zinc-950 pb-20 lg:pb-8">
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Button onClick={onBack} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Portal de Contratistas
                </h1>
                <p className="text-sm text-slate-600 dark:text-zinc-400">
                  Validación Automática con OCR
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-900 dark:text-green-300">Autorizados</span>
              </div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">{authorizedCount}</div>
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Ban className="w-4 h-4 text-red-600" />
                <span className="text-xs font-medium text-red-900 dark:text-red-300">Bloqueados</span>
              </div>
              <div className="text-2xl font-bold text-red-900 dark:text-red-100">{blockedCount}</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-xs font-medium text-yellow-900 dark:text-yellow-300">Pendientes</span>
              </div>
              <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{pendingCount}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Card className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-900">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                🤖 Validación Automática con OCR
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Los contratistas suben sus documentos (F30-1, ODI, Antecedentes) y el sistema usa OCR para leer y verificar 
                automáticamente las fechas de vigencia. Si un documento vence, el acceso se bloquea automáticamente.
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {contractors.map(contractor => (
            <Card key={contractor.id} className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {contractor.name}
                    </h3>
                    {getStatusBadge(contractor.status)}
                    {contractor.status === 'blocked' && (
                      <Badge className="bg-red-600 text-white">
                        <Ban className="w-3 h-3 mr-1" />
                        Acceso Denegado
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-zinc-400">
                    <span>RUT: {contractor.rut}</span>
                    <span>•</span>
                    <span>{contractor.workers} trabajadores</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-zinc-700 pt-4">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                  Documentos ({contractor.documents.length})
                </h4>
                <div className="space-y-2">
                  {contractor.documents.map(doc => (
                    <div key={doc.id} className={`p-3 border rounded-lg ${
                      doc.status === 'expired'
                        ? 'border-red-300 dark:border-red-900 bg-red-50/50 dark:bg-red-950/10'
                        : doc.status === 'valid'
                        ? 'border-green-300 dark:border-green-900 bg-green-50/50 dark:bg-green-950/10'
                        : 'border-yellow-300 dark:border-yellow-900 bg-yellow-50/50 dark:bg-yellow-950/10'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className={`w-5 h-5 ${
                            doc.status === 'expired' ? 'text-red-600' :
                            doc.status === 'valid' ? 'text-green-600' : 'text-yellow-600'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-slate-900 dark:text-white text-sm">
                                {doc.type}
                              </span>
                              {getDocStatusBadge(doc.status)}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-zinc-400">
                              <span>{doc.name}</span>
                              {doc.expiryDate && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Vence: {new Date(doc.expiryDate).toLocaleDateString('es-CL')}
                                  </span>
                                </>
                              )}
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {doc.validatedBy}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {contractor.status === 'blocked' && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-semibold text-red-900 dark:text-red-100 mb-1">
                        ⛔ Acceso Bloqueado Automáticamente
                      </div>
                      <div className="text-red-800 dark:text-red-300">
                        El contratista tiene documentos vencidos. El sistema bloqueó automáticamente el acceso 
                        hasta que renueve la documentación requerida.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
