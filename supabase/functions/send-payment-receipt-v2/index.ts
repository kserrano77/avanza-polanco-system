import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    const { student, payment, emailType, isReprint } = await req.json()
    
    console.log('🚀 Edge Function iniciada')
    console.log('📦 Request body completo:', JSON.stringify({ student, payment, emailType }, null, 2))
    console.log('🔍 Edge Function - Datos recibidos:', { student, payment, emailType })
    
    // Normalizar estudiante
    const normalizedStudent = {
      ...student,
      full_name: student.full_name || `${student.first_name} ${student.last_name}`
    }
    
    console.log('🔍 Edge Function - Estudiante normalizado:', normalizedStudent)

    // Configurar variables de entorno
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || 're_PJhdQEp6_GVyAKn5z1qJoDjUNdWz6QPGG'
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'admin@avanzasystempolanco.cloud'
    
    console.log('🔑 Variables de entorno:')
    console.log('- RESEND_API_KEY existe:', !!RESEND_API_KEY)
    console.log('- FROM_EMAIL:', FROM_EMAIL)
    console.log('📧 Edge Function - Enviando email a:', normalizedStudent.email)

    // Generar contenido del email según el tipo
    let subject, htmlContent
    
    if (emailType === 'receipt' || payment.status === 'paid') {
      subject = isReprint ? 
        `Reimpresión - Comprobante de Pago - ${normalizedStudent.full_name}` :
        `Comprobante de Pago - ${normalizedStudent.full_name}`
      htmlContent = generateReceiptEmail(normalizedStudent, payment, 'Instituto Polanco', isReprint)
    } else if (emailType === 'confirmation' || payment.status === 'pending') {
      subject = `Confirmación de Pago Registrado - ${normalizedStudent.full_name}`
      htmlContent = generateConfirmationEmail(normalizedStudent, payment, 'Instituto Polanco')
    } else {
      throw new Error(`Tipo de email no válido: ${emailType}`)
    }

    // Enviar email usando Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [normalizedStudent.email],
        subject: subject,
        html: htmlContent,
      }),
    })

    console.log('📡 Respuesta de Resend - Status:', emailResponse.status)
    console.log('📡 Respuesta de Resend - StatusText:', emailResponse.statusText)

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('❌ Error de Resend:', errorText)
      throw new Error(`Error al enviar email: ${emailResponse.status} - ${errorText}`)
    }

    const result = await emailResponse.json()
    console.log('📡 Respuesta de Resend - Body:', result)
    console.log('✅ Email sent successfully:', result)

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('❌ Error en Edge Function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.stack 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

// Template para recibo de pago (cuando está pagado)
function generateReceiptEmail(student, payment, schoolName, isReprint = false) {
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
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Número de Estudiante:</td><td style="padding: 8px 0; color: #666;">#${student.student_number}</td></tr>
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
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">No. de Recibo:</td><td style="padding: 8px 0; color: #666;">${payment.receipt_number}</td></tr>
          </table>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            <strong>📞 ¿Necesitas ayuda?</strong><br>
            Si tienes alguna pregunta sobre tu pago, no dudes en contactarnos.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">Comprobante generado automáticamente</p>
        </div>
      </div>
    </div>
  `;
}

// Template para confirmación de pago registrado (cuando está pendiente)
function generateConfirmationEmail(student, payment, schoolName) {
  const dueDate = payment.due_date ? new Date(payment.due_date + 'T12:00:00').toLocaleDateString('es-MX') : 'No especificada';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background: linear-gradient(135deg, #ff7b7b 0%, #667eea 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">${schoolName}</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Confirmación de Pago Registrado</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; margin-bottom: 20px;">
          <h2 style="color: #333; margin: 0 0 15px 0; font-size: 24px;">Pago Registrado ⏳</h2>
          <p style="color: #666; margin: 0; font-size: 16px;">Hemos registrado tu pago pendiente en nuestro sistema.</p>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 8px;">📋 Información del Estudiante</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Nombre:</td><td style="padding: 8px 0; color: #666;">${student.full_name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Número de Estudiante:</td><td style="padding: 8px 0; color: #666;">#${student.student_number}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Curso:</td><td style="padding: 8px 0; color: #666;">${student.courses?.name || 'No especificado'}</td></tr>
          </table>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 8px;">💰 Detalles del Pago</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Concepto:</td><td style="padding: 8px 0; color: #666;">${payment.concept}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Monto:</td><td style="padding: 8px 0; color: #666;">$${payment.amount}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Fecha de Vencimiento:</td><td style="padding: 8px 0; color: #666;">${dueDate}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Estado:</td><td style="padding: 8px 0; color: #ffc107; font-weight: bold;">PENDIENTE</td></tr>
          </table>
        </div>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
          <p style="margin: 0; color: #856404; font-size: 14px;">
            <strong>⏰ Recordatorio:</strong><br>
            Este pago está registrado como pendiente. Una vez que realices el pago, recibirás tu comprobante oficial.
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            <strong>📞 ¿Necesitas ayuda?</strong><br>
            Si tienes alguna pregunta sobre tu pago, no dudes en contactarnos.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">Confirmación generada automáticamente</p>
        </div>
      </div>
    </div>
  `;
}
