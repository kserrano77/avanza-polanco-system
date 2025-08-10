import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Edge Function iniciada');
    
    const requestBody = await req.json();
    console.log('📦 Request body completo:', JSON.stringify(requestBody, null, 2));
    
    const { student, payment, emailType = 'receipt', isReprint = false } = requestBody;

    console.log('🔍 Edge Function - Datos recibidos:', { student, payment, emailType });

    if (!student || !payment) {
      throw new Error('Missing student or payment data')
    }

    if (!student.email) {
      throw new Error('Student email is required')
    }

    // Validar y normalizar datos del estudiante
    const normalizedStudent = {
      ...student,
      first_name: student.first_name || student.name?.split(' ')[0] || 'Estudiante',
      last_name: student.last_name || student.name?.split(' ').slice(1).join(' ') || '',
      full_name: student.name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Estudiante'
    };

    console.log('🔍 Edge Function - Estudiante normalizado:', normalizedStudent);

    // Configurar diferentes tipos de email
    let subject = '';
    let emailContent = '';
    
    const schoolName = 'Avanza Polanco';
    const paymentDate = payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('es-MX') : 'Por definir';
    
    switch (emailType) {
      case 'confirmacion':
        subject = `✅ Nuevo Pago Registrado - ${schoolName}`;
        emailContent = generateConfirmationEmail(normalizedStudent, payment, schoolName, paymentDate);
        break;
      case 'recordatorio':
        subject = `📅 Recordatorio: Pago próximo a vencer - ${schoolName}`;
        emailContent = generateReminderEmail(normalizedStudent, payment, schoolName, paymentDate);
        break;
      case 'vencido':
        subject = `🚨 Pago Vencido - ${schoolName}`;
        emailContent = generateOverdueEmail(normalizedStudent, payment, schoolName, paymentDate);
        break;
      default:
        subject = isReprint ? `Reimpresión - Comprobante de Pago - ${schoolName}` : `Comprobante de Pago - ${schoolName}`;
        emailContent = generateReceiptEmail(normalizedStudent, payment, schoolName, isReprint);
    }

    // Enviar email usando Resend API
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'admin@avanzasystempolanco.cloud';
    
    console.log('🔑 Variables de entorno:');
    console.log('- RESEND_API_KEY existe:', !!resendApiKey);
    console.log('- FROM_EMAIL:', fromEmail);
    
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY no configurada');
      throw new Error('RESEND_API_KEY not configured');
    }

    const emailData = {
      from: fromEmail,
      to: normalizedStudent.email,
      subject: subject,
      html: emailContent,
    };

    console.log('📧 Edge Function - Enviando email a:', normalizedStudent.email);

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    console.log('📡 Respuesta de Resend - Status:', response.status);
    console.log('📡 Respuesta de Resend - StatusText:', response.statusText);
    
    const result = await response.json();
    console.log('📡 Respuesta de Resend - Body:', result);

    if (!response.ok) {
      console.error('❌ Error de Resend API:', result);
      throw new Error(`Resend API error: ${result.message || 'Unknown error'}`);
    }

    console.log('✅ Email sent successfully:', result);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Error completo en Edge Function:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    const errorResponse = {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
    
    console.log('📤 Enviando respuesta de error:', errorResponse);
    
    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
});

// Template para confirmación de nuevo pago
function generateConfirmationEmail(student, payment, schoolName, paymentDate) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">✅ Pago Registrado</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">${schoolName}</p>
      </div>
      
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-top: 0;">Hola ${student.first_name || student.name},</h2>
        
        <p style="color: #666; line-height: 1.6;">
          Te confirmamos que se ha registrado un nuevo pago en tu cuenta. A continuación encontrarás los detalles:
        </p>
        
        <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #155724; margin: 0 0 15px 0;">📋 Detalles del Pago</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Concepto:</td><td style="padding: 8px 0; color: #666;">${payment.concept}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Monto:</td><td style="padding: 8px 0; color: #666;">$${payment.amount}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Fecha de Vencimiento:</td><td style="padding: 8px 0; color: #666;">${paymentDate}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Estado:</td><td style="padding: 8px 0; color: #f39c12; font-weight: bold;">PENDIENTE</td></tr>
          </table>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
          Recuerda realizar tu pago antes de la fecha límite. Si tienes alguna pregunta, no dudes en contactarnos.
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #999; font-size: 14px;">
            ${schoolName}<br>
            admin@avanzapolanco.edu.mx
          </p>
        </div>
      </div>
    </div>
  `;
}

// Template para recordatorio de pago
function generateReminderEmail(student, payment, schoolName, paymentDate) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">📅 Recordatorio de Pago</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">${schoolName}</p>
      </div>
      
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-top: 0;">Hola ${student.first_name || student.name},</h2>
        
        <p style="color: #666; line-height: 1.6;">
          Te recordamos que tienes un pago próximo a vencer. Por favor, realiza tu pago antes de la fecha límite para evitar recargos.
        </p>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #856404; margin: 0 0 15px 0;">⚠️ Detalles del Pago</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Concepto:</td><td style="padding: 8px 0; color: #666;">${payment.concept}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Monto:</td><td style="padding: 8px 0; color: #666;">$${payment.amount}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Fecha Límite:</td><td style="padding: 8px 0; color: #e74c3c; font-weight: bold;">${paymentDate}</td></tr>
          </table>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
          Si ya realizaste el pago, puedes hacer caso omiso a este mensaje. Si tienes alguna duda, no dudes en contactarnos.
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #999; font-size: 14px;">
            ${schoolName}<br>
            admin@avanzapolanco.edu.mx
          </p>
        </div>
      </div>
    </div>
  `;
}

// Template para pago vencido
function generateOverdueEmail(student, payment, schoolName, paymentDate) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🚨 Pago Vencido</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">${schoolName}</p>
      </div>
      
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-top: 0;">Estimado/a ${student.first_name || student.name},</h2>
        
        <p style="color: #666; line-height: 1.6;">
          Te informamos que tienes un pago vencido. Te pedimos que regularices tu situación lo antes posible.
        </p>
        
        <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #721c24; margin: 0 0 15px 0;">🚨 Pago Vencido</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Concepto:</td><td style="padding: 8px 0; color: #666;">${payment.concept}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Monto:</td><td style="padding: 8px 0; color: #666;">$${payment.amount}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Fecha de Vencimiento:</td><td style="padding: 8px 0; color: #e74c3c; font-weight: bold;">${paymentDate}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Estado:</td><td style="padding: 8px 0; color: #e74c3c; font-weight: bold;">VENCIDO</td></tr>
          </table>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
          Por favor, ponte en contacto con nosotros para regularizar tu situación y evitar inconvenientes adicionales.
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #999; font-size: 14px;">
            ${schoolName}<br>
            admin@avanzapolanco.edu.mx
          </p>
        </div>
      </div>
    </div>
  `;
}

// Template para recibo de pago (cuando está pagado)
function generateReceiptEmail(student, payment, schoolName, isReprint = false) {
  const currentDate = new Date().toLocaleDateString('es-MX');
  const reprintMessage = isReprint ? `<p style="color: #e74c3c; font-weight: bold; background: #fdf2f2; padding: 10px; border-radius: 5px; margin: 15px 0;">📄 Esta es una reimpresión de tu comprobante de pago del día ${payment.paid_date || currentDate}</p>` : '';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">${schoolName}</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">${isReprint ? 'Reimpresión - ' : ''}Comprobante de Pago</p>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-top: 0;">Estimado/a ${student.first_name} ${student.last_name},</h2>
        ${reprintMessage}
        <p style="color: #666; line-height: 1.6;">${isReprint ? 'Le enviamos nuevamente' : 'Hemos recibido'} su comprobante de pago. A continuación los detalles:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Concepto:</td><td style="padding: 8px 0; color: #666;">${payment.concept}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Monto Pagado:</td><td style="padding: 8px 0; color: #666;">$${payment.amount}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Fecha de Pago:</td><td style="padding: 8px 0; color: #666;">${payment.paid_date || currentDate}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Estado:</td><td style="padding: 8px 0; color: #28a745; font-weight: bold;">PAGADO</td></tr>
            ${(payment.debt_amount && Number(payment.debt_amount) > 0) ? `
            <tr style="border-top: 2px solid #ddd;"><td colspan="2" style="padding: 15px 0 8px 0; font-weight: bold; color: #e74c3c; font-size: 16px;">📋 INFORMACIÓN DE ADEUDO:</td></tr>
            <tr><td style="padding: 4px 0; font-weight: bold; color: #333;">Concepto del Adeudo:</td><td style="padding: 4px 0; color: #666;">${payment.debt_description || 'Adeudo pendiente'}</td></tr>
            <tr><td style="padding: 4px 0; font-weight: bold; color: #333;">Monto Adeudado:</td><td style="padding: 4px 0; color: #e74c3c; font-weight: bold; font-size: 18px;">$${payment.debt_amount}</td></tr>
            <tr><td colspan="2" style="padding: 8px 0; color: #e74c3c; font-style: italic; font-size: 14px;">⚠️ Recuerda realizar el pago de tu adeudo pendiente.</td></tr>
            ` : ''}
          </table>
        </div>
        
        <p style="color: #666; line-height: 1.6;">Gracias por su pago puntual. Si tiene alguna pregunta, no dude en contactarnos.</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 14px; margin: 0;">${schoolName}</p>
          <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">Comprobante generado automáticamente</p>
        </div>
      </div>
    </div>
  `;
}
