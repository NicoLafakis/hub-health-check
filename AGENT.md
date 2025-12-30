# AGENT.md - HubCheck Project Guide

## Project Overview

**HubCheck** is a HubSpot CRM Health Auditor application that analyzes a HubSpot portal and provides health scores across multiple categories. Users authenticate with a HubSpot Private App Token (PAT) to run audits on their CRM data.

## Current State

This is a **prototype/mockup** with simulated data. The current implementation:
- Contains a fully functional React UI
- Simulates audit results with random data generation
- Does NOT yet connect to the actual HubSpot API
- Validates token format (must start with `pat-`)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18+ |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Backend | Planned: Flask or Node.js (not yet implemented) |

## Application Architecture

### State Management
- `token` - HubSpot Private App Token input
- `isAuditing` - Loading state during audit
- `results` - Audit results object
- `error` - Error messages
- `activeTab` - Current view ('dashboard' or 'details')
- `selectedCategory` - Selected category for detail view

### Audit Categories
1. **Contact Hygiene** - Email completeness, duplicates, engagement rates
2. **Pipeline Health** - Stale deals, missing close dates, amount accuracy
3. **Data Integrity** - Orphaned records, field fill rates, sync errors

### Health Status Types
- `healthy` (green) - No issues
- `warning` (amber) - Needs attention
- `danger` (red) - Critical issues

### Required HubSpot Scopes
```
crm.objects.contacts.read
crm.objects.companies.read
crm.objects.deals.read
crm.schemas.contacts.read
crm.objects.owners.read
```

## Key Files

| File | Description |
|------|-------------|
| `hub-health-app.md` | Main React component (App.jsx content) |
| `AGENT.md` | This file - project documentation |

## UI Components

### Views
1. **Empty State** - Shown before audit, prompts for token input
2. **Loading State** - Animated spinner during audit scan
3. **Dashboard** - Overall health score + category cards
4. **Details** - Deep dive table for selected category

### Layout
- Fixed left sidebar (320px) - Connection panel, navigation
- Main content area - Dashboard/Details views
- Sticky header - Breadcrumbs, record count

## Development Roadmap

### Phase 1: Project Setup
- [ ] Initialize React project with Vite or Create React App
- [ ] Install dependencies (Tailwind CSS, Lucide React)
- [ ] Extract component from hub-health-app.md into proper structure

### Phase 2: Backend Development
- [ ] Create Flask/Node.js backend
- [ ] Implement HubSpot API integration
- [ ] Build real audit logic for each category
- [ ] Add proper error handling and rate limiting

### Phase 3: Frontend Enhancements
- [ ] Connect frontend to real backend API
- [ ] Add authentication/session management
- [ ] Implement "Action Plan" feature
- [ ] Add export functionality for reports

### Phase 4: Polish
- [ ] Add unit and integration tests
- [ ] Optimize performance
- [ ] Add accessibility features
- [ ] Documentation and deployment

## Design System

### Colors
- Primary: `#FF7A59` (HubSpot Orange)
- Dark background: `#2D3E50`
- Success: Emerald
- Warning: Amber
- Danger: Rose

### Typography
- Font: System sans-serif
- Heavy use of uppercase tracking for labels
- Score displays use extra-bold weights

## API Notes (Future Implementation)

HubSpot API endpoints to integrate:
- `GET /crm/v3/objects/contacts` - Fetch contacts
- `GET /crm/v3/objects/companies` - Fetch companies
- `GET /crm/v3/objects/deals` - Fetch deals
- `GET /crm/v3/properties/{objectType}` - Get property definitions
- `GET /crm/v3/owners` - Get owners

Rate limits: 100 requests per 10 seconds (Private App)

## Security Considerations

- Tokens processed locally (current claim - maintain this)
- Never store tokens persistently
- Use HTTPS for all API calls
- Validate token format before API calls
- Handle API errors gracefully without exposing sensitive info
