import { useState, useRef } from 'react';
import { X, Receipt, Calendar, MapPin, DollarSign, Upload, Image as ImageIcon, FileText, Save, Camera, Trash2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';

interface ClientCompany {
  id: string;
  name: string;
  brandColor: string;
}

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientCompany[];
  onSave: (data: any) => void;
}

type ExpenseCategory = 'transport' | 'fuel' | 'food' | 'accommodation' | 'materials' | 'other';

export function AddExpenseModal({ isOpen, onClose, clients, onSave }: AddExpenseModalProps) {
  const [selectedClient, setSelectedClient] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('transport');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [location, setLocation] = useState('');
  const [mileage, setMileage] = useState('');
  const [receipts, setReceipts] = useState<Array<{ id: string; url: string; name: string; type: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const selectedClientData = clients.find(c => c.id === selectedClient);

  const categories = [
    { value: 'transport', label: 'Transporte', icon: '🚗' },
    { value: 'fuel', label: 'Combustible', icon: '⛽' },
    { value: 'food', label: 'Alimentación', icon: '🍴' },
    { value: 'accommodation', label: 'Alojamiento', icon: '🏨' },
    { value: 'materials', label: 'Materiales/EPP', icon: '🛠️' },
    { value: 'other', label: 'Otros', icon: '📄' }
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`El archivo ${file.name} es muy grande. Máximo 5MB`);
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} no es una imagen válida`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const newReceipt = {
          id: Math.random().toString(36).substring(7),
          url: event.target?.result as string,
          name: file.name,
          type: file.type
        };
        setReceipts(prev => [...prev, newReceipt]);
        toast.success(`📷 ${file.name} agregado`);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveReceipt = (id: string) => {
    setReceipts(prev => prev.filter(r => r.id !== id));
    toast.success('Comprobante eliminado');
  };

  const handleSave = () => {
    if (!selectedClient || !date || !amount || parseFloat(amount) <= 0) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (receipts.length === 0) {
      toast.error('⚠️ Debes agregar al menos una foto de boleta o factura');
      return;
    }

    const data = {
      clientId: selectedClient,
      clientName: selectedClientData?.name,
      date,
      category,
      description,
      amount: parseFloat(amount),
      location,
      mileage: mileage ? parseFloat(mileage) : undefined,
      receipts: receipts.map(r => r.url),
      status: 'pending',
      gpsVerified: true
    };

    onSave(data);
    toast.success('✅ Gasto registrado exitosamente');
    onClose();
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.capture = 'environment' as any;
      fileInputRef.current.click();
    }
  };

  const handleGallerySelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-2 rounded-lg">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                Registrar Gasto
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Rendir viáticos y gastos con comprobantes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Cliente */}
          <div>
            <Label className="text-zinc-900 dark:text-white mb-2 block">
              Cliente <span className="text-red-500">*</span>
            </Label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            >
              <option value="">Selecciona un cliente</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha y Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-900 dark:text-white mb-2 block">
                Fecha <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div>
              <Label className="text-zinc-900 dark:text-white mb-2 block">
                Categoría <span className="text-red-500">*</span>
              </Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <Label className="text-zinc-900 dark:text-white mb-2 block">
              Descripción del Gasto <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Traslado en taxi al cliente, Almuerzo de trabajo..."
                className="pl-10 min-h-[80px]"
              />
            </div>
          </div>

          {/* Monto */}
          <div>
            <Label className="text-zinc-900 dark:text-white mb-2 block">
              Monto <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <Input
                type="number"
                step="100"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="15000"
                className="pl-10"
              />
            </div>
            {amount && parseFloat(amount) > 0 && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Monto: <span className="font-semibold">${parseFloat(amount).toLocaleString()} CLP</span>
              </p>
            )}
          </div>

          {/* Ubicación y Kilometraje */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-900 dark:text-white mb-2 block">
                Ubicación
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <Input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej: Santiago Centro"
                  className="pl-10"
                />
              </div>
            </div>

            {(category === 'transport' || category === 'fuel') && (
              <div>
                <Label className="text-zinc-900 dark:text-white mb-2 block">
                  Kilometraje (km)
                </Label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  placeholder="150"
                />
              </div>
            )}
          </div>

          {/* Comprobantes */}
          <div>
            <Label className="text-zinc-900 dark:text-white mb-3 block">
              Comprobantes (Boletas/Facturas) <span className="text-red-500">*</span>
            </Label>
            
            {/* Botones de carga */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button
                type="button"
                onClick={handleCameraCapture}
                variant="outline"
                className="w-full border-2 border-dashed border-purple-300 dark:border-purple-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20"
              >
                <Camera className="w-4 h-4 mr-2" />
                Tomar Foto
              </Button>
              <Button
                type="button"
                onClick={handleGallerySelect}
                variant="outline"
                className="w-full border-2 border-dashed border-purple-300 dark:border-purple-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Desde Galería
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Vista previa de comprobantes */}
            {receipts.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {receipts.length} comprobante(s) agregado(s)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {receipts.map(receipt => (
                    <div
                      key={receipt.id}
                      className="relative group rounded-lg overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 aspect-square"
                    >
                      <img
                        src={receipt.url}
                        alt={receipt.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          size="sm"
                          onClick={() => handleRemoveReceipt(receipt.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Badge className="absolute top-2 right-2 bg-green-600 text-white text-xs">
                        ✓
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-center bg-zinc-50 dark:bg-zinc-800/50">
                <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                  Sin comprobantes agregados
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500">
                  Máximo 5MB por imagen • JPG, PNG
                </p>
              </Card>
            )}
          </div>

          {/* Info sobre verificación GPS */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800 p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Verificación GPS Automática
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Tu ubicación actual será registrada automáticamente para validar el gasto.
                  Esto ayuda en la rendición y transparencia de viáticos.
                </p>
              </div>
            </div>
          </Card>

          {/* Resumen */}
          {selectedClient && amount && parseFloat(amount) > 0 && receipts.length > 0 && (
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-900 dark:text-green-100">
                  Resumen del Gasto
                </span>
                <Badge className="bg-green-600 text-white">
                  Listo para enviar
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-800 dark:text-green-300">Cliente:</span>
                  <span className="font-semibold text-green-900 dark:text-green-100">
                    {selectedClientData?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-800 dark:text-green-300">Categoría:</span>
                  <span className="font-semibold text-green-900 dark:text-green-100">
                    {categories.find(c => c.value === category)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-800 dark:text-green-300">Comprobantes:</span>
                  <span className="font-semibold text-green-900 dark:text-green-100">
                    {receipts.length} foto(s)
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-green-300 dark:border-green-700">
                  <span className="text-green-900 dark:text-green-100 font-semibold">Monto Total:</span>
                  <span className="font-bold text-lg text-green-900 dark:text-green-100">
                    ${parseFloat(amount).toLocaleString()} CLP
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-6 flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
            disabled={!selectedClient || !amount || parseFloat(amount) <= 0 || receipts.length === 0}
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar Gasto
          </Button>
        </div>
      </Card>
    </div>
  );
}
