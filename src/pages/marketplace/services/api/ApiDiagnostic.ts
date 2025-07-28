/**
 * API Diagnostic Tool
 * Herramienta para diagnosticar problemas con la API de Shareflow
 */

export interface DiagnosticResult {
  endpoint: string;
  status: 'success' | 'error' | 'unauthorized' | 'not_found';
  statusCode?: number;
  data?: any;
  error?: string;
  responseTime: number;
  headers?: Record<string, string>;
}

export class ApiDiagnostic {
  private baseUrl = 'https://api.shareflow.me/api';
  private authToken: string | null = null;

  constructor() {
    // Intentar obtener el token de autenticación
    this.authToken = localStorage.getItem('authToken');
  }

  /**
   * Ejecutar diagnóstico completo de la API
   */
  async runFullDiagnostic(): Promise<DiagnosticResult[]> {
    console.log('🔍 Iniciando diagnóstico completo de la API...');
    console.log('🔑 Token de autenticación:', this.authToken ? 'Presente' : 'No encontrado');

    const endpoints = [
      // Endpoints básicos
      { path: '/Screens', method: 'GET', name: 'Obtener todas las pantallas' },
      { path: '/screens', method: 'GET', name: 'Obtener pantallas (minúscula)' },
      
      // Endpoints del marketplace
      { path: '/Marketplace/Screens', method: 'GET', name: 'Marketplace - Pantallas' },
      { path: '/marketplace/screens', method: 'GET', name: 'Marketplace - pantallas (minúscula)' },
      
      // Endpoints con paginación
      { path: '/Screens?page=1&limit=10', method: 'GET', name: 'Pantallas con paginación' },
      
      // Health check
      { path: '/health', method: 'GET', name: 'Health Check' },
      { path: '/ping', method: 'GET', name: 'Ping' },
      
      // Endpoints de autenticación
      { path: '/auth/me', method: 'GET', name: 'Usuario actual' },
    ];

    const results: DiagnosticResult[] = [];

    for (const endpoint of endpoints) {
      console.log(`🧪 Probando: ${endpoint.name} (${endpoint.method} ${endpoint.path})`);
      const result = await this.testEndpoint(endpoint.path, endpoint.method as 'GET' | 'POST');
      results.push(result);
      
      // Pequeña pausa entre requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Mostrar resumen
    this.showDiagnosticSummary(results);
    
    return results;
  }

  /**
   * Probar un endpoint específico
   */
  async testEndpoint(path: string, method: 'GET' | 'POST' = 'GET'): Promise<DiagnosticResult> {
    const url = `${this.baseUrl}${path}`;
    const startTime = Date.now();

    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const response = await fetch(url, {
        method,
        headers,
      });

      const responseTime = Date.now() - startTime;
      const responseHeaders: Record<string, string> = {};
      
      // Capturar headers importantes
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let data: any = null;
      let error: string | undefined;

      try {
        const text = await response.text();
        if (text) {
          data = JSON.parse(text);
        }
      } catch (parseError) {
        error = `Error parsing JSON: ${parseError}`;
      }

      const status = response.ok ? 'success' : 
                    response.status === 401 ? 'unauthorized' :
                    response.status === 404 ? 'not_found' : 'error';

      return {
        endpoint: path,
        status,
        statusCode: response.status,
        data,
        error: error || (response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`),
        responseTime,
        headers: responseHeaders,
      };

    } catch (networkError) {
      const responseTime = Date.now() - startTime;
      return {
        endpoint: path,
        status: 'error',
        error: `Network error: ${networkError instanceof Error ? networkError.message : 'Unknown error'}`,
        responseTime,
      };
    }
  }

  /**
   * Mostrar resumen del diagnóstico
   */
  private showDiagnosticSummary(results: DiagnosticResult[]): void {
    console.log('\n📊 RESUMEN DEL DIAGNÓSTICO:');
    console.log('=' .repeat(50));

    const successful = results.filter(r => r.status === 'success');
    const errors = results.filter(r => r.status === 'error');
    const unauthorized = results.filter(r => r.status === 'unauthorized');
    const notFound = results.filter(r => r.status === 'not_found');

    console.log(`✅ Exitosos: ${successful.length}`);
    console.log(`❌ Errores: ${errors.length}`);
    console.log(`🔒 No autorizados: ${unauthorized.length}`);
    console.log(`❓ No encontrados: ${notFound.length}`);

    // Mostrar endpoints exitosos con datos
    if (successful.length > 0) {
      console.log('\n✅ ENDPOINTS EXITOSOS:');
      successful.forEach(result => {
        console.log(`  • ${result.endpoint} (${result.responseTime}ms)`);
        if (Array.isArray(result.data)) {
          console.log(`    📊 Datos: Array con ${result.data.length} elementos`);
        } else if (result.data && typeof result.data === 'object') {
          console.log(`    📊 Datos: Objeto con ${Object.keys(result.data).length} propiedades`);
        }
      });
    }

    // Mostrar errores de autorización
    if (unauthorized.length > 0) {
      console.log('\n🔒 PROBLEMAS DE AUTORIZACIÓN:');
      unauthorized.forEach(result => {
        console.log(`  • ${result.endpoint}: ${result.error}`);
      });
      console.log('💡 Sugerencia: Verificar token de autenticación');
    }

    // Mostrar endpoints no encontrados
    if (notFound.length > 0) {
      console.log('\n❓ ENDPOINTS NO ENCONTRADOS:');
      notFound.forEach(result => {
        console.log(`  • ${result.endpoint}`);
      });
    }

    // Mostrar errores de red
    if (errors.length > 0) {
      console.log('\n❌ ERRORES DE RED/SERVIDOR:');
      errors.forEach(result => {
        console.log(`  • ${result.endpoint}: ${result.error}`);
      });
    }

    console.log('=' .repeat(50));
  }

  /**
   * Probar conectividad básica
   */
  async testBasicConnectivity(): Promise<boolean> {
    console.log('🌐 Probando conectividad básica...');
    
    try {
      const response = await fetch(this.baseUrl, { method: 'HEAD' });
      console.log(`📡 Servidor responde: ${response.status}`);
      return true;
    } catch (error) {
      console.error('❌ No se puede conectar al servidor:', error);
      return false;
    }
  }

  /**
   * Verificar CORS
   */
  async testCORS(): Promise<void> {
    console.log('🔄 Verificando configuración CORS...');
    
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'OPTIONS',
      });
      
      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
      };
      
      console.log('🔄 Headers CORS:', corsHeaders);
    } catch (error) {
      console.error('❌ Error verificando CORS:', error);
    }
  }
}

// Función de utilidad para ejecutar diagnóstico rápido
export async function runQuickDiagnostic(): Promise<void> {
  const diagnostic = new ApiDiagnostic();
  
  console.log('🚀 Ejecutando diagnóstico rápido de la API...');
  
  // Probar conectividad básica
  await diagnostic.testBasicConnectivity();
  
  // Verificar CORS
  await diagnostic.testCORS();
  
  // Ejecutar diagnóstico completo
  await diagnostic.runFullDiagnostic();
}

// Auto-ejecutar en desarrollo
if (process.env.NODE_ENV === 'development') {
  // Ejecutar después de un breve delay para asegurar que todo esté cargado
  setTimeout(() => {
    runQuickDiagnostic();
  }, 3000);
}

export default ApiDiagnostic;