import { Logo } from '@/app/components/Logo';

interface LogoLoaderProps {
  size?: number;
  text?: string;
  inline?: boolean;
}

/**
 * Componente compacto para mostrar el logo con animación de carga
 * Útil para botones, modales y secciones pequeñas
 */
export function LogoLoader({ size = 40, text = 'Cargando...', inline = false }: LogoLoaderProps) {
  if (inline) {
    return (
      <div className="flex items-center gap-3">
        <Logo size={size} animate="spin" />
        {text && (
          <span className="text-sm text-slate-600 dark:text-zinc-400">
            {text}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Logo size={size} animate="spin" className="mb-3" />
      {text && (
        <p className="text-sm text-slate-600 dark:text-zinc-400">
          {text}
        </p>
      )}
    </div>
  );
}
