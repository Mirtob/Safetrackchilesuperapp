import { createContext, useContext, useState, ReactNode } from 'react';

export interface Branch {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  contactPerson: string;
  phone: string;
  workerCount: number;
}

export interface Company {
  id: string;
  name: string;
  rut: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  branches?: Branch[];
  industry: string;
  riskLevel: 'Bajo' | 'Medio' | 'Alto';
  workerCount: number;
  contractStart: string;
  contactPerson: string;
  phone: string;
  email: string;
  mutual?: string;
}

interface CompanyContextType {
  selectedCompany: Company | null;
  selectedBranch: Branch | null;
  setSelectedCompany: (company: Company | null) => void;
  setSelectedBranch: (branch: Branch | null) => void;
  clearSelection: () => void;
  isCompanySelected: boolean;
  isBranchSelected: boolean;
  getCurrentLocation: () => { company: Company | null; branch: Branch | null };
  requireCompany: () => Company; // Lanza error si no hay empresa seleccionada
  getContextString: () => string; // Devuelve string descriptivo del contexto actual
  isDataFromCurrentContext: (companyId: string, branchId?: string) => boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const clearSelection = () => {
    setSelectedCompany(null);
    setSelectedBranch(null);
  };

  const getCurrentLocation = () => {
    return {
      company: selectedCompany,
      branch: selectedBranch
    };
  };

  const requireCompany = (): Company => {
    if (!selectedCompany) {
      throw new Error('Debe seleccionar una empresa antes de realizar esta acción');
    }
    return selectedCompany;
  };

  const getContextString = (): string => {
    if (!selectedCompany) {
      return 'Sin empresa seleccionada';
    }
    
    if (selectedBranch) {
      return `${selectedBranch.name} (${selectedCompany.name})`;
    }
    
    return selectedCompany.name;
  };

  const isDataFromCurrentContext = (companyId: string, branchId?: string): boolean => {
    if (!selectedCompany) return false;
    if (selectedCompany.id !== companyId) return false;
    
    // Si hay sucursal seleccionada y el dato tiene branchId, deben coincidir
    if (selectedBranch && branchId && branchId !== selectedBranch.id) {
      return false;
    }
    
    return true;
  };

  return (
    <CompanyContext.Provider
      value={{
        selectedCompany,
        selectedBranch,
        setSelectedCompany,
        setSelectedBranch,
        clearSelection,
        isCompanySelected: selectedCompany !== null,
        isBranchSelected: selectedBranch !== null,
        getCurrentLocation,
        requireCompany,
        getContextString,
        isDataFromCurrentContext
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany debe ser usado dentro de un CompanyProvider');
  }
  return context;
}