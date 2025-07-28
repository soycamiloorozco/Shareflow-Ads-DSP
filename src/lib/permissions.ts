export type Role = 
  | 'super_admin'
  | 'Admin'
  | 'ads_admin'
  | 'pixel_admin'
  | 'asset_manager'
  | 'financial_admin'
  | 'content_moderator'
  | 'field_operator'
  | 'viewer';

export interface Permission {
  id: string;
  name: string;
  description: string;
  roles: Role[];
}

export const permissions: Permission[] = [
  {
    id: 'screens.create',
    name: 'Create Screens',
    description: 'Ability to create new digital screens',
    roles: ['Admin', 'pixel_admin']
  },
  {
    id: 'screens.edit',
    name: 'Edit Screens',
    description: 'Ability to edit existing screens',
    roles: ['Admin', 'pixel_admin', 'field_operator']
  },
  {
    id: 'screens.delete',
    name: 'Delete Screens',
    description: 'Ability to remove screens from the system',
    roles: ['Admin']
  },
  {
    id: 'campaigns.create',
    name: 'Create Campaigns',
    description: 'Ability to create new ad campaigns',
    roles: ['Admin', 'ads_admin']
  },
  {
    id: 'campaigns.approve',
    name: 'Approve Campaigns',
    description: 'Ability to approve or reject campaigns',
    roles: ['Admin', 'ads_admin', 'content_moderator']
  },
  {
    id: 'analytics.view',
    name: 'View Analytics',
    description: 'Access to analytics and reporting',
    roles: ['Admin', 'ads_admin', 'financial_admin']
  },
  {
    id: 'users.manage',
    name: 'Manage Users',
    description: 'Ability to manage user accounts and roles',
    roles: ['Admin']
  },
  {
    id: 'billing.access',
    name: 'Access Billing',
    description: 'Access to billing and payment information',
    roles: ['Admin', 'financial_admin']
  }
];

export function hasPermission(userRole: Role, permissionId: string): boolean {
  const permission = permissions.find(p => p.id === permissionId);
  if (!permission) return false;
  return permission.roles.includes(userRole);
}

export function getRolePermissions(role: Role): string[] {
  return permissions
    .filter(permission => permission.roles.includes(role))
    .map(permission => permission.id);
}

export function isAdmin(role: Role): boolean {
  return role === 'Admin' || role === 'ads_admin';
}