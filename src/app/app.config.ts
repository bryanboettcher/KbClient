import {
  ApplicationConfig,
  ErrorHandler,
  provideZoneChangeDetection,
  importProvidersFrom
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

import { routes } from './app.routes';
import { environment } from './environments/environment';
import { httpErrorInterceptor } from './interceptors/http-error.interceptor';
import { GlobalErrorHandler } from './handlers/global-error.handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([httpErrorInterceptor])),
    importProvidersFrom(
      LoggerModule.forRoot({
        level: environment.production ? NgxLoggerLevel.ERROR : NgxLoggerLevel.DEBUG,
        serverLogLevel: NgxLoggerLevel.OFF, // Optionally enable server logging later
        disableConsoleLogging: false,
        colorScheme: ['purple', 'teal', 'gray', 'gray', 'red', 'red', 'red']
      })
    ),
    // Global error handler for uncaught exceptions
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
};
