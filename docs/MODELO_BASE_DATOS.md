# 🗄️ Modelo de Base de Datos - SafeTrack Chile

## 📋 Índice

1. [Arquitectura de Datos](#arquitectura-de-datos)
2. [Esquema Completo](#esquema-completo)
3. [Tablas del Sistema](#tablas-del-sistema)
4. [Relaciones](#relaciones)
5. [Índices y Optimización](#índices-y-optimización)
6. [Triggers y Procedimientos](#triggers-y-procedimientos)
7. [Estrategia de Backup](#estrategia-de-backup)

---

## 🏗️ Arquitectura de Datos

### Tecnologías
- **Base de Datos Principal**: PostgreSQL 15+
- **Cache**: Redis (sessions, real-time data)
- **Almacenamiento Local**: IndexedDB (offline mode)
- **Storage de Archivos**: AWS S3 / MinIO
- **Búsqueda**: Elasticsearch (opcional, para documentos)

### Principios de Diseño
1. **Aislamiento por Empresa**: Todas las tablas tienen `company_id`
2. **Soft Delete**: No eliminación física, usar `deleted_at`
3. **Auditoría**: Todas las tablas tienen campos de auditoría
4. **Versionado**: Documentos críticos tienen versionado
5. **GDPR Compliance**: Datos personales encriptados

---

## 📊 Esquema Completo

### Diagrama Entidad-Relación Principal

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   users     │────1:N──│   companies  │────1:N──│   branches  │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                         │
       │                       │                         │
       │         ┌─────────────┴──────────────┬─────────┴────────┐
       │         │                            │                  │
       ▼         ▼                            ▼                  ▼
┌─────────────────────┐            ┌────────────────┐  ┌─────────────┐
│  user_company_roles │            │   workers      │  │  inspections│
└─────────────────────┘            └────────┬───────┘  └──────┬──────┘
                                            │                 │
                         ┌──────────────────┴──────────┬──────┴──────┐
                         │                             │             │
                         ▼                             ▼             ▼
                  ┌─────────────┐            ┌──────────────┐  ┌─────────┐
                  │   talks     │            │  epp_delivery│  │ findings│
                  └──────┬──────┘            └──────────────┘  └─────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │  signatures │
                  └─────────────┘
```

---

## 📋 TABLAS DEL SISTEMA

---

## 1. GESTIÓN DE USUARIOS Y AUTENTICACIÓN

### 1.1 `users`
**Descripción**: Usuarios del sistema (prevencionistas, admins, supervisores)

```sql
CREATE TABLE users (
  -- Identificación
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 VARCHAR(255) UNIQUE NOT NULL,
  password_hash         VARCHAR(255) NOT NULL,
  
  -- Datos personales
  first_name            VARCHAR(100) NOT NULL,
  last_name             VARCHAR(100) NOT NULL,
  rut                   VARCHAR(12) UNIQUE NOT NULL,
  phone                 VARCHAR(20),
  profile_photo_url     TEXT,
  
  -- Datos profesionales
  professional_title    VARCHAR(100),
  seremi_registration   VARCHAR(50),
  specializations       JSONB, -- ["Construcción", "Minería"]
  
  -- Firma digital
  digital_signature_url TEXT,
  signature_metadata    JSONB,
  
  -- Preferencias
  preferences           JSONB DEFAULT '{}', -- {theme, language, notifications}
  
  -- Seguridad
  email_verified        BOOLEAN DEFAULT FALSE,
  email_verified_at     TIMESTAMP,
  two_factor_enabled    BOOLEAN DEFAULT FALSE,
  two_factor_secret     VARCHAR(255),
  
  -- Estado
  status                VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
  last_login_at         TIMESTAMP,
  last_login_ip         INET,
  
  -- Auditoría
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at            TIMESTAMP,
  
  -- Índices
  CONSTRAINT users_status_check CHECK (status IN ('active', 'inactive', 'suspended'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rut ON users(rut);
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_deleted ON users(deleted_at) WHERE deleted_at IS NOT NULL;
```

---

### 1.2 `sessions`
**Descripción**: Sesiones activas de usuarios

```sql
CREATE TABLE sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token             VARCHAR(500) UNIQUE NOT NULL,
  refresh_token     VARCHAR(500) UNIQUE,
  
  -- Metadata
  ip_address        INET,
  user_agent        TEXT,
  device_info       JSONB,
  
  -- Expiración
  expires_at        TIMESTAMP NOT NULL,
  last_activity_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Auditoría
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT sessions_expires_check CHECK (expires_at > created_at)
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```

---

## 2. ESTRUCTURA EMPRESARIAL

### 2.1 `companies`
**Descripción**: Empresas clientes de SafeTrack

```sql
CREATE TABLE companies (
  -- Identificación
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  VARCHAR(255) NOT NULL,
  legal_name            VARCHAR(255),
  rut                   VARCHAR(12) UNIQUE NOT NULL,
  
  -- Ubicación
  address               TEXT NOT NULL,
  city                  VARCHAR(100),
  region                VARCHAR(100),
  country               VARCHAR(50) DEFAULT 'Chile',
  postal_code           VARCHAR(10),
  latitude              DECIMAL(10, 8),
  longitude             DECIMAL(11, 8),
  
  -- Contacto
  contact_person        VARCHAR(255) NOT NULL,
  contact_email         VARCHAR(255) NOT NULL,
  contact_phone         VARCHAR(20) NOT NULL,
  emergency_phone       VARCHAR(20),
  
  -- Información del negocio
  industry              VARCHAR(100) NOT NULL, -- Construcción, Minería, etc.
  sub_industry          VARCHAR(100),
  risk_level            VARCHAR(20) NOT NULL, -- Bajo, Medio, Alto
  worker_count          INTEGER DEFAULT 0,
  
  -- Contrato
  contract_start_date   DATE NOT NULL,
  contract_end_date     DATE,
  contract_status       VARCHAR(20) DEFAULT 'active', -- active, expired, suspended
  billing_frequency     VARCHAR(20), -- monthly, quarterly, annual
  
  -- Configuración
  settings              JSONB DEFAULT '{}',
  logo_url              TEXT,
  
  -- Estado
  status                VARCHAR(20) DEFAULT 'active',
  
  -- Auditoría
  created_by            UUID REFERENCES users(id),
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at            TIMESTAMP,
  
  CONSTRAINT companies_risk_check CHECK (risk_level IN ('Bajo', 'Medio', 'Alto')),
  CONSTRAINT companies_status_check CHECK (status IN ('active', 'inactive', 'suspended')),
  CONSTRAINT companies_contract_check CHECK (contract_start_date <= contract_end_date)
);

CREATE INDEX idx_companies_rut ON companies(rut);
CREATE INDEX idx_companies_status ON companies(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_risk ON companies(risk_level);
```

---

### 2.2 `branches`
**Descripción**: Sucursales/obras de las empresas

```sql
CREATE TABLE branches (
  -- Identificación
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  code                  VARCHAR(20), -- Código interno
  name                  VARCHAR(255) NOT NULL,
  
  -- Ubicación
  address               TEXT NOT NULL,
  city                  VARCHAR(100),
  region                VARCHAR(100),
  latitude              DECIMAL(10, 8) NOT NULL,
  longitude             DECIMAL(11, 8) NOT NULL,
  geofence_radius       INTEGER DEFAULT 100, -- metros
  
  -- Contacto
  contact_person        VARCHAR(255) NOT NULL,
  contact_phone         VARCHAR(20) NOT NULL,
  contact_email         VARCHAR(255),
  
  -- Información
  branch_type           VARCHAR(50), -- Obra, Oficina, Planta, Bodega
  worker_count          INTEGER DEFAULT 0,
  risk_level            VARCHAR(20), -- Puede diferir de la empresa
  
  -- Operación
  operating_hours       JSONB, -- {monday: "08:00-18:00", ...}
  is_active             BOOLEAN DEFAULT TRUE,
  
  -- Auditoría
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at            TIMESTAMP,
  
  CONSTRAINT branches_risk_check CHECK (risk_level IN ('Bajo', 'Medio', 'Alto')),
  CONSTRAINT branches_branch_type_check CHECK (branch_type IN ('Obra', 'Oficina', 'Planta', 'Bodega', 'Faena'))
);

CREATE INDEX idx_branches_company ON branches(company_id);
CREATE INDEX idx_branches_location ON branches USING GIST (
  ll_to_earth(latitude, longitude)
);
CREATE INDEX idx_branches_active ON branches(is_active) WHERE deleted_at IS NULL;
```

---

### 2.3 `user_company_roles`
**Descripción**: Relación many-to-many entre usuarios y empresas con roles

```sql
CREATE TABLE user_company_roles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id        UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Rol
  role              VARCHAR(50) NOT NULL, -- admin, prevencionista, supervisor, viewer
  permissions       JSONB DEFAULT '[]', -- Permisos específicos
  
  -- Restricciones
  branch_ids        UUID[], -- Si está vacío, acceso a todas las sucursales
  
  -- Estado
  is_active         BOOLEAN DEFAULT TRUE,
  assigned_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by       UUID REFERENCES users(id),
  revoked_at        TIMESTAMP,
  
  -- Auditoría
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, company_id),
  CONSTRAINT ucr_role_check CHECK (role IN ('admin', 'prevencionista', 'supervisor', 'viewer', 'worker'))
);

CREATE INDEX idx_ucr_user ON user_company_roles(user_id);
CREATE INDEX idx_ucr_company ON user_company_roles(company_id);
CREATE INDEX idx_ucr_active ON user_company_roles(is_active);
```

---

## 3. GESTIÓN DE TRABAJADORES

### 3.1 `workers`
**Descripción**: Trabajadores de las empresas (no usuarios del sistema)

```sql
CREATE TABLE workers (
  -- Identificación
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id             UUID REFERENCES branches(id) ON DELETE SET NULL,
  
  -- Datos personales
  rut                   VARCHAR(12) NOT NULL,
  first_name            VARCHAR(100) NOT NULL,
  last_name             VARCHAR(100) NOT NULL,
  date_of_birth         DATE,
  nationality           VARCHAR(50) DEFAULT 'Chilena',
  photo_url             TEXT,
  
  -- Contacto
  email                 VARCHAR(255),
  phone                 VARCHAR(20),
  emergency_contact     VARCHAR(255),
  emergency_phone       VARCHAR(20),
  
  -- Información laboral
  employee_number       VARCHAR(50),
  position              VARCHAR(100) NOT NULL,
  department            VARCHAR(100),
  contract_type         VARCHAR(50), -- Planta, Contratista, Temporal
  hire_date             DATE NOT NULL,
  termination_date      DATE,
  
  -- Datos de seguridad
  blood_type            VARCHAR(5),
  allergies             TEXT,
  medical_conditions    TEXT,
  
  -- Estado
  status                VARCHAR(20) DEFAULT 'active', -- active, inactive, terminated
  
  -- Auditoría
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at            TIMESTAMP,
  
  UNIQUE(company_id, rut),
  CONSTRAINT workers_status_check CHECK (status IN ('active', 'inactive', 'terminated')),
  CONSTRAINT workers_contract_check CHECK (contract_type IN ('Planta', 'Contratista', 'Temporal')),
  CONSTRAINT workers_dates_check CHECK (hire_date <= termination_date)
);

CREATE INDEX idx_workers_company ON workers(company_id);
CREATE INDEX idx_workers_branch ON workers(branch_id);
CREATE INDEX idx_workers_rut ON workers(company_id, rut);
CREATE INDEX idx_workers_status ON workers(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_workers_name ON workers(first_name, last_name);
```

---

### 3.2 `worker_certifications`
**Descripción**: Certificaciones y calificaciones de trabajadores

```sql
CREATE TABLE worker_certifications (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id             UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  company_id            UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Certificación
  certification_type    VARCHAR(100) NOT NULL, -- "Operador Grúa", "Trabajo en Altura", etc.
  certification_name    VARCHAR(255) NOT NULL,
  issuing_organization  VARCHAR(255) NOT NULL,
  
  -- Fechas
  issue_date            DATE NOT NULL,
  expiry_date           DATE,
  
  -- Documento
  document_url          TEXT,
  document_number       VARCHAR(100),
  
  -- Estado
  status                VARCHAR(20) DEFAULT 'active', -- active, expired, suspended
  
  -- Auditoría
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at            TIMESTAMP,
  
  CONSTRAINT wc_status_check CHECK (status IN ('active', 'expired', 'suspended')),
  CONSTRAINT wc_dates_check CHECK (issue_date <= expiry_date)
);

CREATE INDEX idx_wc_worker ON worker_certifications(worker_id);
CREATE INDEX idx_wc_expiry ON worker_certifications(expiry_date) WHERE status = 'active';
CREATE INDEX idx_wc_type ON worker_certifications(certification_type);
```

---

## 4. CHARLAS DE SEGURIDAD

### 4.1 `safety_talks`
**Descripción**: Charlas de seguridad realizadas

```sql
CREATE TABLE safety_talks (
  -- Identificación
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id             UUID REFERENCES branches(id) ON DELETE SET NULL,
  
  -- Información de la charla
  topic                 VARCHAR(255) NOT NULL,
  description           TEXT,
  talk_date             DATE NOT NULL,
  talk_time             TIME NOT NULL,
  duration_minutes      INTEGER DEFAULT 15,
  
  -- Ubicación
  location              VARCHAR(255) NOT NULL,
  latitude              DECIMAL(10, 8),
  longitude             DECIMAL(11, 8),
  
  -- Instructor
  instructor_id         UUID NOT NULL REFERENCES users(id),
  
  -- Asistencia
  attendee_count        INTEGER DEFAULT 0,
  expected_attendees    INTEGER,
  
  -- Materiales
  materials             JSONB, -- URLs de materiales usados
  photos                JSONB, -- URLs de fotos grupales
  
  -- Estado
  status                VARCHAR(20) DEFAULT 'draft', -- draft, in_progress, completed
  
  -- Metadata legal
  legal_metadata        JSONB, -- Hash, timestamp, IP, etc.
  
  -- Auditoría
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at          TIMESTAMP,
  deleted_at            TIMESTAMP,
  
  CONSTRAINT st_status_check CHECK (status IN ('draft', 'in_progress', 'completed', 'cancelled'))
);

CREATE INDEX idx_st_company ON safety_talks(company_id);
CREATE INDEX idx_st_branch ON safety_talks(branch_id);
CREATE INDEX idx_st_date ON safety_talks(talk_date DESC);
CREATE INDEX idx_st_status ON safety_talks(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_st_instructor ON safety_talks(instructor_id);
```

---

### 4.2 `safety_talk_attendees`
**Descripción**: Asistentes a charlas de seguridad

```sql
CREATE TABLE safety_talk_attendees (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  safety_talk_id        UUID NOT NULL REFERENCES safety_talks(id) ON DELETE CASCADE,
  worker_id             UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  
  -- Asistencia
  attended              BOOLEAN DEFAULT TRUE,
  attendance_time       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Firma
  signature_id          UUID REFERENCES signatures(id),
  
  -- Auditoría
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(safety_talk_id, worker_id)
);

CREATE INDEX idx_sta_talk ON safety_talk_attendees(safety_talk_id);
CREATE INDEX idx_sta_worker ON safety_talk_attendees(worker_id);
CREATE INDEX idx_sta_attended ON safety_talk_attendees(attended);
```

---

## 5. ENTREGA DE EPP

### 5.1 `epp_items`
**Descripción**: Catálogo de items de EPP

```sql
CREATE TABLE epp_items (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información del EPP
  name                  VARCHAR(100) NOT NULL,
  description           TEXT,
  category              VARCHAR(50) NOT NULL, -- Casco, Guantes, Arnés, etc.
  sku                   VARCHAR(50) UNIQUE,
  
  -- Características
  brand                 VARCHAR(100),
  model                 VARCHAR(100),
  specifications        JSONB,
  
  -- Vida útil
  has_expiration        BOOLEAN DEFAULT FALSE,
  expiration_months     INTEGER, -- Meses de vida útil
  
  -- Estado
  is_active             BOOLEAN DEFAULT TRUE,
  
  -- Auditoría
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT epp_items_category_check CHECK (category IN ('Casco', 'Guantes', 'Arnés', 'Calzado', 'Protección Auditiva', 'Protección Visual', 'Ropa', 'Otro'))
);

CREATE INDEX idx_epp_category ON epp_items(category);
CREATE INDEX idx_epp_active ON epp_items(is_active);
```

---

### 5.2 `epp_deliveries`
**Descripción**: Entregas de EPP a trabajadores

```sql
CREATE TABLE epp_deliveries (
  -- Identificación
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id             UUID REFERENCES branches(id) ON DELETE SET NULL,
  
  -- Entrega
  delivery_date         DATE NOT NULL,
  delivery_time         TIME NOT NULL,
  delivered_by          UUID NOT NULL REFERENCES users(id),
  
  -- Receptor
  worker_id             UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  
  -- Ubicación
  location              VARCHAR(255),
  latitude              DECIMAL(10, 8),
  longitude             DECIMAL(11, 8),
  
  -- Firma
  signature_id          UUID REFERENCES signatures(id),
  
  -- Observaciones
  notes                 TEXT,
  photos                JSONB, -- URLs de fotos de la entrega
  
  -- Metadata legal
  legal_metadata        JSONB,
  
  -- Auditoría
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at            TIMESTAMP
);

CREATE INDEX idx_epp_del_company ON epp_deliveries(company_id);
CREATE INDEX idx_epp_del_branch ON epp_deliveries(branch_id);
CREATE INDEX idx_epp_del_worker ON epp_deliveries(worker_id);
CREATE INDEX idx_epp_del_date ON epp_deliveries(delivery_date DESC);
```

---

### 5.3 `epp_delivery_items`
**Descripción**: Items individuales en cada entrega

```sql
CREATE TABLE epp_delivery_items (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  epp_delivery_id       UUID NOT NULL REFERENCES epp_deliveries(id) ON DELETE CASCADE,
  epp_item_id           UUID NOT NULL REFERENCES epp_items(id),
  
  -- Cantidad
  quantity              INTEGER NOT NULL DEFAULT 1,
  
  -- Vencimiento (si aplica)
  expiration_date       DATE,
  
  -- Estado del item
  condition             VARCHAR(20) DEFAULT 'new', -- new, used, refurbished
  
  -- Auditoría
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT edi_quantity_check CHECK (quantity > 0),
  CONSTRAINT edi_condition_check CHECK (condition IN ('new', 'used', 'refurbished'))
);

CREATE INDEX idx_edi_delivery ON epp_delivery_items(epp_delivery_id);
CREATE INDEX idx_edi_item ON epp_delivery_items(epp_item_id);
CREATE INDEX idx_edi_expiration ON epp_delivery_items(expiration_date) WHERE expiration_date IS NOT NULL;
```

---

## 6. INSPECCIONES

### 6.1 `inspections`
**Descripción**: Inspecciones de seguridad realizadas

```sql
CREATE TABLE inspections (
  -- Identificación
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id             UUID REFERENCES branches(id) ON DELETE SET NULL,
  
  -- Información
  inspection_type       VARCHAR(100) NOT NULL, -- General, Andamios, Grúas, etc.
  title                 VARCHAR(255) NOT NULL,
  description           TEXT,
  
  -- Fecha y hora
  inspection_date       DATE NOT NULL,
  start_time            TIME NOT NULL,
  end_time              TIME,
  
  -- Ubicación
  area_inspected        VARCHAR(255) NOT NULL,
  location              VARCHAR(255),
  latitude              DECIMAL(10, 8) NOT NULL,
  longitude             DECIMAL(11, 8) NOT NULL,
  
  -- Inspector
  inspector_id          UUID NOT NULL REFERENCES users(id),
  
  -- Responsable del área
  area_responsible_name VARCHAR(255),
  area_responsible_signature UUID REFERENCES signatures(id),
  
  -- Resultados
  total_items           INTEGER DEFAULT 0,
  conforming_items      INTEGER DEFAULT 0,
  non_conforming_items  INTEGER DEFAULT 0,
  not_applicable_items  INTEGER DEFAULT 0,
  compliance_score      DECIMAL(5,2), -- Porcentaje de cumplimiento
  
  -- Estado
  status                VARCHAR(20) DEFAULT 'draft', -- draft, in_progress, completed, approved, rejected
  
  -- Metadata legal
  legal_metadata        JSONB,
  
  -- Auditoría
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at          TIMESTAMP,
  approved_at           TIMESTAMP,
  approved_by           UUID REFERENCES users(id),
  deleted_at            TIMESTAMP,
  
  CONSTRAINT insp_status_check CHECK (status IN ('draft', 'in_progress', 'completed', 'approved', 'rejected')),
  CONSTRAINT insp_times_check CHECK (start_time < end_time)
);

CREATE INDEX idx_insp_company ON inspections(company_id);
CREATE INDEX idx_insp_branch ON inspections(branch_id);
CREATE INDEX idx_insp_date ON inspections(inspection_date DESC);
CREATE INDEX idx_insp_type ON inspections(inspection_type);
CREATE INDEX idx_insp_status ON inspections(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_insp_inspector ON inspections(inspector_id);
CREATE INDEX idx_insp_score ON inspections(compliance_score);
```

---

### 6.2 `inspection_checklist_items`
**Descripción**: Items del checklist de cada inspección

```sql
CREATE TABLE inspection_checklist_items (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id         UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  
  -- Item
  item_number           INTEGER NOT NULL,
  item_description      TEXT NOT NULL,
  category              VARCHAR(100),
  
  -- Evaluación
  result                VARCHAR(20) NOT NULL, -- conforming, non_conforming, not_applicable
  
  -- Evidencia
  photos                JSONB, -- URLs de fotos
  observations          TEXT,
  
  -- Si es no conforme
  risk_level            VARCHAR(20), -- Bajo, Medio, Alto, Crítico
  immediate_action      TEXT, -- Acción inmediata tomada
  
  -- Auditoría
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT ici_result_check CHECK (result IN ('conforming', 'non_conforming', 'not_applicable')),
  CONSTRAINT ici_risk_check CHECK (risk_level IN ('Bajo', 'Medio', 'Alto', 'Crítico'))
);

CREATE INDEX idx_ici_inspection ON inspection_checklist_items(inspection_id);
CREATE INDEX idx_ici_result ON inspection_checklist_items(result);
CREATE INDEX idx_ici_risk ON inspection_checklist_items(risk_level) WHERE risk_level IS NOT NULL;
```

---

### 6.3 `findings`
**Descripción**: Hallazgos detectados en inspecciones (no conformidades)

```sql
CREATE TABLE findings (
  -- Identificación
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_number        VARCHAR(50) UNIQUE NOT NULL, -- HAL-2026-0123
  company_id            UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id             UUID REFERENCES branches(id) ON DELETE SET NULL,
  
  -- Origen
  inspection_id         UUID REFERENCES inspections(id) ON DELETE SET NULL,
  checklist_item_id     UUID REFERENCES inspection_checklist_items(id) ON DELETE SET NULL,
  
  -- Descripción
  title                 VARCHAR(255) NOT NULL,
  description           TEXT NOT NULL,
  category              VARCHAR(100),
  
  -- Riesgo
  risk_level            VARCHAR(20) NOT NULL, -- Bajo, Medio, Alto, Crítico
  potential_consequence TEXT,
  
  -- Evidencia
  photos                JSONB,
  location              VARCHAR(255),
  latitude              DECIMAL(10, 8),
  longitude             DECIMAL(11, 8),
  
  -- Acción correctiva
  corrective_action     TEXT NOT NULL,
  preventive_action     TEXT,
  responsible_person    VARCHAR(255),
  responsible_id        UUID REFERENCES users(id),
  due_date              DATE NOT NULL,
  
  -- Estado
  status                VARCHAR(20) DEFAULT 'open', -- open, assigned, in_progress, pending_review, closed, overdue
  
  -- Cierre
  closure_evidence      JSONB, -- Fotos de corrección
  closure_notes         TEXT,
  closed_at             TIMESTAMP,
  closed_by             UUID REFERENCES users(id),
  verified_by           UUID REFERENCES users(id),
  verified_at           TIMESTAMP,
  
  -- Auditoría
  reported_by           UUID NOT NULL REFERENCES users(id),
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at            TIMESTAMP,
  
  CONSTRAINT find_status_check CHECK (status IN ('open', 'assigned', 'in_progress', 'pending_review', 'closed', 'overdue')),
  CONSTRAINT find_risk_check CHECK (risk_level IN ('Bajo', 'Medio', 'Alto', 'Crítico'))
);

CREATE INDEX idx_find_company ON findings(company_id);
CREATE INDEX idx_find_branch ON findings(branch_id);
CREATE INDEX idx_find_inspection ON findings(inspection_id);
CREATE INDEX idx_find_status ON findings(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_find_risk ON findings(risk_level);
CREATE INDEX idx_find_due_date ON findings(due_date) WHERE status != 'closed';
CREATE INDEX idx_find_responsible ON findings(responsible_id);
CREATE INDEX idx_find_number ON findings(finding_number);
```

---

## 7. INCIDENTES Y ACCIDENTES

### 7.1 `incidents`
**Descripción**: Incidentes y accidentes laborales

```sql
CREATE TABLE incidents (
  -- Identificación
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_number       VARCHAR(50) UNIQUE NOT NULL, -- INC-2026-0123 o ACC-2026-0123
  company_id            UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id             UUID REFERENCES branches(id) ON DELETE SET NULL,
  
  -- Clasificación
  incident_type         VARCHAR(50) NOT NULL, -- incident, accident, near_miss
  severity              VARCHAR(20) NOT NULL, -- leve, grave, muy_grave, fatal
  
  -- Fecha y hora
  incident_date         DATE NOT NULL,
  incident_time         TIME NOT NULL,
  reported_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ubicación
  location              VARCHAR(255) NOT NULL,
  latitude              DECIMAL(10, 8) NOT NULL,
  longitude             DECIMAL(11, 8) NOT NULL,
  
  -- Personas involucradas
  affected_worker_id    UUID REFERENCES workers(id),
  affected_worker_name  VARCHAR(255), -- Si no está en sistema
  witness_names         TEXT[],
  
  -- Descripción
  title                 VARCHAR(255) NOT NULL,
  description           TEXT NOT NULL,
  injury_type           VARCHAR(100), -- Golpe, Caída, Corte, etc.
  body_part_affected    VARCHAR(100), -- Cabeza, Mano, Pierna, etc.
  activity_at_time      TEXT, -- Qué estaba haciendo
  
  -- Evidencia
  photos                JSONB,
  videos                JSONB,
  
  -- Causas inmediatas
  immediate_causes      TEXT[],
  
  -- Acciones inmediatas
  immediate_actions     TEXT,
  medical_attention     BOOLEAN DEFAULT FALSE,
  medical_facility      VARCHAR(255),
  
  -- Reportado por
  reported_by           UUID NOT NULL REFERENCES users(id),
  
  -- Investigación
  investigation_status  VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed
  root_causes           TEXT,
  corrective_actions    TEXT,
  preventive_actions    TEXT,
  investigated_by       UUID REFERENCES users(id),
  investigated_at       TIMESTAMP,
  
  -- Notificaciones legales
  mutual_notified       BOOLEAN DEFAULT FALSE,
  mutual_notified_at    TIMESTAMP,
  authority_notified    BOOLEAN DEFAULT FALSE,
  authority_notified_at TIMESTAMP,
  
  -- Estado
  status                VARCHAR(20) DEFAULT 'open', -- open, under_investigation, closed
  closed_at             TIMESTAMP,
  
  -- Metadata legal
  legal_metadata        JSONB,
  
  -- Auditoría
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at            TIMESTAMP,
  
  CONSTRAINT inc_type_check CHECK (incident_type IN ('incident', 'accident', 'near_miss')),
  CONSTRAINT inc_severity_check CHECK (severity IN ('leve', 'grave', 'muy_grave', 'fatal')),
  CONSTRAINT inc_status_check CHECK (status IN ('open', 'under_investigation', 'closed')),
  CONSTRAINT inc_investigation_check CHECK (investigation_status IN ('pending', 'in_progress', 'completed'))
);

CREATE INDEX idx_inc_company ON incidents(company_id);
CREATE INDEX idx_inc_branch ON incidents(branch_id);
CREATE INDEX idx_inc_date ON incidents(incident_date DESC);
CREATE INDEX idx_inc_type ON incidents(incident_type);
CREATE INDEX idx_inc_severity ON incidents(severity);
CREATE INDEX idx_inc_status ON incidents(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_inc_number ON incidents(incident_number);
CREATE INDEX idx_inc_worker ON incidents(affected_worker_id);
```

---

## 8. CAPACITACIONES

### 8.1 `trainings`
**Descripción**: Capacitaciones programadas o realizadas

```sql
CREATE TABLE trainings (
  -- Identificación
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id             UUID REFERENCES branches(id) ON DELETE SET NULL,
  
  -- Información
  title                 VARCHAR(255) NOT NULL,
  description           TEXT,
  category              VARCHAR(100), -- Inducción, Técnica, Normativa, etc.
  
  -- Modalidad
  training_type         VARCHAR(50) NOT NULL, -- presencial, online, híbrido
  
  -- Fecha y hora
  scheduled_date        DATE NOT NULL,
  start_time            TIME NOT NULL,
  end_time              TIME NOT NULL,
  duration_hours        DECIMAL(4,2),
  
  -- Lugar
  location              VARCHAR(255),
  platform_url          TEXT, -- Si es online
  latitude              DECIMAL(10, 8),
  longitude             DECIMAL(11, 8),
  
  -- Instructor
  instructor_id         UUID REFERENCES users(id),
  instructor_name       VARCHAR(255), -- Si es externo
  instructor_company    VARCHAR(255),
  
  -- Capacidad
  max_attendees         INTEGER,
  current_attendees     INTEGER DEFAULT 0,
  
  -- Materiales
  materials             JSONB, -- URLs de presentaciones, documentos
  
  -- Certificación
  issues_certificate    BOOLEAN DEFAULT FALSE,
  certificate_validity_months INTEGER,
  
  -- Estado
  status                VARCHAR(20) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  
  -- Auditoría
  created_by            UUID REFERENCES users(id),
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at          TIMESTAMP,
  deleted_at            TIMESTAMP,
  
  CONSTRAINT train_type_check CHECK (training_type IN ('presencial', 'online', 'híbrido')),
  CONSTRAINT train_status_check CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  CONSTRAINT train_times_check CHECK (start_time < end_time)
);

CREATE INDEX idx_train_company ON trainings(company_id);
CREATE INDEX idx_train_branch ON trainings(branch_id);
CREATE INDEX idx_train_date ON trainings(scheduled_date DESC);
CREATE INDEX idx_train_status ON trainings(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_train_category ON trainings(category);
```

---

### 8.2 `training_attendees`
**Descripción**: Asistentes a capacitaciones

```sql
CREATE TABLE training_attendees (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id           UUID NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
  worker_id             UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  
  -- Asistencia
  registered_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  attended              BOOLEAN DEFAULT FALSE,
  attendance_time       TIMESTAMP,
  
  -- Evaluación
  evaluation_score      DECIMAL(5,2), -- Nota 1.0 - 7.0
  approved              BOOLEAN DEFAULT FALSE,
  
  -- Firma
  signature_id          UUID REFERENCES signatures(id),
  
  -- Certificado
  certificate_issued    BOOLEAN DEFAULT FALSE,
  certificate_url       TEXT,
  certificate_number    VARCHAR(100),
  certificate_issued_at TIMESTAMP,
  certificate_expires_at DATE,
  
  -- Auditoría
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(training_id, worker_id)
);

CREATE INDEX idx_ta_training ON training_attendees(training_id);
CREATE INDEX idx_ta_worker ON training_attendees(worker_id);
CREATE INDEX idx_ta_attended ON training_attendees(attended);
CREATE INDEX idx_ta_certificate ON training_attendees(certificate_expires_at) WHERE certificate_issued = TRUE;
```

---

## 9. DOCUMENTOS

### 9.1 `documents`
**Descripción**: Documentos legales y operativos

```sql
CREATE TABLE documents (
  -- Identificación
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id            UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  branch_id             UUID REFERENCES branches(id) ON DELETE SET NULL,
  
  -- Información
  title                 VARCHAR(255) NOT NULL,
  description           TEXT,
  document_type         VARCHAR(100) NOT NULL, -- RIOHS, Reglamento, Certificado, Contrato, etc.
  category              VARCHAR(100),
  
  -- Archivo
  file_name             VARCHAR(255) NOT NULL,
  file_path             TEXT NOT NULL,
  file_size_bytes       BIGINT,
  file_type             VARCHAR(50), -- application/pdf, image/jpeg, etc.
  file_hash             VARCHAR(255), -- SHA-256
  
  -- Versión
  version               VARCHAR(20) DEFAULT '1.0',
  parent_document_id    UUID REFERENCES documents(id), -- Si es una versión
  
  -- Fechas
  issue_date            DATE,
  expiry_date           DATE,
  
  -- Clasificación
  is_confidential       BOOLEAN DEFAULT FALSE,
  tags                  TEXT[],
  
  -- Estado
  status                VARCHAR(20) DEFAULT 'active', -- active, archived, expired
  
  -- Acceso
  uploaded_by           UUID NOT NULL REFERENCES users(id),
  last_accessed_at      TIMESTAMP,
  access_count          INTEGER DEFAULT 0,
  
  -- Auditoría
  created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at            TIMESTAMP,
  
  CONSTRAINT doc_status_check CHECK (status IN ('active', 'archived', 'expired')),
  CONSTRAINT doc_dates_check CHECK (issue_date <= expiry_date)
);

CREATE INDEX idx_doc_company ON documents(company_id);
CREATE INDEX idx_doc_branch ON documents(branch_id);
CREATE INDEX idx_doc_type ON documents(document_type);
CREATE INDEX idx_doc_status ON documents(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_doc_expiry ON documents(expiry_date) WHERE status = 'active';
CREATE INDEX idx_doc_tags ON documents USING GIN(tags);
CREATE INDEX idx_doc_uploaded ON documents(uploaded_by);
```

---

### 9.2 `document_access_log`
**Descripción**: Log de accesos a documentos

```sql
CREATE TABLE document_access_log (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id       UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id),
  
  -- Acción
  action            VARCHAR(50) NOT NULL, -- view, download, share, print
  
  -- Metadata
  ip_address        INET,
  user_agent        TEXT,
  
  -- Auditoría
  accessed_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT dal_action_check CHECK (action IN ('view', 'download', 'share', 'print'))
);

CREATE INDEX idx_dal_document ON document_access_log(document_id);
CREATE INDEX idx_dal_user ON document_access_log(user_id);
CREATE INDEX idx_dal_accessed ON document_access_log(accessed_at DESC);
```

---

## 10. FIRMAS DIGITALES

### 10.1 `signatures`
**Descripción**: Firmas digitales capturadas

```sql
CREATE TABLE signatures (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Firmante
  signer_type       VARCHAR(20) NOT NULL, -- user, worker, external
  signer_id         UUID, -- ID del usuario o trabajador
  signer_name       VARCHAR(255) NOT NULL,
  signer_rut        VARCHAR(12),
  
  -- Firma
  signature_data    TEXT NOT NULL, -- Base64 de la imagen
  signature_url     TEXT, -- URL si se guarda en storage
  
  -- Metadata legal (Ley 19.799)
  timestamp         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address        INET,
  user_agent        TEXT,
  geolocation       JSONB, -- {lat, lon, accuracy}
  device_info       JSONB,
  
  -- Hash de verificación
  data_hash         VARCHAR(255), -- SHA-256 del documento firmado
  signature_hash    VARCHAR(255), -- Hash de la firma
  
  -- Contexto
  context_type      VARCHAR(50), -- safety_talk, inspection, epp_delivery, etc.
  context_id        UUID, -- ID del registro asociado
  
  -- Auditoría
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT sig_signer_check CHECK (signer_type IN ('user', 'worker', 'external'))
);

CREATE INDEX idx_sig_signer ON signatures(signer_type, signer_id);
CREATE INDEX idx_sig_context ON signatures(context_type, context_id);
CREATE INDEX idx_sig_timestamp ON signatures(timestamp DESC);
CREATE INDEX idx_sig_hash ON signatures(data_hash);
```

---

## 11. GEOLOCALIZACIÓN

### 11.1 `location_history`
**Descripción**: Historial de ubicaciones de usuarios (check-ins)

```sql
CREATE TABLE location_history (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id        UUID REFERENCES companies(id) ON DELETE SET NULL,
  branch_id         UUID REFERENCES branches(id) ON DELETE SET NULL,
  
  -- Ubicación
  latitude          DECIMAL(10, 8) NOT NULL,
  longitude         DECIMAL(11, 8) NOT NULL,
  accuracy          DECIMAL(8,2), -- Precisión en metros
  altitude          DECIMAL(8,2),
  
  -- Check-in
  check_in_type     VARCHAR(20), -- arrival, departure, auto
  confirmed         BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  activity_type     VARCHAR(50), -- inspection, talk, delivery, etc.
  activity_id       UUID, -- ID de la actividad
  
  -- Dispositivo
  device_info       JSONB,
  
  -- Auditoría
  recorded_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT lh_checkin_check CHECK (check_in_type IN ('arrival', 'departure', 'auto', 'manual'))
);

CREATE INDEX idx_lh_user ON location_history(user_id);
CREATE INDEX idx_lh_company ON location_history(company_id);
CREATE INDEX idx_lh_branch ON location_history(branch_id);
CREATE INDEX idx_lh_recorded ON location_history(recorded_at DESC);
CREATE INDEX idx_lh_location ON location_history USING GIST (
  ll_to_earth(latitude, longitude)
);
```

---

## 12. NOTIFICACIONES

### 12.1 `notifications`
**Descripción**: Notificaciones del sistema

```sql
CREATE TABLE notifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Contenido
  title             VARCHAR(255) NOT NULL,
  message           TEXT NOT NULL,
  notification_type VARCHAR(50) NOT NULL, -- info, warning, error, success
  category          VARCHAR(50), -- accident, inspection, document_expiry, etc.
  
  -- Prioridad
  priority          VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  
  -- Acción
  action_url        TEXT,
  action_label      VARCHAR(100),
  
  -- Estado
  read              BOOLEAN DEFAULT FALSE,
  read_at           TIMESTAMP,
  
  -- Metadata
  metadata          JSONB,
  
  -- Auditoría
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at        TIMESTAMP,
  
  CONSTRAINT notif_type_check CHECK (notification_type IN ('info', 'warning', 'error', 'success')),
  CONSTRAINT notif_priority_check CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_read ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX idx_notif_created ON notifications(created_at DESC);
CREATE INDEX idx_notif_priority ON notifications(priority) WHERE read = FALSE;
```

---

## 13. SINCRONIZACIÓN OFFLINE

### 13.1 `sync_queue`
**Descripción**: Cola de sincronización para datos offline

```sql
CREATE TABLE sync_queue (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Datos
  entity_type       VARCHAR(50) NOT NULL, -- safety_talk, inspection, epp_delivery, etc.
  entity_id         UUID NOT NULL,
  payload           JSONB NOT NULL,
  
  -- Prioridad
  priority          INTEGER NOT NULL DEFAULT 3, -- 1=urgent, 2=high, 3=normal, 4=low
  
  -- Estado
  status            VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  attempts          INTEGER DEFAULT 0,
  max_attempts      INTEGER DEFAULT 3,
  last_error        TEXT,
  
  -- Auditoría
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at      TIMESTAMP,
  
  CONSTRAINT sq_status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

CREATE INDEX idx_sq_user ON sync_queue(user_id);
CREATE INDEX idx_sq_status ON sync_queue(status) WHERE status IN ('pending', 'processing');
CREATE INDEX idx_sq_priority ON sync_queue(priority, created_at) WHERE status = 'pending';
CREATE INDEX idx_sq_entity ON sync_queue(entity_type, entity_id);
```

---

## 14. AUDITORÍA

### 14.1 `audit_log`
**Descripción**: Log de auditoría de todas las acciones críticas

```sql
CREATE TABLE audit_log (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Usuario
  user_id           UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email        VARCHAR(255), -- Por si se elimina el usuario
  
  -- Acción
  action            VARCHAR(100) NOT NULL, -- create, update, delete, login, export, etc.
  entity_type       VARCHAR(100) NOT NULL, -- users, companies, inspections, etc.
  entity_id         UUID,
  
  -- Contexto
  company_id        UUID REFERENCES companies(id) ON DELETE SET NULL,
  branch_id         UUID REFERENCES branches(id) ON DELETE SET NULL,
  
  -- Cambios
  old_values        JSONB,
  new_values        JSONB,
  
  -- Descripción
  description       TEXT,
  
  -- Metadata
  ip_address        INET,
  user_agent        TEXT,
  request_id        UUID,
  
  -- Auditoría
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_company ON audit_log(company_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
```

---

## 🔗 RELACIONES PRINCIPALES

### Diagrama de Relaciones Completo

```
users (1) ──────┬──────→ (N) user_company_roles (N) ──────→ (1) companies
                │                                                    │
                │                                                    │
                ├──→ (N) sessions                                   │
                ├──→ (N) safety_talks (instructor)                  │
                ├──→ (N) inspections (inspector)                    ├──→ (N) branches
                ├──→ (N) epp_deliveries (delivered_by)              │
                ├──→ (N) incidents (reported_by)                    ├──→ (N) workers
                ├──→ (N) trainings (instructor/created_by)          │
                ├──→ (N) documents (uploaded_by)                    ├──→ (N) safety_talks
                ├──→ (N) findings (reported_by)                     │
                ├──→ (N) notifications                              ├──→ (N) inspections
                ├──→ (N) location_history                           │
                └──→ (N) audit_log                                  ├──→ (N) epp_deliveries
                                                                     │
workers (1) ────┬──→ (N) worker_certifications                      ├──→ (N) incidents
                ├──→ (N) safety_talk_attendees                      │
                ├──→ (N) epp_deliveries (recipient)                 ├──→ (N) trainings
                ├──→ (N) incidents (affected)                       │
                └──→ (N) training_attendees                         └──→ (N) documents

safety_talks (1) ──→ (N) safety_talk_attendees (N) ──→ (1) workers
                 └──→ (N) signatures

inspections (1) ──→ (N) inspection_checklist_items
                └──→ (N) findings

epp_deliveries (1) ──→ (N) epp_delivery_items (N) ──→ (1) epp_items
                   └──→ (1) signatures

trainings (1) ──→ (N) training_attendees (N) ──→ (1) workers

documents (1) ──→ (1) parent_document (self-reference para versiones)
              └──→ (N) document_access_log

[TODAS LAS TABLAS] ──→ audit_log (registro de cambios)
```

---

## 🚀 ÍNDICES Y OPTIMIZACIÓN

### Índices Compuestos Adicionales

```sql
-- Búsqueda rápida de charlas por empresa y fecha
CREATE INDEX idx_st_company_date ON safety_talks(company_id, talk_date DESC)
WHERE deleted_at IS NULL;

-- Búsqueda de inspecciones con hallazgos críticos
CREATE INDEX idx_insp_critical ON inspections(company_id, compliance_score)
WHERE compliance_score < 70 AND deleted_at IS NULL;

-- Hallazgos vencidos por empresa
CREATE INDEX idx_find_overdue ON findings(company_id, due_date, status)
WHERE status NOT IN ('closed') AND deleted_at IS NULL;

-- Trabajadores activos por empresa
CREATE INDEX idx_workers_active_company ON workers(company_id, status)
WHERE status = 'active' AND deleted_at IS NULL;

-- Certificaciones por vencer
CREATE INDEX idx_wc_expiring ON worker_certifications(expiry_date, status)
WHERE status = 'active' AND expiry_date > CURRENT_DATE
AND expiry_date < (CURRENT_DATE + INTERVAL '30 days');

-- Documentos por vencer
CREATE INDEX idx_doc_expiring ON documents(company_id, expiry_date)
WHERE status = 'active' AND expiry_date IS NOT NULL
AND expiry_date < (CURRENT_DATE + INTERVAL '30 days');

-- EPP entregados a trabajador
CREATE INDEX idx_epp_worker_date ON epp_deliveries(worker_id, delivery_date DESC)
WHERE deleted_at IS NULL;

-- Incidentes graves por fecha
CREATE INDEX idx_inc_severe ON incidents(company_id, incident_date DESC, severity)
WHERE severity IN ('grave', 'muy_grave', 'fatal') AND deleted_at IS NULL;

-- Notificaciones no leídas con prioridad
CREATE INDEX idx_notif_unread_priority ON notifications(user_id, priority, created_at DESC)
WHERE read = FALSE;

-- Cola de sincronización pendiente
CREATE INDEX idx_sq_pending_priority ON sync_queue(user_id, priority, created_at)
WHERE status IN ('pending', 'processing');
```

### Índices Full-Text Search

```sql
-- Búsqueda de texto completo en inspecciones
CREATE INDEX idx_insp_fulltext ON inspections USING GIN(
  to_tsvector('spanish', title || ' ' || COALESCE(description, ''))
);

-- Búsqueda en documentos
CREATE INDEX idx_doc_fulltext ON documents USING GIN(
  to_tsvector('spanish', title || ' ' || COALESCE(description, ''))
);

-- Búsqueda en trabajadores
CREATE INDEX idx_workers_fulltext ON workers USING GIN(
  to_tsvector('spanish', first_name || ' ' || last_name || ' ' || position)
);
```

---

## ⚙️ TRIGGERS Y PROCEDIMIENTOS

### Trigger: Actualizar `updated_at` automáticamente

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar a todas las tablas relevantes
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON workers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_safety_talks_updated_at BEFORE UPDATE ON safety_talks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON inspections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_findings_updated_at BEFORE UPDATE ON findings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trainings_updated_at BEFORE UPDATE ON trainings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Trigger: Auditoría automática de cambios críticos

```sql
CREATE OR REPLACE FUNCTION audit_critical_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    user_id,
    action,
    entity_type,
    entity_id,
    company_id,
    old_values,
    new_values,
    ip_address
  ) VALUES (
    CURRENT_SETTING('app.current_user_id', TRUE)::UUID,
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    COALESCE(NEW.company_id, OLD.company_id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
    inet_client_addr()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar a tablas críticas
CREATE TRIGGER audit_safety_talks AFTER INSERT OR UPDATE OR DELETE ON safety_talks
  FOR EACH ROW EXECUTE FUNCTION audit_critical_changes();

CREATE TRIGGER audit_inspections AFTER INSERT OR UPDATE OR DELETE ON inspections
  FOR EACH ROW EXECUTE FUNCTION audit_critical_changes();

CREATE TRIGGER audit_incidents AFTER INSERT OR UPDATE OR DELETE ON incidents
  FOR EACH ROW EXECUTE FUNCTION audit_critical_changes();
```

### Función: Calcular score de inspección

```sql
CREATE OR REPLACE FUNCTION calculate_inspection_score(p_inspection_id UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  v_total INTEGER;
  v_conforming INTEGER;
  v_score DECIMAL(5,2);
BEGIN
  SELECT 
    COUNT(*) FILTER (WHERE result IN ('conforming', 'non_conforming')),
    COUNT(*) FILTER (WHERE result = 'conforming')
  INTO v_total, v_conforming
  FROM inspection_checklist_items
  WHERE inspection_id = p_inspection_id;
  
  IF v_total = 0 THEN
    RETURN 0;
  END IF;
  
  v_score := (v_conforming::DECIMAL / v_total::DECIMAL) * 100;
  
  UPDATE inspections
  SET 
    total_items = v_total,
    conforming_items = v_conforming,
    non_conforming_items = v_total - v_conforming,
    compliance_score = v_score
  WHERE id = p_inspection_id;
  
  RETURN v_score;
END;
$$ LANGUAGE plpgsql;
```

### Función: Marcar hallazgos vencidos

```sql
CREATE OR REPLACE FUNCTION mark_overdue_findings()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE findings
  SET status = 'overdue'
  WHERE status NOT IN ('closed', 'overdue')
    AND due_date < CURRENT_DATE
    AND deleted_at IS NULL;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Ejecutar diariamente con cron job
```

---

## 💾 ESTRATEGIA DE BACKUP

### Backup Incremental

```sql
-- Full backup diario (retención 30 días)
pg_dump -Fc safetrack_db > backup_$(date +%Y%m%d).dump

-- WAL archiving para point-in-time recovery
archive_mode = on
archive_command = 'cp %p /backup/wal/%f'
```

### Réplicas

```
Primary DB (RW) ──────┐
                      │
                      ├──→ Replica 1 (RO) - Queries de reportes
                      │
                      ├──→ Replica 2 (RO) - Queries de dashboard
                      │
                      └──→ Replica 3 (RO) - Disaster Recovery
```

---

**Última actualización**: 27 de Enero, 2026  
**Versión**: 1.0.0  
**Autor**: SafeTrack Chile - Database Team  
**Total de Tablas**: 31 tablas  
**Total de Índices**: ~150 índices
