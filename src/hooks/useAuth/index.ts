import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import type { RootState } from '../../store/store';
import { login, register, logout, googleAuth } from '../../store/slices/authSlice';
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
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      // Handle specific error cases
      if (!navigator.onLine) {
        throw new Error('No hay conexión a internet. Por favor, verifica tu conexión y vuelve a intentarlo.');
      }
      
      if (error.message?.includes('auth/invalid-email')) {
        throw new Error('El correo electrónico no es válido.');
      }
      
      if (error.message?.includes('auth/wrong-password')) {
        throw new Error('La contraseña es incorrecta.');
      }
      
      if (error.message?.includes('auth/user-not-found')) {
        throw new Error('No existe una cuenta con este correo electrónico.');
      }
      
      if (error.message?.includes('auth/too-many-requests')) {
        throw new Error('Demasiados intentos fallidos. Por favor, inténtalo de nuevo más tarde.');
      }

      // If we have a string message, use it
      if (typeof error.message === 'string') {
        throw new Error(error.message);
      }

      // Fallback error message
      throw new Error('Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.');
    }
  };

  const handleRegister = async (name: string, email: string, password: string, whatsapp?: string) => {
    try {
      if (!navigator.onLine) {
        throw new Error('No hay conexión a internet. Por favor, verifica tu conexión y vuelve a intentarlo.');
      }
      //@ts-ignore
      await dispatch(register({ username: name, email, password, phone: whatsapp })).unwrap();
      alert('Registro exitoso. Por favor, revisa tu correo electrónico para validar tu cuenta antes de iniciar sesión.');

      window.location.href = '/login';
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      if (!navigator.onLine) {
        throw new Error('No hay conexión a internet. Por favor, verifica tu conexión y vuelve a intentarlo.');
      }

      if (error.message?.includes('auth/email-already-in-use')) {
        throw new Error('Ya existe una cuenta con este correo electrónico.');
      }

      if (error.message?.includes('auth/invalid-email')) {
        throw new Error('El correo electrónico no es válido.');
      }

      if (error.message?.includes('auth/weak-password')) {
        throw new Error('La contraseña es demasiado débil. Debe tener al menos 6 caracteres.');
      }

      if (typeof error.message === 'string') {
        throw new Error(error.message);
      }

      throw new Error('Ha ocurrido un error inesperado durante el registro. Por favor, inténtalo de nuevo.');
    }
  };

  const handleGoogleAuth = async (token: string) => {
    try {
      if (!navigator.onLine) {
        throw new Error('No hay conexión a internet. Por favor, verifica tu conexión y vuelve a intentarlo.');
      }

      await dispatch(googleAuth(token)).unwrap();
      navigate('/');
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      if (!navigator.onLine) {
        throw new Error('No hay conexión a internet. Por favor, verifica tu conexión y vuelve a intentarlo.');
      }

      if (error.message?.includes('auth/popup-closed-by-user')) {
        throw new Error('Se cerró la ventana de autenticación de Google. Por favor, inténtalo de nuevo.');
      }

      if (typeof error.message === 'string') {
        throw new Error(error.message);
      }

      throw new Error('Ha ocurrido un error inesperado durante la autenticación con Google. Por favor, inténtalo de nuevo.');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    // Limpiar localStorage para asegurar que se elimina el token
    localStorage.removeItem('auth_token');
    // Redirigir después de un pequeño retraso
    setTimeout(() => {
      navigate('/login');
    }, 100);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    googleAuth: handleGoogleAuth,
    logout: handleLogout
  };
}