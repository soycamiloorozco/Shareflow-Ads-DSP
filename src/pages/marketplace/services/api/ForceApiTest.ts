/**
 * Force API Test - Prueba forzada para encontrar el backend correcto
 */

export async function forceApiTest(): Promise<void> {
  console.log('🔍 FORZANDO PRUEBA DE API - BUSCANDO BACKEND REAL');
  console.log('=' .repeat(60));

  // Posibles URLs del backend
  const possibleUrls = [
    'http://localhost:5000/api',
    'http://localhost:5001/api', 
    'http://localhost:7000/api',
    'http://localhost:7001/api',
    'http://localhost:8000/api',
    'http://localhost:8080/api',
    'https://api.shareflow.me/api',
    'http://localhost:5173/api', // Mismo puerto que frontend
  ];

  const authToken = localStorage.getItem('authToken');
  console.log('🔑 Token de autenticación:', authToken ? 'Presente' : 'NO ENCONTRADO');

  for (const baseUrl of possibleUrls) {
    console.log(`\n🧪 PROBANDO: ${baseUrl}`);
    
    try {
      // Probar conectividad básica
      const healthResponse = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (healthResponse.ok) {
        console.log(`✅ ${baseUrl}/health - RESPONDE`);
      }
    } catch (error) {
      console.log(`❌ ${baseUrl}/health - NO RESPONDE`);
    }

    try {
      // Probar endpoint de marketplace
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const marketplaceResponse = await fetch(`${baseUrl}/Marketplace/screens`, {
        method: 'GET',
        headers
      });

      console.log(`📡 ${baseUrl}/Marketplace/screens - Status: ${marketplaceResponse.status}`);
      
      if (marketplaceResponse.ok) {
        const data = await marketplaceResponse.json();
        console.log(`🎯 ENCONTRADO! ${baseUrl} - Respuesta:`, data);
        
        if (data.success && data.data && data.data.screens) {
          console.log(`🚀 PANTALLAS REALES ENCONTRADAS: ${data.data.screens.length}`);
          console.log('🔧 ACTUALIZA LA URL EN MarketplaceApiService.ts a:', baseUrl);
          
          if (data.data.screens.length > 0) {
            console.log('📋 PRIMERA PANTALLA REAL:');
            console.log(JSON.stringify(data.data.screens[0], null, 2));
          }
          
          // Guardar la URL correcta en localStorage para referencia
          localStorage.setItem('correct_api_url', baseUrl);
          return;
        }
      } else {
        const errorText = await marketplaceResponse.text();
        console.log(`❌ ${baseUrl}/Marketplace/screens - Error:`, errorText);
      }
    } catch (error) {
      console.log(`❌ ${baseUrl}/Marketplace/screens - Error:`, error);
    }
  }

  console.log('\n' + '=' .repeat(60));
  console.log('🚨 NO SE ENCONTRÓ NINGÚN BACKEND FUNCIONANDO');
  console.log('💡 POSIBLES SOLUCIONES:');
  console.log('   1. ¿Está corriendo el backend?');
  console.log('   2. ¿En qué puerto está corriendo?');
  console.log('   3. ¿Necesita autenticación?');
  console.log('   4. ¿Hay problemas de CORS?');
  console.log('=' .repeat(60));
}

// Auto-ejecutar inmediatamente
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    forceApiTest();
  }, 1000);
}

export default forceApiTest;