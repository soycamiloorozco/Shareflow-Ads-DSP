import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, PlusSquare, Layout, User, Settings, ShoppingBag,
  Tv, Shield, BarChart3, FileText, Wallet, CreditCard,
  Users, Bell, HardDrive, Boxes, ChevronDown,
  ChevronLeft, ChevronRight, Sun, Moon, Menu, X, LogOut,
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
      return true; // Default to dark mode
    }
    return true; // Default to dark mode
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      // Force a small delay to ensure dark mode applies
      setTimeout(() => {
        root.classList.add('dark');
      }, 10);
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Force apply dark mode on mount
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    }
  }, []);

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
    const newDarkMode = !isDarkMode;
    console.log('🎨 Toggling theme:', { from: isDarkMode, to: newDarkMode });
    setIsDarkMode(newDarkMode);
    
    // Immediate application
    const root = document.documentElement;
    if (newDarkMode) {
      root.classList.add('dark');
      console.log('🌙 Dark mode activated');
    } else {
      root.classList.remove('dark');
      console.log('☀️ Light mode activated');
    }
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
    { path: '/profile', icon: User, label: 'Mi Perfil' }
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
          group flex items-center rounded-2xl transition-all duration-200 ease-out
          min-h-[48px] relative overflow-hidden
          ${isCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3'}
          ${isActive ? 
            'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white shadow-lg shadow-blue-600/25 scale-[1.02]' : 
            'text-neutral-700 dark:text-neutral-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 dark:hover:from-blue-950/30 dark:hover:to-blue-900/20 hover:shadow-sm hover:scale-[1.01]'}
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900
          active:scale-95
        `}
      >
        {/* Icon Container */}
        <div className={`
          flex items-center justify-center rounded-xl transition-all duration-200
          ${isCollapsed ? 'w-6 h-6' : 'w-6 h-6 mr-3'} 
          ${isActive ? 'text-white' : 'text-neutral-600 dark:text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}
        `}>
          <item.icon className="w-5 h-5 stroke-[1.5]" />
        </div>
        
        {/* Label */}
        {!isCollapsed && (
          <span className={`
            font-medium text-[15px] leading-tight transition-colors duration-200
            ${isActive ? 'text-white' : 'text-neutral-700 dark:text-neutral-300 group-hover:text-blue-700 dark:group-hover:text-blue-300'}
          `}>
            {item.label}
          </span>
        )}
        
        {/* Active Indicator */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/40 rounded-r-full" />
        )}
        
        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="absolute left-full ml-3 px-3 py-2 bg-neutral-900 dark:bg-neutral-700 text-white text-sm rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
            {item.label}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-neutral-900 dark:bg-neutral-700 rotate-45" />
          </div>
        )}
      </Link>
    );
  };

  const NavGroup = ({ group }: { group: NavGroup }) => (
    <section className="space-y-2" role="group" aria-labelledby={`nav-section-${group.title.replace(/\s+/g, '-').toLowerCase()}`}>
      {!isCollapsed && (
        <h3 
          id={`nav-section-${group.title.replace(/\s+/g, '-').toLowerCase()}`}
          className="px-4 mb-4 text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 tracking-[0.1em] leading-none"
        >
          {group.title}
        </h3>
      )}
      {isCollapsed && (
        <div className="mb-6 mx-4 border-t border-neutral-200/60 dark:border-neutral-700/60" />
      )}
      <nav className="space-y-1" role="navigation">
        {group.items.map((item) => (
          <NavLink key={item.path} item={item} />
        ))}
      </nav>
    </section>
  );

  const renderNavGroups = (groups: NavGroup[]) => groups.map(group => <NavGroup key={group.title} group={group} />);

  const SidebarContent = () => {
    return (
      <div className="flex flex-col h-full">
        {/* Logo and Brand */}
        <div className={`
          flex items-center justify-center relative
          ${isCollapsed ? 'px-4 py-6' : 'px-6 py-5'} h-20 
          border-b border-neutral-200/50 dark:border-neutral-800/80
          bg-white dark:bg-neutral-900
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
              text-neutral-500 dark:text-neutral-400
              hover:text-blue-600 dark:hover:text-blue-400
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
          flex-grow py-6 space-y-8 overflow-y-auto hide-scrollbar 
          ${isCollapsed ? 'px-3' : 'px-4'}
          bg-white dark:bg-neutral-900
        `} role="navigation" aria-label="Navegación principal">
          <NavGroup group={generalNavItems} />
          
          {(hasRole(['Admin'])) && renderNavGroups(adminNavItems)}
        </nav>

        {/* Footer: Theme Toggle & User Profile */}
        <footer className={`
          border-t border-neutral-200/50 dark:border-neutral-800/80 pt-4 pb-6
          ${isCollapsed ? 'px-3' : 'px-4'}
          bg-white dark:bg-neutral-900
        `}>
          {/* Theme Toggle - Más sutil */}
          <div className={`
            flex items-center mb-4
            ${isCollapsed ? 'justify-center' : 'justify-between'}
          `}>
            {!isCollapsed && (
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Tema
              </span>
            )}
            <button 
              onClick={toggleTheme}
              className={`
                p-2 rounded-lg transition-all duration-200 ease-out
                ${isDarkMode 
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400' 
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                }
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-900
                active:scale-95
              `}
              title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
              aria-label={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* User Profile Section */}
          <div className="group relative">
            {/* Profile Card - Similar to reference image */}
            <Link 
              to="/profile"
              className="w-full flex items-center p-4 rounded-2xl
                       bg-gradient-to-br from-neutral-50 to-neutral-100/50 
                       dark:from-neutral-800/30 dark:to-neutral-800/10
                       hover:from-neutral-100 hover:to-neutral-100 
                       dark:hover:from-neutral-800/50 dark:hover:to-neutral-800/30
                       border border-neutral-200/40 dark:border-neutral-700/40
                       transition-all duration-200 ease-in-out group/profile
                       shadow-sm hover:shadow-md
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                       min-h-[68px]"
              aria-label={`Ver perfil de ${user?.username || 'Usuario'}`}
            >
              <div className="flex-shrink-0 relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 
                             flex items-center justify-center 
                             shadow-lg ring-2 ring-white/80 dark:ring-neutral-900/80
                             group-hover/profile:scale-105 transition-transform duration-200">
                  <span className="text-white font-bold text-lg">
                    {(user?.username || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-neutral-900 rounded-full shadow-sm" />
              </div>
              
              {!isCollapsed && (
                <div className="flex-1 overflow-hidden ml-4 text-left">
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 truncate leading-tight mb-1">
                    {user?.username || 'Usuario'}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate leading-tight">
                    {user?.email || 'usuario@ejemplo.com'}
                  </p>
                </div>
              )}
              
              {!isCollapsed && (
                <div className="ml-2 opacity-0 group-hover/profile:opacity-100 transition-opacity duration-200">
                  <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                </div>
              )}
            </Link>
            
            {/* Logout Button - Subtle text below profile */}
            {!isCollapsed && (
              <button 
                onClick={handleLogout} 
                className="w-full mt-3 text-center text-xs text-neutral-400 dark:text-neutral-500 
                         hover:text-red-500 dark:hover:text-red-400 
                         transition-colors duration-200 py-2
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2
                         rounded-lg hover:bg-red-50/50 dark:hover:bg-red-900/10"
              >
                Cerrar sesión
              </button>
            )}
            
            {/* Collapsed Profile Tooltip */}
            {isCollapsed && (
              <div className="absolute left-full ml-3 top-0 w-56
                           bg-neutral-900 rounded-xl shadow-xl border border-neutral-800
                           opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20
                           pointer-events-none">
                <div className="p-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 
                                 flex items-center justify-center shadow-md">
                      <span className="text-white font-semibold">
                        {(user?.username || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-100 truncate">
                        {user?.username || 'Usuario'}
                      </p>
                      <p className="text-xs text-neutral-400 truncate">
                        {user?.email || 'usuario@ejemplo.com'}
                      </p>
                    </div>
                  </div>
                  <div className="h-px bg-neutral-700 mb-2"></div>
                  <p className="text-xs text-neutral-400">
                    Click para ver perfil
                  </p>
                </div>
              </div>
            )}
          </div>
        </footer>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`
          hidden md:flex flex-col fixed top-0 left-0 h-full
          bg-white dark:bg-neutral-900
          border-r border-neutral-200/60 dark:border-neutral-800/80
          shadow-[8px_0_40px_-12px_rgba(0,0,0,0.08)]
          dark:shadow-[8px_0_40px_-12px_rgba(0,0,0,0.4)]
          z-40 overflow-hidden
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-80'}
        `}
        role="navigation"
        aria-label="Navegación principal de la aplicación"
      >
        <SidebarContent />
      </aside>

      {/* Mobile Navbar */}
      <nav 
        className="md:hidden fixed top-0 left-0 right-0 h-16 
                    bg-white dark:bg-neutral-900 
                    border-b border-neutral-200/60 dark:border-neutral-800/80 
                    shadow-sm dark:shadow-neutral-900/20 z-50 
                    flex items-center justify-between px-4"
        role="navigation"
        aria-label="Navegación móvil"
      >
        {/* Logo */}
        <Link to="/sports-events" className="flex items-center" aria-label="Ir al inicio">
          <div className="h-8 flex items-center justify-center">
            <img 
              src={Logo} 
              alt="Shareflow Ads" 
              className="h-7 w-auto dark:filter dark:brightness-0 dark:invert" 
            /> 
          </div>
        </Link>
        
        {/* Menu Icons */}
        <div className="flex items-center gap-2">
          {/* Menu hamburguesa */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 
                      text-neutral-700 dark:text-neutral-300 
                      hover:bg-neutral-200 dark:hover:bg-neutral-700
                      shadow-sm border border-neutral-200/60 dark:border-neutral-700/60
                      transition-all duration-200 active:scale-95
                      min-h-[44px] min-w-[44px]
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label="Abrir menú de navegación"
            aria-expanded={isMobileMenuOpen}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Mobile Off-canvas Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm 
                       animate-in fade-in duration-300" 
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          
          {/* Sidebar Panel */}
          <div className="absolute right-0 top-0 h-full w-[340px] max-w-[85vw]
                         bg-white dark:bg-neutral-900
                         shadow-2xl border-l border-neutral-100/60 dark:border-neutral-800/60
                         animate-in slide-in-from-right duration-300 ease-out">
            {/* Header del menú móvil */}
            <div className="flex items-center justify-between p-4 h-16 
                          border-b border-neutral-100/60 dark:border-neutral-800/60
                          bg-white dark:bg-neutral-900">
              <h2 id="mobile-menu-title" className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                Menú
              </h2>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 
                          text-neutral-500 dark:text-neutral-400 
                          hover:bg-neutral-200 dark:hover:bg-neutral-700
                          transition-all duration-200 active:scale-95
                          min-h-[44px] min-w-[44px]
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Contenido del menú */}
            <div className="h-[calc(100vh-4rem)] overflow-auto bg-white dark:bg-neutral-900">
              <div className="p-5">
                <SidebarContent />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Area - Adjust margin based on sidebar state */}
      <main className={`transition-all duration-300 ease-in-out md:ml-20 ${!isCollapsed ? 'md:ml-80' : ''} pt-16 md:pt-0`}>
        {/* This is where the page content will be rendered by Layout.tsx */}
      </main>
    </>
  );
}