# Angular Project Bootstrap and Configuration

**Date**: 2025-11-14
**Commit(s)**: 35d1f2e, e518bdf, 461e30b, a31f564
**Author**: Bryan Boettcher
**Category**: Infrastructure

## Summary

Established the foundational Angular 19 project structure for the KbStore Admin UI backoffice application. This includes the build system, development tooling, project layout, and application initialization. The application is configured as a standalone Angular application with routing support, environment-based configuration, and a landing page welcoming users to the admin interface.

## Changes

### Files Modified/Created

**Project Configuration:**
- `angular.json` - Angular CLI configuration with build targets and optimization settings
- `tsconfig.json`, `tsconfig.app.json` - TypeScript compiler configuration
- `package.json` - Project dependencies and npm scripts

**Application Structure:**
- `src/main.ts` - Application bootstrap entry point
- `src/index.html` - Main HTML file with app root element
- `src/app/app.component.ts` - Root component with router outlet
- `src/app/app.config.ts` - Application providers (HttpClient, NgxLogger)
- `src/app/app.routes.ts` - Feature-based routing configuration
- `src/app/environments/` - Development and production environment configs

**Components:**
- `src/app/components/welcome/` - Landing page component with styling
- `src/assets/env.js` - Runtime environment variable support

**Project Metadata:**
- `.gitignore` - Updated for Angular/Node project structure
- `.editorconfig` - Code style consistency rules

### Key Decisions

- **Standalone Components**: Used Angular 19's modern standalone API instead of NgModules for simpler dependency injection
- **Lazy-Loaded Routes**: Feature modules (Products, Inventory) load on demand to minimize initial bundle
- **Environment Configuration**: Separate dev/prod configs with runtime env.js for containerized deployments
- **Global Logging**: Integrated NGX-Logger for structured logging across the application
- **HttpClient Provider**: Configured in app.config.ts with base URL from environment

## Impact

### Before
No Angular application existed; only legacy C# .NET projects.

### After
A functioning Angular 19 single-page application ready for feature development. Developers can:
- Run `npm start` to start the dev server
- Run `npm run build` to create production builds
- Navigate between Products and Inventory sections via routing
- Use structured logging throughout the application
- Deploy via Docker with environment-specific configuration

## Technical Details

The application uses Angular's standalone component API, introduced in Angular 14 and recommended since Angular 15. This approach eliminates the NgModule boilerplate and uses function-based providers in `app.config.ts`:

- HttpClient configured with base URL from environment
- Logger configuration switches between dev (full output) and prod (warnings+errors)
- Routes defined as an array and bootstrapped directly in main.ts

The Welcome component serves as the landing page with styling guidance for future feature components. The application structure follows Angular best practices:
- Service Layer: Handles API communication and business logic
- Component Layer: Manages UI and user interactions
- Model Layer: Type definitions for data structures
- Utilities Layer: Shared helper functions

## Related

- Feature: Product List (F-P2)
- Related commits: d8e4369, 31834e9, 67f6e7b, 50b6921
- Documentation: `/home/insta/source/bryanboettcher/KbClient/README.md`

## Validation

- Angular CLI build succeeds without errors
- Development server starts and loads at localhost:4200
- Routes to Products and Inventory load components
- Environment configuration loads correctly in dev and prod builds
