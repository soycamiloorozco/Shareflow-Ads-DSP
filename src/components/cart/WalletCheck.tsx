import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, AlertTriangle, CheckCircle, CreditCard, Plus, ArrowRight, Info } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

interface WalletCheckProps {
  walletBalance: number;
  onRecharge?: () => void;
  className?: string;
  showDetails?: boolean;
}

export const WalletCheck: React.FC<WalletCheckProps> = ({
  walletBalance,
  onRecharge,
  className = '',
  showDetails = true
}) => {
  const { cart, validateCheckout } = useCart();
  const [validation, setValidation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Validate checkout when cart or balance changes
  useEffect(() => {
    const performValidation = async () => {
      if (cart.items.length === 0) {
        setValidation(null);
        return;
      }

      setIsLoading(true);
      try {
        const result = await validateCheckout(walletBalance);
        setValidation(result);
      } catch (error) {
        console.error('Error validating checkout:', error);
        setValidation({
          isValid: false,
          errors: ['Error al validar el checkout'],
          warnings: [],
          requiredBalance: cart.totalPrice,
          currentBalance: walletBalance
        });
      } finally {
        setIsLoading(false);
      }
    };

    performValidation();
  }, [cart.items.length, cart.totalPrice, walletBalance, validateCheckout]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (!validation && cart.items.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Validando balance...</span>
        </div>
      </div>
    );
  }

  const hasInsufficientFunds = validation && !validation.isValid && validation.shortfall;
  const hasWarnings = validation && validation.warnings && validation.warnings.length > 0;
  const isValid = validation && validation.isValid;

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className={`p-4 ${
        hasInsufficientFunds 
          ? 'bg-red-50 border-b border-red-200' 
          : isValid 
            ? 'bg-green-50 border-b border-green-200'
            : 'bg-gray-50 border-b border-gray-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            hasInsufficientFunds 
              ? 'bg-red-100 text-red-600' 
              : isValid 
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-100 text-gray-600'
          }`}>
            {hasInsufficientFunds ? (
              <AlertTriangle className="w-5 h-5" />
            ) : isValid ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Wallet className="w-5 h-5" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className={`font-semibold ${
              hasInsufficientFunds 
                ? 'text-red-900' 
                : isValid 
                  ? 'text-green-900'
                  : 'text-gray-900'
            }`}>
              {hasInsufficientFunds 
                ? 'Fondos insuficientes' 
                : isValid 
                  ? 'Balance suficiente'
                  : 'Verificación de balance'
              }
            </h3>
            <p className={`text-sm ${
              hasInsufficientFunds 
                ? 'text-red-700' 
                : isValid 
                  ? 'text-green-700'
                  : 'text-gray-600'
            }`}>
              {hasInsufficientFunds 
                ? 'Necesitas recargar tu wallet para continuar'
                : isValid 
                  ? 'Puedes proceder con la compra'
                  : 'Verificando disponibilidad de fondos'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Balance Details */}
      {showDetails && validation && (
        <div className="p-4 space-y-4">
          {/* Balance Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatPrice(validation.currentBalance)}
              </div>
              <div className="text-sm text-gray-600">Balance actual</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatPrice(validation.requiredBalance)}
              </div>
              <div className="text-sm text-gray-600">Total requerido</div>
            </div>
          </div>

          {/* Visual Balance Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Disponible</span>
              <span>{((validation.currentBalance / validation.requiredBalance) * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: `${Math.min(100, (validation.currentBalance / validation.requiredBalance) * 100)}%` 
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  hasInsufficientFunds 
                    ? 'bg-red-500' 
                    : 'bg-green-500'
                }`}
              />
            </div>
          </div>

          {/* Shortfall Information */}
          {hasInsufficientFunds && validation.shortfall && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-3"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-900 text-sm mb-1">
                    Faltante: {formatPrice(validation.shortfall)}
                  </h4>
                  <p className="text-red-700 text-xs">
                    Necesitas recargar tu wallet con al menos {formatPrice(validation.shortfall)} para completar esta compra.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Warnings */}
          {hasWarnings && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
            >
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-900 text-sm mb-1">
                    Advertencias
                  </h4>
                  <ul className="text-yellow-700 text-xs space-y-1">
                    {validation.warnings.map((warning: string, index: number) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* Errors */}
          {validation.errors && validation.errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-3"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-900 text-sm mb-1">
                    Errores de validación
                  </h4>
                  <ul className="text-red-700 text-xs space-y-1">
                    {validation.errors.map((error: string, index: number) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        {hasInsufficientFunds ? (
          <div className="space-y-3">
            {onRecharge && (
              <button
                onClick={onRecharge}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Recargar Wallet
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                También puedes guardar como borrador y completar la compra más tarde
              </p>
            </div>
          </div>
        ) : isValid ? (
          <div className="flex items-center justify-center gap-2 text-green-700">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Listo para proceder al checkout</span>
          </div>
        ) : (
          <div className="text-center text-gray-500 text-sm">
            Configura todos los eventos para ver el balance requerido
          </div>
        )}
      </div>
    </div>
  );
};

// Compact version for smaller spaces
export const WalletCheckCompact: React.FC<WalletCheckProps> = ({
  walletBalance,
  onRecharge,
  className = ''
}) => {
  const { cart } = useCart();
  const hasInsufficientFunds = walletBalance < cart.totalPrice;
  const shortfall = hasInsufficientFunds ? cart.totalPrice - walletBalance : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (cart.items.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${
      hasInsufficientFunds 
        ? 'bg-red-50 border-red-200' 
        : 'bg-green-50 border-green-200'
    } ${className}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        hasInsufficientFunds 
          ? 'bg-red-100 text-red-600' 
          : 'bg-green-100 text-green-600'
      }`}>
        {hasInsufficientFunds ? (
          <AlertTriangle className="w-4 h-4" />
        ) : (
          <CheckCircle className="w-4 h-4" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${
          hasInsufficientFunds ? 'text-red-900' : 'text-green-900'
        }`}>
          {hasInsufficientFunds 
            ? `Faltan ${formatPrice(shortfall)}`
            : 'Balance suficiente'
          }
        </div>
        <div className={`text-xs ${
          hasInsufficientFunds ? 'text-red-700' : 'text-green-700'
        }`}>
          {formatPrice(walletBalance)} disponible
        </div>
      </div>

      {hasInsufficientFunds && onRecharge && (
        <button
          onClick={onRecharge}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Recargar
        </button>
      )}
    </div>
  );
};

export default WalletCheck;