import { useState } from 'react';
import { ArrowLeft, QrCode, Link2, FileText, Download, Shield, CheckCircle, Send } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';
import { copyToClipboard } from '@/app/utils/clipboard';

interface InspectionModeProps {
  onBack: () => void;
}

interface DocumentItem {
  id: string;
  name: string;
  category: string;
  status: 'complete' | 'incomplete';
  lastUpdate: string;
}

const mockDocuments: DocumentItem[] = [
  {
    id: '1',
    name: 'Registro de Charlas de Seguridad',
    category: 'Capacitación',
    status: 'complete',
    lastUpdate: 'Hace 2 horas'
  },
  {
    id: '2',
    name: 'Inspecciones de Extintores',
    category: 'Equipos de Emergencia',
    status: 'complete',
    lastUpdate: 'Hace 5 horas'
  },
  {
    id: '3',
    name: 'Registro Entrega de EPP',
    category: 'Elementos de Protección',
    status: 'complete',
    lastUpdate: 'Hace 1 día'
  },
  {
    id: '4',
    name: 'Observaciones y ODI',
    category: 'Gestión de Riesgos',
    status: 'complete',
    lastUpdate: 'Hace 3 días'
  },
  {
    id: '5',
    name: 'Programa de Prevención de Riesgos',
    category: 'Documentación Legal',
    status: 'complete',
    lastUpdate: 'Hace 1 semana'
  },
  {
    id: '6',
    name: 'Reglamento Interno de Orden, Higiene y Seguridad',
    category: 'Documentación Legal',
    status: 'incomplete',
    lastUpdate: 'Pendiente actualización'
  }
];

export function InspectionMode({ onBack }: InspectionModeProps) {
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  const handleGenerateLink = () => {
    // Simular generación de link único
    const uniqueId = Math.random().toString(36).substring(7);
    setGeneratedLink(`https://safetrack.cl/inspect/${uniqueId}`);
    setShowQR(true);
  };

  const completeCount = mockDocuments.filter(doc => doc.status === 'complete').length;
  const totalCount = mockDocuments.length;
  const completionPercentage = Math.round((completeCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 to-red-800 border-b border-red-700">
        <div className="p-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-red-200 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-red-600/30 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white text-xl">Modo Fiscalización</h1>
              <p className="text-red-200 text-sm">Inspector de DT o SEREMI</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Info Card */}
        <Card className="bg-red-900/30 border-red-700">
          <div className="p-4">
            <h3 className="text-white mb-2">¿Qué es esto?</h3>
            <p className="text-sm text-red-100">
              Genera un enlace seguro o código QR con toda tu documentación legal del último mes. 
              Ideal para mostrar a inspectores de la Dirección del Trabajo o SEREMI de Salud.
            </p>
          </div>
        </Card>

        {/* Status Summary */}
        <Card className="bg-zinc-800 border-zinc-700">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white">Estado de Documentación</h3>
              <Badge className={`${
                completionPercentage >= 80 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              } border-0`}>
                {completionPercentage}% Completo
              </Badge>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-zinc-700 rounded-full h-3 mb-4 overflow-hidden">
              <div
                className={`h-full ${
                  completionPercentage >= 80 ? 'bg-green-500' : 'bg-yellow-500'
                } transition-all`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl text-white mb-1">{completeCount}</p>
                <p className="text-xs text-zinc-400">Documentos listos</p>
              </div>
              <div>
                <p className="text-2xl text-white mb-1">{totalCount - completeCount}</p>
                <p className="text-xs text-zinc-400">Pendientes</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Document List */}
        <div>
          <h3 className="text-white mb-3">Documentos Incluidos</h3>
          <div className="space-y-2">
            {mockDocuments.map((doc) => (
              <Card key={doc.id} className="bg-zinc-800 border-zinc-700">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {doc.status === 'complete' ? (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-yellow-500 flex-shrink-0" />
                        )}
                        <h4 className="text-white text-sm">{doc.name}</h4>
                      </div>
                      <div className="flex items-center gap-2 ml-6">
                        <Badge variant="secondary" className="bg-zinc-700 text-zinc-300 text-xs">
                          {doc.category}
                        </Badge>
                        <span className="text-xs text-zinc-500">{doc.lastUpdate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Generate Section */}
        {!generatedLink ? (
          <Card className="bg-zinc-800 border-zinc-700">
            <div className="p-5">
              <h3 className="text-white mb-2">Generar Acceso para Inspector</h3>
              <p className="text-sm text-zinc-400 mb-4">
                Crea un enlace temporal válido por 24 horas con acceso a todos los documentos marcados como completos.
              </p>
              <Button
                onClick={handleGenerateLink}
                className="w-full h-12 bg-[#FF8C00] hover:bg-orange-600 text-white"
              >
                <QrCode className="w-5 h-5 mr-2" />
                Generar Enlace y QR
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {/* QR Code */}
            {showQR && (
              <Card className="bg-white border-zinc-700">
                <div className="p-8 flex flex-col items-center">
                  <div className="bg-zinc-900 p-4 rounded-lg mb-4">
                    {/* Placeholder QR - En producción usar una librería de QR */}
                    <div className="w-48 h-48 bg-white rounded flex items-center justify-center">
                      <QrCode className="w-32 h-32 text-zinc-900" />
                    </div>
                  </div>
                  <p className="text-zinc-900 text-sm text-center mb-2">
                    Escanea este código QR
                  </p>
                  <Badge className="bg-green-500 text-white border-0">
                    Válido por 24 horas
                  </Badge>
                </div>
              </Card>
            )}

            {/* Link Card */}
            <Card className="bg-zinc-800 border-zinc-700">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Link2 className="w-4 h-4 text-[#FF8C00]" />
                  <h3 className="text-white">Enlace Generado</h3>
                </div>
                <div className="bg-zinc-900 p-3 rounded mb-3">
                  <p className="text-sm text-zinc-300 break-all">{generatedLink}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="bg-zinc-700 border-zinc-600 text-zinc-300 hover:bg-zinc-600"
                    onClick={async () => {
                      const copied = await copyToClipboard(generatedLink);
                      if (copied) {
                        toast.success('Enlace copiado al portapapeles');
                      } else {
                        toast.error('No se pudo copiar', {
                          description: 'Por favor, copia el enlace manualmente'
                        });
                      }
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Copiar
                  </Button>
                  <Button
                    className="bg-[#0055A4] hover:bg-blue-700 text-white"
                    onClick={() => {
                      // Simular compartir por WhatsApp
                      window.open(`https://wa.me/?text=${encodeURIComponent(generatedLink)}`, '_blank');
                    }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <Card className="bg-zinc-800 border-zinc-700">
              <div className="p-4">
                <Button
                  variant="outline"
                  className="w-full bg-zinc-700 border-zinc-600 text-zinc-300 hover:bg-zinc-600"
                  onClick={() => {
                    setGeneratedLink(null);
                    setShowQR(false);
                  }}
                >
                  Generar Nuevo Enlace
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}