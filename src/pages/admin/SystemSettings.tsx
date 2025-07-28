import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Shield, Settings, Bell, Database,
  Key, Globe, Mail, Webhook, Server,
  ChevronRight, Search
} from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  icon: typeof Settings;
  path: string;
}

const settingsSections: SettingsSection[] = [
  {
    id: 'users',
    title: 'Usuarios',
    description: 'Gestionar usuarios y roles del sistema',
    icon: Users,
    path: '/admin/settings/users'
  },
  {
    id: 'permissions',
    title: 'Permisos',
    description: 'Configurar permisos y políticas de acceso',
    icon: Shield,
    path: '/admin/settings/permissions'
  },
  {
    id: 'notifications',
    title: 'Notificaciones',
    description: 'Configurar notificaciones del sistema',
    icon: Bell,
    path: '/admin/settings/notifications'
  },
  {
    id: 'database',
    title: 'Base de Datos',
    description: 'Gestionar configuraciones de base de datos',
    icon: Database,
    path: '/admin/settings/database'
  },
  {
    id: 'api',
    title: 'API & Integraciones',
    description: 'Gestionar claves API y webhooks',
    icon: Key,
    path: '/admin/settings/api'
  },
  {
    id: 'localization',
    title: 'Localización',
    description: 'Configurar idiomas y formatos regionales',
    icon: Globe,
    path: '/admin/settings/localization'
  },
  {
    id: 'email',
    title: 'Email',
    description: 'Configurar servidores SMTP y plantillas',
    icon: Mail,
    path: '/admin/settings/email'
  },
  {
    id: 'webhooks',
    title: 'Webhooks',
    description: 'Gestionar endpoints y eventos',
    icon: Webhook,
    path: '/admin/settings/webhooks'
  },
  {
    id: 'system',
    title: 'Sistema',
    description: 'Configuraciones generales del sistema',
    icon: Server,
    path: '/admin/settings/system'
  }
];

export function SystemSettings() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = settingsSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If we're at the root settings path, show the overview
  if (location.pathname === '/admin/settings') {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-1">Configuración del Sistema</h1>
            <p className="text-neutral-600">
              Gestiona todas las configuraciones de la plataforma
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar configuraciones..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSections.map((section) => (
              <motion.div
                key={section.id}
                whileHover={{ y: -5 }}
                onClick={() => navigate(section.path)}
              >
                <Card className="cursor-pointer h-full">
                  <Card.Body className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <section.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-1">{section.title}</h3>
                        <p className="text-sm text-neutral-600 mb-4">
                          {section.description}
                        </p>
                        <div className="flex items-center text-primary">
                          <span className="text-sm">Configurar</span>
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // For specific settings sections, render their respective components
  return (
    <Routes>
      <Route path="users" element={<div>Users Settings</div>} />
      <Route path="permissions" element={<div>Permissions Settings</div>} />
      <Route path="notifications" element={<div>Notifications Settings</div>} />
      <Route path="database" element={<div>Database Settings</div>} />
      <Route path="api" element={<div>API Settings</div>} />
      <Route path="localization" element={<div>Localization Settings</div>} />
      <Route path="email" element={<div>Email Settings</div>} />
      <Route path="webhooks" element={<div>Webhooks Settings</div>} />
      <Route path="system" element={<div>System Settings</div>} />
    </Routes>
  );
}