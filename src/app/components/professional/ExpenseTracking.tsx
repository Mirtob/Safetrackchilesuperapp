import { useState } from 'react';
import { Receipt, Car, Coffee, MapPin, Calendar, DollarSign, Plus, Upload, Check, Clock } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { AddExpenseModal } from '@/app/components/professional/AddExpenseModal';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface ClientCompany {
  id: string;
  name: string;
  brandColor: string;
}

interface Expense {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  category: 'transport' | 'fuel' | 'food' | 'accommodation' | 'materials' | 'other';
  description: string;
  amount: number;
  receipt?: string; // URL del comprobante
  location: string;
  status: 'pending' | 'approved' | 'reimbursed';
  gpsVerified: boolean;
  mileage?: number; // Kilómetros recorridos (para transporte)
}

interface ExpenseTrackingProps {
  clients: ClientCompany[];
}

export function ExpenseTracking({ clients }: ExpenseTrackingProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: 'EXP-001',
      clientId: 'minera-1',
      clientName: 'Minera Los Andes S.A.',
      date: '2026-01-27',
      category: 'transport',
      description: 'Traslado Santiago - Calama (ida y vuelta)',
      amount: 180000,
      location: 'Calama, Antofagasta',
      status: 'pending',
      gpsVerified: true,
      mileage: 2800
    },
    {
      id: 'EXP-002',
      clientId: 'const-1',
      clientName: 'Constructora Paredes Ltda.',
      date: '2026-01-26',
      category: 'food',
      description: 'Almuerzo en terreno',
      amount: 12000,
      receipt: 'https://example.com/receipt-001.jpg',
      location: 'Las Condes, Santiago',
      status: 'approved',
      gpsVerified: true
    },
    {
      id: 'EXP-003',
      clientId: 'const-1',
      clientName: 'Constructora Paredes Ltda.',
      date: '2026-01-26',
      category: 'fuel',
      description: 'Combustible vehículo institucional',
      amount: 33000,
      receipt: 'https://example.com/receipt-002.jpg',
      location: 'Copec Las Condes',
      status: 'approved',
      gpsVerified: true
    },
    {
      id: 'EXP-004',
      clientId: 'food-1',
      clientName: 'Alimentos del Sur SpA',
      date: '2026-01-25',
      category: 'accommodation',
      description: 'Hotel 1 noche Puerto Montt',
      amount: 65000,
      receipt: 'https://example.com/receipt-003.jpg',
      location: 'Puerto Montt',
      status: 'reimbursed',
      gpsVerified: true
    },
    {
      id: 'EXP-005',
      clientId: 'food-1',
      clientName: 'Alimentos del Sur SpA',
      date: '2026-01-25',
      category: 'materials',
      description: 'EPP de repuesto para capacitación',
      amount: 30000,
      receipt: 'https://example.com/receipt-004.jpg',
      location: 'Puerto Montt',
      status: 'reimbursed',
      gpsVerified: false
    }
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryInfo = (category: Expense['category']) => {
    const categories = {
      transport: { label: 'Transporte', icon: Car, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
      fuel: { label: 'Combustible', icon: Car, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' },
      food: { label: 'Alimentación', icon: Coffee, color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' },
      accommodation: { label: 'Alojamiento', icon: MapPin, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' },
      materials: { label: 'Materiales', icon: Receipt, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' },
      other: { label: 'Otros', icon: Receipt, color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900/20 dark:text-zinc-400' }
    };
    return categories[category];
  };

  const getStatusBadge = (status: Expense['status']) => {
    const badges = {
      pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800', icon: Clock },
      approved: { label: 'Aprobado', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800', icon: Check },
      reimbursed: { label: 'Reembolsado', color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800', icon: DollarSign }
    };
    return badges[status];
  };

  // Calcular métricas
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingAmount = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);
  const approvedAmount = expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0);
  const reimbursedAmount = expenses.filter(e => e.status === 'reimbursed').reduce((sum, e) => sum + e.amount, 0);

  // Agrupar por cliente
  const expensesByClient = clients.map(client => {
    const clientExpenses = expenses.filter(e => e.clientId === client.id);
    const total = clientExpenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      ...client,
      expenses: clientExpenses,
      total
    };
  }).filter(c => c.total > 0);

  // Agrupar por categoría
  const expensesByCategory = Object.entries(
    expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) acc[expense.category] = 0;
      acc[expense.category] += expense.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([category, amount]) => ({
    category: category as Expense['category'],
    amount
  }));

  const handleAddExpense = () => {
    setIsAddModalOpen(true);
  };

  const handleUploadReceipt = (expenseId: string) => {
    toast.success('Subir comprobante...');
  };

  const handleSaveExpense = (data: any) => {
    const newExpense: Expense = {
      id: `EXP-${Date.now()}`,
      ...data
    };
    setExpenses([newExpense, ...expenses]);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-purple-500 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs md:text-sm font-medium text-purple-100">Total Gastos</h3>
            <Receipt className="w-4 h-4 md:w-5 md:h-5 text-purple-100" />
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white">{formatCurrency(totalExpenses)}</p>
          <p className="text-xs text-purple-100 mt-1">
            {expenses.length} gastos
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 border-yellow-500 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs md:text-sm font-medium text-yellow-100">Pendientes</h3>
            <Clock className="w-4 h-4 md:w-5 md:h-5 text-yellow-100" />
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white">{formatCurrency(pendingAmount)}</p>
          <p className="text-xs text-yellow-100 mt-1">
            {expenses.filter(e => e.status === 'pending').length} gastos
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-blue-500 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs md:text-sm font-medium text-blue-100">Aprobados</h3>
            <Check className="w-4 h-4 md:w-5 md:h-5 text-blue-100" />
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white">{formatCurrency(approvedAmount)}</p>
          <p className="text-xs text-blue-100 mt-1">
            {expenses.filter(e => e.status === 'approved').length} gastos
          </p>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 border-green-500 p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs md:text-sm font-medium text-green-100">Reembolsados</h3>
            <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-green-100" />
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white">{formatCurrency(reimbursedAmount)}</p>
          <p className="text-xs text-green-100 mt-1">
            {expenses.filter(e => e.status === 'reimbursed').length} gastos
          </p>
        </Card>
      </div>

      {/* Actions */}
      <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">Rendición de Gastos</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Registra y gestiona tus gastos por cliente
            </p>
          </div>
          <Button
            onClick={handleAddExpense}
            className="bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Gasto
          </Button>
        </div>
      </Card>

      {/* Expenses by Category */}
      <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          Gastos por Categoría
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {expensesByCategory.map(({ category, amount }) => {
            const categoryInfo = getCategoryInfo(category);
            const CategoryIcon = categoryInfo.icon;
            return (
              <div
                key={category}
                className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CategoryIcon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">{categoryInfo.label}</span>
                </div>
                <p className="text-xl font-bold text-zinc-900 dark:text-white">
                  {formatCurrency(amount)}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Expenses by Client */}
      <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          Gastos por Cliente
        </h3>
        <div className="space-y-3">
          {expensesByClient.map(client => (
            <div
              key={client.id}
              className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: client.brandColor }}
                >
                  {client.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">{client.name}</p>
                  <p className="text-xs text-zinc-500">{client.expenses.length} gastos</p>
                </div>
              </div>
              <p className="text-xl font-bold text-zinc-900 dark:text-white">
                {formatCurrency(client.total)}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Expense List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Detalle de Gastos ({expenses.length})
        </h3>

        {expenses.map(expense => {
          const categoryInfo = getCategoryInfo(expense.category);
          const CategoryIcon = categoryInfo.icon;
          const statusBadge = getStatusBadge(expense.status);
          const StatusIcon = statusBadge.icon;

          return (
            <Card
              key={expense.id}
              className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-4"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Left: Expense Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={categoryInfo.color}>
                          <CategoryIcon className="w-3 h-3 mr-1" />
                          {categoryInfo.label}
                        </Badge>
                        <Badge className={statusBadge.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusBadge.label}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-zinc-900 dark:text-white">
                        {expense.clientName}
                      </h4>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {expense.description}
                      </p>
                    </div>
                    <p className="text-xl font-bold text-zinc-900 dark:text-white">
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-zinc-500">Fecha</p>
                      <p className="font-medium text-zinc-900 dark:text-white">
                        {format(parseISO(expense.date), 'dd MMM yyyy', { locale: es })}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Ubicación</p>
                      <p className="font-medium text-zinc-900 dark:text-white flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {expense.location}
                      </p>
                    </div>
                    {expense.mileage && (
                      <div>
                        <p className="text-zinc-500">Kilometraje</p>
                        <p className="font-medium text-zinc-900 dark:text-white">
                          {expense.mileage} km
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-zinc-500">Verificación</p>
                      {expense.gpsVerified ? (
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                          ✓ GPS
                        </Badge>
                      ) : (
                        <Badge className="bg-zinc-100 text-zinc-600 dark:bg-zinc-900/20 dark:text-zinc-400">
                          Manual
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex md:flex-col gap-2">
                  {expense.receipt ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 md:flex-none"
                    >
                      <Receipt className="w-3 h-3 mr-1" />
                      Ver
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleUploadReceipt(expense.id)}
                      className="bg-[#0055A4] hover:bg-[#004080] text-white flex-1 md:flex-none"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Subir
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800 p-6">
        <div className="flex items-start gap-4">
          <div className="bg-[#FF8C00] p-3 rounded-lg">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
              Verificación Automática con GPS
            </h3>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Los gastos de transporte y combustible se verifican automáticamente con GPS.
              El sistema calcula el kilometraje recorrido y valida que los gastos correspondan
              a las ubicaciones visitadas, asegurando transparencia en la rendición.
            </p>
          </div>
        </div>
      </Card>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        clients={clients}
        onSave={handleSaveExpense}
      />
    </div>
  );
}