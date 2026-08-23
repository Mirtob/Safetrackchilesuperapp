/**
 * Cronómetro de faena guiado por GPS — SafeTrack Chile
 *
 * Observa la posición y, cuando el prevencionista entra al radio de una de sus
 * empresas, abre la faena. Cuando se aleja de forma sostenida, la cierra y la
 * valoriza con el valor HH de esa empresa.
 *
 * El teléfono va en el bolsillo: el objetivo es que el ingeniero no tenga que
 * acordarse de marcar entrada ni salida para que sus horas queden bien cobradas.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useGeolocation } from '@/app/hooks/useGeolocation';
import type { Company } from '@/app/context/CompanyContext';
import type { ClientCompany } from '@/app/services/clientPortfolioService';
import {
  type ActiveShift,
  type ClosedShift,
  EXIT_MARGIN_M,
  EXIT_CONFIRMATIONS,
  findOpenShift,
  startShift,
  endShift,
  markNotified,
  buildArrivalMessage,
  buildDepartureMessage,
} from '@/app/services/shiftTrackingService';

interface Options {
  companies: Company[];
  /** Perfiles de cobro: de aquí sale el valor HH y el mínimo facturable. */
  clients: ClientCompany[];
  professionalName?: string;
  enabled?: boolean;
}

export interface UseAutoShiftTracking {
  activeShift: ActiveShift | null;
  /** Minutos transcurridos de la faena en curso. */
  elapsedMinutes: number;
  lastClosedShift: ClosedShift | null;
  isTracking: boolean;
  /** Aviso pendiente de enviar a la empresa, si su envío no está disponible. */
  pendingNotice: { companyName: string; message: string } | null;
  dismissPendingNotice: () => void;
  startTracking: () => void;
  stopTracking: () => void;
  /** Cierre manual, para cuando el ingeniero termina antes de irse del lugar. */
  closeShiftNow: () => Promise<void>;
}

/** Avisa al prevencionista aunque la app esté en segundo plano. */
const notifyProfessional = (title: string, body: string): void => {
  toast.info(title, { description: body, duration: 6000 });

  try {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  } catch {
    // Algunos navegadores móviles restringen Notification fuera de un service
    // worker; el toast ya cumple el aviso.
  }
};

export function useAutoShiftTracking({
  companies,
  clients,
  professionalName = '',
  enabled = true,
}: Options): UseAutoShiftTracking {
  const { coordinates, isTracking, calculateDistance, startTracking, stopTracking } = useGeolocation();

  const [activeShift, setActiveShift] = useState<ActiveShift | null>(null);
  const [lastClosedShift, setLastClosedShift] = useState<ClosedShift | null>(null);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [pendingNotice, setPendingNotice] = useState<{ companyName: string; message: string } | null>(null);

  // Lecturas seguidas fuera del radio. Evita cerrar por un salto del GPS.
  const outsideCountRef = useRef(0);
  // Impide que dos lecturas casi simultáneas abran o cierren dos veces.
  const busyRef = useRef(false);
  const activeShiftRef = useRef<ActiveShift | null>(null);

  useEffect(() => { activeShiftRef.current = activeShift; }, [activeShift]);

  const clientFor = useCallback(
    (companyId: string) => clients.find(c => c.id === companyId),
    [clients]
  );

  // Retoma una faena que quedó abierta (app cerrada, batería agotada en planta).
  useEffect(() => {
    if (!enabled || companies.length === 0) return;

    let cancelled = false;
    (async () => {
      const open = await findOpenShift(
        companies.map(c => ({ id: c.id, name: c.name, hourlyRate: clientFor(c.id)?.hourlyRate }))
      );
      if (!cancelled && open) setActiveShift(open);
    })();

    return () => { cancelled = true; };
  }, [enabled, companies, clientFor]);

  // Reloj de la faena en curso.
  useEffect(() => {
    if (!activeShift) {
      setElapsedMinutes(0);
      return;
    }

    const tick = () => {
      const ms = Date.now() - new Date(activeShift.startedAt).getTime();
      setElapsedMinutes(Math.max(0, Math.floor(ms / 60_000)));
    };

    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [activeShift]);

  /** Empresa (y sucursal) dentro de cuyo radio está el punto actual. */
  const findCompanyAtPosition = useCallback(() => {
    if (!coordinates) return null;

    for (const company of companies) {
      const radius = company.geofenceRadius || 150;

      // Las sucursales van primero: son la ubicación más específica.
      for (const branch of company.branches || []) {
        const distance = calculateDistance(
          coordinates.latitude, coordinates.longitude,
          branch.coordinates.latitude, branch.coordinates.longitude
        );
        if (distance <= radius) {
          return { company, branch, distance, radius, label: `${company.name} — ${branch.name}` };
        }
      }

      if (company.coordinates) {
        const distance = calculateDistance(
          coordinates.latitude, coordinates.longitude,
          company.coordinates.latitude, company.coordinates.longitude
        );
        if (distance <= radius) {
          return { company, branch: undefined, distance, radius, label: company.name };
        }
      }
    }

    return null;
  }, [coordinates, companies, calculateDistance]);

  /** Distancia al punto de la faena en curso, para decidir la salida. */
  const distanceToActiveShift = useCallback((): { distance: number; radius: number } | null => {
    const shift = activeShiftRef.current;
    if (!shift || !coordinates) return null;

    const company = companies.find(c => c.id === shift.companyId);
    if (!company) return null;

    const radius = company.geofenceRadius || 150;
    const target = shift.branchId
      ? company.branches?.find(b => b.id === shift.branchId)?.coordinates
      : company.coordinates;

    if (!target) return null;

    return {
      distance: calculateDistance(
        coordinates.latitude, coordinates.longitude,
        target.latitude, target.longitude
      ),
      radius,
    };
  }, [coordinates, companies, calculateDistance]);

  const closeShift = useCallback(async (auto: boolean) => {
    const shift = activeShiftRef.current;
    if (!shift || busyRef.current) return;

    busyRef.current = true;
    try {
      const closed = await endShift({
        shift,
        coords: coordinates || undefined,
        minBillableMinutes: clientFor(shift.companyId)?.minBillableMinutes ?? 15,
        autoEnded: auto,
      });

      if (!closed) return;

      setActiveShift(null);
      setLastClosedShift(closed);
      outsideCountRef.current = 0;

      const horas = closed.durationHours.toLocaleString('es-CL', { maximumFractionDigits: 2 });
      notifyProfessional(
        'Faena cerrada',
        closed.billableHours > 0
          ? `${closed.companyName}: ${horas} h registradas.`
          : `${closed.companyName}: ${horas} h, bajo el mínimo facturable.`
      );

      const company = companies.find(c => c.id === closed.companyId);
      if (company?.notifyOnDeparture !== false) {
        setPendingNotice({
          companyName: closed.companyName,
          message: buildDepartureMessage(closed, professionalName),
        });
        await markNotified(closed.id, 'departure');
      }
    } catch (err) {
      toast.error('No se pudo cerrar la faena', { description: (err as Error).message });
    } finally {
      busyRef.current = false;
    }
  }, [coordinates, companies, clientFor, professionalName]);

  // Motor principal: cada lectura de posición decide abrir, mantener o cerrar.
  useEffect(() => {
    if (!enabled || !isTracking || !coordinates) return;

    const shift = activeShiftRef.current;

    if (shift) {
      const info = distanceToActiveShift();
      if (!info) return;

      // Salir exige superar el radio más el margen, de forma sostenida.
      if (info.distance > info.radius + EXIT_MARGIN_M) {
        outsideCountRef.current += 1;
        if (outsideCountRef.current >= EXIT_CONFIRMATIONS) void closeShift(true);
      } else {
        outsideCountRef.current = 0;
      }
      return;
    }

    // Sin faena abierta: ¿estamos dentro del radio de alguna empresa?
    const match = findCompanyAtPosition();
    if (!match || busyRef.current) return;

    const client = clientFor(match.company.id);
    const hourlyRate = client?.hourlyRate ?? 0;

    busyRef.current = true;
    (async () => {
      try {
        const started = await startShift({
          companyId: match.company.id,
          companyName: match.company.name,
          branchId: match.branch?.id,
          hourlyRate,
          location: match.label,
          coords: coordinates,
          autoStarted: true,
        });

        if (!started) return;

        setActiveShift(started);
        outsideCountRef.current = 0;

        notifyProfessional(
          'Faena iniciada',
          hourlyRate > 0
            ? `${match.label}. Se está registrando tu tiempo en planta.`
            : `${match.label}. Ojo: esta empresa no tiene valor HH configurado.`
        );

        if (match.company.notifyOnArrival !== false) {
          setPendingNotice({
            companyName: match.company.name,
            message: buildArrivalMessage(started, professionalName),
          });
          await markNotified(started.id, 'arrival');
        }
      } catch (err) {
        toast.error('No se pudo iniciar la faena', { description: (err as Error).message });
      } finally {
        busyRef.current = false;
      }
    })();
  }, [
    enabled, isTracking, coordinates,
    findCompanyAtPosition, distanceToActiveShift, closeShift, clientFor, professionalName,
  ]);

  return {
    activeShift,
    elapsedMinutes,
    lastClosedShift,
    isTracking,
    pendingNotice,
    dismissPendingNotice: () => setPendingNotice(null),
    startTracking,
    stopTracking,
    closeShiftNow: () => closeShift(false),
  };
}
