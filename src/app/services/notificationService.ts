/**
 * Envío de notificaciones — SafeTrack Chile
 *
 * Manda avisos por correo (Resend) y, si hay proveedor configurado, por
 * WhatsApp. Todo pasa por la Edge Function `send-notification`, que guarda las
 * credenciales del lado del servidor.
 *
 * Cuando un canal no está disponible, la app no finge que envió: devuelve el
 * detalle para que la UI ofrezca el camino manual (abrir WhatsApp Web con el
 * mensaje escrito).
 */

import { supabase, isSupabaseConfigured } from '@/app/services/supabase';

export interface ChannelResult {
  ok: boolean;
  /** Canal no intentado: falta configuración o destinatarios. */
  skipped?: string;
  error?: string;
  id?: string;
  sent?: number;
}

export interface NotificationResult {
  email: ChannelResult;
  whatsapp: ChannelResult;
  /** true si al menos un canal llegó a destino. */
  anyDelivered: boolean;
}

export interface SendNotificationInput {
  /** Correos de destino. */
  to?: string[];
  /** Número de WhatsApp con código de país. */
  whatsapp?: string;
  subject?: string;
  text: string;
  html?: string;
  channel?: 'email' | 'whatsapp' | 'both';
}

const unavailable = (reason: string): NotificationResult => ({
  email: { ok: false, skipped: reason },
  whatsapp: { ok: false, skipped: reason },
  anyDelivered: false,
});

/**
 * Envía la notificación. Nunca lanza: los fallos vuelven en el resultado para
 * que quien llama decida si molesta al usuario o cae al envío manual.
 */
export const sendNotification = async (
  input: SendNotificationInput
): Promise<NotificationResult> => {
  if (!isSupabaseConfigured) return unavailable('Supabase no está configurado');

  const emails = (input.to || []).filter(Boolean);
  if (emails.length === 0 && !input.whatsapp) return unavailable('sin destinatarios');

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return unavailable('sesión no encontrada');

    const { data, error } = await supabase.functions.invoke('send-notification', {
      method: 'POST',
      body: {
        channel: input.channel || 'both',
        to: emails,
        whatsapp: input.whatsapp || '',
        subject: input.subject || 'Notificación de SafeTrack Chile',
        text: input.text,
        html: input.html,
      },
    });

    if (error) {
      // Lo más habitual: la función todavía no está desplegada.
      return unavailable(`envío no disponible: ${error.message}`);
    }

    const email: ChannelResult = data?.email || { ok: false, skipped: 'sin respuesta' };
    const whatsapp: ChannelResult = data?.whatsapp || { ok: false, skipped: 'sin respuesta' };

    return { email, whatsapp, anyDelivered: Boolean(email.ok || whatsapp.ok) };
  } catch (err) {
    return unavailable((err as Error).message);
  }
};

/** Convierte el texto plano del aviso en un correo legible. */
export const textToHtml = (text: string, title?: string): string => {
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const body = escape(text)
    .split('\n')
    .map(line => (line.trim() ? `<p style="margin:0 0 12px">${line}</p>` : ''))
    .join('');

  return `<!doctype html><html><body style="margin:0;background:#f6f7f9;padding:24px;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#14181f">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #dcdfe6;border-radius:8px;overflow:hidden">
    <div style="background:#0055A4;padding:16px 24px">
      <p style="margin:0;color:#fff;font-weight:600;font-size:15px">SafeTrack Chile</p>
      ${title ? `<p style="margin:2px 0 0;color:#cfe0f5;font-size:13px">${escape(title)}</p>` : ''}
    </div>
    <div style="padding:24px;font-size:15px;line-height:1.55">${body}</div>
    <div style="padding:12px 24px;border-top:1px solid #eceef2;color:#757e8c;font-size:12px">
      Enviado automáticamente por SafeTrack Chile · Sistema de Gestión de Prevención de Riesgos
    </div>
  </div>
</body></html>`;
};

/** Enlace de respaldo para mandar el mensaje a mano por WhatsApp. */
export const whatsappLink = (phone: string, text: string): string => {
  const number = phone.replace(/[^\d]/g, '');
  return number
    ? `https://wa.me/${number}?text=${encodeURIComponent(text)}`
    : `https://wa.me/?text=${encodeURIComponent(text)}`;
};
