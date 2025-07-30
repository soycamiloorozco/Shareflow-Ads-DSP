import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, PlusSquare, Layout, User, Settings, ShoppingBag,
  Tv, Shield, BarChart3, FileText, Wallet, CreditCard,
  Users, Bell, HardDrive, Boxes, ChevronDown,
  ChevronLeft, Sun, Moon, Menu, X, LogOut,
  Cog, Eye, ImageIcon, Trophy, Rocket,
  Percent, Building, ChevronsLeft, ChevronsRight, Zap
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
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { hasRole } = usePermissions();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return false;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const generalNavItems: NavGroup = {
    title: 'Plataforma',
    items: [
      // { path: '/sports-events', icon: Home, label: 'Inicio' },
      { path: '/marketplace', icon: ShoppingBag, label: 'Marketplace', description: 'Pantallas digitales disponibles' },
      { path: '/sports-events', icon: Zap, label: 'Eventos Deportivos' },
      { path: '/my-campaigns', icon: Rocket, label: 'Mis Campañas' },
      // { 
      //   path: '/create', 
      //   icon: PlusSquare, 
      //   label: 'Crear',
      //   requiresPermission: 'campaigns.create'
      // },
      // { path: '/biblioteca', icon: ImageIcon, label: 'Biblioteca' },
      { path: '/wallet', icon: CreditCard, label: 'Mis Créditos' },
    ]
  };

  const adminNavItems: NavGroup[] = [
    {
      title: 'Gestión',
      items: [
        {
          path: '/admin/sports-events',
          icon: Zap,
          label: 'Eventos',
          description: 'Gestionar eventos deportivos',
          requiresRole: ['Admin']
        },
        {
          path: '/admin/content-review',
          icon: Eye,
          label: 'Revisión',
          description: 'Revisión de contenido',
          requiresRole: ['Admin']
        },
        { 
          path: '/partner/screens', 
          icon: Tv, 
          label: 'Pantallas',
          description: 'Gestiona tus pantallas digitales'
        },
        {
          path: '/admin/discounts',
          icon: Percent,
          label: 'Bonos y Promociones',
          description: 'Gestión de bonos y códigos promocionales',
          requiresRole: ['Admin']
        },

        {
          path: '/admin/partners-relations',
          icon: Users,
          label: 'Partners Relations',
          description: 'Control de márgenes y pagos a partners',
          requiresRole: ['Admin']
        },
      ]
    }
  ];

  const accountNavItems: NavItem[] = [
    { path: '/profile', icon: User, label: 'Mi Perfil' },
    { path: '/notifications', icon: Bell, label: 'Notificaciones' },
    { path: '/settings', icon: Settings, label: 'Ajustes Generales' }
  ];

  const NavLink = ({ item }: { item: NavItem }) => {
    // Check if user has required role or permission
    const hasRequiredAccess = () => {
      if (item.requiresRole && item.requiresRole.length > 0) {
        return hasRole(item.requiresRole);
      }
      if (item.requiresPermission) {
        return true;
      }
      return true;
    };

    // Don't render if user doesn't have access
    if (!hasRequiredAccess()) {
      return null;
    }

    const isActive = location.pathname === item.path || (item.path !== '/sports-events' && location.pathname.startsWith(item.path));
    
    return (
      <Link
        to={item.path}
        className={`
          group flex items-center px-3 py-2.5 rounded-xl transition-all duration-300
          ${isActive ? 
            'bg-blue-600 dark:bg-blue-500 shadow-lg shadow-blue-600/20 transform scale-[1.02]' : 
            'hover:bg-blue-50/70 dark:hover:bg-blue-900/20 hover:shadow-sm'}
          ${isCollapsed ? 'justify-center' : ''}
        `}
      >
        <span className={`
          relative flex items-center justify-center
          ${isCollapsed ? 'w-10 h-10' : 'w-9 h-9'} 
          rounded-xl transition-all duration-300 transform
          ${isActive ? 
            'bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 text-white shadow-lg shadow-blue-600/30 scale-105' : 
            'text-neutral-600 dark:text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 group-hover:bg-gradient-to-br group-hover:from-blue-50 group-hover:to-blue-100 dark:group-hover:from-blue-900/20 dark:group-hover:to-blue-800/20 group-hover:scale-105'}
          before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0 ${isActive ? 'before:opacity-100' : 'group-hover:before:opacity-50'} before:transition-opacity before:duration-300
        `}>
          <item.icon className={`
            w-[22px] h-[22px] transition-all duration-300 relative z-10
            ${isActive ? 'stroke-[2.5px] text-white drop-shadow-sm' : 'stroke-[1.75px] group-hover:stroke-[2px] group-hover:drop-shadow-sm'}
          `} />
        </span>
        {!isCollapsed && (
          <span className={`
            ml-4 font-medium text-[15px] transition-all duration-300
            ${isActive ? 
              'text-white font-semibold' : 
              'text-neutral-600 dark:text-neutral-300 group-hover:text-blue-600 dark:group-hover:text-blue-300'}
          `}>
            {item.label}
          </span>
        )}
      </Link>
    );
  };

  const NavGroup = ({ group }: { group: NavGroup }) => (
    <div className="first:mt-0">
      {!isCollapsed && (
        <h3 className="px-3 mb-3 text-xs font-semibold uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">
          {group.title}
        </h3>
      )}
      {isCollapsed && <div className="mb-4 border-t border-neutral-200/70 dark:border-neutral-700/50 mx-1.5"></div>}
      <div className="space-y-1.5">
        {group.items.map((item) => (
          <NavLink key={item.path} item={item} />
        ))}
      </div>
    </div>
  );

  const renderNavGroups = (groups: NavGroup[]) => groups.map(group => <NavGroup key={group.title} group={group} />);

  const SidebarContent = () => {
    return (
      <div className="flex flex-col h-full">
        {/* Logo and Brand */}
        <div className={`
          flex items-center justify-center relative
          ${isCollapsed ? 'px-4 py-6' : 'px-6 py-5'} h-20 border-b border-neutral-200/50 dark:border-neutral-950/30
        `}>
          {!isCollapsed && (
            <Link to="/sports-events" className="flex items-center">
              <div className="w-auto h-9 flex items-center justify-center">
                <img 
                  src={Logo} 
                  alt="Shareflow Ads Logo" 
                  className="h-7 w-auto filter brightness-0 dark:filter dark:brightness-0 dark:invert" 
                /> 
              </div>
            </Link>
          )}
          {isCollapsed && (
            <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src={Logo} 
                alt="Shareflow Ads Logo" 
                className="h-6 w-auto filter brightness-0 dark:filter dark:brightness-0 dark:invert" 
              /> 
            </div>
          )}
          <button 
            onClick={() => onCollapsedChange(!isCollapsed)} 
            className={`
              ${isCollapsed ? 'absolute top-20 -right-3' : 'absolute right-4 top-1/2 -translate-y-1/2'}
              w-6 h-6 flex items-center justify-center
              bg-white dark:bg-neutral-800 
              shadow-md dark:shadow-neutral-900/50
              rounded-full border border-neutral-100 dark:border-neutral-700 
              text-neutral-500 dark:text-primary
              hover:text-primary dark:hover:text-primary
              transition-all duration-200
            `}
            title={isCollapsed ? "Expandir menú" : "Contraer menú"}
          >
            {isCollapsed ? (
              <ChevronsRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronsLeft className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className={`
          flex-grow pt-5 space-y-5 overflow-y-auto hide-scrollbar 
          px-3 pb-4 ${isCollapsed ? 'px-2.5' : 'px-4'}
        `}>
          <NavGroup group={generalNavItems} />
          {(hasRole(['Admin'])) && renderNavGroups(adminNavItems)}
        </nav>

        {/* Footer: Theme Toggle & User Profile */}
        <div className={`
          border-t border-neutral-200/50 dark:border-neutral-800 p-4
          ${isCollapsed ? 'px-2.5' : 'px-4'}
        `}>
          {/* Theme Toggle */}
          <div className={`
            flex items-center mb-3 px-2 py-1.5 rounded-xl
            ${isCollapsed ? 'justify-center' : 'justify-between'}
            bg-white/60 dark:bg-neutral-800/70 border border-neutral-200/30 dark:border-neutral-700/30
          `}>
            {!isCollapsed && <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Tema</span>}
            <button 
              onClick={toggleTheme}
              className={`
                p-2 rounded-lg transition-all duration-200
                ${isDarkMode 
                  ? 'bg-neutral-700/50 hover:bg-neutral-600/50 text-yellow-400 hover:text-yellow-300' 
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-700'
                }
                ${isCollapsed ? 'w-full flex justify-center' : ''}
              `}
              title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* User Profile Section */}
          <div className="group relative">
            <div 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`
                flex items-center p-3 rounded-xl cursor-pointer 
                hover:bg-white/70 dark:hover:bg-neutral-800
                transition-colors
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              {/* User avatar with gradient background */}
              <div className="flex-shrink-0 relative overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-600 text-white flex items-center justify-center shadow-md shadow-primary/10">
                  {user?.username ? user.username.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-black/5 dark:bg-white/5 rounded-xl"></div>
              </div>
              
              {!isCollapsed && (
                <div className="overflow-hidden ml-3">
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100 truncate">
                    {user?.username || 'Usuario'}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {user?.email || 'usuario@ejemplo.com'}
                  </p>
                </div>
              )}
              {!isCollapsed && (
                <ChevronDown className={`w-4 h-4 text-neutral-400 dark:text-neutral-500 ml-auto transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              )}
            </div>
            
            {/* User Actions Dropdown/Flyout - Versión no colapsada */}
            {!isCollapsed && isProfileOpen && (
              <div className="absolute bottom-full mb-1 w-[calc(100%-1rem)] left-2 right-2
                       bg-white dark:bg-neutral-800 rounded-xl
                       shadow-lg shadow-neutral-200/70 dark:shadow-black/20
                       border border-neutral-100 dark:border-neutral-700/80
                       backdrop-blur-sm z-20">
                <div className="p-2 space-y-1">
                  {accountNavItems.map(item => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center py-2.5 px-3 rounded-lg w-full text-left
                               text-neutral-700 dark:text-neutral-300 
                               hover:bg-neutral-50 dark:hover:bg-neutral-700/50 
                               transition-colors duration-200 ease-in-out group"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center
                                    bg-neutral-100 dark:bg-neutral-700 
                                    text-neutral-500 dark:text-neutral-400 
                                    group-hover:text-primary dark:group-hover:text-primary
                                    transition-colors">
                        <item.icon className="w-4.5 h-4.5" />
                      </span>
                      <span className="ml-3 font-medium">{item.label}</span>
                    </Link>
                  ))}
                  <div className="h-px w-full bg-neutral-100 dark:bg-neutral-700/50 my-1"></div>
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center py-2.5 px-3 rounded-lg w-full text-left
                             text-neutral-700 dark:text-neutral-300 
                             hover:bg-red-50 dark:hover:bg-red-900/20 
                             hover:text-red-600 dark:hover:text-red-400 
                             transition-colors duration-200 ease-in-out group"
                  >
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center
                                  bg-neutral-100 dark:bg-neutral-700 
                                  text-neutral-500 dark:text-neutral-400 
                                  group-hover:text-red-500 dark:group-hover:text-red-400
                                  transition-colors">
                      <LogOut className="w-4.5 h-4.5" />
                    </span>
                    <span className="ml-3 font-medium">Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Collapsed Profile Flyout */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 top-0 w-48
                       bg-white dark:bg-neutral-800 rounded-xl
                       shadow-lg shadow-neutral-200/70 dark:shadow-black/20
                       border border-neutral-100 dark:border-neutral-700/80
                       opacity-0 group-hover:opacity-100 
                       transition-opacity duration-200 z-20
                       backdrop-blur-sm">
                <div className="p-3">
                  <div className="px-2 py-2 mb-2 bg-neutral-50 dark:bg-neutral-700/30 rounded-lg">
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100 truncate">
                      {user?.username || 'Usuario'}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {user?.email || 'usuario@ejemplo.com'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    {accountNavItems.map(item => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center py-2 px-3 rounded-lg w-full text-left
                                text-neutral-700 dark:text-neutral-300 
                                hover:bg-neutral-50 dark:hover:bg-neutral-700/50 
                                transition-colors duration-200 ease-in-out group"
                      >
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center
                                      bg-neutral-100 dark:bg-neutral-700 
                                      text-neutral-500 dark:text-neutral-400 
                                      group-hover:text-primary dark:group-hover:text-primary
                                      transition-colors">
                          <item.icon className="w-4 h-4" />
                        </span>
                        <span className="ml-2.5 text-sm font-medium">{item.label}</span>
                      </Link>
                    ))}
                    <div className="h-px w-full bg-neutral-100 dark:bg-neutral-700/50 my-1"></div>
                    <button 
                      onClick={handleLogout} 
                      className="flex items-center py-2 px-3 rounded-lg w-full text-left
                               text-neutral-700 dark:text-neutral-300 
                               hover:bg-red-50 dark:hover:bg-red-900/20 
                               hover:text-red-600 dark:hover:text-red-400 
                               transition-colors duration-200 ease-in-out group"
                    >
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center
                                    bg-neutral-100 dark:bg-neutral-700 
                                    text-neutral-500 dark:text-neutral-400 
                                    group-hover:text-red-500 dark:group-hover:text-red-400
                                    transition-colors">
                        <LogOut className="w-4 h-4" />
                      </span>
                      <span className="ml-2.5 text-sm font-medium">Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`
          hidden md:flex flex-col fixed top-0 left-0 h-full
          bg-gradient-to-b from-neutral-50/90 to-neutral-100/80
          dark:from-neutral-900/95 dark:via-neutral-900/98 dark:to-neutral-950/95
          border-r border-neutral-200/60 dark:border-neutral-800/80
          shadow-[5px_0_30px_-15px_rgba(0,0,0,0.08)]
          dark:shadow-[5px_0_30px_-15px_rgba(0,0,0,0.3)]
          backdrop-filter backdrop-blur-sm
          z-40 overflow-hidden
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-72'}
        `}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Navbar */}
      <nav className="md:hidden fixed top-0 left-0 right-0 h-16 
                      bg-neutral-50/95 dark:bg-neutral-900/98 
                      backdrop-blur-xl
                      border-b border-neutral-200/60 dark:border-neutral-800/80 
                      shadow-sm dark:shadow-neutral-900/20 z-50 
                      flex items-center justify-center px-4">
        {/* Logo centrado */}
        <Link to="/sports-events" className="flex items-center">
          <div className="h-8 flex items-center justify-center">
            <img src={Logo} alt="Shareflow Ads Logo" className="h-7 w-auto dark:filter dark:brightness-0 dark:invert" /> 
          </div>
        </Link>
        
        {/* Menú hamburguesa en la esquina derecha */}
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="absolute right-4 p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 
                    text-neutral-700 dark:text-neutral-300 
                    hover:bg-neutral-200 dark:hover:bg-neutral-700
                    shadow-sm border border-neutral-200 dark:border-neutral-700
                    transition-all duration-200 active:scale-95"
        >
          <Menu className="w-5 h-5" />
        </button>
      </nav>

      {/* Mobile Off-canvas Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100]">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm 
                       animate-in fade-in duration-300" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar Panel */}
          <div className="absolute right-0 top-0 h-full w-[320px] 
                         bg-white dark:bg-neutral-900
                         shadow-2xl border-l border-neutral-100 dark:border-neutral-800
                         animate-in slide-in-from-right duration-300 ease-out">
            {/* Header del menú móvil */}
            <div className="flex items-center justify-end p-4 h-16 
                          border-b border-neutral-100 dark:border-neutral-800
                          bg-gradient-to-r from-neutral-50 to-white dark:from-neutral-800 dark:to-neutral-900">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 
                          text-neutral-500 dark:text-neutral-400 
                          hover:bg-neutral-200 dark:hover:bg-neutral-700
                          transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Contenido del menú */}
            <div className="h-[calc(100vh-4rem)] overflow-auto">
              <div className="p-4 space-y-6">
                <SidebarContent />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Area - Adjust margin based on sidebar state */}
      <main className={`transition-all duration-300 ease-in-out md:ml-20 ${!isCollapsed ? 'md:ml-72' : ''} pt-16 md:pt-0`}>
        {/* This is where the page content will be rendered by Layout.tsx */}
      </main>
    </>
  );
}