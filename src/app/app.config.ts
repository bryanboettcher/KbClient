import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';

import { routes } from './app.routes';
import { environment } from './environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      LoggerModule.forRoot({
        level: environment.production ? NgxLoggerLevel.ERROR : NgxLoggerLevel.DEBUG,
        serverLogLevel: NgxLoggerLevel.OFF, // Optionally enable server logging later
        disableConsoleLogging: false,
        colorScheme: ['purple', 'teal', 'gray', 'gray', 'red', 'red', 'red']
      })
    )
  ]
};
