# 🚀 Roadmap MVP - SafeTrack Chile (5 Meses)

## 👥 Equipo: Squad de Guerrilla (3 personas)

### Composición del Equipo

| Rol | Responsabilidades | % Tiempo |
|-----|-------------------|----------|
| **Fullstack Developer (Tech Lead)** | Backend (Node.js), SQL Server, API REST, Autenticación, Lógica de negocio | 100% |
| **Frontend/Mobile Developer** | React, PWA, IndexedDB (offline), UI/UX implementation, Firma digital | 100% |
| **PO/Designer/QA** | Product definition, Diseño UI, User testing, QA manual, Stakeholder management | 100% |

**Total**: 3 personas full-time x 5 meses = **15 personas-mes**

---

## 🎯 Filosofía del MVP

### Principios Rectores

1. **"Papel Cero en Una Obra"**: El éxito se mide cuando una sola sucursal elimina 100% el papel
2. **Offline Quirúrgico**: Solo módulos de terreno (Charlas, Inspecciones, Accidentes)
3. **Online-Only Estratégico**: Dashboard, Configuración, Reportes, Documentos
4. **Legal Primero**: Cumplimiento Ley 19.799 desde día 1, no como deuda técnica
5. **Monetizable Inmediato**: Billing integrado para prevencionistas independientes

### Anti-Patrones a Evitar

❌ Offline en todo (31 tablas sincronizadas)  
❌ Dashboard complejo sin datos reales  
❌ Módulos "nice to have" antes de los "must have"  
❌ Perfección técnica sobre validación de mercado  
❌ Ignorar el ciclo de cierre legal de hallazgos

---

## 📅 Roadmap Fase por Fase

---

## 🏁 FASE 0.5: Shadow Launch (Mes 1)

**Objetivo**: Primera firma digital legalmente válida en obra

### Alcance Técnico

**Backend (Fullstack Dev)**:
- [x] Setup proyecto Node.js + Express + TypeScript
- [x] SQL Server schema base (8 tablas)
- [x] API de autenticación (JWT + Refresh Token)
- [x] CRUD: users, companies, branches, workers
- [x] API: safety_talks + signatures
- [x] Middleware de filtrado por empresa
- [x] Logging de auditoría básico

**Frontend (Frontend Dev)**:
- [x] Setup React + Vite + Tailwind v4
- [x] Sistema de autenticación
- [x] Selector de empresa/sucursal
- [x] Contexto de filtrado (CompanyContext)
- [x] Módulo: Charlas de Seguridad
  - Formulario de creación
  - Selección de trabajadores
  - Canvas de firma digital (biblioteca: react-signature-canvas)
  - Captura de metadatos (GPS, timestamp, IP)
- [x] IndexedDB: Offline storage para charlas
- [x] Sincronización básica (queue + retry)

**UX/QA (PO/Designer)**:
- [x] Wireframes de flujo crítico (Login → Charla → Firma)
- [x] Diseño mobile-first (1 pantalla = 1 acción)
- [x] Testing manual en terreno real
- [x] Validación legal de metadatos con abogado

### Tablas SQL Server (8 tablas core)

```sql
-- Fase 0.5
users
sessions
companies
branches
user_company_roles
workers
safety_talks
signatures
```

### Entregables

✅ **App funcional en 1 obra piloto**  
✅ **Primera charla con 10 firmas digitales**  
✅ **PDF exportable con validez legal (Ley 19.799)**  
✅ **Offline: Funciona sin internet por 24hrs**  

### Métricas de Éxito

- ⏱️ Tiempo de registro de charla: < 5 minutos (vs 15 min en papel)
- 📱 App funciona offline en zona sin señal
- ⚖️ Firma digital validada por asesor legal
- 💰 Prevencionista piloto paga primera mensualidad

**Duración**: 4 semanas  
**Puntos de Historia**: ~80 puntos

---

## 🔥 FASE 1.0: Core Chilean Compliance (Meses 2-3)

**Objetivo**: Reportabilidad a mutual + eliminación total del papel en 1 sucursal

### Alcance Técnico

**Backend (Fullstack Dev)**:
- [x] CRUD completo: inspections, findings, incidents
- [x] Tabla: work_permits (Permisos de Trabajo de Alto Riesgo)
- [x] Tabla: action_plans (Agrupación de hallazgos)
- [x] Función almacenada: calculate_branch_risk_score()
- [x] API: Exportación a PDF (node-html-pdf)
- [x] API: Webhook para notificaciones (email via SendGrid)
- [x] Campo legal_timestamp en signatures (hash SHA-256)
- [x] Trigger: mark_overdue_findings() (job diario)

**Frontend (Frontend Dev)**:
- [x] Módulo: Inspecciones
  - Checklist dinámico
  - Captura de fotos (compresión)
  - Evaluación item por item
  - Generación de hallazgos automática
- [x] Módulo: Entrega de EPP
  - Catálogo de EPP
  - Firma de recepción
  - Control de vencimientos
- [x] Módulo: Accidentes (Botón crítico FAB rojo)
  - Formulario ultra-rápido (60 segundos)
  - Prioridad 1 en sincronización
  - Notificación push a admin
- [x] Dashboard: Score de Riesgo Dinámico
  - Semáforo por sucursal (verde/amarillo/rojo)
  - Cálculo en tiempo real
- [x] Ciclo de Cierre: Verificación de Eficacia
  - Seguimiento de hallazgos
  - Evidencia de corrección
  - Aprobación de cierre

**UX/QA (PO/Designer)**:
- [x] Rediseño de Dashboard Triádico
- [x] Iconografía industrial-moderna
- [x] Testing con 3 prevencionistas
- [x] Checklist de compliance con DS 594
- [x] Manual de usuario (PDF)

### Tablas SQL Server Adicionales (10 nuevas)

```sql
-- Fase 1.0
inspections
inspection_checklist_items
findings
action_plans              -- ⭐ NUEVA
finding_action_plan       -- Relación N:N
epp_items
epp_deliveries
epp_delivery_items
incidents
work_permits              -- ⭐ NUEVA
```

### Funcionalidades Clave

#### 1. Permisos de Trabajo de Alto Riesgo

**Escenario**: Trabajo en Altura (> 1.8m)

```
Prevencionista crea permiso → Checklist obligatorio (arnés, línea de vida) 
→ Firma supervisor + trabajador → Válido solo por 1 turno
```

#### 2. Ciclo de Cierre Legal

**Flujo completo**:

```
Hallazgo detectado → Acción correctiva asignada → Implementación 
→ Verificación de eficacia (con foto) → Cierre aprobado → Archivo legal
```

**Compliance**: Sin verificación = hallazgo no cerrado legalmente

#### 3. Score de Riesgo Dinámico

**Algoritmo**:

```sql
CREATE FUNCTION calculate_branch_risk_score(@branch_id UNIQUEIDENTIFIER)
RETURNS DECIMAL(5,2)
AS
BEGIN
  DECLARE @score DECIMAL(5,2)
  
  SELECT @score = 
    (COUNT(DISTINCT i.id) * 0.5) +           -- Accidentes últimos 30 días
    (SUM(CASE WHEN ins.compliance_score < 70 THEN 1 ELSE 0 END) * 0.3) + -- Inspecciones fallidas
    (COUNT(DISTINCT st_missing.id) * 0.2)    -- Charlas no realizadas
  FROM branches b
  LEFT JOIN incidents i ON i.branch_id = b.id 
    AND i.incident_date >= DATEADD(day, -30, GETDATE())
  LEFT JOIN inspections ins ON ins.branch_id = b.id
    AND ins.inspection_date >= DATEADD(day, -30, GETDATE())
  -- ... lógica de charlas missing
  WHERE b.id = @branch_id
  
  RETURN @score
END
```

**Resultado**: Dashboard cambia color según score

### Entregables

✅ **Sucursal piloto 100% sin papel**  
✅ **Reporte de accidente a mutual en < 24hrs**  
✅ **Todas las inspecciones con ciclo de cierre**  
✅ **Score de riesgo visible en dashboard**  
✅ **5 prevencionistas usando activamente**

### Métricas de Éxito

- 📊 100% de hallazgos con verificación de eficacia
- ⚡ Tiempo de inspección: -40% vs papel
- 🎯 Score de riesgo predice 70% de incidentes
- 💼 Mutual acepta documentación digital

**Duración**: 8 semanas  
**Puntos de Historia**: ~160 puntos

---

## 💰 FASE 1.5: Consultant Growth (Mes 4)

**Objetivo**: Prevencionista independiente cobra sus honorarios usando la app

### Alcance Técnico

**Backend (Fullstack Dev)**:
- [x] Tabla: consultancy_hours
- [x] Campo: billable_rate en user_company_roles
- [x] API: Timesheet (registro de horas)
- [x] API: Generación de boleta de honorarios
- [x] Integración: SII (Servicio de Impuestos Internos) - simulado
- [x] Cálculo automático: Horas x Tarifa x Retención (10%)
- [x] Tabla: invoices
- [x] Exportación: Excel con detalle de actividades

**Frontend (Frontend Dev)**:
- [x] Módulo: Mi Cartera Profesional
  - Estadísticas de carrera
  - Timeline de experiencia
  - Exportación PDF profesional
- [x] Módulo: Billing & Timesheet
  - Registro manual/automático de horas
  - Dashboard de facturación mensual
  - Generación de boleta (PDF)
  - Envío por email a empresas cliente
- [x] Integración: location_history → consultancy_hours
  - Al hacer check-out, pregunta: "¿Registrar tiempo facturable?"
  - Auto-completa horas basado en GPS

**UX/QA (PO/Designer)**:
- [x] Diseño de flujo de facturación
- [x] Testing con 2 prevencionistas freelance
- [x] Validación con contador (retenciones correctas)
- [x] Benchmarking: Comparar con apps de facturación existentes

### Tablas SQL Server Adicionales (3 nuevas)

```sql
-- Fase 1.5
consultancy_hours         -- ⭐ NUEVA
invoices                  -- ⭐ NUEVA
invoice_line_items        -- ⭐ NUEVA
```

### Funcionalidad Estrella: Auto-Billing

**Escenario**:

```
Prevencionista llega a obra (GPS) → Confirma check-in → Trabaja 4 horas 
→ Al salir, app pregunta: "¿Registrar 4.2 hrs facturables?" 
→ Al fin de mes, genera boleta automática con detalle de actividades
```

**Beneficio**: Prevencionista freelance ahorra 3 horas/mes en facturación

### Nueva Tabla: consultancy_hours

```sql
CREATE TABLE consultancy_hours (
  id                UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  user_id           UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
  company_id        UNIQUEIDENTIFIER NOT NULL REFERENCES companies(id),
  branch_id         UNIQUEIDENTIFIER REFERENCES branches(id),
  
  -- Registro de tiempo
  work_date         DATE NOT NULL,
  start_time        TIME NOT NULL,
  end_time          TIME NOT NULL,
  hours_worked      DECIMAL(4,2) NOT NULL,
  
  -- Facturación
  billable          BIT DEFAULT 1,
  hourly_rate       DECIMAL(10,2) NOT NULL,
  total_amount      DECIMAL(10,2) NOT NULL,
  
  -- Actividad
  activity_type     VARCHAR(50), -- inspection, talk, accident, meeting
  activity_id       UNIQUEIDENTIFIER,
  description       NVARCHAR(MAX),
  
  -- Estado
  invoiced          BIT DEFAULT 0,
  invoice_id        UNIQUEIDENTIFIER REFERENCES invoices(id),
  
  -- Auditoría
  created_at        DATETIME2 DEFAULT GETDATE(),
  updated_at        DATETIME2 DEFAULT GETDATE()
)

CREATE INDEX idx_ch_user_date ON consultancy_hours(user_id, work_date DESC)
CREATE INDEX idx_ch_company ON consultancy_hours(company_id)
CREATE INDEX idx_ch_uninvoiced ON consultancy_hours(user_id, invoiced) WHERE invoiced = 0
```

### Entregables

✅ **Dashboard de facturación funcionando**  
✅ **Primera boleta generada desde la app**  
✅ **10 prevencionistas freelance registrados**  
✅ **Integración GPS → Horas facturables**  
✅ **Exportación Excel compatible con contadores**

### Métricas de Éxito

- 💵 90% de horas trabajadas se registran automáticamente
- ⏱️ Tiempo de facturación: < 5 minutos (vs 2 horas manual)
- 📈 Ingreso promedio rastreado: $1.2M CLP/mes por prevencionista
- 🎯 Tasa de cobranza: +95% (vs 70% sin sistema)

**Duración**: 4 semanas  
**Puntos de Historia**: ~100 puntos

---

## 🤖 FASE 2.0: Predictive Safety (Mes 5)

**Objetivo**: App predice qué sucursal tiene más riesgo de accidente esta semana

### Alcance Técnico

**Backend (Fullstack Dev)**:
- [x] Tabla: risk_predictions
- [x] Función: predict_weekly_risk() - ML básico
- [x] Job semanal: Cálculo predictivo
- [x] API: OCR para documentos (Azure Computer Vision)
  - Extracción de RUT desde cédula
  - Extracción de datos de certificados
- [x] API: Webhooks para integraciones
- [x] Tabla: integrations (para ClaveÚnica futura)

**Frontend (Frontend Dev)**:
- [x] Dashboard: Mapa de Calor de Riesgo
  - Visualización con Recharts
  - Predicción para próximos 7 días
  - Recomendaciones de acción
- [x] Módulo: Smart Document Scanner
  - Captura de foto de cédula
  - Extracción automática de datos
  - Pre-llenado de formulario workers
- [x] Módulo: Gestión Documental avanzada
  - Upload masivo de documentos
  - OCR para búsqueda
  - Alertas de vencimiento (30, 15, 7 días)
- [x] Widget: "¿Dónde ir hoy?"
  - Lista de sucursales ordenadas por riesgo
  - Tiempo de viaje (Google Maps API)

**UX/QA (PO/Designer)**:
- [x] Diseño de dashboard predictivo
- [x] Testing de precisión del modelo
- [x] User research: ¿Confían en predicciones?
- [x] A/B testing: Dashboard clásico vs predictivo

### Algoritmo Predictivo (ML Básico)

**Variables**:

```javascript
const riskFactors = {
  accidentHistory: 0.35,        // Historial de accidentes (peso alto)
  inspectionFailures: 0.25,     // Inspecciones con score < 70%
  overdueFindings: 0.20,        // Hallazgos vencidos
  missingTraining: 0.10,        // Charlas no realizadas
  weatherRisk: 0.05,            // Clima adverso (API externa)
  seasonality: 0.05             // Época del año (verano = más riesgo)
}

function predictWeeklyRisk(branchId, weekNumber) {
  // Regresión lineal simple
  const historicalData = getLastNWeeks(branchId, 12)
  const trend = calculateTrend(historicalData)
  const seasonalFactor = getSeasonalMultiplier(weekNumber)
  
  return (trend * seasonalFactor) + calculateCurrentRiskScore(branchId)
}
```

**Resultado**: 
- 🟢 Riesgo Bajo (0-30): "Todo normal"
- 🟡 Riesgo Medio (31-60): "Reforzar charlas"
- 🟠 Riesgo Alto (61-80): "Inspección urgente"
- 🔴 Riesgo Crítico (81-100): "Visita obligatoria hoy"

### Funcionalidad Estrella: OCR de Cédula

**Flujo**:

```
Nuevo trabajador → Prevencionista saca foto a cédula 
→ Azure Computer Vision extrae: RUT, Nombre, Fecha Nacimiento
→ Pre-llena formulario automáticamente → Prevencionista valida y guarda
```

**Impacto**: 5 minutos ahorrados por trabajador (obras con 50 ingresos/mes = 4 horas/mes)

### Entregables

✅ **Dashboard predictivo con 70% de precisión**  
✅ **OCR funcional para RUT + Nombre**  
✅ **Mapa de calor de riesgo por región**  
✅ **Alertas proactivas de visitas urgentes**  
✅ **Documentación de API para integraciones**

### Métricas de Éxito

- 🎯 Precisión predictiva: 70% de accidentes anticipados
- 📸 OCR accuracy: 95% en cédulas de identidad
- ⚡ Adopción: 80% de usuarios usan dashboard predictivo
- 💡 Reducción de accidentes: -25% en sucursales monitoreadas

**Duración**: 4 semanas  
**Puntos de Historia**: ~120 puntos

---

## 📊 Resumen del MVP (5 Meses)

### Timeline Completo

```
Mes 1 │████████│ FASE 0.5: Shadow Launch
      │         Primera firma digital en obra
      │
Mes 2 │████████│ FASE 1.0: Core Compliance (Parte 1)
      │         Inspecciones + EPP + Accidentes
      │
Mes 3 │████████│ FASE 1.0: Core Compliance (Parte 2)
      │         Ciclo de cierre + Score de riesgo
      │
Mes 4 │████████│ FASE 1.5: Consultant Growth
      │         Billing + Cartera profesional
      │
Mes 5 │████████│ FASE 2.0: Predictive Safety
      │         ML + OCR + Dashboard predictivo
```

### Estadísticas Finales

| Métrica | Cantidad |
|---------|----------|
| **Meses de Desarrollo** | 5 |
| **Personas en Equipo** | 3 |
| **Personas-Mes Totales** | 15 |
| **Fases Completadas** | 4 |
| **Tablas SQL Server** | 24 |
| **Módulos Funcionales** | 12 |
| **Puntos de Historia** | ~460 |
| **Sprints (2 semanas c/u)** | 10 |

### Funcionalidades por Fase

| Fase | Módulos | Tablas Nuevas | Puntos |
|------|---------|---------------|--------|
| 0.5 | Charlas + Firmas | 8 | 80 |
| 1.0 | Inspecciones + EPP + Accidentes | 10 | 160 |
| 1.5 | Billing + Cartera | 3 | 100 |
| 2.0 | Predictive + OCR | 3 | 120 |
| **Total** | **12 módulos** | **24 tablas** | **460** |

---

## 🎯 Módulos Offline vs Online

### ✅ Offline (IndexedDB + Sync Queue)

Módulos que DEBEN funcionar sin internet:

1. **Charlas de Seguridad** ⚡
2. **Inspecciones de Terreno** ⚡
3. **Reporte de Accidentes** ⚡ (Prioridad 1)
4. **Entrega de EPP** ⚡
5. **Permisos de Trabajo** ⚡

**Razón**: Estos ocurren en terreno, zonas sin señal.

### 🌐 Online-Only (Requiere Internet)

Módulos que NO necesitan offline:

1. **Dashboard Estratégico** 📊
2. **Gestión de Documentos** 📄
3. **Configuración** ⚙️
4. **Reportes y Estadísticas** 📈
5. **Billing & Facturación** 💰
6. **Mi Cartera Profesional** 💼
7. **Dashboard Predictivo** 🤖

**Razón**: Se usan en oficina, con conectividad estable. La sincronización bidireccional sería overhead innecesario.

---

## 🏗️ Stack Tecnológico Definitivo

### Backend

```yaml
Runtime: Node.js 20 LTS
Framework: Express.js (REST API)
Language: TypeScript
Database: SQL Server 2022 (Azure SQL Database)
ORM: Prisma 5.x (excelente soporte SQL Server)
Auth: JWT + Refresh Tokens
File Storage: Azure Blob Storage
Email: SendGrid
OCR: Azure Computer Vision API
PDF Generation: Puppeteer
Cron Jobs: node-cron
Logging: Winston + Azure Application Insights
```

### Frontend

```yaml
Framework: React 18
Build Tool: Vite 5
Language: TypeScript
Styling: Tailwind CSS v4
State Management: Zustand + TanStack Query
Routing: React Router v6
Forms: React Hook Form + Zod
Offline: IndexedDB (Dexie.js)
Signature: react-signature-canvas
Charts: Recharts
Icons: Lucide React
Maps: Google Maps API
PWA: Vite PWA Plugin
```

### DevOps

```yaml
Hosting: Azure App Service (Backend) + Azure Static Web Apps (Frontend)
CI/CD: GitHub Actions
Monitoring: Azure Application Insights
Error Tracking: Sentry
Database Backups: Azure SQL Automated Backups (Point-in-time recovery)
Secrets: Azure Key Vault
```

---

## 💰 Modelo de Negocio

### Pricing (Post-MVP)

**Freemium**:
- 1 empresa
- 1 sucursal
- 10 trabajadores
- 20 charlas/mes
- Sin billing

**Professional** ($49.990 CLP/mes):
- 3 empresas
- Sucursales ilimitadas
- 100 trabajadores
- Charlas ilimitadas
- Módulo de billing
- Soporte por email

**Enterprise** ($129.990 CLP/mes):
- Empresas ilimitadas
- Trabajadores ilimitados
- Dashboard predictivo
- OCR ilimitado
- Soporte prioritario
- Integración con sistemas cliente

### TAM (Total Addressable Market) - Chile

- **Prevencionistas registrados**: ~15,000
- **Empresas obligadas a tener prevencionista**: ~80,000
- **Target inicial**: Prevencionistas independientes con 3-10 empresas
- **TAM**: $9 billones CLP/año

---

## 📈 Métricas de Éxito del MVP

### Técnicas

- ✅ App carga en < 3s en 3G
- ✅ Offline funciona 48hrs sin sincronizar
- ✅ 0 pérdidas de datos en pruebas de campo
- ✅ 99% uptime en producción
- ✅ < 5 bugs críticos post-launch

### Negocio

- 🎯 20 prevencionistas activos (pago)
- 🎯 100 charlas registradas/mes
- 🎯 $1M CLP MRR (Monthly Recurring Revenue)
- 🎯 80% retención mensual
- 🎯 NPS > 50

### Impacto

- 📉 -60% tiempo en registro de actividades
- 📉 -40% incidentes por mejor seguimiento
- 📈 +95% cumplimiento legal en obras piloto
- 💡 Mutual acepta documentación digital sin cuestionamientos

---

## 🚨 Riesgos y Mitigación

### Riesgo 1: Adopción Lenta

**Probabilidad**: Media  
**Impacto**: Alto  
**Mitigación**: 
- Ofrecer 2 meses gratis a primeros 50 usuarios
- Capacitación presencial en obra
- Video tutoriales de < 2 minutos por funcionalidad

### Riesgo 2: Problemas de Sincronización Offline

**Probabilidad**: Media  
**Impacto**: Crítico  
**Mitigación**:
- Priorización estricta (Accidentes = P1)
- Cola de reintentos con backoff exponencial
- Notificación visual de items pendientes
- Testing exhaustivo en zona sin señal

### Riesgo 3: Validez Legal Cuestionada

**Probabilidad**: Baja  
**Impacto**: Crítico  
**Mitigación**:
- Asesoría legal desde día 1
- Metadatos robustos (timestamp + hash + geolocalización)
- Auditoría completa de firmas
- Certificación con notario de primeras firmas

### Riesgo 4: Competencia de Players Grandes

**Probabilidad**: Media  
**Impacto**: Alto  
**Mitigación**:
- Enfoque vertical (solo prevención de riesgos)
- Feature única: Billing integrado
- Velocidad: Salir al mercado en 5 meses
- Comunidad: Grupo de WhatsApp de usuarios

---

## 📞 Próximos Pasos Inmediatos

### Semana 1

- [ ] Definir 3 prevencionistas piloto (early adopters)
- [ ] Setup de repositorio GitHub
- [ ] Creación de Azure SQL Database
- [ ] Setup de proyecto (Frontend + Backend)
- [ ] Diseño de primeras 3 pantallas (Figma)

### Semana 2

- [ ] Autenticación funcionando
- [ ] Modelo de datos (8 tablas) implementado
- [ ] API de CRUD básico para companies, workers
- [ ] Primera versión de selector de empresa

### Semana 3-4

- [ ] Módulo de charlas completo
- [ ] Sistema de firmas digitales
- [ ] Offline storage con IndexedDB
- [ ] Primera prueba en terreno real

---

## 🎉 Conclusión

Con un **squad de guerrilla de 3 personas** y **5 meses de desarrollo intensivo**, SafeTrack Chile puede lanzar un MVP que:

1. ✅ **Elimina el papel** en una obra completa
2. ✅ **Cumple la ley** chilena (Ley 19.799, DS 594)
3. ✅ **Genera ingresos** desde día 1 (modelo SaaS)
4. ✅ **Diferencia competitiva** única (billing integrado)
5. ✅ **Escalable** a 1000+ usuarios sin reescribir

**El foco está en validar el mercado rápido**, no en construir un monolito perfecto.

---

**Última actualización**: 27 de Enero, 2026  
**Versión**: 2.0.0 (Ajustado post-feedback)  
**Equipo**: 3 personas  
**Duración**: 5 meses  
**Base de Datos**: SQL Server 2022
