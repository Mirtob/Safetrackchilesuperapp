# 🔌 SafeTrack Chile - Guía de Integración Backend

## 📋 Índice
1. [Arquitectura de Integración](#arquitectura)
2. [Endpoints Necesarios](#endpoints)
3. [Modelos de Datos](#modelos)
4. [Autenticación y Seguridad](#seguridad)
5. [Sincronización Offline](#offline)
6. [WebSockets en Tiempo Real](#websockets)
7. [Metadatos Legales](#metadatos)
8. [Código de Ejemplo](#ejemplos)

---

## 🏗️ Arquitectura de Integración

### Stack Recomendado:
```
Frontend (Actual):
├── React 18+
├── TypeScript
├── Tailwind CSS
├── IndexedDB (offline storage)
└── Service Worker (background sync)

Backend (Recomendado):
├── Node.js + Express / NestJS
├── PostgreSQL (datos relacionales)
├── Redis (cache + sessions)
├── MinIO / S3 (archivos)
└── WebSocket (Socket.io)
```

### Flujo de Autenticación:
```
1. Login → POST /api/auth/login
2. JWT Token → Store en localStorage
3. Refresh Token → httpOnly cookie
4. Auto-refresh → Interceptor Axios
```

---

## 🔗 Endpoints Necesarios

### 1. Autenticación

#### POST `/api/auth/login`
```typescript
Request:
{
  email: string;
  password: string;
  deviceId: string;
}

Response:
{
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'prevencionista' | 'gerente' | 'admin';
    companies: Array<{
      id: string;
      name: string;
      rut: string;
    }>;
  };
}
```

#### POST `/api/auth/refresh`
```typescript
Request:
{
  refreshToken: string;
}

Response:
{
  token: string;
}
```

#### POST `/api/auth/logout`
```typescript
Request:
{
  token: string;
}

Response:
{
  success: boolean;
}
```

---

### 2. Empresas

#### GET `/api/companies`
```typescript
Response:
{
  companies: Array<{
    id: string;
    name: string;
    rut: string;
    address: string;
    mutualidad: 'IST' | 'ACHS' | 'Mutual';
    logo?: string;
    stats: {
      workers: number;
      assets: number;
      pendingTasks: number;
    };
  }>;
}
```

#### POST `/api/companies/{id}/select`
```typescript
Request:
{
  companyId: string;
  userId: string;
}

Response:
{
  sessionId: string;
  permissions: string[];
  pendingItems: number;
}
```

---

### 3. Documentos y Sincronización

#### GET `/api/documents/pending`
```typescript
Query Params:
- companyId: string
- userId: string
- limit?: number
- offset?: number

Response:
{
  total: number;
  documents: Array<{
    id: string;
    type: 'accident' | 'inspection' | 'talk' | 'epp' | 'document';
    title: string;
    timestamp: string; // ISO 8601
    priority: 'critical' | 'high' | 'medium' | 'low';
    size: number; // bytes
    status: 'pending' | 'syncing' | 'synced' | 'error';
  }>;
}
```

#### POST `/api/documents/sync`
```typescript
Request:
{
  companyId: string;
  userId: string;
  documents: Array<{
    tempId: string; // ID temporal del cliente
    type: 'accident' | 'inspection' | 'talk' | 'epp';
    title: string;
    timestamp: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    data: any; // Form data específico
    metadata: {
      gpsCoordinates?: {
        latitude: number;
        longitude: number;
        accuracy: number;
        timestamp: string;
      };
      deviceInfo: {
        id: string;
        userAgent: string;
        platform: string;
      };
      ipAddress?: string;
      signatures?: Array<{
        id: string;
        workerId: string;
        type: 'attendance' | 'receipt' | 'acknowledgment';
        signature: string; // Base64
        timestamp: string;
        hash: string; // SHA-256
      }>;
      photos?: Array<{
        id: string;
        url: string;
        thumbnail: string;
        timestamp: string;
        gps?: { lat: number; lng: number };
      }>;
    };
  }>;
}

Response:
{
  synced: number;
  failed: number;
  results: Array<{
    tempId: string;
    serverId?: string; // ID asignado por servidor
    status: 'success' | 'error';
    error?: string;
  }>;
}
```

#### GET `/api/documents/{id}`
```typescript
Response:
{
  id: string;
  type: string;
  title: string;
  data: any;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  pdfUrl?: string;
}
```

---

### 4. Accidentes Laborales

#### POST `/api/accidents/report`
```typescript
Request:
{
  companyId: string;
  workerId: string;
  sectorId: string;
  timestamp: string;
  description: string;
  severity: 'leve' | 'grave' | 'fatal';
  bodyPart: string;
  causeType: string;
  witnesses: Array<{
    workerId: string;
    statement: string;
    signature: string;
  }>;
  evidence: Array<{
    type: 'photo' | 'video';
    url: string;
    timestamp: string;
  }>;
  emergencyActions: string[];
  reporterSignature: {
    signature: string;
    timestamp: string;
    hash: string;
  };
  notifications: {
    sendToManagement: boolean;
    sendToHR: boolean;
    sendToIT: boolean; // Para revisión de cámaras
  };
  metadata: LegalMetadata;
}

Response:
{
  accidentId: string;
  reportNumber: string;
  pdfUrl: string;
  qrCode: string; // Para acceso de emergencia
  notifications: {
    emailsSent: number;
    whatsappSent: number;
  };
}
```

---

### 5. Inspecciones

#### POST `/api/inspections/create`
```typescript
Request:
{
  companyId: string;
  sectorId: string;
  inspectorId: string;
  type: 'routine' | 'focused' | 'emergency';
  checklist: Array<{
    itemId: string;
    status: 'ok' | 'warning' | 'critical' | 'n/a';
    notes?: string;
    photo?: string;
  }>;
  findings: Array<{
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    photos: string[];
    recommendations: string;
  }>;
  signature: string;
  gpsCoordinates: { lat: number; lng: number };
  timestamp: string;
  metadata: LegalMetadata;
}

Response:
{
  inspectionId: string;
  reportNumber: string;
  pdfUrl: string;
  nextInspectionDate?: string;
}
```

---

### 6. Charlas y EPP

#### POST `/api/talks/create`
```typescript
Request:
{
  companyId: string;
  topic: string;
  date: string;
  duration: number; // minutos
  instructorId: string;
  attendees: Array<{
    workerId: string;
    signature: string;
    timestamp: string;
  }>;
  materials: string[];
  evaluation?: {
    questions: string[];
    results: Record<string, number>; // workerId → score
  };
  metadata: LegalMetadata;
}

Response:
{
  talkId: string;
  attendanceRate: number;
  certificateUrls: string[]; // Por trabajador
  pdfUrl: string;
}
```

#### POST `/api/epp/delivery`
```typescript
Request:
{
  companyId: string;
  deliveryDate: string;
  items: Array<{
    workerId: string;
    equipment: Array<{
      type: string;
      quantity: number;
      brand: string;
      model: string;
      expiryDate?: string;
    }>;
    signature: string;
    legalAcceptance: boolean; // Acepta responsabilidad
    timestamp: string;
  }>;
  deliveredBy: string;
  metadata: LegalMetadata;
}

Response:
{
  deliveryId: string;
  totalItems: number;
  pdfUrl: string;
  nextDeliveryDue?: string;
}
```

---

### 7. Estadísticas

#### GET `/api/statistics/if-ig`
```typescript
Query Params:
- companyId: string
- period: 'month' | 'quarter' | 'year'
- startDate: string
- endDate: string

Response:
{
  period: string;
  if: number; // Índice de Frecuencia
  ig: number; // Índice de Gravedad
  accidents: {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    trend: 'up' | 'down' | 'stable';
  };
  workers: {
    total: number;
    hoursWorked: number;
  };
  comparison: {
    previousPeriod: { if: number; ig: number };
    industry: { if: number; ig: number };
  };
}
```

---

### 8. Firmas Digitales

#### POST `/api/signatures/validate`
```typescript
Request:
{
  signature: string; // Base64
  documentId: string;
  workerId: string;
  timestamp: string;
  hash: string; // SHA-256
}

Response:
{
  valid: boolean;
  signerId: string;
  signedAt: string;
  blockchainTxId?: string; // Si se usa blockchain
}
```

---

## 📊 Modelos de Datos

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  rut: string;
  role: 'prevencionista' | 'gerente' | 'trabajador' | 'admin';
  companies: string[]; // Company IDs
  phone?: string;
  certifications?: Array<{
    type: string;
    number: string;
    expiryDate: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

### Company
```typescript
interface Company {
  id: string;
  name: string;
  rut: string;
  legalName: string;
  address: string;
  phone: string;
  email: string;
  mutualidad: 'IST' | 'ACHS' | 'Mutual de Seguridad';
  activityType: string;
  logo?: string;
  settings: {
    autoNotifications: boolean;
    requiredSignatures: string[];
    complianceLevel: 'basic' | 'advanced' | 'premium';
  };
  createdAt: string;
}
```

### Worker
```typescript
interface Worker {
  id: string;
  companyId: string;
  rut: string;
  name: string;
  position: string;
  department: string;
  sector: string;
  hireDate: string;
  contractType: 'indefinido' | 'plazo_fijo' | 'honorarios';
  epp: Array<{
    type: string;
    deliveryDate: string;
    expiryDate?: string;
    status: 'active' | 'expired';
  }>;
  trainings: Array<{
    topic: string;
    date: string;
    expiryDate?: string;
    instructor: string;
  }>;
  medicalExams: Array<{
    type: string;
    date: string;
    result: 'apto' | 'apto_con_restricciones' | 'no_apto';
    nextExamDate: string;
  }>;
  accidents: string[]; // Accident IDs
  createdAt: string;
}
```

### Accident
```typescript
interface Accident {
  id: string;
  companyId: string;
  workerId: string;
  reportNumber: string; // AUTO-GENERATED
  timestamp: string;
  reportedBy: string;
  sector: string;
  description: string;
  severity: 'leve' | 'grave' | 'fatal';
  bodyPart: string;
  causeType: string;
  immediateActions: string[];
  witnesses: Array<{
    workerId: string;
    statement: string;
    signature: string;
  }>;
  evidence: Array<{
    type: 'photo' | 'video';
    url: string;
    timestamp: string;
  }>;
  investigation: {
    status: 'pending' | 'in_progress' | 'completed';
    rootCause?: string;
    correctiveActions?: string[];
    responsiblePerson?: string;
    deadline?: string;
  };
  notifications: {
    managementSent: boolean;
    hrSent: boolean;
    itSent: boolean;
    mutualSent: boolean;
  };
  legalDocs: {
    diatUrl?: string; // Denuncia Individual de Accidente del Trabajo
    investigationReportUrl?: string;
  };
  metadata: LegalMetadata;
  createdAt: string;
  updatedAt: string;
}
```

### LegalMetadata
```typescript
interface LegalMetadata {
  timestamp: string; // ISO 8601 RFC 3339
  timestampServer: string; // Server-side timestamp
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number;
    timestamp: string;
  };
  deviceInfo: {
    id: string; // Unique device identifier
    userAgent: string;
    platform: string; // 'iOS', 'Android', 'Web'
    os: string;
    browser?: string;
  };
  networkInfo: {
    ipAddress: string;
    connectionType?: '4G' | '5G' | 'WiFi' | 'Ethernet';
  };
  signatures?: Array<{
    id: string;
    signerId: string;
    type: 'attendance' | 'receipt' | 'acknowledgment' | 'manager_approval';
    signature: string; // Base64
    timestamp: string;
    hash: string; // SHA-256 del signature + timestamp
    deviceId: string;
    ipAddress: string;
    gpsCoordinates?: { lat: number; lng: number };
  }>;
  auditTrail: Array<{
    action: string;
    userId: string;
    timestamp: string;
    changes?: any;
  }>;
  blockchainProof?: {
    txId: string;
    network: 'ethereum' | 'polygon' | 'hyperledger';
    blockNumber: number;
    timestamp: string;
  };
}
```

---

## 🔒 Autenticación y Seguridad

### JWT Token Structure
```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  companies: string[];
  iat: number; // Issued at
  exp: number; // Expiration
}
```

### Headers Requeridos
```typescript
// Todas las peticiones autenticadas:
{
  'Authorization': 'Bearer {token}',
  'X-Device-ID': '{deviceId}',
  'X-Company-ID': '{companyId}',
  'Content-Type': 'application/json'
}
```

### Multi-Tenant Isolation (RLS - Row Level Security)
```sql
-- PostgreSQL Policy Example
CREATE POLICY company_isolation ON documents
  USING (company_id = current_setting('app.current_company_id')::uuid);

-- Aplicar en todas las tablas
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE accidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
```

### Rate Limiting
```typescript
// Por usuario:
- Login: 5 intentos / 15 minutos
- API calls: 100 req / minuto
- File uploads: 10 MB / request
- Sync: 50 docs / request
```

---

## 💾 Sincronización Offline

### IndexedDB Schema (Frontend)
```typescript
interface OfflineDB {
  pendingDocuments: {
    id: string; // UUID temporal
    type: string;
    data: any;
    metadata: any;
    createdAt: number; // timestamp
    retryCount: number;
    lastError?: string;
  };
  
  cachedData: {
    key: string;
    value: any;
    expiresAt: number;
  };
  
  syncQueue: {
    id: string;
    endpoint: string;
    method: 'POST' | 'PUT' | 'DELETE';
    body: any;
    priority: number; // 1-10 (10 = crítico)
    createdAt: number;
  };
}
```

### Service Worker Background Sync
```typescript
// sw.js
self.addEventListener('sync', event => {
  if (event.tag === 'sync-documents') {
    event.waitUntil(syncPendingDocuments());
  }
});

async function syncPendingDocuments() {
  const db = await openDB('SafeTrack');
  const pending = await db.getAll('pendingDocuments');
  
  for (const doc of pending) {
    try {
      const response = await fetch('/api/documents/sync', {
        method: 'POST',
        body: JSON.stringify({ documents: [doc] }),
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      
      if (response.ok) {
        await db.delete('pendingDocuments', doc.id);
      }
    } catch (error) {
      doc.retryCount++;
      await db.put('pendingDocuments', doc);
    }
  }
}
```

### Conflict Resolution
```typescript
// Estrategia: Last-Write-Wins con validación
interface ConflictResolution {
  strategy: 'last_write_wins' | 'manual_merge' | 'server_priority';
  onConflict: (local: any, server: any) => any;
}

// Ejemplo para accidentes (NO permitir sobrescritura)
if (doc.type === 'accident') {
  strategy = 'server_priority'; // Accidentes NUNCA se sobrescriben
}
```

---

## 🔴 WebSockets en Tiempo Real

### Conexión
```typescript
// Frontend
import io from 'socket.io-client';

const socket = io('wss://api.safetrack.cl', {
  auth: {
    token: getJWTToken(),
    companyId: getCurrentCompanyId()
  }
});

socket.on('connect', () => {
  console.log('WebSocket connected');
});
```

### Eventos del Servidor
```typescript
// document_synced
socket.on('document_synced', (data) => {
  // { documentId, type, title, syncedAt }
  toast.success(`Documento sincronizado: ${data.title}`);
  refreshPendingItems();
});

// accident_reported
socket.on('accident_reported', (data) => {
  // { accidentId, workerId, severity, timestamp }
  if (data.severity === 'grave' || data.severity === 'fatal') {
    showCriticalAlert(data);
  }
});

// signature_received
socket.on('signature_received', (data) => {
  // { documentId, signerId, timestamp }
  updateDocumentStatus(data.documentId, 'signed');
});

// compliance_alert
socket.on('compliance_alert', (data) => {
  // { type, message, severity, actionRequired }
  showNotification(data);
});

// worker_certification_expiring
socket.on('worker_certification_expiring', (data) => {
  // { workerId, certificationType, expiryDate }
  addToAlertCenter(data);
});
```

---

## 📝 Código de Ejemplo

### 1. Hook de Sincronización Mejorado

```typescript
// /src/hooks/useDocumentSync.ts
import { useState, useEffect } from 'react';
import { openDB, IDBPDatabase } from 'idb';

interface PendingDocument {
  id: string;
  type: string;
  data: any;
  metadata: any;
  priority: number;
  retryCount: number;
  createdAt: number;
}

export function useDocumentSync() {
  const [pendingItems, setPendingItems] = useState<PendingDocument[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  useEffect(() => {
    loadPendingItems();
    
    // Escuchar eventos de online/offline
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const loadPendingItems = async () => {
    const db = await openDB('SafeTrack', 1, {
      upgrade(db) {
        db.createObjectStore('pendingDocuments', { keyPath: 'id' });
      }
    });
    
    const items = await db.getAll('pendingDocuments');
    setPendingItems(items.sort((a, b) => b.priority - a.priority));
  };

  const handleOnline = () => {
    if (pendingItems.length > 0) {
      syncDocuments();
    }
  };

  const syncDocuments = async () => {
    if (!navigator.onLine || isSyncing) return;
    
    setIsSyncing(true);
    const total = pendingItems.length;
    let synced = 0;

    for (const doc of pendingItems) {
      try {
        const response = await fetch('/api/documents/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'X-Company-ID': getCurrentCompanyId()
          },
          body: JSON.stringify({ documents: [doc] })
        });

        if (response.ok) {
          const db = await openDB('SafeTrack');
          await db.delete('pendingDocuments', doc.id);
          synced++;
          setSyncProgress((synced / total) * 100);
        }
      } catch (error) {
        console.error('Sync error:', error);
        doc.retryCount++;
        const db = await openDB('SafeTrack');
        await db.put('pendingDocuments', doc);
      }
    }

    setIsSyncing(false);
    await loadPendingItems();
  };

  const saveDocumentOffline = async (doc: Omit<PendingDocument, 'id' | 'createdAt' | 'retryCount'>) => {
    const db = await openDB('SafeTrack');
    const newDoc: PendingDocument = {
      ...doc,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      retryCount: 0
    };
    
    await db.add('pendingDocuments', newDoc);
    await loadPendingItems();

    // Registrar background sync
    if ('serviceWorker' in navigator && 'sync' in registration) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-documents');
    }
  };

  return {
    pendingItems,
    isSyncing,
    syncProgress,
    syncDocuments,
    saveDocumentOffline
  };
}
```

### 2. Componente de Sincronización Integrado

```typescript
// /src/app/AppContent.tsx
import { useDocumentSync } from '@/hooks/useDocumentSync';

export function AppContent() {
  const { 
    pendingItems, 
    isSyncing, 
    syncProgress,
    syncDocuments,
    saveDocumentOffline 
  } = useDocumentSync();

  // Usar en IntelligentSyncIndicator
  return (
    <div>
      {/* ... otros componentes */}
      
      {pendingItems.length > 0 && (
        <IntelligentSyncIndicator
          pendingItems={pendingItems}
          isOnline={navigator.onLine}
          isSyncing={isSyncing}
          syncProgress={syncProgress}
          onSync={syncDocuments}
          onViewDetails={(item) => {
            // Mostrar modal con detalles
            showDocumentModal(item);
          }}
        />
      )}
    </div>
  );
}
```

---

## ✅ Checklist de Integración Backend

### Fase 1: Autenticación
- [ ] Implementar POST /api/auth/login
- [ ] Implementar JWT refresh
- [ ] Configurar CORS
- [ ] Setup Rate Limiting
- [ ] Implementar RLS en PostgreSQL

### Fase 2: Sincronización Básica
- [ ] Implementar POST /api/documents/sync
- [ ] Implementar GET /api/documents/pending
- [ ] Configurar storage S3/MinIO para archivos
- [ ] Setup IndexedDB en frontend

### Fase 3: WebSockets
- [ ] Configurar Socket.io
- [ ] Implementar eventos en tiempo real
- [ ] Setup Redis para pub/sub

### Fase 4: Módulos Específicos
- [ ] POST /api/accidents/report
- [ ] POST /api/inspections/create
- [ ] POST /api/talks/create
- [ ] GET /api/statistics/if-ig

### Fase 5: Seguridad Legal
- [ ] Implementar firma digital SHA-256
- [ ] Configurar blockchain timestamping (opcional)
- [ ] Audit trail automático
- [ ] Backup incremental diario

---

**Actualizado:** 26 de Enero de 2026  
**Versión:** 1.0.0
