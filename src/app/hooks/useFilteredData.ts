import { useMemo } from 'react';
import { useCompany } from '@/app/context/CompanyContext';

/**
 * Hook personalizado para filtrar datos según la empresa/sucursal seleccionada
 * Todos los datos en SafeTrack deben tener companyId y opcionalmente branchId
 */

export interface FilterableData {
  companyId: string;
  branchId?: string;
  [key: string]: any;
}

export function useFilteredData<T extends FilterableData>(data: T[]): T[] {
  const { selectedCompany, selectedBranch } = useCompany();

  return useMemo(() => {
    // Si no hay empresa seleccionada, no mostrar datos
    if (!selectedCompany) {
      return [];
    }

    // Filtrar por empresa
    let filtered = data.filter(item => item.companyId === selectedCompany.id);

    // Si hay sucursal seleccionada, filtrar también por sucursal
    if (selectedBranch) {
      filtered = filtered.filter(item => {
        // Si el item no tiene branchId, es un dato general de la empresa (mostrar)
        // Si tiene branchId, debe coincidir con la sucursal seleccionada
        return !item.branchId || item.branchId === selectedBranch.id;
      });
    }

    return filtered;
  }, [data, selectedCompany, selectedBranch]);
}

/**
 * Hook para verificar si se debe mostrar un dato específico
 */
export function useIsDataVisible(companyId: string, branchId?: string): boolean {
  const { selectedCompany, selectedBranch } = useCompany();

  if (!selectedCompany) return false;
  if (selectedCompany.id !== companyId) return false;
  
  // Si hay sucursal seleccionada y el dato tiene branchId, deben coincidir
  if (selectedBranch && branchId && branchId !== selectedBranch.id) {
    return false;
  }

  return true;
}

/**
 * Hook para obtener el contexto actual de filtrado
 */
export function useFilterContext() {
  const { selectedCompany, selectedBranch, isCompanySelected, isBranchSelected } = useCompany();

  return {
    companyId: selectedCompany?.id,
    branchId: selectedBranch?.id,
    companyName: selectedCompany?.name,
    branchName: selectedBranch?.name,
    isCompanySelected,
    isBranchSelected,
    hasCompanyContext: isCompanySelected,
    hasBranchContext: isBranchSelected,
    // Devuelve el label apropiado para mostrar en la UI
    contextLabel: isBranchSelected 
      ? `${selectedBranch?.name} (${selectedCompany?.name})`
      : selectedCompany?.name || 'Sin empresa seleccionada'
  };
}

/**
 * Hook para crear nuevos datos con el contexto correcto
 */
export function useCreateWithContext() {
  const { selectedCompany, selectedBranch } = useCompany();

  return <T extends Record<string, any>>(baseData: T): T & { companyId: string; branchId?: string } => {
    if (!selectedCompany) {
      throw new Error('Debe seleccionar una empresa antes de crear datos');
    }

    return {
      ...baseData,
      companyId: selectedCompany.id,
      ...(selectedBranch && { branchId: selectedBranch.id })
    };
  };
}

/**
 * Hook para filtrar datos con soporte para información general de seguridad en sucursales
 */
export function useFilteredDataWithSharedInfo<T extends FilterableData>(
  data: T[],
  options?: {
    includeCompanyLevelData?: boolean; // Si es true, incluye datos sin branchId cuando hay sucursal seleccionada
  }
): T[] {
  const { selectedCompany, selectedBranch } = useCompany();
  const includeCompanyLevelData = options?.includeCompanyLevelData ?? true;

  return useMemo(() => {
    if (!selectedCompany) {
      return [];
    }

    // Filtrar por empresa
    let filtered = data.filter(item => item.companyId === selectedCompany.id);

    // Si hay sucursal seleccionada
    if (selectedBranch) {
      filtered = filtered.filter(item => {
        // Si no tiene branchId (dato general de empresa)
        if (!item.branchId) {
          // Incluir solo si la opción está habilitada
          return includeCompanyLevelData;
        }
        // Si tiene branchId, debe coincidir
        return item.branchId === selectedBranch.id;
      });
    }

    return filtered;
  }, [data, selectedCompany, selectedBranch, includeCompanyLevelData]);
}
