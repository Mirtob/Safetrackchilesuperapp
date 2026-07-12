/**
 * CRUD de Kits de Seguridad por Empresa
 * SafeTrack Chile - Gestión de EPP
 * 
 * Permite al prevencionista configurar kits de seguridad completos
 * según las políticas de cada empresa cliente
 */

import { useState, useEffect } from 'react';
import {
  fetchSafetyKitsByCompany,
  createSafetyKit,
  updateSafetyKit,
  deleteSafetyKit as deleteSafetyKitInDB,
} from '@/app/services/safetyKitsService';
import { isSupabaseConfigured } from '@/app/services/supabase';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Package,
  Building2,
  CheckCircle2,
  Shield,
  HardHat,
  Eye,
  Hand,
  Footprints,
  Ear,
  Wind,
  Activity
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Checkbox } from '@/app/components/ui/checkbox';

interface EPPItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: 'cabeza' | 'rostro' | 'manos' | 'pies' | 'respiratorio' | 'cuerpo';
}

interface SafetyKit {
  id: string;
  companyId: string;
  companyName: string;
  kitName: string;
  description: string;
  eppItems: string[]; // IDs de EPPs incluidos
  createdAt: string;
  updatedAt: string;
}

interface SafetyKitCRUDProps {
  onBack: () => void;
  selectedCompanyId?: string;
  selectedCompanyName?: string;
}

// Kits de demostración: se usan solo si Supabase no está configurado o no hay empresa seleccionada
const MOCK_KITS: SafetyKit[] = [
  {
    id: 'kit-1',
    companyId: 'empresa-1',
    companyName: 'Constructora Los Andes',
    kitName: 'Kit Básico Constructor',
    description: 'Kit estándar para trabajadores de obra',
    eppItems: ['casco-obra', 'lentes-seg', 'guantes-cuero', 'zapatos-seg', 'chaleco-ref', 'protector-sol'],
    createdAt: '2026-01-15',
    updatedAt: '2026-01-20'
  },
  {
    id: 'kit-2',
    companyId: 'empresa-1',
    companyName: 'Constructora Los Andes',
    kitName: 'Kit Electricista',
    description: 'Kit especializado para trabajos eléctricos',
    eppItems: ['casco-diel', 'lentes-seg', 'guantes-diel', 'botas-diel', 'chaleco-ref'],
    createdAt: '2026-01-18',
    updatedAt: '2026-01-20'
  },
  {
    id: 'kit-3',
    companyId: 'empresa-2',
    companyName: 'Minera del Norte',
    kitName: 'Kit Minero Estándar',
    description: 'Kit completo para operaciones mineras',
    eppItems: ['casco-obra', 'lentes-seg', 'guantes-cuero', 'botas-minera', 'chaleco-ref', 'respirador-media', 'tapones-aud', 'protector-sol'],
    createdAt: '2026-01-10',
    updatedAt: '2026-01-22'
  }
];

// Catálogo completo de EPPs disponibles
const EPP_CATALOG: EPPItem[] = [
  // Protección de Cabeza
  { id: 'casco-obra', name: 'Casco de Obra', icon: <HardHat className="size-5" />, category: 'cabeza' },
  { id: 'casco-diel', name: 'Casco Dieléctrico', icon: <HardHat className="size-5" />, category: 'cabeza' },
  
  // Protección de Rostro
  { id: 'lentes-seg', name: 'Lentes de Seguridad', icon: <Eye className="size-5" />, category: 'rostro' },
  { id: 'lentes-sol', name: 'Lentes con Filtro UV', icon: <Eye className="size-5" />, category: 'rostro' },
  { id: 'careta-facial', name: 'Careta Facial', icon: <Shield className="size-5" />, category: 'rostro' },
  { id: 'mascara-sold', name: 'Máscara de Soldar', icon: <Shield className="size-5" />, category: 'rostro' },
  
  // Protección de Manos
  { id: 'guantes-hilo', name: 'Guantes de Hilo', icon: <Hand className="size-5" />, category: 'manos' },
  { id: 'guantes-cuero', name: 'Guantes de Cuero', icon: <Hand className="size-5" />, category: 'manos' },
  { id: 'guantes-latex', name: 'Guantes de Látex', icon: <Hand className="size-5" />, category: 'manos' },
  { id: 'guantes-nitri', name: 'Guantes de Nitrilo', icon: <Hand className="size-5" />, category: 'manos' },
  { id: 'guantes-diel', name: 'Guantes Dieléctricos', icon: <Hand className="size-5" />, category: 'manos' },
  { id: 'guantes-anti', name: 'Guantes Anticorte', icon: <Hand className="size-5" />, category: 'manos' },
  
  // Protección de Pies
  { id: 'zapatos-seg', name: 'Zapatos de Seguridad', icon: <Footprints className="size-5" />, category: 'pies' },
  { id: 'botas-seg', name: 'Botas de Seguridad', icon: <Footprints className="size-5" />, category: 'pies' },
  { id: 'botas-diel', name: 'Botas Dieléctricas', icon: <Footprints className="size-5" />, category: 'pies' },
  { id: 'botas-minera', name: 'Botas Mineras', icon: <Footprints className="size-5" />, category: 'pies' },
  
  // Protección Respiratoria
  { id: 'mascarilla-n95', name: 'Mascarilla N95', icon: <Wind className="size-5" />, category: 'respiratorio' },
  { id: 'respirador-media', name: 'Respirador Media Cara', icon: <Wind className="size-5" />, category: 'respiratorio' },
  { id: 'respirador-full', name: 'Respirador Cara Completa', icon: <Wind className="size-5" />, category: 'respiratorio' },
  { id: 'mascarilla-quirur', name: 'Mascarilla Quirúrgica', icon: <Wind className="size-5" />, category: 'respiratorio' },
  
  // Protección Auditiva
  { id: 'tapones-aud', name: 'Tapones Auditivos', icon: <Ear className="size-5" />, category: 'rostro' },
  { id: 'fonos-aud', name: 'Fonos de Protección', icon: <Ear className="size-5" />, category: 'rostro' },
  
  // Protección de Cuerpo
  { id: 'chaleco-ref', name: 'Chaleco Reflectante', icon: <Activity className="size-5" />, category: 'cuerpo' },
  { id: 'arnes-seg', name: 'Arnés de Seguridad', icon: <Activity className="size-5" />, category: 'cuerpo' },
  { id: 'protector-sol', name: 'Protector Solar FPS 50+', icon: <Activity className="size-5" />, category: 'cuerpo' },
  { id: 'overol', name: 'Overol de Trabajo', icon: <Activity className="size-5" />, category: 'cuerpo' },
  { id: 'parka-inv', name: 'Parka de Invierno', icon: <Activity className="size-5" />, category: 'cuerpo' },
  { id: 'chaleco-verano', name: 'Chaleco de Verano', icon: <Activity className="size-5" />, category: 'cuerpo' },
];

export function SafetyKitCRUD({
  onBack,
  selectedCompanyId,
  selectedCompanyName
}: SafetyKitCRUDProps) {
  const [kits, setKits] = useState<SafetyKit[]>([]);
  const [isLoadingKits, setIsLoadingKits] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadKits = async () => {
      setIsLoadingKits(true);
      if (!isSupabaseConfigured || !selectedCompanyId) {
        if (!cancelled) setKits(MOCK_KITS);
        if (!cancelled) setIsLoadingKits(false);
        return;
      }
      try {
        const data = await fetchSafetyKitsByCompany(selectedCompanyId, selectedCompanyName || '');
        if (!cancelled) setKits(data);
      } catch (err: any) {
        console.warn('No se pudo cargar kits desde Supabase:', err.message);
        if (!cancelled) setKits(MOCK_KITS);
      } finally {
        if (!cancelled) setIsLoadingKits(false);
      }
    };
    loadKits();
    return () => { cancelled = true; };
  }, [selectedCompanyId, selectedCompanyName]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingKitId, setEditingKitId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    kitName: '',
    description: '',
    selectedEPPs: [] as string[]
  });

  // Filtrar kits por empresa si hay una seleccionada
  const filteredKits = selectedCompanyId
    ? kits.filter(kit => kit.companyId === selectedCompanyId)
    : kits;

  // Agrupar EPPs por categoría
  const eppsByCategory = EPP_CATALOG.reduce((acc, epp) => {
    if (!acc[epp.category]) {
      acc[epp.category] = [];
    }
    acc[epp.category].push(epp);
    return acc;
  }, {} as Record<string, EPPItem[]>);

  const categoryLabels = {
    cabeza: '🪖 Protección de Cabeza',
    rostro: '👓 Protección de Rostro y Auditiva',
    manos: '🧤 Protección de Manos',
    pies: '👢 Protección de Pies',
    respiratorio: '😷 Protección Respiratoria',
    cuerpo: '🦺 Protección de Cuerpo'
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingKitId(null);
    setFormData({
      kitName: '',
      description: '',
      selectedEPPs: []
    });
  };

  const handleEdit = (kit: SafetyKit) => {
    setIsCreating(true);
    setEditingKitId(kit.id);
    setFormData({
      kitName: kit.kitName,
      description: kit.description,
      selectedEPPs: [...kit.eppItems]
    });
  };

  const handleDelete = async (kitId: string) => {
    if (!confirm('¿Estás seguro de eliminar este kit de seguridad?')) return;
    try {
      if (selectedCompanyId && isSupabaseConfigured) {
        await deleteSafetyKitInDB(kitId);
      }
      setKits(prev => prev.filter(k => k.id !== kitId));
    } catch (err: any) {
      alert(`Error al eliminar el kit: ${err.message}`);
    }
  };

  const handleToggleEPP = (eppId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedEPPs: prev.selectedEPPs.includes(eppId)
        ? prev.selectedEPPs.filter(id => id !== eppId)
        : [...prev.selectedEPPs, eppId]
    }));
  };

  const handleSave = async () => {
    if (!formData.kitName.trim()) {
      alert('Debes ingresar un nombre para el kit');
      return;
    }

    if (formData.selectedEPPs.length === 0) {
      alert('Debes seleccionar al menos un EPP');
      return;
    }

    const canPersist = Boolean(selectedCompanyId && isSupabaseConfigured);
    const kitInput = {
      kitName: formData.kitName,
      description: formData.description,
      eppItems: formData.selectedEPPs,
    };

    try {
      if (editingKitId) {
        if (canPersist) {
          const updated = await updateSafetyKit(editingKitId, selectedCompanyName || '', kitInput);
          setKits(prev => prev.map(kit => (kit.id === editingKitId ? updated : kit)));
        } else {
          setKits(prev => prev.map(kit =>
            kit.id === editingKitId
              ? {
                  ...kit,
                  kitName: formData.kitName,
                  description: formData.description,
                  eppItems: formData.selectedEPPs,
                  updatedAt: new Date().toISOString().split('T')[0]
                }
              : kit
          ));
        }
      } else {
        if (canPersist) {
          const created = await createSafetyKit(selectedCompanyId!, selectedCompanyName || '', kitInput);
          setKits(prev => [...prev, created]);
        } else {
          const newKit: SafetyKit = {
            id: `kit-${Date.now()}`,
            companyId: selectedCompanyId || 'empresa-1',
            companyName: selectedCompanyName || 'Empresa sin especificar',
            kitName: formData.kitName,
            description: formData.description,
            eppItems: formData.selectedEPPs,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
          };
          setKits(prev => [...prev, newKit]);
        }
      }
    } catch (err: any) {
      alert(`Error al guardar el kit: ${err.message}`);
      return;
    }

    setIsCreating(false);
    setEditingKitId(null);
    setFormData({ kitName: '', description: '', selectedEPPs: [] });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingKitId(null);
    setFormData({ kitName: '', description: '', selectedEPPs: [] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419] text-white">
      {/* Header */}
      <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border-b border-white/10 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="size-5" />
              </Button>
              <div>
                <h1 className="font-bold text-lg">Kits de Seguridad</h1>
                {selectedCompanyName && (
                  <p className="text-sm text-white/60">{selectedCompanyName}</p>
                )}
              </div>
            </div>

            {!isCreating && (
              <Button
                onClick={handleCreateNew}
                className="bg-[#FF8C00] hover:bg-[#FF8C00]/80 text-white"
              >
                <Plus className="size-4 mr-2" />
                Nuevo Kit
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 pb-24 space-y-4">
        {/* Vista de Creación/Edición */}
        {isCreating && (
          <Card className="bg-white/5 border-white/10 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingKitId ? 'Editar Kit' : 'Nuevo Kit de Seguridad'}
              </h2>
              <Button
                onClick={handleCancel}
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="size-5" />
              </Button>
            </div>

            {/* Información del Kit */}
            <div className="space-y-4">
              <div>
                <Label className="text-white/80 mb-2">Nombre del Kit *</Label>
                <Input
                  value={formData.kitName}
                  onChange={(e) => setFormData(prev => ({ ...prev, kitName: e.target.value }))}
                  placeholder="Ej: Kit Básico Constructor"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              <div>
                <Label className="text-white/80 mb-2">Descripción</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción del kit y su uso"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            {/* Selección de EPPs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-white/80">
                  Elementos del Kit ({formData.selectedEPPs.length})
                </Label>
                <Badge variant="outline" className="border-[#FF8C00]/50 text-[#FF8C00]">
                  Selección múltiple
                </Badge>
              </div>

              {Object.entries(eppsByCategory).map(([category, epps]) => (
                <div key={category} className="space-y-2">
                  <h3 className="font-semibold text-[#FF8C00]">
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {epps.map(epp => (
                      <div
                        key={epp.id}
                        onClick={() => handleToggleEPP(epp.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.selectedEPPs.includes(epp.id)
                            ? 'bg-[#FF8C00]/20 border-[#FF8C00] shadow-lg shadow-[#FF8C00]/20'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <Checkbox
                          checked={formData.selectedEPPs.includes(epp.id)}
                          onCheckedChange={() => handleToggleEPP(epp.id)}
                          className="border-white/30"
                        />
                        <div className="text-[#FF8C00]">{epp.icon}</div>
                        <span className="flex-1 text-sm">{epp.name}</span>
                        {formData.selectedEPPs.includes(epp.id) && (
                          <CheckCircle2 className="size-5 text-[#FF8C00]" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                className="flex-1 bg-[#0055A4] hover:bg-[#0055A4]/80 text-white"
              >
                <Save className="size-4 mr-2" />
                {editingKitId ? 'Guardar Cambios' : 'Crear Kit'}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancelar
              </Button>
            </div>
          </Card>
        )}

        {/* Vista de Lista */}
        {!isCreating && isLoadingKits && (
          <div className="flex items-center justify-center py-12 text-white/60">
            <Package className="size-5 mr-2 animate-spin" />
            Cargando kits...
          </div>
        )}
        {!isCreating && !isLoadingKits && (
          <>
            {filteredKits.length === 0 ? (
              <Card className="bg-white/5 border-white/10 p-12 text-center">
                <Package className="size-16 mx-auto mb-4 text-white/40" />
                <h3 className="text-lg font-semibold mb-2">No hay kits configurados</h3>
                <p className="text-white/60 mb-6">
                  Crea tu primer kit de seguridad para agilizar la entrega de EPP
                </p>
                <Button
                  onClick={handleCreateNew}
                  className="bg-[#FF8C00] hover:bg-[#FF8C00]/80 text-white"
                >
                  <Plus className="size-4 mr-2" />
                  Crear Primer Kit
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredKits.map(kit => {
                  const eppDetails = kit.eppItems.map(id =>
                    EPP_CATALOG.find(epp => epp.id === id)
                  ).filter(Boolean) as EPPItem[];

                  return (
                    <Card key={kit.id} className="bg-white/5 border-white/10 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Package className="size-5 text-[#FF8C00]" />
                            <h3 className="font-bold text-lg">{kit.kitName}</h3>
                          </div>
                          {kit.description && (
                            <p className="text-sm text-white/60 mb-2">{kit.description}</p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-white/50">
                            <Building2 className="size-3" />
                            <span>{kit.companyName}</span>
                            <span>•</span>
                            <span>{kit.eppItems.length} elementos</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEdit(kit)}
                            variant="ghost"
                            size="sm"
                            className="text-[#0055A4] hover:bg-[#0055A4]/10"
                          >
                            <Edit2 className="size-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(kit.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:bg-red-400/10"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Lista de EPPs del kit */}
                      <div className="flex flex-wrap gap-2">
                        {eppDetails.map(epp => (
                          <Badge
                            key={epp.id}
                            variant="outline"
                            className="border-white/20 text-white/80 text-xs"
                          >
                            {epp.name}
                          </Badge>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SafetyKitCRUD;
