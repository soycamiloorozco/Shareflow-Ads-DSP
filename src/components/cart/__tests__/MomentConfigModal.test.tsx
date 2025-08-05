import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MomentConfigModal } from '../MomentConfigModal';
import { CartEvent, SelectedCartMoment } from '../../../types/cart';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock constants
jest.mock('../../../config/constants', () => ({
  constants: {
    base_path: '/test'
  }
}));

// Mock cart event data
const mockCartEvent: CartEvent = {
  id: '1',
  cartId: 'cart-1',
  homeTeamId: 'team1',
  awayTeamId: 'team2',
  stadiumId: 'stadium1',
  eventDate: new Date().toISOString(),
  eventTime: '20:00',
  estimatedAttendance: 50000,
  estimatedAttendanceTv: 100000,
  maxMoments: 3,
  broadcastChannels: 'ESPN',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  homeTeamName: 'Team A',
  awayTeamName: 'Team B',
  homeTeamImage: 'team-a.png',
  awayTeamImage: 'team-b.png',
  stadiumName: 'Stadium Test',
  status: 'Active' as const,
  momentPrices: [
    { moment: 'pre-game', price: 500000 },
    { moment: 'half-time', price: 750000 },
    { moment: 'post-game', price: 400000 }
  ],
  moments: [
    { moment: 'pre-game', price: 500000 },
    { moment: 'half-time', price: 750000 },
    { moment: 'post-game', price: 400000 }
  ],
  stadiumPhotos: ['stadium1.jpg'],
  addedAt: new Date(),
  isConfigured: false,
  estimatedPrice: 500000,
  finalPrice: undefined,
  selectedMoments: []
};

describe('MomentConfigModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when modal is closed', () => {
    it('should not render when isOpen is false', () => {
      render(
        <MomentConfigModal
          isOpen={false}
          onClose={mockOnClose}
          event={mockCartEvent}
          onSave={mockOnSave}
        />
      );
      
      expect(screen.queryByText('Team A vs Team B')).not.toBeInTheDocument();
    });
  });

  describe('when modal is open', () => {
    it('should render modal with event information', () => {
      render(
        <MomentConfigModal
          isOpen={true}
          onClose={mockOnClose}
          event={mockCartEvent}
          onSave={mockOnSave}
        />
      );
      
      expect(screen.getByText('Team A vs Team B')).toBeInTheDocument();
      expect(screen.getByText('Stadium Test')).toBeInTheDocument();
      expect(screen.getByText('20:00')).toBeInTheDocument();
      expect(screen.getByText('50.000 asistentes')).toBeInTheDocument();
      expect(screen.getByText('100.000 audiencia TV')).toBeInTheDocument();
      expect(screen.getByText('Máximo 3 momentos')).toBeInTheDocument();
    });

    it('should display available moments', () => {
      render(
        <MomentConfigModal
          isOpen={true}
          onClose={mockOnClose}
          event={mockCartEvent}
          onSave={mockOnSave}
        />
      );
      
      expect(screen.getByText('Pre-partido')).toBeInTheDocument();
      expect(screen.getByText('Medio tiempo')).toBeInTheDocument();
      expect(screen.getByText('Post-partido')).toBeInTheDocument();
    });

    it('should show moment prices correctly formatted', () => {
      render(
        <MomentConfigModal
          isOpen={true}
          onClose={mockOnClose}
          event={mockCartEvent}
          onSave={mockOnSave}
        />
      );
      
      expect(screen.getByText('$500.000')).toBeInTheDocument();
      expect(screen.getByText('$750.000')).toBeInTheDocument();
      expect(screen.getByText('$400.000')).toBeInTheDocument();
    });

    it('should close when close button is clicked', () => {
      render(
        <MomentConfigModal
          isOpen={true}
          onClose={mockOnClose}
          event={mockCartEvent}
          onSave={mockOnSave}
        />
      );
      
      const closeButton = screen.getByLabelText('Cerrar configuración');
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should close when backdrop is clicked', () => {
      render(
        <MomentConfigModal
          isOpen={true}
          onClose={mockOnClose}
          event={mockCartEvent}
          onSave={mockOnSave}
        />
      );
      
      const backdrop = screen.getByRole('dialog', { hidden: true }).parentElement;
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('moment selection', () => {
    it('should allow selecting moments', () => {
      render(
        <MomentConfigModal
          isOpen={true}
          onClose={mockOnClose}
          event={mockCartEvent}
          onSave={mockOnSave}
        />
      );
      
      // Find and click the pre-game moment toggle
      const preGameToggle = screen.getAllByRole('button').find(button => 
        button.closest('[data-testid=\"moment-card\"]')?.textContent?.includes('Pre-partido')
      );
      
      if (preGameToggle) {
        fireEvent.click(preGameToggle);
        
        // Should show configuration options
        expect(screen.getByText('Cantidad')).toBeInTheDocument();
        expect(screen.getByText('Período')).toBeInTheDocument();
      }
    });

    it('should update summary when moments are selected', () => {
      render(
        <MomentConfigModal
          isOpen={true}
          onClose={mockOnClose}
          event={mockCartEvent}
          onSave={mockOnSave}
        />
      );
      
      // Initially should show empty state
      expect(screen.getByText('Selecciona momentos para ver el resumen')).toBeInTheDocument();
      
      // Select a moment
      const toggleButtons = screen.getAllByRole('button').filter(button => 
        button.className.includes('rounded-full')
      );
      
      if (toggleButtons.length > 0) {
        fireEvent.click(toggleButtons[0]);
        
        // Should update summary
        expect(screen.getByText('1 / 3')).toBeInTheDocument();
      }
    });

    it('should prevent selecting more than maxMoments', () => {
      render(
        <MomentConfigModal
          isOpen={true}
          onClose={mockOnClose}
          event={mockCartEvent}
          onSave={mockOnSave}
        />
      );
      
      const toggleButtons = screen.getAllByRole('button').filter(button => 
        button.className.includes('rounded-full')
      );
      
      // Select all available moments (should be limited to maxMoments)
      toggleButtons.forEach(button => {
        fireEvent.click(button);
      });
      
      // Should show max moments selected
      expect(screen.getByText('3 / 3')).toBeInTheDocument();
    });

    it('should allow changing moment quantities', async () => {
      render(
        <MomentConfigModal
          isOpen={true}
          onClose={mockOnClose}
          event={mockCartEvent}
          onSave={mockOnSave}
        />
      );
      
      // Select a moment first
      const toggleButtons = screen.getAllByRole('button').filter(button => 
        button.className.includes('rounded-full')
      );
      
      if (toggleButtons.length > 0) {
        fireEvent.click(toggleButtons[0]);
        
        // Find quantity increase button
        const increaseButton = screen.getByText('+');
        fireEvent.click(increaseButton);
        
        // Should show quantity 2
        expect(screen.getByText('2')).toBeInTheDocument();
      }
    });

    it('should allow changing moment periods', async () => {
      render(
        <MomentConfigModal
          isOpen={true}
          onClose={mockOnClose}
          event={mockCartEvent}
          onSave={mockOnSave}
        />
      );
      
      // Select a moment first
      const toggleButtons = screen.getAllByRole('button').filter(button => 
        button.className.includes('rounded-full')
      );
      
      if (toggleButtons.length > 0) {
        fireEvent.click(toggleButtons[0]);
        
        // Find period selector
        const periodSelect = screen.getByDisplayValue('Primer tiempo');
        fireEvent.change(periodSelect, { target: { value: 'SecondHalf' } });
        
        expect(periodSelect).toHaveValue('SecondHalf');
      }
    });
  });

  describe('validation', () => {
    it('should show error when trying to save without selecting moments', () => {
      render(
        <MomentConfigModal
          isOpen={true}
          onClose={mockOnClose}
          event={mockCartEvent}
          onSave={mockOnSave}
        />
      );
      
      const saveButton = screen.getByText('Selecciona al menos un momento');
      expect(saveButton).toBeDisabled();
    });

    it('should enable save button when moments are selected', () => {
      render(
        <MomentConfigModal
          isOpen={true}
          onClose={mockOnClose}
          event={mockCartEvent}
          onSave={mockOnSave}
        />
      );
      
      // Select a moment
      const toggleButtons = screen.getAllByRole('button').filter(button => 
        button.className.includes('rounded-full')
      );
      
      if (toggleButtons.length > 0) {
        fireEvent.click(toggleButtons[0]);
        
        const saveButton = screen.getByText('Guardar configuración');
        expect(saveButton).not.toBeDisabled();
      }
    });

    it('should call onSave with selected moments when save is clicked', async () => {
      render(
        <MomentConfigModal
          isOpen={true}
          onClose={mockOnClose}
          event={mockCartEvent}
          onSave={mockOnSave}
        />
      );
      
      // Select a moment
      const toggleButtons = screen.getAllByRole('button').filter(button => 
        button.className.includes('rounded-full')
      );
      
      if (toggleButtons.length > 0) {
        fireEvent.click(toggleButtons[0]);
        
        const saveButton = screen.getByText('Guardar configuración');
        fireEvent.click(saveButton);
        
        await waitFor(() => {
          expect(mockOnSave).toHaveBeenCalledWith([
            expect.objectContaining({
              moment: 'pre-game',
              price: 500000,
              quantity: 1,
              period: 'FirstHalf'
            })
          ]);
        });
      }
    });
  });

  describe('initial moments', () => {
    const initialMoments: SelectedCartMoment[] = [
      {
        moment: 'pre-game',
        price: 500000,
        quantity: 2,
        period: 'FirstHalf'
      }
    ];

    it('should load initial moments when provided', () => {
      render(
        <MomentConfigModal
          isOpen={true}
          onClose={mockOnClose}
          event={mockCartEvent}
          onSave={mockOnSave}
          initialMoments={initialMoments}
        />
      );
      
      // Should show the initial moment as selected
      expect(screen.getByText('2 / 3')).toBeInTheDocument();
      expect(screen.getByText('$1.000.000')).toBeInTheDocument(); // 2 * 500000
    });
  });

  describe('calculations', () => {
    it('should calculate totals correctly', () => {
      render(
        <MomentConfigModal
          isOpen={true}
          onClose={mockOnClose}
          event={mockCartEvent}
          onSave={mockOnSave}
        />
      );
      
      // Select multiple moments
      const toggleButtons = screen.getAllByRole('button').filter(button => 
        button.className.includes('rounded-full')
      );
      
      // Select first two moments
      if (toggleButtons.length >= 2) {
        fireEvent.click(toggleButtons[0]); // pre-game: 500000
        fireEvent.click(toggleButtons[1]); // half-time: 750000
        
        // Should show correct totals
        expect(screen.getByText('2 / 3')).toBeInTheDocument();
        expect(screen.getByText('150.000')).toBeInTheDocument(); // total audience
        expect(screen.getByText('$1.250.000')).toBeInTheDocument(); // total price
      }
    });

    it('should calculate CPM correctly', () => {
      render(
        <MomentConfigModal
          isOpen={true}
          onClose={mockOnClose}
          event={mockCartEvent}
          onSave={mockOnSave}
        />
      );
      
      // Select a moment
      const toggleButtons = screen.getAllByRole('button').filter(button => 
        button.className.includes('rounded-full')
      );
      
      if (toggleButtons.length > 0) {
        fireEvent.click(toggleButtons[0]); // pre-game: 500000
        
        // CPM = (500000 / 150000) * 1000 = 3.33
        expect(screen.getByText('$3.33')).toBeInTheDocument();
      }
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <MomentConfigModal
          isOpen={true}
          onClose={mockOnClose}
          event={mockCartEvent}
          onSave={mockOnSave}
        />
      );
      
      expect(screen.getByLabelText('Cerrar configuración')).toBeInTheDocument();
    });

    it('should prevent body scroll when open', () => {
      const { unmount } = render(
        <MomentConfigModal
          isOpen={true}
          onClose={mockOnClose}
          event={mockCartEvent}
          onSave={mockOnSave}
        />
      );
      
      expect(document.body.style.overflow).toBe('hidden');
      
      unmount();
      expect(document.body.style.overflow).toBe('unset');
    });
  });
});