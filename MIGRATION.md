# Single Container Architecture Migration

## Executive Summary

This document outlines the migration from a multi-container Docker Compose setup to a single container architecture for the Ascent Trading Bot application.

## Current Architecture Issues

### Multi-Container Problems Identified

1. **WebSocket Connection Instability**
   - Frontend container trying to connect to `localhost:8000` results in connection failures
   - Complex networking between containers requiring service discovery
   - Build-time environment variable injection difficulties

2. **Deployment Complexity**
   - Multiple containers increase deployment surface area
   - Network configuration dependencies between frontend/backend
   - Resource overhead of running separate Node.js container just to serve static files

3. **Development Overhead**
   - Cross-container debugging complexity
   - Environment variable propagation issues
   - Build process coordination between multiple Dockerfiles

## Proposed Single Container Architecture

### Design Principles

1. **Simplicity**: One container, one deployment unit
2. **Reliability**: Eliminate network-dependent failure points
3. **Performance**: Remove unnecessary container overhead
4. **Maintainability**: Single configuration surface

### Architecture Changes

```
BEFORE (Multi-Container):
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │    │   Backend   │    │  PostgreSQL │
│  (Node.js)  │◄──►│  (FastAPI)  │◄──►│     DB      │
│   Port 3000 │    │  Port 8000  │    │  Port 5432  │
└─────────────┘    └─────────────┘    └─────────────┘

AFTER (Single Container):
┌─────────────────────────────┐
│       Unified App           │
│  FastAPI + Static Files     │
│       Port 8000            │
│  ┌─────────────────────┐   │
│  │ Static Files (dist) │   │
│  │ /static/           │   │
│  │ SQLite DB File     │   │
│  │ trading.db         │   │
│  └─────────────────────┘   │
└─────────────────────────────┘
```

### Technical Implementation

1. **Frontend Build Integration**
   - Frontend builds into `backend/static/` directory
   - FastAPI serves static files using `StaticFiles` middleware
   - Single build process handles both frontend and backend

2. **WebSocket Simplification**
   - WebSocket connections use relative URLs (`/ws`)
   - Eliminates cross-container networking
   - Same-origin policy naturally satisfied

3. **Database Simplification**
   - SQLite embedded database (no separate container needed)
   - File-based storage for easy backups and portability
   - Perfect for trading bot's data requirements

4. **Deployment Streamlining**
   - Single Docker image contains entire application
   - Reduced memory footprint (eliminates DB container overhead)
   - Simplified CI/CD pipeline

## Migration Benefits

### Immediate Benefits

1. **Fixes WebSocket Issues**: Eliminates network complexity causing connection drops
2. **Reduces Resource Usage**: Single container vs. two containers
3. **Simplifies Deployment**: One image, one container to manage

### Long-term Benefits

1. **Easier Scaling**: Scale the entire application as one unit
2. **Simplified Monitoring**: Single container to monitor and log
3. **Reduced Attack Surface**: Fewer network endpoints exposed
4. **Development Efficiency**: Single build/test/deploy cycle

## Risk Assessment

### Low Risk Migration

- **Backend Changes**: Minimal - just add static file serving
- **Frontend Changes**: Minimal - update WebSocket URL to relative path
- **Database**: No changes required
- **Rollback**: Easy - keep existing Docker Compose as backup

### Mitigation Strategies

1. **Gradual Migration**: Implement alongside existing setup
2. **Testing**: Comprehensive testing of WebSocket functionality
3. **Backup**: Maintain current setup until new one is proven

## Implementation Plan

### Phase 1: Backend Modifications
- Add static file serving to FastAPI
- Configure static file routes
- Test static file serving

### Phase 2: Build Process Integration
- Modify Dockerfile to build frontend into backend
- Update build scripts
- Test integrated build

### Phase 3: WebSocket URL Updates
- Change frontend to use relative WebSocket URLs
- Test WebSocket connectivity
- Verify real-time functionality

### Phase 4: Docker Configuration
- Create new single-container Docker setup
- Update Docker Compose to remove frontend service
- Test complete deployment

### Phase 5: Validation & Cleanup
- Full application testing
- Performance verification
- Remove old frontend container configuration

## Success Criteria

1. ✅ **WebSocket Connections Stable**: No more connection drops
2. ✅ **Application Functionality**: All features work as before
3. ✅ **Deployment Simplicity**: Single `docker-compose up` command
4. ✅ **Resource Efficiency**: Reduced memory/CPU usage
5. ✅ **Development Experience**: Easier local development setup

## Post-Migration Maintenance

### Simplified Workflow
1. Make changes to frontend or backend
2. Run single Docker build
3. Deploy single container
4. Monitor single application instance

### Future Considerations
- Consider migrating to full-stack framework (Next.js/Remix) for even better integration
- Implement proper logging aggregation for the unified container
- Consider container orchestration for production scaling

---

**Migration Date**: 2025-09-14
**Status**: In Progress
**Lead**: Claude Code Assistant
**Approval**: Pending Testing Results