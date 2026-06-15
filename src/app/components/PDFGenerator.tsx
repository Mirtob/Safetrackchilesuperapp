import jsPDF from 'jspdf';

interface FormDataPDF {
  title: string;
  description: string;
  location: string;
  photos: string[];
  signature: string | null;
  date: string;
  company: string;
  inspector: string;
}

export function generatePDF(data: FormDataPDF, type: string): Blob {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(255, 140, 0); // Orange color
  doc.text('SafeTrack Chile', 20, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Sistema de Gestión de Prevención de Riesgos', 20, 27);
  
  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 32, 190, 32);
  
  // Document type
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  const docTypes: Record<string, string> = {
    inspection: 'Informe de Inspección',
    epp: 'Registro de Entrega EPP',
    incident: 'Reporte de Incidente',
    talk: 'Acta Charla de 5 Minutos'
  };
  doc.text(docTypes[type] || 'Informe', 20, 42);
  
  // Company and date
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(`Empresa: ${data.company}`, 20, 52);
  doc.text(`Fecha: ${data.date}`, 20, 58);
  doc.text(`Inspector: ${data.inspector}`, 20, 64);
  doc.text(`Ubicación: ${data.location}`, 20, 70);
  
  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 75, 190, 75);
  
  // Title
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Título:', 20, 85);
  doc.setFontSize(10);
  doc.text(data.title || 'Sin título', 20, 92);
  
  // Description
  doc.setFontSize(12);
  doc.text('Descripción:', 20, 105);
  doc.setFontSize(10);
  const splitDescription = doc.splitTextToSize(data.description || 'Sin descripción', 170);
  doc.text(splitDescription, 20, 112);
  
  let yPosition = 112 + (splitDescription.length * 6) + 10;
  
  // Signature section
  if (data.signature) {
    // Add page if needed
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.text('Firma Digital:', 20, yPosition);
    yPosition += 10;
    
    try {
      // Add signature image
      doc.addImage(data.signature, 'PNG', 20, yPosition, 60, 30);
      yPosition += 35;
    } catch (error) {
      console.error('Error adding signature to PDF:', error);
    }
  }
  
  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Documento generado por SafeTrack Chile - ${new Date().toLocaleDateString('es-CL')}`,
      20,
      285
    );
    doc.text(
      `Página ${i} de ${pageCount}`,
      170,
      285
    );
    
    // Legal notice
    doc.setFontSize(7);
    doc.text('Ley 16.744 - Normativa Chilena de Seguridad y Salud Ocupacional', 20, 290);
  }
  
  return doc.output('blob');
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function shareViaWhatsApp(blob: Blob, filename: string) {
  // In a real implementation, you would upload the file to a server
  // and share the URL. For this demo, we'll simulate it
  const message = `📋 *${filename}*\n\nDocumento generado con SafeTrack Chile\n\n_Sistema de Gestión de Prevención de Riesgos_`;
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
}
