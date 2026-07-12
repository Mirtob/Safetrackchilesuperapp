import { supabase } from './supabase';

export interface InspectionInput {
  companyId: string;
  branchId?: string;
  assetId?: string;
  sector?: string;
  assetName?: string;
  description: string;
  location?: string;
  photos: string[];
  signatureData?: string | null;
  checklistItems?: { label: string; status: 'pass' | 'fail' | 'pending' }[];
}

export interface Inspection {
  id: string;
  companyId: string;
  branchId?: string;
  assetId?: string;
  sector: string;
  assetName: string;
  description: string;
  location: string;
  photos: string[];
  signatureData?: string;
  checklistItems: { label: string; status: 'pass' | 'fail' | 'pending' }[];
  status: 'completed' | 'fault-reported';
  createdAt: string;
}

const mapInspection = (row: any): Inspection => ({
  id: row.id,
  companyId: row.company_id,
  branchId: row.branch_id || undefined,
  assetId: row.asset_id || undefined,
  sector: row.sector || '',
  assetName: row.asset_name || '',
  description: row.description || '',
  location: row.location || '',
  photos: row.photos || [],
  signatureData: row.signature_data || undefined,
  checklistItems: row.checklist_items || [],
  status: row.status || 'completed',
  createdAt: row.created_at,
});

export const createInspection = async (input: InspectionInput): Promise<Inspection> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data, error } = await supabase
    .from('inspections')
    .insert({
      company_id: input.companyId,
      branch_id: input.branchId || null,
      asset_id: input.assetId || null,
      created_by: user.id,
      sector: input.sector || null,
      asset_name: input.assetName || null,
      description: input.description,
      location: input.location || null,
      photos: input.photos,
      signature_data: input.signatureData || null,
      checklist_items: input.checklistItems && input.checklistItems.length > 0 ? input.checklistItems : null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapInspection(data);
};

export const fetchInspectionsByCompany = async (companyId: string): Promise<Inspection[]> => {
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapInspection);
};
