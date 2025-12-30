import { Router } from 'express';
import { validateToken, REQUIRED_SCOPES, OPTIONAL_SCOPES } from '../services/hubspot.js';
import { runFullAudit } from '../services/auditEngine.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * POST /api/audit/validate
 * Validate token and check scopes
 */
router.post('/validate', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token is required',
        errorCode: 'MISSING_TOKEN'
      });
    }

    if (!token.startsWith('pat-')) {
      return res.status(400).json({
        error: 'Invalid token format. HubSpot Private App Tokens must start with "pat-"',
        errorCode: 'INVALID_FORMAT'
      });
    }

    const result = await validateToken(token);

    if (!result.valid) {
      return res.status(401).json({
        error: result.error,
        errorCode: result.errorCode
      });
    }

    // Include scope information with details about what's missing
    res.json({
      valid: true,
      hubId: result.hubId,
      hubDomain: result.hubDomain,
      timeZone: result.timeZone,
      scopes: {
        available: result.scopes.available,
        required: REQUIRED_SCOPES,
        optional: OPTIONAL_SCOPES,
        missingRequired: result.scopes.missingRequired,
        missingOptional: OPTIONAL_SCOPES.filter(s => !result.scopes.available.includes(s)),
        hasAllRequired: result.scopes.hasAllRequired,
        availableOptional: result.scopes.availableOptional,
        note: result.scopes.note
      }
    });
  } catch (error) {
    logger.error('Token validation error:', error);
    res.status(500).json({
      error: 'Failed to validate token',
      errorCode: 'VALIDATION_ERROR'
    });
  }
});

/**
 * POST /api/audit/run
 * Run full CRM audit
 */
router.post('/run', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token is required',
        errorCode: 'MISSING_TOKEN'
      });
    }

    if (!token.startsWith('pat-')) {
      return res.status(400).json({
        error: 'Invalid token format',
        errorCode: 'INVALID_FORMAT'
      });
    }

    logger.info('Starting audit...');
    const results = await runFullAudit(token);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    logger.error('Audit error:', error);

    // Handle specific HubSpot API errors
    if (error.code === 401 || error.message?.includes('401')) {
      return res.status(401).json({
        error: 'Invalid or expired token',
        errorCode: 'INVALID_TOKEN'
      });
    }

    if (error.code === 403 || error.message?.includes('403')) {
      return res.status(403).json({
        error: 'Insufficient permissions. Please check your token scopes.',
        errorCode: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    if (error.code === 429 || error.message?.includes('429')) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please wait a moment and try again.',
        errorCode: 'RATE_LIMITED'
      });
    }

    res.status(500).json({
      error: 'Audit failed',
      message: error.message,
      errorCode: 'AUDIT_ERROR'
    });
  }
});

/**
 * GET /api/audit/scopes
 * Get list of all scopes used by the application
 */
router.get('/scopes', (req, res) => {
  res.json({
    required: REQUIRED_SCOPES.map(scope => ({
      name: scope,
      description: getScopeDescription(scope)
    })),
    optional: OPTIONAL_SCOPES.map(scope => ({
      name: scope,
      description: getScopeDescription(scope)
    }))
  });
});

function getScopeDescription(scope) {
  const descriptions = {
    'crm.objects.contacts.read': 'Read contact records and properties',
    'crm.objects.companies.read': 'Read company records and properties',
    'crm.objects.deals.read': 'Read deal records and properties',
    'crm.schemas.contacts.read': 'Read contact property definitions',
    'crm.schemas.companies.read': 'Read company property definitions',
    'crm.schemas.deals.read': 'Read deal property definitions',
    'crm.objects.owners.read': 'Read owner/user information',
    'crm.objects.custom.read': 'Read custom object records',
    'crm.objects.marketing_events.read': 'Read marketing event data',
    'crm.objects.quotes.read': 'Read quote records',
    'crm.objects.line_items.read': 'Read line item records',
    'crm.lists.read': 'Read list memberships',
    'automation.workflows.read': 'Read workflow configurations',
    'forms.read': 'Read form submissions',
    'files.read': 'Read file attachments'
  };

  return descriptions[scope] || 'Access to ' + scope;
}

export default router;
