import { useState } from 'react';
import { FileText, Download, Check, Clock, AlertCircle, Plus, DollarSign, Calendar } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';

interface ClientCompany {
  id: string;
  name: string;
  rut: string;
  pendingAmount: number;
  nextPayment?: string;
  brandColor: string;
}

interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
  paymentMethod?: string;
  paidDate?: string;
}

interface BillingManagementProps {
  clients: ClientCompany[];
}

export function BillingManagement({ clients }: BillingManagementProps) {
  const [invoices] = useState<Invoice[]>([
    {
      id: 'INV-001',
      clientId: 'minera-1',
      clientName: 'Minera Los Andes S.A.',
      invoiceNumber: 'HN-2026-001',
      issueDate: '2026-01-01',
      dueDate: '2026-01-30',
      amount: 2500000,
      status: 'pending',
      description: 'Honorarios mensuales - Enero 2026'
    },
    {
      id: 'INV-002',
      clientId: 'const-1',
      clientName: 'Constructora Paredes Ltda.',
      invoiceNumber: 'HN-2026-002',
      issueDate: '2026-01-05',
      dueDate: '2026-01-15',
      amount: 980000,
      status: 'pending',
      description: 'Consultoría 28 horas'
    },
    {
      id: 'INV-003',
      clientId: 'food-1',
      clientName: 'Alimentos del Sur SpA',
      invoiceNumber: 'HN-2025-052',
      issueDate: '2025-12-05',
      dueDate: '2026-01-05',
      amount: 1200000,
      status: 'paid',
      description: 'Asesoría + Honorarios Diciembre 2025',
      paymentMethod: 'Transferencia',
      paidDate: '2026-01-05'
    }
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const badges = {
      paid: { label: 'Pagado', color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800', icon: Check },
      pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800', icon: Clock },
      overdue: { label: 'Vencido', color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800', icon: AlertCircle }
    };
    return badges[status];
  };

  const totalPending = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const totalOverdue = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);

  const handleGenerateInvoice = () => {
    toast.success('Generando boleta de honorarios...');
  };

  const handleDownloadInvoice = (invoiceNumber: string) => {
    toast.success(`Descargando ${invoiceNumber}...`);
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    toast.success('Factura marcada como pagada');
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 border-yellow-500 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-yellow-100">Por Cobrar</h3>
            <Clock className="w-5 h-5 text-yellow-100" />
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalPending)}</p>
          <p className="text-xs text-yellow-100 mt-1">
            {invoices.filter(i => i.status === 'pending').length} facturas pendientes
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 border-green-500 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-green-100">Cobrado</h3>
            <Check className="w-5 h-5 text-green-100" />
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalPaid)}</p>
          <p className="text-xs text-green-100 mt-1">
            {invoices.filter(i => i.status === 'paid').length} facturas pagadas
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 border-red-500 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-red-100">Vencidos</h3>
            <AlertCircle className="w-5 h-5 text-red-100" />
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalOverdue)}</p>
          <p className="text-xs text-red-100 mt-1">
            {invoices.filter(i => i.status === 'overdue').length} facturas vencidas
          </p>
        </Card>
      </div>

      {/* Actions */}
      <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">Gestión de Facturación</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Genera y administra tus boletas de honorarios
            </p>
          </div>
          <Button
            onClick={handleGenerateInvoice}
            className="bg-[#0055A4] hover:bg-[#004080] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Boleta
          </Button>
        </div>
      </Card>

      {/* Invoices List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Historial de Facturación ({invoices.length})
        </h3>

        {invoices.map(invoice => {
          const statusBadge = getStatusBadge(invoice.status);
          const StatusIcon = statusBadge.icon;

          return (
            <Card
              key={invoice.id}
              className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-4"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Left: Invoice Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-zinc-900 dark:text-white">
                        {invoice.invoiceNumber}
                      </h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {invoice.clientName}
                      </p>
                    </div>
                    <Badge className={statusBadge.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusBadge.label}
                    </Badge>
                  </div>

                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                    {invoice.description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-zinc-500">Monto</p>
                      <p className="font-semibold text-zinc-900 dark:text-white">
                        {formatCurrency(invoice.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Emisión</p>
                      <p className="font-medium text-zinc-900 dark:text-white">
                        {new Date(invoice.issueDate).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Vencimiento</p>
                      <p className="font-medium text-zinc-900 dark:text-white">
                        {new Date(invoice.dueDate).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                    {invoice.paidDate && (
                      <div>
                        <p className="text-zinc-500">Fecha Pago</p>
                        <p className="font-medium text-green-600 dark:text-green-400">
                          {new Date(invoice.paidDate).toLocaleDateString('es-CL')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex md:flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadInvoice(invoice.invoiceNumber)}
                    className="flex-1 md:flex-none"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    PDF
                  </Button>
                  {invoice.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleMarkAsPaid(invoice.id)}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1 md:flex-none"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Marcar Pagado
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Invoice Generator */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800 p-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-500 p-3 rounded-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Generación Automática de Boletas
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
              El sistema puede generar automáticamente boletas de honorarios basándose en las horas registradas
              y los honorarios fijos de cada cliente. Las boletas incluyen todos los datos necesarios para el SII.
            </p>
            <div className="flex gap-2">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Calendar className="w-3 h-3 mr-1" />
                Configurar Facturación Automática
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
