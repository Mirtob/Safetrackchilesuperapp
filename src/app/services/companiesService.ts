import { supabase } from './supabase';
import { Company, Branch } from '@/app/context/CompanyContext';

// ── Mappers DB → interfaz existente ──────────────────────────────────────────

const mapBranch = (row: any): Branch => ({
  id: row.id,
  name: row.name,
  address: row.address || '',
  coordinates: row.lat != null
    ? { latitude: Number(row.lat), longitude: Number(row.lng) }
    : { latitude: -33.4489, longitude: -70.6693 },
  contactPerson: row.contact_person || '',
  phone: row.phone || '',
  workerCount: row.worker_count || 0,
});

const mapCompany = (row: any): Company => ({
  id: row.id,
  name: row.name,
  rut: row.rut || '',
  address: row.address || '',
  coordinates: row.lat != null
    ? { latitude: Number(row.lat), longitude: Number(row.lng) }
    : undefined,
  industry: row.industry || 'General',
  riskLevel: (['Bajo', 'Medio', 'Alto'].includes(row.risk_level)
    ? row.risk_level
    : 'Medio') as 'Bajo' | 'Medio' | 'Alto',
  workerCount: row.worker_count || 0,
  contractStart: row.contract_start || '',
  contactPerson: row.contact_person || '',
  phone: row.phone || '',
  email: row.email || '',
  mutual: row.mutual || '',
  branches: (row.branches || []).map(mapBranch),
});

// ── CRUD ─────────────────────────────────────────────────────────────────────

export const fetchUserCompanies = async (): Promise<Company[]> => {
  const { data, error } = await supabase
    .from('companies')
    .select('*, branches(*)')
    .order('name');

  if (error) throw error;
  return (data || []).map(mapCompany);
};

export const createCompany = async (
  company: Omit<Company, 'id' | 'branches'>
): Promise<Company> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data, error } = await supabase
    .from('companies')
    .insert({
      name: company.name,
      rut: company.rut || null,
      address: company.address || null,
      lat: company.coordinates?.latitude ?? null,
      lng: company.coordinates?.longitude ?? null,
      industry: company.industry,
      risk_level: company.riskLevel,
      worker_count: company.workerCount || 0,
      contract_start: company.contractStart || null,
      contact_person: company.contactPerson || null,
      phone: company.phone || null,
      email: company.email || null,
      mutual: company.mutual || null,
    })
    .select()
    .single();

  if (error) throw error;

  // Asignar rol al usuario actual
  await supabase.from('user_company_roles').insert({
    user_id: user.id,
    company_id: data.id,
    role: 'prevencionista',
  });

  return mapCompany({ ...data, branches: [] });
};

export const createBranch = async (
  branch: Omit<Branch, 'id'>,
  companyId: string
): Promise<Branch> => {
  const { data, error } = await supabase
    .from('branches')
    .insert({
      company_id: companyId,
      name: branch.name,
      address: branch.address || null,
      lat: branch.coordinates?.latitude ?? null,
      lng: branch.coordinates?.longitude ?? null,
      contact_person: branch.contactPerson || null,
      phone: branch.phone || null,
      worker_count: branch.workerCount || 0,
    })
    .select()
    .single();

  if (error) throw error;
  return mapBranch(data);
};

export const deleteCompany = async (companyId: string): Promise<void> => {
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', companyId);
  if (error) throw error;
};
