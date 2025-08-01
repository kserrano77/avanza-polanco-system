// FUNCIÓN MÍNIMA QUE DEBE FUNCIONAR (BASADA EN CIUDAD OBREGÓN QUE SÍ FUNCIONA)
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

    // Email simple y directo
    const emailData = {
      from: 'admin@avanzapolanco.edu.mx',
      to: student.email,
      subject: 'Comprobante de Pago - Avanza Polanco',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #667eea;">Avanza Polanco</h1>
          <h2>Comprobante de Pago</h2>
          <p>Estimado/a ${student.first_name} ${student.last_name},</p>
          <p>Hemos recibido su pago correctamente:</p>
          <ul>
            <li><strong>Concepto:</strong> ${payment.concept}</li>
            <li><strong>Monto Pagado:</strong> $${payment.amount}</li>
            <li><strong>Estado:</strong> PAGADO</li>
          </ul>
          <p>Gracias por su pago.</p>
          <p>Avanza Polanco</p>
        </div>
      `,
    };

    // Usar API key directa que funciona
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

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
