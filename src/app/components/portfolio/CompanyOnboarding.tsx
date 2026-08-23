import { useState } from 'react';
import { ArrowLeft, Building2, Plus, Trash2, MapPin, Save, Calendar, Settings, HardDrive, Navigation, Send, Clock, X } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';
import { GoogleDriveService } from '@/app/services/googleDrive';
import { LocationPicker } from '@/app/components/LocationPicker';
import { useFinanceSettings } from '@/app/hooks/useFinanceSettings';

const isMapsConfigured = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

interface Sector {
  id: string;
  name: string;
  description: string;
  riskLevel: 'bajo' | 'medio' | 'alto' | 'critico';
  location?: string;
}

export interface CompanyData {
  name: string;
  rut: string;
  address: string;
  coordinates?: { latitude: number; longitude: number };
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  industry: string;
  workerCount: number;
  contractStartDate: string;
  contractType: 'consultoria' | 'asesoria' | 'completo';
  sectors: Sector[];

  // ── Envío de documentos ───────────────────────────────────────────────────
  // Se piden al crear la empresa para que la pantalla de Envío de Documentos
  // tenga destinatarios desde el primer día, sin volver a preguntar.
  /** Número con código país para el envío por WhatsApp. */
  whatsapp: string;
  /** Correos que reciben copia: RRHH, prevención, gerencia. */
  hrEmails: string[];

  // ── Faena y cobro ─────────────────────────────────────────────────────────
  /** Valor hora hombre. Base de todo cálculo de honorarios de esta empresa. */
  hourlyRate: number;
  /** Cada cuánto se cierra el resumen que va a la boleta. */
  billingCycle: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  /** Día de pago acordado, dentro del mes. */
  paymentDay: number;
  /** Radio en metros para dar por iniciada la faena al llegar. */
  geofenceRadius: number;
  /** Minutos mínimos para que una visita se considere facturable. */
  minBillableMinutes: number;
  notifyOnArrival: boolean;
  notifyOnDeparture: boolean;
}

interface CompanyOnboardingProps {
  onBack: () => void;
  onComplete: (companyData: CompanyData) => void;
}

export function CompanyOnboarding({ onBack, onComplete }: CompanyOnboardingProps) {
  const { settings: financeSettings } = useFinanceSettings();

  const [step, setStep] = useState<'basic' | 'sectors' | 'summary'>('basic');
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: '',
    rut: '',
    address: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    industry: '',
    workerCount: 0,
    contractStartDate: '',
    contractType: 'asesoria',
    sectors: [],

    whatsapp: '',
    hrEmails: [],

    // Arranca con los valores por defecto del profesional; se ajustan por empresa.
    hourlyRate: financeSettings.defaultHourlyRate,
    billingCycle: 'monthly',
    paymentDay: financeSettings.defaultPaymentDay,
    geofenceRadius: 150,
    minBillableMinutes: 15,
    notifyOnArrival: true,
    notifyOnDeparture: true,
  });

  const [newHrEmail, setNewHrEmail] = useState('');

  const addHrEmail = () => {
    const email = newHrEmail.trim().toLowerCase();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Correo no válido');
      return;
    }
    if (companyData.hrEmails.includes(email)) {
      toast.error('Ese correo ya está en la lista');
      return;
    }
    setCompanyData(prev => ({ ...prev, hrEmails: [...prev.hrEmails, email] }));
    setNewHrEmail('');
  };

  const removeHrEmail = (email: string) =>
    setCompanyData(prev => ({ ...prev, hrEmails: prev.hrEmails.filter(e => e !== email) }));

  const [isDriveLoading, setIsDriveLoading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const handleLocationSelect = (location: { lat: number; lng: number; address?: string }) => {
    setCompanyData(prev => ({
      ...prev,
      coordinates: { latitude: location.lat, longitude: location.lng },
      address: location.address || prev.address,
    }));
    setShowLocationPicker(false);
  };

  const [newSector, setNewSector] = useState<Omit<Sector, 'id'>>({
    name: '',
    description: '',
    riskLevel: 'medio',
    location: ''
  });

  const addSector = () => {
    if (!newSector.name.trim()) {
      toast.error('El nombre del sector es obligatorio');
      return;
    }

    const sector: Sector = {
      id: `SECTOR-${Date.now()}`,
      ...newSector
    };

    setCompanyData(prev => ({
      ...prev,
      sectors: [...prev.sectors, sector]
    }));

    setNewSector({
      name: '',
      description: '',
      riskLevel: 'medio',
      location: ''
    });

    toast.success(`Sector "${sector.name}" agregado`);
  };

  const removeSector = (sectorId: string) => {
    setCompanyData(prev => ({
      ...prev,
      sectors: prev.sectors.filter(s => s.id !== sectorId)
    }));
    toast.success('Sector eliminado');
  };

  const handleBasicSubmit = () => {
    if (!companyData.name || !companyData.rut || !companyData.contactName) {
      toast.error('Completa los campos obligatorios');
      return;
    }
    setStep('sectors');
  };

  const handleComplete = async () => {
    if (companyData.sectors.length === 0) {
      toast.error('Debes agregar al menos un sector');
      return;
    }

    if (GoogleDriveService.isAuthorized()) {
      setIsDriveLoading(true);
      try {
        const rootId = await GoogleDriveService.ensureSafeTrackFolder();
        await GoogleDriveService.ensureCompanyStructure(companyData.name, rootId);
        toast.success('Carpetas creadas en Google Drive');
      } catch {
        toast.error('No se pudieron crear las carpetas en Drive', {
          description: 'La empresa se guardará de todas formas.',
        });
      } finally {
        setIsDriveLoading(false);
      }
    }

    onComplete(companyData);
  };

  const getRiskColor = (level: Sector['riskLevel']) => {
    switch (level) {
      case 'bajo':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'medio':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'alto':
        return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
      case 'critico':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 pb-24">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-[#0055A4] p-3 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                Nueva Empresa Cliente
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                {step === 'basic' && 'Paso 1: Datos básicos de la empresa'}
                {step === 'sectors' && 'Paso 2: Configurar sectores y áreas'}
                {step === 'summary' && 'Paso 3: Resumen y confirmación'}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'basic' ? 'bg-[#0055A4] text-white' : 'bg-green-500 text-white'
            }`}>
              {step === 'basic' ? '1' : '✓'}
            </div>
            <span className={step === 'basic' ? 'font-semibold text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}>
              Datos Básicos
            </span>
          </div>
          <div className="flex-1 h-1 mx-4 bg-zinc-200 dark:bg-zinc-700">
            <div className={`h-full bg-[#0055A4] transition-all ${
              step === 'sectors' || step === 'summary' ? 'w-full' : 'w-0'
            }`} />
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'sectors' ? 'bg-[#0055A4] text-white' : 
              step === 'summary' ? 'bg-green-500 text-white' :
              'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
            }`}>
              {step === 'summary' ? '✓' : '2'}
            </div>
            <span className={step === 'sectors' ? 'font-semibold text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}>
              Sectores
            </span>
          </div>
          <div className="flex-1 h-1 mx-4 bg-zinc-200 dark:bg-zinc-700">
            <div className={`h-full bg-[#0055A4] transition-all ${
              step === 'summary' ? 'w-full' : 'w-0'
            }`} />
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'summary' ? 'bg-[#0055A4] text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400'
            }`}>
              3
            </div>
            <span className={step === 'summary' ? 'font-semibold text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}>
              Resumen
            </span>
          </div>
        </div>

        {/* Step 1: Basic Data */}
        {step === 'basic' && (
          <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6">
              Información de la Empresa
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Razón Social *</Label>
                <Input
                  id="name"
                  value={companyData.name}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Constructora ABC Ltda."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="rut">RUT *</Label>
                <Input
                  id="rut"
                  value={companyData.rut}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, rut: e.target.value }))}
                  placeholder="76.123.456-7"
                  className="mt-1"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="address">Dirección</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="address"
                    value={companyData.address}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Av. Principal 1234, Comuna, Región"
                    className="flex-1"
                  />
                  {isMapsConfigured && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowLocationPicker(v => !v)}
                      className="shrink-0 border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      {showLocationPicker ? 'Cerrar' : companyData.coordinates ? 'Ver mapa' : 'Ubicar'}
                    </Button>
                  )}
                </div>
                {companyData.coordinates && !showLocationPicker && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    {companyData.coordinates.latitude.toFixed(5)}, {companyData.coordinates.longitude.toFixed(5)}
                  </p>
                )}
              </div>

              {showLocationPicker && (
                <div className="md:col-span-2">
                  <LocationPicker
                    onLocationSelect={handleLocationSelect}
                    onClose={() => setShowLocationPicker(false)}
                    initialLocation={
                      companyData.coordinates
                        ? { lat: companyData.coordinates.latitude, lng: companyData.coordinates.longitude }
                        : undefined
                    }
                  />
                </div>
              )}

              <div>
                <Label htmlFor="industry">Rubro/Industria</Label>
                <Input
                  id="industry"
                  value={companyData.industry}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, industry: e.target.value }))}
                  placeholder="Ej: Construcción, Minería, Manufactura"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="workerCount">Cantidad de Trabajadores</Label>
                <Input
                  id="workerCount"
                  type="number"
                  value={companyData.workerCount || ''}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, workerCount: parseInt(e.target.value) || 0 }))}
                  placeholder="Ej: 50"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contactName">Nombre Contacto *</Label>
                <Input
                  id="contactName"
                  value={companyData.contactName}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, contactName: e.target.value }))}
                  placeholder="Ej: Juan Pérez"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contactPhone">Teléfono Contacto</Label>
                <Input
                  id="contactPhone"
                  value={companyData.contactPhone}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="+56 9 1234 5678"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contactEmail">Email Contacto</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={companyData.contactEmail}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="contacto@empresa.cl"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="contractType">Tipo de Contrato</Label>
                <select
                  id="contractType"
                  value={companyData.contractType}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, contractType: e.target.value as any }))}
                  className="mt-1 w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                >
                  <option value="consultoria">Consultoría</option>
                  <option value="asesoria">Asesoría</option>
                  <option value="completo">Servicio Completo</option>
                </select>
              </div>

              <div>
                <Label htmlFor="contractStartDate">Fecha Inicio Contrato</Label>
                <Input
                  id="contractStartDate"
                  type="date"
                  value={companyData.contractStartDate}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, contractStartDate: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            {/* ── Destinatarios de documentos ──────────────────────────────
                Se piden acá para que el envío de charlas, EPP e informes
                funcione desde el primer día, sin tener que configurarlo
                aparte cada vez. */}
            <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-700">
              <div className="mb-4 flex items-start gap-3">
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                  <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white">Envío de documentos</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    A dónde llegan las charlas firmadas, entregas de EPP e informes de esta empresa.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="whatsapp">WhatsApp de la empresa</Label>
                  <Input
                    id="whatsapp"
                    value={companyData.whatsapp}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="+56 9 1234 5678"
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Con código de país. Si lo dejas vacío se usa el teléfono de contacto.
                  </p>
                </div>

                <div>
                  <Label htmlFor="hrEmail">Correos que reciben copia</Label>
                  <div className="mt-1 flex gap-2">
                    <Input
                      id="hrEmail"
                      type="email"
                      value={newHrEmail}
                      onChange={(e) => setNewHrEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addHrEmail();
                        }
                      }}
                      placeholder="rrhh@empresa.cl"
                    />
                    <Button type="button" variant="outline" onClick={addHrEmail}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {companyData.hrEmails.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {companyData.hrEmails.map(email => (
                        <Badge key={email} variant="secondary" className="gap-1 pr-1">
                          {email}
                          <button
                            type="button"
                            onClick={() => removeHrEmail(email)}
                            aria-label={`Quitar ${email}`}
                            className="rounded-full p-0.5 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Faena y honorarios ───────────────────────────────────────
                El valor HH define todo el cobro de esta empresa: las horas que
                el GPS registre se multiplican por él. */}
            <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-700">
              <div className="mb-4 flex items-start gap-3">
                <div className="rounded-lg bg-[#FF8C00]/10 p-2">
                  <Clock className="h-5 w-5 text-[#FF8C00]" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white">Faena y honorarios</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    La app cronometra tu tiempo en planta por GPS y lo valoriza con este valor hora.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="hourlyRate">Valor hora hombre (HH) *</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    min="0"
                    value={companyData.hourlyRate || ''}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, hourlyRate: Number(e.target.value) || 0 }))}
                    placeholder="35000"
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Base de todo el cobro a esta empresa.
                  </p>
                </div>

                <div>
                  <Label htmlFor="billingCycle">Cada cuánto se cobra</Label>
                  <select
                    id="billingCycle"
                    value={companyData.billingCycle}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, billingCycle: e.target.value as CompanyData['billingCycle'] }))}
                    className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
                  >
                    <option value="daily">Diario</option>
                    <option value="weekly">Semanal</option>
                    <option value="biweekly">Quincenal</option>
                    <option value="monthly">Mensual</option>
                  </select>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Define cada cuánto se cierra el resumen para la boleta.
                  </p>
                </div>

                <div>
                  <Label htmlFor="paymentDay">Día de pago</Label>
                  <Input
                    id="paymentDay"
                    type="number"
                    min="1"
                    max="31"
                    value={companyData.paymentDay}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, paymentDay: Number(e.target.value) || 1 }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="minBillable">Mínimo facturable (minutos)</Label>
                  <Input
                    id="minBillable"
                    type="number"
                    min="0"
                    max="480"
                    value={companyData.minBillableMinutes}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, minBillableMinutes: Number(e.target.value) || 0 }))}
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Visitas más cortas no generan cobro.
                  </p>
                </div>

                <div>
                  <Label htmlFor="geofence">Radio de detección (metros)</Label>
                  <Input
                    id="geofence"
                    type="number"
                    min="30"
                    max="2000"
                    value={companyData.geofenceRadius}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, geofenceRadius: Number(e.target.value) || 150 }))}
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Distancia a la que se considera que llegaste. Amplíalo en faenas extensas.
                  </p>
                </div>

                <div className="flex flex-col justify-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={companyData.notifyOnArrival}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, notifyOnArrival: e.target.checked }))}
                      className="h-4 w-4 rounded border-zinc-300"
                    />
                    Avisar a la empresa cuando llego
                  </label>
                  <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={companyData.notifyOnDeparture}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, notifyOnDeparture: e.target.checked }))}
                      className="h-4 w-4 rounded border-zinc-300"
                    />
                    Avisar cuando termino la faena
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <Button
                onClick={handleBasicSubmit}
                className="bg-[#0055A4] hover:bg-[#004080] text-white"
              >
                Continuar
                <Settings className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Sectors */}
        {step === 'sectors' && (
          <>
            <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-6 mb-6">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
                Agregar Sector/Área
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sectorName">Nombre del Sector *</Label>
                  <Input
                    id="sectorName"
                    value={newSector.name}
                    onChange={(e) => setNewSector(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Área de Producción, Bodega, Oficinas"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="sectorRisk">Nivel de Riesgo</Label>
                  <select
                    id="sectorRisk"
                    value={newSector.riskLevel}
                    onChange={(e) => setNewSector(prev => ({ ...prev, riskLevel: e.target.value as any }))}
                    className="mt-1 w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  >
                    <option value="bajo">Bajo</option>
                    <option value="medio">Medio</option>
                    <option value="alto">Alto</option>
                    <option value="critico">Crítico</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="sectorLocation">Ubicación (Opcional)</Label>
                  <Input
                    id="sectorLocation"
                    value={newSector.location}
                    onChange={(e) => setNewSector(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Ej: Piso 2, Edificio A"
                    className="mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="sectorDescription">Descripción</Label>
                  <Textarea
                    id="sectorDescription"
                    value={newSector.description}
                    onChange={(e) => setNewSector(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe las actividades y características del sector"
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </div>

              <Button
                onClick={addSector}
                className="mt-4 bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Sector
              </Button>
            </Card>

            {/* Lista de sectores agregados */}
            {companyData.sectors.length > 0 && (
              <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-6 mb-6">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
                  Sectores Configurados ({companyData.sectors.length})
                </h2>
                <div className="space-y-3">
                  {companyData.sectors.map((sector) => (
                    <div
                      key={sector.id}
                      className="flex items-start justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-zinc-900 dark:text-white">
                            {sector.name}
                          </h3>
                          <Badge className={getRiskColor(sector.riskLevel)}>
                            {sector.riskLevel.charAt(0).toUpperCase() + sector.riskLevel.slice(1)}
                          </Badge>
                        </div>
                        {sector.description && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                            {sector.description}
                          </p>
                        )}
                        {sector.location && (
                          <div className="flex items-center gap-1 text-xs text-zinc-500">
                            <MapPin className="w-3 h-3" />
                            {sector.location}
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => removeSector(sector.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <div className="flex justify-between gap-3">
              <Button
                onClick={() => setStep('basic')}
                variant="outline"
                className="border-zinc-300 dark:border-zinc-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Atrás
              </Button>
              <Button
                onClick={() => setStep('summary')}
                className="bg-[#0055A4] hover:bg-[#004080] text-white"
                disabled={companyData.sectors.length === 0}
              >
                Continuar a Activos
                <Calendar className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Summary */}
        {step === 'summary' && (
          <>
            <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-6 mb-6">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
                Resumen de Configuración
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Empresa</h3>
                  <p className="text-lg text-zinc-900 dark:text-white">{companyData.name}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">RUT: {companyData.rut}</p>
                  {companyData.address && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {companyData.address}
                    </p>
                  )}
                  {companyData.coordinates && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      GPS: {companyData.coordinates.latitude.toFixed(5)}, {companyData.coordinates.longitude.toFixed(5)}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Sectores Configurados ({companyData.sectors.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {companyData.sectors.map(sector => (
                      <Badge key={sector.id} className={getRiskColor(sector.riskLevel)}>
                        {sector.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    ℹ️ <strong>Siguiente paso:</strong> Configurarás los activos a fiscalizar en cada sector
                    y establecerás la planificación anual de revisiones.
                  </p>
                </div>
              </div>
            </Card>

            <div className="flex justify-between gap-3">
              <Button
                onClick={() => setStep('sectors')}
                variant="outline"
                className="border-zinc-300 dark:border-zinc-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Atrás
              </Button>
              <Button
                onClick={handleComplete}
                disabled={isDriveLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isDriveLoading ? (
                  <>
                    <HardDrive className="w-4 h-4 mr-2 animate-pulse" />
                    Creando carpetas en Drive...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar y Configurar Activos
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
