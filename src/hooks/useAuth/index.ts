import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import type { RootState } from '../../store/store';
import { login, register, logout, googleAuth, forgotPassword, resetPassword, updateProfile, updatePassword } from '../../store/slices/authSlice';
import type { AppDispatch } from '../../store/store';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const handleLogin = async (email: string, password: string, remember?: boolean) => {
    try {
      if (!navigator.onLine) {
        throw new Error('No hay conexión a internet. Por favor, verifica tu conexión y vuelve a intentarlo.');
      }

      const result = await dispatch(login({ email, password, remember })).unwrap();
      console.log({result});
      // Almacenar el token en localStorage para asegurar persistencia
      if (result.token) {
        localStorage.setItem('auth_token', result.token);
        console.log('Login: Token guardado en localStorage');
      }
      
      // Asegurar que hay un pequeño retraso antes de redirigir
      // para que todos los estados se actualicen correctamente
      setTimeout(() => {
        // Redirigir a la página original si existe, o al dashboard por defecto
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }, 100);
      
      return result;
    } catch (error: any) {
      // Handle API error responses
      if (error.message && error.message.includes('fetch')) {
        throw new Error('Error de conexión. Por favor, verifica tu conexión a internet y vuelve a intentarlo.');
      }
      
      // Network or other connection errors
      if (!navigator.onLine) {
        throw new Error('No hay conexión a internet. Por favor, verifica tu conexión y vuelve a intentarlo.');
      }
      
      // Re-throw the error so the component can handle it
      throw error;
    }
  };

  const handleRegister = async (userData: {
    username: string;
    email: string;
    password: string;
    phone: string;
  }) => {
    try {
      if (!navigator.onLine) {
        throw new Error('No hay conexión a internet. Por favor, verifica tu conexión y vuelve a intentarlo.');
      }

      const result = await dispatch(register(userData)).unwrap();
      
      // Redirigir al dashboard después del registro exitoso
      navigate('/dashboard', { replace: true });
      return result;
    } catch (error: any) {
      // Handle API error responses
      if (error.message && error.message.includes('fetch')) {
        throw new Error('Error de conexión. Por favor, verifica tu conexión a internet y vuelve a intentarlo.');
      }
      
      // Network or other connection errors
      if (!navigator.onLine) {
        throw new Error('No hay conexión a internet. Por favor, verifica tu conexión y vuelve a intentarlo.');
      }
      
      throw error;
    }
  };

  const handleUpdateProfile = async (profileData: {
    fullName?: string;
    username?: string;
    email?: string;
    phone?: string;
    jobTitle?: string;
    company?: string;
    location?: string;
    website?: string;
  }) => {
    try {
      if (!navigator.onLine) {
        throw new Error('No hay conexión a internet. Por favor, verifica tu conexión y vuelve a intentarlo.');
      }

      const result = await dispatch(updateProfile(profileData)).unwrap();
      return result;
    } catch (error: any) {
      if (error.message && error.message.includes('fetch')) {
        throw new Error('Error de conexión. Por favor, verifica tu conexión a internet y vuelve a intentarlo.');
      }
      
      if (!navigator.onLine) {
        throw new Error('No hay conexión a internet. Por favor, verifica tu conexión y vuelve a intentarlo.');
      }
      
      throw error;
    }
  };

  const handleUpdatePassword = async (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      if (!navigator.onLine) {
        throw new Error('No hay conexión a internet. Por favor, verifica tu conexión y vuelve a intentarlo.');
      }

      const result = await dispatch(updatePassword(passwordData)).unwrap();
      return result;
    } catch (error: any) {
      if (error.message && error.message.includes('fetch')) {
        throw new Error('Error de conexión. Por favor, verifica tu conexión a internet y vuelve a intentarlo.');
      }
      
      if (!navigator.onLine) {
        throw new Error('No hay conexión a internet. Por favor, verifica tu conexión y vuelve a intentarlo.');
      }
      
      throw error;
    }
  };

  const handleGoogleAuth = async (credential: string) => {
    try {
      if (!navigator.onLine) {
        throw new Error('No hay conexión a internet. Por favor, verifica tu conexión y vuelve a intentarlo.');
      }

      const result = await dispatch(googleAuth(credential)).unwrap();
      
      // Redirigir al dashboard después del login exitoso
      navigate('/dashboard', { replace: true });
      return result;
    } catch (error: any) {
      if (error.message && error.message.includes('fetch')) {
        throw new Error('Error de conexión. Por favor, verifica tu conexión a internet y vuelve a intentarlo.');
      }
      
      if (!navigator.onLine) {
        throw new Error('No hay conexión a internet. Por favor, verifica tu conexión y vuelve a intentarlo.');
      }
      
      throw error;
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      if (!navigator.onLine) {
        throw new Error('No hay conexión a internet. Por favor, verifica tu conexión y vuelve a intentarlo.');
      }

      const result = await dispatch(forgotPassword({ email })).unwrap();
      return result;
    } catch (error: any) {
      if (error.message && error.message.includes('fetch')) {
        throw new Error('Error de conexión. Por favor, verifica tu conexión a internet y vuelve a intentarlo.');
      }
      
      if (!navigator.onLine) {
        throw new Error('No hay conexión a internet. Por favor, verifica tu conexión y vuelve a intentarlo.');
      }
      
      throw error;
    }
  };

  const handleResetPassword = async (data: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      if (!navigator.onLine) {
        throw new Error('No hay conexión a internet. Por favor, verifica tu conexión y vuelve a intentarlo.');
      }

      const result = await dispatch(resetPassword(data)).unwrap();
      
      // Redirigir al login después del reset exitoso
      navigate('/login', { replace: true });
      return result;
    } catch (error: any) {
      if (error.message && error.message.includes('fetch')) {
        throw new Error('Error de conexión. Por favor, verifica tu conexión a internet y vuelve a intentarlo.');
      }
      
      if (!navigator.onLine) {
        throw new Error('No hay conexión a internet. Por favor, verifica tu conexión y vuelve a intentarlo.');
      }
      
      throw error;
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    updateProfile: handleUpdateProfile,
    updatePassword: handleUpdatePassword,
    googleAuth: handleGoogleAuth,
    forgotPassword: handleForgotPassword,
    resetPassword: handleResetPassword,
    logout: handleLogout
  };
}