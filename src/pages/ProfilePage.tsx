import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  User, 
  Lock, 
  Camera, 
  Mail, 
  Phone, 
  Save, 
  Eye, 
  EyeOff, 
  Upload,
  X 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';

// Schemas para validación
const profileSchema = z.object({
  username: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  phone: z.string().optional()
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirma la nueva contraseña')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'photo'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form para información del perfil
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isSubmitting: isSubmittingProfile }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      phone: ''
    }
  });

  // Form para cambio de contraseña
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
    reset: resetPasswordForm
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  });

  const onSubmitProfile = async (data: ProfileFormData) => {
    try {
      // Aquí iría la lógica para actualizar el perfil
      console.log('Actualizando perfil:', data);
      // await updateProfile(data);
      alert('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      alert('Error al actualizar el perfil');
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    try {
      // Aquí iría la lógica para cambiar la contraseña
      console.log('Cambiando contraseña');
      // await changePassword(data);
      alert('Contraseña cambiada exitosamente');
      resetPasswordForm();
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      alert('Error al cambiar la contraseña');
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // Crear URL temporal para previsualización
      const photoUrl = URL.createObjectURL(file);
      setProfilePhoto(photoUrl);
      
      // Aquí iría la lógica para subir la imagen al servidor
      // await uploadProfilePhoto(file);
      
      alert('Foto de perfil actualizada exitosamente');
    } catch (error) {
      console.error('Error al subir foto:', error);
      alert('Error al subir la foto de perfil');
    } finally {
      setIsUploading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Información Personal', icon: User },
    { id: 'password', label: 'Cambiar Contraseña', icon: Lock },
    { id: 'photo', label: 'Foto de Perfil', icon: Camera }
  ] as const;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Mi Perfil</h1>
          <p className="text-neutral-600">Gestiona tu información personal y configuración de cuenta</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar con tabs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-white'
                          : 'text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Contenido principal */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              {/* Tab: Información Personal */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-semibold text-neutral-800 mb-6">Información Personal</h2>
                  
                  <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Nombre de usuario
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                          <input
                            type="text"
                            {...registerProfile('username')}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                              profileErrors.username
                                ? 'border-error-300 focus:ring-error-200'
                                : 'border-neutral-300 focus:ring-primary/20'
                            }`}
                            placeholder="Tu nombre de usuario"
                          />
                        </div>
                        {profileErrors.username && (
                          <p className="mt-1 text-sm text-error-600">{profileErrors.username.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Correo electrónico
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                          <input
                            type="email"
                            {...registerProfile('email')}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                              profileErrors.email
                                ? 'border-error-300 focus:ring-error-200'
                                : 'border-neutral-300 focus:ring-primary/20'
                            }`}
                            placeholder="tu@email.com"
                          />
                        </div>
                        {profileErrors.email && (
                          <p className="mt-1 text-sm text-error-600">{profileErrors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Teléfono (opcional)
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                          <input
                            type="tel"
                            {...registerProfile('phone')}
                            className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="+57 300 123 4567"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSubmittingProfile}
                        className="flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {isSubmittingProfile ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tab: Cambiar Contraseña */}
              {activeTab === 'password' && (
                <div>
                  <h2 className="text-xl font-semibold text-neutral-800 mb-6">Cambiar Contraseña</h2>
                  
                  <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Contraseña actual
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          {...registerPassword('currentPassword')}
                          className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                            passwordErrors.currentPassword
                              ? 'border-error-300 focus:ring-error-200'
                              : 'border-neutral-300 focus:ring-primary/20'
                          }`}
                          placeholder="Tu contraseña actual"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="mt-1 text-sm text-error-600">{passwordErrors.currentPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Nueva contraseña
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          {...registerPassword('newPassword')}
                          className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                            passwordErrors.newPassword
                              ? 'border-error-300 focus:ring-error-200'
                              : 'border-neutral-300 focus:ring-primary/20'
                          }`}
                          placeholder="Nueva contraseña"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="mt-1 text-sm text-error-600">{passwordErrors.newPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Confirmar nueva contraseña
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          {...registerPassword('confirmPassword')}
                          className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                            passwordErrors.confirmPassword
                              ? 'border-error-300 focus:ring-error-200'
                              : 'border-neutral-300 focus:ring-primary/20'
                          }`}
                          placeholder="Confirma tu nueva contraseña"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-error-600">{passwordErrors.confirmPassword.message}</p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSubmittingPassword}
                        className="flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        {isSubmittingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tab: Foto de Perfil */}
              {activeTab === 'photo' && (
                <div>
                  <h2 className="text-xl font-semibold text-neutral-800 mb-6">Foto de Perfil</h2>
                  
                  <div className="space-y-6">
                    {/* Vista previa de la foto actual */}
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden">
                          {profilePhoto ? (
                            <img 
                              src={profilePhoto} 
                              alt="Foto de perfil" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-8 h-8 text-neutral-400" />
                          )}
                        </div>
                        {profilePhoto && (
                          <button
                            onClick={() => setProfilePhoto(null)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-error-500 text-white rounded-full flex items-center justify-center hover:bg-error-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-neutral-800">Foto actual</h3>
                        <p className="text-sm text-neutral-600">
                          Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 5MB
                        </p>
                      </div>
                    </div>

                    {/* Subir nueva foto */}
                    <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center">
                      <input
                        type="file"
                        id="photo-upload"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                      
                      {isUploading ? (
                        <div className="space-y-2">
                          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                          <p className="text-neutral-600">Subiendo foto...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="w-12 h-12 text-neutral-400 mx-auto" />
                          <div>
                            <label
                              htmlFor="photo-upload"
                              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
                            >
                              <Camera className="w-4 h-4" />
                              Seleccionar nueva foto
                            </label>
                          </div>
                          <p className="text-sm text-neutral-500">
                            O arrastra y suelta una imagen aquí
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 