import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, Clock, MapPin, Image, ArrowRight, FileText, Download } from 'lucide-react';
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

interface ScreenConfirmationProps {
  screen: Screen;
  bundle: Bundle | null;
  selectedDate: Date | null;
  selectedHour: number;
  selectedMinute: number;
  onBackToMarketplace: () => void;
}

const ScreenConfirmation: React.FC<ScreenConfirmationProps> = ({
  screen,
  bundle,
  selectedDate,
  selectedHour,
  selectedMinute,
  onBackToMarketplace
}) => {
  // Generate a random order number
  const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  const orderDate = new Date().toLocaleDateString('es-ES');
  
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
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto text-center mb-10"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-bold text-neutral-900 mb-3">¡Compra completada con éxito!</h1>
        <p className="text-lg text-neutral-600">
          Tu publicidad ha sido programada correctamente.
        </p>
      </motion.div>
      
      <Card className="max-w-4xl mx-auto">
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Resumen de la compra</h2>
              <p className="text-neutral-600 mt-1">Gracias por tu compra</p>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-neutral-600">Orden #{orderNumber}</p>
              <p className="text-sm text-neutral-600">Fecha: {orderDate}</p>
            </div>
          </div>
          
          <div className="grid gap-8 md:grid-cols-12 mt-8">
            {/* Detalles de la pantalla */}
            <div className="md:col-span-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Detalles de la pantalla</h3>
              
              <div className="rounded-lg border border-neutral-200 overflow-hidden">
                <div className="aspect-video bg-neutral-100 relative">
                  <img 
                    src={screen.image} 
                    alt={screen.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h4 className="font-bold text-lg">{screen.name}</h4>
                    <p className="text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {screen.location}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-neutral-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Fecha de publicación</p>
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
                    <p className="text-sm font-medium text-neutral-900">Plan contratado</p>
                    <p className="text-sm text-neutral-600">{bundle?.name}</p>
                    <p className="text-xs text-neutral-500">{bundle?.description}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Instrucciones */}
            <div className="md:col-span-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Próximos pasos</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-md">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900">Revisión de contenido</h4>
                      <p className="mt-1 text-sm text-neutral-600">
                        Nuestro equipo revisará tu creatividad para asegurar que cumple con nuestras políticas.
                        Este proceso suele tardar menos de 24 horas.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-md">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900">Confirmación final</h4>
                      <p className="mt-1 text-sm text-neutral-600">
                        Una vez aprobado el contenido, te enviaremos un correo electrónico de confirmación.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-md">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900">Publicación</h4>
                      <p className="mt-1 text-sm text-neutral-600">
                        Tu contenido se publicará en la fecha y hora programadas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Ver factura</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar comprobante</span>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-10 pt-6 border-t border-neutral-200 text-center">
            <p className="text-neutral-600 mb-4">
              Se ha enviado un resumen de esta compra a tu correo electrónico registrado.
            </p>
            
            <Button 
              onClick={onBackToMarketplace}
              className="flex items-center gap-2 mx-auto"
            >
              <span>Explorar más pantallas</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ScreenConfirmation; 