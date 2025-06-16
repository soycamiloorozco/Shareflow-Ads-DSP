import React, { useEffect, useState } from 'react';
import { MapPin, Search } from 'lucide-react';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
    googleMapsLoaded: boolean;
  }
}

interface LocationInputProps {
  value: string;
  onChange: (address: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder?: string;
}

export const LocationInput: React.FC<LocationInputProps> = ({ 
  value, 
  onChange, 
  placeholder = "Buscar ubicación..." 
}) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.googleMapsLoaded) {
      return;
    }

    // Load Google Maps script dynamically
    const loadGoogleMapsScript = () => {
      // Check if script is already in the document
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAnBl7NvXWDhZFUn3aov6-bHEV7j5rzLuY&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    // Initialize map callback only if not already defined
    if (!window.initMap) {
      window.initMap = () => {
        console.log('Google Maps loaded successfully');
        window.googleMapsLoaded = true;
      };
    }

    loadGoogleMapsScript();
  }, []);

  const searchLocations = async (query: string) => {
    if (query.length < 3 || !window.google) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const service = new window.google.maps.places.AutocompleteService();
      const request = {
        input: query,
        componentRestrictions: { country: 'co' }, // Restrict to Colombia
        types: ['establishment', 'geocode']
      };

      service.getPlacePredictions(request, (predictions: any[], status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions.slice(0, 5));
        } else {
          setSuggestions([]);
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Error searching locations:', error);
      setIsLoading(false);
    }
  };

  const selectLocation = (suggestion: any) => {
    const placesService = new window.google.maps.places.PlacesService(
      document.createElement('div')
    );

    const request = {
      placeId: suggestion.place_id,
      fields: ['geometry', 'formatted_address', 'name']
    };

    placesService.getDetails(request, (place: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry) {
        const coordinates = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        
        onChange(suggestion.description, coordinates);
        setShowSuggestions(false);
        setSuggestions([]);
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(true);
    searchLocations(newValue);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      {/* Location Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              type="button"
              onClick={() => selectLocation(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-neutral-50 flex items-start gap-3 border-b border-neutral-100 last:border-b-0"
            >
              <MapPin className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">
                  {suggestion.structured_formatting?.main_text || suggestion.description.split(',')[0]}
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  {suggestion.structured_formatting?.secondary_text || suggestion.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationInput;