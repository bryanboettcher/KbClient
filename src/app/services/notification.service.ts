import { Injectable } from '@angular/core';

/**
 * Notification service interface
 *
 * This abstraction allows swapping implementations (e.g., console → PrimeNG Toast)
 * without changing consuming components.
 */
export interface INotificationService {
  /**
   * Display error notification
   */
  error(message: string, title?: string): void;

  /**
   * Display success notification
   */
  success(message: string, title?: string): void;

  /**
   * Display warning notification
   */
  warning(message: string, title?: string): void;

  /**
   * Display info notification
   */
  info(message: string, title?: string): void;
}

/**
 * Console-based notification service
 *
 * Phase 1 implementation using console output.
 * In Phase 2, this will be replaced with PrimeNG Toast or similar UI component.
 */
@Injectable({
  providedIn: 'root'
})
export class ConsoleNotificationService implements INotificationService {
  error(message: string, title?: string): void {
    const prefix = title ? `[${title}] ` : '';
    console.error(`ERROR: ${prefix}${message}`);
  }

  success(message: string, title?: string): void {
    const prefix = title ? `[${title}] ` : '';
    console.log(`SUCCESS: ${prefix}${message}`);
  }

  warning(message: string, title?: string): void {
    const prefix = title ? `[${title}] ` : '';
    console.warn(`WARNING: ${prefix}${message}`);
  }

  info(message: string, title?: string): void {
    const prefix = title ? `[${title}] ` : '';
    console.info(`INFO: ${prefix}${message}`);
  }
}

// Export type alias for DI token
export const NotificationService = ConsoleNotificationService;
