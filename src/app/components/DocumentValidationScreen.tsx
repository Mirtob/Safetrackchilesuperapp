import { useState } from 'react';
import { ArrowLeft, FileText, AlertCircle, Check, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Shield, TrendingUp, Users, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { toast } from 'sonner';

interface DocumentValidationScreenProps {
  onBack: () => void;
  onConfirm: () => void;
}

interface ExtractedField {
  id: string;
  label: string;
  value: string;
  confidence: number; // 0-100
  pdfPageNumber: number;
  pdfCoordinates: { x: number; y: number; width: number; height: number };
}

export function DocumentValidationScreen({ onBack, onConfirm }: DocumentValidationScreenProps) {
  const [pdfZoom, setPdfZoom] = useState(100);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [hasManualEdits, setHasManualEdits] = useState(false);
  
  // Datos extraídos por la IA
  const [extractedData, setExtractedData] = useState<ExtractedField[]>([
    {
      id: 'month',
      label: 'Mes del Certificado',
      value: 'Enero 2026',
      confidence: 99,
      pdfPageNumber: 1,
      pdfCoordinates: { x: 120, y: 50, width: 100, height: 20 }
    },
    {
      id: 'workers',
      label: 'N° Trabajadores',
      value: '145',
      confidence: 98,
      pdfPageNumber: 1,
      pdfCoordinates: { x: 120, y: 150, width: 60, height: 20 }
    },
    {
      id: 'hht',
      label: 'Horas Hombre Trabajadas',
      value: '23,200',
      confidence: 96,
      pdfPageNumber: 1,
      pdfCoordinates: { x: 120, y: 180, width: 80, height: 20 }
    },
    {
      id: 'accidents',
      label: 'N° Accidentes',
      value: '2',
      confidence: 87, // Baja confianza - requiere revisión
      pdfPageNumber: 1,
      pdfCoordinates: { x: 120, y: 210, width: 40, height: 20 }
    },
    {
      id: 'rateIF',
      label: 'Tasa de Accidentabilidad (IF)',
      value: '0.86',
      confidence: 94,
      pdfPageNumber: 1,
      pdfCoordinates: { x: 120, y: 250, width: 60, height: 20 }
    },
    {
      id: 'rateIG',
      label: 'Tasa de Gravedad (IG)',
      value: '34.48',
      confidence: 92,
      pdfPageNumber: 1,
      pdfCoordinates: { x: 120, y: 280, width: 60, height: 20 }
    }
  ]);

  const handleFieldClick = (field: ExtractedField) => {
    setActiveField(field.id);
    // En implementación real, esto scrollearía el PDF y resaltaría la zona
    toast.info(`📍 Ubicando dato en PDF`, {
      description: `Página ${field.pdfPageNumber}, zona resaltada en amarillo`
    });
  };

  const handleFieldChange = (fieldId: string, newValue: string) => {
    setExtractedData(prev => 
      prev.map(field => 
        field.id === fieldId ? { ...field, value: newValue } : field
      )
    );
    setHasManualEdits(true);
  };

  const handleConfirmData = () => {
    const lowConfidenceFields = extractedData.filter(f => f.confidence < 90);
    
    if (lowConfidenceFields.length > 0 && !hasManualEdits) {
      toast.error('⚠️ Campos con Baja Confianza', {
        description: 'Revisa los campos marcados en amarillo antes de confirmar'
      });
      return;
    }

    toast.success('✅ Datos de Enero 2026 integrados', {
      description: 'Las tasas IF/IG han sido actualizadas en el Dashboard',
      duration: 5000
    });

    setTimeout(() => {
      onConfirm();
    }, 1500);
  };

  const handleReject = () => {
    toast.info('Documento Rechazado', {
      description: 'Podrás ingresar los datos manualmente'
    });
    onBack();
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 95) {
      return <Badge className="bg-green-600 text-white border-0 text-xs">Alta Confianza</Badge>;
    } else if (confidence >= 90) {
      return <Badge className="bg-blue-600 text-white border-0 text-xs">Confianza Media</Badge>;
    } else {
      return <Badge className="bg-yellow-600 text-white border-0 text-xs">Revisar</Badge>;
    }
  };

  const getFieldBorderClass = (confidence: number) => {
    if (confidence >= 95) {
      return 'border-green-500 dark:border-green-600';
    } else if (confidence >= 90) {
      return 'border-blue-500 dark:border-blue-600';
    } else {
      return 'border-yellow-500 dark:border-yellow-600 ring-2 ring-yellow-500/20';
    }
  };

  const overallConfidence = Math.round(
    extractedData.reduce((acc, f) => acc + f.confidence, 0) / extractedData.length
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 border-b border-purple-500 dark:border-purple-600 sticky top-0 z-10">
        <div className="max-w-full px-4 pt-16 pb-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver</span>
            </button>
            <div className="flex items-center gap-2">
              {getConfidenceBadge(overallConfidence)}
              <Badge className="bg-white/20 text-white border-0">
                {overallConfidence}% Precisión
              </Badge>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-white text-xl lg:text-2xl mb-1 font-bold">
                🤖 Validador IA - Certificado ACHS
              </h1>
              <p className="text-white/80 text-sm">
                Enero 2026 • Constructora Los Andes S.A. • Recibido hace 2 horas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Tabs / Desktop: Split View */}
      <div className="lg:hidden">
        {/* Vista Móvil: Pestañas */}
        <Tabs defaultValue="data" className="w-full">
          <TabsList className="w-full grid grid-cols-2 bg-slate-200 dark:bg-zinc-800">
            <TabsTrigger value="pdf">
              <FileText className="w-4 h-4 mr-2" />
              PDF Original
            </TabsTrigger>
            <TabsTrigger value="data">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Datos Extraídos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pdf" className="p-4">
            <Card className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              {/* Visor PDF Mobile */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-blue-600 text-white border-0">
                    Página 1 de 1
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPdfZoom(Math.max(50, pdfZoom - 10))}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm px-2 flex items-center">{pdfZoom}%</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPdfZoom(Math.min(200, pdfZoom + 10))}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="bg-slate-100 dark:bg-zinc-800 rounded-lg h-[500px] flex items-center justify-center border border-slate-200 dark:border-zinc-700">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-slate-400 dark:text-zinc-600 mx-auto mb-3" />
                    <div className="text-slate-600 dark:text-zinc-400 text-sm">
                      Certificado_ACHS_Enero_2026.pdf
                    </div>
                    <div className="text-xs text-slate-500 dark:text-zinc-500 mt-2">
                      Zoom: {pdfZoom}%
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="p-4">
            {/* Formulario de datos extraídos */}
            <ExtractedDataForm
              data={extractedData}
              activeField={activeField}
              onFieldClick={handleFieldClick}
              onFieldChange={handleFieldChange}
              getFieldBorderClass={getFieldBorderClass}
              getConfidenceBadge={getConfidenceBadge}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop: Split View */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-4 p-4 max-w-full">
        {/* Lado Izquierdo: PDF Viewer */}
        <Card className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 sticky top-24 self-start">
          <div className="p-4 border-b border-slate-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  PDF Original
                </h3>
              </div>
              <Badge className="bg-blue-600 text-white border-0">
                Página 1 de 1
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPdfZoom(Math.max(50, pdfZoom - 10))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm px-2">{pdfZoom}%</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPdfZoom(Math.min(200, pdfZoom + 10))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <div className="flex-1" />
              <Button size="sm" variant="outline">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-4">
            <div className="bg-slate-100 dark:bg-zinc-800 rounded-lg h-[600px] flex items-center justify-center border border-slate-200 dark:border-zinc-700 relative overflow-hidden">
              {/* Simulación de PDF con zonas resaltadas */}
              <div className="absolute inset-0 p-8" style={{ zoom: `${pdfZoom}%` }}>
                <div className="bg-white dark:bg-zinc-900 w-full h-full p-6 shadow-lg">
                  <div className="text-center mb-6 pb-4 border-b-2 border-blue-600">
                    <img 
                      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='40' viewBox='0 0 120 40'%3E%3Ctext x='10' y='25' font-family='Arial' font-size='18' font-weight='bold' fill='%230055A4'%3EACHS%3C/text%3E%3C/svg%3E" 
                      alt="ACHS Logo"
                      className="mx-auto mb-2"
                    />
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      CERTIFICADO DE ESTADÍSTICA MENSUAL
                    </h2>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className={`flex justify-between p-2 rounded ${activeField === 'month' ? 'bg-yellow-200 dark:bg-yellow-900/40 ring-2 ring-yellow-500' : ''}`}>
                      <span className="font-semibold">Período:</span>
                      <span>Enero 2026</span>
                    </div>
                    <div className="flex justify-between p-2">
                      <span className="font-semibold">Empresa:</span>
                      <span>CONSTRUCTORA LOS ANDES S.A.</span>
                    </div>
                    <div className="flex justify-between p-2">
                      <span className="font-semibold">RUT:</span>
                      <span>76.XXX.XXX-X</span>
                    </div>
                    <div className={`flex justify-between p-2 rounded ${activeField === 'workers' ? 'bg-yellow-200 dark:bg-yellow-900/40 ring-2 ring-yellow-500' : ''}`}>
                      <span className="font-semibold">N° Trabajadores:</span>
                      <span>145</span>
                    </div>
                    <div className={`flex justify-between p-2 rounded ${activeField === 'hht' ? 'bg-yellow-200 dark:bg-yellow-900/40 ring-2 ring-yellow-500' : ''}`}>
                      <span className="font-semibold">HHT:</span>
                      <span>23,200</span>
                    </div>
                    <div className={`flex justify-between p-2 rounded ${activeField === 'accidents' ? 'bg-yellow-200 dark:bg-yellow-900/40 ring-2 ring-yellow-500' : ''}`}>
                      <span className="font-semibold">Accidentes:</span>
                      <span>2</span>
                    </div>
                    <div className={`flex justify-between p-2 rounded ${activeField === 'rateIF' ? 'bg-yellow-200 dark:bg-yellow-900/40 ring-2 ring-yellow-500' : ''}`}>
                      <span className="font-semibold">Tasa IF:</span>
                      <span>0.86</span>
                    </div>
                    <div className={`flex justify-between p-2 rounded ${activeField === 'rateIG' ? 'bg-yellow-200 dark:bg-yellow-900/40 ring-2 ring-yellow-500' : ''}`}>
                      <span className="font-semibold">Tasa IG:</span>
                      <span>34.48</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {activeField && (
              <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded text-sm text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Zona resaltada: {extractedData.find(f => f.id === activeField)?.label}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Lado Derecho: Datos Extraídos */}
        <div>
          <ExtractedDataForm
            data={extractedData}
            activeField={activeField}
            onFieldClick={handleFieldClick}
            onFieldChange={handleFieldChange}
            getFieldBorderClass={getFieldBorderClass}
            getConfidenceBadge={getConfidenceBadge}
          />
        </div>
      </div>

      {/* Action Bar Inferior (Fijo) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 p-4 z-20">
        <div className="max-w-7xl mx-auto flex gap-3">
          <Button
            onClick={handleReject}
            variant="outline"
            className="flex-1 lg:flex-none lg:px-8 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <X className="w-4 h-4 mr-2" />
            Rechazar / Corregir Manualmente
          </Button>
          <Button
            onClick={handleConfirmData}
            className="flex-1 lg:flex-none lg:px-12 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold"
          >
            <Check className="w-5 h-5 mr-2" />
            Confirmar e Integrar Datos
          </Button>
        </div>
      </div>
    </div>
  );
}

// Componente del Formulario de Datos Extraídos
interface ExtractedDataFormProps {
  data: ExtractedField[];
  activeField: string | null;
  onFieldClick: (field: ExtractedField) => void;
  onFieldChange: (fieldId: string, value: string) => void;
  getFieldBorderClass: (confidence: number) => string;
  getConfidenceBadge: (confidence: number) => JSX.Element;
}

function ExtractedDataForm({ 
  data, 
  activeField, 
  onFieldClick, 
  onFieldChange, 
  getFieldBorderClass,
  getConfidenceBadge 
}: ExtractedDataFormProps) {
  return (
    <Card className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
      <div className="p-4 border-b border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Datos Extraídos por IA
          </h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-zinc-400">
          Haz clic en cualquier campo para ver su ubicación en el PDF
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Alerta de campos con baja confianza */}
        {data.some(f => f.confidence < 90) && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  ⚠️ Algunos Campos Requieren Revisión
                </h4>
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  Los campos marcados con borde amarillo tienen menor confianza. 
                  Revisa que coincidan con el PDF antes de confirmar.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Campos extraídos */}
        {data.map((field) => (
          <div
            key={field.id}
            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
              activeField === field.id 
                ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-500' 
                : 'bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-800'
            } ${getFieldBorderClass(field.confidence)}`}
            onClick={() => onFieldClick(field)}
          >
            <div className="flex items-start justify-between mb-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                {field.label}
              </Label>
              {getConfidenceBadge(field.confidence)}
            </div>
            
            <Input
              value={field.value}
              onChange={(e) => onFieldChange(field.id, e.target.value)}
              className={`text-lg font-semibold ${
                field.confidence >= 95 
                  ? 'border-green-500 dark:border-green-600' 
                  : field.confidence >= 90
                  ? 'border-blue-500 dark:border-blue-600'
                  : 'border-yellow-500 dark:border-yellow-600'
              }`}
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-slate-500 dark:text-zinc-500">
                Confianza: {field.confidence}%
              </div>
              {field.confidence < 90 && (
                <div className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Revisar con PDF
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Resumen de impacto */}
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-900 rounded-lg">
          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Impacto al Confirmar Estos Datos:
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300">
              <Check className="w-4 h-4 text-green-600" />
              <span>Dashboard actualizado con tasas IF/IG de Enero 2026</span>
            </div>
            <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300">
              <Check className="w-4 h-4 text-green-600" />
              <span>Gráficos históricos actualizados automáticamente</span>
            </div>
            <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300">
              <Check className="w-4 h-4 text-green-600" />
              <span>PDF archivado en Bóveda Documental con metadata</span>
            </div>
            <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300">
              <Check className="w-4 h-4 text-green-600" />
              <span>Alertas automáticas si tasas superan límites</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
