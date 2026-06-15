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
  Pencil
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';

interface SmartFormProps {
  formType: 'inspection' | 'epp' | 'incident' | 'talk';
  onBack: () => void;
  onSubmit: (data: FormData) => void;
}

interface FormData {
  title: string;
  description: string;
  location: string;
  photos: string[];
  signature: string | null;
  talkType?: string; // Tipo de charla
  selectedEPPs?: string[]; // NUEVO: EPPs seleccionados para entrega
  useCompanyKit?: boolean; // NUEVO: Usar kit completo de la empresa
}

export function SmartForm({ formType, onBack, onSubmit }: SmartFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    location: 'Sucursal Maipú - Av. Pajaritos 1234',
    photos: [],
    signature: null,
    talkType: formType === 'talk' ? 'seguridad-general' : undefined,
    selectedEPPs: formType === 'epp' ? [] : undefined, // Inicializar si es EPP
    useCompanyKit: false
  });
  
  const [isRecording, setIsRecording] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const formTitles = {
    inspection: 'Nueva Inspección',
    epp: 'Entrega de EPP',
    incident: 'Reporte de Incidente',
    talk: 'Charla de 5 Minutos'
  };

  // Tipos de charla para el combobox
  const talkTypes = [
    { value: 'seguridad-general', label: '🛡️ Seguridad General', color: 'text-orange-400' },
    { value: 'prevencion-incendios', label: '🔥 Prevención de Incendios', color: 'text-red-400' },
    { value: 'salud-ocupacional', label: '💚 Salud Ocupacional', color: 'text-green-400' },
    { value: 'uso-epp', label: '🦺 Uso Correcto de EPP', color: 'text-yellow-400' },
    { value: 'trabajo-altura', label: '⬆️ Trabajo en Altura', color: 'text-blue-400' },
    { value: 'espacios-confinados', label: '🚪 Espacios Confinados', color: 'text-purple-400' },
    { value: 'manejo-quimicos', label: '🧪 Manejo de Químicos', color: 'text-pink-400' },
    { value: 'ergonomia', label: '💪 Ergonomía y Posturas', color: 'text-indigo-400' },
    { value: 'emergencias', label: '🚨 Plan de Emergencias', color: 'text-red-500' },
    { value: 'electricidad', label: '⚡ Seguridad Eléctrica', color: 'text-yellow-500' },
  ];

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // Simulación de transcripción
    if (!isRecording) {
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          description: prev.description + ' [Texto transcrito desde audio: Extintor PQS de 6kg en pasillo central con manómetro descalibrado.]'
        }));
        setIsRecording(false);
      }, 2000);
    }
  };

  const handleAddPhoto = () => {
    // Simulación de captura de foto
    const newPhoto = `https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop`;
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, newPhoto]
    }));
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
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
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  useEffect(() => {
    // Obtener geolocalización
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
    <div className="min-h-screen bg-zinc-900">
      {/* Header */}
      <div className="bg-zinc-800 border-b border-zinc-700 sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver</span>
            </button>
          </div>
          
          {/* Título con Combobox integrado para Charlas */}
          {formType === 'talk' ? (
            <div className="mt-3">
              <h1 className="text-white text-xl mb-3">{formTitles[formType]}</h1>
              <Select
                value={formData.talkType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, talkType: value }))}
              >
                <SelectTrigger className="bg-zinc-700 border-zinc-600 text-white h-12 w-full">
                  <SelectValue placeholder="Selecciona el tipo de charla" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {talkTypes.map(talkType => (
                    <SelectItem 
                      key={talkType.value} 
                      value={talkType.value} 
                      className="text-white hover:bg-zinc-700 focus:bg-zinc-700"
                    >
                      <span className={talkType.color}>{talkType.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <h1 className="text-white text-xl mt-3">{formTitles[formType]}</h1>
          )}
        </div>
      </div>

      <div className="p-4 pb-32">
        {/* Location Badge */}
        <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 mb-4 py-2 px-3">
          <MapPin className="w-3 h-3 mr-1" />
          {formData.location}
        </Badge>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <Label className="text-zinc-300 mb-2 block">Título</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ej: Inspección de extintores - Piso 2"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 h-12"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-zinc-300">Descripción / Observaciones</Label>
              <Button
                onClick={handleVoiceRecord}
                size="sm"
                variant="outline"
                className={`${
                  isRecording 
                    ? 'bg-red-600 border-red-600 text-white' 
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}
              >
                <Mic className={`w-4 h-4 mr-1 ${isRecording ? 'animate-pulse' : ''}`} />
                {isRecording ? 'Grabando...' : 'Dictar'}
              </Button>
            </div>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe la situación... o usa el botón 'Dictar' para hablar"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[120px]"
            />
          </div>

          {/* Photos Section */}
          <div>
            <Label className="text-zinc-300 mb-2 block">Evidencia Fotográfica</Label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-1 right-1 bg-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
            <Button
              onClick={handleAddPhoto}
              variant="outline"
              className="w-full bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white h-12"
            >
              <Camera className="w-4 h-4 mr-2" />
              Capturar Foto con Anotaciones
            </Button>
          </div>

          {/* Signature Section */}
          <div>
            <Label className="text-zinc-300 mb-2 block">Firma Digital</Label>
            {formData.signature ? (
              <Card className="bg-zinc-800 border-zinc-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-white">Firma capturada</span>
                  </div>
                  <Button
                    onClick={() => setShowSignatureModal(true)}
                    size="sm"
                    variant="outline"
                    className="bg-zinc-700 border-zinc-600 text-zinc-300"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
                <img src={formData.signature} alt="Firma" className="mt-2 w-full rounded border border-zinc-700" />
              </Card>
            ) : (
              <Button
                onClick={() => setShowSignatureModal(true)}
                variant="outline"
                className="w-full bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white h-12"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Firmar Documento
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Submit Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-800 border-t border-zinc-700 p-4">
        <Button
          onClick={handleSubmit}
          className="w-full h-14 bg-[#FF8C00] hover:bg-orange-600 text-white text-lg"
        >
          <Send className="w-5 h-5 mr-2" />
          Enviar y Generar PDF
        </Button>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="bg-zinc-800 border-zinc-700 w-full max-w-md">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white">Firma Digital</h3>
                <button
                  onClick={() => setShowSignatureModal(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="bg-white rounded-lg mb-4">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={200}
                  className="w-full touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={clearSignature}
                  variant="outline"
                  className="flex-1 bg-zinc-700 border-zinc-600 text-zinc-300"
                >
                  Limpiar
                </Button>
                <Button
                  onClick={saveSignature}
                  className="flex-1 bg-[#0055A4] hover:bg-blue-700 text-white"
                >
                  Guardar Firma
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}