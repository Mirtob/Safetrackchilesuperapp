# Guía de Implementación del Sistema de Filtrado por Empresa/Sucursal

## 📋 Resumen

SafeTrack Chile implementa un sistema de filtrado obligatorio para aislar completamente los datos entre empresas y sucursales, evitando la mezcla de información sensible.

## 🎯 Objetivos

1. **Aislamiento Completo**: Cada empresa ve solo sus datos
2. **Contexto de Sucursal**: Las sucursales ven sus datos + información general de la empresa
3. **Prevención de Errores**: Imposible mezclar datos entre empresas
4. **Trazabilidad**: Cada dato sabe a qué empresa/sucursal pertenece

## 🛠️ Componentes del Sistema

### 1. Hook `useFilteredData`

Filtra automáticamente arrays de datos según el contexto actual:

```typescript
import { useFilteredData } from '@/app/hooks/useFilteredData';

interface MyData {
  id: string;
  companyId: string;  // ⚠️ OBLIGATORIO
  branchId?: string;   // ⚠️ OPCIONAL
  // ... otros campos
}

function MyComponent() {
  const allData: MyData[] = [...]; // Todos los datos
  const filteredData = useFilteredData(allData); // Solo datos del contexto actual
  
  return (
    <div>
      {filteredData.map(item => ...)}
    </div>
  );
}
```

### 2. Hook `useFilterContext`

Obtiene información sobre el contexto actual:

```typescript
import { useFilterContext } from '@/app/hooks/useFilteredData';

function MyComponent() {
  const context = useFilterContext();
  
  console.log(context.companyId);      // "1"
  console.log(context.companyName);    // "Constructora Los Andes"
  console.log(context.branchId);       // "B1-1" o undefined
  console.log(context.branchName);     // "Obra Portal Ñuñoa" o undefined
  console.log(context.contextLabel);   // "Obra Portal Ñuñoa (Constructora Los Andes)"
}
```

### 3. Hook `useCreateWithContext`

Crea datos nuevos con el contexto automático:

```typescript
import { useCreateWithContext } from '@/app/hooks/useFilteredData';

function MyComponent() {
  const createWithContext = useCreateWithContext();
  
  const handleCreate = () => {
    const newItem = createWithContext({
      id: 'new-1',
      name: 'Mi registro',
      // companyId y branchId se agregan automáticamente
    });
    
    console.log(newItem);
    // {
    //   id: 'new-1',
    //   name: 'Mi registro',
    //   companyId: '1',
    //   branchId: 'B1-1'
    // }
  };
}
```

### 4. Componente `ContextIndicator`

Muestra visualmente el contexto actual:

```typescript
import { ContextIndicator } from '@/app/components/ContextIndicator';

function MyComponent() {
  return (
    <div>
      {/* Banner superior */}
      <ContextIndicator variant="banner" showWarning />
      
      {/* Versión compacta */}
      <ContextIndicator variant="compact" />
      
      {/* Tarjeta completa */}
      <ContextIndicator variant="default" showWarning />
    </div>
  );
}
```

### 5. Componente `NoCompanyWarning`

Advertencia cuando no hay empresa seleccionada:

```typescript
import { NoCompanyWarning } from '@/app/components/ContextIndicator';
import { useCompany } from '@/app/context/CompanyContext';

function MyComponent() {
  const { isCompanySelected } = useCompany();
  
  if (!isCompanySelected) {
    return <NoCompanyWarning />;
  }
  
  return <div>Contenido del módulo...</div>;
}
```

## 📝 Patrón de Implementación

### Paso 1: Actualizar Interface

```typescript
// ❌ ANTES (sin contexto)
interface Worker {
  id: string;
  name: string;
  position: string;
}

// ✅ DESPUÉS (con contexto)
interface Worker {
  id: string;
  companyId: string;  // ⚠️ OBLIGATORIO
  branchId?: string;   // ⚠️ OPCIONAL (si es dato de sucursal específica)
  name: string;
  position: string;
}
```

### Paso 2: Validar Empresa Seleccionada

```typescript
import { useCompany } from '@/app/context/CompanyContext';
import { NoCompanyWarning } from '@/app/components/ContextIndicator';

function MyComponent() {
  const { isCompanySelected } = useCompany();
  
  // Validación temprana
  if (!isCompanySelected) {
    return <NoCompanyWarning />;
  }
  
  // Resto del componente
  return <MyComponentContent />;
}
```

### Paso 3: Aplicar Filtrado

```typescript
import { useFilteredData } from '@/app/hooks/useFilteredData';

function MyComponentContent() {
  // Datos sin filtrar (pueden venir de API, localStorage, etc.)
  const [allWorkers, setAllWorkers] = useState<Worker[]>([...]);
  
  // Aplicar filtrado automático
  const visibleWorkers = useFilteredData(allWorkers);
  
  return (
    <div>
      <h2>Trabajadores ({visibleWorkers.length})</h2>
      {visibleWorkers.map(worker => (
        <WorkerCard key={worker.id} worker={worker} />
      ))}
    </div>
  );
}
```

### Paso 4: Crear Datos con Contexto

```typescript
import { useCreateWithContext } from '@/app/hooks/useFilteredData';

function MyComponentContent() {
  const createWithContext = useCreateWithContext();
  const [workers, setWorkers] = useState<Worker[]>([]);
  
  const handleAddWorker = (name: string, position: string) => {
    const newWorker = createWithContext({
      id: `worker-${Date.now()}`,
      name,
      position
      // companyId y branchId se agregan automáticamente
    });
    
    setWorkers([...workers, newWorker]);
  };
  
  return (
    <button onClick={() => handleAddWorker('Juan Pérez', 'Operador')}>
      Agregar Trabajador
    </button>
  );
}
```

### Paso 5: Mostrar Indicador de Contexto

```typescript
import { ContextIndicator } from '@/app/components/ContextIndicator';

function MyComponentContent() {
  return (
    <div className="min-h-screen">
      {/* Banner superior - siempre visible */}
      <ContextIndicator variant="banner" showWarning />
      
      <div className="p-6">
        <h1>Mi Módulo</h1>
        {/* Contenido filtrado */}
      </div>
    </div>
  );
}
```

## 🔄 Ejemplo Completo de Migración

### ANTES (sin filtrado):

```typescript
import { useState } from 'react';

interface Incident {
  id: string;
  description: string;
  date: string;
}

function IncidentList() {
  const [incidents] = useState<Incident[]>([
    { id: '1', description: 'Caída', date: '2026-01-20' },
    { id: '2', description: 'Corte', date: '2026-01-21' },
  ]);
  
  return (
    <div>
      <h1>Incidentes</h1>
      {incidents.map(incident => (
        <div key={incident.id}>{incident.description}</div>
      ))}
    </div>
  );
}
```

### DESPUÉS (con filtrado):

```typescript
import { useState } from 'react';
import { useCompany } from '@/app/context/CompanyContext';
import { useFilteredData, useCreateWithContext } from '@/app/hooks/useFilteredData';
import { ContextIndicator, NoCompanyWarning } from '@/app/components/ContextIndicator';

// ✅ Interface actualizada con contexto
interface Incident {
  id: string;
  companyId: string;  // ⚠️ Agregado
  branchId?: string;   // ⚠️ Agregado
  description: string;
  date: string;
}

function IncidentList() {
  const { isCompanySelected } = useCompany();
  
  // ✅ Validación temprana
  if (!isCompanySelected) {
    return <NoCompanyWarning />;
  }
  
  return <IncidentListContent />;
}

function IncidentListContent() {
  // ✅ Datos con contexto
  const [incidents] = useState<Incident[]>([
    { id: '1', companyId: '1', branchId: 'B1-1', description: 'Caída', date: '2026-01-20' },
    { id: '2', companyId: '1', branchId: 'B1-2', description: 'Corte', date: '2026-01-21' },
    { id: '3', companyId: '2', branchId: 'B2-1', description: 'Quemadura', date: '2026-01-22' },
  ]);
  
  // ✅ Aplicar filtrado
  const visibleIncidents = useFilteredData(incidents);
  const createWithContext = useCreateWithContext();
  
  const handleAddIncident = (description: string) => {
    const newIncident = createWithContext({
      id: `inc-${Date.now()}`,
      description,
      date: new Date().toISOString().split('T')[0]
    });
    console.log('Nuevo incidente:', newIncident);
  };
  
  return (
    <div className="min-h-screen">
      {/* ✅ Indicador de contexto */}
      <ContextIndicator variant="banner" showWarning />
      
      <div className="p-6">
        <h1>Incidentes ({visibleIncidents.length})</h1>
        
        {/* ✅ Solo datos filtrados */}
        {visibleIncidents.map(incident => (
          <div key={incident.id}>
            {incident.description} - {incident.date}
            {incident.branchId && <span className="text-xs text-orange-600"> (Sucursal)</span>}
          </div>
        ))}
        
        <button onClick={() => handleAddIncident('Nueva descripción')}>
          Agregar Incidente
        </button>
      </div>
    </div>
  );
}
```

## 🎨 Variantes del ContextIndicator

### Banner (Recomendado para vistas principales)

```typescript
<ContextIndicator variant="banner" showWarning />
```

**Uso**: Top de la página, sticky header
**Apariencia**: Fondo azul institucional, full width

### Compact (Para headers de cards)

```typescript
<ContextIndicator variant="compact" />
```

**Uso**: Headers de tarjetas, toolbars
**Apariencia**: Una línea, iconos pequeños

### Default (Para sidebars o paneles)

```typescript
<ContextIndicator variant="default" showWarning />
```

**Uso**: Sidebars, paneles laterales
**Apariencia**: Tarjeta completa con detalles

## 🚨 Reglas Obligatorias

### 1. ⚠️ NUNCA mostrar datos sin filtrar

```typescript
// ❌ MAL - Muestra todos los datos
const allIncidents = [...];
return <div>{allIncidents.map(...)}</div>;

// ✅ BIEN - Solo datos filtrados
const allIncidents = [...];
const visibleIncidents = useFilteredData(allIncidents);
return <div>{visibleIncidents.map(...)}</div>;
```

### 2. ⚠️ SIEMPRE validar empresa seleccionada

```typescript
// ❌ MAL - No valida
function MyComponent() {
  return <div>Contenido...</div>;
}

// ✅ BIEN - Valida primero
function MyComponent() {
  const { isCompanySelected } = useCompany();
  if (!isCompanySelected) {
    return <NoCompanyWarning />;
  }
  return <div>Contenido...</div>;
}
```

### 3. ⚠️ SIEMPRE agregar contexto a datos nuevos

```typescript
// ❌ MAL - Sin contexto
const newItem = { id: '1', name: 'Test' };

// ✅ BIEN - Con contexto automático
const createWithContext = useCreateWithContext();
const newItem = createWithContext({ id: '1', name: 'Test' });
```

### 4. ⚠️ SIEMPRE mostrar indicador de contexto

```typescript
// ❌ MAL - Usuario no sabe en qué contexto está
return (
  <div>
    <h1>Mi Módulo</h1>
    {/* contenido */}
  </div>
);

// ✅ BIEN - Contexto visible
return (
  <div>
    <ContextIndicator variant="banner" />
    <h1>Mi Módulo</h1>
    {/* contenido */}
  </div>
);
```

## 📊 Comportamiento del Filtrado

### Empresa Seleccionada (sin sucursal)

```typescript
// Contexto: Empresa "Constructora Los Andes" (id: 1)
// Datos:
const data = [
  { id: 'A', companyId: '1', branchId: undefined },  // ✅ VISIBLE
  { id: 'B', companyId: '1', branchId: 'B1-1' },     // ✅ VISIBLE
  { id: 'C', companyId: '1', branchId: 'B1-2' },     // ✅ VISIBLE
  { id: 'D', companyId: '2', branchId: undefined },  // ❌ NO VISIBLE
];

const filtered = useFilteredData(data);
// Resultado: [A, B, C]
```

### Sucursal Seleccionada

```typescript
// Contexto: Sucursal "Obra Portal Ñuñoa" (B1-1) de "Constructora Los Andes" (1)
// Datos:
const data = [
  { id: 'A', companyId: '1', branchId: undefined },  // ✅ VISIBLE (info general empresa)
  { id: 'B', companyId: '1', branchId: 'B1-1' },     // ✅ VISIBLE (sucursal actual)
  { id: 'C', companyId: '1', branchId: 'B1-2' },     // ❌ NO VISIBLE (otra sucursal)
  { id: 'D', companyId: '2', branchId: undefined },  // ❌ NO VISIBLE (otra empresa)
];

const filtered = useFilteredData(data);
// Resultado: [A, B]
```

## 🔧 Casos Especiales

### Datos Compartidos entre Sucursales

Para datos que deben compartirse entre todas las sucursales de una empresa (ej: normativas, procedimientos generales), NO incluir `branchId`:

```typescript
const sharedProcedure = {
  id: 'proc-1',
  companyId: '1',
  // NO incluir branchId
  title: 'Procedimiento de Emergencia',
  description: '...'
};
```

### Filtrado con Opciones Avanzadas

```typescript
import { useFilteredDataWithSharedInfo } from '@/app/hooks/useFilteredData';

// Incluir datos de empresa cuando hay sucursal seleccionada
const visibleData = useFilteredDataWithSharedInfo(allData, {
  includeCompanyLevelData: true  // default: true
});

// Excluir datos de empresa, solo sucursal
const branchOnlyData = useFilteredDataWithSharedInfo(allData, {
  includeCompanyLevelData: false
});
```

## 📱 Integración con APIs

### Al Guardar Datos

```typescript
const createWithContext = useCreateWithContext();

const handleSave = async (formData: any) => {
  // Agregar contexto automáticamente
  const dataWithContext = createWithContext(formData);
  
  // Enviar a API
  await api.post('/incidents', dataWithContext);
};
```

### Al Recibir Datos

```typescript
const fetchData = async () => {
  // La API debería devolver datos ya filtrados por empresa
  const response = await api.get(`/incidents?companyId=${companyId}`);
  
  // Aplicar filtrado adicional en cliente (por sucursal)
  const filtered = useFilteredData(response.data);
  setData(filtered);
};
```

## ✅ Checklist de Implementación

- [ ] Agregar `companyId` a la interface
- [ ] Agregar `branchId?` a la interface (si aplica)
- [ ] Importar `useCompany` y validar `isCompanySelected`
- [ ] Mostrar `<NoCompanyWarning />` si no hay empresa
- [ ] Usar `useFilteredData()` para filtrar datos
- [ ] Usar `useCreateWithContext()` para crear datos
- [ ] Agregar `<ContextIndicator />` en la UI
- [ ] Probar con diferentes empresas y sucursales
- [ ] Verificar que no se mezclen datos

## 🎓 Recursos

- **Componente de Ejemplo**: `/src/app/components/FilteredDataExample.tsx`
- **Hook de Filtrado**: `/src/app/hooks/useFilteredData.ts`
- **Indicadores**: `/src/app/components/ContextIndicator.tsx`
- **Contexto**: `/src/app/context/CompanyContext.tsx`

## 🐛 Debugging

### Verificar Datos Filtrados

```typescript
const allData = [...];
const filteredData = useFilteredData(allData);

console.log('Total:', allData.length);
console.log('Filtrado:', filteredData.length);
console.log('Contexto:', useFilterContext());
```

### Ver Tabla de Debug

El componente `FilteredDataExample` incluye una tabla de debugging que muestra qué datos son visibles y cuáles no.

---

**Última actualización**: Enero 2026
**Versión**: 1.0.0
**Autor**: SafeTrack Chile Development Team
