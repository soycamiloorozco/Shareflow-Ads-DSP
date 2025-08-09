import { useState, useCallback } from 'react';

interface UseRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number) => void;
  onMaxRetriesReached?: () => void;
}

export const useRetry = ({
  maxRetries = 3,
  retryDelay = 1000,
  backoffMultiplier = 2,
  onRetry,
  onMaxRetriesReached
}: UseRetryOptions = {}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    customMaxRetries?: number
  ): Promise<T> => {
    const maxAttempts = customMaxRetries ?? maxRetries;
    let currentDelay = retryDelay;

    for (let attempt = 0; attempt <= maxAttempts; attempt++) {
      try {
        setIsRetrying(attempt > 0);
        setRetryCount(attempt);
        
        const result = await operation();
        
        // Success - reset state
        setIsRetrying(false);
        setRetryCount(0);
        setLastError(null);
        
        return result;
      } catch (error) {
        const err = error as Error;
        setLastError(err);
        
        // If this was the last attempt, throw the error
        if (attempt === maxAttempts) {
          setIsRetrying(false);
          if (onMaxRetriesReached) {
            onMaxRetriesReached();
          }
          throw err;
        }
        
        // Wait before retrying
        if (onRetry) {
          onRetry(attempt + 1);
        }
        
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        currentDelay *= backoffMultiplier;
      }
    }
    
    throw lastError;
  }, [maxRetries, retryDelay, backoffMultiplier, onRetry, onMaxRetriesReached, lastError]);

  const reset = useCallback(() => {
    setIsRetrying(false);
    setRetryCount(0);
    setLastError(null);
  }, []);

  return {
    executeWithRetry,
    isRetrying,
    retryCount,
    lastError,
    reset
  };
};

export default useRetry;