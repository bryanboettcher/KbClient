/**
 * Simple HTTP client for integration tests
 * Wraps fetch with common patterns and error handling
 */

interface HttpOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

interface HttpResponse<T = unknown> {
  status: number;
  statusText: string;
  ok: boolean;
  data: T;
  headers: Headers;
}

const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Creates an HTTP client bound to a specific base URL
 */
export function createHttpClient(baseUrl: string) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };

  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: HttpOptions = {}
  ): Promise<HttpResponse<T>> {
    const url = `${baseUrl}${path}`;
    const headers = { ...defaultHeaders, ...options.headers };

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, options.timeout || DEFAULT_TIMEOUT);

    try {
      const fetchOptions: RequestInit = {
        method,
        headers,
        signal: controller.signal
      };

      if (body !== undefined) {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);

      // Try to parse JSON response
      let data: T;
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = (await response.text()) as unknown as T;
      }

      return {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        data,
        headers: response.headers
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    /**
     * Performs a GET request
     */
    async get<T = unknown>(path: string, options?: HttpOptions): Promise<HttpResponse<T>> {
      return request<T>('GET', path, undefined, options);
    },

    /**
     * Performs a POST request
     */
    async post<T = unknown>(
      path: string,
      body?: unknown,
      options?: HttpOptions
    ): Promise<HttpResponse<T>> {
      return request<T>('POST', path, body, options);
    },

    /**
     * Performs a PUT request
     */
    async put<T = unknown>(
      path: string,
      body?: unknown,
      options?: HttpOptions
    ): Promise<HttpResponse<T>> {
      return request<T>('PUT', path, body, options);
    },

    /**
     * Performs a PATCH request
     */
    async patch<T = unknown>(
      path: string,
      body?: unknown,
      options?: HttpOptions
    ): Promise<HttpResponse<T>> {
      return request<T>('PATCH', path, body, options);
    },

    /**
     * Performs a DELETE request
     */
    async delete<T = unknown>(path: string, options?: HttpOptions): Promise<HttpResponse<T>> {
      return request<T>('DELETE', path, undefined, options);
    },

    /**
     * Gets the base URL this client is bound to
     */
    getBaseUrl(): string {
      return baseUrl;
    }
  };
}

export type HttpClient = ReturnType<typeof createHttpClient>;
