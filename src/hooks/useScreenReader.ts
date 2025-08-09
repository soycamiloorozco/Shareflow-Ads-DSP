import { useCallback, useRef } from 'react';

interface UseScreenReaderOptions {
  politeness?: 'polite' | 'assertive';
}

export const useScreenReader = ({ politeness = 'polite' }: UseScreenReaderOptions = {}) => {
  const announcementRef = useRef<HTMLDivElement | null>(null);

  // Create or get the announcement element
  const getAnnouncementElement = useCallback(() => {
    if (!announcementRef.current) {
      const element = document.createElement('div');
      element.setAttribute('aria-live', politeness);
      element.setAttribute('aria-atomic', 'true');
      element.setAttribute('class', 'sr-only');
      element.style.position = 'absolute';
      element.style.left = '-10000px';
      element.style.width = '1px';
      element.style.height = '1px';
      element.style.overflow = 'hidden';
      
      document.body.appendChild(element);
      announcementRef.current = element;
    }
    return announcementRef.current;
  }, [politeness]);

  // Announce a message to screen readers
  const announce = useCallback((message: string) => {
    const element = getAnnouncementElement();
    
    // Clear the element first to ensure the message is announced
    element.textContent = '';
    
    // Use a small delay to ensure the clearing is processed
    setTimeout(() => {
      element.textContent = message;
    }, 100);
  }, [getAnnouncementElement]);

  // Announce cart actions
  const announceCartAction = useCallback((action: 'added' | 'removed' | 'updated' | 'cleared', itemName?: string, count?: number) => {
    let message = '';
    
    switch (action) {
      case 'added':
        message = itemName 
          ? `${itemName} agregado al carrito`
          : 'Evento agregado al carrito';
        break;
      case 'removed':
        message = itemName 
          ? `${itemName} eliminado del carrito`
          : 'Evento eliminado del carrito';
        break;
      case 'updated':
        message = itemName 
          ? `${itemName} actualizado en el carrito`
          : 'Evento actualizado en el carrito';
        break;
      case 'cleared':
        message = 'Carrito vaciado';
        break;
    }
    
    if (count !== undefined) {
      message += `. ${count} evento${count !== 1 ? 's' : ''} en el carrito`;
    }
    
    announce(message);
  }, [announce]);

  // Announce navigation changes
  const announceNavigation = useCallback((location: string) => {
    announce(`Navegando a ${location}`);
  }, [announce]);

  // Announce loading states
  const announceLoading = useCallback((isLoading: boolean, context?: string) => {
    const message = isLoading 
      ? `Cargando${context ? ` ${context}` : ''}...`
      : `Carga completada${context ? ` de ${context}` : ''}`;
    announce(message);
  }, [announce]);

  // Announce errors
  const announceError = useCallback((error: string) => {
    announce(`Error: ${error}`);
  }, [announce]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (announcementRef.current) {
      document.body.removeChild(announcementRef.current);
      announcementRef.current = null;
    }
  }, []);

  return {
    announce,
    announceCartAction,
    announceNavigation,
    announceLoading,
    announceError,
    cleanup
  };
};

export default useScreenReader;