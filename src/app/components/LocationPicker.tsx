import { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { MapPin, Navigation, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
  onClose: () => void;
  initialLocation?: { lat: number; lng: number };
}

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px'
};

// Ubicación por defecto: Santiago Centro, Chile
const defaultCenter = {
  lat: -33.4489,
  lng: -70.6693
};

export function LocationPicker({ onLocationSelect, onClose, initialLocation }: LocationPickerProps) {
  const [selectedPosition, setSelectedPosition] = useState<google.maps.LatLngLiteral | null>(
    initialLocation || null
  );
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<string>('');

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY' // ⚠️ IMPORTANTE: Reemplazar con tu API Key de Google Maps
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const position = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      setSelectedPosition(position);
      getAddressFromCoordinates(position);
    }
  }, []);

  const getAddressFromCoordinates = async (position: { lat: number; lng: number }) => {
    setIsLoadingAddress(true);
    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({ location: position });
      
      if (response.results[0]) {
        setCurrentAddress(response.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Error obteniendo dirección:', error);
      setCurrentAddress('Dirección no disponible');
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      toast.info('Obteniendo ubicación actual...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setSelectedPosition(currentPos);
          map?.panTo(currentPos);
          getAddressFromCoordinates(currentPos);
          toast.success('Ubicación actual detectada');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('No se pudo obtener la ubicación actual', {
            description: 'Verifica que los permisos de ubicación estén habilitados'
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      toast.error('Geolocalización no disponible', {
        description: 'Tu navegador no soporta geolocalización'
      });
    }
  };

  const handleConfirm = () => {
    if (!selectedPosition) {
      toast.error('Selecciona una ubicación', {
        description: 'Haz clic en el mapa o usa tu ubicación actual'
      });
      return;
    }

    onLocationSelect({
      ...selectedPosition,
      address: currentAddress
    });

    toast.success('✅ Ubicación Registrada', {
      description: `Coordenadas: ${selectedPosition.lat.toFixed(6)}, ${selectedPosition.lng.toFixed(6)}`
    });
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-zinc-400">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-4 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-600" />
            Seleccionar Ubicación
          </h3>
          <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
            Haz clic en el mapa o usa tu ubicación actual
          </p>
        </div>
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
          GPS Habilitado
        </Badge>
      </div>

      <div className="mb-4">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={selectedPosition || defaultCenter}
          zoom={selectedPosition ? 16 : 12}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
          options={{
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true
          }}
        >
          {selectedPosition && (
            <Marker
              position={selectedPosition}
              animation={google.maps.Animation.DROP}
              icon={{
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF8C00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3" fill="#FF8C00"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(48, 48),
                anchor: new google.maps.Point(24, 48)
              }}
            />
          )}
        </GoogleMap>
      </div>

      {currentAddress && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-1">
                Dirección Detectada:
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-400">
                {isLoadingAddress ? 'Obteniendo dirección...' : currentAddress}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedPosition && (
        <div className="mb-4 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg">
          <div className="text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">
            Coordenadas GPS:
          </div>
          <div className="font-mono text-sm text-slate-900 dark:text-white">
            Lat: {selectedPosition.lat.toFixed(6)}, Lng: {selectedPosition.lng.toFixed(6)}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleGetCurrentLocation}
          variant="outline"
          className="flex-1 border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20"
        >
          <Navigation className="w-4 h-4 mr-2" />
          Mi Ubicación Actual
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!selectedPosition}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          <Check className="w-4 h-4 mr-2" />
          Confirmar Ubicación
        </Button>
        <Button
          onClick={onClose}
          variant="outline"
          size="icon"
          className="border-slate-200 dark:border-zinc-700"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded-lg">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-orange-800 dark:text-orange-300">
            <strong>⚠️ Normativa Chilena:</strong> La geolocalización es requerida para inspecciones y 
            reportes de accidentes según D.S. 594. Las coordenadas GPS quedan registradas con 
            fecha y hora para trazabilidad legal.
          </div>
        </div>
      </div>
    </Card>
  );
}
