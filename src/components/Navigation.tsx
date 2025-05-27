import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, PlusSquare, Layout, User, Settings, Store,
  Monitor, Shield, BarChart3, FileText, Wallet, CreditCard,
  Users, Bell, HardDrive, Boxes, ChevronDown,
  ChevronLeft, Sun, Moon, Menu, X, LogOut,
  Cog, CheckSquare, ImageIcon, Trophy
} from 'lucide-react';
import { usePermissions } from '../contexts/PermissionsContext';
import { RequirePermission } from './RequirePermission';
import { Tooltip } from './Tooltip';
import { useAuth } from '../hooks/useAuth';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import Logo from '../assets/logo.svg';

interface NavigationProps {
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

interface NavItem {
  path: string;
  icon: typeof Home;
  label: string;
  description?: string;
  requiresPermission?: string;
  requiresRole?: string[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function Navigation({ isCollapsed, onCollapsedChange }: NavigationProps) {
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const { hasRole } = usePermissions();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const generalNavItems: NavGroup = {
    title: 'Plataforma',
    items: [
      //{ path: '/dashboard', icon: Home, label: 'Inicio' },
      //{ path: '/marketplace', icon: Store, label: 'Marketplace' },
      { path: '/sports-events', icon: Trophy, label: 'Eventos Deportivos' },
      // { 
      //   path: '/create', 
      //   icon: PlusSquare, 
      //   label: 'Crear',
      //   requiresPermission: 'campaigns.create'
      // },
      // { path: '/mis-campanas', icon: Layout, label: 'Mis Campañas' },
      // { path: '/biblioteca', icon: ImageIcon, label: 'Biblioteca' },
      // { path: '/payments', icon: CreditCard, label: 'Métodos de Pago' }
    ]
  };

  const adminNavItems: NavGroup[] = [
    {
      title: 'Gestión',
      items: [
        // { 
        //   path: '/admin/screens', 
        //   icon: Monitor, 
        //   label: 'Pantallas',
        //   description: 'Gestionar pantallas digitales',
        //   requiresRole: ['super_admin', 'ads_admin']
        // },
        {
          path: '/admin/sports-events',
          icon: Trophy,
          label: 'Eventos',
          description: 'Gestionar eventos deportivos',
         requiresRole: ['Admin']
          
        },
        // {
        //   path: '/admin/inventory',
        //   icon: Boxes,
        //   label: 'Inventario',
        //   description: 'Control de inventario',
        //   requiresRole: ['super_admin', 'ads_admin']
        // },
        // {
        //   path: '/admin/cms',
        //   icon: FileText,
        //   label: 'CMS',
        //   description: 'Gestión de contenido',
        //   requiresRole: ['super_admin', 'ads_admin']
        // },
        {
          path: '/admin/content-review',
          icon: CheckSquare,
          label: 'Revisión',
          description: 'Revisión de contenido',
          requiresRole: ['Admin']
        }
      ]
    },
    // {
    //   title: 'Administración',
    //   items: [
    //     // {
    //     //   path: '/admin/analytics',
    //     //   icon: BarChart3,
    //     //   label: 'Analytics',
    //     //   description: 'Métricas y reportes',
    //     //   requiresRole: ['super_admin', 'ads_admin']
    //     // },
    //     // {
    //     //   path: '/admin/billing',
    //     //   icon: Wallet,
    //     //   label: 'Facturación',
    //     //   description: 'Gestión de pagos',
    //     //   requiresRole: ['super_admin', 'financial_admin']
    //     // },
    //     // {
    //     //   path: '/admin/settings',
    //     //   icon: Cog,
    //     //   label: 'Configuración',
    //     //   description: 'Configuración del sistema',
    //     //   requiresRole: ['super_admin']
    //     // }
    //   ]
    // }
  ];

  // const accountNavItems: NavGroup = {
  //   title: 'Mi Cuenta',
  //   items: [
  //     // { path: '/profile', icon: User, label: 'Perfil' },
  //     // { path: '/notifications', icon: Bell, label: 'Notificaciones' },
  //     // { path: '/settings', icon: Settings, label: 'Configuración' }
  //   ]
  // };

  const NavLink = ({ item }: { item: NavItem }) => (
    <RequirePermission
      action={item.requiresPermission}
      roles={item.requiresRole}
      fallback={null}
    >
      {isCollapsed ? (
        <Tooltip content={item.label}>
          <Link
            to={item.path}
            className={`
              flex items-center justify-center p-3 rounded-lg transition-all
              hover:bg-neutral-50 group
              ${location.pathname === item.path
                ? 'bg-primary-50 text-primary'
                : 'text-neutral-600'
              }
            `}
          >
            <item.icon 
              size={20} 
              className="transition-transform group-hover:scale-110"
            />
          </Link>
        </Tooltip>
      ) : (
        <Link
          to={item.path}
          className={`
            flex items-start gap-3 px-4 py-3 rounded-lg transition-all
            hover:bg-neutral-50 group
            ${location.pathname === item.path
              ? 'bg-primary-50 text-primary'
              : 'text-neutral-600'
            }
          `}
        >
          <item.icon 
            size={20} 
            className="flex-shrink-0 transition-transform group-hover:scale-110"
          />
          <div className="flex-1 min-w-0">
            <span className="block font-medium">{item.label}</span>
            {item.description && (
              <span className="text-sm text-neutral-500 line-clamp-1">
                {item.description}
              </span>
            )}
          </div>
        </Link>
      )}
    </RequirePermission>
  );

  const NavGroup = ({ group }: { group: NavGroup }) => (
    <div className="space-y-1">
      {!isCollapsed && (
        <h3 className="px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
          {group.title}
        </h3>
      )}
      {group.items.map((item) => (
        <NavLink key={item.path} item={item} />
      ))}
    </div>
  );

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-sm"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-neutral-600" />
        ) : (
          <Menu className="w-6 h-6 text-neutral-600" />
        )}
      </button>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 left-0 w-[280px] z-40 bg-white md:hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center h-16 px-4 border-b border-neutral-200">
                <img 
                  src={Logo}
                  alt="Shareflow" 
                  className="h-8"
                  style={{width: 100}}
                />
              </div>

              <div className="flex-1 overflow-y-auto px-2 py-4">
                <div className="space-y-6">
                  <NavGroup group={generalNavItems} />
                  {hasRole(['Admin']) && (
                    adminNavItems.map((group) => (
                      <NavGroup key={group.title} group={group} />
                    ))
                  )}
                  {/* <NavGroup group={accountNavItems} /> */}
                </div>
              </div>

              <div className="border-t border-neutral-200 p-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    {isDarkMode ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-error-600"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.nav
        initial={false}
        animate={{ width: isCollapsed ? '5rem' : '16rem' }}
        className={`
          hidden md:flex fixed left-0 top-0 bottom-0 
          bg-white border-r border-neutral-200
          flex-col z-30 transition-all duration-300
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center h-16 px-4 border-b border-neutral-200">
            {!isCollapsed ? (
              <img 
                 src={Logo}
                alt="Shareflow" 
                className="h-8"
                style={{width: 150}}
              />
            ) : (
              <img 
                src={Logo}
                alt="Shareflow" 
                className="h-8 w-8"
              />
            )}
            <button
              onClick={() => onCollapsedChange(!isCollapsed)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors ml-auto"
              aria-label="Toggle sidebar"
            >
              <ChevronLeft
                className={`w-5 h-5 transition-transform duration-300 ${
                  isCollapsed ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* Navigation Groups */}
          <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
            <NavGroup group={generalNavItems} />
            {hasRole(['Admin']) && (
              adminNavItems.map((group) => (
                <NavGroup key={group.title} group={group} />
              ))
            )}
            {/* <NavGroup group={accountNavItems} /> */}
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                  >
                    {isDarkMode ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors text-error-600"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              )}
              {isCollapsed ? (
                <Tooltip content={ user?.username ?? ''}>
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                </Tooltip>
              ) : (
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-2 py-1 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{ user?.username }</p>
                    <p className="text-sm text-neutral-500 truncate">
                        {/* {user?.email} */}
                      </p>
                      <p className="text-sm text-neutral-500 truncate">
                        { user?.roles }
                    </p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.nav>
    </>
  );
}