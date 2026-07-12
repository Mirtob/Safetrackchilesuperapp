import { supabase } from './supabase';
import { fetchUserCompanies } from './companiesService';

export interface ClientCompany {
  id: string;
  name: string;
  rut: string;
  location: string;
  contractType: 'consultoria' | 'asesoria' | 'completo';
  hourlyRate: number;
  monthlyFee?: number;
  paymentDay: number;
  lastPayment?: string;
  nextPayment?: string;
  hoursThisMonth: number;
  pendingAmount: number;
  expensesThisMonth: number;
  status: 'active' | 'pending' | 'inactive';
  brandColor: string;
  startDate: string;
  hasBillingProfile: boolean;
}

export interface BillingProfileInput {
  contractType: ClientCompany['contractType'];
  hourlyRate: number;
  monthlyFee?: number;
  paymentDay: number;
  status: ClientCompany['status'];
  brandColor: string;
}

const DEFAULT_COLORS = ['#0055A4', '#DC2626', '#F59E0B', '#10B981', '#7C3AED', '#0EA5E9'];

const monthStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
};

/** Trae las empresas del usuario (companiesService) fusionadas con su perfil de facturación y métricas del mes. */
export const fetchClientPortfolio = async (): Promise<ClientCompany[]> => {
  const companies = await fetchUserCompanies();
  if (companies.length === 0) return [];
  const companyIds = companies.map(c => c.id);
  const from = monthStart();

  const [{ data: profiles, error: profilesError }, { data: entries, error: entriesError }, { data: invoices, error: invoicesError }, { data: expenses, error: expensesError }] =
    await Promise.all([
      supabase.from('client_billing_profiles').select('*').in('company_id', companyIds),
      supabase.from('professional_time_entries').select('company_id, duration_hours').in('company_id', companyIds).eq('status', 'completed').gte('entry_date', from),
      supabase.from('invoices').select('company_id, amount, status, due_date').in('company_id', companyIds).eq('status', 'pending'),
      supabase.from('professional_expenses').select('company_id, amount').in('company_id', companyIds).gte('expense_date', from),
    ]);

  if (profilesError) throw profilesError;
  if (entriesError) throw entriesError;
  if (invoicesError) throw invoicesError;
  if (expensesError) throw expensesError;

  const profileByCompany = new Map((profiles || []).map(p => [p.company_id, p]));

  const sumBy = (rows: any[] | null, key: string) => {
    const totals = new Map<string, number>();
    (rows || []).forEach(row => {
      totals.set(row.company_id, (totals.get(row.company_id) || 0) + Number(row[key] || 0));
    });
    return totals;
  };
  const hoursTotals = sumBy(entries, 'duration_hours');
  const pendingTotals = sumBy(invoices, 'amount');
  const expenseTotals = sumBy(expenses, 'amount');

  const nextDueByCompany = new Map<string, string>();
  (invoices || []).forEach(inv => {
    if (inv.due_date && (!nextDueByCompany.has(inv.company_id) || inv.due_date < nextDueByCompany.get(inv.company_id)!)) {
      nextDueByCompany.set(inv.company_id, inv.due_date);
    }
  });

  return companies.map((company, idx): ClientCompany => {
    const profile = profileByCompany.get(company.id);
    return {
      id: company.id,
      name: company.name,
      rut: company.rut,
      location: company.address || '',
      contractType: profile?.contract_type || 'consultoria',
      hourlyRate: profile ? Number(profile.hourly_rate) : 0,
      monthlyFee: profile?.monthly_fee != null ? Number(profile.monthly_fee) : undefined,
      paymentDay: profile?.payment_day || 30,
      nextPayment: nextDueByCompany.get(company.id),
      hoursThisMonth: hoursTotals.get(company.id) || 0,
      pendingAmount: pendingTotals.get(company.id) || 0,
      expensesThisMonth: expenseTotals.get(company.id) || 0,
      status: profile?.status || 'pending',
      brandColor: profile?.brand_color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
      startDate: profile?.start_date || company.contractStart || new Date().toISOString().split('T')[0],
      hasBillingProfile: Boolean(profile),
    };
  });
};

export const upsertBillingProfile = async (
  companyId: string,
  input: BillingProfileInput
): Promise<void> => {
  const { error } = await supabase
    .from('client_billing_profiles')
    .upsert({
      company_id: companyId,
      contract_type: input.contractType,
      hourly_rate: input.hourlyRate,
      monthly_fee: input.monthlyFee ?? null,
      payment_day: input.paymentDay,
      status: input.status,
      brand_color: input.brandColor,
    }, { onConflict: 'company_id' });

  if (error) throw error;
};
