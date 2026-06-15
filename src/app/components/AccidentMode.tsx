import { AccidentReportFormComplete } from '@/app/components/AccidentReportFormComplete';
import { toast } from 'sonner';

interface AccidentModeProps {
  onBack: () => void;
}

export function AccidentMode({ onBack }: AccidentModeProps) {
  const handleAccidentSubmit = (data: any) => {
    // El formulario ya maneja el toast de éxito
    console.log('Informe de accidente enviado:', data);
    
    // Volver al centro de campo después del envío
    setTimeout(() => {
      onBack();
    }, 3000);
  };

  return (
    <AccidentReportFormComplete
      onBack={onBack}
      onSubmit={handleAccidentSubmit}
    />
  );
}