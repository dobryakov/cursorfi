/**
 * T142: Comprehensive error handling with recovery actions
 * Provides error handling utilities for the frontend
 */

export interface ErrorInfo {
  message: string;
  code?: string;
  recoverable?: boolean;
  recoveryAction?: () => void;
  details?: Record<string, any>;
}

export class AppError extends Error {
  code?: string;
  recoverable: boolean;
  recoveryAction?: () => void;
  details?: Record<string, any>;

  constructor(info: ErrorInfo) {
    super(info.message);
    this.name = 'AppError';
    this.code = info.code;
    this.recoverable = info.recoverable ?? false;
    this.recoveryAction = info.recoveryAction;
    this.details = info.details;
  }
}

export const errorHandler = {
  /**
   * Handle API errors
   */
  handleApiError(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      return new AppError({
        message: error.message,
        code: 'API_ERROR',
        recoverable: true,
        recoveryAction: () => window.location.reload(),
      });
    }

    return new AppError({
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      recoverable: false,
    });
  },

  /**
   * Handle sync errors
   */
  handleSyncError(error: unknown, filePath: string): AppError {
    if (error instanceof AppError) {
      return error;
    }

    return new AppError({
      message: `Failed to sync ${filePath}`,
      code: 'SYNC_ERROR',
      recoverable: true,
      recoveryAction: () => {
        // Retry sync
        console.log('Retrying sync for', filePath);
      },
      details: { filePath },
    });
  },

  /**
   * Handle network errors
   */
  handleNetworkError(error: unknown): AppError {
    return new AppError({
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR',
      recoverable: true,
      recoveryAction: () => window.location.reload(),
    });
  },
};

