export const constants = {
  // API Configuration
  api_url: import.meta.env.VITE_API_URL || 'https://api.shareflow.me/api',
  base_path: import.meta.env.VITE_BASE_PATH || 'https://api.shareflow.me',
  
  // Application Configuration
  app_name: 'Shareflow',
  app_version: '1.0.0',
  
  // Default Images and Assets
  default_screen_image: '/placeholder-screen.jpg',
  default_user_avatar: '/default-avatar.png',
  
  // Image Base URL for API images
  images_base_url: import.meta.env.VITE_IMAGES_BASE_URL || 'https://api.shareflow.me',
  
  // Pagination
  default_page_size: 20,
  max_page_size: 100,
  
  // Cache configuration
  cache_duration: 5 * 60 * 1000, // 5 minutes in milliseconds
  
  // Map configuration
  default_map_center: {
    lat: 4.7110,
    lng: -74.0721
  },
  default_map_zoom: 11,
  
  // Price formatting
  currency: 'COP',
  locale: 'es-CO'
};