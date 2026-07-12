import { supabase } from './supabase';

export interface TimeEntry {
  id: string;
  companyId: string;
  clientName: string;
  date: string;
  startTime: string;
  endTime?: string;
  duration: number;
  location: string;
  activity: string;
  amount: number;
  hourlyRate?: number;
  status: 'in-progress' | 'completed';
  gpsVerified: boolean;
}

export interface TimeEntryInput {
  companyId: string;
  date: string;
  startTime: string;
  endTime?: string;
  duration: number;
  location: string;
  activity: string;
  amount: number;
  hourlyRate?: number;
  status: 'in-progress' | 'completed';
  gpsVerified: boolean;
}

const mapEntry = (row: any, clientName: string): TimeEntry => ({
  id: row.id,
  companyId: row.company_id,
  clientName,
  date: row.entry_date,
  startTime: row.start_time || '',
  endTime: row.end_time || undefined,
  duration: Number(row.duration_hours || 0),
  location: row.location || '',
  activity: row.activity || '',
  amount: Number(row.amount || 0),
  hourlyRate: row.hourly_rate != null ? Number(row.hourly_rate) : undefined,
  status: row.status,
  gpsVerified: row.gps_verified,
});

export const fetchTimeEntries = async (
  companies: { id: string; name: string }[]
): Promise<TimeEntry[]> => {
  if (companies.length === 0) return [];
  const companyIds = companies.map(c => c.id);
  const nameByCompany = new Map(companies.map(c => [c.id, c.name]));

  const { data, error } = await supabase
    .from('professional_time_entries')
    .select('*')
    .in('company_id', companyIds)
    .order('entry_date', { ascending: false });

  if (error) throw error;
  return (data || []).map(row => mapEntry(row, nameByCompany.get(row.company_id) || ''));
};

export const createTimeEntry = async (input: TimeEntryInput, clientName: string): Promise<TimeEntry> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data, error } = await supabase
    .from('professional_time_entries')
    .insert({
      company_id: input.companyId,
      created_by: user.id,
      entry_date: input.date,
      start_time: input.startTime || null,
      end_time: input.endTime || null,
      duration_hours: input.duration,
      location: input.location || null,
      activity: input.activity || null,
      hourly_rate: input.hourlyRate ?? null,
      amount: input.amount,
      status: input.status,
      gps_verified: input.gpsVerified,
    })
    .select()
    .single();

  if (error) throw error;
  return mapEntry(data, clientName);
};

export const updateTimeEntry = async (
  entryId: string,
  input: Partial<TimeEntryInput>,
  clientName: string
): Promise<TimeEntry> => {
  const patch: Record<string, any> = {};
  if (input.date !== undefined) patch.entry_date = input.date;
  if (input.startTime !== undefined) patch.start_time = input.startTime;
  if (input.endTime !== undefined) patch.end_time = input.endTime;
  if (input.duration !== undefined) patch.duration_hours = input.duration;
  if (input.location !== undefined) patch.location = input.location;
  if (input.activity !== undefined) patch.activity = input.activity;
  if (input.hourlyRate !== undefined) patch.hourly_rate = input.hourlyRate;
  if (input.amount !== undefined) patch.amount = input.amount;
  if (input.status !== undefined) patch.status = input.status;
  if (input.gpsVerified !== undefined) patch.gps_verified = input.gpsVerified;

  const { data, error } = await supabase
    .from('professional_time_entries')
    .update(patch)
    .eq('id', entryId)
    .select()
    .single();

  if (error) throw error;
  return mapEntry(data, clientName);
};
