import { useState, useRef } from 'react';
import { Mic, MicOff, Volume2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Card } from '@/app/components/ui/card';
import { toast } from 'sonner';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  language?: string;
  continuous?: boolean;
  placeholder?: string;
  buttonVariant?: 'default' | 'floating';
  variant?: 'card' | 'compact';
}

// Extender la interfaz Window para incluir webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function VoiceInput({ 
  onTranscript, 
  language = 'es-CL',
  continuous = true,
  placeholder = 'Presiona el micrófono y comienza a dictar...',
  buttonVariant = 'default',
  variant = 'default'
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  // NO hacer nada automáticamente - solo cuando el usuario haga click

  const checkSupport = (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  };

  const initializeRecognition = (): boolean => {
    if (recognitionRef.current) return true;

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setError('not-supported');
        return false;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = language;
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        if (!isMountedRef.current) return;

        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const conf = event.results[i][0].confidence;

          if (event.results[i].isFinal) {
            final += transcript + ' ';
            setConfidence(Math.round(conf * 100));
          } else {
            interim += transcript;
          }
        }

        setInterimTranscript(interim);
        
        if (final) {
          setFinalTranscript(prev => prev + final);
          onTranscript(final.trim());
        }
      };

      recognition.onerror = (event: any) => {
        if (!isMountedRef.current) return;

        // Ignorar errores menores que no requieren notificación
        if (event.error === 'aborted' || event.error === 'no-speech') {
          setIsListening(false);
          return;
        }
        
        // Solo mostrar toast para errores reales que el usuario necesita saber
        if (event.error === 'not-allowed') {
          toast.error('Permiso de micrófono denegado', {
            description: 'Habilita el micrófono en la configuración del navegador'
          });
        } else if (event.error === 'audio-capture') {
          toast.error('Micrófono no disponible', {
            description: 'Verifica que tu micrófono esté conectado'
          });
        } else if (event.error === 'network') {
          toast.error('Error de conexión', {
            description: 'Verifica tu conexión a internet'
          });
        }
        
        setIsListening(false);
      };

      recognition.onend = () => {
        if (!isMountedRef.current) return;

        if (isListening) {
          try {
            recognition.start();
          } catch (e) {
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
      return true;
    } catch (error) {
      console.error('Error initializing recognition:', error);
      setError('init-failed');
      return false;
    }
  };

  const startListening = () => {
    // Verificar soporte
    if (!checkSupport()) {
      toast.error('Dictado no disponible', {
        description: 'Tu navegador no soporta dictado de voz. Usa Chrome, Edge o Safari.'
      });
      return;
    }

    // Inicializar si es necesario
    if (!recognitionRef.current) {
      const initialized = initializeRecognition();
      if (!initialized) {
        toast.error('No se pudo inicializar el dictado');
        return;
      }
    }

    try {
      setIsListening(true);
      setInterimTranscript('');
      setFinalTranscript('');
      setError(null);
      recognitionRef.current.start();
      
      toast.success('🎤 Dictado Activado', {
        description: 'Habla claramente cerca del micrófono',
        duration: 2000
      });
    } catch (error: any) {
      console.error('Error starting recognition:', error);
      
      if (error.message && error.message.includes('already started')) {
        return;
      }
      
      toast.error('Error al iniciar dictado');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      setIsListening(false);
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignorar
      }
      
      toast.info('🔴 Dictado Detenido', {
        duration: 2000
      });
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Variante compacta
  if (variant === 'compact') {
    return (
      <div className="relative inline-block">
        <Button
          type="button"
          size="sm"
          onClick={toggleListening}
          className={`${
            isListening 
              ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
          title={isListening ? 'Detener dictado' : 'Iniciar dictado'}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4 mr-1" />
              Detener
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-1" />
              Dictar
            </>
          )}
        </Button>

        {isListening && interimTranscript && (
          <div className="absolute top-full mt-2 left-0 min-w-[250px] p-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg shadow-xl z-50">
            <div className="text-xs text-slate-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              Escuchando...
            </div>
            <div className="text-sm text-slate-900 dark:text-white italic">"{interimTranscript}"</div>
          </div>
        )}
      </div>
    );
  }

  // Variante flotante
  if (buttonVariant === 'floating') {
    return (
      <div className="relative">
        <Button
          type="button"
          onClick={toggleListening}
          className={`rounded-full w-12 h-12 p-0 shadow-lg transition-all ${
            isListening 
              ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          title={isListening ? 'Detener dictado' : 'Iniciar dictado'}
        >
          {isListening ? (
            <MicOff className="w-5 h-5 text-white" />
          ) : (
            <Mic className="w-5 h-5 text-white" />
          )}
        </Button>

        {isListening && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-600 rounded-full animate-ping" />
        )}

        {isListening && interimTranscript && (
          <div className="absolute top-full mt-2 left-0 right-0 min-w-[200px] p-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg shadow-lg text-xs z-50">
            <div className="text-slate-600 dark:text-zinc-400 mb-1">Escuchando...</div>
            <div className="text-slate-900 dark:text-white italic">"{interimTranscript}"</div>
          </div>
        )}
      </div>
    );
  }

  // Variante card
  if (variant === 'card') {
    return (
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3 mb-3">
          <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
            isListening 
              ? 'bg-red-600 animate-pulse' 
              : 'bg-blue-600'
          }`}>
            {isListening ? (
              <Volume2 className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              🎤 Dictado de Voz
            </h3>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Presiona y habla claramente
            </p>
          </div>
          {isListening && confidence > 0 && (
            <Badge className="bg-green-600 text-white border-0">
              {confidence}% precisión
            </Badge>
          )}
        </div>

        <Button
          onClick={toggleListening}
          className={`w-full ${
            isListening 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4 mr-2" />
              Detener Dictado
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-2" />
              Iniciar Dictado
            </>
          )}
        </Button>

        {isListening && interimTranscript && (
          <div className="mt-3 p-3 bg-white dark:bg-zinc-800 border border-blue-300 dark:border-blue-700 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Escuchando...
              </span>
            </div>
            <div className="text-sm text-blue-800 dark:text-blue-300 italic">
              "{interimTranscript}"
            </div>
          </div>
        )}

        {finalTranscript && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">
                Texto Transcrito:
              </span>
            </div>
            <div className="text-sm text-green-800 dark:text-green-300">
              {finalTranscript}
            </div>
          </div>
        )}
      </Card>
    );
  }

  // Variante default
  return (
    <Card className="p-4 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
      <div className="flex items-center gap-3 mb-3">
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
          isListening 
            ? 'bg-red-600 animate-pulse' 
            : 'bg-blue-600'
        }`}>
          {isListening ? (
            <Volume2 className="w-5 h-5 text-white" />
          ) : (
            <Mic className="w-5 h-5 text-white" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            🎤 Dictado de Voz
          </h3>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            Powered by Google Speech API
          </p>
        </div>
        {isListening && confidence > 0 && (
          <Badge className="bg-green-600 text-white border-0">
            {confidence}% precisión
          </Badge>
        )}
      </div>

      <Button
        onClick={toggleListening}
        className={`w-full mb-3 ${
          isListening 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white text-lg py-6`}
      >
        {isListening ? (
          <>
            <MicOff className="w-5 h-5 mr-2" />
            Detener Dictado
          </>
        ) : (
          <>
            <Mic className="w-5 h-5 mr-2" />
            Iniciar Dictado
          </>
        )}
      </Button>

      {isListening && (
        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Escuchando...
            </span>
          </div>
          {interimTranscript && (
            <div className="text-sm text-blue-800 dark:text-blue-300 italic">
              "{interimTranscript}"
            </div>
          )}
        </div>
      )}

      {finalTranscript && (
        <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-900 dark:text-green-100">
              Texto Transcrito:
            </span>
          </div>
          <div className="text-sm text-green-800 dark:text-green-300">
            {finalTranscript}
          </div>
        </div>
      )}

      {!isListening && !finalTranscript && (
        <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700 rounded-lg text-center">
          <Mic className="w-8 h-8 text-slate-400 dark:text-zinc-600 mx-auto mb-2" />
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            {placeholder}
          </p>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-500">
        <span>Idioma: Español (Chile)</span>
        <span>🇨🇱 API Google</span>
      </div>

      <div className="mt-3 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg">
        <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-2">
          💡 Tips para mejor precisión:
        </h4>
        <ul className="text-xs text-slate-600 dark:text-zinc-400 space-y-1">
          <li>• Habla claramente y a velocidad normal</li>
          <li>• Mantén el micrófono a 10-15 cm de tu boca</li>
          <li>• Di "punto" para agregar un punto (.)</li>
          <li>• Di "coma" para agregar una coma (,)</li>
          <li>• Evita ruido de fondo</li>
        </ul>
      </div>
    </Card>
  );
}