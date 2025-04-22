import React, { createContext, useContext, ReactNode } from 'react';

export type Role = 
  | 'super_admin'
  | 'ads_admin'
  | 'pixel_admin'
  | 'asset_manager'
  | 'financial_admin'
  | 'content_moderator'
  | 'field_operator'
  | 'viewer';

export interface UserPermissions {
  userId: string;
  role: Role;
  modules: {
    campaigns: { create: boolean; delete: boolean };
    screens: { manage: boolean };
    billing: { access: boolean };
    pixels: { configure: boolean };
    tokens: { mint: boolean };
    creatives: { approve: boolean };
  };
}

interface PermissionsContextType {
  permissions: UserPermissions | null;
  can: (action: string) => boolean;
  hasRole: (roles: Role | Role[]) => boolean;
}

const PermissionsContext = createContext<PermissionsContextType | null>(null);

// Mock permissions for development
const mockPermissions: UserPermissions = {
  userId: '1',
  role: 'super_admin',
  modules: {
    campaigns: { create: true, delete: true },
    screens: { manage: true },
    billing: { access: true },
    pixels: { configure: true },
    tokens: { mint: true },
    creatives: { approve: true }
  }
};

export function PermissionsProvider({ children }: { children: ReactNode }) {
  // In a real app, you'd fetch this from your auth system
  const permissions = mockPermissions;

  const can = (action: string): boolean => {
    if (permissions.role === 'super_admin') return true;

    const [module, permission] = action.split('.');
    return !!permissions.modules[module]?.[permission];
  };

  const hasRole = (roles: Role | Role[]): boolean => {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(permissions.role);
  };

  return (
    <PermissionsContext.Provider value={{ permissions, can, hasRole }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}