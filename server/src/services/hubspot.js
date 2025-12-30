import { Client } from '@hubspot/api-client';
import { logger } from '../utils/logger.js';

// All scopes that HubCheck can utilize
export const REQUIRED_SCOPES = [
  'crm.objects.contacts.read',
  'crm.objects.companies.read',
  'crm.objects.deals.read',
  'crm.schemas.contacts.read',
  'crm.schemas.companies.read',
  'crm.schemas.deals.read',
  'crm.objects.owners.read'
];

// Optional scopes that enhance the audit
export const OPTIONAL_SCOPES = [
  'crm.objects.custom.read',
  'crm.objects.marketing_events.read',
  'crm.objects.quotes.read',
  'crm.objects.line_items.read',
  'crm.lists.read',
  'automation.workflows.read',
  'forms.read',
  'files.read'
];

/**
 * Validate token and check available scopes
 */
export async function validateToken(accessToken) {
  const hubspotClient = new Client({ accessToken });

  try {
    // Get access token info to check scopes
    const tokenInfo = await hubspotClient.oauth.accessTokensApi.get(accessToken);

    const availableScopes = tokenInfo.scopes || [];
    const missingRequired = REQUIRED_SCOPES.filter(s => !availableScopes.includes(s));
    const availableOptional = OPTIONAL_SCOPES.filter(s => availableScopes.includes(s));

    // Get portal info
    const accountInfo = await hubspotClient.apiRequest({
      method: 'GET',
      path: '/account-info/v3/details'
    });

    const accountData = await accountInfo.json();

    return {
      valid: true,
      hubId: accountData.portalId,
      hubDomain: accountData.uiDomain,
      timeZone: accountData.timeZone,
      scopes: {
        available: availableScopes,
        missingRequired,
        availableOptional,
        hasAllRequired: missingRequired.length === 0
      }
    };
  } catch (error) {
    logger.error('Token validation failed:', error.message);

    // Handle specific error types
    if (error.code === 401 || error.message?.includes('401')) {
      return {
        valid: false,
        error: 'Invalid or expired token',
        errorCode: 'INVALID_TOKEN'
      };
    }

    // Try alternative validation for Private App tokens
    try {
      const contactsTest = await hubspotClient.crm.contacts.basicApi.getPage(1);

      // If we get here, token works but we couldn't get scope info
      // This happens with some Private App tokens
      return {
        valid: true,
        hubId: 'Unknown',
        scopes: {
          available: ['crm.objects.contacts.read'], // At minimum
          missingRequired: [],
          availableOptional: [],
          hasAllRequired: true,
          note: 'Scope detection limited for Private App tokens'
        }
      };
    } catch (fallbackError) {
      return {
        valid: false,
        error: error.message || 'Token validation failed',
        errorCode: 'VALIDATION_FAILED'
      };
    }
  }
}

/**
 * Create HubSpot client instance
 */
export function createClient(accessToken) {
  return new Client({ accessToken });
}

/**
 * Fetch contacts with properties
 */
export async function fetchContacts(client, limit = 100) {
  try {
    const response = await client.crm.contacts.basicApi.getPage(
      limit,
      undefined,
      ['email', 'firstname', 'lastname', 'company', 'phone', 'lifecyclestage', 'createdate', 'lastmodifieddate', 'hs_lead_status']
    );
    return response.results || [];
  } catch (error) {
    logger.error('Failed to fetch contacts:', error.message);
    throw error;
  }
}

/**
 * Fetch all contacts with pagination
 */
export async function fetchAllContacts(client, maxRecords = 1000) {
  const allContacts = [];
  let after = undefined;

  try {
    while (allContacts.length < maxRecords) {
      const response = await client.crm.contacts.basicApi.getPage(
        100,
        after,
        ['email', 'firstname', 'lastname', 'company', 'phone', 'lifecyclestage', 'createdate', 'lastmodifieddate', 'hs_lead_status', 'associatedcompanyid']
      );

      allContacts.push(...(response.results || []));

      if (!response.paging?.next?.after) break;
      after = response.paging.next.after;
    }

    return allContacts;
  } catch (error) {
    logger.error('Failed to fetch all contacts:', error.message);
    throw error;
  }
}

/**
 * Fetch companies with properties
 */
export async function fetchCompanies(client, limit = 100) {
  try {
    const response = await client.crm.companies.basicApi.getPage(
      limit,
      undefined,
      ['name', 'domain', 'industry', 'numberofemployees', 'annualrevenue', 'city', 'state', 'country', 'createdate', 'lastmodifieddate']
    );
    return response.results || [];
  } catch (error) {
    logger.error('Failed to fetch companies:', error.message);
    throw error;
  }
}

/**
 * Fetch all companies with pagination
 */
export async function fetchAllCompanies(client, maxRecords = 1000) {
  const allCompanies = [];
  let after = undefined;

  try {
    while (allCompanies.length < maxRecords) {
      const response = await client.crm.companies.basicApi.getPage(
        100,
        after,
        ['name', 'domain', 'industry', 'numberofemployees', 'annualrevenue', 'city', 'state', 'country', 'createdate', 'lastmodifieddate', 'lifecyclestage']
      );

      allCompanies.push(...(response.results || []));

      if (!response.paging?.next?.after) break;
      after = response.paging.next.after;
    }

    return allCompanies;
  } catch (error) {
    logger.error('Failed to fetch all companies:', error.message);
    throw error;
  }
}

/**
 * Fetch deals with properties
 */
export async function fetchDeals(client, limit = 100) {
  try {
    const response = await client.crm.deals.basicApi.getPage(
      limit,
      undefined,
      ['dealname', 'amount', 'dealstage', 'closedate', 'createdate', 'lastmodifieddate', 'pipeline', 'hs_lastmodifieddate']
    );
    return response.results || [];
  } catch (error) {
    logger.error('Failed to fetch deals:', error.message);
    throw error;
  }
}

/**
 * Fetch all deals with pagination
 */
export async function fetchAllDeals(client, maxRecords = 1000) {
  const allDeals = [];
  let after = undefined;

  try {
    while (allDeals.length < maxRecords) {
      const response = await client.crm.deals.basicApi.getPage(
        100,
        after,
        ['dealname', 'amount', 'dealstage', 'closedate', 'createdate', 'lastmodifieddate', 'pipeline', 'hs_lastmodifieddate', 'hubspot_owner_id']
      );

      allDeals.push(...(response.results || []));

      if (!response.paging?.next?.after) break;
      after = response.paging.next.after;
    }

    return allDeals;
  } catch (error) {
    logger.error('Failed to fetch all deals:', error.message);
    throw error;
  }
}

/**
 * Fetch owners
 */
export async function fetchOwners(client) {
  try {
    const response = await client.crm.owners.ownersApi.getPage();
    return response.results || [];
  } catch (error) {
    logger.error('Failed to fetch owners:', error.message);
    return [];
  }
}

/**
 * Fetch pipelines
 */
export async function fetchPipelines(client, objectType = 'deals') {
  try {
    const response = await client.crm.pipelines.pipelinesApi.getAll(objectType);
    return response.results || [];
  } catch (error) {
    logger.error('Failed to fetch pipelines:', error.message);
    return [];
  }
}

/**
 * Fetch property definitions
 */
export async function fetchProperties(client, objectType) {
  try {
    const response = await client.crm.properties.coreApi.getAll(objectType);
    return response.results || [];
  } catch (error) {
    logger.error(`Failed to fetch ${objectType} properties:`, error.message);
    return [];
  }
}

/**
 * Search for duplicate contacts by email domain
 */
export async function searchDuplicateContacts(client, email) {
  try {
    const response = await client.crm.contacts.searchApi.doSearch({
      filterGroups: [{
        filters: [{
          propertyName: 'email',
          operator: 'CONTAINS_TOKEN',
          value: email.split('@')[1]
        }]
      }],
      limit: 10
    });
    return response.results || [];
  } catch (error) {
    logger.error('Duplicate search failed:', error.message);
    return [];
  }
}

/**
 * Get contact to company associations
 */
export async function getContactAssociations(client, contactId) {
  try {
    const response = await client.crm.associations.v4.basicApi.getPage(
      'contacts',
      contactId,
      'companies',
      undefined,
      100
    );
    return response.results || [];
  } catch (error) {
    return [];
  }
}

/**
 * Batch get associations for contacts
 */
export async function batchGetContactAssociations(client, contactIds) {
  const associations = new Map();

  // Process in batches of 100
  for (let i = 0; i < contactIds.length; i += 100) {
    const batch = contactIds.slice(i, i + 100);

    try {
      const response = await client.crm.associations.v4.batchApi.getPage(
        'contacts',
        'companies',
        { inputs: batch.map(id => ({ id })) }
      );

      for (const result of response.results || []) {
        associations.set(result.from.id, result.to || []);
      }
    } catch (error) {
      logger.error('Batch association fetch failed:', error.message);
    }
  }

  return associations;
}
