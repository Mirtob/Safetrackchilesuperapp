import { supabase } from './supabase';

export interface CompanyQRCode {
  id: string;
  companyName: string;
  companyId: string;
  token: string;
  createdDate: string;
  expiresDate: string | null;
  isActive: boolean;
  usageCount: number;
  lastUsed: string | null;
}

const mapQRCode = (row: any, companyName: string): CompanyQRCode => ({
  id: row.id,
  companyName,
  companyId: row.company_id,
  token: row.token,
  createdDate: row.created_at,
  expiresDate: row.expires_at,
  isActive: row.is_active,
  usageCount: row.usage_count || 0,
  lastUsed: row.last_used_at,
});

const generateToken = () => `QR-EMERGENCY-${crypto.randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase()}`;

/** Trae el código QR de emergencia de cada empresa, creando uno automáticamente si no existe aún. */
export const fetchQRCodesForCompanies = async (
  companies: { id: string; name: string }[]
): Promise<CompanyQRCode[]> => {
  if (companies.length === 0) return [];
  const companyIds = companies.map(c => c.id);

  const { data: existing, error } = await supabase
    .from('emergency_qr_codes')
    .select('*')
    .in('company_id', companyIds);

  if (error) throw error;

  const existingByCompany = new Map((existing || []).map(row => [row.company_id, row]));
  const missing = companies.filter(c => !existingByCompany.has(c.id));

  let created: any[] = [];
  if (missing.length > 0) {
    const { data: insertedRows, error: insertError } = await supabase
      .from('emergency_qr_codes')
      .insert(missing.map(c => ({ company_id: c.id, token: generateToken() })))
      .select();

    if (insertError) throw insertError;
    created = insertedRows || [];
  }

  const allRows = [...(existing || []), ...created];
  const nameByCompany = new Map(companies.map(c => [c.id, c.name]));

  return allRows
    .map(row => mapQRCode(row, nameByCompany.get(row.company_id) || ''))
    .sort((a, b) => a.companyName.localeCompare(b.companyName));
};

export const toggleQRCodeActive = async (id: string, isActive: boolean): Promise<void> => {
  const { error } = await supabase
    .from('emergency_qr_codes')
    .update({ is_active: isActive })
    .eq('id', id);
  if (error) throw error;
};

export const regenerateQRToken = async (id: string): Promise<string> => {
  const token = generateToken();
  const { error } = await supabase
    .from('emergency_qr_codes')
    .update({ token })
    .eq('id', id);
  if (error) throw error;
  return token;
};
