import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, MapPin } from 'lucide-react';
import { Button } from '../components/Button';
import { useSportEvents } from '../hooks/useSportEvents';
import { constants } from '../config/constants';
import { useMomentPurchases } from '../hooks/useMomentPurchases';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentApi } from '../api/payment';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

const stripePromise = loadStripe('pk_live_51OHbGYHQkntOzh4KQFTksD7uHP2GOH8JjjVmkxE9uJm6dfx6OdwmWAl3wrozgTpb1330qbdthjXopdSNx7cM8sub00Z0maRpBS');

// Componente de formulario de pago
const PaymentForm = ({ onSuccess, onError, amount }: { onSuccess: (id: any) => void, onError: (error: any) => void, amount: number }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { state } = useLocation();
  const { id } = useParams();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {

      const PurchaseDetails = state.selectedMoments.map((item: any) => ({
        momentId: item.momentId,
        minutes: item.minutes.join(','),
        price: item.price
      }));

      const data = {
        sportEventId: id ?? "0",
        PurchaseDetails,
        amount,
        currency: 'cop'
      };
      
      const { clientSecret } = await paymentApi.createPaymentIntent(data);

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              name: user?.username,
              email:user?.email, 
            },
          },
        }
      );

      if (stripeError) {
        onError(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      }
    } catch (error) {
      onError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="p-3 bg-white rounded-lg border border-[#B8B8C0]">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        icon={ArrowRight}
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? 'Procesando...' : `Pagar ${amount.toLocaleString('es-CO')} COP`}
      </Button>
    </form>
  );
};

export function PaymentDetails() {
  const navigate = useNavigate();
  const { purchaseMoments } = useMomentPurchases();
  const { id } = useParams();
  const { state } = useLocation();
  const { event } = useSportEvents({ id });

  if (!event) {
    return <div></div>;
  }

  const handlePaymentSuccess = async (paymentId: string) => {
    const PurchaseDetails = state.selectedMoments.map((item: any) => ({
      momentId: item.momentId,
      minutes: item.minutes.join(',')
    }));

    const data = {
      sportEventId: id ?? "0",
      FilePath: state.file,
      PurchaseDetails,
      paymentId
    };

    try {
      await purchaseMoments(data);
      alert("Pago exitoso");
      //navigate('/success');
    } catch (error) {
      alert(error);
     }
  };

  const handlePaymentError = (error: any) => {
    alert(`Error en el pago: ${error}`);
  };

  // Calcular el monto total
  const totalAmount = state.selectedMoments.reduce((total: number, moment: any) => 
                    total + (moment.price * moment.minutes.length), 0); // Este valor debería venir de tu lógica de negocio

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:ml-64">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="p-2">
              <ArrowLeft size={24} className="text-primary-400" />
            </button>
            <div className="w-[150.95px] h-[24.94px] bg-primary" />
            <div className="flex items-center gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-[5.46px] h-[5.46px] rounded-full ${
                    i === 2
                      ? 'border-[1.64px] border-[#B8B8C0]'
                      : 'bg-[#E8E8EB]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <h1 className="text-[36px] font-semibold text-[#1A1A35] text-center mb-8">
          Resumen
        </h1>

        {/* Event Card */}
        <div className="flex gap-3 mb-6">
          <div className="w-[142px] h-[94px] bg-white rounded-lg overflow-hidden">
            <img
                src={`${constants.base_path}/${event.stadiumPhotos[0]}`}
              alt={event.stadiumName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-[20px] font-medium text-[#171725] leading-7 tracking-[0.1px] mb-2">
              {event.homeTeamName} vs {event.awayTeamName}
            </h2>
            <div className="flex items-center gap-1 mb-2">
              <MapPin size={16} className="text-[#9CA4AB]" />
              <span className="text-[12px] text-[#9CA4AB]">{event.stadiumName}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-[18px] h-[18px] relative">
                <div className="w-[15.10px] h-[14.40px] absolute left-[1.45px] top-[1.80px] border-[1.5px] border-primary" />
              </div>
              <span className="text-[14px] text-[#9696A2]">4.91 (35 Reviews)</span>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-[20px] p-5 shadow-[0px_10px_10px_-5px_rgba(0,0,0,0.04)] mb-6">
          {/* General Section */}
          <div className="mb-5">
            <h3 className="text-[20px] font-semibold text-[#1A1A35] mb-4">
              General
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MapPin size={20} className="text-primary" />
                  <span className="text-[14px] text-primary">Ubicación:</span>
                </div>
                <span className="text-[14px] text-[#1A1A35]">{event.stadiumName}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-primary" />
                  <span className="text-[14px] text-primary">Fecha:</span>
                </div>
                <span className="text-[14px] text-[#1A1A35]">
                  {new Date(event.eventDate).toLocaleDateString('es-CO', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-[#BFC6CC] my-5" />

          {/* Costs Section */}
          <div>
            <h3 className="text-[20px] font-semibold text-[#1A1A35] mb-4">
              Costos
            </h3>
            <div className="space-y-4">
              {state.selectedMoments.map((moment: any, index: number) => {
                const getMomentName = (momentId: string) => {
                  switch(momentId) {
                    case 'FirstHalf':
                      return 'Primer Tiempo';
                    case 'SecondHalf':
                      return 'Segundo Tiempo';
                    case 'Halftime':
                      return 'Medio Tiempo';
                    default:
                      return momentId;
                  }
                };

                const totalPrice = moment.price * moment.minutes.length;

                return (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[14px] font-medium text-[#1A1A35]">
                        {getMomentName(moment.momentId)}
                      </span>
                      <span className="text-[14px] font-medium text-[#1A1A35]">
                        {totalPrice.toLocaleString('es-CO')} COP
                      </span>
                    </div>
                    <div className="text-[12px] text-[#9CA4AB]">
                      <div>Minutos seleccionados: {moment.minutes.join(', ')}</div>
                      <div>Precio por minuto: {moment.price.toLocaleString('es-CO')} COP</div>
                      <div>Total: {moment.minutes.length} min × {moment.price.toLocaleString('es-CO')} COP</div>
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between items-center pt-3 border-t border-[#BFC6CC]">
                <span className="text-[16px] font-semibold text-[#1A1A35]">
                  Total a pagar:
                </span>
                <span className="text-[16px] font-semibold text-[#1A1A35]">
                  {state.selectedMoments.reduce((total: number, moment: any) => 
                    total + (moment.price * moment.minutes.length), 0).toLocaleString('es-CO')} COP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <Elements stripe={stripePromise}>
          <PaymentForm
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            amount={totalAmount}
          />
        </Elements>

        {/* Terms and Time Info */}
        <div className="text-center mt-6 mb-8">
          <p className="text-[12px] text-[#1A1A35] mb-4">
            Tu momento saldrá entre las <strong>04:45 PM</strong> y las{' '}
            <strong>05:45 PM</strong>. Se validará la hora de salida una vez se
            haya confirmado el pago.
          </p>
          <p className="text-[12px] text-[#1A1A35]">
            Al crear un anuncio con Shareflow aceptas las{' '}
            <a href="#" className="underline">
              condiciones y directrices de publicidad
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}