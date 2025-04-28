import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, MapPin } from 'lucide-react';
import { Button } from '../components/Button';
import { useSportEvents } from '../hooks/useSportEvents';
import { constants } from '../config/constants';
import { useMomentPurchases } from '../hooks/useMomentPurchases';

export function PaymentDetails() {
  const navigate = useNavigate();
  const { purchaseMoments } = useMomentPurchases();
  const { id } = useParams();
  const { state } = useLocation();
  
   const {event} = useSportEvents({id});
  
  if (!event) {
    return <div><h1>HELLO</h1></div>;
  }
  const Handlepayment = () => {
    const PurchaseDetails = state.selectedMoments.map((item: any) => {
      return {
        momentId: item.momentId,
        minutes: item.minutes.join(',')
      }
    });
    const data = {
      "sportEventId": id ?? "0",
      "FilePath": state.file,
      PurchaseDetails
    }
    purchaseMoments(data).then(() => {
      alert("Sucess")
    }).catch((error) => {
      alert(error)
    });
  }
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
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-primary" />
                  <span className="text-[14px] text-primary">Cantidad:</span>
                </div>
                <span className="text-[14px] text-[#1A1A35]">2 momentos</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-primary" />
                  <span className="text-[14px] text-primary">Precio por momento:</span>
                </div>
                <span className="text-[14px] text-[#1A1A35]">$2,252,800 COP</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-primary" />
                  <span className="text-[14px] text-primary">Total a pagar:</span>
                </div>
                <span className="text-[14px] text-[#1A1A35]">$4,500,000 COP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-white rounded-lg border border-[#B8B8C0]">
            <input
              type="text"
              placeholder="Número de tarjeta"
              className="flex-1 text-[12px] text-[#9696A2] bg-transparent outline-none"
            />
            <img
              src="/path/to/card-icons.png"
              alt="Card types"
              className="w-[97px] h-[27px]"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Fecha de caducidad"
                className="w-full p-3 text-[12px] text-[#9696A2] bg-white rounded-lg border border-[#B8B8C0]"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="CVV"
                className="w-full p-3 text-[12px] text-[#9696A2] bg-white rounded-lg border border-[#B8B8C0]"
              />
            </div>
          </div>

          <input
            type="text"
            placeholder="Nombre del titular"
            className="w-full p-3 text-[12px] text-[#9696A2] bg-white rounded-lg border border-[#B8B8C0]"
          />
        </div>

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

        {/* Pay Button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          icon={ArrowRight}
          onClick={Handlepayment}
        >
          Pagar Ahora
        </Button>
      </div>
    </div>
  );
}