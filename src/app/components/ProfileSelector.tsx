import { Building2, Briefcase } from 'lucide-react';
import { Card } from '@/app/components/ui/card';

interface ProfileSelectorProps {
  onSelectProfile: (profile: 'main' | 'consulting') => void;
}

export function ProfileSelector({ onSelectProfile }: ProfileSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FF8C00] rounded-full mb-4">
            <span className="text-3xl font-bold text-white">ST</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SafeTrack Chile</h1>
          <p className="text-zinc-400">Selecciona tu perfil de trabajo</p>
        </div>

        {/* Profile Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Empresa Principal */}
          <Card
            onClick={() => onSelectProfile('main')}
            className="bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700 p-8 cursor-pointer hover:scale-105 hover:border-[#FF8C00] transition-all duration-300 group"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#0055A4] to-blue-700 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Empresa Principal</h2>
              <p className="text-zinc-400 mb-6">
                Gestiona tu empresa con sucursales y múltiples plantas
              </p>
              <div className="space-y-2 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#0055A4] rounded-full" />
                  <span>Acceso a todas las sucursales</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#0055A4] rounded-full" />
                  <span>Dashboard corporativo completo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#0055A4] rounded-full" />
                  <span>Gestión de personal interno</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Consultor Independiente */}
          <Card
            onClick={() => onSelectProfile('consulting')}
            className="bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700 p-8 cursor-pointer hover:scale-105 hover:border-[#FF8C00] transition-all duration-300 group"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#FF8C00] to-orange-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Consultor Independiente</h2>
              <p className="text-zinc-400 mb-6">
                Gestiona tu cartera de clientes y asesorías externas
              </p>
              <div className="space-y-2 text-sm text-zinc-500">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#FF8C00] rounded-full" />
                  <span>Cartera de clientes activos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#FF8C00] rounded-full" />
                  <span>Sandboxing por cliente</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#FF8C00] rounded-full" />
                  <span>Informes de asesoría</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-500">
            Puedes cambiar tu perfil en cualquier momento desde la configuración
          </p>
        </div>
      </div>
    </div>
  );
}
