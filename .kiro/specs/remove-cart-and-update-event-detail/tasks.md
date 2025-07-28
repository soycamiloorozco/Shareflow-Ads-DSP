# Implementation Plan

- [x] 1. Remove cart context and provider infrastructure
  - Remove CartContext.tsx and all related types
  - Remove CartProvider from app root
  - Clean up cart-related type definitions
  - _Requirements: 1.1, 1.5_

- [ ] 2. Remove cart components and UI elements
  - [x] 2.1 Delete cart component files
    - Remove src/components/Cart/CartIcon.tsx
    - Remove src/components/Cart/CartDrawer.tsx
    - Remove src/components/Cart/AddToCartNotification.tsx
    - Remove src/components/Cart/index.ts directory
    - _Requirements: 1.1, 1.3_

  - [x] 2.2 Update Layout component to remove cart elements
    - Remove CartDrawer and AddToCartNotification imports and usage
    - Clean up any cart-related props or state
    - _Requirements: 1.1, 1.3_

  - [x] 2.3 Update Navigation component to remove cart icon
    - Remove CartIcon import and usage
    - Clean up navigation layout without cart icon
    - _Requirements: 1.1, 1.3_

- [x] 3. Remove cart utilities and helper functions
  - Delete src/utils/cartHelpers.ts
  - Remove any cart-related utility imports from other files
  - _Requirements: 1.5_

- [ ] 4. Update screen and event card components
  - [x] 4.1 Update ScreenCard component
    - Remove cart-related imports (useCart, cartHelpers)
    - Remove handleAddToCart function and cart button
    - Replace cart functionality with direct purchase/view actions
    - Update component props to remove cart-related properties
    - _Requirements: 1.2, 1.6_

  - [x] 4.2 Update SportsEvents page components
    - Remove cart-related imports and functionality from event cards
    - Remove handleAddToCart functions from all event card variants
    - Replace cart buttons with direct booking/view actions
    - _Requirements: 1.2, 1.6_

- [x] 5. Analyze ScreenDetail structure and create EventDetail layout foundation
  - Study ScreenDetail.tsx responsive layout patterns
  - Identify reusable styling patterns and component structures
  - Create base layout structure for EventDetail matching ScreenDetail
  - _Requirements: 2.1, 2.4_

- [ ] 6. Implement EventDetail header and navigation structure
  - [x] 6.1 Create responsive header with back button
    - Implement back button with consistent styling from ScreenDetail
    - Add event title and basic info in header
    - _Requirements: 2.9_

  - [x] 6.2 Implement sticky navigation header
    - Add sticky header behavior matching ScreenDetail
    - Include event summary and quick actions in sticky header
    - _Requirements: 2.2_

- [ ] 7. Implement EventDetail main content layout
  - [x] 7.1 Create responsive grid layout
    - Implement 2/3 main content, 1/3 sidebar layout for desktop
    - Add mobile-first responsive behavior matching ScreenDetail
    - _Requirements: 2.1, 2.3_

  - [x] 7.2 Restructure event information sections
    - Organize event overview, moment selection, and specs into consistent sections
    - Apply consistent section styling and spacing from ScreenDetail
    - _Requirements: 2.6_

- [ ] 8. Implement EventDetail sidebar and purchase options
  - [x] 8.1 Create desktop sidebar layout
    - Move purchase summary and options to sidebar matching ScreenDetail
    - Implement sticky sidebar behavior
    - _Requirements: 2.5_

  - [x] 8.2 Create mobile purchase flow
    - Implement mobile-optimized purchase options similar to ScreenDetail
    - Add floating purchase button for mobile
    - _Requirements: 2.3, 2.5_

- [ ] 9. Apply consistent styling and visual design
  - [x] 9.1 Update color scheme and typography
    - Apply ScreenDetail color palette to EventDetail
    - Ensure consistent font sizes, weights, and spacing
    - _Requirements: 2.4, 2.7_

  - [x] 9.2 Update button styles and interactive elements
    - Apply consistent button styling from ScreenDetail
    - Update modal and form styling to match ScreenDetail patterns
    - _Requirements: 2.4, 2.8_

- [ ] 10. Implement responsive design and mobile optimizations
  - [x] 10.1 Add responsive breakpoints
    - Implement same breakpoints as ScreenDetail
    - Test and adjust mobile layout behavior
    - _Requirements: 2.3, 2.10_

  - [x] 10.2 Optimize mobile interactions
    - Ensure touch-friendly button sizes and spacing
    - Implement mobile-specific navigation and purchase flows
    - _Requirements: 2.3, 2.10_

- [ ] 11. Update purchase flow integration
  - [x] 11.1 Maintain existing purchase functionality
    - Ensure moment selection and payment flows continue working
    - Update purchase modals to match ScreenDetail styling
    - _Requirements: 2.8, 3.2_

  - [x] 11.2 Test purchase flow without cart dependency
    - Verify direct purchase flow works properly
    - Test payment integration and confirmation flow
    - _Requirements: 3.1, 3.2_

- [ ] 12. Clean up imports and remove unused code
  - [x] 12.1 Remove cart-related imports across the application
    - Search and remove all useCart, CartContext, and cart helper imports
    - Clean up any unused import statements
    - _Requirements: 1.5_

  - [x] 12.2 Update TypeScript interfaces and types
    - Remove cart-related properties from component interfaces
    - Update type definitions to reflect cart removal
    - _Requirements: 1.5_

- [ ] 13. Test and validate functionality
  - [x] 13.1 Test cart removal impact
    - Verify no cart-related errors in console
    - Test that all purchase flows work without cart
    - Ensure navigation and layout work properly without cart components
    - _Requirements: 1.7, 3.3, 3.6_

  - [x] 13.2 Test EventDetail responsive behavior
    - Test EventDetail on various screen sizes
    - Verify layout consistency with ScreenDetail
    - Test purchase flow and moment selection functionality
    - _Requirements: 2.3, 2.10, 3.4, 3.5_

- [x] 14. Final cleanup and optimization
  - Remove any remaining dead code or unused files
  - Optimize imports and component structure
  - Verify no console errors or warnings
  - _Requirements: 1.5, 3.6_