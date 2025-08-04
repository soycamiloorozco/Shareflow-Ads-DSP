import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, ArrowRight, Loader2, Info } from 'lucide-react';
// import GoogleButton from 'react-google-button';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/Button';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  remember: z.boolean().optional()
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const [searchParams] = useSearchParams();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const urlError = searchParams.get('error');
  const isVerified = searchParams.get('verified') === 'true';
  
  const errorMessage = urlError === 'invalid_token' 
    ? 'Tu sesión ha expirado o el token es inválido. Por favor, inicia sesión nuevamente.'
    : null;

  const successMessage = isVerified
    ? '¡Tu cuenta ha sido verificada exitosamente! Ya puedes iniciar sesión.'
    : null;

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log('LoginPage: Attempting login with:', { email: data.email, remember: data.remember });
      const response = await login(data.email, data.password, data.remember);
      console.log('LoginPage: Login successful:', response);
    } catch (error) {
      console.error('LoginPage: Login failed:', error);
      // El error ya se maneja en el hook useAuth y se muestra en la UI a través del estado error
    }
  };

  const useDemoCredentials = () => {
    setValue('email', 'demo@shareflow.me');
    setValue('password', 'ShareFlow2024!');
    setValue('remember', true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="text-center mb-8">
            {errorMessage && (
              <div className="p-4 bg-error-50 border border-error-200 rounded-lg flex items-start gap-3 mb-4">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-error-800">{errorMessage}</p>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="p-4 bg-success-50 border border-success-200 rounded-lg flex items-start gap-3 mb-4">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-success-800">{successMessage}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-error-50 border border-error-200 rounded-lg flex items-start gap-3 mb-4">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-error-800">{error}</p>
                </div>
              </div>
            )}

            <h1 className="text-2xl font-bold mb-2">Bienvenido de nuevo</h1>
            <p className="text-neutral-600">
              Inicia sesión para continuar con tu experiencia
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  {...register('email')}
                  className={`
                    w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2
                    ${errors.email
                      ? 'border-error-300 focus:ring-error-200'
                      : 'border-neutral-300 focus:ring-primary/20'
                    }
                  `}
                  placeholder="tu@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="password"
                  {...register('password')}
                  className={`
                    w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2
                    ${errors.password
                      ? 'border-error-300 focus:ring-error-200'
                      : 'border-neutral-300 focus:ring-primary/20'
                    }
                  `}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('remember')}
                  className="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-neutral-600">Recordar sesión</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
        

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isLoading}
              icon={isLoading ? Loader2 : ArrowRight}
              className={isLoading ? 'animate-pulse' : ''}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-neutral-500">
                  O continúa con
                </span>
              </div>
            </div>

            {/* <div className="flex justify-center">
              <GoogleButton
                onClick={handleGoogleLogin}
                disabled={isLoading}
              />
            </div> */}

            <p className="text-center text-sm text-neutral-600">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}