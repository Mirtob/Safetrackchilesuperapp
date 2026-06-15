import { useState } from 'react';
import { BarChart3, Code, User, DollarSign, Clock, Briefcase, ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Button } from '@/app/components/ui/button';
import { ManagementDashboard } from '@/app/components/strategic/ManagementDashboard';
import { APIDocumentationPanel } from '@/app/components/strategic/APIDocumentationPanel';

interface StrategicPanelProps {
  onBack: () => void;
}

export function StrategicPanel({ onBack }: StrategicPanelProps) {
  const [activeTab, setActiveTab] = useState('management');

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 transition-colors">
      <div className="max-w-7xl mx-auto p-6 pb-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#0055A4] p-3 rounded-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                Panel Estratégico
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                Herramientas de gestión avanzada para gerencia y equipos TI
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="absolute top-6 left-6"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-1">
            <TabsTrigger
              value="management"
              className="data-[state=active]:bg-[#0055A4] data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard Gerencial
            </TabsTrigger>
            
            <TabsTrigger
              value="api"
              className="data-[state=active]:bg-[#0055A4] data-[state=active]:text-white"
            >
              <Code className="w-4 h-4 mr-2" />
              API para TI
            </TabsTrigger>
          </TabsList>

          {/* Content */}
          <div className="mt-6">
            <TabsContent value="management" className="m-0">
              <ManagementDashboard />
            </TabsContent>

            <TabsContent value="api" className="m-0">
              <APIDocumentationPanel />
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer info */}
        <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-zinc-600 dark:text-zinc-400">
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-white mb-2">
                🎯 Dashboard Gerencial
              </h4>
              <p>
                Vista ejecutiva con KPIs de cumplimiento, tendencias y métricas consolidadas de todas las empresas.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-white mb-2">
                💻 API para Equipos TI
              </h4>
              <p>
                Documentación completa de endpoints REST, autenticación y ejemplos de código para integración externa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}