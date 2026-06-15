# 🗺️ Configuración de Google Maps API para SafeTrack Chile

## 📋 Pasos para obtener tu API Key

### 1. Crear un proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Seleccionar un proyecto" → "NUEVO PROYECTO"
4. Nombra tu proyecto: **"SafeTrack-Chile"**
5. Haz clic en "CREAR"

### 2. Habilitar Google Maps APIs

1. En el menú lateral, ve a **"APIs y servicios" → "Biblioteca"**
2. Busca y habilita las siguientes APIs:
   - ✅ **Maps JavaScript API**
   - ✅ **Geocoding API**
   - ✅ **Geolocation API**
   - ✅ **Places API** (opcional, para búsquedas avanzadas)

### 3. Crear credenciales (API Key)

1. Ve a **"APIs y servicios" → "Credenciales"**
2. Haz clic en **"+ CREAR CREDENCIALES"** → **"Clave de API"**
3. Se creará tu API Key
4. **⚠️ IMPORTANTE:** Haz clic en **"RESTRINGIR CLAVE"**

### 4. Configurar restricciones de seguridad

#### Para Desarrollo:
1. En "Restricciones de aplicación":
   - Selecciona **"Referentes HTTP (sitios web)"**
   - Agrega: `http://localhost:*`
   - Agrega: `http://127.0.0.1:*`

#### Para Producción:
1. En "Restricciones de aplicación":
   - Selecciona **"Referentes HTTP (sitios web)"**
   - Agrega tu dominio: `https://tudominio.com/*`
   - Agrega: `https://*.tudominio.com/*`

2. En "Restricciones de API":
   - Selecciona **"Restringir clave"**
   - Marca:
     - ✅ Maps JavaScript API
     - ✅ Geocoding API
     - ✅ Geolocation API

3. Haz clic en **"GUARDAR"**

### 5. Configurar en SafeTrack

1. Copia tu API Key
2. Abre el archivo `/.env` en la raíz del proyecto
3. Reemplaza `YOUR_API_KEY_HERE` con tu API Key:

```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8
```

4. **⚠️ NUNCA** compartas tu API Key públicamente
5. **⚠️ NUNCA** subas el archivo `.env` a GitHub

### 6. Configurar facturación (Opcional pero recomendado)

Google Maps ofrece **$200 USD/mes gratis** (equivalente a ~28,000 cargas de mapa):

1. Ve a **"Facturación"** en Cloud Console
2. Vincula una tarjeta de crédito (no se cobrará si no excedes el límite gratuito)
3. Configura alertas de presupuesto en $50, $100, $150

## 🔐 Seguridad adicional

### Restringir por dominio (Producción)

En `.env.production`:
```env
VITE_GOOGLE_MAPS_API_KEY=tu-api-key-de-produccion
```

### Rotación de claves

- Rota tu API Key cada 90 días
- Crea múltiples keys para desarrollo y producción
- Revoca keys antiguas después de migrar

## 🧪 Probar la integración

1. Reinicia el servidor de desarrollo:
```bash
npm run dev
```

2. Abre la aplicación en `http://localhost:5173`
3. Deberías ver el mapa cargando en el selector de empresas
4. Verifica que se muestren los markers de las empresas

## 📊 Uso de cuotas gratuitas

Con $200 USD/mes gratis obtienes:

- **Maps JavaScript API**: 28,000 cargas de mapa
- **Geocoding API**: 40,000 solicitudes
- **Geolocation API**: 100,000 solicitudes

Para SafeTrack Chile con ~10 prevencionistas activos, esto es MÁS que suficiente.

## ⚠️ Troubleshooting

### Error: "Google Maps JavaScript API error: RefererNotAllowedMapError"
- **Solución:** Verifica que tu dominio esté en la lista blanca de referentes

### Error: "This API project is not authorized to use this API"
- **Solución:** Habilita la API correspondiente en Cloud Console

### El mapa no carga
1. Verifica que tu API Key esté en `.env`
2. Reinicia el servidor de desarrollo
3. Revisa la consola del navegador para errores
4. Verifica que las APIs estén habilitadas en Cloud Console

### Coordenadas incorrectas
- Verifica que estés usando el formato: `{ latitude: -33.xxxx, longitude: -70.xxxx }`
- Las coordenadas de Chile son negativas (hemisferio sur y oeste)

## 📞 Soporte

Si tienes problemas, contacta al equipo de desarrollo o consulta la [documentación oficial de Google Maps](https://developers.google.com/maps/documentation/javascript).

---

✅ **¡Listo!** Ahora SafeTrack Chile tiene geolocalización automática con Google Maps.
