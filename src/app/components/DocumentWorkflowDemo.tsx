import { useState } from 'react';
import { DocumentWorkflow } from '@/app/components/DocumentWorkflow';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Shield,
  Users,
  Calendar,
  ArrowLeft 
} from 'lucide-react';
import { toast } from 'sonner';

interface DocumentWorkflowDemoProps {
  onBack: () => void;
}

export function DocumentWorkflowDemo({ onBack }: DocumentWorkflowDemoProps) {
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<string>('');

  const documentTypes = [
    {
      id: 'incident',
      title: 'Reporte de Incidente',
      description: 'Documento de registro de incidente con acciones correctivas',
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-950/20'
    },
    {
      id: 'talk',
      title: 'Charla de Seguridad',
      description: 'Registro de charla con firmas de asistentes',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-950/20'
    },
    {
      id: 'epp-delivery',
      title: 'Entrega de EPP',
      description: 'Acta de entrega de elementos de protección personal',
      icon: Shield,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-950/20'
    },
    {
      id: 'inspection',
      title: 'Inspección de Seguridad',
      description: 'Informe de inspección con hallazgos y recomendaciones',
      icon: CheckCircle2,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-950/20'
    },
    {
      id: 'monthly-plan',
      title: 'Plan Mensual',
      description: 'Plan de trabajo mensual con actividades programadas',
      icon: Calendar,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-950/20'
    }
  ];

  const getDocumentContent = (type: string) => {
    switch (type) {
      case 'incident':
        return (
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                REPORTE DE INCIDENTE
              </h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                Código: INC-2025-001 • Fecha: 29/01/2025
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 dark:text-zinc-500 mb-1">Tipo de Incidente</p>
                <p className="font-semibold text-slate-900 dark:text-white">Casi Accidente</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-zinc-500 mb-1">Severidad</p>
                <p className="font-semibold text-orange-600">Media</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-zinc-500 mb-1">Ubicación</p>
                <p className="font-semibold text-slate-900 dark:text-white">Bodega A - Sector 3</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-zinc-500 mb-1">Trabajador Involucrado</p>
                <p className="font-semibold text-slate-900 dark:text-white">Juan Pérez</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-zinc-500 mb-1">Descripción</p>
              <p className="text-sm text-slate-700 dark:text-zinc-300">
                Trabajador reportó desprendimiento de material en estantería superior durante 
                operación de carga. No hubo lesiones. Se requiere revisión estructural inmediata.
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-zinc-500 mb-1">Acciones Correctivas</p>
              <ul className="text-sm text-slate-700 dark:text-zinc-300 list-disc list-inside space-y-1">
                <li>Inspección estructural de estanterías</li>
                <li>Reforzamiento de anclajes</li>
                <li>Capacitación en manejo de cargas</li>
              </ul>
            </div>
          </div>
        );
      
      case 'talk':
        return (
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                CHARLA DE SEGURIDAD
              </h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                Código: CHA-2025-015 • Fecha: 29/01/2025
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 dark:text-zinc-500 mb-1">Tema</p>
                <p className="font-semibold text-slate-900 dark:text-white">Uso Correcto de EPP</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-zinc-500 mb-1">Duración</p>
                <p className="font-semibold text-slate-900 dark:text-white">30 minutos</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-zinc-500 mb-1">Asistentes</p>
                <p className="font-semibold text-slate-900 dark:text-white">12 trabajadores</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-zinc-500 mb-1">Ubicación</p>
                <p className="font-semibold text-slate-900 dark:text-white">Sala de Capacitación</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-zinc-500 mb-1">Contenido</p>
              <p className="text-sm text-slate-700 dark:text-zinc-300">
                Revisión de uso correcto de casco, guantes, lentes y calzado de seguridad. 
                Demostración práctica de colocación. Evaluación de conocimientos al final.
              </p>
            </div>
          </div>
        );
      
      case 'epp-delivery':
        return (
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                ACTA DE ENTREGA DE EPP
              </h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                Código: EPP-2025-042 • Fecha: 29/01/2025
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-zinc-500 mb-1">Trabajador</p>
              <p className="font-semibold text-slate-900 dark:text-white">Carlos Muñoz - RUT: 16.234.567-8</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-zinc-500 mb-2">Elementos Entregados</p>
              <div className="bg-slate-100 dark:bg-zinc-800 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700 dark:text-zinc-300">Casco de Seguridad</span>
                  <span className="font-semibold text-slate-900 dark:text-white">1 unidad</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700 dark:text-zinc-300">Guantes de Cuero</span>
                  <span className="font-semibold text-slate-900 dark:text-white">2 pares</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700 dark:text-zinc-300">Lentes de Seguridad</span>
                  <span className="font-semibold text-slate-900 dark:text-white">1 unidad</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700 dark:text-zinc-300">Chaleco Reflectante</span>
                  <span className="font-semibold text-slate-900 dark:text-white">1 unidad</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-slate-400 dark:text-zinc-500 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-zinc-400">
              Vista previa del documento
            </p>
          </div>
        );
    }
  };

  const getMetadata = (type: string) => {
    const baseMetadata = {
      type: type as any,
      title: documentTypes.find(d => d.id === type)?.title || 'Documento',
      subtitle: documentTypes.find(d => d.id === type)?.description,
      code: `DOC-2025-${Math.floor(Math.random() * 1000)}`,
      date: new Date().toLocaleDateString('es-CL'),
      company: 'Constructora Acme S.A.',
      branch: 'Sede Central - Santiago',
      author: {
        name: 'Roberto González',
        role: 'Ingeniero en Prevención de Riesgos',
        rut: '15.234.567-8'
      }
    };

    if (type === 'incident' || type === 'epp-delivery') {
      return {
        ...baseMetadata,
        relatedWorkers: [
          {
            name: 'Juan Pérez',
            rut: '17.345.678-9',
            email: 'juan.perez@empresa.cl',
            phone: '+56912345681'
          }
        ]
      };
    }

    if (type === 'talk') {
      return {
        ...baseMetadata,
        relatedWorkers: [
          { name: 'Juan Pérez', rut: '17.345.678-9', email: 'juan.perez@empresa.cl' },
          { name: 'María Torres', rut: '18.456.789-0', email: 'maria.torres@empresa.cl' },
          { name: 'Pedro Soto', rut: '16.567.890-1', email: 'pedro.soto@empresa.cl' }
        ]
      };
    }

    return baseMetadata;
  };

  const handleOpenWorkflow = (docType: string) => {
    setSelectedDocType(docType);
    setWorkflowOpen(true);
  };

  const handleWorkflowComplete = (result: any) => {
    toast.success('Documento procesado exitosamente', {
      description: `Enviado a ${result.sentTo.length} destinatario(s) y guardado en la bóveda.`
    });
    setWorkflowOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-zinc-800 dark:to-zinc-900 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>

          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-white text-2xl lg:text-3xl mb-1 font-bold">
                Sistema de Gestión Documental
              </h1>
              <p className="text-white/80 text-sm lg:text-base">
                Flujo universal: Previsualización → Firma Digital → Bóveda → Envío Automático
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Info Card */}
        <Card className="p-6 mb-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                📋 Flujo Universal de Documentación
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                Todos los documentos generados en SafeTrack Chile siguen este flujo estandarizado:
              </p>
              <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
                <li><strong>Previsualización:</strong> Revisa el documento antes de finalizar</li>
                <li><strong>Firma Digital:</strong> Certifica con validez legal (Ley 19.799)</li>
                <li><strong>Bóveda Documental:</strong> Almacenamiento seguro y trazable</li>
                <li><strong>Envío Automático:</strong> WhatsApp y correo a RRHH, Gerencia y partes involucradas</li>
                <li><strong>Descarga PDF:</strong> Disponible para impresión física si es necesario</li>
              </ol>
            </div>
          </div>
        </Card>

        {/* Document Types Grid */}
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Selecciona un tipo de documento para probar el flujo:
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentTypes.map((docType) => {
            const Icon = docType.icon;
            return (
              <Card
                key={docType.id}
                className="p-6 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => handleOpenWorkflow(docType.id)}
              >
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${docType.bgColor} mb-4`}>
                  <Icon className={`w-6 h-6 ${docType.color}`} />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {docType.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-zinc-400 mb-4">
                  {docType.description}
                </p>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenWorkflow(docType.id);
                  }}
                >
                  Generar Documento
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Features */}
        <Card className="mt-6 p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
            ✨ Características del Sistema
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Firma Digital Legal</p>
                <p className="text-sm text-slate-600 dark:text-zinc-400">
                  Cumple con Ley 19.799 de firma electrónica en Chile
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Envío Automático</p>
                <p className="text-sm text-slate-600 dark:text-zinc-400">
                  WhatsApp y correo a todos los involucrados
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Bóveda Segura</p>
                <p className="text-sm text-slate-600 dark:text-zinc-400">
                  Almacenamiento con trazabilidad completa
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">PDF Descargable</p>
                <p className="text-sm text-slate-600 dark:text-zinc-400">
                  Disponible para impresión física inmediata
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Document Workflow Modal */}
      {workflowOpen && (
        <DocumentWorkflow
          isOpen={workflowOpen}
          onClose={() => setWorkflowOpen(false)}
          metadata={getMetadata(selectedDocType)}
          documentContent={getDocumentContent(selectedDocType)}
          onComplete={handleWorkflowComplete}
        />
      )}
    </div>
  );
}
