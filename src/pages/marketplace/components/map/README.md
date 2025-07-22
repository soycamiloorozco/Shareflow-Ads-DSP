# Configuración de Google Maps para el Marketplace

## Descripción

El componente de mapa del marketplace utiliza Google Maps API para mostrar las pantallas digitales disponibles en un mapa interactivo.

## Configuración

### 1. Obtener API Key de Google Maps

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - **Maps JavaScript API** (requerida)
   - **Places API** (opcional, para búsquedas de lugares)
   - **Geocoding API** (opcional, para convertir direcciones a coordenadas)

4. Ve a "Credenciales" y crea una nueva API Key
5. Configura las restricciones de la API Key:
   - **Restricciones de aplicación**: Referentes HTTP
   - **Dominios autorizados**: Agrega tu dominio (ej: `localhost:3000`, `shareflow.me`)
   - **Restricciones de API**: Selecciona solo las APIs que habilitaste

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

### 3. Reiniciar el Servidor de Desarrollo

Después de agregar la variable de entorno, reinicia tu servidor:

```bash
npm run dev
# o
yarn dev
```

## Componentes

### MapContainer

El componente principal que renderiza el mapa de Google Maps.

**Props:**
- `screens`: Array de pantallas a mostrar
- `selectedScreen`: Pantalla actualmente seleccionada
- `onScreenSelect`: Callback cuando se selecciona una pantalla
- `onMarkerClick`: Callback cuando se hace clic en un marcador
- `onFavoriteChange`: Callback para cambios en favoritos
- `center`: Centro del mapa (opcional)
- `zoom`: Nivel de zoom inicial (opcional)

### ScreenMarker

Componente para renderizar marcadores personalizados de pantallas.

**Características:**
- Iconos personalizados según el tipo de pantalla (interior/exterior)
- Info window con detalles de la pantalla
- Interacciones para ver detalles y agregar a favoritos

### MapLegend

Componente que muestra la leyenda del mapa y estadísticas.

## Personalización

### Estilos del Mapa

Los estilos del mapa se pueden personalizar en `src/config/googleMaps.ts`:

```typescript
styles: [
  {
    featureType: 'poi.business',
    stylers: [{ visibility: 'off' }]
  },
  // Agregar más estilos aquí
]
```

### Marcadores Personalizados

Los iconos de los marcadores se pueden personalizar en `ScreenMarker.tsx`:

```typescript
const getMarkerIcon = (): google.maps.Icon => {
  const color = screen.environment === 'indoor' ? '#3B82F6' : '#10B981';
  // Personalizar el SVG del marcador
};
```

## Solución de Problemas

### Error: "Google Maps API key is missing"

- Verifica que la variable `VITE_GOOGLE_MAPS_API_KEY` esté definida en tu archivo `.env.local`
- Reinicia el servidor de desarrollo después de agregar la variable

### Error: "Failed to load Google Maps"

- Verifica que tu API Key sea válida
- Asegúrate de que las APIs necesarias estén habilitadas en Google Cloud Console
- Revisa las restricciones de dominio en tu API Key

### Las pantallas no aparecen en el mapa

- Verifica que las pantallas tengan coordenadas válidas en el campo `coordinates`
- Las coordenadas deben estar en formato `{ lat: number, lng: number }`
- Asegúrate de que las coordenadas estén dentro del rango válido (lat: -90 a 90, lng: -180 a 180)

## Límites y Consideraciones

- **Cuota de API**: Google Maps tiene límites de uso. Monitorea tu consumo en Google Cloud Console
- **Costo**: Después del nivel gratuito, Google Maps cobra por uso
- **Rendimiento**: Con muchas pantallas, considera implementar clustering de marcadores
- **Conexión**: El mapa requiere conexión a internet para cargar

## Desarrollo

Para desarrollo local, puedes usar la API Key sin restricciones de dominio, pero asegúrate de restringirla antes de production.