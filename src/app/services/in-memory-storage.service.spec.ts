import { TestBed } from '@angular/core/testing';
import { InMemoryStorageService } from './in-memory-storage.service';

describe('InMemoryStorageService', () => {
  let service: InMemoryStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InMemoryStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get and set operations', () => {
    it('should store and retrieve string values', () => {
      service.set('testKey', 'testValue');
      expect(service.get<string>('testKey')).toBe('testValue');
    });

    it('should store and retrieve number values', () => {
      service.set('numKey', 42);
      expect(service.get<number>('numKey')).toBe(42);
    });

    it('should store and retrieve object values', () => {
      const testObj = { foo: 'bar', count: 123 };
      service.set('objKey', testObj);
      expect(service.get<typeof testObj>('objKey')).toEqual(testObj);
    });

    it('should store and retrieve array values', () => {
      const testArray = [1, 2, 3, 4, 5];
      service.set('arrayKey', testArray);
      expect(service.get<number[]>('arrayKey')).toEqual(testArray);
    });

    it('should overwrite existing values', () => {
      service.set('key', 'first');
      service.set('key', 'second');
      expect(service.get<string>('key')).toBe('second');
    });
  });

  describe('non-existent key behavior', () => {
    it('should return null for non-existent keys', () => {
      expect(service.get<string>('nonExistentKey')).toBeNull();
    });

    it('should return null after clearing a key', () => {
      service.set('key', 'value');
      service.clear('key');
      expect(service.get<string>('key')).toBeNull();
    });
  });

  describe('clear operations', () => {
    it('should clear specific key without affecting others', () => {
      service.set('key1', 'value1');
      service.set('key2', 'value2');
      service.clear('key1');

      expect(service.get<string>('key1')).toBeNull();
      expect(service.get<string>('key2')).toBe('value2');
    });

    it('should handle clearing non-existent key gracefully', () => {
      expect(() => service.clear('nonExistent')).not.toThrow();
    });
  });

  describe('type safety', () => {
    it('should maintain type safety for complex types', () => {
      interface TestType {
        id: number;
        name: string;
        nested: {
          value: boolean;
        };
      }

      const testData: TestType = {
        id: 1,
        name: 'test',
        nested: { value: true }
      };

      service.set<TestType>('complexKey', testData);
      const retrieved = service.get<TestType>('complexKey');

      expect(retrieved).toEqual(testData);
      expect(retrieved?.nested.value).toBe(true);
    });
  });
});
