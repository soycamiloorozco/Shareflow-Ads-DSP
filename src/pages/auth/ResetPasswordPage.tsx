import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword } from '../../store/slices/authSlice';
import { Button } from '../../components/Button';
import type { AppDispatch, RootState } from '../../store/store';

const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/(?=.*[a-z])/, 'La contraseña debe contener al menos una letra minúscula')
    .regex(/(?=.*[A-Z])/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/(?=.*\d)/, 'La contraseña debe contener al menos un número'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  
  const token = searchParams.get('token');
  
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema)
  });

  useEffect(() => {
    if (!token) {
      setTokenError('Token de restablecimiento no válido o faltante');
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setTokenError('Token de restablecimiento no válido');
      return;
    }

    try {
      await dispatch(resetPassword({
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      })).unwrap();
      setIsSuccess(true);
    } catch (error) {
      console.error('Reset password failed:', error);
      // El error ya se maneja en el slice y se muestra en la UI
    }
  };

  if (tokenError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold mb-4">Enlace inválido</h1>
            <p className="text-neutral-600 mb-6">
              {tokenError}. El enlace puede haber expirado o ser inválido.
            </p>
            
            <div className="space-y-3">
              <Link
                to="/forgot-password"
                className="inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-full focus-ring w-full bg-[#ABFAA9] text-[#0B0B16] hover:bg-[#9AE998] active:bg-[#9AE998]/90 text-lg h-12 px-8 gap-4"
              >
                <span className="truncate">Solicitar nuevo enlace</span>
              </Link>
              
              <Link
                to="/login"
                className="inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-full focus-ring w-full text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200 text-lg h-12 px-8 gap-4"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="truncate">Volver al inicio de sesión</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isSuccess) {
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
            
            <h1 className="text-2xl font-bold mb-4">¡Contraseña restablecida!</h1>
            <p className="text-neutral-600 mb-6">
              Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            
            <Link
              to="/login"
              className="inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-full focus-ring w-full bg-[#ABFAA9] text-[#0B0B16] hover:bg-[#9AE998] active:bg-[#9AE998]/90 text-lg h-12 px-8 gap-4"
            >
              <span className="truncate">Iniciar sesión</span>
            </Link>
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
            <h1 className="text-2xl font-bold mb-2">Restablecer contraseña</h1>
            <p className="text-neutral-600">
              Ingresa tu nueva contraseña para completar el restablecimiento
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
                Nueva contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('newPassword')}
                  className={`
                    w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2
                    ${errors.newPassword
                      ? 'border-error-300 focus:ring-error-200'
                      : 'border-neutral-300 focus:ring-primary/20'
                    }
                  `}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-error-600">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  className={`
                    w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2
                    ${errors.confirmPassword
                      ? 'border-error-300 focus:ring-error-200'
                      : 'border-neutral-300 focus:ring-primary/20'
                    }
                  `}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-error-600">{errors.confirmPassword.message}</p>
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
                {isLoading ? 'Restableciendo...' : 'Restablecer contraseña'}
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