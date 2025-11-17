import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErrorLoggingService } from '../services/error-logging.service';
import { INotificationService, NotificationService } from '../services/notification.service';

/**
 * HTTP Error Interceptor
 *
 * Intercepts all HTTP errors and provides:
 * - Centralized error logging
 * - User-friendly notifications
 * - Categorized error handling (network, 4xx, 5xx)
 *
 * This is a functional interceptor using Angular's new HttpInterceptorFn pattern.
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const errorLogger = inject(ErrorLoggingService);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: unknown) => {
      // Only handle HTTP errors
      if (error instanceof HttpErrorResponse) {
        handleHttpError(error, req.method, req.url || 'unknown', errorLogger, notificationService);
      } else {
        // Non-HTTP errors (should be rare, but handle gracefully)
        errorLogger.logError('Unexpected error in HTTP request', error);
        notificationService.error('An unexpected error occurred. Please try again.');
      }

      // Re-throw error for components that need to handle specific cases
      return throwError(() => error);
    })
  );
};

/**
 * Handle HTTP error with appropriate user notification
 */
function handleHttpError(
  error: HttpErrorResponse,
  method: string,
  url: string,
  errorLogger: ErrorLoggingService,
  notificationService: INotificationService
): void {
  // Log error with full context
  errorLogger.logHttpError(error, `${method} ${url}`);

  // Network error (status 0)
  if (error.status === 0) {
    notificationService.error(
      'Unable to connect to the server. Please check your internet connection and try again.',
      'Network Error'
    );
    return;
  }

  // Client errors (4xx) - validation, not found, unauthorized, etc.
  if (error.status >= 400 && error.status < 500) {
    const message = extractErrorMessage(error);
    notificationService.error(message, getErrorTitle(error.status));
    return;
  }

  // Server errors (5xx)
  if (error.status >= 500) {
    notificationService.error(
      'A server error occurred. Our team has been notified. Please try again later.',
      'Server Error'
    );
    return;
  }

  // Other errors (shouldn't happen, but be defensive)
  notificationService.error('An error occurred. Please try again.', 'Error');
}

/**
 * Extract user-friendly error message from HTTP response
 */
function extractErrorMessage(error: HttpErrorResponse): string {
  // API returned structured error with message
  if (error.error && typeof error.error === 'object') {
    if ('message' in error.error && typeof error.error.message === 'string') {
      return error.error.message;
    }

    // API returned validation errors (common pattern)
    if ('errors' in error.error && typeof error.error.errors === 'object') {
      const validationErrors = Object.values(error.error.errors)
        .flat()
        .filter(msg => typeof msg === 'string')
        .join(' ');
      if (validationErrors) {
        return validationErrors;
      }
    }

    // API returned title field (another common pattern)
    if ('title' in error.error && typeof error.error.title === 'string') {
      return error.error.title;
    }
  }

  // API returned plain text error
  if (error.error && typeof error.error === 'string') {
    return error.error;
  }

  // Default messages based on status code
  return getDefaultErrorMessage(error.status);
}

/**
 * Get default error message for status code
 */
function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'The request was invalid. Please check your input and try again.';
    case 401:
      return 'You are not authorized. Please log in and try again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'This operation conflicts with existing data. Please refresh and try again.';
    case 422:
      return 'The data could not be processed. Please check your input.';
    default:
      return 'An error occurred. Please try again.';
  }
}

/**
 * Get user-friendly title for error notification
 */
function getErrorTitle(status: number): string {
  if (status === 401) return 'Authentication Required';
  if (status === 403) return 'Permission Denied';
  if (status === 404) return 'Not Found';
  if (status === 409) return 'Conflict';
  if (status === 422) return 'Validation Error';
  if (status >= 400 && status < 500) return 'Request Error';
  return 'Error';
}
