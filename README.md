# KbStore Admin UI

A modern Angular-based backoffice administration interface for managing KbStore RC hobby shop products and inventory.

## Overview

KbStore Admin is a single-page application (SPA) built with Angular 19+ that provides internal staff with comprehensive tools for:

- Product catalog management (CRUD operations)
- Inventory tracking and control
- Real-time stock updates
- Future: Analytics and reporting

## Technology Stack

- **Angular**: 19.0.0 (standalone components)
- **TypeScript**: 5.8.3
- **RxJS**: 7.8.1
- **SCSS**: For component styling
- **Angular Router**: For navigation with lazy loading
- **NGX-Logger**: Structured logging with dev/prod configuration
- **Jest**: Unit and integration testing framework
- **Mock Service Worker (MSW)**: API mocking for integration tests
- **Docker**: Containerized deployment with nginx

## Project Structure

```
src/
├── app/
│   ├── components/          # Shared/reusable components
│   │   └── welcome/         # Landing page component
│   ├── features/            # Feature modules
│   │   ├── products/        # Product management (placeholder)
│   │   └── inventory/       # Inventory management (placeholder)
│   ├── models/              # TypeScript interfaces and types
│   │   ├── product.model.ts
│   │   ├── inventory.model.ts
│   │   └── index.ts
│   ├── services/            # API and business logic services
│   │   ├── api.service.ts
│   │   ├── product.service.ts
│   │   └── inventory.service.ts
│   ├── environments/        # Environment configurations
│   │   ├── environment.ts       (development)
│   │   └── environment.prod.ts  (production)
│   ├── app.component.ts     # Root component
│   ├── app.config.ts        # Application configuration
│   └── app.routes.ts        # Route definitions
├── assets/                  # Static assets (images, styles)
├── index.html               # Main HTML file
├── main.ts                  # Application entry point
└── styles.scss              # Global styles
```

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js**: v18.x or v20.x (LTS recommended)
- **npm**: v9.x or higher (comes with Node.js)
- **Docker** (optional): For containerized deployment

## Installation

1. Clone the repository (if not already done):
   ```bash
   git clone <repository-url>
   cd KbClient
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Server

Start the development server:

```bash
npm start
```

The application will automatically open in your default browser at `http://localhost:4200/`.

The dev server will automatically reload when you make changes to source files.

### Build for Production

Create an optimized production build:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Testing

The project uses Jest for both unit and integration tests, following a pragmatic testing philosophy focused on correctness.

### Test Structure

- **Unit Tests** (`.spec.ts`): Located next to implementation files
  - Pure logic tests with mocked dependencies
  - Focus on the "associative principle": Does component call service correctly?
  - No DOM rendering (pure logic only)

- **Integration Tests** (`/tests`): Organized by business requirement
  - Multi-component workflows
  - Real component implementations with MSW fake backend
  - Given/When/Then structure for readability

### Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run only integration tests:
```bash
npm run test:integration
```

Note: Integration tests with MSW 2.x require additional browser polyfills. See `tests/README.md` for setup instructions. Focus on unit tests for now.

Run tests with coverage report:
```bash
npm run test:coverage
```

### Test Philosophy

Per `.claude/TESTING_SPEC.md`:
- Correctness over speed
- Mock all dependencies in unit tests
- Use MSW to intercept HTTP requests in integration tests
- 80% minimum coverage threshold
- Focus on meaningful tests, not exhaustive permutations

### Pre-commit Hooks

Husky + lint-staged automatically run:
- Related tests for changed files
- ESLint + Prettier formatting
- Conventional commit validation

### Example Unit Test

```typescript
describe('ProductService', () => {
  it('should call POST /products with payload', (done) => {
    const mockHttp = { post: jest.fn().mockReturnValue(of({ id: 1 })) };
    const service = new ProductService(mockHttp, mockLogger);

    service.createProduct({ name: 'Motor', sku: 'SKU001' }).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith(
        'http://localhost:5000/api/products',
        { name: 'Motor', sku: 'SKU001' }
      );
      done();
    });
  });
});
```

### Example Integration Test

```typescript
describe('Create Product Workflow', () => {
  it('should create product and verify it appears in list', (done) => {
    // Given: User wants to create a product
    const newProduct = { name: 'RC Motor X500', sku: 'MTR-X500' };

    // When: Product is created and list is fetched
    productService.createProduct(newProduct).subscribe(() => {
      productService.getProducts().subscribe(products => {
        // Then: Product appears in the list
        expect(products.find(p => p.sku === 'MTR-X500')).toBeDefined();
        done();
      });
    });
  });
});
```

## Configuration

### Environment Variables

The application supports both compile-time and runtime environment configuration:

#### Local Development (npm start)

Uses compile-time environment files:
- **Development**: `src/app/environments/environment.ts`
  - Default API URL: `http://localhost:5000/api`
- **Production build**: `src/app/environments/environment.prod.ts`
  - Default API URL: `https://api.kbstore.com/api`

#### Docker Deployment (Runtime Configuration)

Environment variables are injected at runtime via `window.env`:

```bash
docker run -p 8080:80 -e API_URL=http://your-api:5000/api kbstore-admin:latest
```

Supported environment variables:
- `API_URL`: Backend API endpoint (required)

The Docker entrypoint script generates `/usr/share/nginx/html/assets/env.js` with these values at container startup.

## Features

### Current Implementation

- Modern Angular 19 standalone component architecture
- Responsive landing page with feature overview
- Routing with lazy-loaded feature modules
- Placeholder pages for Products and Inventory management
- Base API service layer with error handling
- TypeScript models for Products and Inventory
- Environment-based configuration

### Planned Features

Products Module:
- Product listing with search and filters
- Create/edit product forms with validation
- Enable/disable products
- Product detail view

Inventory Module:
- Inventory listing with real-time updates
- Increase/decrease stock operations
- Inventory hold/release functionality
- Transaction history

## API Integration

The application is designed to consume a REST API. The base API service (`ApiService`) provides:

- HTTP methods (GET, POST, PUT, DELETE)
- Centralized error handling
- Environment-based URL configuration

Service implementations (`ProductService`, `InventoryService`) extend `ApiService` and provide domain-specific methods.

### Example API Usage

```typescript
// Inject the service in your component
constructor(private productService: ProductService) {}

// Fetch products
this.productService.getProducts().subscribe({
  next: (products) => console.log(products),
  error: (error) => console.error(error)
});
```

## Development Guidelines

### Coding Standards

- Use standalone components (no NgModule)
- Follow Angular style guide
- Use OnPush change detection where appropriate
- Leverage RxJS for reactive patterns
- Write unit tests for all new features
- Use SCSS for component styling

### Component Structure

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
export class ExampleComponent {}
```

## Docker Deployment

The application can be deployed using Docker with multi-stage builds for optimal production performance.

### Quick Start

Build and run with Docker Compose:

```bash
./build.sh
docker-compose up
```

The application will be available at `http://localhost:8080`

### Build Docker Image

Build the image manually:

```bash
docker build -t kbstore-admin:latest .
```

### Run Container

Run with default settings (API URL: `http://localhost:5000/api`):

```bash
docker run -p 8080:80 kbstore-admin:latest
```

Run with custom API URL:

```bash
docker run -p 8080:80 -e API_URL=http://your-backend:5000/api kbstore-admin:latest
```

### Docker Architecture

The Dockerfile uses a multi-stage build:

1. **Build stage**: Node.js 20-alpine builds the Angular app
2. **Runtime stage**: nginx-alpine serves static files

Features:
- Runtime environment injection via `docker-entrypoint.sh`
- Gzip compression for all text assets
- Cache headers for static assets (1 year)
- SPA routing support (fallback to index.html)
- Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
- Health check endpoint at `/health`

### docker-compose.yml

```yaml
services:
  kb-admin:
    build: .
    ports:
      - "8080:80"
    environment:
      API_URL: http://localhost:5000/api
```

### Logging

The application uses NGX-Logger with different log levels per environment:

- **Development** (`npm start`): DEBUG level, full console logging
- **Production** (Docker): ERROR level only, minimal logging

Example usage in services:

```typescript
constructor(private logger: NGXLogger) {}

this.logger.debug('Fetching products...');
this.logger.error('Failed to create product:', error);
```

## Troubleshooting

### Port Already in Use

If port 4200 is already in use, you can specify a different port:

```bash
ng serve --port 4300
```

### Node Version Issues

Ensure you're using a compatible Node.js version (18.x or 20.x LTS):

```bash
node --version
```

### Clearing Cache

If you encounter build issues, try clearing the Angular cache:

```bash
rm -rf .angular/cache
npm install
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Copyright 2025 KbStore. All rights reserved.

## Support

For issues or questions, please contact the development team.
