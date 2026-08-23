/**
 * Acceso a la configuración financiera desde componentes.
 *
 * Mantiene una sola copia en memoria compartida por todos los consumidores: si
 * el usuario cambia la tasa de retención en Configuración, las pantallas de
 * boletas, gastos y horas se actualizan sin recargar.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  type FinanceSettings,
  DEFAULT_FINANCE_SETTINGS,
  loadFinanceSettings,
  saveFinanceSettings,
  type SaveResult,
} from '@/app/services/financeSettings';

let cached: FinanceSettings | null = null;
let inFlight: Promise<FinanceSettings> | null = null;

type Listener = (settings: FinanceSettings) => void;
const listeners = new Set<Listener>();

const publish = (settings: FinanceSettings): void => {
  cached = settings;
  listeners.forEach(fn => fn(settings));
};

/** Carga compartida: varias pantallas montándose a la vez hacen una sola query. */
const ensureLoaded = (): Promise<FinanceSettings> => {
  if (cached) return Promise.resolve(cached);
  if (!inFlight) {
    inFlight = loadFinanceSettings()
      .then(settings => {
        publish(settings);
        return settings;
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
};

export interface UseFinanceSettings {
  settings: FinanceSettings;
  isLoading: boolean;
  /** Guarda y propaga a todas las pantallas montadas. */
  save: (next: FinanceSettings) => Promise<SaveResult>;
  reload: () => Promise<void>;
}

export function useFinanceSettings(): UseFinanceSettings {
  const [settings, setSettings] = useState<FinanceSettings>(cached || DEFAULT_FINANCE_SETTINGS);
  const [isLoading, setIsLoading] = useState(!cached);

  useEffect(() => {
    let active = true;

    listeners.add(setSettings);
    ensureLoaded().then(() => {
      if (active) setIsLoading(false);
    });

    return () => {
      active = false;
      listeners.delete(setSettings);
    };
  }, []);

  const save = useCallback(async (next: FinanceSettings): Promise<SaveResult> => {
    const result = await saveFinanceSettings(next);
    publish(result.settings);
    return result;
  }, []);

  const reload = useCallback(async () => {
    cached = null;
    setIsLoading(true);
    await ensureLoaded();
    setIsLoading(false);
  }, []);

  return { settings, isLoading, save, reload };
}
