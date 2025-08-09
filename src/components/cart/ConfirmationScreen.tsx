import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Download, 
  Share2, 
  Copy, 
  Calendar,
  Clock,
  MapPin,
  Home,
  ShoppingBag,
  Star,
  Check
} from 'lucide-react';
import { CartEvent } from '../../types/cart';
import { Button } from '../Button';
import { constants } from '../../config/constants';

interface ConfirmationScreenProps {
  transactionId: string;
  purchasedEvents: CartEvent[];
  totalAmount: number;
  onContinueShopping: () => void;
}

export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  transactionId,
  purchasedEvents,
  totalAmount,
  onContinueShopping
}) => {
  const [copied, setCopied] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const copyTransactionId = async () => {
    try {
      await navigator.clipboard.writeText(transactionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying transaction ID:', error);
    }
  };

  const shareTransaction = () => {
    const text = `¡Compra exitosa! ID: ${transactionId}`;
    const url = `${window.location.origin}/transaction/${transactionId}`;

    if (navigator.share) {
      navigator.share({
        title: 'Compra de eventos deportivos - Shareflow',
        text,
        url
      });
    } else {
      // Fallback to email
      const subject = encodeURIComponent('Compra de eventos deportivos - Shareflow');
      const body = encodeURIComponent(`${text}\n\nVer detalles: ${url}`);
      window.open(`mailto:?subject=${subject}&body=${body}`);
    }
  };

  const downloadReceipt = () => {
    // Simulate receipt download
    const receiptData = {
      transactionId,
      date: new Date().toISOString(),
      events: purchasedEvents.map(event => ({
        name: `${event.homeTeamName} vs ${event.awayTeamName}`,
        date: event.eventDate,
        stadium: event.stadiumName,
        price: event.finalPrice || event.estimatedPrice
      })),
      total: totalAmount
    };

    const dataStr = JSON.stringify(receiptData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `shareflow-receipt-${transactionId}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ¡Compra exitosa!
        </h1>
        <p className="text-gray-600">
          Tu compra ha sido procesada correctamente
        </p>
      </motion.div>

      {/* Transaction Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Detalles de la transacción
        </h2>

        {/* Transaction ID */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
          <div>
            <span className="text-sm text-gray-600">ID de transacción:</span>
            <div className="font-mono text-sm font-medium text-gray-900">
              {transactionId}
            </div>
          </div>
          <button
            onClick={copyTransactionId}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            title="Copiar ID"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* Purchase Summary */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Eventos comprados:</span>
            <span className="font-medium">{purchasedEvents.length}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Fecha de compra:</span>
            <span className="font-medium">
              {new Date().toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          
          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between">
              <span className="text-base font-semibold text-gray-900">Total pagado:</span>
              <span className="text-xl font-bold text-primary">
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Purchased Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          Eventos adquiridos
        </h2>

        <div className="space-y-4">
          {purchasedEvents.map((event) => (
            <div key={event.cartId} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={`${constants.base_path}/${event.stadiumPhotos[0]}`}
                  alt={event.stadiumName}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {event.homeTeamName} vs {event.awayTeamName}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(event.eventDate).toLocaleDateString('es-CO')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {event.eventTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {event.stadiumName}
                  </span>
                </div>
                
                {/* Moments Summary */}
                {event.selectedMoments && event.selectedMoments.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    {event.selectedMoments.length} momento{event.selectedMoments.length !== 1 ? 's' : ''} publicitario{event.selectedMoments.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className="font-bold text-gray-900">
                  {formatPrice(event.finalPrice || event.estimatedPrice)}
                </div>
                <div className="text-sm text-green-600 flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Confirmado
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-4"
      >
        {/* Primary Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={downloadReceipt}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Descargar recibo
          </button>
          
          <button
            onClick={shareTransaction}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Compartir
          </button>
          
          <button
            onClick={() => window.open('/mis-campanas', '_blank')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
          >
            <Star className="w-4 h-4" />
            Ver campañas
          </button>
        </div>

        {/* Continue Shopping */}
        <Button
          onClick={onContinueShopping}
          variant="primary"
          size="lg"
          fullWidth
          icon={Home}
        >
          Continuar comprando
        </Button>
      </motion.div>

      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center"
      >
        <p className="text-sm text-green-700">
          <strong>¡Felicitaciones!</strong> Tus anuncios comenzarán a mostrarse según la programación de cada evento.
          Recibirás un email con todos los detalles de tu compra.
        </p>
      </motion.div>
    </div>
  );
};

export default ConfirmationScreen;