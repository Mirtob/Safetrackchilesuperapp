import { useState, useEffect } from 'react';
import { CompanySelectorEnhanced } from '@/app/components/CompanySelectorEnhanced';
import { CompanySelector } from '@/app/components/CompanySelector';
import { CompanySelectorWithMap } from '@/app/components/CompanySelectorWithMap';
import { LocationArrivalNotification } from '@/app/components/LocationArrivalNotification';
import { BranchSelector } from '@/app/components/BranchSelector';
import { ProfileSelector } from '@/app/components/ProfileSelector';
import { ProfessionalPortfolio } from '@/app/components/professional/ProfessionalPortfolio';
import { StrategicPanel } from '@/app/components/StrategicPanel';
import { TriadicDashboard } from '@/app/components/TriadicDashboard';
import { ActionPlanTracker } from '@/app/components/ActionPlanTracker';
import { EvidenceCompare } from '@/app/components/EvidenceCompare';
import { SmartForm } from '@/app/components/SmartForm';
import { InspectionFormEnhanced } from '@/app/components/InspectionFormEnhanced';
import { IncidentReportFormEnhanced } from '@/app/components/IncidentReportFormEnhanced';
import { IncidentFollowUp } from '@/app/components/IncidentFollowUp';
import { ComplianceDashboard } from '@/app/components/ComplianceDashboard';
import { TimelineView } from '@/app/components/TimelineView';
import { InspectionModeEnhanced } from '@/app/components/InspectionModeEnhanced';
import { StatisticsModule } from '@/app/components/StatisticsModule';
import { CausalAnalysis } from '@/app/components/CausalAnalysis';
import { CalendarView } from '@/app/components/CalendarView';
import { RouteOptimizationScreen } from '@/app/components/RouteOptimizationScreen';
import { DocumentVault } from '@/app/components/DocumentVault';
import { RemoteSignature } from '@/app/components/RemoteSignature';
import { ManagerSignaturePortal } from '@/app/components/ManagerSignaturePortal';
import { EnhancedDocumentVault } from '@/app/components/EnhancedDocumentVault';
import { WorkerAndAssetManagement } from '@/app/components/WorkerAndAssetManagement';
import { TalkAndDelivery } from '@/app/components/TalkAndDelivery';
import { SafetyKitCRUD } from '@/app/components/SafetyKitCRUD';
import { InspectionConfigCRUD } from '@/app/components/InspectionConfigCRUD';
import { AssetInventory } from '@/app/components/AssetInventory';
import { MaintenancePlanner } from '@/app/components/MaintenancePlanner';
import { QRInspection } from '@/app/components/QRInspection';
import { UnifiedAlertCenter } from '@/app/components/UnifiedAlertCenter';
import { ExecutiveDashboard } from '@/app/components/ExecutiveDashboard';
import { FinancialImpact } from '@/app/components/FinancialImpact';
import { BranchRiskMap } from '@/app/components/BranchRiskMap';
import { APIIntegration } from '@/app/components/APIIntegration';
import { SecurityCenter } from '@/app/components/SecurityCenter';
import { DocumentDeliverySystem } from '@/app/components/DocumentDeliverySystem';
import { MonthlyWorkPlanComplete } from '@/app/components/MonthlyWorkPlanComplete';
import { AccidentMode } from '@/app/components/AccidentMode';
import { ContractorPortal } from '@/app/components/ContractorPortal';
import { QRCodeManager } from '@/app/components/QRCodeManager';
import { QREmergencyAccess } from '@/app/components/QREmergencyAccess';
import { ColorSystemDemo } from '@/app/components/ColorSystemDemo';
import { CriticalAccidentFAB } from '@/app/components/CriticalAccidentFAB';
import { IntelligentSyncIndicator } from '@/app/components/IntelligentSyncIndicator';
import { DocumentWorkflowDemo } from '@/app/components/DocumentWorkflowDemo';
import { TrainingHistory } from '@/app/components/TrainingHistory';
import { createInspection } from '@/app/services/inspectionsService';
import { createIncident } from '@/app/services/incidentsService';
import { isSupabaseConfigured } from '@/app/services/supabase';
import { useTheme } from '@/app/components/ThemeProvider';
import { useOfflineStorage } from '@/app/components/OfflineManager';
import { useCompany, Company, Branch } from '@/app/context/CompanyContext';
import { useCompanies } from '@/app/hooks/useCompanies';
import { useLocationDetection } from '@/app/hooks/useLocationDetection';
import { generatePDF, downloadPDF, shareViaWhatsApp } from '@/app/components/PDFGenerator';
import { LayoutGrid, BarChart3, Menu, X, Sun, Moon, Download, TrendingUp, Palette, Package, ClipboardList, MapPin, Navigation, FileText, LogOut } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';
import type { UserData } from '@/app/App';

// Mock data estático para evitar re-cálculos en cada render
const INITIAL_MOCK_PENDING_ITEMS = [
  {
    id: '1',
    type: 'accident' as const,
    title: 'Accidente Laboral - Juan Pérez',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    priority: 'critical' as const,
    size: 2500000
  },
  {
    id: '2',
    type: 'inspection' as const,
    title: 'Inspección Sector A - Planta 3',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    priority: 'high' as const,
    size: 1200000
  },
  {
    id: '3',
    type: 'talk' as const,
    title: 'Charla de Seguridad - Turno Mañana',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 'medium' as const,
    size: 800000
  }
];

type View = 
  | 'company-selector' 
  | 'branch-selector'
  | 'profile-selector'
  | 'client-portfolio'
  | 'action-plan-tracker'
  | 'evidence-compare'
  | 'triadic-dashboard'
  | 'form'
  | 'inspection-form'
  | 'dashboard' 
  | 'timeline'
  | 'inspection-mode'
  | 'statistics'
  | 'causal-analysis'
  | 'calendar'
  | 'route-optimizer'
  | 'document-vault'
  | 'remote-signature'
  | 'manager-portal'
  | 'enhanced-vault'
  | 'mass-signature'
  | 'worker-management'
  | 'incident-report-form'
  | 'talk-delivery-form'
  | 'field-action-center'
  | 'training-history';

type FormType = 'inspection' | 'epp' | 'incident' | 'talk';
type TalkDeliveryType = 'talk' | 'epp' | 'induction';

interface AppContentProps {
  userData: UserData | null;
  onLogout: () => void;
}

export function AppContent({ userData, onLogout }: AppContentProps) {
  const [currentView, setCurrentView] = useState<View>('company-selector');
  const [previousView, setPreviousView] = useState<View>('triadic-dashboard'); // Vista anterior para navegación
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<{ id: string; name: string } | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const { companies, isLoading: companiesLoading, addCompany, addBranch } = useCompanies();
  const selectedCompanyObj = companies.find(c => c.id === selectedCompany) || null;
  const [currentFormType, setCurrentFormType] = useState<FormType>('inspection');
  const [currentTalkDeliveryType, setCurrentTalkDeliveryType] = useState<TalkDeliveryType>('talk');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showDesktopSidebar, setShowDesktopSidebar] = useState(false); // Oculto por defecto
  
  // Estado para documentos guardados
  const [savedDocuments, setSavedDocuments] = useState<any[]>([]);
  
  const { theme, toggleTheme } = useTheme();
  const { isOnline, pendingItems, saveFormOffline } = useOfflineStorage();

  // Mock data para testing del IntelligentSyncIndicator - Ahora como estado
  const [mockPendingItems, setMockPendingItems] = useState(INITIAL_MOCK_PENDING_ITEMS);

  // Handler para sincronizacin que vacía los items
  const handleSync = () => {
    // Vaciar los items pendientes después de sincronizar
    setMockPendingItems([]);
  };

  // Handler para ver detalles de item pendiente
  const handleViewPendingItemDetails = (item: any) => {
    toast.info('Ver detalles de documento', {
      description: item.title
    });
  };

  // Función helper para navegar guardando el historial
  const navigateToView = (newView: View, saveHistory: boolean = true) => {
    if (saveHistory) {
      setPreviousView(currentView);
    }
    setCurrentView(newView);
  };

  // Función para volver a la vista anterior
  const goBack = () => {
    setCurrentView(previousView);
  };

  const handleSelectCompany = (companyId: string) => {
    setSelectedCompany(companyId);
    navigateToView('triadic-dashboard', false); // No guardar historial en selección inicial
    toast.success('Empresa seleccionada correctamente');
  };

  const handleSelectBranch = (branch: { id: string; name: string }) => {
    setSelectedBranch(branch);
    navigateToView('triadic-dashboard', false); // No guardar historial en selección inicial
    toast.success('Sucursal seleccionada correctamente');
  };

  const handleStartForm = (type: FormType) => {
    setCurrentFormType(type);
    console.log('handleStartForm called with type:', type);
    // Si es EPP, usar el nuevo formulario mejorado
    if (type === 'epp') {
      console.log('Navigating to epp-delivery');
      setCurrentView('epp-delivery');
      return;
    }
    // Si es charla, usar el componente con firma masiva  
    else if (type === 'talk') {
      setCurrentTalkDeliveryType('talk');
      setCurrentView('talk-and-delivery');
      return;
    } else {
      setCurrentView('form');
    }
  };

  const handleFormSubmit = async (data: any) => {
    console.log('📝 handleFormSubmit ejecutado con data:', data);

    // Guardar el documento en el estado (historial local de la sesión)
    const newDocument = {
      id: `doc-${Date.now()}`,
      type: currentFormType,
      title: data.assetName || data.title || `Documento ${currentFormType}`,
      data: data,
      timestamp: new Date().toISOString(),
      status: 'sent',
      sentTo: data.workers || []
    };
    setSavedDocuments(prev => [newDocument, ...prev]);

    // Save offline if no connection
    if (!isOnline) {
      await saveFormOffline(data);
      toast.success('✅ Documento guardado en modo offline', {
        description: 'Se sincronizará automáticamente cuando haya conexión'
      });
      setCurrentView('triadic-dashboard');
      return;
    }

    // Persistir en Supabase cuando corresponda al tipo de formulario
    if (selectedCompany && isSupabaseConfigured) {
      try {
        if (currentFormType === 'inspection') {
          await createInspection({
            companyId: selectedCompany,
            branchId: selectedBranch?.id,
            sector: data.sectorName || data.sector,
            assetName: data.assetName,
            description: data.description,
            location: data.location,
            photos: data.photos || [],
            signatureData: data.signature,
          });
        } else if (currentFormType === 'incident') {
          await createIncident({
            companyId: selectedCompany,
            branchId: selectedBranch?.id,
            incidentType: data.incidentType,
            severity: data.severity,
            title: data.title,
            description: data.description,
            sector: data.sectorName || data.sector,
            location: data.location,
            affectedWorkers: (data.affectedWorkersDetails || []).map((w: any) => ({
              id: w.id,
              name: w.name,
              rut: w.rut,
              position: w.position,
              department: w.department,
            })),
            immediateActions: data.immediateActions,
            photos: data.photos || [],
            signatureData: data.signature,
          });
        }
      } catch (err: any) {
        toast.error('Error al guardar en la base de datos', { description: err.message });
        return;
      }
    }

    toast.success('✅ Documento enviado exitosamente', {
      description: 'El documento ha sido guardado en la bóveda y enviado a los destinatarios',
      duration: 3000
    });

    setCurrentView('triadic-dashboard');
  };

  const renderView = () => {
    switch (currentView) {
      case 'company-selector':
        return (
          <CompanySelectorEnhanced
            companies={companies}
            isLoading={companiesLoading}
            onSelectCompany={handleSelectCompany}
            onCreateCompany={addCompany}
            onOpenProfessionalPortfolio={() => setCurrentView('professional-portfolio')}
            onLogout={onLogout}
          />
        );
      
      case 'professional-portfolio':
        return (
          <ProfessionalPortfolio
            onBack={() => setCurrentView('company-selector')}
          />
        );
      
      case 'branch-selector':
        return (
          <BranchSelector
            companyName={selectedCompanyObj?.name || ''}
            branches={selectedCompanyObj?.branches || []}
            onSelectBranch={(branchId: string, branchName: string) => handleSelectBranch({ id: branchId, name: branchName })}
            onCreateBranch={selectedCompany ? (branch) => addBranch(selectedCompany, branch) : undefined}
            onBack={() => setCurrentView('company-selector')}
          />
        );
      
      case 'profile-selector':
        return (
          <ProfileSelector 
            onSelectProfile={(profile) => {
              if (profile === 'consulting') {
                navigateToView('professional-portfolio');
              } else {
                navigateToView('triadic-dashboard');
              }
            }}
          />
        );
      
      case 'client-portfolio':
        return (
          <ProfessionalPortfolio 
            onBack={goBack}
            onSelectClient={(clientId) => {
              toast.success(`Cliente seleccionado: ${clientId}`);
              // Al seleccionar un cliente, ir al dashboard triádico con el contexto del cliente
              navigateToView('triadic-dashboard');
            }}
          />
        );
      
      case 'action-plan-tracker':
        return (
          <ActionPlanTracker 
            onBack={goBack}
          />
        );
      
      case 'evidence-compare':
        return (
          <EvidenceCompare 
            onBack={goBack}
          />
        );
      
      case 'triadic-dashboard':
        return (
          <TriadicDashboard
            onBack={() => setCurrentView('company-selector')}
            onNavigate={(view: string, actionId?: string) => {
              // Si es 'form', configurar para incidente
              if (view === 'form') {
                setCurrentFormType('incident');
              }
              // Si es talk-and-delivery, determinar el tipo según el actionId
              if (view === 'talk-and-delivery') {
                if (actionId === 'talk') {
                  setCurrentTalkDeliveryType('talk');
                } else if (actionId === 'epp') {
                  setCurrentTalkDeliveryType('epp');
                } else {
                  // Default a talk si no se especifica
                  setCurrentTalkDeliveryType('talk');
                }
              }
              // Si es incident-followup con un id específico, recordarlo para abrir ese incidente
              if (view === 'incident-followup') {
                setSelectedIncidentId(actionId || null);
              }
              navigateToView(view as View); // Usar navigateToView para guardar historial
            }}
            isOnline={isOnline}
            pendingItems={pendingItems}
            companyId={selectedCompany || undefined}
          />
        );

      case 'form':
        // Usar formulario mejorado para inspecciones
        if (currentFormType === 'inspection') {
          return (
            <InspectionFormEnhanced
              onBack={goBack}
              onSubmit={handleFormSubmit}
            />
          );
        }
        
        // Usar formulario mejorado para incidentes
        if (currentFormType === 'incident') {
          return (
            <IncidentReportFormEnhanced
              onBack={goBack}
              onSubmit={(data) => {
                handleFormSubmit(data);
                goBack();
              }}
            />
          );
        }
        
        // Usar SmartForm para otros tipos (talk, epp)
        return (
          <SmartForm
            formType={currentFormType}
            onBack={goBack}
            onSubmit={handleFormSubmit}
          />
        );
      
      case 'dashboard':
        return (
          <ComplianceDashboard
            onBack={goBack}
            onNavigateToDocuments={() => navigateToView('enhanced-vault')}
            onNavigateToCalendar={() => navigateToView('monthly-plan')}
            onNavigateToInspections={() => { setCurrentFormType('inspection'); navigateToView('inspection-form'); }}
            onNavigateToTraining={() => navigateToView('talk-and-delivery')}
          />
        );
      
      case 'timeline':
        return (
          <TimelineView
            onBack={goBack}
          />
        );
      
      case 'inspection-form':
        return (
          <InspectionFormEnhanced
            onBack={goBack}
            onSubmit={(data) => {
              console.log('📝 Inspección recibida desde inspection-form:', data);
              handleFormSubmit(data);
            }}
          />
        );
      
      case 'inspection-mode':
        return (
          <InspectionModeEnhanced
            onBack={goBack}
            companyId={selectedCompany || undefined}
          />
        );
      
      case 'statistics':
        return (
          <StatisticsModule
            onBack={goBack}
            onViewCausalAnalysis={() => navigateToView('causal-analysis')}
            onViewInspections={(category: string) => {
              toast.info('Abriendo inspecciones filtradas', {
                description: `Categoría: ${category}`
              });
              navigateToView('inspection-form');
            }}
          />
        );
      
      case 'causal-analysis':
        return (
          <CausalAnalysis
            onBack={goBack}
          />
        );
      
      case 'calendar':
        return (
          <CalendarView
            onBack={goBack}
            onViewRouteOptimizer={() => navigateToView('route-optimizer')}
            companyId={selectedCompany || undefined}
            companyName={selectedCompanyObj?.name}
            branchId={selectedBranch?.id}
          />
        );
      
      case 'route-optimizer':
        return (
          <RouteOptimizationScreen
            onBack={goBack}
          />
        );
      
      case 'document-vault':
        return (
          <DocumentVault
            onBack={goBack}
            isOnline={isOnline}
          />
        );
      
      case 'remote-signature':
        return (
          <RemoteSignature
            onBack={goBack}
            companyId={selectedCompany || undefined}
            companyName={selectedCompanyObj?.name}
            onOpenDocument={(docId) => {
              setSelectedDocumentId(docId);
              navigateToView('manager-portal');
            }}
          />
        );

      case 'manager-portal':
        return (
          <ManagerSignaturePortal
            onBack={goBack}
            documentId={selectedDocumentId || undefined}
            companyName={selectedCompanyObj?.name}
          />
        );
      
      case 'enhanced-vault':
        return (
          <EnhancedDocumentVault
            onBack={goBack}
            isOnline={isOnline}
            selectedCompany={selectedCompanyObj?.name || ''}
            companyId={selectedCompany || undefined}
          />
        );

      case 'mass-signature':
        return (
          <ManagerSignaturePortal
            onBack={goBack}
          />
        );

      case 'worker-management':
        return (
          <WorkerAndAssetManagement
            onBack={goBack}
            companyId={selectedCompany || undefined}
            companyName={selectedCompanyObj?.name}
          />
        );

      case 'talk-and-delivery':
        return (
          <TalkAndDelivery
            onBack={goBack}
            type={currentTalkDeliveryType}
            companyId={selectedCompany || undefined}
            companyName={selectedCompanyObj?.name}
            branchId={selectedBranch?.id}
          />
        );

      case 'safety-kits':
        return (
          <SafetyKitCRUD
            onBack={goBack}
            selectedCompanyId={selectedCompany || undefined}
            selectedCompanyName={selectedCompanyObj?.name || ''}
          />
        );

      case 'inspection-config':
        return (
          <InspectionConfigCRUD
            onBack={goBack}
            selectedCompanyId={selectedCompany || undefined}
            selectedCompanyName={selectedCompanyObj?.name || ''}
          />
        );
      
      case 'asset-inventory':
        return (
          <AssetInventory
            onBack={goBack}
            onViewPlanner={() => navigateToView('maintenance-planner')}
            onScanQR={(assetId) => {
              setSelectedAssetId(assetId === 'scan-mode' ? null : assetId);
              navigateToView('qr-inspection');
            }}
            onViewAlerts={() => navigateToView('alert-center')}
          />
        );

      case 'maintenance-planner':
        return (
          <MaintenancePlanner
            onBack={goBack}
          />
        );

      case 'qr-inspection':
        return (
          <QRInspection
            onBack={goBack}
            assetId={selectedAssetId || undefined}
            companyId={selectedCompany || undefined}
            branchId={selectedBranch?.id}
          />
        );
      
      case 'alert-center':
        return (
          <UnifiedAlertCenter
            onBack={goBack}
            onScheduleMaintenance={(assetId) => {
              toast.info('Abriendo calendario para mantenimiento', {
                description: `Asset ID: ${assetId}`
              });
              navigateToView('maintenance-planner');
            }}
            onScheduleTraining={(workerId, trainingType) => {
              toast.info('Abriendo calendario para capacitación', {
                description: `Trabajador ID: ${workerId} - ${trainingType}`
              });
              navigateToView('calendar');
            }}
            onViewWorker={(workerId) => {
              toast.info('Abriendo perfil de trabajador', {
                description: `Trabajador ID: ${workerId}`
              });
              navigateToView('worker-management');
            }}
            onViewAsset={(assetId) => {
              toast.info('Abriendo detalles del activo', {
                description: `Activo ID: ${assetId}`
              });
              navigateToView('asset-inventory');
            }}
          />
        );
      
      case 'executive-dashboard':
        return (
          <ExecutiveDashboard
            onBack={goBack}
            onViewFinancialImpact={() => navigateToView('financial-impact')}
            onViewBranchRisk={() => navigateToView('branch-risk')}
            onViewAPIConfig={() => navigateToView('api-integration')}
            companyId={selectedCompany || undefined}
          />
        );
      
      case 'financial-impact':
        return (
          <FinancialImpact
            onBack={goBack}
          />
        );
      
      case 'branch-risk':
        return (
          <BranchRiskMap
            onBack={goBack}
          />
        );
      
      case 'api-integration':
        return (
          <APIIntegration
            onBack={goBack}
          />
        );
      
      case 'security-center':
        return (
          <SecurityCenter
            onBack={goBack}
          />
        );
      
      case 'document-delivery':
        return (
          <DocumentDeliverySystem
            onBack={goBack}
          />
        );
      
      case 'monthly-plan':
        return (
          <MonthlyWorkPlanComplete
            onBack={goBack}
          />
        );
      
      case 'accident-mode':
        return (
          <AccidentMode
            onBack={goBack}
          />
        );
      
      case 'contractor-portal':
        return (
          <ContractorPortal
            onBack={goBack}
          />
        );
      
      case 'qr-manager':
        return (
          <QRCodeManager
            onBack={goBack}
            companies={companies.map(c => ({ id: c.id, name: c.name }))}
          />
        );
      
      case 'qr-emergency-access':
        // Simular token desde URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const emergencyToken = urlParams.get('emergency_access') || 'QR-EMERGENCY-CONST001-2024';
        
        return (
          <QREmergencyAccess
            token={emergencyToken}
            onComplete={() => setCurrentView('company-selector')}
          />
        );
      
      case 'color-system-demo':
        return (
          <ColorSystemDemo
            onBack={goBack}
          />
        );
      
      case 'strategic-panel':
        return (
          <StrategicPanel
            onBack={goBack}
          />
        );
      
      case 'incident-followup':
        return (
          <IncidentFollowUp
            onBack={goBack}
            companyId={selectedCompany || undefined}
            initialIncidentId={selectedIncidentId || undefined}
          />
        );
      
      case 'document-workflow-demo':
        return (
          <DocumentWorkflowDemo
            onBack={goBack}
          />
        );
      
      case 'training-history':
        return (
          <TrainingHistory
            onBack={goBack}
            companies={companies.map(c => ({
              id: c.id,
              name: c.name,
              branches: c.branches.map(b => ({ id: b.id, name: b.name })),
            }))}
          />
        );
      
      default:
        return (
          <CompanySelectorEnhanced
            companies={companies}
            isLoading={companiesLoading}
            onSelectCompany={handleSelectCompany}
            onCreateCompany={addCompany}
            onOpenProfessionalPortfolio={() => setCurrentView('professional-portfolio')}
            onLogout={onLogout}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-900 transition-colors">
      {renderView()}

      {/* Theme Toggle - Fixed top right - Visible en todas las vistas excepto company-selector */}
      {currentView !== 'company-selector' && (
        <button
          onClick={toggleTheme}
          className="fixed top-4 right-4 z-50 p-2.5 lg:p-3 rounded-full lg:rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all shadow-lg"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 lg:w-5 lg:h-5 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
          )}
        </button>
      )}

      {/* Sidebar Toggle Button - Desktop only - Solo cuando no estamos en company-selector */}
      {selectedCompany && currentView !== 'company-selector' && (
        <button
          onClick={() => setShowDesktopSidebar(!showDesktopSidebar)}
          className="hidden lg:flex fixed top-4 left-4 z-50 p-3 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all shadow-lg"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Pending Sync Indicator - Solo visible cuando hay items pendientes */}
      {pendingItems > 0 && currentView !== 'company-selector' && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-500 dark:border-yellow-600 text-yellow-700 dark:text-yellow-400 px-3 py-2 rounded-full lg:rounded-lg text-xs lg:text-sm flex items-center gap-2 shadow-lg max-w-[90vw] lg:max-w-none">
          <Download className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
          <span className="hidden sm:inline truncate">{pendingItems} pendientes de sincronizar</span>
          <span className="sm:hidden">{pendingItems}</span>
        </div>
      )}

      {/* Bottom Navigation - Only visible when company is selected */}
      {selectedCompany && currentView !== 'company-selector' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 safe-area-inset-bottom lg:hidden z-50">
          <div className="flex items-center justify-around p-2">
            <button
              onClick={() => setCurrentView('triadic-dashboard')}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors flex-1 ${
                currentView === 'triadic-dashboard'
                  ? 'bg-[#FF8C00]/20 text-[#FF8C00]'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
              <span className="text-xs">Inicio</span>
            </button>

            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors flex-1 ${
                currentView === 'dashboard'
                  ? 'bg-[#FF8C00]/20 text-[#FF8C00]'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs">Cumplimiento</span>
            </button>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors flex-1 text-zinc-600 dark:text-zinc-400"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              <span className="text-xs">Menú</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {showMobileMenu && selectedCompany && (
        <div className="fixed inset-0 bg-black/80 z-40 lg:hidden" onClick={() => setShowMobileMenu(false)}>
          <div className="absolute bottom-16 left-0 right-0 bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 p-4 space-y-2 max-h-[70vh] overflow-y-auto">
            <Button
              onClick={() => {
                setCurrentView('safety-kits');
                setShowMobileMenu(false);
              }}
              variant="outline"
              className="w-full bg-zinc-100 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600"
            >
              <Package className="w-4 h-4 mr-2" />
              Kits de Seguridad
            </Button>
            <Button
              onClick={() => {
                setCurrentView('inspection-config');
                setShowMobileMenu(false);
              }}
              variant="outline"
              className="w-full bg-zinc-100 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600"
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Config. Inspecciones
            </Button>
            <Button
              onClick={() => {
                setCurrentView('statistics');
                setShowMobileMenu(false);
              }}
              variant="outline"
              className="w-full bg-zinc-100 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Módulo de Estadísticas
            </Button>
            <Button
              onClick={() => {
                setCurrentView('color-system-demo');
                setShowMobileMenu(false);
              }}
              variant="outline"
              className="w-full bg-zinc-100 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600"
            >
              <Palette className="w-4 h-4 mr-2" />
              Sistema de Color
            </Button>
            <Button
              onClick={() => {
                setCurrentView('document-workflow-demo');
                setShowMobileMenu(false);
              }}
              variant="outline"
              className="w-full bg-zinc-100 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600"
            >
              <FileText className="w-4 h-4 mr-2" />
              Flujo Documental
            </Button>
            <Button
              onClick={() => {
                setCurrentView('company-selector');
                setShowMobileMenu(false);
              }}
              variant="outline"
              className="w-full bg-zinc-100 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600"
            >
              Cambiar Empresa
            </Button>
            <Button
              onClick={() => {
                toggleTheme();
                setShowMobileMenu(false);
              }}
              variant="outline"
              className="w-full bg-zinc-100 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600"
            >
              {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            </Button>
            <Button
              onClick={() => {
                setShowMobileMenu(false);
                onLogout();
              }}
              variant="outline"
              className="w-full bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar - Hidden on mobile, collapsible on desktop */}
      {selectedCompany && currentView !== 'company-selector' && (
        <>
          {/* Overlay cuando el sidebar está abierto */}
          {showDesktopSidebar && (
            <div 
              className="hidden lg:block fixed inset-0 bg-black/20 z-30 transition-opacity"
              onClick={() => setShowDesktopSidebar(false)}
            />
          )}
          
          {/* Sidebar */}
          <div 
            className={`hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-zinc-800 border-r border-slate-200 dark:border-zinc-700 z-40 transition-transform duration-300 ease-in-out ${
              showDesktopSidebar ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-slate-900 dark:text-white text-xl font-semibold">SafeTrack</h2>
                  <p className="text-slate-600 dark:text-zinc-400 text-sm">Prevención de Riesgos</p>
                </div>
                <button
                  onClick={() => setShowDesktopSidebar(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600 dark:text-zinc-400" />
                </button>
              </div>

              {userData && (
                <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-slate-50 dark:bg-zinc-700/50 border border-slate-200 dark:border-zinc-700">
                  {userData.picture ? (
                    <img
                      src={userData.picture}
                      alt={userData.name || userData.email}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 font-medium">
                      {(userData.name || userData.email || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {userData.name || 'Usuario'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                      {userData.email}
                    </p>
                  </div>
                </div>
              )}

              <nav className="space-y-1">
                <button
                  onClick={() => {
                    setCurrentView('triadic-dashboard');
                    setShowDesktopSidebar(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all interactive ${
                    currentView === 'triadic-dashboard'
                      ? 'bg-blue-600 text-white shadow-soft'
                      : 'text-slate-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  <LayoutGrid className="w-5 h-5" />
                  <span className="font-medium">Dashboard Principal</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentView('dashboard');
                    setShowDesktopSidebar(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all interactive ${
                    currentView === 'dashboard'
                      ? 'bg-blue-600 text-white shadow-soft'
                      : 'text-slate-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">Cumplimiento</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentView('statistics');
                    setShowDesktopSidebar(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all interactive ${
                    currentView === 'statistics' || currentView === 'causal-analysis'
                      ? 'bg-blue-600 text-white shadow-soft'
                      : 'text-slate-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-medium">Estadísticas</span>
                </button>
              </nav>

              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-zinc-700 space-y-2">
                <Button
                  onClick={() => {
                    setCurrentView('company-selector');
                    setShowDesktopSidebar(false);
                  }}
                  variant="outline"
                  className="w-full bg-slate-50 dark:bg-zinc-700/50 border-slate-200 dark:border-zinc-600 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700"
                >
                  Cambiar Empresa
                </Button>
                
                <Button
                  onClick={() => {
                    toggleTheme();
                  }}
                  variant="outline"
                  className="w-full bg-slate-50 dark:bg-zinc-700/50 border-slate-200 dark:border-zinc-600 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 mr-2 text-amber-500" />
                      Modo Claro
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 mr-2 text-blue-600" />
                      Modo Oscuro
                    </>
                  )}
                </Button>

                <Button
                  onClick={onLogout}
                  variant="outline"
                  className="w-full bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main content - No automatic padding */}
      
      {/* Critical Accident FAB - Visible en vistas operativas */}
      {selectedCompany && currentView !== 'company-selector' && currentView !== 'accident-mode' && (
        <CriticalAccidentFAB
          onActivate={() => setCurrentView('accident-mode')}
          isVisible={true}
        />
      )}

      {/* Intelligent Sync Indicator - Reemplaza el indicador simple */}
      {selectedCompany && currentView !== 'company-selector' && mockPendingItems.length > 0 && (
        <IntelligentSyncIndicator
          pendingItems={mockPendingItems}
          isOnline={isOnline}
          onSync={handleSync}
          onViewDetails={handleViewPendingItemDetails}
        />
      )}
    </div>
  );
}