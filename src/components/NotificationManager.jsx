import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import emailNotificationService from '@/services/emailNotificationService';
import { supabase } from '@/lib/customSupabaseClient';

/**
 * Componente para gestionar notificaciones automáticas de email
 * Se ejecuta en segundo plano y verifica pagos que necesitan notificaciones
 */
const NotificationManager = ({ schoolSettings }) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Procesa recordatorios de pagos próximos a vencer (3 días antes)
   */
  const processPaymentReminders = async () => {
    try {
      console.log('🔔 Verificando pagos que necesitan recordatorio...');
      const paymentsNeedingReminder = await emailNotificationService.findPaymentsNeedingReminder();
      
      if (paymentsNeedingReminder.length === 0) {
        console.log('✅ No hay pagos que necesiten recordatorio');
        return;
      }

      console.log(`📧 Enviando ${paymentsNeedingReminder.length} recordatorios de pago...`);
      
      for (const payment of paymentsNeedingReminder) {
        try {
          await emailNotificationService.sendPaymentReminder(
            payment.students,
            payment,
            schoolSettings
          );
          
          // Marcar como enviado
          await emailNotificationService.markReminderSent(payment.id);
          
          console.log(`✅ Recordatorio enviado a ${payment.students.email}`);
        } catch (error) {
          console.error(`❌ Error enviando recordatorio a ${payment.students.email}:`, error);
        }
      }

      toast({
        title: "Recordatorios enviados",
        description: `Se enviaron ${paymentsNeedingReminder.length} recordatorios de pago.`,
      });

    } catch (error) {
      console.error('❌ Error procesando recordatorios:', error);
    }
  };

  /**
   * Procesa notificaciones de pagos vencidos
   */
  const processOverdueNotifications = async () => {
    try {
      console.log('🚨 Verificando pagos vencidos...');
      const overduePayments = await emailNotificationService.findOverduePayments();
      
      if (overduePayments.length === 0) {
        console.log('✅ No hay pagos vencidos pendientes de notificar');
        return;
      }

      console.log(`📧 Enviando ${overduePayments.length} notificaciones de vencimiento...`);
      
      for (const payment of overduePayments) {
        try {
          await emailNotificationService.sendOverduePaymentNotification(
            payment.students,
            payment,
            schoolSettings
          );
          
          // Marcar como enviado
          await emailNotificationService.markOverdueNotificationSent(payment.id);
          
          console.log(`✅ Notificación de vencimiento enviada a ${payment.students.email}`);
        } catch (error) {
          console.error(`❌ Error enviando notificación de vencimiento a ${payment.students.email}:`, error);
        }
      }

      toast({
        title: "Notificaciones de vencimiento enviadas",
        description: `Se enviaron ${overduePayments.length} notificaciones de pagos vencidos.`,
      });

    } catch (error) {
      console.error('❌ Error procesando notificaciones de vencimiento:', error);
    }
  };

  /**
   * Ejecuta todas las verificaciones de notificaciones
   */
  const processAllNotifications = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      await processPaymentReminders();
      await processOverdueNotifications();
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Ejecuta verificaciones automáticas cada 30 minutos
   */
  useEffect(() => {
    // Ejecutar inmediatamente al cargar
    processAllNotifications();

    // Configurar intervalo para ejecutar cada 30 minutos
    const interval = setInterval(() => {
      processAllNotifications();
    }, 30 * 60 * 1000); // 30 minutos

    return () => clearInterval(interval);
  }, [schoolSettings]);

  /**
   * Función manual para forzar verificación (para testing)
   */
  const forceNotificationCheck = () => {
    processAllNotifications();
  };

  // Este componente no renderiza nada visible, solo maneja notificaciones en segundo plano
  return null;
};

export default NotificationManager;
