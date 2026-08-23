/**
 * Dictado por voz reutilizable — SafeTrack Chile
 *
 * Envuelve la Web Speech API para que cualquier campo del formulario pueda
 * dictarse. Pensado para un prevencionista en terreno: con casco, guantes o las
 * manos ocupadas, escribir en el teléfono es lo más lento del reporte.
 *
 * Solo puede haber un dictado activo a la vez en toda la app: el micrófono es
 * un recurso único y dos campos escuchando a la vez se roban el audio entre sí.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

/** Id del campo que tiene el micrófono tomado, para que los demás se apaguen. */
let activeDictationId: string | null = null;
const activeListeners = new Set<(id: string | null) => void>();

const setActiveDictation = (id: string | null): void => {
  activeDictationId = id;
  activeListeners.forEach(fn => fn(id));
};

export const isSpeechSupported = (): boolean =>
  typeof window !== 'undefined' &&
  Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

export interface UseSpeechDictation {
  isListening: boolean;
  /** Texto provisional mientras el motor aún no confirma la frase. */
  interim: string;
  isSupported: boolean;
  start: () => void;
  stop: () => void;
  toggle: () => void;
}

interface Options {
  /** Recibe cada fragmento ya confirmado. */
  onResult: (text: string) => void;
  language?: string;
}

export function useSpeechDictation({ onResult, language = 'es-CL' }: Options): UseSpeechDictation {
  const [isListening, setIsListening] = useState(false);
  const [interim, setInterim] = useState('');

  const recognitionRef = useRef<any>(null);
  const mountedRef = useRef(true);
  // El id identifica a esta instancia dentro del registro global de dictado.
  const idRef = useRef(`dictation-${Math.random().toString(36).slice(2)}`);
  // La callback vive en una ref para que el handler del motor siempre use la
  // versión actual sin tener que reconstruir el reconocedor en cada render.
  const onResultRef = useRef(onResult);
  const shouldListenRef = useRef(false);

  useEffect(() => { onResultRef.current = onResult; }, [onResult]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      shouldListenRef.current = false;
      try { recognitionRef.current?.stop(); } catch { /* ya detenido */ }
      if (activeDictationId === idRef.current) setActiveDictation(null);
    };
  }, []);

  // Si otro campo toma el micrófono, este se apaga solo.
  useEffect(() => {
    const listener = (id: string | null) => {
      if (id !== idRef.current && shouldListenRef.current) {
        shouldListenRef.current = false;
        try { recognitionRef.current?.stop(); } catch { /* ya detenido */ }
        setIsListening(false);
        setInterim('');
      }
    };
    activeListeners.add(listener);
    return () => { activeListeners.delete(listener); };
  }, []);

  const build = useCallback((): boolean => {
    if (recognitionRef.current) return true;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return false;

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      if (!mountedRef.current) return;

      let provisional = '';
      let confirmed = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) confirmed += text + ' ';
        else provisional += text;
      }

      setInterim(provisional);
      if (confirmed.trim()) onResultRef.current(confirmed.trim());
    };

    recognition.onerror = (event: any) => {
      if (!mountedRef.current) return;

      // Silencio o corte deliberado no son fallos que valga la pena anunciar.
      if (event.error === 'aborted' || event.error === 'no-speech') return;

      if (event.error === 'not-allowed') {
        toast.error('Permiso de micrófono denegado', {
          description: 'Habilítalo en la configuración del navegador para dictar.',
        });
      } else if (event.error === 'audio-capture') {
        toast.error('Micrófono no disponible', {
          description: 'Revisa que el micrófono esté conectado.',
        });
      } else if (event.error === 'network') {
        toast.error('Sin conexión para el dictado', {
          description: 'El reconocimiento de voz necesita internet.',
        });
      }

      shouldListenRef.current = false;
      setIsListening(false);
      setInterim('');
    };

    recognition.onend = () => {
      if (!mountedRef.current) return;

      // El motor corta solo tras unos segundos de silencio. Si el usuario no
      // pidió detenerse, se reanuda: en terreno se piensa entre frase y frase.
      if (shouldListenRef.current) {
        try {
          recognition.start();
          return;
        } catch {
          // No se pudo reanudar; se cae al estado detenido.
        }
      }

      setIsListening(false);
      setInterim('');
    };

    recognitionRef.current = recognition;
    return true;
  }, [language]);

  const start = useCallback(() => {
    if (!isSpeechSupported()) {
      toast.error('Dictado no disponible', {
        description: 'Este navegador no reconoce voz. Usa Chrome, Edge o Safari.',
      });
      return;
    }

    if (!build()) return;

    // Reclama el micrófono; cualquier otro campo escuchando se apaga.
    setActiveDictation(idRef.current);
    shouldListenRef.current = true;

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      // "already started" ocurre si el motor aún no procesó el stop anterior.
      if (!String((err as Error)?.message).includes('already started')) {
        shouldListenRef.current = false;
        setIsListening(false);
        toast.error('No se pudo iniciar el dictado');
      }
    }
  }, [build]);

  const stop = useCallback(() => {
    shouldListenRef.current = false;
    try { recognitionRef.current?.stop(); } catch { /* ya detenido */ }
    if (activeDictationId === idRef.current) setActiveDictation(null);
    setIsListening(false);
    setInterim('');
  }, []);

  const toggle = useCallback(() => {
    if (isListening) stop();
    else start();
  }, [isListening, start, stop]);

  return { isListening, interim, isSupported: isSpeechSupported(), start, stop, toggle };
}
