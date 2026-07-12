import { supabase } from './supabase';

// RLS en profiles/user_company_roles restringe todo a auth.uid() = propio usuario
// (profiles_own, roles_own). No existe flujo de invitación de otros usuarios, por
// lo que este servicio solo puede reflejar el propio acceso del usuario logueado
// a cada una de sus empresas — no un roster de equipo con otros miembros.

export interface SecurityUser {
  id: string; // id de la fila en user_company_roles
  userId: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
  companyName: string;
  isActive: boolean;
  memberSince: string;
}

export const fetchSecurityUsers = async (): Promise<SecurityUser[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const [{ data: roles, error: rolesError }, { data: profile }] = await Promise.all([
    supabase.from('user_company_roles').select('*, companies(name)').order('created_at'),
    supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle(),
  ]);

  if (rolesError) throw rolesError;

  const name = profile?.full_name || user.email || 'Usuario';

  return (roles || []).map((row: any): SecurityUser => ({
    id: row.id,
    userId: row.user_id,
    name,
    email: user.email || '',
    role: row.role,
    companyId: row.company_id,
    companyName: row.companies?.name || '',
    isActive: row.is_active,
    memberSince: row.created_at,
  }));
};

export const toggleSecurityUserActive = async (roleRowId: string, isActive: boolean): Promise<void> => {
  const { error } = await supabase
    .from('user_company_roles')
    .update({ is_active: isActive })
    .eq('id', roleRowId);
  if (error) throw error;
};

export const sendPasswordReset = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
};

/** Cierra todas las demás sesiones activas de la cuenta (no requiere Admin API). */
export const revokeOtherSessions = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut({ scope: 'others' });
  if (error) throw error;
};
