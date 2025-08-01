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
    const { student, payment, emailType = 'receipt' } = await req.json()

    if (!student || !payment) {
      throw new Error('Missing student or payment data')
    }

    if (!student.email) {
      throw new Error('Student email is required')
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'admin@avanzapolanco.edu.mx';
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    // Email simple para evitar errores de template
    const subject = `Notificación de Pago - Avanza Polanco`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333;">Avanza Polanco</h1>
        <h2>Hola ${student.name || student.first_name}</h2>
        <p>Información de tu pago:</p>
        <ul>
          <li><strong>Concepto:</strong> ${payment.concept}</li>
          <li><strong>Monto:</strong> $${payment.amount}</li>
          <li><strong>Fecha:</strong> ${payment.payment_date || 'Por definir'}</li>
        </ul>
        <p>Gracias por tu atención.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Avanza Polanco - Sistema Automatizado</p>
      </div>
    `;

    const emailData = {
      from: fromEmail,
      to: student.email,
      subject: subject,
      html: htmlContent,
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
