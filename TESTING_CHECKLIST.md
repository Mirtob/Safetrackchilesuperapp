# ✅ CHECKLIST DE TESTING - SafeTrack Chile

## 🎯 GUÍA RÁPIDA DE TESTING MANUAL

Usa este checklist para verificar rápidamente que todo funciona después de cada cambio.

---

## 🚀 **TESTING BÁSICO (5 minutos)**

### 1. Inicio de la Aplicación
- [ ] La app carga sin errores en consola
- [ ] El tema por defecto es "light"
- [ ] El logo y branding son visibles

### 2. Selección de Empresa
- [ ] CompanySelectorEnhanced muestra las empresas
- [ ] Al seleccionar una empresa, navega al TriadicDashboard
- [ ] Toast de confirmación aparece

### 3. Cambio de Tema
- [ ] Botón de tema visible en esquina superior derecha
- [ ] Al hacer clic, cambia entre claro/oscuro
- [ ] Los colores cambian correctamente
- [ ] Se guarda la preferencia (recargar página)

### 4. Navegación Bottom Bar (Mobile)
- [ ] Bottom bar visible en pantallas pequeñas
- [ ] Botón "Inicio" navega a FieldActionCenter
- [ ] Botón "Dashboard" navega a ComplianceDashboard
- [ ] Botón "Menú" abre el menú lateral

### 5. FAB de Accidente Crítico
- [ ] Botón rojo visible en todas las vistas
- [ ] Tooltip aparece la primera vez
- [ ] Al hacer clic, navega al formulario de accidente
- [ ] Animaciones de pulsación funcionan

---

## 📝 **TESTING DE FORMULARIOS (10 minutos)**

### Inspección (InspectionFormEnhanced)
- [ ] Selector de sector funciona
- [ ] Al seleccionar sector, aparecen activos filtrados
- [ ] Búsqueda de activos funciona
- [ ] Input de voz (simulado) agrega texto
- [ ] Agregar foto funciona
- [ ] Canvas de firma funciona (dibujar con mouse/touch)
- [ ] Botón "Enviar" muestra toast de éxito
- [ ] Navegación "Atrás" funciona

### Charla de 5 Minutos (TalkAndDelivery)
- [ ] Selector de tipo de charla funciona
- [ ] Campo de "Grupo de Trabajadores" con placeholder contextual
- [ ] Campo de hora se auto-completa
- [ ] Selección de trabajadores funciona
- [ ] "Seleccionar todos" funciona
- [ ] Modal de firma para cada trabajador
- [ ] Contador de firmas actualiza
- [ ] Previsualización del documento
- [ ] Envío exitoso

### Incidente (IncidentReportFormEnhanced)
- [ ] Selector de sector funciona
- [ ] Selector de tipo de incidente
- [ ] Campo de severidad cambia color
- [ ] Descripción con input de voz
- [ ] Fotos múltiples
- [ ] Personas afectadas
- [ ] Acciones inmediatas
- [ ] Firma digital
- [ ] Envío exitoso

### Accidente Crítico (AccidentReportFormComplete)
- [ ] Wizard paso a paso
- [ ] Validación en cada paso
- [ ] Botones "Siguiente" y "Anterior"
- [ ] Resumen final
- [ ] Envío con confirmación

---

## 🎨 **TESTING DE DASHBOARDS (10 minutos)**

### TriadicDashboard
- [ ] 3 modos visibles (Operativo/Administrativo/Estratégico)
- [ ] Cambio entre modos funciona
- [ ] Acciones rápidas visibles
- [ ] Badges de urgencia visibles
- [ ] Navegación a cada acción funciona

### ComplianceDashboard
- [ ] Gráficos de cumplimiento se muestran
- [ ] Tarjetas con métricas
- [ ] Alertas visibles
- [ ] Navegación a documentos
- [ ] Exportar reporte (toast)

### ClientPortfolioDashboard (Modo Consultoría)
- [ ] Lista de clientes visible
- [ ] Filtros de riesgo
- [ ] Selección de cliente navega correctamente
- [ ] Badges de estado

### ExecutiveDashboard
- [ ] KPIs visibles
- [ ] Gráficos financieros
- [ ] Mapa de riesgos por sucursal
- [ ] Navegación a vistas detalladas

---

## 🔧 **TESTING DE MÓDULOS (15 minutos)**

### Bóveda Documental (EnhancedDocumentVault)
- [ ] Navegación por años
- [ ] Selección de año → muestra categorías
- [ ] Selección de categoría → muestra documentos
- [ ] Búsqueda por texto funciona
- [ ] Filtro por RUT funciona
- [ ] Filtro por fecha funciona
- [ ] Filtro por tipo funciona
- [ ] Botón "Limpiar filtros"
- [ ] Descarga de documento (mock)

### Gestión de Trabajadores (WorkerCRUD)
- [ ] Lista de trabajadores visible
- [ ] Búsqueda por nombre/RUT
- [ ] Filtro por estado (activo/inactivo)
- [ ] Abrir modal de nuevo trabajador
- [ ] Formulario de trabajador completo
- [ ] Validación de RUT
- [ ] Guardado exitoso
- [ ] Edición de trabajador
- [ ] Eliminación con confirmación
- [ ] Alertas de vencimientos visibles

### Estadísticas (StatisticsModule)
- [ ] Selector de período (mes/trimestre/año)
- [ ] Gráficos de barras
- [ ] Gráfico de líneas (tendencia)
- [ ] Tarjetas con métricas
- [ ] Navegación a Análisis Causal
- [ ] Exportar reporte (toast)

### Análisis Causal (CausalAnalysis)
- [ ] Pestañas de metodologías
- [ ] Gráfico de Ishikawa
- [ ] Método de 5 Porqués
- [ ] Análisis de Barreras
- [ ] Selección de casos
- [ ] Detalles del caso
- [ ] Acciones correctivas

### Plan de Trabajo Mensual (MonthlyWorkPlanComplete)
- [ ] Navegación entre meses
- [ ] Vista de calendario
- [ ] Vista de lista
- [ ] Vista anual
- [ ] Agregar nueva actividad
- [ ] Editar actividad
- [ ] Eliminar actividad
- [ ] Firma del prevencionista
- [ ] Firma del gerente
- [ ] Envío a gerencia (mock)
- [ ] Guardado en bóveda

### Gestión de Hallazgos (ActionPlanTracker)
- [ ] Lista de hallazgos
- [ ] Filtro por estado
- [ ] Filtro por severidad
- [ ] Tarjetas con detalles
- [ ] Evidencia fotográfica antes
- [ ] Evidencia fotográfica después
- [ ] Estado de corrección
- [ ] Asignación de responsable

### Comparación de Evidencias (EvidenceCompare)
- [ ] Vista lado a lado (antes/después)
- [ ] Detalles de corrección
- [ ] Fecha de detección vs corrección
- [ ] Estado de verificación
- [ ] Descarga de reporte (mock)
- [ ] Compartir evidencia (mock)

---

## 📅 **TESTING DE CALENDARIO Y RUTAS (10 minutos)**

### CalendarView
- [ ] Vista mensual
- [ ] Eventos visibles
- [ ] Agregar evento desde calendario
- [ ] Modal de nuevo evento
- [ ] Inspecciones autoalimentadas (checkbox)
- [ ] Navegación a optimización de rutas
- [ ] Integración con Google Calendar (preparado)

### RouteOptimizationScreen
- [ ] Pestañas: Tareas / Mapa / Estadísticas
- [ ] Lista de tareas del día
- [ ] Agregar nueva tarea
- [ ] Editar tarea
- [ ] Marcar como completada
- [ ] Mapa con ubicaciones (requiere API key)
- [ ] Ruta optimizada calculada
- [ ] Estadísticas del día
- [ ] Exportar ruta (toast)
- [ ] Compartir ruta (toast)

---

## 🆔 **TESTING DE QR (5 minutos)**

### QRCodeManager
- [ ] Lista de QR codes generados
- [ ] Selección de empresa
- [ ] Visualización del QR
- [ ] Descarga del QR como PNG
- [ ] Copiar URL al portapapeles
- [ ] Imprimir QR (toast)
- [ ] Activar/Desactivar QR
- [ ] Generar nuevo QR

### QREmergencyAccess
- [ ] Validación de token correcto
- [ ] Mensaje de token inválido
- [ ] Formulario de usuario de emergencia
- [ ] Validaciones de campos
- [ ] Acceso al formulario de accidente
- [ ] Restricciones de permisos

### QRInspection
- [ ] Escanear QR (simulado)
- [ ] Información del activo
- [ ] Estado del activo
- [ ] Última inspección
- [ ] Reportar falla
- [ ] Captura de foto de falla
- [ ] Descripción de falla
- [ ] Envío de reporte

---

## 🔔 **TESTING DE NOTIFICACIONES Y SYNC (5 minutos)**

### IntelligentSyncIndicator
- [ ] Visible cuando hay items pendientes
- [ ] Vista colapsada con contador
- [ ] Vista expandida con detalles
- [ ] Categorización por prioridad (crítico/alto/rutinario)
- [ ] Botón de sincronizar
- [ ] Barra de progreso
- [ ] Toasts de progreso
- [ ] Toast de éxito al completar
- [ ] Items desaparecen al sincronizar
- [ ] Vista crítica (reportes de accidente)
- [ ] Botón de cerrar alerta crítica

### CriticalAccidentFAB
- [ ] Visible en todas las vistas
- [ ] Tooltip inicial (primera vez)
- [ ] Pulsación cada 10 segundos
- [ ] Rings de animación
- [ ] Hover badge explicativo
- [ ] Click navega a AccidentMode
- [ ] Oculto en vista de accidente

---

## 🎨 **TESTING DE TEMAS Y COLORES (5 minutos)**

### ColorSystemDemo
- [ ] Navegación desde menú
- [ ] Tarjetas de colores corporativos
- [ ] Tarjetas de colores triádicos
- [ ] Tarjetas de colores de estado
- [ ] Tarjetas de colores de cumplimiento
- [ ] Variables CSS mostradas
- [ ] Descripción de psicología del color
- [ ] Toggle de mostrar/ocultar psicología
- [ ] Ejemplos de uso
- [ ] Botón de volver funciona

### Sistema de Temas
- [ ] Modo claro: fondo blanco/gris claro
- [ ] Modo oscuro: fondo zinc-900/negro
- [ ] Transiciones suaves entre temas
- [ ] Colores de texto legibles en ambos temas
- [ ] Bordes y sombras ajustadas
- [ ] Gráficos visibles en ambos temas
- [ ] Badges con contraste correcto

---

## 📱 **TESTING RESPONSIVE (10 minutos)**

### Mobile (320-768px)
- [ ] Bottom navigation bar visible
- [ ] Sidebar oculta
- [ ] Botones táctiles grandes (44x44px mínimo)
- [ ] Formularios ocupan ancho completo
- [ ] Modales en pantalla completa
- [ ] Textos legibles sin zoom
- [ ] FAB no obstruye contenido
- [ ] Theme toggle visible y accesible

### Tablet (768-1024px)
- [ ] Layout adaptado
- [ ] Sidebar opcional
- [ ] Grillas de 2 columnas
- [ ] Modales centrados
- [ ] Navegación híbrida

### Desktop (1024px+)
- [ ] Sidebar colapsable
- [ ] Contenido centrado (max-width)
- [ ] Grillas de 3-4 columnas
- [ ] Hover states visibles
- [ ] Tooltips funcionales
- [ ] Atajos de teclado (futuro)

---

## 🔐 **TESTING DE SEGURIDAD (5 minutos)**

### Validaciones de Formularios
- [ ] Campos requeridos no permiten envío vacío
- [ ] Validación de RUT chileno
- [ ] Validación de email
- [ ] Validación de teléfono chileno (+56)
- [ ] Mensajes de error claros
- [ ] Sanitización de inputs

### Firma Digital
- [ ] Canvas no permite firma vacía
- [ ] Timestamp capturado
- [ ] IP capturada (simulada)
- [ ] Geolocalización capturada (simulada)
- [ ] Hash SHA-256 generado
- [ ] Firma convertida a base64

### Offline Storage
- [ ] LocalForage guarda datos
- [ ] Datos persisten al recargar
- [ ] Sincronización al volver online
- [ ] Indicador de estado online/offline

---

## 🧪 **TESTING DE INTEGRACIONES (5 minutos)**

### Google Maps (Mock)
- [ ] LocationPicker muestra placeholder
- [ ] RouteOptimizationMap muestra mensaje de API key
- [ ] No hay errores en consola
- [ ] Botones de mapa deshabilitados hasta config

### WhatsApp (Mock)
- [ ] Botón de compartir por WhatsApp
- [ ] Toast de confirmación
- [ ] URL generada correctamente

### Email (Mock)
- [ ] Botón de enviar por email
- [ ] Toast de confirmación
- [ ] Previsualización de documento

### PDF Generation
- [ ] jsPDF genera PDF
- [ ] Descarga funciona
- [ ] Contenido del PDF correcto
- [ ] Firma incluida en PDF

---

## 🎯 **TESTING DE NAVEGACIÓN COMPLETA (15 minutos)**

### Flujo 1: Usuario Nuevo
```
1. [ ] Cargar app
2. [ ] Seleccionar empresa
3. [ ] Ver TriadicDashboard
4. [ ] Explorar modo Operativo
5. [ ] Explorar modo Administrativo
6. [ ] Explorar modo Estratégico
7. [ ] Cambiar tema claro/oscuro
8. [ ] Abrir menú móvil
9. [ ] Navegar a Estadísticas
10. [ ] Navegar a Sistema de Color
11. [ ] Volver al inicio
```

### Flujo 2: Inspección Completa
```
1. [ ] Desde TriadicDashboard → Inspección
2. [ ] Seleccionar sector
3. [ ] Buscar activo
4. [ ] Seleccionar activo
5. [ ] Agregar descripción (voz)
6. [ ] Capturar 3 fotos
7. [ ] Firmar digitalmente
8. [ ] Enviar formulario
9. [ ] Ver toast de éxito
10. [ ] PDF generado
```

### Flujo 3: Charla de 5 Minutos
```
1. [ ] Desde TriadicDashboard → Charla
2. [ ] Seleccionar tipo de charla
3. [ ] Escribir grupo de trabajadores
4. [ ] Confirmar hora automática
5. [ ] Agregar trabajadores
6. [ ] Firmar cada trabajador
7. [ ] Previsualizar documento
8. [ ] Aprobar y enviar
9. [ ] Guardado en bóveda
```

### Flujo 4: Accidente Crítico
```
1. [ ] Presionar FAB rojo
2. [ ] Acceder a AccidentMode
3. [ ] Llenar wizard paso a paso
4. [ ] Agregar testigos
5. [ ] Describir accidente
6. [ ] Capturar evidencias
7. [ ] Firmar reporte
8. [ ] Enviar notificaciones (mock)
9. [ ] Volver al dashboard
```

### Flujo 5: Consultoría
```
1. [ ] ProfileSelector → Modo consultor
2. [ ] Ver ClientPortfolioDashboard
3. [ ] Seleccionar cliente con bajo cumplimiento
4. [ ] Ver TriadicDashboard con branding del cliente
5. [ ] Ir a ActionPlanTracker
6. [ ] Ver hallazgos pendientes
7. [ ] Ir a EvidenceCompare
8. [ ] Revisar evidencias antes/después
9. [ ] Generar reporte (mock)
```

---

## 🏁 **CHECKLIST DE ENTREGA**

### Antes de Entregar a QA
- [ ] Todos los tests básicos pasan
- [ ] No hay errores en consola
- [ ] No hay warnings críticos
- [ ] Todas las navegaciones funcionan
- [ ] Responsive funciona en 3 breakpoints
- [ ] Temas claro/oscuro funcionan
- [ ] README.md actualizado
- [ ] TESTING_REPORT.md generado
- [ ] Dependencias actualizadas
- [ ] Build de producción exitoso

### Antes de Desplegar a Staging
- [ ] Testing completo (60+ minutos)
- [ ] Google Maps API Key configurada
- [ ] Variables de entorno configuradas
- [ ] Backend conectado (Supabase)
- [ ] Integraciones reales testeadas
- [ ] Performance optimizado
- [ ] SEO básico implementado
- [ ] Analytics configurado
- [ ] Error tracking (Sentry)
- [ ] Backup configurado

### Antes de Producción
- [ ] Testing de usuarios beta (50+ horas)
- [ ] Feedback incorporado
- [ ] Bugs críticos: 0
- [ ] Documentación completa
- [ ] Videos tutoriales
- [ ] Plan de soporte
- [ ] Plan de rollback
- [ ] Monitoreo configurado
- [ ] Certificado SSL
- [ ] Políticas de privacidad

---

## 📊 **MÉTRICAS DE TESTING**

### Tiempo Estimado por Tipo
- ⚡ **Testing Rápido:** 5 minutos (básico)
- 🏃 **Testing Medio:** 30 minutos (funcionalidades principales)
- 🎯 **Testing Completo:** 60+ minutos (todo el checklist)
- 🔬 **Testing Exhaustivo:** 4+ horas (con usuarios reales)

### Cobertura Actual
- **Componentes:** 54/54 (100%)
- **Formularios:** 5/5 (100%)
- **Dashboards:** 4/4 (100%)
- **Módulos:** 10/10 (100%)
- **Integraciones:** 4/6 (67% - pendiente API keys)

---

## 🐛 **REPORTE DE BUGS**

Usa este formato para reportar bugs:

```markdown
### Bug #XX: [Título descriptivo]

**Prioridad:** 🔴 Alta / 🟡 Media / 🟢 Baja

**Componente:** [Nombre del componente]

**Pasos para reproducir:**
1. Paso 1
2. Paso 2
3. Paso 3

**Comportamiento esperado:**
[Qué debería pasar]

**Comportamiento actual:**
[Qué pasa realmente]

**Screenshot/Video:**
[Link o imagen]

**Navegador/Dispositivo:**
[Chrome 90+ / iPhone 12 / etc.]

**Consola:**
```
[Errores de consola si hay]
```

**Solución propuesta:**
[Ideas de cómo arreglarlo]
```

---

## ✅ **TESTING COMPLETADO**

Firma aquí cuando completes el testing:

- [ ] Testing Básico (5 min) - Fecha: _____ - Tester: _____
- [ ] Testing Formularios (10 min) - Fecha: _____ - Tester: _____
- [ ] Testing Dashboards (10 min) - Fecha: _____ - Tester: _____
- [ ] Testing Módulos (15 min) - Fecha: _____ - Tester: _____
- [ ] Testing Responsive (10 min) - Fecha: _____ - Tester: _____
- [ ] Testing Completo (60+ min) - Fecha: _____ - Tester: _____

---

**Total de Items en Checklist:** 250+ verificaciones  
**Tiempo Total Estimado:** 60-90 minutos para testing completo

---

*Última actualización: 27 de Enero de 2026*  
*SafeTrack Chile v2.0*
