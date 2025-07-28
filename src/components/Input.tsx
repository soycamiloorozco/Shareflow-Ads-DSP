import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', ...props }, ref) => {
    const baseInputStyles = `
      w-full
      px-3
      py-2
      bg-white
      border
      rounded-lg
      transition-colors
      duration-200
      placeholder:text-neutral-400
      focus-ring-inset
      disabled:bg-neutral-50
      disabled:text-neutral-500
      disabled:cursor-not-allowed
      ${error ? 'border-error-500 text-error-600' : 'border-neutral-300 text-neutral-900 focus:border-primary'}
      ${leftIcon ? 'pl-10' : ''}
      ${rightIcon ? 'pr-10' : ''}
    `;

    return (
      <div className={className}>
        {label && (
          <label className="block mb-1.5 text-form-label">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={baseInputStyles}
            aria-invalid={error ? 'true' : 'false'}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {rightIcon}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p className={`mt-1.5 text-sm ${error ? 'text-error-600' : 'text-neutral-500'}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';