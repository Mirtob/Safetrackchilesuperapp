import { Logo } from '@/app/components/Logo';
import { motion } from 'motion/react';
import { FileText, CheckCircle2, Clock } from 'lucide-react';

interface ReportGeneratingProps {
  reportType?: string;
  progress?: number;
  currentStep?: string;
  step?: string;
  onClose?: () => void;
}

export function ReportGenerating({ 
  reportType = 'Informe Mensual',
  progress = 0,
  currentStep,
  step,
  onClose
}: ReportGeneratingProps) {
  const displayStep = currentStep || step || 'Recopilando datos...';
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-200 dark:border-zinc-800"
      >
        {/* Logo girando */}
        <div className="mb-6 flex justify-center">
          <Logo size={100} animate="spin" />
        </div>

        {/* Título */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Generando {reportType}
            </h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            Por favor espera mientras procesamos la información
          </p>
        </div>

        {/* Paso actual */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {displayStep}
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-600 dark:text-zinc-400 mb-2">
            <span>Progreso</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-600 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Pasos del proceso */}
        <div className="space-y-3">
          <StepItem 
            completed={progress > 0} 
            active={progress <= 25}
            text="Recopilando información" 
          />
          <StepItem 
            completed={progress > 25} 
            active={progress > 25 && progress <= 50}
            text="Analizando cumplimiento" 
          />
          <StepItem 
            completed={progress > 50} 
            active={progress > 50 && progress <= 75}
            text="Generando gráficos" 
          />
          <StepItem 
            completed={progress > 75} 
            active={progress > 75 && progress < 100}
            text="Finalizando documento" 
          />
        </div>

        {/* Nota legal */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800">
          <p className="text-xs text-center text-slate-500 dark:text-zinc-500">
            🔒 Documento con validez legal según Ley 16.744
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function StepItem({ completed, active, text }: { completed: boolean; active: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
      active ? 'bg-blue-50 dark:bg-blue-950/20' : ''
    }`}>
      {completed ? (
        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
      ) : (
        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
          active 
            ? 'border-blue-600 dark:border-blue-400 animate-pulse' 
            : 'border-slate-300 dark:border-zinc-700'
        }`} />
      )}
      <span className={`text-sm ${
        completed 
          ? 'text-slate-900 dark:text-white font-medium' 
          : active
          ? 'text-blue-900 dark:text-blue-100 font-medium'
          : 'text-slate-500 dark:text-zinc-500'
      }`}>
        {text}
      </span>
    </div>
  );
}