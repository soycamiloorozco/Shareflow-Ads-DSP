/**
 * Favorites Service
 * Manages user's favorite screens using localStorage
 */

interface FavoriteScreen {
  id: string;
  addedAt: string;
}

class FavoritesService {
  private readonly STORAGE_KEY = 'shareflow_favorites';

  /**
   * Get all favorite screen IDs
   */
  getFavorites(): string[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const favorites: FavoriteScreen[] = JSON.parse(stored);
      return favorites.map(fav => fav.id);
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  /**
   * Check if a screen is favorite
   */
  isFavorite(screenId: string): boolean {
    const favorites = this.getFavorites();
    return favorites.includes(screenId);
  }

  /**
   * Add screen to favorites
   */
  addFavorite(screenId: string): boolean {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      let favorites: FavoriteScreen[] = stored ? JSON.parse(stored) : [];
      
      // Check if already exists
      if (favorites.some(fav => fav.id === screenId)) {
        return true;
      }
      
      favorites.push({
        id: screenId,
        addedAt: new Date().toISOString()
      });
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      return false;
    }
  }

  /**
   * Remove screen from favorites
   */
  removeFavorite(screenId: string): boolean {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return true;
      
      let favorites: FavoriteScreen[] = JSON.parse(stored);
      favorites = favorites.filter(fav => fav.id !== screenId);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(screenId: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const isFav = this.isFavorite(screenId);
        const success = isFav ? this.removeFavorite(screenId) : this.addFavorite(screenId);
        resolve(success);
      } catch (error) {
        console.error('Error toggling favorite:', error);
        resolve(false);
      }
    });
  }

  /**
   * Clear all favorites
   */
  clearFavorites(): boolean {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing favorites:', error);
      return false;
    }
  }

  /**
   * Get favorites count
   */
  getFavoritesCount(): number {
    return this.getFavorites().length;
  }

  /**
   * Get favorite screens with metadata
   */
  getFavoritesWithMetadata(): FavoriteScreen[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error getting favorites with metadata:', error);
      return [];
    }
  }
}

// Export singleton instance
const favoritesService = new FavoritesService();
export default favoritesService; 