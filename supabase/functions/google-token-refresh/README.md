# google-token-refresh — despliegue

Renueva el acceso a Google Drive sin que el usuario tenga que reconectar cada
hora. Sin esta función la app funciona igual, pero pasados ~60 minutos aparece
el aviso "Google Drive desconectado" y hay que pulsar **Reconectar** a mano.

Son cuatro pasos. El último es el que más se olvida.

---

## 1. Obtener el Client Secret de Google

En [Google Cloud Console](https://console.cloud.google.com/apis/credentials),
dentro del proyecto que ya usa SafeTrack:

1. Abre el **OAuth 2.0 Client ID** que corresponde a `VITE_GOOGLE_CLIENT_ID`.
2. Copia el **Client Secret**.

Ese secreto solo se usa del lado del servidor. Nunca va en el `.env` del
frontend ni en una variable `VITE_*`: todo lo que empiece con `VITE_` termina
dentro del JavaScript que descarga el navegador.

## 2. Crear la tabla

En **Supabase → SQL Editor → New query**, pega y ejecuta:

```
supabase/migrations/003_google_oauth_tokens.sql
```

Guarda el refresh token con una regla deliberada: el navegador puede escribir el
suyo, pero **no puede leerlo**. Solo la Edge Function, que usa la `service_role`
key, accede a él.

## 3. Desplegar la función y sus secretos

Con la [CLI de Supabase](https://supabase.com/docs/guides/cli) instalada:

```bash
supabase login
supabase link --project-ref <TU_PROJECT_REF>

# El client secret queda guardado en Supabase, no en el repo
supabase secrets set GOOGLE_CLIENT_ID=<tu-client-id>.apps.googleusercontent.com
supabase secrets set GOOGLE_CLIENT_SECRET=<tu-client-secret>

supabase functions deploy google-token-refresh
```

`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` los inyecta la plataforma sola: no
hay que declararlos.

El `<TU_PROJECT_REF>` está en la URL del dashboard:
`https://supabase.com/dashboard/project/<PROJECT_REF>`.

## 4. Cerrar sesión y volver a entrar

**Esto es imprescindible.** Google entrega el refresh token una única vez, en el
momento de autorizar. Las sesiones que ya estaban abiertas antes del despliegue
no lo tienen guardado, así que seguirán pidiendo reconexión manual.

En la app: **Cerrar Sesión** → **Iniciar sesión con Google** → aceptar los
permisos. A partir de ahí la renovación es automática.

---

## Comprobar que quedó funcionando

En el SQL Editor:

```sql
select has_refresh_token, last_refresh_at, last_error
from google_oauth_status;
```

- `has_refresh_token = true` → el paso 4 se completó bien.
- `last_refresh_at` con fecha → ya hubo al menos una renovación automática.
- `last_error` con texto → Google rechazó algo; el valor indica la causa.

Los logs de cada invocación están en **Supabase → Edge Functions →
google-token-refresh → Logs**.

## Qué pasa si algo falla

La app nunca se rompe por esto; en el peor caso vuelve al comportamiento manual:

| Situación | Qué ve el usuario |
|---|---|
| Función sin desplegar | Aviso de Drive desconectado tras ~1h; reconecta a mano |
| Secretos mal configurados | Igual que arriba; el detalle queda en los logs |
| Usuario revocó el permiso en su cuenta Google | Se descarta el token y se pide reconectar |
| Sin internet | La renovación se reintenta en la siguiente operación |
