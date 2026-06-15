import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Worker {
  id: string;
  name: string;
  rut: string;
  phone?: string;
  email?: string;
  signature?: string;
}

interface DocumentData {
  documentType: string;
  documentTitle: string;
  company: string;
  branch?: string;
  preventionist?: string;
  content?: string;
  location?: string;
  gps?: string;
  workers: Worker[];
  additionalData?: any;
}

export function generateVerificationCode(): string {
  return `VER-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

export function generatePDF(data: DocumentData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // ============================================
  // HEADER - Logo y Título Principal
  // ============================================
  
  // Línea superior naranja
  doc.setFillColor(255, 140, 0); // Orange #FF8C00
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Logo y Título
  doc.setFontSize(24);
  doc.setTextColor(41, 41, 41);
  doc.setFont('helvetica', 'bold');
  doc.text('SafeTrack Chile', 15, yPosition);
  
  yPosition += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Plataforma de Prevención de Riesgos', 15, yPosition);

  // Badge "Documento Oficial"
  doc.setFillColor(34, 197, 94); // Green
  doc.roundedRect(pageWidth - 60, 12, 45, 8, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('DOCUMENTO OFICIAL', pageWidth - 57, 17);

  // Fecha y Hora
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  doc.text(`Fecha: ${dateStr}`, pageWidth - 60, 23);
  doc.text(`Hora: ${timeStr}`, pageWidth - 60, 28);

  // Línea divisoria
  yPosition = 35;
  doc.setDrawColor(255, 140, 0);
  doc.setLineWidth(1);
  doc.line(15, yPosition, pageWidth - 15, yPosition);

  // ============================================
  // TÍTULO DEL DOCUMENTO
  // ============================================
  yPosition += 10;
  doc.setFontSize(16);
  doc.setTextColor(0, 85, 164); // Blue #0055A4
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(data.documentType.toUpperCase(), pageWidth - 30);
  titleLines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 7;
  });

  yPosition += 3;
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  const subtitleLines = doc.splitTextToSize(data.documentTitle, pageWidth - 30);
  subtitleLines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;
  });

  // ============================================
  // INFORMACIÓN DE LA EMPRESA (Caja Azul)
  // ============================================
  yPosition += 5;
  doc.setFillColor(219, 234, 254); // Light blue
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(15, yPosition, pageWidth - 30, 28, 2, 2, 'FD');

  yPosition += 7;
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');

  // Primera columna
  doc.text('Empresa:', 20, yPosition);
  doc.setFont('helvetica', 'bold');
  doc.text(data.company, 45, yPosition);

  doc.setFont('helvetica', 'normal');
  doc.text('Prevencionista:', 20, yPosition + 6);
  doc.setFont('helvetica', 'bold');
  doc.text(data.preventionist || 'Juan Pérez Silva', 50, yPosition + 6);

  // Segunda columna
  if (data.branch) {
    doc.setFont('helvetica', 'normal');
    doc.text('Sucursal:', pageWidth / 2 + 10, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.text(data.branch, pageWidth / 2 + 30, yPosition);
  }

  doc.setFont('helvetica', 'normal');
  doc.text('Fecha:', pageWidth / 2 + 10, yPosition + 6);
  doc.setFont('helvetica', 'bold');
  doc.text(dateStr, pageWidth / 2 + 26, yPosition + 6);

  yPosition += 35;

  // ============================================
  // CONTENIDO DEL DOCUMENTO
  // ============================================
  if (data.content) {
    doc.setFontSize(10);
    doc.setTextColor(41, 41, 41);
    doc.setFont('helvetica', 'bold');
    doc.text('Contenido:', 15, yPosition);
    yPosition += 7;

    doc.setFillColor(248, 250, 252); // Light gray
    const contentHeight = Math.min(40, data.content.length / 5);
    doc.roundedRect(15, yPosition - 4, pageWidth - 30, contentHeight, 2, 2, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const contentLines = doc.splitTextToSize(data.content, pageWidth - 40);
    contentLines.forEach((line: string, index: number) => {
      if (yPosition + (index * 5) > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition + (index * 5));
    });

    yPosition += contentLines.length * 5 + 10;
  }

  // ============================================
  // TABLA DE TRABAJADORES PARTICIPANTES
  // ============================================
  if (data.workers && data.workers.length > 0) {
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(10);
    doc.setTextColor(41, 41, 41);
    doc.setFont('helvetica', 'bold');
    doc.text(`Trabajadores Participantes (${data.workers.length}):`, 15, yPosition);
    yPosition += 5;

    // Preparar datos de la tabla
    const tableData = data.workers.map((worker, index) => [
      (index + 1).toString(),
      worker.name,
      worker.rut,
      worker.signature ? '✓ Firmado' : 'Sin firma'
    ]);

    (doc as any).autoTable({
      startY: yPosition,
      head: [['N°', 'Nombre Completo', 'RUT', 'Firma']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [0, 85, 164], // Blue #0055A4
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [41, 41, 41]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'left', cellWidth: 'auto' },
        2: { halign: 'center', cellWidth: 35 },
        3: { halign: 'center', cellWidth: 30 }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 15, right: 15 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // ============================================
  // UBICACIÓN Y GPS (Si existe)
  // ============================================
  if (data.location || data.gps) {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFillColor(243, 232, 255); // Light purple
    doc.setDrawColor(233, 213, 255);
    doc.roundedRect(15, yPosition, pageWidth - 30, 20, 2, 2, 'FD');

    yPosition += 7;
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');

    if (data.location) {
      doc.text('📍 Ubicación:', 20, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.text(data.location, 45, yPosition);
    }

    if (data.gps) {
      doc.setFont('helvetica', 'normal');
      doc.text('🌍 GPS:', 20, yPosition + 6);
      doc.setFont('helvetica', 'bold');
      doc.text(data.gps, 35, yPosition + 6);
    }

    yPosition += 25;
  }

  // ============================================
  // FIRMAS DIGITALES (Con validez legal)
  // ============================================
  const workersWithSignatures = data.workers.filter(w => w.signature);
  
  if (workersWithSignatures.length > 0) {
    // Verificar si necesitamos nueva página
    const signaturesNeeded = workersWithSignatures.length;
    const rowsNeeded = Math.ceil(signaturesNeeded / 2);
    const spaceNeeded = 15 + (rowsNeeded * 45); // Header + rows
    
    if (yPosition + spaceNeeded > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }

    // Header de la sección
    doc.setFillColor(0, 85, 164); // Blue
    doc.rect(15, yPosition, pageWidth - 30, 10, 'F');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('FIRMAS DIGITALES DE TRABAJADORES', 20, yPosition + 7);

    yPosition += 15;

    // Grid de firmas - 2 columnas
    const signatureWidth = (pageWidth - 40) / 2;
    const signatureHeight = 40;
    let currentCol = 0;
    let currentRow = 0;

    workersWithSignatures.forEach((worker, index) => {
      const xPos = 15 + (currentCol * signatureWidth) + (currentCol * 5);
      const yPos = yPosition + (currentRow * (signatureHeight + 8));

      // Verificar si necesitamos nueva página
      if (yPos + signatureHeight > pageHeight - 50) {
        doc.addPage();
        yPosition = 20;
        currentRow = 0;
        currentCol = 0;
        return;
      }

      // Caja de firma
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(xPos, yPos, signatureWidth - 2, signatureHeight, 2, 2, 'FD');

      // Imagen de la firma
      if (worker.signature) {
        try {
          doc.addImage(worker.signature, 'PNG', xPos + 5, yPos + 3, signatureWidth - 12, 20);
        } catch (e) {
          console.error('Error adding signature image:', e);
        }
      }

      // Línea divisoria
      doc.setDrawColor(220, 220, 220);
      doc.line(xPos + 5, yPos + 25, xPos + signatureWidth - 7, yPos + 25);

      // Datos del trabajador
      doc.setFontSize(8);
      doc.setTextColor(41, 41, 41);
      doc.setFont('helvetica', 'bold');
      doc.text(worker.name, xPos + signatureWidth / 2, yPos + 29, { align: 'center' });
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`RUT: ${worker.rut}`, xPos + signatureWidth / 2, yPos + 33, { align: 'center' });
      
      const signedDate = new Date().toLocaleString('es-CL');
      doc.text(`Firmado: ${signedDate}`, xPos + signatureWidth / 2, yPos + 37, { align: 'center' });

      // Avanzar posición
      currentCol++;
      if (currentCol >= 2) {
        currentCol = 0;
        currentRow++;
      }
    });

    yPosition += (Math.ceil(workersWithSignatures.length / 2) * (signatureHeight + 8)) + 10;
  }

  // ============================================
  // FOOTER - Metadatos de Verificación
  // ============================================
  const verificationCode = generateVerificationCode();
  const timestamp = new Date().toISOString();

  // Agregar nueva página si no hay suficiente espacio
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }

  // Ir al final de la última página con espacio suficiente
  const footerStartY = pageHeight - 40;
  
  // Línea divisoria
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(15, footerStartY, pageWidth - 15, footerStartY);

  let footerY = footerStartY + 6;

  // Texto de validez legal
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'bold');
  doc.text('DOCUMENTO GENERADO ELECTRÓNICAMENTE CON VALIDEZ LEGAL', pageWidth / 2, footerY, { align: 'center' });
  
  footerY += 5;
  doc.setFont('helvetica', 'normal');
  doc.text('SafeTrack Chile - Cumplimiento Ley 16.744', pageWidth / 2, footerY, { align: 'center' });
  
  footerY += 5;
  doc.setFontSize(7);
  doc.text(`Timestamp: ${timestamp}`, pageWidth / 2, footerY, { align: 'center' });
  
  footerY += 4;
  doc.text(`Código de Verificación: ${verificationCode}`, pageWidth / 2, footerY, { align: 'center' });
  
  footerY += 4;
  doc.text('🔒 Este documento contiene firmas digitales verificables y geolocalización', pageWidth / 2, footerY, { align: 'center' });

  // Línea naranja inferior
  doc.setFillColor(255, 140, 0);
  doc.rect(0, pageHeight - 5, pageWidth, 5, 'F');

  return doc;
}

export function downloadPDF(doc: jsPDF, filename: string): void {
  const sanitizedFilename = filename.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
  const timestamp = new Date().toISOString().split('T')[0];
  const fullFilename = `${sanitizedFilename}_${timestamp}.pdf`;
  
  doc.save(fullFilename);
}

export function getPDFBlob(doc: jsPDF): Blob {
  return doc.output('blob');
}

export function getPDFBase64(doc: jsPDF): string {
  return doc.output('dataurlstring');
}

// Función específica para generar PDF de Charla de Seguridad
export function generateSafetyTalkPDF(data: {
  title: string;
  company: string;
  branch?: string;
  preventionist?: string;
  content: string;
  workers: Worker[];
  location?: string;
  gps?: string;
}): jsPDF {
  return generatePDF({
    documentType: 'CHARLA DE SEGURIDAD',
    documentTitle: data.title,
    company: data.company,
    branch: data.branch,
    preventionist: data.preventionist,
    content: data.content,
    workers: data.workers,
    location: data.location,
    gps: data.gps
  });
}

// Función específica para generar PDF de Inspección
export function generateInspectionPDF(data: {
  title: string;
  company: string;
  branch?: string;
  preventionist?: string;
  findings: string;
  workers: Worker[];
  location?: string;
  gps?: string;
}): jsPDF {
  return generatePDF({
    documentType: 'INSPECCIÓN DE SEGURIDAD',
    documentTitle: data.title,
    company: data.company,
    branch: data.branch,
    preventionist: data.preventionist,
    content: data.findings,
    workers: data.workers,
    location: data.location,
    gps: data.gps
  });
}

// Función específica para generar PDF de Entrega de EPP
export function generateEPPDeliveryPDF(data: {
  title: string;
  company: string;
  branch?: string;
  preventionist?: string;
  items: string;
  workers: Worker[];
  location?: string;
  gps?: string;
}): jsPDF {
  return generatePDF({
    documentType: 'ENTREGA DE ELEMENTOS DE PROTECCIÓN PERSONAL',
    documentTitle: data.title,
    company: data.company,
    branch: data.branch,
    preventionist: data.preventionist,
    content: data.items,
    workers: data.workers,
    location: data.location,
    gps: data.gps
  });
}

// Función específica para generar PDF del Plan de Trabajo Mensual
export function generateMonthlyWorkPlanPDF(data: {
  month: string;
  year: number;
  company: string;
  status: string;
  activities: any[];
  signatures?: any[];
  verificationCode?: string;
}): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // ============================================
  // HEADER - Logo y Título Principal
  // ============================================
  
  // Línea superior naranja
  doc.setFillColor(255, 140, 0); // Orange #FF8C00
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Logo y Título
  doc.setFontSize(24);
  doc.setTextColor(41, 41, 41);
  doc.setFont('helvetica', 'bold');
  doc.text('SafeTrack Chile', 15, yPosition);
  
  yPosition += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Plataforma de Prevención de Riesgos', 15, yPosition);

  // Badge "Documento Oficial"
  doc.setFillColor(34, 197, 94); // Green
  doc.roundedRect(pageWidth - 60, 12, 45, 8, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('DOCUMENTO OFICIAL', pageWidth - 57, 17);

  // Fecha de generación
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  doc.text(`Generado: ${dateStr}`, pageWidth - 60, 23);
  doc.text(`Hora: ${timeStr}`, pageWidth - 60, 28);

  // Línea divisoria
  yPosition = 35;
  doc.setDrawColor(255, 140, 0);
  doc.setLineWidth(1);
  doc.line(15, yPosition, pageWidth - 15, yPosition);

  // ============================================
  // TÍTULO DEL DOCUMENTO
  // ============================================
  yPosition += 10;
  doc.setFontSize(18);
  doc.setTextColor(0, 85, 164); // Blue #0055A4
  doc.setFont('helvetica', 'bold');
  doc.text('PLAN DE TRABAJO MENSUAL', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 8;
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text(`${data.month} ${data.year}`, pageWidth / 2, yPosition, { align: 'center' });

  // ============================================
  // INFORMACIÓN DE LA EMPRESA (Caja Azul)
  // ============================================
  yPosition += 10;
  doc.setFillColor(219, 234, 254); // Light blue
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(15, yPosition, pageWidth - 30, 30, 2, 2, 'FD');

  yPosition += 8;
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');

  doc.text('Empresa:', 20, yPosition);
  doc.setFont('helvetica', 'bold');
  doc.text(data.company, 42, yPosition);

  doc.setFont('helvetica', 'normal');
  doc.text('Período:', 20, yPosition + 7);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.month} ${data.year}`, 42, yPosition + 7);

  doc.setFont('helvetica', 'normal');
  doc.text('Estado:', 20, yPosition + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(
    data.status === 'Aprobado' ? [34, 197, 94] : // Green
    data.status === 'Pendiente de Firmas' ? [234, 179, 8] : // Yellow
    [100, 100, 100] // Gray
  );
  doc.text(data.status, 42, yPosition + 14);

  // Código de verificación si existe
  if (data.verificationCode) {
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.text('Código:', pageWidth / 2 + 15, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(data.verificationCode, pageWidth / 2 + 35, yPosition);
    doc.setFontSize(10);
  }

  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.text('Total Actividades:', pageWidth / 2 + 15, yPosition + 7);
  doc.setFont('helvetica', 'bold');
  doc.text(data.activities.length.toString(), pageWidth / 2 + 53, yPosition + 7);

  const completed = data.activities.filter((a: any) => a.status === 'completed').length;
  const pending = data.activities.filter((a: any) => a.status === 'pending').length;
  
  doc.setFont('helvetica', 'normal');
  doc.text('Completadas:', pageWidth / 2 + 15, yPosition + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 197, 94); // Green
  doc.text(completed.toString(), pageWidth / 2 + 45, yPosition + 14);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('/', pageWidth / 2 + 50, yPosition + 14);
  
  doc.text('Pendientes:', pageWidth / 2 + 55, yPosition + 14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 140, 0); // Orange
  doc.text(pending.toString(), pageWidth / 2 + 82, yPosition + 14);

  yPosition += 40;

  // ============================================
  // RESUMEN POR TIPO DE ACTIVIDAD
  // ============================================
  doc.setFontSize(11);
  doc.setTextColor(0, 85, 164);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMEN POR CATEGORÍA', 15, yPosition);

  yPosition += 8;

  // Contar por tipo
  const typeCounts: { [key: string]: number } = {};
  const typeLabels: { [key: string]: string } = {
    inspection: '🔍 Inspecciones',
    training: '📚 Capacitaciones',
    maintenance: '🔧 Mantenciones',
    meeting: '👥 Reuniones',
    drill: '🚨 Simulacros',
    audit: '📋 Auditorías',
    other: '📌 Otros'
  };

  data.activities.forEach((activity: any) => {
    typeCounts[activity.type] = (typeCounts[activity.type] || 0) + 1;
  });

  // Mostrar resumen en grid
  const types = Object.keys(typeCounts);
  const col1 = types.slice(0, Math.ceil(types.length / 2));
  const col2 = types.slice(Math.ceil(types.length / 2));

  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');

  col1.forEach((type, index) => {
    const label = typeLabels[type] || type;
    const count = typeCounts[type];
    doc.text(`${label}: `, 20, yPosition + (index * 6));
    doc.setFont('helvetica', 'bold');
    doc.text(count.toString(), 65, yPosition + (index * 6));
    doc.setFont('helvetica', 'normal');
  });

  col2.forEach((type, index) => {
    const label = typeLabels[type] || type;
    const count = typeCounts[type];
    doc.text(`${label}: `, pageWidth / 2 + 10, yPosition + (index * 6));
    doc.setFont('helvetica', 'bold');
    doc.text(count.toString(), pageWidth / 2 + 55, yPosition + (index * 6));
    doc.setFont('helvetica', 'normal');
  });

  yPosition += Math.max(col1.length, col2.length) * 6 + 10;

  // ============================================
  // TABLA DE ACTIVIDADES
  // ============================================
  doc.setFontSize(11);
  doc.setTextColor(0, 85, 164);
  doc.setFont('helvetica', 'bold');
  doc.text('ACTIVIDADES PLANIFICADAS', 15, yPosition);

  yPosition += 5;

  // Preparar datos de la tabla
  const tableData = data.activities.map((activity: any) => {
    const typeConfig: { [key: string]: string } = {
      inspection: '🔍 Inspección',
      training: '📚 Capacitación',
      maintenance: '🔧 Mantención',
      meeting: '👥 Reunión',
      drill: '🚨 Simulacro',
      audit: '📋 Auditoría',
      other: '📌 Otro'
    };

    const statusConfig: { [key: string]: string } = {
      pending: 'Pendiente',
      'in-progress': 'En Proceso',
      completed: 'Completada',
      cancelled: 'Cancelada'
    };

    const priorityConfig: { [key: string]: string } = {
      high: 'Alta',
      medium: 'Media',
      low: 'Baja'
    };

    const date = new Date(activity.date);
    const formattedDate = date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });

    return [
      formattedDate,
      typeConfig[activity.type] || activity.type,
      activity.title,
      activity.responsible || '-',
      priorityConfig[activity.priority] || activity.priority,
      statusConfig[activity.status] || activity.status
    ];
  });

  // Ordenar por fecha
  tableData.sort((a, b) => {
    const [dayA, monthA] = a[0].split('/').map(Number);
    const [dayB, monthB] = b[0].split('/').map(Number);
    return (monthA * 100 + dayA) - (monthB * 100 + dayB);
  });

  // Usar autoTable para la tabla
  (doc as any).autoTable({
    startY: yPosition,
    head: [['Fecha', 'Tipo', 'Actividad', 'Responsable', 'Prioridad', 'Estado']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 85, 164], // Blue
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' }, // Fecha
      1: { cellWidth: 30 }, // Tipo
      2: { cellWidth: 55 }, // Actividad
      3: { cellWidth: 30 }, // Responsable
      4: { cellWidth: 20, halign: 'center' }, // Prioridad
      5: { cellWidth: 25, halign: 'center' } // Estado
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    },
    margin: { left: 15, right: 15 },
    didParseCell: function(data: any) {
      // Colorear estados
      if (data.column.index === 5 && data.section === 'body') {
        const status = data.cell.raw;
        if (status === 'Completada') {
          data.cell.styles.textColor = [34, 197, 94]; // Green
          data.cell.styles.fontStyle = 'bold';
        } else if (status === 'Pendiente') {
          data.cell.styles.textColor = [255, 140, 0]; // Orange
          data.cell.styles.fontStyle = 'bold';
        } else if (status === 'En Proceso') {
          data.cell.styles.textColor = [59, 130, 246]; // Blue
          data.cell.styles.fontStyle = 'bold';
        }
      }
      
      // Colorear prioridades
      if (data.column.index === 4 && data.section === 'body') {
        const priority = data.cell.raw;
        if (priority === 'Alta') {
          data.cell.styles.textColor = [239, 68, 68]; // Red
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });

  // Actualizar yPosition después de la tabla
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // ============================================
  // MARCO NORMATIVO
  // ============================================
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFillColor(254, 243, 199); // Light yellow
  doc.setDrawColor(253, 224, 71);
  doc.roundedRect(15, yPosition, pageWidth - 30, 22, 2, 2, 'FD');

  yPosition += 7;
  doc.setFontSize(9);
  doc.setTextColor(120, 53, 15); // Dark orange/brown
  doc.setFont('helvetica', 'bold');
  doc.text('⚖️ MARCO NORMATIVO:', 20, yPosition);

  yPosition += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  const legalText = 'Este plan de trabajo se elabora en cumplimiento del D.S. 594 sobre Condiciones Sanitarias y Ambientales Básicas en los Lugares de Trabajo, D.S. 40 sobre Prevención de Riesgos Profesionales, y Ley 16.744 sobre Accidentes del Trabajo y Enfermedades Profesionales.';
  const legalLines = doc.splitTextToSize(legalText, pageWidth - 40);
  legalLines.forEach((line: string, index: number) => {
    doc.text(line, 20, yPosition + (index * 4));
  });

  yPosition += legalLines.length * 4 + 10;

  // ============================================
  // FIRMAS (si existen)
  // ============================================
  if (data.signatures && data.signatures.length > 0) {
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(11);
    doc.setTextColor(0, 85, 164);
    doc.setFont('helvetica', 'bold');
    doc.text('FIRMAS Y VALIDACIÓN', 15, yPosition);

    yPosition += 10;

    const signaturesPerRow = 2;
    const signatureWidth = (pageWidth - 30) / signaturesPerRow - 10;

    data.signatures.forEach((signature: any, index: number) => {
      const col = index % signaturesPerRow;
      const row = Math.floor(index / signaturesPerRow);
      const xPos = 15 + col * (signatureWidth + 10);
      const yPos = yPosition + row * 35;

      // Caja de firma
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(xPos, yPos, signatureWidth, 30);

      // Línea para la firma
      doc.line(xPos + 5, yPos + 20, xPos + signatureWidth - 5, yPos + 20);

      // Información del firmante
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'bold');
      doc.text(signature.name, xPos + signatureWidth / 2, yPos + 24, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(signature.role === 'preventionist' ? 'Prevencionista de Riesgos' : 'Gerente General', 
               xPos + signatureWidth / 2, yPos + 27, { align: 'center' });

      const signDate = new Date(signature.signedAt);
      const signDateStr = signDate.toLocaleDateString('es-CL', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
      doc.text(`Firmado: ${signDateStr}`, xPos + signatureWidth / 2, yPos + 29.5, { align: 'center' });
    });

    yPosition += Math.ceil(data.signatures.length / signaturesPerRow) * 35 + 10;
  }

  // ============================================
  // FOOTER CON CÓDIGO DE VERIFICACIÓN
  // ============================================
  const addFooter = (pageNum: number, totalPages: number) => {
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'normal');

    // Línea superior
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);

    // Texto del footer
    doc.text('SafeTrack Chile - Plataforma de Prevención de Riesgos', 15, pageHeight - 10);
    doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    if (data.verificationCode) {
      doc.text(`Código: ${data.verificationCode}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
    }

    doc.setFontSize(6);
    doc.text('Documento generado electrónicamente. Validez legal según Ley 19.799 sobre documentos electrónicos', 
             pageWidth / 2, pageHeight - 7, { align: 'center' });
  };

  // Agregar footer a todas las páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i, totalPages);
  }

  return doc;
}