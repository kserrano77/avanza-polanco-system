
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, DollarSign, Calendar, CheckCircle, AlertCircle, Clock, Edit, Trash2, Loader2, Send, FileWarning, BarChart3, List } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { format, parseISO, isBefore } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import MonthlyBlocksContainer from './payments/MonthlyBlocksContainer';
import PaymentsDashboard from './payments/PaymentsDashboard';
import emailNotificationService from '@/services/emailNotificationService';

const getLocalDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const PaymentForm = ({ open, setOpen, payment, students, refreshData, schoolSettings }) => {
  const [formData, setFormData] = useState({ student_id: '', amount: '', concept: '', status: 'pending', payment_date: '', debt_amount: '', debt_description: '' });
  const [sendReceipt, setSendReceipt] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (payment) {
      setFormData({ 
        student_id: payment.student_id || '', 
        amount: payment.amount || '', 
        concept: payment.concept || '', 
        status: payment.status || 'pending',
        payment_date: payment.payment_date || '',
        debt_amount: payment.debt_amount || '',
        debt_description: payment.debt_description || ''
      });
    } else {
      setFormData({ student_id: '', amount: '', concept: '', status: 'pending', payment_date: '', debt_amount: '', debt_description: '' });
    }
  }, [payment, open]);

  const sendPaymentReceipt = async (paymentData) => {
    // Debug: verificar datos de búsqueda
    console.log('🔍 Debug - paymentData completo:', paymentData);
    console.log('🔍 Debug - paymentData.student_id:', paymentData.student_id, 'tipo:', typeof paymentData.student_id);
    console.log('🔍 Debug - students array length:', students.length);
    console.log('🔍 Debug - students disponibles:', students.map(s => ({ id: s.id, tipo_id: typeof s.id, name: s.name, email: s.email })));
    
    // Buscar estudiante con conversión de tipos para evitar problemas
    console.log('🔍 Intentando búsquedas:');
    console.log('🔍 Búsqueda 1 (==):', students.find(s => s.id == paymentData.student_id));
    console.log('🔍 Búsqueda 2 (parseInt):', students.find(s => s.id === parseInt(paymentData.student_id)));
    console.log('🔍 Búsqueda 3 (ambos parseInt):', students.find(s => parseInt(s.id) === parseInt(paymentData.student_id)));
    
    const student = students.find(s => 
      s.id == paymentData.student_id || 
      s.id === parseInt(paymentData.student_id) || 
      parseInt(s.id) === parseInt(paymentData.student_id)
    );
    
    console.log('🔍 Debug - estudiante encontrado FINAL:', student);
    
    if (!student) {
      toast({ variant: "destructive", title: "No se pudo enviar el recibo", description: "Estudiante no encontrado en la lista." });
      return;
    }
    
    if (!student.email) {
      toast({ variant: "destructive", title: "No se pudo enviar el recibo", description: `El estudiante ${student.name} no tiene un email registrado.` });
      return;
    }
    
    toast({ title: "Enviando recibo...", description: `Preparando para enviar a ${student.email}.` });

    try {
      const receiptHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">${import.meta.env.VITE_SCHOOL_NAME || 'Sistema Escolar'}</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Comprobante de Pago</p>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Estimado/a ${student.name},</h2>
            <p style="color: #666; line-height: 1.6;">Hemos recibido su pago correctamente. A continuación los detalles:</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Concepto:</td><td style="padding: 8px 0; color: #666;">${paymentData.concept}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Monto:</td><td style="padding: 8px 0; color: #666;">$${paymentData.amount}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Fecha de Pago:</td><td style="padding: 8px 0; color: #666;">${paymentData.paid_date || new Date().toLocaleDateString('es-MX')}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Estado:</td><td style="padding: 8px 0; color: #28a745; font-weight: bold;">PAGADO</td></tr>
              </table>
            </div>
            
            <p style="color: #666; line-height: 1.6;">Gracias por su pago puntual. Si tiene alguna pregunta, no dude en contactarnos.</p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 14px; margin: 0;">${import.meta.env.VITE_SCHOOL_NAME || 'Sistema Escolar'}</p>
              <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">Comprobante generado automáticamente</p>
            </div>
          </div>
        </div>
      `;

      // Test Edge Function with correct deployment
      console.log('🧪 Testing Edge Function (should work now)...');
      
      const { data, error } = await supabase.functions.invoke('send-payment-receipt', {
        body: { 
          student, 
          payment: {
            ...paymentData,
            remaining_debt: paymentData.debt_amount || 0
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
      
      console.log('✅ Edge Function response:', data);
      
      toast({ title: "Recibo enviado", description: `Se ha enviado un comprobante de pago a ${student.email}.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error al enviar el recibo", description: `Detalle: ${error.message}` });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validar que se haya seleccionado un estudiante
    if (!formData.student_id) {
      toast({ 
        variant: "destructive", 
        title: "Error de validación", 
        description: "Debes seleccionar un estudiante para registrar el pago." 
      });
      setIsSubmitting(false);
      return;
    }
    
    // Debug: verificar datos antes de guardar
    console.log('🔍 Debug - formData antes de guardar:', formData);
    console.log('🔍 Debug - formData.student_id:', formData.student_id, 'tipo:', typeof formData.student_id);
    
    // Crear objeto ultra-simplificado con solo campos básicos
    const dataToSave = {
      student_id: parseInt(formData.student_id),
      amount: parseFloat(formData.amount),
      concept: formData.concept || 'Pago',
      status: formData.status || 'pending'
    };
    
    console.log('🔍 Debug - dataToSave:', dataToSave);
    
    // Solo agregar campos opcionales si no están vacíos
    if (formData.payment_date) {
      dataToSave.payment_date = formData.payment_date;
    }
    
    if (formData.status === 'paid') {
      dataToSave.paid_date = payment?.paid_date || getLocalDateString();
    }
    
    try {
      let savedPayment;
      if (payment) {
        const { data, error } = await supabase.from('payments').update(dataToSave).eq('id', payment.id).select().single();
        if (error) throw error;
        savedPayment = data;
      } else {
        const { data, error } = await supabase.from('payments').insert([dataToSave]).select().single();
        if (error) throw error;
        savedPayment = data;
      }
      
      toast({
        title: `Pago ${payment ? 'actualizado' : 'registrado'}`,
        description: `El pago se ha ${payment ? 'actualizado' : 'guardado'} correctamente.`,
      });

      // Enviar recibo si el pago está marcado como pagado
      if (sendReceipt && savedPayment.status === 'paid') {
        await sendPaymentReceipt(savedPayment);
      }

      // Enviar confirmación de nuevo pago registrado (solo para pagos nuevos y pendientes)
      if (!payment && savedPayment.status === 'pending') {
        try {
          const student = students.find(s => s.id === savedPayment.student_id);
          if (student && student.email) {
            await emailNotificationService.sendPaymentConfirmation(student, savedPayment, schoolSettings);
            
            // Marcar confirmación como enviada
            await supabase
              .from('payments')
              .update({ confirmation_sent: new Date().toISOString() })
              .eq('id', savedPayment.id);
              
            toast({
              title: "Confirmación enviada",
              description: `Se ha enviado una confirmación a ${student.email}.`,
            });
          }
        } catch (error) {
          console.error('Error enviando confirmación:', error);
          toast({
            variant: "destructive",
            title: "Error al enviar confirmación",
            description: "El pago se registró correctamente, pero no se pudo enviar la confirmación por email.",
          });
        }
      }

      refreshData();
      setOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error al guardar el pago", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-effect border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="gradient-text">{payment ? 'Editar Pago' : 'Registrar Nuevo Pago'}</DialogTitle>
          <DialogDescription className="text-white/60">{payment ? 'Actualiza los detalles del pago.' : 'Completa los campos para registrar un nuevo pago.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="student_id" className="text-white/80">Estudiante</Label>
            <Select value={formData.student_id?.toString() || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, student_id: value }))}>
              <SelectTrigger className="input-field">
                <SelectValue placeholder="Seleccionar estudiante" />
              </SelectTrigger>
              <SelectContent>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id.toString()}>
                    {`${student.first_name} ${student.last_name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div><Label htmlFor="amount" className="text-white/80">Monto Pagado</Label><Input id="amount" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))} className="input-field" required /></div>
          <div><Label htmlFor="concept" className="text-white/80">Concepto</Label><Input id="concept" value={formData.concept} onChange={(e) => setFormData(prev => ({ ...prev, concept: e.target.value }))} className="input-field" placeholder="Ej: Mensualidad Enero 2024" required /></div>
          <div><Label htmlFor="payment_date" className="text-white/80">Fecha de Vencimiento</Label><Input id="payment_date" type="date" value={formData.payment_date} onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))} className="input-field" /></div>
          
          {/* Sección de Adeudo */}
          <div className="border-t border-white/20 pt-4 mt-4">
            <h4 className="text-white/90 font-medium mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Información de Adeudo (Opcional)
            </h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="debt_amount" className="text-white/80">Monto de Adeudo</Label>
                <Input 
                  id="debt_amount" 
                  type="number" 
                  step="0.01" 
                  value={formData.debt_amount} 
                  onChange={(e) => setFormData(prev => ({ ...prev, debt_amount: e.target.value }))} 
                  className="input-field" 
                  placeholder="0.00" 
                />
              </div>
              <div>
                <Label htmlFor="debt_description" className="text-white/80">Concepto del Adeudo</Label>
                <Input 
                  id="debt_description" 
                  value={formData.debt_description} 
                  onChange={(e) => setFormData(prev => ({ ...prev, debt_description: e.target.value }))} 
                  className="input-field" 
                  placeholder="Ej: Mensualidad pendiente de Diciembre 2023" 
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="status" className="text-white/80">Estado</Label>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))} value={formData.status}>
              <SelectTrigger className="input-field"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="paid">Pagado</SelectItem>
                <SelectItem value="overdue">Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.status === 'paid' && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/10">
              <Label htmlFor="send-receipt" className="flex items-center gap-2 text-white/90">
                <Send className="w-4 h-4" />
                Enviar comprobante por email
              </Label>
              <Switch id="send-receipt" checked={sendReceipt} onCheckedChange={setSendReceipt} />
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary" className="btn-secondary">Cancelar</Button></DialogClose>
            <Button type="submit" className="w-full btn-primary" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {payment ? 'Actualizar Pago' : 'Registrar Pago'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const PaymentsSection = ({ payments, students, refreshData, schoolSettings }) => {
  // Debug: verificar cuándo llegan los estudiantes como prop
  console.log('🔍 PaymentsSection - students prop:', students);
  console.log('🔍 PaymentsSection - students length:', students?.length);
  
  useEffect(() => {
    console.log('🔍 PaymentsSection useEffect - students cambiaron:', students?.length, 'estudiantes');
    console.log('🔍 PaymentsSection useEffect - estudiantes:', students?.map(s => ({ id: s.id, name: s.name || s.first_name, email: s.email })));
  }, [students]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [viewMode, setViewMode] = useState('blocks'); // 'blocks' o 'dashboard'
  const { toast } = useToast();
  const { canDeletePayments } = useRolePermissions();

  // Actualizar automáticamente pagos vencidos
  useEffect(() => {
    const updateOverduePayments = async () => {
      const today = new Date();
      const overduePayments = payments.filter(payment => {
        if (payment.status !== 'pending' || !payment.payment_date) return false;
        const paymentDate = parseISO(payment.payment_date);
        return isBefore(paymentDate, today);
      });

      // Actualizar pagos vencidos en lotes
      if (overduePayments.length > 0) {
        console.log(`🕐 Actualizando ${overduePayments.length} pagos vencidos...`);
        
        for (const payment of overduePayments) {
          try {
            const { error } = await supabase
              .from('payments')
              .update({ status: 'overdue' })
              .eq('id', payment.id);
            
            if (error) {
              console.error('Error actualizando pago vencido:', error);
            }
          } catch (error) {
            console.error('Error en actualización automática:', error);
          }
        }
        
        // Refrescar datos después de actualizar
        setTimeout(() => {
          refreshData();
        }, 1000);
      }
    };

    updateOverduePayments();
  }, [payments, refreshData]);

  // Funciones para manejar acciones de pagos
  const handleStatusChange = async (paymentId, newStatus) => {
    try {
      console.log(`🔄 Cambiando estado del pago ${paymentId} a ${newStatus}`);
      
      const updateData = { status: newStatus };
      
      // Si se marca como pagado, agregar fecha de pago
      if (newStatus === 'paid') {
        updateData.paid_date = new Date().toISOString().split('T')[0];
      }
      
      const { error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', paymentId);
        
      if (error) throw error;
      
      toast({ 
        title: 'Estado actualizado', 
        description: `El pago ha sido marcado como ${newStatus === 'paid' ? 'pagado' : newStatus}.` 
      });
      
      refreshData();
    } catch (error) {
      console.error('Error actualizando estado:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: 'No se pudo actualizar el estado del pago.' 
      });
    }
  };
  
  const sendPaymentReceipt = async (paymentData) => {
    const student = students.find(s => s.id === paymentData.student_id);
    if (!student || !student.email) {
      toast({ variant: "destructive", title: "No se pudo enviar el recibo", description: "El estudiante no tiene un email registrado." });
      return;
    }

    toast({ title: "Enviando recibo...", description: `Preparando para enviar a ${student.email}.` });

    try {
      const receiptHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">${import.meta.env.VITE_SCHOOL_NAME || 'Sistema Escolar'}</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Comprobante de Pago</p>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Estimado/a ${student.name},</h2>
            <p style="color: #666; line-height: 1.6;">Hemos recibido su pago correctamente. A continuación los detalles:</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Concepto:</td><td style="padding: 8px 0; color: #666;">${paymentData.concept}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Monto:</td><td style="padding: 8px 0; color: #666;">$${paymentData.amount}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Fecha de Pago:</td><td style="padding: 8px 0; color: #666;">${paymentData.paid_date || new Date().toLocaleDateString('es-MX')}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Estado:</td><td style="padding: 8px 0; color: #28a745; font-weight: bold;">PAGADO</td></tr>
              </table>
            </div>
            
            <p style="color: #666; line-height: 1.6;">Gracias por su pago puntual. Si tiene alguna pregunta, no dude en contactarnos.</p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 14px; margin: 0;">${import.meta.env.VITE_SCHOOL_NAME || 'Sistema Escolar'}</p>
              <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">Comprobante generado automáticamente</p>
            </div>
          </div>
        </div>
      `;

      // Test Edge Function with correct deployment
      console.log('🧪 Testing Edge Function (should work now)...');
      
      const { data, error } = await supabase.functions.invoke('send-payment-receipt', {
        body: { 
          student, 
          payment: {
            ...paymentData,
            remaining_debt: paymentData.debt_amount || 0
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
      
      console.log('✅ Edge Function response:', data);

      toast({ title: "Recibo enviado", description: `Se ha enviado un comprobante de pago a ${student.email}.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Error al enviar el recibo", description: `Detalle: ${error.message}` });
    }
  };

  const updatePaymentStatus = async (paymentId, newStatus) => {
    try {
      const { data: updatedPayment, error } = await supabase.from('payments').update({ status: newStatus, paid_date: newStatus === 'paid' ? getLocalDateString() : null }).eq('id', paymentId).select().single();
      if (error) throw error;
      
      toast({ title: "Estado actualizado", description: `El pago ha sido marcado como ${newStatus}.` });
      
      if (newStatus === 'paid') {
        await sendPaymentReceipt(updatedPayment);
      }

      refreshData();
    } catch (error) {
      toast({ variant: "destructive", title: "Error al actualizar estado", description: error.message });
    }
  };

  const handleDelete = async (paymentToDelete) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este pago? Esta acción no se puede deshacer.")) return;

    try {
      console.log('🗑️ Iniciando eliminación del pago:', paymentToDelete.id, paymentToDelete.concept);
      
      const { data: deleteData, error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentToDelete.id)
        .select(); // Agregar select para ver qué se eliminó
        
      console.log('🗑️ Resultado de eliminación:', { deleteData, error });
      
      if (error) {
        console.error('❌ Error en eliminación:', error);
        throw error;
      }
      
      if (!deleteData || deleteData.length === 0) {
        console.warn('⚠️ No se eliminó ningún registro. Posible problema de permisos RLS.');
        throw new Error('No se pudo eliminar el pago. Verifique los permisos.');
      }
      
      console.log('✅ Pago eliminado exitosamente, refrescando datos...');
      toast({ title: "Pago eliminado", description: "El registro del pago ha sido eliminado." });
      
      await refreshData();
      
      console.log('✅ Datos refrescados');
      
    } catch (error) {
      console.error('❌ Error completo en eliminación:', error);
      toast({ variant: "destructive", title: "Error al eliminar", description: error.message });
    }
  };
  
  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setIsDialogOpen(true);
  };
  
  const openNewDialog = () => {
    setEditingPayment(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header con controles de vista */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Gestión de Cobranza por Bloques Mensuales
          </h1>
          <p className="text-white/70">
            Sistema organizacional cronológico para mejor control de flujo de efectivo
          </p>
        </div>
        <div className="flex gap-3">
          {/* Selector de vista */}
          <div className="flex bg-white/10 rounded-lg p-1">
            <Button
              variant={viewMode === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('dashboard')}
              className={`${
                viewMode === 'dashboard' 
                  ? 'bg-white text-black' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={viewMode === 'blocks' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('blocks')}
              className={`${
                viewMode === 'blocks' 
                  ? 'bg-white text-black' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <List className="w-4 h-4 mr-2" />
              Bloques
            </Button>
          </div>
          <Button onClick={openNewDialog} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />Nuevo Pago
          </Button>
        </div>
      </motion.div>

      {/* Contenido según vista seleccionada */}
      <motion.div
        key={viewMode}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {viewMode === 'dashboard' ? (
          <PaymentsDashboard payments={payments} />
        ) : (
          <MonthlyBlocksContainer
            payments={payments}
            students={students}
            onEditPayment={handleEdit}
            onDeletePayment={handleDelete}
            onStatusChange={handleStatusChange}
            canDeletePayments={canDeletePayments}
          />
        )}
      </motion.div>

      {/* Dialog de formulario de pago */}
      <PaymentForm 
        open={isDialogOpen} 
        setOpen={setIsDialogOpen} 
        payment={editingPayment} 
        students={students} 
        refreshData={refreshData} 
        schoolSettings={schoolSettings}
      />
    </div>
  );
};

export default PaymentsSection;
