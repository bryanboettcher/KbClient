import { Injectable, inject } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Error type categorization
 */
export enum ErrorType {
  HTTP = 'HTTP',
  NETWORK = 'NETWORK',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Structured error log entry
 */
export interface ErrorLogEntry {
  timestamp: string;
  type: ErrorType;
  message: string;
  context?: string;
  stackTrace?: string;
  httpStatus?: number;
  httpUrl?: string;
}

/**
 * Centralized error logging service
 *
 * Provides structured logging for errors with context and categorization.
 * Currently logs to console via NGXLogger; designed for future integration
 * with external logging services (e.g., Sentry, LogRocket, etc.)
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorLoggingService {
  private readonly logger = inject(NGXLogger);

  /**
   * Log HTTP error with full context
   */
  logHttpError(error: HttpErrorResponse, context?: string): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      type: this.categorizeHttpError(error),
      message: this.extractErrorMessage(error),
      context,
      httpStatus: error.status,
      httpUrl: error.url || undefined
    };

    this.logger.error('HTTP Error:', entry);
  }

  /**
   * Log client-side error (uncaught exceptions)
   */
  logClientError(error: Error, context?: string): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      type: ErrorType.CLIENT,
      message: error.message || 'Unknown client error',
      context,
      stackTrace: error.stack
    };

    this.logger.error('Client Error:', entry);
  }

  /**
   * Log general error with custom context
   */
  logError(message: string, error?: unknown, context?: string): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      type: ErrorType.UNKNOWN,
      message,
      context,
      stackTrace: error instanceof Error ? error.stack : undefined
    };

    this.logger.error('Error:', entry);
  }

  /**
   * Categorize HTTP error type
   */
  private categorizeHttpError(error: HttpErrorResponse): ErrorType {
    // Network error (offline, CORS, DNS failure, etc.)
    if (error.status === 0) {
      return ErrorType.NETWORK;
    }

    return ErrorType.HTTP;
  }

  /**
   * Extract user-friendly message from HTTP error
   */
  private extractErrorMessage(error: HttpErrorResponse): string {
    // Network error
    if (error.status === 0) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }

    // Server returned error object with message
    if (error.error && typeof error.error === 'object' && 'message' in error.error) {
      return error.error.message;
    }

    // Server returned error string
    if (error.error && typeof error.error === 'string') {
      return error.error;
    }

    // Default messages based on status code
    switch (error.status) {
      case 400:
        return 'The request was invalid. Please check your input and try again.';
      case 401:
        return 'You are not authorized to perform this action. Please log in.';
      case 403:
        return 'You do not have permission to access this resource.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This operation conflicts with the current state. Please refresh and try again.';
      case 422:
        return 'The data provided could not be processed. Please check your input.';
      case 500:
        return 'An internal server error occurred. Please try again later.';
      case 503:
        return 'The service is temporarily unavailable. Please try again later.';
      default:
        return `An error occurred (${error.status}). Please try again.`;
    }
  }
}
