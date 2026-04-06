
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Email no válido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
});

type FormData = z.infer<typeof formSchema>;

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin, loading, isAdmin, currentUser } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirecionar se já estiver logado como administrador
  useEffect(() => {
    if (currentUser && isAdmin) {
      console.log("Admin already logged in, redirecting to admin dashboard");
      navigate('/admin', { replace: true });
    }
  }, [currentUser, isAdmin, navigate]);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      console.log("Attempting admin login with:", data.email);
      
      // Call the adminLogin function
      await adminLogin(data.email, data.password);
      
      // If we reach this line, it means the login was successful
      toast.success('Sesión iniciada correctamente');
      navigate('/admin', { replace: true });
    } catch (error: any) {
      console.error("Admin login error:", error);
      toast.error(error.message || 'Credenciales incorrectas. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Área de Administración</h1>
          <p className="mt-2 text-slate-300">
            Accede al panel de control de tu restaurante
          </p>
        </div>
        
        <div className="bg-white p-8 shadow-xl rounded-lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de acceso</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@mirestaurante.es"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="******" 
                          {...field} 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-2">
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" size="lg" disabled={loading || isSubmitting}>
                  {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </Button>
              </div>
            </form>
          </Form>
          
          <div className="mt-8 border-t pt-6">
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-500">
                ¿Aún no tienes cuenta?{' '}
                <Link to="/blog" className="font-medium text-blue-600 hover:underline">
                  Ver planes
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
