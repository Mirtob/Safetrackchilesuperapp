import { useState, useEffect } from 'react';
import { X, Clock, Calendar, MapPin, DollarSign, FileText, Save } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { toast } from 'sonner';

interface ClientCompany {
  id: string;
  name: string;
  hourlyRate: number;
  monthlyFee?: number;
  brandColor: string;
}

interface AddHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientCompany[];
  onSave: (data: any) => void;
  editingEntry?: {
    id: string;
    clientId: string;
    date: string;
    startTime: string;
    endTime?: string;
    duration: number;
    hourlyRate?: number;
    activity: string;
    location: string;
    amount: number;
  } | null;
}

export function AddHoursModal({ isOpen, onClose, clients, onSave, editingEntry = null }: AddHoursModalProps) {
  const [selectedClient, setSelectedClient] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [hours, setHours] = useState('');
  const [customRate, setCustomRate] = useState('');
  const [activity, setActivity] = useState('');
  const [location, setLocation] = useState('');
  const [useCustomRate, setUseCustomRate] = useState(false);

  // Cargar datos si estamos editando
  useEffect(() => {
    if (editingEntry) {
      setSelectedClient(editingEntry.clientId);
      setDate(editingEntry.date);
      setStartTime(editingEntry.startTime || '');
      setEndTime(editingEntry.endTime || '');
      setHours(editingEntry.duration.toString());
      setActivity(editingEntry.activity);
      setLocation(editingEntry.location || '');
      
      // Si tiene tarifa custom, activar el checkbox
      const clientData = clients.find(c => c.id === editingEntry.clientId);
      if (clientData && editingEntry.hourlyRate && editingEntry.hourlyRate !== clientData.hourlyRate) {
        setUseCustomRate(true);
        setCustomRate(editingEntry.hourlyRate.toString());
      }
    } else {
      // Resetear al cerrar/abrir
      setSelectedClient('');
      setDate(new Date().toISOString().split('T')[0]);
      setStartTime('');
      setEndTime('');
      setHours('');
      setCustomRate('');
      setActivity('');
      setLocation('');
      setUseCustomRate(false);
    }
  }, [editingEntry, isOpen, clients]);

  if (!isOpen) return null;

  const selectedClientData = clients.find(c => c.id === selectedClient);
  
  const calculateHours = () => {
    if (!startTime || !endTime) return 0;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const diffMinutes = endMinutes - startMinutes;
    return Math.round((diffMinutes / 60) * 100) / 100;
  };

  const calculatedHours = hours ? parseFloat(hours) : calculateHours();
  
  const getEffectiveRate = () => {
    if (useCustomRate && customRate) return parseFloat(customRate);
    return selectedClientData?.hourlyRate || 0;
  };

  const calculateAmount = () => {
    const rate = getEffectiveRate();
    return calculatedHours * rate;
  };

  const handleSave = () => {
    if (!selectedClient || !date || calculatedHours <= 0) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    const client = clients.find(c => c.id === selectedClient);
    if (!client) return;

    const rate = getEffectiveRate();
    const totalAmount = calculateAmount();

    onSave({
      clientId: selectedClient,
      clientName: client.name,
      date,
      startTime,
      endTime,
      duration: parseFloat(hours),
      location,
      activity,
      amount: totalAmount,
      hourlyRate: rate,
      status: 'completed' as const,
      gpsVerified: false
    });
    
    // Resetear formulario
    setSelectedClient('');
    setDate(new Date().toISOString().split('T')[0]);
    setStartTime('');
    setEndTime('');
    setHours('');
    setCustomRate('');
    setActivity('');
    setLocation('');
    setUseCustomRate(false);
    
    onClose();
  };

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartTime(value);
    } else {
      setEndTime(value);
    }
    // Auto-calcular horas si no está manual
    if (!hours && startTime && endTime) {
      const calc = calculateHours();
      if (calc > 0) {
        setHours(calc.toString());
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#FF8C00] to-[#FF8C00]/80 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                {editingEntry ? 'Editar Registro de Horas' : 'Registrar Horas Trabajadas'}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {editingEntry ? 'Modifica las horas y tarifas' : 'Ingresa el detalle de las horas trabajadas'}
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
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent"
            >
              <option value="">Selecciona un cliente</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.hourlyRate > 0 ? `$${client.hourlyRate.toLocaleString()}/h` : 'Honorarios fijos'}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha */}
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

          {/* Horario */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-900 dark:text-white mb-2 block">
                Hora Inicio
              </Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => handleTimeChange('start', e.target.value)}
              />
            </div>
            <div>
              <Label className="text-zinc-900 dark:text-white mb-2 block">
                Hora Término
              </Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => handleTimeChange('end', e.target.value)}
              />
            </div>
          </div>

          {/* Horas totales */}
          <div>
            <Label className="text-zinc-900 dark:text-white mb-2 block">
              Horas Totales <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <Input
                type="number"
                step="0.25"
                min="0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder={calculatedHours > 0 ? `Auto: ${calculatedHours}h` : "Ej: 4.5"}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Se calcula automáticamente desde el horario, o ingrésalo manualmente
            </p>
          </div>

          {/* Tarifa personalizada */}
          {selectedClientData && selectedClientData.hourlyRate > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="useCustomRate"
                  checked={useCustomRate}
                  onChange={(e) => setUseCustomRate(e.target.checked)}
                  className="w-4 h-4 text-[#FF8C00] rounded focus:ring-[#FF8C00]"
                />
                <Label htmlFor="useCustomRate" className="text-zinc-900 dark:text-white cursor-pointer">
                  Usar tarifa personalizada
                </Label>
              </div>
              {useCustomRate && (
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <Input
                    type="number"
                    step="1000"
                    min="0"
                    value={customRate}
                    onChange={(e) => setCustomRate(e.target.value)}
                    placeholder={`Tarifa estándar: $${selectedClientData.hourlyRate.toLocaleString()}`}
                    className="pl-10"
                  />
                </div>
              )}
              {!useCustomRate && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Tarifa estándar: <span className="font-semibold">${selectedClientData.hourlyRate.toLocaleString()}/hora</span>
                </p>
              )}
            </div>
          )}

          {/* Actividad */}
          <div>
            <Label className="text-zinc-900 dark:text-white mb-2 block">
              Descripción de la Actividad <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
              <Textarea
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="Ej: Inspección de seguridad en obra, Capacitación EPP..."
                className="pl-10 min-h-[80px]"
              />
            </div>
          </div>

          {/* Ubicación */}
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
                placeholder="Ej: Obra Las Condes, Planta Puerto Montt..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Resumen del cálculo */}
          {selectedClient && calculatedHours > 0 && (
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-900 dark:text-green-100">
                  Resumen del Registro
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-800 dark:text-green-300">Horas:</span>
                  <span className="font-semibold text-green-900 dark:text-green-100">
                    {calculatedHours}h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-800 dark:text-green-300">Tarifa:</span>
                  <span className="font-semibold text-green-900 dark:text-green-100">
                    ${getEffectiveRate().toLocaleString()}/h
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-green-300 dark:border-green-700">
                  <span className="text-green-900 dark:text-green-100 font-semibold">Monto Total:</span>
                  <span className="font-bold text-lg text-green-900 dark:text-green-100">
                    ${Math.round(calculateAmount()).toLocaleString()} CLP
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
            className="flex-1 bg-gradient-to-r from-[#FF8C00] to-[#FF8C00]/80 hover:from-[#FF8C00]/90 hover:to-[#FF8C00]/70 text-white"
            disabled={!selectedClient || !date || calculatedHours <= 0}
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar Registro
          </Button>
        </div>
      </Card>
    </div>
  );
}