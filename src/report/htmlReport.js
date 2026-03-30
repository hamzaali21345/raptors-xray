import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';

/**
 * Generate a beautiful X-Ray themed HTML report
 */
export async function generateReport(complexityReport, splits) {
  const { summary, scores, files, domains, riskZones } = complexityReport;

  const reportDir = path.join(process.cwd(), '.incisio');
  if (!existsSync(reportDir)) {
    mkdirSync(reportDir, { recursive: true });
  }

  const reportPath = path.join(reportDir, 'xray-report.html');
  const html = buildHTML(summary, scores, files, domains, riskZones, splits);
  writeFileSync(reportPath, html, 'utf-8');

  return reportPath;
}

function buildHTML(summary, scores, files, domains, riskZones, splits) {
  const severityGradient = getSeverityGradient(summary.overallScore);
  const sortedFiles = [...files].sort((a, b) => b.fileScore - a.fileScore);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Incisio X-Ray Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --bg-primary: #0a0e17;
      --bg-secondary: #111827;
      --bg-card: #1a2332;
      --bg-card-hover: #1f2b3d;
      --text-primary: #e2e8f0;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --accent-green: #00ff88;
      --accent-yellow: #ffd700;
      --accent-orange: #ff8c00;
      --accent-red: #ff4444;
      --accent-critical: #ff0040;
      --accent-cyan: #00d4ff;
      --accent-purple: #a855f7;
      --border: #1e293b;
      --glow-green: 0 0 20px rgba(0,255,136,0.3);
      --glow-red: 0 0 20px rgba(255,68,68,0.3);
      --glow-cyan: 0 0 20px rgba(0,212,255,0.2);
    }

    body {
      font-family: 'Inter', sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      min-height: 100vh;
      overflow-x: hidden;
    }

    .xray-bg {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background:
        radial-gradient(ellipse at 20% 50%, rgba(0,212,255,0.05) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.05) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, ${severityGradient} 0%, transparent 50%);
      pointer-events: none;
      z-index: 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      position: relative;
      z-index: 1;
    }

    /* Header */
    .header {
      text-align: center;
      margin-bottom: 3rem;
      padding: 2rem 0;
    }

    .header h1 {
      font-family: 'JetBrains Mono', monospace;
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }

    .header .tagline {
      color: var(--text-secondary);
      font-size: 1.1rem;
    }

    .header .timestamp {
      color: var(--text-muted);
      font-size: 0.85rem;
      margin-top: 0.5rem;
      font-family: 'JetBrains Mono', monospace;
    }

    /* Severity Badge */
    .severity-hero {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 2.5rem;
      text-align: center;
      margin-bottom: 2rem;
      position: relative;
      overflow: hidden;
    }

    .severity-hero::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
      background: ${getSeverityColorCSS(summary.overallScore)};
    }

    .severity-hero .score {
      font-family: 'JetBrains Mono', monospace;
      font-size: 5rem;
      font-weight: 700;
      color: ${getSeverityColorCSS(summary.overallScore)};
      text-shadow: ${summary.overallScore > 150 ? '0 0 40px rgba(255,68,68,0.5)' : '0 0 40px rgba(0,255,136,0.3)'};
      line-height: 1;
    }

    .severity-hero .score-label {
      font-size: 1.2rem;
      color: var(--text-secondary);
      margin-top: 0.5rem;
    }

    .severity-hero .severity-badge {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.5rem 2rem;
      border-radius: 999px;
      font-weight: 700;
      font-size: 1.1rem;
      letter-spacing: 2px;
      background: ${getSeverityColorCSS(summary.overallScore)}22;
      color: ${getSeverityColorCSS(summary.overallScore)};
      border: 2px solid ${getSeverityColorCSS(summary.overallScore)};
    }

    .severity-hero .review-time {
      margin-top: 1.5rem;
      font-size: 1.3rem;
      color: var(--text-secondary);
    }

    .severity-hero .review-time span {
      color: var(--accent-cyan);
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      transition: all 0.2s;
    }

    .stat-card:hover {
      background: var(--bg-card-hover);
      transform: translateY(-2px);
    }

    .stat-card .stat-value {
      font-family: 'JetBrains Mono', monospace;
      font-size: 2rem;
      font-weight: 700;
      color: var(--accent-cyan);
    }

    .stat-card .stat-label {
      color: var(--text-muted);
      font-size: 0.85rem;
      margin-top: 0.3rem;
    }

    /* Score Bars */
    .scores-section {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
    }

    .section-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 1.3rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: var(--accent-cyan);
    }

    .score-row {
      display: flex;
      align-items: center;
      margin-bottom: 1.2rem;
      gap: 1rem;
    }

    .score-row .label {
      width: 160px;
      font-weight: 500;
      color: var(--text-secondary);
      font-size: 0.95rem;
    }

    .score-row .bar-container {
      flex: 1;
      height: 24px;
      background: var(--bg-primary);
      border-radius: 12px;
      overflow: hidden;
      position: relative;
    }

    .score-row .bar-fill {
      height: 100%;
      border-radius: 12px;
      transition: width 1s ease;
      position: relative;
    }

    .score-row .bar-fill::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%);
      animation: shimmer 2s infinite;
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .score-row .score-value {
      width: 60px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      text-align: right;
    }

    /* Domain Map */
    .domain-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .domain-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.2s;
    }

    .domain-card:hover {
      background: var(--bg-card-hover);
      transform: translateY(-2px);
    }

    .domain-card .domain-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .domain-card .domain-icon {
      font-size: 1.5rem;
    }

    .domain-card .domain-name {
      font-weight: 600;
      text-transform: capitalize;
    }

    .domain-card .domain-stats {
      color: var(--text-muted);
      font-size: 0.85rem;
      font-family: 'JetBrains Mono', monospace;
    }

    .domain-card .file-list {
      margin-top: 0.75rem;
      font-size: 0.8rem;
      color: var(--text-muted);
      font-family: 'JetBrains Mono', monospace;
    }

    .domain-card .file-list div {
      padding: 0.2rem 0;
      border-bottom: 1px solid var(--border);
    }

    /* Risk Badge */
    .risk-badge {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 1px;
    }

    .risk-critical { background: rgba(255,0,64,0.2); color: var(--accent-critical); }
    .risk-high { background: rgba(255,68,68,0.2); color: var(--accent-red); }
    .risk-medium { background: rgba(255,215,0,0.2); color: var(--accent-yellow); }
    .risk-low { background: rgba(0,255,136,0.2); color: var(--accent-green); }

    /* Files Table */
    .files-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }

    .files-table th {
      text-align: left;
      padding: 0.75rem 1rem;
      color: var(--text-muted);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 2px solid var(--border);
      font-family: 'JetBrains Mono', monospace;
    }

    .files-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border);
      font-size: 0.9rem;
      font-family: 'JetBrains Mono', monospace;
    }

    .files-table tr:hover {
      background: var(--bg-card-hover);
    }

    /* Split Suggestions */
    .split-section {
      margin-top: 2rem;
    }

    .split-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      border-left: 4px solid var(--accent-yellow);
    }

    .split-card .pr-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .split-card .pr-number {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      color: var(--accent-yellow);
    }

    .split-card .pr-title {
      font-weight: 600;
      font-size: 1.1rem;
    }

    .split-card .pr-meta {
      color: var(--text-muted);
      font-size: 0.85rem;
      font-family: 'JetBrains Mono', monospace;
    }

    .split-card .pr-files {
      margin-top: 0.75rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .split-card .pr-description {
      margin-top: 0.75rem;
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    /* Before/After */
    .before-after {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 1.5rem;
      align-items: center;
      margin: 2rem 0;
    }

    .ba-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
    }

    .ba-card.before {
      border-top: 4px solid var(--accent-red);
    }

    .ba-card.after {
      border-top: 4px solid var(--accent-green);
    }

    .ba-arrow {
      font-size: 2rem;
      color: var(--accent-cyan);
    }

    .ba-card .ba-title {
      font-weight: 700;
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }

    .ba-card .ba-metric {
      margin-bottom: 0.75rem;
    }

    .ba-card .ba-metric .ba-value {
      font-family: 'JetBrains Mono', monospace;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .ba-card .ba-metric .ba-label {
      color: var(--text-muted);
      font-size: 0.8rem;
    }

    /* Footer */
    .footer {
      text-align: center;
      padding: 2rem 0;
      color: var(--text-muted);
      font-size: 0.85rem;
      border-top: 1px solid var(--border);
      margin-top: 3rem;
    }

    .footer a {
      color: var(--accent-cyan);
      text-decoration: none;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .before-after { grid-template-columns: 1fr; }
      .ba-arrow { transform: rotate(90deg); }
      .severity-hero .score { font-size: 3.5rem; }
    }

    /* Animations */
    .fade-in {
      animation: fadeIn 0.6s ease forwards;
      opacity: 0;
    }

    @keyframes fadeIn {
      to { opacity: 1; }
    }

    .fade-in:nth-child(1) { animation-delay: 0.1s; }
    .fade-in:nth-child(2) { animation-delay: 0.2s; }
    .fade-in:nth-child(3) { animation-delay: 0.3s; }
    .fade-in:nth-child(4) { animation-delay: 0.4s; }
    .fade-in:nth-child(5) { animation-delay: 0.5s; }
  </style>
</head>
<body>
  <div class="xray-bg"></div>
  <div class="container">

    <!-- Header -->
    <div class="header fade-in">
      <h1>🔬 Incisio X-Ray Report</h1>
      <div class="tagline">Diagnostic scan of your Pull Request complexity</div>
      <div class="timestamp">Generated: ${new Date().toISOString()} | Incisio v1.0.0</div>
    </div>

    <!-- Severity Hero -->
    <div class="severity-hero fade-in">
      <div class="score">${summary.overallScore}</div>
      <div class="score-label">Complexity Score (out of 300)</div>
      <div class="severity-badge">${summary.emoji} ${summary.severity}</div>
      <div class="review-time">Estimated Review Time: <span>${summary.estimatedReviewMinutes} minutes</span></div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid fade-in">
      <div class="stat-card">
        <div class="stat-value">${summary.totalFiles}</div>
        <div class="stat-label">Files Changed</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--accent-green)">+${summary.totalInsertions}</div>
        <div class="stat-label">Insertions</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--accent-red)">-${summary.totalDeletions}</div>
        <div class="stat-label">Deletions</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${summary.totalChanges}</div>
        <div class="stat-label">Total LOC Changed</div>
      </div>
    </div>

    <!-- Complexity Breakdown -->
    <div class="scores-section fade-in">
      <div class="section-title">📊 Complexity Breakdown</div>
      ${generateScoreBar('📏 Size', scores.size.score, 300)}
      ${generateScoreBar('🧠 Cognitive', scores.cognitive.score, 300)}
      ${generateScoreBar('🌐 Domain Spread', scores.domainSpread.score, 300)}
      ${generateScoreBar('🔗 Coupling', scores.coupling.score, 300)}
      ${generateScoreBar('⚠️ Risk', scores.risk.score, 300)}
    </div>

    <!-- Domain Map -->
    <div class="fade-in">
      <div class="section-title" style="margin-bottom: 1rem;">🗺️ Domain Map</div>
      <div class="domain-grid">
        ${domains.map(d => `
          <div class="domain-card">
            <div class="domain-header">
              <span class="domain-icon">${d.icon}</span>
              <span class="domain-name">${d.domain}</span>
              <span class="risk-badge risk-${d.risk}">${d.risk.toUpperCase()}</span>
            </div>
            <div class="domain-stats">${d.fileCount} files · ${d.totalChanges} changes</div>
            <div class="file-list">
              ${d.files.slice(0, 5).map(f => `<div>${truncPath(f, 35)}</div>`).join('')}
              ${d.files.length > 5 ? `<div style="color:var(--accent-cyan)">+${d.files.length - 5} more files</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    ${riskZones.length > 0 ? `
    <!-- Risk Zones -->
    <div class="scores-section fade-in" style="border-left: 4px solid var(--accent-red);">
      <div class="section-title" style="color: var(--accent-red);">🚨 Risk Zones</div>
      ${riskZones.map(z => `
        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.75rem; padding:0.5rem; border-radius:8px; background:rgba(255,68,68,0.05);">
          <span>${z.icon}</span>
          <span class="risk-badge risk-${z.risk}">${z.risk.toUpperCase()}</span>
          <span style="font-family:'JetBrains Mono',monospace; font-size:0.85rem; flex:1;">${z.path}</span>
          <span style="color:var(--text-muted); font-size:0.8rem; font-family:'JetBrains Mono',monospace;">${z.changes} changes · cognitive: ${z.cognitive}</span>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- Top Files -->
    <div class="scores-section fade-in">
      <div class="section-title">📈 File Complexity Ranking</div>
      <table class="files-table">
        <thead>
          <tr>
            <th>#</th>
            <th>File</th>
            <th>Score</th>
            <th>Changes</th>
            <th>Cognitive</th>
            <th>Nesting</th>
            <th>Domain</th>
            <th>Risk</th>
          </tr>
        </thead>
        <tbody>
          ${sortedFiles.map((f, i) => `
            <tr>
              <td style="color:var(--text-muted)">${i + 1}</td>
              <td>${truncPath(f.path, 40)}</td>
              <td style="color:${getScoreColor(f.fileScore)}; font-weight:700;">${f.fileScore}</td>
              <td>+${f.insertions || 0}/-${f.deletions || 0}</td>
              <td>${f.cognitive.score}</td>
              <td>${f.nestingDepth}</td>
              <td>${f.domain}</td>
              <td><span class="risk-badge risk-${f.riskLevel}">${f.riskLevel.toUpperCase()}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    ${splits.shouldSplit ? `
    <!-- Split Suggestions -->
    <div class="split-section fade-in">
      <div class="section-title" style="color: var(--accent-yellow);">✂️ Smart Split Suggestions</div>
      <p style="color:var(--text-muted); margin-bottom:1.5rem;">${splits.reason}</p>

      ${splits.suggestedPRs.map(pr => `
        <div class="split-card">
          <div class="pr-header">
            <div>
              <span class="pr-number">PR #${pr.mergeOrder}</span>
              <span class="pr-title"> ${pr.title}</span>
            </div>
            <div class="pr-meta">${pr.fileCount} files · ${pr.totalChanges} changes · ~${pr.estimatedReviewMinutes}min</div>
          </div>
          <div class="pr-description">${pr.description}</div>
          <div class="pr-files">
            ${pr.files.map(f => `<div>├── ${f.path} <span style="color:var(--text-muted)">(+${f.changes})</span> ${f.riskLevel === 'critical' || f.riskLevel === 'high' ? `<span class="risk-badge risk-${f.riskLevel}">${f.riskLevel.toUpperCase()}</span>` : ''}</div>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>

    ${splits.beforeAfter ? `
    <!-- Before / After -->
    <div class="fade-in">
      <div class="section-title" style="text-align:center; margin-bottom:1rem;">📊 Before vs After Split</div>
      <div class="before-after">
        <div class="ba-card before">
          <div class="ba-title" style="color:var(--accent-red)">❌ Before (1 Monster PR)</div>
          <div class="ba-metric">
            <div class="ba-value" style="color:var(--accent-red)">${splits.beforeAfter.before.complexity}/300</div>
            <div class="ba-label">Complexity Score</div>
          </div>
          <div class="ba-metric">
            <div class="ba-value" style="color:var(--accent-red)">${splits.beforeAfter.before.reviewTime} min</div>
            <div class="ba-label">Review Time</div>
          </div>
          <div class="ba-metric">
            <div class="ba-value" style="color:var(--accent-red)">${splits.beforeAfter.before.totalChanges}</div>
            <div class="ba-label">Lines Changed</div>
          </div>
        </div>
        <div class="ba-arrow">→</div>
        <div class="ba-card after">
          <div class="ba-title" style="color:var(--accent-green)">✅ After (${splits.beforeAfter.after.prCount} Clean PRs)</div>
          <div class="ba-metric">
            <div class="ba-value" style="color:var(--accent-green)">~${splits.beforeAfter.after.avgComplexity}/300</div>
            <div class="ba-label">Avg Complexity</div>
          </div>
          <div class="ba-metric">
            <div class="ba-value" style="color:var(--accent-green)">~${splits.beforeAfter.after.avgReviewTime} min</div>
            <div class="ba-label">Avg Review Time</div>
          </div>
          <div class="ba-metric">
            <div class="ba-value" style="color:var(--accent-green)">${splits.beforeAfter.after.avgChangesPerPR}</div>
            <div class="ba-label">Avg Lines per PR</div>
          </div>
        </div>
      </div>
      <div style="text-align:center; margin-top:1rem;">
        <span style="color:var(--accent-cyan); font-weight:700;">Complexity Reduction: ${splits.beforeAfter.improvement.complexityReduction}</span>
        <span style="color:var(--text-muted); margin:0 1rem;">·</span>
        <span style="color:var(--accent-cyan); font-weight:700;">Review Time Reduction: ${splits.beforeAfter.improvement.reviewTimeReduction}</span>
      </div>
    </div>
    ` : ''}
    ` : `
    <div class="scores-section fade-in" style="text-align:center; border-left:4px solid var(--accent-green);">
      <div style="font-size:2rem; margin-bottom:0.5rem;">✅</div>
      <div class="section-title" style="color:var(--accent-green);">No Split Needed</div>
      <p style="color:var(--text-muted);">${splits.reason}</p>
    </div>
    `}

    <!-- Footer -->
    <div class="footer">
      <p>Generated by <strong>Incisio</strong> v1.0.0 — X-ray your Pull Requests</p>
      <p style="margin-top:0.5rem;">Built for <a href="https://dxrayhack.com" target="_blank">DX-Ray Hackathon 2026</a> | Track G: Code Review Radar</p>
    </div>

  </div>
</body>
</html>`;
}

function generateScoreBar(label, score, max) {
  const percentage = Math.round((score / max) * 100);
  const color = getScoreColor(score);

  return `
    <div class="score-row">
      <div class="label">${label}</div>
      <div class="bar-container">
        <div class="bar-fill" style="width:${percentage}%; background: linear-gradient(90deg, ${color}, ${color}aa);"></div>
      </div>
      <div class="score-value" style="color:${color}">${score}</div>
    </div>
  `;
}

function getScoreColor(score) {
  if (score <= 50) return '#00ff88';
  if (score <= 100) return '#ffd700';
  if (score <= 200) return '#ff8c00';
  return '#ff4444';
}

function getSeverityGradient(score) {
  if (score <= 50) return 'rgba(0,255,136,0.05)';
  if (score <= 100) return 'rgba(255,215,0,0.05)';
  if (score <= 200) return 'rgba(255,140,0,0.05)';
  return 'rgba(255,68,68,0.08)';
}

function getSeverityColorCSS(score) {
  if (score <= 50) return 'var(--accent-green)';
  if (score <= 100) return 'var(--accent-yellow)';
  if (score <= 150) return 'var(--accent-orange)';
  return 'var(--accent-red)';
}

function truncPath(p, maxLen) {
  if (p.length <= maxLen) return p;
  return '...' + p.slice(-(maxLen - 3));
}
