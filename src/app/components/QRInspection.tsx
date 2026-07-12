import { useState, useRef, useEffect } from 'react';
import { fetchAssetById, Asset } from '@/app/services/assetsService';
import { createInspection } from '@/app/services/inspectionsService';
import { isSupabaseConfigured } from '@/app/services/supabase';
import {
  ArrowLeft, 
  Camera,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  QrCode,
  MapPin,
  Calendar,
  Wrench,
  Image as ImageIcon,
  Send,
  Flame,
  Truck,
  HardHat,
  Package as PackageIcon
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Switch } from '@/app/components/ui/switch';
import { toast } from 'sonner';

interface QRInspectionProps {
  onBack: () => void;
  assetId?: string;
  companyId?: string;
  branchId?: string;
}

interface InspectionItem {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'pending';
}

const MOCK_ASSET = {
  id: 'AST-001',
  code: 'EXT-MAI-001',
  name: 'Extintor PQS 6kg - Oficinas',
  category: 'Extintor',
  location: 'Oficina Administrativa - Piso 2',
  lastInspection: '2025-12-15',
  nextMaintenance: '2026-12-15',
  status: 'compliant' as const,
  certificationNumber: 'CERT-2025-12345',
  supplier: 'Extintores Chile S.A.',
  specifications: {
    capacity: '6 kg',
    type: 'Polvo Químico Seco (PQS)',
    pressure: '195 PSI',
    manufacturer: 'Amerex',
    yearOfManufacture: '2024'
  }
};

const assetToDisplay = (asset: Asset) => ({
  id: asset.id,
  code: asset.code,
  name: asset.name,
  category: asset.category,
  location: asset.location || '—',
  lastInspection: asset.lastInspectionDate || '—',
  nextMaintenance: asset.nextInspectionDate || '—',
  status: 'compliant' as const,
  certificationNumber: '—',
  supplier: asset.brand || '—',
  specifications: {
    capacity: '—',
    type: asset.type || '—',
    pressure: '—',
    manufacturer: asset.brand || '—',
    yearOfManufacture: asset.acquisitionDate ? asset.acquisitionDate.slice(0, 4) : '—'
  }
});

export function QRInspection({ onBack, assetId, companyId, branchId }: QRInspectionProps) {
  const [scanMode, setScanMode] = useState(!assetId);
  const [showFaultReport, setShowFaultReport] = useState(false);
  const [faultDescription, setFaultDescription] = useState('');
  const [faultPhoto, setFaultPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [scannedAsset, setScannedAsset] = useState(MOCK_ASSET);
  const [realAssetId, setRealAssetId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    const loadAsset = async () => {
      if (!assetId || !isSupabaseConfigured) {
        if (!cancelled) {
          setScannedAsset(MOCK_ASSET);
          setRealAssetId(undefined);
        }
        return;
      }
      try {
        const asset = await fetchAssetById(assetId);
        if (!cancelled && asset) {
          setScannedAsset(assetToDisplay(asset));
          setRealAssetId(asset.id);
        } else if (!cancelled) {
          setScannedAsset(MOCK_ASSET);
          setRealAssetId(undefined);
        }
      } catch (err: any) {
        console.warn('No se pudo cargar el activo desde Supabase:', err.message);
        if (!cancelled) {
          setScannedAsset(MOCK_ASSET);
          setRealAssetId(undefined);
        }
      }
    };
    loadAsset();
    return () => { cancelled = true; };
  }, [assetId]);

  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([
    { id: '1', label: 'Estado del cilindro (sin abolladuras ni oxidación)', status: 'pending' },
    { id: '2', label: 'Manómetro en zona verde (presión correcta)', status: 'pending' },
    { id: '3', label: 'Pasador de seguridad presente e intacto', status: 'pending' },
    { id: '4', label: 'Manguera sin fisuras ni obstrucciones', status: 'pending' },
    { id: '5', label: 'Etiqueta de mantención legible', status: 'pending' },
    { id: '6', label: 'Acceso despejado (sin objetos bloqueando)', status: 'pending' },
    { id: '7', label: 'Señalización visible y en buen estado', status: 'pending' }
  ]);

  const handleScan = () => {
    // Simulación de escaneo
    toast.success('Código QR escaneado exitosamente');
    setScanMode(false);
  };

  const handleToggleStatus = (itemId: string) => {
    setInspectionItems(items =>
      items.map(item => {
        if (item.id === itemId) {
          // Toggle: pending -> pass -> fail -> pending
          const nextStatus = 
            item.status === 'pending' ? 'pass' : 
            item.status === 'pass' ? 'fail' : 
            'pending';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const handlePhotoCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaultPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success('Foto adjuntada');
    }
  };

  const persistInspection = async (description: string) => {
    if (!companyId || !isSupabaseConfigured) return;
    await createInspection({
      companyId,
      branchId,
      assetId: realAssetId,
      assetName: scannedAsset.name,
      sector: scannedAsset.category,
      location: scannedAsset.location,
      description,
      photos: faultPhoto ? [faultPhoto] : [],
      checklistItems: inspectionItems.map(item => ({ label: item.label, status: item.status })),
    });
  };

  const handleReportFault = async () => {
    if (!faultDescription) {
      toast.error('Describe la falla detectada');
      return;
    }

    try {
      await persistInspection(faultDescription);
      toast.error('Equipo bloqueado fuera de servicio', {
        description: 'El activo ha sido marcado como NO DISPONIBLE hasta completar reparación.'
      });
      setShowFaultReport(false);
    } catch (err: any) {
      toast.error('Error al guardar el reporte de falla', { description: err.message });
    }
  };

  const handleCompleteInspection = async () => {
    const failedItems = inspectionItems.filter(item => item.status === 'fail');
    const pendingItems = inspectionItems.filter(item => item.status === 'pending');

    if (pendingItems.length > 0) {
      toast.error('Completa todas las verificaciones');
      return;
    }

    try {
      await persistInspection(
        failedItems.length > 0
          ? `Inspección con ${failedItems.length} verificación(es) fallida(s)`
          : 'Inspección completada sin novedades'
      );
    } catch (err: any) {
      toast.error('Error al guardar la inspección', { description: err.message });
      return;
    }

    if (failedItems.length > 0) {
      toast.warning(`${failedItems.length} verificación(es) fallida(s)`, {
        description: 'Se recomienda reportar falla para bloquear el equipo.'
      });
    } else {
      toast.success('✅ Inspección completada exitosamente', {
        description: 'El equipo está en condiciones óptimas de uso.'
      });
      onBack();
    }
  };

  const passCount = inspectionItems.filter(i => i.status === 'pass').length;
  const failCount = inspectionItems.filter(i => i.status === 'fail').length;
  const pendingCount = inspectionItems.filter(i => i.status === 'pending').length;
  const completionRate = Math.round((passCount / inspectionItems.length) * 100);

  if (scanMode) {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col">
        {/* Header */}
        <div className="bg-zinc-800 border-b border-zinc-700">
          <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
              </button>
              <div>
                <h1 className="text-white text-xl">Escanear Código QR</h1>
                <p className="text-sm text-zinc-400">Acerca la cámara al código del equipo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Área de escaneo simulada */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="relative w-full max-w-sm aspect-square">
            <div className="absolute inset-0 border-4 border-[#0055A4] rounded-2xl">
              <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-[#FF8C00] rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-[#FF8C00] rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-[#FF8C00] rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-[#FF8C00] rounded-br-2xl" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <QrCode className="w-24 h-24 text-zinc-600 animate-pulse" />
            </div>
          </div>

          <p className="text-white text-center mt-8 mb-4">
            Posiciona el código QR dentro del marco
          </p>

          <Button
            onClick={handleScan}
            className="bg-[#FF8C00] hover:bg-orange-600 text-white"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Simular Escaneo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors pb-20 lg:pb-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
              </button>
              <div>
                <h1 className="text-zinc-900 dark:text-white text-xl lg:text-2xl">Inspección Rápida QR</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Check & Go en terreno</p>
              </div>
            </div>
            <Button
              onClick={() => setScanMode(true)}
              variant="outline"
              className="border-zinc-300 dark:border-zinc-700"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Escanear Otro
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Ficha Técnica del Activo */}
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 border-l-4 border-l-[#0055A4]">
          <div className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-[#0055A4]/10 p-3 rounded-xl">
                <Flame className="w-8 h-8 text-[#0055A4]" />
              </div>
              <div className="flex-1">
                <h2 className="text-zinc-900 dark:text-white text-xl font-bold mb-1">{scannedAsset.name}</h2>
                <p className="text-zinc-600 dark:text-zinc-400 font-mono text-sm">{scannedAsset.code}</p>
                <Badge className="bg-[#27AE60]/20 text-[#27AE60] border-0 mt-2">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Al Día
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
              <div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">📍 Ubicación</p>
                <p className="text-sm text-zinc-900 dark:text-white font-medium">{scannedAsset.location}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">🏢 Proveedor</p>
                <p className="text-sm text-zinc-900 dark:text-white font-medium">{scannedAsset.supplier}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">✅ Última Inspección</p>
                <p className="text-sm text-zinc-900 dark:text-white font-medium">{scannedAsset.lastInspection}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">📅 Próxima Mantención</p>
                <p className="text-sm text-zinc-900 dark:text-white font-medium">{scannedAsset.nextMaintenance}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">🔖 Certificación</p>
                <p className="text-sm text-zinc-900 dark:text-white font-medium font-mono">{scannedAsset.certificationNumber}</p>
              </div>
            </div>

            {/* Especificaciones Técnicas */}
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="text-zinc-900 dark:text-white font-semibold mb-3">Especificaciones Técnicas</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-xs">Capacidad</p>
                  <p className="text-zinc-900 dark:text-white font-medium">{scannedAsset.specifications.capacity}</p>
                </div>
                <div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-xs">Tipo</p>
                  <p className="text-zinc-900 dark:text-white font-medium">{scannedAsset.specifications.type}</p>
                </div>
                <div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-xs">Presión</p>
                  <p className="text-zinc-900 dark:text-white font-medium">{scannedAsset.specifications.pressure}</p>
                </div>
                <div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-xs">Fabricante</p>
                  <p className="text-zinc-900 dark:text-white font-medium">{scannedAsset.specifications.manufacturer}</p>
                </div>
                <div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-xs">Año Fabricación</p>
                  <p className="text-zinc-900 dark:text-white font-medium">{scannedAsset.specifications.yearOfManufacture}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* KPIs de Inspección */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-[#27AE60]/30">
            <div className="p-4 text-center">
              <CheckCircle2 className="w-8 h-8 text-[#27AE60] mx-auto mb-2" />
              <div className="text-3xl text-[#27AE60] font-bold">{passCount}</div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Aprobados</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-[#EB5757]/30">
            <div className="p-4 text-center">
              <XCircle className="w-8 h-8 text-[#EB5757] mx-auto mb-2" />
              <div className="text-3xl text-[#EB5757] font-bold">{failCount}</div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Fallidos</p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border-[#F2C94C]/30">
            <div className="p-4 text-center">
              <AlertTriangle className="w-8 h-8 text-[#F2C94C] mx-auto mb-2" />
              <div className="text-3xl text-[#F2C94C] font-bold">{pendingCount}</div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Pendientes</p>
            </div>
          </Card>
        </div>

        {/* Formulario Check & Go */}
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-zinc-900 dark:text-white font-semibold flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#0055A4]" />
                Lista de Verificación Rápida
              </h3>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#0055A4]">{completionRate}%</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Completado</p>
              </div>
            </div>

            <div className="space-y-3">
              {inspectionItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    item.status === 'pass'
                      ? 'bg-[#27AE60]/10 border-[#27AE60]/30'
                      : item.status === 'fail'
                      ? 'bg-[#EB5757]/10 border-[#EB5757]/30'
                      : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  <div className="flex-1 pr-4">
                    <p className="text-sm text-zinc-900 dark:text-white font-medium">{item.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === 'pass' && (
                      <CheckCircle2 className="w-6 h-6 text-[#27AE60]" />
                    )}
                    {item.status === 'fail' && (
                      <XCircle className="w-6 h-6 text-[#EB5757]" />
                    )}
                    <Switch
                      checked={item.status === 'pass'}
                      onCheckedChange={() => handleToggleStatus(item.id)}
                      className="data-[state=checked]:bg-[#27AE60]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Acciones */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleCompleteInspection}
            disabled={pendingCount > 0}
            className="bg-[#27AE60] hover:bg-green-700 text-white h-12 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Completar Inspección
          </Button>

          <Button
            onClick={() => setShowFaultReport(true)}
            variant="outline"
            className="border-[#EB5757] text-[#EB5757] hover:bg-[#EB5757] hover:text-white h-12"
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            Reportar Falla y Bloquear Equipo
          </Button>
        </div>
      </div>

      {/* Modal de Reporte de Falla */}
      {showFaultReport && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowFaultReport(false)}>
          <Card 
            className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-zinc-900 dark:text-white text-xl mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-[#EB5757]" />
                Reportar Falla Crítica
              </h3>
              
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800 dark:text-red-400">
                  ⚠️ <strong>ADVERTENCIA:</strong> Al reportar una falla, el equipo será marcado como <strong>FUERA DE SERVICIO</strong> 
                  y bloqueado en el sistema hasta que se complete la reparación certificada.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="fault-description">Descripción de la Falla *</Label>
                  <Textarea
                    id="fault-description"
                    placeholder="Describe detalladamente el problema encontrado..."
                    value={faultDescription}
                    onChange={(e) => setFaultDescription(e.target.value)}
                    rows={4}
                    className="bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                  />
                </div>

                <div>
                  <Label>Evidencia Fotográfica</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button
                    onClick={handlePhotoCapture}
                    variant="outline"
                    className="w-full border-zinc-300 dark:border-zinc-700"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {faultPhoto ? 'Cambiar Foto' : 'Tomar Foto del Daño'}
                  </Button>
                  {faultPhoto && (
                    <div className="mt-3 relative">
                      <img src={faultPhoto} alt="Evidencia" className="w-full h-48 object-cover rounded-lg" />
                      <Badge className="absolute top-2 right-2 bg-green-600 text-white border-0">
                        <ImageIcon className="w-3 h-3 mr-1" />
                        Foto adjuntada
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleReportFault}
                  className="bg-[#EB5757] hover:bg-red-700 text-white flex-1"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Reporte y Bloquear
                </Button>
                <Button
                  onClick={() => setShowFaultReport(false)}
                  variant="outline"
                  className="border-zinc-300 dark:border-zinc-700"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
