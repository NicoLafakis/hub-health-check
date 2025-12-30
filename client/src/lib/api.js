const API_BASE = '/api';

/**
 * Validate HubSpot token and check scopes
 */
export async function validateToken(token) {
  const response = await fetch(`${API_BASE}/audit/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Validation failed');
  }

  return data;
}

/**
 * Run full CRM audit
 */
export async function runAudit(token) {
  const response = await fetch(`${API_BASE}/audit/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Audit failed');
  }

  return data.data;
}

/**
 * Export results as PDF
 */
export async function exportPDF(results) {
  const response = await fetch(`${API_BASE}/export/pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ results })
  });

  if (!response.ok) {
    throw new Error('Failed to generate PDF');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hubcheck-report-${results.hubId}-${Date.now()}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Export results as Markdown
 */
export async function exportMarkdown(results) {
  const response = await fetch(`${API_BASE}/export/markdown`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ results })
  });

  if (!response.ok) {
    throw new Error('Failed to generate Markdown');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hubcheck-report-${results.hubId}-${Date.now()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Get scope information
 */
export async function getScopes() {
  const response = await fetch(`${API_BASE}/audit/scopes`);
  return response.json();
}
