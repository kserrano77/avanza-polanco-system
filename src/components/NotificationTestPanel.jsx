import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Clock, AlertTriangle, CheckCircle, Send, Loader2 } from 'lucide-react';
import emailNotificationService from '@/services/emailNotificationService';

/**
 * Panel de pruebas para las notificaciones de email
 * Solo visible para administradores
 */
const NotificationTestPanel = ({ schoolSettings }) => {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState(null);

  /**
   * Prueba el envío de recordatorios de pago
   */
  const testPaymentReminders = async () => {
    setTesting(true);
    try {
      console.log('🧪 Iniciando prueba de recordatorios...');
      const paymentsNeedingReminder = await emailNotificationService.findPaymentsNeedingReminder();
      
      setResults(prev => ({
        ...prev,
        reminders: {
          found: paymentsNeedingReminder.length,
          status: paymentsNeedingReminder.length > 0 ? 'found' : 'none'
        }
      }));

      toast({
        title: "Prueba de recordatorios completada",
        description: `Se encontraron ${paymentsNeedingReminder.length} pagos que necesitan recordatorio.`,
      });

    } catch (error) {
      console.error('Error en prueba de recordatorios:', error);
      toast({
        variant: "destructive",
        title: "Error en prueba",
        description: error.message,
      });
    } finally {
      setTesting(false);
    }
  };

  /**
   * Prueba el envío de notificaciones de pagos vencidos
   */
  const testOverdueNotifications = async () => {
    setTesting(true);
    try {
      console.log('🧪 Iniciando prueba de pagos vencidos...');
      const overduePayments = await emailNotificationService.findOverduePayments();
      
      setResults(prev => ({
        ...prev,
        overdue: {
          found: overduePayments.length,
          status: overduePayments.length > 0 ? 'found' : 'none'
        }
      }));

      toast({
        title: "Prueba de vencidos completada",
        description: `Se encontraron ${overduePayments.length} pagos vencidos.`,
      });

    } catch (error) {
      console.error('Error en prueba de vencidos:', error);
      toast({
        variant: "destructive",
        title: "Error en prueba",
        description: error.message,
      });
    } finally {
      setTesting(false);
    }
  };

  /**
   * Ejecuta todas las pruebas
   */
  const runAllTests = async () => {
    setResults(null);
    await testPaymentReminders();
    await testOverdueNotifications();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="glass-effect border-purple-500/30">
        <CardHeader>
          <CardTitle className="gradient-text flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Panel de Pruebas - Notificaciones de Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={testPaymentReminders}
              disabled={testing}
              className="btn-secondary flex items-center gap-2"
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
              Probar Recordatorios
            </Button>

            <Button
              onClick={testOverdueNotifications}
              disabled={testing}
              className="btn-secondary flex items-center gap-2"
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
              Probar Vencidos
            </Button>

            <Button
              onClick={runAllTests}
              disabled={testing}
              className="btn-primary flex items-center gap-2"
            >
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Ejecutar Todas
            </Button>
          </div>

          {results && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 space-y-3"
            >
              <h4 className="text-white font-medium">Resultados de Pruebas:</h4>
              
              {results.reminders && (
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white/80">Recordatorios (3 días antes)</span>
                  <Badge variant={results.reminders.status === 'found' ? 'default' : 'secondary'}>
                    {results.reminders.found} encontrados
                  </Badge>
                </div>
              )}

              {results.overdue && (
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white/80">Pagos Vencidos</span>
                  <Badge variant={results.overdue.status === 'found' ? 'destructive' : 'secondary'}>
                    {results.overdue.found} encontrados
                  </Badge>
                </div>
              )}
            </motion.div>
          )}

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <h4 className="text-blue-300 font-medium mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Información del Sistema
            </h4>
            <div className="space-y-2 text-sm text-blue-200">
              <p>• Las notificaciones se ejecutan automáticamente cada 30 minutos</p>
              <p>• Los recordatorios se envían 3 días antes del vencimiento</p>
              <p>• Las notificaciones de vencimiento se envían el día después del vencimiento</p>
              <p>• Las confirmaciones se envían al registrar nuevos pagos pendientes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NotificationTestPanel;
