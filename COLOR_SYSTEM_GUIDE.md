# 🎨 Guía del Sistema de Color SafeTrack Chile

## 📋 Índice
1. [Filosofía del Diseño](#filosofía-del-diseño)
2. [Colores Corporativos](#colores-corporativos)
3. [Dashboard Triádico](#dashboard-triádico)
4. [Colores de Estado](#colores-de-estado)
5. [Semáforo de Cumplimiento](#semáforo-de-cumplimiento)
6. [Modo Claro vs Modo Oscuro](#modo-claro-vs-modo-oscuro)
7. [Clases Utilitarias](#clases-utilitarias)
8. [Ejemplos de Uso](#ejemplos-de-uso)

---

## 🧠 Filosofía del Diseño

El sistema de color de SafeTrack Chile está diseñado específicamente para **reducir el estrés cognitivo y la fatiga visual** del prevencionista de riesgos durante jornadas laborales extensas.

### Principios Fundamentales

#### 1. **Reducción de Estrés Cognitivo**
- Colores calibrados para minimizar fatiga mental
- Paleta limitada para facilitar decisiones rápidas
- Códigos de color consistentes en toda la aplicación

#### 2. **Optimización de Fatiga Visual**
- Contraste optimizado para luz solar (trabajo de campo)
- Tonos suaves para trabajo en oficina
- Modo oscuro calibrado para uso nocturno

#### 3. **Bienestar Emocional**
- Colores que promueven calma y confianza
- Uso estratégico del rojo (solo situaciones críticas)
- Refuerzo positivo con verde

---

## 🏢 Colores Corporativos

### Azul Institucional (`#0055A4`)

**Variable CSS:** `--institutional-blue`

**Psicología:** Transmite confianza, profesionalismo y calma mental. Reduce ansiedad.

**Uso:**
```tsx
// Botones principales
<button className="btn-institutional">Acción Principal</button>

// Texto
<p className="text-institutional-blue">Texto importante</p>

// Fondo
<div style={{ backgroundColor: 'oklch(var(--institutional-blue))' }}>
  Contenido
</div>
```

**Aplicaciones:**
- Botones de acción principal
- Headers estratégicos
- Links de navegación
- Estado mental "Estratégico"

---

### Naranja de Seguridad (`#FF8C00`)

**Variable CSS:** `--safety-orange`

**Psicología:** Energía controlada, visibilidad industrial. Motiva sin estresar.

**Uso:**
```tsx
// Botones de acción
<button className="btn-safety-orange">Acción Importante</button>

// Texto
<p className="text-safety-orange">Alerta visible</p>

// Badges
<span className="badge-administrative">Administrativo</span>
```

**Aplicaciones:**
- Acciones importantes pero no críticas
- Estado mental "Administrativo"
- Alertas de atención media
- Elementos de navegación secundarios

---

## 🔺 Dashboard Triádico (Estados Mentales)

El Dashboard Triádico utiliza tres colores específicos para representar los tres estados mentales del prevencionista:

### 1. Verde Operativo

**Variable:** `--triadic-operative`  
**Estado Mental:** Acciones en terreno, seguridad activa

**Psicología:** Indica "todo OK", reduce tensión. Sensación de naturaleza y seguridad.

```tsx
// Card operativa
<div className="card-operative">
  <h3>Inspección de Campo</h3>
  <p>Contenido...</p>
</div>

// Badge
<span className="badge-operative">Operativo</span>

// Gradiente
<div className="bg-operative-gradient p-6 text-white">
  Dashboard Operativo
</div>
```

---

### 2. Naranja Administrativo

**Variable:** `--triadic-administrative`  
**Estado Mental:** Gestión documental, tareas de oficina

**Psicología:** Energía positiva para gestión. Productividad sin agresividad.

```tsx
// Card administrativa
<div className="card-administrative">
  <h3>Documentos Pendientes</h3>
  <p>Contenido...</p>
</div>

// Badge
<span className="badge-administrative">Administrativo</span>

// Gradiente
<div className="bg-administrative-gradient p-6 text-white">
  Dashboard Administrativo
</div>
```

---

### 3. Azul Estratégico

**Variable:** `--triadic-strategic`  
**Estado Mental:** Análisis, cumplimiento, visión global

**Psicología:** Fomenta pensamiento crítico y toma de decisiones.

```tsx
// Card estratégica
<div className="card-strategic">
  <h3>Análisis de Cumplimiento</h3>
  <p>Contenido...</p>
</div>

// Badge
<span className="badge-strategic">Estratégico</span>

// Gradiente
<div className="bg-strategic-gradient p-6 text-white">
  Dashboard Estratégico
</div>
```

---

## ⚠️ Colores de Estado

### Éxito (Verde)

**Variable:** `--success`  
**Psicología:** Sensación de logro y progreso positivo

```tsx
<div className="highlight-success">
  <p>Operación completada exitosamente</p>
</div>
```

---

### Advertencia (Amarillo)

**Variable:** `--warning`  
**Psicología:** Precaución sin pánico

```tsx
<div className="highlight-warning">
  <p>Requiere revisión</p>
</div>
```

---

### Peligro (Rojo)

**Variable:** `--danger`  
**Psicología:** SOLO para situaciones críticas

```tsx
// Botón crítico de accidente
<button className="btn-critical">
  <AlertTriangle className="w-4 h-4 mr-2" />
  Reportar Accidente
</button>

<div className="highlight-danger">
  <p>Acción irreversible</p>
</div>
```

⚠️ **IMPORTANTE:** Usar el rojo SOLO cuando sea absolutamente necesario para no desensibilizar al usuario.

---

### Información (Azul)

**Variable:** `--info`  
**Psicología:** Información neutra, no urgente

```tsx
<div className="highlight-info">
  <p>Dato informativo</p>
</div>
```

---

## 🚦 Semáforo de Cumplimiento

Sistema gradual de 5 colores para comunicar estado de cumplimiento normativo:

### 1. Excelente (>90%)
**Variable:** `--compliance-excellent`  
**Color:** Verde brillante

```tsx
<div className="status-excellent">
  Cumplimiento: 95%
</div>

<div className="border-compliance-excellent border-2 p-4">
  Empresa con excelente desempeño
</div>
```

---

### 2. Bueno (80-90%)
**Variable:** `--compliance-good`  
**Color:** Verde lima

```tsx
<div className="status-good">
  Cumplimiento: 85%
</div>
```

---

### 3. Advertencia (70-80%)
**Variable:** `--compliance-warning`  
**Color:** Amarillo

```tsx
<div className="status-warning">
  Cumplimiento: 75%
</div>

<div className="border-compliance-warning border-2 p-4">
  Requiere atención
</div>
```

---

### 4. Alerta (60-70%)
**Variable:** `--compliance-alert`  
**Color:** Naranja

```tsx
<div className="status-alert">
  Cumplimiento: 65%
</div>
```

---

### 5. Crítico (<60%)
**Variable:** `--compliance-critical`  
**Color:** Rojo

```tsx
<div className="status-critical">
  Cumplimiento: 50%
</div>

<div className="border-compliance-critical border-2 p-4">
  Intervención inmediata requerida
</div>
```

---

## 🌓 Modo Claro vs Modo Oscuro

### Modo Claro (Light)
- **Optimizado para:** Trabajo de campo bajo luz solar
- **Fondo:** Gris muy claro (`oklch(98% 0.004 264)`)
- **Características:** Alto contraste, colores vibrantes pero controlados

### Modo Oscuro (Dark)
- **Optimizado para:** Trabajo nocturno o en oficina
- **Fondo:** Gris oscuro no puro (`oklch(18% 0.010 264)`)
- **Características:** Colores menos saturados, suaves, sin deslumbrar

**Transición automática:**
El sistema cambia automáticamente la paleta según el tema activo. Todos los colores están optimizados para cada modo.

```tsx
// Los colores se adaptan automáticamente
<div className="bg-card text-card-foreground">
  Este contenido se ve bien en ambos modos
</div>
```

---

## 🛠️ Clases Utilitarias

### Gradientes

```tsx
// Gradientes temáticos
<div className="gradient-operative">Operativo</div>
<div className="gradient-administrative">Administrativo</div>
<div className="gradient-strategic">Estratégico</div>
<div className="gradient-calm">Calma institucional</div>
<div className="gradient-energy">Energía naranja</div>
<div className="gradient-success">Éxito</div>
```

---

### Sombras

```tsx
// Sombras optimizadas (del más suave al más intenso)
<div className="shadow-soft">Sombra suave</div>
<div className="shadow-soft-md">Sombra media</div>
<div className="shadow-soft-lg">Sombra grande</div>
<div className="shadow-soft-xl">Sombra extra grande</div>
<div className="shadow-critical">Sombra para FAB crítico</div>
```

---

### Interactividad

```tsx
// Elementos interactivos con feedback visual
<button className="interactive">
  Botón con hover animado
</button>
```

**Comportamiento:**
- **Hover:** Se eleva 2px con sombra
- **Active:** Vuelve a posición original
- **Móvil:** Opacidad 0.8 en touch

---

### Badges

```tsx
<span className="badge-operative">Operativo</span>
<span className="badge-administrative">Administrativo</span>
<span className="badge-strategic">Estratégico</span>
<span className="badge-auto">Automático</span>
```

---

### Indicadores de Sincronización

```tsx
<div className="sync-online"></div>    {/* Verde pulsante */}
<div className="sync-offline"></div>   {/* Gris estático */}
<div className="sync-syncing"></div>   {/* Amarillo pulsante */}
<div className="sync-error"></div>     {/* Rojo pulsante */}
```

---

### Dividers Temáticos

```tsx
<div className="divider-operative"></div>
<div className="divider-administrative"></div>
<div className="divider-strategic"></div>
```

---

### Glass Morphism

```tsx
<div className="glass-card p-6">
  Card con efecto glass
</div>
```

---

### Scrollbar Personalizada

```tsx
<div className="custom-scrollbar overflow-auto">
  Contenido con scroll personalizado
</div>
```

---

## 💡 Ejemplos de Uso

### Botón Crítico de Accidente

```tsx
import { AlertTriangle } from 'lucide-react';

<button className="btn-critical">
  <AlertTriangle className="w-5 h-5 mr-2" />
  Reportar Accidente Grave
</button>
```

---

### Card de Dashboard Operativo

```tsx
import { CheckCircle2 } from 'lucide-react';

<div className="card-operative">
  <div className="flex items-center gap-2 mb-3">
    <CheckCircle2 className="w-5 h-5" style={{ color: 'oklch(var(--triadic-operative))' }} />
    <h3 className="font-medium">Inspección de Campo</h3>
  </div>
  <p className="text-sm text-muted-foreground">
    15 inspecciones completadas hoy
  </p>
  <div className="mt-4 flex gap-2">
    <span className="badge-operative">Activo</span>
    <span className="badge-auto">Sincronizado</span>
  </div>
</div>
```

---

### Banner de Estado de Cumplimiento

```tsx
const compliancePercentage = 85; // 85%

const getComplianceStatus = (percentage: number) => {
  if (percentage >= 90) return { class: 'status-excellent', label: 'Excelente' };
  if (percentage >= 80) return { class: 'status-good', label: 'Bueno' };
  if (percentage >= 70) return { class: 'status-warning', label: 'Advertencia' };
  if (percentage >= 60) return { class: 'status-alert', label: 'Alerta' };
  return { class: 'status-critical', label: 'Crítico' };
};

const status = getComplianceStatus(compliancePercentage);

<div className={`${status.class} p-4 rounded-lg`}>
  <h4 className="font-medium">Cumplimiento Normativo: {compliancePercentage}%</h4>
  <p className="text-sm">Estado: {status.label}</p>
</div>
```

---

### Selector de Estado Mental (Dashboard Triádico)

```tsx
import { CheckCircle2, Gauge, Brain } from 'lucide-react';

type MentalState = 'operative' | 'administrative' | 'strategic';

const [mentalState, setMentalState] = useState<MentalState>('operative');

<div className="flex gap-2">
  <button
    onClick={() => setMentalState('operative')}
    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
      mentalState === 'operative' 
        ? 'border-[oklch(var(--triadic-operative))] bg-operative-gradient text-white' 
        : 'border-border bg-card hover:border-[oklch(var(--triadic-operative))]'
    }`}
  >
    <CheckCircle2 className="w-6 h-6 mx-auto mb-2" />
    <p className="text-sm font-medium">Operativo</p>
  </button>

  <button
    onClick={() => setMentalState('administrative')}
    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
      mentalState === 'administrative' 
        ? 'border-[oklch(var(--triadic-administrative))] bg-administrative-gradient text-white' 
        : 'border-border bg-card hover:border-[oklch(var(--triadic-administrative))]'
    }`}
  >
    <Gauge className="w-6 h-6 mx-auto mb-2" />
    <p className="text-sm font-medium">Administrativo</p>
  </button>

  <button
    onClick={() => setMentalState('strategic')}
    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
      mentalState === 'strategic' 
        ? 'border-[oklch(var(--triadic-strategic))] bg-strategic-gradient text-white' 
        : 'border-border bg-card hover:border-[oklch(var(--triadic-strategic))]'
    }`}
  >
    <Brain className="w-6 h-6 mx-auto mb-2" />
    <p className="text-sm font-medium">Estratégico</p>
  </button>
</div>
```

---

### Indicador de Sincronización Inteligente

```tsx
import { Wifi, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';

const SyncIndicator = ({ status }: { status: 'online' | 'offline' | 'syncing' | 'error' }) => {
  const config = {
    online: { icon: Wifi, class: 'sync-online', text: 'En línea' },
    offline: { icon: WifiOff, class: 'sync-offline', text: 'Sin conexión' },
    syncing: { icon: RefreshCw, class: 'sync-syncing', text: 'Sincronizando...' },
    error: { icon: AlertCircle, class: 'sync-error', text: 'Error de sincronización' }
  };

  const { icon: Icon, class: statusClass, text } = config[status];

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted">
      <div className={statusClass}></div>
      <Icon className="w-4 h-4" />
      <span className="text-sm">{text}</span>
    </div>
  );
};
```

---

## 🎯 Mejores Prácticas

### ✅ Hacer

1. **Usar colores semánticos:** Emplear las variables CSS en lugar de colores hardcodeados
   ```tsx
   // ✅ Bien
   <div style={{ backgroundColor: 'oklch(var(--success))' }}>Éxito</div>
   
   // ❌ Mal
   <div style={{ backgroundColor: '#22c55e' }}>Éxito</div>
   ```

2. **Respetar la jerarquía de urgencia:** Rojo solo para crítico
   ```tsx
   // ✅ Bien - Accidente grave
   <button className="btn-critical">Reportar Accidente</button>
   
   // ❌ Mal - Error menor
   <span className="text-danger">Campo vacío</span>
   ```

3. **Usar el Dashboard Triádico:** Identificar claramente el estado mental
   ```tsx
   // ✅ Bien - Estado mental claro
   <div className="card-operative">Inspección de campo</div>
   <div className="card-strategic">Análisis de datos</div>
   ```

4. **Aprovechar las clases utilitarias:** No reinventar estilos
   ```tsx
   // ✅ Bien
   <button className="interactive btn-institutional">Acción</button>
   
   // ❌ Mal
   <button style={{ /* múltiples propiedades */ }}>Acción</button>
   ```

---

### ❌ Evitar

1. **Abuso del rojo:** No usar para todo lo negativo
2. **Mezclar estados mentales:** Un componente debe tener un estado claro
3. **Ignorar el modo oscuro:** Siempre probar en ambos modos
4. **Hardcodear colores:** Usar siempre variables CSS
5. **Demasiados colores simultáneos:** Mantener la jerarquía visual

---

## 🧪 Testing de Colores

Para visualizar y validar todos los colores del sistema:

```tsx
import { ColorSystemDemo } from '@/app/components/ColorSystemDemo';

// En tu aplicación
<ColorSystemDemo onBack={() => console.log('Volver')} />
```

O navega a la vista: `color-system-demo` en AppContent.tsx

---

## 📱 Accesibilidad

Todos los colores cumplen con estándares **WCAG AAA** de contraste:

- Texto sobre fondo claro: ratio ≥ 7:1
- Texto sobre fondo oscuro: ratio ≥ 7:1
- Elementos interactivos: ratio ≥ 4.5:1

El sistema también respeta:
- `prefers-contrast: high` (alto contraste)
- `prefers-reduced-motion` (reducción de movimiento)

---

## 🔄 Actualizaciones

**Versión:** 2.0  
**Última actualización:** Enero 2026  
**Formato de color:** OKLCH (mejor percepción visual)

---

## 📞 Soporte

Para dudas sobre el sistema de color:
- Revisa `/src/styles/theme.css` (variables principales)
- Revisa `/src/styles/colors.css` (utilidades y extensiones)
- Consulta este documento

---

**SafeTrack Chile** - Sistema de color diseñado para reducir el estrés del prevencionista 💚
