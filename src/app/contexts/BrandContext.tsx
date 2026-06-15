import { createContext, useContext, useState, ReactNode } from 'react';

export interface BrandConfig {
  companyId: string;
  companyName: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  type: 'main' | 'consulting'; // Empresa principal vs cliente consultoría
}

interface BrandContextType {
  brandConfig: BrandConfig;
  setBrandConfig: (config: BrandConfig) => void;
}

const defaultBrand: BrandConfig = {
  companyId: 'default',
  companyName: 'SafeTrack Chile',
  primaryColor: '#FF8C00',
  secondaryColor: '#0055A4',
  accentColor: '#10b981',
  type: 'main'
};

const BrandContext = createContext<BrandContextType>({
  brandConfig: defaultBrand,
  setBrandConfig: () => {}
});

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brandConfig, setBrandConfig] = useState<BrandConfig>(defaultBrand);

  return (
    <BrandContext.Provider value={{ brandConfig, setBrandConfig }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within BrandProvider');
  }
  return context;
}
