import { useState } from 'react';
import { 
  Palette, 
  Eye, 
  Brain, 
  Heart, 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  Info,
  Zap,
  Moon,
  Sun,
  Gauge,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface ColorDemo {
  name: string;
  variable: string;
  psychology: string;
  usage: string;
  icon: React.ReactNode;
}

interface ColorSystemDemoProps {
  onBack?: () => void;
}

export function ColorSystemDemo({ onBack }: ColorSystemDemoProps) {
  const [showPsychology, setShowPsychology] = useState(true);

  const corporateColors: ColorDemo[] = [
    {
      name: 'Azul Institucional',
      variable: '--institutional-blue',
      psychology: 'Transmite confianza, profesionalismo y calma mental. Reduce ansiedad.',
      usage: 'Botones principales, encabezados, estado estratégico',
      icon: <Shield className="w-5 h-5" />
    },
    {
      name: 'Naranja de Seguridad',
      variable: '--safety-orange',
      psychology: 'Energía controlada, visibilidad industrial. Motiva sin estresar.',
      usage: 'Acciones importantes, estado administrativo, alertas',
      icon: <Zap className="w-5 h-5" />
    }
  ];

  const triadicColors: ColorDemo[] = [
    {
      name: 'Verde Operativo',
      variable: '--triadic-operative',
      psychology: 'Indica "todo OK", reduce tensión. Sensación de naturaleza y seguridad.',
      usage: 'Dashboard operativo, acciones en terreno, confirmaciones',
      icon: <CheckCircle2 className="w-5 h-5" />
    },
    {
      name: 'Naranja Administrativo',
      variable: '--triadic-administrative',
      psychology: 'Energía positiva para gestión documental. Productividad sin agresividad.',
      usage: 'Dashboard administrativo, gestión de documentos, tareas pendientes',
      icon: <Gauge className="w-5 h-5" />
    },
    {
      name: 'Azul Estratégico',
      variable: '--triadic-strategic',
      psychology: 'Análisis, visión global. Fomenta pensamiento crítico y toma de decisiones.',
      usage: 'Dashboard estratégico, estadísticas, reportes ejecutivos',
      icon: <Brain className="w-5 h-5" />
    }
  ];

  const stateColors: ColorDemo[] = [
    {
      name: 'Éxito',
      variable: '--success',
      psychology: 'Verde vivo que genera sensación de logro y progreso positivo.',
      usage: 'Validaciones exitosas, cumplimiento alto, operaciones completadas',
      icon: <CheckCircle2 className="w-5 h-5" />
    },
    {
      name: 'Advertencia',
      variable: '--warning',
      psychology: 'Amarillo mostaza que llama la atención sin generar pánico.',
      usage: 'Precauciones, revisiones pendientes, cumplimiento medio',
      icon: <AlertTriangle className="w-5 h-5" />
    },
    {
      name: 'Peligro',
      variable: '--danger',
      psychology: 'Rojo controlado SOLO para situaciones críticas. Máxima urgencia.',
      usage: 'Botón de accidente, errores críticos, cumplimiento bajo',
      icon: <AlertTriangle className="w-5 h-5" />
    },
    {
      name: 'Información',
      variable: '--info',
      psychology: 'Azul cielo neutro para datos sin urgencia. No genera estrés.',
      usage: 'Tooltips, ayudas contextuales, notificaciones informativas',
      icon: <Info className="w-5 h-5" />
    }
  ];

  const complianceColors: ColorDemo[] = [
    {
      name: 'Excelente (>90%)',
      variable: '--compliance-excellent',
      psychology: 'Verde brillante - Refuerzo positivo máximo',
      usage: 'Cumplimiento superior al 90%',
      icon: <CheckCircle2 className="w-5 h-5" />
    },
    {
      name: 'Bueno (80-90%)',
      variable: '--compliance-good',
      psychology: 'Verde lima - Buen desempeño con espacio de mejora',
      usage: 'Cumplimiento entre 80% y 90%',
      icon: <CheckCircle2 className="w-5 h-5" />
    },
    {
      name: 'Advertencia (70-80%)',
      variable: '--compliance-warning',
      psychology: 'Amarillo - Requiere atención sin alarmar',
      usage: 'Cumplimiento entre 70% y 80%',
      icon: <AlertTriangle className="w-5 h-5" />
    },
    {
      name: 'Alerta (60-70%)',
      variable: '--compliance-alert',
      psychology: 'Naranja - Acción necesaria pronto',
      usage: 'Cumplimiento entre 60% y 70%',
      icon: <AlertTriangle className="w-5 h-5" />
    },
    {
      name: 'Crítico (<60%)',
      variable: '--compliance-critical',
      psychology: 'Rojo - Intervención inmediata requerida',
      usage: 'Cumplimiento menor al 60%',
      icon: <AlertTriangle className="w-5 h-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        {onBack && (
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        )}
        
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-strategic text-white">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-medium">Sistema de Color SafeTrack Chile</h1>
            <p className="text-muted-foreground">Paleta optimizada con psicología del color</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={showPsychology ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPsychology(!showPsychology)}
          >
            <Brain className="w-4 h-4 mr-2" />
            {showPsychology ? 'Ocultar' : 'Mostrar'} Psicología
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Principios de Diseño */}
        <section className="bg-card rounded-xl border p-6 shadow-soft">
          <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-institutional-blue" />
            Principios de Diseño
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-institutional-blue mb-2">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-medium mb-1">Reducción de Estrés</h3>
              <p className="text-sm text-muted-foreground">
                Colores calibrados para minimizar fatiga cognitiva durante jornadas extensas
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-success mb-2">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="font-medium mb-1">Fatiga Visual</h3>
              <p className="text-sm text-muted-foreground">
                Contraste optimizado para trabajo bajo luz solar y en oficina sin cansar la vista
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-safety-orange mb-2">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-medium mb-1">Bienestar Emocional</h3>
              <p className="text-sm text-muted-foreground">
                Paleta que promueve calma, confianza y sensación de control
              </p>
            </div>
          </div>
        </section>

        {/* Colores Corporativos */}
        <section>
          <h2 className="text-xl font-medium mb-4">Colores Corporativos</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {corporateColors.map((color) => (
              <div key={color.name} className="bg-card rounded-xl border shadow-soft overflow-hidden">
                <div 
                  className="h-24 flex items-center justify-center"
                  style={{ backgroundColor: `oklch(var(${color.variable}))` }}
                >
                  <div className="text-white">
                    {color.icon}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-1">{color.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{color.usage}</p>
                  {showPsychology && (
                    <div className="mt-3 p-3 rounded-lg bg-muted/50 border-l-4 border-info">
                      <p className="text-sm flex items-start gap-2">
                        <Brain className="w-4 h-4 mt-0.5 text-info flex-shrink-0" />
                        {color.psychology}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dashboard Triádico */}
        <section>
          <h2 className="text-xl font-medium mb-4">Dashboard Triádico (Estados Mentales)</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {triadicColors.map((color) => (
              <div key={color.name} className="bg-card rounded-xl border shadow-soft overflow-hidden">
                <div 
                  className="h-24 flex items-center justify-center"
                  style={{ backgroundColor: `oklch(var(${color.variable}))` }}
                >
                  <div className="text-white">
                    {color.icon}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-1">{color.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{color.usage}</p>
                  {showPsychology && (
                    <div className="mt-3 p-3 rounded-lg bg-muted/50 border-l-4 border-info">
                      <p className="text-sm flex items-start gap-2">
                        <Brain className="w-4 h-4 mt-0.5 text-info flex-shrink-0" />
                        {color.psychology}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Colores de Estado */}
        <section>
          <h2 className="text-xl font-medium mb-4">Colores de Estado</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {stateColors.map((color) => (
              <div key={color.name} className="bg-card rounded-xl border shadow-soft overflow-hidden">
                <div 
                  className="h-20 flex items-center justify-center"
                  style={{ backgroundColor: `oklch(var(${color.variable}))` }}
                >
                  <div className="text-white">
                    {color.icon}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-1">{color.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{color.usage}</p>
                  {showPsychology && (
                    <div className="mt-3 p-3 rounded-lg bg-muted/50 border-l-4 border-info">
                      <p className="text-sm flex items-start gap-2">
                        <Brain className="w-4 h-4 mt-0.5 text-info flex-shrink-0" />
                        {color.psychology}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Semáforo de Cumplimiento */}
        <section>
          <h2 className="text-xl font-medium mb-4">Semáforo de Cumplimiento</h2>
          <div className="bg-card rounded-xl border p-6 shadow-soft">
            <p className="text-sm text-muted-foreground mb-6">
              Sistema de colores gradual que comunica estado de cumplimiento sin generar estrés innecesario
            </p>
            <div className="space-y-3">
              {complianceColors.map((color) => (
                <div key={color.name} className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-lg flex items-center justify-center shadow-soft"
                    style={{ backgroundColor: `oklch(var(${color.variable}))` }}
                  >
                    <div className="text-white">
                      {color.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{color.name}</h3>
                    <p className="text-sm text-muted-foreground">{color.usage}</p>
                    {showPsychology && (
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <Brain className="w-3.5 h-3.5 text-info" />
                        {color.psychology}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ejemplos de Uso */}
        <section>
          <h2 className="text-xl font-medium mb-4">Ejemplos de Uso</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Cards Temáticas */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Cards por Estado Mental</h3>
              <div className="card-operative">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5" style={{ color: 'oklch(var(--triadic-operative))' }} />
                  <h4 className="font-medium">Estado Operativo</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Para acciones en terreno y gestión de seguridad activa
                </p>
              </div>
              <div className="card-administrative">
                <div className="flex items-center gap-2 mb-2">
                  <Gauge className="w-5 h-5" style={{ color: 'oklch(var(--triadic-administrative))' }} />
                  <h4 className="font-medium">Estado Administrativo</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Para documentación y gestión de tareas
                </p>
              </div>
              <div className="card-strategic">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5" style={{ color: 'oklch(var(--triadic-strategic))' }} />
                  <h4 className="font-medium">Estado Estratégico</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Para análisis y toma de decisiones ejecutivas
                </p>
              </div>
            </div>

            {/* Botones y Badges */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Botones Especializados</h3>
              <div className="space-y-3 p-4 bg-card rounded-lg border">
                <button className="btn-critical w-full">
                  <AlertTriangle className="w-4 h-4 mr-2 inline" />
                  Botón Crítico de Accidente
                </button>
                <button className="btn-safety-orange w-full">
                  <Zap className="w-4 h-4 mr-2 inline" />
                  Acción con Naranja de Seguridad
                </button>
                <button className="btn-institutional w-full">
                  <Shield className="w-4 h-4 mr-2 inline" />
                  Acción con Azul Institucional
                </button>
              </div>

              <h3 className="text-sm font-medium text-muted-foreground mt-6">Badges de Estado</h3>
              <div className="flex flex-wrap gap-2 p-4 bg-card rounded-lg border">
                <span className="badge-operative">Operativo</span>
                <span className="badge-administrative">Administrativo</span>
                <span className="badge-strategic">Estratégico</span>
                <span className="badge-auto">Auto</span>
              </div>
            </div>
          </div>
        </section>

        {/* Gradientes */}
        <section>
          <h2 className="text-xl font-medium mb-4">Gradientes Temáticos</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-operative-gradient rounded-xl p-6 text-white shadow-soft-lg">
              <CheckCircle2 className="w-8 h-8 mb-2" />
              <h3 className="font-medium mb-1">Gradiente Operativo</h3>
              <p className="text-sm opacity-90">Para acciones de campo</p>
            </div>
            <div className="bg-administrative-gradient rounded-xl p-6 text-white shadow-soft-lg">
              <Gauge className="w-8 h-8 mb-2" />
              <h3 className="font-medium mb-1">Gradiente Administrativo</h3>
              <p className="text-sm opacity-90">Para gestión documental</p>
            </div>
            <div className="bg-strategic-gradient rounded-xl p-6 text-white shadow-soft-lg">
              <Brain className="w-8 h-8 mb-2" />
              <h3 className="font-medium mb-1">Gradiente Estratégico</h3>
              <p className="text-sm opacity-90">Para análisis ejecutivo</p>
            </div>
          </div>
        </section>

        {/* Modo Oscuro */}
        <section className="bg-card rounded-xl border p-6 shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <Moon className="w-5 h-5 text-institutional-blue" />
            <h2 className="text-xl font-medium">Modo Oscuro Optimizado</h2>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Reducción de luminosidad:</strong> Todos los colores han sido ajustados para ser menos saturados y más suaves, reduciendo la fatiga ocular durante trabajo nocturno.
            </p>
            <p>
              <strong className="text-foreground">Fondos estratificados:</strong> Sistema de capas de gris oscuro (no negro puro) que mantiene jerarquía visual sin deslumbrar.
            </p>
            <p>
              <strong className="text-foreground">Contraste calibrado:</strong> Relación de contraste optimizada para cumplir WCAG AAA sin causar tensión visual.
            </p>
          </div>
        </section>

        {/* Footer */}
        <div className="bg-muted/50 rounded-xl p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Sistema de color diseñado específicamente para reducir el estrés del prevencionista en SafeTrack Chile
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Todos los colores cumplen con estándares WCAG de accesibilidad
          </p>
        </div>
      </div>
    </div>
  );
}