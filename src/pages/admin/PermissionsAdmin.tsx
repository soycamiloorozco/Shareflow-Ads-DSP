import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Filter, Shield, Eye, Edit, Power,
  Clock, X, Check, AlertCircle, ChevronRight
} from 'lucide-react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { RequireAuth } from '../../components/RequireAuth';

type Role = 
  | 'super_admin'
  | 'ads_admin'
  | 'pixel_admin'
  | 'asset_manager'
  | 'financial_admin'
  | 'content_moderator'
  | 'field_operator'
  | 'viewer';

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'inactive';
  lastLogin: string;
  registeredAt: string;
  permissions: string[];
}

const roles: { id: Role; name: string; description: string }[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Acceso total a todas las funciones del sistema'
  },
  {
    id: 'ads_admin',
    name: 'Ads Admin',
    description: 'Gestión de campañas y anuncios'
  },
  {
    id: 'pixel_admin',
    name: 'Pixel Admin',
    description: 'Administración de la red de pantallas'
  },
  {
    id: 'asset_manager',
    name: 'Asset Manager',
    description: 'Gestión de activos digitales'
  },
  {
    id: 'financial_admin',
    name: 'Financial Admin',
    description: 'Administración financiera y facturación'
  },
  {
    id: 'content_moderator',
    name: 'Content Moderator',
    description: 'Moderación de contenido y creativos'
  },
  {
    id: 'field_operator',
    name: 'Field Operator',
    description: 'Operaciones en campo y mantenimiento'
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Solo visualización de datos'
  }
];

const permissions: Permission[] = [
  {
    id: 'create_campaigns',
    name: 'Crear campañas',
    description: 'Permite crear y editar campañas publicitarias',
    module: 'Campaigns'
  },
  {
    id: 'manage_screens',
    name: 'Gestionar pantallas',
    description: 'Permite administrar la red de pantallas',
    module: 'Screens'
  },
  {
    id: 'upload_content',
    name: 'Subir contenido',
    description: 'Permite cargar contenido creativo',
    module: 'Content'
  },
  {
    id: 'approve_creatives',
    name: 'Aprobar creativos',
    description: 'Permite aprobar o rechazar contenido creativo',
    module: 'Content'
  },
  {
    id: 'access_billing',
    name: 'Acceder a facturación',
    description: 'Permite ver y gestionar facturación',
    module: 'Billing'
  },
  {
    id: 'configure_pixel',
    name: 'Configurar Pixel',
    description: 'Permite configurar la red Pixel',
    module: 'Pixel'
  },
  {
    id: 'manage_tokens',
    name: 'Gestionar tokens',
    description: 'Permite administrar tokens y NFTs',
    module: 'Tokens'
  },
  {
    id: 'view_reports',
    name: 'Ver reportes',
    description: 'Permite ver reportes de ventas',
    module: 'Reports'
  },
  {
    id: 'issue_certificates',
    name: 'Emitir certificados',
    description: 'Permite emitir certificados',
    module: 'Certificates'
  },
  {
    id: 'create_moments',
    name: 'Crear momentos',
    description: 'Permite crear momentos manualmente',
    module: 'Moments'
  },
  {
    id: 'view_logs',
    name: 'Ver logs',
    description: 'Permite ver logs de usuario',
    module: 'Logs'
  }
];

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@shareflow.me',
    role: 'super_admin',
    status: 'active',
    lastLogin: '2024-03-15T10:30:00Z',
    registeredAt: '2023-01-01T00:00:00Z',
    permissions: ['create_campaigns', 'manage_screens', 'upload_content']
  },
  {
    id: '2',
    name: 'María García',
    email: 'maria@shareflow.me',
    role: 'ads_admin',
    status: 'active',
    lastLogin: '2024-03-14T15:45:00Z',
    registeredAt: '2023-02-15T00:00:00Z',
    permissions: ['create_campaigns', 'upload_content']
  },
  {
    id: '3',
    name: 'Carlos Rodríguez',
    email: 'carlos@shareflow.me',
    role: 'content_moderator',
    status: 'inactive',
    lastLogin: '2024-03-10T09:20:00Z',
    registeredAt: '2023-03-01T00:00:00Z',
    permissions: ['approve_creatives', 'upload_content']
  }
];

export function PermissionsAdmin() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [editedPermissions, setEditedPermissions] = useState<string[]>([]);
  const [editedRole, setEditedRole] = useState<Role | null>(null);

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditedPermissions(user.permissions);
    setEditedRole(user.role);
    setIsEditPanelOpen(true);
  };

  const handleSavePermissions = () => {
    if (!selectedUser || !editedRole) return;

    // In a real app, this would be an API call
    console.log('Saving permissions for user:', {
      userId: selectedUser.id,
      role: editedRole,
      permissions: editedPermissions
    });

    setIsEditPanelOpen(false);
  };

  const togglePermission = (permissionId: string) => {
    setEditedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  return (
    <RequireAuth allowedRoles={['super_admin']}>
      <div className="min-h-screen bg-background pb-20 md:pb-0 md:ml-64">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold mb-1">Gestión de Permisos</h1>
              <p className="text-neutral-600">
                Administra roles y permisos de usuarios
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              icon={Users}
              onClick={() => {
                // Handle new user creation
                console.log('Create new user');
              }}
            >
              Nuevo Usuario
            </Button>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o email..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button
              variant="outline"
              size="lg"
              icon={Filter}
            >
              Filtros
            </Button>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left p-4 font-medium text-neutral-600">Usuario</th>
                    <th className="text-left p-4 font-medium text-neutral-600">Rol</th>
                    <th className="text-left p-4 font-medium text-neutral-600">Estado</th>
                    <th className="text-left p-4 font-medium text-neutral-600">Último acceso</th>
                    <th className="text-right p-4 font-medium text-neutral-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-neutral-200">
                      <td className="p-4">
                        <div>
                          <h3 className="font-medium">{user.name}</h3>
                          <p className="text-sm text-neutral-600">{user.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-primary" />
                          <span className="capitalize">
                            {roles.find(r => r.id === user.role)?.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`
                          inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm
                          ${user.status === 'active'
                            ? 'bg-success-50 text-success-600'
                            : 'bg-error-50 text-error-600'
                          }
                        `}>
                          {user.status === 'active' ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <AlertCircle className="w-4 h-4" />
                          )}
                          <span className="capitalize">{user.status}</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-neutral-600">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(user.lastLogin).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Eye}
                            onClick={() => {
                              // View user logs
                              console.log('View logs for user:', user.id);
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Edit}
                            onClick={() => handleEditUser(user)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Power}
                            onClick={() => {
                              // Toggle user status
                              console.log('Toggle status for user:', user.id);
                            }}
                            className={user.status === 'active'
                              ? 'text-error-600 hover:bg-error-50'
                              : 'text-success-600 hover:bg-success-50'
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <AnimatePresence>
          {isEditPanelOpen && selectedUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setIsEditPanelOpen(false)}
            >
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="absolute top-0 right-0 bottom-0 w-full max-w-xl bg-white shadow-xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-neutral-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold">Editar Permisos</h2>
                      <button
                        onClick={() => setIsEditPanelOpen(false)}
                        className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          Información del Usuario
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                              Nombre
                            </label>
                            <input
                              type="text"
                              value={selectedUser.name}
                              disabled
                              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-600"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                              Email
                            </label>
                            <input
                              type="email"
                              value={selectedUser.email}
                              disabled
                              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-600"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          Rol del Usuario
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                          {roles.map((role) => (
                            <button
                              key={role.id}
                              onClick={() => setEditedRole(role.id)}
                              className={`
                                p-4 rounded-xl border-2 text-left transition-all
                                ${editedRole === role.id
                                  ? 'border-primary bg-primary-50'
                                  : 'border-neutral-200 hover:border-neutral-300'
                                }
                              `}
                            >
                              <h4 className="font-medium mb-1">{role.name}</h4>
                              <p className="text-sm text-neutral-600">
                                {role.description}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          Permisos Específicos
                        </h3>
                        <div className="space-y-4">
                          {Object.entries(
                            permissions.reduce((acc, permission) => ({
                              ...acc,
                              [permission.module]: [
                                ...(acc[permission.module] || []),
                                permission
                              ]
                            }), {} as Record<string, Permission[]>)
                          ).map(([module, modulePermissions]) => (
                            <div key={module}>
                              <h4 className="font-medium mb-2">{module}</h4>
                              <div className="space-y-2">
                                {modulePermissions.map((permission) => (
                                  <label
                                    key={permission.id}
                                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={editedPermissions.includes(permission.id)}
                                      onChange={() => togglePermission(permission.id)}
                                      className="mt-1 w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary"
                                    />
                                    <div>
                                      <p className="font-medium">
                                        {permission.name}
                                      </p>
                                      <p className="text-sm text-neutral-600">
                                        {permission.description}
                                      </p>
                                    </div>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-t border-neutral-200 bg-neutral-50">
                    <div className="flex justify-end gap-4">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setIsEditPanelOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={handleSavePermissions}
                      >
                        Guardar Cambios
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </RequireAuth>
  );
}