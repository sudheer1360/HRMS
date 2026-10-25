/**
 * AbstractClient — Base class for all external HTTP service clients.
 *
 * Implements the Backend Structure's Client pattern:
 *   - Built-in structured logging for every request/response
 *   - Configurable retry logic with exponential backoff
 *   - Normalised error handling (throws ClientError on failure)
 *   - Timeout enforcement
 *
 * Usage: extend this class to create a typed client for any external service.
 *
 * @example
 * export class EmailClient extends AbstractClient {
 *   constructor() {
 *     super('EmailClient', process.env.EMAIL_SERVICE_URL!, {
 *       timeout: 10_000,
 *       retries: 2,
 *       defaultHeaders: { 'X-API-Key': process.env.EMAIL_API_KEY! },
 *     });
 *   }
 *
 *   async sendWelcomeEmail(to: string, name: string): Promise<void> {
 *     await this.post('/send', { to, template: 'welcome', data: { name } });
 *   }
 * }
 */
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';
import { LoggingHandler } from '../utils/LoggingHandler.js';

export class ClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly response?: unknown,
    public readonly service?: string
  ) {
    super(message);
    this.name = 'ClientError';
  }
}

export interface AbstractClientOptions {
  /** Request timeout in milliseconds (default: 30 000) */
  timeout?: number;
  /** Number of automatic retries on network error or 5xx (default: 1) */
  retries?: number;
  /** Delay in ms before first retry — doubles each attempt (default: 500) */
  retryDelay?: number;
  /** Fixed headers added to every request */
  defaultHeaders?: Record<string, string>;
}

export abstract class AbstractClient {
  protected readonly http: AxiosInstance;
  protected readonly logging: LoggingHandler;
  protected readonly serviceName: string;
  private readonly retries: number;
  private readonly retryDelay: number;

  constructor(
    serviceName: string,
    baseURL: string,
    options: AbstractClientOptions = {}
  ) {
    this.serviceName = serviceName;
    this.logging = new LoggingHandler();
    this.retries = options.retries ?? 1;
    this.retryDelay = options.retryDelay ?? 500;

    this.http = axios.create({
      baseURL,
      timeout: options.timeout ?? 30_000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.defaultHeaders,
      },
    });

    this.attachInterceptors();
  }

  private attachInterceptors(): void {
    this.http.interceptors.request.use((config) => {
      this.logging.debug(this.serviceName, 'Outgoing request', {
        method: config.method?.toUpperCase(),
        url: config.url,
      });
      return config;
    });

    this.http.interceptors.response.use(
      (response) => {
        this.logging.debug(this.serviceName, 'Response received', {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      (error: unknown) => {
        const url =
          typeof error === 'object' && error !== null
            ? (error as Record<string, unknown>)['config']
              ? ((error as Record<string, Record<string, unknown>>)['config']['url'] as string)
              : undefined
            : undefined;
        this.logging.error(this.serviceName, 'Request failed', error, { url });
        return Promise.reject(error);
      }
    );
  }

  private async executeWithRetry<T>(
    fn: () => Promise<AxiosResponse<T>>,
    attempt = 0
  ): Promise<AxiosResponse<T>> {
    try {
      return await fn();
    } catch (err: unknown) {
      type AxiosLike = {
        isAxiosError: boolean;
        response?: { status?: number; data?: unknown };
        message: string;
      };

      const axiosErr =
        typeof err === 'object' && err !== null && 'isAxiosError' in err
          ? (err as unknown as AxiosLike)
          : null;

      const statusCode = axiosErr?.response?.status ?? 0;
      const shouldRetry =
        attempt < this.retries && (statusCode === 0 || statusCode >= 500);

      if (shouldRetry) {
        const delay = this.retryDelay * 2 ** attempt;
        this.logging.warn(
          this.serviceName,
          `Retrying request (attempt ${attempt + 1}/${this.retries}) in ${delay}ms`,
          { statusCode }
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.executeWithRetry(fn, attempt + 1);
      }

      if (axiosErr) {
        throw new ClientError(
          axiosErr.response?.data
            ? JSON.stringify(axiosErr.response.data)
            : axiosErr.message,
          axiosErr.response?.status ?? 500,
          axiosErr.response?.data,
          this.serviceName
        );
      }

      throw err;
    }
  }

  protected async get<T = unknown>(
    path: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const res = await this.executeWithRetry(() => this.http.get<T>(path, config));
    return res.data;
  }

  protected async post<T = unknown>(
    path: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const res = await this.executeWithRetry(() =>
      this.http.post<T>(path, data, config)
    );
    return res.data;
  }

  protected async put<T = unknown>(
    path: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const res = await this.executeWithRetry(() =>
      this.http.put<T>(path, data, config)
    );
    return res.data;
  }

  protected async patch<T = unknown>(
    path: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const res = await this.executeWithRetry(() =>
      this.http.patch<T>(path, data, config)
    );
    return res.data;
  }

  protected async del<T = unknown>(
    path: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const res = await this.executeWithRetry(() =>
      this.http.delete<T>(path, config)
    );
    return res.data;
  }
}
