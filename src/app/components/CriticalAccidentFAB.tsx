import { useState, useEffect } from 'react';
import { AlertTriangle, X, ChevronRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';

interface CriticalAccidentFABProps {
  onActivate: () => void;
  isVisible: boolean;
}

export function CriticalAccidentFAB({ onActivate, isVisible }: CriticalAccidentFABProps) {
  const [isPulsing, setIsPulsing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasSeenTooltip, setHasSeenTooltip] = useState(false);

  useEffect(() => {
    // Mostrar tooltip solo la primera vez
    if (isVisible && !hasSeenTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        setHasSeenTooltip(true);
        
        // Ocultar tooltip después de 5 segundos
        setTimeout(() => {
          setShowTooltip(false);
        }, 5000);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, hasSeenTooltip]);

  // Efecto de pulsación cada 10 segundos
  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 2000);
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Tooltip inicial */}
      {showTooltip && (
        <div className="fixed bottom-32 right-6 z-50 max-w-xs animate-in fade-in slide-in-from-bottom-4">
          <Card className="p-4 bg-red-600 border-red-700 shadow-2xl">
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute top-2 right-2 text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-start gap-3 pr-6">
              <AlertTriangle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white mb-1">
                  🚨 Botón de Emergencia
                </h4>
                <p className="text-sm text-white/90">
                  En caso de accidente laboral, presiona este botón para iniciar el protocolo de emergencia con asistente guiado.
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/20">
              <button
                onClick={() => {
                  setShowTooltip(false);
                  onActivate();
                }}
                className="text-sm text-white font-medium flex items-center gap-2 hover:gap-3 transition-all"
              >
                Ver protocolo
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={onActivate}
        className={`
          fixed bottom-20 right-6 z-40
          w-16 h-16 lg:w-20 lg:h-20
          rounded-full
          bg-gradient-to-br from-red-600 to-red-700
          hover:from-red-700 hover:to-red-800
          active:scale-95
          shadow-2xl
          flex items-center justify-center
          transition-all duration-200
          border-4 border-white dark:border-zinc-900
          group
          ${isPulsing ? 'animate-pulse scale-110' : ''}
        `}
        aria-label="Botón de Emergencia - Accidente Laboral"
      >
        {/* Rings de pulsación */}
        <span className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-20" />
        <span className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-20" style={{ animationDelay: '0.5s' }} />

        {/* Icono */}
        <AlertTriangle className="w-8 h-8 lg:w-10 lg:h-10 text-white drop-shadow-lg group-hover:scale-110 transition-transform" />

        {/* Badge de texto en hover */}
        <div className="absolute -top-12 right-0 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          <div className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-lg">
            🚨 Accidente Laboral
          </div>
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-red-600 mx-auto" />
        </div>
      </button>

      {/* Vibration effect on mount */}
      <style>{`
        @keyframes vibrate {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          10% { transform: translate(-2px, -2px) rotate(-1deg); }
          20% { transform: translate(2px, 2px) rotate(1deg); }
          30% { transform: translate(-2px, 2px) rotate(-1deg); }
          40% { transform: translate(2px, -2px) rotate(1deg); }
          50% { transform: translate(-2px, -2px) rotate(-1deg); }
          60% { transform: translate(2px, 2px) rotate(1deg); }
          70% { transform: translate(-2px, 2px) rotate(-1deg); }
          80% { transform: translate(2px, -2px) rotate(1deg); }
          90% { transform: translate(-2px, -2px) rotate(-1deg); }
        }
        
        .animate-vibrate {
          animation: vibrate 0.3s linear;
        }
      `}</style>
    </>
  );
}
