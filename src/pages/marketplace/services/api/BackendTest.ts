/**
 * Backend Test - Prueba directa del backend de Shareflow
 * Herramienta específica para diagnosticar problemas con el backend
 */

export async function testShareflowBackend(): Promise<void> {
    console.log('🔍 INICIANDO PRUEBA DIRECTA DEL BACKEND SHAREFLOW');
    console.log('='.repeat(60));

    const baseUrl = 'https://api.shareflow.me/api';
    const authToken = localStorage.getItem('authToken');

    console.log('🌐 URL Base:', baseUrl);
    console.log('🔑 Token de Auth:', authToken ? `Presente (${authToken.substring(0, 20)}...)` : 'NO ENCONTRADO');

    // 1. Probar conectividad básica
    console.log('\n1️⃣ PROBANDO CONECTIVIDAD BÁSICA...');
    try {
        const response = await fetch(baseUrl);
        console.log(`✅ Servidor responde: ${response.status} ${response.statusText}`);
        console.log('📋 Headers del servidor:', Object.fromEntries(response.headers.entries()));
    } catch (error) {
        console.error('❌ Error de conectividad:', error);
        return;
    }

    // 2. Probar endpoint de pantallas SIN autenticación
    console.log('\n2️⃣ PROBANDO /Marketplace/screens SIN AUTENTICACIÓN...');
    try {
        const response = await fetch(`${baseUrl}/Marketplace/screens`);
        console.log(`📡 Status: ${response.status} ${response.statusText}`);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Respuesta exitosa:', data);
            console.log(`📊 Tipo de datos: ${Array.isArray(data) ? `Array con ${data.length} elementos` : typeof data}`);

            // Si la respuesta tiene la estructura del backend
            if (data.success && data.data && data.data.screens) {
                console.log(`🎯 Pantallas encontradas: ${data.data.screens.length}`);
                if (data.data.screens.length > 0) {
                    console.log('🔍 Primera pantalla:', data.data.screens[0]);
                }
            }
        } else {
            const errorText = await response.text();
            console.log('❌ Error response:', errorText);
        }
    } catch (error) {
        console.error('❌ Error en /Marketplace/screens:', error);
    }

    // 3. Probar endpoint de pantallas CON autenticación
    if (authToken) {
        console.log('\n3️⃣ PROBANDO /Marketplace/screens CON AUTENTICACIÓN...');
        try {
            const response = await fetch(`${baseUrl}/Marketplace/screens`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log(`📡 Status: ${response.status} ${response.statusText}`);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Respuesta exitosa con auth:', data);
                console.log(`📊 Tipo de datos: ${Array.isArray(data) ? `Array con ${data.length} elementos` : typeof data}`);

                // Si la respuesta tiene la estructura del backend
                if (data.success && data.data && data.data.screens) {
                    console.log(`🎯 Pantallas encontradas con auth: ${data.data.screens.length}`);
                    if (data.data.screens.length > 0) {
                        console.log('🔍 PRIMERA PANTALLA ENCONTRADA:');
                        console.log(JSON.stringify(data.data.screens[0], null, 2));
                    }
                }
            } else {
                const errorText = await response.text();
                console.log('❌ Error response con auth:', errorText);
            }
        } catch (error) {
            console.error('❌ Error en /Marketplace/screens con auth:', error);
        }
    }

    // 4. Probar variaciones del endpoint
    console.log('\n4️⃣ PROBANDO VARIACIONES DEL ENDPOINT...');
    const endpoints = [
        '/Marketplace/screens',
        '/marketplace/screens',
        '/Screens',
        '/screens',
        '/Marketplace/Screens',
        '/api/Marketplace/screens',
        '/api/screens'
    ];

    for (const endpoint of endpoints) {
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch(`${baseUrl}${endpoint}`, { headers });
            console.log(`📡 ${endpoint}: ${response.status} ${response.statusText}`);

            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    console.log(`✅ ${endpoint}: Encontradas ${data.length} pantallas`);
                }
            }
        } catch (error) {
            console.log(`❌ ${endpoint}: Error - ${error}`);
        }
    }

    // 5. Probar con diferentes métodos HTTP
    console.log('\n5️⃣ PROBANDO DIFERENTES MÉTODOS HTTP...');
    const methods = ['GET', 'POST'];

    for (const method of methods) {
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const options: RequestInit = { method, headers };
            if (method === 'POST') {
                options.body = JSON.stringify({});
            }

            const response = await fetch(`${baseUrl}/Marketplace/screens`, options);
            console.log(`📡 ${method} /Marketplace/screens: ${response.status} ${response.statusText}`);

            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    console.log(`✅ ${method}: Encontradas ${data.length} pantallas`);
                }
            }
        } catch (error) {
            console.log(`❌ ${method}: Error - ${error}`);
        }
    }

    // 6. Verificar estructura de la base de datos
    console.log('\n6️⃣ VERIFICANDO ESTRUCTURA DE LA BASE DE DATOS...');
    try {
        // Intentar obtener información del esquema o metadatos
        const endpoints = [
            '/schema',
            '/metadata',
            '/info',
            '/status',
            '/health'
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(`${baseUrl}${endpoint}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ ${endpoint}:`, data);
                }
            } catch (error) {
                // Silently continue
            }
        }
    } catch (error) {
        console.log('❌ No se pudo obtener información del esquema');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🏁 PRUEBA COMPLETADA');
    console.log('💡 Si no ves pantallas, revisa:');
    console.log('   1. ¿El token de autenticación es válido?');
    console.log('   2. ¿Las pantallas están marcadas como públicas/activas?');
    console.log('   3. ¿El endpoint correcto es /Screens?');
    console.log('   4. ¿Hay configuración CORS correcta?');
    console.log('='.repeat(60));
}

// Auto-ejecutar en desarrollo después de 2 segundos
if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
        testShareflowBackend();
    }, 2000);
}

export default testShareflowBackend;