# Ejemplo de Migración: ComplianceDashboard

## 📋 Objetivo

Migrar el `ComplianceDashboard` para implementar el sistema de filtrado por empresa/sucursal.

## 🔍 Análisis del Componente Original

### Datos que maneja:
- Métricas de cumplimiento
- Documentos pendientes/vencidos
- Inspecciones por realizar
- Capacitaciones obligatorias
- Equipos de protección personal (EPP)

### Estado actual:
❌ Muestra datos de todas las empresas mezclados
❌ No valida empresa seleccionada
❌ Sin indicador de contexto visual
❌ Posible mezcla de información sensible

## ✅ Plan de Migración

### Paso 1: Actualizar Interfaces

#### ANTES:
```typescript
interface ComplianceMetric {
  id: string;
  category: string;
  value: number;
  target: number;
  status: 'ok' | 'warning' | 'critical';
}

interface PendingDocument {
  id: string;
  name: string;
  dueDate: string;
  responsible: string;
}
```

#### DESPUÉS:
```typescript
interface ComplianceMetric {
  id: string;
  companyId: string;      // ⚠️ AGREGADO
  branchId?: string;       // ⚠️ AGREGADO
  category: string;
  value: number;
  target: number;
  status: 'ok' | 'warning' | 'critical';
}

interface PendingDocument {
  id: string;
  companyId: string;      // ⚠️ AGREGADO
  branchId?: string;       // ⚠️ AGREGADO
  name: string;
  dueDate: string;
  responsible: string;
}
```

### Paso 2: Agregar Imports Necesarios

```typescript
// Imports existentes
import { useState } from 'react';
import { Card } from '@/app/components/ui/card';
// ... otros imports

// ⚠️ NUEVOS IMPORTS
import { useCompany } from '@/app/context/CompanyContext';
import { 
  useFilteredData, 
  useFilterContext, 
  useCreateWithContext 
} from '@/app/hooks/useFilteredData';
import { 
  ContextIndicator, 
  NoCompanyWarning 
} from '@/app/components/ContextIndicator';
```

### Paso 3: Separar Validación de Contenido

#### ANTES:
```typescript
export function ComplianceDashboard({ onBack }: Props) {
  const [metrics, setMetrics] = useState<ComplianceMetric[]>([...]);
  
  return (
    <div>
      {/* Contenido directamente */}
    </div>
  );
}
```

#### DESPUÉS:
```typescript
// ⚠️ Componente principal solo valida
export function ComplianceDashboard({ onBack }: Props) {
  const { isCompanySelected } = useCompany();
  
  // Validación temprana
  if (!isCompanySelected) {
    return (
      <div className="p-6">
        <NoCompanyWarning />
      </div>
    );
  }
  
  // Delegar a componente de contenido
  return <ComplianceDashboardContent onBack={onBack} />;
}

// ⚠️ Componente de contenido con filtrado
function ComplianceDashboardContent({ onBack }: Props) {
  // Aquí va la lógica real del dashboard
}
```

### Paso 4: Implementar Filtrado de Datos

```typescript
function ComplianceDashboardContent({ onBack }: Props) {
  // Datos sin filtrar (pueden venir de API, localStorage, etc.)
  const [allMetrics, setAllMetrics] = useState<ComplianceMetric[]>([
    {
      id: 'm1',
      companyId: '1',
      branchId: 'B1-1',
      category: 'Inspecciones',
      value: 85,
      target: 90,
      status: 'warning'
    },
    {
      id: 'm2',
      companyId: '1',
      branchId: 'B1-2',
      category: 'Inspecciones',
      value: 95,
      target: 90,
      status: 'ok'
    },
    {
      id: 'm3',
      companyId: '2',
      branchId: 'B2-1',
      category: 'Inspecciones',
      value: 75,
      target: 90,
      status: 'critical'
    }
  ]);
  
  // ⚠️ APLICAR FILTRADO
  const visibleMetrics = useFilteredData(allMetrics);
  const context = useFilterContext();
  
  // Usar visibleMetrics en lugar de allMetrics
  return (
    <div className="min-h-screen">
      <ContextIndicator variant="banner" showWarning />
      
      <div className="p-6">
        <h1>Dashboard de Cumplimiento</h1>
        <p>Mostrando {visibleMetrics.length} métricas de {context.contextLabel}</p>
        
        {visibleMetrics.map(metric => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>
    </div>
  );
}
```

### Paso 5: Actualizar Creación de Datos

#### ANTES:
```typescript
const handleCreateMetric = (category: string, value: number) => {
  const newMetric: ComplianceMetric = {
    id: `m-${Date.now()}`,
    category,
    value,
    target: 90,
    status: 'ok'
  };
  
  setAllMetrics([...allMetrics, newMetric]);
};
```

#### DESPUÉS:
```typescript
function ComplianceDashboardContent({ onBack }: Props) {
  const createWithContext = useCreateWithContext();
  
  const handleCreateMetric = (category: string, value: number) => {
    // ⚠️ Agregar contexto automáticamente
    const newMetric = createWithContext({
      id: `m-${Date.now()}`,
      category,
      value,
      target: 90,
      status: 'ok' as const
    });
    
    // newMetric ahora incluye companyId y branchId automáticamente
    setAllMetrics([...allMetrics, newMetric]);
  };
  
  return (
    <button onClick={() => handleCreateMetric('Inspecciones', 85)}>
      Crear Métrica
    </button>
  );
}
```

### Paso 6: Agregar Indicadores Visuales

```typescript
return (
  <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
    {/* ⚠️ Banner superior - contexto siempre visible */}
    <ContextIndicator variant="banner" showWarning />
    
    {/* Header con navegación */}
    <div className="bg-white dark:bg-zinc-800 p-4">
      <button onClick={onBack}>
        <ArrowLeft /> Volver
      </button>
      
      <div className="flex items-center justify-between">
        <h1>Dashboard de Cumplimiento</h1>
        
        {/* ⚠️ Indicador compacto en header */}
        <ContextIndicator variant="compact" />
      </div>
    </div>
    
    {/* Contenido */}
    <div className="p-6">
      <p className="text-sm text-zinc-600">
        Mostrando datos de {context.contextLabel}
      </p>
      
      {/* Métricas filtradas */}
      {visibleMetrics.map(metric => (
        <Card key={metric.id}>
          <MetricCard metric={metric} />
          {/* Indicar si es dato de sucursal específica */}
          {metric.branchId && (
            <Badge className="bg-orange-100 text-orange-700">
              Sucursal
            </Badge>
          )}
        </Card>
      ))}
    </div>
  </div>
);
```

## 📊 Código Completo Migrado

```typescript
import { useState } from 'react';
import { 
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';

// ⚠️ IMPORTS NUEVOS
import { useCompany } from '@/app/context/CompanyContext';
import { 
  useFilteredData, 
  useFilterContext, 
  useCreateWithContext 
} from '@/app/hooks/useFilteredData';
import { 
  ContextIndicator, 
  NoCompanyWarning 
} from '@/app/components/ContextIndicator';

// ⚠️ Interfaces actualizadas con contexto
interface ComplianceMetric {
  id: string;
  companyId: string;      // AGREGADO
  branchId?: string;       // AGREGADO
  category: string;
  value: number;
  target: number;
  status: 'ok' | 'warning' | 'critical';
}

interface Props {
  onBack: () => void;
}

// ⚠️ Componente principal - solo valida
export function ComplianceDashboard({ onBack }: Props) {
  const { isCompanySelected } = useCompany();
  
  if (!isCompanySelected) {
    return (
      <div className="p-6">
        <NoCompanyWarning />
      </div>
    );
  }
  
  return <ComplianceDashboardContent onBack={onBack} />;
}

// ⚠️ Componente de contenido - con filtrado
function ComplianceDashboardContent({ onBack }: Props) {
  // Mock data con contexto
  const [allMetrics, setAllMetrics] = useState<ComplianceMetric[]>([
    {
      id: 'm1',
      companyId: '1',
      branchId: 'B1-1',
      category: 'Inspecciones Completadas',
      value: 85,
      target: 90,
      status: 'warning'
    },
    {
      id: 'm2',
      companyId: '1',
      branchId: 'B1-2',
      category: 'Inspecciones Completadas',
      value: 95,
      target: 90,
      status: 'ok'
    },
    {
      id: 'm3',
      companyId: '1',
      // Sin branchId = dato general de empresa
      category: 'Cumplimiento Global',
      value: 88,
      target: 90,
      status: 'warning'
    },
    {
      id: 'm4',
      companyId: '2',
      branchId: 'B2-1',
      category: 'Inspecciones Completadas',
      value: 75,
      target: 90,
      status: 'critical'
    }
  ]);
  
  // ⚠️ APLICAR FILTRADO
  const visibleMetrics = useFilteredData(allMetrics);
  const context = useFilterContext();
  const createWithContext = useCreateWithContext();
  
  // Calcular estadísticas solo de datos visibles
  const totalMetrics = visibleMetrics.length;
  const okMetrics = visibleMetrics.filter(m => m.status === 'ok').length;
  const warningMetrics = visibleMetrics.filter(m => m.status === 'warning').length;
  const criticalMetrics = visibleMetrics.filter(m => m.status === 'critical').length;
  
  const handleCreateMetric = (category: string, value: number) => {
    const newMetric = createWithContext({
      id: `m-${Date.now()}`,
      category,
      value,
      target: 90,
      status: value >= 90 ? 'ok' as const : value >= 70 ? 'warning' as const : 'critical' as const
    });
    
    setAllMetrics([...allMetrics, newMetric]);
  };
  
  const getStatusColor = (status: ComplianceMetric['status']) => {
    const colors = {
      ok: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
      critical: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
    };
    return colors[status];
  };
  
  const getStatusIcon = (status: ComplianceMetric['status']) => {
    if (status === 'ok') return <CheckCircle className="w-5 h-5" />;
    if (status === 'warning') return <Clock className="w-5 h-5" />;
    return <AlertTriangle className="w-5 h-5" />;
  };
  
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* ⚠️ Banner de contexto */}
      <ContextIndicator variant="banner" showWarning />
      
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 p-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Dashboard de Cumplimiento
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              {context.contextLabel} • {totalMetrics} métricas
            </p>
          </div>
          
          {/* ⚠️ Indicador compacto */}
          <ContextIndicator variant="compact" />
        </div>
      </div>
      
      {/* Contenido */}
      <div className="p-6 space-y-6">
        {/* Resumen de estados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">OK</p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {okMetrics}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
          </Card>
          
          <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">Advertencia</p>
                <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                  {warningMetrics}
                </p>
              </div>
              <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
            </div>
          </Card>
          
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 dark:text-red-300">Crítico</p>
                <p className="text-3xl font-bold text-red-900 dark:text-red-100">
                  {criticalMetrics}
                </p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
          </Card>
        </div>
        
        {/* Lista de métricas filtradas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              Métricas de Cumplimiento
            </h2>
            <Button onClick={() => handleCreateMetric('Nueva Métrica', 85)}>
              Agregar Métrica
            </Button>
          </div>
          
          {visibleMetrics.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-zinc-500 dark:text-zinc-400">
                No hay métricas para {context.contextLabel}
              </p>
            </Card>
          ) : (
            visibleMetrics.map(metric => (
              <Card key={metric.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${getStatusColor(metric.status)}`}>
                      {getStatusIcon(metric.status)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-zinc-900 dark:text-white">
                          {metric.category}
                        </h3>
                        {metric.branchId && (
                          <Badge className="bg-orange-100 text-orange-700 text-xs">
                            Sucursal
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {metric.value}% de {metric.target}% objetivo
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                      {metric.value}%
                    </p>
                    <Badge className={getStatusColor(metric.status)}>
                      {metric.status === 'ok' ? 'Cumple' : 
                       metric.status === 'warning' ? 'Atención' : 'Urgente'}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
        
        {/* Info de debug */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Info de Filtrado
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Empresa: {context.companyName}</li>
            {context.isBranchSelected && (
              <li>• Sucursal: {context.branchName}</li>
            )}
            <li>• Métricas totales en sistema: {allMetrics.length}</li>
            <li>• Métricas visibles: {visibleMetrics.length}</li>
            <li>• Filtradas: {allMetrics.length - visibleMetrics.length}</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
```

## ✅ Verificación Post-Migración

### Checklist:
- [x] Interface tiene `companyId`
- [x] Interface tiene `branchId?`
- [x] Valida `isCompanySelected`
- [x] Muestra `<NoCompanyWarning />`
- [x] Usa `useFilteredData()`
- [x] Usa `useCreateWithContext()`
- [x] Muestra `<ContextIndicator />`
- [x] Estadísticas calculadas sobre datos filtrados
- [x] Mock data incluye diferentes empresas/sucursales

### Pruebas:
1. ✅ Sin empresa: Muestra warning
2. ✅ Empresa 1: Solo ve métricas de empresa 1
3. ✅ Empresa 2: Solo ve métricas de empresa 2
4. ✅ Sucursal B1-1: Ve datos generales + B1-1
5. ✅ Sucursal B1-2: Ve datos generales + B1-2
6. ✅ Crear métrica: Incluye contexto automático

## 📈 Resultados

### Antes:
- ❌ 4 métricas visibles siempre
- ❌ Mezcla datos de todas las empresas
- ❌ Sin contexto visual
- ❌ Posible confusión de datos

### Después:
- ✅ 1-3 métricas según contexto
- ✅ Solo datos relevantes
- ✅ Contexto siempre visible
- ✅ Imposible mezclar datos

## 🎯 Próximos Componentes a Migrar

Usar este mismo patrón para:
1. WorkerManagement
2. IncidentReportForm
3. InspectionMode
4. DocumentVault
5. StatisticsModule

---

**Tiempo de migración estimado**: 15-30 minutos por componente  
**Dificultad**: Baja (patrón estandarizado)  
**Beneficio**: Alto (seguridad y claridad)
