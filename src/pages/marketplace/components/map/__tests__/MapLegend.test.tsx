/**
 * MapLegend Component Tests
 * Unit tests for the map legend functionality
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MapLegend } from '../MapLegend';

describe('MapLegend', () => {
  describe('Legend Toggle', () => {
    it('should render legend toggle button', () => {
      render(<MapLegend />);
      
      const toggleButton = screen.getByLabelText('Mostrar leyenda del mapa');
      expect(toggleButton).toBeInTheDocument();
      expect(screen.getByText('Leyenda')).toBeInTheDocument();
    });

    it('should toggle legend panel when button is clicked', () => {
      render(<MapLegend />);
      
      const toggleButton = screen.getByLabelText('Mostrar leyenda del mapa');
      
      // Initially legend panel should not be visible
      expect(screen.queryByText('Tipos de Pantallas')).not.toBeInTheDocument();
      
      // Click to expand
      fireEvent.click(toggleButton);
      expect(screen.getByText('Tipos de Pantallas')).toBeInTheDocument();
      
      // Click to collapse
      fireEvent.click(toggleButton);
      expect(screen.queryByText('Tipos de Pantallas')).not.toBeInTheDocument();
    });
  });

  describe('Legend Content', () => {
    beforeEach(() => {
      render(<MapLegend />);
      const toggleButton = screen.getByLabelText('Mostrar leyenda del mapa');
      fireEvent.click(toggleButton);
    });

    it('should display indoor screen legend item', () => {
      expect(screen.getByText('Pantallas Interior')).toBeInTheDocument();
      expect(screen.getByText('Centros comerciales, aeropuertos, estaciones')).toBeInTheDocument();
    });

    it('should display outdoor screen legend item', () => {
      expect(screen.getByText('Pantallas Exterior')).toBeInTheDocument();
      expect(screen.getByText('Vallas, estadios, espacios públicos')).toBeInTheDocument();
    });

    it('should display selected screen legend item', () => {
      expect(screen.getByText('Pantalla Seleccionada')).toBeInTheDocument();
      expect(screen.getByText('Pantalla actualmente seleccionada')).toBeInTheDocument();
    });

    it('should display usage instructions', () => {
      expect(screen.getByText('• Haz clic en cualquier marcador para ver detalles')).toBeInTheDocument();
      expect(screen.getByText('• Usa los filtros para refinar tu búsqueda')).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    beforeEach(() => {
      render(<MapLegend />);
      const toggleButton = screen.getByLabelText('Mostrar leyenda del mapa');
      fireEvent.click(toggleButton);
    });

    it('should display color indicators for each screen type', () => {
      const legendPanel = screen.getByText('Tipos de Pantallas').closest('div');
      
      // Check for color indicator elements (rounded divs with background colors)
      const colorIndicators = legendPanel?.querySelectorAll('.rounded-full');
      expect(colorIndicators?.length).toBeGreaterThanOrEqual(3); // Indoor, Outdoor, Selected
    });
  });

  describe('Responsive Design', () => {
    it('should have proper responsive classes', () => {
      render(<MapLegend />);
      
      const toggleButton = screen.getByLabelText('Mostrar leyenda del mapa');
      expect(toggleButton).toHaveClass('px-3', 'py-2');
      
      // Check for responsive text hiding on small screens
      const legendText = screen.getByText('Leyenda');
      expect(legendText).toHaveClass('hidden', 'sm:inline');
    });

    it('should position legend panel correctly', () => {
      render(<MapLegend />);
      const toggleButton = screen.getByLabelText('Mostrar leyenda del mapa');
      fireEvent.click(toggleButton);
      
      const legendPanel = screen.getByText('Tipos de Pantallas').closest('div');
      expect(legendPanel).toHaveClass('absolute', 'top-full', 'right-0');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<MapLegend />);
      
      const toggleButton = screen.getByLabelText('Mostrar leyenda del mapa');
      expect(toggleButton).toHaveAttribute('aria-label', 'Mostrar leyenda del mapa');
    });

    it('should be keyboard accessible', () => {
      render(<MapLegend />);
      
      const toggleButton = screen.getByLabelText('Mostrar leyenda del mapa');
      expect(toggleButton.tagName).toBe('BUTTON');
    });
  });
});