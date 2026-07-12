import { supabase } from './supabase';

export interface Training {
  type: string;
  date: string;
  expiryDate: string;
  status: 'vigente' | 'por-vencer' | 'vencida';
  daysRemaining?: number;
  requiredBy: string;
}

export interface Worker {
  id: string;
  rut: string;
  name: string;
  position: string;
  company: string;
  department: string;
  sector: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  contractType: 'indefinido' | 'plazo-fijo' | 'honorarios';
  startDate: string;
  status: 'active' | 'inactive';
  trainings: Training[];
  alertCount: number;
}

const mapWorker = (row: any, companyName: string): Worker => ({
  id: row.id,
  rut: row.rut,
  name: row.full_name,
  position: row.job_title || '',
  company: companyName,
  department: row.department || '',
  sector: row.sector || '',
  phone: row.phone || '',
  email: row.email || '',
  address: row.address || '',
  emergencyContact: row.emergency_contact || '',
  emergencyPhone: row.emergency_phone || '',
  contractType: (['indefinido', 'plazo-fijo', 'honorarios'].includes(row.contract_type)
    ? row.contract_type
    : 'indefinido') as Worker['contractType'],
  startDate: row.start_date || '',
  status: row.is_active ? 'active' : 'inactive',
  trainings: [],
  alertCount: 0,
});

export const fetchWorkersByCompany = async (companyId: string, companyName: string): Promise<Worker[]> => {
  const { data, error } = await supabase
    .from('workers')
    .select('*')
    .eq('company_id', companyId)
    .order('full_name');

  if (error) throw error;
  return (data || []).map(row => mapWorker(row, companyName));
};

export const createWorker = async (
  companyId: string,
  worker: Omit<Worker, 'id' | 'company' | 'trainings' | 'alertCount'>
): Promise<Worker> => {
  const { data, error } = await supabase
    .from('workers')
    .insert({
      company_id: companyId,
      rut: worker.rut,
      full_name: worker.name,
      job_title: worker.position || null,
      department: worker.department || null,
      sector: worker.sector || null,
      phone: worker.phone || null,
      email: worker.email || null,
      address: worker.address || null,
      emergency_contact: worker.emergencyContact || null,
      emergency_phone: worker.emergencyPhone || null,
      contract_type: worker.contractType,
      start_date: worker.startDate || null,
      is_active: worker.status === 'active',
    })
    .select()
    .single();

  if (error) throw error;
  return mapWorker(data, '');
};

export const updateWorker = async (
  workerId: string,
  worker: Omit<Worker, 'id' | 'company' | 'trainings' | 'alertCount'>
): Promise<Worker> => {
  const { data, error } = await supabase
    .from('workers')
    .update({
      rut: worker.rut,
      full_name: worker.name,
      job_title: worker.position || null,
      department: worker.department || null,
      sector: worker.sector || null,
      phone: worker.phone || null,
      email: worker.email || null,
      address: worker.address || null,
      emergency_contact: worker.emergencyContact || null,
      emergency_phone: worker.emergencyPhone || null,
      contract_type: worker.contractType,
      start_date: worker.startDate || null,
      is_active: worker.status === 'active',
    })
    .eq('id', workerId)
    .select()
    .single();

  if (error) throw error;
  return mapWorker(data, '');
};

export const deleteWorker = async (workerId: string): Promise<void> => {
  const { error } = await supabase
    .from('workers')
    .delete()
    .eq('id', workerId);
  if (error) throw error;
};
