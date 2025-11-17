import { ErrorHandler, Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorLoggingService } from '../services/error-logging.service';
import { NotificationService } from '../services/notification.service';

/**
 * Global Error Handler
 *
 * Catches all uncaught exceptions in the Angular application.
 * HTTP errors are already handled by the HTTP interceptor, so this primarily
 * catches client-side errors (JavaScript errors, template errors, etc.)
 *
 * This overrides Angular's default ErrorHandler.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly errorLogger = inject(ErrorLoggingService);
  private readonly notificationService = inject(NotificationService);

  handleError(error: Error | HttpErrorResponse): void {
    // HTTP errors are already handled by the interceptor
    // Only process if it's NOT an HttpErrorResponse
    if (error instanceof HttpErrorResponse) {
      // Let the HTTP interceptor handle this
      console.error(
        'HTTP Error caught by GlobalErrorHandler (already handled by interceptor):',
        error
      );
      return;
    }

    // Log the client-side error
    this.errorLogger.logClientError(error, 'Uncaught Exception');

    // Show user-friendly notification
    const userMessage = this.getUserFriendlyMessage(error);
    this.notificationService.error(userMessage, 'Application Error');

    // In development, also log to console for debugging
    if (!this.isProduction()) {
      console.error('Uncaught error:', error);
    }
  }

  /**
   * Convert technical error to user-friendly message
   */
  private getUserFriendlyMessage(error: Error): string {
    const message = (error.message || 'Unknown error').toLowerCase();

    // Common error patterns that we can make more friendly (case-insensitive)
    if (message.includes('cannot read property') || message.includes('cannot read properties')) {
      return 'A data loading error occurred. Please refresh the page and try again.';
    }

    if (message.includes('permission')) {
      return 'You do not have permission to perform this action.';
    }

    if (message.includes('timeout')) {
      return 'The operation took too long. Please try again.';
    }

    if (message.includes('undefined') || message.includes('null')) {
      return 'An unexpected error occurred. Please refresh the page and try again.';
    }

    // Generic fallback
    return 'An unexpected error occurred. Please refresh the page and try again.';
  }

  /**
   * Check if running in production mode
   */
  private isProduction(): boolean {
    // This will be properly injected via environment in real implementation
    // For now, check based on console logging being available
    return typeof console === 'undefined' || !console.debug;
  }
}
