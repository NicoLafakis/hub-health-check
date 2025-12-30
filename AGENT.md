# AGENT.md - HubCheck Project Guide

## Project Overview

**HubCheck** is a full-stack HubSpot CRM Health Auditor application that analyzes a HubSpot portal and provides health scores across multiple categories. Users authenticate with a HubSpot Private App Token (PAT) to run comprehensive audits on their CRM data.

## Current State: Production Ready

The application is fully implemented with:
- Express.js backend with real HubSpot API integration
- React frontend with Vite and Tailwind CSS
- PDF and Markdown export functionality
- Railway deployment configuration
- Comprehensive scope validation with missing scope reporting

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite 5, Tailwind CSS 3 |
| Icons | Lucide React |
| Backend | Express.js, Node.js 18+ |
| HubSpot SDK | @hubspot/api-client |
| PDF Generation | PDFKit |
| Logging | Winston |
| Deployment | Railway (Nixpacks) |

## Project Structure

```
hub-health-check/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx        # Navigation & token input
│   │   │   ├── Header.jsx         # Top header with export button
│   │   │   ├── EmptyState.jsx     # Initial state before audit
│   │   │   ├── LoadingState.jsx   # Audit in progress UI
│   │   │   ├── Dashboard.jsx      # Main results dashboard
│   │   │   ├── CategoryDetails.jsx # Deep dive view
│   │   │   ├── ScopeWarning.jsx   # Missing scopes alert
│   │   │   └── ExportModal.jsx    # PDF/Markdown export
│   │   ├── hooks/
│   │   │   └── useAudit.js        # Audit state management
│   │   ├── lib/
│   │   │   └── api.js             # API client functions
│   │   ├── App.jsx                # Main application
│   │   ├── main.jsx               # Entry point
│   │   └── index.css              # Tailwind styles
│   ├── public/
│   │   └── favicon.svg
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── server/                     # Express backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── audit.js           # Audit API endpoints
│   │   │   └── export.js          # PDF/MD export endpoints
│   │   ├── services/
│   │   │   ├── hubspot.js         # HubSpot API client
│   │   │   └── auditEngine.js     # Audit logic
│   │   ├── utils/
│   │   │   └── logger.js          # Winston logger
│   │   └── index.js               # Express server
│   └── package.json
├── package.json                # Root monorepo config
├── railway.json                # Railway deployment config
├── nixpacks.toml               # Build configuration
├── .gitignore
├── .env.example
├── README.md
└── AGENT.md                    # This file
```

## Audit Categories

### 1. Contact Hygiene
- Missing email addresses
- Missing names
- Potential duplicate detection (same domain + similar names)
- Lifecycle stage coverage

### 2. Pipeline Health
- Stale deals (no activity in 30 days)
- Missing close dates on open deals
- Missing deal amounts
- Unassigned deals
- Total pipeline value

### 3. Data Integrity
- Orphaned contacts (no company association)
- Contact to company ratio
- Recent deal activity
- Data freshness

### 4. Company Data Quality
- Industry field fill rate
- Domain fill rate
- Employee count fill rate
- Annual revenue fill rate
- Location data fill rate

### 5. Engagement & Growth
- Lead status coverage
- Deal conversion rate
- Monthly contact growth

### 6. Data Quality Score
- Contact data completeness
- Company data completeness
- Deal data completeness
- Overall quality score

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `POST /api/audit/validate` | POST | Validate token and return scope info |
| `POST /api/audit/run` | POST | Execute full CRM audit |
| `GET /api/audit/scopes` | GET | List all required/optional scopes |
| `POST /api/export/pdf` | POST | Generate PDF report |
| `POST /api/export/markdown` | POST | Generate Markdown report |
| `GET /api/health` | GET | Health check for Railway |

## Required HubSpot Scopes

```
crm.objects.contacts.read
crm.objects.companies.read
crm.objects.deals.read
crm.schemas.contacts.read
crm.schemas.companies.read
crm.schemas.deals.read
crm.objects.owners.read
```

## Optional Scopes (Enhanced Features)

```
crm.objects.custom.read
crm.objects.marketing_events.read
crm.objects.quotes.read
crm.objects.line_items.read
crm.lists.read
automation.workflows.read
forms.read
files.read
```

## Development Commands

```bash
# Install all dependencies
npm run install:all

# Start development (both client and server)
npm run dev

# Start client only
npm run dev:client

# Start server only
npm run dev:server

# Build for production
npm run build

# Start production server
npm start
```

## Key Features Implemented

### Scope Validation
When a token is missing required scopes, the UI displays:
- A prominent warning banner
- List of each missing scope
- Link to HubSpot documentation on adding scopes

### Export Functionality
- **PDF**: Formatted report with health score visualization, category breakdowns, and recommendations
- **Markdown**: Plain text format with tables, collapsible affected records sections

### Health Scoring Algorithm
- Each check is scored as: healthy (100), warning (60), danger (20)
- Category score = average of all check scores
- Overall score = average of all category scores

## Design System

### Colors
- Primary: `#FF7A59` (HubSpot Orange)
- Dark: `#2D3E50` (Sidebar background)
- Success: Emerald (`#10B981`)
- Warning: Amber (`#F59E0B`)
- Danger: Rose (`#EF4444`)

### Status Classes
- `status-healthy`: Green indicators
- `status-warning`: Amber indicators
- `status-danger`: Red indicators
- `status-info`: Blue indicators

## Deployment (Railway)

The app is configured for Railway deployment:

1. Push to GitHub
2. Connect repository to Railway
3. Railway auto-detects `nixpacks.toml`
4. Build: Installs deps, builds client
5. Start: Runs Express server serving static files

Environment variables are optional - PORT is auto-configured by Railway.

## Security Notes

- Tokens are never stored or logged
- All HubSpot API calls are read-only
- No data persisted on server
- CORS enabled for local development
- Helmet.js for security headers in production

## Future Enhancement Ideas

- [ ] Historical audit comparison
- [ ] Scheduled automated audits
- [ ] Email report delivery
- [ ] Custom audit rules
- [ ] Integration with Slack/Teams notifications
- [ ] Advanced duplicate detection with ML
- [ ] Bulk data cleanup recommendations
