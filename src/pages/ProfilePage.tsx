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
  X,
  Building,
  FileText,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Button';

// Schemas para validación
const profileSchema = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  username: z.string().min(2, 'El nombre de usuario debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional()
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
  const { user, updateProfile, updatePassword, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form para información del perfil
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isSubmitting: isSubmittingProfile }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.username || '',
      username: user?.username || '',
      email: user?.email || '',
      phone: '',
      jobTitle: '',
      company: '',
      location: '',
      website: ''
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

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setSuccessMessage(null);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const onSubmitProfile = async (data: ProfileFormData) => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      
      await updateProfile(data);
      showSuccess('Perfil actualizado exitosamente');
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      showError(error.message || 'Error al actualizar el perfil');
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      
      await updatePassword(data);
      showSuccess('Contraseña cambiada exitosamente');
      resetPasswordForm();
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      showError(error.message || 'Error al cambiar la contraseña');
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showError('La imagen debe ser menor a 10MB');
      return;
    }

    setIsUploading(true);
    try {
      const photoUrl = URL.createObjectURL(file);
      setProfilePhoto(photoUrl);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showSuccess('Foto de perfil actualizada exitosamente');
    } catch (error) {
      console.error('Error al subir foto:', error);
      showError('Error al subir la foto de perfil');
    } finally {
      setIsUploading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'password', label: 'Contraseña', icon: Lock }
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 py-6 sm:py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Success/Error Messages */}
        {(successMessage || errorMessage) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              successMessage 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
            }`}
          >
            {successMessage ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">
              {successMessage || errorMessage}
            </span>
            <button
              onClick={() => {
                setSuccessMessage(null);
                setErrorMessage(null);
              }}
              className="ml-auto text-current hover:opacity-70"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg shadow-neutral-200/40 dark:shadow-neutral-900/40 border border-neutral-200/60 dark:border-neutral-700/60 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Profile Photo */}
              <div className="relative group flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden shadow-md ring-2 ring-white/60 dark:ring-neutral-900/60">
                  {profilePhoto ? (
                    <img 
                      src={profilePhoto} 
                      alt="Foto de perfil" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-lg sm:text-xl">
                      {(user?.username || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <label 
                  htmlFor="photo-upload-header"
                  className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-white" />
                </label>
                <input
                  type="file"
                  id="photo-upload-header"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-neutral-900 rounded-full shadow-sm" />
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-1 truncate">
                  {user?.username || 'Usuario'}
                </h1>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 truncate">
                  {user?.email || 'usuario@ejemplo.com'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium">
                    <User className="w-3 h-3" />
                    Usuario Activo
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-md text-xs font-medium">
                    <Shield className="w-3 h-3" />
                    Verificado
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Settings Content */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg shadow-neutral-200/40 dark:shadow-neutral-900/40 border border-neutral-200/60 dark:border-neutral-700/60 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-neutral-200 dark:border-neutral-700">
            <nav className="flex overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors min-h-[44px] ${
                        activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                        : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                      }`}
                    >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
            </nav>
            </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
          <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="max-w-3xl">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-1">
                      Información del Perfil
                    </h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Actualiza tu foto y detalles personales aquí.
                    </p>
                  </div>
                  
                  <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
                    {/* Profile Picture Section */}
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-4">
                      <h3 className="text-sm font-medium text-neutral-800 dark:text-neutral-100 mb-3">
                        Foto de Perfil
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0">
                          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden shadow-md">
                            {profilePhoto ? (
                              <img 
                                src={profilePhoto} 
                                alt="Foto de perfil" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-semibold text-lg">
                                {(user?.username || 'U').charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          {profilePhoto && (
                            <button
                              type="button"
                              onClick={() => setProfilePhoto(null)}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <label
                              htmlFor="photo-upload"
                              className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer text-sm font-medium min-h-[36px]"
                            >
                              <Upload className="w-4 h-4" />
                              {isUploading ? 'Subiendo...' : 'Subir Imagen'}
                            </label>
                            {profilePhoto && (
                              <button
                                type="button"
                                onClick={() => setProfilePhoto(null)}
                                className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 rounded-lg transition-colors text-sm font-medium min-h-[36px]"
                              >
                                <X className="w-4 h-4" />
                                Eliminar
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            PNG, JPEG, GIF hasta 10MB
                          </p>
                        </div>
                      </div>
                      
                      <input
                        type="file"
                        id="photo-upload"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Nombre Completo
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                          <input
                            type="text"
                            {...registerProfile('fullName')}
                            className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm ${
                              profileErrors.fullName
                                ? 'border-red-300 dark:border-red-600'
                                : 'border-neutral-300 dark:border-neutral-600'
                            }`}
                            placeholder="Tu nombre completo"
                          />
                        </div>
                        {profileErrors.fullName && (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{profileErrors.fullName.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Nombre de Usuario
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">
                            grovio.xyz/
                          </div>
                          <input
                            type="text"
                            {...registerProfile('username')}
                            className={`w-full pl-20 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm ${
                              profileErrors.username
                                ? 'border-red-300 dark:border-red-600'
                                : 'border-neutral-300 dark:border-neutral-600'
                            }`}
                            placeholder="tu-username"
                          />
                        </div>
                        {profileErrors.username && (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{profileErrors.username.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                          <input
                            type="email"
                            {...registerProfile('email')}
                            className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm ${
                              profileErrors.email
                                ? 'border-red-300 dark:border-red-600'
                                : 'border-neutral-300 dark:border-neutral-600'
                            }`}
                            placeholder="tu@email.com"
                          />
                        </div>
                        {profileErrors.email && (
                          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{profileErrors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Teléfono
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                            <div className="w-4 h-3 bg-yellow-400 rounded-sm flex items-center justify-center">
                              <div className="w-3 h-2 bg-blue-600 rounded-sm relative">
                                <div className="absolute inset-0 bg-red-600 rounded-sm" style={{clipPath: 'polygon(0 0, 100% 0, 100% 33%, 0 33%)'}}></div>
                                <div className="absolute inset-0 bg-red-600 rounded-sm" style={{clipPath: 'polygon(0 67%, 100% 67%, 100% 100%, 0 100%)'}}></div>
                              </div>
                            </div>
                            <span className="text-neutral-500 text-xs">+57</span>
                          </div>
                          <input
                            type="tel"
                            {...registerProfile('phone')}
                            className="w-full pl-14 pr-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm"
                            placeholder="300 123 4567"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Cargo
                        </label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                          <input
                            type="text"
                            {...registerProfile('jobTitle')}
                            className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm"
                            placeholder="Marketing Manager"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Empresa
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                          <input
                            type="text"
                            {...registerProfile('company')}
                            className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm"
                            placeholder="Tu empresa"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-neutral-200 dark:border-neutral-700">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          className="px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 font-medium rounded-lg transition-colors text-sm min-h-[36px]"
                        >
                          Cancelar
                        </button>
                        <button
                        type="submit"
                        disabled={isSubmittingProfile}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors text-sm min-h-[36px]"
                      >
                        <Save className="w-4 h-4" />
                        {isSubmittingProfile ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </motion.div>
              )}

            {/* Password Tab */}
              {activeTab === 'password' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="max-w-xl">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-1">
                      Contraseña
                    </h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Actualiza tu contraseña para mantener tu cuenta segura.
                    </p>
                  </div>
                  
                  <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Contraseña Actual
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          {...registerPassword('currentPassword')}
                          className={`w-full pl-9 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm ${
                            passwordErrors.currentPassword
                              ? 'border-red-300 dark:border-red-600'
                              : 'border-neutral-300 dark:border-neutral-600'
                          }`}
                          placeholder="Tu contraseña actual"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 min-h-[24px] min-w-[24px] flex items-center justify-center"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{passwordErrors.currentPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Nueva Contraseña
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          {...registerPassword('newPassword')}
                          className={`w-full pl-9 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm ${
                            passwordErrors.newPassword
                              ? 'border-red-300 dark:border-red-600'
                              : 'border-neutral-300 dark:border-neutral-600'
                          }`}
                          placeholder="Nueva contraseña"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 min-h-[24px] min-w-[24px] flex items-center justify-center"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{passwordErrors.newPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Confirmar Nueva Contraseña
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          {...registerPassword('confirmPassword')}
                          className={`w-full pl-9 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 dark:focus:border-blue-400 transition-colors bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm ${
                            passwordErrors.confirmPassword
                              ? 'border-red-300 dark:border-red-600'
                              : 'border-neutral-300 dark:border-neutral-600'
                          }`}
                          placeholder="Confirma tu nueva contraseña"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 min-h-[24px] min-w-[24px] flex items-center justify-center"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{passwordErrors.confirmPassword.message}</p>
                      )}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-neutral-200 dark:border-neutral-700">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          className="px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 font-medium rounded-lg transition-colors text-sm min-h-[36px]"
                        >
                          Cancelar
                        </button>
                        <button
                        type="submit"
                        disabled={isSubmittingPassword}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors text-sm min-h-[36px]"
                      >
                        <Lock className="w-4 h-4" />
                        {isSubmittingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </motion.div>
                      )}


            </div>
        </div>
      </div>
    </div>
  );
} 