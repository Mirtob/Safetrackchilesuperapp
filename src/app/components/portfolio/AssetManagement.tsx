import { useState } from 'react';
import { ArrowLeft, Plus, Trash2, AlertTriangle, Calendar, CheckCircle, Package, Edit, Save, X } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';
import { format, addMonths, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Sector {
  id: string;
  name: string;
  riskLevel: 'bajo' | 'medio' | 'alto' | 'critico';
}

interface Asset {
  id: string;
  sectorId: string;
  name: string;
  category: 'extintor' | 'escalera' | 'maquinaria' | 'epp' | 'instalacion' | 'vehiculo' | 'otro';
  code?: string; // Código interno del activo
  brand?: string;
  model?: string;
  serialNumber?: string;
  lastInspectionDate?: string;
  inspectionFrequency: number; // En meses
  nextInspectionDate?: string;
  status: 'al-dia' | 'proximo-vencer' | 'vencido' | 'sin-inspeccion';
  notes?: string;
  responsible?: string; // Persona responsable del activo
  location?: string; // Ubicación específica dentro del sector
}

interface AssetManagementProps {
  companyName: string;
  sectors: Sector[];
  onBack: () => void;
  onComplete: (assets: Asset[]) => void;
}

const ASSET_CATEGORIES = [
  { value: 'extintor', label: 'Extintores', icon: '🧯', defaultFrequency: 12 },
  { value: 'escalera', label: 'Escaleras', icon: '🪜', defaultFrequency: 6 },
  { value: 'maquinaria', label: 'Maquinaria', icon: '⚙️', defaultFrequency: 3 },
  { value: 'epp', label: 'EPP', icon: '🦺', defaultFrequency: 6 },
  { value: 'instalacion', label: 'Instalaciones Eléctricas', icon: '⚡', defaultFrequency: 12 },
  { value: 'vehiculo', label: 'Vehículos', icon: '🚗', defaultFrequency: 6 },
  { value: 'otro', label: 'Otro', icon: '📦', defaultFrequency: 12 }
];

export function AssetManagement({ companyName, sectors, onBack, onComplete }: AssetManagementProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>(sectors[0]?.id || '');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<string | null>(null);

  const [newAsset, setNewAsset] = useState<Omit<Asset, 'id' | 'status' | 'nextInspectionDate'>>({
    sectorId: sectors[0]?.id || '',
    name: '',
    category: 'otro',
    code: '',
    brand: '',
    model: '',
    serialNumber: '',
    lastInspectionDate: '',
    inspectionFrequency: 12,
    notes: '',
    responsible: '',
    location: ''
  });

  const calculateNextInspection = (lastDate: string, frequency: number): string => {
    return format(addMonths(parseISO(lastDate), frequency), 'yyyy-MM-dd');
  };

  const calculateStatus = (nextDate?: string): Asset['status'] => {
    if (!nextDate) return 'sin-inspeccion';
    
    const daysUntil = differenceInDays(parseISO(nextDate), new Date());
    
    if (daysUntil < 0) return 'vencido';
    if (daysUntil <= 30) return 'proximo-vencer';
    return 'al-dia';
  };

  const handleCategoryChange = (category: string) => {
    const categoryData = ASSET_CATEGORIES.find(c => c.value === category);
    setNewAsset(prev => ({
      ...prev,
      category: category as Asset['category'],
      inspectionFrequency: categoryData?.defaultFrequency || 12
    }));
  };

  const addAsset = () => {
    if (!newAsset.name.trim()) {
      toast.error('El nombre del activo es obligatorio');
      return;
    }

    const nextInspectionDate = newAsset.lastInspectionDate 
      ? calculateNextInspection(newAsset.lastInspectionDate, newAsset.inspectionFrequency)
      : undefined;

    const asset: Asset = {
      id: `ASSET-${Date.now()}`,
      ...newAsset,
      sectorId: selectedSector,
      nextInspectionDate,
      status: calculateStatus(nextInspectionDate)
    };

    setAssets(prev => [...prev, asset]);

    setNewAsset({
      sectorId: selectedSector,
      name: '',
      category: 'otro',
      code: '',
      brand: '',
      model: '',
      serialNumber: '',
      lastInspectionDate: '',
      inspectionFrequency: 12,
      notes: '',
      responsible: '',
      location: ''
    });

    setShowAddForm(false);
    toast.success(`Activo "${asset.name}" agregado`);
  };

  const updateAsset = (assetId: string, updates: Partial<Asset>) => {
    setAssets(prev => prev.map(asset => {
      if (asset.id !== assetId) return asset;

      const updated = { ...asset, ...updates };
      
      if (updates.lastInspectionDate || updates.inspectionFrequency) {
        const nextDate = updated.lastInspectionDate 
          ? calculateNextInspection(updated.lastInspectionDate, updated.inspectionFrequency)
          : undefined;
        updated.nextInspectionDate = nextDate;
        updated.status = calculateStatus(nextDate);
      }

      return updated;
    }));
    setEditingAsset(null);
    toast.success('Activo actualizado');
  };

  const removeAsset = (assetId: string) => {
    setAssets(prev => prev.filter(a => a.id !== assetId));
    toast.success('Activo eliminado');
  };

  const getStatusColor = (status: Asset['status']) => {
    switch (status) {
      case 'al-dia':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'proximo-vencer':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      case 'vencido':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'sin-inspeccion':
        return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-900/20 dark:text-zinc-400 dark:border-zinc-800';
    }
  };

  const getStatusLabel = (status: Asset['status']) => {
    switch (status) {
      case 'al-dia': return 'Al día';
      case 'proximo-vencer': return 'Próximo a vencer';
      case 'vencido': return 'Vencido';
      case 'sin-inspeccion': return 'Sin inspección';
    }
  };

  const getCategoryIcon = (category: Asset['category']) => {
    return ASSET_CATEGORIES.find(c => c.value === category)?.icon || '📦';
  };

  const sectorAssets = assets.filter(a => a.sectorId === selectedSector);
  const currentSector = sectors.find(s => s.id === selectedSector);

  const stats = {
    total: assets.length,
    alDia: assets.filter(a => a.status === 'al-dia').length,
    proximoVencer: assets.filter(a => a.status === 'proximo-vencer').length,
    vencido: assets.filter(a => a.status === 'vencido').length,
    sinInspeccion: assets.filter(a => a.status === 'sin-inspeccion').length
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 pb-24">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
                Gestión de Activos
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                {companyName} • Configurar activos y planificación de inspecciones
              </p>
            </div>
            <Button
              onClick={() => onComplete(assets)}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={assets.length === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              Finalizar y Generar Plan
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-4">
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.total}</div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Total Activos</p>
          </Card>
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 p-4">
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.alDia}</div>
            <p className="text-xs text-green-600 dark:text-green-500">Al Día</p>
          </Card>
          <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 p-4">
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{stats.proximoVencer}</div>
            <p className="text-xs text-yellow-600 dark:text-yellow-500">Próx. Vencer</p>
          </Card>
          <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 p-4">
            <div className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.vencido}</div>
            <p className="text-xs text-red-600 dark:text-red-500">Vencidos</p>
          </Card>
          <Card className="bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-4">
            <div className="text-2xl font-bold text-zinc-700 dark:text-zinc-400">{stats.sinInspeccion}</div>
            <p className="text-xs text-zinc-600 dark:text-zinc-500">Sin Inspección</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sector Selector */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-4">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Sectores</h3>
              <div className="space-y-2">
                {sectors.map(sector => (
                  <button
                    key={sector.id}
                    onClick={() => setSelectedSector(sector.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedSector === sector.id
                        ? 'bg-[#0055A4] text-white'
                        : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="font-medium">{sector.name}</div>
                    <div className="text-xs opacity-80">
                      {assets.filter(a => a.sectorId === sector.id).length} activos
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Assets List */}
          <div className="lg:col-span-3">
            <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
                  {currentSector?.name} ({sectorAssets.length} activos)
                </h3>
                <Button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Activo
                </Button>
              </div>

              {/* Add Asset Form */}
              {showAddForm && (
                <Card className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 p-4 mb-6">
                  <h4 className="font-semibold text-zinc-900 dark:text-white mb-4">Nuevo Activo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Categoría *</Label>
                      <select
                        value={newAsset.category}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="mt-1 w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                      >
                        {ASSET_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>
                            {cat.icon} {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label>Nombre del Activo *</Label>
                      <Input
                        value={newAsset.name}
                        onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ej: Extintor PQS 10kg"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Código Interno</Label>
                      <Input
                        value={newAsset.code}
                        onChange={(e) => setNewAsset(prev => ({ ...prev, code: e.target.value }))}
                        placeholder="Ej: EXT-001"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Ubicación Específica</Label>
                      <Input
                        value={newAsset.location}
                        onChange={(e) => setNewAsset(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Ej: Pasillo central, junto a puerta"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Marca</Label>
                      <Input
                        value={newAsset.brand}
                        onChange={(e) => setNewAsset(prev => ({ ...prev, brand: e.target.value }))}
                        placeholder="Ej: Bosch"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Modelo</Label>
                      <Input
                        value={newAsset.model}
                        onChange={(e) => setNewAsset(prev => ({ ...prev, model: e.target.value }))}
                        placeholder="Ej: XL-2000"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Número de Serie</Label>
                      <Input
                        value={newAsset.serialNumber}
                        onChange={(e) => setNewAsset(prev => ({ ...prev, serialNumber: e.target.value }))}
                        placeholder="Ej: 123456789"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Responsable</Label>
                      <Input
                        value={newAsset.responsible}
                        onChange={(e) => setNewAsset(prev => ({ ...prev, responsible: e.target.value }))}
                        placeholder="Ej: Juan Pérez"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Última Inspección</Label>
                      <Input
                        type="date"
                        value={newAsset.lastInspectionDate}
                        onChange={(e) => setNewAsset(prev => ({ ...prev, lastInspectionDate: e.target.value }))}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Frecuencia (meses)</Label>
                      <Input
                        type="number"
                        value={newAsset.inspectionFrequency}
                        onChange={(e) => setNewAsset(prev => ({ ...prev, inspectionFrequency: parseInt(e.target.value) || 12 }))}
                        className="mt-1"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Notas</Label>
                      <Input
                        value={newAsset.notes}
                        onChange={(e) => setNewAsset(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Observaciones adicionales"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button onClick={addAsset} className="bg-green-600 hover:bg-green-700 text-white">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Guardar Activo
                    </Button>
                    <Button onClick={() => setShowAddForm(false)} variant="outline">
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </Card>
              )}

              {/* Assets List */}
              <div className="space-y-3">
                {sectorAssets.length === 0 && (
                  <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay activos registrados en este sector</p>
                    <p className="text-sm">Usa el botón "Agregar Activo" para comenzar</p>
                  </div>
                )}

                {sectorAssets.map(asset => (
                  <Card
                    key={asset.id}
                    className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 p-4"
                  >
                    {editingAsset === asset.id ? (
                      <div className="space-y-3">
                        {/* Edit form */}
                        <Input
                          value={asset.name}
                          onChange={(e) => updateAsset(asset.id, { name: e.target.value })}
                          placeholder="Nombre"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => setEditingAsset(null)} className="bg-green-600">
                            <Save className="w-3 h-3 mr-1" />
                            Guardar
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingAsset(null)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{getCategoryIcon(asset.category)}</span>
                            <div>
                              <h4 className="font-semibold text-zinc-900 dark:text-white">
                                {asset.name}
                                {asset.code && <span className="text-xs text-zinc-500 ml-2">({asset.code})</span>}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                                {asset.brand && <span>{asset.brand}</span>}
                                {asset.model && <span>• {asset.model}</span>}
                                {asset.location && <span>• 📍 {asset.location}</span>}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                            {asset.lastInspectionDate && (
                              <div>
                                <p className="text-xs text-zinc-500">Última Inspección</p>
                                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                  {format(parseISO(asset.lastInspectionDate), 'dd MMM yyyy', { locale: es })}
                                </p>
                              </div>
                            )}

                            {asset.nextInspectionDate && (
                              <div>
                                <p className="text-xs text-zinc-500">Próxima Inspección</p>
                                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                  {format(parseISO(asset.nextInspectionDate), 'dd MMM yyyy', { locale: es })}
                                </p>
                              </div>
                            )}

                            <div>
                              <p className="text-xs text-zinc-500">Frecuencia</p>
                              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                Cada {asset.inspectionFrequency} meses
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-zinc-500">Estado</p>
                              <Badge className={getStatusColor(asset.status)}>
                                {getStatusLabel(asset.status)}
                              </Badge>
                            </div>
                          </div>

                          {asset.responsible && (
                            <p className="text-xs text-zinc-500 mt-2">
                              👤 Responsable: {asset.responsible}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => setEditingAsset(asset.id)}
                            variant="ghost"
                            size="sm"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => removeAsset(asset.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
