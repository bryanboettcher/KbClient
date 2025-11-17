# Global Error Handling

## Context
KbClient Angular frontend currently handles errors at component level with console.error and inline error messages. Need centralized error handling.

## Current State
- ProductListComponent has local error state and action messages
- No global error interceptor
- No toast/notification system
- No error boundary for unexpected exceptions

## Task
Implement centralized error handling:
1. HTTP error interceptor for all API calls
2. Toast/notification service for user feedback
3. Error logging service (console for now, can plug in external service later)
4. Global error handler for uncaught exceptions
5. Consistent error message formatting

## Architecture Options
- Angular HTTP Interceptor for API errors
- ErrorHandler override for uncaught exceptions
- Toast service (build custom or use library like ngx-toastr)
- Error types: Network, Validation (4xx), Server (5xx), Client-side

## Files to Reference
- `src/app/services/api.service.ts` - Base API service
- `src/app/features/products/product-list/product-list.component.ts` - Current error handling pattern

## Acceptance Criteria
- [ ] HTTP interceptor catches all API errors
- [ ] Toast notifications for success/error/warning
- [ ] Auto-dismiss for success, manual dismiss for errors
- [ ] Centralized error logging
- [ ] Graceful handling of network failures
- [ ] Tests for error scenarios
- [ ] Remove inline error handling in favor of global system
