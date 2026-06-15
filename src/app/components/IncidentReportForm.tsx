import { useState } from 'react';
import { ArrowLeft, Save, FileText, Mic, MapPin, Camera, Users } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { VoiceInput } from '@/app/components/VoiceInput';
import { toast } from 'sonner';

interface IncidentReportFormProps {
  onBack: () => void;
  onSubmit: () => void;
}

export function IncidentReportForm({ onBack, onSubmit }: IncidentReportFormProps) {
  const [formData, setFormData] = useState({
    incidentType: '',
    affectedWorker: '',
    location: '',
    dateTime: '',
    description: '', // Este campo usará dictado de voz
    immediateCauses: '',
    basicCauses: '',
    correctiveActions: '',
    witnesses: ''
  });

  const [activeVoiceField, setActiveVoiceField] = useState<string | null>(null);

  const handleVoiceTranscript = (field: string, text: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev] 
        ? `${prev[field as keyof typeof prev]} ${text}` 
        : text
    }));
  };

  const handleSubmit = () => {
    if (!formData.description) {
      toast.error('Descripción Requerida', {
        description: 'Debes describir el incidente usando el dictado de voz o escribiendo'
      });
      return;
    }

    toast.success('✅ Reporte de Incidente Guardado', {
      description: 'El reporte ha sido registrado con éxito',
      duration: 3000
    });

    setTimeout(() => {
      onSubmit();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors pb-20 lg:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-700 dark:to-orange-700 border-b border-red-500 dark:border-red-600 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver</span>
            </button>
            <Badge className="bg-white/20 text-white border-0">
              <Mic className="w-3 h-3 mr-1" />
              Dictado Habilitado
            </Badge>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-white text-xl lg:text-2xl mb-1 font-bold">
                📋 Reporte de Incidente
              </h1>
              <p className="text-white/80 text-sm">
                Usa dictado de voz para agilizar el registro
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Alerta informativa */}
        <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <div className="flex items-start gap-3">
            <Mic className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                🎤 Dictado de Voz Habilitado
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Usa el botón de micrófono en cada campo para dictar el contenido. 
                El sistema convertirá tu voz a texto automáticamente usando Google Speech API.
              </p>
            </div>
          </div>
        </Card>

        {/* Datos Básicos */}
        <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-600" />
            Datos Básicos del Incidente
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Tipo de Incidente *
              </Label>
              <select
                value={formData.incidentType}
                onChange={(e) => setFormData({ ...formData, incidentType: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Seleccionar...</option>
                <option value="accidente-trabajo">Accidente de Trabajo</option>
                <option value="accidente-trayecto">Accidente de Trayecto</option>
                <option value="cuasi-accidente">Cuasi Accidente</option>
                <option value="condicion-insegura">Condición Insegura</option>
                <option value="acto-inseguro">Acto Inseguro</option>
              </select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Trabajador Afectado *
              </Label>
              <Input
                value={formData.affectedWorker}
                onChange={(e) => setFormData({ ...formData, affectedWorker: e.target.value })}
                placeholder="Nombre del trabajador"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Ubicación *
              </Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Lugar exacto del incidente"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Fecha y Hora *
              </Label>
              <Input
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
              />
            </div>
          </div>
        </Card>

        {/* Descripción del Incidente - CON DICTADO DE VOZ */}
        <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600" />
              Descripción del Incidente *
            </h2>
            <Badge className="bg-blue-600 text-white border-0">
              <Mic className="w-3 h-3 mr-1" />
              Usa tu Voz
            </Badge>
          </div>

          <div className="relative">
            <Label className="text-sm font-medium mb-2 block">
              Describe lo ocurrido (puedes escribir o usar el micrófono)
            </Label>
            <div className="flex gap-2">
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ejemplo: El trabajador resbaló en superficie mojada mientras transportaba material..."
                className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[120px]"
              />
              <VoiceInput
                buttonVariant="floating"
                onTranscript={(text) => handleVoiceTranscript('description', text)}
                placeholder="Dicta la descripción del incidente"
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-2">
              💡 Presiona el micrófono y habla claramente. El texto se agregará automáticamente.
            </p>
          </div>
        </Card>

        {/* Análisis de Causas - CON DICTADO DE VOZ */}
        <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            🔍 Análisis de Causas (Método de Árbol de Causas)
          </h2>

          <div className="space-y-4">
            {/* Causas Inmediatas */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Causas Inmediatas
              </Label>
              <div className="flex gap-2">
                <textarea
                  value={formData.immediateCauses}
                  onChange={(e) => setFormData({ ...formData, immediateCauses: e.target.value })}
                  placeholder="Ej: Superficie resbalosa, falta de señalización..."
                  className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px]"
                />
                <VoiceInput
                  buttonVariant="floating"
                  onTranscript={(text) => handleVoiceTranscript('immediateCauses', text)}
                />
              </div>
            </div>

            {/* Causas Básicas */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Causas Básicas
              </Label>
              <div className="flex gap-2">
                <textarea
                  value={formData.basicCauses}
                  onChange={(e) => setFormData({ ...formData, basicCauses: e.target.value })}
                  placeholder="Ej: Falta de procedimiento de limpieza, supervisión insuficiente..."
                  className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px]"
                />
                <VoiceInput
                  buttonVariant="floating"
                  onTranscript={(text) => handleVoiceTranscript('basicCauses', text)}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Medidas Correctivas - CON DICTADO DE VOZ */}
        <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            ✅ Medidas Correctivas y Preventivas
          </h2>

          <div>
            <Label className="text-sm font-medium mb-2 block">
              Acciones Implementadas o Propuestas
            </Label>
            <div className="flex gap-2">
              <textarea
                value={formData.correctiveActions}
                onChange={(e) => setFormData({ ...formData, correctiveActions: e.target.value })}
                placeholder="Ej: Se instalará señalética, se reforzará capacitación en uso de EPP..."
                className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px]"
              />
              <VoiceInput
                buttonVariant="floating"
                onTranscript={(text) => handleVoiceTranscript('correctiveActions', text)}
              />
            </div>
          </div>
        </Card>

        {/* Testigos */}
        <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            👥 Testigos Presenciales
          </h2>

          <div>
            <Label className="text-sm font-medium mb-2 block">
              Nombres de Testigos (Opcional)
            </Label>
            <Input
              value={formData.witnesses}
              onChange={(e) => setFormData({ ...formData, witnesses: e.target.value })}
              placeholder="Separados por coma: Juan Pérez, María González..."
            />
          </div>
        </Card>

        {/* Botones de acción */}
        <div className="flex gap-3 sticky bottom-4">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 lg:flex-none lg:px-8"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 lg:flex-none lg:px-12 bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar Reporte
          </Button>
        </div>
      </div>
    </div>
  );
}
