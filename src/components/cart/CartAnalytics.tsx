import React from 'react';
import { Users, Eye, TrendingUp, Target, BarChart3, DollarSign } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

interface CartAnalyticsProps {
  className?: string;
}

export const CartAnalytics: React.FC<CartAnalyticsProps> = ({ className = '' }) => {
  const { cart, getCartAnalytics } = useCart();
  
  if (cart.items.length === 0) {
    return null;
  }

  const analytics = getCartAnalytics();

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className={`bg-gray-50 rounded-lg p-4 space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-900">Análisis del Carrito</h3>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Audience */}
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-3 h-3 text-green-600" />
            <span className="text-xs text-gray-600">Audiencia Total</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {formatNumber(analytics.totalAudience)}
          </div>
          <div className="text-xs text-gray-500">espectadores</div>
        </div>

        {/* Cost per Impression */}
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-3 h-3 text-blue-600" />
            <span className="text-xs text-gray-600">Costo por Impresión</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {formatCurrency(analytics.costPerImpression)}
          </div>
          <div className="text-xs text-gray-500">por espectador</div>
        </div>

        {/* Average Price per Event */}
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-3 h-3 text-purple-600" />
            <span className="text-xs text-gray-600">Precio Promedio</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {formatCurrency(analytics.averagePricePerEvent)}
          </div>
          <div className="text-xs text-gray-500">por evento</div>
        </div>

        {/* Total Events */}
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3 h-3 text-orange-600" />
            <span className="text-xs text-gray-600">Total Eventos</span>
          </div>
          <div className="text-lg font-bold text-gray-900">
            {analytics.totalEvents}
          </div>
          <div className="text-xs text-gray-500">seleccionados</div>
        </div>
      </div>

      {/* Audience Breakdown */}
      <div className="bg-white rounded-lg p-3 border border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="w-3 h-3 text-indigo-600" />
          <span className="text-xs font-medium text-gray-700">Desglose de Audiencia</span>
        </div>
        
        <div className="space-y-2">
          {cart.items.map((item, index) => {
            const totalAudience = (item.estimatedAttendance || 0) + (item.estimatedAttendanceTv || 0);
            const percentage = analytics.totalAudience > 0 ? (totalAudience / analytics.totalAudience) * 100 : 0;
            
            return (
              <div key={item.cartId} className="flex items-center justify-between text-xs">
                <div className="flex-1 min-w-0">
                  <div className="truncate text-gray-700">
                    {item.homeTeamName} vs {item.awayTeamName}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-gray-500 whitespace-nowrap">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="ml-2 text-right">
                  <div className="font-medium text-gray-900">
                    {formatNumber(totalAudience)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      {analytics.recommendations && analytics.recommendations.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="text-xs font-medium text-blue-800 mb-2">Recomendaciones</div>
          <ul className="space-y-1">
            {analytics.recommendations.slice(0, 2).map((recommendation, index) => (
              <li key={index} className="text-xs text-blue-700 flex items-start gap-1">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CartAnalytics;