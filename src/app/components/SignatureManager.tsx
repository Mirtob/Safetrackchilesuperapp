import { useState, useRef } from 'react';
import { 
  Save, 
  Trash2, 
  Edit2, 
  Plus, 
  Database,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  User,
  Calendar,
  Shield,
  Download,
  Upload
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { toast } from 'sonner';

interface SavedSignature {
  id: string;
  name: string;
  role: string;
  rut: string;
  signatureData: string; // Base64 de la firma
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
  isEmergency: boolean;
}

interface SignatureManagerProps {
  onSelectSignature?: (signature: SavedSignature) => void;
}

export function SignatureManager({ onSelectSignature }: SignatureManagerProps) {
  const [signatures, setSignatures] = useState<SavedSignature[]>([
    {
      id: 'SIG-001',
      name: 'Juan Pérez Muñoz',
      role: 'Prevencionista de Riesgos',
      rut: '18.234.567-8',
      signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      createdAt: '2026-01-15',
      lastUsed: '2026-01-26',
      usageCount: 45,
      isEmergency: false
    },
    {
      id: 'SIG-002',
      name: 'María González Silva',
      role: 'Gerente de Operaciones',
      rut: '16.789.234-5',
      signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      createdAt: '2026-01-20',
      lastUsed: '2026-01-25',
      usageCount: 12,
      isEmergency: true
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSignature, setEditingSignature] = useState<SavedSignature | null>(null);
  const [newSignature, setNewSignature] = useState({
    name: '',
    role: '',
    rut: '',
    isEmergency: false
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSaveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Validaciones
    if (!newSignature.name || !newSignature.role || !newSignature.rut) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    // Verificar que se haya dibujado algo
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const hasDrawing = imageData.data.some((channel, index) => {
        return index % 4 === 3 && channel !== 0; // Check alpha channel
      });

      if (!hasDrawing) {
        toast.error('Debes dibujar una firma');
        return;
      }
    }

    const signatureData = canvas.toDataURL();

    if (editingSignature) {
      // Editar firma existente
      setSignatures(sigs => sigs.map(sig => 
        sig.id === editingSignature.id
          ? {
              ...sig,
              name: newSignature.name,
              role: newSignature.role,
              rut: newSignature.rut,
              signatureData,
              isEmergency: newSignature.isEmergency
            }
          : sig
      ));
      toast.success('Firma actualizada correctamente');
      setEditingSignature(null);
    } else {
      // Agregar nueva firma
      const newSig: SavedSignature = {
        id: `SIG-${String(signatures.length + 1).padStart(3, '0')}`,
        name: newSignature.name,
        role: newSignature.role,
        rut: newSignature.rut,
        signatureData,
        createdAt: new Date().toLocaleDateString('es-CL'),
        usageCount: 0,
        isEmergency: newSignature.isEmergency
      };
      
      setSignatures([...signatures, newSig]);
      toast.success('Firma guardada correctamente');
    }

    // Reset form
    setNewSignature({ name: '', role: '', rut: '', isEmergency: false });
    clearCanvas();
    setShowAddModal(false);
  };

  const handleDeleteSignature = (id: string) => {
    const signature = signatures.find(sig => sig.id === id);
    if (!signature) return;

    if (signature.usageCount > 0) {
      toast.error('No se puede eliminar', {
        description: `Esta firma ha sido utilizada ${signature.usageCount} veces. Por seguridad legal, no se puede eliminar.`
      });
      return;
    }

    setSignatures(sigs => sigs.filter(sig => sig.id !== id));
    toast.success('Firma eliminada correctamente');
  };

  const handleEditSignature = (signature: SavedSignature) => {
    setEditingSignature(signature);
    setNewSignature({
      name: signature.name,
      role: signature.role,
      rut: signature.rut,
      isEmergency: signature.isEmergency
    });
    setShowAddModal(true);

    // Cargar firma en canvas
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = signature.signatureData;
      }
    }, 100);
  };

  const handleUseSignature = (signature: SavedSignature) => {
    // Actualizar contador de uso
    setSignatures(sigs => sigs.map(sig => 
      sig.id === signature.id
        ? {
            ...sig,
            lastUsed: new Date().toLocaleDateString('es-CL'),
            usageCount: sig.usageCount + 1
          }
        : sig
    ));

    if (onSelectSignature) {
      onSelectSignature(signature);
    }

    toast.success('Firma aplicada al documento');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-900 dark:text-white text-xl font-semibold flex items-center gap-2">
            <Database className="w-6 h-6 text-[#FF8C00]" />
            Gestión de Firmas Guardadas
          </h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
            Administra firmas para uso en emergencias o documentos críticos
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingSignature(null);
            setNewSignature({ name: '', role: '', rut: '', isEmergency: false });
            clearCanvas();
            setShowAddModal(true);
          }}
          className="bg-[#FF8C00] hover:bg-orange-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Firma
        </Button>
      </div>

      {/* Alerta de uso responsable */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-amber-900 dark:text-amber-400 font-semibold mb-1">
                ⚠️ Uso Exclusivo para Emergencias
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Las firmas guardadas solo deben usarse en situaciones críticas donde no sea posible obtener la firma 
                en tiempo real (accidentes graves, evacuaciones, etc.). El uso indebido puede invalidar la 
                documentación legalmente.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Lista de firmas guardadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {signatures.map((signature) => (
          <Card 
            key={signature.id}
            className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:shadow-lg transition-all"
          >
            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-slate-900 dark:text-white font-semibold">{signature.name}</h3>
                    {signature.isEmergency && (
                      <Badge className="bg-red-500/20 text-red-600 dark:text-red-400 border-0 text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Emergencia
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-zinc-400">{signature.role}</p>
                  <p className="text-xs text-slate-500 dark:text-zinc-500">RUT: {signature.rut}</p>
                </div>
                <div className="bg-slate-100 dark:bg-zinc-700 rounded-lg p-2">
                  <UserCheck className="w-5 h-5 text-slate-600 dark:text-zinc-400" />
                </div>
              </div>

              {/* Firma preview */}
              <div className="bg-slate-50 dark:bg-zinc-900/50 rounded-lg p-3 mb-4 h-24 flex items-center justify-center">
                <img 
                  src={signature.signatureData} 
                  alt={`Firma de ${signature.name}`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                  <p className="text-xs text-blue-700 dark:text-blue-400 mb-1">Creada</p>
                  <p className="text-blue-900 dark:text-blue-300 font-medium">{signature.createdAt}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                  <p className="text-xs text-green-700 dark:text-green-400 mb-1">Usos</p>
                  <p className="text-green-900 dark:text-green-300 font-medium">{signature.usageCount} veces</p>
                </div>
              </div>

              {signature.lastUsed && (
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400 mb-4">
                  <Calendar className="w-3 h-3" />
                  Último uso: {signature.lastUsed}
                </div>
              )}

              {/* Acciones */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handleUseSignature(signature)}
                  size="sm"
                  className="bg-[#FF8C00] hover:bg-orange-600 text-white flex-1"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Usar Firma
                </Button>
                <Button
                  onClick={() => handleEditSignature(signature)}
                  size="sm"
                  variant="outline"
                  className="border-slate-300 dark:border-zinc-600"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleDeleteSignature(signature.id)}
                  size="sm"
                  variant="outline"
                  disabled={signature.usageCount > 0}
                  className="border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {signature.usageCount > 0 && (
                <p className="text-xs text-slate-500 dark:text-zinc-500 mt-2 text-center">
                  🔒 Protegida por trazabilidad legal
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {signatures.length === 0 && (
        <Card className="bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700">
          <div className="p-12 text-center">
            <Database className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-slate-900 dark:text-white text-lg font-semibold mb-2">
              No hay firmas guardadas
            </h3>
            <p className="text-slate-600 dark:text-zinc-400 mb-6">
              Agrega firmas para usar en situaciones de emergencia
            </p>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-[#FF8C00] hover:bg-orange-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primera Firma
            </Button>
          </div>
        </Card>
      )}

      {/* Modal Agregar/Editar Firma */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <Card 
            className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h3 className="text-slate-900 dark:text-white text-xl mb-4">
                {editingSignature ? 'Editar Firma' : 'Nueva Firma'}
              </h3>

              {/* Formulario */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm text-slate-700 dark:text-zinc-300 mb-2">
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newSignature.name}
                    onChange={(e) => setNewSignature({ ...newSignature, name: e.target.value })}
                    placeholder="Ej: Juan Pérez Muñoz"
                    className="bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-700 dark:text-zinc-300 mb-2">
                    Cargo/Rol <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newSignature.role}
                    onChange={(e) => setNewSignature({ ...newSignature, role: e.target.value })}
                    placeholder="Ej: Prevencionista de Riesgos"
                    className="bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-600"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-700 dark:text-zinc-300 mb-2">
                    RUT <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newSignature.rut}
                    onChange={(e) => setNewSignature({ ...newSignature, rut: e.target.value })}
                    placeholder="Ej: 18.234.567-8"
                    className="bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-600"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isEmergency"
                    checked={newSignature.isEmergency}
                    onChange={(e) => setNewSignature({ ...newSignature, isEmergency: e.target.checked })}
                    className="w-4 h-4 text-[#FF8C00] rounded border-slate-300 dark:border-zinc-600"
                  />
                  <label htmlFor="isEmergency" className="text-sm text-slate-700 dark:text-zinc-300">
                    Marcar como firma de emergencia
                  </label>
                </div>
              </div>

              {/* Canvas para firma */}
              <div className="mb-6">
                <label className="block text-sm text-slate-700 dark:text-zinc-300 mb-2">
                  Dibujar Firma <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-zinc-600 rounded-lg p-2 bg-white">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={200}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full cursor-crosshair touch-none"
                    style={{ touchAction: 'none' }}
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={clearCanvas}
                    size="sm"
                    variant="outline"
                    className="text-slate-600 dark:text-zinc-400"
                  >
                    Limpiar
                  </Button>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-3">
                <Button
                  onClick={handleSaveSignature}
                  className="bg-[#FF8C00] hover:bg-orange-600 text-white flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingSignature ? 'Actualizar Firma' : 'Guardar Firma'}
                </Button>
                <Button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingSignature(null);
                    setNewSignature({ name: '', role: '', rut: '', isEmergency: false });
                    clearCanvas();
                  }}
                  variant="outline"
                  className="flex-1"
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
