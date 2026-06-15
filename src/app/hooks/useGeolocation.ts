import { useState, useEffect, useCallback } from 'react';

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface GeolocationState {
  coordinates: Coordinates | null;
  error: string | null;
  isLoading: boolean;
  isTracking: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    isLoading: true,
    isTracking: false
  });

  const [watchId, setWatchId] = useState<number | null>(null);

  // Calcular distancia entre dos puntos GPS (fórmula de Haversine)
  const calculateDistance = useCallback((
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
  }, []);

  // Iniciar seguimiento de ubicación
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocalización no soportada en este dispositivo',
        isLoading: false,
        isTracking: false
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    const id = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          },
          error: null,
          isLoading: false,
          isTracking: true
        });
      },
      (error) => {
        let errorMessage = 'Error al obtener ubicación';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado. Por favor, activa el GPS en configuración.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado al obtener ubicación';
            break;
        }
        setState({
          coordinates: null,
          error: errorMessage,
          isLoading: false,
          isTracking: false
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    setWatchId(id);
  }, []);

  // Detener seguimiento de ubicación
  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setState(prev => ({ ...prev, isTracking: false }));
    }
  }, [watchId]);

  // Obtener ubicación una sola vez
  const getCurrentPosition = useCallback((): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }, []);

  // Verificar si está cerca de una ubicación específica
  const isNearLocation = useCallback(
    (targetLat: number, targetLon: number, radiusMeters: number = 100): boolean => {
      if (!state.coordinates) return false;

      const distance = calculateDistance(
        state.coordinates.latitude,
        state.coordinates.longitude,
        targetLat,
        targetLon
      );

      return distance <= radiusMeters;
    },
    [state.coordinates, calculateDistance]
  );

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    ...state,
    startTracking,
    stopTracking,
    getCurrentPosition,
    isNearLocation,
    calculateDistance
  };
}
