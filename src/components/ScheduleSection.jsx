import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from '@/components/ui/select';
import { Plus, Edit, Trash2, Loader2, Clock, Users, Printer, Calendar } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { generateAttendanceListPdf } from '@/lib/pdfGenerator';
import { format, parseISO } from 'date-fns';

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const ScheduleDialog = ({ isOpen, setIsOpen, schedule, courses, onSave, loading }) => {
  const [formData, setFormData] = useState({ course_id: '', day_of_week: '', start_time: '', end_time: '', classroom: '', start_date: '' });

  React.useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (schedule) {
      setFormData({
        course_id: schedule.course_id || '',
        day_of_week: schedule.day_of_week || '',
        start_time: schedule.start_time || '',
        end_time: schedule.end_time || '',
        classroom: schedule.classroom || ''
      });
    } else {
      setFormData({ course_id: '', day_of_week: '', start_time: '', end_time: '', classroom: '' });
    }
  }, [schedule]);

  const handleChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...schedule, ...formData });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-slate-900/95 backdrop-blur-md border-2 border-purple-500/50 shadow-2xl max-w-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-white">{schedule ? 'Editar Horario' : 'Nuevo Horario'}</DialogTitle>
          <DialogDescription className="text-white/70 text-base">
            {schedule ? 'Actualiza la información del horario.' : 'Añade una nueva clase al horario.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="course_id" className="text-white/80">Curso</Label>
            <Select value={formData.course_id} onValueChange={(value) => handleChange('course_id', value)}>
              <SelectTrigger className="input-field"><SelectValue placeholder="Selecciona un curso" /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {courses.map(course => <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="day_of_week" className="text-white/80">Día de la semana</Label>
              <Select value={formData.day_of_week} onValueChange={(value) => handleChange('day_of_week', value)}>
                <SelectTrigger className="input-field"><SelectValue placeholder="Selecciona un día" /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {daysOfWeek.map((day, index) => <SelectItem key={index} value={index.toString()}>{day}</SelectItem>)}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_time" className="text-white/80">Hora de inicio</Label>
              <Input id="start_time" type="time" value={formData.start_time} onChange={(e) => handleChange('start_time', e.target.value)} required className="input-field" />
            </div>
            <div>
              <Label htmlFor="end_time" className="text-white/80">Hora de fin</Label>
              <Input id="end_time" type="time" value={formData.end_time} onChange={(e) => handleChange('end_time', e.target.value)} required className="input-field" />
            </div>
          </div>
          <div>
            <Label htmlFor="classroom" className="text-white/80">Grupo #</Label>
            <Input id="classroom" value={formData.classroom} onChange={(e) => handleChange('classroom', e.target.value)} className="input-field" />
          </div>
          <DialogFooter className="pt-6 gap-3">
            <DialogClose asChild>
              <Button type="button" className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 hover:border-slate-500">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {schedule ? 'Actualizar' : 'Crear Horario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const AttendanceListDialog = ({ isOpen, setIsOpen, schedule, schoolSettings }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    React.useEffect(() => {
        const fetchStudents = async () => {
            if (!schedule || !isOpen) return;
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('students')
                    .select('*')
                    .eq('course_id', schedule.course_id)
                    .eq('status', 'active');
                if (error) {
                  console.warn('Error en operación de horario:', error);
                  toast({
                    variant: 'destructive',
                    title: 'Error en operación',
                    description: error.message || 'No se pudo completar la operación'
                  });
                  setIsSubmitting(false);
                  return;
                }
                setStudents(data);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los estudiantes.' });
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [schedule, isOpen, toast]);

    const handlePrint = async () => {
        await generateAttendanceListPdf(schedule, students, schoolSettings);
        toast({ title: "PDF Generado", description: "La lista de asistencia se ha descargado." });
    };

    const scheduleTitle = `${schedule?.courses?.name} (${daysOfWeek[schedule?.day_of_week]} ${schedule?.start_time.slice(0, 5)}-${schedule?.end_time.slice(0, 5)})`;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="bg-slate-800/95 backdrop-blur-md border-slate-600/30 text-white shadow-2xl sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-white text-xl font-semibold">Alumnos Inscritos</DialogTitle>
                    <DialogDescription className="text-white/60">{scheduleTitle}</DialogDescription>
                </DialogHeader>
                {loading ? (
                    <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-purple-400" /></div>
                ) : (
                    <div className="max-h-[60vh] overflow-y-auto pr-2">
                        {students.length > 0 ? (
                            <div className="bg-slate-900/50 rounded-lg p-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-600">
                                            <TableHead className="text-slate-200 font-semibold">Nombre del Estudiante</TableHead>
                                            <TableHead className="text-slate-200 font-semibold">Email</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map(student => (
                                            <TableRow key={student.id} className="border-slate-700 hover:bg-slate-800/50">
                                                 <TableCell className="font-medium text-slate-100">{`${student.first_name} ${student.last_name}`}</TableCell>
                                                 <TableCell className="text-slate-300">{student.email}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <p className="text-center text-white/60 py-8">No hay estudiantes activos asignados a este horario.</p>
                        )}
                    </div>
                )}
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cerrar</Button></DialogClose>
                    <Button onClick={handlePrint} className="btn-primary" disabled={students.length === 0 || loading}>
                        <Printer className="w-4 h-4 mr-2" /> Imprimir Lista
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


const ScheduleSection = ({ schedules, courses, refreshData, schoolSettings }) => {
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async (scheduleData) => {
    setActionLoading(true);
    const dataToSave = { ...scheduleData, day_of_week: parseInt(scheduleData.day_of_week, 10) };
    delete dataToSave.courses;

    try {
      let error;
      if (dataToSave.id) {
        ({ error } = await supabase.from('schedules').update(dataToSave).eq('id', dataToSave.id));
      } else {
        ({ error } = await supabase.from('schedules').insert(dataToSave));
      }
      if (error) throw error;
      toast({ title: 'Éxito', description: `Horario ${dataToSave.id ? 'actualizado' : 'creado'} correctamente.` });
      setDialogOpen(false);
      refreshData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: `No se pudo guardar el horario. ${error.message}` });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este horario?')) {
      try {
        const { error } = await supabase.from('schedules').delete().eq('id', id);
        if (error) throw error;
        toast({ title: 'Éxito', description: 'Horario eliminado correctamente.' });
        refreshData();
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: `No se pudo eliminar el horario. ${error.message}` });
      }
    }
  };
  
  const openNewDialog = () => {
    setSelectedSchedule(null);
    setDialogOpen(true);
  };

  const openEditDialog = (schedule) => {
    setSelectedSchedule(schedule);
    setDialogOpen(true);
  };
  
  const openAttendanceDialog = (schedule) => {
      setSelectedSchedule(schedule);
      setAttendanceDialogOpen(true);
  };

  const schedulesByDay = daysOfWeek.map((day, index) => ({
    day,
    schedules: schedules.filter(s => s.day_of_week === index).sort((a, b) => a.start_time.localeCompare(b.start_time))
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Gestión de Horarios</h1>
          <p className="text-white/70">Organiza los horarios de clases y actividades de la semana.</p>
        </div>
        <Button onClick={openNewDialog} className="btn-primary" disabled={courses.length === 0}>
          <Plus className="w-4 h-4 mr-2" /> Nuevo Horario
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-purple-400" /></div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-white/20 rounded-lg">
          <h2 className="text-xl font-semibold text-white">No hay cursos creados</h2>
          <p className="text-white/60 mt-2">Debes crear al menos un curso para poder asignar horarios.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {schedulesByDay.map(({ day, schedules: daySchedules }) => (
            <motion.div key={day} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-effect border-white/20 h-full">
                <CardHeader>
                  <CardTitle className="text-white text-center text-xl">{day}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {daySchedules.length > 0 ? daySchedules.map(schedule => (
                    <div key={schedule.id} className="bg-white/10 p-3 rounded-lg card-hover-sm">
                      <p className="font-bold text-purple-300">{schedule.courses?.name || 'Curso no encontrado'}</p>
                      {schedule.start_date && (
                        <p className="text-sm text-white/80 flex items-center gap-2"><Calendar className="w-4 h-4" /> Inicio: {format(parseISO(schedule.start_date), 'dd MMM yyyy')}</p>
                      )}
                      <p className="text-sm text-white/80 flex items-center gap-2"><Clock className="w-4 h-4" /> {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}</p>
                      <p className="text-sm text-white/60">Grupo #{schedule.classroom || 'N/A'}</p>
                      {schedule.created_at && (
                        <p className="text-xs text-white/50 mt-1">Creado: {format(parseISO(schedule.created_at), 'dd/MM/yyyy HH:mm')}</p>
                      )}
                      <div className="flex justify-end gap-2 mt-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-green-400 hover:text-green-300" onClick={() => openAttendanceDialog(schedule)}><Users className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-white/70 hover:text-white" onClick={() => openEditDialog(schedule)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={() => handleDelete(schedule.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-white/50 py-4">Sin clases programadas</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <ScheduleDialog
        isOpen={dialogOpen}
        setIsOpen={setDialogOpen}
        schedule={selectedSchedule}
        courses={courses}
        onSave={handleSave}
        loading={actionLoading}
      />
      
      <AttendanceListDialog
        isOpen={attendanceDialogOpen}
        setIsOpen={setAttendanceDialogOpen}
        schedule={selectedSchedule}
        schoolSettings={schoolSettings}
      />
    </div>
  );
};

export default ScheduleSection;