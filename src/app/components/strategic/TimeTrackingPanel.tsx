import { useState, useEffect } from 'react';
import { Clock, MapPin, Calendar, TrendingUp, Building2, CheckCircle, XCircle, Download } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { useCompany } from '@/app/context/CompanyContext';
import { format, startOfMonth, endOfMonth, differenceInHours, differenceInMinutes } from 'date-fns';
import { es } from 'date-fns/locale';

interface TimeEntry {
  id: string;
  companyId: string;
  companyName: string;
  branchId?: string;
  branchName?: string;
  checkIn: {
    timestamp: string;
    coordinates: { latitude: number; longitude: number };
    address: string;
  };
  checkOut?: {
    timestamp: string;
    coordinates: { latitude: number; longitude: number };
    address: string;
  };
  totalHours?: number;
  status: 'active' | 'completed';
}

// Mock data - En producción vendría de la base de datos
const MOCK_TIME_ENTRIES: TimeEntry[] = [
  {
    id: 'T1',
    companyId: '1',
    companyName: 'Constructora Los Andes S.A.',
    branchId: 'B1-1',
    branchName: 'Obra Portal Ñuñoa',
    checkIn: {
      timestamp: '2026-01-27T08:30:00',
      coordinates: { latitude: -33.4578, longitude: -70.6005 },
      address: 'Av. Irarrázaval 3456, Ñuñoa'
    },
    checkOut: {
      timestamp: '2026-01-27T17:45:00',
      coordinates: { latitude: -33.4578, longitude: -70.6005 },
      address: 'Av. Irarrázaval 3456, Ñuñoa'
    },
    totalHours: 9.25,
    status: 'completed'
  },
  {
    id: 'T2',
    companyId: '1',
    companyName: 'Constructora Los Andes S.A.',
    branchId: 'B1-2',
    branchName: 'Obra Edificio Apoquindo',
    checkIn: {
      timestamp: '2026-01-26T09:00:00',
      coordinates: { latitude: -33.4011, longitude: -70.5589 },
      address: 'Av. Apoquindo 7800, Las Condes'
    },
    checkOut: {
      timestamp: '2026-01-26T14:30:00',
      coordinates: { latitude: -33.4011, longitude: -70.5589 },
      address: 'Av. Apoquindo 7800, Las Condes'
    },
    totalHours: 5.5,
    status: 'completed'
  },
  {
    id: 'T3',
    companyId: '3',
    companyName: 'Transportes y Logística Cruz del Sur',
    branchId: 'B3-1',
    branchName: 'Centro de Distribución Quilicura',
    checkIn: {
      timestamp: '2026-01-24T07:45:00',
      coordinates: { latitude: -33.3569, longitude: -70.7311 },
      address: 'Av. Américo Vespucio 1455, Quilicura'
    },
    checkOut: {
      timestamp: '2026-01-24T18:15:00',
      coordinates: { latitude: -33.3569, longitude: -70.7311 },
      address: 'Av. Américo Vespucio 1455, Quilicura'
    },
    totalHours: 10.5,
    status: 'completed'
  },
  {
    id: 'T4',
    companyId: '2',
    companyName: 'Minera Atacama Norte',
    branchId: 'B2-1',
    branchName: 'Faena Mina Esperanza',
    checkIn: {
      timestamp: '2026-01-23T06:00:00',
      coordinates: { latitude: -22.8906, longitude: -69.3256 },
      address: 'Sector Sierra Gorda, Antofagasta'
    },
    checkOut: {
      timestamp: '2026-01-23T19:30:00',
      coordinates: { latitude: -22.8906, longitude: -69.3256 },
      address: 'Sector Sierra Gorda, Antofagasta'
    },
    totalHours: 13.5,
    status: 'completed'
  },
  {
    id: 'T5',
    companyId: '1',
    companyName: 'Constructora Los Andes S.A.',
    branchId: 'B1-1',
    branchName: 'Obra Portal Ñuñoa',
    checkIn: {
      timestamp: '2026-01-22T08:15:00',
      coordinates: { latitude: -33.4578, longitude: -70.6005 },
      address: 'Av. Irarrázaval 3456, Ñuñoa'
    },
    checkOut: {
      timestamp: '2026-01-22T16:00:00',
      coordinates: { latitude: -33.4578, longitude: -70.6005 },
      address: 'Av. Irarrázaval 3456, Ñuñoa'
    },
    totalHours: 7.75,
    status: 'completed'
  }
];

export function TimeTrackingPanel() {
  const { selectedCompany } = useCompany();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [entries, setEntries] = useState<TimeEntry[]>(MOCK_TIME_ENTRIES);

  // Filtrar por empresa si hay una seleccionada
  const filteredEntries = selectedCompany
    ? entries.filter(e => e.companyId === selectedCompany.id)
    : entries;

  // Calcular totales
  const totalHoursMonth = filteredEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0);
  const totalDaysWorked = filteredEntries.length;
  const averageHoursPerDay = totalDaysWorked > 0 ? totalHoursMonth / totalDaysWorked : 0;

  // Agrupar por empresa
  const hoursByCompany = entries.reduce((acc, entry) => {
    if (!acc[entry.companyId]) {
      acc[entry.companyId] = {
        companyName: entry.companyName,
        totalHours: 0,
        days: 0
      };
    }
    acc[entry.companyId].totalHours += entry.totalHours || 0;
    acc[entry.companyId].days += 1;
    return acc;
  }, {} as Record<string, { companyName: string; totalHours: number; days: number }>);

  const exportToExcel = () => {
    // Aquí iría la lógica para exportar a Excel
    console.log('Exportando datos a Excel...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            Control de Horas Trabajadas
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Registro automático basado en geolocalización y firmas digitales
          </p>
        </div>
        <Button
          onClick={exportToExcel}
          className="bg-[#0055A4] hover:bg-[#004080] text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar Excel
        </Button>
      </div>

      {/* Resumen del mes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 opacity-80" />
              <Badge className="bg-white/20 text-white border-0">
                {format(selectedMonth, 'MMMM yyyy', { locale: es })}
              </Badge>
            </div>
            <div className="text-3xl font-bold mb-1">
              {totalHoursMonth.toFixed(1)}h
            </div>
            <p className="text-blue-100 text-sm">Total horas trabajadas</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 opacity-80" />
              <CheckCircle className="w-6 h-6 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">
              {totalDaysWorked}
            </div>
            <p className="text-green-100 text-sm">Días trabajados</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 text-white">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <Badge className="bg-white/20 text-white border-0">Promedio</Badge>
            </div>
            <div className="text-3xl font-bold mb-1">
              {averageHoursPerDay.toFixed(1)}h/día
            </div>
            <p className="text-orange-100 text-sm">Horas por jornada</p>
          </div>
        </Card>
      </div>

      {/* Desglose por empresa */}
      {!selectedCompany && Object.keys(hoursByCompany).length > 0 && (
        <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#0055A4]" />
              Horas por Empresa
            </h3>
            <div className="space-y-3">
              {Object.entries(hoursByCompany).map(([companyId, data]) => (
                <div
                  key={companyId}
                  className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-zinc-900 dark:text-white">
                      {data.companyName}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {data.days} {data.days === 1 ? 'día' : 'días'} trabajados
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#0055A4]">
                      {data.totalHours.toFixed(1)}h
                    </p>
                    <p className="text-xs text-zinc-500">
                      {(data.totalHours / data.days).toFixed(1)}h/día
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Registro detallado */}
      <Card className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
            Registro Detallado
          </h3>
          <div className="space-y-3">
            {filteredEntries.map((entry) => (
              <Card
                key={entry.id}
                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-[#0055A4]" />
                        <span className="font-semibold text-zinc-900 dark:text-white">
                          {entry.branchName || entry.companyName}
                        </span>
                      </div>
                      {entry.branchName && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 ml-6">
                          {entry.companyName}
                        </p>
                      )}
                    </div>
                    <Badge
                      className={`${
                        entry.status === 'completed'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-blue-100 text-blue-700 border-blue-200'
                      }`}
                    >
                      {entry.status === 'completed' ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {entry.totalHours?.toFixed(2)}h
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          En curso
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* Detalles de entrada y salida */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Check-in */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Entrada
                      </div>
                      <div className="ml-6 space-y-1">
                        <p className="text-sm text-zinc-900 dark:text-white font-medium">
                          {format(new Date(entry.checkIn.timestamp), "dd MMM yyyy 'a las' HH:mm", { locale: es })}
                        </p>
                        <div className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>{entry.checkIn.address}</span>
                        </div>
                        <p className="text-xs text-zinc-500">
                          GPS: {entry.checkIn.coordinates.latitude.toFixed(4)}, {entry.checkIn.coordinates.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>

                    {/* Check-out */}
                    {entry.checkOut && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-400">
                          <XCircle className="w-4 h-4" />
                          Salida
                        </div>
                        <div className="ml-6 space-y-1">
                          <p className="text-sm text-zinc-900 dark:text-white font-medium">
                            {format(new Date(entry.checkOut.timestamp), "dd MMM yyyy 'a las' HH:mm", { locale: es })}
                          </p>
                          <div className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>{entry.checkOut.address}</span>
                          </div>
                          <p className="text-xs text-zinc-500">
                            GPS: {entry.checkOut.coordinates.latitude.toFixed(4)}, {entry.checkOut.coordinates.longitude.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
