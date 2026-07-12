import { supabase } from './supabase';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'corrective-actions' | 'monitoring' | 'closed';

export interface AffectedWorker {
  id?: string;
  name: string;
  rut?: string;
  position?: string;
  department?: string;
}

export interface IncidentInput {
  companyId: string;
  branchId?: string;
  incidentType: string;
  severity: IncidentSeverity;
  title: string;
  description: string;
  sector?: string;
  location?: string;
  affectedWorkers: AffectedWorker[];
  immediateActions?: string;
  photos: string[];
  signatureData?: string | null;
}

export interface IncidentRecord {
  id: string;
  code: string;
  companyId: string;
  type: 'accident' | 'incident';
  incidentType: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  sector: string;
  location: string;
  date: string;
  reportedBy: string;
  affectedPersons: string[];
  status: IncidentStatus;
  daysOpen: number;
  medicalAttention: boolean;
  leaveDays: number;
  estimatedCost: number;
  actionsTotal: number;
  actionsCompleted: number;
}

const daysBetween = (start: string, end: string): number =>
  Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)));

const mapIncident = (row: any): IncidentRecord => {
  const actions = row.incident_actions || [];
  const affected: AffectedWorker[] = row.affected_workers || [];
  return {
    id: row.id,
    code: row.code,
    companyId: row.company_id,
    type: row.incident_type === 'accident' ? 'accident' : 'incident',
    incidentType: row.incident_type,
    title: row.title,
    description: row.description || '',
    severity: row.severity,
    sector: row.sector || '',
    location: row.location || '',
    date: row.created_at,
    reportedBy: 'Prevencionista a cargo',
    affectedPersons: affected.map(w => w.name),
    status: row.status,
    daysOpen: daysBetween(row.created_at, row.closed_at || new Date().toISOString()),
    medicalAttention: row.medical_attention,
    leaveDays: row.leave_days || 0,
    estimatedCost: row.estimated_cost ? Number(row.estimated_cost) : 0,
    actionsTotal: actions.length,
    actionsCompleted: actions.filter((a: any) => a.status === 'completed').length,
  };
};

export const createIncident = async (input: IncidentInput): Promise<IncidentRecord> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data, error } = await supabase
    .from('incidents')
    .insert({
      company_id: input.companyId,
      branch_id: input.branchId || null,
      created_by: user.id,
      incident_type: input.incidentType,
      severity: input.severity,
      title: input.title,
      description: input.description,
      sector: input.sector || null,
      location: input.location || null,
      affected_workers: input.affectedWorkers,
      immediate_actions: input.immediateActions || null,
      photos: input.photos,
      signature_data: input.signatureData || null,
      medical_attention: false,
    })
    .select('*, incident_actions(id, status)')
    .single();

  if (error) throw error;
  return mapIncident(data);
};

export const fetchIncidentsForCompanies = async (companyIds: string[]): Promise<IncidentRecord[]> => {
  if (companyIds.length === 0) return [];
  const { data, error } = await supabase
    .from('incidents')
    .select('*, incident_actions(id, status)')
    .in('company_id', companyIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapIncident);
};

export const updateIncidentStatus = async (incidentId: string, status: IncidentStatus): Promise<void> => {
  const { error } = await supabase
    .from('incidents')
    .update({
      status,
      closed_at: status === 'closed' ? new Date().toISOString() : null,
    })
    .eq('id', incidentId);
  if (error) throw error;
};

// ── Acciones correctivas ─────────────────────────────────────────────────────

export interface IncidentAction {
  id: string;
  incidentId: string;
  type: 'medical' | 'investigation' | 'corrective' | 'preventive' | 'training' | 'infrastructure' | 'communication' | 'other';
  title: string;
  description: string;
  responsible: string;
  deadline: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  completedAt?: string;
  evidence?: string[];
  notes?: string;
}

type IncidentActionInput = Omit<IncidentAction, 'id' | 'incidentId' | 'createdAt' | 'completedAt' | 'status'>;

const mapAction = (row: any): IncidentAction => ({
  id: row.id,
  incidentId: row.incident_id,
  type: row.action_type,
  title: row.title,
  description: row.description || '',
  responsible: row.responsible || '',
  deadline: row.deadline,
  status: row.status,
  priority: row.priority,
  createdAt: row.created_at,
  completedAt: row.completed_at || undefined,
  evidence: row.evidence || undefined,
  notes: row.notes || undefined,
});

export const fetchIncidentActions = async (incidentId: string): Promise<IncidentAction[]> => {
  const { data, error } = await supabase
    .from('incident_actions')
    .select('*')
    .eq('incident_id', incidentId)
    .order('created_at');
  if (error) throw error;
  return (data || []).map(mapAction);
};

export const createIncidentAction = async (
  incidentId: string,
  action: IncidentActionInput
): Promise<IncidentAction> => {
  const { data, error } = await supabase
    .from('incident_actions')
    .insert({
      incident_id: incidentId,
      action_type: action.type,
      title: action.title,
      description: action.description || null,
      responsible: action.responsible || null,
      deadline: action.deadline || null,
      priority: action.priority,
    })
    .select()
    .single();
  if (error) throw error;
  return mapAction(data);
};

export const updateIncidentActionStatus = async (
  actionId: string,
  status: IncidentAction['status']
): Promise<void> => {
  const { error } = await supabase
    .from('incident_actions')
    .update({
      status,
      completed_at: status === 'completed' ? new Date().toISOString() : null,
    })
    .eq('id', actionId);
  if (error) throw error;
};

// ── Registros médicos ─────────────────────────────────────────────────────────

export interface IncidentMedicalRecord {
  id: string;
  incidentId: string;
  workerName: string;
  injuryType: string;
  injurySeverity: 'leve' | 'moderada' | 'grave' | 'fatal';
  medicalAttention: 'primeros-auxilios' | 'centro-medico' | 'hospital' | 'mutualidad' | 'no-requerida';
  diagnosis: string;
  treatment: string;
  medicalLeave: boolean;
  leaveDays?: number;
  leaveStartDate?: string;
  leaveEndDate?: string;
  workRestrictions?: string;
  followUpRequired: boolean;
  nextCheckup?: string;
  createdAt: string;
}

type IncidentMedicalRecordInput = Omit<IncidentMedicalRecord, 'id' | 'incidentId' | 'createdAt'>;

const mapMedicalRecord = (row: any): IncidentMedicalRecord => ({
  id: row.id,
  incidentId: row.incident_id,
  workerName: row.worker_name,
  injuryType: row.injury_type || '',
  injurySeverity: row.injury_severity,
  medicalAttention: row.medical_attention,
  diagnosis: row.diagnosis || '',
  treatment: row.treatment || '',
  medicalLeave: row.medical_leave,
  leaveDays: row.leave_days || undefined,
  leaveStartDate: row.leave_start_date || undefined,
  leaveEndDate: row.leave_end_date || undefined,
  workRestrictions: row.work_restrictions || undefined,
  followUpRequired: row.follow_up_required,
  nextCheckup: row.next_checkup || undefined,
  createdAt: row.created_at,
});

export const fetchIncidentMedicalRecords = async (incidentId: string): Promise<IncidentMedicalRecord[]> => {
  const { data, error } = await supabase
    .from('incident_medical_records')
    .select('*')
    .eq('incident_id', incidentId)
    .order('created_at');
  if (error) throw error;
  return (data || []).map(mapMedicalRecord);
};

export const createIncidentMedicalRecord = async (
  incidentId: string,
  record: IncidentMedicalRecordInput
): Promise<IncidentMedicalRecord> => {
  const { data, error } = await supabase
    .from('incident_medical_records')
    .insert({
      incident_id: incidentId,
      worker_name: record.workerName,
      injury_type: record.injuryType || null,
      injury_severity: record.injurySeverity,
      medical_attention: record.medicalAttention,
      diagnosis: record.diagnosis || null,
      treatment: record.treatment || null,
      medical_leave: record.medicalLeave,
      leave_days: record.leaveDays ?? null,
      leave_start_date: record.leaveStartDate || null,
      leave_end_date: record.leaveEndDate || null,
      work_restrictions: record.workRestrictions || null,
      follow_up_required: record.followUpRequired,
      next_checkup: record.nextCheckup || null,
    })
    .select()
    .single();
  if (error) throw error;

  // Si implica licencia, refleja los días y la atención médica en el incidente
  if (record.medicalLeave && record.leaveDays) {
    await supabase
      .from('incidents')
      .update({ medical_attention: true, leave_days: record.leaveDays })
      .eq('id', incidentId);
  } else {
    await supabase
      .from('incidents')
      .update({ medical_attention: true })
      .eq('id', incidentId);
  }

  return mapMedicalRecord(data);
};
