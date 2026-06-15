import { useState, useEffect } from 'react';
import { CompanySelectorWithMap } from '@/app/components/CompanySelectorWithMap';
import { LocationArrivalNotification } from '@/app/components/LocationArrivalNotification';
import { useCompany, Company, Branch } from '@/app/context/CompanyContext';
import { useLocationDetection } from '@/app/hooks/useLocationDetection';
import { MOCK_COMPANIES } from '@/app/data/mockCompanies';
import { toast } from 'sonner';

interface AppWithGeolocationProps {
  onCompanySelected: (company: Company, branch?: Branch) => void;
  children?: React.ReactNode;
}

export function AppWithGeolocation({ onCompanySelected, children }: AppWithGeolocationProps) {
  const { selectedCompany, selectedBranch, setSelectedCompany, setSelectedBranch } = useCompany();
  const [showArrivalNotification, setShowArrivalNotification] = useState(false);
  const [detectedMatch, setDetectedMatch] = useState<{
    company: Company;
    branch?: Branch;
    distance: number;
  } | null>(null);

  // Configurar detección de ubicación
  const {
    detectedLocation,
    isTracking,
    currentCoordinates,
    startTracking,
    clearDetectedLocation,
    dismissLocation
  } = useLocationDetection({
    companies: MOCK_COMPANIES,
    detectionRadius: parseInt(import.meta.env.VITE_LOCATION_DETECTION_RADIUS) || 100,
    checkInterval: parseInt(import.meta.env.VITE_LOCATION_CHECK_INTERVAL) || 10000,
    onLocationDetected: (match) => {
      console.log('📍 Ubicación detectada:', match);
      setDetectedMatch(match);
      setShowArrivalNotification(true);
      
      // Toast de notificación
      toast.info('Has llegado a tu destino', {
        description: match.branch ? match.branch.name : match.company.name,
        duration: 5000
      });
    }
  });

  // Iniciar tracking GPS al montar el componente
  useEffect(() => {
    // Solo iniciar si no hay empresa seleccionada
    if (!selectedCompany) {
      console.log('🛰️ Iniciando tracking GPS...');
      startTracking();
      
      toast.success('GPS Activado', {
        description: 'Detectaremos automáticamente cuando llegues a tus empresas',
        duration: 3000
      });
    }
  }, []);

  // Manejar confirmación de llegada
  const handleConfirmArrival = () => {
    if (detectedMatch) {
      console.log('✅ Confirmando llegada a:', detectedMatch);
      
      // Setear en el contexto
      setSelectedCompany(detectedMatch.company);
      if (detectedMatch.branch) {
        setSelectedBranch(detectedMatch.branch);
      }
      
      // Notificar al componente padre
      onCompanySelected(detectedMatch.company, detectedMatch.branch);
      
      // Cerrar notificación
      setShowArrivalNotification(false);
      clearDetectedLocation();
      
      toast.success('Empresa seleccionada', {
        description: `Bienvenido a ${detectedMatch.branch ? detectedMatch.branch.name : detectedMatch.company.name}`
      });
    }
  };

  // Manejar descarte de llegada
  const handleDismissArrival = () => {
    console.log('❌ Descartando notificación de llegada');
    setShowArrivalNotification(false);
    dismissLocation();
  };

  // Manejar selección manual de empresa
  const handleManualSelection = (company: Company, branch?: Branch) => {
    console.log('👆 Selección manual:', company, branch);
    
    // Setear en el contexto
    setSelectedCompany(company);
    if (branch) {
      setSelectedBranch(branch);
    }
    
    // Notificar al componente padre
    onCompanySelected(company, branch);
    
    toast.success('Empresa seleccionada', {
      description: `${branch ? branch.name : company.name}`
    });
  };

  // Si ya hay empresa seleccionada, mostrar children
  if (selectedCompany) {
    return <>{children}</>;
  }

  // Si no hay empresa seleccionada, mostrar selector con mapa
  return (
    <>
      <CompanySelectorWithMap
        companies={MOCK_COMPANIES}
        onSelectCompany={handleManualSelection}
        currentLocation={currentCoordinates}
        isTrackingLocation={isTracking}
      />

      {/* Notificación de llegada */}
      {showArrivalNotification && detectedMatch && (
        <LocationArrivalNotification
          company={detectedMatch.company}
          branch={detectedMatch.branch}
          distance={detectedMatch.distance}
          onConfirm={handleConfirmArrival}
          onDismiss={handleDismissArrival}
        />
      )}
    </>
  );
}