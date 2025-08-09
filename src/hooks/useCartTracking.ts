import { useEffect } from 'react';
import { useCart } from '../contexts/CartContext';

interface CartTrackingEvent {
  type: 'cart_updated' | 'item_added' | 'item_removed' | 'item_configured' | 'cart_abandoned';
  timestamp: Date;
  userId?: string;
  cartData: {
    totalItems: number;
    totalPrice: number;
    configuredItems: number;
    unconfiguredItems: number;
    items: Array<{
      eventId: string;
      eventName: string;
      eventDate: string;
      isConfigured: boolean;
      price: number;
    }>;
  };
}

export const useCartTracking = () => {
  const { cart } = useCart();

  // Función para enviar eventos de tracking
  const trackCartEvent = async (eventType: CartTrackingEvent['type']) => {
    const trackingData: CartTrackingEvent = {
      type: eventType,
      timestamp: new Date(),
      userId: localStorage.getItem('userId') || undefined,
      cartData: {
        totalItems: cart.items.length,
        totalPrice: cart.totalPrice,
        configuredItems: cart.items.filter(item => item.isConfigured).length,
        unconfiguredItems: cart.items.filter(item => !item.isConfigured).length,
        items: cart.items.map(item => ({
          eventId: item.id,
          eventName: `${item.homeTeamName} vs ${item.awayTeamName}`,
          eventDate: item.eventDate,
          isConfigured: item.isConfigured,
          price: item.finalPrice || item.estimatedPrice
        }))
      }
    };

    try {
      // En producción, enviar a la API de analytics
      // await api.trackCartEvent(trackingData);
      
      // Por ahora, solo log para desarrollo
      console.log('Cart Tracking Event:', trackingData);
      
      // Guardar en localStorage para persistencia
      const existingEvents = JSON.parse(localStorage.getItem('cartTrackingEvents') || '[]');
      existingEvents.push(trackingData);
      
      // Mantener solo los últimos 50 eventos
      if (existingEvents.length > 50) {
        existingEvents.splice(0, existingEvents.length - 50);
      }
      
      localStorage.setItem('cartTrackingEvents', JSON.stringify(existingEvents));
    } catch (error) {
      console.error('Error tracking cart event:', error);
    }
  };

  // Trackear cambios en el carrito
  useEffect(() => {
    if (cart.items.length > 0) {
      trackCartEvent('cart_updated');
    }
  }, [cart.items.length, cart.totalPrice]);

  // Detectar abandono de carrito (usuario inactivo por 30 minutos con items en carrito)
  useEffect(() => {
    if (cart.items.length === 0) return;

    let abandonTimer: NodeJS.Timeout;
    
    const resetAbandonTimer = () => {
      clearTimeout(abandonTimer);
      abandonTimer = setTimeout(() => {
        if (cart.items.length > 0) {
          trackCartEvent('cart_abandoned');
        }
      }, 30 * 60 * 1000); // 30 minutos
    };

    // Eventos que indican actividad del usuario
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, resetAbandonTimer, true);
    });

    resetAbandonTimer();

    return () => {
      clearTimeout(abandonTimer);
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetAbandonTimer, true);
      });
    };
  }, [cart.items.length]);

  // Función para obtener estadísticas de tracking
  const getTrackingStats = () => {
    const events = JSON.parse(localStorage.getItem('cartTrackingEvents') || '[]');
    
    return {
      totalEvents: events.length,
      lastActivity: events.length > 0 ? new Date(events[events.length - 1].timestamp) : null,
      cartAbandons: events.filter((e: CartTrackingEvent) => e.type === 'cart_abandoned').length,
      itemsAdded: events.filter((e: CartTrackingEvent) => e.type === 'item_added').length,
      itemsRemoved: events.filter((e: CartTrackingEvent) => e.type === 'item_removed').length
    };
  };

  // Función para programar notificaciones de email
  const scheduleEmailNotifications = async () => {
    if (cart.items.length === 0) return;

    const notificationData = {
      userId: localStorage.getItem('userId'),
      email: localStorage.getItem('userEmail'),
      cartItems: cart.items.map(item => ({
        eventName: `${item.homeTeamName} vs ${item.awayTeamName}`,
        eventDate: item.eventDate,
        isConfigured: item.isConfigured,
        price: item.finalPrice || item.estimatedPrice
      })),
      totalPrice: cart.totalPrice,
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas después
    };

    try {
      // En producción, enviar a la API de notificaciones
      // await api.scheduleCartReminderEmail(notificationData);
      
      console.log('Email notification scheduled:', notificationData);
    } catch (error) {
      console.error('Error scheduling email notification:', error);
    }
  };

  return {
    trackCartEvent,
    getTrackingStats,
    scheduleEmailNotifications
  };
};

export default useCartTracking;