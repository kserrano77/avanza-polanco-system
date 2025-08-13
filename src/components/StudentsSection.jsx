import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, UserCog, Mail, Phone, User, Book, Loader2, Clock, UserCheck, UserX, GraduationCap, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { format, parseISO } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const StudentForm = ({ open, setOpen, student, courses, schedules, refreshData }) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scheduleDropdownOpen, setScheduleDropdownOpen] = useState(false);
  const { toast } = useToast();

  const formatScheduleLabel = (schedule) => {
    if (!schedule) return 'No asignado';
    
    const courseName = schedule.courses?.name || 'Curso no encontrado';
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const day = dayNames[schedule.day_of_week] || 'Día no válido';
    const startTime = schedule.start_time || 'Hora no definida';
    const endTime = schedule.end_time || 'Hora no definida';
    
    // Agregar información adicional para diferenciar horarios similares
    let additionalInfo = '';
    if (schedule.classroom) {
      // Como el campo classroom se usa para número de grupo, mostrar como "Grupo"
      additionalInfo += ` (Grupo ${schedule.classroom})`;
    } else if (schedule.instructor) {
      additionalInfo += ` (Prof: ${schedule.instructor})`;
    } else {
      // Si no hay grupo ni instructor, usar los últimos 4 caracteres del ID como identificador
      const groupId = schedule.id ? schedule.id.slice(-4).toUpperCase() : 'XXXX';
      additionalInfo += ` (Grupo ${groupId})`;
    }
    
    return `${courseName} - ${day} ${startTime}-${endTime}${additionalInfo}`;
  };

  const initialFormState = useMemo(() => ({
    first_name: '',
    last_name: '',
    student_number: '',
    email: '',
    phone: '',
    address: '',
    birth_date: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    status: 'active',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    notes: '',
    course_id: null,
    schedule_info: null
  }), []);

  // Función para calcular el siguiente número de estudiante disponible
  const getNextStudentNumber = async () => {
    try {
      const { data: students, error } = await supabase
        .from('students')
        .select('student_number, first_name, last_name')
        .order('student_number', { ascending: false });
      
      if (error) {
        console.error('Error obteniendo números de estudiante:', error);
        return '64'; // Fallback al número esperado
      }
      
      if (!students || students.length === 0) {
        return '64'; // Primer estudiante
      }
      
      // Obtener el siguiente número de estudiante disponible
      const existingNumbers = students
        .map(s => parseInt(s.student_number))
        .filter(num => !isNaN(num) && num < 1000) // Filtrar números razonables
        .sort((a, b) => a - b);
      
      if (existingNumbers.length === 0) {
        return '1';
      }
      
      // Detectar secuencia continua y evitar saltos anómalos
      // Si hay un salto grande (>10), usar el número antes del salto + 1
      let sequentialMax = 0;
      for (let i = 0; i < existingNumbers.length - 1; i++) {
        const current = existingNumbers[i];
        const next = existingNumbers[i + 1];
        
        // Si hay un salto mayor a 10, el número actual es el último de la secuencia
        if (next - current > 10) {
          sequentialMax = current;
          break;
        }
      }
      
      // Si no se encontró salto, usar el máximo normal
      if (sequentialMax === 0) {
        sequentialMax = existingNumbers[existingNumbers.length - 1];
      }
      
      const nextNumber = sequentialMax + 1;
      return String(nextNumber);
    } catch (error) {
      console.error('Error calculando siguiente número:', error);
      return '64';
    }
  };

  useEffect(() => {
    if (student) {
      setFormData({
        ...initialFormState,
        ...student,
        birth_date: student.birth_date ? new Date(student.birth_date).toISOString().split('T')[0] : '',
        enrollment_date: student.enrollment_date ? new Date(student.enrollment_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else {
      // Para nuevo estudiante, calcular el siguiente número automáticamente
      const loadNextNumber = async () => {
        const nextNumber = await getNextStudentNumber();
        setFormData({
          ...initialFormState,
          student_number: nextNumber
        });
      };
      loadNextNumber();
    }
  }, [student, initialFormState]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (scheduleDropdownOpen && !event.target.closest('.schedule-dropdown')) {
        setScheduleDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [scheduleDropdownOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const dataToSave = { 
      ...formData, 
      enrollment_date: student?.enrollment_date || new Date().toISOString().split('T')[0],
      course_id: formData.course_id === 'none' || !formData.course_id ? null : formData.course_id,
      schedule_id: formData.schedule_info === 'none' || !formData.schedule_info ? null : formData.schedule_info
    };
    
    // Remover campos que no pertenecen a la tabla students
    delete dataToSave.schedule_info; // usamos schedule_id en la BD
    delete dataToSave.courses; // viene del JOIN, no es campo de students
    delete dataToSave.schedules; // viene del JOIN, no es campo de students
    delete dataToSave.created_at; // campo automático, no debe actualizarse
    delete dataToSave.updated_at; // campo automático, no debe actualizarse
    
    // Debug: mostrar datos que se van a guardar
    console.log('🔍 Debug - Datos a guardar:', dataToSave);
    console.log('🔍 Debug - formData original:', formData);
    
    // Validaciones básicas antes de enviar
    if ((!dataToSave.first_name || dataToSave.first_name.trim() === '') && 
        (!dataToSave.last_name || dataToSave.last_name.trim() === '')) {
      toast({
        variant: 'destructive',
        title: 'Error de validación',
        description: 'El nombre o apellido del estudiante es requerido'
      });
      setIsSubmitting(false);
      return;
    }
    
    if (!dataToSave.email || dataToSave.email.trim() === '') {
      toast({
        variant: 'destructive',
        title: 'Error de validación',
        description: 'El email del estudiante es requerido'
      });
      setIsSubmitting(false);
      return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dataToSave.email)) {
      toast({
        variant: 'destructive',
        title: 'Error de validación',
        description: 'El formato del email no es válido'
      });
      setIsSubmitting(false);
      return;
    }

    try {
      let result;
      if (student) {
        console.log('🔄 Actualizando estudiante ID:', student.id);
        console.log('🔍 Datos específicos para actualización:', JSON.stringify(dataToSave, null, 2));
        result = await supabase.from('students').update(dataToSave).eq('id', student.id);
      } else {
        console.log('🔄 Insertando nuevo estudiante');
        result = await supabase.from('students').insert([dataToSave]);
      }
      
      console.log('🔍 Resultado completo de Supabase:', result);
      
      if (result.error) {
        console.error('❌ Error detallado de Supabase:', {
          message: result.error.message,
          details: result.error.details,
          hint: result.error.hint,
          code: result.error.code
        });
        
        let errorMessage = result.error.message || 'No se pudo completar la operación';
        
        // Manejo específico de errores comunes
        if (result.error.code === '23505') {
          if (result.error.message.includes('email')) {
            errorMessage = 'Ya existe un estudiante con este email. Por favor, usa un email diferente.';
          } else if (result.error.message.includes('student_number')) {
            errorMessage = 'Ya existe un estudiante con este número. Por favor, usa un número diferente.';
          } else {
            errorMessage = 'Ya existe un estudiante con estos datos. Verifica que no haya duplicados.';
          }
        } else if (result.error.code === '23502') {
          errorMessage = 'Faltan campos requeridos. Verifica que todos los campos obligatorios estén llenos.';
        } else if (result.error.code === '23514') {
          errorMessage = 'Los datos no cumplen con las restricciones de la base de datos.';
        }
        
        toast({
          variant: 'destructive',
          title: 'Error en operación',
          description: errorMessage
        });
        setIsSubmitting(false);
        return;
      }
      
      toast({
        title: `Estudiante ${student ? 'actualizado' : 'agregado'}`,
        description: `El estudiante se ha ${student ? 'actualizado' : 'guardado'} correctamente.`,
      });
      refreshData();
      setOpen(false);
    } catch (error) {
      let errorMessage = error.message;
      
      // Manejo específico para número de estudiante duplicado
      if (error.code === '23505' && error.message && error.message.includes('students_student_number_key')) {
        errorMessage = 'Ya existe un estudiante con este número. Por favor, usa un número diferente.';
      }
      
      toast({
        variant: "destructive",
        title: "Error al guardar el estudiante",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-slate-800/95 backdrop-blur-md border-slate-600/30 text-white shadow-2xl max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-semibold">{student ? 'Editar Estudiante' : 'Nuevo Estudiante'}</DialogTitle>
          <DialogDescription className="text-slate-300">
            {student ? 'Actualiza los datos del estudiante.' : 'Completa los campos para registrar un nuevo estudiante.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="first_name" className="text-slate-200 font-medium mb-2 block">Nombre</Label>
              <Input id="first_name" value={formData.first_name || ''} onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))} className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20" required />
            </div>
            <div>
              <Label htmlFor="last_name" className="text-slate-200 font-medium mb-2 block">Apellido</Label>
              <Input id="last_name" value={formData.last_name || ''} onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))} className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20" required />
            </div>
            <div>
              <Label htmlFor="student_number" className="text-slate-200 font-medium mb-2 block">Número de Estudiante</Label>
              <Input id="student_number" value={formData.student_number || ''} onChange={(e) => setFormData(prev => ({ ...prev, student_number: e.target.value }))} className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20" required />
            </div>
            <div>
              <Label htmlFor="email" className="text-slate-200 font-medium mb-2 block">Email</Label>
              <Input id="email" type="email" value={formData.email || ''} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20" required />
            </div>
            <div>
              <Label htmlFor="phone" className="text-slate-200 font-medium mb-2 block">Teléfono</Label>
              <Input id="phone" value={formData.phone || ''} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20" />
            </div>
            <div>
              <Label htmlFor="address" className="text-slate-200 font-medium mb-2 block">Dirección</Label>
              <Input id="address" value={formData.address || ''} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20" required />
            </div>
            <div>
              <Label htmlFor="birth_date" className="text-slate-200 font-medium mb-2 block">Fecha de Nacimiento</Label>
              <Input id="birth_date" type="date" value={formData.birth_date || ''} onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))} className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20" required />
            </div>
            <div>
              <Label htmlFor="course_id" className="text-slate-200 font-medium mb-2 block">Curso</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, course_id: value === 'none' ? null : value }))} value={formData.course_id ? String(formData.course_id) : 'none'}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white focus:border-blue-400 focus:ring-blue-400/20">
                  <SelectValue placeholder="Selecciona un curso">
                    {formData.course_id ? 
                      courses.find(c => String(c.id) === String(formData.course_id))?.name || 'Curso seleccionado'
                      : 'Sin curso asignado'
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="none" className="text-white hover:bg-slate-700 focus:bg-slate-700">Sin curso asignado</SelectItem>
                  {courses.map(c => (
                    <SelectItem key={c.id} value={String(c.id)} className="text-white hover:bg-slate-700 focus:bg-slate-700">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="schedule_info" className="text-slate-200 font-medium mb-2 block">Horario (Informativo)</Label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    console.log('🚀 DROPDOWN BUTTON CLICKED, schedules:', schedules.length);
                    setScheduleDropdownOpen(!scheduleDropdownOpen);
                  }}
                  className="w-full bg-slate-700/50 border border-slate-600 text-white focus:border-blue-400 focus:ring-blue-400/20 rounded-md px-3 py-2 text-left flex items-center justify-between hover:bg-slate-700/70"
                >
                  <span className="flex-1 text-left">
                    {formData.schedule_info ? 
                      (() => {
                        const selectedSchedule = schedules.find(s => String(s.id) === String(formData.schedule_info));
                        return selectedSchedule ? formatScheduleLabel(selectedSchedule) : 'Horario seleccionado';
                      })()
                      : 'Sin horario asignado'
                    }
                  </span>
                  <svg className="w-4 h-4 ml-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {scheduleDropdownOpen && (
                  <div 
                    className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-60 overflow-y-auto z-[9999]"
                    style={{ zIndex: 9999 }}
                    onMouseDown={(e) => {
                      // Prevenir que clics en la scrollbar cierren el dropdown
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      // Prevenir que clics en el contenedor cierren el dropdown
                      e.stopPropagation();
                    }}
                  >
                    <div 
                      className="px-3 py-2 text-slate-400 hover:bg-slate-700 cursor-pointer border-b border-slate-600 select-none"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🔥 CLICKED NULL SCHEDULE');
                        setFormData(prev => ({ ...prev, schedule_info: null }));
                        setScheduleDropdownOpen(false);
                      }}
                    >
                      Sin horario asignado
                    </div>
                    {schedules.map(s => {
                      console.log('🔍 SCHEDULE DATA:', {
                        id: s.id,
                        classroom: s.classroom,
                        instructor: s.instructor,
                        courses: s.courses,
                        day_of_week: s.day_of_week,
                        start_time: s.start_time,
                        end_time: s.end_time
                      });
                      const labelText = formatScheduleLabel(s);
                      console.log('🎯 DROPDOWN ITEM:', labelText);
                      return (
                        <div
                          key={`${s.id}-${s.classroom || 'no-group'}`}
                          className="px-3 py-2 text-white hover:bg-slate-700 cursor-pointer whitespace-nowrap select-none"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🔥 CLICKED SCHEDULE:', labelText, 'ID:', s.id);
                            console.log('📝 BEFORE UPDATE - formData.schedule_info:', formData.schedule_info);
                            setFormData(prev => {
                              const newData = { ...prev, schedule_info: s.id };
                              console.log('📝 AFTER UPDATE - newData.schedule_info:', newData.schedule_info);
                              return newData;
                            });
                            setScheduleDropdownOpen(false);
                            console.log('✅ DROPDOWN CLOSED');
                          }}
                          title={labelText}
                        >
                          {labelText}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="emergency_contact_name" className="text-slate-200 font-medium mb-2 block">Contacto de Emergencia</Label>
              <Input id="emergency_contact_name" value={formData.emergency_contact_name || ''} onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_name: e.target.value }))} className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20" />
            </div>
            <div>
              <Label htmlFor="emergency_contact_phone" className="text-slate-200 font-medium mb-2 block">Teléfono de Emergencia</Label>
              <Input id="emergency_contact_phone" value={formData.emergency_contact_phone || ''} onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))} className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20" />
            </div>
            <div>
              <Label htmlFor="notes" className="text-slate-200 font-medium mb-2 block">Notas</Label>
              <Input id="notes" value={formData.notes || ''} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20" placeholder="Notas adicionales sobre el estudiante" />
            </div>

          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary" className="bg-slate-600 hover:bg-slate-500 text-white border-slate-500">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white flex-1" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {student ? 'Actualizar' : 'Registrar'} Estudiante
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const StatusManagementDialog = ({ open, setOpen, student, refreshData }) => {
  const [status, setStatus] = useState(student?.status || 'active');
  const [notes, setNotes] = useState(student?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (student) {
      setStatus(student.status);
      setNotes(student.notes || '');
    }
  }, [student]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const dataToUpdate = {
        status: status,
        notes: notes
      };



      const { error } = await supabase
        .from('students')
        .update(dataToUpdate)
        .eq('id', student.id);

      if (error) {
        console.warn('Error en operación de estudiante:', error);
        toast({
          variant: 'destructive',
          title: 'Error en operación',
          description: error.message || 'No se pudo completar la operación'
        });
        setIsSubmitting(false);
        return;
      }

      toast({
        title: "Estatus actualizado",
        description: `El estatus de ${student.first_name} ${student.last_name} ha sido actualizado.`,
      });
      refreshData();
      setOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al actualizar estatus",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass-effect border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="gradient-text">Gestionar Estatus de {student?.first_name} {student?.last_name}</DialogTitle>
          <DialogDescription className="text-white/60">
            Actualiza el estado del estudiante. Esto afectará su conteo en la población activa.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="status" className="text-white/80">Nuevo Estatus</Label>
            <Select onValueChange={setStatus} value={status}>
              <SelectTrigger className="input-field"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="temporary_leave">Baja Temporal</SelectItem>
                <SelectItem value="definitive_leave">Baja Definitiva</SelectItem>
                <SelectItem value="graduated">Graduado</SelectItem>
                <SelectItem value="inactive">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="notes" className="text-white/80">Notas / Motivo del cambio</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field" placeholder="Ej: Baja por motivos personales..." />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary" className="btn-secondary">Cancelar</Button></DialogClose>
            <Button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Actualizar Estatus
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const StudentsSection = ({ students, courses, schedules, refreshData }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const filteredStudents = useMemo(() => {
    return students
      .filter(student => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'inactive') return student.status === 'temporary_leave' || student.status === 'definitive_leave' || student.status === 'graduated' || student.status === 'inactive';
        return student.status === statusFilter;
      })
      .filter(student =>
        (student.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (student.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (student.student_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (student.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
  }, [students, searchTerm, statusFilter]);

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
  };

  const handleStatusManagement = (student) => {
    setSelectedStudent(student);
    setIsStatusDialogOpen(true);
  };

  // Función para eliminar estudiante completamente (solo admin)
  const handleDeleteStudent = async (student) => {
    // Verificar que solo el admin pueda eliminar
    if (user?.email !== 'forzzaserrano@gmail.com') {
      toast({
        title: "Acceso Denegado",
        description: "Solo el administrador puede eliminar estudiantes permanentemente.",
        variant: "destructive"
      });
      return;
    }

    // Confirmación doble para evitar eliminaciones accidentales
    const confirmFirst = window.confirm(
      `¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE al estudiante ${student.first_name} ${student.last_name}?\n\nEsta acción NO se puede deshacer.`
    );
    
    if (!confirmFirst) return;

    const confirmSecond = window.confirm(
      `CONFIRMACIÓN FINAL:\n\nSe eliminará PERMANENTEMENTE:\n- Estudiante: ${student.first_name} ${student.last_name}\n- Número: ${student.student_number}\n- Email: ${student.email}\n\n¿Continuar con la eliminación?`
    );
    
    if (!confirmSecond) return;

    try {
      // Eliminar el estudiante de la base de datos
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', student.id);

      if (error) {
        console.error('Error al eliminar estudiante:', error);
        toast({
          title: "Error",
          description: "No se pudo eliminar el estudiante. Puede tener registros asociados.",
          variant: "destructive"
        });
        return;
      }

      // Éxito
      toast({
        title: "Estudiante Eliminado",
        description: `${student.first_name} ${student.last_name} ha sido eliminado permanentemente.`,
        variant: "default"
      });

      // Refrescar la lista
      refreshData();
    } catch (error) {
      console.error('Error al eliminar estudiante:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado al eliminar el estudiante.",
        variant: "destructive"
      });
    }
  };

  // Verificar si el usuario actual es admin
  const isAdmin = user?.email === 'forzzaserrano@gmail.com';

  const openNewStudentDialog = () => {
    setSelectedStudent(null);
    setIsFormOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return <Badge className="status-paid capitalize"><UserCheck className="w-3 h-3 mr-1" />Activo</Badge>;
      case 'temporary_leave': return <Badge className="status-pending capitalize"><UserX className="w-3 h-3 mr-1" />Baja Temporal</Badge>;
      case 'definitive_leave': return <Badge className="status-overdue capitalize"><UserX className="w-3 h-3 mr-1" />Baja Definitiva</Badge>;
      case 'graduated': return <Badge variant="default" className="bg-blue-500/20 text-blue-300 capitalize"><GraduationCap className="w-3 h-3 mr-1" />Graduado</Badge>;
      case 'inactive': return <Badge variant="secondary" className="bg-gray-500/20 text-gray-300 capitalize"><UserX className="w-3 h-3 mr-1" />Inactivo</Badge>;
      default: return <Badge variant="secondary" className="capitalize">{status}</Badge>;
    }
  };

  const formatScheduleLabel = (schedule) => {
    if (!schedule) return 'No asignado';
    
    const courseName = schedule.courses?.name || 'Curso no encontrado';
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const day = dayNames[schedule.day_of_week] || 'Día no válido';
    const startTime = schedule.start_time || 'Hora no definida';
    const endTime = schedule.end_time || 'Hora no definida';
    
    // Agregar información adicional para diferenciar horarios similares
    let additionalInfo = '';
    if (schedule.classroom) {
      // Como el campo classroom se usa para número de grupo, mostrar como "Grupo"
      additionalInfo += ` (Grupo ${schedule.classroom})`;
    } else if (schedule.instructor) {
      additionalInfo += ` (Prof: ${schedule.instructor})`;
    } else {
      // Si no hay grupo ni instructor, usar los últimos 4 caracteres del ID como identificador
      const groupId = schedule.id ? schedule.id.slice(-4).toUpperCase() : 'XXXX';
      additionalInfo += ` (Grupo ${groupId})`;
    }
    
    return `${courseName} - ${day} ${startTime}-${endTime}${additionalInfo}`;
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold gradient-text mb-2">Gestión de Estudiantes</h1><p className="text-white/70">Administra la información de todos los estudiantes</p></div>
        <Button onClick={openNewStudentDialog} className="btn-primary"><Plus className="w-4 h-4 mr-2" />Nuevo Estudiante</Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-effect border-white/20">
          <CardHeader>
            <div className="flex justify-between items-center flex-wrap gap-4">
              <CardTitle className="text-white flex items-center gap-2"><User className="w-5 h-5" />Lista de Estudiantes ({filteredStudents.length})</CardTitle>
              <div className="flex items-center gap-4">
                <ToggleGroup type="single" value={statusFilter} onValueChange={(value) => value && setStatusFilter(value)} className="bg-white/10 p-1 rounded-lg">
                  <ToggleGroupItem value="active" aria-label="Activos">Activos</ToggleGroupItem>
                  <ToggleGroupItem value="inactive" aria-label="Inactivos">Bajas</ToggleGroupItem>
                  <ToggleGroupItem value="all" aria-label="Todos">Todos</ToggleGroupItem>
                </ToggleGroup>
                <div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" /><Input placeholder="Buscar estudiantes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pl-10 w-64" /></div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow className="border-white/20"><TableHead className="text-white/80">Estudiante</TableHead><TableHead className="text-white/80">Contacto</TableHead><TableHead className="text-white/80">Curso</TableHead><TableHead className="text-white/80">Horario</TableHead><TableHead className="text-white/80">Estado</TableHead><TableHead className="text-white/80">Inscripción</TableHead><TableHead className="text-white/80 text-right">Acciones</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredStudents.map((student, index) => (
                    <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }} className="border-white/10 hover:bg-white/5">
                      <TableCell className="text-white font-medium">
                        <div className="font-semibold">{student.first_name} {student.last_name}</div>
                        <div className="text-sm text-white/60">#{student.student_number}</div>
                      </TableCell>
                      <TableCell className="text-white/80">
                        <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4" />{student.email}</div>
                        <div className="flex items-center gap-2 text-sm mt-1"><Phone className="w-4 h-4" />{student.phone || 'N/A'}</div>
                      </TableCell>
                      <TableCell className="text-white/80">
                        <div className="flex items-center gap-2">
                          <Book className="w-4 h-4" />
                          {student.courses?.name || 'Sin curso'}
                        </div>
                      </TableCell>
                      <TableCell className="text-white/80">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {(() => {
                            // CORREGIDO: Buscar horario usando schedule_id del estudiante
                            const studentSchedule = schedules.find(s => String(s.id) === String(student.schedule_id));
                            return studentSchedule ? formatScheduleLabel(studentSchedule) : 'No asignado';
                          })()}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(student.status)}</TableCell>
                      <TableCell className="text-white/80">{student.enrollment_date ? format(parseISO(student.enrollment_date), 'dd MMM yyyy') : 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(student)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleStatusManagement(student)} className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20"><UserCog className="w-4 h-4" /></Button>
                          {isAdmin && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteStudent(student)} 
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                              title="Eliminar estudiante permanentemente (Solo Admin)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      {isFormOpen && <StudentForm open={isFormOpen} setOpen={setIsFormOpen} student={selectedStudent} courses={courses} schedules={schedules} refreshData={refreshData} />}
      {isStatusDialogOpen && <StatusManagementDialog open={isStatusDialogOpen} setOpen={setIsStatusDialogOpen} student={selectedStudent} refreshData={refreshData} />}
    </div>
  );
};

export default StudentsSection;