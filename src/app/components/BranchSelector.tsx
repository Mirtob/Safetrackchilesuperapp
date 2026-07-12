import { useState } from 'react';
import { Building2, MapPin, Users, Search, X, ArrowRight, Plus, Save, Phone, Loader2 } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { toast } from 'sonner';
import { Branch } from '@/app/context/CompanyContext';

interface BranchSelectorProps {
  companyName: string;
  branches: Branch[];
  onSelectBranch: (branchId: string, branchName: string) => void;
  onBack: () => void;
  onCreateBranch?: (branch: Omit<Branch, 'id'>) => Promise<Branch>;
  currentLocation?: {
    lat: number;
    lng: number;
  };
}

export function BranchSelector({ companyName, branches, onSelectBranch, onBack, onCreateBranch, currentLocation }: BranchSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', address: '', phone: '', contactPerson: '' });

  const calculateDistance = (branchCoords?: { latitude: number; longitude: number }) => {
    if (!currentLocation || !branchCoords) return null;

    const R = 6371;
    const dLat = (branchCoords.latitude - currentLocation.lat) * Math.PI / 180;
    const dLng = (branchCoords.longitude - currentLocation.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(currentLocation.lat * Math.PI / 180) * Math.cos(branchCoords.latitude * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const filteredBranches = branches
    .filter(branch =>
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const distA = calculateDistance(a.coordinates);
      const distB = calculateDistance(b.coordinates);
      if (distA !== null && distB !== null) {
        return distA - distB;
      }
      return a.name.localeCompare(b.name);
    });

  const handleCreateBranch = async () => {
    if (!formData.name.trim()) {
      toast.error('Nombre requerido', { description: 'Ingresa el nombre de la sucursal' });
      return;
    }
    if (!onCreateBranch) return;

    setIsSaving(true);
    try {
      const newBranch = await onCreateBranch({
        name: formData.name,
        address: formData.address,
        coordinates: { latitude: -33.4489, longitude: -70.6693 },
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        workerCount: 0,
      });
      toast.success('✅ Sucursal creada', { description: `${newBranch.name} fue agregada` });
      setFormData({ name: '', address: '', phone: '', contactPerson: '' });
      setShowCreateForm(false);
    } catch (err: any) {
      toast.error('Error al crear la sucursal', { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-zinc-900 dark:via-blue-950/20 dark:to-zinc-900 pb-20 lg:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600 dark:text-zinc-400" />
              </button>
              <div>
                <h1 className="text-lg lg:text-xl font-semibold text-slate-900 dark:text-white">
                  Seleccionar Instalación
                </h1>
                <p className="text-sm text-slate-600 dark:text-zinc-400">
                  {companyName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onCreateBranch && (
                <Button
                  onClick={() => setShowCreateForm(v => !v)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Nueva Sucursal
                </Button>
              )}
              <Badge variant="outline" className="hidden sm:flex gap-1.5 bg-white dark:bg-zinc-800">
                <Building2 className="w-3.5 h-3.5" />
                {filteredBranches.length} instalaciones
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {showCreateForm && (
          <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Nueva Sucursal</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="lg:col-span-2">
                <Label className="text-slate-900 dark:text-white mb-2 block">Nombre *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Planta Principal"
                  autoFocus
                />
              </div>
              <div className="lg:col-span-2">
                <Label className="text-slate-900 dark:text-white mb-2 block">Dirección</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Av. Principal 1234, Comuna, Ciudad"
                />
              </div>
              <div>
                <Label className="text-slate-900 dark:text-white mb-2 block">Teléfono</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+56 2 2234 5678"
                />
              </div>
              <div>
                <Label className="text-slate-900 dark:text-white mb-2 block">Contacto</Label>
                <Input
                  value={formData.contactPerson}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                  placeholder="Nombre del encargado"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-6 mt-2 border-t border-slate-200 dark:border-zinc-700">
              <Button onClick={handleCreateBranch} disabled={isSaving} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Crear Sucursal
              </Button>
              <Button onClick={() => setShowCreateForm(false)} disabled={isSaving} variant="outline" className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </Card>
        )}

        {/* Search */}
        <Card className="p-4 bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar por nombre o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#0055A4] dark:focus:ring-blue-500"
            />
          </div>
        </Card>

        {/* Branch Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBranches.map((branch) => {
            const distance = calculateDistance(branch.coordinates);

            return (
              <Card
                key={branch.id}
                className="group relative overflow-hidden bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-[#0055A4] dark:hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => onSelectBranch(branch.id, branch.name)}
              >
                <div className="p-4 border-b border-slate-100 dark:border-zinc-700">
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-[#0055A4] dark:group-hover:text-blue-400 transition-colors">
                    {branch.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-600 dark:text-zinc-400">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{branch.address || 'Sin dirección'}</span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                      <Users className="w-4 h-4" />
                      <span>Trabajadores</span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {branch.workerCount}
                    </span>
                  </div>

                  {branch.phone && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                        <Phone className="w-4 h-4" />
                        <span>Teléfono</span>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {branch.phone}
                      </span>
                    </div>
                  )}

                  {distance !== null && (
                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-700">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-500">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>A {distance} km de tu ubicación</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 border-t border-slate-100 dark:border-zinc-700">
                  <Button
                    className="w-full bg-[#0055A4] hover:bg-[#004494] text-white"
                    size="sm"
                  >
                    Seleccionar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#0055A4]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredBranches.length === 0 && (
          <Card className="p-12 text-center bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
            <Building2 className="w-12 h-12 mx-auto text-slate-300 dark:text-zinc-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {branches.length === 0 ? 'Esta empresa aún no tiene sucursales' : 'No se encontraron instalaciones'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-zinc-400">
              {branches.length === 0 ? 'Crea la primera con "Nueva Sucursal"' : 'Intenta ajustar la búsqueda'}
            </p>
          </Card>
        )}
      </div>

      {currentLocation && (
        <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 lg:left-auto lg:right-6 lg:w-auto">
          <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-2 shadow-lg flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-slate-600 dark:text-zinc-400">
              Ordenado por distancia
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
