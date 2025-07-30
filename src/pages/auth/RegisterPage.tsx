import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, ArrowRight, Loader2, Check, X, Phone } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/Button';

const passwordSchema = z.string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[a-z]/, 'Debe contener al menos una minúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número')
  .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial');

const whatsappSchema = z.string()
  .regex(/^\+?[0-9]{10,15}$/, 'Número de WhatsApp inválido');

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  whatsapp: z.string().min(2, 'El nummero debe tener al menos 2 caracteres'),
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface PasswordRequirement {
  regex: RegExp;
  message: string;
}

const passwordRequirements: PasswordRequirement[] = [
  { regex: /.{8,}/, message: 'Al menos 8 caracteres' },
  { regex: /[A-Z]/, message: 'Una mayúscula' },
  { regex: /[a-z]/, message: 'Una minúscula' },
  { regex: /[0-9]/, message: 'Un número' },
  { regex: /[^A-Za-z0-9]/, message: 'Un carácter especial' }
];

export function RegisterPage() {
  const { register: registerUser, isLoading, error } = useAuth();
  const [password, setPassword] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    await registerUser(data.name, data.email, data.password, data.whatsapp);
  };


  const getPasswordStrength = (password: string) => {
    const meetsRequirements = passwordRequirements.filter(
      req => req.regex.test(password)
    ).length;
    return (meetsRequirements / passwordRequirements.length) * 100;
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
            <h1 className="text-2xl font-bold mb-2">Crear cuenta</h1>
            <p className="text-neutral-600">
              Únete a la red de publicidad digital más grande de Colombia
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  {...register('name')}
                  className={`
                    w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2
                    ${errors.name
                      ? 'border-error-300 focus:ring-error-200'
                      : 'border-neutral-300 focus:ring-primary/20'
                    }
                  `}
                  placeholder="Juan Pérez"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>
              )}
            </div>

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

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                WhatsApp <span className="text-error-600">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="tel"
                  {...register('whatsapp')}
                  className={`
                    w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2
                    ${errors.whatsapp
                      ? 'border-error-300 focus:ring-error-200'
                      : 'border-neutral-300 focus:ring-primary/20'
                    }
                  `}
                  placeholder="+573001234567"
                />
              </div>
              {errors.whatsapp && (
                <p className="mt-1 text-sm text-error-600">{errors.whatsapp.message}</p>
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
                  onChange={(e) => setPassword(e.target.value)}
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

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${getPasswordStrength(password)}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {passwordRequirements.map((req, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        {req.regex.test(password) ? (
                          <Check className="w-4 h-4 text-success-500" />
                        ) : (
                          <X className="w-4 h-4 text-neutral-300" />
                        )}
                        <span className={req.regex.test(password)
                          ? 'text-success-600'
                          : 'text-neutral-600'
                        }>
                          {req.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="password"
                  {...register('confirmPassword')}
                  className={`
                    w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2
                    ${errors.confirmPassword
                      ? 'border-error-300 focus:ring-error-200'
                      : 'border-neutral-300 focus:ring-primary/20'
                    }
                  `}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-error-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {error && (
              <div className="p-4 bg-error-50 text-error-600 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isLoading}
              icon={isLoading ? Loader2 : ArrowRight}
              className={isLoading ? 'animate-pulse' : ''}
            >
              {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
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


            <p className="text-center text-sm text-neutral-600">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Inicia sesión
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}