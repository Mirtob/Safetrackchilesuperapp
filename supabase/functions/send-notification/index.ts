/**
 * Edge Function: send-notification
 *
 * Envía las notificaciones de SafeTrack por correo (Resend) y, si hay un
 * proveedor de WhatsApp configurado, también por WhatsApp.
 *
 * Por qué del lado del servidor: la API key de Resend permite enviar correo en
 * nombre del dominio del usuario. En el navegador quedaría a la vista de
 * cualquiera que abra las herramientas de desarrollo, y serviría para suplantar
 * al remitente. Aquí vive como secreto de la plataforma.
 *
 * Contrato:
 *   POST · Authorization: Bearer <access token de Supabase>
 *   body: { channel, to, subject, text, html?, companyId? }
 *   200 → { email: {...}, whatsapp: {...} }  resultado por canal
 *   401 → sesión inválida
 *   422 → faltan destinatarios válidos
 *
 * Secretos (Supabase → Edge Functions → Secrets):
 *   RESEND_API_KEY        obligatorio para el correo
 *   RESEND_FROM           remitente verificado, ej. "SafeTrack <avisos@tudominio.cl>"
 *   WHATSAPP_PROVIDER     opcional: "twilio" o "meta"
 *   TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_WHATSAPP_FROM
 *   META_WABA_TOKEN / META_PHONE_NUMBER_ID
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

interface ChannelResult {
  ok: boolean;
  skipped?: string;
  error?: string;
  id?: string;
  sent?: number;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Deja el número en formato E.164 sin el "+", que es lo que piden las APIs. */
const normalizePhone = (raw: string): string => raw.replace(/[^\d]/g, '');

// ============================================================
// CORREO — Resend
// ============================================================

const sendEmail = async (
  to: string[],
  subject: string,
  text: string,
  html?: string
): Promise<ChannelResult> => {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('RESEND_FROM');

  if (!apiKey) return { ok: false, skipped: 'RESEND_API_KEY no configurada' };
  if (!from) return { ok: false, skipped: 'RESEND_FROM no configurado' };

  const recipients = to.filter(e => EMAIL_RE.test(e.trim()));
  if (recipients.length === 0) return { ok: false, skipped: 'sin correos válidos' };

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject,
        text,
        // Resend exige al menos uno de text o html; se mandan ambos para que el
        // correo se vea bien en clientes que no renderizan HTML.
        ...(html ? { html } : {}),
      }),
    });

    const payload = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error('Resend rechazó el envío:', payload);
      return { ok: false, error: payload?.message || `HTTP ${res.status}` };
    }

    return { ok: true, id: payload?.id, sent: recipients.length };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
};

// ============================================================
// WHATSAPP — Twilio o Meta, según lo configurado
// ============================================================

const sendWhatsAppTwilio = async (to: string, body: string): Promise<ChannelResult> => {
  const sid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const token = Deno.env.get('TWILIO_AUTH_TOKEN');
  const from = Deno.env.get('TWILIO_WHATSAPP_FROM');

  if (!sid || !token || !from) return { ok: false, skipped: 'credenciales de Twilio incompletas' };

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: `whatsapp:+${normalizePhone(from)}`,
        To: `whatsapp:+${normalizePhone(to)}`,
        Body: body,
      }),
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: payload?.message || `HTTP ${res.status}` };

    return { ok: true, id: payload?.sid, sent: 1 };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
};

const sendWhatsAppMeta = async (to: string, body: string): Promise<ChannelResult> => {
  const token = Deno.env.get('META_WABA_TOKEN');
  const phoneId = Deno.env.get('META_PHONE_NUMBER_ID');

  if (!token || !phoneId) return { ok: false, skipped: 'credenciales de Meta incompletas' };

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalizePhone(to),
        type: 'text',
        text: { body },
      }),
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: payload?.error?.message || `HTTP ${res.status}` };

    return { ok: true, id: payload?.messages?.[0]?.id, sent: 1 };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
};

const sendWhatsApp = async (to: string, body: string): Promise<ChannelResult> => {
  const provider = (Deno.env.get('WHATSAPP_PROVIDER') || '').toLowerCase();

  if (!provider) {
    // Sin proveedor no se puede enviar por API. La app lo sabe y ofrece el
    // enlace wa.me para que el usuario lo mande él mismo.
    return { ok: false, skipped: 'sin proveedor de WhatsApp configurado' };
  }
  if (!to) return { ok: false, skipped: 'sin número de destino' };

  if (provider === 'twilio') return sendWhatsAppTwilio(to, body);
  if (provider === 'meta') return sendWhatsAppMeta(to, body);

  return { ok: false, skipped: `proveedor desconocido: ${provider}` };
};

// ============================================================
// HANDLER
// ============================================================

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) return json({ error: 'server_misconfigured' }, 500);

  // Solo un usuario autenticado puede disparar envíos: sin esto la función
  // sería un relay abierto para mandar correo desde el dominio del usuario.
  const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (!jwt) return json({ error: 'missing_authorization' }, 401);

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await admin.auth.getUser(jwt);
  if (userError || !userData?.user) return json({ error: 'invalid_session' }, 401);

  let payload: {
    channel?: 'email' | 'whatsapp' | 'both';
    to?: string[];
    whatsapp?: string;
    subject?: string;
    text?: string;
    html?: string;
  };

  try {
    payload = await req.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }

  const channel = payload.channel || 'both';
  const emails = Array.isArray(payload.to) ? payload.to : [];
  const phone = payload.whatsapp || '';
  const subject = payload.subject || 'Notificación de SafeTrack Chile';
  const text = payload.text || '';

  if (!text.trim()) return json({ error: 'empty_message' }, 422);
  if (emails.length === 0 && !phone) return json({ error: 'no_recipients' }, 422);

  const [email, whatsapp] = await Promise.all([
    channel === 'whatsapp'
      ? Promise.resolve<ChannelResult>({ ok: false, skipped: 'canal no solicitado' })
      : sendEmail(emails, subject, text, payload.html),
    channel === 'email'
      ? Promise.resolve<ChannelResult>({ ok: false, skipped: 'canal no solicitado' })
      : sendWhatsApp(phone, text),
  ]);

  // 200 aunque un canal falle: el llamador decide qué hacer con cada resultado.
  // Un fallo de WhatsApp no debe invalidar un correo que sí salió.
  return json({ email, whatsapp }, 200);
});
