import { supabase } from './supabase';

export interface Invoice {
  id: string;
  companyId: string;
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

export interface InvoiceInput {
  companyId: string;
  amount: number;
  description: string;
  dueDate?: string;
}

const mapInvoice = (row: any, clientName: string): Invoice => ({
  id: row.id,
  companyId: row.company_id,
  clientName,
  invoiceNumber: row.invoice_number,
  issueDate: row.issue_date,
  dueDate: row.due_date,
  amount: Number(row.amount),
  status: row.status,
  description: row.description || '',
  paymentMethod: row.payment_method || undefined,
  paidDate: row.paid_date || undefined,
});

export const fetchInvoices = async (
  companies: { id: string; name: string }[]
): Promise<Invoice[]> => {
  if (companies.length === 0) return [];
  const companyIds = companies.map(c => c.id);
  const nameByCompany = new Map(companies.map(c => [c.id, c.name]));

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .in('company_id', companyIds)
    .order('issue_date', { ascending: false });

  if (error) throw error;
  return (data || []).map(row => mapInvoice(row, nameByCompany.get(row.company_id) || ''));
};

export const createInvoice = async (
  input: InvoiceInput,
  clientName: string
): Promise<Invoice> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const invoiceNumber = `HN-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

  const { data, error } = await supabase
    .from('invoices')
    .insert({
      company_id: input.companyId,
      created_by: user.id,
      invoice_number: invoiceNumber,
      due_date: input.dueDate || null,
      amount: input.amount,
      description: input.description,
    })
    .select()
    .single();

  if (error) throw error;
  return mapInvoice(data, clientName);
};

export const markInvoiceAsPaid = async (invoiceId: string, paymentMethod?: string): Promise<void> => {
  const { error } = await supabase
    .from('invoices')
    .update({
      status: 'paid',
      paid_date: new Date().toISOString().split('T')[0],
      payment_method: paymentMethod || 'Transferencia',
    })
    .eq('id', invoiceId);

  if (error) throw error;
};
