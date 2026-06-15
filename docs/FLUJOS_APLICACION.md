# 🔄 Flujos de Usuario - SafeTrack Chile

## 📋 Índice

1. [Flujos de Autenticación](#flujos-de-autenticación)
2. [Flujos de Contexto Empresarial](#flujos-de-contexto-empresarial)
3. [Flujos Operativos](#flujos-operativos)
4. [Flujos Administrativos](#flujos-administrativos)
5. [Flujos de Emergencia](#flujos-de-emergencia)
6. [Flujos de Sincronización](#flujos-de-sincronización)
7. [Diagramas de Estados](#diagramas-de-estados)

---

## 🔐 FLUJOS DE AUTENTICACIÓN

### FLUJO-001: Login Inicial

```
┌─────────────────────────────────────────────────────────────┐
│                        INICIO                               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────┐
          │  Pantalla de Login             │
          │  - Email                       │
          │  - Contraseña                  │
          │  - Recordarme                  │
          └────────────┬───────────────────┘
                       │
                       ▼
          ┌────────────────────────────────┐
          │  Validar Credenciales          │
          │  (Backend)                     │
          └────┬───────────────────┬───────┘
               │                   │
         ✅ Válidas          ❌ Inválidas
               │                   │
               ▼                   ▼
    ┌──────────────────┐  ┌───────────────────┐
    │ Generar JWT      │  │ Mostrar error     │
    │ Guardar token    │  │ "Credenciales     │
    │ Cargar perfil    │  │  incorrectas"     │
    └────────┬─────────┘  └─────────┬─────────┘
             │                      │
             ▼                      │
    ┌──────────────────┐           │
    │ ¿Tiene empresas  │           │
    │ asignadas?       │           │
    └────┬─────────┬───┘           │
         │         │               │
      Sí │         │ No            │
         │         │               │
         ▼         ▼               │
    ┌────────┐ ┌──────────────┐   │
    │ Ir a   │ │ Mostrar msg  │   │
    │ Selector│ │ "Sin empresas│   │
    │ Empresa │ │  asignadas"  │   │
    └────────┘ └──────────────┘   │
         │                         │
         ▼                         │
    ┌─────────────────────────────┤
    │        FIN                  │
    └─────────────────────────────┘
```

**Actores**: Usuario no autenticado  
**Precondición**: App instalada, internet disponible  
**Postcondición**: Usuario autenticado, token guardado  
**Tiempo estimado**: 10-15 segundos

---

### FLUJO-002: Reautenticación por Token

```
┌─────────────────────────────────────────────────────────────┐
│              INICIO (App ya instalada)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────┐
          │  Verificar Token Local         │
          │  (localStorage)                │
          └────────┬───────────────────────┘
                   │
                   ▼
          ┌────────────────────────────────┐
          │  ¿Token existe y no expiró?    │
          └────┬───────────────────┬───────┘
               │                   │
            Sí │                   │ No
               │                   │
               ▼                   ▼
    ┌──────────────────┐  ┌───────────────────┐
    │ Validar con      │  │ Redirigir a       │
    │ Backend          │  │ Login             │
    └────┬─────────────┘  └───────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  ¿Token válido?                │
    └────┬───────────────────┬───────┘
         │                   │
      Sí │                   │ No
         │                   │
         ▼                   ▼
    ┌────────────┐  ┌─────────────────┐
    │ Cargar     │  │ Limpiar token   │
    │ Perfil     │  │ Ir a Login      │
    └────┬───────┘  └─────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  ¿Última empresa recordada?    │
    └────┬───────────────────┬───────┘
         │                   │
      Sí │                   │ No
         │                   │
         ▼                   ▼
    ┌────────────┐  ┌─────────────────┐
    │ Cargar     │  │ Ir a Selector   │
    │ Dashboard  │  │ de Empresa      │
    │ de empresa │  └─────────────────┘
    └────────────┘
         │
         ▼
    ┌─────────────────────────────────┐
    │            FIN                  │
    └─────────────────────────────────┘
```

**Actores**: Usuario previamente autenticado  
**Precondición**: Token guardado en local  
**Postcondición**: Acceso directo al dashboard  
**Tiempo estimado**: 2-5 segundos

---

## 🏢 FLUJOS DE CONTEXTO EMPRESARIAL

### FLUJO-003: Selección de Empresa/Sucursal

```
┌─────────────────────────────────────────────────────────────┐
│                   INICIO (Post-Login)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────┐
          │  Selector de Empresa           │
          │  - Lista de empresas asignadas │
          │  - Búsqueda/filtro             │
          │  - Info: RUT, riesgo, ubicación│
          └────────┬───────────────────────┘
                   │
                   ▼
          ┌────────────────────────────────┐
          │  Usuario selecciona EMPRESA    │
          └────────┬───────────────────────┘
                   │
                   ▼
          ┌────────────────────────────────┐
          │  Cargar datos de empresa       │
          │  - Sucursales                  │
          │  - Trabajadores                │
          │  - Configuraciones             │
          └────────┬───────────────────────┘
                   │
                   ▼
          ┌────────────────────────────────┐
          │  ¿Empresa tiene sucursales?    │
          └────┬───────────────────┬───────┘
               │                   │
            Sí │                   │ No
               │                   │
               ▼                   ▼
    ┌──────────────────┐  ┌───────────────────┐
    │ Mostrar selector │  │ Ir directamente   │
    │ de sucursales    │  │ al Dashboard      │
    │                  │  │ (empresa completa)│
    └────┬─────────────┘  └───────────────────┘
         │                         │
         ▼                         │
    ┌────────────────────────────┐ │
    │ Opciones:                  │ │
    │ 1. Empresa completa (todas)│ │
    │ 2. Sucursal A              │ │
    │ 3. Sucursal B              │ │
    │ ...                        │ │
    └────┬───────────────────────┘ │
         │                         │
         ▼                         │
    ┌────────────────────────────┐ │
    │ Usuario selecciona         │ │
    │ SUCURSAL o "Todas"         │ │
    └────┬───────────────────────┘ │
         │                         │
         ├─────────────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │ Establecer Contexto Global:    │
    │ - selectedCompany              │
    │ - selectedBranch (si aplica)   │
    └────────┬───────────────────────┘
             │
             ▼
    ┌────────────────────────────────┐
    │ Filtrar TODOS los datos        │
    │ por contexto                   │
    └────────┬───────────────────────┘
             │
             ▼
    ┌────────────────────────────────┐
    │ Cargar Dashboard Triádico      │
    │ (Modo Operativo por defecto)   │
    └────────┬───────────────────────┘
             │
             ▼
    ┌────────────────────────────────┐
    │ Mostrar banner de contexto:    │
    │ "🏢 Empresa › 📍 Sucursal"     │
    └────────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────┐
    │            FIN                  │
    └─────────────────────────────────┘
```

**Actores**: Prevencionista autenticado  
**Precondición**: Usuario con empresas asignadas  
**Postcondición**: Contexto establecido, datos filtrados  
**Tiempo estimado**: 5-10 segundos

---

### FLUJO-004: Cambio de Empresa en Sesión Activa

```
┌─────────────────────────────────────────────────────────────┐
│          INICIO (Usuario trabajando en Empresa A)          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────┐
          │  Usuario presiona botón        │
          │  "Cambiar Empresa"             │
          │  (en header o menú)            │
          └────────┬───────────────────────┘
                   │
                   ▼
          ┌────────────────────────────────┐
          │  ¿Hay datos sin sincronizar?   │
          └────┬───────────────────┬───────┘
               │                   │
            Sí │                   │ No
               │                   │
               ▼                   ▼
    ┌──────────────────┐  ┌───────────────────┐
    │ Mostrar modal:   │  │ Limpiar contexto  │
    │ "Tienes N datos  │  │ actual            │
    │  sin sincronizar"│  └─────────┬─────────┘
    │                  │            │
    │ Opciones:        │            │
    │ 1. Sincronizar   │            │
    │ 2. Continuar     │            │
    │ 3. Cancelar      │            │
    └────┬─────────────┘            │
         │                          │
         ▼                          │
    ┌────────────────┐              │
    │ Usuario elige  │              │
    └────┬─────┬─────┘              │
         │     │                    │
    Sinc.│     │Cont.               │
         │     │                    │
         ▼     ▼                    │
    ┌──────┐ ┌──────────┐          │
    │Sincro│ │Agregar a │          │
    │nizar │ │cola y    │          │
    │ahora │ │continuar │          │
    └───┬──┘ └─────┬────┘          │
        │          │                │
        ├──────────┤                │
        │                           │
        ├───────────────────────────┘
        │
        ▼
    ┌────────────────────────────────┐
    │ Mostrar Selector de Empresa    │
    │ (igual que FLUJO-003)          │
    └────────┬───────────────────────┘
             │
             ▼
    ┌────────────────────────────────┐
    │ Seleccionar nueva empresa      │
    └────────┬───────────────────────┘
             │
             ▼
    ┌────────────────────────────────┐
    │ Establecer nuevo contexto      │
    │ Cargar dashboard de Empresa B  │
    └────────┬───────────────────────┘
             │
             ▼
    ┌────────────────────────────────┐
    │ Registrar cambio en auditoría: │
    │ "Usuario cambió de Empresa A   │
    │  a Empresa B a las HH:MM"      │
    └────────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────┐
    │            FIN                  │
    └─────────────────────────────────┘
```

**Actores**: Prevencionista  
**Precondición**: Sesión activa con empresa seleccionada  
**Postcondición**: Nuevo contexto activo, datos previos guardados  
**Tiempo estimado**: 5-15 segundos (según sincronización)

---

## 🔨 FLUJOS OPERATIVOS

### FLUJO-005: Registro de Charla de Seguridad

```
┌─────────────────────────────────────────────────────────────┐
│              INICIO (Dashboard Operativo)                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────┐
          │  Usuario toca "Charla de       │
          │  Seguridad" en dashboard       │
          └────────┬───────────────────────┘
                   │
                   ▼
          ┌────────────────────────────────┐
          │  Validar contexto empresa      │
          └────┬───────────────────┬───────┘
               │                   │
            ✅ OK              ❌ Error
               │                   │
               ▼                   ▼
    ┌──────────────────┐  ┌───────────────────┐
    │ Formulario Charla│  │ Mostrar warning   │
    │ Paso 1: Info Gral│  │ "Seleccione       │
    │ - Tema           │  │  empresa primero" │
    │ - Fecha/Hora     │  └───────────────────┘
    │ - Lugar          │
    │ - Geoloc (auto)  │
    └────┬─────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │ Paso 2: Trabajadores           │
    │ - Lista filtrada por empresa   │
    │ - Checkbox múltiple            │
    │ - Búsqueda rápida              │
    │ - "Seleccionar todos"          │
    └────┬───────────────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │ Validar: ¿Al menos 1 asistente?│
    └────┬───────────────────┬───────┘
         │                   │
      Sí │                   │ No
         │                   │
         ▼                   ▼
    ┌────────────┐  ┌─────────────────┐
    │ Paso 3:    │  │ Error: "Debe    │
    │ Firmas     │  │ seleccionar al  │
    │ Digitales  │  │ menos 1 trab."  │
    └────┬───────┘  └─────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │ Por cada trabajador:           │
    │  ┌──────────────────────────┐  │
    │  │ Mostrar nombre           │  │
    │  │ Canvas de firma          │  │
    │  │ Botones: Limpiar/Guardar │  │
    │  └──────────────────────────┘  │
    │                                │
    │  ▼ Guardar firma               │
    │                                │
    │  Siguiente trabajador...       │
    └────┬───────────────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │ Paso 4: Resumen                │
    │ - Preview de todas las firmas  │
    │ - Datos de la charla           │
    │ - Lista de asistentes          │
    │                                │
    │ Botones:                       │
    │ [Guardar Borrador] [Finalizar] │
    └────┬───────────────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │ Crear registro en DB:          │
    │ {                              │
    │   id, companyId, branchId,     │
    │   date, topic, location,       │
    │   attendees: [                 │
    │     { workerId, signature,     │
    │       timestamp }              │
    │   ],                           │
    │   geolocation,                 │
    │   status: 'completed',         │
    │   metadata: { hash, ip, ... }  │
    │ }                              │
    └────┬───────────────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │ ¿Hay internet?                 │
    └────┬───────────────────┬───────┘
         │                   │
      Sí │                   │ No
         │                   │
         ▼                   ▼
    ┌──────────┐    ┌────────────────┐
    │ Sincro   │    │ Guardar local  │
    │ nizar    │    │ Cola de sinc.  │
    │ inmediato│    │ Notificar:     │
    │          │    │ "Guardado OK"  │
    └────┬─────┘    └────────┬───────┘
         │                   │
         ├───────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │ Actualizar contador dashboard  │
    │ Registrar en log de auditoría  │
    └────────┬───────────────────────┘
             │
             ▼
    ┌────────────────────────────────┐
    │ Mostrar confirmación:          │
    │ "✅ Charla registrada"         │
    │                                │
    │ Opciones:                      │
    │ [Ver PDF] [Nueva Charla] [Salir]│
    └────────────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────┐
    │            FIN                  │
    └─────────────────────────────────┘
```

**Actores**: Prevencionista, Trabajadores  
**Precondición**: Empresa seleccionada, geolocalización activa  
**Postcondición**: Charla registrada con firmas digitales  
**Tiempo estimado**: 5-15 minutos (según N° asistentes)

---

### FLUJO-006: Inspección de Terreno con Checklist

```
┌─────────────────────────────────────────────────────────────┐
│              INICIO (Dashboard Operativo)                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────┐
          │  Usuario toca "Inspección"     │
          └────────┬───────────────────────┘
                   │
                   ▼
          ┌────────────────────────────────┐
          │  Seleccionar tipo de inspección│
          │  - Inspección General          │
          │  - Andamios                    │
          │  - Grúas y Maquinaria          │
          │  - Instalaciones Eléctricas    │
          │  - Almacenamiento              │
          │  - Otra (personalizada)        │
          └────────┬───────────────────────┘
                   │
                   ▼
          ┌────────────────────────────────┐
          │  Cargar checklist              │
          │  correspondiente               │
          └────────┬───────────────────────┘
                   │
                   ▼
          ┌────────────────────────────────┐
          │  Formulario Info Inicial:      │
          │  - Área inspeccionada          │
          │  - Responsable del área        │
          │  - Geolocalización (auto)      │
          │  - Hora inicio                 │
          └────────┬───────────────────────┘
                   │
                   ▼
          ┌────────────────────────────────┐
          │  LOOP: Por cada item checklist │
          └────────┬───────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────┐
    │  Mostrar Item N de M                 │
    │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
    │  Descripción del item                │
    │  "Trabajadores usan casco"           │
    │                                      │
    │  Estado: ⚪ Conforme                 │
    │          ⚪ No Conforme              │
    │          ⚪ No Aplica                │
    │                                      │
    │  [Capturar Foto] (opcional)          │
    │  [Agregar Observación] (opcional)    │
    │                                      │
    │  Barra progreso: ████░░░░ 60%        │
    │  [← Anterior] [Siguiente →]          │
    └────┬─────────────────────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  Si marcó "No Conforme":       │
    └────┬───────────────────┬───────┘
         │                   │
      Sí │                   │ No
         │                   │
         ▼                   │
    ┌──────────────────┐    │
    │ OBLIGATORIO:     │    │
    │ - Foto           │    │
    │ - Descripción    │    │
    │ - Nivel riesgo   │    │
    │ - Acción correct.│    │
    │ - Responsable    │    │
    │ - Plazo          │    │
    └────┬─────────────┘    │
         │                  │
         ├──────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  Guardar item actual           │
    │  Pasar al siguiente            │
    └────┬───────────────────────────┘
         │
         │ [Repetir hasta último item]
         │
         ▼
    ┌────────────────────────────────┐
    │  Resumen de Inspección:        │
    │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
    │  Total items: 25               │
    │  ✅ Conformes: 20              │
    │  ❌ No conformes: 4            │
    │  ⚪ No aplica: 1               │
    │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
    │  Puntaje: 80% 🟡               │
    │  Hallazgos críticos: 1         │
    │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
    │  [Ver Hallazgos] [Finalizar]   │
    └────┬───────────────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  Firma Digital del Inspector   │
    │  (Canvas)                      │
    └────┬───────────────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  Crear registro completo:      │
    │  - Inspección                  │
    │  - Items evaluados             │
    │  - Hallazgos (si hay)          │
    │  - Fotos comprimidas           │
    │  - Metadatos legales           │
    └────┬───────────────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  Si hay hallazgos críticos:    │
    │  Crear tareas automáticas      │
    │  Notificar responsables        │
    └────┬───────────────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  Guardar local / Sincronizar   │
    └────┬───────────────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  Confirmación con opciones:    │
    │  [Exportar PDF]                │
    │  [Enviar WhatsApp]             │
    │  [Nueva Inspección]            │
    │  [Ver Hallazgos]               │
    │  [Volver al Dashboard]         │
    └────────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────────┐
    │            FIN                  │
    └─────────────────────────────────┘
```

**Actores**: Prevencionista  
**Precondición**: Empresa seleccionada, GPS activo  
**Postcondición**: Inspección completa con evidencias  
**Tiempo estimado**: 15-45 minutos (según complejidad)

---

## 🚨 FLUJOS DE EMERGENCIA

### FLUJO-007: Reporte de Accidente Crítico

```
┌─────────────────────────────────────────────────────────────┐
│         INICIO (Desde cualquier vista de la app)           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────┐
          │  Usuario presiona FAB ROJO     │
          │  (Botón flotante de emergencia)│
          └────────┬───────────────────────┘
                   │
                   ▼
          ┌────────────────────────────────┐
          │  Vibración del dispositivo     │
          │  (feedback háptico)            │
          └────────┬───────────────────────┘
                   │
                   ▼
          ┌────────────────────────────────┐
          │  Captura automática:           │
          │  ✅ Geolocalización GPS        │
          │  ✅ Timestamp exacto           │
          │  ✅ Empresa/sucursal actual    │
          │  ✅ Usuario reportando         │
          └────────┬───────────────────────┘
                   │
                   ▼
          ┌────────────────────────────────┐
          │  Formulario Crítico Rápido     │
          │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
          │  ⚠️ ACCIDENTE GRAVE            │
          │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
          │                                │
          │  1️⃣ Accidentado: [_________]  │
          │     (Autocompletado trabajador)│
          │                                │
          │  2️⃣ Tipo lesión:              │
          │     ⚪ Golpe  ⚪ Caída          │
          │     ⚪ Corte  ⚪ Quemadura      │
          │     ⚪ Atrapamiento ⚪ Otro     │
          │                                │
          │  3️⃣ Gravedad:                 │
          │     ⚪ Leve                    │
          │     ⚪ Grave                   │
          │     ⚪ Muy Grave               │
          │     ⚪ Fatal                   │
          │                                │
          │  4️⃣ Foto: [Capturar] ⚠️ OBLIG.│
          │                                │
          │  5️⃣ Descripción breve:        │
          │     [___________] (opcional)   │
          │     🎤 Voz a texto             │
          │                                │
          │  [ GUARDAR EMERGENCIA ]        │
          └────────┬───────────────────────┘
                   │
                   ▼
          ┌────────────────────────────────┐
          │  Validar campos obligatorios   │
          └────┬───────────────────┬───────┘
               │                   │
            ✅ OK              ❌ Falta
               │                   │
               ▼                   ▼
    ┌──────────────────┐  ┌───────────────────┐
    │ Crear registro   │  │ Marcar campos     │
    │ de accidente     │  │ faltantes en rojo │
    └────┬─────────────┘  └───────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  Guardar en BD local           │
    │  (inmediato, no espera internet)│
    └────┬───────────────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  ¿Hay conexión internet?       │
    └────┬───────────────────┬───────┘
         │                   │
      Sí │                   │ No
         │                   │
         ▼                   ▼
    ┌──────────────┐  ┌───────────────┐
    │ Sincronizar  │  │ Marcar para   │
    │ INMEDIATO    │  │ sinc. urgente │
    │ (prioridad 1)│  │ cuando vuelva │
    └────┬─────────┘  └────────┬──────┘
         │                     │
         ├─────────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  PROTOCOLO AUTOMÁTICO:         │
    │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
    │  1. Notificación PUSH a Admin  │
    │  2. Email a Gerencia           │
    │  3. SMS al prevencionista jefe │
    │  4. Crear formulario completo  │
    │  5. Crear checklist acciones:  │
    │     ☐ Notificar mutual (24hrs) │
    │     ☐ Investigar causas        │
    │     ☐ Acciones correctivas     │
    │     ☐ Denuncia autoridad (si   │
    │       es grave/fatal)          │
    │  6. Abrir caso en sistema      │
    │  7. Registro en auditoría      │
    └────┬───────────────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  Si gravedad = Grave o Fatal:  │
    │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
    │  Crear timeline de 24hrs:      │
    │  ⏰ Ahora: Reporte inicial     │
    │  ⏰ +2hrs: Investigación inicial│
    │  ⏰ +4hrs: Acciones inmediatas │
    │  ⏰ +24hrs: Notificación mutual│
    └────┬───────────────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  Pantalla de confirmación:     │
    │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
    │  ✅ Accidente Registrado       │
    │  ID: ACC-2026-0123             │
    │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
    │                                │
    │  ⚠️ Recordatorios creados      │
    │  📧 Notificaciones enviadas    │
    │                                │
    │  [Completar Investigación]     │
    │  [Ver Protocolo]               │
    │  [Volver]                      │
    └────────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────────┐
    │            FIN                  │
    └─────────────────────────────────┘
```

**Actores**: Prevencionista, Sistema automatizado  
**Precondición**: App abierta, geolocalización activa  
**Postcondición**: Accidente registrado, protocolo activado  
**Tiempo estimado**: 60-90 segundos (crítico)

---

## 🔄 FLUJOS DE SINCRONIZACIÓN

### FLUJO-008: Sincronización Inteligente Offline → Online

```
┌─────────────────────────────────────────────────────────────┐
│        INICIO (Trabajando OFFLINE, vuelve internet)        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────┐
          │  Sistema detecta conexión      │
          │  (Event: 'online')             │
          └────────┬───────────────────────┘
                   │
                   ▼
          ┌────────────────────────────────┐
          │  Verificar conectividad real   │
          │  (ping al servidor)            │
          └────┬───────────────────┬───────┘
               │                   │
            ✅ OK              ❌ Error
               │                   │
               ▼                   ▼
    ┌──────────────────┐  ┌───────────────────┐
    │ Consultar cola   │  │ Esperar 30 seg    │
    │ de sincronización│  │ Reintentar        │
    └────┬─────────────┘  └───────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  Obtener items pendientes      │
    │  de localStorage/IndexedDB     │
    └────┬───────────────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  Ordenar por prioridad:        │
    │  1. Accidentes graves (P0)     │
    │  2. Incidentes (P1)            │
    │  3. Inspecciones (P2)          │
    │  4. Charlas (P3)               │
    │  5. Entregas EPP (P3)          │
    │  6. Otros (P4)                 │
    └────┬───────────────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  Mostrar notificación:         │
    │  "🔄 Sincronizando datos..."   │
    │  "5 elementos pendientes"      │
    └────┬───────────────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  LOOP: Por cada item en cola   │
    └────┬───────────────────────────┘
         │
         ▼
    ┌──────────────────────────────────────┐
    │  Procesar Item N:                    │
    │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
    │  Tipo: Charla                        │
    │  Fecha: 2026-01-25                   │
    │  Empresa: Constructora Los Andes     │
    │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
    │  1. Comprimir fotos (si hay)         │
    │  2. Preparar payload JSON            │
    │  3. Enviar POST a API                │
    └────┬─────────────────────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  ¿Request exitoso?             │
    └────┬───────────────────┬───────┘
         │                   │
      ✅ OK              ❌ Error
         │                   │
         ▼                   ▼
    ┌──────────────┐  ┌───────────────┐
    │ Marcar como  │  │ ¿Es error     │
    │ sincronizado │  │  recoverable? │
    │              │  └───┬───────┬───┘
    │ Eliminar de  │      │       │
    │ cola local   │   Sí │       │ No
    │              │      │       │
    │ Actualizar   │      ▼       ▼
    │ contador     │  ┌─────┐ ┌─────┐
    └────┬─────────┘  │Rein │ │Falla│
         │            │tentar│ │ perm│
         │            │+3   │ │anente│
         │            └──┬──┘ └──┬──┘
         │               │       │
         │               ▼       ▼
         │         ┌──────────────┐
         │         │ Log de error │
         │         │ Notificar    │
         │         │ usuario      │
         │         └───────┬──────┘
         │                 │
         ├─────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  Actualizar barra de progreso: │
    │  ████████░░ 80%                │
    │  "4 de 5 elementos"            │
    └────┬───────────────────────────┘
         │
         │ [Repetir para todos los items]
         │
         ▼
    ┌────────────────────────────────┐
    │  Sincronización completada:    │
    │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
    │  ✅ 4 exitosos                 │
    │  ❌ 1 fallido                  │
    │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
    │  [Ver Detalles] [OK]           │
    └────┬───────────────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  Si todo OK:                   │
    │  Limpiar localStorage          │
    │  Actualizar íconos de estado   │
    │  Notificación: "Todo al día ✅"│
    └────┬───────────────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  Registrar en log:             │
    │  "Sincronización completada    │
    │   - Usuario: [nombre]          │
    │   - Items: 4 OK, 1 error       │
    │   - Timestamp: [fecha]"        │
    └────────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────────┐
    │            FIN                  │
    └─────────────────────────────────┘
```

**Actores**: Sistema automatizado  
**Precondición**: Datos en cola local, internet recuperado  
**Postcondición**: Datos sincronizados, cola limpia  
**Tiempo estimado**: Variable (según cantidad de datos)

---

## 📍 FLUJO-009: Geolocalización Automática al Llegar

```
┌─────────────────────────────────────────────────────────────┐
│        INICIO (App abierta, GPS activo en background)       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
          ┌────────────────────────────────┐
          │  Sistema monitorea ubicación   │
          │  cada 30 segundos              │
          └────────┬───────────────────────┘
                   │
                   ▼
          ┌────────────────────────────────┐
          │  Obtener coordenadas actuales  │
          │  Lat: -33.4578, Lon: -70.6005  │
          └────────┬───────────────────────┘
                   │
                   ▼
          ┌────────────────────────────────┐
          │  Comparar con ubicaciones      │
          │  registradas de empresas       │
          └────────┬───────────────────────┘
                   │
                   ▼
          ┌────────────────────────────────┐
          │  Calcular distancia a cada     │
          │  empresa/sucursal              │
          └────┬───────────────────┬───────┘
               │                   │
       < 100m  │                   │ > 100m
               │                   │
               ▼                   ▼
    ┌──────────────────┐  ┌───────────────────┐
    │ ¡Llegada         │  │ Seguir            │
    │  detectada!      │  │ monitoreando      │
    └────┬─────────────┘  └───────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  Identificar empresa:          │
    │  "Constructora Los Andes"      │
    │  Sucursal: "Obra Portal Ñuñoa" │
    └────┬───────────────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  ¿Es distinta a empresa actual?│
    └────┬───────────────────┬───────┘
         │                   │
      Sí │                   │ No
         │                   │
         ▼                   ▼
    ┌──────────────┐  ┌───────────────┐
    │ Mostrar      │  │ Ya estás      │
    │ notificación │  │ trabajando    │
    │              │  │ aquí (skip)   │
    └────┬─────────┘  └───────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  NOTIFICACIÓN PUSH:            │
    │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
    │  📍 ¿Llegaste a...?            │
    │  Constructora Los Andes        │
    │  Obra Portal Ñuñoa             │
    │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
    │  [Sí, activar] [No, ignorar]   │
    └────┬───────────────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  Usuario responde              │
    └────┬───────────────────┬───────┘
         │                   │
      Sí │                   │ No
         │                   │
         ▼                   ▼
    ┌──────────────┐  ┌───────────────┐
    │ Activar      │  │ Descartar     │
    │ empresa      │  │ notificación  │
    └────┬─────────┘  └───────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  Cambiar contexto automático:  │
    │  selectedCompany = Empresa     │
    │  selectedBranch = Sucursal     │
    └────┬───────────────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  Registrar check-in:           │
    │  - Timestamp de llegada        │
    │  - Coordenadas exactas         │
    │  - Usuario                     │
    └────┬───────────────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  Consultar tareas pendientes   │
    │  de esta sucursal:             │
    │  - Inspecciones vencidas       │
    │  - Charlas programadas hoy     │
    │  - Entregas EPP pendientes     │
    │  - Hallazgos críticos abiertos │
    └────┬───────────────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  Cargar Dashboard Operativo    │
    │  con widget de tareas:         │
    │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
    │  📍 Obra Portal Ñuñoa          │
    │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
    │  ⚠️ PENDIENTE HOY:             │
    │  • Inspección andamios (Venc.) │
    │  • Charla seguridad 10:00      │
    │  • Entrega EPP: 3 trabajadores │
    │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
    │  [Ir a tarea] [Ver todas]      │
    └────┬───────────────────────────┘
         │
         ▼
    ┌────────────────────────────────┐
    │  Mostrar banner de contexto    │
    │  persistente en toda la app    │
    └────────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────────┐
    │            FIN                  │
    └─────────────────────────────────┘
```

**Actores**: Sistema GPS, Usuario  
**Precondición**: Geolocalización permitida, app activa  
**Postcondición**: Contexto activado automáticamente  
**Tiempo estimado**: 3-5 segundos (desde detección)

---

## 📊 Diagrama de Estados: Inspección

```
                    ┌──────────┐
                    │  NUEVA   │
                    └────┬─────┘
                         │ Crear
                         ▼
                  ┌─────────────┐
                  │  BORRADOR   │◄──────┐
                  └──────┬──────┘       │
                         │              │
                    Guardar sin finalizar│
                         │              │
                         ▼              │
                  ┌─────────────┐       │
                  │ EN PROGRESO │───────┘
                  └──────┬──────┘
                         │
                    Finalizar
                         │
                         ▼
                  ┌─────────────┐
                  │ COMPLETADA  │
                  └──────┬──────┘
                         │
                    Revisar
                         │
           ┌─────────────┼─────────────┐
           │                           │
           ▼                           ▼
    ┌─────────────┐            ┌─────────────┐
    │  APROBADA   │            │  RECHAZADA  │
    └─────────────┘            └──────┬──────┘
                                      │
                                 Corregir
                                      │
                                      ▼
                               ┌─────────────┐
                               │  REVISIÓN   │
                               └──────┬──────┘
                                      │
                                 Reenviar
                                      │
                                      ▼
                               [Vuelta a COMPLETADA]
```

## 📊 Diagrama de Estados: Hallazgo

```
                    ┌──────────┐
                    │  NUEVO   │
                    └────┬─────┘
                         │ Detectar en inspección
                         ▼
                  ┌─────────────┐
                  │   ABIERTO   │
                  └──────┬──────┘
                         │
                    Asignar responsable
                         │
                         ▼
                  ┌─────────────┐
                  │  ASIGNADO   │
                  └──────┬──────┘
                         │
                    Iniciar corrección
                         │
                         ▼
                  ┌─────────────┐
                  │ EN PROCESO  │◄──────┐
                  └──────┬──────┘       │
                         │              │
                    Solicitar revisión  │
                         │              │
                         │         Rechazar
                         ▼              │
                  ┌─────────────┐       │
                  │  REVISIÓN   │───────┘
                  └──────┬──────┘
                         │
                    Aprobar
                         │
           ┌─────────────┼─────────────┐
           │                           │
           ▼                           ▼
    ┌─────────────┐            ┌─────────────┐
    │   CERRADO   │            │   VENCIDO   │
    │             │            │  (No cerrado│
    │             │            │  a tiempo)  │
    └─────────────┘            └─────────────┘
```

---

## 📈 Métricas de los Flujos

| Flujo | Tiempo Promedio | Pasos | Puntos Decisión | Complejidad |
|-------|----------------|-------|-----------------|-------------|
| FLUJO-001: Login | 10-15 seg | 5 | 2 | Baja |
| FLUJO-002: Reauth | 2-5 seg | 4 | 3 | Baja |
| FLUJO-003: Selección Empresa | 5-10 seg | 7 | 2 | Media |
| FLUJO-004: Cambio Empresa | 5-15 seg | 8 | 3 | Media |
| FLUJO-005: Charla | 5-15 min | 12 | 4 | Alta |
| FLUJO-006: Inspección | 15-45 min | 15 | 5 | Alta |
| FLUJO-007: Accidente | 60-90 seg | 10 | 3 | Crítica |
| FLUJO-008: Sincronización | Variable | 12 | 6 | Alta |
| FLUJO-009: Geolocalización | 3-5 seg | 10 | 4 | Media |

---

**Última actualización**: 27 de Enero, 2026  
**Versión**: 1.0.0  
**Autor**: SafeTrack Chile - Engineering Team
