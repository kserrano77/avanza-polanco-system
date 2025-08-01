// TEMPLATE DE EMAIL CORREGIDO PARA REEMPLAZAR EN sendPaymentReceipt
// Corrige: nombre del estudiante y muestra información de adeudo

const receiptHtml = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
      <h1 style="margin: 0; font-size: 28px;">${import.meta.env.VITE_SCHOOL_NAME || 'Sistema Escolar'}</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Comprobante de Pago</p>
    </div>
    <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #333; margin-top: 0;">Estimado/a ${student.first_name} ${student.last_name},</h2>
      <p style="color: #666; line-height: 1.6;">Hemos recibido su pago correctamente. A continuación los detalles:</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Concepto:</td><td style="padding: 8px 0; color: #666;">${paymentData.concept}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Monto Pagado:</td><td style="padding: 8px 0; color: #666;">$${paymentData.amount}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Fecha de Pago:</td><td style="padding: 8px 0; color: #666;">${paymentData.paid_date || new Date().toLocaleDateString('es-MX')}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Estado:</td><td style="padding: 8px 0; color: #28a745; font-weight: bold;">PAGADO</td></tr>
          ${paymentData.debt_amount && parseFloat(paymentData.debt_amount) > 0 ? `
          <tr style="border-top: 2px solid #ddd;"><td colspan="2" style="padding: 15px 0 8px 0; font-weight: bold; color: #e74c3c; font-size: 16px;">📋 INFORMACIÓN DE ADEUDO:</td></tr>
          <tr><td style="padding: 4px 0; font-weight: bold; color: #333;">Concepto del Adeudo:</td><td style="padding: 4px 0; color: #666;">${paymentData.debt_description || 'Adeudo pendiente'}</td></tr>
          <tr><td style="padding: 4px 0; font-weight: bold; color: #333;">Monto Adeudado:</td><td style="padding: 4px 0; color: #e74c3c; font-weight: bold; font-size: 18px;">$${paymentData.debt_amount}</td></tr>
          <tr><td colspan="2" style="padding: 8px 0; color: #e74c3c; font-style: italic; font-size: 14px;">⚠️ Recuerda realizar el pago de tu adeudo pendiente.</td></tr>
          ` : ''}
        </table>
      </div>
      
      <p style="color: #666; line-height: 1.6;">Gracias por su pago puntual. Si tiene alguna pregunta, no dude en contactarnos.</p>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 14px; margin: 0;">${import.meta.env.VITE_SCHOOL_NAME || 'Sistema Escolar'}</p>
        <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">Comprobante generado automáticamente</p>
      </div>
    </div>
  </div>
`;

// INSTRUCCIONES PARA APLICAR:
// 1. En PaymentsSection.jsx, buscar la función sendPaymentReceipt
// 2. Reemplazar toda la variable receiptHtml con este contenido
// 3. Los cambios principales son:
//    - ${student.name} → ${student.first_name} ${student.last_name}
//    - Agregada sección condicional de adeudo con paymentData.debt_amount y paymentData.debt_description
//    - Mejor formato visual para la información de adeudo
