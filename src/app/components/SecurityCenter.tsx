import { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Users, 
  FileKey, 
  Eye, 
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Clock,
  Activity,
  KeyRound,
  Building2,
  UserCheck,
  Ban,
  Search,
  Filter,
  Download,
  RefreshCw,
  Settings
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Separator } from '@/app/components/ui/separator';
import { toast } from 'sonner';

interface SecurityCenterProps {
  onBack: () => void;
}

interface Company {
  id: string;
  name: string;
  rut: string;
  activeUsers: number;
  dataEncryption: boolean;
  lastAccess: string;
  signatureProtection: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  companyId: string;
  companyName: string;
  lastLogin: string;
  isActive: boolean;
  permissions: string[];
}

interface AccessLog {
  id: string;
  userId: string;
  userName: string;
  companyId: string;
  companyName: string;
  action: string;
  resource: string;
  timestamp: string;
  status: 'success' | 'denied' | 'warning';
  ipAddress: string;
  device: string;
}

export function SecurityCenter({ onBack }: SecurityCenterProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'logs' | 'signatures'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [showSensitive, setShowSensitive] = useState(false);

  // Mock data - En producción vendría de Supabase con Row Level Security
  const companies: Company[] = [
    {
      id: '1',
      name: 'Constructora Los Andes S.A.',
      rut: '76.123.456-7',
      activeUsers: 5,
      dataEncryption: true,
      lastAccess: '2026-01-26T10:30:00',
      signatureProtection: true
    },
    {
      id: '2',
      name: 'Minera Escondida Ltda.',
      rut: '96.789.012-3',
      activeUsers: 12,
      dataEncryption: true,
      lastAccess: '2026-01-26T09:15:00',
      signatureProtection: true
    },
    {
      id: '3',
      name: 'Forestal Chile S.A.',
      rut: '87.654.321-4',
      activeUsers: 3,
      dataEncryption: true,
      lastAccess: '2026-01-25T16:45:00',
      signatureProtection: false
    }
  ];

  const users: User[] = [
    {
      id: 'u1',
      name: 'Juan Pérez',
      email: 'jperez@losandes.cl',
      role: 'admin',
      companyId: '1',
      companyName: 'Constructora Los Andes S.A.',
      lastLogin: '2026-01-26T10:30:00',
      isActive: true,
      permissions: ['read', 'write', 'delete', 'signatures', 'reports']
    },
    {
      id: 'u2',
      name: 'María González',
      email: 'mgonzalez@losandes.cl',
      role: 'manager',
      companyId: '1',
      companyName: 'Constructora Los Andes S.A.',
      lastLogin: '2026-01-26T08:15:00',
      isActive: true,
      permissions: ['read', 'write', 'reports']
    },
    {
      id: 'u3',
      name: 'Carlos Silva',
      email: 'csilva@escondida.cl',
      role: 'admin',
      companyId: '2',
      companyName: 'Minera Escondida Ltda.',
      lastLogin: '2026-01-26T09:15:00',
      isActive: true,
      permissions: ['read', 'write', 'delete', 'signatures', 'reports']
    },
    {
      id: 'u4',
      name: 'Ana Torres',
      email: 'atorres@forestal.cl',
      role: 'viewer',
      companyId: '3',
      companyName: 'Forestal Chile S.A.',
      lastLogin: '2026-01-25T16:45:00',
      isActive: false,
      permissions: ['read']
    }
  ];

  const accessLogs: AccessLog[] = [
    {
      id: 'l1',
      userId: 'u1',
      userName: 'Juan Pérez',
      companyId: '1',
      companyName: 'Constructora Los Andes S.A.',
      action: 'VIEW_SIGNATURE',
      resource: 'Firma Digital - Gerente General',
      timestamp: '2026-01-26T10:30:15',
      status: 'success',
      ipAddress: '190.45.23.156',
      device: 'Chrome Mobile - Android'
    },
    {
      id: 'l2',
      userId: 'u4',
      userName: 'Ana Torres',
      companyId: '3',
      companyName: 'Forestal Chile S.A.',
      action: 'ATTEMPT_ACCESS',
      resource: 'Datos - Constructora Los Andes S.A.',
      timestamp: '2026-01-26T10:28:42',
      status: 'denied',
      ipAddress: '181.76.89.23',
      device: 'Safari - iOS'
    },
    {
      id: 'l3',
      userId: 'u3',
      userName: 'Carlos Silva',
      companyId: '2',
      companyName: 'Minera Escondida Ltda.',
      action: 'EXPORT_DATA',
      resource: 'Reporte Estadísticas Mensual',
      timestamp: '2026-01-26T09:20:33',
      status: 'success',
      ipAddress: '172.16.45.89',
      device: 'Edge Desktop - Windows'
    },
    {
      id: 'l4',
      userId: 'u2',
      userName: 'María González',
      companyId: '1',
      companyName: 'Constructora Los Andes S.A.',
      action: 'DELETE_ATTEMPT',
      resource: 'Firma Digital',
      timestamp: '2026-01-26T08:20:10',
      status: 'denied',
      ipAddress: '190.45.23.157',
      device: 'Chrome Desktop - Windows'
    },
    {
      id: 'l5',
      userId: 'u1',
      userName: 'Juan Pérez',
      companyId: '1',
      companyName: 'Constructora Los Andes S.A.',
      action: 'UPDATE_PERMISSIONS',
      resource: 'Usuario: María González',
      timestamp: '2026-01-26T10:15:25',
      status: 'warning',
      ipAddress: '190.45.23.156',
      device: 'Chrome Mobile - Android'
    }
  ];

  const handleToggleUserStatus = (userId: string) => {
    toast.success('Estado de usuario actualizado', {
      description: 'Los cambios se han aplicado correctamente'
    });
  };

  const handleResetPassword = (userId: string) => {
    toast.success('Enlace de restablecimiento enviado', {
      description: 'Se ha enviado un correo para restablecer la contraseña'
    });
  };

  const handleRevokeAccess = (userId: string) => {
    toast.warning('Acceso revocado inmediatamente', {
      description: 'El usuario ha sido desconectado de todas las sesiones'
    });
  };

  const handleExportLogs = () => {
    toast.success('Exportando logs de auditoría', {
      description: 'Se generará un archivo Excel con todos los registros'
    });
  };

  const handleRotateEncryption = (companyId: string) => {
    toast.success('Rotación de claves iniciada', {
      description: 'El proceso puede tardar algunos minutos. Te notificaremos al finalizar.'
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCompany = selectedCompany === 'all' || user.companyId === selectedCompany;
    return matchesSearch && matchesCompany;
  });

  const filteredLogs = accessLogs.filter(log => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCompany = selectedCompany === 'all' || log.companyId === selectedCompany;
    return matchesSearch && matchesCompany;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-zinc-950 dark:via-blue-950/20 dark:to-zinc-950 pb-20 lg:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Centro de Seguridad
              </h1>
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                Control de Acceso Multi-Empresa
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-900 dark:text-green-300">Empresas</span>
              </div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">{companies.length}</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-900 dark:text-blue-300">Usuarios Activos</span>
              </div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {users.filter(u => u.isActive).length}
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-200 dark:border-red-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Ban className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-xs font-medium text-red-900 dark:text-red-300">Accesos Denegados</span>
              </div>
              <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                {accessLogs.filter(l => l.status === 'denied').length}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <FileKey className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-medium text-purple-900 dark:text-purple-300">Firmas Protegidas</span>
              </div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {companies.filter(c => c.signatureProtection).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar usuarios, acciones, empresas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700"
            />
          </div>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas las empresas</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>{company.name}</option>
            ))}
          </select>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Shield className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Panel General</span>
              <span className="sm:hidden">General</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Usuarios</span>
              <span className="sm:hidden">Users</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Activity className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Auditoría</span>
              <span className="sm:hidden">Logs</span>
            </TabsTrigger>
            <TabsTrigger value="signatures" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <FileKey className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Firmas</span>
              <span className="sm:hidden">Signs</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Empresas y Seguridad de Datos
              </h3>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {companies.map(company => (
                    <div
                      key={company.id}
                      className="p-4 border border-slate-200 dark:border-zinc-700 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                            {company.name}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-zinc-400">
                            RUT: {company.rut}
                          </p>
                        </div>
                        {company.dataEncryption && (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <Lock className="w-3 h-3 mr-1" />
                            Encriptado
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
                          <div className="text-xs text-blue-600 dark:text-blue-400 mb-1">Usuarios Activos</div>
                          <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                            {company.activeUsers}
                          </div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3">
                          <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">Último Acceso</div>
                          <div className="text-xs font-semibold text-purple-900 dark:text-purple-100">
                            {new Date(company.lastAccess).toLocaleString('es-CL', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-zinc-700">
                        <div className="flex items-center gap-2">
                          {company.signatureProtection ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Firmas Protegidas
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                              <XCircle className="w-3 h-3 mr-1" />
                              Sin Protección
                            </Badge>
                          )}
                        </div>
                        <Button
                          onClick={() => handleRotateEncryption(company.id)}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Rotar Claves
                        </Button>
                      </div>

                      {!company.signatureProtection && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                          <div className="text-xs text-red-800 dark:text-red-300">
                            <strong>Acción Requerida:</strong> Esta empresa no tiene protección de firmas activada. 
                            Contacta al administrador para habilitar la seguridad avanzada.
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            {/* Security Alerts */}
            <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-900">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Alertas de Seguridad Recientes
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-white/80 dark:bg-zinc-900/80 rounded-lg border border-red-200 dark:border-red-900">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white text-sm">
                        Intento de acceso denegado
                      </div>
                      <div className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                        Ana Torres intentó acceder a datos de otra empresa (26/01/2026 10:28)
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-white/80 dark:bg-zinc-900/80 rounded-lg border border-orange-200 dark:border-orange-900">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white text-sm">
                        Cambio de permisos detectado
                      </div>
                      <div className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
                        Juan Pérez modificó permisos de María González (26/01/2026 10:15)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  Gestión de Usuarios ({filteredUsers.length})
                </h3>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Users className="w-4 h-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </div>

              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {filteredUsers.map(user => (
                    <div
                      key={user.id}
                      className="p-4 border border-slate-200 dark:border-zinc-700 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900 dark:text-white">
                              {user.name}
                            </h4>
                            {user.isActive ? (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Activo
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-400">
                                Inactivo
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-zinc-400 mb-1">
                            {user.email}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-zinc-500">
                            {user.companyName}
                          </p>
                        </div>
                        <Badge 
                          className={
                            user.role === 'admin' 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : user.role === 'manager'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-zinc-400'
                          }
                        >
                          {user.role === 'admin' ? 'Administrador' : user.role === 'manager' ? 'Gerente' : 'Visualizador'}
                        </Badge>
                      </div>

                      <div className="mb-3 flex flex-wrap gap-2">
                        {user.permissions.map(permission => (
                          <Badge 
                            key={permission}
                            variant="outline"
                            className="text-xs"
                          >
                            {permission}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-500 mb-3">
                        <Clock className="w-3 h-3" />
                        <span>Último acceso: {new Date(user.lastLogin).toLocaleString('es-CL')}</span>
                      </div>

                      <Separator className="my-3" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            onClick={() => handleToggleUserStatus(user.id)}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            {user.isActive ? 'Desactivar' : 'Activar'}
                          </Button>
                          <Button
                            onClick={() => handleResetPassword(user.id)}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            <KeyRound className="w-3 h-3 mr-1" />
                            Reset Password
                          </Button>
                        </div>
                        <Button
                          onClick={() => handleRevokeAccess(user.id)}
                          size="sm"
                          variant="outline"
                          className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Ban className="w-3 h-3 mr-1" />
                          Revocar Acceso
                        </Button>
                      </div>

                      {/* Warning if user is admin */}
                      {user.role === 'admin' && (
                        <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded flex items-start gap-2">
                          <AlertTriangle className="w-3 h-3 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                          <div className="text-xs text-orange-800 dark:text-orange-300">
                            Este usuario tiene permisos de administrador y puede gestionar firmas digitales
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Logs de Auditoría ({filteredLogs.length})
                </h3>
                <Button
                  onClick={handleExportLogs}
                  size="sm"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>

              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {filteredLogs.map(log => (
                    <div
                      key={log.id}
                      className={`p-4 border rounded-lg transition-colors ${
                        log.status === 'denied' 
                          ? 'border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/20'
                          : log.status === 'warning'
                          ? 'border-orange-300 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/20'
                          : 'border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-3">
                          {log.status === 'success' && (
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          )}
                          {log.status === 'denied' && (
                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                          )}
                          {log.status === 'warning' && (
                            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
                              {log.action.replace(/_/g, ' ')}
                            </div>
                            <div className="text-sm text-slate-700 dark:text-zinc-300 mb-2">
                              {log.resource}
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-zinc-500">
                              <span>👤 {log.userName}</span>
                              <span>•</span>
                              <span>🏢 {log.companyName}</span>
                              <span>•</span>
                              <span>🌐 {log.ipAddress}</span>
                              <span>•</span>
                              <span>💻 {log.device}</span>
                            </div>
                          </div>
                        </div>
                        <Badge 
                          className={
                            log.status === 'success'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : log.status === 'denied'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                          }
                        >
                          {log.status === 'success' ? 'Exitoso' : log.status === 'denied' ? 'Denegado' : 'Alerta'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-500 pt-2 border-t border-slate-200 dark:border-zinc-700">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(log.timestamp).toLocaleString('es-CL')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* Signatures Tab */}
          <TabsContent value="signatures" className="space-y-4">
            <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileKey className="w-5 h-5 text-purple-600" />
                  Protección de Firmas Digitales
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600 dark:text-zinc-400">
                    Mostrar datos sensibles
                  </span>
                  <Switch
                    checked={showSensitive}
                    onCheckedChange={setShowSensitive}
                  />
                </div>
              </div>

              {/* Security Info */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      🔒 Encriptación AES-256 Activa
                    </div>
                    <div className="text-blue-800 dark:text-blue-300">
                      Todas las firmas digitales están encriptadas con algoritmo AES-256 y almacenadas con aislamiento 
                      multi-tenant. Cada empresa solo puede acceder a sus propias firmas mediante tokens JWT con claims específicos.
                    </div>
                  </div>
                </div>
              </div>

              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {companies.map(company => (
                    <div
                      key={company.id}
                      className="p-4 border border-slate-200 dark:border-zinc-700 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {company.name}
                        </h4>
                        {company.signatureProtection ? (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <Lock className="w-3 h-3 mr-1" />
                            Protegido
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Sin Protección
                          </Badge>
                        )}
                      </div>

                      {company.signatureProtection ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg">
                              <div className="text-xs text-slate-600 dark:text-zinc-400 mb-1">
                                Firmas Almacenadas
                              </div>
                              <div className="text-lg font-bold text-slate-900 dark:text-white">
                                {showSensitive ? '3' : '•••'}
                              </div>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-lg">
                              <div className="text-xs text-slate-600 dark:text-zinc-400 mb-1">
                                Última Rotación
                              </div>
                              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                                {showSensitive ? '15/01/2026' : '•••••••••'}
                              </div>
                            </div>
                          </div>

                          <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                              <div className="text-xs text-green-800 dark:text-green-300">
                                <div className="font-semibold mb-1">Medidas de Seguridad Activas:</div>
                                <ul className="list-disc list-inside space-y-1">
                                  <li>Encriptación AES-256 en reposo</li>
                                  <li>TLS 1.3 para transmisión</li>
                                  <li>Aislamiento multi-tenant (Row Level Security)</li>
                                  <li>Auditoría completa de accesos</li>
                                  <li>Rotación automática de claves cada 30 días</li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          <Button
                            onClick={() => handleRotateEncryption(company.id)}
                            size="sm"
                            variant="outline"
                            className="w-full"
                          >
                            <RefreshCw className="w-3 h-3 mr-2" />
                            Rotar Claves de Encriptación
                          </Button>
                        </div>
                      ) : (
                        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                            <div className="text-sm text-red-800 dark:text-red-300">
                              <div className="font-semibold mb-2">
                                ⚠️ Esta empresa no tiene protección de firmas activada
                              </div>
                              <p className="mb-3">
                                Para habilitar la seguridad avanzada de firmas digitales, contacta al equipo de soporte 
                                o actualiza el plan de esta empresa.
                              </p>
                              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                                <Settings className="w-3 h-3 mr-2" />
                                Activar Protección
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            {/* Security Best Practices */}
            <Card className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 border-indigo-200 dark:border-indigo-900">
              <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Mejores Prácticas de Seguridad
              </h3>
              <ul className="space-y-2 text-sm text-indigo-800 dark:text-indigo-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Aislamiento Multi-Tenant:</strong> Cada empresa solo puede acceder a sus propios datos mediante 
                    políticas de Row Level Security (RLS) en Supabase.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Autenticación JWT:</strong> Todos los tokens incluyen claims de compañía (company_id) que se 
                    validan en cada request.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Auditoría Completa:</strong> Todos los accesos a firmas y datos sensibles quedan registrados 
                    con timestamp, IP y dispositivo.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Rotación de Claves:</strong> Las claves de encriptación se rotan automáticamente cada 30 días 
                    o pueden rotarse manualmente en caso de compromiso.
                  </span>
                </li>
              </ul>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
