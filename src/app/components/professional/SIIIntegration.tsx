import { useState } from 'react';
import {
  Shield,
  AlertCircle,
  FileText,
  ExternalLink,
  DollarSign,
  Calendar,
  X
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';

interface ClientCompany {
  id: string;
  name: string;
  rut: string;
}

interface SIIIntegrationProps {
  clients: ClientCompany[];
}

// El SII no ofrece una API pública para emitir Boletas de Honorarios Electrónicas (BHE):
// solo existe el portal manual (misii.sii.cl) y un mecanismo de delegación de usuario
// autorizado, también manual. Emitir BHE por API requiere contratar un proveedor externo
// (p. ej. SimpleAPI, Bolo, API Gateway) — no hay nada que "conectar" del lado de SafeTrack
// sin esa decisión y esas credenciales.
const RETENTION_RATE = 0.1525; // Tasa de retención de boletas de honorarios vigente 2026

export function SIIIntegration({ clients }: SIIIntegrationProps) {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewForm, setPreviewForm] = useState({
    clientId: '',
    amount: '',
    description: '',
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Estado: sin proveedor configurado */}
      <Card className="p-6 border-2 bg-amber-50 dark:bg-amber-950/20 border-amber-500 dark:border-amber-800">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-amber-500 flex-shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 dark:text-amber-100">
              ⚠️ Sin proveedor de emisión de boletas configurado
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
              El SII no ofrece una API oficial para emitir Boletas de Honorarios Electrónicas.
              Solo existe el portal manual del SII y un mecanismo de delegación de usuario
              autorizado (también manual). Para emitir boletas automáticamente desde SafeTrack
              es necesario contratar un proveedor externo (por ejemplo SimpleAPI, Bolo o API
              Gateway) y configurar sus credenciales.
            </p>
            <a
              href="https://www.sii.cl/servicios_online/1040-1287.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-amber-900 dark:text-amber-200 underline mt-3"
            >
              Ver el emisor manual de boletas del SII
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </Card>

      {/* Acciones */}
      <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">
              Emisión de Boletas Electrónicas
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Vista previa de cómo se verá esta función una vez conectado un proveedor
            </p>
          </div>
          <Button
            onClick={() => setShowPreviewModal(true)}
            variant="outline"
            disabled={clients.length === 0}
          >
            <FileText className="w-4 h-4 mr-2" />
            Ver Vista Previa
          </Button>
        </div>
      </Card>

      {/* Historial de Boletas (vacío: no hay proveedor conectado) */}
      <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-8 text-center">
        <FileText className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Aún no se ha emitido ninguna boleta. Esta función se habilitará cuando se
          configure un proveedor de emisión de BHE.
        </p>
      </Card>

      {/* Modal: Vista previa del formulario */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPreviewModal(false)}>
          <Card className="w-full max-w-2xl bg-white dark:bg-zinc-900 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-zinc-400 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                      Nueva Boleta Electrónica de Honorarios
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Vista previa — requiere proveedor SII configurado
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowPreviewModal(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-zinc-900 dark:text-white">Cliente</Label>
                  <select
                    value={previewForm.clientId}
                    onChange={(e) => setPreviewForm({ ...previewForm, clientId: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white"
                  >
                    <option value="">Selecciona un cliente</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name} - {client.rut}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-zinc-900 dark:text-white">Monto Bruto</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      type="number"
                      value={previewForm.amount}
                      onChange={(e) => setPreviewForm({ ...previewForm, amount: e.target.value })}
                      placeholder="0"
                      className="pl-10"
                    />
                  </div>
                  {previewForm.amount && (
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-blue-600 dark:text-blue-400">Monto Bruto</p>
                          <p className="font-semibold text-blue-900 dark:text-blue-200">
                            {formatCurrency(parseInt(previewForm.amount || '0'))}
                          </p>
                        </div>
                        <div>
                          <p className="text-blue-600 dark:text-blue-400">Retención (15,25%)</p>
                          <p className="font-semibold text-blue-900 dark:text-blue-200">
                            {formatCurrency(Math.round(parseInt(previewForm.amount || '0') * RETENTION_RATE))}
                          </p>
                        </div>
                        <div className="col-span-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                          <p className="text-blue-600 dark:text-blue-400">Líquido a Recibir</p>
                          <p className="font-bold text-lg text-blue-900 dark:text-blue-200">
                            {formatCurrency(Math.round(parseInt(previewForm.amount || '0') * (1 - RETENTION_RATE)))}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-zinc-900 dark:text-white">Descripción del Servicio</Label>
                  <Textarea
                    value={previewForm.description}
                    onChange={(e) => setPreviewForm({ ...previewForm, description: e.target.value })}
                    placeholder="Ej: Servicios profesionales de prevención de riesgos - Febrero 2026"
                    className="mt-1 min-h-[80px]"
                  />
                </div>

                <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      Esta es una vista previa del cálculo. La emisión real ante el SII requiere
                      contratar un proveedor de emisión de BHE y configurar sus credenciales.
                    </p>
                  </div>
                </Card>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setShowPreviewModal(false)} className="flex-1">
                    Cerrar
                  </Button>
                  <Button disabled className="flex-1 bg-zinc-300 dark:bg-zinc-700 text-zinc-500 cursor-not-allowed">
                    Requiere proveedor SII configurado
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
