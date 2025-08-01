import React, { useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogIn, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

const Login = () => {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn(email, password);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error de acceso',
        description: 'Credenciales incorrectas o usuario no autorizado. Solo pueden acceder usuarios creados por el administrador.',
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md bg-white border border-gray-200 shadow-2xl overflow-hidden">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <form onSubmit={handleLogin}>
              <CardHeader className="text-center pb-8">
                {/* Logo de Avanza Polanco */}
                <div className="flex justify-center mb-8">
                  <div className="w-48 h-48 rounded-full overflow-hidden shadow-2xl bg-gray-50 flex items-center justify-center">
                    {/* Logo de Avanza Polanco súper grande */}
                    <img 
                      src="/avanza-polanco-logo.png.png" 
                      alt="Avanza Polanco" 
                      className="w-44 h-44 object-contain"
                      onError={(e) => {
                        // Si no encuentra la imagen, muestra el ícono por defecto
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    {/* Ícono de respaldo si no se encuentra la imagen */}
                    <GraduationCap className="w-24 h-24 text-gray-500" style={{display: 'none'}} />
                  </div>
                </div>
                
                <CardTitle className="text-4xl font-bold mb-2" style={{color: '#4A90E2'}}>
                  Avanza Polanco System
                </CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Sistema de Gestión Escolar
                </CardDescription>
                <p className="text-gray-500 text-sm mt-3">
                  Inicia sesión para continuar
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6 px-8">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-600 font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@avanzapolanco.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all h-12 text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-600 font-medium">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all h-12 text-base"
                  />
                </div>
              </CardContent>
              
              <CardFooter className="px-8 pb-8">
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 font-medium h-12 text-base" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" />
                      Iniciar Sesión
                    </>
                  )}
                </Button>
              </CardFooter>
              
              {/* Mensaje informativo */}
              <div className="px-8 pb-6">
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                  <p className="text-gray-900 text-sm text-center">
                    <span className="font-medium">Acceso restringido:</span> Solo usuarios autorizados por el administrador pueden ingresar al sistema.
                  </p>
                </div>
              </div>
            </form>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;