# ⚙️ Configuración del MVP - SafeTrack Chile

## 📊 Información del Proyecto

**Versión**: 1.0.0-MVP  
**Fecha de Inicio**: 27 de Enero, 2026  
**Duración Estimada**: 5 meses  
**Equipo**: 3 personas (Squad de Guerrilla)  
**Base de Datos**: SQL Server 2022 (Azure SQL Database)

---

## 👥 Equipo

### Roles Definidos

```typescript
const TEAM = {
  fullstackLead: {
    name: "Tech Lead",
    responsibilities: [
      "Backend (Node.js + Express)",
      "SQL Server + Prisma ORM",
      "API REST",
      "Autenticación JWT",
      "Lógica de negocio",
      "DevOps (Azure)",
    ],
    dedication: "100%"
  },
  
  frontendDev: {
    name: "Frontend/Mobile Developer", 
    responsibilities: [
      "React + TypeScript",
      "PWA + Vite",
      "IndexedDB (offline)",
      "UI/UX implementation",
      "Firma digital (canvas)",
      "Tailwind CSS v4",
    ],
    dedication: "100%"
  },
  
  productOwner: {
    name: "PO/Designer/QA",
    responsibilities: [
      "Product definition",
      "Diseño UI/UX (Figma)",
      "User testing",
      "QA manual",
      "Stakeholder management",
      "Documentación de usuario",
    ],
    dedication: "100%"
  }
};
```

---

## 🎯 Fases de Implementación

### Fase 0.5: Shadow Launch (Mes 1)

**Objetivo**: Primera firma digital legalmente válida en obra

**Tablas SQL Server** (8):
```sql
users
sessions
companies
branches
user_company_roles
workers
safety_talks
signatures
```

**Módulos**:
- ✅ Autenticación (JWT)
- ✅ Selector de empresa/sucursal
- ✅ Charlas de seguridad
- ✅ Firma digital
- ✅ Offline storage (IndexedDB)
- ✅ Sincronización básica

**Entregable**: App funcional en 1 obra piloto con primeras firmas digitales

---

### Fase 1.0: Core Compliance (Meses 2-3)

**Objetivo**: Reportabilidad a mutual + papel cero en 1 sucursal

**Tablas Adicionales** (+10):
```sql
inspections
inspection_checklist_items
findings
action_plans              -- ⭐ NUEVA
finding_action_plan       -- ⭐ NUEVA
work_permits              -- ⭐ NUEVA
epp_items
epp_deliveries
epp_delivery_items
incidents
```

**Módulos**:
- ✅ Inspecciones con checklist
- ✅ Entrega de EPP
- ✅ Accidentes (Botón FAB rojo)
- ✅ Permisos de Trabajo de Alto Riesgo
- ✅ Hallazgos con ciclo de cierre
- ✅ Score de Riesgo Dinámico

**Entregable**: Sucursal piloto 100% sin papel

---

### Fase 1.5: Consultant Growth (Mes 4)

**Objetivo**: Prevencionista independiente cobra sus honorarios usando la app

**Tablas Adicionales** (+3):
```sql
consultancy_hours         -- ⭐ NUEVA
invoices                  -- ⭐ NUEVA
invoice_line_items        -- ⭐ NUEVA
```

**Módulos**:
- ✅ Registro de horas (manual/automático)
- ✅ Mi Cartera Profesional
- ✅ Generación de boletas
- ✅ Exportación Excel/PDF
- ✅ Envío por email

**Entregable**: Primera boleta generada desde la app

---

### Fase 2.0: Predictive Safety (Mes 5)

**Objetivo**: Predicción de riesgos + OCR inteligente

**Tablas Adicionales** (+3):
```sql
documents
document_access_log
risk_predictions          -- ⭐ NUEVA
```

**Módulos**:
- ✅ Dashboard predictivo (ML básico)
- ✅ OCR de documentos (Azure Computer Vision)
- ✅ Gestión documental avanzada
- ✅ Mapa de calor de riesgo
- ✅ Alertas proactivas

**Entregable**: Dashboard predictivo con 70% de precisión

---

## 🗄️ Configuración de Base de Datos

### Azure SQL Database

```yaml
Tier: Standard S2
vCores: 2
RAM: 8 GB
Storage: 250 GB
IOPS: 500
Backups: Automáticos (35 días retención)
Geo-Replication: Chile Sur (HA)
TDE: Enabled
Row-Level Security: Enabled
```

### Connection String (Development)

```
Server=tcp:safetrack-dev.database.windows.net,1433;
Initial Catalog=safetrack_mvp;
Persist Security Info=False;
User ID=safetrack_admin;
Password=***;
MultipleActiveResultSets=False;
Encrypt=True;
TrustServerCertificate=False;
Connection Timeout=30;
```

---

## 🔧 Stack Tecnológico

### Backend

```json
{
  "runtime": "Node.js 20 LTS",
  "framework": "Express.js",
  "language": "TypeScript 5.x",
  "database": "SQL Server 2022",
  "orm": "Prisma 5.x",
  "auth": "jsonwebtoken + bcryptjs",
  "validation": "zod",
  "logging": "winston",
  "testing": "jest + supertest",
  "fileStorage": "Azure Blob Storage",
  "email": "SendGrid",
  "ocr": "Azure Computer Vision API (Fase 2.0)",
  "pdf": "puppeteer"
}
```

### Frontend

```json
{
  "framework": "React 18",
  "buildTool": "Vite 5",
  "language": "TypeScript 5.x",
  "styling": "Tailwind CSS v4",
  "stateManagement": "Zustand + TanStack Query",
  "routing": "React Router v6",
  "forms": "React Hook Form + Zod",
  "offline": "IndexedDB (Dexie.js)",
  "signature": "react-signature-canvas",
  "charts": "Recharts",
  "icons": "Lucide React",
  "maps": "Google Maps API",
  "pwa": "Vite PWA Plugin"
}
```

### DevOps

```yaml
Version Control: Git + GitHub
CI/CD: GitHub Actions
Hosting Frontend: Azure Static Web Apps
Hosting Backend: Azure App Service (Linux)
Database: Azure SQL Database
Storage: Azure Blob Storage
Monitoring: Azure Application Insights
Error Tracking: Sentry
Secrets: Azure Key Vault
```

---

## 📱 Estrategia Offline

### Módulos Offline (IndexedDB)

```typescript
const OFFLINE_MODULES = {
  // ✅ Críticos (funcionan sin internet)
  safetyTalks: {
    enabled: true,
    syncPriority: 3,
    maxStorageDays: 7,
  },
  
  inspections: {
    enabled: true,
    syncPriority: 2,
    maxStorageDays: 7,
  },
  
  incidents: {
    enabled: true,
    syncPriority: 1, // Máxima prioridad
    maxStorageDays: 30,
  },
  
  eppDeliveries: {
    enabled: true,
    syncPriority: 3,
    maxStorageDays: 7,
  },
  
  workPermits: {
    enabled: true,
    syncPriority: 2,
    maxStorageDays: 7,
  }
};
```

### Módulos Online-Only

```typescript
const ONLINE_ONLY_MODULES = [
  'dashboard',           // Requiere datos en tiempo real
  'documents',           // Archivos pesados
  'billing',             // Transaccional
  'reports',             // Agregaciones complejas
  'predictive',          // ML en servidor
  'settings',            // Configuración global
  'userManagement',      // Administración
];
```

---

## 🔐 Seguridad

### Autenticación

```typescript
const AUTH_CONFIG = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiration: '15m',
  refreshTokenExpiration: '7d',
  bcryptRounds: 10,
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutos
};
```

### Encriptación

```yaml
En Tránsito: TLS 1.3
En Reposo: AES-256 (Azure TDE)
Passwords: bcrypt (10 rounds)
Tokens: JWT (HS256)
Firmas: SHA-256 hash
```

### Row-Level Security (SQL Server)

```sql
-- Aplicado a todas las tablas con company_id
CREATE SECURITY POLICY CompanySecurityPolicy
ADD FILTER PREDICATE dbo.fn_security_predicate_company(company_id)
ON safety_talks,
ADD BLOCK PREDICATE dbo.fn_security_predicate_company(company_id)
ON safety_talks AFTER INSERT;
```

---

## 📊 Métricas de Éxito

### Técnicas

```typescript
const TECHNICAL_METRICS = {
  pageLoadTime: { target: '< 3s', current: null },
  offlineDuration: { target: '48hrs', current: null },
  dataLoss: { target: '0%', current: null },
  uptime: { target: '99%', current: null },
  criticalBugs: { target: '< 5', current: null },
};
```

### Negocio

```typescript
const BUSINESS_METRICS = {
  activeUsers: { target: 20, current: 0 },
  monthlyTalks: { target: 100, current: 0 },
  mrr: { target: 1000000, current: 0 }, // CLP
  retention: { target: 0.80, current: 0 },
  nps: { target: 50, current: 0 },
};
```

### Impacto

```typescript
const IMPACT_METRICS = {
  timeReduction: { target: '-60%', current: null },
  incidentReduction: { target: '-40%', current: null },
  compliance: { target: '95%', current: null },
  mutualAcceptance: { target: '100%', current: null },
};
```

---

## 🚀 Comandos de Desarrollo

### Setup Inicial

```bash
# Clonar repositorio
git clone https://github.com/safetrack-chile/mvp.git
cd mvp

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Generar Prisma Client
npx prisma generate

# Correr migraciones
npx prisma migrate dev

# Seed de datos iniciales
npx prisma db seed
```

### Desarrollo

```bash
# Frontend (dev server)
npm run dev

# Backend (dev server)
npm run server:dev

# Ambos en paralelo
npm run dev:full

# Prisma Studio (DB GUI)
npx prisma studio
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Build & Deploy

```bash
# Build frontend
npm run build

# Build backend
npm run build:server

# Deploy a Azure (automático via GitHub Actions)
git push origin main
```

---

## 📂 Estructura del Proyecto

```
safetrack-mvp/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── docs/                           # Documentación
│   ├── README.md
│   ├── MVP_ROADMAP_5_MESES.md
│   ├── MODELO_BD_SQLSERVER.md
│   └── ...
├── prisma/                         # ORM
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── server/                         # Backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── index.ts
│   └── tests/
├── src/                            # Frontend
│   ├── app/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── data/
│   │   └── App.tsx
│   ├── imports/
│   ├── styles/
│   └── main.tsx
├── .env.example
├── .env.local
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── MVP_CONFIG.md                   # Este archivo
```

---

## 🎯 Prioridades por Sprint

### Sprint 1-2 (Semanas 1-4) - Fase 0.5

```yaml
P0:
  - Setup de proyecto (Backend + Frontend)
  - Base de datos (8 tablas)
  - Autenticación JWT
  - Selector de empresa
  - Módulo Charlas básico
  - Firma digital
  
Entregable: Demo funcional con 1 charla firmada
```

### Sprint 3-6 (Semanas 5-12) - Fase 1.0

```yaml
P0:
  - Inspecciones completas
  - EPP delivery
  - Botón de accidentes
  - Permisos de trabajo
  - Ciclo de cierre
  - Score de riesgo
  
Entregable: Obra sin papel + mutual acepta docs
```

### Sprint 7-8 (Semanas 13-16) - Fase 1.5

```yaml
P1:
  - Registro de horas
  - Billing
  - Mi Cartera
  - Exportación PDF/Excel
  
Entregable: Primera boleta generada
```

### Sprint 9-10 (Semanas 17-20) - Fase 2.0

```yaml
P1:
  - Dashboard predictivo
  - OCR de cédulas
  - Documentos avanzados
  - Alertas proactivas
  
Entregable: MVP completo en producción
```

---

## 📞 Contactos del Proyecto

```yaml
Tech Lead: 
  Email: tech@safetrack.cl
  Slack: @tech-lead
  
Frontend Dev:
  Email: frontend@safetrack.cl
  Slack: @frontend-dev
  
Product Owner:
  Email: po@safetrack.cl
  Slack: @product-owner
  
Stakeholders:
  Email: stakeholders@safetrack.cl
```

---

## 🐛 Proceso de Reporte de Bugs

```markdown
1. Crear issue en GitHub con template
2. Etiquetar prioridad (P0, P1, P2, P3)
3. Asignar a persona responsable
4. Reproducir en dev/staging
5. Fix + PR + Review
6. Test + Deploy
7. Cerrar issue
```

---

## 📈 KPIs de Desarrollo

```typescript
const DEV_KPIs = {
  velocity: { target: 25, unit: 'puntos/sprint' },
  codeReview: { target: '< 24hrs', unit: 'tiempo' },
  bugFixTime: { target: '< 48hrs', unit: 'tiempo' },
  testCoverage: { target: '> 80%', unit: 'porcentaje' },
  buildTime: { target: '< 5min', unit: 'tiempo' },
};
```

---

**Última actualización**: 27 de Enero, 2026  
**Versión**: 1.0.0  
**Mantenido por**: SafeTrack Chile - Tech Team  
**Próxima revisión**: Cada fin de sprint
