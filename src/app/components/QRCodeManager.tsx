import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  Download,
  Printer,
  Copy,
  CheckCircle,
  AlertTriangle,
  Shield,
  QrCode,
  Building2,
  Calendar,
  Eye,
  EyeOff,
  RefreshCw,
  Info,
  ExternalLink
} from 'lucide-react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';

interface QRCodeManagerProps {
  onBack: () => void;
}

interface CompanyQRCode {
  id: string;
  companyName: string;
  companyId: string;
  token: string;
  createdDate: string;
  expiresDate: string | null;
  isActive: boolean;
  usageCount: number;
  lastUsed: string | null;
}

// Base de datos simulada de QR codes
const INITIAL_QR_CODES: CompanyQRCode[] = [
  {
    id: '1',
    companyName: 'Constructora Los Andes',
    companyId: 'const-001',
    token: 'QR-EMERGENCY-CONST001-2024',
    createdDate: '2024-01-15',
    expiresDate: null,
    isActive: true,
    usageCount: 3,
    lastUsed: '2025-12-10'
  },
  {
    id: '2',
    companyName: 'Minera del Norte',
    companyId: 'min-002',
    token: 'QR-EMERGENCY-MIN002-2024',
    createdDate: '2024-02-20',
    expiresDate: null,
    isActive: true,
    usageCount: 1,
    lastUsed: '2025-11-05'
  },
  {
    id: '3',
    companyName: 'Transportes Veloz',
    companyId: 'trans-003',
    token: 'QR-EMERGENCY-TRANS003-2024',
    createdDate: '2024-03-10',
    expiresDate: null,
    isActive: false,
    usageCount: 0,
    lastUsed: null
  }
];

export function QRCodeManager({ onBack }: QRCodeManagerProps) {
  const [qrCodes, setQrCodes] = useState<CompanyQRCode[]>(INITIAL_QR_CODES);
  const [selectedQR, setSelectedQR] = useState<CompanyQRCode | null>(INITIAL_QR_CODES[0]);
  const [showInstructions, setShowInstructions] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const generateQRUrl = (token: string) => {
    // En producción, esta sería la URL real de tu app
    const baseUrl = window.location.origin;
    return `${baseUrl}?emergency_access=${token}`;
  };

  const handleDownloadQR = () => {
    if (!selectedQR) return;

    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    // Convertir SVG a canvas y descargar como PNG
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 1000;
    canvas.height = 1400;

    img.onload = () => {
      if (!ctx) return;

      // Fondo blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(0, 0, canvas.width, 150);

      // Texto del header
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🚨 BOTÓN DE PÁNICO', canvas.width / 2, 70);
      ctx.font = '32px Arial';
      ctx.fillText('REPORTE DE ACCIDENTE', canvas.width / 2, 110);

      // Nombre de empresa
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 36px Arial';
      ctx.fillText(selectedQR.companyName, canvas.width / 2, 220);

      // QR Code
      ctx.drawImage(img, 200, 280, 600, 600);

      // Instrucciones
      ctx.fillStyle = '#475569';
      ctx.font = '28px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('INSTRUCCIONES:', 100, 950);
      ctx.font = '24px Arial';
      ctx.fillText('1. Escanea este código QR con tu celular', 100, 1000);
      ctx.fillText('2. Se abrirá el formulario de reporte de accidente', 100, 1040);
      ctx.fillText('3. Completa la información solicitada', 100, 1080);
      ctx.fillText('4. El prevencionista será notificado automáticamente', 100, 1120);

      // Footer
      ctx.fillStyle = '#94a3b8';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('SafeTrack Chile © 2026 - Ley 16.744', canvas.width / 2, 1250);
      ctx.fillText(`Token: ${selectedQR.token}`, canvas.width / 2, 1300);
      ctx.fillText(`Creado: ${new Date(selectedQR.createdDate).toLocaleDateString('es-CL')}`, canvas.width / 2, 1340);

      // Descargar
      const link = document.createElement('a');
      link.download = `QR-Emergency-${selectedQR.companyName.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL();
      link.click();

      toast.success('✅ Código QR descargado', {
        description: 'Listo para imprimir y colocar en áreas estratégicas'
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrintQR = () => {
    if (!selectedQR) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const qrUrl = generateQRUrl(selectedQR.token);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Código QR de Emergencia - ${selectedQR.companyName}</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #DC2626 0%, #EF4444 100%);
              color: white;
              padding: 30px;
              border-radius: 15px;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0 0 10px 0;
              font-size: 36px;
            }
            .header p {
              margin: 0;
              font-size: 20px;
              opacity: 0.9;
            }
            .company {
              font-size: 28px;
              font-weight: bold;
              color: #1e293b;
              margin: 20px 0;
            }
            .qr-container {
              margin: 40px 0;
              display: flex;
              justify-content: center;
            }
            .instructions {
              background: #f8fafc;
              border: 2px solid #e2e8f0;
              border-radius: 10px;
              padding: 30px;
              text-align: left;
              margin: 30px auto;
              max-width: 600px;
            }
            .instructions h2 {
              color: #DC2626;
              margin-top: 0;
            }
            .instructions ol {
              font-size: 18px;
              line-height: 1.8;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e2e8f0;
              color: #64748b;
              font-size: 14px;
            }
            .warning {
              background: #fef3c7;
              border: 2px solid #f59e0b;
              border-radius: 10px;
              padding: 20px;
              margin: 20px 0;
              color: #92400e;
            }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚨 BOTÓN DE PÁNICO</h1>
            <p>REPORTE DE ACCIDENTE LABORAL</p>
          </div>

          <div class="company">${selectedQR.companyName}</div>

          <div class="qr-container">
            <div id="qr-code"></div>
          </div>

          <div class="warning">
            <strong>⚠️ USO EXCLUSIVO PARA EMERGENCIAS</strong><br>
            Este código QR debe usarse únicamente en caso de accidentes laborales<br>
            cuando el prevencionista de riesgos no esté presente en la empresa.
          </div>

          <div class="instructions">
            <h2>📋 Instrucciones de Uso</h2>
            <ol>
              <li><strong>Escanea el código QR</strong> con la cámara de tu celular</li>
              <li><strong>Se abrirá automáticamente</strong> el formulario de reporte de accidente</li>
              <li><strong>Completa toda la información</strong> solicitada con el mayor detalle posible</li>
              <li><strong>Toma fotos</strong> del lugar del accidente y de las lesiones (si corresponde)</li>
              <li><strong>Registra declaraciones</strong> de testigos presentes</li>
              <li><strong>Envía el informe</strong> - El prevencionista y gerencia serán notificados inmediatamente</li>
            </ol>
          </div>

          <div class="footer">
            <strong>SafeTrack Chile © 2026</strong><br>
            Sistema de Gestión de Prevención de Riesgos - Ley 16.744<br>
            Token: ${selectedQR.token}<br>
            Código generado: ${new Date(selectedQR.createdDate).toLocaleDateString('es-CL', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}<br>
            <br>
            <strong>UBICACIÓN RECOMENDADA:</strong><br>
            Coloque este código QR en un lugar visible y de fácil acceso<br>
            Sugerencias: Sala de descanso, comedor, entrada principal, caseta de seguridad
          </div>

          <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
          <script>
            QRCode.toCanvas('${qrUrl}', { 
              width: 400,
              margin: 2,
              color: {
                dark: '#000000',
                light: '#FFFFFF'
              }
            }, function (error, canvas) {
              if (error) console.error(error);
              document.getElementById('qr-code').appendChild(canvas);
              setTimeout(() => window.print(), 500);
            });
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();

    toast.success('🖨️ Preparando impresión', {
      description: 'Se abrirá el diálogo de impresión'
    });
  };

  const handleCopyUrl = () => {
    if (!selectedQR) return;
    const url = generateQRUrl(selectedQR.token);
    navigator.clipboard.writeText(url);
    toast.success('✅ URL copiada al portapapeles', {
      description: 'Puedes compartirla directamente'
    });
  };

  const handleToggleActive = (id: string) => {
    setQrCodes(prev => prev.map(qr => 
      qr.id === id 
        ? { ...qr, isActive: !qr.isActive }
        : qr
    ));

    const qr = qrCodes.find(q => q.id === id);
    toast.success(
      qr?.isActive ? '🔴 QR desactivado' : '✅ QR activado',
      {
        description: qr?.isActive 
          ? 'Ya no se podrá usar para reportar accidentes' 
          : 'Ahora puede usarse para reportar accidentes'
      }
    );
  };

  const handleRegenerateToken = (id: string) => {
    const newToken = `QR-EMERGENCY-${Date.now().toString(36).toUpperCase()}`;
    setQrCodes(prev => prev.map(qr => 
      qr.id === id 
        ? { ...qr, token: newToken, createdDate: new Date().toISOString().split('T')[0] }
        : qr
    ));

    toast.success('🔄 Token regenerado', {
      description: 'El código QR anterior ya no funcionará'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 transition-colors pb-20 lg:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-700 dark:to-orange-700 border-b border-red-600 dark:border-red-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver</span>
            </button>

            <Button
              onClick={() => setShowInstructions(!showInstructions)}
              size="sm"
              variant="outline"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <Info className="w-4 h-4 mr-1" />
              Instructivo
            </Button>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-white text-xl lg:text-2xl mb-1 font-bold">
                Códigos QR de Emergencia
              </h1>
              <p className="text-white/80 text-sm">
                Botón de pánico para reporte de accidentes
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Instructivo */}
        {showInstructions && (
          <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  ¿Para Qué Sirven los Códigos QR de Emergencia?
                </h3>
                <div className="space-y-3 text-sm text-slate-700 dark:text-zinc-300">
                  <p>
                    <strong>Propósito:</strong> Permitir que personal de seguridad u otros encargados puedan reportar accidentes laborales inmediatamente, incluso cuando el prevencionista de riesgos no esté presente en la empresa.
                  </p>
                  
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg">
                    <p className="font-medium mb-2">📱 Cómo Funciona:</p>
                    <ol className="list-decimal ml-5 space-y-1">
                      <li>Imprime y coloca el código QR en áreas visibles (comedor, caseta de seguridad, etc.)</li>
                      <li>En caso de accidente, el personal escanea el QR con su celular</li>
                      <li>Se abre automáticamente el formulario de reporte de accidente</li>
                      <li>Completan la información y envían el reporte</li>
                      <li>Tú y gerencia reciben notificación inmediata por email y WhatsApp</li>
                    </ol>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg">
                    <p className="font-medium text-amber-900 dark:text-amber-200 mb-2">
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      Importante - Seguridad
                    </p>
                    <ul className="space-y-1 text-amber-800 dark:text-amber-300">
                      <li>• Cada QR tiene un token único por empresa</li>
                      <li>• Puedes desactivar/regenerar tokens en cualquier momento</li>
                      <li>• Se registra cada uso del QR (fecha, hora, usuario)</li>
                      <li>• Solo personal autorizado debe tener acceso al QR</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de empresas */}
          <div className="lg:col-span-1">
            <Card className="p-4 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                Empresas Asignadas
              </h3>

              <div className="space-y-2">
                {qrCodes.map(qr => (
                  <button
                    key={qr.id}
                    onClick={() => setSelectedQR(qr)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      selectedQR?.id === qr.id
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                        : 'border-slate-200 dark:border-zinc-800 hover:border-red-300 dark:hover:border-red-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-slate-900 dark:text-white text-sm">
                            {qr.companyName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400">
                          <Badge 
                            className={qr.isActive 
                              ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-0'
                              : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 border-0'
                            }
                          >
                            {qr.isActive ? '✅ Activo' : '🔴 Inactivo'}
                          </Badge>
                          {qr.usageCount > 0 && (
                            <span>📊 {qr.usageCount} uso{qr.usageCount !== 1 ? 's' : ''}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Vista previa del QR */}
          <div className="lg:col-span-2">
            {selectedQR ? (
              <div className="space-y-4">
                {/* QR Code Card */}
                <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                  <div className="flex flex-col items-center">
                    <div className="mb-4 text-center">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                        {selectedQR.companyName}
                      </h2>
                      <Badge 
                        className={selectedQR.isActive 
                          ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-0'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-0'
                        }
                      >
                        {selectedQR.isActive ? '✅ Código Activo' : '🔴 Código Inactivo'}
                      </Badge>
                    </div>

                    {/* QR Code */}
                    <div 
                      ref={qrRef}
                      className={`p-6 bg-white rounded-lg border-4 mb-4 ${
                        selectedQR.isActive 
                          ? 'border-green-500' 
                          : 'border-slate-300 opacity-50'
                      }`}
                    >
                      <QRCodeSVG
                        value={generateQRUrl(selectedQR.token)}
                        size={280}
                        level="H"
                        includeMargin={true}
                      />
                    </div>

                    {/* Botones de Acción */}
                    <div className="grid grid-cols-3 gap-3 w-full max-w-md mb-4">
                      <Button
                        onClick={handleDownloadQR}
                        disabled={!selectedQR.isActive}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Descargar
                      </Button>
                      <Button
                        onClick={handlePrintQR}
                        disabled={!selectedQR.isActive}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Printer className="w-4 h-4 mr-1" />
                        Imprimir
                      </Button>
                      <Button
                        onClick={handleCopyUrl}
                        disabled={!selectedQR.isActive}
                        variant="outline"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copiar URL
                      </Button>
                    </div>

                    {/* URL del QR */}
                    <div className="w-full max-w-md p-3 bg-slate-100 dark:bg-zinc-800 rounded-lg">
                      <p className="text-xs text-slate-600 dark:text-zinc-400 mb-1">
                        URL de acceso directo:
                      </p>
                      <p className="text-xs font-mono text-slate-900 dark:text-white break-all">
                        {generateQRUrl(selectedQR.token)}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Información y Controles */}
                <Card className="p-6 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                    Información y Controles
                  </h3>

                  <div className="space-y-4">
                    {/* Estadísticas */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-lg">
                        <p className="text-xs text-slate-600 dark:text-zinc-400 mb-1">
                          Fecha de creación
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(selectedQR.createdDate).toLocaleDateString('es-CL')}
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-lg">
                        <p className="text-xs text-slate-600 dark:text-zinc-400 mb-1">
                          Veces utilizado
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {selectedQR.usageCount} {selectedQR.usageCount === 1 ? 'vez' : 'veces'}
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-zinc-800 rounded-lg col-span-2">
                        <p className="text-xs text-slate-600 dark:text-zinc-400 mb-1">
                          Último uso
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {selectedQR.lastUsed 
                            ? new Date(selectedQR.lastUsed).toLocaleDateString('es-CL', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'Nunca usado'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Controles de Seguridad */}
                    <div className="border-t border-slate-200 dark:border-zinc-700 pt-4">
                      <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                        Controles de Seguridad
                      </h4>
                      
                      <div className="space-y-3">
                        <Button
                          onClick={() => handleToggleActive(selectedQR.id)}
                          variant="outline"
                          className="w-full justify-start"
                        >
                          {selectedQR.isActive ? (
                            <>
                              <EyeOff className="w-4 h-4 mr-2" />
                              Desactivar Código QR
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4 mr-2" />
                              Activar Código QR
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={() => handleRegenerateToken(selectedQR.id)}
                          variant="outline"
                          className="w-full justify-start text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Regenerar Token (Invalidar Anterior)
                        </Button>
                      </div>
                    </div>

                    {/* Token */}
                    <div className="border-t border-slate-200 dark:border-zinc-700 pt-4">
                      <p className="text-xs text-slate-600 dark:text-zinc-400 mb-2">
                        Token de seguridad:
                      </p>
                      <p className="text-xs font-mono bg-slate-100 dark:bg-zinc-800 p-2 rounded text-slate-900 dark:text-white break-all">
                        {selectedQR.token}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Ubicaciones Recomendadas */}
                <Card className="p-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                        Ubicaciones Recomendadas para el Código QR
                      </h4>
                      <ul className="text-sm text-slate-700 dark:text-zinc-300 space-y-1">
                        <li>✅ Sala de descanso / Comedor</li>
                        <li>✅ Caseta de seguridad / Guardia</li>
                        <li>✅ Entrada principal de la empresa</li>
                        <li>✅ Área de producción / Taller</li>
                        <li>✅ Oficina de recursos humanos</li>
                        <li>✅ Junto al botiquín de primeros auxilios</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-12 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-center">
                <QrCode className="w-16 h-16 text-slate-300 dark:text-zinc-600 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-zinc-400">
                  Selecciona una empresa para ver su código QR
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
