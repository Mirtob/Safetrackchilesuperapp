import { forwardRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { useSpeechDictation } from '@/app/hooks/useSpeechDictation';

/**
 * Campos de formulario con dictado integrado.
 *
 * El micrófono va dentro del propio campo en lugar de ser un widget aparte: en
 * terreno el prevencionista llena el reporte de pie, muchas veces con una sola
 * mano, y tener que buscar un botón separado por cada campo hace que nadie lo
 * use. Lo dictado se agrega al final de lo que ya haya escrito, de modo que se
 * puede alternar entre teclear y hablar sin perder nada.
 */

interface DictationButtonProps {
  isListening: boolean;
  isSupported: boolean;
  onToggle: () => void;
  label: string;
  className?: string;
}

function DictationButton({ isListening, isSupported, onToggle, label, className = '' }: DictationButtonProps) {
  // Sin soporte del navegador no se muestra un botón que no haría nada.
  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isListening ? `Detener dictado de ${label}` : `Dictar ${label}`}
      aria-pressed={isListening}
      title={isListening ? 'Detener dictado' : 'Dictar'}
      className={`absolute flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
        isListening
          ? 'animate-pulse bg-red-600 text-white hover:bg-red-700'
          : 'text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-zinc-700 dark:hover:text-blue-400'
      } ${className}`}
    >
      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </button>
  );
}

/** Texto provisional: lo que el motor aún no confirma. */
function InterimHint({ text }: { text: string }) {
  if (!text) return null;

  return (
    <p className="mt-1 flex items-start gap-1.5 text-xs italic text-slate-500 dark:text-zinc-400">
      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 animate-pulse rounded-full bg-red-600" />
      {text}
    </p>
  );
}

/** Une lo dictado con lo ya escrito, sin pegar palabras ni duplicar espacios. */
const appendSpeech = (current: string, addition: string): string => {
  const base = current.trimEnd();
  if (!base) return addition;
  // Si la frase anterior terminó en punto, la nueva empieza en mayúscula.
  const needsCapital = /[.!?]$/.test(base);
  const next = needsCapital ? addition.charAt(0).toUpperCase() + addition.slice(1) : addition;
  return `${base} ${next}`;
};

interface DictableInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> {
  value: string;
  onValueChange: (value: string) => void;
  /** Nombre del campo para las etiquetas accesibles del botón. */
  fieldLabel: string;
}

export const DictableInput = forwardRef<HTMLInputElement, DictableInputProps>(
  function DictableInput({ value, onValueChange, fieldLabel, className = '', ...rest }, ref) {
    const { isListening, interim, isSupported, toggle } = useSpeechDictation({
      onResult: text => onValueChange(appendSpeech(value, text)),
    });

    return (
      <div>
        <div className="relative">
          <Input
            ref={ref}
            value={value}
            onChange={e => onValueChange(e.target.value)}
            className={`${isSupported ? 'pr-11' : ''} ${className}`}
            {...rest}
          />
          <DictationButton
            isListening={isListening}
            isSupported={isSupported}
            onToggle={toggle}
            label={fieldLabel}
            className="right-1.5 top-1/2 -translate-y-1/2"
          />
        </div>
        <InterimHint text={interim} />
      </div>
    );
  }
);

interface DictableTextareaProps extends Omit<React.ComponentProps<typeof Textarea>, 'onChange' | 'value'> {
  value: string;
  onValueChange: (value: string) => void;
  fieldLabel: string;
}

export const DictableTextarea = forwardRef<HTMLTextAreaElement, DictableTextareaProps>(
  function DictableTextarea({ value, onValueChange, fieldLabel, className = '', ...rest }, ref) {
    const { isListening, interim, isSupported, toggle } = useSpeechDictation({
      onResult: text => onValueChange(appendSpeech(value, text)),
    });

    return (
      <div>
        <div className="relative">
          <Textarea
            ref={ref}
            value={value}
            onChange={e => onValueChange(e.target.value)}
            className={`${isSupported ? 'pr-12' : ''} ${className}`}
            {...rest}
          />
          <DictationButton
            isListening={isListening}
            isSupported={isSupported}
            onToggle={toggle}
            label={fieldLabel}
            className="right-2 top-2"
          />
        </div>
        <InterimHint text={interim} />
      </div>
    );
  }
);
