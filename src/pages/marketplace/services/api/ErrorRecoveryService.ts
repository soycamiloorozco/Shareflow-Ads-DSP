/**
 * Error Recovery Service
 * Comprehensive error handling with user-friendly messages and recovery strategies
 */

import { ApiError } from '../../types/marketplace.types';

export interface ErrorContext {
  operation: string;
  timestamp?: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  additionalData?: Record<string, any>;
  fallbackData?: () => Promise<any>;
}

export interface ErrorRecoveryResult<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  recoveryStrategy?: string;
  userMessage: string;
  actionable: boolean;
  retryable: boolean;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableErrors: string[];
}

/**
 * Error categories for different handling strategies
 */
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER_ERROR = 'server_error',
  RATE_LIMIT = 'rate_limit',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
}

/**
 * User-friendly error messages
 */
const ERROR_MESSAGES = {
  [ErrorCategory.NETWORK]: {
    title: 'Problema de conexión',
    message: 'No se pudo conectar al servidor. Verifica tu conexión a internet.',
    action: 'Reintentar',
  },
  [ErrorCategory.AUTHENTICATION]: {
    title: 'Sesión expirada',
    message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
    action: 'Iniciar sesión',
  },
  [ErrorCategory.AUTHORIZATION]: {
    title: 'Acceso denegado',
    message: 'No tienes permisos para acceder a este contenido.',
    action: 'Contactar soporte',
  },
  [ErrorCategory.VALIDATION]: {
    title: 'Datos inválidos',
    message: 'Los datos proporcionados no son válidos. Verifica e intenta nuevamente.',
    action: 'Corregir datos',
  },
  [ErrorCategory.NOT_FOUND]: {
    title: 'Contenido no encontrado',
    message: 'El contenido solicitado no existe o ha sido eliminado.',
    action: 'Volver atrás',
  },
  [ErrorCategory.SERVER_ERROR]: {
    title: 'Error del servidor',
    message: 'Estamos experimentando problemas técnicos. Intenta nuevamente en unos minutos.',
    action: 'Reintentar más tarde',
  },
  [ErrorCategory.RATE_LIMIT]: {
    title: 'Demasiadas solicitudes',
    message: 'Has realizado demasiadas solicitudes. Espera un momento antes de intentar nuevamente.',
    action: 'Esperar y reintentar',
  },
  [ErrorCategory.TIMEOUT]: {
    title: 'Tiempo de espera agotado',
    message: 'La solicitud tardó demasiado en responder. Intenta nuevamente.',
    action: 'Reintentar',
  },
  [ErrorCategory.UNKNOWN]: {
    title: 'Error inesperado',
    message: 'Ha ocurrido un error inesperado. Intenta nuevamente.',
    action: 'Reintentar',
  },
};

/**
 * Error Recovery Service Class
 */
export class ErrorRecoveryService {
  private static instance: ErrorRecoveryService;
  private retryConfig: RetryConfig;
  private errorLog: Array<{ error: ApiError; context: ErrorContext; timestamp: string }> = [];

  private constructor() {
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000, // 1 second
      maxDelay: 10000, // 10 seconds
      backoffFactor: 2,
      retryableErrors: [
        ErrorCategory.NETWORK,
        ErrorCategory.TIMEOUT,
        ErrorCategory.SERVER_ERROR,
        ErrorCategory.RATE_LIMIT,
      ],
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ErrorRecoveryService {
    if (!ErrorRecoveryService.instance) {
      ErrorRecoveryService.instance = new ErrorRecoveryService();
    }
    return ErrorRecoveryService.instance;
  }

  /**
   * Handle API error with recovery strategies
   */
  public async handleApiError<T>(
    error: ApiError | Error,
    context: ErrorContext
  ): Promise<T> {
    const apiError = this.normalizeError(error);
    const category = this.categorizeError(apiError);
    
    // Log the error
    this.logError(apiError, context);

    // Try recovery strategies
    const recoveryResult = await this.attemptRecovery<T>(apiError, category, context);
    
    if (recoveryResult.success && recoveryResult.data !== undefined) {
      return recoveryResult.data;
    }

    // If recovery failed, throw a user-friendly error
    const userMessage = this.getUserFriendlyMessage(category, apiError);
    const enhancedError: ApiError = {
      ...apiError,
      message: userMessage.message,
      details: {
        ...apiError.details,
        category,
        userMessage: userMessage.message,
        actionable: this.isActionable(category),
        retryable: this.isRetryable(category),
      },
    };

    throw enhancedError;
  }

  /**
   * Retry operation with exponential backoff
   */
  public async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries?: number
  ): Promise<T> {
    const retries = maxRetries || this.retryConfig.maxRetries;
    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === retries) {
          break; // Last attempt failed
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, attempt),
          this.retryConfig.maxDelay
        );

        // Add jitter to prevent thundering herd
        const jitteredDelay = delay + Math.random() * 1000;

        await this.sleep(jitteredDelay);
      }
    }

    throw lastError!;
  }

  /**
   * Get fallback data if available
   */
  public async getFallbackData<T>(key: string): Promise<T | null> {
    // This would integrate with cache or other fallback mechanisms
    // For now, return null
    return null;
  }

  /**
   * Log error with context
   */
  public logError(error: ApiError, context: ErrorContext): void {
    const logEntry = {
      error,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        sessionId: context.sessionId || this.generateSessionId(),
        userAgent: context.userAgent || navigator.userAgent,
        url: context.url || window.location.href,
      },
      timestamp: new Date().toISOString(),
    };

    this.errorLog.push(logEntry);

    // Keep only last 100 errors to prevent memory leaks
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', logEntry);
    }

    // In production, you would send this to your error tracking service
    // Example: Sentry, LogRocket, etc.
  }

  /**
   * Get error statistics
   */
  public getErrorStats() {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    
    const recentErrors = this.errorLog.filter(
      entry => new Date(entry.timestamp).getTime() > oneHourAgo
    );

    const errorsByCategory = recentErrors.reduce((acc, entry) => {
      const category = this.categorizeError(entry.error);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalErrors: this.errorLog.length,
      recentErrors: recentErrors.length,
      errorsByCategory,
      errorRate: recentErrors.length / 60, // errors per minute
    };
  }

  /**
   * Normalize error to ApiError format
   */
  private normalizeError(error: ApiError | Error): ApiError {
    if ('code' in error && 'timestamp' in error) {
      return error as ApiError;
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      timestamp: new Date().toISOString(),
      details: {},
    };
  }

  /**
   * Categorize error for appropriate handling
   */
  private categorizeError(error: ApiError): ErrorCategory {
    const code = error.code?.toLowerCase() || '';
    const message = error.message?.toLowerCase() || '';

    if (code.includes('network') || message.includes('network') || message.includes('fetch')) {
      return ErrorCategory.NETWORK;
    }
    
    if (code.includes('401') || code.includes('unauthorized') || message.includes('unauthorized')) {
      return ErrorCategory.AUTHENTICATION;
    }
    
    if (code.includes('403') || code.includes('forbidden') || message.includes('forbidden')) {
      return ErrorCategory.AUTHORIZATION;
    }
    
    if (code.includes('400') || code.includes('validation') || message.includes('validation')) {
      return ErrorCategory.VALIDATION;
    }
    
    if (code.includes('404') || code.includes('not_found') || message.includes('not found')) {
      return ErrorCategory.NOT_FOUND;
    }
    
    if (code.includes('429') || code.includes('rate_limit') || message.includes('rate limit')) {
      return ErrorCategory.RATE_LIMIT;
    }
    
    if (code.includes('timeout') || message.includes('timeout')) {
      return ErrorCategory.TIMEOUT;
    }
    
    if (code.includes('5') || message.includes('server') || message.includes('internal')) {
      return ErrorCategory.SERVER_ERROR;
    }

    return ErrorCategory.UNKNOWN;
  }

  /**
   * Attempt recovery based on error category
   */
  private async attemptRecovery<T>(
    error: ApiError,
    category: ErrorCategory,
    context: ErrorContext
  ): Promise<ErrorRecoveryResult<T>> {
    // Try fallback data first
    if (context.fallbackData) {
      try {
        const fallbackData = await context.fallbackData();
        if (fallbackData !== null && fallbackData !== undefined) {
          return {
            success: true,
            data: fallbackData,
            recoveryStrategy: 'fallback_data',
            userMessage: 'Mostrando datos guardados mientras se resuelve el problema.',
            actionable: true,
            retryable: true,
          };
        }
      } catch (fallbackError) {
        console.warn('Fallback data retrieval failed:', fallbackError);
      }
    }

    // Category-specific recovery strategies
    switch (category) {
      case ErrorCategory.RATE_LIMIT:
        // For rate limiting, suggest waiting
        return {
          success: false,
          error,
          recoveryStrategy: 'wait_and_retry',
          userMessage: 'Demasiadas solicitudes. Espera un momento antes de intentar nuevamente.',
          actionable: true,
          retryable: true,
        };

      case ErrorCategory.NETWORK:
      case ErrorCategory.TIMEOUT:
        // For network issues, suggest retry
        return {
          success: false,
          error,
          recoveryStrategy: 'retry',
          userMessage: 'Problema de conexión. Verifica tu internet e intenta nuevamente.',
          actionable: true,
          retryable: true,
        };

      case ErrorCategory.AUTHENTICATION:
        // For auth issues, redirect to login
        return {
          success: false,
          error,
          recoveryStrategy: 'reauthenticate',
          userMessage: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          actionable: true,
          retryable: false,
        };

      default:
        return {
          success: false,
          error,
          recoveryStrategy: 'none',
          userMessage: this.getUserFriendlyMessage(category, error).message,
          actionable: this.isActionable(category),
          retryable: this.isRetryable(category),
        };
    }
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(category: ErrorCategory, error: ApiError) {
    const defaultMessage = ERROR_MESSAGES[category] || ERROR_MESSAGES[ErrorCategory.UNKNOWN];
    
    // Customize message based on specific error details
    if (error.details?.userMessage) {
      return {
        ...defaultMessage,
        message: error.details.userMessage,
      };
    }

    return defaultMessage;
  }

  /**
   * Check if error category is actionable by user
   */
  private isActionable(category: ErrorCategory): boolean {
    return [
      ErrorCategory.NETWORK,
      ErrorCategory.AUTHENTICATION,
      ErrorCategory.VALIDATION,
      ErrorCategory.TIMEOUT,
    ].includes(category);
  }

  /**
   * Check if error category is retryable
   */
  private isRetryable(category: ErrorCategory): boolean {
    return this.retryConfig.retryableErrors.includes(category);
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate session ID for error tracking
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear error log
   */
  public clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Update retry configuration
   */
  public updateRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config };
  }
}

export default ErrorRecoveryService;