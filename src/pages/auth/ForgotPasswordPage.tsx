import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword } from '../../store/slices/authSlice';
import { Button } from '../../components/Button';
import type { AppDispatch, RootState } from '../../store/store';

const forgotPasswordSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await dispatch(forgotPassword({ email: data.email })).unwrap();
      setIsSubmitted(true);
    } catch (error) {
      console.error('Forgot password failed:', error);
      // El error ya se maneja en el slice y se muestra en la UI
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-success-600" />
            </div>
            
            <h1 className="text-2xl font-bold mb-4">¡Correo enviado!</h1>
            <p className="text-neutral-600 mb-6">
              Si el correo electrónico existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.
            </p>
            
            <div className="space-y-3">
              <Link
                to="/login"
                className="inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-full focus-ring w-full bg-[#ABFAA9] text-[#0B0B16] hover:bg-[#9AE998] active:bg-[#9AE998]/90 text-lg h-12 px-8 gap-4"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="truncate">Volver al inicio de sesión</span>
              </Link>
              
              <p className="text-sm text-neutral-500">
                ¿No recibiste el correo? Revisa tu bandeja de spam o{' '}
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-primary hover:underline"
                >
                  intenta de nuevo
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">¿Olvidaste tu contraseña?</h1>
            <p className="text-neutral-600">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
            </p>
          </div>

          {error && (
            <div className="p-4 bg-error-50 border border-error-200 rounded-lg flex items-start gap-3 mb-6">
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
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

            <div className="space-y-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={isLoading}
                icon={isLoading ? Loader2 : undefined}
                className={isLoading ? 'animate-pulse' : ''}
              >
                {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </Button>

              <Link
                to="/login"
                className="inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-full focus-ring w-full text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200 text-lg h-12 px-8 gap-4"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="truncate">Volver al inicio de sesión</span>
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
} 