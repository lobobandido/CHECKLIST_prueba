import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InspectionData {
  folio: string;
  vehicle: {
    unit_number: string;
    license_plate?: string;
    brand?: string;
    model?: string;
    vehicle_type: string;
  };
  inspection_type: string;
  inspection_date: string;
  inspector: {
    full_name: string;
    email: string;
  };
  driver: {
    full_name: string;
    email: string;
  };
  observations?: string;
  inspector_signature?: string;
  driver_signature?: string;
  items: Array<{
    part_name: string;
    status: string;
    notes?: string;
  }>;
  evidence: Array<{
    file_type: string;
    file_name: string;
  }>;
}

export function generateInspectionPDF(data: InspectionData): jsPDF {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, pageWidth, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORTE DE INSPECCIÓN', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistema de Gestión de Unidades', pageWidth / 2, 22, { align: 'center' });

  let yPos = 45;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Folio: ${data.folio}`, margin, yPos);

  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const inspectionDate = new Date(data.inspection_date);
  doc.text(`Fecha: ${inspectionDate.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, margin, yPos);

  yPos += 7;
  doc.text(`Tipo: ${data.inspection_type === 'departure' ? 'Salida' : 'Retorno'}`, margin, yPos);

  yPos += 15;
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMACIÓN DE LA UNIDAD', margin + 5, yPos);

  yPos += 10;
  doc.setFont('helvetica', 'normal');
  doc.text(`Tipo de unidad: ${data.vehicle.vehicle_type}`, margin + 5, yPos);

  yPos += 6;
  doc.text(`Número de unidad: ${data.vehicle.unit_number}`, margin + 5, yPos);

  if (data.vehicle.license_plate) {
    yPos += 6;
    doc.text(`Placas: ${data.vehicle.license_plate}`, margin + 5, yPos);
  }

  if (data.vehicle.brand && data.vehicle.model) {
    yPos += 6;
    doc.text(`Marca/Modelo: ${data.vehicle.brand} ${data.vehicle.model}`, margin + 5, yPos);
  }

  yPos += 15;
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('RESPONSABLES', margin + 5, yPos);

  yPos += 10;
  doc.setFont('helvetica', 'normal');
  doc.text(`Inspector: ${data.inspector.full_name}`, margin + 5, yPos);

  yPos += 6;
  doc.text(`Chofer: ${data.driver.full_name}`, margin + 5, yPos);

  yPos += 15;
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('CHECKLIST DE INSPECCIÓN', margin + 5, yPos);

  yPos += 10;

  const tableData = data.items.map(item => {
    let statusText = '';
    if (item.status === 'no_damage') statusText = '✓ Sin daño';
    else if (item.status === 'damaged') statusText = '✗ Con daño';
    else statusText = '- No aplica';

    return [
      item.part_name,
      statusText,
      item.notes || '-'
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Parte', 'Estado', 'Notas']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 40 },
      2: { cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  if (data.observations) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFillColor(241, 245, 249);
    doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVACIONES', margin + 5, yPos);

    yPos += 10;
    doc.setFont('helvetica', 'normal');
    const splitObservations = doc.splitTextToSize(data.observations, pageWidth - 2 * margin - 10);
    doc.text(splitObservations, margin + 5, yPos);
    yPos += splitObservations.length * 5 + 10;
  }

  if (data.evidence.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFillColor(241, 245, 249);
    doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('EVIDENCIA ADJUNTA', margin + 5, yPos);

    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    data.evidence.forEach((item, index) => {
      const icon = item.file_type === 'image' ? '📷' : '🎥';
      doc.text(`${icon} ${item.file_name}`, margin + 5, yPos);
      yPos += 5;

      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
    });

    yPos += 10;
  }

  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  } else {
    yPos += 15;
  }

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('FIRMAS', margin + 5, yPos);

  yPos += 15;

  const signatureWidth = (pageWidth - 3 * margin) / 2;
  const signatureHeight = 30;

  if (data.inspector_signature) {
    doc.addImage(data.inspector_signature, 'PNG', margin, yPos, signatureWidth, signatureHeight);
  }

  if (data.driver_signature) {
    doc.addImage(data.driver_signature, 'PNG', margin + signatureWidth + margin, yPos, signatureWidth, signatureHeight);
  }

  yPos += signatureHeight + 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Inspector', margin + signatureWidth / 2, yPos, { align: 'center' });
  doc.text('Chofer', margin + signatureWidth + margin + signatureWidth / 2, yPos, { align: 'center' });

  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(data.inspector.full_name, margin + signatureWidth / 2, yPos, { align: 'center' });
  doc.text(data.driver.full_name, margin + signatureWidth + margin + signatureWidth / 2, yPos, { align: 'center' });

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc;
}
