import React, { createContext, useContext, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

export type Role = 
  | 'super_admin'
  | 'ads_admin'
  | 'pixel_admin'
  | 'asset_manager'
  | 'financial_admin'
  | 'content_moderator'
  | 'field_operator'
  | 'Admin'
  | 'viewer';

export interface UserPermissions {
  userId: string;
  role: Role;
  modules: {
    sportevents: { create: boolean; delete: boolean };
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



export function PermissionsProvider({ children }: { children: ReactNode }) {


  
  const { user } = useSelector((state: RootState) => state.auth);

    // Mock permissions for development
  const mockPermissions: UserPermissions = {
    userId: '1',
    role: user ? user.roles[0] as Role: 'ads_admin',
    modules: {
      campaigns: { create: true, delete: true },
      sportevents: { create: true, delete: true },
      screens: { manage: true },
      billing: { access: true },
      pixels: { configure: true },
      tokens: { mint: true },
      creatives: { approve: true }
    }
  };

  console.log({mockPermissions})
  
  // In a real app, you'd fetch this from your auth system
  const permissions = mockPermissions;

  const can = (action: string): boolean => {
    if (permissions.role === 'Admin') return true;

    const [module, permission] = action.split('.');
    return !!permissions.modules[module]?.[permission];
  };

  const hasRole = (roles: Role | Role[]): boolean => {
   
    const roleArray = Array.isArray(roles) ? roles : [roles];

    console.log({roleArray})
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