import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { GlobalErrorHandler } from './global-error.handler';
import { ErrorLoggingService } from '../services/error-logging.service';
import { NotificationService } from '../services/notification.service';
import { NGXLogger } from 'ngx-logger';

describe('GlobalErrorHandler', () => {
  let handler: GlobalErrorHandler;
  let errorLoggingService: jest.Mocked<ErrorLoggingService>;
  let notificationService: jest.Mocked<NotificationService>;
  let loggerMock: jest.Mocked<NGXLogger>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    loggerMock = {
      error: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn()
    } as any;

    errorLoggingService = {
      logClientError: jest.fn(),
      logHttpError: jest.fn(),
      logError: jest.fn()
    } as any;

    notificationService = {
      error: jest.fn(),
      success: jest.fn(),
      warning: jest.fn(),
      info: jest.fn()
    } as any;

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    TestBed.configureTestingModule({
      providers: [
        GlobalErrorHandler,
        { provide: ErrorLoggingService, useValue: errorLoggingService },
        { provide: NotificationService, useValue: notificationService },
        { provide: NGXLogger, useValue: loggerMock }
      ]
    });

    handler = TestBed.inject(GlobalErrorHandler);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('client-side errors', () => {
    it('should handle generic JavaScript error', () => {
      const error = new Error('Something went wrong');

      handler.handleError(error);

      expect(errorLoggingService.logClientError).toHaveBeenCalledWith(error, 'Uncaught Exception');
      expect(notificationService.error).toHaveBeenCalledWith(
        expect.any(String),
        'Application Error'
      );
    });

    it('should convert "Cannot read property" error to user-friendly message', () => {
      const error = new Error("Cannot read property 'name' of undefined");

      handler.handleError(error);

      expect(notificationService.error).toHaveBeenCalledWith(
        'A data loading error occurred. Please refresh the page and try again.',
        'Application Error'
      );
    });

    it('should convert "Cannot read properties" error to user-friendly message', () => {
      const error = new Error("Cannot read properties of null (reading 'id')");

      handler.handleError(error);

      expect(notificationService.error).toHaveBeenCalledWith(
        'A data loading error occurred. Please refresh the page and try again.',
        'Application Error'
      );
    });

    it('should handle errors containing "undefined"', () => {
      const error = new Error('Value is undefined');

      handler.handleError(error);

      expect(notificationService.error).toHaveBeenCalledWith(
        'An unexpected error occurred. Please refresh the page and try again.',
        'Application Error'
      );
    });

    it('should handle errors containing "null"', () => {
      const error = new Error('Value is null');

      handler.handleError(error);

      expect(notificationService.error).toHaveBeenCalledWith(
        'An unexpected error occurred. Please refresh the page and try again.',
        'Application Error'
      );
    });

    it('should handle timeout errors', () => {
      const error = new Error('Operation timeout');

      handler.handleError(error);

      expect(notificationService.error).toHaveBeenCalledWith(
        'The operation took too long. Please try again.',
        'Application Error'
      );
    });

    it('should handle permission errors', () => {
      const error = new Error('Permission denied');

      handler.handleError(error);

      expect(notificationService.error).toHaveBeenCalledWith(
        'You do not have permission to perform this action.',
        'Application Error'
      );
    });

    it('should handle generic error with generic message', () => {
      const error = new Error('Random error message');

      handler.handleError(error);

      expect(notificationService.error).toHaveBeenCalledWith(
        'An unexpected error occurred. Please refresh the page and try again.',
        'Application Error'
      );
    });

    it('should handle error without message', () => {
      const error = new Error();

      handler.handleError(error);

      expect(errorLoggingService.logClientError).toHaveBeenCalled();
      expect(notificationService.error).toHaveBeenCalled();
    });

    it('should log to console in development mode', () => {
      const error = new Error('Test error');

      handler.handleError(error);

      // Console.error should be called in development
      expect(consoleErrorSpy).toHaveBeenCalledWith('Uncaught error:', error);
    });
  });

  describe('HTTP errors', () => {
    it('should skip HttpErrorResponse (already handled by interceptor)', () => {
      const httpError = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        url: '/api/products'
      });

      handler.handleError(httpError);

      expect(errorLoggingService.logClientError).not.toHaveBeenCalled();
      expect(notificationService.error).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('HTTP Error caught by GlobalErrorHandler'),
        httpError
      );
    });

    it('should not show notification for HTTP errors', () => {
      const httpError = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error'
      });

      handler.handleError(httpError);

      expect(notificationService.error).not.toHaveBeenCalled();
    });
  });

  describe('error logging', () => {
    it('should log all client errors', () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');

      handler.handleError(error1);
      handler.handleError(error2);

      expect(errorLoggingService.logClientError).toHaveBeenCalledTimes(2);
      expect(errorLoggingService.logClientError).toHaveBeenNthCalledWith(
        1,
        error1,
        'Uncaught Exception'
      );
      expect(errorLoggingService.logClientError).toHaveBeenNthCalledWith(
        2,
        error2,
        'Uncaught Exception'
      );
    });

    it('should include context in error log', () => {
      const error = new Error('Test error');

      handler.handleError(error);

      expect(errorLoggingService.logClientError).toHaveBeenCalledWith(error, 'Uncaught Exception');
    });
  });

  describe('user notifications', () => {
    it('should show notification for all client errors', () => {
      const error = new Error('Test error');

      handler.handleError(error);

      expect(notificationService.error).toHaveBeenCalledWith(
        expect.any(String),
        'Application Error'
      );
    });

    it('should use "Application Error" as notification title', () => {
      const error = new Error('Test error');

      handler.handleError(error);

      expect(notificationService.error).toHaveBeenCalledWith(
        expect.any(String),
        'Application Error'
      );
    });
  });

  describe('error message patterns', () => {
    it('should match "Cannot read property" case-insensitively', () => {
      const error = new Error('cannot read property test');

      handler.handleError(error);

      expect(notificationService.error).toHaveBeenCalledWith(
        expect.stringContaining('data loading error'),
        'Application Error'
      );
    });

    it('should match "undefined" in various contexts', () => {
      const errors = [
        new Error('x is undefined'),
        new Error('undefined value'),
        new Error('UNDEFINED')
      ];

      errors.forEach(error => {
        notificationService.error.mockClear();
        handler.handleError(error);

        expect(notificationService.error).toHaveBeenCalledWith(
          expect.stringContaining('unexpected error'),
          'Application Error'
        );
      });
    });
  });

  describe('complex error scenarios', () => {
    it('should handle errors with stack traces', () => {
      const error = new Error('Error with stack');
      error.stack = 'Error: Error with stack\n  at Component.method()\n  at Zone.run()';

      handler.handleError(error);

      expect(errorLoggingService.logClientError).toHaveBeenCalledWith(error, 'Uncaught Exception');
    });

    it('should handle errors without stack traces', () => {
      const error = new Error('Error without stack');
      delete error.stack;

      handler.handleError(error);

      expect(errorLoggingService.logClientError).toHaveBeenCalled();
      expect(notificationService.error).toHaveBeenCalled();
    });

    it('should handle rapid consecutive errors', () => {
      const errors = [new Error('Error 1'), new Error('Error 2'), new Error('Error 3')];

      errors.forEach(error => handler.handleError(error));

      expect(errorLoggingService.logClientError).toHaveBeenCalledTimes(3);
      expect(notificationService.error).toHaveBeenCalledTimes(3);
    });
  });
});
