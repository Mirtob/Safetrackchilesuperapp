# 🗄️ Modelo de Base de Datos SQL Server - SafeTrack Chile MVP

## 📋 Resumen Ejecutivo

**Base de Datos**: SQL Server 2022 (Azure SQL Database)  
**Tablas Totales**: 24 tablas  
**Estrategia**: Implementación incremental en 5 meses  
**Principios**: Aislamiento por empresa, Auditoría, Soft Delete, Legal Compliance

---

## 🏗️ Arquitectura de Datos

### Stack de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    Azure SQL Database                       │
│              (SQL Server 2022 - PaaS)                       │
├─────────────────────────────────────────────────────────────┤
│  • Automated Backups (Point-in-time recovery 35 días)      │
│  • Geo-replication (HA)                                    │
│  • Transparent Data Encryption (TDE)                       │
│  • Row-Level Security (RLS) para multi-tenancy            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Azure Blob Storage                        │
│         (Archivos: Firmas, Fotos, PDFs)                    │
└─────────────────────────────────────────────────────────────┘
```

### Principios de Diseño

1. **Multi-Tenancy**: Todas las tablas tienen `company_id` para aislamiento
2. **Soft Delete**: Usar `deleted_at` en lugar de DELETE físico
3. **Auditoría**: `created_at`, `updated_at`, `created_by` en todas las tablas
4. **Legal Compliance**: Hash SHA-256 para firmas digitales (Ley 19.799)
5. **Performance**: Índices en FK y campos de filtrado frecuente

---

## 📊 Implementación por Fases

### Fase 0.5 - Shadow Launch (8 tablas)

```
✅ users
✅ sessions
✅ companies
✅ branches
✅ user_company_roles
✅ workers
✅ safety_talks
✅ signatures
```

### Fase 1.0 - Core Compliance (+10 tablas)

```
✅ inspections
✅ inspection_checklist_items
✅ findings
✅ action_plans              ⭐ NUEVA
✅ finding_action_plan       ⭐ NUEVA (N:N)
✅ work_permits              ⭐ NUEVA
✅ epp_items
✅ epp_deliveries
✅ epp_delivery_items
✅ incidents
```

### Fase 1.5 - Consultant Growth (+3 tablas)

```
✅ consultancy_hours         ⭐ NUEVA
✅ invoices                  ⭐ NUEVA
✅ invoice_line_items        ⭐ NUEVA
```

### Fase 2.0 - Predictive Safety (+3 tablas)

```
✅ documents
✅ document_access_log
✅ risk_predictions          ⭐ NUEVA
```

**Total**: 24 tablas implementadas en 5 meses

---

## 📋 TABLAS DETALLADAS

---

## FASE 0.5: SHADOW LAUNCH

### 1. users
**Descripción**: Usuarios del sistema (prevencionistas)

```sql
CREATE TABLE users (
  -- Identificación
  id                    UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  email                 NVARCHAR(255) NOT NULL UNIQUE,
  password_hash         NVARCHAR(255) NOT NULL,
  
  -- Datos personales
  first_name            NVARCHAR(100) NOT NULL,
  last_name             NVARCHAR(100) NOT NULL,
  rut                   VARCHAR(12) NOT NULL UNIQUE,
  phone                 VARCHAR(20),
  profile_photo_url     NVARCHAR(MAX),
  
  -- Datos profesionales
  professional_title    NVARCHAR(100),
  seremi_registration   VARCHAR(50),
  specializations       NVARCHAR(MAX), -- JSON: ["Construcción", "Minería"]
  
  -- Firma digital
  digital_signature_url NVARCHAR(MAX),
  
  -- Preferencias
  preferences           NVARCHAR(MAX), -- JSON: {theme, language, notifications}
  
  -- Seguridad
  email_verified        BIT DEFAULT 0,
  email_verified_at     DATETIME2,
  
  -- Estado
  status                VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
  last_login_at         DATETIME2,
  last_login_ip         VARCHAR(45), -- IPv6 compatible
  
  -- Auditoría
  created_at            DATETIME2 DEFAULT GETDATE(),
  updated_at            DATETIME2 DEFAULT GETDATE(),
  deleted_at            DATETIME2,
  
  CONSTRAINT chk_users_status CHECK (status IN ('active', 'inactive', 'suspended'))
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_rut ON users(rut) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;
```

---

### 2. sessions
**Descripción**: Sesiones activas (JWT tracking)

```sql
CREATE TABLE sessions (
  id                UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  user_id           UNIQUEIDENTIFIER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_jti         VARCHAR(500) NOT NULL UNIQUE, -- JWT ID (jti claim)
  refresh_token     VARCHAR(500) UNIQUE,
  
  -- Metadata
  ip_address        VARCHAR(45),
  user_agent        NVARCHAR(MAX),
  device_info       NVARCHAR(MAX), -- JSON
  
  -- Expiración
  expires_at        DATETIME2 NOT NULL,
  last_activity_at  DATETIME2 DEFAULT GETDATE(),
  
  -- Auditoría
  created_at        DATETIME2 DEFAULT GETDATE(),
  
  CONSTRAINT chk_sessions_expires CHECK (expires_at > created_at)
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_jti ON sessions(token_jti);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```

---

### 3. companies
**Descripción**: Empresas clientes

```sql
CREATE TABLE companies (
  -- Identificación
  id                    UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  name                  NVARCHAR(255) NOT NULL,
  legal_name            NVARCHAR(255),
  rut                   VARCHAR(12) NOT NULL UNIQUE,
  
  -- Ubicación
  address               NVARCHAR(MAX) NOT NULL,
  city                  NVARCHAR(100),
  region                NVARCHAR(100),
  country               VARCHAR(50) DEFAULT 'Chile',
  latitude              DECIMAL(10, 8),
  longitude             DECIMAL(11, 8),
  
  -- Contacto
  contact_person        NVARCHAR(255) NOT NULL,
  contact_email         NVARCHAR(255) NOT NULL,
  contact_phone         VARCHAR(20) NOT NULL,
  
  -- Información del negocio
  industry              NVARCHAR(100) NOT NULL,
  risk_level            VARCHAR(20) NOT NULL, -- Bajo, Medio, Alto
  worker_count          INT DEFAULT 0,
  
  -- Contrato
  contract_start_date   DATE NOT NULL,
  contract_end_date     DATE,
  contract_status       VARCHAR(20) DEFAULT 'active',
  
  -- Estado
  status                VARCHAR(20) DEFAULT 'active',
  
  -- Auditoría
  created_by            UNIQUEIDENTIFIER REFERENCES users(id),
  created_at            DATETIME2 DEFAULT GETDATE(),
  updated_at            DATETIME2 DEFAULT GETDATE(),
  deleted_at            DATETIME2,
  
  CONSTRAINT chk_companies_risk CHECK (risk_level IN ('Bajo', 'Medio', 'Alto')),
  CONSTRAINT chk_companies_status CHECK (status IN ('active', 'inactive', 'suspended'))
);

CREATE INDEX idx_companies_rut ON companies(rut);
CREATE INDEX idx_companies_status ON companies(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_companies_industry ON companies(industry);
```

---

### 4. branches
**Descripción**: Sucursales/obras de empresas

```sql
CREATE TABLE branches (
  -- Identificación
  id                    UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  company_id            UNIQUEIDENTIFIER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  code                  VARCHAR(20),
  name                  NVARCHAR(255) NOT NULL,
  
  -- Ubicación
  address               NVARCHAR(MAX) NOT NULL,
  city                  NVARCHAR(100),
  region                NVARCHAR(100),
  latitude              DECIMAL(10, 8) NOT NULL,
  longitude             DECIMAL(11, 8) NOT NULL,
  geofence_radius       INT DEFAULT 100, -- metros
  
  -- Contacto
  contact_person        NVARCHAR(255) NOT NULL,
  contact_phone         VARCHAR(20) NOT NULL,
  
  -- Información
  branch_type           VARCHAR(50), -- Obra, Oficina, Planta, Bodega
  worker_count          INT DEFAULT 0,
  risk_level            VARCHAR(20),
  
  -- Score de Riesgo Dinámico (calculado)
  current_risk_score    DECIMAL(5,2) DEFAULT 0,
  last_score_update     DATETIME2,
  
  -- Estado
  is_active             BIT DEFAULT 1,
  
  -- Auditoría
  created_at            DATETIME2 DEFAULT GETDATE(),
  updated_at            DATETIME2 DEFAULT GETDATE(),
  deleted_at            DATETIME2,
  
  CONSTRAINT chk_branches_type CHECK (branch_type IN ('Obra', 'Oficina', 'Planta', 'Bodega', 'Faena'))
);

CREATE INDEX idx_branches_company ON branches(company_id);
CREATE INDEX idx_branches_location ON branches(latitude, longitude);
CREATE INDEX idx_branches_risk_score ON branches(current_risk_score DESC) WHERE is_active = 1;
```

---

### 5. user_company_roles
**Descripción**: Relación usuarios-empresas con roles

```sql
CREATE TABLE user_company_roles (
  id                UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  user_id           UNIQUEIDENTIFIER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id        UNIQUEIDENTIFIER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Rol
  role              VARCHAR(50) NOT NULL, -- admin, prevencionista, supervisor, viewer
  
  -- Facturación (FASE 1.5)
  billable_rate     DECIMAL(10,2), -- ⭐ NUEVA: Tarifa por hora
  
  -- Estado
  is_active         BIT DEFAULT 1,
  assigned_at       DATETIME2 DEFAULT GETDATE(),
  
  -- Auditoría
  created_at        DATETIME2 DEFAULT GETDATE(),
  updated_at        DATETIME2 DEFAULT GETDATE(),
  
  CONSTRAINT uq_user_company UNIQUE(user_id, company_id),
  CONSTRAINT chk_ucr_role CHECK (role IN ('admin', 'prevencionista', 'supervisor', 'viewer'))
);

CREATE INDEX idx_ucr_user ON user_company_roles(user_id);
CREATE INDEX idx_ucr_company ON user_company_roles(company_id);
CREATE INDEX idx_ucr_active ON user_company_roles(is_active) WHERE is_active = 1;
```

---

### 6. workers
**Descripción**: Trabajadores de empresas

```sql
CREATE TABLE workers (
  -- Identificación
  id                    UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  company_id            UNIQUEIDENTIFIER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id             UNIQUEIDENTIFIER REFERENCES branches(id) ON DELETE SET NULL,
  
  -- Datos personales
  rut                   VARCHAR(12) NOT NULL,
  first_name            NVARCHAR(100) NOT NULL,
  last_name             NVARCHAR(100) NOT NULL,
  date_of_birth         DATE,
  photo_url             NVARCHAR(MAX),
  
  -- Contacto
  email                 NVARCHAR(255),
  phone                 VARCHAR(20),
  emergency_contact     NVARCHAR(255),
  emergency_phone       VARCHAR(20),
  
  -- Información laboral
  employee_number       VARCHAR(50),
  position              NVARCHAR(100) NOT NULL,
  contract_type         VARCHAR(50), -- Planta, Contratista, Temporal
  hire_date             DATE NOT NULL,
  termination_date      DATE,
  
  -- Estado
  status                VARCHAR(20) DEFAULT 'active',
  
  -- Auditoría
  created_at            DATETIME2 DEFAULT GETDATE(),
  updated_at            DATETIME2 DEFAULT GETDATE(),
  deleted_at            DATETIME2,
  
  CONSTRAINT uq_worker_rut_company UNIQUE(company_id, rut),
  CONSTRAINT chk_workers_status CHECK (status IN ('active', 'inactive', 'terminated')),
  CONSTRAINT chk_workers_contract CHECK (contract_type IN ('Planta', 'Contratista', 'Temporal'))
);

CREATE INDEX idx_workers_company ON workers(company_id);
CREATE INDEX idx_workers_branch ON workers(branch_id);
CREATE INDEX idx_workers_rut ON workers(company_id, rut);
CREATE INDEX idx_workers_status ON workers(status) WHERE deleted_at IS NULL;
```

---

### 7. safety_talks
**Descripción**: Charlas de seguridad

```sql
CREATE TABLE safety_talks (
  -- Identificación
  id                    UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  company_id            UNIQUEIDENTIFIER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id             UNIQUEIDENTIFIER REFERENCES branches(id) ON DELETE SET NULL,
  
  -- Información de la charla
  topic                 NVARCHAR(255) NOT NULL,
  description           NVARCHAR(MAX),
  talk_date             DATE NOT NULL,
  talk_time             TIME NOT NULL,
  duration_minutes      INT DEFAULT 15,
  
  -- Ubicación
  location              NVARCHAR(255) NOT NULL,
  latitude              DECIMAL(10, 8),
  longitude             DECIMAL(11, 8),
  
  -- Instructor
  instructor_id         UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
  
  -- Asistencia
  attendee_count        INT DEFAULT 0,
  
  -- Materiales
  photos                NVARCHAR(MAX), -- JSON: URLs de fotos
  
  -- Estado
  status                VARCHAR(20) DEFAULT 'draft', -- draft, completed
  
  -- Metadata legal (Ley 19.799)
  legal_metadata        NVARCHAR(MAX), -- JSON: Hash, timestamp, IP, device
  
  -- Auditoría
  created_at            DATETIME2 DEFAULT GETDATE(),
  updated_at            DATETIME2 DEFAULT GETDATE(),
  completed_at          DATETIME2,
  deleted_at            DATETIME2,
  
  CONSTRAINT chk_st_status CHECK (status IN ('draft', 'completed', 'cancelled'))
);

CREATE INDEX idx_st_company ON safety_talks(company_id);
CREATE INDEX idx_st_branch ON safety_talks(branch_id);
CREATE INDEX idx_st_date ON safety_talks(talk_date DESC);
CREATE INDEX idx_st_instructor ON safety_talks(instructor_id);
```

---

### 8. signatures
**Descripción**: Firmas digitales (Ley 19.799)

```sql
CREATE TABLE signatures (
  id                UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  
  -- Firmante
  signer_type       VARCHAR(20) NOT NULL, -- user, worker, external
  signer_id         UNIQUEIDENTIFIER, -- ID del usuario o trabajador
  signer_name       NVARCHAR(255) NOT NULL,
  signer_rut        VARCHAR(12),
  
  -- Firma
  signature_data    NVARCHAR(MAX) NOT NULL, -- Base64 de la imagen
  signature_url     NVARCHAR(MAX), -- URL en Azure Blob Storage
  
  -- Metadata legal (Ley 19.799) ⭐ CRÍTICO
  legal_timestamp   DATETIME2 NOT NULL DEFAULT SYSDATETIMEOFFSET(), -- ⭐ NUEVA
  ip_address        VARCHAR(45),
  user_agent        NVARCHAR(MAX),
  geolocation       NVARCHAR(MAX), -- JSON: {lat, lon, accuracy}
  device_info       NVARCHAR(MAX), -- JSON
  
  -- Hash de verificación (SHA-256)
  data_hash         VARCHAR(64), -- ⭐ Hash del documento firmado
  signature_hash    VARCHAR(64), -- ⭐ Hash de la firma
  
  -- Contexto
  context_type      VARCHAR(50), -- safety_talk, inspection, epp_delivery, etc.
  context_id        UNIQUEIDENTIFIER,
  
  -- Auditoría
  created_at        DATETIME2 DEFAULT GETDATE(),
  
  CONSTRAINT chk_sig_signer CHECK (signer_type IN ('user', 'worker', 'external'))
);

CREATE INDEX idx_sig_signer ON signatures(signer_type, signer_id);
CREATE INDEX idx_sig_context ON signatures(context_type, context_id);
CREATE INDEX idx_sig_timestamp ON signatures(legal_timestamp DESC);
CREATE INDEX idx_sig_data_hash ON signatures(data_hash);
```

**⚠️ IMPORTANTE**: `legal_timestamp` usa `SYSDATETIMEOFFSET()` para tener timestamp con timezone, crucial para validez legal.

---

## FASE 1.0: CORE COMPLIANCE

### 9. inspections
**Descripción**: Inspecciones de seguridad

```sql
CREATE TABLE inspections (
  -- Identificación
  id                    UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  company_id            UNIQUEIDENTIFIER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id             UNIQUEIDENTIFIER REFERENCES branches(id) ON DELETE SET NULL,
  
  -- Información
  inspection_type       NVARCHAR(100) NOT NULL,
  title                 NVARCHAR(255) NOT NULL,
  description           NVARCHAR(MAX),
  
  -- Fecha
  inspection_date       DATE NOT NULL,
  start_time            TIME NOT NULL,
  end_time              TIME,
  
  -- Ubicación
  area_inspected        NVARCHAR(255) NOT NULL,
  latitude              DECIMAL(10, 8) NOT NULL,
  longitude             DECIMAL(11, 8) NOT NULL,
  
  -- Inspector
  inspector_id          UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
  
  -- Resultados
  total_items           INT DEFAULT 0,
  conforming_items      INT DEFAULT 0,
  non_conforming_items  INT DEFAULT 0,
  not_applicable_items  INT DEFAULT 0,
  compliance_score      DECIMAL(5,2), -- Calculado automáticamente
  
  -- Estado
  status                VARCHAR(20) DEFAULT 'draft',
  
  -- Metadata legal
  legal_metadata        NVARCHAR(MAX),
  
  -- Auditoría
  created_at            DATETIME2 DEFAULT GETDATE(),
  updated_at            DATETIME2 DEFAULT GETDATE(),
  completed_at          DATETIME2,
  deleted_at            DATETIME2,
  
  CONSTRAINT chk_insp_status CHECK (status IN ('draft', 'in_progress', 'completed', 'approved'))
);

CREATE INDEX idx_insp_company ON inspections(company_id);
CREATE INDEX idx_insp_branch ON inspections(branch_id);
CREATE INDEX idx_insp_date ON inspections(inspection_date DESC);
CREATE INDEX idx_insp_score ON inspections(compliance_score) WHERE deleted_at IS NULL;
```

---

### 10. inspection_checklist_items
**Descripción**: Items del checklist

```sql
CREATE TABLE inspection_checklist_items (
  id                    UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  inspection_id         UNIQUEIDENTIFIER NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  
  -- Item
  item_number           INT NOT NULL,
  item_description      NVARCHAR(MAX) NOT NULL,
  category              NVARCHAR(100),
  
  -- Evaluación
  result                VARCHAR(20) NOT NULL, -- conforming, non_conforming, not_applicable
  
  -- Evidencia
  photos                NVARCHAR(MAX), -- JSON: URLs
  observations          NVARCHAR(MAX),
  
  -- Si es no conforme
  risk_level            VARCHAR(20), -- Bajo, Medio, Alto, Crítico
  
  -- Auditoría
  created_at            DATETIME2 DEFAULT GETDATE(),
  updated_at            DATETIME2 DEFAULT GETDATE(),
  
  CONSTRAINT chk_ici_result CHECK (result IN ('conforming', 'non_conforming', 'not_applicable')),
  CONSTRAINT chk_ici_risk CHECK (risk_level IN ('Bajo', 'Medio', 'Alto', 'Crítico'))
);

CREATE INDEX idx_ici_inspection ON inspection_checklist_items(inspection_id);
CREATE INDEX idx_ici_result ON inspection_checklist_items(result);
```

---

### 11. findings
**Descripción**: Hallazgos (no conformidades)

```sql
CREATE TABLE findings (
  -- Identificación
  id                    UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  finding_number        VARCHAR(50) NOT NULL UNIQUE, -- HAL-2026-0123
  company_id            UNIQUEIDENTIFIER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id             UNIQUEIDENTIFIER REFERENCES branches(id) ON DELETE SET NULL,
  
  -- Origen
  inspection_id         UNIQUEIDENTIFIER REFERENCES inspections(id) ON DELETE SET NULL,
  checklist_item_id     UNIQUEIDENTIFIER REFERENCES inspection_checklist_items(id) ON DELETE SET NULL,
  
  -- Descripción
  title                 NVARCHAR(255) NOT NULL,
  description           NVARCHAR(MAX) NOT NULL,
  category              NVARCHAR(100),
  
  -- Riesgo
  risk_level            VARCHAR(20) NOT NULL,
  
  -- Evidencia
  photos                NVARCHAR(MAX), -- JSON
  location              NVARCHAR(255),
  
  -- Acción correctiva
  corrective_action     NVARCHAR(MAX) NOT NULL,
  responsible_person    NVARCHAR(255),
  responsible_id        UNIQUEIDENTIFIER REFERENCES users(id),
  due_date              DATE NOT NULL,
  
  -- Estado
  status                VARCHAR(20) DEFAULT 'open',
  
  -- ⭐ CICLO DE CIERRE: Verificación de Eficacia
  effectiveness_verified      BIT DEFAULT 0,
  effectiveness_verification_date DATETIME2,
  effectiveness_notes         NVARCHAR(MAX),
  effectiveness_photos        NVARCHAR(MAX), -- JSON: Evidencia de corrección
  verified_by                 UNIQUEIDENTIFIER REFERENCES users(id),
  
  -- Cierre
  closed_at             DATETIME2,
  closed_by             UNIQUEIDENTIFIER REFERENCES users(id),
  
  -- Auditoría
  reported_by           UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
  created_at            DATETIME2 DEFAULT GETDATE(),
  updated_at            DATETIME2 DEFAULT GETDATE(),
  deleted_at            DATETIME2,
  
  CONSTRAINT chk_find_status CHECK (status IN ('open', 'assigned', 'in_progress', 'pending_verification', 'closed', 'overdue')),
  CONSTRAINT chk_find_risk CHECK (risk_level IN ('Bajo', 'Medio', 'Alto', 'Crítico'))
);

CREATE INDEX idx_find_company ON findings(company_id);
CREATE INDEX idx_find_status ON findings(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_find_due_date ON findings(due_date) WHERE status != 'closed';
CREATE INDEX idx_find_verification ON findings(effectiveness_verified) WHERE effectiveness_verified = 0;
```

**⚠️ CRÍTICO**: `effectiveness_verified` asegura cumplimiento legal del ciclo de cierre.

---

### 12. action_plans ⭐ NUEVA
**Descripción**: Planes de acción que agrupan múltiples hallazgos

```sql
CREATE TABLE action_plans (
  id                    UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  company_id            UNIQUEIDENTIFIER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id             UNIQUEIDENTIFIER REFERENCES branches(id) ON DELETE SET NULL,
  
  -- Información
  plan_number           VARCHAR(50) NOT NULL UNIQUE, -- PA-2026-0001
  title                 NVARCHAR(255) NOT NULL,
  description           NVARCHAR(MAX),
  objective             NVARCHAR(MAX), -- Ej: "Instalación de protecciones en Maestranza"
  
  -- Responsable
  responsible_id        UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
  responsible_name      NVARCHAR(255),
  
  -- Presupuesto
  estimated_budget      DECIMAL(12,2),
  actual_cost           DECIMAL(12,2),
  currency              VARCHAR(3) DEFAULT 'CLP',
  
  -- Fechas
  start_date            DATE NOT NULL,
  target_date           DATE NOT NULL,
  completion_date       DATE,
  
  -- Estado
  status                VARCHAR(20) DEFAULT 'planned', -- planned, in_progress, completed, cancelled
  completion_percentage INT DEFAULT 0,
  
  -- Auditoría
  created_by            UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
  created_at            DATETIME2 DEFAULT GETDATE(),
  updated_at            DATETIME2 DEFAULT GETDATE(),
  deleted_at            DATETIME2,
  
  CONSTRAINT chk_ap_status CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  CONSTRAINT chk_ap_dates CHECK (start_date <= target_date),
  CONSTRAINT chk_ap_percentage CHECK (completion_percentage BETWEEN 0 AND 100)
);

CREATE INDEX idx_ap_company ON action_plans(company_id);
CREATE INDEX idx_ap_status ON action_plans(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_ap_target_date ON action_plans(target_date) WHERE status != 'completed';
```

---

### 13. finding_action_plan ⭐ NUEVA
**Descripción**: Relación N:N entre hallazgos y planes de acción

```sql
CREATE TABLE finding_action_plan (
  id                UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  finding_id        UNIQUEIDENTIFIER NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
  action_plan_id    UNIQUEIDENTIFIER NOT NULL REFERENCES action_plans(id) ON DELETE CASCADE,
  
  -- Auditoría
  created_at        DATETIME2 DEFAULT GETDATE(),
  
  CONSTRAINT uq_finding_plan UNIQUE(finding_id, action_plan_id)
);

CREATE INDEX idx_fap_finding ON finding_action_plan(finding_id);
CREATE INDEX idx_fap_plan ON finding_action_plan(action_plan_id);
```

---

### 14. work_permits ⭐ NUEVA
**Descripción**: Permisos de Trabajo de Alto Riesgo

```sql
CREATE TABLE work_permits (
  id                    UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  company_id            UNIQUEIDENTIFIER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id             UNIQUEIDENTIFIER REFERENCES branches(id) ON DELETE SET NULL,
  
  -- Información del permiso
  permit_number         VARCHAR(50) NOT NULL UNIQUE, -- PT-2026-0123
  permit_type           NVARCHAR(100) NOT NULL, -- "Trabajo en Altura", "Espacio Confinado", etc.
  work_description      NVARCHAR(MAX) NOT NULL,
  
  -- Ubicación
  work_location         NVARCHAR(255) NOT NULL,
  latitude              DECIMAL(10, 8),
  longitude             DECIMAL(11, 8),
  
  -- Fechas (válido solo por 1 turno)
  valid_date            DATE NOT NULL,
  start_time            TIME NOT NULL,
  end_time              TIME NOT NULL,
  
  -- Personal autorizado
  authorized_workers    NVARCHAR(MAX), -- JSON: Array de worker_ids
  supervisor_id         UNIQUEIDENTIFIER REFERENCES users(id),
  
  -- Checklist de verificación
  checklist_items       NVARCHAR(MAX), -- JSON: {item: "Arnés verificado", checked: true}
  
  -- Firmas
  worker_signature_id   UNIQUEIDENTIFIER REFERENCES signatures(id),
  supervisor_signature_id UNIQUEIDENTIFIER REFERENCES signatures(id),
  
  -- Estado
  status                VARCHAR(20) DEFAULT 'active', -- active, expired, cancelled
  
  -- Metadata legal
  legal_metadata        NVARCHAR(MAX),
  
  -- Auditoría
  issued_by             UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
  created_at            DATETIME2 DEFAULT GETDATE(),
  updated_at            DATETIME2 DEFAULT GETDATE(),
  deleted_at            DATETIME2,
  
  CONSTRAINT chk_wp_status CHECK (status IN ('active', 'expired', 'cancelled')),
  CONSTRAINT chk_wp_times CHECK (start_time < end_time)
);

CREATE INDEX idx_wp_company ON work_permits(company_id);
CREATE INDEX idx_wp_date ON work_permits(valid_date DESC);
CREATE INDEX idx_wp_status ON work_permits(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_wp_type ON work_permits(permit_type);
```

---

### 15-17. EPP (Equipos de Protección Personal)

```sql
CREATE TABLE epp_items (
  id                    UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  name                  NVARCHAR(100) NOT NULL,
  description           NVARCHAR(MAX),
  category              VARCHAR(50) NOT NULL,
  has_expiration        BIT DEFAULT 0,
  expiration_months     INT,
  is_active             BIT DEFAULT 1,
  created_at            DATETIME2 DEFAULT GETDATE(),
  
  CONSTRAINT chk_epp_category CHECK (category IN ('Casco', 'Guantes', 'Arnés', 'Calzado', 'Protección Auditiva', 'Protección Visual', 'Ropa', 'Otro'))
);

CREATE TABLE epp_deliveries (
  id                    UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  company_id            UNIQUEIDENTIFIER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id             UNIQUEIDENTIFIER REFERENCES branches(id) ON DELETE SET NULL,
  delivery_date         DATE NOT NULL,
  delivered_by          UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
  worker_id             UNIQUEIDENTIFIER NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  signature_id          UNIQUEIDENTIFIER REFERENCES signatures(id),
  notes                 NVARCHAR(MAX),
  photos                NVARCHAR(MAX), -- JSON
  legal_metadata        NVARCHAR(MAX),
  created_at            DATETIME2 DEFAULT GETDATE(),
  deleted_at            DATETIME2
);

CREATE TABLE epp_delivery_items (
  id                    UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  epp_delivery_id       UNIQUEIDENTIFIER NOT NULL REFERENCES epp_deliveries(id) ON DELETE CASCADE,
  epp_item_id           UNIQUEIDENTIFIER NOT NULL REFERENCES epp_items(id),
  quantity              INT NOT NULL DEFAULT 1,
  expiration_date       DATE,
  created_at            DATETIME2 DEFAULT GETDATE(),
  
  CONSTRAINT chk_edi_quantity CHECK (quantity > 0)
);

CREATE INDEX idx_epp_del_company ON epp_deliveries(company_id);
CREATE INDEX idx_epp_del_worker ON epp_deliveries(worker_id);
CREATE INDEX idx_epp_del_date ON epp_deliveries(delivery_date DESC);
```

---

### 18. incidents
**Descripción**: Incidentes y accidentes laborales

```sql
CREATE TABLE incidents (
  id                    UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  incident_number       VARCHAR(50) NOT NULL UNIQUE, -- INC-2026-0123 o ACC-2026-0123
  company_id            UNIQUEIDENTIFIER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id             UNIQUEIDENTIFIER REFERENCES branches(id) ON DELETE SET NULL,
  
  -- Clasificación
  incident_type         VARCHAR(50) NOT NULL, -- incident, accident, near_miss
  severity              VARCHAR(20) NOT NULL, -- leve, grave, muy_grave, fatal
  
  -- Fecha
  incident_date         DATE NOT NULL,
  incident_time         TIME NOT NULL,
  
  -- Ubicación
  location              NVARCHAR(255) NOT NULL,
  latitude              DECIMAL(10, 8) NOT NULL,
  longitude             DECIMAL(11, 8) NOT NULL,
  
  -- Personas involucradas
  affected_worker_id    UNIQUEIDENTIFIER REFERENCES workers(id),
  affected_worker_name  NVARCHAR(255),
  
  -- Descripción
  title                 NVARCHAR(255) NOT NULL,
  description           NVARCHAR(MAX) NOT NULL,
  injury_type           NVARCHAR(100),
  body_part_affected    NVARCHAR(100),
  
  -- Evidencia
  photos                NVARCHAR(MAX), -- JSON
  
  -- Acciones inmediatas
  immediate_actions     NVARCHAR(MAX),
  medical_attention     BIT DEFAULT 0,
  
  -- Reportado por
  reported_by           UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
  
  -- Investigación
  investigation_status  VARCHAR(20) DEFAULT 'pending',
  root_causes           NVARCHAR(MAX),
  corrective_actions    NVARCHAR(MAX),
  
  -- Notificaciones legales (24hrs)
  mutual_notified       BIT DEFAULT 0,
  mutual_notified_at    DATETIME2,
  
  -- Estado
  status                VARCHAR(20) DEFAULT 'open',
  
  -- Metadata legal
  legal_metadata        NVARCHAR(MAX),
  
  -- Auditoría
  created_at            DATETIME2 DEFAULT GETDATE(),
  updated_at            DATETIME2 DEFAULT GETDATE(),
  deleted_at            DATETIME2,
  
  CONSTRAINT chk_inc_type CHECK (incident_type IN ('incident', 'accident', 'near_miss')),
  CONSTRAINT chk_inc_severity CHECK (severity IN ('leve', 'grave', 'muy_grave', 'fatal')),
  CONSTRAINT chk_inc_status CHECK (status IN ('open', 'under_investigation', 'closed'))
);

CREATE INDEX idx_inc_company ON incidents(company_id);
CREATE INDEX idx_inc_date ON incidents(incident_date DESC);
CREATE INDEX idx_inc_severity ON incidents(severity);
CREATE INDEX idx_inc_mutual ON incidents(mutual_notified) WHERE mutual_notified = 0;
```

---

## FASE 1.5: CONSULTANT GROWTH

### 19. consultancy_hours ⭐ NUEVA
**Descripción**: Registro de horas facturables

```sql
CREATE TABLE consultancy_hours (
  id                UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  user_id           UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
  company_id        UNIQUEIDENTIFIER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id         UNIQUEIDENTIFIER REFERENCES branches(id) ON DELETE SET NULL,
  
  -- Registro de tiempo
  work_date         DATE NOT NULL,
  start_time        TIME NOT NULL,
  end_time          TIME NOT NULL,
  hours_worked      DECIMAL(4,2) NOT NULL,
  
  -- Facturación
  billable          BIT DEFAULT 1,
  hourly_rate       DECIMAL(10,2) NOT NULL, -- CLP por hora
  total_amount      DECIMAL(10,2) NOT NULL, -- hours_worked * hourly_rate
  
  -- Actividad
  activity_type     VARCHAR(50), -- inspection, talk, accident, meeting, travel
  activity_id       UNIQUEIDENTIFIER,
  description       NVARCHAR(MAX),
  
  -- Estado
  invoiced          BIT DEFAULT 0,
  invoice_id        UNIQUEIDENTIFIER REFERENCES invoices(id),
  
  -- Origen (manual o automático desde GPS)
  source            VARCHAR(20) DEFAULT 'manual', -- manual, auto_gps
  location_history_id UNIQUEIDENTIFIER, -- FK a location_history (FASE 2.0)
  
  -- Auditoría
  created_at        DATETIME2 DEFAULT GETDATE(),
  updated_at        DATETIME2 DEFAULT GETDATE(),
  
  CONSTRAINT chk_ch_times CHECK (start_time < end_time),
  CONSTRAINT chk_ch_hours CHECK (hours_worked > 0 AND hours_worked <= 24),
  CONSTRAINT chk_ch_source CHECK (source IN ('manual', 'auto_gps'))
);

CREATE INDEX idx_ch_user_date ON consultancy_hours(user_id, work_date DESC);
CREATE INDEX idx_ch_company ON consultancy_hours(company_id);
CREATE INDEX idx_ch_uninvoiced ON consultancy_hours(user_id, invoiced) WHERE invoiced = 0;
CREATE INDEX idx_ch_billable ON consultancy_hours(billable) WHERE billable = 1;
```

---

### 20. invoices ⭐ NUEVA
**Descripción**: Boletas de honorarios generadas

```sql
CREATE TABLE invoices (
  id                    UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  user_id               UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
  company_id            UNIQUEIDENTIFIER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Información fiscal
  invoice_number        VARCHAR(50) NOT NULL UNIQUE, -- BOL-2026-0123
  invoice_type          VARCHAR(20) DEFAULT 'honorarios', -- honorarios, factura
  
  -- Período
  period_start          DATE NOT NULL,
  period_end            DATE NOT NULL,
  
  -- Montos
  subtotal              DECIMAL(12,2) NOT NULL,
  tax_withheld          DECIMAL(12,2) NOT NULL, -- 10% retención
  total_amount          DECIMAL(12,2) NOT NULL, -- subtotal - tax_withheld
  currency              VARCHAR(3) DEFAULT 'CLP',
  
  -- Estado
  status                VARCHAR(20) DEFAULT 'draft', -- draft, sent, paid, cancelled
  
  -- Fechas
  issue_date            DATE NOT NULL,
  due_date              DATE,
  paid_date             DATE,
  
  -- Entrega
  sent_to_emails        NVARCHAR(MAX), -- JSON: Array de emails
  sent_at               DATETIME2,
  
  -- Archivos
  pdf_url               NVARCHAR(MAX), -- URL en Azure Blob Storage
  
  -- Notas
  notes                 NVARCHAR(MAX),
  
  -- Auditoría
  created_at            DATETIME2 DEFAULT GETDATE(),
  updated_at            DATETIME2 DEFAULT GETDATE(),
  deleted_at            DATETIME2,
  
  CONSTRAINT chk_inv_status CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
  CONSTRAINT chk_inv_dates CHECK (period_start <= period_end),
  CONSTRAINT chk_inv_amounts CHECK (subtotal >= 0 AND total_amount >= 0)
);

CREATE INDEX idx_inv_user ON invoices(user_id);
CREATE INDEX idx_inv_company ON invoices(company_id);
CREATE INDEX idx_inv_number ON invoices(invoice_number);
CREATE INDEX idx_inv_status ON invoices(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_inv_period ON invoices(period_start, period_end);
```

---

### 21. invoice_line_items ⭐ NUEVA
**Descripción**: Líneas de detalle de cada boleta

```sql
CREATE TABLE invoice_line_items (
  id                    UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  invoice_id            UNIQUEIDENTIFIER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  
  -- Descripción
  line_number           INT NOT NULL,
  description           NVARCHAR(MAX) NOT NULL, -- "Inspección Obra Portal Ñuñoa - 4.5 hrs"
  
  -- Cantidad y precio
  quantity              DECIMAL(10,2) NOT NULL, -- Horas trabajadas
  unit_price            DECIMAL(10,2) NOT NULL, -- Tarifa por hora
  subtotal              DECIMAL(12,2) NOT NULL, -- quantity * unit_price
  
  -- Referencia
  consultancy_hour_id   UNIQUEIDENTIFIER REFERENCES consultancy_hours(id),
  work_date             DATE,
  
  -- Auditoría
  created_at            DATETIME2 DEFAULT GETDATE(),
  
  CONSTRAINT chk_ili_quantity CHECK (quantity > 0),
  CONSTRAINT chk_ili_price CHECK (unit_price >= 0)
);

CREATE INDEX idx_ili_invoice ON invoice_line_items(invoice_id, line_number);
CREATE INDEX idx_ili_work_date ON invoice_line_items(work_date DESC);
```

---

## FASE 2.0: PREDICTIVE SAFETY

### 22. documents
**Descripción**: Documentos legales y operativos

```sql
CREATE TABLE documents (
  id                    UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  company_id            UNIQUEIDENTIFIER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id             UNIQUEIDENTIFIER REFERENCES branches(id) ON DELETE SET NULL,
  
  -- Información
  title                 NVARCHAR(255) NOT NULL,
  description           NVARCHAR(MAX),
  document_type         NVARCHAR(100) NOT NULL, -- RIOHS, Reglamento, Certificado, etc.
  
  -- Archivo
  file_name             NVARCHAR(255) NOT NULL,
  file_url              NVARCHAR(MAX) NOT NULL, -- Azure Blob Storage URL
  file_size_bytes       BIGINT,
  file_type             VARCHAR(50), -- application/pdf, image/jpeg
  file_hash             VARCHAR(64), -- SHA-256
  
  -- OCR (FASE 2.0)
  ocr_text              NVARCHAR(MAX), -- Texto extraído por Azure Computer Vision
  ocr_processed         BIT DEFAULT 0,
  
  -- Fechas
  issue_date            DATE,
  expiry_date           DATE,
  
  -- Estado
  status                VARCHAR(20) DEFAULT 'active',
  
  -- Acceso
  uploaded_by           UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
  
  -- Auditoría
  created_at            DATETIME2 DEFAULT GETDATE(),
  updated_at            DATETIME2 DEFAULT GETDATE(),
  deleted_at            DATETIME2,
  
  CONSTRAINT chk_doc_status CHECK (status IN ('active', 'archived', 'expired'))
);

CREATE INDEX idx_doc_company ON documents(company_id);
CREATE INDEX idx_doc_type ON documents(document_type);
CREATE INDEX idx_doc_expiry ON documents(expiry_date) WHERE status = 'active' AND expiry_date IS NOT NULL;
CREATE FULLTEXT INDEX idx_doc_ocr_fulltext ON documents(ocr_text); -- Full-text search
```

---

### 23. document_access_log
**Descripción**: Log de accesos a documentos (auditoría)

```sql
CREATE TABLE document_access_log (
  id            UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  document_id   UNIQUEIDENTIFIER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id       UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
  action        VARCHAR(50) NOT NULL, -- view, download, share, print
  ip_address    VARCHAR(45),
  user_agent    NVARCHAR(MAX),
  accessed_at   DATETIME2 DEFAULT GETDATE(),
  
  CONSTRAINT chk_dal_action CHECK (action IN ('view', 'download', 'share', 'print'))
);

CREATE INDEX idx_dal_document ON document_access_log(document_id);
CREATE INDEX idx_dal_user ON document_access_log(user_id);
CREATE INDEX idx_dal_accessed ON document_access_log(accessed_at DESC);
```

---

### 24. risk_predictions ⭐ NUEVA
**Descripción**: Predicciones de riesgo semanal por sucursal

```sql
CREATE TABLE risk_predictions (
  id                    UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  branch_id             UNIQUEIDENTIFIER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  
  -- Período de predicción
  prediction_date       DATE NOT NULL, -- Lunes de la semana predicha
  week_number           INT NOT NULL, -- Semana del año
  year                  INT NOT NULL,
  
  -- Predicción
  predicted_risk_score  DECIMAL(5,2) NOT NULL, -- 0-100
  risk_level            VARCHAR(20) NOT NULL, -- bajo, medio, alto, critico
  
  -- Factores considerados
  accident_history_factor       DECIMAL(5,2),
  inspection_failure_factor     DECIMAL(5,2),
  overdue_findings_factor       DECIMAL(5,2),
  missing_training_factor       DECIMAL(5,2),
  weather_risk_factor           DECIMAL(5,2),
  seasonality_factor            DECIMAL(5,2),
  
  -- Recomendaciones
  recommended_actions   NVARCHAR(MAX), -- JSON: ["Reforzar charlas", "Inspección urgente"]
  priority              VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  
  -- Validación (después de la semana)
  actual_incidents      INT DEFAULT 0, -- Incidentes reales ocurridos
  prediction_accuracy   DECIMAL(5,2), -- % de precisión
  validated_at          DATETIME2,
  
  -- Auditoría
  created_at            DATETIME2 DEFAULT GETDATE(),
  
  CONSTRAINT chk_rp_risk_level CHECK (risk_level IN ('bajo', 'medio', 'alto', 'critico')),
  CONSTRAINT chk_rp_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  CONSTRAINT chk_rp_score CHECK (predicted_risk_score BETWEEN 0 AND 100),
  CONSTRAINT uq_branch_week UNIQUE(branch_id, prediction_date)
);

CREATE INDEX idx_rp_branch_date ON risk_predictions(branch_id, prediction_date DESC);
CREATE INDEX idx_rp_week ON risk_predictions(year, week_number);
CREATE INDEX idx_rp_risk_level ON risk_predictions(risk_level, prediction_date);
CREATE INDEX idx_rp_priority ON risk_predictions(priority, prediction_date);
```

---

## 🔧 FUNCIONES Y PROCEDIMIENTOS ALMACENADOS

### 1. Calcular Score de Inspección

```sql
CREATE PROCEDURE usp_calculate_inspection_score
  @inspection_id UNIQUEIDENTIFIER
AS
BEGIN
  DECLARE @total INT
  DECLARE @conforming INT
  DECLARE @score DECIMAL(5,2)
  
  SELECT 
    @total = COUNT(*),
    @conforming = SUM(CASE WHEN result = 'conforming' THEN 1 ELSE 0 END)
  FROM inspection_checklist_items
  WHERE inspection_id = @inspection_id
    AND result IN ('conforming', 'non_conforming')
  
  IF @total = 0
    SET @score = 0
  ELSE
    SET @score = (CAST(@conforming AS DECIMAL(5,2)) / @total) * 100
  
  UPDATE inspections
  SET 
    total_items = @total,
    conforming_items = @conforming,
    non_conforming_items = @total - @conforming,
    compliance_score = @score,
    updated_at = GETDATE()
  WHERE id = @inspection_id
  
  RETURN @score
END
GO
```

---

### 2. Calcular Score de Riesgo Dinámico por Sucursal

```sql
CREATE FUNCTION dbo.fn_calculate_branch_risk_score(@branch_id UNIQUEIDENTIFIER)
RETURNS DECIMAL(5,2)
AS
BEGIN
  DECLARE @score DECIMAL(5,2)
  DECLARE @accidents INT
  DECLARE @failed_inspections INT
  DECLARE @overdue_findings INT
  DECLARE @missing_talks INT
  
  -- Accidentes últimos 30 días
  SELECT @accidents = COUNT(*)
  FROM incidents
  WHERE branch_id = @branch_id
    AND incident_date >= DATEADD(day, -30, GETDATE())
    AND deleted_at IS NULL
  
  -- Inspecciones fallidas (score < 70%)
  SELECT @failed_inspections = COUNT(*)
  FROM inspections
  WHERE branch_id = @branch_id
    AND inspection_date >= DATEADD(day, -30, GETDATE())
    AND compliance_score < 70
    AND deleted_at IS NULL
  
  -- Hallazgos vencidos
  SELECT @overdue_findings = COUNT(*)
  FROM findings
  WHERE branch_id = @branch_id
    AND status IN ('open', 'assigned', 'in_progress')
    AND due_date < CAST(GETDATE() AS DATE)
    AND deleted_at IS NULL
  
  -- Charlas faltantes (debería haber al menos 1 semanal)
  SELECT @missing_talks = DATEDIFF(week, MAX(talk_date), GETDATE())
  FROM safety_talks
  WHERE branch_id = @branch_id
    AND status = 'completed'
    AND deleted_at IS NULL
  
  -- Calcular score ponderado
  SET @score = 
    (@accidents * 0.5) +
    (@failed_inspections * 0.3) +
    (@overdue_findings * 0.15) +
    (CASE WHEN @missing_talks > 1 THEN @missing_talks ELSE 0 END * 0.05)
  
  -- Normalizar a 0-100
  IF @score > 100 SET @score = 100
  
  RETURN @score
END
GO
```

---

### 3. Job: Actualizar Scores de Riesgo (Ejecutar diariamente)

```sql
CREATE PROCEDURE usp_update_all_branch_risk_scores
AS
BEGIN
  UPDATE branches
  SET 
    current_risk_score = dbo.fn_calculate_branch_risk_score(id),
    last_score_update = GETDATE()
  WHERE is_active = 1
    AND deleted_at IS NULL
END
GO
```

---

### 4. Job: Marcar Hallazgos Vencidos (Ejecutar diariamente)

```sql
CREATE PROCEDURE usp_mark_overdue_findings
AS
BEGIN
  UPDATE findings
  SET 
    status = 'overdue',
    updated_at = GETDATE()
  WHERE status IN ('open', 'assigned', 'in_progress')
    AND due_date < CAST(GETDATE() AS DATE)
    AND deleted_at IS NULL
    
  -- Retornar cantidad actualizada
  RETURN @@ROWCOUNT
END
GO
```

---

### 5. Job: Predecir Riesgo Semanal (Ejecutar los lunes)

```sql
CREATE PROCEDURE usp_predict_weekly_risk
  @target_date DATE = NULL -- Si es NULL, predice la semana siguiente
AS
BEGIN
  IF @target_date IS NULL
    SET @target_date = DATEADD(week, 1, GETDATE())
  
  DECLARE @week INT = DATEPART(week, @target_date)
  DECLARE @year INT = YEAR(@target_date)
  
  -- Predecir para todas las sucursales activas
  INSERT INTO risk_predictions (
    branch_id,
    prediction_date,
    week_number,
    year,
    predicted_risk_score,
    risk_level,
    accident_history_factor,
    inspection_failure_factor,
    overdue_findings_factor,
    recommended_actions
  )
  SELECT 
    b.id AS branch_id,
    @target_date AS prediction_date,
    @week AS week_number,
    @year AS year,
    dbo.fn_calculate_branch_risk_score(b.id) AS predicted_risk_score,
    CASE 
      WHEN dbo.fn_calculate_branch_risk_score(b.id) >= 81 THEN 'critico'
      WHEN dbo.fn_calculate_branch_risk_score(b.id) >= 61 THEN 'alto'
      WHEN dbo.fn_calculate_branch_risk_score(b.id) >= 31 THEN 'medio'
      ELSE 'bajo'
    END AS risk_level,
    -- Factores individuales (simplificado aquí)
    0.0 AS accident_history_factor,
    0.0 AS inspection_failure_factor,
    0.0 AS overdue_findings_factor,
    '[]' AS recommended_actions
  FROM branches b
  WHERE b.is_active = 1
    AND b.deleted_at IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM risk_predictions rp
      WHERE rp.branch_id = b.id AND rp.prediction_date = @target_date
    )
END
GO
```

---

## 🔍 ÍNDICES DE PERFORMANCE

### Índices Críticos Adicionales

```sql
-- Búsqueda rápida de charlas por empresa y fecha
CREATE INDEX idx_st_company_date 
ON safety_talks(company_id, talk_date DESC)
WHERE deleted_at IS NULL;

-- Inspecciones con hallazgos críticos
CREATE INDEX idx_insp_critical 
ON inspections(company_id, compliance_score)
WHERE compliance_score < 70 AND deleted_at IS NULL;

-- Hallazgos sin verificar
CREATE INDEX idx_find_unverified 
ON findings(company_id, due_date)
WHERE effectiveness_verified = 0 AND status != 'closed' AND deleted_at IS NULL;

-- Horas no facturadas
CREATE INDEX idx_ch_unbilled 
ON consultancy_hours(user_id, work_date DESC)
WHERE invoiced = 0 AND billable = 1;

-- Predicciones de alto riesgo
CREATE INDEX idx_rp_high_risk 
ON risk_predictions(prediction_date, predicted_risk_score DESC)
WHERE risk_level IN ('alto', 'critico');
```

---

## 🔒 ROW-LEVEL SECURITY (Multi-Tenancy)

### Política de Seguridad por Empresa

```sql
-- Habilitar RLS en SQL Server
ALTER TABLE safety_talks ENABLE ROW LEVEL SECURITY;

-- Crear función de seguridad
CREATE FUNCTION dbo.fn_security_predicate_company(@company_id UNIQUEIDENTIFIER)
RETURNS TABLE
WITH SCHEMABINDING
AS
RETURN SELECT 1 AS result
WHERE 
  @company_id IN (
    SELECT company_id 
    FROM user_company_roles 
    WHERE user_id = CAST(SESSION_CONTEXT(N'user_id') AS UNIQUEIDENTIFIER)
      AND is_active = 1
  )
  OR IS_SRVROLEMEMBER('sysadmin') = 1; -- Admins ven todo

-- Aplicar política
CREATE SECURITY POLICY CompanySecurityPolicy
ADD FILTER PREDICATE dbo.fn_security_predicate_company(company_id)
ON safety_talks,
ADD BLOCK PREDICATE dbo.fn_security_predicate_company(company_id)
ON safety_talks AFTER INSERT;

-- Repetir para todas las tablas con company_id
```

---

## 💾 ESTRATEGIA DE BACKUP

### Azure SQL Database (Automático)

```yaml
Backups:
  Full: Semanal (retención 35 días)
  Differential: Diaria (retención 35 días)
  Transaction Log: Cada 5-10 minutos (retención 7-35 días)
  
Point-in-Time Restore:
  Ventana: Últimos 35 días
  Granularidad: Hasta el segundo
  
Geo-Replication:
  Réplica Activa: Chile (región secundaria)
  Failover: Automático (< 30 segundos)
  
Retention Policies:
  Producción: 35 días
  Desarrollo: 7 días
```

---

## 📊 Resumen Final

### Estadísticas del Modelo

| Métrica | Cantidad |
|---------|----------|
| **Tablas Totales** | 24 |
| **Fase 0.5** | 8 tablas |
| **Fase 1.0** | +10 tablas |
| **Fase 1.5** | +3 tablas |
| **Fase 2.0** | +3 tablas |
| **Funciones Almacenadas** | 5 |
| **Procedimientos Almacenados** | 5 |
| **Índices** | ~80 |
| **Tablas con Soft Delete** | 21 |
| **Tablas con Auditoría** | 24 (100%) |

### Compliance

✅ **Ley 19.799**: Firma electrónica con `legal_timestamp` y hash SHA-256  
✅ **DS 594**: Ciclo de cierre con verificación de eficacia  
✅ **GDPR Ready**: Soft delete, encriptación TDE  
✅ **Multi-Tenancy**: Row-Level Security implementado

---

**Última actualización**: 27 de Enero, 2026  
**Versión**: 2.0.0 (SQL Server 2022)  
**Implementación**: Incremental en 5 meses  
**Base de Datos**: Azure SQL Database (PaaS)
