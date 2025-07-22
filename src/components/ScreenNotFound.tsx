import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Home, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface ScreenNotFoundProps {
  screenId?: string;
  availableScreens?: string[];
}

export const ScreenNotFound: React.FC<ScreenNotFoundProps> = ({ 
  screenId, 
  availableScreens = [] 
}) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoToMarketplace = () => {
    navigate('/marketplace');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-12 h-12 text-red-600" />
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Pantalla no encontrada
        </h1>
        
        <p className="text-gray-600 mb-6">
          {screenId 
            ? `La pantalla con ID "${screenId}" no existe o ha sido removida.`
            : 'La pantalla que buscas no está disponible.'
          }
        </p>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && availableScreens.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-yellow-800 mb-2">
              Debug Info (Development)
            </h3>
            <p className="text-sm text-yellow-700 mb-2">
              Pantallas disponibles ({availableScreens.length}):
            </p>
            <div className="max-h-32 overflow-y-auto">
              <ul className="text-xs text-yellow-600 space-y-1">
                {availableScreens.slice(0, 10).map((id, index) => (
                  <li key={index} className="font-mono">• {id}</li>
                ))}
                {availableScreens.length > 10 && (
                  <li className="text-yellow-500">... y {availableScreens.length - 10} más</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleGoToMarketplace}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Search className="w-4 h-4 mr-2" />
            Ver todas las pantallas
          </Button>

          <div className="flex gap-3">
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>

            <Button
              onClick={handleGoHome}
              variant="outline"
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              Inicio
            </Button>
          </div>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-500 mt-6">
          ¿Necesitas ayuda? Contacta nuestro{' '}
          <a 
            href="/support" 
            className="text-blue-600 hover:text-blue-700 underline"
          >
            soporte técnico
          </a>
        </p>
      </div>
    </div>
  );
};