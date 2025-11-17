import { TestBed } from '@angular/core/testing';
import { ConsoleNotificationService } from './notification.service';

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
