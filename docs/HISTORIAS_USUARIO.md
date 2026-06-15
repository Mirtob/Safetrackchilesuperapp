# 📖 Historias de Usuario - SafeTrack Chile

## 📋 Índice

1. [Roles del Sistema](#roles-del-sistema)
2. [Épicas](#épicas)
3. [Historias de Usuario por Módulo](#historias-de-usuario-por-módulo)
4. [Criterios de Aceptación](#criterios-de-aceptación)
5. [Priorización](#priorización)

---

## 👥 Roles del Sistema

### ROL-001: Prevencionista de Riesgos
**Descripción**: Ingeniero en prevención de riesgos que gestiona múltiples empresas
**Permisos**: Crear, leer, actualizar datos de empresas asignadas
**Escenarios**: Trabajo en terreno, oficina, y planificación estratégica

### ROL-002: Administrador de Empresa
**Descripción**: Responsable de seguridad de una empresa específica
**Permisos**: Solo acceso a su empresa, visualización de reportes
**Escenarios**: Revisión de cumplimiento, aprobación de documentos

### ROL-003: Gerente/Supervisor
**Descripción**: Toma decisiones estratégicas basadas en datos
**Permisos**: Lectura de dashboards y reportes, no edición operativa
**Escenarios**: Análisis de KPIs, toma de decisiones

### ROL-004: Trabajador de Campo
**Descripción**: Personal operativo que recibe capacitaciones y EPP
**Permisos**: Firma de documentos, visualización de capacitaciones propias
**Escenarios**: Firma de charlas, recepción de EPP, consulta de certificados

### ROL-005: Super Administrador
**Descripción**: Administrador técnico del sistema
**Permisos**: Acceso total, configuración de sistema
**Escenarios**: Mantenimiento, configuración, soporte técnico

---

## 🎯 Épicas

### EPIC-001: Gestión de Contexto Empresarial
**Objetivo**: Permitir selección y filtrado completo por empresa/sucursal
**Valor de negocio**: Aislamiento de datos, cumplimiento legal
**Módulos afectados**: Todos

### EPIC-002: Dashboard Triádico
**Objetivo**: Tres modos de trabajo según estado mental del prevencionista
**Valor de negocio**: Reducción de estrés, eficiencia operativa
**Módulos afectados**: Dashboard principal, navegación

### EPIC-003: Gestión de Formularios Inteligentes
**Objetivo**: Captura de datos con firma digital y validez legal
**Valor de negocio**: Cumplimiento Ley 19.799, trazabilidad
**Módulos afectados**: Charlas, EPP, Inspecciones, Incidentes

### EPIC-004: Sistema de Geolocalización Inteligente
**Objetivo**: Activación automática al llegar a ubicación
**Valor de negocio**: Eficiencia, contexto automático
**Módulos afectados**: Dashboard, Inspecciones, Charlas

### EPIC-005: Botón Crítico de Accidente
**Objetivo**: Reporte inmediato de accidentes graves
**Valor de negocio**: Respuesta rápida, cumplimiento normativo
**Módulos afectados**: FAB global, Formulario de accidentes

### EPIC-006: Sistema Offline-First
**Objetivo**: Funcionamiento sin internet con sincronización inteligente
**Valor de negocio**: Trabajo en zonas remotas
**Módulos afectados**: Todos los módulos operativos

### EPIC-007: Gestión de Cumplimiento
**Objetivo**: Tracking de obligaciones legales y normativas
**Valor de negocio**: Evitar multas, auditorías exitosas
**Módulos afectados**: Dashboard cumplimiento, Documentos, Capacitaciones

### EPIC-008: Mi Cartera Profesional
**Objetivo**: Portafolio digital del prevencionista
**Valor de negocio**: Marketing personal, validación profesional
**Módulos afectados**: Cartera, Exportación PDF/Excel

---

## 📝 Historias de Usuario por Módulo

---

## 🏢 MÓDULO: Selección de Empresa/Sucursal

### HU-001: Seleccionar Empresa Inicial
**Como** prevencionista de riesgos  
**Quiero** ver un listado de todas las empresas que gestiono al abrir la app  
**Para** seleccionar con cuál voy a trabajar y ver solo sus datos

**Criterios de Aceptación**:
- [ ] Al abrir la app sin empresa seleccionada, muestra selector
- [ ] Lista todas las empresas asignadas al prevencionista
- [ ] Muestra: Nombre, RUT, dirección, nivel de riesgo
- [ ] Indica cantidad de sucursales por empresa
- [ ] Permite búsqueda/filtrado por nombre o RUT
- [ ] Al seleccionar, filtra todos los módulos automáticamente

**Prioridad**: P0 (Crítica)  
**Estimación**: 5 puntos  
**Épica**: EPIC-001

---

### HU-002: Seleccionar Sucursal de Empresa
**Como** prevencionista de riesgos  
**Quiero** poder seleccionar una sucursal específica dentro de una empresa  
**Para** trabajar solo con datos de esa ubicación

**Criterios de Aceptación**:
- [ ] Después de seleccionar empresa, ofrece lista de sucursales
- [ ] Opción "Empresa completa" para ver todas las sucursales
- [ ] Cada sucursal muestra: Nombre, dirección, N° trabajadores
- [ ] Al seleccionar sucursal, filtra datos específicos + datos generales empresa
- [ ] Indicador visual permanente del contexto actual
- [ ] Permite cambiar de sucursal sin volver al inicio

**Prioridad**: P0 (Crítica)  
**Estimación**: 5 puntos  
**Épica**: EPIC-001

---

### HU-003: Cambiar de Empresa sin Perder Datos
**Como** prevencionista de riesgos  
**Quiero** cambiar de empresa activa sin perder datos sin sincronizar  
**Para** trabajar en múltiples empresas en un mismo día

**Criterios de Aceptación**:
- [ ] Botón "Cambiar Empresa" accesible desde cualquier vista
- [ ] Si hay datos pendientes de sincronización, muestra advertencia
- [ ] Permite sincronizar antes de cambiar o guardar en cola
- [ ] Al cambiar, limpia contexto visual inmediatamente
- [ ] Carga dashboard de la nueva empresa
- [ ] Registro de cambios de contexto en log de auditoría

**Prioridad**: P1 (Alta)  
**Estimación**: 8 puntos  
**Épica**: EPIC-001

---

### HU-004: Advertencia de Contexto Mixto
**Como** prevencionista de riesgos  
**Quiero** ser advertido si estoy a punto de mezclar información de empresas  
**Para** evitar errores de asignación de datos

**Criterios de Aceptación**:
- [ ] Si detecta intento de crear dato sin empresa seleccionada, bloquea
- [ ] Muestra mensaje claro: "Seleccione empresa primero"
- [ ] Si intenta acceder a módulo sin empresa, muestra <NoCompanyWarning>
- [ ] Todos los formularios validan empresa antes de guardar
- [ ] Auditoría registra intentos de acceso sin contexto

**Prioridad**: P0 (Crítica)  
**Estimación**: 3 puntos  
**Épica**: EPIC-001

---

## 📊 MÓDULO: Dashboard Triádico

### HU-005: Vista Modo Operativo (Terreno)
**Como** prevencionista en terreno  
**Quiero** ver acciones rápidas optimizadas para trabajo de campo  
**Para** registrar charlas, inspecciones y entregas sin perder tiempo

**Criterios de Aceptación**:
- [ ] Muestra 6-8 acciones principales con iconos grandes
- [ ] Prioriza: Charlas, EPP, Inspecciones, Incidentes
- [ ] Muestra contadores de tareas pendientes con urgencia
- [ ] Acceso con máximo 2 toques desde dashboard
- [ ] Optimizado para uso con guantes
- [ ] Indica estado de GPS y conectividad

**Prioridad**: P0 (Crítica)  
**Estimación**: 8 puntos  
**Épica**: EPIC-002

---

### HU-006: Vista Modo Administrativo (Oficina)
**Como** prevencionista en oficina  
**Quiero** ver tareas administrativas y de seguimiento  
**Para** completar documentación y revisar cumplimiento

**Criterios de Aceptación**:
- [ ] Muestra documentos pendientes de firma/revisión
- [ ] Lista capacitaciones por programar
- [ ] Reportes pendientes de completar
- [ ] Estadísticas de cumplimiento
- [ ] Acceso a gestión de trabajadores
- [ ] Sincronización de datos offline

**Prioridad**: P1 (Alta)  
**Estimación**: 8 puntos  
**Épica**: EPIC-002

---

### HU-007: Vista Modo Estratégico (Planificación)
**Como** prevencionista o gerente  
**Quiero** ver KPIs, tendencias y análisis estratégico  
**Para** tomar decisiones informadas sobre prevención

**Criterios de Aceptación**:
- [ ] Dashboard con gráficos de tendencias
- [ ] Comparativa entre empresas/sucursales
- [ ] Indicadores de cumplimiento legal
- [ ] Análisis de costo-beneficio de inversiones en seguridad
- [ ] Proyección de riesgos
- [ ] Exportación de reportes ejecutivos

**Prioridad**: P2 (Media)  
**Estimación**: 13 puntos  
**Épica**: EPIC-002

---

### HU-008: Cambio Fluido entre Modos
**Como** prevencionista  
**Quiero** cambiar entre modos de dashboard con un solo toque  
**Para** adaptar la interfaz a mi estado mental y contexto actual

**Criterios de Aceptación**:
- [ ] Selector de modo visible y accesible
- [ ] Transición animada entre modos (< 300ms)
- [ ] Estado del modo se persiste en sesión
- [ ] Indicador visual del modo activo
- [ ] Cada modo optimizado para su propósito
- [ ] No se pierden datos al cambiar de modo

**Prioridad**: P1 (Alta)  
**Estimación**: 5 puntos  
**Épica**: EPIC-002

---

## 📋 MÓDULO: Charlas de Seguridad

### HU-009: Crear Charla de Seguridad
**Como** prevencionista en terreno  
**Quiero** registrar una charla de seguridad con firma masiva de asistentes  
**Para** cumplir con la obligación legal de capacitación continua

**Criterios de Aceptación**:
- [ ] Formulario con: Fecha, hora, tema, lugar
- [ ] Selección de empresa/sucursal (automática si hay contexto)
- [ ] Listado de trabajadores para marcar asistencia
- [ ] Captura de firma digital de cada asistente
- [ ] Opción de firma masiva en dispositivo compartido
- [ ] Captura de foto del grupo (opcional)
- [ ] Registro de geolocalización automática
- [ ] Timestamp de creación y modificación
- [ ] Estado: Borrador, En curso, Finalizada
- [ ] Validación: Mínimo 1 asistente para finalizar

**Prioridad**: P0 (Crítica)  
**Estimación**: 13 puntos  
**Épica**: EPIC-003

---

### HU-010: Firma Digital Masiva
**Como** prevencionista  
**Quiero** que múltiples trabajadores firmen en mi dispositivo  
**Para** no depender de que cada uno tenga smartphone

**Criterios de Aceptación**:
- [ ] Vista de firma optimizada para firmar y pasar
- [ ] Captura nombre del firmante antes de firma
- [ ] Canvas de firma responsive y sensible
- [ ] Botón "Limpiar" para reintentar
- [ ] Botón "Siguiente" que guarda y limpia para nuevo firmante
- [ ] Vista previa de todas las firmas capturadas
- [ ] Posibilidad de eliminar firma individual si hay error
- [ ] Timestamp individual por firma
- [ ] Metadatos: IP, User Agent, Geolocalización

**Prioridad**: P0 (Crítica)  
**Estimación**: 8 puntos  
**Épica**: EPIC-003

---

### HU-011: Historial de Charlas
**Como** prevencionista  
**Quiero** ver el historial de todas las charlas de la empresa actual  
**Para** hacer seguimiento y generar reportes

**Criterios de Aceptación**:
- [ ] Lista filtrada por empresa/sucursal actual
- [ ] Ordenado por fecha (más reciente primero)
- [ ] Muestra: Fecha, tema, N° asistentes, estado
- [ ] Filtros: Por rango de fechas, por tema, por sucursal
- [ ] Búsqueda por palabras clave
- [ ] Indicador de charlas con documentación pendiente
- [ ] Exportación a PDF/Excel del listado
- [ ] Acceso rápido a detalle de cada charla

**Prioridad**: P1 (Alta)  
**Estimación**: 5 puntos  
**Épica**: EPIC-003

---

### HU-012: Exportar Charla con Validez Legal
**Como** prevencionista  
**Quiero** exportar una charla en PDF con firma digital y metadatos  
**Para** presentarla en auditorías o fiscalizaciones

**Criterios de Aceptación**:
- [ ] Genera PDF con logo de empresa
- [ ] Incluye todos los datos de la charla
- [ ] Lista de asistentes con firmas digitales
- [ ] Metadatos de verificación (timestamp, geolocalización, hash)
- [ ] Firma digital del prevencionista
- [ ] Código QR para verificación online
- [ ] Cumple con Ley 19.799 de firma electrónica
- [ ] Marca de agua con fecha y hora de generación
- [ ] No permite edición posterior del PDF

**Prioridad**: P1 (Alta)  
**Estimación**: 8 puntos  
**Épica**: EPIC-003

---

## 🛡️ MÓDULO: Entrega de EPP

### HU-013: Registrar Entrega de EPP
**Como** prevencionista  
**Quiero** registrar la entrega de equipos de protección personal  
**Para** tener trazabilidad de qué trabajador recibió qué equipo y cuándo

**Criterios de Aceptación**:
- [ ] Formulario: Trabajador, fecha, hora, lugar
- [ ] Listado de EPP disponibles: Casco, guantes, arnés, etc.
- [ ] Cantidad entregada por cada tipo de EPP
- [ ] Selección múltiple de EPP en una sola entrega
- [ ] Captura de firma digital del trabajador (obligatoria)
- [ ] Foto del EPP entregado (opcional)
- [ ] Fecha de vencimiento/caducidad del EPP (si aplica)
- [ ] Observaciones adicionales
- [ ] Validación: Al menos 1 EPP seleccionado
- [ ] Stock automático si hay integración con inventario

**Prioridad**: P0 (Crítica)  
**Estimación**: 13 puntos  
**Épica**: EPIC-003

---

### HU-014: Historial de EPP por Trabajador
**Como** prevencionista o supervisor  
**Quiero** ver todo el historial de EPP entregado a un trabajador específico  
**Para** verificar cumplimiento y planificar reposiciones

**Criterios de Aceptación**:
- [ ] Búsqueda de trabajador por nombre o RUT
- [ ] Lista cronológica de entregas (más reciente primero)
- [ ] Por cada entrega: Fecha, EPP, cantidad, estado
- [ ] Indicador de EPP próximos a vencer
- [ ] Indicador de EPP que deben reponerse
- [ ] Exportación de historial a PDF
- [ ] Firma digital visible en cada entrega
- [ ] Filtro por tipo de EPP

**Prioridad**: P1 (Alta)  
**Estimación**: 8 puntos  
**Épica**: EPIC-003

---

### HU-015: Control de Stock de EPP
**Como** administrador de empresa  
**Quiero** ver el stock actual de EPP por sucursal  
**Para** planificar compras y evitar desabastecimiento

**Criterios de Aceptación**:
- [ ] Dashboard de inventario por sucursal
- [ ] Stock actual vs stock mínimo por cada EPP
- [ ] Alertas de stock bajo (< 20%)
- [ ] Alertas de stock crítico (< 5%)
- [ ] Proyección de consumo basada en histórico
- [ ] Sugerencia de compra automática
- [ ] Registro de ingresos de stock
- [ ] Exportación de reporte de inventario

**Prioridad**: P2 (Media)  
**Estimación**: 13 puntos  
**Épica**: EPIC-007

---

## 🔍 MÓDULO: Inspecciones de Terreno

### HU-016: Crear Inspección de Seguridad
**Como** prevencionista en terreno  
**Quiero** registrar una inspección con checklist y hallazgos  
**Para** identificar condiciones inseguras y tomar acciones correctivas

**Criterios de Aceptación**:
- [ ] Formulario: Fecha, hora, tipo de inspección, área inspeccionada
- [ ] Geolocalización automática (obligatoria)
- [ ] Checklist predefinido según tipo de inspección
- [ ] Items marcables: Conforme, No conforme, No aplica
- [ ] Captura de fotos por cada hallazgo
- [ ] Descripción detallada de hallazgos
- [ ] Nivel de riesgo: Bajo, Medio, Alto, Crítico
- [ ] Acciones correctivas sugeridas
- [ ] Responsable y plazo de corrección
- [ ] Firma digital del inspector
- [ ] Modo offline funcional

**Prioridad**: P0 (Crítica)  
**Estimación**: 21 puntos  
**Épica**: EPIC-003

---

### HU-017: Seguimiento de Hallazgos
**Como** prevencionista  
**Quiero** hacer seguimiento de los hallazgos detectados  
**Para** asegurar que se corrijan las condiciones inseguras

**Criterios de Aceptación**:
- [ ] Dashboard de hallazgos por estado: Abierto, En proceso, Cerrado
- [ ] Filtro por nivel de riesgo
- [ ] Filtro por fecha de vencimiento
- [ ] Alertas de hallazgos vencidos
- [ ] Asignación de responsable
- [ ] Notificación al responsable (email/WhatsApp)
- [ ] Registro de acciones tomadas
- [ ] Foto de evidencia de corrección
- [ ] Aprobación de cierre por prevencionista
- [ ] Métrica: % de cumplimiento de plazos

**Prioridad**: P1 (Alta)  
**Estimación**: 13 puntos  
**Épica**: EPIC-007

---

### HU-018: Inspección con Checklist Digital
**Como** prevencionista  
**Quiero** usar checklists digitales predefinidos  
**Para** estandarizar inspecciones y no olvidar puntos críticos

**Criterios de Aceptación**:
- [ ] Biblioteca de checklists por industria/tipo
- [ ] Checklist de MINSAL para obras en construcción
- [ ] Checklist de inspección de andamios
- [ ] Checklist de inspección de grúas
- [ ] Checklist personalizable por empresa
- [ ] Modo navegación item por item
- [ ] Barra de progreso de inspección
- [ ] Foto obligatoria en items marcados como "No conforme"
- [ ] Puntaje final de inspección (%)
- [ ] Guardado automático cada 30 segundos

**Prioridad**: P1 (Alta)  
**Estimación**: 13 puntos  
**Épica**: EPIC-003

---

## 🚨 MÓDULO: Botón Crítico de Accidente

### HU-019: Activar Botón de Emergencia
**Como** prevencionista en terreno  
**Quiero** activar un botón de emergencia flotante visible desde cualquier vista  
**Para** reportar un accidente grave inmediatamente

**Criterios de Aceptación**:
- [ ] FAB (Floating Action Button) rojo omnipresente
- [ ] Siempre visible, no se oculta con scroll
- [ ] Tamaño mínimo 64x64px (uso con guantes)
- [ ] Icono de alerta médica o sirena
- [ ] Al presionar, abre formulario de accidente crítico
- [ ] Captura automática: GPS, timestamp, empresa activa
- [ ] No requiere confirmar empresa (usa contexto actual)
- [ ] Animación de pulsación para indicar criticidad
- [ ] Accessible desde cualquier módulo

**Prioridad**: P0 (Crítica)  
**Estimación**: 5 puntos  
**Épica**: EPIC-005

---

### HU-020: Formulario Rápido de Accidente Crítico
**Como** prevencionista  
**Quiero** un formulario ultra-simplificado para accidentes graves  
**Para** reportar lo esencial en menos de 60 segundos

**Criterios de Aceptación**:
- [ ] Máximo 5 campos obligatorios
- [ ] Nombre del accidentado (autocompletado de trabajadores)
- [ ] Tipo de lesión (selección rápida)
- [ ] Gravedad: Leve, Grave, Fatal
- [ ] Captura de 1 foto (obligatoria)
- [ ] Descripción breve (voz a texto opcional)
- [ ] Guardado inmediato en local
- [ ] Intento de sincronización inmediata si hay internet
- [ ] Notificación al admin de empresa
- [ ] Opción "Completar después" para detalles

**Prioridad**: P0 (Crítica)  
**Estimación**: 8 puntos  
**Épica**: EPIC-005

---

### HU-021: Protocolo Post-Accidente
**Como** sistema SafeTrack  
**Quiero** activar un protocolo automático tras reporte de accidente grave  
**Para** asegurar seguimiento correcto y cumplimiento legal

**Criterios de Aceptación**:
- [ ] Envía notificación push al admin de empresa
- [ ] Envía email a gerencia si está configurado
- [ ] Genera formulario completo de investigación
- [ ] Crea checklist de acciones obligatorias:
  - [ ] Notificación a mutual (dentro de 24hrs)
  - [ ] Investigación de causas
  - [ ] Acciones correctivas
  - [ ] Denuncia a autoridad si aplica (accidente grave/fatal)
- [ ] Bloquea cierre hasta completar mínimos legales
- [ ] Genera timeline de eventos
- [ ] Registra todas las acciones en auditoría

**Prioridad**: P0 (Crítica)  
**Estimación**: 21 puntos  
**Épica**: EPIC-005

---

## 📍 MÓDULO: Geolocalización Inteligente

### HU-022: Detección Automática de Llegada
**Como** prevencionista  
**Quiero** que el sistema detecte cuando llego a una empresa/sucursal  
**Para** que me pregunte si voy a trabajar ahí y active el contexto automáticamente

**Criterios de Aceptación**:
- [ ] GPS activo en background con permiso del usuario
- [ ] Detecta entrada en radio de 100m de empresa/sucursal registrada
- [ ] Muestra notificación: "¿Llegaste a [Nombre Empresa]?"
- [ ] Botones: "Sí, activar" / "No, ignorar"
- [ ] Si confirma, activa empresa/sucursal automáticamente
- [ ] Carga dashboard en modo operativo
- [ ] Muestra tareas pendientes de esa ubicación
- [ ] Registra check-in con timestamp
- [ ] Opción de desactivar geolocalización automática en settings

**Prioridad**: P1 (Alta)  
**Estimación**: 13 puntos  
**Épica**: EPIC-004

---

### HU-023: Dashboard Contextual por Ubicación
**Como** prevencionista  
**Quiero** ver tareas pendientes específicas de la ubicación donde estoy  
**Para** priorizar trabajo según dónde me encuentro

**Criterios de Aceptación**:
- [ ] Al confirmar llegada, muestra widget de tareas pendientes
- [ ] Lista prioritaria: Inspecciones vencidas, charlas programadas, entregas pendientes
- [ ] Filtrado automático por sucursal actual
- [ ] Acceso rápido a cada tarea (1 toque)
- [ ] Indicador de tiempo estimado por tarea
- [ ] Opción "Marcar todo como visto"
- [ ] Persiste estado de tareas vistas
- [ ] Actualización en tiempo real si hay cambios

**Prioridad**: P1 (Alta)  
**Estimación**: 8 puntos  
**Épica**: EPIC-004

---

### HU-024: Historial de Visitas por Ubicación
**Como** gerente o prevencionista  
**Quiero** ver un historial de visitas a cada empresa/sucursal  
**Para** analizar frecuencia y planificar mejor las visitas

**Criterios de Aceptación**:
- [ ] Timeline de visitas por empresa/sucursal
- [ ] Cada visita muestra: Fecha, hora entrada, hora salida, duración
- [ ] Resumen de actividades realizadas en la visita
- [ ] Estadística: Visitas por mes, tiempo promedio
- [ ] Comparativa entre sucursales
- [ ] Exportación a Excel para facturación
- [ ] Filtro por rango de fechas
- [ ] Mapa de calor de ubicaciones más visitadas

**Prioridad**: P2 (Media)  
**Estimación**: 8 puntos  
**Épica**: EPIC-004

---

## 📄 MÓDULO: Gestión Documental

### HU-025: Subir Documento Legal
**Como** prevencionista o admin  
**Quiero** subir documentos legales de la empresa (RIOHS, PPRR, etc.)  
**Para** tenerlos disponibles digitalmente y controlar vencimientos

**Criterios de Aceptación**:
- [ ] Upload de PDF, Word, Excel, imágenes
- [ ] Tamaño máximo: 10MB por archivo
- [ ] Clasificación: RIOHS, Reglamento Interno, Certificados, Contratos, Otros
- [ ] Fecha de emisión y vencimiento (si aplica)
- [ ] Empresa/sucursal asociada (filtrado automático)
- [ ] Tags para búsqueda
- [ ] Versiones del documento (histórico)
- [ ] Control de quién subió y cuándo
- [ ] Opción de marcar como "confidencial"
- [ ] Previsualización inline de PDFs

**Prioridad**: P1 (Alta)  
**Estimación**: 13 puntos  
**Épica**: EPIC-007

---

### HU-026: Alertas de Documentos por Vencer
**Como** prevencionista  
**Quiero** recibir alertas de documentos próximos a vencer  
**Para** renovarlos a tiempo y evitar multas

**Criterios de Aceptación**:
- [ ] Alerta 30 días antes del vencimiento
- [ ] Alerta 15 días antes del vencimiento
- [ ] Alerta 7 días antes del vencimiento
- [ ] Alerta el día del vencimiento
- [ ] Notificación push y/o email
- [ ] Dashboard de documentos críticos
- [ ] Filtro por empresa/sucursal
- [ ] Indicador visual en listado de documentos
- [ ] Acción rápida: "Subir nueva versión"
- [ ] Histórico de alertas enviadas

**Prioridad**: P1 (Alta)  
**Estimación**: 8 puntos  
**Épica**: EPIC-007

---

### HU-027: Bóveda de Documentos
**Como** cualquier usuario autorizado  
**Quiero** buscar y visualizar documentos de la empresa  
**Para** consultar información cuando la necesite

**Criterios de Aceptación**:
- [ ] Vista de explorador de archivos
- [ ] Organización por categorías
- [ ] Búsqueda por nombre, tags, fecha
- [ ] Filtros avanzados: Tipo, estado, fecha
- [ ] Vista de lista y vista de cuadrícula
- [ ] Previsualización rápida (hover)
- [ ] Descarga individual o múltiple (ZIP)
- [ ] Compartir por email o WhatsApp
- [ ] Log de accesos al documento
- [ ] Marca de agua al visualizar/descargar

**Prioridad**: P1 (Alta)  
**Estimación**: 13 puntos  
**Épica**: EPIC-007

---

## 👷 MÓDULO: Gestión de Trabajadores

### HU-028: Registrar Nuevo Trabajador
**Como** prevencionista o admin  
**Quiero** dar de alta a un nuevo trabajador en la empresa  
**Para** poder asignarle capacitaciones, EPP e incluirlo en inspecciones

**Criterios de Aceptación**:
- [ ] Formulario: RUT, nombre, apellidos, cargo, fecha ingreso
- [ ] Empresa y sucursal asignada (obligatorio)
- [ ] Datos de contacto: teléfono, email
- [ ] Foto del trabajador (opcional)
- [ ] Tipo de contrato: Planta, Contratista, Temporal
- [ ] Fecha de término de contrato (si aplica)
- [ ] Estado: Activo, Inactivo, Retirado
- [ ] Validación: RUT único por empresa
- [ ] Asignación automática a grupo de trabajo (si existe)
- [ ] Generación automática de checklist de inducción

**Prioridad**: P0 (Crítica)  
**Estimación**: 8 puntos  
**Épica**: EPIC-007

---

### HU-029: Ficha Completa de Trabajador
**Como** prevencionista  
**Quiero** ver toda la información de un trabajador en un solo lugar  
**Para** tener visión completa de su historial de seguridad

**Criterios de Aceptación**:
- [ ] Datos personales y de contacto
- [ ] Historial de capacitaciones recibidas
- [ ] Historial de EPP entregados
- [ ] Certificaciones vigentes
- [ ] Inspecciones en las que participó
- [ ] Incidentes/accidentes en los que estuvo involucrado
- [ ] Charlas de seguridad asistidas
- [ ] Estado de cumplimiento (%)
- [ ] Alertas: Capacitaciones vencidas, EPP por reponer
- [ ] Exportación de ficha completa en PDF

**Prioridad**: P1 (Alta)  
**Estimación**: 13 puntos  
**Épica**: EPIC-007

---

### HU-030: Control de Certificaciones
**Como** prevencionista  
**Quiero** controlar las certificaciones vigentes de los trabajadores  
**Para** asegurar que solo personal calificado realice trabajos críticos

**Criterios de Aceptación**:
- [ ] Registro de certificaciones: Operador de grúa, trabajos en altura, etc.
- [ ] Fecha de emisión y vencimiento
- [ ] Organismo certificador
- [ ] Upload de documento de certificación
- [ ] Alertas de certificaciones por vencer
- [ ] Dashboard de certificaciones críticas
- [ ] Reporte de trabajadores sin certificación requerida
- [ ] Bloqueo de asignación si falta certificación crítica
- [ ] Integración con planificación de trabajos

**Prioridad**: P1 (Alta)  
**Estimación**: 13 puntos  
**Épica**: EPIC-007

---

## 📊 MÓDULO: Dashboard de Cumplimiento

### HU-031: Vista General de Cumplimiento
**Como** gerente o prevencionista  
**Quiero** ver un dashboard con indicadores clave de cumplimiento  
**Para** conocer el estado general de seguridad de la empresa

**Criterios de Aceptación**:
- [ ] KPI: % de inspecciones realizadas vs programadas
- [ ] KPI: % de capacitaciones al día
- [ ] KPI: % de trabajadores con EPP vigente
- [ ] KPI: Días sin accidentes
- [ ] KPI: % de hallazgos cerrados a tiempo
- [ ] KPI: Documentos legales vigentes/totales
- [ ] Gráficos de tendencias mensuales
- [ ] Comparativa entre sucursales
- [ ] Semáforo de cumplimiento (verde/amarillo/rojo)
- [ ] Filtro por rango de fechas

**Prioridad**: P1 (Alta)  
**Estimación**: 13 puntos  
**Épica**: EPIC-007

---

### HU-032: Reporte de Auditoría
**Como** prevencionista  
**Quiero** generar un reporte completo de cumplimiento  
**Para** presentarlo en auditorías o fiscalizaciones

**Criterios de Aceptación**:
- [ ] Selección de período (mes, trimestre, año)
- [ ] Incluye todos los indicadores de cumplimiento
- [ ] Resumen ejecutivo con conclusiones
- [ ] Detalle de inspecciones realizadas
- [ ] Detalle de capacitaciones realizadas
- [ ] Listado de incidentes/accidentes
- [ ] Acciones correctivas implementadas
- [ ] Documentación legal vigente
- [ ] Exportación a PDF profesional con logo
- [ ] Firma digital del prevencionista

**Prioridad**: P1 (Alta)  
**Estimación**: 13 puntos  
**Épica**: EPIC-007

---

## 🎓 MÓDULO: Capacitaciones

### HU-033: Programar Capacitación
**Como** prevencionista  
**Quiero** programar una capacitación obligatoria para trabajadores  
**Para** cumplir con el plan anual de capacitación

**Criterios de Aceptación**:
- [ ] Formulario: Tema, fecha, hora inicio, hora fin
- [ ] Lugar (presencial) o plataforma (online)
- [ ] Instructor/relator
- [ ] Empresa/sucursal (obligatorio)
- [ ] Selección de trabajadores participantes
- [ ] Capacidad máxima (si aplica)
- [ ] Material de apoyo (upload de archivos)
- [ ] Certificado a emitir (Sí/No)
- [ ] Validez del certificado (meses)
- [ ] Notificación automática a participantes
- [ ] Recordatorio 24hrs antes

**Prioridad**: P1 (Alta)  
**Estimación**: 13 puntos  
**Épica**: EPIC-007

---

### HU-034: Registro de Asistencia
**Como** prevencionista  
**Quiero** registrar la asistencia de participantes a una capacitación  
**Para** emitir certificados y controlar cumplimiento

**Criterios de Aceptación**:
- [ ] Lista de participantes programados
- [ ] Checkbox de asistencia por participante
- [ ] Opción de agregar participantes no programados
- [ ] Captura de firma de cada asistente
- [ ] Registro de hora de entrada y salida
- [ ] Evaluación post-capacitación (nota)
- [ ] Comentarios u observaciones
- [ ] Foto grupal (opcional)
- [ ] Generación automática de certificados
- [ ] Actualización de ficha de trabajador

**Prioridad**: P1 (Alta)  
**Estimación**: 8 puntos  
**Épica**: EPIC-003

---

### HU-035: Emisión de Certificados
**Como** sistema SafeTrack  
**Quiero** generar certificados automáticos de capacitación  
**Para** entregarlos a trabajadores y tener trazabilidad

**Criterios de Aceptación**:
- [ ] Genera PDF con template profesional
- [ ] Incluye: Nombre trabajador, RUT, tema, fecha, horas
- [ ] Logo de empresa y del prevencionista
- [ ] Firma digital del relator
- [ ] Código QR de verificación
- [ ] Fecha de vencimiento (si aplica)
- [ ] Metadatos de verificación (hash, timestamp)
- [ ] Envío automático por email
- [ ] Almacenamiento en ficha del trabajador
- [ ] Registro en blockchain (opcional)

**Prioridad**: P2 (Media)  
**Estimación**: 13 puntos  
**Épica**: EPIC-003

---

## 💼 MÓDULO: Mi Cartera Profesional

### HU-036: Visualizar Mi Cartera
**Como** prevencionista  
**Quiero** ver un resumen de mi trayectoria profesional  
**Para** usarlo como portafolio en búsqueda laboral

**Criterios de Aceptación**:
- [ ] Perfil profesional: Nombre, título, registro SEREMI
- [ ] Estadísticas de carrera:
  - [ ] Empresas gestionadas
  - [ ] Trabajadores capacitados
  - [ ] Inspecciones realizadas
  - [ ] Incidentes atendidos
  - [ ] Horas de capacitación impartidas
- [ ] Timeline de experiencia laboral
- [ ] Certificaciones y especializaciones
- [ ] Logros destacados
- [ ] Vista previa en formato presentable
- [ ] Actualización automática con nueva actividad

**Prioridad**: P2 (Media)  
**Estimación**: 13 puntos  
**Épica**: EPIC-008

---

### HU-037: Exportar Cartera Profesional
**Como** prevencionista  
**Quiero** exportar mi cartera en PDF o Excel  
**Para** adjuntarla en postulaciones laborales

**Criterios de Aceptación**:
- [ ] Botón "Exportar" con opciones: PDF, Excel
- [ ] PDF profesional con diseño atractivo
- [ ] Incluye gráficos y estadísticas visuales
- [ ] Firma digital del prevencionista
- [ ] Código QR de verificación
- [ ] Metadatos de validez legal
- [ ] Excel con datos estructurados
- [ ] Opción de seleccionar qué incluir
- [ ] Marca de agua: "Generado por SafeTrack Chile"
- [ ] Cumplimiento Ley 19.799

**Prioridad**: P2 (Media)  
**Estimación**: 8 puntos  
**Épica**: EPIC-008

---

### HU-038: Enviar Cartera por Email
**Como** prevencionista  
**Quiero** enviar mi cartera directamente por email  
**Para** responder rápidamente a ofertas laborales

**Criterios de Aceptación**:
- [ ] Modal con formulario de envío
- [ ] Validación de emails (múltiples destinatarios)
- [ ] Asunto personalizable
- [ ] Mensaje personalizable
- [ ] Adjunta PDF de cartera automáticamente
- [ ] Opción de enviar Excel adicional
- [ ] Previsualización del email
- [ ] Confirmación de envío exitoso
- [ ] Registro de envíos en historial
- [ ] Límite: 5 envíos por día (anti-spam)

**Prioridad**: P2 (Media)  
**Estimación**: 5 puntos  
**Épica**: EPIC-008

---

## 📴 MÓDULO: Modo Offline

### HU-039: Trabajar sin Internet
**Como** prevencionista en zona remota  
**Quiero** poder usar la app completamente sin internet  
**Para** no interrumpir mi trabajo en terreno

**Criterios de Aceptación**:
- [ ] Todos los formularios funcionan offline
- [ ] Datos se guardan en localStorage/IndexedDB
- [ ] Indicador visual de estado offline
- [ ] Contador de items pendientes de sincronización
- [ ] Fotos se comprimen y guardan localmente
- [ ] Timestamps se registran aunque esté offline
- [ ] Geolocalización funciona offline (GPS nativo)
- [ ] Advertencia si intenta acciones que requieren internet
- [ ] Modo offline activable manualmente

**Prioridad**: P0 (Crítica)  
**Estimación**: 21 puntos  
**Épica**: EPIC-006

---

### HU-040: Sincronización Inteligente
**Como** sistema SafeTrack  
**Quiero** sincronizar datos automáticamente cuando vuelva internet  
**Para** mantener información actualizada sin intervención del usuario

**Criterios de Aceptación**:
- [ ] Detecta recuperación de conexión automáticamente
- [ ] Prioriza sincronización por criticidad:
  1. Accidentes graves (inmediato)
  2. Incidentes (alta prioridad)
  3. Inspecciones (media prioridad)
  4. Charlas y entregas (baja prioridad)
- [ ] Muestra progreso de sincronización
- [ ] Reintentos automáticos si falla
- [ ] Resolución de conflictos (último en escribir gana)
- [ ] Notificación de sincronización completada
- [ ] Log de errores de sincronización
- [ ] Opción de sincronizar manualmente

**Prioridad**: P0 (Crítica)  
**Estimación**: 21 puntos  
**Épica**: EPIC-006

---

### HU-041: Gestión de Datos Locales
**Como** prevencionista  
**Quiero** ver y gestionar los datos guardados localmente  
**Para** controlar uso de almacenamiento y forzar sincronización

**Criterios de Aceptación**:
- [ ] Dashboard de datos locales
- [ ] Cantidad de items por tipo (charlas, inspecciones, etc.)
- [ ] Espacio ocupado en dispositivo
- [ ] Estado de sincronización por item
- [ ] Opción de eliminar datos ya sincronizados
- [ ] Opción de forzar sincronización de item específico
- [ ] Advertencia si almacenamiento está lleno (>90%)
- [ ] Exportación de datos locales (backup)
- [ ] Importación de backup

**Prioridad**: P2 (Media)  
**Estimación**: 8 puntos  
**Épica**: EPIC-006

---

## ⚙️ MÓDULO: Configuración

### HU-042: Configurar Perfil de Usuario
**Como** usuario  
**Quiero** configurar mi perfil personal  
**Para** personalizar mi experiencia en la app

**Criterios de Aceptación**:
- [ ] Edición de datos: Nombre, email, teléfono
- [ ] Foto de perfil
- [ ] Registro profesional (N° SEREMI)
- [ ] Especialidades/certificaciones
- [ ] Preferencias de notificaciones
- [ ] Preferencias de idioma (preparación i18n)
- [ ] Tema: Claro, Oscuro, Auto
- [ ] Firma digital personalizada
- [ ] Cambio de contraseña
- [ ] Autenticación de 2 factores (opcional)

**Prioridad**: P2 (Media)  
**Estimación**: 8 puntos  
**Épica**: N/A

---

### HU-043: Gestionar Empresas Asignadas
**Como** super admin  
**Quiero** asignar/desasignar empresas a prevencionistas  
**Para** controlar quién tiene acceso a qué información

**Criterios de Aceptación**:
- [ ] Lista de todos los prevencionistas
- [ ] Por cada uno, lista de empresas asignadas
- [ ] Botón "Asignar empresa" con selector
- [ ] Botón "Remover empresa" con confirmación
- [ ] Log de cambios de asignaciones
- [ ] Notificación al prevencionista de nuevas asignaciones
- [ ] Validación: No eliminar si hay datos pendientes
- [ ] Filtro y búsqueda de prevencionistas
- [ ] Exportación de matriz prevencionista-empresa

**Prioridad**: P1 (Alta)  
**Estimación**: 8 puntos  
**Épica**: N/A

---

## 📱 MÓDULO: Integraciones

### HU-044: Enviar Reporte por WhatsApp
**Como** prevencionista  
**Quiero** compartir reportes directamente por WhatsApp  
**Para** comunicarme rápidamente con supervisores

**Criterios de Aceptación**:
- [ ] Botón "Compartir por WhatsApp" en reportes
- [ ] Genera resumen en texto plano
- [ ] Incluye link a documento PDF completo
- [ ] Abre WhatsApp con mensaje pre-cargado
- [ ] Funciona en web (WhatsApp Web) y móvil
- [ ] Log de compartidos
- [ ] Opción de compartir a grupo de WhatsApp
- [ ] Validación de número de teléfono

**Prioridad**: P2 (Media)  
**Estimación**: 5 puntos  
**Épica**: N/A

---

### HU-045: Navegación con Google Maps
**Como** prevencionista  
**Quiero** abrir ubicación de empresa en Google Maps  
**Para** navegar hasta la obra/sucursal

**Criterios de Aceptación**:
- [ ] Botón "Cómo llegar" en ficha de empresa/sucursal
- [ ] Abre Google Maps con coordenadas precisas
- [ ] Muestra dirección y nombre de empresa
- [ ] Funciona en web (Google Maps web) y móvil (app)
- [ ] Fallback a Apple Maps en iOS si no hay Google Maps
- [ ] Estimación de tiempo de llegada
- [ ] Opción de compartir ubicación

**Prioridad**: P2 (Media)  
**Estimación**: 3 puntos  
**Épica**: N/A

---

## 📊 Priorización y Roadmap

### Sprint 1 (P0 - Críticas) - 4 semanas
- HU-001: Seleccionar Empresa
- HU-002: Seleccionar Sucursal
- HU-004: Advertencia Contexto
- HU-005: Dashboard Operativo
- HU-009: Crear Charla
- HU-010: Firma Digital Masiva
- HU-013: Entrega EPP
- HU-016: Inspección de Terreno
- HU-019: Botón Emergencia
- HU-020: Formulario Accidente Crítico
- HU-028: Registrar Trabajador
- HU-039: Modo Offline
- HU-040: Sincronización

**Total: ~130 puntos**

### Sprint 2 (P1 - Altas) - 4 semanas
- HU-003: Cambiar Empresa
- HU-006: Dashboard Administrativo
- HU-008: Cambio entre Modos
- HU-011: Historial Charlas
- HU-012: Exportar Charla Legal
- HU-014: Historial EPP
- HU-017: Seguimiento Hallazgos
- HU-018: Checklist Digital
- HU-022: Geolocalización Auto
- HU-023: Dashboard Contextual
- HU-025: Subir Documento
- HU-026: Alertas Vencimiento
- HU-029: Ficha Trabajador
- HU-031: Dashboard Cumplimiento
- HU-033: Programar Capacitación

**Total: ~155 puntos**

### Sprint 3 (P2 - Medias) - 3 semanas
- HU-007: Dashboard Estratégico
- HU-015: Control Stock EPP
- HU-021: Protocolo Post-Accidente
- HU-024: Historial Visitas
- HU-027: Bóveda Documentos
- HU-032: Reporte Auditoría
- HU-035: Certificados Auto
- HU-036: Cartera Profesional
- HU-037: Exportar Cartera
- HU-041: Gestión Datos Locales

**Total: ~115 puntos**

---

**Total Historias**: 45 HU  
**Tiempo Estimado**: ~11 semanas (2.75 meses)  
**Puntos Totales**: ~400 puntos

---

**Última actualización**: 27 de Enero, 2026  
**Versión**: 1.0.0  
**Autor**: SafeTrack Chile - Product Team
