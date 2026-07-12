import { useState } from 'react';
import {
  Building2,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Plus,
  X,
  Save,
  IdCard,
  MapPin,
  Phone,
  Mail,
  Users,
  Shield,
  Briefcase,
  LogOut,
  Loader2
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { toast } from 'sonner';
import { Company } from '@/app/context/CompanyContext';

interface CompanySelectorEnhancedProps {
  companies: Company[];
  isLoading?: boolean;
  onSelectCompany: (companyId: string) => void;
  onCreateCompany: (company: Omit<Company, 'id' | 'branches'>) => Promise<Company>;
  onOpenProfessionalPortfolio?: () => void;
  onLogout?: () => void;
}

export function CompanySelectorEnhanced({
  companies,
  isLoading,
  onSelectCompany,
  onCreateCompany,
  onOpenProfessionalPortfolio,
  onLogout
}: CompanySelectorEnhancedProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rut: '',
    address: '',
    phone: '',
    email: '',
    legalRepresentative: '',
    mutual: 'ACHS'
  });

  const getStatusColor = (level: Company['riskLevel']) => {
    switch (level) {
      case 'Bajo':
        return 'bg-green-500';
      case 'Medio':
        return 'bg-yellow-500';
      case 'Alto':
        return 'bg-red-500';
    }
  };

  const getStatusIcon = (level: Company['riskLevel']) => {
    return level === 'Bajo' ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <AlertCircle className="w-5 h-5 text-red-500" />
    );
  };

  const handleCreateCompany = async () => {
    if (!formData.name.trim()) {
      toast.error('Nombre requerido', { description: 'Ingresa el nombre de la empresa' });
      return;
    }
    if (!formData.rut.trim()) {
      toast.error('RUT requerido', { description: 'Ingresa el RUT de la empresa' });
      return;
    }
    if (!formData.address.trim()) {
      toast.error('Dirección requerida', { description: 'Ingresa la dirección de la empresa' });
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Teléfono requerido', { description: 'Ingresa un número de contacto' });
      return;
    }

    setIsSaving(true);
    try {
      const newCompany = await onCreateCompany({
        name: formData.name,
        rut: formData.rut,
        address: formData.address,
        industry: 'General',
        riskLevel: 'Medio',
        workerCount: 0,
        contractStart: new Date().toISOString().split('T')[0],
        contactPerson: formData.legalRepresentative,
        phone: formData.phone,
        email: formData.email,
        mutual: formData.mutual,
      });

      toast.success('✅ Empresa creada exitosamente', {
        description: `${newCompany.name} ha sido agregada al sistema`,
        duration: 4000
      });

      setFormData({
        name: '', rut: '', address: '', phone: '', email: '', legalRepresentative: '', mutual: 'ACHS'
      });
      setShowCreateForm(false);
    } catch (err: any) {
      toast.error('Error al crear la empresa', { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      rut: '',
      address: '',
      phone: '',
      email: '',
      legalRepresentative: '',
      mutual: 'ACHS'
    });
    setShowCreateForm(false);
  };

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 border-b border-blue-600 dark:border-blue-700">
          <div className="max-w-3xl mx-auto px-4 pt-16 pb-6">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
                <span>Cancelar</span>
              </button>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-white text-xl lg:text-2xl mb-1 font-bold">
                  Nueva Empresa
                </h1>
                <p className="text-white/80 text-sm">
                  Ingresa los datos de la nueva empresa cliente
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="max-w-3xl mx-auto p-4 lg:p-6">
          <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <div className="space-y-6">
              {/* Información Básica */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Información Básica
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="lg:col-span-2">
                    <Label className="text-slate-900 dark:text-white mb-2 block">
                      <Building2 className="w-4 h-4 inline mr-1" />
                      Razón Social *
                    </Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Empresa S.A."
                      autoFocus
                    />
                  </div>

                  <div>
                    <Label className="text-slate-900 dark:text-white mb-2 block">
                      <IdCard className="w-4 h-4 inline mr-1" />
                      RUT *
                    </Label>
                    <Input
                      value={formData.rut}
                      onChange={(e) => setFormData(prev => ({ ...prev, rut: e.target.value }))}
                      placeholder="76.123.456-7"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-900 dark:text-white mb-2 block">
                      <Shield className="w-4 h-4 inline mr-1" />
                      Mutualidad *
                    </Label>
                    <select
                      value={formData.mutual}
                      onChange={(e) => setFormData(prev => ({ ...prev, mutual: e.target.value }))}
                      className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                    >
                      <option value="ACHS">ACHS</option>
                      <option value="Mutual de Seguridad">Mutual de Seguridad</option>
                      <option value="IST">IST</option>
                      <option value="MUSEG">MUSEG</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Datos de Contacto */}
              <div className="border-t border-slate-200 dark:border-zinc-700 pt-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Datos de Contacto
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="lg:col-span-2">
                    <Label className="text-slate-900 dark:text-white mb-2 block">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Dirección *
                    </Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Av. Principal 1234, Comuna, Ciudad"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-900 dark:text-white mb-2 block">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Teléfono *
                    </Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+56 2 2234 5678"
                      type="tel"
                    />
                  </div>

                  <div>
                    <Label className="text-slate-900 dark:text-white mb-2 block">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email
                    </Label>
                    <Input
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="contacto@empresa.cl"
                      type="email"
                    />
                  </div>
                </div>
              </div>

              {/* Representante Legal */}
              <div className="border-t border-slate-200 dark:border-zinc-700 pt-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Representante Legal
                </h3>
                <div>
                  <Label className="text-slate-900 dark:text-white mb-2 block">
                    <Users className="w-4 h-4 inline mr-1" />
                    Nombre Completo
                  </Label>
                  <Input
                    value={formData.legalRepresentative}
                    onChange={(e) => setFormData(prev => ({ ...prev, legalRepresentative: e.target.value }))}
                    placeholder="Juan Pérez González"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-zinc-700">
                <Button
                  onClick={handleCreateCompany}
                  disabled={isSaving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Crear Empresa
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={isSaving}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-4 pb-20 transition-colors">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-slate-900 dark:text-white text-2xl font-bold">
              Mis Empresas
            </h1>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowCreateForm(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                Nueva Empresa
              </Button>
              {onLogout && (
                <Button
                  onClick={onLogout}
                  size="sm"
                  variant="outline"
                  className="border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          <p className="text-slate-600 dark:text-zinc-400">Selecciona una empresa para gestionar</p>
        </div>

        {/* Info Card */}
        <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 mb-6">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900 dark:text-blue-200 mb-1">
                <strong>¿Tienes un nuevo cliente?</strong>
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Click en "Nueva Empresa" para agregar una nueva empresa al sistema. Podrás gestionar múltiples empresas desde una sola cuenta.
              </p>
            </div>
          </div>
        </Card>

        {/* Professional Portfolio Card - Destacado */}
        {onOpenProfessionalPortfolio && (
          <Card
            onClick={onOpenProfessionalPortfolio}
            className="bg-gradient-to-br from-[#FF8C00] to-[#FF8C00]/80 border-[#FF8C00] p-6 mb-6 cursor-pointer hover:shadow-xl transition-all active:scale-98"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">
                    💼 Mi Cartera Profesional
                  </h3>
                  <p className="text-sm text-white/90 mb-3">
                    Vista consolidada de todos tus clientes, facturación, horas trabajadas y gastos
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                      <p className="text-xs text-white/70">Clientes</p>
                      <p className="text-lg font-bold text-white">{companies.length}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                      <p className="text-xs text-white/70">Facturación</p>
                      <p className="text-xs font-semibold text-white">Gestión</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                      <p className="text-xs text-white/70">Horas</p>
                      <p className="text-xs font-semibold text-white">Control</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                      <p className="text-xs text-white/70">Gastos</p>
                      <p className="text-xs font-semibold text-white">Rendición</p>
                    </div>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-white flex-shrink-0 ml-2" />
            </div>
          </Card>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-slate-200 dark:bg-zinc-700" />
          <span className="text-sm text-slate-500 dark:text-zinc-500 font-medium">
            Selecciona una empresa
          </span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-zinc-700" />
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        )}

        {!isLoading && companies.length === 0 && (
          <Card className="p-8 text-center bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
            <Building2 className="w-10 h-10 mx-auto text-slate-300 dark:text-zinc-600 mb-3" />
            <p className="text-slate-600 dark:text-zinc-400 text-sm">
              Aún no tienes empresas registradas. Crea la primera con "Nueva Empresa".
            </p>
          </Card>
        )}

        {/* Company Cards */}
        <div className="space-y-3">
          {companies.map((company) => (
            <Card
              key={company.id}
              className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-[#FF8C00] dark:hover:border-[#FF8C00] transition-all cursor-pointer active:scale-98"
              onClick={() => onSelectCompany(company.id)}
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-5 h-5 text-[#0055A4]" />
                      <h3 className="text-slate-900 dark:text-white font-semibold">
                        {company.name}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-zinc-400">
                      RUT: {company.rut}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 mb-1">Sucursales</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {company.branches?.length ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 mb-1">Trabajadores</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {company.workerCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 mb-1">Rubro</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {company.industry}
                    </p>
                  </div>
                </div>

                {/* Risk level */}
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600 dark:text-zinc-400">
                        Nivel de Riesgo
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {company.riskLevel}
                      </Badge>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getStatusColor(company.riskLevel)} transition-all`}
                        style={{ width: company.riskLevel === 'Alto' ? '85%' : company.riskLevel === 'Medio' ? '55%' : '25%' }}
                      />
                    </div>
                  </div>
                  {getStatusIcon(company.riskLevel)}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-zinc-500">
            SafeTrack Chile © 2026 • Sistema de Gestión de Prevención de Riesgos
          </p>
        </div>
      </div>
    </div>
  );
}
