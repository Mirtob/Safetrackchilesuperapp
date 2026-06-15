import { useState, useEffect, useCallback, useRef } from 'react';
import { useGeolocation } from '@/app/hooks/useGeolocation';
import { Company, Branch } from '@/app/context/CompanyContext';

interface LocationMatch {
  company: Company;
  branch?: Branch;
  distance: number;
}

interface UseLocationDetectionOptions {
  companies: Company[];
  detectionRadius?: number; // Radio en metros (default: 100m)
  checkInterval?: number; // Intervalo de verificación en ms (default: 10000ms = 10s)
  onLocationDetected?: (match: LocationMatch) => void;
}

export function useLocationDetection({
  companies,
  detectionRadius = 100,
  checkInterval = 10000,
  onLocationDetected
}: UseLocationDetectionOptions) {
  const { coordinates, isTracking, calculateDistance, startTracking, stopTracking } = useGeolocation();
  const [detectedLocation, setDetectedLocation] = useState<LocationMatch | null>(null);
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);
  const lastNotifiedLocationRef = useRef<string | null>(null);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Verificar si está cerca de alguna empresa o sucursal
  const checkNearbyLocations = useCallback(() => {
    if (!coordinates) {
      return null;
    }

    setIsCheckingLocation(true);

    for (const company of companies) {
      // Verificar sucursales primero (más específico)
      if (company.branches && company.branches.length > 0) {
        for (const branch of company.branches) {
          const distance = calculateDistance(
            coordinates.latitude,
            coordinates.longitude,
            branch.coordinates.latitude,
            branch.coordinates.longitude
          );

          if (distance <= detectionRadius) {
            const match: LocationMatch = {
              company,
              branch,
              distance: Math.round(distance)
            };

            setIsCheckingLocation(false);
            return match;
          }
        }
      }

      // Verificar empresa principal si tiene coordenadas
      if (company.coordinates) {
        const distance = calculateDistance(
          coordinates.latitude,
          coordinates.longitude,
          company.coordinates.latitude,
          company.coordinates.longitude
        );

        if (distance <= detectionRadius) {
          const match: LocationMatch = {
            company,
            distance: Math.round(distance)
          };

          setIsCheckingLocation(false);
          return match;
        }
      }
    }

    setIsCheckingLocation(false);
    return null;
  }, [coordinates, companies, detectionRadius, calculateDistance]);

  // Efecto para verificar ubicación periódicamente
  useEffect(() => {
    if (!isTracking || !coordinates) {
      return;
    }

    const runCheck = () => {
      const match = checkNearbyLocations();

      if (match) {
        // Generar ID único para esta ubicación
        const locationId = match.branch 
          ? `${match.company.id}-${match.branch.id}`
          : match.company.id;

        // Solo notificar si es una ubicación diferente a la última notificada
        if (locationId !== lastNotifiedLocationRef.current) {
          setDetectedLocation(match);
          lastNotifiedLocationRef.current = locationId;
          
          if (onLocationDetected) {
            onLocationDetected(match);
          }
        }
      } else {
        // Si no está cerca de ninguna ubicación, resetear
        if (lastNotifiedLocationRef.current !== null) {
          lastNotifiedLocationRef.current = null;
        }
      }
    };

    // Ejecutar inmediatamente
    runCheck();

    // Configurar intervalo de verificación
    checkTimeoutRef.current = setInterval(runCheck, checkInterval);

    return () => {
      if (checkTimeoutRef.current) {
        clearInterval(checkTimeoutRef.current);
      }
    };
  }, [isTracking, coordinates, checkNearbyLocations, checkInterval, onLocationDetected]);

  // Limpiar detección cuando se confirma o descarta
  const clearDetectedLocation = useCallback(() => {
    setDetectedLocation(null);
  }, []);

  // Descartar permanentemente esta ubicación en esta sesión
  const dismissLocation = useCallback(() => {
    setDetectedLocation(null);
    // Mantener en lastNotified para no volver a notificar
  }, []);

  return {
    detectedLocation,
    isCheckingLocation,
    clearDetectedLocation,
    dismissLocation,
    startTracking,
    stopTracking,
    isTracking,
    currentCoordinates: coordinates
  };
}
