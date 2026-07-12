import { addMonths, format } from 'date-fns';
import { supabase } from './supabase';

export type EventType = 'legal' | 'routine' | 'inspection' | 'training';
export type EventPriority = 'critical' | 'high' | 'medium' | 'low';
export type RecurrenceFrequency = 'mensual' | 'trimestral' | 'semestral' | 'anual';

export interface ScheduledEventInput {
  companyId: string;
  branchId?: string;
  title: string;
  eventType: EventType;
  eventDate: string;
  eventTime?: string;
  location?: string;
  priority: EventPriority;
  deadlineNote?: string;
  isRecurring?: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  notes?: string;
}

export interface ScheduledEvent {
  id: string;
  companyId: string;
  title: string;
  eventType: EventType;
  date: string;
  time: string;
  location: string;
  priority: EventPriority;
  deadlineNote?: string;
  status: 'scheduled' | 'pending' | 'completed';
  isRecurring: boolean;
  recurrenceFrequency?: RecurrenceFrequency;
  lastCompletedDate?: string;
  notes?: string;
}

const mapEvent = (row: any): ScheduledEvent => ({
  id: row.id,
  companyId: row.company_id,
  title: row.title,
  eventType: row.event_type,
  date: row.event_date,
  time: row.event_time || '',
  location: row.location || '',
  priority: row.priority,
  deadlineNote: row.deadline_note || undefined,
  status: row.status,
  isRecurring: row.is_recurring,
  recurrenceFrequency: row.recurrence_frequency || undefined,
  lastCompletedDate: row.last_completed_date || undefined,
  notes: row.notes || undefined,
});

export const fetchCompanyEvents = async (companyId: string): Promise<ScheduledEvent[]> => {
  const { data, error } = await supabase
    .from('scheduled_events')
    .select('*')
    .eq('company_id', companyId)
    .order('event_date');

  if (error) throw error;
  return (data || []).map(mapEvent);
};

export const createScheduledEvent = async (input: ScheduledEventInput): Promise<ScheduledEvent> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data, error } = await supabase
    .from('scheduled_events')
    .insert({
      company_id: input.companyId,
      branch_id: input.branchId || null,
      created_by: user.id,
      title: input.title,
      event_type: input.eventType,
      event_date: input.eventDate,
      event_time: input.eventTime || null,
      location: input.location || null,
      priority: input.priority,
      deadline_note: input.deadlineNote || null,
      is_recurring: input.isRecurring || false,
      recurrence_frequency: input.recurrenceFrequency || null,
      notes: input.notes || null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapEvent(data);
};

const monthsFor: Record<RecurrenceFrequency, number> = {
  mensual: 1,
  trimestral: 3,
  semestral: 6,
  anual: 12,
};

/**
 * Marca un evento como completado. Si es recurrente, en vez de cerrarlo calcula
 * la próxima fecha de vencimiento y reprograma el mismo evento (autoalimentado).
 */
export const markEventCompleted = async (event: ScheduledEvent): Promise<ScheduledEvent> => {
  if (event.isRecurring && event.recurrenceFrequency) {
    const nextDate = addMonths(new Date(`${event.date}T00:00:00`), monthsFor[event.recurrenceFrequency]);
    const { data, error } = await supabase
      .from('scheduled_events')
      .update({
        last_completed_date: event.date,
        event_date: format(nextDate, 'yyyy-MM-dd'),
        status: 'scheduled',
      })
      .eq('id', event.id)
      .select()
      .single();
    if (error) throw error;
    return mapEvent(data);
  }

  const { data, error } = await supabase
    .from('scheduled_events')
    .update({ status: 'completed' })
    .eq('id', event.id)
    .select()
    .single();
  if (error) throw error;
  return mapEvent(data);
};
