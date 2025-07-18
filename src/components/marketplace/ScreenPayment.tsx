import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ArrowLeft, Check, Calendar, Clock, MapPin, Image } from 'lucide-react';
import { Screen } from '../../types';
import { Button } from '../Button';
import { Card } from '../Card';

// Bundle interface
interface Bundle {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  spots: number;
  reach: number;
  isHighlighted?: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  name: string;
  expiry?: string;
  brand?: string;
}

interface ScreenPaymentProps {
  screen: Screen;
  bundle: Bundle | null;
  selectedDate: Date | null;
  selectedHour: number;
  selectedMinute: number;
  selectedPaymentMethod: string | null;
  setSelectedPaymentMethod: (id: string) => void;
  acceptTerms: boolean;
  setAcceptTerms: (accept: boolean) => void;
  onBack: () => void;
  onContinue: () => void;
}

const ScreenPayment: React.FC<ScreenPaymentProps> = ({
  screen,
  bundle,
  selectedDate,
  selectedHour,
  selectedMinute,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  acceptTerms,
  setAcceptTerms,
  onBack,
  onContinue
}) => {
  // Mock payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card-1',
      type: 'card',
      last4: '4242',
      name: 'Visa terminada en 4242',
      brand: 'visa',
      expiry: '12/25'
    },
    {
      id: 'card-2',
      type: 'card',
      last4: '5555',
      name: 'Mastercard terminada en 5555',
      brand: 'mastercard',
      expiry: '10/24'
    },
    {
      id: 'bank-1',
      type: 'bank',
      last4: '3456',
      name: 'Cuenta bancaria terminada en 3456'
    }
  ];
  
  // Calculate taxes and total
  const TAX_RATE = 0.19; // 19% IVA
  const subtotal = bundle?.price || 0;
  const taxes = subtotal * TAX_RATE;
  const total = subtotal + taxes;
  
  // Format price
  const formatPrice = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Format time
  const formatTime = (hour: number, minute: number) => {
    return `${hour}:${minute.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="my-8">
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Volver</span>
        </button>
        <h1 className="text-2xl font-bold text-neutral-900 ml-8">Completar pago</h1>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Métodos de pago */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="p-6 lg:p-8">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">
                <CreditCard className="w-5 h-5 inline-block mr-2 text-primary" />
                Método de pago
              </h3>
              
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border rounded-lg p-4 transition-all cursor-pointer
                      ${selectedPaymentMethod === method.id 
                        ? 'border-primary ring-1 ring-primary/10' 
                        : 'border-neutral-200 hover:border-neutral-300'}`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {method.type === 'card' ? (
                          <div className="w-10 h-8 bg-neutral-100 rounded flex items-center justify-center text-neutral-600">
                            {method.brand === 'visa' ? 'Visa' : method.brand === 'mastercard' ? 'MC' : 'Card'}
                          </div>
                        ) : (
                          <div className="w-10 h-8 bg-neutral-100 rounded flex items-center justify-center text-neutral-600">
                            Banco
                          </div>
                        )}
                        
                        <div>
                          <p className="font-medium text-neutral-900">{method.name}</p>
                          {method.type === 'card' && method.expiry && (
                            <p className="text-xs text-neutral-500">Expira: {method.expiry}</p>
                          )}
                        </div>
                      </div>
                      
                      {selectedPaymentMethod === method.id && (
                        <div className="flex-shrink-0 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-sm flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Agregar nuevo método de pago</span>
                  </Button>
                </div>
              </div>
              
              <div className="mt-8">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1"
                  />
                  <span className="text-sm text-neutral-700">
                    Acepto los <a href="#" className="text-primary hover:underline">Términos y Condiciones</a> y la 
                    <a href="#" className="text-primary hover:underline"> Política de Privacidad</a> para la compra de 
                    publicidad en esta pantalla.
                  </span>
                </label>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Resumen del pedido */}
        <div className="lg:col-span-1">
          <Card className="overflow-hidden sticky top-20">
            <div className="p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Resumen de compra</h3>
              
              <div className="space-y-4">
                <div className="rounded-lg border border-neutral-200 overflow-hidden">
                  <div className="aspect-video bg-neutral-100 relative">
                    <img 
                      src={screen.image} 
                      alt={screen.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-3">
                    <h4 className="font-medium text-neutral-900">{screen.name}</h4>
                    <p className="text-sm text-neutral-600">{screen.location}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-neutral-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Fecha</p>
                      <p className="text-sm text-neutral-600">
                        {selectedDate ? formatDate(selectedDate) : 'No seleccionada'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-neutral-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Hora</p>
                      <p className="text-sm text-neutral-600">
                        {formatTime(selectedHour, selectedMinute)} horas
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Image className="w-4 h-4 text-neutral-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Plan seleccionado</p>
                      <p className="text-sm text-neutral-600">{bundle?.name}</p>
                      <p className="text-xs text-neutral-500">{bundle?.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-3 mt-3 border-t border-neutral-200">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-neutral-600">Subtotal</span>
                    <span className="text-sm font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-neutral-600">IVA (19%)</span>
                    <span className="text-sm font-medium">{formatPrice(taxes)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-neutral-100">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-lg">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-neutral-50 border-t border-neutral-200">
              <Button 
                className="w-full justify-center"
                disabled={!selectedPaymentMethod || !acceptTerms}
                onClick={onContinue}
              >
                Confirmar y pagar
              </Button>
              
              <p className="text-xs text-neutral-500 text-center mt-3">
                Tu tarjeta será cargada inmediatamente por el monto total
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ScreenPayment; 