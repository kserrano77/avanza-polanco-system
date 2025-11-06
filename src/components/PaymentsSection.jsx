
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

// Componente de búsqueda de estudiantes con autocompletado
const StudentSearchField = ({ students, selectedStudentId, onStudentSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState([]);
  
  // Filtrar estudiantes basado en el término de búsqueda (nombre, apellido o número de alumno)
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(students.slice(0, 10)); // Mostrar solo los primeros 10 si no hay búsqueda
    } else {
      const filtered = students.filter(student => {
        const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        const studentNumber = student.student_number ? String(student.student_number).toLowerCase() : '';
        
        return fullName.includes(searchLower) || 
               student.first_name.toLowerCase().includes(searchLower) ||
               student.last_name.toLowerCase().includes(searchLower) ||
               studentNumber.includes(searchLower);
      });
      setFilteredStudents(filtered.slice(0, 20)); // Limitar a 20 resultados
    }
  }, [searchTerm, students]);
  
  // Obtener el estudiante seleccionado
  const selectedStudent = students.find(s => String(s.id) === String(selectedStudentId));
  
  const handleStudentSelect = (student) => {
    onStudentSelect(student.id);
    setSearchTerm(`${student.first_name} ${student.last_name}`);
    setIsOpen(false);
  };
  
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true);
    
    // Si se borra el campo, limpiar la selección
    if (value.trim() === '') {
      onStudentSelect('');
    }
  };
  
  // Establecer el valor inicial cuando se selecciona un estudiante externamente
  useEffect(() => {
    if (selectedStudent && !searchTerm) {
      setSearchTerm(`${selectedStudent.first_name} ${selectedStudent.last_name}`);
    } else if (!selectedStudentId) {
      setSearchTerm('');
    }
  }, [selectedStudent, selectedStudentId]);
  
  return (
    <div className="relative">
      <Label htmlFor="student_search" className="text-slate-200 font-medium mb-2 block">
        Estudiante
      </Label>
      <div className="relative">
        <Input
          id="student_search"
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar por nombre, apellido o número de alumno..."
          className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20 pr-10"
          autoComplete="off"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
      </div>
      
      {/* Dropdown de resultados */}
      {isOpen && filteredStudents.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredStudents.map(student => (
            <div
              key={student.id}
              onClick={() => handleStudentSelect(student)}
              className="px-3 py-2 cursor-pointer hover:bg-slate-700 text-white border-b border-slate-700 last:border-b-0 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  {student.first_name} {student.last_name}
                </div>
                {student.student_number && (
                  <div className="text-sm text-blue-400 font-semibold">
                    #{student.student_number}
                  </div>
                )}
              </div>
              {student.email && (
                <div className="text-sm text-slate-400">
                  {student.email}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Cerrar dropdown al hacer click fuera */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

const PaymentForm = ({ open, setOpen, payment, students, refreshData, schoolSettings }) => {
  const [formData, setFormData] = useState({ student_id: '', amount: '', concept: '', status: 'pending', due_date: '', debt_amount: '', debt_description: '' });
  const [sendReceipt, setSendReceipt] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentConcepts, setPaymentConcepts] = useState([]);
  const { toast } = useToast();

  // Cargar conceptos de pago desde la base de datos
  const loadPaymentConcepts = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_concepts')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      setPaymentConcepts(data || []);
    } catch (error) {
      console.error('Error loading payment concepts:', error);
      // Fallback a conceptos predefinidos si hay error
      setPaymentConcepts([
        { id: 1, name: 'Colegiatura Enfermeria' },
        { id: 2, name: 'Colegiatura Podologia' },
        { id: 3, name: 'Colegiatura Preparatoria' },
        { id: 4, name: 'Colegiatura Secundaria' },
        { id: 5, name: 'Inscripcion' },
        { id: 6, name: 'Re inscripcion' },
        { id: 7, name: 'Certificacion' }
      ]);
    }
  };

  useEffect(() => {
    if (open) {
      loadPaymentConcepts();
    }
  }, [open]);

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
      setFormData({ student_id: '', amount: '', concept: '', status: 'pending', due_date: '', debt_amount: '', debt_description: '' });
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
    console.log('🔍 Debug - ESTRUCTURA COMPLETA del estudiante:', {
      id: student?.id,
      name: student?.name,
      first_name: student?.first_name,
      last_name: student?.last_name,
      email: student?.email,
      todas_las_propiedades: Object.keys(student || {})
    });
    
    if (!student) {
      toast({ variant: "destructive", title: "No se pudo enviar el recibo", description: "Estudiante no encontrado en la lista." });
      return;
    }
    
    if (!student.email) {
      toast({ variant: "destructive", title: "No se pudo enviar el recibo", description: `El estudiante ${student.first_name} ${student.last_name} no tiene un email registrado.` });
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
            <h2 style="color: #333; margin-top: 0;">Estimado/a ${student.first_name} ${student.last_name},</h2>
            <p style="color: #666; line-height: 1.6;">Hemos recibido su pago correctamente. A continuación los detalles:</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Concepto:</td><td style="padding: 8px 0; color: #666;">${paymentData.concept}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Monto Pagado:</td><td style="padding: 8px 0; color: #666;">$${paymentData.amount}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Fecha de Pago:</td><td style="padding: 8px 0; color: #666;">${paymentData.paid_date || new Date().toLocaleDateString('es-MX')}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Estado:</td><td style="padding: 8px 0; color: #28a745; font-weight: bold;">PAGADO</td></tr>
                ${paymentData.debt_amount && parseFloat(paymentData.debt_amount) > 0 ? `
                <tr style="border-top: 2px solid #ddd;"><td colspan="2" style="padding: 15px 0 8px 0; font-weight: bold; color: #e74c3c; font-size: 16px;">📋 INFORMACIÓN DE ADEUDO:</td></tr>
                <tr><td style="padding: 4px 0; font-weight: bold; color: #333;">Concepto del Adeudo:</td><td style="padding: 4px 0; color: #666;">${paymentData.debt_description || 'Adeudo pendiente'}</td></tr>
                <tr><td style="padding: 4px 0; font-weight: bold; color: #333;">Monto Adeudado:</td><td style="padding: 4px 0; color: #e74c3c; font-weight: bold; font-size: 18px;">$${paymentData.debt_amount}</td></tr>
                <tr><td colspan="2" style="padding: 8px 0; color: #e74c3c; font-style: italic; font-size: 14px;">⚠️ Recuerda realizar el pago de tu adeudo pendiente.</td></tr>
                ` : ''}
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
      
      const { data, error } = await supabase.functions.invoke('send-payment-receipt-v2', {
        body: { 
          student, 
          payment: {
            ...paymentData,
            debt_amount: paymentData.debt_amount || 0,
            debt_description: paymentData.debt_description || 'Adeudo pendiente'
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
      student_id: formData.student_id, // UUID string, no convertir a int
      amount: parseFloat(formData.amount),
      concept: formData.concept || 'Pago',
      status: formData.status || 'pending',
      paid_date: new Date().toISOString().split('T')[0] // Fecha actual automática
    };
    
    console.log('🔍 Debug - dataToSave:', dataToSave);
    
    // Solo agregar campos opcionales si no están vacíos
    if (formData.due_date) {
      dataToSave.due_date = formData.due_date;
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
        // 📧 Crear objeto de pago con datos de adeudo TEMPORALES (solo para el comprobante)
        const paymentForReceipt = {
          ...savedPayment,
          // 💰 Agregar campos de adeudo del formulario (NO se guardan en BD)
          debt_amount: formData.debt_amount ? parseFloat(formData.debt_amount) : 0,
          debt_description: formData.debt_description || null
        };
        
        console.log('📧 Debug - Enviando comprobante con adeudo:', {
          debt_amount: paymentForReceipt.debt_amount,
          debt_description: paymentForReceipt.debt_description
        });
        
        await sendPaymentReceipt(paymentForReceipt);
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
      <DialogContent className="bg-slate-800/95 backdrop-blur-md border-slate-600/30 text-white shadow-2xl max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-semibold">{payment ? 'Editar Pago' : 'Registrar Nuevo Pago'}</DialogTitle>
          <DialogDescription className="text-slate-300">{payment ? 'Actualiza los detalles del pago.' : 'Completa los campos para registrar un nuevo pago.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <StudentSearchField 
            students={students}
            selectedStudentId={formData.student_id}
            onStudentSelect={(studentId) => setFormData(prev => ({ ...prev, student_id: studentId }))}
          />
          <div>
            <Label htmlFor="amount" className="text-slate-200 font-medium mb-2 block">Monto Pagado</Label>
            <Input id="amount" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))} className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20" required />
          </div>
          <div>
            <Label htmlFor="concept" className="text-slate-200 font-medium mb-2 block">Concepto</Label>
            <Select value={formData.concept} onValueChange={(value) => setFormData(prev => ({ ...prev, concept: value }))}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white focus:border-blue-400 focus:ring-blue-400/20">
                <SelectValue placeholder="Seleccionar concepto">
                  {formData.concept || 'Seleccionar concepto'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {paymentConcepts.map(concept => (
                  <SelectItem key={concept.id} value={concept.name} className="text-white hover:bg-slate-700">
                    {concept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="due_date" className="text-slate-200 font-medium mb-2 block">Fecha de Vencimiento</Label>
            <Input id="due_date" type="date" value={formData.due_date} onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))} className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20" />
          </div>
          
          {/* Sección de Adeudo */}
          <div className="border-t border-slate-600/30 pt-4 mt-4">
            <h4 className="text-slate-200 font-medium mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              Información de Adeudo (Opcional)
            </h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="debt_amount" className="text-slate-200 font-medium mb-2 block">Monto de Adeudo</Label>
                <Input 
                  id="debt_amount" 
                  type="number" 
                  step="0.01" 
                  value={formData.debt_amount} 
                  onChange={(e) => setFormData(prev => ({ ...prev, debt_amount: e.target.value }))} 
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20" 
                  placeholder="0.00" 
                />
              </div>
              <div>
                <Label htmlFor="debt_description" className="text-slate-200 font-medium mb-2 block">Concepto del Adeudo</Label>
                <Input 
                  id="debt_description" 
                  value={formData.debt_description} 
                  onChange={(e) => setFormData(prev => ({ ...prev, debt_description: e.target.value }))} 
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20" 
                  placeholder="Ej: Mensualidad pendiente de Diciembre 2023" 
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="status" className="text-slate-200 font-medium mb-2 block">Estado</Label>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))} value={formData.status}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white focus:border-blue-400 focus:ring-blue-400/20">
                <SelectValue>
                  {formData.status === 'pending' ? 'Pendiente' : 
                   formData.status === 'paid' ? 'Pagado' : 
                   formData.status === 'overdue' ? 'Vencido' : 'Seleccionar estado'
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="pending" className="text-white hover:bg-slate-700 focus:bg-slate-700">Pendiente</SelectItem>
                <SelectItem value="paid" className="text-white hover:bg-slate-700 focus:bg-slate-700">Pagado</SelectItem>
                <SelectItem value="overdue" className="text-white hover:bg-slate-700 focus:bg-slate-700">Vencido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.status === 'paid' && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 border border-slate-600/30">
              <Label htmlFor="send-receipt" className="flex items-center gap-2 text-slate-200">
                <Send className="w-4 h-4" />
                Enviar comprobante por email
              </Label>
              <Switch id="send-receipt" checked={sendReceipt} onCheckedChange={setSendReceipt} />
            </div>
          )}
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary" className="bg-slate-600 hover:bg-slate-500 text-white border-slate-500">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white flex-1" disabled={isSubmitting}>
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
      
      const { data, error } = await supabase.functions.invoke('send-payment-receipt-v2', {
        body: { 
          student, 
          payment: {
            ...paymentData,
            debt_amount: paymentData.debt_amount || 0,
            debt_description: paymentData.debt_description || 'Adeudo pendiente'
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
