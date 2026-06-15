import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Shield, 
  CheckCircle,
  Building2,
  User,
  Phone,
  Mail,
  Clock,
  MapPin
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { AccidentReportFormComplete } from '@/app/components/AccidentReportFormComplete';
import { toast } from 'sonner';

interface QREmergencyAccessProps {
  token: string;
  onComplete?: () => void;
}

interface AccessValidation {
  isValid: boolean;
  companyName?: string;
  companyId?: string;
  message?: string;
}

interface EmergencyUser {
  name: string;
  role: string;
  phone: string;
  email: string;
}

export function QREmergencyAccess({ token, onComplete }: QREmergencyAccessProps) {
  const [validationStatus, setValidationStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [accessData, setAccessData] = useState<AccessValidation | null>(null);
  const [showUserForm, setShowUserForm] = useState(true);
  const [showAccidentForm, setShowAccidentForm] = useState(false);
  const [emergencyUser, setEmergencyUser] = useState<EmergencyUser>({
    name: '',
    role: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    // Simular validación del token
    validateToken(token);
  }, [token]);

  const validateToken = async (token: string) => {
    // Simular llamada a API para validar token
    setTimeout(() => {
      // Tokens válidos de ejemplo
      const validTokens: { [key: string]: AccessValidation } = {
        'QR-EMERGENCY-CONST001-2024': {
          isValid: true,
          companyName: 'Constructora Los Andes',
          companyId: 'const-001'
        },
        'QR-EMERGENCY-MIN002-2024': {
          isValid: true,
          companyName: 'Minera del Norte',
          companyId: 'min-002'
        },
        'QR-EMERGENCY-TRANS003-2024': {
          isValid: false,
          message: 'Este código QR ha sido desactivado'
        }
      };

      const validation = validTokens[token];

      if (validation && validation.isValid) {
        setValidationStatus('valid');
        setAccessData(validation);
        toast.success('✅ Código QR válido', {
          description: `Acceso autorizado para ${validation.companyName}`
        });
      } else {
        setValidationStatus('invalid');
        setAccessData(validation || {
          isValid: false,
          message: 'Código QR no válido o expirado'
        });
        toast.error('❌ Código QR inválido', {
          description: validation?.message || 'Este código no es válido'
        });
      }
    }, 1500);
  };

  const handleUserFormSubmit = () => {
    // Validaciones
    if (!emergencyUser.name.trim()) {
      toast.error('Nombre requerido', { description: 'Ingresa tu nombre completo' });
      return;
    }
    if (!emergencyUser.role.trim()) {
      toast.error('Cargo requerido', { description: 'Ingresa tu cargo en la empresa' });
      return;
    }
    if (!emergencyUser.phone.trim()) {
      toast.error('Teléfono requerido', { description: 'Ingresa tu número de contacto' });
      return;
    }

    // Registrar usuario que reporta
    console.log('Usuario que reporta:', emergencyUser);
    
    setShowUserForm(false);
    setShowAccidentForm(true);
    
    toast.success('✅ Datos registrados', {
      description: 'Procede a completar el reporte de accidente'
    });
  };

  const handleAccidentSubmit = (data: any) => {
    // Agregar información del usuario que reporta
    const fullReport = {
      ...data,
      reportedBy: emergencyUser,
      emergencyAccess: true,
      accessToken: token,
      companyId: accessData?.companyId
    };

    console.log('Reporte de emergencia completo:', fullReport);

    toast.success('🚨 Reporte enviado', {
      description: 'El prevencionista ha sido notificado inmediatamente',
      duration: 5000
    });

    // Notificaciones adicionales
    setTimeout(() => {
      toast.info('📧 Email enviado', {
        description: 'Notificación enviada a Prevencionista, Gerencia y RRHH'
      });
    }, 1500);

    setTimeout(() => {
      toast.info('💬 WhatsApp enviado', {
        description: 'Alerta urgente enviada por WhatsApp'
      });
    }, 3000);

    if (onComplete) {
      setTimeout(() => {
        onComplete();
      }, 5000);
    }
  };

  // Loading state
  if (validationStatus === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Validando código QR...
          </h2>
          <p className="text-slate-600 dark:text-zinc-400 text-sm">
            Por favor espera un momento
          </p>
        </Card>
      </div>
    );
  }

  // Invalid token state
  if (validationStatus === 'invalid') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Código QR Inválido
          </h2>
          <p className="text-slate-600 dark:text-zinc-400 mb-6">
            {accessData?.message || 'Este código QR no es válido o ha expirado'}
          </p>
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-left">
            <p className="text-sm text-amber-900 dark:text-amber-200">
              <strong>Si necesitas reportar un accidente:</strong><br/>
              • Contacta directamente al prevencionista de riesgos<br/>
              • Llama al jefe de turno o supervisor<br/>
              • En emergencias graves, llama al 131 (ambulancia)
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Valid token - Show user form or accident form
  if (showAccidentForm) {
    return (
      <AccidentReportFormComplete
        onBack={() => {
          setShowAccidentForm(false);
          setShowUserForm(true);
        }}
        onSubmit={handleAccidentSubmit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20 lg:pb-6">
      {/* Header de Emergencia */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-700 dark:to-orange-700 border-b border-red-600 dark:border-red-700 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 pt-16 pb-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h1 className="text-white text-2xl lg:text-3xl mb-2 font-bold">
              🚨 ACCESO DE EMERGENCIA
            </h1>
            <p className="text-white/90 text-sm lg:text-base">
              Reporte de Accidente Laboral
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 lg:p-6 space-y-6">
        {/* Información de la empresa */}
        <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-zinc-400">Empresa:</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">
                {accessData?.companyName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>Código QR verificado y activo</strong>
            </p>
          </div>
        </Card>

        {/* Información importante */}
        <Card className="p-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
                Instrucciones Importantes
              </h3>
              <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-1">
                <li>• Este formulario es <strong>SOLO para accidentes laborales</strong></li>
                <li>• Primero asegura el área y presta primeros auxilios si es necesario</li>
                <li>• En emergencias graves, llama al <strong>131</strong> antes de completar el formulario</li>
                <li>• Toma fotos del lugar del accidente (no compartas en redes sociales)</li>
                <li>• El prevencionista será notificado <strong>inmediatamente</strong> al enviar el reporte</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Formulario de usuario */}
        {showUserForm && (
          <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Identificación del Reportante
              </h2>
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                Por favor identifícate antes de continuar con el reporte
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-slate-900 dark:text-white mb-2 block">
                  <User className="w-4 h-4 inline mr-1" />
                  Tu Nombre Completo *
                </Label>
                <Input
                  value={emergencyUser.name}
                  onChange={(e) => setEmergencyUser(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Juan Pérez González"
                  className="h-12"
                  autoFocus
                />
              </div>

              <div>
                <Label className="text-slate-900 dark:text-white mb-2 block">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Tu Cargo en la Empresa *
                </Label>
                <Input
                  value={emergencyUser.role}
                  onChange={(e) => setEmergencyUser(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="Ej: Guardia de Seguridad, Supervisor, Jefe de Turno"
                  className="h-12"
                />
              </div>

              <div>
                <Label className="text-slate-900 dark:text-white mb-2 block">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Tu Teléfono de Contacto *
                </Label>
                <Input
                  value={emergencyUser.phone}
                  onChange={(e) => setEmergencyUser(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Ej: +56 9 1234 5678"
                  type="tel"
                  className="h-12"
                />
              </div>

              <div>
                <Label className="text-slate-900 dark:text-white mb-2 block">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Tu Email (Opcional)
                </Label>
                <Input
                  value={emergencyUser.email}
                  onChange={(e) => setEmergencyUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="tu.email@empresa.cl"
                  type="email"
                  className="h-12"
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <Clock className="w-4 h-4 inline mr-1" />
                <strong>Confidencialidad:</strong> Tus datos personales serán usados únicamente para contacto relacionado con este reporte de accidente.
              </p>
            </div>

            <Button
              onClick={handleUserFormSubmit}
              className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white h-14 text-lg"
            >
              Continuar al Reporte de Accidente
              <AlertTriangle className="w-5 h-5 ml-2" />
            </Button>
          </Card>
        )}

        {/* Footer informativo */}
        <Card className="p-4 bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-400">
            <MapPin className="w-4 h-4" />
            <span>
              SafeTrack Chile © 2026 - Sistema de Gestión de Prevención de Riesgos
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
