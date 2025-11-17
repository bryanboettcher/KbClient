# Restart Prompts Summary

Quick reference for available restart prompts. Each prompt provides context and acceptance criteria for resuming work on that feature.

## Available Prompts

### 01 - Product CRUD Forms
Implement create and edit forms for products using reactive forms with validation. Frontend service methods exist but UI is missing. Forms should validate input, handle errors, and navigate back to list after save.

### 02 - Global Error Handling
Build centralized error handling across the application using HTTP interceptors and toast notifications. Currently errors are handled locally in components without consistency. Need global error handler, logging service, and user feedback system.

### 03 - State Management
Evaluate and implement centralized state management for the product list and filters. Component-local state prevents sharing data between routes and causes redundant API calls. Choose approach: NgRx, Signals, or service-based with BehaviorSubject.

### 04 - Authentication & Authorization
Implement user login and protected routes for production use. App is currently publicly accessible with no auth system. Need login form, auth service, route guards, token management, and logout functionality.

### 05 - Loading Skeletons & UX Polish
Replace basic spinners with skeleton screens for better perceived performance. Current implementation uses simple "Loading..." text causing content jumps. Need reusable skeleton components with shimmer animation matching actual content dimensions.

### 06 - Form Validation & Reactive Forms
Build comprehensive form validation framework for all user inputs. Current forms lack reactive forms, custom validators, and consistent error messaging. Need field-level and form-level validation with async validators for server-side checks.

### 07 - Confirmation Dialogs & Modal System
Create custom modal/dialog infrastructure to replace browser's native `confirm()`. Implement reusable modal component, dialog service with different types, keyboard support, and animations for consistent app-wide behavior.

### 08 - Accessibility Audit & Improvements
Conduct accessibility audit and fix issues to meet WCAG 2.1 standards. Current state unknown for keyboard navigation and screen reader compatibility. Run automated tools, test keyboard/screen reader, fix contrast, add ARIA attributes, and ensure focus management.

### 09 - CI/CD Pipeline
Set up GitHub Actions workflow for automated testing and quality gates. Manual test runs currently with no automated checks on PRs or deployments. Need lint, test, build, coverage stages that run on every PR with branch protection rules.

### 10 - Environment Configuration
Implement environment-specific configuration for dev/staging/prod deployments. API URLs and feature flags currently hardcoded with no build-time configuration. Need environment files, API base URL config, feature flags, and runtime configuration support.

### 11 - Docker Setup
Containerize the application and mock API for consistent development and deployment. Currently requires Node.js installed locally with separate services. Need Dockerfile, docker-compose for full stack, multi-stage builds, and hot reload support.

### 12 - Bulk Actions
Implement multi-select and bulk operations for products in the table. Currently only single-item actions (enable, disable, delete) available. Need checkboxes, bulk action toolbar, progress indicator, and partial success handling for batch operations.

### 13 - Product Detail View
Build individual product detail page with full information display. Product list shows summary only with no detail route. Need `/products/:id` route, fetch single product, display all fields, action buttons, and 404 handling for invalid IDs.

### 14 - API Contract Coordination
Establish API contract coordination process between frontend and backend teams. json-server mock and integration tests exist but backend needs executable specification. Decide on contract testing approach (Pact, OpenAPI, shared interfaces) and verify backend implementation matches frontend expectations.

## How to Use

1. **Choose a prompt** based on your next priority or team's backlog order
2. **Start a new Claude session**
3. **Paste the prompt content** or reference the file path: `docs/restart-prompts/NN-feature-name.md`
4. **Claude will have full context** to begin implementation with acceptance criteria

## Quick Navigation

| Feature | Status | File |
|---------|--------|------|
| Product CRUD Forms | Pending | `01-product-crud-forms.md` |
| Global Error Handling | Pending | `02-global-error-handling.md` |
| State Management | Pending | `03-state-management.md` |
| Authentication | Pending | `04-authentication.md` |
| Loading Skeletons | Pending | `05-loading-skeletons.md` |
| Form Validation | Pending | `06-form-validation.md` |
| Confirmation Dialogs | Pending | `07-confirmation-dialogs.md` |
| Accessibility Audit | Pending | `08-accessibility-audit.md` |
| CI/CD Pipeline | Pending | `09-cicd-pipeline.md` |
| Environment Config | Pending | `10-environment-configuration.md` |
| Docker Setup | Pending | `11-docker-setup.md` |
| Bulk Actions | Pending | `12-bulk-actions.md` |
| Product Detail View | Pending | `13-product-detail-view.md` |
| API Contract Coordination | Pending | `14-api-contract-coordination.md` |

## Notes

- All prompts assume KbClient Angular project context
- Integration tests and mock API fully implemented
- Each prompt is independent and can be started in any order
- Some prompts may benefit from being completed in sequence (e.g., forms before validation, error handling before others)
- Prompts include acceptance criteria for completion verification
