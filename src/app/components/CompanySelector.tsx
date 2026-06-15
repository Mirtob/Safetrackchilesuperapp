import { Building2, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Company } from '@/app/context/CompanyContext';
import { MOCK_COMPANIES } from '@/app/data/mockCompanies';

interface CompanySelectorProps {
  onSelectCompany: (company: Company) => void;
}

export function CompanySelector({ onSelectCompany }: CompanySelectorProps) {
  const getStatusColor = (level: Company['riskLevel']) => {
    switch (level) {
      case 'Alto':
        return 'bg-red-500';
      case 'Medio':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  const getStatusIcon = (level: Company['riskLevel']) => {
    return level === 'Alto' ? (
      <AlertCircle className="w-5 h-5 text-red-500" />
    ) : (
      <CheckCircle className="w-5 h-5 text-green-500" />
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-4 pb-20 transition-colors">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 pt-4">
          <h1 className="text-zinc-900 dark:text-white text-2xl mb-2">Mis Empresas</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Selecciona una empresa para gestionar</p>
        </div>

        {/* Company Cards */}
        <div className="space-y-3">
          {MOCK_COMPANIES.map((company) => (
            <Card
              key={company.id}
              className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-[#FF8C00] transition-all cursor-pointer active:scale-98"
              onClick={() => onSelectCompany(company)}
            >
              <div className="p-5">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="bg-zinc-100 dark:bg-zinc-700 p-2.5 rounded-lg">
                      <Building2 className="w-6 h-6 text-zinc-900 dark:text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-zinc-900 dark:text-white mb-1">{company.name}</h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">RUT: {company.rut}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs">
                          {company.branches?.length || 0} sucursales
                        </Badge>
                        <Badge variant="secondary" className="bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs">
                          {company.industry}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
                </div>

                {/* Compliance Indicator */}
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(company.riskLevel)}
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        Nivel de Riesgo
                      </span>
                    </div>
                    <span className="text-zinc-900 dark:text-white">{company.riskLevel}</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${getStatusColor(company.riskLevel)} transition-all`}
                      style={{ width: `${company.riskLevel === 'Alto' ? '100%' : '50%'}` }}
                    />
                  </div>
                  
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                    Trabajadores: {company.workerCount}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}