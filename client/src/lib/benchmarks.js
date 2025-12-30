// Industry benchmark data for comparison
export const BENCHMARKS = {
  contactHygiene: {
    emailFillRate: { median: 85, top25: 95, bottom25: 65 },
    nameFillRate: { median: 80, top25: 92, bottom25: 55 },
    duplicateRate: { median: 5, top25: 2, bottom25: 15 },
    lifecycleCoverage: { median: 70, top25: 90, bottom25: 40 }
  },
  pipelineHealth: {
    staleDealRate: { median: 20, top25: 8, bottom25: 40 },
    closeDateFillRate: { median: 75, top25: 95, bottom25: 50 },
    amountFillRate: { median: 80, top25: 95, bottom25: 55 },
    ownerAssignment: { median: 90, top25: 99, bottom25: 70 }
  },
  dataIntegrity: {
    orphanedContactRate: { median: 30, top25: 10, bottom25: 55 },
    contactCompanyRatio: { median: 5, top25: 3, bottom25: 10 },
    dataFreshness: { median: 60, top25: 85, bottom25: 30 }
  },
  companyQuality: {
    industryFillRate: { median: 55, top25: 80, bottom25: 25 },
    domainFillRate: { median: 70, top25: 90, bottom25: 40 },
    employeeFillRate: { median: 40, top25: 65, bottom25: 15 },
    revenueFillRate: { median: 25, top25: 50, bottom25: 10 }
  }
};

export function getBenchmarkComparison(metric, value, isLowerBetter = false) {
  const benchmark = BENCHMARKS[metric];
  if (!benchmark) return null;

  if (isLowerBetter) {
    if (value <= benchmark.top25) return { rating: 'excellent', percentile: 'Top 25%', color: 'emerald' };
    if (value <= benchmark.median) return { rating: 'good', percentile: 'Above Median', color: 'blue' };
    if (value <= benchmark.bottom25) return { rating: 'average', percentile: 'Below Median', color: 'amber' };
    return { rating: 'poor', percentile: 'Bottom 25%', color: 'rose' };
  } else {
    if (value >= benchmark.top25) return { rating: 'excellent', percentile: 'Top 25%', color: 'emerald' };
    if (value >= benchmark.median) return { rating: 'good', percentile: 'Above Median', color: 'blue' };
    if (value >= benchmark.bottom25) return { rating: 'average', percentile: 'Below Median', color: 'amber' };
    return { rating: 'poor', percentile: 'Bottom 25%', color: 'rose' };
  }
}

export function getOverallBenchmark(healthScore) {
  if (healthScore >= 90) return { tier: 'Elite', description: 'Top 10% of HubSpot portals', emoji: '🏆' };
  if (healthScore >= 80) return { tier: 'Excellent', description: 'Top 25% of HubSpot portals', emoji: '🌟' };
  if (healthScore >= 70) return { tier: 'Good', description: 'Above average portal health', emoji: '👍' };
  if (healthScore >= 60) return { tier: 'Fair', description: 'Room for improvement', emoji: '📊' };
  if (healthScore >= 50) return { tier: 'Needs Work', description: 'Below average portal health', emoji: '⚠️' };
  return { tier: 'Critical', description: 'Immediate attention required', emoji: '🚨' };
}
