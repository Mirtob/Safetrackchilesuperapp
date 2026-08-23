# send-notification — despliegue

Envía los avisos de SafeTrack (inicio y fin de faena, documentos) por **correo**
con Resend, y por **WhatsApp** si configuras un proveedor.

## Importante antes de empezar

**Resend envía solo correo.** No manda WhatsApp ni notificaciones push — es un
servicio de correo transaccional. Cada canal necesita lo suyo:

| Canal | Quién lo hace | Costo |
|---|---|---|
| Correo | Resend | Gratis hasta 3.000/mes |
| WhatsApp | Twilio o Meta WhatsApp Business API | Por mensaje |
| Push en el teléfono | Web Push (VAPID), sin proveedor | Gratis |

La función ya soporta correo y WhatsApp. Si solo configuras Resend, el correo
sale y el WhatsApp queda como enlace para enviar a mano — que es como funciona
hoy.

---

## 1. Resend (correo)

1. Crea una cuenta en [resend.com](https://resend.com).
2. **Verifica tu dominio** en Domains → Add Domain, y agrega los registros DNS
   que te indique. Sin dominio verificado solo puedes enviarte correo a ti mismo.
3. Crea una API key en API Keys → Create.

```bash
supabase secrets set RESEND_API_KEY=re_tu_api_key
supabase secrets set RESEND_FROM="SafeTrack Chile <avisos@tudominio.cl>"
```

El remitente debe pertenecer al dominio verificado. Si pones un `@gmail.com`,
Resend rechaza el envío.

## 2. WhatsApp (opcional)

**Con Twilio** — más rápido de activar, tiene sandbox para probar:

```bash
supabase secrets set WHATSAPP_PROVIDER=twilio
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=tu_token
supabase secrets set TWILIO_WHATSAPP_FROM=+14155238886
```

**Con Meta WhatsApp Business API** — más barato a volumen, pero exige verificar
la empresa:

```bash
supabase secrets set WHATSAPP_PROVIDER=meta
supabase secrets set META_WABA_TOKEN=tu_token_permanente
supabase secrets set META_PHONE_NUMBER_ID=1234567890
```

Ten presente que WhatsApp solo permite mensajes libres dentro de las 24 horas
posteriores a que el destinatario te escriba. Fuera de esa ventana hay que usar
plantillas aprobadas por Meta. Para avisos de llegada a faena, que es un mensaje
saliente sin conversación previa, casi siempre necesitarás una plantilla.

## 3. Desplegar

```bash
supabase functions deploy send-notification
```

`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` los inyecta la plataforma.

---

## Comprobar que funciona

Entra a una empresa con el GPS activo, o cierra una faena a mano. Si el correo
salió, verás el aviso «Aviso enviado a [empresa]». Si no, aparece el mensaje
listo para mandar por WhatsApp.

El detalle de cada intento queda en **Supabase → Edge Functions →
send-notification → Logs**, y en el panel de Resend bajo Emails.

## Qué pasa si algo falla

| Situación | Qué ocurre |
|---|---|
| Función sin desplegar | El mensaje se muestra para enviarlo a mano |
| `RESEND_API_KEY` sin configurar | Igual que arriba; el motivo queda en la respuesta |
| Dominio sin verificar | Resend rechaza; el error aparece en los logs |
| Empresa sin correos ni WhatsApp | No se intenta enviar y la app lo advierte |
| WhatsApp falla pero el correo sale | Se cuenta como enviado; un canal basta |
