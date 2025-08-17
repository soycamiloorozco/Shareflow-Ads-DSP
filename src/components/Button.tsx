import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon: Icon,
  iconPosition = 'right',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus-ring disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[#353FEF] text-white hover:bg-[#2A32C5] active:bg-[#1E2499] disabled:bg-gray-400',
    secondary: 'bg-[#F2F4F7] text-[#0B0B16] hover:bg-[#E4E7EC] active:bg-[#E4E7EC]/90',
    outline: 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-sm active:bg-gray-50 shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
    ghost: 'text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200'
  };

  const sizes = {
    sm: 'text-sm h-8 px-3 gap-1.5',
    md: 'text-sm h-9 px-4 gap-2',
    lg: 'text-sm h-10 px-5 gap-2'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = (disabled || loading) ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${widthClass}
        ${disabledClass}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-3 h-5 w-5" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {Icon && iconPosition === 'left' && !loading && (
        <Icon className="w-5 h-5" aria-hidden="true" />
      )}
      <span className="truncate">{children}</span>
      {Icon && iconPosition === 'right' && !loading && (
        <Icon className="w-5 h-5" aria-hidden="true" />
      )}
    </button>
  );
}