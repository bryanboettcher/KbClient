import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { ConsoleNotificationService, PrimeNgNotificationService } from './notification.service';

describe('ConsoleNotificationService', () => {
  let service: ConsoleNotificationService;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spy on console methods
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();

    TestBed.configureTestingModule({
      providers: [ConsoleNotificationService]
    });

    service = TestBed.inject(ConsoleNotificationService);
  });

  afterEach(() => {
    // Restore console methods
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleInfoSpy.mockRestore();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('error', () => {
    it('should log error message to console.error', () => {
      service.error('Something went wrong');
      expect(consoleErrorSpy).toHaveBeenCalledWith('ERROR: Something went wrong');
    });

    it('should include title in error message when provided', () => {
      service.error('Something went wrong', 'Network Error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('ERROR: [Network Error] Something went wrong');
    });

    it('should handle empty message', () => {
      service.error('');
      expect(consoleErrorSpy).toHaveBeenCalledWith('ERROR: ');
    });
  });

  describe('success', () => {
    it('should log success message to console.log', () => {
      service.success('Operation completed successfully');
      expect(consoleLogSpy).toHaveBeenCalledWith('SUCCESS: Operation completed successfully');
    });

    it('should include title in success message when provided', () => {
      service.success('Product saved', 'Save Successful');
      expect(consoleLogSpy).toHaveBeenCalledWith('SUCCESS: [Save Successful] Product saved');
    });

    it('should handle empty message', () => {
      service.success('');
      expect(consoleLogSpy).toHaveBeenCalledWith('SUCCESS: ');
    });
  });

  describe('warning', () => {
    it('should log warning message to console.warn', () => {
      service.warning('This action may have consequences');
      expect(consoleWarnSpy).toHaveBeenCalledWith('WARNING: This action may have consequences');
    });

    it('should include title in warning message when provided', () => {
      service.warning('Data may be outdated', 'Refresh Recommended');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'WARNING: [Refresh Recommended] Data may be outdated'
      );
    });

    it('should handle empty message', () => {
      service.warning('');
      expect(consoleWarnSpy).toHaveBeenCalledWith('WARNING: ');
    });
  });

  describe('info', () => {
    it('should log info message to console.info', () => {
      service.info('Processing in background');
      expect(consoleInfoSpy).toHaveBeenCalledWith('INFO: Processing in background');
    });

    it('should include title in info message when provided', () => {
      service.info('Processing in background', 'Background Task');
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        'INFO: [Background Task] Processing in background'
      );
    });

    it('should handle empty message', () => {
      service.info('');
      expect(consoleInfoSpy).toHaveBeenCalledWith('INFO: ');
    });
  });

  describe('multiple notifications', () => {
    it('should handle multiple notifications of different types', () => {
      service.error('Error occurred');
      service.success('Success achieved');
      service.warning('Warning issued');
      service.info('Info provided');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple notifications of the same type', () => {
      service.error('First error');
      service.error('Second error');
      service.error('Third error');

      expect(consoleErrorSpy).toHaveBeenCalledTimes(3);
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(1, 'ERROR: First error');
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(2, 'ERROR: Second error');
      expect(consoleErrorSpy).toHaveBeenNthCalledWith(3, 'ERROR: Third error');
    });
  });

  describe('special characters', () => {
    it('should handle messages with special characters', () => {
      service.error('Error: "Special" characters & symbols!');
      expect(consoleErrorSpy).toHaveBeenCalledWith('ERROR: Error: "Special" characters & symbols!');
    });

    it('should handle messages with newlines', () => {
      service.error('Line 1\nLine 2');
      expect(consoleErrorSpy).toHaveBeenCalledWith('ERROR: Line 1\nLine 2');
    });

    it('should handle messages with unicode characters', () => {
      service.success('Operation completed ✓');
      expect(consoleLogSpy).toHaveBeenCalledWith('SUCCESS: Operation completed ✓');
    });
  });
});

describe('PrimeNgNotificationService', () => {
  let service: PrimeNgNotificationService;
  let mockMessageService: jest.Mocked<MessageService>;

  beforeEach(() => {
    // Create mock MessageService
    mockMessageService = {
      add: jest.fn(),
      addAll: jest.fn(),
      clear: jest.fn(),
      messageObserver: jest.fn() as any,
      clearObserver: jest.fn() as any
    } as jest.Mocked<MessageService>;

    TestBed.configureTestingModule({
      providers: [
        PrimeNgNotificationService,
        { provide: MessageService, useValue: mockMessageService }
      ]
    });

    service = TestBed.inject(PrimeNgNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('error', () => {
    it('should call MessageService.add with error severity and manual dismiss', () => {
      service.error('Something went wrong');

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong',
        life: 0
      });
    });

    it('should use custom title when provided', () => {
      service.error('Connection failed', 'Network Error');

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Network Error',
        detail: 'Connection failed',
        life: 0
      });
    });

    it('should handle empty message', () => {
      service.error('');

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: '',
        life: 0
      });
    });

    it('should set life to 0 for manual dismiss', () => {
      service.error('Critical error');

      const call = mockMessageService.add.mock.calls[0][0];
      expect(call.life).toBe(0);
    });
  });

  describe('success', () => {
    it('should call MessageService.add with success severity and auto-dismiss', () => {
      service.success('Operation completed');

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'Operation completed',
        life: 3000
      });
    });

    it('should use custom title when provided', () => {
      service.success('Product saved', 'Save Successful');

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Save Successful',
        detail: 'Product saved',
        life: 3000
      });
    });

    it('should set life to 3000ms for auto-dismiss', () => {
      service.success('Success message');

      const call = mockMessageService.add.mock.calls[0][0];
      expect(call.life).toBe(3000);
    });

    it('should handle empty message', () => {
      service.success('');

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: '',
        life: 3000
      });
    });
  });

  describe('warning', () => {
    it('should call MessageService.add with warn severity', () => {
      service.warning('This may cause issues');

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'warn',
        summary: 'Warning',
        detail: 'This may cause issues',
        life: 5000
      });
    });

    it('should use custom title when provided', () => {
      service.warning('Data outdated', 'Refresh Recommended');

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'warn',
        summary: 'Refresh Recommended',
        detail: 'Data outdated',
        life: 5000
      });
    });

    it('should set life to 5000ms for auto-dismiss', () => {
      service.warning('Warning message');

      const call = mockMessageService.add.mock.calls[0][0];
      expect(call.life).toBe(5000);
    });

    it('should handle empty message', () => {
      service.warning('');

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'warn',
        summary: 'Warning',
        detail: '',
        life: 5000
      });
    });
  });

  describe('info', () => {
    it('should call MessageService.add with info severity', () => {
      service.info('Processing in background');

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'Information',
        detail: 'Processing in background',
        life: 4000
      });
    });

    it('should use custom title when provided', () => {
      service.info('Task started', 'Background Task');

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'Background Task',
        detail: 'Task started',
        life: 4000
      });
    });

    it('should set life to 4000ms for auto-dismiss', () => {
      service.info('Info message');

      const call = mockMessageService.add.mock.calls[0][0];
      expect(call.life).toBe(4000);
    });

    it('should handle empty message', () => {
      service.info('');

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'Information',
        detail: '',
        life: 4000
      });
    });
  });

  describe('multiple notifications', () => {
    it('should handle multiple notifications of different types', () => {
      service.error('Error occurred');
      service.success('Success achieved');
      service.warning('Warning issued');
      service.info('Info provided');

      expect(mockMessageService.add).toHaveBeenCalledTimes(4);
      expect(mockMessageService.add).toHaveBeenNthCalledWith(1, {
        severity: 'error',
        summary: 'Error',
        detail: 'Error occurred',
        life: 0
      });
      expect(mockMessageService.add).toHaveBeenNthCalledWith(2, {
        severity: 'success',
        summary: 'Success',
        detail: 'Success achieved',
        life: 3000
      });
      expect(mockMessageService.add).toHaveBeenNthCalledWith(3, {
        severity: 'warn',
        summary: 'Warning',
        detail: 'Warning issued',
        life: 5000
      });
      expect(mockMessageService.add).toHaveBeenNthCalledWith(4, {
        severity: 'info',
        summary: 'Information',
        detail: 'Info provided',
        life: 4000
      });
    });

    it('should handle multiple notifications of the same type', () => {
      service.error('First error');
      service.error('Second error');
      service.error('Third error');

      expect(mockMessageService.add).toHaveBeenCalledTimes(3);
      expect(mockMessageService.add).toHaveBeenNthCalledWith(1, {
        severity: 'error',
        summary: 'Error',
        detail: 'First error',
        life: 0
      });
      expect(mockMessageService.add).toHaveBeenNthCalledWith(2, {
        severity: 'error',
        summary: 'Error',
        detail: 'Second error',
        life: 0
      });
      expect(mockMessageService.add).toHaveBeenNthCalledWith(3, {
        severity: 'error',
        summary: 'Error',
        detail: 'Third error',
        life: 0
      });
    });
  });

  describe('special characters', () => {
    it('should handle messages with special characters', () => {
      service.error('Error: "Special" characters & symbols!');

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error: "Special" characters & symbols!',
        life: 0
      });
    });

    it('should handle messages with newlines', () => {
      service.error('Line 1\nLine 2');

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Line 1\nLine 2',
        life: 0
      });
    });

    it('should handle messages with unicode characters', () => {
      service.success('Operation completed ✓');

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: 'Operation completed ✓',
        life: 3000
      });
    });
  });

  describe('integration with INotificationService interface', () => {
    it('should implement all required interface methods', () => {
      expect(typeof service.error).toBe('function');
      expect(typeof service.success).toBe('function');
      expect(typeof service.warning).toBe('function');
      expect(typeof service.info).toBe('function');
    });

    it('should accept optional title parameter in all methods', () => {
      service.error('msg', 'title');
      service.success('msg', 'title');
      service.warning('msg', 'title');
      service.info('msg', 'title');

      expect(mockMessageService.add).toHaveBeenCalledTimes(4);
    });
  });
});
