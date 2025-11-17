# Docker Setup

## Context
KbClient Angular frontend needs containerization for consistent development and deployment.

## Current State
- Runs directly on host machine
- Requires Node.js installed locally
- json-server runs separately
- No container orchestration

## Task
Containerize the application:
1. Dockerfile for Angular app
2. Docker Compose for full stack (frontend + json-server)
3. Multi-stage build (build + serve)
4. Development vs production containers
5. Volume mounts for hot reload in dev
6. nginx configuration for production

## Container Strategy
- **Development**: Node container with hot reload, mount source
- **Production**: Multi-stage build, nginx serving static files
- **Mock API**: Separate container for json-server

## Files to Reference
- `package.json` - Build and start scripts
- `server/server.js` - json-server setup
- `angular.json` - Build configuration

## Acceptance Criteria
- [ ] Dockerfile for Angular app
- [ ] docker-compose.yml for full stack
- [ ] Development compose with hot reload
- [ ] Production build with nginx
- [ ] json-server in separate container
- [ ] Shared network between containers
- [ ] Environment variables passed through
- [ ] .dockerignore for efficient builds
- [ ] README with Docker usage instructions
- [ ] Health checks configured
