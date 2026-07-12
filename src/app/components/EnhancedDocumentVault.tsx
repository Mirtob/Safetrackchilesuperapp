import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  FileText,
  Download,
  Search,
  FolderOpen,
  Shield,
  CheckCircle2,
  AlertCircle,
  WifiOff,
  Lock,
  Building2,
  Calendar,
  User,
  Filter,
  ChevronRight,
  Package,
  MessageSquare,
  ClipboardCheck,
  Loader2,
  X
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { fetchCompanyDocuments } from '@/app/services/safetyTalksService';
import { isSupabaseConfigured } from '@/app/services/supabase';

interface EnhancedDocumentVaultProps {
  onBack: () => void;
  isOnline: boolean;
  selectedCompany: string; // NUEVO: Recibir empresa seleccionada
  companyId?: string;
}

interface SignatureAvatar {
  name: string;
  role: 'preventionist' | 'manager' | 'worker';
  signed: boolean;
  color: string;
}

interface DocumentItem {
  id: string;
  name: string;
  company: string;
  year: number;
  category: 'EPP' | 'Charlas' | 'Inducciones' | 'Informes' | 'Inspecciones';
  type: 'PDF' | 'XLSX' | 'DOCX';
  size: string;
  date: string;
  workerRUT?: string;
  workerName?: string;
  signatures: SignatureAvatar[];
  offlineAvailable: boolean;
  legallyArchived: boolean;
}

// Documentos organizados por [Empresa] > [Año] > [Categoría]
const MOCK_DOCUMENTS: DocumentItem[] = [
  // Constructora Los Andes - 2026
  {
    id: 'CLA-2026-EPP-001',
    name: 'Entrega EPP - Casco y Arnés',
    company: 'Constructora Los Andes S.A.',
    year: 2026,
    category: 'EPP',
    type: 'PDF',
    size: '1.2 MB',
    date: '2026-01-26',
    workerRUT: '18.345.678-9',
    workerName: 'Pedro Rojas Muñoz',
    signatures: [
      { name: 'Juan Pérez', role: 'preventionist', signed: true, color: 'blue' },
      { name: 'María González', role: 'manager', signed: true, color: 'purple' },
      { name: 'Pedro Rojas', role: 'worker', signed: true, color: 'green' }
    ],
    offlineAvailable: true,
    legallyArchived: true
  },
  {
    id: 'CLA-2026-CHA-001',
    name: 'Charla 5 Minutos - Trabajo en Altura',
    company: 'Constructora Los Andes S.A.',
    year: 2026,
    category: 'Charlas',
    type: 'PDF',
    size: '0.8 MB',
    date: '2026-01-26',
    signatures: [
      { name: 'Juan Pérez', role: 'preventionist', signed: true, color: 'blue' },
      { name: 'María González', role: 'manager', signed: true, color: 'purple' }
    ],
    offlineAvailable: true,
    legallyArchived: true
  },
  {
    id: 'CLA-2026-INS-001',
    name: 'Inspección Planeada - Obra Maipú',
    company: 'Constructora Los Andes S.A.',
    year: 2026,
    category: 'Inspecciones',
    type: 'PDF',
    size: '2.4 MB',
    date: '2026-01-26',
    signatures: [
      { name: 'Juan Pérez', role: 'preventionist', signed: true, color: 'blue' },
      { name: 'María González', role: 'manager', signed: true, color: 'purple' }
    ],
    offlineAvailable: true,
    legallyArchived: true
  },
  {
    id: 'CLA-2026-INF-001',
    name: 'Informe Mensual - Enero 2026',
    company: 'Constructora Los Andes S.A.',
    year: 2026,
    category: 'Informes',
    type: 'PDF',
    size: '3.5 MB',
    date: '2026-01-25',
    signatures: [
      { name: 'Juan Pérez', role: 'preventionist', signed: true, color: 'blue' },
      { name: 'María González', role: 'manager', signed: true, color: 'purple' }
    ],
    offlineAvailable: true,
    legallyArchived: true
  },
  // Minera del Norte - 2026
  {
    id: 'MDN-2026-EPP-001',
    name: 'Entrega EPP - Protección Respiratoria',
    company: 'Minera del Norte Ltda.',
    year: 2026,
    category: 'EPP',
    type: 'PDF',
    size: '1.5 MB',
    date: '2026-01-24',
    workerRUT: '16.789.012-3',
    workerName: 'Carlos Silva Torres',
    signatures: [
      { name: 'Juan Pérez', role: 'preventionist', signed: true, color: 'blue' },
      { name: 'Roberto Díaz', role: 'manager', signed: true, color: 'purple' },
      { name: 'Carlos Silva', role: 'worker', signed: true, color: 'green' }
    ],
    offlineAvailable: true,
    legallyArchived: true
  },
  {
    id: 'MDN-2026-INS-001',
    name: 'Inspección de Seguridad - Faena Antofagasta',
    company: 'Minera del Norte Ltda.',
    year: 2026,
    category: 'Inspecciones',
    type: 'PDF',
    size: '2.8 MB',
    date: '2026-01-23',
    signatures: [
      { name: 'Juan Pérez', role: 'preventionist', signed: true, color: 'blue' },
      { name: 'Roberto Díaz', role: 'manager', signed: false, color: 'purple' }
    ],
    offlineAvailable: true,
    legallyArchived: false
  },
  // Constructora Los Andes - 2025
  {
    id: 'CLA-2025-EPP-045',
    name: 'Entrega EPP - Guantes y Gafas',
    company: 'Constructora Los Andes S.A.',
    year: 2025,
    category: 'EPP',
    type: 'PDF',
    size: '1.1 MB',
    date: '2025-12-20',
    workerRUT: '17.234.567-8',
    workerName: 'Ana Martínez López',
    signatures: [
      { name: 'Juan Pérez', role: 'preventionist', signed: true, color: 'blue' },
      { name: 'María González', role: 'manager', signed: true, color: 'purple' },
      { name: 'Ana Martínez', role: 'worker', signed: true, color: 'green' }
    ],
    offlineAvailable: true,
    legallyArchived: true
  }
];

type ViewMode = 'companies' | 'years' | 'categories' | 'documents';

const mapTalkToDocumentItem = (talk: Awaited<ReturnType<typeof fetchCompanyDocuments>>[number], companyName: string): DocumentItem => ({
  id: talk.id,
  name: talk.title,
  company: companyName,
  year: new Date(talk.date).getFullYear(),
  category: talk.category,
  type: 'PDF',
  size: '—',
  date: talk.date,
  signatures: [
    { name: 'Prevencionista', role: 'preventionist', signed: true, color: 'blue' },
    { name: 'Gerente', role: 'manager', signed: talk.managerApprovalStatus === 'approved', color: 'purple' },
    ...(talk.signaturesCount > 0
      ? [{ name: `${talk.signaturesCount} trabajador(es)`, role: 'worker' as const, signed: true, color: 'green' }]
      : []),
  ],
  offlineAvailable: true,
  legallyArchived: talk.managerApprovalStatus === 'approved',
});

export function EnhancedDocumentVault({ onBack, isOnline, selectedCompany, companyId }: EnhancedDocumentVaultProps) {
  // NUEVO: Iniciar directamente en vista de años ya que la empresa viene del prop
  const [viewMode, setViewMode] = useState<ViewMode>('years');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRUT, setFilterRUT] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadDocuments = async () => {
      setIsLoadingDocuments(true);
      if (!isSupabaseConfigured || !companyId) {
        if (!cancelled) setDocuments(MOCK_DOCUMENTS);
        if (!cancelled) setIsLoadingDocuments(false);
        return;
      }
      try {
        const talks = await fetchCompanyDocuments(companyId);
        if (!cancelled) setDocuments(talks.map(t => mapTalkToDocumentItem(t, selectedCompany)));
      } catch (err: any) {
        console.warn('No se pudo cargar documentos desde Supabase:', err.message);
        if (!cancelled) setDocuments(MOCK_DOCUMENTS);
      } finally {
        if (!cancelled) setIsLoadingDocuments(false);
      }
    };
    loadDocuments();
    return () => { cancelled = true; };
  }, [companyId, selectedCompany]);

  // Navegación - La empresa ya no se puede cambiar internamente
  const years = Array.from(new Set(documents.filter(d => d.company === selectedCompany).map(d => d.year))).sort((a, b) => b - a);
  const categories = selectedYear
    ? Array.from(new Set(documents.filter(d => d.company === selectedCompany && d.year === selectedYear).map(d => d.category)))
    : [];

  // Filtrar documentos
  const filteredDocuments = documents.filter(doc => {
    let match = true;

    // Filtros de navegación
    if (selectedCompany && doc.company !== selectedCompany) match = false;
    if (selectedYear && doc.year !== selectedYear) match = false;
    if (selectedCategory && doc.category !== selectedCategory) match = false;

    // Filtros de búsqueda
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) match = false;
    if (filterRUT && doc.workerRUT && !doc.workerRUT.includes(filterRUT)) match = false;
    if (filterDate && !doc.date.includes(filterDate)) match = false;
    if (filterType && doc.category !== filterType) match = false;

    return match;
  });

  // Estadísticas - Filtradas solo para la empresa seleccionada
  const companyDocuments = documents.filter(d => d.company === selectedCompany);
  const totalDocuments = companyDocuments.length;
  const legallyArchived = companyDocuments.filter(d => d.legallyArchived).length;
  const pendingSignatures = companyDocuments.filter(d => !d.legallyArchived).length;

  const handleNavigateToYear = (year: number) => {
    setSelectedYear(year);
    setViewMode('categories');
  };

  const handleNavigateToCategory = (category: string) => {
    setSelectedCategory(category);
    setViewMode('documents');
  };

  const handleBack = () => {
    if (viewMode === 'documents') {
      setSelectedCategory(null);
      setViewMode('categories');
    } else if (viewMode === 'categories') {
      setSelectedYear(null);
      setViewMode('years');
    } else {
      // Si estamos en years, volver al menu principal
      onBack();
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterRUT('');
    setFilterDate('');
    setFilterType('');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'EPP': return Package;
      case 'Charlas': return MessageSquare;
      case 'Inspecciones': return ClipboardCheck;
      case 'Informes': return FileText;
      default: return FileText;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'EPP': return 'blue';
      case 'Charlas': return 'orange';
      case 'Inspecciones': return 'purple';
      case 'Informes': return 'green';
      default: return 'slate';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-900 transition-colors pb-20 lg:pb-6">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-slate-900 dark:text-white text-xl lg:text-2xl">Bóveda Documental Inteligente</h1>
                  {!isOnline && (
                    <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-0">
                      <WifiOff className="w-3 h-3 mr-1" />
                      Offline
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-zinc-400">
                  {selectedCompany && `${selectedCompany}`}
                  {selectedYear && ` • ${selectedYear}`}
                  {selectedCategory && ` • ${selectedCategory}`}
                </p>
              </div>
            </div>
          </div>

          {/* Breadcrumb - NUEVO: Simplificado sin selector de empresa */}
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
            <span className="text-slate-900 dark:text-white font-medium">{selectedCompany}</span>
            {selectedYear && (
              <>
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <button 
                  onClick={() => { setSelectedCategory(null); setViewMode('categories'); }} 
                  className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {selectedYear}
                </button>
              </>
            )}
            {selectedCategory && (
              <>
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <span className="text-slate-900 dark:text-white">{selectedCategory}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-700 dark:text-blue-400 text-sm">Total Documentos</span>
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl text-blue-900 dark:text-blue-300 mb-1">{totalDocuments}</div>
              <Badge className="bg-blue-600/20 text-blue-700 dark:text-blue-400 border-0 text-xs">
                {selectedCompany}
              </Badge>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-700 dark:text-green-400 text-sm">Archivados Legalmente</span>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-3xl text-green-900 dark:text-green-300 mb-1">{legallyArchived}</div>
              <Badge className="bg-green-600/20 text-green-700 dark:text-green-400 border-0 text-xs">
                {((legallyArchived / totalDocuments) * 100).toFixed(0)}% completados
              </Badge>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800">
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-700 dark:text-amber-400 text-sm">Pendientes de Firma</span>
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl text-amber-900 dark:text-amber-300 mb-1">{pendingSignatures}</div>
              <Badge className="bg-amber-600/20 text-amber-700 dark:text-amber-400 border-0 text-xs">
                Requieren atención
              </Badge>
            </div>
          </Card>
        </div>

        {/* Búsqueda y Filtros */}
        <Card className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
          <div className="p-5 space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar documentos por nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-700"
                />
              </div>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className={`${showFilters ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' : ''}`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros Pro
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-zinc-700">
                <Input
                  type="text"
                  placeholder="Filtrar por RUT trabajador"
                  value={filterRUT}
                  onChange={(e) => setFilterRUT(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-700"
                />
                <Input
                  type="date"
                  placeholder="Filtrar por fecha"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-700"
                />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white text-sm"
                >
                  <option value="">Todos los tipos</option>
                  <option value="EPP">EPP</option>
                  <option value="Charlas">Charlas</option>
                  <option value="Inspecciones">Inspecciones</option>
                  <option value="Informes">Informes</option>
                </select>
                {(filterRUT || filterDate || filterType) && (
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    size="sm"
                    className="md:col-span-3"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpiar Filtros
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>

        {isLoadingDocuments && (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Cargando documentos...
          </div>
        )}

        {/* Vista de Empresas */}
        {!isLoadingDocuments && viewMode === 'companies' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => {
              const companyDocs = documents.filter(d => d.company === company);
              const Icon = Building2;
              return (
                <Card
                  key={company}
                  onClick={() => handleNavigateToCompany(company)}
                  className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-blue-600 dark:hover:border-blue-600 cursor-pointer hover:shadow-lg transition-all interactive"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                    <h3 className="text-slate-900 dark:text-white font-semibold mb-2">{company}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-400">
                      <FileText className="w-4 h-4" />
                      <span>{companyDocs.length} documentos</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Vista de Años */}
        {!isLoadingDocuments && viewMode === 'years' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {years.map((year) => {
              const yearDocs = documents.filter(d => d.company === selectedCompany && d.year === year);
              return (
                <Card
                  key={year}
                  onClick={() => handleNavigateToYear(year)}
                  className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-blue-600 dark:hover:border-blue-600 cursor-pointer hover:shadow-lg transition-all interactive"
                >
                  <div className="p-5 text-center">
                    <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="text-slate-900 dark:text-white text-2xl font-bold mb-2">{year}</h3>
                    <Badge className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-0 text-xs">
                      {yearDocs.length} documentos
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Vista de Categorías */}
        {!isLoadingDocuments && viewMode === 'categories' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => {
              const categoryDocs = documents.filter(d => 
                d.company === selectedCompany && 
                d.year === selectedYear && 
                d.category === category
              );
              const Icon = getCategoryIcon(category);
              const color = getCategoryColor(category);
              return (
                <Card
                  key={category}
                  onClick={() => handleNavigateToCategory(category)}
                  className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 hover:border-blue-600 dark:hover:border-blue-600 cursor-pointer hover:shadow-lg transition-all interactive"
                >
                  <div className="p-5">
                    <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center ${
                      color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' :
                      color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/20' :
                      color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/20' :
                      'bg-green-100 dark:bg-green-900/20'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        color === 'blue' ? 'text-blue-600' :
                        color === 'orange' ? 'text-[#FF8C00]' :
                        color === 'purple' ? 'text-purple-600' :
                        'text-green-600'
                      }`} />
                    </div>
                    <h3 className="text-slate-900 dark:text-white font-semibold mb-2">{category}</h3>
                    <Badge className="bg-slate-100 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 border-0 text-xs">
                      {categoryDocs.length} documentos
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Vista de Documentos */}
        {!isLoadingDocuments && viewMode === 'documents' && (
          <Card className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
            <div className="divide-y divide-slate-200 dark:divide-zinc-700">
              {filteredDocuments.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="w-12 h-12 text-slate-300 dark:text-zinc-600 mx-auto mb-2" />
                  <p className="text-slate-600 dark:text-zinc-400">
                    No se encontraron documentos
                  </p>
                </div>
              ) : (
                filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-slate-900 dark:text-white font-medium">{doc.name}</h4>
                            {doc.legallyArchived && (
                              <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-0 text-xs flex-shrink-0">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Archivado
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-zinc-400 mb-2">
                            <span>{doc.type}</span>
                            <span>•</span>
                            <span>{doc.size}</span>
                            <span>•</span>
                            <span>{doc.date}</span>
                            {doc.workerRUT && (
                              <>
                                <span>•</span>
                                <span>{doc.workerName} (RUT: {doc.workerRUT})</span>
                              </>
                            )}
                          </div>
                          
                          {/* Avatares de Firmas */}
                          <div className="flex items-center gap-1">
                            {doc.signatures.map((sig, index) => (
                              <div
                                key={index}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                                  sig.signed
                                    ? sig.color === 'blue' ? 'bg-blue-500 text-white' :
                                      sig.color === 'purple' ? 'bg-purple-500 text-white' :
                                      'bg-green-500 text-white'
                                    : 'bg-slate-300 dark:bg-zinc-600 text-slate-600 dark:text-zinc-400'
                                }`}
                                title={`${sig.name} (${sig.role === 'preventionist' ? 'Prevencionista' : sig.role === 'manager' ? 'Gerente' : 'Trabajador'})${sig.signed ? ' - Firmado' : ' - Pendiente'}`}
                              >
                                {sig.signed ? <CheckCircle2 className="w-4 h-4" /> : sig.name.charAt(0)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}