import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { NGXLogger } from 'ngx-logger';
import { ErrorLoggingService, ErrorType } from './error-logging.service';

describe('ErrorLoggingService', () => {
  let service: ErrorLoggingService;
  let loggerMock: jest.Mocked<NGXLogger>;

  beforeEach(() => {
    loggerMock = {
      error: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [ErrorLoggingService, { provide: NGXLogger, useValue: loggerMock }]
    });

    service = TestBed.inject(ErrorLoggingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('logHttpError', () => {
    it('should log network error (status 0)', () => {
      const error = new HttpErrorResponse({
        status: 0,
        statusText: 'Unknown Error',
        url: 'http://localhost:5000/api/products'
      });

      service.logHttpError(error);

      expect(loggerMock.error).toHaveBeenCalledWith(
        'HTTP Error:',
        expect.objectContaining({
          type: ErrorType.NETWORK,
          message: 'Unable to connect to the server. Please check your internet connection.',
          httpStatus: 0,
          httpUrl: 'http://localhost:5000/api/products'
        })
      );
    });

    it('should log 400 bad request error', () => {
      const error = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        url: 'http://localhost:5000/api/products',
        error: { message: 'Invalid SKU format' }
      });

      service.logHttpError(error);

      expect(loggerMock.error).toHaveBeenCalledWith(
        'HTTP Error:',
        expect.objectContaining({
          type: ErrorType.HTTP,
          message: 'Invalid SKU format',
          httpStatus: 400,
          httpUrl: 'http://localhost:5000/api/products'
        })
      );
    });

    it('should log 401 unauthorized error', () => {
      const error = new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        url: 'http://localhost:5000/api/products'
      });

      service.logHttpError(error);

      expect(loggerMock.error).toHaveBeenCalledWith(
        'HTTP Error:',
        expect.objectContaining({
          type: ErrorType.HTTP,
          message: 'You are not authorized to perform this action. Please log in.',
          httpStatus: 401
        })
      );
    });

    it('should log 404 not found error', () => {
      const error = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        url: 'http://localhost:5000/api/products/999'
      });

      service.logHttpError(error);

      expect(loggerMock.error).toHaveBeenCalledWith(
        'HTTP Error:',
        expect.objectContaining({
          type: ErrorType.HTTP,
          message: 'The requested resource was not found.',
          httpStatus: 404
        })
      );
    });

    it('should log 500 internal server error', () => {
      const error = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        url: 'http://localhost:5000/api/products'
      });

      service.logHttpError(error);

      expect(loggerMock.error).toHaveBeenCalledWith(
        'HTTP Error:',
        expect.objectContaining({
          type: ErrorType.HTTP,
          message: 'An internal server error occurred. Please try again later.',
          httpStatus: 500
        })
      );
    });

    it('should extract message from error.error.message', () => {
      const error = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        url: 'http://localhost:5000/api/products',
        error: { message: 'Custom error message' }
      });

      service.logHttpError(error);

      expect(loggerMock.error).toHaveBeenCalledWith(
        'HTTP Error:',
        expect.objectContaining({
          message: 'Custom error message'
        })
      );
    });

    it('should extract error from plain string error', () => {
      const error = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        url: 'http://localhost:5000/api/products',
        error: 'Plain string error'
      });

      service.logHttpError(error);

      expect(loggerMock.error).toHaveBeenCalledWith(
        'HTTP Error:',
        expect.objectContaining({
          message: 'Plain string error'
        })
      );
    });

    it('should include context when provided', () => {
      const error = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        url: 'http://localhost:5000/api/products'
      });

      service.logHttpError(error, 'Creating product');

      expect(loggerMock.error).toHaveBeenCalledWith(
        'HTTP Error:',
        expect.objectContaining({
          context: 'Creating product'
        })
      );
    });

    it('should include timestamp in log entry', () => {
      const error = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        url: 'http://localhost:5000/api/products'
      });

      const beforeCall = new Date().toISOString();
      service.logHttpError(error);
      const afterCall = new Date().toISOString();

      const loggedEntry = loggerMock.error.mock.calls[0][1];
      expect(loggedEntry.timestamp).toBeDefined();
      expect(loggedEntry.timestamp >= beforeCall).toBe(true);
      expect(loggedEntry.timestamp <= afterCall).toBe(true);
    });

    it('should handle error without URL', () => {
      const error = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error'
      });

      service.logHttpError(error);

      expect(loggerMock.error).toHaveBeenCalledWith(
        'HTTP Error:',
        expect.objectContaining({
          httpStatus: 500,
          httpUrl: undefined
        })
      );
    });
  });

  describe('logClientError', () => {
    it('should log client error with stack trace', () => {
      const error = new Error('Cannot read property of undefined');
      error.stack = 'Error: Cannot read property...\n  at Component.method()';

      service.logClientError(error);

      expect(loggerMock.error).toHaveBeenCalledWith(
        'Client Error:',
        expect.objectContaining({
          type: ErrorType.CLIENT,
          message: 'Cannot read property of undefined',
          stackTrace: error.stack
        })
      );
    });

    it('should log client error with context', () => {
      const error = new Error('Validation failed');

      service.logClientError(error, 'Form submission');

      expect(loggerMock.error).toHaveBeenCalledWith(
        'Client Error:',
        expect.objectContaining({
          message: 'Validation failed',
          context: 'Form submission'
        })
      );
    });

    it('should handle error without stack trace', () => {
      const error = new Error('Simple error');
      delete error.stack;

      service.logClientError(error);

      expect(loggerMock.error).toHaveBeenCalledWith(
        'Client Error:',
        expect.objectContaining({
          message: 'Simple error',
          stackTrace: undefined
        })
      );
    });

    it('should handle error with empty message', () => {
      const error = new Error();

      service.logClientError(error);

      expect(loggerMock.error).toHaveBeenCalledWith(
        'Client Error:',
        expect.objectContaining({
          message: 'Unknown client error'
        })
      );
    });
  });

  describe('logError', () => {
    it('should log general error with message', () => {
      service.logError('Something went wrong');

      expect(loggerMock.error).toHaveBeenCalledWith(
        'Error:',
        expect.objectContaining({
          type: ErrorType.UNKNOWN,
          message: 'Something went wrong'
        })
      );
    });

    it('should log error with Error object and extract stack', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n  at test()';

      service.logError('Operation failed', error);

      expect(loggerMock.error).toHaveBeenCalledWith(
        'Error:',
        expect.objectContaining({
          message: 'Operation failed',
          stackTrace: error.stack
        })
      );
    });

    it('should log error with context', () => {
      service.logError('Operation failed', undefined, 'Data processing');

      expect(loggerMock.error).toHaveBeenCalledWith(
        'Error:',
        expect.objectContaining({
          message: 'Operation failed',
          context: 'Data processing'
        })
      );
    });

    it('should handle non-Error objects gracefully', () => {
      service.logError('Operation failed', { custom: 'object' });

      expect(loggerMock.error).toHaveBeenCalledWith(
        'Error:',
        expect.objectContaining({
          message: 'Operation failed',
          stackTrace: undefined
        })
      );
    });

    it('should handle string error values', () => {
      service.logError('Operation failed', 'string error');

      expect(loggerMock.error).toHaveBeenCalledWith(
        'Error:',
        expect.objectContaining({
          message: 'Operation failed',
          stackTrace: undefined
        })
      );
    });
  });

  describe('error categorization', () => {
    it('should categorize status 0 as NETWORK error', () => {
      const error = new HttpErrorResponse({ status: 0 });
      service.logHttpError(error);

      expect(loggerMock.error).toHaveBeenCalledWith(
        'HTTP Error:',
        expect.objectContaining({
          type: ErrorType.NETWORK
        })
      );
    });

    it('should categorize 4xx errors as HTTP error', () => {
      const error = new HttpErrorResponse({ status: 400 });
      service.logHttpError(error);

      expect(loggerMock.error).toHaveBeenCalledWith(
        'HTTP Error:',
        expect.objectContaining({
          type: ErrorType.HTTP
        })
      );
    });

    it('should categorize 5xx errors as HTTP error', () => {
      const error = new HttpErrorResponse({ status: 500 });
      service.logHttpError(error);

      expect(loggerMock.error).toHaveBeenCalledWith(
        'HTTP Error:',
        expect.objectContaining({
          type: ErrorType.HTTP
        })
      );
    });
  });
});
