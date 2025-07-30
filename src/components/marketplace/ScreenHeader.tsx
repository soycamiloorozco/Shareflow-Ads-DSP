import React from 'react';
import { Heart, Share2, Star, MapPin, Eye, Linkedin, Twitter, Facebook } from 'lucide-react';
import { Screen } from '../../types';
import { Button } from '../Button';

interface ScreenHeaderProps {
  screen: Screen;
  isLiked: boolean;
  setIsLiked: (liked: boolean) => void;
  onShare: (platform?: string) => void;
  isSticky: boolean;
  activeSection: 'overview' | 'specifications' | 'location' | 'reviews';
  onSectionChange: (section: 'overview' | 'specifications' | 'location' | 'reviews') => void;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  screen,
  isLiked,
  setIsLiked,
  onShare,
  isSticky,
  activeSection,
  onSectionChange
}) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">{screen.name}</h1>
          
          <div className="flex flex-wrap items-center gap-3 mt-2 text-neutral-600">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>{screen.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-medium">{screen.rating}</span>
              <span className="text-neutral-500">({screen.reviews} reseñas)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>{screen.views.daily.toLocaleString()} vistas/día</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${screen.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {screen.availability ? 'Disponible' : 'No disponible'}
              </div>
            </div>
          </div>
        </div>
        
        {!isSticky && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onShare('facebook')}
              className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition"
              aria-label="Compartir en Facebook"
            >
              <Facebook className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => onShare('twitter')}
              className="w-9 h-9 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:opacity-90 transition"
              aria-label="Compartir en Twitter"
            >
              <Twitter className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => onShare('linkedin')}
              className="w-9 h-9 rounded-full bg-[#0e76a8] text-white flex items-center justify-center hover:opacity-90 transition"
              aria-label="Compartir en LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </button>
            
            <button
              className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-90 transition"
              onClick={() => onShare('whatsapp')}
              aria-label="Compartir en WhatsApp"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {/* Navegación de secciones */}
      <div className="mt-8 border-b border-neutral-200">
        <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => onSectionChange('overview')}
            className={`text-sm font-medium pb-3 px-1 border-b-2 whitespace-nowrap transition ${activeSection === 'overview' ? 'border-primary text-primary' : 'border-transparent text-neutral-600 hover:text-neutral-900'}`}
          >
            Vista general
          </button>
          <button 
            onClick={() => onSectionChange('specifications')}
            className={`text-sm font-medium pb-3 px-1 border-b-2 whitespace-nowrap transition ${activeSection === 'specifications' ? 'border-primary text-primary' : 'border-transparent text-neutral-600 hover:text-neutral-900'}`}
          >
            Especificaciones
          </button>
          <button 
            onClick={() => onSectionChange('location')}
            className={`text-sm font-medium pb-3 px-1 border-b-2 whitespace-nowrap transition ${activeSection === 'location' ? 'border-primary text-primary' : 'border-transparent text-neutral-600 hover:text-neutral-900'}`}
          >
            Ubicación
          </button>
          <button 
            onClick={() => onSectionChange('reviews')}
            className={`text-sm font-medium pb-3 px-1 border-b-2 whitespace-nowrap transition ${activeSection === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-neutral-600 hover:text-neutral-900'}`}
          >
            Reseñas
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScreenHeader; 