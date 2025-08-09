import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { CartErrorType } from '../../types/cart';

interface CartErrorNotificationProps {
  error: string | null;
  errorType?: CartErrorType;
  onDismiss: () => void;
  onRetry?: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export const CartErrorNotification: React.FC<CartErrorNotificationProps> = ({
  error,
  errorType,
  onDismiss,
  onRetry,
  autoHide = true,
  autoHideDelay = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      
      if (autoHide) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onDismiss, 300); // Wait for animation to complete
        }, autoHideDelay);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [error, autoHide, autoHideDelay, onDismiss]);

  const getErrorIcon = () => {
    switch (errorType) {
      case CartErrorType.NETWORK_ERROR:
        return <WifiOff className="w-5 h-5" />;
      case CartErrorType.INSUFFICIENT_FUNDS:
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getErrorColor = () => {
    switch (errorType) {
      case CartErrorType.NETWORK_ERROR:
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case CartErrorType.INSUFFICIENT_FUNDS:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case CartErrorType.EVENT_UNAVAILABLE:
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  const getActionButton = () => {
    if (!onRetry) return null;

    switch (errorType) {
      case CartErrorType.NETWORK_ERROR:
        return (
          <button
            onClick={onRetry}
            className="flex items-center gap-1 px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-md text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Reintentar
          </button>
        );
      case CartErrorType.INSUFFICIENT_FUNDS:
        return (
          <button
            onClick={onRetry}
            className="flex items-center gap-1 px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-md text-sm font-medium transition-colors"
          >
            <Wifi className="w-3 h-3" />
            Recargar
          </button>
        );
      default:
        return (
          <button
            onClick={onRetry}
            className="flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Reintentar
          </button>
        );
    }
  };

  if (!error) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4"
        >
          <div className={`border rounded-lg p-4 shadow-lg ${getErrorColor()}`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {getErrorIcon()}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {error}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {getActionButton()}
                
                <button
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(onDismiss, 300);
                  }}
                  className="flex-shrink-0 p-1 hover:bg-black/10 rounded-md transition-colors"
                  aria-label="Cerrar notificación"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartErrorNotification;