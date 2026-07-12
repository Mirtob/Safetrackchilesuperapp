import { supabase } from './supabase';

export interface SafetyKit {
  id: string;
  companyId: string;
  companyName: string;
  kitName: string;
  description: string;
  eppItems: string[];
  createdAt: string;
  updatedAt: string;
}

type SafetyKitInput = Omit<SafetyKit, 'id' | 'companyId' | 'companyName' | 'createdAt' | 'updatedAt'>;

const mapSafetyKit = (row: any, companyName: string): SafetyKit => ({
  id: row.id,
  companyId: row.company_id,
  companyName,
  kitName: row.kit_name,
  description: row.description || '',
  eppItems: row.epp_items || [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const fetchSafetyKitsByCompany = async (companyId: string, companyName: string): Promise<SafetyKit[]> => {
  const { data, error } = await supabase
    .from('safety_kits')
    .select('*')
    .eq('company_id', companyId)
    .order('kit_name');

  if (error) throw error;
  return (data || []).map(row => mapSafetyKit(row, companyName));
};

export const createSafetyKit = async (
  companyId: string,
  companyName: string,
  kit: SafetyKitInput
): Promise<SafetyKit> => {
  const { data, error } = await supabase
    .from('safety_kits')
    .insert({
      company_id: companyId,
      kit_name: kit.kitName,
      description: kit.description || null,
      epp_items: kit.eppItems,
    })
    .select()
    .single();

  if (error) throw error;
  return mapSafetyKit(data, companyName);
};

export const updateSafetyKit = async (
  kitId: string,
  companyName: string,
  kit: SafetyKitInput
): Promise<SafetyKit> => {
  const { data, error } = await supabase
    .from('safety_kits')
    .update({
      kit_name: kit.kitName,
      description: kit.description || null,
      epp_items: kit.eppItems,
    })
    .eq('id', kitId)
    .select()
    .single();

  if (error) throw error;
  return mapSafetyKit(data, companyName);
};

export const deleteSafetyKit = async (kitId: string): Promise<void> => {
  const { error } = await supabase
    .from('safety_kits')
    .delete()
    .eq('id', kitId);
  if (error) throw error;
};
