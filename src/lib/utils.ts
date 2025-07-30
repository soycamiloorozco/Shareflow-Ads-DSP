import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatNumber(number: number): string {
  return new Intl.NumberFormat('es-CO').format(number);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function calculateDateDifference(
  startDate: Date | string,
  endDate: Date | string
): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} días`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Margin calculation functions
export function calculatePriceWithMargin(baseCost: number, marginPercent: number): number {
  const marginDecimal = marginPercent / 100;
  return baseCost / (1 - marginDecimal);
}

export function calculateBaseCostFromPrice(price: number, marginPercent: number): number {
  const marginDecimal = marginPercent / 100;
  return price * (1 - marginDecimal);
}

export function getPartnerMargin(partnerId: string): number {
  // Mock data - in real app this would come from API/database
  const partnerMargins: Record<string, number> = {
    'partner-1': 29.4,
    'partner-2': 30.1,
    'partner-3': 25.8,
    'partner-4': 32.5,
    'partner-5': 28.0,
    'partner-6': 31.2,
    'partner-7': 27.5,
    'partner-8': 33.0
  };
  
  return partnerMargins[partnerId] || 30.0; // Default margin
}