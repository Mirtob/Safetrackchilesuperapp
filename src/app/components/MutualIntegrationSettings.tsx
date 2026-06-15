import { useState } from 'react';
import { ArrowLeft, Mail, Copy, Check, Info, Zap, Shield, FileText, Download } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { toast } from 'sonner';

interface MutualIntegrationSettingsProps {
  onBack: () => void;
  onViewPendingDocuments: () => void;
}

export function MutualIntegrationSettings({ onBack, onViewPendingDocuments }: MutualIntegrationSettingsProps) {
  const [aiReadingEnabled, setAiReadingEnabled] = useState(true);
  const [emailCopied, setEmailCopied] = useState(false);
  const [autoArchiveEnabled, setAutoArchiveEnabled] = useState(true);
  
  // Correo único de ingesta generado para esta empresa
  const ingestEmail = 'constructora-los-andes-s8k2@safeflow-mail.com';
  
  const handleCopyEmail = () => {
    navigator.clipboard.writeText(ingestEmail);
    setEmailCopied(true);
    toast.success('✅ Correo Copiado', {
      description: 'Ahora pégalo en el portal de tu Mutualidad'
    });
    
    setTimeout(() => setEmailCopied(false), 3000);
  };

  const handleTestEmail = () => {
    toast.info('📧 Enviando correo de prueba...', {
      description: 'Revisa tu bandeja de entrada'
    });
    
    setTimeout(() => {
      toast.success('✅ Email de prueba enviado', {
        description: 'Recibirás un ejemplo de certificado en 1 minuto'
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors pb-20 lg:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 border-b border-blue-500 dark:border-blue-600 sticky top-0 z-10">
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
              <Zap className="w-3 h-3 mr-1" />
              IA Activa
            </Badge>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-white text-xl lg:text-2xl mb-1 font-bold">
                🤖 Ingesta Inteligente de Certificados
              </h1>
              <p className="text-white/80 text-sm">
                Recibe certificados de Mutualidades automáticamente con lectura IA
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Alerta informativa */}
        <Card className="p-4 bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-900">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-cyan-900 dark:text-cyan-100 mb-2">
                🎯 ¿Cómo Funciona la Ingesta Automática?
              </h3>
              <div className="text-sm text-cyan-800 dark:text-cyan-300 space-y-1">
                <p>1. Tu Mutualidad envía el certificado mensual a tu correo único de SafeFlow</p>
                <p>2. Nuestra IA extrae automáticamente: Mes, Trabajadores, HHT, Accidentes, Tasas IF/IG</p>
                <p>3. Tú solo validas los datos extraídos (toma 30 segundos)</p>
                <p>4. Los datos se integran automáticamente al Dashboard</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Sección 1: Correo de Ingesta Único */}
        <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-orange-600 to-red-600">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                📧 Tu Correo de Ingesta Único
              </h2>
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                Comparte este correo con tu Mutualidad (ACHS, Mutual, IST, etc.)
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Correo de Recepción Automática
              </Label>
              <div className="flex gap-2">
                <Input
                  value={ingestEmail}
                  readOnly
                  className="font-mono text-sm bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700"
                />
                <Button
                  onClick={handleCopyEmail}
                  className={`${
                    emailCopied 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-orange-600 hover:bg-orange-700'
                  } text-white transition-all`}
                >
                  {emailCopied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Instrucciones visuales 3 pasos */}
            <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-lg p-4 border border-slate-200 dark:border-zinc-700">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">
                📋 Instrucciones de Configuración (3 Pasos Simples):
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-white text-sm">
                      Accede al Portal de tu Mutualidad
                    </div>
                    <div className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                      Ingresa a ACHS Online, Mutual, IST u otro según tu caso
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-white text-sm">
                      Configura el Envío Automático de Certificados
                    </div>
                    <div className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                      Busca "Notificaciones" o "Envío de Certificados" y agrega tu correo de ingesta
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white font-bold text-sm flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-white text-sm">
                      ¡Listo! Recibirás los Certificados Aquí
                    </div>
                    <div className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                      Cada mes la IA procesará automáticamente el certificado recibido
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleTestEmail}
              variant="outline"
              className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
            >
              <Download className="w-4 h-4 mr-2" />
              Enviar Correo de Prueba
            </Button>
          </div>
        </Card>

        {/* Sección 2: Configuración de IA */}
        <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                🤖 Configuración de Lectura IA
              </h2>
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                Activa o desactiva la extracción automática de datos
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-lg border border-slate-200 dark:border-zinc-700">
              <div className="flex-1">
                <div className="font-medium text-slate-900 dark:text-white">
                  Lectura Automática con IA
                </div>
                <div className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
                  La IA extraerá datos de certificados PDF automáticamente
                </div>
              </div>
              <Switch
                checked={aiReadingEnabled}
                onCheckedChange={setAiReadingEnabled}
                className="ml-4"
              />
            </div>

            {aiReadingEnabled && (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                      ✅ IA Activa - Campos que se Extraen Automáticamente:
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-green-800 dark:text-green-300">
                      <div>• Mes del Certificado</div>
                      <div>• N° Trabajadores</div>
                      <div>• Horas Hombre Trabajadas</div>
                      <div>• N° Accidentes</div>
                      <div>• Tasa de Accidentabilidad (IF)</div>
                      <div>• Tasa de Gravedad (IG)</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-lg border border-slate-200 dark:border-zinc-700">
              <div className="flex-1">
                <div className="font-medium text-slate-900 dark:text-white">
                  Archivo Automático Post-Validación
                </div>
                <div className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
                  Guardar PDFs en Bóveda Documental tras confirmar datos
                </div>
              </div>
              <Switch
                checked={autoArchiveEnabled}
                onCheckedChange={setAutoArchiveEnabled}
                className="ml-4"
              />
            </div>
          </div>
        </Card>

        {/* Sección 3: Documentos Pendientes de Validación */}
        <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-orange-600 to-red-600">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                📄 Documentos Recibidos
              </h2>
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                Certificados pendientes de validación
              </p>
            </div>
            <Badge className="bg-orange-600 text-white border-0">
              2 Pendientes
            </Badge>
          </div>

          <div className="space-y-3">
            {/* Documento 1 */}
            <div className="p-4 border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="font-medium text-slate-900 dark:text-white">
                    Certificado Enero 2026 - ACHS
                  </div>
                  <div className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
                    Recibido hace 2 horas • Confianza IA: 98%
                  </div>
                </div>
                <Badge className="bg-green-600 text-white border-0 text-xs">
                  Alta Confianza
                </Badge>
              </div>
              <Button
                onClick={onViewPendingDocuments}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white mt-2"
              >
                <Shield className="w-4 h-4 mr-2" />
                Validar Datos Extraídos
              </Button>
            </div>

            {/* Documento 2 */}
            <div className="p-4 border border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="font-medium text-slate-900 dark:text-white">
                    Certificado Diciembre 2025 - Mutual
                  </div>
                  <div className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
                    Recibido hace 1 día • Confianza IA: 87%
                  </div>
                </div>
                <Badge className="bg-yellow-600 text-white border-0 text-xs">
                  Requiere Revisión
                </Badge>
              </div>
              <Button
                onClick={onViewPendingDocuments}
                variant="outline"
                className="w-full border-yellow-600 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950/20 mt-2"
              >
                <Shield className="w-4 h-4 mr-2" />
                Validar Datos Extraídos
              </Button>
            </div>
          </div>
        </Card>

        {/* Info de Seguridad */}
        <Card className="p-4 bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                🔐 Seguridad y Privacidad Multi-Tenant:
              </h4>
              <ul className="space-y-1 text-slate-600 dark:text-zinc-400">
                <li>• Cada empresa tiene un correo único e irrepetible</li>
                <li>• Los documentos se aislan automáticamente por empresa</li>
                <li>• Cifrado end-to-end de todos los PDFs almacenados</li>
                <li>• Cumplimiento normativo: ISO 27001, Ley 19.628 Chile</li>
                <li>• Auditoría completa: quién validó qué dato y cuándo</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
