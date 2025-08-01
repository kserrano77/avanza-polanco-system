import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Loader2, BookOpen } from 'lucide-react';

const CourseCard = ({ course, onEdit, onDelete }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="card-hover"
  >
    <Card className="glass-effect border-white/20 h-full flex flex-col">
      <CardHeader>
        <CardTitle className="gradient-text text-xl flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-purple-400" />
          {course.name}
        </CardTitle>
        <CardDescription className="text-white/60">Curso disponible</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-white/80">{course.description || 'Sin descripción.'}</p>
      </CardContent>
      <div className="p-6 pt-0 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(course)} className="btn-secondary">
          <Edit className="w-4 h-4 mr-2" /> Editar
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(course.id)}>
          <Trash2 className="w-4 h-4 mr-2" /> Eliminar
        </Button>
      </div>
    </Card>
  </motion.div>
);

const CourseDialog = ({ isOpen, setIsOpen, course, onSave, loading }) => {
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    if (course) {
      setFormData({ name: course.name, description: course.description || '' });
    } else {
      setFormData({ name: '', description: '' });
    }
  }, [course]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...course, ...formData });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="glass-effect border-purple-500">
        <DialogHeader>
          <DialogTitle className="gradient-text">{course ? 'Editar Curso' : 'Nuevo Curso'}</DialogTitle>
          <DialogDescription className="text-white/60">
            {course ? 'Actualiza la información del curso.' : 'Añade un nuevo curso a tu escuela.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white/80">Nombre del Curso</Label>
            <Input id="name" value={formData.name} onChange={handleChange} required className="input-glass" />
          </div>

          <div>
            <Label htmlFor="description" className="text-white/80">Descripción</Label>
            <Textarea id="description" value={formData.description} onChange={handleChange} className="input-glass" />
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button type="submit" className="btn-primary" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const CoursesSection = ({ refreshData }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('courses').select('*').order('name');
      if (error) throw error;
      setCourses(data);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los cursos.' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleSave = async (courseData) => {
    setActionLoading(true);
    try {
      let error;
      if (courseData.id) {
        ({ error } = await supabase.from('courses').update(courseData).eq('id', courseData.id));
      } else {
        ({ error } = await supabase.from('courses').insert(courseData));
      }
      if (error) throw error;
      toast({ title: 'Éxito', description: `Curso ${courseData.id ? 'actualizado' : 'creado'} correctamente.` });
      setDialogOpen(false);
      fetchCourses();
      if (refreshData) refreshData(); // Refresh global data
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: `No se pudo guardar el curso. ${error.message}` });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este curso? Esta acción no se puede deshacer.')) {
      try {
        const { error } = await supabase.from('courses').delete().eq('id', id);
        if (error) throw error;
        toast({ title: 'Éxito', description: 'Curso eliminado correctamente.' });
        fetchCourses();
        if (refreshData) refreshData(); // Refresh global data
      } catch (error) {
        console.warn('Error al eliminar curso:', error);
        
        // Manejo específico para error de foreign key constraint
        if (error.code === '23503' && error.message.includes('students_course_id_fkey')) {
          toast({ 
            variant: 'destructive', 
            title: 'No se puede eliminar el curso', 
            description: 'Este curso tiene estudiantes asignados. Para eliminarlo, primero debes reasignar o dar de baja a todos los estudiantes de este curso.' 
          });
        } else {
          // Error genérico para otros tipos de errores
          toast({ 
            variant: 'destructive', 
            title: 'Error al eliminar curso', 
            description: error.message || 'Ocurrió un error inesperado al intentar eliminar el curso.' 
          });
        }
      }
    }
  };

  const openNewDialog = () => {
    setSelectedCourse(null);
    setDialogOpen(true);
  };

  const openEditDialog = (course) => {
    setSelectedCourse(course);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Gestión de Cursos</h1>
          <p className="text-white/70">Administra los cursos y materias disponibles en tu escuela.</p>
        </div>
        <Button onClick={openNewDialog} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Curso
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <CourseCard key={course.id} course={course} onEdit={openEditDialog} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-white/20 rounded-lg">
          <h2 className="text-xl font-semibold text-white">No hay cursos todavía</h2>
          <p className="text-white/60 mt-2">¡Crea tu primer curso para empezar!</p>
        </div>
      )}

      <CourseDialog
        isOpen={dialogOpen}
        setIsOpen={setDialogOpen}
        course={selectedCourse}
        onSave={handleSave}
        loading={actionLoading}
      />
    </div>
  );
};

export default CoursesSection;