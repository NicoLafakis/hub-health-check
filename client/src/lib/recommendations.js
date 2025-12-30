// AI-powered recommendations engine
export function generateSmartRecommendations(results) {
  const recommendations = [];
  const categories = results.categories;

  // Analyze patterns across categories
  const lowestCategory = categories.reduce((min, c) => c.score < min.score ? c : min, categories[0]);
  const criticalIssues = [];
  const quickWins = [];

  categories.forEach(category => {
    category.checks.forEach(check => {
      if (check.status === 'danger') {
        criticalIssues.push({ category: category.name, check });
      }
      // Quick wins are warnings with high impact that are easy to fix
      if (check.status === 'warning' && check.percentage && parseFloat(check.percentage) < 30) {
        quickWins.push({ category: category.name, check });
      }
    });
  });

  // Priority 1: Critical issues
  if (criticalIssues.length > 0) {
    recommendations.push({
      priority: 'critical',
      title: 'Fix Critical Data Issues',
      description: `You have ${criticalIssues.length} critical issues that need immediate attention.`,
      impact: 'high',
      effort: 'medium',
      actions: criticalIssues.slice(0, 3).map(i => ({
        text: `${i.category}: ${i.check.label}`,
        detail: i.check.recommendation
      })),
      potentialScoreGain: Math.min(15, criticalIssues.length * 3)
    });
  }

  // Priority 2: Quick wins
  if (quickWins.length > 0) {
    recommendations.push({
      priority: 'quick-win',
      title: 'Quick Wins for Immediate Impact',
      description: 'These issues are easy to fix and will boost your score quickly.',
      impact: 'medium',
      effort: 'low',
      actions: quickWins.slice(0, 3).map(i => ({
        text: `${i.category}: ${i.check.label}`,
        detail: i.check.recommendation
      })),
      potentialScoreGain: Math.min(10, quickWins.length * 2)
    });
  }

  // Priority 3: Focus area (lowest category)
  if (lowestCategory.score < 70) {
    recommendations.push({
      priority: 'focus',
      title: `Focus on ${lowestCategory.name}`,
      description: `This category is your weakest area at ${lowestCategory.score}%. Improving it will have the biggest impact on your overall score.`,
      impact: 'high',
      effort: 'high',
      actions: lowestCategory.checks
        .filter(c => c.status !== 'healthy')
        .slice(0, 3)
        .map(c => ({
          text: c.label,
          detail: c.recommendation
        })),
      potentialScoreGain: Math.round((70 - lowestCategory.score) * 0.5)
    });
  }

  // Priority 4: Data enrichment suggestions
  const companyCategory = categories.find(c => c.id === 'companies');
  if (companyCategory && companyCategory.score < 60) {
    recommendations.push({
      priority: 'enhancement',
      title: 'Consider Data Enrichment',
      description: 'Your company data could benefit from third-party enrichment services.',
      impact: 'high',
      effort: 'low',
      actions: [
        { text: 'HubSpot Data Enrichment', detail: 'Built-in HubSpot feature to auto-fill company data' },
        { text: 'Clearbit', detail: 'Popular B2B data enrichment service' },
        { text: 'ZoomInfo', detail: 'Enterprise-grade firmographic data' }
      ],
      potentialScoreGain: 15
    });
  }

  // Priority 5: Automation suggestions
  const hasDuplicates = categories
    .flatMap(c => c.checks)
    .some(check => check.id === 'duplicate_contacts' && check.status !== 'healthy');

  if (hasDuplicates) {
    recommendations.push({
      priority: 'automation',
      title: 'Automate Duplicate Prevention',
      description: 'Set up workflows to prevent duplicate records from being created.',
      impact: 'medium',
      effort: 'medium',
      actions: [
        { text: 'Create deduplication workflow', detail: 'Use HubSpot Operations Hub to automatically merge duplicates' },
        { text: 'Set up form validation', detail: 'Check for existing contacts before creating new ones' },
        { text: 'Standardize data entry', detail: 'Create naming conventions and required fields' }
      ],
      potentialScoreGain: 8
    });
  }

  // Priority 6: Maintenance recommendations
  if (results.healthScore >= 80) {
    recommendations.push({
      priority: 'maintenance',
      title: 'Maintain Your Excellent Health',
      description: 'Your portal is in great shape! Here are tips to keep it that way.',
      impact: 'low',
      effort: 'low',
      actions: [
        { text: 'Schedule monthly audits', detail: 'Run HubCheck regularly to catch issues early' },
        { text: 'Set up data quality workflows', detail: 'Automate data validation and cleanup' },
        { text: 'Train your team', detail: 'Ensure everyone follows data entry best practices' }
      ],
      potentialScoreGain: 5
    });
  }

  return recommendations;
}

export function getActionPlan(results) {
  const recommendations = generateSmartRecommendations(results);

  // Create a 30-day action plan
  const plan = {
    week1: {
      title: 'Week 1: Critical Fixes',
      tasks: [],
      estimatedGain: 0
    },
    week2: {
      title: 'Week 2: Quick Wins',
      tasks: [],
      estimatedGain: 0
    },
    week3: {
      title: 'Week 3: Deep Cleanup',
      tasks: [],
      estimatedGain: 0
    },
    week4: {
      title: 'Week 4: Optimization',
      tasks: [],
      estimatedGain: 0
    }
  };

  recommendations.forEach(rec => {
    if (rec.priority === 'critical') {
      plan.week1.tasks.push(...rec.actions.map(a => a.text));
      plan.week1.estimatedGain += rec.potentialScoreGain;
    } else if (rec.priority === 'quick-win') {
      plan.week2.tasks.push(...rec.actions.map(a => a.text));
      plan.week2.estimatedGain += rec.potentialScoreGain;
    } else if (rec.priority === 'focus') {
      plan.week3.tasks.push(...rec.actions.map(a => a.text));
      plan.week3.estimatedGain += rec.potentialScoreGain;
    } else {
      plan.week4.tasks.push(...rec.actions.map(a => a.text));
      plan.week4.estimatedGain += rec.potentialScoreGain;
    }
  });

  return plan;
}
