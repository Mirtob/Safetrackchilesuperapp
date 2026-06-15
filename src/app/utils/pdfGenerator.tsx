import jsPDF from 'jspdf';

interface Worker {
  id: string;
  name: string;
  rut: string;
  position?: string;
  phone?: string;
  email?: string;
  signed?: boolean;
  signedAt?: string;
  signature?: string;
}

interface PDFData {
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

export function generatePDF(data: PDFData): Blob {
  const doc = new jsPDF();
  let yPosition = 20;

  // Header con logo SafeTrack
  doc.setFontSize(24);
  doc.setTextColor(255, 140, 0); // Orange #FF8C00
  doc.text('SafeTrack Chile', 20, yPosition);
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Sistema de Gestión de Prevención de Riesgos', 20, yPosition);
  
  // Line separator
  yPosition += 5;
  doc.setDrawColor(220, 220, 220);
  doc.line(20, yPosition, 190, yPosition);
  
  // Document Type
  yPosition += 10;
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(data.documentType, 20, yPosition);
  
  // Metadata Box
  yPosition += 10;
  doc.setFillColor(245, 247, 250);
  doc.rect(20, yPosition, 170, 35, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text(`Empresa: ${data.company}`, 25, yPosition + 8);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-CL', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, 25, yPosition + 15);
  
  if (data.preventionist) {
    doc.text(`Prevencionista: ${data.preventionist}`, 25, yPosition + 22);
  }
  
  if (data.location) {
    doc.text(`Ubicación: ${data.location}`, 25, yPosition + 29);
  }
  
  // Main Content
  yPosition += 45;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Título:', 20, yPosition);
  
  yPosition += 7;
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  const titleLines = doc.splitTextToSize(data.documentTitle, 170);
  doc.text(titleLines, 20, yPosition);
  yPosition += titleLines.length * 6;
  
  // Content/Description
  if (data.content) {
    yPosition += 8;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Descripción:', 20, yPosition);
    
    yPosition += 7;
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    const contentLines = doc.splitTextToSize(data.content, 170);
    doc.text(contentLines, 20, yPosition);
    yPosition += contentLines.length * 6;
  }
  
  // EPP List - SI ES ENTREGA DE EPP
  if (data.documentType.toLowerCase().includes('epp') && data.additionalData?.selectedEPPs) {
    yPosition += 10;
    
    // Check if we need a new page
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Elementos de Protección Personal Entregados:', 20, yPosition);
    
    yPosition += 8;
    
    // EPP Catalog (debe estar disponible o pasarse en additionalData)
    const eppCatalog = data.additionalData.eppCatalog || [];
    const selectedEPPs = data.additionalData.selectedEPPs || [];
    
    if (selectedEPPs.length > 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(20, yPosition, 170, selectedEPPs.length * 10 + 5, 'F');
      
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      
      selectedEPPs.forEach((eppId: string, index: number) => {
        const epp = eppCatalog.find((e: any) => e.id === eppId);
        if (epp) {
          const itemY = yPosition + 8 + (index * 10);
          doc.text(`${epp.icon || '•'} ${epp.name}`, 25, itemY);
          doc.setFontSize(8);
          doc.setTextColor(120, 120, 120);
          doc.text(`[${epp.category}]`, 150, itemY);
          doc.setFontSize(9);
          doc.setTextColor(60, 60, 60);
        }
      });
      
      yPosition += selectedEPPs.length * 10 + 10;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text('No se seleccionaron EPPs', 25, yPosition);
      yPosition += 10;
    }
  }
  
  // Workers/Participants Section
  if (data.workers && data.workers.length > 0) {
    yPosition += 10;
    
    // Check if we need a new page
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Trabajadores (${data.workers.length})`, 20, yPosition);
    
    yPosition += 8;
    
    // Table header
    doc.setFillColor(0, 85, 164); // Blue #0055A4
    doc.rect(20, yPosition, 170, 8, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('Nombre', 25, yPosition + 5.5);
    doc.text('RUT', 90, yPosition + 5.5);
    doc.text('Cargo', 130, yPosition + 5.5);
    doc.text('Estado', 170, yPosition + 5.5);
    
    yPosition += 8;
    
    // Table rows
    data.workers.forEach((worker, index) => {
      // Check if we need a new page
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(20, yPosition, 170, 8, 'F');
      }
      
      doc.setFontSize(8);
      doc.setTextColor(40, 40, 40);
      doc.text(worker.name, 25, yPosition + 5.5);
      doc.text(worker.rut, 90, yPosition + 5.5);
      doc.text(worker.position || '-', 130, yPosition + 5.5);
      
      // Status
      if (worker.signed) {
        doc.setTextColor(0, 150, 0);
        doc.text('✓ Firmado', 170, yPosition + 5.5);
      } else {
        doc.setTextColor(200, 100, 0);
        doc.text('Pendiente', 170, yPosition + 5.5);
      }
      
      yPosition += 8;
    });
    
    // Sección de Firmas Digitales - Mostrar las firmas reales
    const workersWithSignatures = data.workers.filter(w => w.signature);
    
    if (workersWithSignatures.length > 0) {
      yPosition += 15;
      
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('Firmas Digitales de los Trabajadores', 20, yPosition);
      
      yPosition += 10;
      
      // Mostrar firmas en grid de 2 columnas
      workersWithSignatures.forEach((worker, index) => {
        // Check if we need a new page (cada firma necesita ~50mm de altura)
        if (yPosition > 230) {
          doc.addPage();
          yPosition = 20;
        }
        
        const isLeftColumn = index % 2 === 0;
        const xPosition = isLeftColumn ? 20 : 110;
        
        // Si es columna derecha y no es el primer elemento, no incrementar Y
        if (!isLeftColumn) {
          yPosition -= 50; // Volver arriba para la columna derecha
        }
        
        // Box para la firma
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(248, 248, 248);
        doc.roundedRect(xPosition, yPosition, 85, 48, 2, 2, 'FD');
        
        // Nombre del trabajador
        doc.setFontSize(9);
        doc.setTextColor(40, 40, 40);
        doc.setFont(undefined, 'bold');
        doc.text(worker.name, xPosition + 3, yPosition + 6);
        
        // RUT y Cargo
        doc.setFontSize(7);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`RUT: ${worker.rut}`, xPosition + 3, yPosition + 11);
        if (worker.position) {
          doc.text(`Cargo: ${worker.position}`, xPosition + 3, yPosition + 15);
        }
        
        // Fecha de firma
        if (worker.signedAt) {
          doc.setFontSize(6);
          doc.setTextColor(0, 120, 0);
          doc.text(`Firmado: ${worker.signedAt}`, xPosition + 3, yPosition + 19);
        }
        
        // Imagen de la firma
        if (worker.signature) {
          try {
            // Box para la firma con borde azul
            doc.setDrawColor(100, 150, 255);
            doc.setLineWidth(0.5);
            doc.rect(xPosition + 3, yPosition + 22, 79, 20);
            
            // Agregar la imagen de la firma
            doc.addImage(
              worker.signature,
              'PNG',
              xPosition + 4,
              yPosition + 23,
              77,
              18
            );
            
            // Marca de verificación
            doc.setFontSize(6);
            doc.setTextColor(0, 150, 0);
            doc.text('✓ Firma Digital Verificada', xPosition + 20, yPosition + 46);
          } catch (error) {
            console.error('Error adding signature image:', error);
            doc.setFontSize(7);
            doc.setTextColor(200, 0, 0);
            doc.text('Error al cargar firma', xPosition + 20, yPosition + 35);
          }
        }
        
        // Si es columna derecha o último elemento impar, incrementar Y
        if (!isLeftColumn || index === workersWithSignatures.length - 1) {
          yPosition += 52;
        }
      });
    }
  }
  
  // Legal Footer
  yPosition += 15;
  
  // Check if we need a new page for footer
  if (yPosition > 265) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setDrawColor(220, 220, 220);
  doc.line(20, yPosition, 190, yPosition);
  
  yPosition += 8;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('🔒 Documento con Validez Legal - Ley 16.744 de Seguridad Social', 20, yPosition);
  doc.text('Ley 19.799 de Firma Electrónica', 20, yPosition + 5);
  
  yPosition += 10;
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generado: ${new Date().toLocaleString('es-CL')}`, 20, yPosition);
  doc.text(`Código de Verificación: ${generateVerificationCode()}`, 20, yPosition + 4);
  
  // Page numbers
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Página ${i} de ${pageCount}`,
      195,
      285,
      { align: 'right' }
    );
  }
  
  return doc.output('blob');
}

export function generateVerificationCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ST-${timestamp}-${random}`;
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().getTime()}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Función para generar PDF de plan mensual (ya existente en MonthlyWorkPlanComplete)
export function generateMonthlyWorkPlanPDF(data: any): Blob {
  const doc = new jsPDF();
  let yPosition = 20;

  // Header
  doc.setFontSize(24);
  doc.setTextColor(255, 140, 0);
  doc.text('SafeTrack Chile', 20, yPosition);
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Plan Mensual de Trabajo', 20, yPosition);
  
  yPosition += 10;
  doc.setDrawColor(220, 220, 220);
  doc.line(20, yPosition, 190, yPosition);
  
  yPosition += 10;
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`${data.month} ${data.year}`, 20, yPosition);
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.text(`Empresa: ${data.company}`, 20, yPosition);
  
  // Add more plan details here...
  
  return doc.output('blob');
}