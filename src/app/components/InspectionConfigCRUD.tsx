/**
 * CRUD de Configuración de Inspecciones por Empresa
 * SafeTrack Chile - Gestión de Sectores, Activos y Checkpoints
 * 
 * Permite al prevencionista configurar elementos personalizados
 * para inspecciones de cada empresa
 */

import React, { useState, useEffect } from 'react';
import {
  fetchInspectionElementsByCompany,
  createInspectionElement,
  updateInspectionElement,
  deleteInspectionElement as deleteInspectionElementInDB,
} from '@/app/services/inspectionConfigService';
import { isSupabaseConfigured } from '@/app/services/supabase';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  MapPin,
  Package as PackageIcon,
  ClipboardList,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Factory,
  Wrench,
  Boxes,
  Gauge
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';

interface InspectionElement {
  id: string;
  companyId: string;
  companyName: string;
  type: 'sector' | 'activo' | 'checkpoint';
  name: string;
  description: string;
  parentId?: string; // Para relacionar checkpoints con sectores/activos
  risk: 'bajo' | 'medio' | 'alto' | 'critico';
  createdAt: string;
  updatedAt: string;
}

interface InspectionConfigCRUDProps {
  onBack: () => void;
  selectedCompanyId?: string;
  selectedCompanyName?: string;
}

const MOCK_ELEMENTS: InspectionElement[] = [
  // Sectores
  {
    id: 'sector-1',
    companyId: 'empresa-1',
    companyName: 'Constructora Los Andes',
    type: 'sector',
    name: 'Obra Gruesa - Piso 3',
    description: 'Zona de construcción de estructura',
    risk: 'alto',
    createdAt: '2026-01-10',
    updatedAt: '2026-01-20'
  },
  {
    id: 'sector-2',
    companyId: 'empresa-1',
    companyName: 'Constructora Los Andes',
    type: 'sector',
    name: 'Bodega de Materiales',
    description: 'Almacenamiento de insumos',
    risk: 'medio',
    createdAt: '2026-01-10',
    updatedAt: '2026-01-20'
  },
  {
    id: 'sector-3',
    companyId: 'empresa-1',
    companyName: 'Constructora Los Andes',
    type: 'sector',
    name: 'Oficinas Administrativas',
    description: 'Área de gestión y administración',
    risk: 'bajo',
    createdAt: '2026-01-12',
    updatedAt: '2026-01-20'
  },
  // Activos
  {
    id: 'activo-1',
    companyId: 'empresa-1',
    companyName: 'Constructora Los Andes',
    type: 'activo',
    name: 'Grúa Torre GT-450',
    description: 'Grúa principal obra',
    risk: 'critico',
    createdAt: '2026-01-10',
    updatedAt: '2026-01-22'
  },
  {
    id: 'activo-2',
    companyId: 'empresa-1',
    companyName: 'Constructora Los Andes',
    type: 'activo',
    name: 'Andamio Metálico Principal',
    description: 'Andamio de fachada norte',
    risk: 'alto',
    createdAt: '2026-01-11',
    updatedAt: '2026-01-22'
  },
  {
    id: 'activo-3',
    companyId: 'empresa-1',
    companyName: 'Constructora Los Andes',
    type: 'activo',
    name: 'Betonera Industrial',
    description: 'Mezcladora de hormigón',
    risk: 'medio',
    createdAt: '2026-01-12',
    updatedAt: '2026-01-20'
  },
  // Checkpoints
  {
    id: 'check-1',
    companyId: 'empresa-1',
    companyName: 'Constructora Los Andes',
    type: 'checkpoint',
    name: 'Estado de Cables de Acero',
    description: 'Verificar desgaste y oxidación',
    parentId: 'activo-1',
    risk: 'critico',
    createdAt: '2026-01-15',
    updatedAt: '2026-01-20'
  },
  {
    id: 'check-2',
    companyId: 'empresa-1',
    companyName: 'Constructora Los Andes',
    type: 'checkpoint',
    name: 'Señalización de Zona',
    description: 'Verificar presencia de letreros',
    parentId: 'sector-1',
    risk: 'alto',
    createdAt: '2026-01-15',
    updatedAt: '2026-01-20'
  },
  {
    id: 'check-3',
    companyId: 'empresa-1',
    companyName: 'Constructora Los Andes',
    type: 'checkpoint',
    name: 'Orden y Aseo',
    description: 'Verificar limpieza general',
    parentId: 'sector-2',
    risk: 'medio',
    createdAt: '2026-01-16',
    updatedAt: '2026-01-20'
  },
  // Minera del Norte
  {
    id: 'sector-m1',
    companyId: 'empresa-2',
    companyName: 'Minera del Norte',
    type: 'sector',
    name: 'Frente de Extracción Norte',
    description: 'Zona activa de extracción mineral',
    risk: 'critico',
    createdAt: '2026-01-08',
    updatedAt: '2026-01-20'
  },
  {
    id: 'activo-m1',
    companyId: 'empresa-2',
    companyName: 'Minera del Norte',
    type: 'activo',
    name: 'Camión Minero CAT 797',
    description: 'Camión de transporte de mineral',
    risk: 'alto',
    createdAt: '2026-01-09',
    updatedAt: '2026-01-22'
  }
];

export function InspectionConfigCRUD({
  onBack,
  selectedCompanyId,
  selectedCompanyName
}: InspectionConfigCRUDProps) {
  const [elements, setElements] = useState<InspectionElement[]>([]);
  const [isLoadingElements, setIsLoadingElements] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadElements = async () => {
      setIsLoadingElements(true);
      if (!isSupabaseConfigured || !selectedCompanyId) {
        if (!cancelled) setElements(MOCK_ELEMENTS);
        if (!cancelled) setIsLoadingElements(false);
        return;
      }
      try {
        const data = await fetchInspectionElementsByCompany(selectedCompanyId, selectedCompanyName || '');
        if (!cancelled) setElements(data);
      } catch (err: any) {
        console.warn('No se pudo cargar la configuración de inspecciones desde Supabase:', err.message);
        if (!cancelled) setElements(MOCK_ELEMENTS);
      } finally {
        if (!cancelled) setIsLoadingElements(false);
      }
    };
    loadElements();
    return () => { cancelled = true; };
  }, [selectedCompanyId, selectedCompanyName]);

  const [activeTab, setActiveTab] = useState<'sector' | 'activo' | 'checkpoint'>('sector');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    risk: 'medio' as InspectionElement['risk'],
    parentId: ''
  });

  // Filtrar elementos por empresa y tipo
  const filteredElements = elements.filter(el => {
    const matchesCompany = selectedCompanyId ? el.companyId === selectedCompanyId : true;
    const matchesType = el.type === activeTab;
    return matchesCompany && matchesType;
  });

  // Obtener sectores y activos para seleccionar como padre de checkpoints
  const parentOptions = elements.filter(el => {
    const matchesCompany = selectedCompanyId ? el.companyId === selectedCompanyId : true;
    const isParentType = el.type === 'sector' || el.type === 'activo';
    return matchesCompany && isParentType;
  });

  const typeIcons = {
    sector: <MapPin className="size-5" />,
    activo: <Wrench className="size-5" />,
    checkpoint: <ClipboardList className="size-5" />
  };

  const typeLabels = {
    sector: 'Sectores',
    activo: 'Activos',
    checkpoint: 'Checkpoints'
  };

  const riskColors = {
    bajo: 'border-green-500/50 text-green-400 bg-green-500/10',
    medio: 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10',
    alto: 'border-orange-500/50 text-orange-400 bg-orange-500/10',
    critico: 'border-red-500/50 text-red-400 bg-red-500/10'
  };

  const riskLabels = {
    bajo: 'Riesgo Bajo',
    medio: 'Riesgo Medio',
    alto: 'Riesgo Alto',
    critico: 'Riesgo Crítico'
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      risk: 'medio',
      parentId: ''
    });
  };

  const handleEdit = (element: InspectionElement) => {
    setIsCreating(true);
    setEditingId(element.id);
    setFormData({
      name: element.name,
      description: element.description,
      risk: element.risk,
      parentId: element.parentId || ''
    });
  };

  const handleDelete = async (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    // Verificar si tiene checkpoints asociados
    const hasChildren = elements.some(el => el.parentId === elementId);
    if (hasChildren && element.type !== 'checkpoint') {
      alert(`No puedes eliminar este ${element.type} porque tiene checkpoints asociados. Elimina primero los checkpoints.`);
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar este ${element.type}?`)) return;

    try {
      if (selectedCompanyId && isSupabaseConfigured) {
        await deleteInspectionElementInDB(elementId);
      }
      setElements(prev => prev.filter(el => el.id !== elementId));
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Debes ingresar un nombre');
      return;
    }

    if (activeTab === 'checkpoint' && !formData.parentId) {
      alert('Debes seleccionar un sector o activo para el checkpoint');
      return;
    }

    const canPersist = Boolean(selectedCompanyId && isSupabaseConfigured);
    const elementInput = {
      type: activeTab,
      name: formData.name,
      description: formData.description,
      risk: formData.risk,
      parentId: activeTab === 'checkpoint' ? formData.parentId : undefined,
    };

    try {
      if (editingId) {
        if (canPersist) {
          const updated = await updateInspectionElement(editingId, selectedCompanyName || '', elementInput);
          setElements(prev => prev.map(el => (el.id === editingId ? updated : el)));
        } else {
          setElements(prev => prev.map(el =>
            el.id === editingId
              ? {
                  ...el,
                  name: formData.name,
                  description: formData.description,
                  risk: formData.risk,
                  parentId: activeTab === 'checkpoint' ? formData.parentId : undefined,
                  updatedAt: new Date().toISOString().split('T')[0]
                }
              : el
          ));
        }
      } else {
        if (canPersist) {
          const created = await createInspectionElement(selectedCompanyId!, selectedCompanyName || '', elementInput);
          setElements(prev => [...prev, created]);
        } else {
          const newElement: InspectionElement = {
            id: `${activeTab}-${Date.now()}`,
            companyId: selectedCompanyId || 'empresa-1',
            companyName: selectedCompanyName || 'Empresa sin especificar',
            type: activeTab,
            name: formData.name,
            description: formData.description,
            risk: formData.risk,
            parentId: activeTab === 'checkpoint' ? formData.parentId : undefined,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
          };
          setElements(prev => [...prev, newElement]);
        }
      }
    } catch (err: any) {
      alert(`Error al guardar: ${err.message}`);
      return;
    }

    setIsCreating(false);
    setEditingId(null);
    setFormData({ name: '', description: '', risk: 'medio', parentId: '' });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ name: '', description: '', risk: 'medio', parentId: '' });
  };

  // Obtener el nombre del padre para mostrar en checkpoints
  const getParentName = (parentId?: string) => {
    if (!parentId) return null;
    const parent = elements.find(el => el.id === parentId);
    return parent?.name;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1419] text-white">
      {/* Header */}
      <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border-b border-white/10 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
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
                <h1 className="font-bold text-lg">Configuración de Inspecciones</h1>
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
                Nuevo
              </Button>
            )}
          </div>

          {/* Tabs */}
          {!isCreating && (
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/5">
                <TabsTrigger value="sector" className="data-[state=active]:bg-[#0055A4]">
                  <MapPin className="size-4 mr-2" />
                  Sectores
                </TabsTrigger>
                <TabsTrigger value="activo" className="data-[state=active]:bg-[#0055A4]">
                  <Wrench className="size-4 mr-2" />
                  Activos
                </TabsTrigger>
                <TabsTrigger value="checkpoint" className="data-[state=active]:bg-[#0055A4]">
                  <ClipboardList className="size-4 mr-2" />
                  Checkpoints
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      </div>

      <div className="p-4 pb-24 space-y-4">
        {/* Vista de Creación/Edición */}
        {isCreating && (
          <Card className="bg-white/5 border-white/10 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {typeIcons[activeTab]}
                {editingId ? 'Editar' : 'Nuevo'} {typeLabels[activeTab].slice(0, -1)}
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

            <div className="space-y-4">
              <div>
                <Label className="text-white/80 mb-2">Nombre *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={
                    activeTab === 'sector' ? 'Ej: Obra Gruesa - Piso 3' :
                    activeTab === 'activo' ? 'Ej: Grúa Torre GT-450' :
                    'Ej: Estado de Cables de Acero'
                  }
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              <div>
                <Label className="text-white/80 mb-2">Descripción</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descripción breve"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              {activeTab === 'checkpoint' && (
                <div>
                  <Label className="text-white/80 mb-2">Asociado a (Sector o Activo) *</Label>
                  <Select
                    value={formData.parentId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value }))}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Selecciona sector o activo" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a2e] border-white/10">
                      {parentOptions.map(parent => (
                        <SelectItem
                          key={parent.id}
                          value={parent.id}
                          className="text-white hover:bg-white/10"
                        >
                          {parent.type === 'sector' ? '📍' : '⚙️'} {parent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label className="text-white/80 mb-2">Nivel de Riesgo</Label>
                <Select
                  value={formData.risk}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, risk: value as any }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a2e] border-white/10">
                    <SelectItem value="bajo" className="text-white hover:bg-white/10">
                      🟢 Riesgo Bajo
                    </SelectItem>
                    <SelectItem value="medio" className="text-white hover:bg-white/10">
                      🟡 Riesgo Medio
                    </SelectItem>
                    <SelectItem value="alto" className="text-white hover:bg-white/10">
                      🟠 Riesgo Alto
                    </SelectItem>
                    <SelectItem value="critico" className="text-white hover:bg-white/10">
                      🔴 Riesgo Crítico
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                className="flex-1 bg-[#0055A4] hover:bg-[#0055A4]/80 text-white"
              >
                <Save className="size-4 mr-2" />
                {editingId ? 'Guardar Cambios' : 'Crear'}
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
        {!isCreating && isLoadingElements && (
          <div className="flex items-center justify-center py-12 text-white/60">
            <ClipboardList className="size-5 mr-2 animate-spin" />
            Cargando configuración...
          </div>
        )}
        {!isCreating && !isLoadingElements && (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsContent value={activeTab} className="mt-0 space-y-3">
              {filteredElements.length === 0 ? (
                <Card className="bg-white/5 border-white/10 p-12 text-center">
                  {typeIcons[activeTab] && (
                    <div className="size-16 mx-auto mb-4 text-white/40 flex items-center justify-center">
                      {React.cloneElement(typeIcons[activeTab] as React.ReactElement, { className: 'size-16' })}
                    </div>
                  )}
                  <h3 className="text-lg font-semibold mb-2">
                    No hay {typeLabels[activeTab].toLowerCase()} configurados
                  </h3>
                  <p className="text-white/60 mb-6">
                    Agrega {typeLabels[activeTab].toLowerCase()} para personalizar tus inspecciones
                  </p>
                  <Button
                    onClick={handleCreateNew}
                    className="bg-[#FF8C00] hover:bg-[#FF8C00]/80 text-white"
                  >
                    <Plus className="size-4 mr-2" />
                    Crear Primero
                  </Button>
                </Card>
              ) : (
                filteredElements.map(element => {
                  const parentName = getParentName(element.parentId);
                  
                  return (
                    <Card key={element.id} className="bg-white/5 border-white/10 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="text-[#FF8C00]">
                              {typeIcons[element.type]}
                            </div>
                            <h3 className="font-bold">{element.name}</h3>
                          </div>
                          
                          {element.description && (
                            <p className="text-sm text-white/60 mb-2">{element.description}</p>
                          )}

                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={riskColors[element.risk]}>
                              {riskLabels[element.risk]}
                            </Badge>

                            {parentName && (
                              <Badge variant="outline" className="border-white/20 text-white/60 text-xs">
                                {parentName}
                              </Badge>
                            )}

                            <span className="text-xs text-white/40">
                              {element.companyName}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEdit(element)}
                            variant="ghost"
                            size="sm"
                            className="text-[#0055A4] hover:bg-[#0055A4]/10"
                          >
                            <Edit2 className="size-4" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(element.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:bg-red-400/10"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

export default InspectionConfigCRUD;
