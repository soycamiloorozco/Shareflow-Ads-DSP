import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/store';
import { checkAuth } from '../store/slices/authSlice';
import type { AppDispatch } from '../store/store';

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const [authChecked, setAuthChecked] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Verificar autenticación al montar el componente
    const verifyAuth = async () => {
      try {
        // Comprobar si hay un token en localStorage
        const token = localStorage.getItem('auth_token');
        if (token) {
          console.log('RequireAuth: Token encontrado en localStorage, verificando...');
          await dispatch(checkAuth()).unwrap();
        }
      } catch (error) {
        console.error('RequireAuth: Error verificando autenticación:', error);
      } finally {
        setAuthChecked(true);
        // Dar un pequeño tiempo para que todo se sincronice
        setTimeout(() => {
          setInitialLoading(false);
        }, 300);
      }
    };

    verifyAuth();
  }, [dispatch]);

  useEffect(() => {
    console.log('RequireAuth: Estado actual', { 
      isAuthenticated, 
      isLoading, 
      user, 
      location, 
      allowedRoles,
      authChecked,
      initialLoading 
    });
  }, [isAuthenticated, isLoading, user, location, allowedRoles, authChecked, initialLoading]);

  // Esperar a que se complete la verificación inicial
  if (initialLoading || isLoading) {
    console.log('RequireAuth: Cargando...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Si no está autenticado después de la verificación, redirigir al login
  if (!isAuthenticated || !user) {
    console.log('RequireAuth: No autenticado, redirigiendo a login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si hay roles permitidos especificados, verificar si el usuario tiene alguno
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = user?.roles.some(role => allowedRoles.includes(role));
    console.log('RequireAuth: Verificando roles', { 
      userRoles: user?.roles, 
      allowedRoles, 
      hasAllowedRole 
    });
    
    if (!hasAllowedRole) {
      console.log('RequireAuth: Usuario no tiene roles permitidos, redirigiendo a no autorizado');
      return <Navigate to="/not-authorized" replace />;
    }
  }

  console.log('RequireAuth: Usuario autenticado correctamente');
  return <>{children}</>;
}