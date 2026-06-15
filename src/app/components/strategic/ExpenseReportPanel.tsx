import { useState } from 'react';
import { DollarSign, Car, Coffee, Fuel, Receipt, MapPin, Calendar, Upload, Download, Plus, Check, X } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { useCompany } from '@/app/context/CompanyContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Expense {
  id: string;
  type: 'viatico' | 'vehiculo' | 'combustible' | 'peaje' | 'estacionamiento' | 'otro';
  amount: number;
  description: string;
  date: string;
  companyId: string;
  companyName: string;
  branchId?: string;
  branchName?: string;
  receipt?: {
    url: string;
    filename: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'pendiente' | 'aprobado' | 'rechazado';
  approvedBy?: string;
  approvedDate?: string;
}

const MOCK_EXPENSES: Expense[] = [
  {
    id: 'E1',
    type: 'vehiculo',
    amount: 45000,
    description: 'Traslado a obra Portal Ñuñoa - 120km recorridos',
    date: '2026-01-27',
    companyId: '1',
    companyName: 'Constructora Los Andes S.A.',
    branchId: 'B1-1',
    branchName: 'Obra Portal Ñuñoa',
    location: {
      latitude: -33.4578,
      longitude: -70.6005,
      address: 'Av. Irarrázaval 3456, Ñuñoa'
    },
    status: 'aprobado',
    approvedBy: 'Roberto Sánchez',
    approvedDate: '2026-01-27'
  },
  {
    id: 'E2',
    type: 'combustible',
    amount: 35000,
    description: 'Carga combustible Copec - 30 litros',
    date: '2026-01-26',
    companyId: '1',
    companyName: 'Constructora Los Andes S.A.',
    receipt: {
      url: '/receipts/E2.pdf',
      filename: 'boleta_copec_012026.pdf'
    },
    status: 'aprobado',
    approvedBy: 'Roberto Sánchez',
    approvedDate: '2026-01-26'
  },
  {
    id: 'E3',
    type: 'viatico',
    amount: 12000,
    description: 'Almuerzo con equipo de prevención - Reunión coordinación',
    date: '2026-01-24',
    companyId: '3',
    companyName: 'Transportes y Logística Cruz del Sur',
    branchId: 'B3-1',
    branchName: 'Centro de Distribución Quilicura',
    status: 'pendiente'
  },
  {
    id: 'E4',
    type: 'vehiculo',
    amount: 185000,
    description: 'Traslado a faena minera Antofagasta - 850km recorridos',
    date: '2026-01-23',
    companyId: '2',
    companyName: 'Minera Atacama Norte',
    branchId: 'B2-1',
    branchName: 'Faena Mina Esperanza',
    location: {
      latitude: -22.8906,
      longitude: -69.3256,
      address: 'Sector Sierra Gorda, Antofagasta'
    },
    status: 'pendiente'
  },
  {
    id: 'E5',
    type: 'estacionamiento',
    amount: 3500,
    description: 'Estacionamiento edificio Apoquindo - 4 horas',
    date: '2026-01-22',
    companyId: '1',
    companyName: 'Constructora Los Andes S.A.',
    branchId: 'B1-2',
    branchName: 'Obra Edificio Apoquindo',
    receipt: {
      url: '/receipts/E5.pdf',
      filename: 'ticket_estacionamiento.pdf'
    },
    status: 'aprobado',
    approvedBy: 'Roberto Sánchez',
    approvedDate: '2026-01-23'
  }
];

const EXPENSE_TYPES = [
  { value: 'viatico', label: 'Viáticos', icon: Coffee, color: 'text-amber-600' },
  { value: 'vehiculo', label: 'Vehículo', icon: Car, color: 'text-blue-600' },
  { value: 'combustible', label: 'Combustible', icon: Fuel, color: 'text-red-600' },
  { value: 'peaje', label: 'Peaje', icon: Receipt, color: 'text-green-600' },
  { value: 'estacionamiento', label: 'Estacionamiento', icon: MapPin, color: 'text-purple-600' },
  { value: 'otro', label: 'Otro', icon: DollarSign, color: 'text-gray-600' }
];

export function ExpenseReportPanel() {
  const { selectedCompany } = useCompany();
  const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
  const [showNewExpenseForm, setShowNewExpenseForm] = useState(false);

  // Filtrar por empresa si hay una seleccionada
  const filteredExpenses = selectedCompany
    ? expenses.filter(e => e.companyId === selectedCompany.id)
    : expenses;

  // Calcular totales
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const pendingExpenses = filteredExpenses.filter(e => e.status === 'pendiente').reduce((sum, exp) => sum + exp.amount, 0);
  const approvedExpenses = filteredExpenses.filter(e => e.status === 'aprobado').reduce((sum, exp) => sum + exp.amount, 0);

  // Agrupar por tipo
  const expensesByType = filteredExpenses.reduce((acc, exp) => {
    if (!acc[exp.type]) {
      acc[exp.type] = { total: 0, count: 0 };
    }
    acc[exp.type].total += exp.amount;
    acc[exp.type].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const getStatusColor = (status: Expense['status']) => {
    switch (status) {
      case 'aprobado':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'rechazado':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
    }
  };

  const getTypeIcon = (type: Expense['type']) => {
    const typeConfig = EXPENSE_TYPES.find(t => t.value === type);
    return typeConfig ? <typeConfig.icon className={`w-4 h-4 ${typeConfig.color}`} /> : <DollarSign className="w-4 h-4" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            Rendición de Gastos
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Gestión de viáticos y gastos de vehículo institucional
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-zinc-300 dark:border-zinc-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button
            onClick={() => setShowNewExpenseForm(!showNewExpenseForm)}
            className="bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Gasto
          </Button>
        </div>
      </div>

      {/* Resumen financiero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 opacity-80" />
              <Badge className="bg-white/20 text-white border-0">Total</Badge>
            </div>
            <div className="text-3xl font-bold mb-1">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-blue-100 text-sm">
              {filteredExpenses.length} {filteredExpenses.length === 1 ? 'gasto' : 'gastos'} registrados
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 border-0 text-white">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Receipt className="w-8 h-8 opacity-80" />
              <Badge className="bg-white/20 text-white border-0">Pendiente</Badge>
            </div>
            <div className="text-3xl font-bold mb-1">
              {formatCurrency(pendingExpenses)}
            </div>
            <p className="text-yellow-100 text-sm">
              {filteredExpenses.filter(e => e.status === 'pendiente').length} por aprobar
            </p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Check className="w-8 h-8 opacity-80" />
              <Badge className="bg-white/20 text-white border-0">Aprobado</Badge>
            </div>
            <div className="text-3xl font-bold mb-1">
              {formatCurrency(approvedExpenses)}
            </div>
            <p className="text-green-100 text-sm">
              {filteredExpenses.filter(e => e.status === 'aprobado').length} aprobados
            </p>
          </div>
        </Card>
      </div>

      {/* Desglose por tipo */}
      <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
            Gastos por Categoría
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {EXPENSE_TYPES.map((type) => {
              const data = expensesByType[type.value];
              if (!data) return null;

              const Icon = type.icon;
              return (
                <div
                  key={type.value}
                  className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-5 h-5 ${type.color}`} />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      {type.label}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
                    {formatCurrency(data.total)}
                  </div>
                  <p className="text-xs text-zinc-500">
                    {data.count} {data.count === 1 ? 'registro' : 'registros'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Lista de gastos */}
      <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
            Historial de Gastos
          </h3>
          <div className="space-y-3">
            {filteredExpenses.map((expense) => (
              <Card
                key={expense.id}
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getTypeIcon(expense.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-zinc-900 dark:text-white mb-1">
                          {expense.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(expense.date), "dd MMM yyyy", { locale: es })}
                          </div>
                          <span>•</span>
                          <span>{expense.branchName || expense.companyName}</span>
                          {expense.location && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                GPS Verificado
                              </div>
                            </>
                          )}
                          {expense.receipt && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <Receipt className="w-3 h-3" />
                                Con boleta
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xl font-bold text-zinc-900 dark:text-white mb-1">
                        {formatCurrency(expense.amount)}
                      </p>
                      <Badge className={getStatusColor(expense.status)}>
                        {expense.status === 'aprobado' && <Check className="w-3 h-3 mr-1" />}
                        {expense.status === 'rechazado' && <X className="w-3 h-3 mr-1" />}
                        {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {expense.status === 'aprobado' && expense.approvedBy && (
                    <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700">
                      <p className="text-xs text-zinc-500">
                        Aprobado por {expense.approvedBy} el {expense.approvedDate && format(new Date(expense.approvedDate), "dd MMM yyyy", { locale: es })}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
