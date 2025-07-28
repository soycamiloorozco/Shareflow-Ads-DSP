import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from '../store/slices/authSlice';
import { setAuthToken } from '../helpers/request';
import { AppDispatch, RootState } from '../store/store';


interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Verificar si hay un token en localStorage pero no en el state
    const localToken = localStorage.getItem('auth_token');
    
    if (localToken && !auth.token) {
      setAuthToken(localToken);
    }
    
    // Verificar la autenticación al cargar la aplicación
    dispatch(checkAuth())
      .unwrap()
      .then((_) => {
        //console.log('AuthProvider: Verificación exitosa', result);
      })
      .catch((_) => {
      
        // Si falla, eliminar el token de localStorage
        localStorage.removeItem('auth_token');
      });
  }, [dispatch, auth.token]);

  return <>{children}</>;
} 