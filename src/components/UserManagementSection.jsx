import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Mail, Loader2, Trash2, Shield, ShieldCheck } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useRolePermissions } from '@/hooks/useRolePermissions';

const CreateUserDialog = ({ open, setOpen, refreshUsers }) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('receptionist');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Registrar usuario usando signUp (no requiere permisos admin)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      });

      if (authError) {
        console.warn('Error creando usuario en Auth:', authError);
        toast({
          variant: 'destructive',
          title: 'Error creando usuario',
          description: authError.message || 'No se pudo crear el usuario'
        });
        return;
      }

      // 2. Crear perfil en la tabla profiles usando el ID del usuario creado
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id, // Usar el ID real del usuario creado
          email,
          full_name: fullName,
          role
        });

      if (profileError) {
        console.warn('Error creando perfil:', profileError);
        toast({
          variant: 'destructive',
          title: 'Error creando perfil',
          description: profileError.message || 'No se pudo crear el perfil'
        });
        return;
      }

      toast({
        title: 'Usuario creado exitosamente',
        description: `${fullName} puede ahora ingresar con email: ${email}`,
      });
      refreshUsers();
      setEmail('');
      setFullName('');
      setPassword('');
      setRole('receptionist');
      setOpen(false);
    } catch (error) {
      console.warn('Error en operación de usuario:', error);
      toast({
        variant: 'destructive',
        title: 'Error inesperado',
        description: 'Ocurrió un error inesperado',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-slate-800/95 backdrop-blur-md border-slate-600/30 text-white shadow-2xl max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-semibold flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Crear Usuario
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Crea un nuevo usuario que podrá acceder inmediatamente al sistema.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName" className="text-slate-200 font-medium mb-2 block">
              Nombre Completo
            </Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
              required
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-slate-200 font-medium mb-2 block">
              Email del Usuario
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
              required
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-slate-200 font-medium mb-2 block">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña para el usuario"
              className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="text-slate-200 font-medium mb-2 block">Rol</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white focus:border-blue-400 focus:ring-blue-400/20">
                <SelectValue placeholder="Seleccionar rol">
                  {role === 'admin' ? 'Administrador' : role === 'receptionist' ? 'Recepcionista' : 'Seleccionar rol'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="admin" className="text-white hover:bg-slate-700 focus:bg-slate-700">Administrador</SelectItem>
                <SelectItem value="receptionist" className="text-white hover:bg-slate-700 focus:bg-slate-700">Recepcionista</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary" className="bg-slate-600 hover:bg-slate-500 text-white border-slate-500">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white flex-1" disabled={isSubmitting || !email || !fullName || !password}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando usuario...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Crear Usuario
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const DeleteUserDialog = ({ open, setOpen, user, refreshUsers }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      // Eliminar usuario directamente de la tabla profiles
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (error) {
        console.warn('Error en operación de usuario:', error);
        toast({
          variant: 'destructive',
          title: 'Error en operación',
          description: error.message || 'No se pudo completar la operación',
        });
        return;
      }

      toast({
        title: 'Usuario eliminado',
        description: `El usuario ${user.email} ha sido eliminado del sistema.`,
      });
      refreshUsers();
      setOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al eliminar el usuario',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="glass-effect border-white/20 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="gradient-text">¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription className="text-white/60">
            Esta acción es irreversible. El usuario{' '}
            <span className="font-bold text-white">{user?.email}</span> será eliminado
            permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="secondary" className="btn-secondary">
              Cancelar
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleDelete} className="btn-danger" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Sí, eliminar usuario
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const UserManagementSection = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const { user: currentUser } = useAuth();
  const { canDeleteUsers, canInviteUsers, isAdmin } = useRolePermissions();
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Obtener usuarios directamente de la tabla profiles
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error en operación de usuario:', error);
        toast({
          variant: 'destructive',
          title: 'Error en operación',
          description: error.message || 'No se pudo completar la operación',
        });
        return;
      }

      // Usar directamente los datos de profiles - ya contienen toda la información necesaria
      setUsers(profilesData || []);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error al cargar usuarios',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Gestión de Usuarios</h1>
          <p className="text-white/70">Invita y administra a los usuarios del sistema.</p>
        </div>
        {canInviteUsers && (
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Crear Usuario
          </Button>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="glass-effect border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Lista de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/20">
                      <TableHead className="text-white/80">Nombre</TableHead>
                      <TableHead className="text-white/80">Email</TableHead>
                      <TableHead className="text-white/80">Rol</TableHead>
                      <TableHead className="text-white/80 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-white/10 hover:bg-white/5"
                      >
                        <TableCell className="text-white font-medium">
                          {user.full_name || user.user_metadata?.full_name || 'No asignado'}
                        </TableCell>
                        <TableCell className="text-white/80">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell className="text-white/80">
                          <div className="flex items-center gap-2">
                            {user.role === 'admin' ? (
                              <>
                                <ShieldCheck className="w-4 h-4 text-yellow-400" />
                                Administrador
                              </>
                            ) : (
                              <>
                                <Shield className="w-4 h-4 text-blue-400" />
                                Recepcionista
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {canDeleteUsers && user.id !== currentUser?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(user)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                          {user.id === currentUser?.id && (
                            <span className="text-xs text-white/40">Usuario actual</span>
                          )}
                          {!canDeleteUsers && user.id !== currentUser?.id && (
                            <span className="text-xs text-white/40">Sin permisos</span>
                          )}
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      <CreateUserDialog
        open={createDialogOpen}
        setOpen={setCreateDialogOpen}
        refreshUsers={fetchUsers}
      />
      {userToDelete && (
        <DeleteUserDialog
          open={deleteDialogOpen}
          setOpen={setDeleteDialogOpen}
          user={userToDelete}
          refreshUsers={fetchUsers}
        />
      )}
    </div>
  );
};

export default UserManagementSection;