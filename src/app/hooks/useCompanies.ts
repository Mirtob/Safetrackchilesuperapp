import { useState, useEffect, useCallback } from 'react';
import { Company } from '@/app/context/CompanyContext';
import { fetchUserCompanies, createCompany as createCompanyInDB } from '@/app/services/companiesService';
import { isSupabaseConfigured } from '@/app/services/supabase';
import { MOCK_COMPANIES } from '@/app/data/mockCompanies';

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      setCompanies(MOCK_COMPANIES);
      setUsingMockData(true);
      setIsLoading(false);
      return;
    }

    try {
      const data = await fetchUserCompanies();
      setCompanies(data.length > 0 ? data : MOCK_COMPANIES);
      setUsingMockData(data.length === 0);
    } catch (err: any) {
      console.warn('Supabase no disponible, usando datos de demostración:', err.message);
      setCompanies(MOCK_COMPANIES);
      setUsingMockData(true);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addCompany = async (company: Omit<Company, 'id' | 'branches'>): Promise<Company> => {
    const newCompany = await createCompanyInDB(company);
    setCompanies(prev => [...prev, newCompany].sort((a, b) => a.name.localeCompare(b.name)));
    return newCompany;
  };

  return { companies, isLoading, error, usingMockData, reload: load, addCompany };
}
