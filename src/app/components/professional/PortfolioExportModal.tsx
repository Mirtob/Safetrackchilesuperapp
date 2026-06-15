import { useState, useRef, useEffect } from 'react';
import { 
  Download,
  FileText,
  FileSpreadsheet,
  Send,
  CheckCircle2,
  X,
  PenTool,
  Eraser,
  Mail,
  Building2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Card } from '@/app/components/ui/card';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

interface ClientCompany {
  id: string;
  name: string;
  rut: string;
  location: string;
  contractType: 'consultoria' | 'asesoria' | 'completo';
  hourlyRate: number;
  monthlyFee?: number;
  paymentDay: number;
  lastPayment?: string;
  nextPayment?: string;
  hoursThisMonth: number;
  pendingAmount: number;
  expensesThisMonth: number;
  status: 'active' | 'pending' | 'inactive';
  brandColor: string;
  startDate: string;
}

interface PortfolioExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientCompany[];
  totalHoursThisMonth: number;
  totalPendingAmount: number;
  totalExpensesThisMonth: number;
  estimatedMonthlyIncome: number;
}

type ExportFormat = 'excel' | 'pdf' | null;
type Step = 'format' | 'signature' | 'send' | 'success';

export function PortfolioExportModal({
  isOpen,
  onClose,
  clients,
  totalHoursThisMonth,
  totalPendingAmount,
  totalExpensesThisMonth,
  estimatedMonthlyIncome
}: PortfolioExportModalProps) {
  const [step, setStep] = useState<Step>('format');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [emailRRHH, setEmailRRHH] = useState('');
  const [emailGerencia, setEmailGerencia] = useState('');
  const [isSending, setIsSending] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current && step === 'signature') {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0055A4';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        setContext(ctx);
      }
    }
  }, [step]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getContractTypeLabel = (type: ClientCompany['contractType']) => {
    const labels = {
      consultoria: 'Consultoría (Por Hora)',
      asesoria: 'Asesoría (Mixto)',
      completo: 'Servicio Completo (Mensual)'
    };
    return labels[type];
  };

  const handleFormatSelect = (format: ExportFormat) => {
    setSelectedFormat(format);
    if (format === 'excel') {
      // Excel no requiere firma, exportar directamente
      generateExcel();
      setStep('send');
    } else if (format === 'pdf') {
      // PDF requiere firma
      setStep('signature');
    }
  };

  const generateExcel = () => {
    try {
      // Preparar datos para el resumen general
      const summaryData = [
        ['RESUMEN DE CARTERA PROFESIONAL'],
        ['Fecha de Generación:', new Date().toLocaleDateString('es-CL')],
        [''],
        ['MÉTRICAS GENERALES'],
        ['Total de Clientes:', clients.length],
        ['Clientes Activos:', clients.filter(c => c.status === 'active').length],
        ['Horas Trabajadas este Mes:', `${totalHoursThisMonth} hrs`],
        ['Ingresos Estimados:', formatCurrency(estimatedMonthlyIncome)],
        ['Por Cobrar:', formatCurrency(totalPendingAmount)],
        ['Gastos del Mes:', formatCurrency(totalExpensesThisMonth)],
        [''],
        ['DETALLE DE CLIENTES'],
      ];

      // Preparar headers de tabla
      const headers = [
        'Cliente',
        'RUT',
        'Ubicación',
        'Tipo Contrato',
        'Estado',
        'Tarifa/Hora',
        'Honorario Mensual',
        'Horas/Mes',
        'Por Cobrar',
        'Gastos/Mes',
        'Próximo Pago',
        'Fecha Inicio'
      ];

      // Preparar datos de clientes
      const clientData = clients.map(client => [
        client.name,
        client.rut,
        client.location,
        getContractTypeLabel(client.contractType),
        client.status === 'active' ? 'Activo' : client.status === 'pending' ? 'Pendiente' : 'Inactivo',
        client.hourlyRate > 0 ? formatCurrency(client.hourlyRate) : 'N/A',
        client.monthlyFee ? formatCurrency(client.monthlyFee) : 'N/A',
        `${client.hoursThisMonth} hrs`,
        formatCurrency(client.pendingAmount),
        formatCurrency(client.expensesThisMonth),
        client.nextPayment ? new Date(client.nextPayment).toLocaleDateString('es-CL') : 'N/A',
        new Date(client.startDate).toLocaleDateString('es-CL')
      ]);

      // Combinar todo
      const worksheetData = [
        ...summaryData,
        headers,
        ...clientData
      ];

      // Crear workbook
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);
      
      // Ajustar ancho de columnas
      const columnWidths = [
        { wch: 30 }, // Cliente
        { wch: 15 }, // RUT
        { wch: 25 }, // Ubicación
        { wch: 25 }, // Tipo Contrato
        { wch: 12 }, // Estado
        { wch: 15 }, // Tarifa/Hora
        { wch: 18 }, // Honorario Mensual
        { wch: 12 }, // Horas/Mes
        { wch: 15 }, // Por Cobrar
        { wch: 15 }, // Gastos/Mes
        { wch: 15 }, // Próximo Pago
        { wch: 15 }  // Fecha Inicio
      ];
      ws['!cols'] = columnWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Cartera Profesional');

      // Descargar archivo
      const fileName = `Cartera_Profesional_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success('Excel generado exitosamente', {
        description: `Archivo ${fileName} descargado`
      });
    } catch (error) {
      console.error('Error generando Excel:', error);
      toast.error('Error al generar Excel');
    }
  };

  const generatePDF = (signature: string) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      doc.setFillColor(0, 85, 164);
      doc.rect(0, 0, pageWidth, 25, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('RESUMEN DE CARTERA PROFESIONAL', pageWidth / 2, 15, { align: 'center' });

      // Reset color
      doc.setTextColor(0, 0, 0);
      yPosition = 35;

      // Fecha
      doc.setFontSize(10);
      doc.text(`Fecha de Generación: ${new Date().toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, 15, yPosition);
      yPosition += 15;

      // Métricas generales
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('MÉTRICAS GENERALES', 15, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const metrics = [
        ['Total de Clientes:', `${clients.length}`],
        ['Clientes Activos:', `${clients.filter(c => c.status === 'active').length}`],
        ['Horas Trabajadas este Mes:', `${totalHoursThisMonth} hrs`],
        ['Ingresos Estimados:', formatCurrency(estimatedMonthlyIncome)],
        ['Por Cobrar:', formatCurrency(totalPendingAmount)],
        ['Gastos del Mes:', formatCurrency(totalExpensesThisMonth)]
      ];

      metrics.forEach(([label, value]) => {
        doc.text(label, 20, yPosition);
        doc.setFont('helvetica', 'bold');
        doc.text(value, 120, yPosition);
        doc.setFont('helvetica', 'normal');
        yPosition += 7;
      });

      yPosition += 10;

      // Detalle de clientes
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('DETALLE DE CLIENTES', 15, yPosition);
      yPosition += 10;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      clients.forEach((client, index) => {
        // Verificar si necesitamos una nueva página
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 20;
        }

        // Cliente header
        doc.setFillColor(240, 240, 240);
        doc.rect(15, yPosition - 5, pageWidth - 30, 8, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${client.name}`, 20, yPosition);
        yPosition += 10;

        doc.setFont('helvetica', 'normal');
        doc.text(`RUT: ${client.rut}`, 20, yPosition);
        doc.text(`Ubicación: ${client.location}`, 100, yPosition);
        yPosition += 7;

        doc.text(`Tipo: ${getContractTypeLabel(client.contractType)}`, 20, yPosition);
        doc.text(`Estado: ${client.status === 'active' ? 'Activo' : client.status === 'pending' ? 'Pendiente' : 'Inactivo'}`, 100, yPosition);
        yPosition += 7;

        if (client.monthlyFee) {
          doc.text(`Honorario Mensual: ${formatCurrency(client.monthlyFee)}`, 20, yPosition);
        } else {
          doc.text(`Tarifa por Hora: ${formatCurrency(client.hourlyRate)}`, 20, yPosition);
        }
        doc.text(`Horas/Mes: ${client.hoursThisMonth} hrs`, 100, yPosition);
        yPosition += 7;

        doc.text(`Por Cobrar: ${formatCurrency(client.pendingAmount)}`, 20, yPosition);
        doc.text(`Gastos: ${formatCurrency(client.expensesThisMonth)}`, 100, yPosition);
        yPosition += 7;

        if (client.nextPayment) {
          doc.text(`Próximo Pago: ${new Date(client.nextPayment).toLocaleDateString('es-CL')}`, 20, yPosition);
        }
        yPosition += 10;
      });

      // Nueva página para firma
      doc.addPage();
      yPosition = 20;

      // Firma
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('FIRMA DIGITAL DEL PREVENCIONISTA', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Agregar imagen de firma
      if (signature) {
        doc.addImage(signature, 'PNG', (pageWidth - 80) / 2, yPosition, 80, 40);
        yPosition += 50;
      }

      // Metadata de verificación
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      
      const verificationData = [
        `Documento generado digitalmente por SafeTrack Chile`,
        `Fecha y Hora: ${new Date().toLocaleString('es-CL')}`,
        `ID de Verificación: ${generateVerificationId()}`,
        `Este documento tiene validez legal según normativa chilena`
      ];

      verificationData.forEach((text) => {
        doc.text(text, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 5;
      });

      // Footer en todas las páginas
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${i} de ${totalPages} - SafeTrack Chile`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Descargar PDF
      const fileName = `Cartera_Profesional_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast.success('PDF generado exitosamente', {
        description: `Archivo ${fileName} descargado con firma digital`
      });
    } catch (error) {
      console.error('Error generando PDF:', error);
      toast.error('Error al generar PDF');
    }
  };

  const generateVerificationId = () => {
    return `ST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas || !context) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      setSignatureData(canvasRef.current.toDataURL('image/png'));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  const handleSignatureConfirm = () => {
    if (!signatureData) {
      toast.error('Por favor, firme el documento antes de continuar');
      return;
    }

    generatePDF(signatureData);
    setStep('send');
  };

  const handleSendDocument = async () => {
    if (!emailRRHH || !emailGerencia) {
      toast.error('Por favor, complete ambos correos electrónicos');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailRRHH) || !emailRegex.test(emailGerencia)) {
      toast.error('Por favor, ingrese correos electrónicos válidos');
      return;
    }

    setIsSending(true);

    // Simular envío de email (en producción esto sería una llamada a la API del backend)
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSending(false);
    setStep('success');

    toast.success('Documento enviado exitosamente', {
      description: `Copias enviadas a RRHH y Gerencia`
    });
  };

  const handleClose = () => {
    setStep('format');
    setSelectedFormat(null);
    setSignatureData(null);
    setEmailRRHH('');
    setEmailGerencia('');
    clearSignature();
    onClose();
  };

  const handleSuccess = () => {
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-[#FF8C00]" />
              Exportar Cartera Profesional
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {['format', 'signature', 'send', 'success'].map((s, index) => {
            const stepIndex = ['format', 'signature', 'send', 'success'].indexOf(step);
            const currentIndex = ['format', 'signature', 'send', 'success'].indexOf(s);
            const isActive = currentIndex <= stepIndex;
            
            return (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-[#0055A4] text-white'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400'
                  }`}
                >
                  {isActive ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                </div>
                {index < 3 && (
                  <div
                    className={`w-12 h-1 mx-1 ${
                      isActive ? 'bg-[#0055A4]' : 'bg-zinc-200 dark:bg-zinc-700'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step: Format Selection */}
        {step === 'format' && (
          <div className="space-y-4">
            <p className="text-zinc-600 dark:text-zinc-400 text-center mb-6">
              Seleccione el formato de exportación para su cartera profesional
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Excel Option */}
              <Card
                className="p-6 cursor-pointer hover:border-[#FF8C00] transition-all border-2 border-zinc-200 dark:border-zinc-700 hover:shadow-lg group"
                onClick={() => handleFormatSelect('excel')}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">
                      Excel (XLSX)
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Datos tabulados para análisis
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400">
                    Sin firma requerida
                  </Badge>
                </div>
              </Card>

              {/* PDF Option */}
              <Card
                className="p-6 cursor-pointer hover:border-[#FF8C00] transition-all border-2 border-zinc-200 dark:border-zinc-700 hover:shadow-lg group"
                onClick={() => handleFormatSelect('pdf')}
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">
                      PDF Firmado
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Documento formal con validez legal
                    </p>
                  </div>
                  <Badge className="bg-[#0055A4]/10 text-[#0055A4] border-[#0055A4]/20">
                    Con firma digital
                  </Badge>
                </div>
              </Card>
            </div>

            {/* Summary Info */}
            <Card className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-4 mt-6">
              <h4 className="font-semibold text-zinc-900 dark:text-white mb-3">
                El documento incluirá:
              </h4>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Resumen de {clients.length} clientes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Métricas financieras consolidadas
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Detalle de horas y gastos por cliente
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Información de pagos pendientes
                </li>
              </ul>
            </Card>
          </div>
        )}

        {/* Step: Signature */}
        {step === 'signature' && (
          <div className="space-y-4">
            <div className="bg-[#0055A4]/10 border border-[#0055A4]/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-[#0055A4] dark:text-[#0055A4] font-medium">
                Por favor, firme el documento para validarlo legalmente
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-zinc-900 dark:text-white">Firma Digital</Label>
              <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg p-2 bg-white dark:bg-zinc-800">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="w-full cursor-crosshair bg-white rounded touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={clearSignature}
                  className="flex-1"
                >
                  <Eraser className="w-4 h-4 mr-2" />
                  Limpiar
                </Button>
                <Button
                  onClick={handleSignatureConfirm}
                  disabled={!signatureData}
                  className="flex-1 bg-[#0055A4] hover:bg-[#0055A4]/90"
                >
                  <PenTool className="w-4 h-4 mr-2" />
                  Confirmar Firma
                </Button>
              </div>
            </div>

            {/* Legal Info */}
            <Card className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-4">
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                <strong>Validez Legal:</strong> Este documento firmado digitalmente tiene validez 
                legal según la Ley 19.799 sobre Documentos Electrónicos, Firma Electrónica y 
                Servicios de Certificación de dicha Firma en Chile.
              </p>
            </Card>
          </div>
        )}

        {/* Step: Send */}
        {step === 'send' && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                  Documento {selectedFormat === 'excel' ? 'Excel' : 'PDF'} generado exitosamente
                </p>
              </div>
            </div>

            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Ingrese los correos electrónicos para enviar copias del documento
            </p>

            <div className="space-y-4">
              {/* Email RRHH */}
              <div className="space-y-2">
                <Label className="text-zinc-900 dark:text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#0055A4]" />
                  Correo de RRHH
                </Label>
                <Input
                  type="email"
                  placeholder="rrhh@empresa.cl"
                  value={emailRRHH}
                  onChange={(e) => setEmailRRHH(e.target.value)}
                  className="bg-white dark:bg-zinc-800"
                />
              </div>

              {/* Email Gerencia */}
              <div className="space-y-2">
                <Label className="text-zinc-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0055A4]" />
                  Correo de Gerencia
                </Label>
                <Input
                  type="email"
                  placeholder="gerencia@empresa.cl"
                  value={emailGerencia}
                  onChange={(e) => setEmailGerencia(e.target.value)}
                  className="bg-white dark:bg-zinc-800"
                />
              </div>
            </div>

            {/* Preview Info */}
            <Card className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-4 mt-4">
              <h4 className="font-semibold text-zinc-900 dark:text-white mb-2 text-sm">
                El correo incluirá:
              </h4>
              <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                <li>• Documento adjunto en formato {selectedFormat?.toUpperCase()}</li>
                <li>• Resumen ejecutivo de la cartera</li>
                <li>• Metadatos de verificación digital</li>
                <li>• Información de contacto del prevencionista</li>
              </ul>
            </Card>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setStep('format')}
                className="flex-1"
              >
                Volver
              </Button>
              <Button
                onClick={handleSendDocument}
                disabled={isSending || !emailRRHH || !emailGerencia}
                className="flex-1 bg-gradient-to-r from-[#FF8C00] to-[#FF8C00]/80 hover:from-[#FF8C00]/90 hover:to-[#FF8C00]/70"
              >
                {isSending ? (
                  <>Enviando...</>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Documento
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="space-y-6 py-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                ¡Documento Enviado!
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-md">
                El resumen de su cartera profesional ha sido enviado exitosamente a RRHH y Gerencia para facturación.
              </p>
            </div>

            {/* Recipients Info */}
            <Card className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 p-4">
              <h4 className="font-semibold text-zinc-900 dark:text-white mb-3 text-sm">
                Destinatarios:
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-[#0055A4]" />
                  <span className="text-zinc-600 dark:text-zinc-400">RRHH:</span>
                  <span className="font-medium text-zinc-900 dark:text-white">{emailRRHH}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-[#0055A4]" />
                  <span className="text-zinc-600 dark:text-zinc-400">Gerencia:</span>
                  <span className="font-medium text-zinc-900 dark:text-white">{emailGerencia}</span>
                </div>
              </div>
            </Card>

            <Button
              onClick={handleSuccess}
              className="w-full bg-[#0055A4] hover:bg-[#0055A4]/90"
            >
              Finalizar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
