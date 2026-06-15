import { useEffect, useState } from 'react';
import localforage from 'localforage';
import { toast } from 'sonner';

interface OfflineData {
  forms: any[];
  pendingSync: boolean;
}

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingItems, setPendingItems] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Conexión restaurada', {
        description: 'Sincronizando datos pendientes...'
      });
      syncPendingData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Modo Offline', {
        description: 'Los datos se guardarán localmente'
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check pending items on mount
    checkPendingItems();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveFormOffline = async (formData: any) => {
    try {
      const existingData: OfflineData = await localforage.getItem('offline_forms') || { forms: [], pendingSync: false };
      existingData.forms.push({
        ...formData,
        savedAt: new Date().toISOString(),
        synced: false
      });
      existingData.pendingSync = true;
      await localforage.setItem('offline_forms', existingData);
      setPendingItems(existingData.forms.filter(f => !f.synced).length);
      toast.info('Formulario guardado localmente');
    } catch (error) {
      toast.error('Error al guardar datos offline');
    }
  };

  const syncPendingData = async () => {
    try {
      const offlineData: OfflineData | null = await localforage.getItem('offline_forms');
      if (offlineData && offlineData.pendingSync) {
        // Simulate API sync
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        offlineData.forms = offlineData.forms.map(form => ({ ...form, synced: true }));
        offlineData.pendingSync = false;
        await localforage.setItem('offline_forms', offlineData);
        setPendingItems(0);
        toast.success('Datos sincronizados correctamente');
      }
    } catch (error) {
      toast.error('Error al sincronizar datos');
    }
  };

  const checkPendingItems = async () => {
    try {
      const offlineData: OfflineData | null = await localforage.getItem('offline_forms');
      if (offlineData) {
        const pending = offlineData.forms.filter(f => !f.synced).length;
        setPendingItems(pending);
      }
    } catch (error) {
      console.error('Error checking pending items:', error);
    }
  };

  return {
    isOnline,
    pendingItems,
    saveFormOffline,
    syncPendingData
  };
}
