import { useMemo, useState } from 'react';
import { CartEvent } from '../types/cart';

export const useCartSearch = (items: CartEvent[]) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }

    const query = searchQuery.toLowerCase().trim();
    
    return items.filter(item => {
      // Search in team names
      const homeTeamMatch = item.homeTeamName?.toLowerCase().includes(query);
      const awayTeamMatch = item.awayTeamName?.toLowerCase().includes(query);
      
      // Search in stadium name
      const stadiumMatch = item.stadiumName?.toLowerCase().includes(query);
      
      // Search in event date
      const eventDate = new Date(item.eventDate);
      const dateString = eventDate.toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).toLowerCase();
      const dateMatch = dateString.includes(query);
      
      // Search in configured moments
      const momentsMatch = item.selectedMoments?.some(moment => 
        moment.moment.toLowerCase().includes(query)
      );
      
      // Search in status
      const statusMatch = item.isConfigured 
        ? 'configurado'.includes(query) 
        : 'pendiente'.includes(query);

      return homeTeamMatch || awayTeamMatch || stadiumMatch || dateMatch || momentsMatch || statusMatch;
    });
  }, [items, searchQuery]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return {
    searchQuery,
    filteredItems,
    handleSearchChange,
    clearSearch,
    hasResults: filteredItems.length > 0,
    resultCount: filteredItems.length
  };
};

export default useCartSearch;