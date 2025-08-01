import { supabase } from '@/lib/customSupabaseClient';
import { format, parseISO, addDays, isBefore, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Servicio de notificaciones por email para el sistema de pagos
 * Maneja recordatorios, notificaciones de vencimiento y confirmaciones
 */
class EmailNotificationService {
  /**
   * Envía un email usando la Edge Function de Supabase
   */
  async sendEmail(student, payment, emailType = 'notification') {
    try {
      console.log(`📧 Enviando ${emailType} a ${student.email}...`);
      
      const { data, error } = await supabase.functions.invoke('send-payment-receipt', {
        body: { 
          student, 
          payment: {
            ...payment,
            remaining_debt: payment.debt_amount || 0
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
      
      console.log('✅ Email enviado exitosamente:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Error enviando email:', error);
      throw error;
    }
  }





  /**
   * Envía recordatorio de pago próximo a vencer (3 días antes)
   */
  async sendPaymentReminder(student, payment, schoolSettings) {
    if (!student.email) {
      throw new Error('El estudiante no tiene email registrado');
    }

    return await this.sendEmail(student, payment, 'recordatorio');
  }

  /**
   * Envía notificación de pago vencido
   */
  async sendOverduePaymentNotification(student, payment, schoolSettings) {
    if (!student.email) {
      throw new Error('El estudiante no tiene email registrado');
    }

    return await this.sendEmail(student, payment, 'vencido');
  }

  /**
   * Envía confirmación de nuevo pago registrado
   */
  async sendPaymentConfirmation(student, payment, schoolSettings) {
    if (!student.email) {
      throw new Error('El estudiante no tiene email registrado');
    }

    return await this.sendEmail(student, payment, 'confirmacion');
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
