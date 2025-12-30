# HubCheck - HubSpot CRM Health Auditor

A comprehensive health auditing tool for HubSpot CRM portals. Analyze your contacts, companies, and deals to identify data quality issues and get actionable recommendations.

## Features

- **Comprehensive Audits**: Analyze contacts, companies, and deals across 6 audit categories
- **Scope Validation**: Clearly shows which HubSpot scopes are missing
- **Health Scoring**: Get an overall health score plus individual category scores
- **Export Reports**: Download results as PDF or Markdown
- **Real-time Analysis**: Connect with your HubSpot Private App token

## Audit Categories

1. **Contact Hygiene** - Email completeness, duplicates, lifecycle stages
2. **Pipeline Health** - Stale deals, missing close dates, unassigned deals
3. **Data Integrity** - Orphaned records, data freshness, associations
4. **Company Data Quality** - Industry, domain, employee, revenue fill rates
5. **Engagement & Growth** - Lead status, conversion rates, contact growth
6. **Data Quality Score** - Overall completeness metrics

## Quick Start

### Prerequisites

- Node.js 18+
- A HubSpot Private App token with the following scopes:
  - `crm.objects.contacts.read`
  - `crm.objects.companies.read`
  - `crm.objects.deals.read`
  - `crm.schemas.contacts.read`
  - `crm.schemas.companies.read`
  - `crm.schemas.deals.read`
  - `crm.objects.owners.read`

### Local Development

```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev
```

The client runs on `http://localhost:5173` and the server on `http://localhost:3001`.

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Deploy to Railway

1. Connect your GitHub repository to Railway
2. Railway will automatically detect the configuration
3. Set environment variables if needed (PORT is auto-configured)
4. Deploy!

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template)

## Project Structure

```
hub-health-check/
├── client/                 # React frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # API utilities
│   │   └── App.jsx         # Main application
│   └── ...
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utilities
│   └── ...
├── railway.json            # Railway configuration
└── nixpacks.toml           # Build configuration
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/audit/validate` | POST | Validate token and check scopes |
| `/api/audit/run` | POST | Run full CRM audit |
| `/api/audit/scopes` | GET | Get list of required/optional scopes |
| `/api/export/pdf` | POST | Generate PDF report |
| `/api/export/markdown` | POST | Generate Markdown report |
| `/api/health` | GET | Health check endpoint |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Server port |
| `NODE_ENV` | development | Environment mode |
| `LOG_LEVEL` | info | Logging level |

## Security

- Tokens are never stored - only used for the duration of the request
- All API calls are read-only
- No data is persisted on the server
- HTTPS enforced in production

## License

MIT
