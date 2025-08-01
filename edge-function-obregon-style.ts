// EDGE FUNCTION BASADA EN LA CONFIGURACIÓN QUE SÍ FUNCIONA EN CIUDAD OBREGÓN
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

    if (!student || !payment) {
      throw new Error('Missing student or payment data')
    }

    if (!student.email) {
      throw new Error('Student email is required')
    }

    // Usar configuración simple como Ciudad Obregón
    const emailData = {
      from: 'admin@avanzapolanco.edu.mx',
      to: student.email,
      subject: 'Comprobante de Pago - Avanza Polanco',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #667eea; padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Avanza Polanco</h1>
            <p style="margin: 10px 0 0 0;">Comprobante de Pago</p>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #ddd;">
            <h2 style="color: #333; margin-top: 0;">Estimado/a ${student.first_name} ${student.last_name},</h2>
            <p style="color: #666;">Hemos recibido su pago correctamente. A continuación los detalles:</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Concepto:</strong> ${payment.concept}</p>
              <p><strong>Monto Pagado:</strong> $${payment.amount}</p>
              <p><strong>Fecha:</strong> ${payment.paid_date || new Date().toLocaleDateString('es-MX')}</p>
              <p><strong>Estado:</strong> <span style="color: #28a745; font-weight: bold;">PAGADO</span></p>
            </div>
            
            <p style="color: #666;">Gracias por su pago puntual.</p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 14px;">Avanza Polanco - Comprobante automático</p>
            </div>
          </div>
        </div>
      `,
    };

    // Usar la misma API key que funciona en Ciudad Obregón
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

    console.log('Email sent successfully:', result);

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
    console.error('Error sending email:', error);
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
