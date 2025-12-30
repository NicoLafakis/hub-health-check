import { useState, useCallback } from 'react';
import { validateToken, runAudit } from '../lib/api';

export function useAudit() {
  const [token, setToken] = useState('');
  const [tokenInfo, setTokenInfo] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditPhase, setAuditPhase] = useState('');

  const validate = useCallback(async () => {
    if (!token) {
      setError('Please enter your Private App Token');
      return false;
    }

    if (!token.startsWith('pat-')) {
      setError('Invalid format. HubSpot Private App Tokens must start with "pat-"');
      return false;
    }

    setIsValidating(true);
    setError(null);

    try {
      const info = await validateToken(token);
      setTokenInfo(info);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [token]);

  const audit = useCallback(async () => {
    if (!token) {
      setError('Please enter your Private App Token');
      return;
    }

    setIsAuditing(true);
    setError(null);
    setAuditPhase('Connecting to HubSpot...');

    try {
      // Validate first
      setAuditPhase('Validating token...');
      const info = await validateToken(token);
      setTokenInfo(info);

      // Check for missing required scopes
      if (info.scopes?.missingRequired?.length > 0) {
        setError(`Missing required scopes: ${info.scopes.missingRequired.join(', ')}`);
        setIsAuditing(false);
        return;
      }

      // Run audit
      setAuditPhase('Fetching CRM data...');
      await new Promise(r => setTimeout(r, 500));

      setAuditPhase('Analyzing contacts...');
      await new Promise(r => setTimeout(r, 300));

      setAuditPhase('Analyzing companies...');
      await new Promise(r => setTimeout(r, 300));

      setAuditPhase('Analyzing deals...');
      await new Promise(r => setTimeout(r, 300));

      setAuditPhase('Calculating health scores...');

      const auditResults = await runAudit(token);
      setResults(auditResults);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAuditing(false);
      setAuditPhase('');
    }
  }, [token]);

  const reset = useCallback(() => {
    setToken('');
    setTokenInfo(null);
    setResults(null);
    setError(null);
  }, []);

  return {
    token,
    setToken,
    tokenInfo,
    results,
    error,
    setError,
    isValidating,
    isAuditing,
    auditPhase,
    validate,
    audit,
    reset
  };
}
