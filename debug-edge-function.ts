// VERSION DEBUG DE LA EDGE FUNCTION
// Para identificar el problema específico

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🔍 Edge Function iniciada');
  
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request');
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📥 Procesando request...');
    
    // Verificar variables de entorno
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('FROM_EMAIL');
    
    console.log('🔑 RESEND_API_KEY exists:', !!resendApiKey);
    console.log('📧 FROM_EMAIL:', fromEmail);
    
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY not found');
      throw new Error('RESEND_API_KEY not configured');
    }
    
    // Parsear el body
    const body = await req.json();
    console.log('📊 Request body received:', JSON.stringify(body, null, 2));
    
    const { student, payment, emailType = 'receipt' } = body;
    
    if (!student) {
      console.error('❌ Student data missing');
      throw new Error('Missing student data');
    }
    
    if (!payment) {
      console.error('❌ Payment data missing');
      throw new Error('Missing payment data');
    }
    
    if (!student.email) {
      console.error('❌ Student email missing');
      throw new Error('Student email is required');
    }
    
    console.log('✅ Data validation passed');
    console.log('👤 Student:', student.name, '📧', student.email);
    console.log('💰 Payment:', payment.concept, '$', payment.amount);
    
    // Preparar email simple para test
    const emailData = {
      from: fromEmail,
      to: student.email,
      subject: `Test Email - Avanza Polanco`,
      html: `
        <h1>Test Email</h1>
        <p>Hola ${student.name || student.first_name},</p>
        <p>Este es un email de prueba del sistema.</p>
        <p>Concepto: ${payment.concept}</p>
        <p>Monto: $${payment.amount}</p>
      `,
    };
    
    console.log('📧 Sending email to Resend API...');
    console.log('📧 Email data:', JSON.stringify(emailData, null, 2));
    
    // Llamar a Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });
    
    console.log('📡 Resend API response status:', response.status);
    
    const result = await response.json();
    console.log('📡 Resend API response:', JSON.stringify(result, null, 2));
    
    if (!response.ok) {
      console.error('❌ Resend API error:', result);
      throw new Error(`Resend API error: ${result.message || 'Unknown error'}`);
    }
    
    console.log('✅ Email sent successfully!');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result,
        debug: {
          hasApiKey: !!resendApiKey,
          fromEmail: fromEmail,
          toEmail: student.email,
          emailType: emailType
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Error in Edge Function:', error);
    console.error('❌ Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }),
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
