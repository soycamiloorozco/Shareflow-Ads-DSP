import { useEffect, useCallback, useRef } from 'react';

interface UseKeyboardNavigationOptions {
  isOpen: boolean;
  onClose: () => void;
  onEscape?: () => void;
  trapFocus?: boolean;
  autoFocus?: boolean;
}

export const useKeyboardNavigation = ({
  isOpen,
  onClose,
  onEscape,
  trapFocus = true,
  autoFocus = true
}: UseKeyboardNavigationOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle escape key
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        if (onEscape) {
          onEscape();
        } else {
          onClose();
        }
        break;

      case 'Tab':
        if (trapFocus && containerRef.current) {
          const focusableElements = containerRef.current.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
          );
          
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (event.shiftKey) {
            // Shift + Tab (backward)
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement?.focus();
            }
          } else {
            // Tab (forward)
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement?.focus();
            }
          }
        }
        break;
    }
  }, [isOpen, onClose, onEscape, trapFocus]);

  // Set up keyboard event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      
      // Store the previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Auto-focus the first focusable element
      if (autoFocus && containerRef.current) {
        const firstFocusable = containerRef.current.querySelector(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
        ) as HTMLElement;
        
        if (firstFocusable) {
          // Small delay to ensure the element is rendered
          setTimeout(() => firstFocusable.focus(), 100);
        }
      }
    } else {
      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown, autoFocus]);

  return {
    containerRef
  };
};

export default useKeyboardNavigation;