import { useEffect, useRef } from 'react';
import { useCart } from '../contexts/CartContext';

export const useCartExpiration = () => {
  const { cart, removeEvent } = useCart();
  const lastCheckRef = useRef<number>(0);

  useEffect(() => {
    const checkExpiredEvents = () => {
      const now = Date.now();
      
      // Evitar verificaciones muy frecuentes (mínimo 30 segundos entre verificaciones)
      if (now - lastCheckRef.current < 30000) {
        return;
      }
      
      lastCheckRef.current = now;
      const currentTime = new Date();
      
      cart.items.forEach(event => {
        const eventDate = new Date(event.eventDate);
        
        // Solo eliminar eventos que hayan pasado hace más de 7 días
        // Esto permite mantener eventos para análisis posteriores
        const sevenDaysAfterEvent = new Date(eventDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        if (sevenDaysAfterEvent < currentTime) {
          console.log(`Removing expired event: ${event.homeTeamName} vs ${event.awayTeamName}`);
          removeEvent(event.cartId);
        }
      });
    };

    // Verificar eventos vencidos cada hora (muy poco frecuente)
    const interval = setInterval(checkExpiredEvents, 60 * 60 * 1000);
    
    // Verificar después de 5 minutos inicial (no inmediatamente)
    const initialTimeout = setTimeout(checkExpiredEvents, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [removeEvent]); // Removido cart.items de las dependencias para evitar ejecuciones constantes

  // Función para obtener eventos que vencen pronto (próximas 48 horas)
  const getExpiringEvents = () => {
    const now = new Date();
    const fortyEightHours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    
    return cart.items.filter(event => {
      const eventDate = new Date(event.eventDate);
      // Solo mostrar como "expirando" si el evento está en las próximas 48 horas
      // pero aún no ha comenzado
      return eventDate > now && eventDate <= fortyEightHours;
    });
  };

  // Función para obtener el tiempo restante hasta que expire un evento
  const getTimeUntilExpiration = (eventDate: string) => {
    const now = new Date();
    const event = new Date(eventDate);
    const diff = event.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expirado';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} día${days !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return {
    getExpiringEvents,
    getTimeUntilExpiration
  };
};

export default useCartExpiration;