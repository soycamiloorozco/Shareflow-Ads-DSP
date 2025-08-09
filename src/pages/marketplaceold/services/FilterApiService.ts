import { 
  VENUE_CATEGORIES, 
  CITIES, 
  PRICE_RANGES,
  VenueParentCategory,
  VenueChildCategory 
} from '../../../types/venue-categories';
import { Screen } from '../types';

export interface FilterQuery {
  search?: string;
  cities?: string[];
  categories?: string[];
  priceRanges?: string[];
  allowsMoments?: boolean;
  minRating?: number;
  favoritesOnly?: boolean;
  excludeCircuits?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilteredScreensResponse {
  screens: Screen[];
  totalCount: number;
  facets: {
    cities: Array<{ id: string; name: string; count: number }>;
    categories: Array<{ id: string; name: string; count: number }>;
    priceRanges: Array<{ id: string; name: string; count: number }>;
  };
}

class FilterApiService {
  private baseUrl = '/api/marketplace';

  /**
   * Apply filters to screens and return filtered results
   */
  async applyFilters(
    screens: Screen[], 
    filterQuery: FilterQuery
  ): Promise<FilteredScreensResponse> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      let filteredScreens = [...screens];

      // Apply search filter
      if (filterQuery.search) {
        const searchTerm = filterQuery.search.toLowerCase();
        filteredScreens = filteredScreens.filter(screen =>
          screen.name.toLowerCase().includes(searchTerm) ||
          screen.location.toLowerCase().includes(searchTerm) ||
          screen.category?.name?.toLowerCase().includes(searchTerm)
        );
      }

      // Apply city filter
      if (filterQuery.cities && filterQuery.cities.length > 0) {
        filteredScreens = filteredScreens.filter(screen => {
          const screenCity = this.extractCityFromLocation(screen.location);
          return filterQuery.cities!.some(cityId => {
            const city = CITIES.find(c => c.id === cityId);
            return city && screenCity.toLowerCase().includes(city.name.toLowerCase());
          });
        });
      }

      // Apply category filter
      if (filterQuery.categories && filterQuery.categories.length > 0) {
        filteredScreens = filteredScreens.filter(screen => {
          return filterQuery.categories!.some(categoryId => {
            const venueCategory = VENUE_CATEGORIES[categoryId];
            if (!venueCategory) return false;
            
            // Check if screen matches category keywords
            const screenText = `${screen.name} ${screen.location} ${screen.category?.name || ''}`.toLowerCase();
            return venueCategory.mlFeatures.primaryKeywords.some(keyword =>
              screenText.includes(keyword.toLowerCase())
            ) || venueCategory.mlFeatures.secondaryKeywords.some(keyword =>
              screenText.includes(keyword.toLowerCase())
            );
          });
        });
      }

      // Apply price range filter
      if (filterQuery.priceRanges && filterQuery.priceRanges.length > 0) {
        filteredScreens = filteredScreens.filter(screen => {
          const screenPrice = this.getScreenMinPrice(screen);
          return filterQuery.priceRanges!.some(rangeId => {
            const range = PRICE_RANGES.find(r => r.id === rangeId);
            if (!range) return false;
            return screenPrice >= range.min && screenPrice <= range.max;
          });
        });
      }

      // Apply moments filter
      if (filterQuery.allowsMoments !== undefined) {
        filteredScreens = filteredScreens.filter(screen =>
          Boolean(screen.pricing?.allowMoments) === filterQuery.allowsMoments
        );
      }

      // Apply rating filter
      if (filterQuery.minRating !== undefined) {
        filteredScreens = filteredScreens.filter(screen =>
          (screen.rating || 0) >= filterQuery.minRating!
        );
      }

      // Apply favorites filter (would need user context)
      if (filterQuery.favoritesOnly) {
        // For now, just return screens with high ratings as "favorites"
        filteredScreens = filteredScreens.filter(screen => (screen.rating || 0) >= 4.5);
      }

      // Apply sorting
      if (filterQuery.sortBy) {
        filteredScreens = this.sortScreens(filteredScreens, filterQuery.sortBy, filterQuery.sortOrder);
      }

      // Generate facets for the filtered results
      const facets = this.generateFacets(filteredScreens);

      return {
        screens: filteredScreens,
        totalCount: filteredScreens.length,
        facets
      };

    } catch (error) {
      console.error('Error applying filters:', error);
      throw new Error('Failed to apply filters');
    }
  }

  /**
   * Get filter suggestions based on current query
   */
  async getFilterSuggestions(query: string): Promise<Array<{
    type: 'city' | 'category' | 'screen';
    id: string;
    label: string;
    count: number;
  }>> {
    const suggestions: Array<{
      type: 'city' | 'category' | 'screen';
      id: string;
      label: string;
      count: number;
    }> = [];

    const searchTerm = query.toLowerCase();

    // City suggestions
    CITIES.forEach(city => {
      if (city.name.toLowerCase().includes(searchTerm)) {
        suggestions.push({
          type: 'city',
          id: city.id,
          label: city.name,
          count: city.count
        });
      }
    });

    // Category suggestions
    Object.entries(VENUE_CATEGORIES).forEach(([id, category]) => {
      const matchesKeywords = category.mlFeatures.primaryKeywords.some(keyword =>
        keyword.toLowerCase().includes(searchTerm)
      ) || category.mlFeatures.secondaryKeywords.some(keyword =>
        keyword.toLowerCase().includes(searchTerm)
      );

      if (matchesKeywords) {
        suggestions.push({
          type: 'category',
          id,
          label: category.mlFeatures.primaryKeywords[0] || id,
          count: Math.floor(category.mlFeatures.avgFootTraffic / 1000)
        });
      }
    });

    return suggestions.slice(0, 10);
  }

  /**
   * Get popular filter combinations
   */
  getPopularFilterCombinations(): Array<{
    id: string;
    name: string;
    description: string;
    filters: FilterQuery;
  }> {
    return [
      {
        id: 'high-traffic',
        name: 'Alto Tráfico',
        description: 'Pantallas en ubicaciones de alto tráfico',
        filters: {
          categories: ['retail_mall', 'transit_airports', 'transit_buses'],
          minRating: 4.0
        }
      },
      {
        id: 'budget-friendly',
        name: 'Económicas',
        description: 'Pantallas con precios accesibles',
        filters: {
          priceRanges: ['budget', 'mid-range']
        }
      },
      {
        id: 'premium-locations',
        name: 'Ubicaciones Premium',
        description: 'Las mejores ubicaciones de la ciudad',
        filters: {
          categories: ['retail_mall', 'transit_airports'],
          minRating: 4.5,
          priceRanges: ['premium', 'luxury']
        }
      },
      {
        id: 'moments-enabled',
        name: 'Con Momentos',
        description: 'Pantallas que permiten anuncios de 15 segundos',
        filters: {
          allowsMoments: true
        }
      }
    ];
  }

  // Private helper methods

  private extractCityFromLocation(location: string): string {
    const parts = location.split(',');
    return parts[parts.length - 1]?.trim() || '';
  }

  private getScreenMinPrice(screen: Screen): number {
    if (!screen.pricing?.bundles) return 0;
    
    const prices = [];
    if (screen.pricing.bundles.hourly?.enabled) {
      prices.push(screen.pricing.bundles.hourly.price);
    }
    if (screen.pricing.bundles.daily?.enabled) {
      prices.push(screen.pricing.bundles.daily.price / 24); // Convert to hourly
    }
    if (screen.pricing.bundles.weekly?.enabled) {
      prices.push(screen.pricing.bundles.weekly.price / (24 * 7)); // Convert to hourly
    }
    
    return prices.length > 0 ? Math.min(...prices) : screen.price || 0;
  }

  private sortScreens(screens: Screen[], sortBy: string, sortOrder: 'asc' | 'desc' = 'desc'): Screen[] {
    const sorted = [...screens].sort((a, b) => {
      let aValue: number | string = 0;
      let bValue: number | string = 0;

      switch (sortBy) {
        case 'price':
          aValue = this.getScreenMinPrice(a);
          bValue = this.getScreenMinPrice(b);
          break;
        case 'rating':
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case 'views':
          aValue = a.views?.daily || 0;
          bValue = b.views?.daily || 0;
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        default: // relevance
          aValue = (a.rating || 0) * (a.views?.daily || 1);
          bValue = (b.rating || 0) * (b.views?.daily || 1);
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    return sorted;
  }

  private generateFacets(screens: Screen[]) {
    const cityFacets = new Map<string, number>();
    const categoryFacets = new Map<string, number>();
    const priceFacets = new Map<string, number>();

    screens.forEach(screen => {
      // City facets
      const city = this.extractCityFromLocation(screen.location);
      const cityId = CITIES.find(c => c.name.toLowerCase() === city.toLowerCase())?.id;
      if (cityId) {
        cityFacets.set(cityId, (cityFacets.get(cityId) || 0) + 1);
      }

      // Category facets (simplified)
      const screenText = `${screen.name} ${screen.location}`.toLowerCase();
      Object.entries(VENUE_CATEGORIES).forEach(([categoryId, category]) => {
        const matches = category.mlFeatures.primaryKeywords.some(keyword =>
          screenText.includes(keyword.toLowerCase())
        );
        if (matches) {
          categoryFacets.set(categoryId, (categoryFacets.get(categoryId) || 0) + 1);
        }
      });

      // Price facets
      const price = this.getScreenMinPrice(screen);
      PRICE_RANGES.forEach(range => {
        if (price >= range.min && price <= range.max) {
          priceFacets.set(range.id, (priceFacets.get(range.id) || 0) + 1);
        }
      });
    });

    return {
      cities: Array.from(cityFacets.entries()).map(([id, count]) => {
        const city = CITIES.find(c => c.id === id);
        return {
          id,
          name: city?.name || id,
          count
        };
      }),
      categories: Array.from(categoryFacets.entries()).map(([id, count]) => {
        const category = VENUE_CATEGORIES[id];
        return {
          id,
          name: category?.mlFeatures.primaryKeywords[0] || id,
          count
        };
      }),
      priceRanges: Array.from(priceFacets.entries()).map(([id, count]) => {
        const range = PRICE_RANGES.find(r => r.id === id);
        return {
          id,
          name: range?.label || id,
          count
        };
      })
    };
  }
}

export const filterApiService = new FilterApiService();