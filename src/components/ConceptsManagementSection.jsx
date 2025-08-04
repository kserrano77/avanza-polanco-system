import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Settings, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useRolePermissions } from '@/hooks/useRolePermissions';

const ConceptForm = ({ open, setOpen, concept, refreshData }) => {
  const [formData, setFormData] = useState({ name: '', active: true });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (concept) {
      setFormData({ 
        name: concept.name || '', 
        active: concept.active !== undefined ? concept.active : true
      });
    } else {
      setFormData({ name: '', active: true });
    }
  }, [concept, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setTimeout(() => {
        alert('⚠️ Error\n\nEl nombre del concepto es requerido.');
      }, 100);
      return;
    }

    setIsSubmitting(true);
    try {
      if (concept) {
        // Actualizar concepto existente
        const { error } = await supabase
          .from('payment_concepts')
          .update({
            name: formData.name.trim(),
            active: formData.active
          })
          .eq('id', concept.id);
        
        if (error) throw error;
        setTimeout(() => {
          alert('✅ Concepto actualizado\n\nEl concepto se ha actualizado correctamente.');
        }, 100);
      } else {
        // Crear nuevo concepto
        const { error } = await supabase
          .from('payment_concepts')
          .insert([{
            name: formData.name.trim(),
            active: formData.active
          }]);
        
        if (error) throw error;
        setTimeout(() => {
          alert('✅ Concepto creado\n\nEl nuevo concepto se ha creado correctamente.');
        }, 100);
      }

      refreshData();
      setOpen(false);
    } catch (error) {
      if (error.code === '23505') {
        setTimeout(() => {
          alert('❌ Error\n\nYa existe un concepto con ese nombre.');
        }, 100);
      } else {
        setTimeout(() => {
          alert('❌ Error: ' + error.message);
        }, 100);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-slate-800/95 backdrop-blur-md border-slate-600/30 text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="gradient-text text-xl font-semibold">
            {concept ? 'Editar Concepto' : 'Nuevo Concepto de Pago'}
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            {concept ? 'Modifica los detalles del concepto.' : 'Agrega un nuevo concepto de pago al sistema.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-slate-200 font-medium mb-2 block">Nombre del Concepto</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} 
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20" 
              placeholder="Ej: Colegiatura Medicina"
              required 
            />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-700/30 border border-slate-600/30">
            <Label htmlFor="active" className="text-slate-200 font-medium">
              Concepto Activo
            </Label>
            <Switch 
              id="active" 
              checked={formData.active} 
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))} 
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" className="btn-secondary">Cancelar</Button>
            </DialogClose>
            <Button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {concept ? 'Actualizar' : 'Crear Concepto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const ConceptsManagementSection = () => {
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [conceptForm, setConceptForm] = useState({ open: false, concept: null });
  const { toast } = useToast();
  const { user } = useAuth();
  const { canDelete } = useRolePermissions();

  const fetchConcepts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_concepts')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setConcepts(data || []);
    } catch (error) {
      setTimeout(() => {
        alert('❌ Error al cargar conceptos: ' + error.message);
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConcepts();
  }, []);

  const handleEdit = (concept) => {
    setConceptForm({ open: true, concept });
  };

  const handleDelete = async (concept) => {
    if (!canDelete) {
      setTimeout(() => {
        alert('❌ Sin permisos\n\nNo tienes permisos para eliminar conceptos.');
      }, 100);
      return;
    }

    if (!confirm(`¿Estás seguro de que quieres eliminar el concepto "${concept.name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('payment_concepts')
        .delete()
        .eq('id', concept.id);
      
      if (error) throw error;
      setTimeout(() => {
        alert('✅ Concepto eliminado\n\nEl concepto se ha eliminado correctamente.');
      }, 100);
      fetchConcepts();
    } catch (error) {
      setTimeout(() => {
        alert('❌ Error al eliminar: ' + error.message);
      }, 100);
    }
  };

  const toggleActive = async (concept) => {
    try {
      const { error } = await supabase
        .from('payment_concepts')
        .update({ active: !concept.active })
        .eq('id', concept.id);
      
      if (error) throw error;
      setTimeout(() => {
        alert(`✅ ${concept.active ? 'Concepto desactivado' : 'Concepto activado'}\n\nEl concepto "${concept.name}" se ha ${concept.active ? 'desactivado' : 'activado'}.`);
      }, 100);
      fetchConcepts();
    } catch (error) {
      setTimeout(() => {
        alert('❌ Error: ' + error.message);
      }, 100);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex justify-between items-center flex-wrap gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Gestión de Conceptos</h1>
          <p className="text-white/70">Administra los conceptos de pago disponibles en el sistema.</p>
        </div>
        <Button 
          onClick={() => setConceptForm({ open: true, concept: null })} 
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Concepto
        </Button>
      </motion.div>

      <Card className="glass-effect border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Conceptos de Pago
          </CardTitle>
          <CardDescription className="text-white/60">
            Lista de todos los conceptos de pago disponibles. Los conceptos inactivos no aparecerán en los formularios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-600">
                  <TableHead className="text-slate-200">Nombre del Concepto</TableHead>
                  <TableHead className="text-slate-200">Estado</TableHead>
                  <TableHead className="text-slate-200">Fecha de Creación</TableHead>
                  <TableHead className="text-slate-200 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {concepts.map(concept => (
                  <TableRow key={concept.id} className="border-slate-600 hover:bg-slate-700/30">
                    <TableCell className="text-white font-medium">{concept.name}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={concept.active ? "default" : "secondary"} 
                        className={concept.active ? "bg-green-600 hover:bg-green-700" : "bg-slate-600 hover:bg-slate-700"}
                      >
                        {concept.active ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Activo
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactivo
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {new Date(concept.created_at).toLocaleDateString('es-MX')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(concept)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                        >
                          {concept.active ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(concept)}
                          className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(concept)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {concepts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-slate-400 py-8">
                      No hay conceptos registrados. Crea el primer concepto.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConceptForm 
        open={conceptForm.open} 
        setOpen={(open) => setConceptForm({ open, concept: null })} 
        concept={conceptForm.concept} 
        refreshData={fetchConcepts} 
      />
    </div>
  );
};

export default ConceptsManagementSection;
