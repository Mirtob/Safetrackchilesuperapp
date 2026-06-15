import { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Mic, 
  MapPin, 
  Send, 
  X, 
  ArrowLeft,
  ImagePlus,
  CheckCircle,
  Pencil,
  Building2,
  Package,
  ChevronDown,
  Search
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { DocumentPreviewAndSend } from '@/app/components/DocumentPreviewAndSend';
import { toast } from 'sonner';

interface InspectionFormEnhancedProps {
  onBack: () => void;
  onSubmit: (data: InspectionFormData) => void;
}

interface InspectionFormData {
  sector: string;
  asset: string;
  assetName: string;
  description: string;
  location: string;
  photos: string[];
  signature: string | null;
}

interface Sector {
  id: string;
  name: string;
  icon: string;
}

interface Asset {
  id: string;
  name: string;
  code: string;
  sectorId: string;
  type: string;
  icon: string;
}

// Datos de ejemplo - En producción vendrían de Supabase
const SECTORS: Sector[] = [
  { id: 'bodega-a', name: 'Bodega A - Almacenamiento', icon: '📦' },
  { id: 'bodega-b', name: 'Bodega B - Productos Químicos', icon: '⚗️' },
  { id: 'produccion', name: 'Área de Producción', icon: '🏭' },
  { id: 'oficinas', name: 'Oficinas Administrativas', icon: '🏢' },
  { id: 'mantención', name: 'Taller de Mantención', icon: '🔧' },
  { id: 'exterior', name: 'Áreas Exteriores', icon: '🌳' }
];

const ASSETS: Asset[] = [
  // Bodega A
  { id: 'ext-001', name: 'Extintor PQS 6kg - Pasillo Principal', code: 'EXT-001', sectorId: 'bodega-a', type: 'Extintor', icon: '🧯' },
  { id: 'ext-002', name: 'Extintor CO2 10kg - Zona Eléctrica', code: 'EXT-002', sectorId: 'bodega-a', type: 'Extintor', icon: '🧯' },
  { id: 'rack-001', name: 'Rack de Almacenamiento A1', code: 'RACK-001', sectorId: 'bodega-a', type: 'Estructura', icon: '📚' },
  { id: 'sen-001', name: 'Señalética de Emergencia - Salida Este', code: 'SEN-001', sectorId: 'bodega-a', type: 'Señalética', icon: '🚨' },
  
  // Bodega B
  { id: 'ext-003', name: 'Extintor ABC 6kg - Entrada Principal', code: 'EXT-003', sectorId: 'bodega-b', type: 'Extintor', icon: '🧯' },
  { id: 'duc-001', name: 'Ducha de Emergencia', code: 'DUC-001', sectorId: 'bodega-b', type: 'Emergencia', icon: '🚿' },
  { id: 'lav-001', name: 'Lavaojos de Seguridad', code: 'LAV-001', sectorId: 'bodega-b', type: 'Emergencia', icon: '👁️' },
  { id: 'sen-002', name: 'Kit Anti-Derrames', code: 'KIT-001', sectorId: 'bodega-b', type: 'Emergencia', icon: '🛡️' },
  
  // Producción
  { id: 'ext-004', name: 'Extintor PQS 10kg - Línea 1', code: 'EXT-004', sectorId: 'produccion', type: 'Extintor', icon: '🧯' },
  { id: 'ext-005', name: 'Extintor PQS 10kg - Línea 2', code: 'EXT-005', sectorId: 'produccion', type: 'Extintor', icon: '🧯' },
  { id: 'comp-001', name: 'Compresor Industrial A', code: 'COMP-001', sectorId: 'produccion', type: 'Maquinaria', icon: '⚙️' },
  { id: 'bot-001', name: 'Botiquín de Primeros Auxilios', code: 'BOT-001', sectorId: 'produccion', type: 'Emergencia', icon: '🏥' },
  { id: 'sen-003', name: 'Señal Uso Obligatorio EPP', code: 'SEN-003', sectorId: 'produccion', type: 'Señalética', icon: '⚠️' },
  
  // Oficinas
  { id: 'ext-006', name: 'Extintor CO2 6kg - Sala Servidores', code: 'EXT-006', sectorId: 'oficinas', type: 'Extintor', icon: '🧯' },
  { id: 'bot-002', name: 'Botiquín Oficina Central', code: 'BOT-002', sectorId: 'oficinas', type: 'Emergencia', icon: '🏥' },
  { id: 'sen-004', name: 'Plan de Evacuación Piso 2', code: 'PLAN-001', sectorId: 'oficinas', type: 'Señalética', icon: '🗺️' },
  
  // Mantención
  { id: 'ext-007', name: 'Extintor ABC 10kg - Taller', code: 'EXT-007', sectorId: 'mantención', type: 'Extintor', icon: '🧯' },
  { id: 'her-001', name: 'Herramientas Eléctricas - Inspección', code: 'HER-001', sectorId: 'mantención', type: 'Herramienta', icon: '🔌' },
  { id: 'epp-001', name: 'Gabinete EPP Mantención', code: 'EPP-001', sectorId: 'mantención', type: 'EPP', icon: '🦺' },
  
  // Exterior
  { id: 'ext-008', name: 'Extintor PQS 6kg - Estacionamiento', code: 'EXT-008', sectorId: 'exterior', type: 'Extintor', icon: '🧯' },
  { id: 'sen-005', name: 'Señalización Horizontal', code: 'SEN-005', sectorId: 'exterior', type: 'Señalética', icon: '🚸' },
  { id: 'lum-001', name: 'Luminarias de Emergencia', code: 'LUM-001', sectorId: 'exterior', type: 'Iluminación', icon: '💡' }
];

export function InspectionFormEnhanced({ onBack, onSubmit }: InspectionFormEnhancedProps) {
  const [formData, setFormData] = useState<InspectionFormData>({
    sector: '',
    asset: '',
    assetName: '',
    description: '',
    location: 'Sucursal Maipú - Av. Pajaritos 1234',
    photos: [],
    signature: null
  });
  
  const [isRecording, setIsRecording] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showSectorPicker, setShowSectorPicker] = useState(false);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [showDocumentWorkflow, setShowDocumentWorkflow] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Debug: monitor showDocumentWorkflow state
  useEffect(() => {
    console.log('📊 showDocumentWorkflow state changed:', showDocumentWorkflow);
  }, [showDocumentWorkflow]);

  // Filtrar activos por sector seleccionado
  const availableAssets = ASSETS.filter(asset => 
    asset.sectorId === formData.sector &&
    (assetSearchQuery === '' || 
     asset.name.toLowerCase().includes(assetSearchQuery.toLowerCase()) ||
     asset.code.toLowerCase().includes(assetSearchQuery.toLowerCase()))
  );

  const selectedSector = SECTORS.find(s => s.id === formData.sector);
  const selectedAsset = ASSETS.find(a => a.id === formData.asset);

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.info('🎤 Grabando...', { duration: 2000 });
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          description: prev.description + ' Estado operativo. Presión normal. Señalética visible. Última recarga: 15/08/2024. Sin observaciones adicionales.'
        }));
        setIsRecording(false);
        toast.success('✅ Audio transcrito', { duration: 2000 });
      }, 2000);
    }
  };

  const handleAddPhoto = () => {
    const newPhoto = `https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop`;
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, newPhoto]
    }));
    toast.success('📷 Foto agregada', { duration: 1500 });
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSelectSector = (sectorId: string) => {
    setFormData(prev => ({
      ...prev,
      sector: sectorId,
      asset: '', // Reset asset cuando cambia sector
      assetName: ''
    }));
    setShowSectorPicker(false);
    setAssetSearchQuery('');
    toast.success('📍 Sector seleccionado', { duration: 1500 });
  };

  const handleSelectAsset = (asset: Asset) => {
    setFormData(prev => ({
      ...prev,
      asset: asset.id,
      assetName: asset.name
    }));
    setShowAssetPicker(false);
    setAssetSearchQuery('');
    toast.success(`✅ ${asset.name}`, { duration: 2000 });
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const signature = canvas.toDataURL();
    setFormData(prev => ({ ...prev, signature }));
    setShowSignatureModal(false);
    toast.success('✍️ Firma guardada', { duration: 2000 });
  };

  const handleSubmit = () => {
    console.log('🔍 handleSubmit called');
    console.log('Form Data:', formData);
    
    if (!formData.sector) {
      console.log('❌ Validation failed: No sector');
      toast.error('Sector requerido', { description: 'Selecciona un sector antes de continuar' });
      return;
    }
    if (!formData.asset) {
      console.log('❌ Validation failed: No asset');
      toast.error('Activo requerido', { description: 'Selecciona un activo para inspeccionar' });
      return;
    }
    if (!formData.description) {
      console.log('❌ Validation failed: No description');
      toast.error('Descripción requerida', { description: 'Agrega observaciones de la inspección' });
      return;
    }
    
    console.log('✅ All validations passed, showing workflow');
    console.log('📊 showDocumentWorkflow antes:', showDocumentWorkflow);
    // Activar flujo de documento universal
    setShowDocumentWorkflow(true);
    console.log('📊 setShowDocumentWorkflow(true) ejecutado');
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          location: `${prev.location} (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`
        }));
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors pb-20 lg:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-700 dark:to-red-700 border-b border-orange-500 dark:border-orange-600 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver</span>
            </button>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-white text-xl lg:text-2xl mb-1 font-bold">
                {formData.assetName 
                  ? `🔍 ${formData.assetName}` 
                  : '🔍 Nueva Inspección'}
              </h1>
              <p className="text-white/80 text-sm">
                {selectedSector 
                  ? `${selectedSector.icon} ${selectedSector.name}` 
                  : 'Selecciona sector y activo a inspeccionar'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Location Badge */}
        <Badge className="bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700 py-2 px-3">
          <MapPin className="w-3 h-3 mr-1" />
          {formData.location}
        </Badge>

        {/* PASO 1: Selector de Sector */}
        <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label className="text-slate-900 dark:text-white mb-1 block">
                PASO 1: Sector de la Empresa *
              </Label>
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                Selecciona el área donde realizarás la inspección
              </p>
            </div>
            <Building2 className="w-5 h-5 text-orange-600" />
          </div>

          {formData.sector ? (
            <div 
              onClick={() => setShowSectorPicker(true)}
              className="p-4 bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-300 dark:border-orange-800 rounded-lg cursor-pointer hover:border-orange-500 dark:hover:border-orange-600 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{selectedSector?.icon}</div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {selectedSector?.name}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-zinc-400">
                      Click para cambiar
                    </div>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setShowSectorPicker(true)}
              variant="outline"
              className="w-full h-auto py-4 border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-orange-500 dark:hover:border-orange-600"
            >
              <Building2 className="w-5 h-5 mr-2" />
              Seleccionar Sector
            </Button>
          )}
        </Card>

        {/* PASO 2: Selector de Activo (solo si hay sector seleccionado) */}
        {formData.sector && (
          <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Label className="text-slate-900 dark:text-white mb-1 block">
                  PASO 2: Activo a Inspeccionar *
                </Label>
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  Elige el equipo o elemento específico
                </p>
              </div>
              <Package className="w-5 h-5 text-blue-600" />
            </div>

            {formData.asset ? (
              <div 
                onClick={() => setShowAssetPicker(true)}
                className="p-4 bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-300 dark:border-blue-800 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-600 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{selectedAsset?.icon}</div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {selectedAsset?.name}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-zinc-400">
                        Código: {selectedAsset?.code} • {selectedAsset?.type}
                      </div>
                    </div>
                  </div>
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setShowAssetPicker(true)}
                variant="outline"
                className="w-full h-auto py-4 border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-600"
              >
                <Package className="w-5 h-5 mr-2" />
                Seleccionar Activo ({availableAssets.length} disponibles)
              </Button>
            )}
          </Card>
        )}

        {/* PASO 3: Observaciones (solo si hay activo seleccionado) */}
        {formData.asset && (
          <>
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-slate-900 dark:text-white">
                  PASO 3: Observaciones de la Inspección *
                </Label>
                <Button
                  onClick={handleVoiceRecord}
                  size="sm"
                  variant={isRecording ? 'destructive' : 'outline'}
                  className={isRecording ? 'animate-pulse' : ''}
                >
                  <Mic className="w-4 h-4 mr-1" />
                  {isRecording ? 'Grabando...' : 'Dictar'}
                </Button>
              </div>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe el estado del activo, condiciones encontradas, cumplimiento normativo, etc."
                className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white placeholder:text-zinc-500 min-h-[120px]"
              />
            </Card>

            {/* Fotos */}
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-slate-900 dark:text-white">
                  Fotos de Evidencia (Opcional)
                </Label>
                <Button onClick={handleAddPhoto} size="sm" variant="outline">
                  <Camera className="w-4 h-4 mr-1" />
                  Tomar Foto
                </Button>
              </div>

              {formData.photos.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Evidencia ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Firma Digital */}
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <Label className="text-slate-900 dark:text-white mb-4 block">
                Firma del Inspector (Opcional)
              </Label>
              {formData.signature ? (
                <div className="space-y-3">
                  <img
                    src={formData.signature}
                    alt="Firma"
                    className="border-2 border-slate-200 dark:border-zinc-700 rounded-lg p-2 bg-white"
                  />
                  <Button
                    onClick={() => setShowSignatureModal(true)}
                    variant="outline"
                    className="w-full"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Modificar Firma
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowSignatureModal(true)}
                  variant="outline"
                  className="w-full h-20 border-2 border-dashed border-slate-300 dark:border-zinc-700"
                >
                  <Pencil className="w-5 h-5 mr-2" />
                  Agregar Firma Digital
                </Button>
              )}
            </Card>

            {/* Botón Enviar */}
            <Button
              onClick={handleSubmit}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-14 text-lg"
            >
              <Send className="w-5 h-5 mr-2" />
              Enviar Inspección
            </Button>
          </>
        )}
      </div>

      {/* Modal: Selector de Sector */}
      {showSectorPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-t-2xl lg:rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Seleccionar Sector
                </h3>
                <button
                  onClick={() => setShowSectorPicker(false)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-3 overflow-y-auto max-h-[60vh]">
              {SECTORS.map(sector => (
                <button
                  key={sector.id}
                  onClick={() => handleSelectSector(sector.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    formData.sector === sector.id
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                      : 'border-slate-200 dark:border-zinc-800 hover:border-orange-300 dark:hover:border-orange-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{sector.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {sector.name}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-zinc-400">
                        {ASSETS.filter(a => a.sectorId === sector.id).length} activos disponibles
                      </div>
                    </div>
                    {formData.sector === sector.id && (
                      <CheckCircle className="w-5 h-5 text-orange-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Selector de Activo */}
      {showAssetPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-t-2xl lg:rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Seleccionar Activo
                </h3>
                <button
                  onClick={() => {
                    setShowAssetPicker(false);
                    setAssetSearchQuery('');
                  }}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Buscador */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={assetSearchQuery}
                  onChange={(e) => setAssetSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre o código..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="p-6 space-y-3 overflow-y-auto max-h-[50vh]">
              {availableAssets.length > 0 ? (
                availableAssets.map(asset => (
                  <button
                    key={asset.id}
                    onClick={() => handleSelectAsset(asset)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      formData.asset === asset.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                        : 'border-slate-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{asset.icon}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {asset.name}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-zinc-400 flex items-center gap-2 mt-1">
                          <Badge className="bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-0 text-xs">
                            {asset.code}
                          </Badge>
                          <span>{asset.type}</span>
                        </div>
                      </div>
                      {formData.asset === asset.id && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-slate-400 dark:text-zinc-600 mx-auto mb-3" />
                  <p className="text-slate-600 dark:text-zinc-400">
                    {assetSearchQuery 
                      ? 'No se encontraron activos con esa búsqueda' 
                      : 'No hay activos en este sector'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Firma Digital */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white dark:bg-zinc-900">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Firma Digital
                </h3>
                <button
                  onClick={() => setShowSignatureModal(false)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="border-2 border-slate-200 dark:border-zinc-700 rounded-lg mb-4 bg-white">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={200}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full touch-none"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={clearSignature} variant="outline" className="flex-1">
                  Limpiar
                </Button>
                <Button onClick={saveSignature} className="flex-1 bg-green-600 hover:bg-green-700">
                  Guardar Firma
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Flujo de Documento Universal */}
      {showDocumentWorkflow && (
        <DocumentPreviewAndSend
          documentType="INSPECCIÓN DE TERRENO"
          documentTitle={`${formData.assetName} - ${selectedSector?.name}`}
          company="Constructora Los Andes S.A."
          documentData={{
            sector: selectedSector?.name || '',
            asset: formData.assetName,
            assetCode: selectedAsset?.code || '',
            branch: 'Sucursal Maipú',
            preventionist: 'Juan Pérez Silva',
            content: formData.description,
            location: formData.location,
            gps: formData.location,
            photos: formData.photos.length,
            assetType: selectedAsset?.type || ''
          }}
          workers={formData.signature ? [{
            id: 'inspector-1',
            name: 'Juan Pérez Silva',
            rut: '12.345.678-9',
            position: 'Prevencionista de Riesgos',
            department: 'Prevención',
            email: 'juan.perez@losandes.cl',
            signature: formData.signature,
            signedAt: new Date().toLocaleString('es-CL')
          }] : []}
          onClose={() => setShowDocumentWorkflow(false)}
          onSendComplete={() => {
            setShowDocumentWorkflow(false);
            onSubmit(formData);
          }}
        />
      )}
    </div>
  );
}