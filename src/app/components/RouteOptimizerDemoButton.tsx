import { Route, MapPin, Navigation } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';

interface RouteOptimizerDemoButtonProps {
  onClick: () => void;
}

export function RouteOptimizerDemoButton({ onClick }: RouteOptimizerDemoButtonProps) {
  return (
    <Card 
      className="bg-gradient-to-r from-orange-50 to-blue-50 dark:from-orange-950/20 dark:to-blue-950/20 border-2 border-orange-300 dark:border-orange-800 hover:border-orange-500 dark:hover:border-orange-600 cursor-pointer hover:shadow-xl active:scale-[0.98] transition-all"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-orange-600 to-red-600 shadow-lg flex-shrink-0">
            <Route className="w-7 h-7 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              🗺️ Optimización de Rutas & Agenda
              <span className="text-xs font-normal px-2 py-0.5 bg-green-600 text-white rounded-full">
                NUEVO
              </span>
            </h3>
            <p className="text-sm text-slate-700 dark:text-zinc-300 mb-3">
              Planifica tu día con rutas optimizadas por Google Maps y gestiona tus prioridades
            </p>
            
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-zinc-800 rounded-full border border-slate-200 dark:border-zinc-700">
                <MapPin className="w-3 h-3 text-orange-600" />
                <span className="text-slate-700 dark:text-zinc-300">Mapa en tiempo real</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-zinc-800 rounded-full border border-slate-200 dark:border-zinc-700">
                <Navigation className="w-3 h-3 text-blue-600" />
                <span className="text-slate-700 dark:text-zinc-300">Rutas optimizadas</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-zinc-800 rounded-full border border-slate-200 dark:border-zinc-700">
                <span className="text-slate-700 dark:text-zinc-300">✅ Tareas customizables</span>
              </div>
            </div>
          </div>
        </div>

        <Button className="w-full mt-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white">
          <Route className="w-4 h-4 mr-2" />
          Abrir Planificador
        </Button>
      </div>
    </Card>
  );
}
