# Design Document

## Overview

This design outlines the approach for removing shopping cart functionality from the entire application and redesigning EventDetail.tsx to match the style and layout of ScreenDetail.tsx. The goal is to create a streamlined, consistent user experience that focuses on direct purchasing rather than cart-based shopping.

## Architecture

### Cart Removal Architecture

The cart removal will follow a systematic approach:

1. **Context Layer Removal**: Remove CartContext and CartProvider from the application
2. **Component Layer Cleanup**: Remove all cart-related components (CartIcon, CartDrawer, AddToCartNotification)
3. **Utility Layer Cleanup**: Remove cart helper functions and utilities
4. **Integration Layer Updates**: Update all components that currently use cart functionality
5. **Layout Layer Updates**: Remove cart components from Layout and Navigation

### EventDetail Redesign Architecture

The EventDetail redesign will adopt the proven patterns from ScreenDetail:

1. **Layout Structure**: Implement the same responsive grid layout (2/3 main content, 1/3 sidebar)
2. **Component Hierarchy**: Use similar component organization and section structure
3. **Styling System**: Apply consistent styling patterns, colors, and spacing
4. **Responsive Design**: Implement the same breakpoints and mobile adaptations
5. **Interactive Elements**: Use consistent button styles, modals, and user interactions

## Components and Interfaces

### Components to Remove

```typescript
// Cart-related components to be completely removed
- src/components/Cart/CartIcon.tsx
- src/components/Cart/CartDrawer.tsx
- src/components/Cart/AddToCartNotification.tsx
- src/components/Cart/index.ts
- src/contexts/CartContext.tsx
- src/utils/cartHelpers.ts
```

### Components to Update

```typescript
// Components that need cart functionality removed
- src/components/Layout.tsx
- src/components/Navigation.tsx
- src/pages/SportsEvents.tsx
- src/pages/marketplace/components/screens/ScreenCard.tsx
```

### EventDetail Component Structure

The new EventDetail will follow this component hierarchy:

```typescript
EventDetail
├── Header (Back button, sticky navigation)
├── HeroSection (Event image, teams, basic info)
├── MainContent (2/3 width on desktop)
│   ├── EventOverview
│   ├── MomentSelection
│   ├── CreativeUpload
│   ├── EventSpecs
│   ├── LocationMap
│   └── Reviews/FAQ
└── Sidebar (1/3 width on desktop, mobile modal)
    ├── PurchaseSummary
    ├── PurchaseOptions
    └── EventInfo
```

## Data Models

### Updated Component Props

```typescript
// Remove cart-related props from existing components
interface ScreenCardProps {
  screen: Screen;
  onClick?: (screen: Screen) => void;
  // Remove: onAddToCart, isInCart, etc.
}

interface EventCardProps {
  event: SportEvent;
  onClick?: (event: SportEvent) => void;
  // Remove: onAddToCart, isInCart, etc.
}
```

### EventDetail State Management

```typescript
interface EventDetailState {
  // Flow management
  flowStep: 'select-moments' | 'upload-creative' | 'payment' | 'confirmation';
  step: number;
  
  // Selection state
  selectedMoments: SelectedMomentDetails[];
  selectedPeriod: GamePeriod;
  
  // UI state
  isSticky: boolean;
  activeSection: string;
  
  // Modal state
  showPurchaseFlow: boolean;
  isTimePurchaseModalOpen: boolean;
  isSummaryModalOpen: boolean;
  
  // Creative upload state
  file: File | null;
  preview: string | null;
  uploadError: string | null;
}
```

## Error Handling

### Cart Removal Error Prevention

1. **Import Cleanup**: Systematically remove all cart-related imports
2. **Reference Cleanup**: Remove all references to cart functions and state
3. **Component Cleanup**: Replace cart buttons with direct purchase actions
4. **Context Cleanup**: Remove CartProvider from app root
5. **Type Safety**: Update TypeScript interfaces to remove cart-related properties

### EventDetail Error Handling

1. **Data Loading**: Implement proper loading states and error boundaries
2. **Form Validation**: Add validation for moment selection and creative upload
3. **Payment Flow**: Maintain existing payment error handling
4. **Responsive Design**: Ensure proper fallbacks for different screen sizes

## Testing Strategy

### Cart Removal Testing

1. **Unit Tests**: Update existing tests to remove cart-related assertions
2. **Integration Tests**: Test that purchase flows work without cart functionality
3. **E2E Tests**: Verify complete user journeys without cart interactions
4. **Regression Tests**: Ensure no broken functionality after cart removal

### EventDetail Testing

1. **Visual Regression**: Compare EventDetail layout with ScreenDetail for consistency
2. **Responsive Testing**: Test all breakpoints and mobile interactions
3. **Flow Testing**: Test complete moment selection and purchase flow
4. **Accessibility Testing**: Ensure consistent accessibility patterns

### Test Coverage Areas

```typescript
// Areas requiring test updates
- Navigation component (remove cart icon tests)
- Screen/Event cards (remove cart button tests)
- Purchase flows (test direct purchase instead of cart)
- Layout component (remove cart drawer tests)
- EventDetail responsive behavior
- EventDetail purchase flow
- EventDetail moment selection
```

## Implementation Phases

### Phase 1: Cart Functionality Removal
1. Remove cart context and provider
2. Remove cart components
3. Update Layout and Navigation
4. Update card components
5. Remove cart utilities
6. Clean up imports and references

### Phase 2: EventDetail Redesign
1. Analyze ScreenDetail structure and patterns
2. Create new EventDetail layout structure
3. Implement responsive design system
4. Add sticky navigation and sections
5. Update purchase flow integration
6. Implement mobile optimizations

### Phase 3: Testing and Refinement
1. Update test suites
2. Perform visual regression testing
3. Test responsive behavior
4. Validate purchase flows
5. Fix any remaining issues

## Design Patterns

### Consistent Styling Patterns

```scss
// Consistent spacing and layout patterns from ScreenDetail
.main-container {
  max-width: 6xl;
  margin: 0 auto;
  padding: responsive-padding;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr; // Desktop
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr; // Mobile
  }
}

.section-card {
  background: white;
  border-radius: 1rem;
  border: 1px solid gray-200;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}
```

### Component Consistency

```typescript
// Consistent button patterns
const PrimaryButton = {
  className: "bg-primary hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
}

const SecondaryButton = {
  className: "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
}
```

## Migration Strategy

### Gradual Rollout

1. **Development Environment**: Implement and test all changes
2. **Staging Environment**: Deploy for internal testing
3. **User Testing**: Validate new EventDetail design with users
4. **Production Deployment**: Deploy with monitoring for any issues

### Rollback Plan

1. **Feature Flags**: Use feature flags to quickly revert if needed
2. **Database Backup**: Ensure no data loss during transition
3. **Component Backup**: Keep cart components in separate branch for emergency rollback
4. **Monitoring**: Monitor for errors and user feedback post-deployment