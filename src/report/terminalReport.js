import chalk from 'chalk';
import boxen from 'boxen';
import Table from 'cli-table3';

/**
 * Print a beautiful terminal report with X-Ray theme
 */
export function printTerminalReport(complexityReport, splits, threshold = 150) {
  const { summary, scores, files, domains, riskZones } = complexityReport;

  // Monster PR Alert
  if (summary.overallScore > threshold) {
    printMonsterAlert(summary);
  } else {
    printCleanAlert(summary);
  }

  // Score Dashboard
  printScoreDashboard(summary, scores);

  // Domain Map
  printDomainMap(domains);

  // Risk Zones
  if (riskZones.length > 0) {
    printRiskZones(riskZones);
  }

  // Top Complex Files
  printTopFiles(files);

  // Split Suggestions
  if (splits.shouldSplit) {
    printSplitSuggestions(splits);
  }

  // Before/After
  if (splits.beforeAfter) {
    printBeforeAfter(splits.beforeAfter);
  }

  // Footer
  printFooter(summary);
}

function printMonsterAlert(summary) {
  const alertBox = boxen(
    chalk.red.bold(`${summary.emoji}  MONSTER PR DETECTED!  ${summary.emoji}\n\n`) +
    chalk.white(`Complexity Score: `) + chalk.red.bold(`${summary.overallScore}/300\n`) +
    chalk.white(`Severity: `) + chalk.red.bold(`${summary.severity}\n`) +
    chalk.white(`Est. Review Time: `) + chalk.yellow.bold(`${summary.estimatedReviewMinutes} minutes\n\n`) +
    chalk.gray(`"Reviewers will hate this. Let's fix it."`)
    , {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'red',
      title: '🔬 PR X-RAY SCAN RESULT',
      titleAlignment: 'center',
    }
  );
  console.log(alertBox);
}

function printCleanAlert(summary) {
  const color = summary.overallScore <= 50 ? 'green' : 'yellow';
  const alertBox = boxen(
    chalk[color].bold(`${summary.emoji}  ${summary.severity}  ${summary.emoji}\n\n`) +
    chalk.white(`Complexity Score: `) + chalk[color].bold(`${summary.overallScore}/300\n`) +
    chalk.white(`Est. Review Time: `) + chalk.cyan.bold(`${summary.estimatedReviewMinutes} minutes\n\n`) +
    chalk.gray(summary.overallScore <= 50
      ? '"Clean PR. Reviewers will love you."'
      : '"Manageable, but keep an eye on complexity."')
    , {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: color,
      title: '🔬 PR X-RAY SCAN RESULT',
      titleAlignment: 'center',
    }
  );
  console.log(alertBox);
}

function printScoreDashboard(summary, scores) {
  console.log(chalk.cyan.bold('\n📊 COMPLEXITY BREAKDOWN\n'));

  const table = new Table({
    head: [
      chalk.white.bold('Metric'),
      chalk.white.bold('Score'),
      chalk.white.bold('Bar'),
      chalk.white.bold('Details'),
    ],
    colWidths: [22, 10, 25, 40],
    style: { head: [], border: ['gray'] },
  });

  const metrics = [
    {
      name: '📏 Size',
      score: scores.size.score,
      detail: `${scores.size.linesChanged} LOC · ${scores.size.filesChanged} files · avg ${scores.size.avgChangesPerFile}/file`,
    },
    {
      name: '🧠 Cognitive',
      score: scores.cognitive.score,
      detail: `Complexity: ${scores.cognitive.totalCognitive} · Max nesting: ${scores.cognitive.maxNesting} · Avg: ${scores.cognitive.avgNesting}`,
    },
    {
      name: '🌐 Domain Spread',
      score: scores.domainSpread.score,
      detail: `${scores.domainSpread.domainCount} domains: ${scores.domainSpread.domains.join(', ')}`,
    },
    {
      name: '🔗 Coupling',
      score: scores.coupling.score,
      detail: `${scores.coupling.crossImports} cross-imports · ${scores.coupling.externalImports} external`,
    },
    {
      name: '⚠️ Risk',
      score: scores.risk.score,
      detail: `${scores.risk.criticalCount} critical · ${scores.risk.highCount} high-risk files`,
    },
  ];

  for (const m of metrics) {
    const bar = generateBar(m.score, 300);
    const scoreColor = m.score <= 50 ? 'green' : m.score <= 100 ? 'yellow' : m.score <= 200 ? 'red' : 'redBright';
    table.push([
      m.name,
      chalk[scoreColor].bold(`${m.score}`),
      bar,
      chalk.gray(m.detail),
    ]);
  }

  console.log(table.toString());

  // Overall score bar
  const overallBar = generateBar(summary.overallScore, 300, 40);
  console.log(`\n  ${chalk.bold('Overall:')} ${overallBar} ${chalk.bold(summary.overallScore + '/300')} ${summary.emoji}\n`);
}

function generateBar(value, max, width = 20) {
  const filled = Math.round((value / max) * width);
  const empty = width - filled;

  let color;
  const ratio = value / max;
  if (ratio <= 0.17) color = chalk.green;
  else if (ratio <= 0.33) color = chalk.yellow;
  else if (ratio <= 0.5) color = chalk.hex('#FF8C00');
  else if (ratio <= 0.83) color = chalk.red;
  else color = chalk.redBright;

  return color('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
}

function printDomainMap(domains) {
  console.log(chalk.cyan.bold('🗺️  DOMAIN MAP\n'));

  const table = new Table({
    head: [
      chalk.white.bold(''),
      chalk.white.bold('Domain'),
      chalk.white.bold('Files'),
      chalk.white.bold('Changes'),
      chalk.white.bold('Risk'),
    ],
    colWidths: [5, 20, 10, 12, 12],
    style: { head: [], border: ['gray'] },
  });

  for (const d of domains) {
    const riskColor = d.risk === 'critical' ? 'redBright' : d.risk === 'high' ? 'red' : d.risk === 'medium' ? 'yellow' : 'green';
    table.push([
      d.icon,
      chalk.white(d.domain),
      chalk.cyan(d.fileCount.toString()),
      chalk.white(`+${d.totalChanges}`),
      chalk[riskColor](d.risk.toUpperCase()),
    ]);
  }

  console.log(table.toString());
  console.log();
}

function printRiskZones(riskZones) {
  console.log(chalk.red.bold('🚨 RISK ZONES\n'));

  for (const zone of riskZones) {
    const riskColor = zone.risk === 'critical' ? 'redBright' : 'red';
    console.log(
      `  ${zone.icon} ${chalk[riskColor].bold(zone.risk.toUpperCase())} ` +
      chalk.white(zone.path) +
      chalk.gray(` (${zone.changes} changes, cognitive: ${zone.cognitive})`)
    );
  }
  console.log();
}

function printTopFiles(files) {
  const sorted = [...files].sort((a, b) => b.fileScore - a.fileScore).slice(0, 8);

  console.log(chalk.cyan.bold('📈 TOP COMPLEX FILES\n'));

  const table = new Table({
    head: [
      chalk.white.bold('#'),
      chalk.white.bold('File'),
      chalk.white.bold('Score'),
      chalk.white.bold('Changes'),
      chalk.white.bold('Cognitive'),
      chalk.white.bold('Nesting'),
      chalk.white.bold('Domain'),
    ],
    colWidths: [5, 40, 10, 12, 12, 10, 14],
    style: { head: [], border: ['gray'] },
  });

  sorted.forEach((f, i) => {
    const scoreColor = f.fileScore <= 30 ? 'green' : f.fileScore <= 80 ? 'yellow' : 'red';
    table.push([
      chalk.gray(`${i + 1}`),
      chalk.white(truncatePath(f.path, 37)),
      chalk[scoreColor].bold(`${f.fileScore}`),
      chalk.white(`+${f.insertions || 0}/-${f.deletions || 0}`),
      chalk.cyan(`${f.cognitive.score}`),
      chalk.magenta(`${f.nestingDepth}`),
      chalk.gray(f.domain),
    ]);
  });

  console.log(table.toString());
  console.log();
}

function printSplitSuggestions(splits) {
  const splitBox = boxen(
    chalk.yellow.bold('✂️  SMART SPLIT SUGGESTIONS\n\n') +
    chalk.gray(splits.reason) + '\n\n' +
    chalk.white.bold(`Suggested: Split into ${splits.suggestedPRs.length} PRs\n`) +
    chalk.gray('Merge in the order shown below for cleanest integration.')
    , {
      padding: 1,
      margin: { top: 1, bottom: 0, left: 1, right: 1 },
      borderStyle: 'round',
      borderColor: 'yellow',
    }
  );
  console.log(splitBox);

  for (const pr of splits.suggestedPRs) {
    console.log();
    console.log(
      chalk.yellow.bold(`  PR #${pr.mergeOrder}: `) +
      chalk.white.bold(pr.title) +
      chalk.gray(` (${pr.fileCount} files, ${pr.totalChanges} changes, ~${pr.estimatedReviewMinutes} min review)`)
    );
    console.log(chalk.gray(`  ${pr.description}`));

    for (const f of pr.files) {
      const riskBadge = f.riskLevel === 'critical' ? chalk.redBright(' [CRITICAL]') :
                        f.riskLevel === 'high' ? chalk.red(' [HIGH]') : '';
      console.log(chalk.gray(`    ├── ${f.path} (+${f.changes})${riskBadge}`));
    }
  }
  console.log();
}

function printBeforeAfter(ba) {
  console.log(chalk.cyan.bold('📊 BEFORE vs AFTER SPLIT\n'));

  const table = new Table({
    head: [
      chalk.white.bold('Metric'),
      chalk.red.bold('Before (1 PR)'),
      chalk.green.bold(`After (${ba.after.prCount} PRs)`),
      chalk.cyan.bold('Improvement'),
    ],
    colWidths: [22, 20, 20, 22],
    style: { head: [], border: ['gray'] },
  });

  table.push(
    [
      'Complexity',
      chalk.red(`${ba.before.complexity}/300`),
      chalk.green(`~${ba.after.avgComplexity}/300 avg`),
      chalk.cyan(ba.improvement.complexityReduction),
    ],
    [
      'Review Time',
      chalk.red(`${ba.before.reviewTime} min`),
      chalk.green(`~${ba.after.avgReviewTime} min avg`),
      chalk.cyan(ba.improvement.reviewTimeReduction),
    ],
    [
      'Max Changes/PR',
      chalk.red(`${ba.before.totalChanges} LOC`),
      chalk.green(`${ba.after.maxChangesInSinglePR} LOC`),
      chalk.cyan(ba.improvement.reviewerHappiness),
    ],
    [
      'Risk Level',
      chalk.red(ba.before.riskLevel),
      chalk.green(ba.after.riskLevel),
      chalk.cyan('⬇️ Reduced'),
    ]
  );

  console.log(table.toString());
  console.log();
}

function printFooter(summary) {
  const tip = summary.overallScore > 150
    ? 'Run `pr-surgeon scan --report` to generate a full HTML X-Ray report to share with your team.'
    : 'Your PR looks manageable. Run `pr-surgeon scan --report` for a detailed HTML report.';

  console.log(chalk.gray(`  💡 ${tip}`));
  console.log(chalk.gray(`  📖 Learn more: https://github.com/pr-surgeon\n`));
}

function truncatePath(p, maxLen) {
  if (p.length <= maxLen) return p;
  return '...' + p.slice(-(maxLen - 3));
}
