import { supabase } from './supabase';

export interface InspectionElement {
  id: string;
  companyId: string;
  companyName: string;
  type: 'sector' | 'activo' | 'checkpoint';
  name: string;
  description: string;
  parentId?: string;
  risk: 'bajo' | 'medio' | 'alto' | 'critico';
  createdAt: string;
  updatedAt: string;
}

type InspectionElementInput = Pick<InspectionElement, 'type' | 'name' | 'description' | 'risk' | 'parentId'>;

const mapElement = (row: any, companyName: string): InspectionElement => ({
  id: row.id,
  companyId: row.company_id,
  companyName,
  type: row.element_type,
  name: row.name,
  description: row.description || '',
  parentId: row.parent_id || undefined,
  risk: row.risk_level || 'medio',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const fetchInspectionElementsByCompany = async (
  companyId: string,
  companyName: string
): Promise<InspectionElement[]> => {
  const { data, error } = await supabase
    .from('inspection_config_elements')
    .select('*')
    .eq('company_id', companyId)
    .order('name');

  if (error) throw error;
  return (data || []).map(row => mapElement(row, companyName));
};

export const createInspectionElement = async (
  companyId: string,
  companyName: string,
  element: InspectionElementInput
): Promise<InspectionElement> => {
  const { data, error } = await supabase
    .from('inspection_config_elements')
    .insert({
      company_id: companyId,
      element_type: element.type,
      name: element.name,
      description: element.description || null,
      parent_id: element.parentId || null,
      risk_level: element.risk,
    })
    .select()
    .single();

  if (error) throw error;
  return mapElement(data, companyName);
};

export const updateInspectionElement = async (
  elementId: string,
  companyName: string,
  element: InspectionElementInput
): Promise<InspectionElement> => {
  const { data, error } = await supabase
    .from('inspection_config_elements')
    .update({
      name: element.name,
      description: element.description || null,
      parent_id: element.parentId || null,
      risk_level: element.risk,
    })
    .eq('id', elementId)
    .select()
    .single();

  if (error) throw error;
  return mapElement(data, companyName);
};

export const deleteInspectionElement = async (elementId: string): Promise<void> => {
  const { error } = await supabase
    .from('inspection_config_elements')
    .delete()
    .eq('id', elementId);
  if (error) throw error;
};
