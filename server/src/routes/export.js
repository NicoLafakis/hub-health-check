import { Router } from 'express';
import PDFDocument from 'pdfkit';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * POST /api/export/pdf
 * Generate PDF report from audit results
 */
router.post('/pdf', async (req, res) => {
  try {
    const { results } = req.body;

    if (!results) {
      return res.status(400).json({ error: 'Audit results are required' });
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="hubcheck-report-${results.hubId}-${Date.now()}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Colors
    const primaryColor = '#FF7A59';
    const darkColor = '#2D3E50';
    const textColor = '#374151';
    const successColor = '#10B981';
    const warningColor = '#F59E0B';
    const dangerColor = '#EF4444';

    // Header
    doc.rect(0, 0, doc.page.width, 120).fill(darkColor);

    doc.fontSize(28)
       .fillColor('white')
       .text('HubCheck', 50, 40, { continued: true })
       .fontSize(12)
       .text('  CRM Health Report', { continued: false });

    doc.fontSize(10)
       .fillColor('#94A3B8')
       .text(`Hub ID: ${results.hubId}`, 50, 75)
       .text(`Generated: ${new Date(results.lastRun).toLocaleString()}`, 50, 90);

    // Health Score Box
    doc.roundedRect(doc.page.width - 150, 35, 100, 70, 5)
       .fill('white');

    const scoreColor = results.healthScore >= 85 ? successColor : results.healthScore >= 70 ? warningColor : dangerColor;

    doc.fontSize(36)
       .fillColor(scoreColor)
       .text(results.healthScore.toString(), doc.page.width - 145, 45, { width: 90, align: 'center' });

    doc.fontSize(8)
       .fillColor(textColor)
       .text('HEALTH SCORE', doc.page.width - 145, 85, { width: 90, align: 'center' });

    doc.moveDown(3);
    doc.y = 140;

    // Executive Summary
    doc.fontSize(16)
       .fillColor(darkColor)
       .text('Executive Summary', 50);

    doc.moveDown(0.5);
    doc.fontSize(10)
       .fillColor(textColor);

    const stats = results.stats;
    doc.text(`This audit analyzed ${stats.totalContacts.toLocaleString()} contacts, ${stats.totalCompanies.toLocaleString()} companies, and ${stats.totalDeals.toLocaleString()} deals in ${stats.auditDuration}.`);

    doc.moveDown();

    // Quick Stats
    doc.fontSize(12)
       .fillColor(darkColor)
       .text('Quick Stats', 50);

    doc.moveDown(0.5);

    const statsY = doc.y;
    const statBoxWidth = 120;
    const statBoxHeight = 50;
    const statBoxGap = 15;

    const quickStats = [
      { label: 'Contacts', value: stats.totalContacts.toLocaleString() },
      { label: 'Companies', value: stats.totalCompanies.toLocaleString() },
      { label: 'Deals', value: stats.totalDeals.toLocaleString() },
      { label: 'Owners', value: stats.totalOwners.toLocaleString() }
    ];

    quickStats.forEach((stat, i) => {
      const x = 50 + (i * (statBoxWidth + statBoxGap));
      doc.roundedRect(x, statsY, statBoxWidth, statBoxHeight, 3)
         .fill('#F8FAFC')
         .stroke('#E2E8F0');

      doc.fontSize(18)
         .fillColor(primaryColor)
         .text(stat.value, x + 10, statsY + 8, { width: statBoxWidth - 20 });

      doc.fontSize(8)
         .fillColor('#64748B')
         .text(stat.label.toUpperCase(), x + 10, statsY + 32, { width: statBoxWidth - 20 });
    });

    doc.y = statsY + statBoxHeight + 20;

    // Category Results
    doc.fontSize(16)
       .fillColor(darkColor)
       .text('Audit Categories', 50);

    doc.moveDown(0.5);

    for (const category of results.categories) {
      // Check if we need a new page
      if (doc.y > doc.page.height - 200) {
        doc.addPage();
        doc.y = 50;
      }

      const catY = doc.y;
      const catScoreColor = category.score >= 85 ? successColor : category.score >= 70 ? warningColor : dangerColor;

      // Category header
      doc.roundedRect(50, catY, doc.page.width - 100, 35, 3)
         .fill('#F8FAFC');

      doc.fontSize(12)
         .fillColor(darkColor)
         .text(category.name, 60, catY + 10);

      doc.fontSize(14)
         .fillColor(catScoreColor)
         .text(`${category.score}%`, doc.page.width - 100, catY + 10, { width: 40, align: 'right' });

      doc.y = catY + 45;

      // Category checks
      for (const check of category.checks) {
        if (doc.y > doc.page.height - 80) {
          doc.addPage();
          doc.y = 50;
        }

        const checkY = doc.y;
        const statusColor = check.status === 'healthy' ? successColor : check.status === 'warning' ? warningColor : check.status === 'danger' ? dangerColor : '#6B7280';

        // Status indicator
        doc.circle(65, checkY + 6, 4).fill(statusColor);

        // Check label and value
        doc.fontSize(10)
           .fillColor(textColor)
           .text(check.label, 80, checkY, { continued: true, width: 250 })
           .fillColor('#6B7280')
           .text(`: ${check.value}`, { continued: false });

        // Description
        doc.fontSize(8)
           .fillColor('#9CA3AF')
           .text(check.description, 80, doc.y + 2, { width: doc.page.width - 160 });

        // Recommendation
        if (check.recommendation && check.status !== 'healthy') {
          doc.fontSize(8)
             .fillColor(statusColor)
             .text(`→ ${check.recommendation}`, 80, doc.y + 2, { width: doc.page.width - 160 });
        }

        doc.moveDown(0.8);
      }

      doc.moveDown(0.5);
    }

    // Scope Information
    if (doc.y > doc.page.height - 150) {
      doc.addPage();
      doc.y = 50;
    }

    doc.fontSize(16)
       .fillColor(darkColor)
       .text('Token Permissions', 50);

    doc.moveDown(0.5);

    doc.fontSize(9)
       .fillColor(textColor);

    if (results.scopes?.missingRequired?.length > 0) {
      doc.fillColor(dangerColor)
         .text('Missing Required Scopes:', 50);
      results.scopes.missingRequired.forEach(scope => {
        doc.text(`  • ${scope}`, 60);
      });
      doc.moveDown(0.5);
    }

    doc.fillColor(successColor)
       .text('Available Scopes:', 50);

    const availableScopes = results.scopes?.available || [];
    availableScopes.slice(0, 10).forEach(scope => {
      doc.fillColor(textColor).text(`  • ${scope}`, 60);
    });

    if (availableScopes.length > 10) {
      doc.text(`  ... and ${availableScopes.length - 10} more`, 60);
    }

    // Footer
    doc.fontSize(8)
       .fillColor('#9CA3AF')
       .text(
         'Generated by HubCheck - HubSpot CRM Health Auditor',
         50,
         doc.page.height - 30,
         { align: 'center', width: doc.page.width - 100 }
       );

    // Finalize PDF
    doc.end();
  } catch (error) {
    logger.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF report' });
  }
});

/**
 * POST /api/export/markdown
 * Generate Markdown report from audit results
 */
router.post('/markdown', async (req, res) => {
  try {
    const { results } = req.body;

    if (!results) {
      return res.status(400).json({ error: 'Audit results are required' });
    }

    let markdown = '';

    // Header
    markdown += `# HubCheck CRM Health Report\n\n`;
    markdown += `**Hub ID:** ${results.hubId}  \n`;
    markdown += `**Generated:** ${new Date(results.lastRun).toLocaleString()}  \n`;
    markdown += `**Health Score:** ${results.healthScore}/100\n\n`;

    // Stats
    markdown += `## Quick Stats\n\n`;
    markdown += `| Metric | Value |\n`;
    markdown += `|--------|-------|\n`;
    markdown += `| Total Contacts | ${results.stats.totalContacts.toLocaleString()} |\n`;
    markdown += `| Total Companies | ${results.stats.totalCompanies.toLocaleString()} |\n`;
    markdown += `| Total Deals | ${results.stats.totalDeals.toLocaleString()} |\n`;
    markdown += `| Total Owners | ${results.stats.totalOwners.toLocaleString()} |\n`;
    markdown += `| Audit Duration | ${results.stats.auditDuration} |\n\n`;

    // Categories
    markdown += `## Audit Results\n\n`;

    for (const category of results.categories) {
      const scoreEmoji = category.score >= 85 ? '🟢' : category.score >= 70 ? '🟡' : '🔴';
      markdown += `### ${scoreEmoji} ${category.name} (${category.score}%)\n\n`;

      markdown += `| Check | Value | Status | Recommendation |\n`;
      markdown += `|-------|-------|--------|----------------|\n`;

      for (const check of category.checks) {
        const statusEmoji = check.status === 'healthy' ? '✅' : check.status === 'warning' ? '⚠️' : check.status === 'danger' ? '❌' : 'ℹ️';
        const recommendation = check.recommendation || '-';
        markdown += `| ${check.label} | ${check.value} | ${statusEmoji} ${check.status} | ${recommendation} |\n`;
      }

      markdown += `\n`;

      // Include affected records for high-priority issues
      for (const check of category.checks) {
        if (check.affectedRecords?.length > 0 && check.status !== 'healthy') {
          markdown += `<details>\n<summary>Affected records for "${check.label}"</summary>\n\n`;
          markdown += `| ID | Name |\n|-----|------|\n`;
          check.affectedRecords.forEach(record => {
            markdown += `| ${record.id} | ${record.name || record.email || '-'} |\n`;
          });
          markdown += `\n</details>\n\n`;
        }
      }
    }

    // Scope Information
    markdown += `## Token Permissions\n\n`;

    if (results.scopes?.missingRequired?.length > 0) {
      markdown += `### ⚠️ Missing Required Scopes\n\n`;
      results.scopes.missingRequired.forEach(scope => {
        markdown += `- \`${scope}\`\n`;
      });
      markdown += `\n`;
    }

    markdown += `### Available Scopes\n\n`;
    (results.scopes?.available || []).forEach(scope => {
      markdown += `- \`${scope}\`\n`;
    });

    markdown += `\n---\n\n`;
    markdown += `*Generated by [HubCheck](https://github.com/your-repo/hubcheck) - HubSpot CRM Health Auditor*\n`;

    // Send response
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="hubcheck-report-${results.hubId}-${Date.now()}.md"`);
    res.send(markdown);
  } catch (error) {
    logger.error('Markdown generation error:', error);
    res.status(500).json({ error: 'Failed to generate Markdown report' });
  }
});

export default router;
