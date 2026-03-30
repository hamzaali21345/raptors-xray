/**
 * Smart Split Engine — suggests how to break a Monster PR into smaller, logical PRs.
 * Uses domain clustering, dependency analysis, and coupling detection.
 */

const DOMAIN_PRIORITY = {
  database: 1,   // DB changes first — foundation
  auth: 2,       // Auth/security next
  config: 3,     // Config changes
  infrastructure: 4,
  api: 5,        // API layer
  utils: 6,      // Shared utilities
  ui: 7,         // UI last — depends on API
  tests: 8,      // Tests can go with their domain or separate
};

/**
 * Generate smart split suggestions based on complexity analysis.
 */
export function suggestSplits(complexityReport) {
  const { files, summary, domains, scores } = complexityReport;

  // If PR is clean, no split needed
  if (summary.overallScore <= 50) {
    return {
      shouldSplit: false,
      reason: 'PR complexity is within acceptable range. No split needed.',
      suggestedPRs: [],
      beforeAfter: null,
    };
  }

  // If only 1-2 files, splitting doesn't make sense even if complex
  if (summary.totalFiles <= 2) {
    return {
      shouldSplit: false,
      reason: 'Only 1-2 files changed. Consider simplifying the code within these files instead of splitting.',
      suggestedPRs: [],
      beforeAfter: null,
    };
  }

  // Build the split plan
  const suggestedPRs = buildSplitPlan(files, domains, scores);

  // Calculate before/after metrics
  const beforeAfter = computeBeforeAfter(summary, suggestedPRs);

  return {
    shouldSplit: suggestedPRs.length > 1,
    reason: generateSplitReason(summary, suggestedPRs),
    suggestedPRs,
    beforeAfter,
  };
}

function buildSplitPlan(files, domains, scores) {
  const clusters = [];

  // Step 1: Group files by domain
  const domainGroups = {};
  for (const file of files) {
    if (!domainGroups[file.domain]) {
      domainGroups[file.domain] = [];
    }
    domainGroups[file.domain].push(file);
  }

  // Step 2: Check for coupled files that MUST stay together
  const coupledSets = findCoupledFiles(files);

  // Step 3: Create PR suggestions by domain, respecting coupling
  const assigned = new Set();

  // Sort domains by priority (DB first, UI last)
  const sortedDomains = Object.entries(domainGroups)
    .sort(([a], [b]) => (DOMAIN_PRIORITY[a] || 99) - (DOMAIN_PRIORITY[b] || 99));

  let prNumber = 1;

  for (const [domain, domainFiles] of sortedDomains) {
    const prFiles = [];

    for (const file of domainFiles) {
      if (assigned.has(file.path)) continue;

      prFiles.push(file);
      assigned.add(file.path);

      // Add coupled files ONLY if they share the same domain
      // Cross-domain coupling informs merge order, not grouping
      for (const coupledSet of coupledSets) {
        if (coupledSet.has(file.path)) {
          for (const coupledPath of coupledSet) {
            if (!assigned.has(coupledPath)) {
              const coupledFile = files.find(f => f.path === coupledPath);
              if (coupledFile && coupledFile.domain === domain) {
                prFiles.push(coupledFile);
                assigned.add(coupledPath);
              }
            }
          }
        }
      }
    }

    if (prFiles.length === 0) continue;

    // Check if test files should be grouped with this PR
    const testFiles = files.filter(f =>
      f.domain === 'tests' &&
      !assigned.has(f.path) &&
      prFiles.some(pf => isRelatedTest(f.path, pf.path))
    );

    for (const tf of testFiles) {
      prFiles.push(tf);
      assigned.add(tf.path);
    }

    const totalChanges = prFiles.reduce((sum, f) => sum + f.changes, 0);
    const maxCognitive = Math.max(...prFiles.map(f => f.cognitive.score), 0);
    const prComplexity = Math.round(totalChanges * 0.3 + maxCognitive * 2 + prFiles.length * 2);

    clusters.push({
      prNumber,
      title: generatePRTitle(domain, prFiles),
      domain,
      files: prFiles.map(f => ({
        path: f.path,
        changes: f.changes,
        domain: f.domain,
        riskLevel: f.riskLevel,
      })),
      fileCount: prFiles.length,
      totalChanges,
      estimatedComplexity: prComplexity,
      estimatedReviewMinutes: Math.round((totalChanges / 100) * 4 * (1 + prComplexity / 200)),
      mergeOrder: prNumber,
      description: generatePRDescription(domain, prFiles),
    });

    prNumber++;
  }

  // Pick up any remaining unassigned files
  const remaining = files.filter(f => !assigned.has(f.path));
  if (remaining.length > 0) {
    const totalChanges = remaining.reduce((sum, f) => sum + f.changes, 0);
    clusters.push({
      prNumber,
      title: 'Miscellaneous Changes',
      domain: 'misc',
      files: remaining.map(f => ({
        path: f.path,
        changes: f.changes,
        domain: f.domain,
        riskLevel: f.riskLevel,
      })),
      fileCount: remaining.length,
      totalChanges,
      estimatedComplexity: Math.round(totalChanges * 0.3),
      estimatedReviewMinutes: Math.round((totalChanges / 100) * 4),
      mergeOrder: prNumber,
      description: 'Remaining changes that don\'t fit neatly into other PRs.',
    });
  }

  // If we only generated 1 cluster, try to split further by subdirectory
  if (clusters.length === 1 && clusters[0].fileCount > 5) {
    return splitBySubdirectory(files);
  }

  return clusters;
}

function findCoupledFiles(files) {
  const coupledSets = [];

  for (const file of files) {
    for (const imp of file.imports) {
      // Find if any other changed file matches this import
      const match = files.find(f =>
        f.path !== file.path &&
        (f.path.includes(imp.replace(/^\.\//, '').replace(/^\.\.\//, '')) ||
         imp.includes(f.filename.replace(/\.\w+$/, '')))
      );

      if (match) {
        // Check if either file is already in a coupled set
        let foundSet = coupledSets.find(s => s.has(file.path) || s.has(match.path));
        if (foundSet) {
          foundSet.add(file.path);
          foundSet.add(match.path);
        } else {
          coupledSets.push(new Set([file.path, match.path]));
        }
      }
    }
  }

  return coupledSets;
}

function splitBySubdirectory(files) {
  const dirGroups = {};
  for (const file of files) {
    const topDir = file.directory.split('/')[0] || file.directory.split('\\')[0] || 'root';
    if (!dirGroups[topDir]) dirGroups[topDir] = [];
    dirGroups[topDir].push(file);
  }

  let prNumber = 1;
  return Object.entries(dirGroups).map(([dir, dirFiles]) => {
    const totalChanges = dirFiles.reduce((sum, f) => sum + f.changes, 0);
    return {
      prNumber: prNumber++,
      title: `Changes in ${dir}/`,
      domain: dirFiles[0]?.domain || 'misc',
      files: dirFiles.map(f => ({
        path: f.path,
        changes: f.changes,
        domain: f.domain,
        riskLevel: f.riskLevel,
      })),
      fileCount: dirFiles.length,
      totalChanges,
      estimatedComplexity: Math.round(totalChanges * 0.3 + dirFiles.length * 2),
      estimatedReviewMinutes: Math.round((totalChanges / 100) * 4),
      mergeOrder: prNumber - 1,
      description: `All changes within the ${dir}/ directory.`,
    };
  });
}

function isRelatedTest(testPath, srcPath) {
  const testName = testPath.replace(/\.test\.|\.spec\./, '.').toLowerCase();
  const srcName = srcPath.toLowerCase();
  const srcBase = srcName.replace(/\.\w+$/, '');
  return testName.includes(srcBase) || srcBase.includes(testName.replace(/\.\w+$/, ''));
}

function generatePRTitle(domain, files) {
  const titles = {
    database: 'Database & Schema Changes',
    auth: 'Authentication & Security Updates',
    api: 'API & Backend Logic',
    ui: 'UI Components & Frontend',
    tests: 'Test Suite Updates',
    config: 'Configuration Changes',
    infrastructure: 'Infrastructure & CI/CD',
    utils: 'Shared Utilities & Helpers',
  };

  return titles[domain] || `${domain.charAt(0).toUpperCase() + domain.slice(1)} Changes`;
}

function generatePRDescription(domain, files) {
  const fileList = files.map(f => `- \`${f.path}\` (+${f.insertions || 0}/-${f.deletions || 0})`).join('\n');
  const descriptions = {
    database: 'Database schema changes, migrations, and model updates. Should be merged first as other PRs may depend on these changes.',
    auth: 'Authentication and security-related changes. Review carefully for security implications.',
    api: 'API routes, controllers, and backend business logic. Depends on database changes if any.',
    ui: 'Frontend components, pages, and UI logic. Should be merged after API changes are in place.',
    tests: 'Test updates and new test coverage. Can be reviewed independently.',
    config: 'Configuration file updates. Review for environment-specific concerns.',
    infrastructure: 'CI/CD pipeline, deployment, and infrastructure changes.',
    utils: 'Shared utility functions and helper modules.',
  };

  return descriptions[domain] || 'Grouped changes for focused review.';
}

function generateSplitReason(summary, suggestedPRs) {
  const parts = [];

  if (summary.totalChanges > 500) {
    parts.push(`${summary.totalChanges} lines changed — that's a lot for one review session`);
  }

  if (summary.totalFiles > 10) {
    parts.push(`${summary.totalFiles} files touched across multiple concerns`);
  }

  const domains = new Set(suggestedPRs.map(pr => pr.domain));
  if (domains.size > 2) {
    parts.push(`Changes span ${domains.size} different domains (${[...domains].join(', ')})`);
  }

  if (summary.estimatedReviewMinutes > 30) {
    parts.push(`Estimated ${summary.estimatedReviewMinutes} min review time — reviewers lose focus after 30 min`);
  }

  return parts.length > 0
    ? `Split recommended: ${parts.join('. ')}.`
    : 'Split recommended for cleaner, faster reviews.';
}

function computeBeforeAfter(summary, suggestedPRs) {
  if (suggestedPRs.length <= 1) return null;

  const avgReviewTime = Math.round(
    suggestedPRs.reduce((sum, pr) => sum + pr.estimatedReviewMinutes, 0) / suggestedPRs.length
  );

  const avgComplexity = Math.round(
    suggestedPRs.reduce((sum, pr) => sum + pr.estimatedComplexity, 0) / suggestedPRs.length
  );

  const maxChanges = Math.max(...suggestedPRs.map(pr => pr.totalChanges));

  return {
    before: {
      prCount: 1,
      totalChanges: summary.totalChanges,
      complexity: summary.overallScore,
      reviewTime: summary.estimatedReviewMinutes,
      riskLevel: summary.severity,
    },
    after: {
      prCount: suggestedPRs.length,
      avgChangesPerPR: Math.round(summary.totalChanges / suggestedPRs.length),
      maxChangesInSinglePR: maxChanges,
      avgComplexity,
      avgReviewTime,
      riskLevel: avgComplexity <= 50 ? 'CLEAN' : avgComplexity <= 100 ? 'MODERATE' : 'COMPLEX',
    },
    improvement: {
      complexityReduction: `${Math.round((1 - avgComplexity / Math.max(summary.overallScore, 1)) * 100)}%`,
      reviewTimeReduction: `${Math.round((1 - avgReviewTime / Math.max(summary.estimatedReviewMinutes, 1)) * 100)}%`,
      reviewerHappiness: summary.overallScore > 150 ? '📈 Significantly improved' : '📈 Improved',
    },
  };
}
