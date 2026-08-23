import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface Props {
  children: ReactNode;
  /** Al cambiar, se reintenta el render. Se usa la vista actual. */
  resetKey?: string;
}

interface State {
  error: Error | null;
}

/**
 * Red de seguridad para las vistas cargadas con React.lazy.
 *
 * Al dividir el bundle, cada vista se descarga al abrirla. En terreno con señal
 * intermitente esa descarga puede fallar, y sin este límite React desmonta todo
 * el árbol y el usuario queda con una pantalla en blanco sin forma de salir.
 * Aquí se muestra el error con un botón de reintento.
 */
export class ViewErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(prevProps: Props) {
    // Navegar a otra vista limpia el error: la vista nueva merece su intento.
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Vista] fallo al renderizar:', error, info.componentStack);
  }

  private handleRetry = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    // Un chunk que no se pudo descargar necesita recargar la página: el módulo
    // quedó marcado como fallido y reintentar el render no lo vuelve a pedir.
    const isChunkError = /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(
      error.message
    );

    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>

          <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
            {isChunkError ? 'No se pudo cargar esta sección' : 'Algo salió mal en esta pantalla'}
          </h2>

          <p className="mb-5 text-sm text-slate-600 dark:text-zinc-400">
            {isChunkError
              ? 'Parece un problema de conexión. Revisa tu señal y vuelve a intentar; el resto de la app sigue funcionando.'
              : 'El resto de la app sigue funcionando. Puedes reintentar o volver atrás.'}
          </p>

          <div className="flex justify-center gap-2">
            <Button
              onClick={isChunkError ? () => window.location.reload() : this.handleRetry}
              className="bg-[#FF8C00] text-white hover:bg-[#e67e00]"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </div>

          <p className="mt-4 break-words text-xs text-slate-400 dark:text-zinc-500">{error.message}</p>
        </div>
      </div>
    );
  }
}
