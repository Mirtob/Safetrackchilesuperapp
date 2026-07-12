import { supabase } from './supabase';

export type ExpenseCategory = 'transport' | 'fuel' | 'food' | 'accommodation' | 'materials' | 'other';

export interface Expense {
  id: string;
  companyId: string;
  clientName: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  receipts: string[];
  location: string;
  status: 'pending' | 'approved' | 'reimbursed';
  gpsVerified: boolean;
  mileage?: number;
}

export interface ExpenseInput {
  companyId: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  receipts: string[];
  location: string;
  mileage?: number;
  gpsVerified: boolean;
}

const mapExpense = (row: any, clientName: string): Expense => ({
  id: row.id,
  companyId: row.company_id,
  clientName,
  date: row.expense_date,
  category: row.category,
  description: row.description || '',
  amount: Number(row.amount),
  receipts: row.receipts || [],
  location: row.location || '',
  status: row.status,
  gpsVerified: row.gps_verified,
  mileage: row.mileage != null ? Number(row.mileage) : undefined,
});

export const fetchExpenses = async (
  companies: { id: string; name: string }[]
): Promise<Expense[]> => {
  if (companies.length === 0) return [];
  const companyIds = companies.map(c => c.id);
  const nameByCompany = new Map(companies.map(c => [c.id, c.name]));

  const { data, error } = await supabase
    .from('professional_expenses')
    .select('*')
    .in('company_id', companyIds)
    .order('expense_date', { ascending: false });

  if (error) throw error;
  return (data || []).map(row => mapExpense(row, nameByCompany.get(row.company_id) || ''));
};

export const createExpense = async (input: ExpenseInput, clientName: string): Promise<Expense> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data, error } = await supabase
    .from('professional_expenses')
    .insert({
      company_id: input.companyId,
      created_by: user.id,
      expense_date: input.date,
      category: input.category,
      description: input.description || null,
      amount: input.amount,
      receipts: input.receipts,
      location: input.location || null,
      mileage: input.mileage ?? null,
      gps_verified: input.gpsVerified,
    })
    .select()
    .single();

  if (error) throw error;
  return mapExpense(data, clientName);
};

export const updateExpenseStatus = async (expenseId: string, status: Expense['status']): Promise<void> => {
  const { error } = await supabase
    .from('professional_expenses')
    .update({ status })
    .eq('id', expenseId);
  if (error) throw error;
};
