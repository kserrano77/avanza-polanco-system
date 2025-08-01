// FUNCIÓN EDGE COMPLETA CORREGIDA PARA COPIAR AL DASHBOARD DE SUPABASE
// Copiar TODO este código en el Dashboard de Supabase > Edge Functions > send-payment-receipt

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
    const { student, payment, emailType = 'receipt' } = await req.json()

    if (!student || !payment) {
      throw new Error('Missing student or payment data')
    }

    if (!student.email) {
      throw new Error('Student email is required')
    }

    // Configurar diferentes tipos de email
    let subject = '';
    let emailContent = '';
    
    const schoolName = 'Avanza Polanco';
    const paymentDate = payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('es-MX') : 'Por definir';
    
    switch (emailType) {
      case 'confirmacion':
        subject = `✅ Nuevo Pago Registrado - ${schoolName}`;
        emailContent = generateConfirmationEmail(student, payment, schoolName, paymentDate);
        break;
      case 'recordatorio':
        subject = `📅 Recordatorio: Pago próximo a vencer - ${schoolName}`;
        emailContent = generateReminderEmail(student, payment, schoolName, paymentDate);
        break;
      case 'vencido':
        subject = `🚨 Pago Vencido - ${schoolName}`;
        emailContent = generateOverdueEmail(student, payment, schoolName, paymentDate);
        break;
      default:
        subject = `Comprobante de Pago - ${schoolName}`;
        emailContent = generateReceiptEmail(student, payment, schoolName);
    }

    // Enviar email usando Resend API
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'admin@avanzapolanco.edu.mx';
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const emailData = {
      from: fromEmail,
      to: student.email,
      subject: subject,
      html: emailContent,
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const result = await response.json();

    if (!response.ok) {
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
    console.error('❌ Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

// Template para confirmación de nuevo pago
function generateConfirmationEmail(student, payment, schoolName, paymentDate) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">${schoolName}</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">✅ Nuevo Pago Registrado</p>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-top: 0;">Estimado/a ${student.first_name} ${student.last_name},</h2>
        <p style="color: #666; line-height: 1.6;">Hemos registrado un nuevo pago en su cuenta. Los detalles son:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Concepto:</td><td style="padding: 8px 0; color: #666;">${payment.concept}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Monto:</td><td style="padding: 8px 0; color: #666;">$${payment.amount}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Fecha:</td><td style="padding: 8px 0; color: #666;">${paymentDate}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Estado:</td><td style="padding: 8px 0; color: #28a745; font-weight: bold;">CONFIRMADO</td></tr>
          </table>
        </div>
        
        <p style="color: #666; line-height: 1.6;">Gracias por su pago. Si tiene alguna pregunta, no dude en contactarnos.</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 14px; margin: 0;">${schoolName}</p>
          <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">Notificación automática</p>
        </div>
      </div>
    </div>
  `;
}

// Template para recordatorio de pago
function generateReminderEmail(student, payment, schoolName, paymentDate) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">${schoolName}</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">📅 Recordatorio de Pago</p>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-top: 0;">Estimado/a ${student.first_name} ${student.last_name},</h2>
        <p style="color: #666; line-height: 1.6;">Le recordamos que tiene un pago próximo a vencer:</p>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Concepto:</td><td style="padding: 8px 0; color: #666;">${payment.concept}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Monto:</td><td style="padding: 8px 0; color: #666;">$${payment.amount}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Fecha límite:</td><td style="padding: 8px 0; color: #e67e22; font-weight: bold;">${paymentDate}</td></tr>
          </table>
        </div>
        
        <p style="color: #666; line-height: 1.6;">Por favor, realice su pago antes de la fecha límite para evitar recargos.</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 14px; margin: 0;">${schoolName}</p>
          <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">Recordatorio automático</p>
        </div>
      </div>
    </div>
  `;
}

// Template para pago vencido
function generateOverdueEmail(student, payment, schoolName, paymentDate) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">${schoolName}</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">🚨 Pago Vencido</p>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-top: 0;">Estimado/a ${student.first_name} ${student.last_name},</h2>
        <p style="color: #666; line-height: 1.6;">Su pago ha vencido. Por favor, regularice su situación a la brevedad:</p>
        
        <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Concepto:</td><td style="padding: 8px 0; color: #666;">${payment.concept}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Monto:</td><td style="padding: 8px 0; color: #666;">$${payment.amount}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Fecha de vencimiento:</td><td style="padding: 8px 0; color: #dc3545; font-weight: bold;">${paymentDate}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Estado:</td><td style="padding: 8px 0; color: #dc3545; font-weight: bold;">VENCIDO</td></tr>
          </table>
        </div>
        
        <p style="color: #666; line-height: 1.6;">Contacte a la administración para regularizar su pago y evitar inconvenientes.</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 14px; margin: 0;">${schoolName}</p>
          <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">Notificación automática</p>
        </div>
      </div>
    </div>
  `;
}

// ✅ TEMPLATE CORREGIDO PARA RECIBO DE PAGO (ESTA ES LA FUNCIÓN PRINCIPAL QUE SE CORRIGIÓ)
function generateReceiptEmail(student, payment, schoolName) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">${schoolName}</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Comprobante de Pago</p>
      </div>
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-top: 0;">Estimado/a ${student.first_name} ${student.last_name},</h2>
        <p style="color: #666; line-height: 1.6;">Hemos recibido su pago correctamente. A continuación los detalles:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Concepto:</td><td style="padding: 8px 0; color: #666;">${payment.concept}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Monto Pagado:</td><td style="padding: 8px 0; color: #666;">$${payment.amount}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Fecha de Pago:</td><td style="padding: 8px 0; color: #666;">${payment.paid_date || new Date().toLocaleDateString('es-MX')}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Estado:</td><td style="padding: 8px 0; color: #28a745; font-weight: bold;">PAGADO</td></tr>
            ${payment.debt_amount && parseFloat(payment.debt_amount) > 0 ? `
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
