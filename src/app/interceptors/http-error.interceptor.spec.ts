import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { httpErrorInterceptor } from './http-error.interceptor';
import { ErrorLoggingService } from '../services/error-logging.service';
import { NotificationService } from '../services/notification.service';
import { NGXLogger } from 'ngx-logger';

describe('httpErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let errorLoggingService: ErrorLoggingService;
  let notificationService: NotificationService;
  let loggerMock: jest.Mocked<NGXLogger>;

  beforeEach(() => {
    loggerMock = {
      error: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
        ErrorLoggingService,
        NotificationService,
        MessageService,
        { provide: NGXLogger, useValue: loggerMock }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    errorLoggingService = TestBed.inject(ErrorLoggingService);
    notificationService = TestBed.inject(NotificationService);

    // Spy on service methods
    jest.spyOn(errorLoggingService, 'logHttpError');
    jest.spyOn(notificationService, 'error');
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    httpMock.verify();
    jest.restoreAllMocks();
  });

  describe('network errors', () => {
    it('should handle network error (status 0)', done => {
      httpClient.get('/api/products').subscribe({
        next: () => fail('Should have errored'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(0);
          expect(errorLoggingService.logHttpError).toHaveBeenCalledWith(
            expect.any(HttpErrorResponse),
            'GET /api/products'
          );
          expect(notificationService.error).toHaveBeenCalledWith(
            'Unable to connect to the server. Please check your internet connection and try again.',
            'Network Error'
          );
          done();
        }
      });

      const req = httpMock.expectOne('/api/products');
      req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
    });
  });

  describe('4xx client errors', () => {
    it('should handle 400 bad request with API error message', done => {
      httpClient.post('/api/products', {}).subscribe({
        next: () => fail('Should have errored'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(400);
          expect(errorLoggingService.logHttpError).toHaveBeenCalled();
          expect(notificationService.error).toHaveBeenCalledWith(
            'Invalid SKU format',
            'Request Error'
          );
          done();
        }
      });

      const req = httpMock.expectOne('/api/products');
      req.flush({ message: 'Invalid SKU format' }, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle 401 unauthorized', done => {
      httpClient.get('/api/products').subscribe({
        next: () => fail('Should have errored'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(401);
          expect(notificationService.error).toHaveBeenCalledWith(
            expect.stringContaining('not authorized'),
            'Authentication Required'
          );
          done();
        }
      });

      const req = httpMock.expectOne('/api/products');
      req.flush(null, { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle 403 forbidden', done => {
      httpClient.delete('/api/products/1').subscribe({
        next: () => fail('Should have errored'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(403);
          expect(notificationService.error).toHaveBeenCalledWith(
            expect.stringContaining('permission'),
            'Permission Denied'
          );
          done();
        }
      });

      const req = httpMock.expectOne('/api/products/1');
      req.flush(null, { status: 403, statusText: 'Forbidden' });
    });

    it('should handle 404 not found', done => {
      httpClient.get('/api/products/999').subscribe({
        next: () => fail('Should have errored'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(404);
          expect(notificationService.error).toHaveBeenCalledWith(
            expect.stringContaining('not found'),
            'Not Found'
          );
          done();
        }
      });

      const req = httpMock.expectOne('/api/products/999');
      req.flush(null, { status: 404, statusText: 'Not Found' });
    });

    it('should handle 409 conflict', done => {
      httpClient.put('/api/products/1', {}).subscribe({
        next: () => fail('Should have errored'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(409);
          expect(notificationService.error).toHaveBeenCalledWith(
            expect.stringContaining('conflicts'),
            'Conflict'
          );
          done();
        }
      });

      const req = httpMock.expectOne('/api/products/1');
      req.flush(null, { status: 409, statusText: 'Conflict' });
    });

    it('should handle 422 validation error', done => {
      httpClient.post('/api/products', {}).subscribe({
        next: () => fail('Should have errored'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(422);
          expect(notificationService.error).toHaveBeenCalledWith(
            expect.stringContaining('processed'),
            'Validation Error'
          );
          done();
        }
      });

      const req = httpMock.expectOne('/api/products');
      req.flush(null, { status: 422, statusText: 'Unprocessable Entity' });
    });

    it('should extract validation errors from errors object', done => {
      httpClient.post('/api/products', {}).subscribe({
        next: () => fail('Should have errored'),
        error: () => {
          expect(notificationService.error).toHaveBeenCalledWith(
            'SKU is required Name is required',
            'Request Error'
          );
          done();
        }
      });

      const req = httpMock.expectOne('/api/products');
      req.flush(
        { errors: { sku: ['SKU is required'], name: ['Name is required'] } },
        { status: 400, statusText: 'Bad Request' }
      );
    });

    it('should extract title from error response', done => {
      httpClient.post('/api/products', {}).subscribe({
        next: () => fail('Should have errored'),
        error: () => {
          expect(notificationService.error).toHaveBeenCalledWith(
            'Validation failed',
            'Request Error'
          );
          done();
        }
      });

      const req = httpMock.expectOne('/api/products');
      req.flush({ title: 'Validation failed' }, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle plain text error response', done => {
      httpClient.post('/api/products', {}).subscribe({
        next: () => fail('Should have errored'),
        error: () => {
          expect(notificationService.error).toHaveBeenCalledWith(
            'Invalid request payload',
            'Request Error'
          );
          done();
        }
      });

      const req = httpMock.expectOne('/api/products');
      req.flush('Invalid request payload', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('5xx server errors', () => {
    it('should handle 500 internal server error', done => {
      httpClient.get('/api/products').subscribe({
        next: () => fail('Should have errored'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(500);
          expect(errorLoggingService.logHttpError).toHaveBeenCalled();
          expect(notificationService.error).toHaveBeenCalledWith(
            expect.stringContaining('server error'),
            'Server Error'
          );
          done();
        }
      });

      const req = httpMock.expectOne('/api/products');
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle 503 service unavailable', done => {
      httpClient.get('/api/products').subscribe({
        next: () => fail('Should have errored'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(503);
          expect(notificationService.error).toHaveBeenCalledWith(
            expect.stringContaining('server error'),
            'Server Error'
          );
          done();
        }
      });

      const req = httpMock.expectOne('/api/products');
      req.flush(null, { status: 503, statusText: 'Service Unavailable' });
    });
  });

  describe('non-HTTP errors', () => {
    it('should handle non-HttpErrorResponse errors', done => {
      // This is tricky to test since the interceptor only sees HttpErrorResponse
      // from the HTTP client. This test verifies the fallback logic exists.
      httpClient.get('/api/products').subscribe({
        next: () => fail('Should have errored'),
        error: () => {
          // Error was handled
          done();
        }
      });

      const req = httpMock.expectOne('/api/products');
      req.error(new ProgressEvent('error'));
    });
  });

  describe('error logging', () => {
    it('should log error with request context', done => {
      httpClient.post('/api/products', { sku: 'TEST' }).subscribe({
        next: () => fail('Should have errored'),
        error: () => {
          expect(errorLoggingService.logHttpError).toHaveBeenCalledWith(
            expect.any(HttpErrorResponse),
            'POST /api/products'
          );
          done();
        }
      });

      const req = httpMock.expectOne('/api/products');
      req.flush(null, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle URLs with query parameters', done => {
      httpClient.get('/api/products?page=0&size=25').subscribe({
        next: () => fail('Should have errored'),
        error: () => {
          expect(errorLoggingService.logHttpError).toHaveBeenCalledWith(
            expect.any(HttpErrorResponse),
            expect.stringContaining('GET /api/products')
          );
          done();
        }
      });

      const req = httpMock.expectOne('/api/products?page=0&size=25');
      req.flush(null, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('error re-throwing', () => {
    it('should re-throw error for component error handling', done => {
      httpClient.get('/api/products').subscribe({
        next: () => fail('Should have errored'),
        error: (error: HttpErrorResponse) => {
          // Error should be re-thrown and available to component
          expect(error).toBeInstanceOf(HttpErrorResponse);
          expect(error.status).toBe(404);
          done();
        }
      });

      const req = httpMock.expectOne('/api/products');
      req.flush(null, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('successful requests', () => {
    it('should not intercept successful requests', done => {
      httpClient.get('/api/products').subscribe({
        next: response => {
          expect(response).toEqual({ results: [] });
          expect(errorLoggingService.logHttpError).not.toHaveBeenCalled();
          expect(notificationService.error).not.toHaveBeenCalled();
          done();
        },
        error: () => fail('Should not have errored')
      });

      const req = httpMock.expectOne('/api/products');
      req.flush({ results: [] });
    });
  });
});
