# 🛡️ SafeTrack Chile - MVP

> Super-app SaaS para ingenieros en prevención de riesgos. Gestión multi-empresa bajo normativa chilena con diseño mobile-first.

[![Version](https://img.shields.io/badge/version-1.0.0--mvp-blue.svg)](https://github.com/safetrack-chile/mvp)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-20.x-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/react-18.x-61dafb.svg)](https://reactjs.org)

---

## 🎯 Visión del MVP

Lanzar en **5 meses** con **3 desarrolladores** un sistema que:

1. ✅ **Elimina el papel** en una obra completa
2. ✅ **Cumple la ley** chilena (Ley 19.799, DS 594, Ley 16.744)
3. ✅ **Genera ingresos** desde día 1 (modelo SaaS)
4. ✅ **Diferenciador único**: Billing integrado para prevencionistas independientes
5. ✅ **Escalable** a 1000+ usuarios sin reescribir

---

## 🚀 Quick Start

### Prerrequisitos

- Node.js 20+ LTS
- npm 10+
- SQL Server 2022 (local) o Azure SQL Database
- Git

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/safetrack-chile/mvp.git
cd mvp

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Generar Prisma Client
npx prisma generate

# Correr migraciones
npx prisma migrate dev

# Seed de datos demo
npx prisma db seed

# Iniciar desarrollo
npm run dev
```

La aplicación estará disponible en:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555 (ejecutar `npx prisma studio`)

---

## 📊 Estado del Proyecto

### Fase Actual: **0.5 - Shadow Launch** (Mes 1)

| Fase | Estado | Fecha Objetivo | Progreso |
|------|--------|----------------|----------|
| **0.5** Shadow Launch | 🟡 En Progreso | Feb 2026 | ████████░░ 80% |
| **1.0** Core Compliance | ⏳ Pendiente | Abr 2026 | ░░░░░░░░░░ 0% |
| **1.5** Consultant Growth | ⏳ Pendiente | May 2026 | ░░░░░░░░░░ 0% |
| **2.0** Predictive Safety | ⏳ Pendiente | Jun 2026 | ░░░░░░░░░░ 0% |

### Módulos Implementados

- ✅ Autenticación JWT
- ✅ Selector de empresa/sucursal
- ✅ Sistema de filtrado por contexto
- ⏳ Charlas de seguridad (80%)
- ⏳ Firma digital (60%)
- ⏳ Offline storage (40%)
- ⏳ Sincronización (20%)

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                         │
│   React 18 + TypeScript + Vite + Tailwind v4      │
│   IndexedDB (Offline) + Zustand (State)            │
└──────────────────┬──────────────────────────────────┘
                   │ REST API (JSON)
                   ▼
┌─────────────────────────────────────────────────────┐
│                    BACKEND                          │
│   Node.js + Express + TypeScript                   │
│   Prisma ORM + JWT Auth                            │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│              AZURE SQL DATABASE                     │
│   SQL Server 2022 + Row-Level Security             │
│   24 tablas (implementación incremental)           │
└─────────────────────────────────────────────────────┘
```

---

## 📂 Estructura del Proyecto

```
safetrack-mvp/
├── 📁 .github/              # GitHub Actions (CI/CD)
├── 📁 docs/                 # Documentación técnica
│   ├── README.md
│   ├── MVP_ROADMAP_5_MESES.md
│   ├── MODELO_BD_SQLSERVER.md
│   ├── HISTORIAS_USUARIO.md
│   └── FLUJOS_APLICACION.md
├── 📁 prisma/               # ORM y migraciones
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── 📁 server/               # Backend (Node.js)
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── index.ts
│   └── tests/
├── 📁 src/                  # Frontend (React)
│   ├── app/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── App.tsx
│   ├── styles/
│   └── main.tsx
├── 📄 .env.example          # Variables de entorno
├── 📄 MVP_CONFIG.md         # Configuración del MVP
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 vite.config.ts
└── 📄 README.md             # Este archivo
```

---

## 🎯 Roadmap de 5 Meses

### **Fase 0.5**: Shadow Launch (Mes 1) 🟡
**Objetivo**: Primera firma digital legalmente válida en obra

**Entregables**:
- ✅ 8 tablas SQL Server
- ✅ Autenticación JWT
- ✅ Selector empresa/sucursal
- ⏳ Módulo Charlas completo
- ⏳ Firma digital (Ley 19.799)
- ⏳ Offline con IndexedDB
- ⏳ Primera obra piloto

**Métricas**: 1 obra piloto, 10 firmas digitales, < 5 min por charla

---

### **Fase 1.0**: Core Compliance (Meses 2-3) ⏳
**Objetivo**: Reportabilidad a mutual + papel cero

**Entregables**:
- Inspecciones con checklist
- Entrega de EPP
- Botón de accidentes (FAB rojo)
- Permisos de Trabajo de Alto Riesgo
- Ciclo de cierre con verificación
- Score de Riesgo Dinámico

**Métricas**: 1 sucursal sin papel, mutual acepta docs, 5 prevencionistas activos

---

### **Fase 1.5**: Consultant Growth (Mes 4) ⏳
**Objetivo**: Facturación integrada para freelance

**Entregables**:
- Registro de horas (manual/auto GPS)
- Generación de boletas
- Mi Cartera Profesional
- Exportación Excel/PDF
- Envío por email

**Métricas**: 10 freelance registrados, primera boleta generada

---

### **Fase 2.0**: Predictive Safety (Mes 5) ⏳
**Objetivo**: Predicción de riesgos con ML

**Entregables**:
- Dashboard predictivo (70% precisión)
- OCR de cédulas (Azure Computer Vision)
- Mapa de calor de riesgo
- Gestión documental avanzada
- Alertas proactivas

**Métricas**: 70% precisión predictiva, 95% accuracy OCR

---

## 🛠️ Scripts Disponibles

### Desarrollo

```bash
# Frontend dev server
npm run dev

# Backend dev server
npm run server:dev

# Ambos en paralelo
npm run dev:full

# Prisma Studio (DB GUI)
npx prisma studio
```

### Base de Datos

```bash
# Generar Prisma Client
npx prisma generate

# Crear migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones
npx prisma migrate deploy

# Reset BD (⚠️ borra datos)
npx prisma migrate reset

# Seed de datos demo
npx prisma db seed
```

### Testing

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

### Build & Deploy

```bash
# Build frontend
npm run build

# Build backend
npm run build:server

# Preview build
npm run preview

# Lint
npm run lint

# Type check
npm run type-check
```

---

## 📚 Documentación

### Documentación Técnica Completa

Toda la documentación se encuentra en la carpeta `/docs`:

- **[MVP Roadmap](./docs/MVP_ROADMAP_5_MESES.md)**: Plan de 5 meses detallado
- **[Modelo de BD](./docs/MODELO_BD_SQLSERVER.md)**: 24 tablas SQL Server
- **[Historias de Usuario](./docs/HISTORIAS_USUARIO.md)**: 45 HU priorizadas
- **[Flujos de Usuario](./docs/FLUJOS_APLICACION.md)**: 9 flujos con diagramas
- **[Sistema de Filtrado](./FILTRADO_EMPRESAS_RESUMEN.md)**: Aislamiento de datos

### Configuración

- **[MVP Config](./MVP_CONFIG.md)**: Configuración detallada del proyecto
- **[.env.example](./.env.example)**: Variables de entorno

---

## 🔐 Seguridad

### Cumplimiento Legal

- ✅ **Ley 19.799**: Firma electrónica con timestamp legal + hash SHA-256
- ✅ **DS 594**: Ciclo de cierre con verificación de eficacia
- ✅ **Ley 16.744**: Notificación a mutual en 24hrs
- ✅ **GDPR Ready**: Soft delete, auditoría completa

### Medidas de Seguridad

```yaml
Encriptación en Tránsito: TLS 1.3
Encriptación en Reposo: AES-256 (Azure TDE)
Passwords: bcrypt (10 rounds)
Tokens: JWT (HS256)
Firmas Digitales: SHA-256 hash
Row-Level Security: Habilitado (SQL Server)
```

---

## 👥 Equipo

| Rol | Responsabilidad | Estado |
|-----|----------------|--------|
| **Fullstack Lead** | Backend + SQL Server + DevOps | ✅ Activo |
| **Frontend Dev** | React + PWA + Offline | ✅ Activo |
| **PO/Designer/QA** | Product + UX + Testing | ✅ Activo |

---

## 🎯 Métricas de Éxito

### Técnicas (Mes 5)

- ⏱️ Page load: < 3s (3G)
- 📱 Offline: 48hrs sin sincronizar
- 🔒 Data loss: 0%
- ✅ Uptime: 99%
- 🐛 Critical bugs: < 5

### Negocio (Mes 5)

- 👥 Usuarios activos: 20
- 📋 Charlas/mes: 100+
- 💰 MRR: $1M CLP
- 📈 Retención: 80%
- ⭐ NPS: > 50

### Impacto (Mes 5)

- ⏱️ Tiempo de registro: -60%
- 📉 Incidentes: -40%
- ✅ Cumplimiento: 95%+
- 🏥 Mutual: 100% aceptación

---

## 🚨 Resolución de Problemas

### Error: No se puede conectar a la BD

```bash
# Verificar que SQL Server esté corriendo
# Verificar credenciales en .env.local
# Verificar firewall de Azure SQL (si aplica)
```

### Error: Prisma no genera el cliente

```bash
# Limpiar y regenerar
npx prisma generate --force
```

### Error: Offline no funciona

```bash
# Verificar que el Service Worker esté registrado
# Verificar que IndexedDB no esté lleno
# Limpiar cache del navegador
```

---

## 📞 Soporte

### Para el Equipo de Desarrollo

- 💬 **Slack**: #safetrack-dev
- 📧 **Email**: dev@safetrack.cl
- 📚 **Wiki**: https://wiki.safetrack.cl
- 🐛 **Issues**: https://github.com/safetrack-chile/mvp/issues

### Para Stakeholders

- 📧 **Email**: stakeholders@safetrack.cl
- 📅 **Demo Semanal**: Viernes 15:00 CLT
- 📊 **Dashboard**: https://dashboard.safetrack.cl

---

## 📜 Licencia

Copyright © 2026 SafeTrack Chile SpA. Todos los derechos reservados.

Este software es propietario y confidencial. No se permite la distribución, modificación o uso sin autorización expresa por escrito.

---

## 🎉 Agradecimientos

- **Prevencionistas piloto** por su feedback invaluable
- **Equipo de desarrollo** por su dedicación
- **Asesores legales** por validación de cumplimiento
- **Mutual de Seguridad** por su colaboración

---

## 🔄 Changelog

### [1.0.0-mvp] - 2026-01-27

**Agregado**
- Sistema de autenticación JWT completo
- Selector de empresa/sucursal con filtrado
- Contexto global de empresa (CompanyContext)
- Hooks de filtrado de datos (useFilteredData)
- Componentes de indicador de contexto
- Sistema de firma digital básico
- Documentación técnica completa (5 meses)
- Modelo de BD SQL Server (24 tablas)
- Configuración de ambiente (.env.example)

**En Progreso**
- Módulo de Charlas de Seguridad (80%)
- Offline storage con IndexedDB (40%)
- Sincronización inteligente (20%)

---

## 📈 Roadmap Público

- **Q1 2026**: MVP completo (5 meses)
- **Q2 2026**: 50 usuarios activos
- **Q3 2026**: Integración con ClaveÚnica
- **Q4 2026**: 200+ usuarios, expansión regional

---

**Última actualización**: 27 de Enero, 2026  
**Versión**: 1.0.0-mvp  
**Mantenido por**: SafeTrack Chile - Tech Team

🛡️ **SafeTrack Chile** - Prevención de Riesgos Profesional
