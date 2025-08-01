import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format, parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const drawHeader = async (doc, schoolSettings, title) => {
  let startY = 15;
  if (schoolSettings?.logo_url) {
    try {
      const response = await fetch(schoolSettings.logo_url);
      const blob = await response.blob();
      const imgData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const img = new Image();
      img.src = imgData;
      await new Promise(resolve => { img.onload = resolve });
      const imgWidth = 30;
      const imgHeight = (img.height * imgWidth) / img.width;
      doc.addImage(imgData, 'PNG', 15, startY, imgWidth, imgHeight);
      startY = 22;
    } catch (e) {
      console.error("Error loading logo for PDF, skipping.", e);
      startY = 22;
    }
  }
  
  if (schoolSettings?.school_name) {
      doc.setFontSize(16);
      doc.text(schoolSettings.school_name, 50, startY);
  }
  
  doc.setFontSize(18);
  doc.text(title, doc.internal.pageSize.getWidth() / 2, startY + 15, { align: 'center' });

  return startY + 25;
};

export const generateCashCutPdf = async (cut, cutPayments, schoolSettings) => {
  const doc = new jsPDF();
  let startY = await drawHeader(doc, schoolSettings, `Corte de Caja #${cut.cut_number}`);

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localCreatedAt = utcToZonedTime(cut.created_at, timeZone);

  // Corregir problema de zona horaria - usar fechas locales sin conversión UTC
  console.log('📅 Fechas del corte:', { start_date: cut.start_date, end_date: cut.end_date });
  
  let displayStartDate, displayEndDate;
  try {
    // Extraer solo la parte de fecha (YYYY-MM-DD) y crear fecha local
    const startDateOnly = cut.start_date.split('T')[0]; // Ejemplo: "2025-07-31"
    const endDateOnly = cut.end_date.split('T')[0];     // Ejemplo: "2025-07-31"
    
    // Crear fechas locales sin conversión UTC para evitar problemas de zona horaria
    const [startYear, startMonth, startDay] = startDateOnly.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDateOnly.split('-').map(Number);
    
    const startDate = new Date(startYear, startMonth - 1, startDay); // Mes es 0-indexado
    const endDate = new Date(endYear, endMonth - 1, endDay);
    
    displayStartDate = format(startDate, 'dd/MM/yyyy');
    displayEndDate = format(endDate, 'dd/MM/yyyy');
    
    console.log('📅 Fechas formateadas exitosamente:', { displayStartDate, displayEndDate });
  } catch (dateError) {
    console.error('❌ Error al formatear fechas:', dateError);
    console.log('📅 Usando formato simple como fallback...');
    
    // Fallback ultra simple: formatear manualmente
    const startParts = cut.start_date.split('T')[0].split('-'); // ["2025", "07", "31"]
    const endParts = cut.end_date.split('T')[0].split('-');
    
    displayStartDate = `${startParts[2]}/${startParts[1]}/${startParts[0]}`; // "31/07/2025"
    displayEndDate = `${endParts[2]}/${endParts[1]}/${endParts[0]}`;
    
    console.log('📅 Fechas con fallback manual:', { displayStartDate, displayEndDate });
  }

  doc.setFontSize(12);
  doc.text(`Periodo: ${displayStartDate} - ${displayEndDate}`, 15, startY);
  doc.text(`Fecha de Emisión: ${format(localCreatedAt, 'dd/MM/yyyy HH:mm')}`, 15, startY + 6);
  startY += 20;

  doc.setFontSize(14);
  doc.text('Desglose por Concepto', 15, startY);
  startY += 8;
  // Calcular breakdown dinámicamente desde los pagos
  const breakdown = cutPayments.reduce((acc, p) => {
    acc[p.concept] = (acc[p.concept] || 0) + p.amount;
    return acc;
  }, {});
  
  const breakdownBody = Object.entries(breakdown).map(([concept, amount]) => [
    concept,
    `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
  ]);
  breakdownBody.push([{ content: 'Total:', styles: { fontStyle: 'bold' } }, { content: `$${cut.total_amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, styles: { fontStyle: 'bold' } }]);
  doc.autoTable({
    startY,
    head: [['Concepto', 'Monto']],
    body: breakdownBody,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
  });
  startY = doc.autoTable.previous.finalY + 15;

  doc.setFontSize(14);
  doc.text('Pagos Incluidos', 15, startY);
  startY += 8;
  const paymentsBody = cutPayments.map(p => [
    p.students ? `${p.students.first_name} ${p.students.last_name}` : 'Estudiante no encontrado',
    p.concept,
    `$${p.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
    format(parseISO(p.paid_date), 'dd/MM/yyyy')
  ]);
  doc.autoTable({
    startY,
    head: [['Estudiante', 'Concepto', 'Monto', 'Fecha de Pago']],
    body: paymentsBody,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
  });

  doc.save(`corte_caja_${cut.cut_number}.pdf`);
};


export const generateAttendanceListPdf = async (schedule, students, schoolSettings) => {
    const doc = new jsPDF();
    const scheduleTitle = `${schedule.courses.name} - ${daysOfWeek[schedule.day_of_week]} ${schedule.start_time.slice(0, 5)}-${schedule.end_time.slice(0, 5)}`;
    let startY = await drawHeader(doc, schoolSettings, 'Lista de Asistencia');
    
    // Course and schedule information
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(scheduleTitle, 15, startY);
    startY += 8;
    
    // Additional schedule details
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Aula/Salón: ${schedule.classroom || 'No especificado'}`, 15, startY);
    startY += 6;
    
    if (schedule.instructor) {
        doc.text(`Instructor: ${schedule.instructor}`, 15, startY);
        startY += 6;
    }
    
    if (schedule.start_date) {
        const startDate = new Date(schedule.start_date).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.text(`Fecha de inicio del curso: ${startDate}`, 15, startY);
        startY += 6;
    }
    
    doc.text(`Total de estudiantes: ${students.length}`, 15, startY);
    startY += 8;
    
    // Add print date
    const printDate = new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha de impresión: ${printDate}`, 15, startY);
    doc.setTextColor(0, 0, 0); // Reset to black
    startY += 15;
    
    const tableBody = students.map((student, index) => [
      index + 1,
      `${student.first_name} ${student.last_name}`,
      '' 
    ]);

    doc.autoTable({
        startY,
        head: [['#', 'Nombre del Estudiante', 'Asistencia']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        columnStyles: {
            2: { cellWidth: 40, halign: 'center' }
        },
        didDrawCell: (data) => {
            if (data.section === 'body' && data.column.index === 2) {
                doc.rect(data.cell.x + 15, data.cell.y + 2, 10, 10);
            }
        }
    });

    doc.save(`lista_asistencia_${schedule.courses.name.replace(/\s/g, '_')}.pdf`);
};

export const generateIncomeByConceptPdf = async (payments, dateRange, schoolSettings) => {
  const doc = new jsPDF();
  let startY = await drawHeader(doc, schoolSettings, 'Reporte de Ingresos por Concepto');
  
  doc.setFontSize(12);
  doc.text(`Periodo: ${format(parseISO(dateRange.from), 'dd/MM/yyyy')} - ${format(parseISO(dateRange.to), 'dd/MM/yyyy')}`, 15, startY);
  startY += 15;

  const incomeByConcept = payments.reduce((acc, p) => {
    acc[p.concept] = (acc[p.concept] || 0) + Number(p.amount);
    return acc;
  }, {});
  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  const tableBody = Object.entries(incomeByConcept).map(([concept, amount]) => [
    concept,
    `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
  ]);
  tableBody.push([{ content: 'Total General:', styles: { fontStyle: 'bold' } }, { content: `$${totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, styles: { fontStyle: 'bold' } }]);

  doc.autoTable({
    startY,
    head: [['Concepto', 'Monto Total']],
    body: tableBody,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
  });

  doc.save(`reporte_ingresos_concepto_${dateRange.from}_${dateRange.to}.pdf`);
};

export const generateEnrollmentsPdf = async (students, dateRange, schoolSettings) => {
  const doc = new jsPDF();
  let startY = await drawHeader(doc, schoolSettings, 'Reporte de Inscripciones');

  doc.setFontSize(12);
  doc.text(`Periodo: ${format(parseISO(dateRange.from), 'dd/MM/yyyy')} - ${format(parseISO(dateRange.to), 'dd/MM/yyyy')}`, 15, startY);
  startY += 15;

  const tableBody = students.map(student => [
    student.first_name && student.last_name ? `${student.first_name} ${student.last_name}` : 'N/A',
    student.courses?.name || student.course_name || 'N/A',
    format(parseISO(student.enrollment_date), 'dd/MM/yyyy'),
    student.email || 'N/A'
  ]);

  doc.autoTable({
    startY,
    head: [['Nombre', 'Curso', 'Fecha de Inscripción', 'Email']],
    body: tableBody,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
  });

  doc.save(`reporte_inscripciones_${dateRange.from}_${dateRange.to}.pdf`);
};

export const generateCashCutsPdf = async (cashCuts, dateRange, schoolSettings) => {
  const doc = new jsPDF();
  let startY = await drawHeader(doc, schoolSettings, 'Reporte de Cortes de Caja');

  doc.setFontSize(12);
  doc.text(`Periodo: ${format(parseISO(dateRange.from), 'dd/MM/yyyy')} - ${format(parseISO(dateRange.to), 'dd/MM/yyyy')}`, 15, startY);
  startY += 15;

  const totalAmount = cashCuts.reduce((sum, cut) => sum + Number(cut.total_amount), 0);

  const tableBody = cashCuts.map(cut => [
    `#${cut.cut_number}`,
    format(parseISO(cut.created_at), 'dd/MM/yyyy HH:mm'),
    `$${Number(cut.total_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
  ]);
  tableBody.push([{ content: 'Total General:', styles: { fontStyle: 'bold' } }, '', { content: `$${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, styles: { fontStyle: 'bold' } }]);

  doc.autoTable({
    startY,
    head: [['# Corte', 'Fecha de Emisión', 'Monto Total']],
    body: tableBody,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
  });

  doc.save(`reporte_cortes_caja_${dateRange.from}_${dateRange.to}.pdf`);
};