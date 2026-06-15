import { useState } from 'react';
import { 
  ArrowLeft,
  Package,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Wrench,
  Calendar,
  MapPin,
  FileText,
  Download,
  QrCode,
  History,
  ChevronRight,
  Shield,
  Clock,
  TrendingUp,
  AlertCircle,
  Flame,
  HardHat,
  Truck,
  Upload,
  Edit2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Progress } from '@/app/components/ui/progress';
import { NextDueDateModal } from '@/app/components/NextDueDateModal';
import { toast } from 'sonner';

interface AssetInventoryProps {
  onBack: () => void;
  onViewPlanner?: () => void;
  onScanQR?: (assetId: string) => void;
  onViewAlerts?: () => void;
}

type AssetStatus = 'compliant' | 'warning' | 'critical';
type AssetCategory = 'extintores' | 'maquinaria' | 'altura' | 'electrico' | 'vehiculos';

interface Asset {
  id: string;
  code: string;
  name: string;
  category: AssetCategory;
  status: AssetStatus;
  location: string;
  lastMaintenance: string;
  nextMaintenance: string;
  daysUntilMaintenance: number;
  supplier: string;
  certificationNumber?: string;
  qrCode: string;
}

const categoryIcons: Record<AssetCategory, any> = {
  extintores: Flame,
  maquinaria: Wrench,
  altura: HardHat,
  electrico: Package,
  vehiculos: Truck
};

const categoryNames: Record<AssetCategory, string> = {
  extintores: 'Extintores',
  maquinaria: 'Maquinaria',
  altura: 'Equipos Altura',
  electrico: 'Equipos Eléctricos',
  vehiculos: 'Vehículos'
};

export function AssetInventory({ onBack, onViewPlanner, onScanQR, onViewAlerts }: AssetInventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [showNextDueDateModal, setShowNextDueDateModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Base de datos de activos críticos
  const [assets] = useState<Asset[]>([
    {
      id: 'AST-001',
      code: 'EXT-MAI-001',
      name: 'Extintor PQS 6kg - Oficinas',
      category: 'extintores',
      status: 'compliant',
      location: 'Oficina Administrativa - Piso 2',
      lastMaintenance: '2025-12-15',
      nextMaintenance: '2026-12-15',
      daysUntilMaintenance: 323,
      supplier: 'Extintores Chile S.A.',
      certificationNumber: 'CERT-2025-12345',
      qrCode: 'QR-EXT-MAI-001'
    },
    {
      id: 'AST-002',
      code: 'EXT-OBR-002',
      name: 'Extintor CO2 10kg - Bodega',
      category: 'extintores',
      status: 'warning',
      location: 'Bodega Principal - Sector A',
      lastMaintenance: '2025-11-20',
      nextMaintenance: '2026-02-10',
      daysUntilMaintenance: 15,
      supplier: 'Extintores Chile S.A.',
      certificationNumber: 'CERT-2025-11890',
      qrCode: 'QR-EXT-OBR-002'
    },
    {
      id: 'AST-003',
      code: 'EXT-OBR-003',
      name: 'Extintor PQS 6kg - Comedor',
      category: 'extintores',
      status: 'critical',
      location: 'Comedor de Trabajadores',
      lastMaintenance: '2025-01-10',
      nextMaintenance: '2026-01-10',
      daysUntilMaintenance: -16,
      supplier: 'Seguridad Industrial Ltda.',
      certificationNumber: 'CERT-2025-00234',
      qrCode: 'QR-EXT-OBR-003'
    },
    {
      id: 'AST-004',
      code: 'MAQ-GRU-001',
      name: 'Grúa Horquilla Toyota 2.5T',
      category: 'maquinaria',
      status: 'compliant',
      location: 'Patio de Carga - Zona 1',
      lastMaintenance: '2026-01-05',
      nextMaintenance: '2026-07-05',
      daysUntilMaintenance: 160,
      supplier: 'Toyota Industrial',
      certificationNumber: 'REV-2026-00145',
      qrCode: 'QR-MAQ-GRU-001'
    },
    {
      id: 'AST-005',
      code: 'ALT-ARN-001',
      name: 'Arnés de Seguridad Full Body',
      category: 'altura',
      status: 'warning',
      location: 'Almacén EPP - Estantería B3',
      lastMaintenance: '2025-12-01',
      nextMaintenance: '2026-02-05',
      daysUntilMaintenance: 10,
      supplier: 'MSA Safety',
      certificationNumber: 'CERT-ALT-2025-789',
      qrCode: 'QR-ALT-ARN-001'
    },
    {
      id: 'AST-006',
      code: 'MAQ-COM-001',
      name: 'Compresor de Aire Atlas Copco',
      category: 'maquinaria',
      status: 'compliant',
      location: 'Taller de Mantención',
      lastMaintenance: '2026-01-15',
      nextMaintenance: '2026-04-15',
      daysUntilMaintenance: 79,
      supplier: 'Atlas Copco Chile',
      certificationNumber: 'MANT-2026-456',
      qrCode: 'QR-MAQ-COM-001'
    },
    {
      id: 'AST-007',
      code: 'VEH-CAM-001',
      name: 'Camión Tolva Mercedes Actros',
      category: 'vehiculos',
      status: 'warning',
      location: 'Estacionamiento de Flota',
      lastMaintenance: '2025-12-20',
      nextMaintenance: '2026-02-08',
      daysUntilMaintenance: 13,
      supplier: 'Mercedes-Benz Trucks',
      certificationNumber: 'REV-TECNICA-2026-001',
      qrCode: 'QR-VEH-CAM-001'
    },
    {
      id: 'AST-008',
      code: 'ELE-GEN-001',
      name: 'Generador Eléctrico 150kVA',
      category: 'electrico',
      status: 'critical',
      location: 'Sala de Generadores',
      lastMaintenance: '2025-07-15',
      nextMaintenance: '2026-01-15',
      daysUntilMaintenance: -11,
      supplier: 'Caterpillar Power Systems',
      certificationNumber: 'MANT-GEN-2025-890',
      qrCode: 'QR-ELE-GEN-001'
    }
  ]);

  // Filtrar activos
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Estadísticas
  const compliantCount = assets.filter(a => a.status === 'compliant').length;
  const warningCount = assets.filter(a => a.status === 'warning').length;
  const criticalCount = assets.filter(a => a.status === 'critical').length;

  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case 'compliant':
        return (
          <Badge className="bg-[#27AE60]/20 text-[#27AE60] border-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Al Día
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-[#F2C94C]/20 text-[#F2C94C] border-0 animate-pulse">
            <Clock className="w-3 h-3 mr-1" />
            Próxima (&lt;15d)
          </Badge>
        );
      case 'critical':
        return (
          <Badge className="bg-[#EB5757]/20 text-[#EB5757] border-0 animate-pulse">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Vencido
          </Badge>
        );
    }
  };

  const getStatusColor = (status: AssetStatus) => {
    switch (status) {
      case 'compliant':
        return 'border-[#27AE60]';
      case 'warning':
        return 'border-[#F2C94C]';
      case 'critical':
        return 'border-[#EB5757]';
    }
  };

  const categories: Array<{ key: AssetCategory | 'all'; label: string }> = [
    { key: 'all', label: 'Todos' },
    { key: 'extintores', label: 'Extintores' },
    { key: 'maquinaria', label: 'Maquinaria' },
    { key: 'altura', label: 'Equipos Altura' },
    { key: 'electrico', label: 'Eléctricos' },
    { key: 'vehiculos', label: 'Vehículos' }
  ];

  const handleCompleteMaintenance = (asset: Asset) => {
    toast.success('Mantención Registrada', {
      description: 'Ahora programa el próximo vencimiento'
    });
    setSelectedAsset(asset);
    setShowNextDueDateModal(true);
  };

  const handleSaveNextDueDate = (nextDueDate: string, frequency: string, notes: string) => {
    console.log('Guardando próximo vencimiento:', {
      asset: selectedAsset?.name,
      nextDueDate,
      frequency,
      notes
    });
    // Aquí se guardaría en la base de datos y se crearía la alerta automática
    setShowNextDueDateModal(false);
    setSelectedAsset(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors pb-20 lg:pb-6">
      {/* NextDueDateModal */}
      {showNextDueDateModal && selectedAsset && (
        <NextDueDateModal
          isOpen={showNextDueDateModal}
          onClose={() => {
            setShowNextDueDateModal(false);
            setSelectedAsset(null);
          }}
          activityType="maintenance"
          activityName={categoryNames[selectedAsset.category]}
          assetName={selectedAsset.name}
          lastDate={new Date().toISOString().split('T')[0]}
          onSave={handleSaveNextDueDate}
        />
      )}
      
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
              </button>
              <div>
                <h1 className="text-zinc-900 dark:text-white text-xl lg:text-2xl">SafeFlow AI - Control de Activos</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Gestión y mantenimiento preventivo</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={onViewPlanner}
                className="bg-[#0055A4] hover:bg-blue-700 text-white hidden lg:flex"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendario
              </Button>
              <Button
                onClick={onViewAlerts}
                className="bg-[#EB5757] hover:bg-red-700 text-white relative"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                <span className="hidden lg:inline">Alertas</span>
                {(warningCount + criticalCount) > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {warningCount + criticalCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* KPIs Semáforo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-[#27AE60]/30">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#27AE60] text-sm font-medium">🟢 Al Día</span>
                <CheckCircle2 className="w-5 h-5 text-[#27AE60]" />
              </div>
              <div className="text-4xl text-[#27AE60] font-bold mb-1">{compliantCount}</div>
              <p className="text-xs text-zinc-700 dark:text-zinc-400">
                Equipos con mantención al día
              </p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border-2 border-[#F2C94C]/30">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#F2C94C] text-sm font-medium">🟡 Próxima (&lt;15d)</span>
                <Clock className="w-5 h-5 text-[#F2C94C]" />
              </div>
              <div className="text-4xl text-[#F2C94C] font-bold mb-1">{warningCount}</div>
              <p className="text-xs text-zinc-700 dark:text-zinc-400">
                Requieren atención pronto
              </p>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-2 border-[#EB5757]/30">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#EB5757] text-sm font-medium">🔴 Vencidos</span>
                <AlertTriangle className="w-5 h-5 text-[#EB5757]" />
              </div>
              <div className="text-4xl text-[#EB5757] font-bold mb-1">{criticalCount}</div>
              <p className="text-xs text-zinc-700 dark:text-zinc-400">
                ⚠️ Fuera de servicio
              </p>
            </div>
          </Card>
        </div>

        {/* Valor Agregado - Banner Informativo */}
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-900">
          <div className="p-5">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-zinc-900 dark:text-white font-semibold mb-1">Garantía de Cumplimiento Legal</h3>
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  💼 <strong>Responsabilidad Civil cubierta:</strong> El sistema avisa automáticamente al proveedor meses antes del vencimiento. 
                  📉 <strong>Ahorro en seguros:</strong> Muchas aseguradoras reducen primas con control digitalizado. 
                  📋 <strong>Auditoría instantánea:</strong> Exporta el historial completo en segundos para ISO 45001 o Mutualidades.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Barra de búsqueda y filtros */}
        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <div className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="Buscar por código, nombre o ubicación..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                />
              </div>
              <Button
                onClick={() => onScanQR?.('scan-mode')}
                className="bg-[#FF8C00] hover:bg-orange-600 text-white"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Escanear QR
              </Button>
              <Button
                variant="outline"
                className="border-zinc-300 dark:border-zinc-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Activo
              </Button>
            </div>

            {/* Filtros por categoría */}
            <div className="flex flex-wrap gap-2 mt-4">
              {categories.map((cat) => (
                <Button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  variant={selectedCategory === cat.key ? 'default' : 'outline'}
                  size="sm"
                  className={
                    selectedCategory === cat.key
                      ? 'bg-[#0055A4] hover:bg-blue-700 text-white'
                      : 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }
                >
                  {cat.key !== 'all' && cat.key in categoryIcons && (
                    <span className="mr-2">
                      {(() => {
                        const Icon = categoryIcons[cat.key as AssetCategory];
                        return <Icon className="w-4 h-4" />;
                      })()}
                    </span>
                  )}
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Lista de Activos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-zinc-900 dark:text-white text-lg flex items-center gap-2">
              <span className="w-1 h-6 bg-[#0055A4] rounded-full" />
              Inventario ({filteredAssets.length})
            </h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="border-zinc-300 dark:border-zinc-700">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button size="sm" variant="outline" className="border-zinc-300 dark:border-zinc-700">
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </Button>
            </div>
          </div>

          {filteredAssets.length === 0 ? (
            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <div className="p-12 text-center">
                <Package className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
                <p className="text-zinc-600 dark:text-zinc-400">No se encontraron activos</p>
              </div>
            </Card>
          ) : (
            filteredAssets.map((asset) => {
              const CategoryIcon = categoryIcons[asset.category];
              return (
                <Card 
                  key={asset.id}
                  className={`bg-white dark:bg-zinc-900 border-l-4 ${getStatusColor(asset.status)} border-zinc-200 dark:border-zinc-800 hover:shadow-xl transition-all`}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg">
                            <CategoryIcon className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                          </div>
                          <div>
                            <h3 className="text-zinc-900 dark:text-white font-semibold text-lg">{asset.name}</h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">{asset.code}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          {getStatusBadge(asset.status)}
                          <Badge className="bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-0">
                            {categoryNames[asset.category]}
                          </Badge>
                          {asset.certificationNumber && (
                            <Badge className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-0">
                              {asset.certificationNumber}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => onScanQR?.(asset.id)}
                        size="sm"
                        variant="outline"
                        className="border-zinc-300 dark:border-zinc-700"
                      >
                        <QrCode className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
                      <div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">📍 Ubicación</p>
                        <p className="text-sm text-zinc-900 dark:text-white">{asset.location}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">🏢 Proveedor</p>
                        <p className="text-sm text-zinc-900 dark:text-white">{asset.supplier}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">✅ Última Mantención</p>
                        <p className="text-sm text-zinc-900 dark:text-white">{asset.lastMaintenance}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">📅 Próxima Mantención</p>
                        <p className={`text-sm font-semibold ${
                          asset.status === 'critical' 
                            ? 'text-[#EB5757]' 
                            : asset.status === 'warning'
                            ? 'text-[#F2C94C]'
                            : 'text-[#27AE60]'
                        }`}>
                          {asset.nextMaintenance} 
                          {asset.daysUntilMaintenance < 0 
                            ? ` (Vencido hace ${Math.abs(asset.daysUntilMaintenance)} días)` 
                            : ` (En ${asset.daysUntilMaintenance} días)`
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-[#0055A4] hover:bg-blue-700 text-white"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ver Historial
                      </Button>
                      {asset.status === 'critical' && (
                        <Button
                          size="sm"
                          className="flex-1 bg-[#EB5757] hover:bg-red-700 text-white"
                          onClick={() => toast.error('Equipo fuera de servicio', {
                            description: 'Este activo está bloqueado hasta completar mantención.'
                          })}
                        >
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Fuera de Servicio
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}