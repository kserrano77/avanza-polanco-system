import { supabase } from '@/lib/customSupabaseClient';
import { format, parseISO, addDays, isBefore, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Servicio de notificaciones por email para el sistema de pagos
 * Maneja recordatorios, notificaciones de vencimiento y confirmaciones
 */
class EmailNotificationService {
  constructor() {
    this.apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`;
    this.apiKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  }

  /**
   * Envía un email usando la Edge Function de Supabase
   */
  async sendEmail(emailData) {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(emailData),
      });

      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Error al enviar email');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error enviando email:', error);
      throw error;
    }
  }

  /**
   * Template para recordatorio de pago próximo a vencer
   */
  generatePaymentReminderTemplate(student, payment, schoolSettings) {
    const dueDate = format(parseISO(payment.payment_date), 'dd/MM/yyyy', { locale: es });
    const schoolName = schoolSettings?.school_name || 'Avanza Polanco';
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📅 Recordatorio de Pago</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">${schoolName}</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Hola ${student.first_name},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Te recordamos que tienes un pago próximo a vencer. Por favor, realiza tu pago antes de la fecha límite para evitar recargos.
          </p>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #856404; margin: 0 0 15px 0;">⚠️ Detalles del Pago</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Concepto:</td><td style="padding: 8px 0; color: #666;">${payment.concept}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Monto:</td><td style="padding: 8px 0; color: #666;">$${payment.amount.toLocaleString()}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Fecha Límite:</td><td style="padding: 8px 0; color: #e74c3c; font-weight: bold;">${dueDate}</td></tr>
            </table>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Si ya realizaste el pago, puedes hacer caso omiso a este mensaje. Si tienes alguna duda, no dudes en contactarnos.
          </p>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 14px;">
              ${schoolName}<br>
              ${schoolSettings?.school_phone || ''}<br>
              ${schoolSettings?.school_email || 'admin@avanzapolanco.edu.mx'}
            </p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Template para notificación de pago vencido
   */
  generateOverduePaymentTemplate(student, payment, schoolSettings) {
    const dueDate = format(parseISO(payment.payment_date), 'dd/MM/yyyy', { locale: es });
    const schoolName = schoolSettings?.school_name || 'Avanza Polanco';
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🚨 Pago Vencido</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">${schoolName}</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Estimado/a ${student.first_name},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Te informamos que tienes un pago vencido. Te pedimos que regularices tu situación lo antes posible.
          </p>
          
          <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #721c24; margin: 0 0 15px 0;">🚨 Pago Vencido</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Concepto:</td><td style="padding: 8px 0; color: #666;">${payment.concept}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Monto:</td><td style="padding: 8px 0; color: #666;">$${payment.amount.toLocaleString()}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Fecha de Vencimiento:</td><td style="padding: 8px 0; color: #e74c3c; font-weight: bold;">${dueDate}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Estado:</td><td style="padding: 8px 0; color: #e74c3c; font-weight: bold;">VENCIDO</td></tr>
            </table>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Por favor, ponte en contacto con nosotros para regularizar tu situación y evitar inconvenientes adicionales.
          </p>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #999; font-size: 14px;">
              ${schoolName}<br>
              ${schoolSettings?.school_phone || ''}<br>
              ${schoolSettings?.school_email || 'admin@avanzapolanco.edu.mx'}
            </p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Template para confirmación de nuevo pago registrado
   */
  generatePaymentConfirmationTemplate(student, payment, schoolSettings) {
    const paymentDate = payment.payment_date ? format(parseISO(payment.payment_date), 'dd/MM/yyyy', { locale: es }) : 'Por definir';
    const schoolName = schoolSettings?.school_name || 'Avanza Polanco';
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">✅ Pago Registrado</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">${schoolName}</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Hola ${student.first_name},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Te confirmamos que se ha registrado un nuevo pago en tu cuenta. A continuación encontrarás los detalles:
          </p>
          
          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #155724; margin: 0 0 15px 0;">📋 Detalles del Pago</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Concepto:</td><td style="padding: 8px 0; color: #666;">${payment.concept}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Monto:</td><td style="padding: 8px 0; color: #666;">$${payment.amount.toLocaleString()}</td></tr>
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
              ${schoolSettings?.school_phone || ''}<br>
              ${schoolSettings?.school_email || 'admin@avanzapolanco.edu.mx'}
            </p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Envía recordatorio de pago próximo a vencer (3 días antes)
   */
  async sendPaymentReminder(student, payment, schoolSettings) {
    if (!student.email) {
      throw new Error('El estudiante no tiene email registrado');
    }

    const emailData = {
      to: student.email,
      subject: `📅 Recordatorio: Pago próximo a vencer - ${schoolSettings?.school_name || 'Avanza Polanco'}`,
      html: this.generatePaymentReminderTemplate(student, payment, schoolSettings),
    };

    return await this.sendEmail(emailData);
  }

  /**
   * Envía notificación de pago vencido
   */
  async sendOverduePaymentNotification(student, payment, schoolSettings) {
    if (!student.email) {
      throw new Error('El estudiante no tiene email registrado');
    }

    const emailData = {
      to: student.email,
      subject: `🚨 Pago Vencido - ${schoolSettings?.school_name || 'Avanza Polanco'}`,
      html: this.generateOverduePaymentTemplate(student, payment, schoolSettings),
    };

    return await this.sendEmail(emailData);
  }

  /**
   * Envía confirmación de nuevo pago registrado
   */
  async sendPaymentConfirmation(student, payment, schoolSettings) {
    if (!student.email) {
      throw new Error('El estudiante no tiene email registrado');
    }

    const emailData = {
      to: student.email,
      subject: `✅ Nuevo Pago Registrado - ${schoolSettings?.school_name || 'Avanza Polanco'}`,
      html: this.generatePaymentConfirmationTemplate(student, payment, schoolSettings),
    };

    return await this.sendEmail(emailData);
  }

  /**
   * Busca pagos que necesitan recordatorio (3 días antes del vencimiento)
   */
  async findPaymentsNeedingReminder() {
    const threeDaysFromNow = addDays(new Date(), 3);
    const threeDaysFromNowString = format(threeDaysFromNow, 'yyyy-MM-dd');

    try {
      const { data: payments, error } = await supabase
        .from('payments')
        .select(`
          *,
          students (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('status', 'pending')
        .eq('payment_date', threeDaysFromNowString)
        .is('reminder_sent', null); // Solo pagos que no han recibido recordatorio

      if (error) throw error;
      return payments || [];
    } catch (error) {
      console.error('Error buscando pagos para recordatorio:', error);
      return [];
    }
  }

  /**
   * Busca pagos vencidos que necesitan notificación
   */
  async findOverduePayments() {
    const today = format(new Date(), 'yyyy-MM-dd');

    try {
      const { data: payments, error } = await supabase
        .from('payments')
        .select(`
          *,
          students (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('status', 'pending')
        .lt('payment_date', today)
        .is('overdue_notification_sent', null); // Solo pagos que no han recibido notificación de vencimiento

      if (error) throw error;
      return payments || [];
    } catch (error) {
      console.error('Error buscando pagos vencidos:', error);
      return [];
    }
  }

  /**
   * Marca un pago como que ya recibió recordatorio
   */
  async markReminderSent(paymentId) {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ reminder_sent: new Date().toISOString() })
        .eq('id', paymentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marcando recordatorio enviado:', error);
    }
  }

  /**
   * Marca un pago como que ya recibió notificación de vencimiento
   */
  async markOverdueNotificationSent(paymentId) {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ overdue_notification_sent: new Date().toISOString() })
        .eq('id', paymentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marcando notificación de vencimiento enviada:', error);
    }
  }
}

export const emailNotificationService = new EmailNotificationService();
export default emailNotificationService;
