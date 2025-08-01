// FUNCIÓN sendPaymentReceipt CORREGIDA COMPLETA
// Reemplazar toda la función en PaymentsSection.jsx (líneas 53-145)

const sendPaymentReceipt = async (paymentData) => {
  // Debug: verificar datos de búsqueda
  console.log('🔍 Debug - paymentData completo:', paymentData);
  console.log('🔍 Debug - paymentData.student_id:', paymentData.student_id, 'tipo:', typeof paymentData.student_id);
  console.log('🔍 Debug - students array length:', students.length);
  console.log('🔍 Debug - students disponibles:', students.map(s => ({ id: s.id, tipo_id: typeof s.id, name: s.name, email: s.email })));
  
  // Buscar estudiante con conversión de tipos para evitar problemas
  console.log('🔍 Intentando búsquedas:');
  console.log('🔍 Búsqueda 1 (==):', students.find(s => s.id == paymentData.student_id));
  console.log('🔍 Búsqueda 2 (parseInt):', students.find(s => s.id === parseInt(paymentData.student_id)));
  console.log('🔍 Búsqueda 3 (ambos parseInt):', students.find(s => parseInt(s.id) === parseInt(paymentData.student_id)));
  
  const student = students.find(s => 
    s.id == paymentData.student_id || 
    s.id === parseInt(paymentData.student_id) || 
    parseInt(s.id) === parseInt(paymentData.student_id)
  );
  
  console.log('🔍 Debug - estudiante encontrado FINAL:', student);
  
  if (!student) {
    toast({ variant: "destructive", title: "No se pudo enviar el recibo", description: "Estudiante no encontrado en la lista." });
    return;
  }
  
  if (!student.email) {
    toast({ variant: "destructive", title: "No se pudo enviar el recibo", description: `El estudiante ${student.first_name} ${student.last_name} no tiene un email registrado.` });
    return;
  }
  
  toast({ title: "Enviando recibo...", description: `Preparando para enviar a ${student.email}.` });

  try {
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

    // Test Edge Function with correct deployment
    console.log('🧪 Testing Edge Function (should work now)...');
    
    const { data, error } = await supabase.functions.invoke('send-payment-receipt', {
      body: { 
        student, 
        payment: {
          ...paymentData,
          remaining_debt: paymentData.debt_amount || 0
        }
      },
    });
    
    if (error) {
      console.error('❌ Edge Function error:', error);
      throw new Error(`Error al enviar email: ${error.message}`);
    }
    
    if (data?.error) {
      console.error('❌ Email sending error:', data.error);
      throw new Error(`Email error: ${data.error}`);
    }
    
    console.log('✅ Edge Function response:', data);
    
    toast({ title: "Recibo enviado", description: `Se ha enviado un comprobante de pago a ${student.email}.` });
  } catch (error) {
    toast({ variant: "destructive", title: "Error al enviar el recibo", description: `Detalle: ${error.message}` });
  }
};

// INSTRUCCIONES PARA APLICAR:
// 1. Abre PaymentsSection.jsx
// 2. Busca la función sendPaymentReceipt (líneas 53-145)
// 3. Reemplaza TODA la función con este código
// 4. Guarda el archivo
// 5. Haz commit y push
// 6. Prueba enviando un email con adeudo

// CAMBIOS APLICADOS:
// ✅ ${student.name} → ${student.first_name} ${student.last_name}
// ✅ Agregada sección condicional de adeudo con icono 📋
// ✅ Monto adeudado en rojo y destacado
// ✅ Recordatorio visual con ⚠️
// ✅ Solo se muestra si paymentData.debt_amount > 0
