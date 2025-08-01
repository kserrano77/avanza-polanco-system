// FUNCIÓN CON DOMINIO VERIFICADO QUE DEBE FUNCIONAR
// Copiar este código en el Dashboard de Supabase > Edge Functions > send-payment-receipt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { student, payment } = await req.json()

    // 🔍 DEBUG: Log para ver exactamente qué datos recibimos
    console.log('🔍 DEBUG - Datos recibidos:');
    console.log('📧 Student:', JSON.stringify(student, null, 2));
    console.log('💰 Payment:', JSON.stringify(payment, null, 2));
    console.log('💳 payment.debt_amount:', payment.debt_amount);
    console.log('💳 payment.remaining_debt:', payment.remaining_debt);
    console.log('💳 typeof debt_amount:', typeof payment.debt_amount);
    console.log('💳 parseFloat(debt_amount):', parseFloat(payment.debt_amount));

    if (!student || !payment) {
      throw new Error('Missing student or payment data')
    }

    if (!student.email) {
      throw new Error('Student email is required')
    }

    // Check if payment has debt amount to display (lógica de Ciudad Obregón)
    // 🔍 Probamos múltiples campos posibles para el adeudo
    const debtAmount = payment.debt_amount || payment.remaining_debt || 0;
    const hasDebt = debtAmount && parseFloat(debtAmount) > 0;
    
    console.log('🔍 DEBUG - Debt calculation:');
    console.log('💰 debtAmount:', debtAmount);
    console.log('💰 hasDebt:', hasDebt);

    // Usar un dominio verificado que funcione
    const emailData = {
      from: 'admin@avanzasystemcdobregon.cloud', // DOMINIO VERIFICADO QUE FUNCIONA
      to: student.email,
      subject: 'Comprobante de Pago - Avanza Polanco',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Avanza Polanco</h1>
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
              </table>
            </div>
            
            ${hasDebt ? `
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0; margin-bottom: 15px; font-size: 18px;">💰 Información de Adeudo</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 12px 0; font-weight: bold; color: #856404; font-size: 16px;">Adeudo:</td><td style="padding: 12px 0; color: #856404; font-weight: bold; font-size: 16px;">$${debtAmount}</td></tr>
              </table>
            </div>
            ` : ''}
            
            <p style="color: #666; line-height: 1.6;">Gracias por su pago puntual. Si tiene alguna pregunta, no dude en contactarnos.</p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 14px; margin: 0;">Avanza Polanco</p>
              <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">Comprobante generado automáticamente</p>
            </div>
          </div>
        </div>
      `,
    };

    // Usar API key que funciona
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer re_B1ernxxn_NPZP64qW8D28sBguouQeHLgq',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', result);
      throw new Error(`Resend API error: ${result.message || 'Unknown error'}`);
    }

    console.log('✅ Email sent successfully:', result);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
