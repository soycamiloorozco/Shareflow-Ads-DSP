import React from 'react';
import { Navigate } from 'react-router-dom';

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  // TODO: Replace with actual auth logic
  const user = {
    role: 'super_admin'
  };

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/not-authorized" replace />;
  }

  return <>{children}</>;
}