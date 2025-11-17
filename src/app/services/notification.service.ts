import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

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

/**
 * PrimeNG Toast-based notification service
 *
 * Phase 2 implementation using PrimeNG Toast for visual notifications.
 * Integrates with MessageService to display user-friendly toast messages.
 */
@Injectable({
  providedIn: 'root'
})
export class PrimeNgNotificationService implements INotificationService {
  private readonly messageService = inject(MessageService);

  error(message: string, title?: string): void {
    this.messageService.add({
      severity: 'error',
      summary: title || 'Error',
      detail: message,
      life: 0 // Manual dismiss - errors require user acknowledgment
    });
  }

  success(message: string, title?: string): void {
    this.messageService.add({
      severity: 'success',
      summary: title || 'Success',
      detail: message,
      life: 3000 // Auto-dismiss after 3 seconds
    });
  }

  warning(message: string, title?: string): void {
    this.messageService.add({
      severity: 'warn',
      summary: title || 'Warning',
      detail: message,
      life: 5000 // Auto-dismiss after 5 seconds
    });
  }

  info(message: string, title?: string): void {
    this.messageService.add({
      severity: 'info',
      summary: title || 'Information',
      detail: message,
      life: 4000 // Auto-dismiss after 4 seconds
    });
  }
}

// Export type alias for DI token - now points to PrimeNG implementation
export const NotificationService = PrimeNgNotificationService;
