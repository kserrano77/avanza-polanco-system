import html2pdf from 'html2pdf.js';

// Función para generar el HTML del comprobante (igual al email pero optimizado para PDF)
function generateReceiptHTML(student, payment, schoolName = 'Polanco', isReprint = true) {
  // Usar paid_date del pago o fecha actual si no existe
  const paymentDate = payment.paid_date || new Date().toISOString().split('T')[0];
  const formattedPaymentDate = new Date(paymentDate + 'T12:00:00').toLocaleDateString('es-MX');
  const reprintMessage = isReprint ? `<p style="color: #e74c3c; font-weight: bold; background: #fdf2f2; padding: 10px; border-radius: 5px; margin: 15px 0;">📄 Esta es una reimpresión de tu comprobante de pago del día ${formattedPaymentDate}</p>` : '';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">${schoolName}</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">${isReprint ? 'Reimpresión - ' : ''}Comprobante de Pago</p>
      </div>
      
      ${reprintMessage}
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; margin-bottom: 20px;">
          <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px;">¡Pago Confirmado! ✅</h2>
          <p style="color: #666; margin: 0; font-size: 16px;">Tu pago ha sido procesado exitosamente.</p>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 8px;">📋 Información del Estudiante</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Nombre:</td><td style="padding: 8px 0; color: #666;">${student.full_name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Número de Estudiante:</td><td style="padding: 8px 0; color: #666;">#${student.student_number || 'N/A'}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Curso:</td><td style="padding: 8px 0; color: #666;">${student.courses?.name || 'No especificado'}</td></tr>
          </table>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 8px;">💰 Detalles del Pago</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Concepto:</td><td style="padding: 8px 0; color: #666;">${payment.concept}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Monto Pagado:</td><td style="padding: 8px 0; color: #666;">$${payment.amount}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Fecha de Pago:</td><td style="padding: 8px 0; color: #666;">${formattedPaymentDate}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Estado:</td><td style="padding: 8px 0; color: #28a745; font-weight: bold;">PAGADO</td></tr>
            ${(payment.debt_amount && Number(payment.debt_amount) > 0) ? `
            <tr style="border-top: 2px solid #ddd;"><td colspan="2" style="padding: 15px 0 8px 0; font-weight: bold; color: #e74c3c; font-size: 16px;">📋 INFORMACIÓN DE ADEUDO:</td></tr>
            <tr><td style="padding: 4px 0; font-weight: bold; color: #333;">Concepto del Adeudo:</td><td style="padding: 4px 0; color: #666;">${payment.debt_description || 'Adeudo pendiente'}</td></tr>
            <tr><td style="padding: 4px 0; font-weight: bold; color: #333;">Monto Adeudado:</td><td style="padding: 4px 0; color: #e74c3c; font-weight: bold; font-size: 18px;">$${payment.debt_amount}</td></tr>
            <tr><td colspan="2" style="padding: 8px 0; color: #e74c3c; font-style: italic; font-size: 14px;">⚠️ Recuerda realizar el pago de tu adeudo pendiente.</td></tr>
            ` : ''}
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">No. de Recibo:</td><td style="padding: 8px 0; color: #666;">${payment.receipt_number || 'N/A'}</td></tr>
          </table>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            <strong>📞 ¿Necesitas ayuda?</strong><br>
            Si tienes alguna pregunta sobre tu pago, no dudes en contactarnos.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">Comprobante generado automáticamente - ${new Date().toLocaleDateString('es-MX')}</p>
        </div>
      </div>
    </div>
  `;
}

// Función para descargar el comprobante como PDF
export async function downloadPaymentReceiptPDF(student, payment) {
  try {
    console.log('🔄 Generando PDF del comprobante...');
    
    // Generar el HTML del comprobante
    const htmlContent = generateReceiptHTML(student, payment, 'Avanza Virtual', true);
    
    // Configuración para html2pdf
    const options = {
      margin: 0.5,
      filename: `comprobante-pago-${student.full_name}-${payment.receipt_number || Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'portrait' 
      }
    };
    
    // Crear elemento temporal para el HTML
    const element = document.createElement('div');
    element.innerHTML = htmlContent;
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '-9999px';
    document.body.appendChild(element);
    
    // Generar y descargar el PDF
    await html2pdf().set(options).from(element).save();
    
    // Limpiar elemento temporal
    document.body.removeChild(element);
    
    console.log('✅ PDF descargado exitosamente');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error al generar PDF:', error);
    return { success: false, error: error.message };
  }
}

// Función alternativa usando jsPDF (por si html2pdf no funciona bien)
export async function downloadPaymentReceiptPDFAlternative(student, payment) {
  try {
    const { jsPDF } = await import('jspdf');
    
    const pdf = new jsPDF();
  
    // Header limpio sin fondo de color
  
    // Header profesional con texto estilizado
    pdf.setTextColor(0, 0, 0); // Texto negro para fondo blanco
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    
    try {
      // Cargar logo como lo hacen en pdfGenerator.js
      const response = await fetch('/avanza-polanco-logo.png.png');
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
      const imgWidth = 60;
      const imgHeight = (img.height * imgWidth) / img.width;
      pdf.addImage(imgData, 'PNG', 75, 8, imgWidth, imgHeight);
    } catch (error) {
      // Fallback si no se puede cargar la imagen
      pdf.setTextColor(0, 0, 0); // Texto negro
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('POLANCO', 105, 20, { align: 'center' });
    }   // Subtítulo
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Reimpresión - Comprobante de Pago', 105, 28, { align: 'center' });
  
    // Reset color para el contenido
    pdf.setTextColor(0, 0, 0);
    let yPosition = 50;
  
    // Información del estudiante
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Información del Estudiante', 20, yPosition);
    yPosition += 10;
  
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`Nombre: ${student.full_name}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Número de Estudiante: #${student.student_number}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Curso: ${student.course_name}`, 20, yPosition);
    yPosition += 15;
  
    // Detalles del pago
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detalles del Pago', 20, yPosition);
    yPosition += 10;
  
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`Concepto: ${payment.concept}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Monto Pagado: $${payment.amount}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Fecha de Pago: ${new Date(payment.payment_date).toLocaleDateString('es-MX')}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Estado: PAGADO`, 20, yPosition);
    yPosition += 15;
    
    // Información de adeudo si existe
    if (payment.debt_amount && Number(payment.debt_amount) > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(231, 76, 60);
      pdf.text('INFORMACIÓN DE ADEUDO', 20, yPosition);
      yPosition += 10;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Concepto del Adeudo: ${payment.debt_description || 'Adeudo pendiente'}`, 20, yPosition);
      yPosition += 8;
      pdf.setTextColor(231, 76, 60);
      pdf.text(`Monto Adeudado: $${payment.debt_amount}`, 20, yPosition);
      yPosition += 8;
      pdf.text('Recuerda realizar el pago de tu adeudo pendiente.', 20, yPosition);
      yPosition += 15;
    }
    
    // Mensaje de reimpresión
    pdf.setTextColor(0, 100, 0);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Esta es una reimpresión de tu comprobante de pago', 105, yPosition + 10, { align: 'center' });
    
    // Footer
    pdf.setTextColor(150, 150, 150);
    pdf.setFontSize(8);
    pdf.text(`Comprobante generado automáticamente - ${new Date().toLocaleDateString('es-MX')}`, 
             105, 280, { align: 'center' });
    
    // Descargar
    const filename = `comprobante-pago-${student.full_name.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
    pdf.save(filename);
    
    console.log('✅ PDF descargado exitosamente (alternativo)');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error al generar PDF alternativo:', error);
    return { success: false, error: error.message };
  }
}