/**
 * Multi-dimensional complexity analyzer for PR diffs.
 * Computes:
 *   - Size Score (lines changed, files touched)
 *   - Cognitive Complexity (nesting depth, control flow, callbacks)
 *   - Domain Spread (how many different domains/layers touched)
 *   - Coupling Score (how interconnected the changes are)
 *   - Risk Score (critical paths: auth, security, DB migrations, config)
 *   - Review Time Estimate (minutes)
 *   - Overall Complexity Score
 */

// Domain classification patterns
const DOMAIN_PATTERNS = {
  database: {
    paths: [/migrat/i, /models?\//i, /schema/i, /seeds?\//i, /db\//i, /prisma/i, /sequelize/i, /typeorm/i, /knex/i, /sql/i],
    extensions: ['sql', 'prisma'],
    keywords: ['CREATE TABLE', 'ALTER TABLE', 'INSERT INTO', 'mongoose', 'Schema', 'migration', 'sequelize'],
    risk: 'high',
    icon: '🗄️',
  },
  api: {
    paths: [/routes?\//i, /controllers?\//i, /api\//i, /endpoints?\//i, /handlers?\//i, /middleware/i, /graphql/i],
    extensions: [],
    keywords: ['app.get', 'app.post', 'router.', 'express', 'fastify', 'REST', 'GraphQL', 'resolver'],
    risk: 'medium',
    icon: '🔌',
  },
  ui: {
    paths: [/components?\//i, /views?\//i, /pages?\//i, /screens?\//i, /layouts?\//i, /templates?\//i, /widgets?\//i],
    extensions: ['jsx', 'tsx', 'vue', 'svelte', 'html', 'css', 'scss', 'less', 'styled'],
    keywords: ['render', 'useState', 'className', 'onClick', 'template', 'component', '<div', '<template'],
    risk: 'low',
    icon: '🎨',
  },
  tests: {
    paths: [/tests?\//i, /__tests__/i, /spec\//i, /\.test\./i, /\.spec\./i, /cypress/i, /e2e/i, /playwright/i],
    extensions: ['test.js', 'test.ts', 'spec.js', 'spec.ts'],
    keywords: ['describe(', 'it(', 'test(', 'expect(', 'assert', 'beforeEach', 'afterEach', 'jest', 'mocha'],
    risk: 'low',
    icon: '🧪',
  },
  config: {
    paths: [/config\//i, /\.env/i, /docker/i, /\.yml$/i, /\.yaml$/i, /\.toml$/i, /nginx/i, /webpack/i, /vite/i, /babel/i],
    extensions: ['yml', 'yaml', 'toml', 'ini', 'env', 'json'],
    keywords: ['module.exports', 'export default', 'DATABASE_URL', 'API_KEY', 'SECRET'],
    risk: 'medium',
    icon: '⚙️',
  },
  auth: {
    paths: [/auth/i, /login/i, /signup/i, /password/i, /session/i, /token/i, /oauth/i, /jwt/i, /permission/i, /rbac/i],
    extensions: [],
    keywords: ['jwt', 'bcrypt', 'password', 'token', 'session', 'authenticate', 'authorize', 'OAuth', 'passport'],
    risk: 'critical',
    icon: '🔐',
  },
  infrastructure: {
    paths: [/deploy/i, /ci\//i, /\.github/i, /\.gitlab/i, /terraform/i, /k8s/i, /kubernetes/i, /helm/i, /ansible/i],
    extensions: ['tf', 'hcl'],
    keywords: ['deploy', 'pipeline', 'stage', 'job', 'container', 'service', 'Dockerfile'],
    risk: 'high',
    icon: '🏗️',
  },
  utils: {
    paths: [/utils?\//i, /helpers?\//i, /lib\//i, /shared\//i, /common\//i],
    extensions: [],
    keywords: [],
    risk: 'low',
    icon: '🔧',
  },
};

const RISK_WEIGHTS = { critical: 4, high: 3, medium: 2, low: 1 };

// Cognitive complexity patterns (language-agnostic regex)
const COGNITIVE_PATTERNS = [
  { pattern: /\bif\s*\(/g, weight: 1, name: 'if-condition' },
  { pattern: /\belse\s+if\s*\(/g, weight: 2, name: 'else-if' },
  { pattern: /\belse\s*\{/g, weight: 1, name: 'else' },
  { pattern: /\bfor\s*\(/g, weight: 2, name: 'for-loop' },
  { pattern: /\bwhile\s*\(/g, weight: 2, name: 'while-loop' },
  { pattern: /\bswitch\s*\(/g, weight: 2, name: 'switch' },
  { pattern: /\bcase\s+/g, weight: 1, name: 'case' },
  { pattern: /\bcatch\s*\(/g, weight: 1, name: 'catch' },
  { pattern: /\?\s*.*\s*:/g, weight: 1, name: 'ternary' },
  { pattern: /\.then\s*\(/g, weight: 2, name: 'promise-then' },
  { pattern: /\.catch\s*\(/g, weight: 1, name: 'promise-catch' },
  { pattern: /async\s+/g, weight: 1, name: 'async' },
  { pattern: /await\s+/g, weight: 1, name: 'await' },
  { pattern: /=>\s*\{/g, weight: 1, name: 'arrow-fn-block' },
  { pattern: /&&|\|\|/g, weight: 1, name: 'logical-op' },
  { pattern: /\bnew\s+Promise/g, weight: 2, name: 'new-promise' },
  { pattern: /callback|cb\)/g, weight: 2, name: 'callback' },
];

/**
 * Main analysis function — returns a full complexity report
 */
export function analyzeComplexity(diffData) {
  const fileAnalysis = diffData.files.map(file => analyzeFile(file));

  // Calculate aggregate scores
  const sizeScore = computeSizeScore(diffData, fileAnalysis);
  const cognitiveScore = computeCognitiveScore(fileAnalysis);
  const domainSpread = computeDomainSpread(fileAnalysis);
  const couplingScore = computeCouplingScore(fileAnalysis);
  const riskScore = computeRiskScore(fileAnalysis);

  // Overall complexity = weighted combination
  const overallScore = Math.round(
    sizeScore.score * 0.25 +
    cognitiveScore.score * 0.25 +
    domainSpread.score * 0.20 +
    couplingScore.score * 0.15 +
    riskScore.score * 0.15
  );

  // Review time estimation (research-based formula)
  // Base: ~4 min per 100 LOC + complexity modifiers
  const baseMins = (diffData.totalChanges / 100) * 4;
  const complexityMultiplier = 1 + (overallScore / 200);
  const estimatedReviewMinutes = Math.round(baseMins * complexityMultiplier);

  // Severity classification
  let severity, severityColor, emoji;
  if (overallScore <= 50) {
    severity = 'CLEAN'; severityColor = '#00FF88'; emoji = '✅';
  } else if (overallScore <= 100) {
    severity = 'MODERATE'; severityColor = '#FFD700'; emoji = '⚠️';
  } else if (overallScore <= 150) {
    severity = 'COMPLEX'; severityColor = '#FF8C00'; emoji = '🔶';
  } else if (overallScore <= 250) {
    severity = 'MONSTER PR'; severityColor = '#FF4444'; emoji = '🚨';
  } else {
    severity = 'CATASTROPHIC'; severityColor = '#FF0000'; emoji = '💀';
  }

  return {
    summary: {
      totalFiles: diffData.totalFiles,
      totalInsertions: diffData.totalInsertions,
      totalDeletions: diffData.totalDeletions,
      totalChanges: diffData.totalChanges,
      overallScore,
      severity,
      severityColor,
      emoji,
      estimatedReviewMinutes,
    },
    scores: {
      size: sizeScore,
      cognitive: cognitiveScore,
      domainSpread,
      coupling: couplingScore,
      risk: riskScore,
    },
    files: fileAnalysis,
    domains: getDomainSummary(fileAnalysis),
    riskZones: getRiskZones(fileAnalysis),
  };
}

function analyzeFile(file) {
  const domain = detectDomain(file);
  const cognitive = file.content ? computeFileCognitive(file.content) : { score: 0, details: [] };
  const imports = file.content ? extractImports(file.content) : [];
  const nestingDepth = file.content ? computeMaxNesting(file.content) : 0;

  // File-level complexity score
  const fileScore = Math.round(
    (file.changes * 0.3) +
    (cognitive.score * 2) +
    (nestingDepth * 5) +
    (imports.length * 0.5)
  );

  return {
    ...file,
    domain,
    cognitive,
    imports,
    nestingDepth,
    fileScore,
    riskLevel: DOMAIN_PATTERNS[domain]?.risk || 'low',
  };
}

function detectDomain(file) {
  let bestMatch = 'utils';
  let bestScore = 0;

  for (const [domain, patterns] of Object.entries(DOMAIN_PATTERNS)) {
    let score = 0;

    // Check path patterns
    for (const pathPattern of patterns.paths) {
      if (pathPattern.test(file.path)) score += 3;
    }

    // Check extension
    if (patterns.extensions.includes(file.extension)) score += 2;

    // Check file content for keywords
    if (file.content) {
      for (const keyword of patterns.keywords) {
        if (file.content.includes(keyword)) score += 1;
      }
    }

    // Check diff content
    if (file.diffContent) {
      for (const keyword of patterns.keywords) {
        if (file.diffContent.includes(keyword)) score += 0.5;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = domain;
    }
  }

  return bestMatch;
}

function computeFileCognitive(content) {
  const details = [];
  let totalScore = 0;

  for (const { pattern, weight, name } of COGNITIVE_PATTERNS) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      const contribution = matches.length * weight;
      totalScore += contribution;
      details.push({ pattern: name, count: matches.length, weight, contribution });
    }
  }

  return { score: totalScore, details };
}

function computeMaxNesting(content) {
  let maxDepth = 0;
  let currentDepth = 0;

  for (const char of content) {
    if (char === '{') {
      currentDepth++;
      maxDepth = Math.max(maxDepth, currentDepth);
    } else if (char === '}') {
      currentDepth = Math.max(0, currentDepth - 1);
    }
  }

  return maxDepth;
}

function extractImports(content) {
  const imports = [];
  const patterns = [
    /import\s+.*?from\s+['"](.+?)['"]/g,
    /require\s*\(\s*['"](.+?)['"]\s*\)/g,
    /import\s*\(\s*['"](.+?)['"]\s*\)/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      imports.push(match[1]);
    }
  }

  return [...new Set(imports)];
}

function computeSizeScore(diffData, fileAnalysis) {
  const loc = diffData.totalChanges;
  const fileCount = diffData.totalFiles;

  // Score calculation: exponential growth after thresholds
  let score = 0;
  if (loc <= 100) score += loc * 0.2;
  else if (loc <= 300) score += 20 + (loc - 100) * 0.4;
  else if (loc <= 500) score += 100 + (loc - 300) * 0.6;
  else score += 220 + (loc - 500) * 0.8;

  // File count bonus
  if (fileCount > 5) score += (fileCount - 5) * 3;
  if (fileCount > 10) score += (fileCount - 10) * 5;
  if (fileCount > 20) score += (fileCount - 20) * 8;

  return {
    score: Math.round(Math.min(score, 300)),
    linesChanged: loc,
    filesChanged: fileCount,
    avgChangesPerFile: Math.round(loc / Math.max(fileCount, 1)),
  };
}

function computeCognitiveScore(fileAnalysis) {
  const totalCognitive = fileAnalysis.reduce((sum, f) => sum + f.cognitive.score, 0);
  const maxNesting = Math.max(...fileAnalysis.map(f => f.nestingDepth), 0);
  const avgNesting = fileAnalysis.reduce((sum, f) => sum + f.nestingDepth, 0) / Math.max(fileAnalysis.length, 1);

  // Score: cognitive weight + nesting penalties
  let score = totalCognitive * 1.5;
  if (maxNesting > 4) score += (maxNesting - 4) * 10;
  if (avgNesting > 3) score += (avgNesting - 3) * 5;

  return {
    score: Math.round(Math.min(score, 300)),
    totalCognitive,
    maxNesting,
    avgNesting: Math.round(avgNesting * 10) / 10,
  };
}

function computeDomainSpread(fileAnalysis) {
  const domains = new Set(fileAnalysis.map(f => f.domain));
  const domainCount = domains.size;

  // Score: more domains = higher spread = riskier
  let score = 0;
  if (domainCount <= 1) score = 0;
  else if (domainCount === 2) score = 30;
  else if (domainCount === 3) score = 70;
  else if (domainCount === 4) score = 120;
  else score = 120 + (domainCount - 4) * 40;

  // Extra penalty for mixing critical domains
  const hasCritical = fileAnalysis.some(f => f.riskLevel === 'critical');
  const hasUI = fileAnalysis.some(f => f.domain === 'ui');
  const hasDB = fileAnalysis.some(f => f.domain === 'database');

  if (hasCritical && (hasUI || hasDB)) score += 30;
  if (hasUI && hasDB) score += 20;

  return {
    score: Math.round(Math.min(score, 300)),
    domainCount,
    domains: [...domains],
    domainDistribution: getDomainDistribution(fileAnalysis),
  };
}

function computeCouplingScore(fileAnalysis) {
  // Build import graph among changed files
  const changedPaths = new Set(fileAnalysis.map(f => f.path));
  let crossImports = 0;
  let externalImports = 0;

  for (const file of fileAnalysis) {
    for (const imp of file.imports) {
      // Check if import points to another changed file
      const isInternal = fileAnalysis.some(f =>
        f.path.includes(imp.replace(/^\.\//, '').replace(/^\.\.\//, ''))
      );

      if (isInternal) crossImports++;
      else externalImports++;
    }
  }

  // High cross-imports between changed files = tightly coupled = hard to split
  let score = crossImports * 15 + externalImports * 2;

  return {
    score: Math.round(Math.min(score, 300)),
    crossImports,
    externalImports,
    totalImports: crossImports + externalImports,
  };
}

function computeRiskScore(fileAnalysis) {
  let score = 0;
  const riskFiles = [];

  for (const file of fileAnalysis) {
    const riskWeight = RISK_WEIGHTS[file.riskLevel] || 1;
    const fileRisk = riskWeight * (file.changes * 0.1 + 5);

    if (file.riskLevel === 'critical' || file.riskLevel === 'high') {
      riskFiles.push({
        path: file.path,
        risk: file.riskLevel,
        domain: file.domain,
        changes: file.changes,
      });
    }

    score += fileRisk;
  }

  return {
    score: Math.round(Math.min(score, 300)),
    riskFiles,
    criticalCount: fileAnalysis.filter(f => f.riskLevel === 'critical').length,
    highCount: fileAnalysis.filter(f => f.riskLevel === 'high').length,
  };
}

function getDomainDistribution(fileAnalysis) {
  const dist = {};
  for (const file of fileAnalysis) {
    if (!dist[file.domain]) {
      dist[file.domain] = { count: 0, changes: 0, files: [] };
    }
    dist[file.domain].count++;
    dist[file.domain].changes += file.changes;
    dist[file.domain].files.push(file.path);
  }
  return dist;
}

function getDomainSummary(fileAnalysis) {
  const distribution = getDomainDistribution(fileAnalysis);
  return Object.entries(distribution).map(([domain, data]) => ({
    domain,
    icon: DOMAIN_PATTERNS[domain]?.icon || '📁',
    risk: DOMAIN_PATTERNS[domain]?.risk || 'low',
    fileCount: data.count,
    totalChanges: data.changes,
    files: data.files,
  }));
}

function getRiskZones(fileAnalysis) {
  return fileAnalysis
    .filter(f => f.riskLevel === 'critical' || f.riskLevel === 'high')
    .map(f => ({
      path: f.path,
      domain: f.domain,
      risk: f.riskLevel,
      changes: f.changes,
      cognitive: f.cognitive.score,
      icon: DOMAIN_PATTERNS[f.domain]?.icon || '📁',
    }))
    .sort((a, b) => RISK_WEIGHTS[b.risk] - RISK_WEIGHTS[a.risk]);
}
