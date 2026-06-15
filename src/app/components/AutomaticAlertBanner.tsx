import { useState } from 'react';
import { AlertTriangle, X, Calendar, Bell } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { QuickScheduleModal } from '@/app/components/QuickScheduleModal';
import { toast } from 'sonner';

interface AutomaticAlertBannerProps {
  onSchedule: () => void;
  onDismiss: () => void;
}

export function AutomaticAlertBanner({ onSchedule, onDismiss }: AutomaticAlertBannerProps) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Datos de ejemplo de la alerta (en implementación real vendrían del sistema)
  const alertData = {
    type: 'maintenance' as const,
    itemName: 'Extintor PQS 10kg - Zona Bodega A',
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Hace 5 días
    priority: 'high' as const
  };

  const handleScheduleNow = () => {
    setShowScheduleModal(true);
  };

  const handleScheduleConfirm = (scheduledDate: string, scheduledTime: string, notes: string) => {
    // Aquí se guardaría en el calendario del sistema
    console.log('Mantención agendada:', {
      date: scheduledDate,
      time: scheduledTime,
      notes,
      alert: alertData
    });
    
    setShowScheduleModal(false);
    onSchedule(); // Llamar al callback original para actualizar el estado en el padre
  };

  return (
    <>
      <Card className="fixed top-20 left-4 right-4 lg:left-auto lg:right-4 lg:w-96 z-50 p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border-2 border-red-500 dark:border-red-700 shadow-2xl animate-in slide-in-from-top">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600 flex-shrink-0 animate-pulse">
            <Bell className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-red-900 dark:text-red-100">
                🚨 Alerta Automática
              </h3>
              <Badge className="bg-red-600 text-white text-xs">
                Mantención Vencida
              </Badge>
            </div>
            
            <p className="text-sm text-red-800 dark:text-red-300 mb-3">
              <strong>{alertData.itemName}</strong> - La inspección mensual venció hace 5 días. 
              <span className="block mt-1 text-xs">
                📋 D.S. 594 Art. 44 - Riesgo de multa SEREMI
              </span>
            </p>

            <div className="flex gap-2">
              <Button
                onClick={handleScheduleNow}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white flex-1"
              >
                <Calendar className="w-3 h-3 mr-1" />
                Agendar Ahora
              </Button>
              <Button
                onClick={onDismiss}
                size="sm"
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Modal de Agendamiento Rápido */}
      <QuickScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        alertData={alertData}
        onScheduleConfirm={handleScheduleConfirm}
      />
    </>
  );
}