/**
 * EJEMPLO DE IMPLEMENTACIÓN DE FILTRADO POR EMPRESA/SUCURSAL
 * 
 * Este archivo muestra cómo implementar correctamente el filtrado de datos
 * en cualquier componente de SafeTrack Chile
 */

import { useState, useEffect } from 'react';
import { useFilteredData, useFilterContext, useCreateWithContext } from '@/app/hooks/useFilteredData';
import { useCompany } from '@/app/context/CompanyContext';
import { ContextIndicator, NoCompanyWarning } from '@/app/components/ContextIndicator';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Plus } from 'lucide-react';

// PASO 1: Definir la interfaz de datos con companyId y branchId
interface InspectionRecord {
  id: string;
  companyId: string;  // ⚠️ OBLIGATORIO: Identifica la empresa
  branchId?: string;   // ⚠️ OPCIONAL: Si es dato de sucursal específica
  date: string;
  inspector: string;
  status: 'completed' | 'pending';
  findings: number;
  // ... otros campos específicos del dominio
}

// PASO 2: Mock data con contexto de empresa/sucursal
const MOCK_INSPECTIONS: InspectionRecord[] = [
  {
    id: '1',
    companyId: '1', // Constructora Los Andes
    branchId: 'B1-1', // Obra Portal Ñuñoa
    date: '2026-01-20',
    inspector: 'Juan Pérez',
    status: 'completed',
    findings: 3
  },
  {
    id: '2',
    companyId: '1', // Constructora Los Andes
    branchId: 'B1-2', // Obra Edificio Apoquindo
    date: '2026-01-21',
    inspector: 'María González',
    status: 'completed',
    findings: 1
  },
  {
    id: '3',
    companyId: '1', // Constructora Los Andes
    // Sin branchId = dato general de la empresa
    date: '2026-01-22',
    inspector: 'Carlos Ramírez',
    status: 'pending',
    findings: 0
  },
  {
    id: '4',
    companyId: '2', // Minera Atacama Norte
    branchId: 'B2-1', // Faena Mina Esperanza
    date: '2026-01-23',
    inspector: 'Ana Torres',
    status: 'completed',
    findings: 5
  },
  {
    id: '5',
    companyId: '2', // Minera Atacama Norte
    date: '2026-01-24',
    inspector: 'Pedro Silva',
    status: 'pending',
    findings: 0
  }
];

export function FilteredDataExample() {
  const { isCompanySelected } = useCompany();
  
  // PASO 3: Si no hay empresa seleccionada, mostrar advertencia
  if (!isCompanySelected) {
    return (
      <div className="p-6">
        <NoCompanyWarning />
      </div>
    );
  }

  return <FilteredDataContent />;
}

function FilteredDataContent() {
  // PASO 4: Usar el hook de filtrado
  const filteredInspections = useFilteredData(MOCK_INSPECTIONS);
  const filterContext = useFilterContext();
  const createWithContext = useCreateWithContext();

  // PASO 5: Estado local para datos del módulo
  const [inspections, setInspections] = useState<InspectionRecord[]>(MOCK_INSPECTIONS);

  // Actualizar datos filtrados cuando cambie el contexto
  const visibleInspections = useFilteredData(inspections);

  // PASO 6: Función para crear nuevos registros con contexto automático
  const handleCreateInspection = () => {
    const newInspection = createWithContext({
      id: `new-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      inspector: 'Nuevo Inspector',
      status: 'pending' as const,
      findings: 0
    });

    setInspections([...inspections, newInspection]);
    console.log('Nueva inspección creada:', newInspection);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-6">
      {/* PASO 7: Mostrar indicador de contexto */}
      <div className="max-w-7xl mx-auto space-y-6">
        <ContextIndicator variant="banner" showWarning />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                Ejemplo de Filtrado de Datos
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Mostrando {visibleInspections.length} de {inspections.length} inspecciones totales
              </p>
            </div>
            <Button onClick={handleCreateInspection}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Inspección
            </Button>
          </div>

          {/* Info del contexto actual */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 p-4">
            <div className="text-sm">
              <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Contexto Actual:
              </p>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                <li>• Empresa: {filterContext.companyName}</li>
                {filterContext.isBranchSelected && (
                  <li>• Sucursal: {filterContext.branchName}</li>
                )}
                <li>• Registros visibles: {visibleInspections.length}</li>
              </ul>
            </div>
          </Card>

          {/* Lista de registros filtrados */}
          <div className="space-y-3">
            {visibleInspections.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-zinc-500 dark:text-zinc-400">
                  No hay inspecciones registradas para {filterContext.contextLabel}
                </p>
              </Card>
            ) : (
              visibleInspections.map((inspection) => (
                <Card key={inspection.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-white">
                        Inspección {inspection.id}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Inspector: {inspection.inspector} • {inspection.date}
                      </p>
                      {inspection.branchId && (
                        <p className="text-xs text-[#FF8C00] mt-1">
                          Sucursal específica
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        inspection.status === 'completed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {inspection.status === 'completed' ? 'Completada' : 'Pendiente'}
                      </span>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        {inspection.findings} hallazgos
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Tabla de debugging */}
          <Card className="p-4">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-3">
              Debug: Todos los Datos (sin filtrar)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700">
                    <th className="text-left py-2">ID</th>
                    <th className="text-left py-2">CompanyId</th>
                    <th className="text-left py-2">BranchId</th>
                    <th className="text-left py-2">Visible</th>
                  </tr>
                </thead>
                <tbody>
                  {inspections.map((inspection) => {
                    const isVisible = visibleInspections.some(v => v.id === inspection.id);
                    return (
                      <tr key={inspection.id} className={`border-b border-zinc-100 dark:border-zinc-800 ${
                        isVisible ? 'bg-green-50 dark:bg-green-900/10' : 'opacity-40'
                      }`}>
                        <td className="py-2">{inspection.id}</td>
                        <td className="py-2">{inspection.companyId}</td>
                        <td className="py-2">{inspection.branchId || '-'}</td>
                        <td className="py-2">
                          {isVisible ? '✅ Sí' : '❌ No'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/**
 * RESUMEN DE IMPLEMENTACIÓN:
 * 
 * 1. ✅ Agregar companyId (obligatorio) y branchId (opcional) a todas las interfaces
 * 2. ✅ Usar useFilteredData() para obtener datos filtrados automáticamente
 * 3. ✅ Usar useCreateWithContext() para crear datos con contexto automático
 * 4. ✅ Mostrar NoCompanyWarning cuando no hay empresa seleccionada
 * 5. ✅ Usar ContextIndicator para mostrar el contexto actual
 * 6. ✅ Usar useFilterContext() para obtener información del contexto
 * 
 * BENEFICIOS:
 * - ✅ Aislamiento completo de datos por empresa/sucursal
 * - ✅ Prevención de mezcla de información
 * - ✅ Trazabilidad: siempre se sabe de dónde viene cada dato
 * - ✅ Seguridad: datos sensibles quedan protegidos
 * - ✅ UX clara: usuario siempre sabe en qué contexto está trabajando
 */
