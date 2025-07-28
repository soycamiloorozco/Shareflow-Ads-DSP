import React, { ReactNode } from 'react';
import { usePermissions } from '../contexts/PermissionsContext';

interface RequirePermissionProps {
  children: ReactNode;
  action?: string;
  roles?: string[];
  fallback?: ReactNode;
}

export function RequirePermission({
  children,
  action,
  roles,
  fallback = null
}: RequirePermissionProps) {
  const { can, hasRole } = usePermissions();

  if (action && !can(action)) return fallback;
  if (roles && !hasRole(roles)) return fallback;

  return <>{children}</>;
}