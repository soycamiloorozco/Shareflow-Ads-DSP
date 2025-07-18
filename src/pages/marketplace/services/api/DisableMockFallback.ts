/**
 * Disable Mock Fallback - Herramienta para deshabilitar temporalmente el fallback mock
 * Esto fuerza el uso de la API real y muestra errores reales
 */

import MarketplaceApiService from './MarketplaceApiService';

export async function disableMockFallback(): Promise<void> {
  console.log('🚫 DESHABILITANDO FALLBACK MOCK - SOLO API REAL');
  console.log('=' .repeat(50));

  // Crear una versión modificada del MarketplaceApiService sin fallback
  const originalGetScreens = MarketplaceApiService.getScreens.bind(MarketplaceApiService);
  
  // Sobrescribir temporalmente el método getScreens
  MarketplaceApiService.getScreens = async function(filters = {}) {
    console.log('🎯 Llamando API real SIN fallback mock...');
    
    try {
      const result = await originalGetScreens(filters);
      console.log('✅ API real funcionó:', result);
      return result;
    } catch (error) {
      console.error('❌ API real falló - NO HAY FALLBACK:', error);
      throw error; // Re-lanzar el error sin fallback
    }
  };

  console.log('✅ Fallback mock deshabilitado');
  console.log('🔄 Recarga la página para ver solo datos reales de la API');
  console.log('💡 Si no ves pantallas, es porque la API real tiene problemas');
}

export async function testRealApiOnly(): Promise<void> {
  console.log('🧪 PROBANDO SOLO API REAL - SIN MOCK');
  console.log('=' .repeat(40));

  const baseUrl = 'https://api.shareflow.me/api';
  const authToken = localStorage.getItem('authToken');
  
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    console.log('📍 Probando:', `${baseUrl}/Marketplace/screens`);
    console.log('🔑 Con token:', authToken ? 'Sí' : 'No');

    const response = await fetch(`${baseUrl}/Marketplace/screens`, {
      method: 'GET',
      headers,
    });

    console.log('📡 Status:', response.status, response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API REAL FUNCIONA:');
      console.log('📊 Datos recibidos:', data);
      
      if (data.success && data.data && data.data.screens) {
        console.log(`🎯 ${data.data.screens.length} pantallas encontradas en la API real`);
        
        if (data.data.screens.length === 0) {
          console.log('⚠️ LA BASE DE DATOS ESTÁ VACÍA O LAS PANTALLAS NO SON PÚBLICAS');
        } else {
          console.log('🔍 Primera pantalla de la API real:');
          console.log(data.data.screens[0]);
        }
      }
    } else {
      const errorText = await response.text();
      console.error('❌ API REAL FALLÓ:');
      console.error('📝 Status:', response.status);
      console.error('📝 Error:', errorText);
      
      if (response.status === 401) {
        console.error('🔑 PROBLEMA DE AUTENTICACIÓN - Token inválido o expirado');
      } else if (response.status === 404) {
        console.error('🚫 ENDPOINT NO ENCONTRADO - Verifica que /api/Marketplace/screens existe');
      } else if (response.status === 500) {
        console.error('🔥 ERROR DEL SERVIDOR - Problema en el backend');
      }
    }

  } catch (error) {
    console.error('🚨 ERROR DE CONEXIÓN:');
    console.error(error);
    console.error('💡 Posibles causas:');
    console.error('  - Backend no está corriendo');
    console.error('  - URL incorrecta');
    console.error('  - Problema de CORS');
    console.error('  - Problema de red');
  }
}

// Hacer las funciones disponibles globalmente para usar desde la consola
(window as any).disableMockFallback = disableMockFallback;
(window as any).testRealApiOnly = testRealApiOnly;

// Auto-ejecutar la prueba
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    testRealApiOnly();
  }, 500);
}

export default { disableMockFallback, testRealApiOnly };