import { useState } from 'react';
import { 
  ArrowLeft, 
  Camera,
  CheckCircle,
  XCircle,
  Download,
  Share2,
  Calendar
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

interface Evidence {
  id: string;
  title: string;
  location: string;
  beforeImage: string;
  afterImage: string;
  beforeDate: string;
  afterDate: string;
  description: string;
  status: 'verified' | 'pending';
}

interface EvidenceCompareProps {
  onBack: () => void;
}

export function EvidenceCompare({ onBack }: EvidenceCompareProps) {
  const [evidences] = useState<Evidence[]>([
    {
      id: 'EV001',
      title: 'Corrección de extintor descalibrado',
      location: 'Sucursal Maipú - Piso 2',
      beforeImage: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400',
      afterImage: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400',
      beforeDate: '2026-01-20',
      afterDate: '2026-01-25',
      description: 'Reemplazo de manómetro y recarga de extintor PQS 6kg',
      status: 'verified'
    },
    {
      id: 'EV002',
      title: 'Despeje de salida de emergencia',
      location: 'Sucursal Maipú - Bodega',
      beforeImage: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400',
      afterImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400',
      beforeDate: '2026-01-22',
      afterDate: '2026-01-26',
      description: 'Retiro de material obstructor y señalización mejorada',
      status: 'verified'
    },
    {
      id: 'EV003',
      title: 'Canalización de cables eléctricos',
      location: 'Sucursal Norte - Producción',
      beforeImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
      afterImage: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400',
      beforeDate: '2026-01-15',
      afterDate: '2026-01-24',
      description: 'Instalación de canaleta protectora según normativa eléctrica',
      status: 'verified'
    }
  ]);

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Header */}
      <div className="bg-zinc-800 border-b border-zinc-700 sticky top-0 z-10">
        <div className="p-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
          <h1 className="text-white text-2xl font-bold">Comparación de Evidencias</h1>
          <p className="text-zinc-400 text-sm mt-1">Antes y Después de Medidas Correctivas</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Summary */}
        <Card className="bg-gradient-to-br from-green-900/20 to-zinc-800 border-green-700/30 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-white font-semibold">
                {evidences.filter(e => e.status === 'verified').length} correcciones verificadas
              </p>
              <p className="text-xs text-zinc-400">Ideal para informes de asesoría a clientes</p>
            </div>
          </div>
        </Card>

        {/* Evidence Comparisons */}
        <div className="space-y-4">
          {evidences.map(evidence => (
            <Card key={evidence.id} className="bg-zinc-800 border-zinc-700 overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-zinc-700">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{evidence.title}</h3>
                    <p className="text-sm text-zinc-400">{evidence.location}</p>
                  </div>
                  {evidence.status === 'verified' && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-zinc-300">{evidence.description}</p>
              </div>

              {/* Image Comparison */}
              <div className="grid grid-cols-2">
                {/* Before */}
                <div className="relative">
                  <div className="absolute top-3 left-3 z-10">
                    <Badge className="bg-red-500/90 text-white border-0">
                      <XCircle className="w-3 h-3 mr-1" />
                      Antes
                    </Badge>
                  </div>
                  <img 
                    src={evidence.beforeImage} 
                    alt="Antes de la corrección" 
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <div className="flex items-center gap-1 text-xs text-white">
                      <Calendar className="w-3 h-3" />
                      {new Date(evidence.beforeDate).toLocaleDateString('es-CL', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {/* After */}
                <div className="relative border-l-2 border-zinc-700">
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className="bg-green-500/90 text-white border-0">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Después
                    </Badge>
                  </div>
                  <img 
                    src={evidence.afterImage} 
                    alt="Después de la corrección" 
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <div className="flex items-center gap-1 text-xs text-white">
                      <Calendar className="w-3 h-3" />
                      {new Date(evidence.afterDate).toLocaleDateString('es-CL', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-3 bg-zinc-900/50 flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  <Share2 className="w-3 h-3 mr-1" />
                  Compartir
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Descargar PDF
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State for adding new */}
        <Card 
          className="bg-zinc-800 border-zinc-700 border-dashed p-8 cursor-pointer hover:border-[#FF8C00] transition-colors"
        >
          <div className="text-center">
            <Camera className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-1">Agregar Nueva Comparación</h3>
            <p className="text-sm text-zinc-400">
              Captura fotos antes y después de las correcciones
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
