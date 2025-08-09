import { useMemo, useState } from 'react';
import { CartEvent } from '../types/cart';
import { SortOption, SortDirection } from '../components/cart/CartSorting';

export const useCartSorting = (items: CartEvent[]) => {
  const [sortBy, setSortBy] = useState<SortOption>('added');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedItems = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
          break;
        
        case 'price':
          const priceA = a.finalPrice || a.estimatedPrice;
          const priceB = b.finalPrice || b.estimatedPrice;
          comparison = priceA - priceB;
          break;
        
        case 'audience':
          const audienceA = (a.estimatedAttendance || 0) + (a.estimatedAttendanceTv || 0);
          const audienceB = (b.estimatedAttendance || 0) + (b.estimatedAttendanceTv || 0);
          comparison = audienceA - audienceB;
          break;
        
        case 'name':
          const nameA = `${a.homeTeamName} vs ${a.awayTeamName}`;
          const nameB = `${b.homeTeamName} vs ${b.awayTeamName}`;
          comparison = nameA.localeCompare(nameB);
          break;
        
        case 'added':
          comparison = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
          break;
        
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [items, sortBy, sortDirection]);

  const handleSortChange = (newSortBy: SortOption, newDirection: SortDirection) => {
    setSortBy(newSortBy);
    setSortDirection(newDirection);
  };

  return {
    sortedItems,
    sortBy,
    sortDirection,
    handleSortChange
  };
};

export default useCartSorting;