import React from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, Users, Eye, BarChart3, TrendingUp, 
  Calendar, Clock, Target, Award, Zap 
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

interface CartSummaryProps {
  className?: string;
  showAnalytics?: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({ 
  className = '',
  showAnalytics = true 
}) => {
  const { cart, getCartAnalytics } = useCart();
  const analytics = getCartAnalytics();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  const formatCostPerImpression = (cost: number) => {
    return `$${cost.toFixed(2)}`;
  };

  if (cart.items.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="font-semibold text-gray-900">Resumen del Carrito</h3>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Total Events */}
        <div className="bg-white/60 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-600">Eventos</span>
          </div>
          <p className="text-lg font-bold text-gray-900">{analytics.totalEvents}</p>
        </div>

        {/* Total Price */}
        <div className="bg-white/60 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-gray-600">Total</span>
          </div>
          <p className="text-lg font-bold text-green-700">
            {formatPrice(analytics.totalPrice)}
          </p>
        </div>

        {/* Total Audience */}
        <div className="bg-white/60 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-gray-600">Audiencia</span>
          </div>
          <p className="text-lg font-bold text-purple-700">
            {formatNumber(analytics.totalAudience)}
          </p>
        </div>

        {/* Cost Per Impression */}
        <div className="bg-white/60 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-medium text-gray-600">CPI</span>
          </div>
          <p className="text-lg font-bold text-orange-700">
            {formatCostPerImpression(analytics.costPerImpression)}
          </p>
        </div>
      </div>

      {/* Configuration Status */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Estado de Configuración</span>
          <span className="text-xs text-gray-500">
            {cart.items.filter(item => item.isConfigured).length}/{cart.items.length}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ 
              width: `${(cart.items.filter(item => item.isConfigured).length / cart.items.length) * 100}%` 
            }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        </div>
        
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>Pendientes</span>
          <span>Configurados</span>
        </div>
      </div>

      {/* Analytics Section */}
      {showAnalytics && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Insights</span>
          </div>

          {/* Average Price Per Event */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Precio promedio por evento:</span>
            <span className="font-medium text-gray-900">
              {formatPrice(analytics.averagePricePerEvent)}
            </span>
          </div>

          {/* Audience Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Audiencia presencial:
              </span>
              <span className="font-medium text-gray-900">
                {formatNumber(cart.items.reduce((sum, item) => sum + (item.estimatedAttendance || 0), 0))}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Audiencia TV:
              </span>
              <span className="font-medium text-gray-900">
                {formatNumber(cart.items.reduce((sum, item) => sum + (item.estimatedAttendanceTv || 0), 0))}
              </span>
            </div>
          </div>

          {/* Event Timeline */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Cronograma</span>
            </div>
            
            <div className="space-y-1">
              {cart.items
                .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
                .slice(0, 3)
                .map((item, index) => (
                  <div key={item.cartId} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 truncate flex-1 mr-2">
                      {item.homeTeamName} vs {item.awayTeamName}
                    </span>
                    <span className="text-gray-500 flex-shrink-0">
                      {new Date(item.eventDate).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </span>
                  </div>
                ))
              }
              
              {cart.items.length > 3 && (
                <div className="text-xs text-gray-500 text-center pt-1">
                  +{cart.items.length - 3} eventos más
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          {analytics.recommendations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">Recomendaciones</span>
              </div>
              
              <div className="space-y-1">
                {analytics.recommendations.slice(0, 2).map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Zap className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-gray-600 leading-relaxed">
                      {recommendation}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-blue-200">
        <div className="grid grid-cols-2 gap-2">
          <button className="px-3 py-2 bg-white/60 hover:bg-white/80 rounded-lg text-xs font-medium text-gray-700 transition-colors">
            Ver Timeline
          </button>
          <button className="px-3 py-2 bg-white/60 hover:bg-white/80 rounded-lg text-xs font-medium text-gray-700 transition-colors">
            Exportar Datos
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CartSummary;