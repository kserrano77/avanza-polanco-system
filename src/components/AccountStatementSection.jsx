import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Library, Printer, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { format, parseISO } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AccountStatementSection = ({ students, schoolSettings }) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const { toast } = useToast();

  const fetchStudentStatement = useCallback(async () => {
    if (!selectedStudentId) return;

    setLoading(true);
    try {
      // Obtener datos del estudiante con información del curso
      const { data: studentWithCourse, error: studentError } = await supabase
        .from('students')
        .select(`
          *,
          courses(name)
        `)
        .eq('id', selectedStudentId)
        .single();
      
      if (studentError) throw studentError;
      setStudentData(studentWithCourse);

      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', selectedStudentId)
        .order('paid_date', { ascending: false });

      if (paymentError) throw paymentError;

      setPayments(paymentData);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al cargar el estado de cuenta',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId, students, toast]);

  useEffect(() => {
    fetchStudentStatement();
  }, [selectedStudentId, fetchStudentStatement]);

  const handlePrint = async () => {
    if (!studentData || !payments) return;
    setIsPrinting(true);

    try {
      const doc = new jsPDF();
      let startY = 15;

      if (schoolSettings?.logo_url) {
        try {
          const response = await fetch(schoolSettings.logo_url);
          const blob = await response.blob();
          const imgData = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
      
          const img = new Image();
          img.src = imgData;
          await new Promise(resolve => { img.onload = resolve });

          const imgWidth = 40;
          const imgHeight = (img.height * imgWidth) / img.width;
          
          doc.addImage(imgData, 'PNG', 15, startY, imgWidth, imgHeight);
          startY += imgHeight + 5; 
        } catch (e) {
          console.error("Error loading logo for PDF, using text instead.", e);
          if (schoolSettings?.school_name) {
            doc.setFontSize(20);
            doc.text(schoolSettings.school_name, 15, startY + 5);
            startY += 10;
          }
        }
      } else if (schoolSettings?.school_name) {
        doc.setFontSize(20);
        doc.text(schoolSettings.school_name, 15, startY + 5);
        startY += 10;
      }
      
      startY += 10;
      doc.setFontSize(18);
      doc.text('Estado de Cuenta', 15, startY);

      startY += 10;
      doc.setFontSize(12);
      doc.text(`Estudiante: ${studentData.first_name} ${studentData.last_name}`, 15, startY);
      doc.text(`Fecha: ${format(new Date(), 'dd/MM/yyyy')}`, 150, startY);
      
      startY += 6;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Email: ${studentData.email}`, 15, startY);
      doc.text(`Curso: ${studentData.courses?.name || 'No asignado'}`, 15, startY + 5);

      startY += 20;
      
      const summary = payments.reduce((acc, p) => {
        if (p.status === 'paid') acc.paid += p.amount;
        else acc.pending += p.amount;
        return acc;
      }, { paid: 0, pending: 0 });

      const tableBody = payments.map(p => [
        p.concept,
        `$${Number(p.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`,
        p.paid_date ? format(parseISO(p.paid_date), 'dd/MM/yyyy') : '-',
        p.status === 'paid' ? 'Pagado' : p.status === 'pending' ? 'Pendiente' : 'Vencido',
        p.paid_date ? format(parseISO(p.paid_date), 'dd/MM/yyyy') : '-'
      ]);
      
      tableBody.push(
          ['', '', '', '', ''], // Spacer
          [{ content: 'Total Pagado:', styles: { fontStyle: 'bold', halign: 'right' } }, { content: `$${summary.paid.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, styles: { fontStyle: 'bold'} }, '', '', ''],
          [{ content: 'Total Pendiente:', styles: { fontStyle: 'bold', halign: 'right' } }, { content: `$${summary.pending.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, styles: { fontStyle: 'bold'} }, '', '', '']
      );

      doc.autoTable({
        startY: startY,
        head: [['Concepto', 'Monto', 'Vencimiento', 'Estado', 'Fecha de Pago']],
        body: tableBody,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
        didDrawPage: function(data) {
          doc.setFontSize(10);
          doc.setTextColor(150);
          doc.text('Generado por EduManager', data.settings.margin.left, doc.internal.pageSize.height - 10);
        }
      });
      
      doc.save(`estado-cuenta-${studentData.first_name}_${studentData.last_name}.pdf`);
      alert('✅ ¡PDF generado con éxito!\nEl estado de cuenta se ha descargado correctamente.');
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert('❌ Error al generar el PDF\nHubo un problema al crear el documento. Inténtalo de nuevo.');
    } finally {
      setIsPrinting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid': return <Badge className="status-paid"><CheckCircle className="w-3 h-3 mr-1" />Pagado</Badge>;
      case 'pending': return <Badge className="status-pending"><Clock className="w-3 h-3 mr-1" />Pendiente</Badge>;
      case 'overdue': return <Badge className="status-overdue"><AlertCircle className="w-3 h-3 mr-1" />Vencido</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };
  
  const summary = payments.reduce((acc, p) => {
      if (p.status === 'paid') acc.paid += p.amount;
      else acc.pending += p.amount;
      return acc;
  }, { paid: 0, pending: 0 });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Estado de Cuenta del Estudiante</h1>
          <p className="text-white/70">Consulta el historial de pagos y adeudos de un estudiante.</p>
        </div>
      </motion.div>

      <Card className="glass-effect border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Seleccionar Estudiante</CardTitle>
          <div className="flex gap-4 items-center">
            <Select onValueChange={setSelectedStudentId} value={selectedStudentId}>
              <SelectTrigger className="input-field w-full md:w-1/3">
                <SelectValue placeholder="Busca o selecciona un estudiante..." />
              </SelectTrigger>
              <SelectContent>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id}>{student.first_name} {student.last_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {loading && <Loader2 className="h-5 w-5 animate-spin text-purple-400" />}
          </div>
        </CardHeader>
      </Card>

      {selectedStudentId && !loading && studentData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-effect border-white/20">
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle className="gradient-text text-2xl mb-2">{studentData.name}</CardTitle>
                <CardDescription className="text-white/60">
                  {studentData.email} <br />
                  Curso: {studentData.course}
                </CardDescription>
              </div>
              <Button onClick={handlePrint} variant="outline" className="btn-secondary" disabled={isPrinting}>
                {isPrinting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                {isPrinting ? 'Generando...' : 'Imprimir'}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-sm text-green-300">Total Pagado</p>
                  <p className="text-2xl font-bold text-white">${summary.paid.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-300">Total Pendiente</p>
                  <p className="text-2xl font-bold text-white">${summary.pending.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            
              <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2"><Library className="w-5 h-5"/>Historial de Pagos</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/20">
                      <TableHead className="text-white/80">Concepto</TableHead>
                      <TableHead className="text-white/80">Monto</TableHead>
                      <TableHead className="text-white/80">Fecha de Vencimiento</TableHead>
                      <TableHead className="text-white/80">Estado</TableHead>
                      <TableHead className="text-white/80">Fecha de Pago</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length > 0 ? (
                      payments.map((payment, index) => (
                        <motion.tr key={payment.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }} className="border-white/10 hover:bg-white/5">
                          <TableCell className="text-white font-medium">{payment.concept}</TableCell>
                          <TableCell className="text-white/80">${payment.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-white/80">{payment.paid_date ? format(parseISO(payment.paid_date), 'dd MMM yyyy') : '-'}</TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                          <TableCell className="text-white/80">{payment.paid_date ? format(parseISO(payment.paid_date), 'dd MMM yyyy') : '-'}</TableCell>
                        </motion.tr>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-white/60 py-8">
                          No hay pagos registrados para este estudiante.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {!selectedStudentId && !loading && (
        <div className="flex flex-col items-center justify-center text-center p-12 glass-effect rounded-lg border border-white/20">
          <User className="h-16 w-16 text-purple-400 mb-4" />
          <h3 className="text-xl font-bold text-white">Selecciona un estudiante</h3>
          <p className="text-white/60">Elige a un estudiante de la lista para ver su estado de cuenta detallado.</p>
        </div>
      )}
    </div>
  );
};

export default AccountStatementSection;