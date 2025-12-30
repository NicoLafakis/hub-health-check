import { logger } from '../utils/logger.js';
import * as hubspot from './hubspot.js';

/**
 * Main audit engine - runs all audit checks
 */
export async function runFullAudit(accessToken) {
  const startTime = Date.now();
  const client = hubspot.createClient(accessToken);

  logger.info('Starting full CRM audit...');

  // Validate token and get scope info
  const tokenInfo = await hubspot.validateToken(accessToken);

  if (!tokenInfo.valid) {
    throw new Error(tokenInfo.error || 'Invalid token');
  }

  // Fetch all data in parallel for efficiency
  const [contacts, companies, deals, owners, pipelines] = await Promise.all([
    hubspot.fetchAllContacts(client, 2000).catch(err => {
      logger.warn('Failed to fetch contacts:', err.message);
      return [];
    }),
    hubspot.fetchAllCompanies(client, 2000).catch(err => {
      logger.warn('Failed to fetch companies:', err.message);
      return [];
    }),
    hubspot.fetchAllDeals(client, 2000).catch(err => {
      logger.warn('Failed to fetch deals:', err.message);
      return [];
    }),
    hubspot.fetchOwners(client).catch(() => []),
    hubspot.fetchPipelines(client).catch(() => [])
  ]);

  logger.info(`Fetched: ${contacts.length} contacts, ${companies.length} companies, ${deals.length} deals`);

  // Run all audit categories
  const categories = await Promise.all([
    auditContactHygiene(contacts, companies, client),
    auditPipelineHealth(deals, pipelines, owners),
    auditDataIntegrity(contacts, companies, deals),
    auditCompanyData(companies),
    auditEngagement(contacts, deals),
    auditDataQuality(contacts, companies, deals)
  ]);

  // Calculate overall health score
  const avgScore = Math.round(
    categories.reduce((acc, cat) => acc + cat.score, 0) / categories.length
  );

  const auditDuration = Date.now() - startTime;

  return {
    hubId: tokenInfo.hubId,
    hubDomain: tokenInfo.hubDomain,
    healthScore: avgScore,
    categories,
    scopes: tokenInfo.scopes,
    stats: {
      totalContacts: contacts.length,
      totalCompanies: companies.length,
      totalDeals: deals.length,
      totalOwners: owners.length,
      auditDuration: `${(auditDuration / 1000).toFixed(2)}s`
    },
    lastRun: new Date().toISOString()
  };
}

/**
 * Audit Contact Hygiene
 */
async function auditContactHygiene(contacts, companies, client) {
  const checks = [];

  // Check for missing emails
  const missingEmails = contacts.filter(c => !c.properties?.email);
  const missingEmailPct = contacts.length > 0 ? (missingEmails.length / contacts.length * 100) : 0;

  checks.push({
    id: 'missing_emails',
    label: 'Missing Email Addresses',
    value: `${missingEmails.length} contacts`,
    percentage: missingEmailPct.toFixed(1),
    status: missingEmailPct > 20 ? 'danger' : missingEmailPct > 10 ? 'warning' : 'healthy',
    description: 'Contacts without a primary email address',
    recommendation: missingEmails.length > 0 ? 'Review and update contacts missing email addresses' : 'All contacts have email addresses',
    affectedRecords: missingEmails.slice(0, 10).map(c => ({
      id: c.id,
      name: `${c.properties?.firstname || ''} ${c.properties?.lastname || ''}`.trim() || 'Unnamed Contact'
    }))
  });

  // Check for missing names
  const missingNames = contacts.filter(c => !c.properties?.firstname && !c.properties?.lastname);
  const missingNamesPct = contacts.length > 0 ? (missingNames.length / contacts.length * 100) : 0;

  checks.push({
    id: 'missing_names',
    label: 'Missing Names',
    value: `${missingNames.length} contacts`,
    percentage: missingNamesPct.toFixed(1),
    status: missingNamesPct > 30 ? 'danger' : missingNamesPct > 15 ? 'warning' : 'healthy',
    description: 'Contacts without first or last name',
    recommendation: missingNames.length > 0 ? 'Enrich contact data with proper names' : 'All contacts have names'
  });

  // Check for potential duplicates (same email domain + similar names)
  const emailDomains = new Map();
  contacts.forEach(c => {
    const email = c.properties?.email;
    if (email) {
      const domain = email.split('@')[1];
      if (!emailDomains.has(domain)) emailDomains.set(domain, []);
      emailDomains.get(domain).push(c);
    }
  });

  let potentialDuplicates = 0;
  const duplicatePairs = [];

  emailDomains.forEach((domainContacts, domain) => {
    if (domainContacts.length > 1 && !domain?.includes('gmail') && !domain?.includes('yahoo') && !domain?.includes('hotmail')) {
      // Check for similar names within same domain
      for (let i = 0; i < domainContacts.length; i++) {
        for (let j = i + 1; j < domainContacts.length; j++) {
          const name1 = `${domainContacts[i].properties?.firstname || ''} ${domainContacts[i].properties?.lastname || ''}`.toLowerCase().trim();
          const name2 = `${domainContacts[j].properties?.firstname || ''} ${domainContacts[j].properties?.lastname || ''}`.toLowerCase().trim();

          if (name1 && name2 && (name1 === name2 || levenshteinDistance(name1, name2) <= 2)) {
            potentialDuplicates++;
            if (duplicatePairs.length < 5) {
              duplicatePairs.push({
                contact1: { id: domainContacts[i].id, email: domainContacts[i].properties?.email },
                contact2: { id: domainContacts[j].id, email: domainContacts[j].properties?.email }
              });
            }
          }
        }
      }
    }
  });

  checks.push({
    id: 'duplicate_contacts',
    label: 'Potential Duplicates',
    value: `${potentialDuplicates} pairs`,
    status: potentialDuplicates > 50 ? 'danger' : potentialDuplicates > 10 ? 'warning' : 'healthy',
    description: 'Contacts with similar names at the same domain',
    recommendation: potentialDuplicates > 0 ? 'Review and merge duplicate contacts' : 'No obvious duplicates found',
    affectedRecords: duplicatePairs
  });

  // Check lifecycle stage distribution
  const lifecycleStages = {};
  contacts.forEach(c => {
    const stage = c.properties?.lifecyclestage || 'unset';
    lifecycleStages[stage] = (lifecycleStages[stage] || 0) + 1;
  });

  const unsetLifecycle = lifecycleStages['unset'] || 0;
  const unsetPct = contacts.length > 0 ? (unsetLifecycle / contacts.length * 100) : 0;

  checks.push({
    id: 'lifecycle_stages',
    label: 'Lifecycle Stage Coverage',
    value: `${(100 - unsetPct).toFixed(1)}% set`,
    status: unsetPct > 50 ? 'danger' : unsetPct > 25 ? 'warning' : 'healthy',
    description: 'Contacts with defined lifecycle stages',
    recommendation: unsetPct > 10 ? 'Assign lifecycle stages to unsegmented contacts' : 'Good lifecycle stage coverage',
    metadata: lifecycleStages
  });

  // Calculate category score
  const score = calculateCategoryScore(checks);

  return {
    id: 'contacts',
    name: 'Contact Hygiene',
    icon: 'Users',
    score,
    checks,
    recordCount: contacts.length
  };
}

/**
 * Audit Pipeline Health
 */
async function auditPipelineHealth(deals, pipelines, owners) {
  const checks = [];
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Check for stale deals (no activity in 30 days)
  const staleDeals = deals.filter(d => {
    const lastModified = d.properties?.lastmodifieddate || d.properties?.hs_lastmodifieddate;
    if (!lastModified) return true;
    return new Date(lastModified) < thirtyDaysAgo;
  });

  const stalePct = deals.length > 0 ? (staleDeals.length / deals.length * 100) : 0;

  checks.push({
    id: 'stale_deals',
    label: 'Stale Deals',
    value: `${staleDeals.length} deals`,
    percentage: stalePct.toFixed(1),
    status: stalePct > 30 ? 'danger' : stalePct > 15 ? 'warning' : 'healthy',
    description: 'No activity logged in the last 30 days',
    recommendation: staleDeals.length > 0 ? 'Review stale deals and update or close them' : 'All deals are active',
    affectedRecords: staleDeals.slice(0, 10).map(d => ({
      id: d.id,
      name: d.properties?.dealname || 'Unnamed Deal',
      amount: d.properties?.amount
    }))
  });

  // Check for missing close dates
  const openDeals = deals.filter(d => {
    const stage = d.properties?.dealstage;
    return stage !== 'closedwon' && stage !== 'closedlost';
  });

  const missingCloseDates = openDeals.filter(d => !d.properties?.closedate);
  const missingClosePct = openDeals.length > 0 ? (missingCloseDates.length / openDeals.length * 100) : 0;

  checks.push({
    id: 'missing_close_dates',
    label: 'Missing Close Dates',
    value: `${missingCloseDates.length} open deals`,
    percentage: missingClosePct.toFixed(1),
    status: missingClosePct > 30 ? 'danger' : missingClosePct > 15 ? 'warning' : 'healthy',
    description: 'Open deals without forecasted close dates',
    recommendation: missingCloseDates.length > 0 ? 'Add close dates for better forecasting' : 'All open deals have close dates'
  });

  // Check for missing amounts
  const missingAmounts = deals.filter(d => {
    const amount = parseFloat(d.properties?.amount || 0);
    return amount === 0;
  });

  const missingAmountPct = deals.length > 0 ? (missingAmounts.length / deals.length * 100) : 0;

  checks.push({
    id: 'missing_amounts',
    label: 'Missing Deal Amounts',
    value: `${missingAmounts.length} deals`,
    percentage: missingAmountPct.toFixed(1),
    status: missingAmountPct > 40 ? 'danger' : missingAmountPct > 20 ? 'warning' : 'healthy',
    description: 'Deals with zero or missing amounts',
    recommendation: missingAmounts.length > 0 ? 'Update deal amounts for accurate pipeline value' : 'All deals have amounts'
  });

  // Check for unassigned deals
  const unassignedDeals = deals.filter(d => !d.properties?.hubspot_owner_id);
  const unassignedPct = deals.length > 0 ? (unassignedDeals.length / deals.length * 100) : 0;

  checks.push({
    id: 'unassigned_deals',
    label: 'Unassigned Deals',
    value: `${unassignedDeals.length} deals`,
    percentage: unassignedPct.toFixed(1),
    status: unassignedPct > 20 ? 'danger' : unassignedPct > 10 ? 'warning' : 'healthy',
    description: 'Deals without an assigned owner',
    recommendation: unassignedDeals.length > 0 ? 'Assign owners to all deals' : 'All deals have owners'
  });

  // Pipeline distribution
  const pipelineStats = {};
  let totalPipelineValue = 0;

  deals.forEach(d => {
    const pipeline = d.properties?.pipeline || 'default';
    const stage = d.properties?.dealstage || 'unknown';
    const amount = parseFloat(d.properties?.amount || 0);

    if (!pipelineStats[pipeline]) {
      pipelineStats[pipeline] = { total: 0, stages: {}, value: 0 };
    }
    pipelineStats[pipeline].total++;
    pipelineStats[pipeline].stages[stage] = (pipelineStats[pipeline].stages[stage] || 0) + 1;
    pipelineStats[pipeline].value += amount;
    totalPipelineValue += amount;
  });

  checks.push({
    id: 'pipeline_value',
    label: 'Total Pipeline Value',
    value: `$${totalPipelineValue.toLocaleString()}`,
    status: 'info',
    description: 'Sum of all deal amounts in pipeline',
    metadata: pipelineStats
  });

  const score = calculateCategoryScore(checks);

  return {
    id: 'deals',
    name: 'Pipeline Health',
    icon: 'Briefcase',
    score,
    checks,
    recordCount: deals.length
  };
}

/**
 * Audit Data Integrity
 */
async function auditDataIntegrity(contacts, companies, deals) {
  const checks = [];

  // Check for orphaned contacts (no company association)
  const orphanedContacts = contacts.filter(c => !c.properties?.associatedcompanyid);
  const orphanedPct = contacts.length > 0 ? (orphanedContacts.length / contacts.length * 100) : 0;

  checks.push({
    id: 'orphaned_contacts',
    label: 'Orphaned Contacts',
    value: `${orphanedContacts.length} contacts`,
    percentage: orphanedPct.toFixed(1),
    status: orphanedPct > 50 ? 'danger' : orphanedPct > 25 ? 'warning' : 'healthy',
    description: 'Contacts not associated with any company',
    recommendation: orphanedContacts.length > 0 ? 'Associate contacts with their companies' : 'All contacts are properly associated',
    affectedRecords: orphanedContacts.slice(0, 10).map(c => ({
      id: c.id,
      name: `${c.properties?.firstname || ''} ${c.properties?.lastname || ''}`.trim() || c.properties?.email || 'Unknown'
    }))
  });

  // Check contact to company ratio
  const ratio = companies.length > 0 ? (contacts.length / companies.length).toFixed(1) : 0;

  checks.push({
    id: 'contact_company_ratio',
    label: 'Contact to Company Ratio',
    value: `${ratio}:1`,
    status: ratio > 20 ? 'warning' : ratio < 1 ? 'warning' : 'healthy',
    description: 'Average contacts per company',
    recommendation: ratio > 20 ? 'High ratio may indicate data quality issues' : 'Ratio looks healthy'
  });

  // Check for deals without contacts
  // (This would require association data which we'll estimate)
  const recentDeals = deals.filter(d => {
    const created = d.properties?.createdate;
    if (!created) return false;
    const daysSinceCreated = (Date.now() - new Date(created).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreated <= 90;
  });

  checks.push({
    id: 'recent_deal_activity',
    label: 'Recent Deal Activity',
    value: `${recentDeals.length} deals (90 days)`,
    status: recentDeals.length === 0 && deals.length > 0 ? 'warning' : 'healthy',
    description: 'Deals created in the last 90 days',
    recommendation: recentDeals.length === 0 ? 'Consider reviewing your sales process' : 'Active deal creation'
  });

  // Data freshness
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const staleContacts = contacts.filter(c => {
    const lastMod = c.properties?.lastmodifieddate;
    return lastMod && new Date(lastMod) < thirtyDaysAgo;
  });

  const stalePct = contacts.length > 0 ? (staleContacts.length / contacts.length * 100) : 0;

  checks.push({
    id: 'data_freshness',
    label: 'Data Freshness',
    value: `${(100 - stalePct).toFixed(1)}% recent`,
    status: stalePct > 70 ? 'danger' : stalePct > 50 ? 'warning' : 'healthy',
    description: 'Contacts modified in the last 30 days',
    recommendation: stalePct > 50 ? 'Consider re-engaging stale contacts' : 'Data is reasonably fresh'
  });

  const score = calculateCategoryScore(checks);

  return {
    id: 'integrity',
    name: 'Data Integrity',
    icon: 'Database',
    score,
    checks,
    recordCount: contacts.length + companies.length + deals.length
  };
}

/**
 * Audit Company Data
 */
async function auditCompanyData(companies) {
  const checks = [];

  // Industry field fill rate
  const withIndustry = companies.filter(c => c.properties?.industry);
  const industryPct = companies.length > 0 ? (withIndustry.length / companies.length * 100) : 0;

  checks.push({
    id: 'industry_fill',
    label: 'Industry Field Fill Rate',
    value: `${industryPct.toFixed(1)}%`,
    status: industryPct < 50 ? 'danger' : industryPct < 75 ? 'warning' : 'healthy',
    description: 'Companies with industry property set',
    recommendation: industryPct < 75 ? 'Enrich company data with industry information' : 'Good industry coverage'
  });

  // Domain fill rate
  const withDomain = companies.filter(c => c.properties?.domain);
  const domainPct = companies.length > 0 ? (withDomain.length / companies.length * 100) : 0;

  checks.push({
    id: 'domain_fill',
    label: 'Domain Fill Rate',
    value: `${domainPct.toFixed(1)}%`,
    status: domainPct < 60 ? 'danger' : domainPct < 80 ? 'warning' : 'healthy',
    description: 'Companies with website domain set',
    recommendation: domainPct < 80 ? 'Add website domains to companies' : 'Good domain coverage'
  });

  // Employee count fill rate
  const withEmployees = companies.filter(c => c.properties?.numberofemployees);
  const employeesPct = companies.length > 0 ? (withEmployees.length / companies.length * 100) : 0;

  checks.push({
    id: 'employees_fill',
    label: 'Employee Count Fill Rate',
    value: `${employeesPct.toFixed(1)}%`,
    status: employeesPct < 40 ? 'danger' : employeesPct < 60 ? 'warning' : 'healthy',
    description: 'Companies with employee count set',
    recommendation: employeesPct < 60 ? 'Enrich with firmographic data' : 'Good employee data coverage'
  });

  // Revenue fill rate
  const withRevenue = companies.filter(c => {
    const rev = parseFloat(c.properties?.annualrevenue || 0);
    return rev > 0;
  });
  const revenuePct = companies.length > 0 ? (withRevenue.length / companies.length * 100) : 0;

  checks.push({
    id: 'revenue_fill',
    label: 'Annual Revenue Fill Rate',
    value: `${revenuePct.toFixed(1)}%`,
    status: revenuePct < 30 ? 'danger' : revenuePct < 50 ? 'warning' : 'healthy',
    description: 'Companies with annual revenue set',
    recommendation: revenuePct < 50 ? 'Add revenue data for better segmentation' : 'Revenue data looks good'
  });

  // Location data
  const withLocation = companies.filter(c => c.properties?.city || c.properties?.country);
  const locationPct = companies.length > 0 ? (withLocation.length / companies.length * 100) : 0;

  checks.push({
    id: 'location_fill',
    label: 'Location Data Fill Rate',
    value: `${locationPct.toFixed(1)}%`,
    status: locationPct < 50 ? 'warning' : 'healthy',
    description: 'Companies with city or country set',
    recommendation: locationPct < 50 ? 'Add location data for geographic analysis' : 'Good location coverage'
  });

  const score = calculateCategoryScore(checks);

  return {
    id: 'companies',
    name: 'Company Data Quality',
    icon: 'Building2',
    score,
    checks,
    recordCount: companies.length
  };
}

/**
 * Audit Engagement
 */
async function auditEngagement(contacts, deals) {
  const checks = [];

  // Lead status distribution
  const leadStatuses = {};
  contacts.forEach(c => {
    const status = c.properties?.hs_lead_status || 'unset';
    leadStatuses[status] = (leadStatuses[status] || 0) + 1;
  });

  const unsetLeadStatus = leadStatuses['unset'] || 0;
  const unsetPct = contacts.length > 0 ? (unsetLeadStatus / contacts.length * 100) : 0;

  checks.push({
    id: 'lead_status_coverage',
    label: 'Lead Status Coverage',
    value: `${(100 - unsetPct).toFixed(1)}% set`,
    status: unsetPct > 60 ? 'danger' : unsetPct > 40 ? 'warning' : 'healthy',
    description: 'Contacts with lead status assigned',
    recommendation: unsetPct > 40 ? 'Assign lead statuses for better tracking' : 'Good lead status coverage',
    metadata: leadStatuses
  });

  // Conversion potential (deals vs contacts ratio)
  const conversionRate = contacts.length > 0 ? (deals.length / contacts.length * 100) : 0;

  checks.push({
    id: 'conversion_rate',
    label: 'Deal Conversion Rate',
    value: `${conversionRate.toFixed(2)}%`,
    status: conversionRate < 1 ? 'warning' : conversionRate > 20 ? 'warning' : 'healthy',
    description: 'Deals created per contact',
    recommendation: conversionRate < 1 ? 'Review lead qualification process' : 'Conversion rate looks reasonable'
  });

  // Recent contact creation (growth indicator)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentContacts = contacts.filter(c => {
    const created = c.properties?.createdate;
    return created && new Date(created) > thirtyDaysAgo;
  });

  checks.push({
    id: 'contact_growth',
    label: 'Monthly Contact Growth',
    value: `${recentContacts.length} new contacts`,
    status: recentContacts.length === 0 ? 'warning' : 'healthy',
    description: 'Contacts created in the last 30 days',
    recommendation: recentContacts.length === 0 ? 'Lead generation may need attention' : 'Active lead generation'
  });

  const score = calculateCategoryScore(checks);

  return {
    id: 'engagement',
    name: 'Engagement & Growth',
    icon: 'TrendingUp',
    score,
    checks,
    recordCount: contacts.length
  };
}

/**
 * Audit Overall Data Quality
 */
async function auditDataQuality(contacts, companies, deals) {
  const checks = [];

  // Calculate completeness scores
  const contactCompleteness = calculateCompleteness(contacts, ['email', 'firstname', 'lastname', 'company', 'phone']);
  const companyCompleteness = calculateCompleteness(companies, ['name', 'domain', 'industry', 'numberofemployees']);
  const dealCompleteness = calculateCompleteness(deals, ['dealname', 'amount', 'closedate', 'dealstage']);

  checks.push({
    id: 'contact_completeness',
    label: 'Contact Data Completeness',
    value: `${contactCompleteness.toFixed(1)}%`,
    status: contactCompleteness < 50 ? 'danger' : contactCompleteness < 70 ? 'warning' : 'healthy',
    description: 'Average fill rate for key contact properties',
    recommendation: contactCompleteness < 70 ? 'Improve contact data entry processes' : 'Contact data is well maintained'
  });

  checks.push({
    id: 'company_completeness',
    label: 'Company Data Completeness',
    value: `${companyCompleteness.toFixed(1)}%`,
    status: companyCompleteness < 40 ? 'danger' : companyCompleteness < 60 ? 'warning' : 'healthy',
    description: 'Average fill rate for key company properties',
    recommendation: companyCompleteness < 60 ? 'Enrich company records with additional data' : 'Company data is reasonably complete'
  });

  checks.push({
    id: 'deal_completeness',
    label: 'Deal Data Completeness',
    value: `${dealCompleteness.toFixed(1)}%`,
    status: dealCompleteness < 60 ? 'danger' : dealCompleteness < 80 ? 'warning' : 'healthy',
    description: 'Average fill rate for key deal properties',
    recommendation: dealCompleteness < 80 ? 'Enforce deal data requirements' : 'Deal data is well maintained'
  });

  // Overall data quality score
  const overallQuality = (contactCompleteness + companyCompleteness + dealCompleteness) / 3;

  checks.push({
    id: 'overall_quality',
    label: 'Overall Data Quality',
    value: `${overallQuality.toFixed(1)}%`,
    status: overallQuality < 50 ? 'danger' : overallQuality < 65 ? 'warning' : 'healthy',
    description: 'Combined data quality score',
    recommendation: overallQuality < 65 ? 'Focus on improving data quality across all objects' : 'Data quality is good'
  });

  const score = calculateCategoryScore(checks);

  return {
    id: 'quality',
    name: 'Data Quality Score',
    icon: 'CheckCircle',
    score,
    checks,
    recordCount: contacts.length + companies.length + deals.length
  };
}

// Helper functions

function calculateCategoryScore(checks) {
  const scorableChecks = checks.filter(c => c.status !== 'info');
  if (scorableChecks.length === 0) return 100;

  const statusScores = {
    healthy: 100,
    warning: 60,
    danger: 20
  };

  const totalScore = scorableChecks.reduce((acc, check) => {
    return acc + (statusScores[check.status] || 50);
  }, 0);

  return Math.round(totalScore / scorableChecks.length);
}

function calculateCompleteness(records, properties) {
  if (records.length === 0) return 100;

  let totalFilled = 0;
  let totalChecks = records.length * properties.length;

  records.forEach(record => {
    properties.forEach(prop => {
      if (record.properties?.[prop]) {
        totalFilled++;
      }
    });
  });

  return (totalFilled / totalChecks) * 100;
}

function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}
