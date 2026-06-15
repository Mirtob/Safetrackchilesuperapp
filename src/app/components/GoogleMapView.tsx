import { useCallback, useState, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { MapPin, Building2, Navigation2, Loader2 } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Company, Branch } from '@/app/context/CompanyContext';
import { Coordinates } from '@/app/hooks/useGeolocation';

interface GoogleMapViewProps {
  companies: Company[];
  currentLocation?: Coordinates | null;
  selectedCompany?: Company | null;
  selectedBranch?: Branch | null;
  onSelectLocation?: (company: Company, branch?: Branch) => void;
  detectionRadius?: number; // Radio de detección en metros (default: 100m)
  showCurrentLocation?: boolean;
  zoom?: number;
  height?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

// Centro por defecto: Santiago, Chile
const defaultCenter = {
  lat: -33.4489,
  lng: -70.6693
};

export function GoogleMapView({
  companies,
  currentLocation,
  selectedCompany,
  selectedBranch,
  onSelectLocation,
  detectionRadius = 100,
  showCurrentLocation = true,
  zoom = 12,
  height = '400px'
}: GoogleMapViewProps) {
  const [selectedMarker, setSelectedMarker] = useState<{ 
    company: Company; 
    branch?: Branch;
    position: { lat: number; lng: number };
  } | null>(null);

  const mapRef = useRef<google.maps.Map | null>(null);

  // Cargar Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places', 'geometry']
  });

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onMapUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Calcular el centro del mapa
  const getMapCenter = useCallback(() => {
    if (currentLocation && showCurrentLocation) {
      return {
        lat: currentLocation.latitude,
        lng: currentLocation.longitude
      };
    }
    
    if (selectedBranch) {
      return {
        lat: selectedBranch.coordinates.latitude,
        lng: selectedBranch.coordinates.longitude
      };
    }
    
    if (selectedCompany?.coordinates) {
      return {
        lat: selectedCompany.coordinates.latitude,
        lng: selectedCompany.coordinates.longitude
      };
    }
    
    return defaultCenter;
  }, [currentLocation, selectedBranch, selectedCompany, showCurrentLocation]);

  // Generar todos los markers (empresas y sucursales)
  const getMarkers = useCallback(() => {
    const markers: Array<{
      company: Company;
      branch?: Branch;
      position: { lat: number; lng: number };
      type: 'company' | 'branch';
    }> = [];

    companies.forEach(company => {
      // Agregar markers de sucursales
      if (company.branches && company.branches.length > 0) {
        company.branches.forEach(branch => {
          markers.push({
            company,
            branch,
            position: {
              lat: branch.coordinates.latitude,
              lng: branch.coordinates.longitude
            },
            type: 'branch'
          });
        });
      } else if (company.coordinates) {
        // Si no tiene sucursales, agregar marker de empresa
        markers.push({
          company,
          position: {
            lat: company.coordinates.latitude,
            lng: company.coordinates.longitude
          },
          type: 'company'
        });
      }
    });

    return markers;
  }, [companies]);

  if (loadError) {
    return (
      <div className="w-full bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-6" style={{ height }}>
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <MapPin className="w-12 h-12 text-red-600" />
          <p className="text-red-900 dark:text-red-300 font-semibold">Error al cargar Google Maps</p>
          <p className="text-sm text-red-700 dark:text-red-400 text-center">
            Por favor, verifica tu conexión a internet y recarga la página.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full bg-slate-50 dark:bg-zinc-900/50 border-2 border-slate-200 dark:border-zinc-700 rounded-lg p-6" style={{ height }}>
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-slate-700 dark:text-zinc-300 font-semibold">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  const markers = getMarkers();

  return (
    <div className="w-full rounded-lg overflow-hidden border-2 border-slate-200 dark:border-zinc-700" style={{ height }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={getMapCenter()}
        zoom={zoom}
        onLoad={onMapLoad}
        onUnmount={onMapUnmount}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        }}
      >
        {/* Ubicación actual del usuario */}
        {showCurrentLocation && currentLocation && (
          <>
            <Marker
              position={{
                lat: currentLocation.latitude,
                lng: currentLocation.longitude
              }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#3B82F6',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 3
              }}
              title="Tu ubicación actual"
            />
            
            {/* Círculo de detección alrededor de la ubicación actual */}
            <Circle
              center={{
                lat: currentLocation.latitude,
                lng: currentLocation.longitude
              }}
              radius={detectionRadius}
              options={{
                fillColor: '#3B82F6',
                fillOpacity: 0.15,
                strokeColor: '#3B82F6',
                strokeOpacity: 0.5,
                strokeWeight: 2
              }}
            />
          </>
        )}

        {/* Markers de empresas y sucursales */}
        {markers.map((marker, index) => {
          const isSelected = 
            selectedCompany?.id === marker.company.id &&
            (marker.branch ? selectedBranch?.id === marker.branch.id : !selectedBranch);

          return (
            <Marker
              key={`${marker.company.id}-${marker.branch?.id || 'main'}-${index}`}
              position={marker.position}
              onClick={() => {
                setSelectedMarker(marker);
                if (onSelectLocation) {
                  onSelectLocation(marker.company, marker.branch);
                }
              }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: isSelected ? 12 : 10,
                fillColor: marker.type === 'branch' ? '#FF8C00' : '#0055A4',
                fillOpacity: isSelected ? 1 : 0.8,
                strokeColor: '#FFFFFF',
                strokeWeight: isSelected ? 3 : 2
              }}
              animation={isSelected ? google.maps.Animation.BOUNCE : undefined}
            />
          );
        })}

        {/* InfoWindow para mostrar detalles */}
        {selectedMarker && (
          <InfoWindow
            position={selectedMarker.position}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <Card className="border-0 shadow-none bg-transparent">
              <div className="p-2 min-w-[200px]">
                <div className="flex items-start gap-2 mb-2">
                  <Building2 className="w-5 h-5 text-[#0055A4] mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 text-sm">
                      {selectedMarker.branch ? selectedMarker.branch.name : selectedMarker.company.name}
                    </h4>
                    {selectedMarker.branch && (
                      <p className="text-xs text-slate-600 mt-0.5">
                        {selectedMarker.company.name}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1 text-xs text-slate-700">
                  <p className="flex items-start gap-1">
                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{selectedMarker.branch ? selectedMarker.branch.address : selectedMarker.company.address}</span>
                  </p>
                  
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-blue-600/20 text-blue-700 border-0"
                    >
                      {selectedMarker.branch ? selectedMarker.branch.workerCount : selectedMarker.company.workerCount} trabajadores
                    </Badge>
                    
                    <Badge 
                      variant="secondary"
                      className={`text-xs border-0 ${
                        selectedMarker.company.riskLevel === 'Alto'
                          ? 'bg-red-600/20 text-red-700'
                          : selectedMarker.company.riskLevel === 'Medio'
                          ? 'bg-yellow-600/20 text-yellow-700'
                          : 'bg-green-600/20 text-green-700'
                      }`}
                    >
                      Riesgo {selectedMarker.company.riskLevel}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
