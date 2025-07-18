# Marketplace Map View Components

Este directorio contiene los componentes para la vista de mapa del marketplace, que reemplaza la vista por tarjetas con una interfaz interactiva estilo Airbnb.

## Componentes

### MapContainer
Componente principal que maneja la instancia de Google Maps y el renderizado de marcadores.

**Props:**
- `screens: Screen[]` - Array de pantallas a mostrar en el mapa
- `selectedScreen?: Screen | null` - Pantalla actualmente seleccionada
- `onScreenSelect: (screen: Screen) => void` - Callback cuando se selecciona una pantalla
- `onMarkerClick: (screen: Screen) => void` - Callback cuando se hace clic en un marcador
- `onFavoriteChange?: () => void` - Callback cuando cambian los favoritos
- `center?: Coordinates` - Centro del mapa (por defecto: Bogotá)
- `zoom?: number` - Nivel de zoom inicial (por defecto: 11)

**Características:**
- Diferenciación de colores: Azul para Interior, Verde para Exterior
- Sistema de clustering inteligente basado en zoom
- Manejo de estados de carga y error
- Optimizado para rendimiento con muchos marcadores

### ScreenInfoPopup
Popup que se muestra cuando se hace clic en un marcador del mapa.

**Props:**
- `screen: Screen` - Datos de la pantalla a mostrar
- `onClose: () => void` - Callback para cerrar el popup
- `onViewDetails: (screen: Screen) => void` - Callback para ver detalles completos
- `onFavoriteChange?: () => void` - Callback cuando cambian los favoritos

**Características:**
- Información compacta y relevante
- Botón de favoritos integrado
- Navegación directa a detalles de pantalla
- Diseño responsivo

### MapLegend
Componente de leyenda que explica la codificación de colores del mapa.

**Características:**
- Leyenda expandible/colapsable
- Explicación de colores para Indoor/Outdoor
- Instrucciones de uso del mapa
- Diseño responsivo

### MarketplaceMapView
Componente completo de vista de mapa que incluye filtros y controles.

**Props:**
- `className?: string` - Clases CSS adicionales

**Características:**
- Integración completa con sistema de filtros
- Manejo de inventario SSP
- Estados de carga y error
- SEO optimizado

## Uso

```tsx
import { MapContainer } from './components/map/MapContainer';

function MyComponent() {
  const handleScreenSelect = (screen: Screen) => {
    navigate(`/screens/${screen.id}`);
  };

  return (
    <div className="h-96">
      <MapContainer
        screens={screens}
        onScreenSelect={handleScreenSelect}
        onMarkerClick={handleScreenSelect}
      />
    </div>
  );
}
```

## Configuración

### Variables de Entorno
- `VITE_GOOGLE_MAPS_API_KEY` - Clave de API de Google Maps

### Dependencias
- `@react-google-maps/api` - Integración con Google Maps
- `react` - Framework base
- `lucide-react` - Iconos

## Características Técnicas

### Clustering
- Clustering automático en niveles de zoom bajos (< 14)
- Preservación de colores en clusters (predominante Indoor/Outdoor)
- Distancia de clustering configurable

### Rendimiento
- Filtrado de pantallas sin coordenadas válidas
- Pooling de marcadores para mejor rendimiento
- Debounce en actualizaciones de filtros

### Accesibilidad
- Navegación por teclado
- Etiquetas ARIA apropiadas
- Soporte para lectores de pantalla
- Contraste adecuado

### Responsive Design
- Optimizado para móviles y desktop
- Controles táctiles amigables
- Popups adaptivos

## Testing

Los tests se encuentran en el directorio `__tests__/` e incluyen:

- **MapContainer.test.tsx** - Tests unitarios del contenedor de mapa
- **ScreenInfoPopup.test.tsx** - Tests del popup de información
- **MapLegend.test.tsx** - Tests de la leyenda

Ejecutar tests:
```bash
npm test -- --testPathPattern=map
```

## Migración desde Vista de Tarjetas

La vista de mapa reemplaza completamente la vista por tarjetas. Los cambios principales:

1. **Navegación**: Se removió el toggle de vista de tarjetas
2. **Filtros**: Funcionan igual pero actualizan marcadores en tiempo real
3. **Selección**: Click en marcador → popup → navegación a detalles
4. **Performance**: Mejor para grandes cantidades de pantallas

## Troubleshooting

### Google Maps no carga
- Verificar `VITE_GOOGLE_MAPS_API_KEY`
- Verificar restricciones de dominio en Google Cloud Console
- Verificar cuotas de API

### Marcadores no aparecen
- Verificar que las pantallas tengan coordenadas válidas
- Verificar filtros aplicados
- Verificar consola para errores de JavaScript

### Performance lenta
- Reducir número de pantallas mostradas
- Verificar clustering está habilitado
- Verificar nivel de zoom apropiado