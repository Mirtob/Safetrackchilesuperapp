import { supabase } from './supabase';

export interface SafetyTalkInput {
  companyId: string;
  branchId?: string;
  title: string;
  topic?: string;
  talkType: 'talk' | 'epp' | 'induction';
  talkDate: string;
  location?: string;
  eppItems?: string[];
}

export interface SignatureInput {
  workerId?: string;
  workerName: string;
  workerRut?: string;
  signatureData: string;
}

export const createSafetyTalkWithSignatures = async (
  talk: SafetyTalkInput,
  signatures: SignatureInput[]
): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data: talkRow, error: talkError } = await supabase
    .from('safety_talks')
    .insert({
      company_id: talk.companyId,
      branch_id: talk.branchId || null,
      created_by: user.id,
      title: talk.title,
      topic: talk.topic || null,
      talk_type: talk.talkType,
      talk_date: talk.talkDate,
      location: talk.location || null,
      status: 'completed',
      epp_items: talk.eppItems && talk.eppItems.length > 0 ? talk.eppItems : null,
    })
    .select()
    .single();

  if (talkError) throw talkError;

  if (signatures.length > 0) {
    const { error: signaturesError } = await supabase
      .from('signatures')
      .insert(signatures.map(s => ({
        talk_id: talkRow.id,
        worker_id: s.workerId || null,
        worker_name: s.workerName,
        worker_rut: s.workerRut || null,
        signature_data: s.signatureData,
      })));

    if (signaturesError) throw signaturesError;
  }

  return talkRow.id;
};

// ── Bóveda documental / firma gerencial ─────────────────────────────────────
// Cada charla/entrega EPP/inducción guardada arriba también actúa como
// "documento" legal: EnhancedDocumentVault las lista, RemoteSignature las
// envía para firma gerencial y ManagerSignaturePortal aprueba/rechaza.

export type ManagerApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface TalkDocument {
  id: string;
  companyId: string;
  title: string;
  category: 'EPP' | 'Charlas' | 'Inducciones';
  talkType: 'talk' | 'epp' | 'induction';
  date: string;
  location?: string;
  createdBy: string;
  eppItems: string[];
  signaturesCount: number;
  managerApprovalStatus: ManagerApprovalStatus;
  managerApprovedBy?: string;
  managerApprovedAt?: string;
  managerRejectReason?: string;
  integrityHash?: string;
  sentVia?: 'whatsapp' | 'email';
  sentTo?: string;
  sentAt?: string;
}

const categoryFor = (talkType: string): TalkDocument['category'] =>
  talkType === 'epp' ? 'EPP' : talkType === 'induction' ? 'Inducciones' : 'Charlas';

const mapTalkDocument = (row: any): TalkDocument => ({
  id: row.id,
  companyId: row.company_id,
  title: row.title,
  category: categoryFor(row.talk_type),
  talkType: (row.talk_type || 'talk') as TalkDocument['talkType'],
  date: row.talk_date,
  location: row.location || undefined,
  createdBy: row.created_by,
  eppItems: Array.isArray(row.epp_items) ? row.epp_items : [],
  signaturesCount: Array.isArray(row.signatures) ? row.signatures.length : 0,
  managerApprovalStatus: (row.manager_approval_status || 'pending') as ManagerApprovalStatus,
  managerApprovedBy: row.manager_approved_by || undefined,
  managerApprovedAt: row.manager_approved_at || undefined,
  managerRejectReason: row.manager_reject_reason || undefined,
  integrityHash: row.integrity_hash || undefined,
  sentVia: row.sent_via || undefined,
  sentTo: row.sent_to || undefined,
  sentAt: row.sent_at || undefined,
});

export const fetchCompanyDocuments = async (companyId: string): Promise<TalkDocument[]> => {
  const { data, error } = await supabase
    .from('safety_talks')
    .select('*, signatures(id)')
    .eq('company_id', companyId)
    .order('talk_date', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapTalkDocument);
};

export const fetchTalkDocument = async (talkId: string): Promise<TalkDocument> => {
  const { data, error } = await supabase
    .from('safety_talks')
    .select('*, signatures(id)')
    .eq('id', talkId)
    .single();

  if (error) throw error;
  return mapTalkDocument(data);
};

const computeIntegrityHash = async (payload: string): Promise<string> => {
  const data = new TextEncoder().encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `SHA256:${hex}`;
};

export const approveTalkDocument = async (
  talkId: string,
  approvedBy: string,
  location?: { lat: number; lng: number }
): Promise<string> => {
  const integrityHash = await computeIntegrityHash(`${talkId}:${approvedBy}:${Date.now()}`);
  const { error } = await supabase
    .from('safety_talks')
    .update({
      manager_approval_status: 'approved',
      manager_approved_by: approvedBy,
      manager_approved_at: new Date().toISOString(),
      manager_reject_reason: null,
      integrity_hash: integrityHash,
      approval_lat: location?.lat ?? null,
      approval_lng: location?.lng ?? null,
    })
    .eq('id', talkId);

  if (error) throw error;
  return integrityHash;
};

export const rejectTalkDocument = async (talkId: string, reason: string): Promise<void> => {
  const { error } = await supabase
    .from('safety_talks')
    .update({
      manager_approval_status: 'rejected',
      manager_reject_reason: reason,
    })
    .eq('id', talkId);

  if (error) throw error;
};

export const markTalkDocumentSent = async (
  talkId: string,
  sentVia: 'whatsapp' | 'email',
  sentTo: string
): Promise<void> => {
  const { error } = await supabase
    .from('safety_talks')
    .update({
      sent_via: sentVia,
      sent_to: sentTo,
      sent_at: new Date().toISOString(),
      manager_approval_status: 'pending',
    })
    .eq('id', talkId);

  if (error) throw error;
};
