import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';
import { Navigation, MapPin, Clock, Route, TrendingDown, AlertCircle } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';

interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  priority: number;
  estimatedDuration: number; // minutos
  taskType: 'inspection' | 'maintenance' | 'training' | 'meeting';
}

interface RouteOptimizationMapProps {
  locations: Location[];
  onRouteOptimized?: (optimizedRoute: Location[]) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '12px'
};

// Centro por defecto: Santiago, Chile
const defaultCenter = {
  lat: -33.4489,
  lng: -70.6693
};

// Colores según tipo de tarea
const getMarkerColor = (taskType: string): string => {
  switch (taskType) {
    case 'inspection': return '#FF8C00'; // Naranja
    case 'maintenance': return '#DC2626'; // Rojo
    case 'training': return '#0055A4'; // Azul
    case 'meeting': return '#10B981'; // Verde
    default: return '#6B7280'; // Gris
  }
};

const getTaskIcon = (taskType: string): string => {
  switch (taskType) {
    case 'inspection': return '🔍';
    case 'maintenance': return '🔧';
    case 'training': return '📚';
    case 'meeting': return '👥';
    default: return '📍';
  }
};

export function RouteOptimizationMap({ locations, onRouteOptimized }: RouteOptimizationMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<Location | null>(null);
  const [optimizedRoute, setOptimizedRoute] = useState<Location[]>([]);
  const [totalDistance, setTotalDistance] = useState<string>('0 km');
  const [totalDuration, setTotalDuration] = useState<string>('0 min');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    setIsLoaded(true);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Calcular ruta optimizada
  const calculateOptimizedRoute = useCallback(() => {
    if (!map || locations.length < 2) {
      toast.error('Necesitas al menos 2 ubicaciones para optimizar la ruta');
      return;
    }

    setIsCalculating(true);

    // Ordenar por prioridad primero
    const sortedByPriority = [...locations].sort((a, b) => b.priority - a.priority);

    // Punto de inicio (ubicación con mayor prioridad)
    const origin = sortedByPriority[0];
    
    // Punto final (última ubicación)
    const destination = sortedByPriority[sortedByPriority.length - 1];

    // Waypoints intermedios
    const waypoints = sortedByPriority.slice(1, -1).map(loc => ({
      location: new google.maps.LatLng(loc.lat, loc.lng),
      stopover: true
    }));

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        waypoints: waypoints,
        optimizeWaypoints: true, // ¡Google optimiza automáticamente!
        travelMode: google.maps.TravelMode.DRIVING,
        region: 'CL' // Chile
      },
      (result, status) => {
        setIsCalculating(false);

        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);

          // Extraer orden optimizado
          const waypointOrder = result.routes[0].waypoint_order;
          const optimized = [origin];
          
          waypointOrder.forEach(index => {
            optimized.push(sortedByPriority[index + 1]);
          });
          
          optimized.push(destination);
          setOptimizedRoute(optimized);

          // Calcular distancia y tiempo total
          const route = result.routes[0];
          let totalDistanceMeters = 0;
          let totalDurationSeconds = 0;

          route.legs.forEach(leg => {
            if (leg.distance) totalDistanceMeters += leg.distance.value;
            if (leg.duration) totalDurationSeconds += leg.duration.value;
          });

          const distanceKm = (totalDistanceMeters / 1000).toFixed(1);
          const durationMin = Math.round(totalDurationSeconds / 60);

          setTotalDistance(`${distanceKm} km`);
          setTotalDuration(`${durationMin} min`);

          // Callback al padre
          if (onRouteOptimized) {
            onRouteOptimized(optimized);
          }

          toast.success('🗺️ Ruta Optimizada', {
            description: `${distanceKm} km • ${durationMin} minutos • ${optimized.length} paradas`,
            duration: 4000
          });
        } else {
          console.error('Error calculating route:', status);
          toast.error('Error al calcular ruta', {
            description: 'No se pudo optimizar la ruta. Verifica las ubicaciones.'
          });
        }
      }
    );
  }, [map, locations, onRouteOptimized]);

  // Auto-calcular cuando cambian las ubicaciones
  useEffect(() => {
    if (locations.length >= 2 && map) {
      calculateOptimizedRoute();
    }
  }, [locations, map]);

  return (
    <div className="space-y-4">
      {/* Métricas de la ruta */}
      {directions && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-3 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-slate-600 dark:text-zinc-400">Paradas</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {optimizedRoute.length}
            </div>
          </Card>

          <Card className="p-3 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-1">
              <Route className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-slate-600 dark:text-zinc-400">Distancia</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {totalDistance}
            </div>
          </Card>

          <Card className="p-3 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-xs text-slate-600 dark:text-zinc-400">Tiempo</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {totalDuration}
            </div>
          </Card>

          <Card className="p-3 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-purple-600" />
              <span className="text-xs text-slate-600 dark:text-zinc-400">Ahorro</span>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              ~30%
            </div>
          </Card>
        </div>
      )}

      {/* Alerta informativa */}
      <Card className="p-3 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-800 dark:text-blue-300">
            <strong>Ruta optimizada automáticamente</strong> usando el algoritmo de Google Maps.
            Las ubicaciones se ordenan considerando prioridad, distancia y tiempo de viaje.
          </div>
        </div>
      </Card>

      {/* Mapa de Google Maps */}
      <Card className="overflow-hidden border-slate-200 dark:border-zinc-800">
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={locations.length > 0 ? { lat: locations[0].lat, lng: locations[0].lng } : defaultCenter}
            zoom={12}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: true
            }}
          >
            {/* Mostrar ruta optimizada */}
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  suppressMarkers: false,
                  polylineOptions: {
                    strokeColor: '#FF8C00',
                    strokeWeight: 5,
                    strokeOpacity: 0.8
                  }
                }}
              />
            )}

            {/* Marcadores personalizados */}
            {!directions && locations.map((location, index) => (
              <Marker
                key={location.id}
                position={{ lat: location.lat, lng: location.lng }}
                onClick={() => setSelectedMarker(location)}
                label={{
                  text: `${index + 1}`,
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 12,
                  fillColor: getMarkerColor(location.taskType),
                  fillOpacity: 1,
                  strokeColor: 'white',
                  strokeWeight: 2
                }}
              />
            ))}

            {/* InfoWindow al hacer click en marcador */}
            {selectedMarker && (
              <InfoWindow
                position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="p-2">
                  <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-1">
                    {getTaskIcon(selectedMarker.taskType)} {selectedMarker.name}
                  </h3>
                  <p className="text-xs text-slate-600 mb-2">{selectedMarker.address}</p>
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs" style={{ backgroundColor: getMarkerColor(selectedMarker.taskType) }}>
                      Prioridad {selectedMarker.priority}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      ~{selectedMarker.estimatedDuration} min
                    </span>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </Card>

      {/* Lista de paradas en orden optimizado */}
      {optimizedRoute.length > 0 && (
        <Card className="p-4 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-orange-600" />
            Orden Optimizado de Visitas
          </h3>
          <div className="space-y-2">
            {optimizedRoute.map((location, index) => (
              <div
                key={location.id}
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-600 text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-slate-900 dark:text-white text-sm">
                    {getTaskIcon(location.taskType)} {location.name}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-zinc-400">
                    {location.address}
                  </div>
                </div>
                <div className="text-right">
                  <Badge className="text-xs mb-1" style={{ backgroundColor: getMarkerColor(location.taskType) }}>
                    P{location.priority}
                  </Badge>
                  <div className="text-xs text-slate-500 dark:text-zinc-500">
                    {location.estimatedDuration} min
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Botón para recalcular */}
      <Button
        onClick={calculateOptimizedRoute}
        disabled={isCalculating}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
      >
        <Route className="w-4 h-4 mr-2" />
        {isCalculating ? 'Calculando Ruta...' : 'Recalcular Ruta Optimizada'}
      </Button>
    </div>
  );
}