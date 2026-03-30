import simpleGit from 'simple-git';
import chalk from 'chalk';
import Table from 'cli-table3';
import boxen from 'boxen';

const git = simpleGit();

/**
 * Analyze git history to find Monster PR patterns and team insights
 */
export async function analyzeHistory(commitCount = 50, branch = 'main') {
  // Get recent commits
  let log;
  try {
    log = await git.log({ n: commitCount, from: branch });
  } catch (e) {
    try {
      log = await git.log({ n: commitCount });
    } catch (e2) {
      console.log(chalk.yellow('  Could not read git history. Make sure you are in a git repository.'));
      return;
    }
  }

  if (!log || !log.all || log.all.length === 0) {
    console.log(chalk.yellow('  No commits found in history.'));
    return;
  }

  const commits = log.all;
  const commitAnalysis = [];

  for (const commit of commits) {
    try {
      const diff = await git.diffSummary([`${commit.hash}^`, commit.hash]);
      commitAnalysis.push({
        hash: commit.hash.slice(0, 7),
        message: commit.message.slice(0, 60),
        author: commit.author_name,
        date: commit.date,
        filesChanged: diff.files.length,
        insertions: diff.insertions,
        deletions: diff.deletions,
        totalChanges: diff.insertions + diff.deletions,
      });
    } catch (e) {
      // Skip commits that can't be diffed (e.g., initial commit)
    }
  }

  if (commitAnalysis.length === 0) {
    console.log(chalk.yellow('  Could not analyze any commits.'));
    return;
  }

  // Find patterns
  const totalCommits = commitAnalysis.length;
  const avgChanges = Math.round(commitAnalysis.reduce((s, c) => s + c.totalChanges, 0) / totalCommits);
  const avgFiles = Math.round(commitAnalysis.reduce((s, c) => s + c.filesChanged, 0) / totalCommits * 10) / 10;
  const monsterCommits = commitAnalysis.filter(c => c.totalChanges > 500 || c.filesChanged > 10);
  const cleanCommits = commitAnalysis.filter(c => c.totalChanges <= 200 && c.filesChanged <= 5);

  // Print summary
  const summaryBox = boxen(
    chalk.cyan.bold('📜 GIT HISTORY ANALYSIS\n\n') +
    chalk.white(`Analyzed: ${totalCommits} commits\n`) +
    chalk.white(`Average changes per commit: ${avgChanges} LOC\n`) +
    chalk.white(`Average files per commit: ${avgFiles}\n\n`) +
    chalk.green(`Clean commits (≤200 LOC, ≤5 files): ${cleanCommits.length} (${Math.round(cleanCommits.length/totalCommits*100)}%)\n`) +
    chalk.red(`Monster commits (>500 LOC or >10 files): ${monsterCommits.length} (${Math.round(monsterCommits.length/totalCommits*100)}%)\n\n`) +
    chalk.gray(monsterCommits.length > 0
      ? `⚠️  Your team has a Monster PR habit. ${monsterCommits.length} out of ${totalCommits} commits are oversized.`
      : `✅ Your team keeps PRs clean! Only small, focused commits detected.`)
    , {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: monsterCommits.length > totalCommits * 0.2 ? 'red' : 'green',
    }
  );
  console.log(summaryBox);

  // Show monster commits
  if (monsterCommits.length > 0) {
    console.log(chalk.red.bold('\n🚨 MONSTER COMMITS DETECTED\n'));

    const table = new Table({
      head: [
        chalk.white.bold('Hash'),
        chalk.white.bold('Author'),
        chalk.white.bold('Message'),
        chalk.white.bold('Files'),
        chalk.white.bold('Changes'),
      ],
      colWidths: [10, 18, 42, 10, 12],
      style: { head: [], border: ['gray'] },
    });

    for (const c of monsterCommits.slice(0, 15)) {
      table.push([
        chalk.yellow(c.hash),
        chalk.gray(c.author.slice(0, 15)),
        chalk.white(c.message.slice(0, 39)),
        chalk.red.bold(`${c.filesChanged}`),
        chalk.red(`+${c.insertions}/-${c.deletions}`),
      ]);
    }

    console.log(table.toString());
  }

  // Team insights
  const authorStats = {};
  for (const c of commitAnalysis) {
    if (!authorStats[c.author]) {
      authorStats[c.author] = { commits: 0, totalChanges: 0, monsters: 0 };
    }
    authorStats[c.author].commits++;
    authorStats[c.author].totalChanges += c.totalChanges;
    if (c.totalChanges > 500 || c.filesChanged > 10) authorStats[c.author].monsters++;
  }

  console.log(chalk.cyan.bold('\n👥 AUTHOR PATTERNS\n'));

  const authorTable = new Table({
    head: [
      chalk.white.bold('Author'),
      chalk.white.bold('Commits'),
      chalk.white.bold('Avg LOC'),
      chalk.white.bold('Monsters'),
      chalk.white.bold('Health'),
    ],
    colWidths: [22, 12, 12, 12, 15],
    style: { head: [], border: ['gray'] },
  });

  for (const [author, stats] of Object.entries(authorStats)) {
    const avgLoc = Math.round(stats.totalChanges / stats.commits);
    const monsterRate = stats.monsters / stats.commits;
    const health = monsterRate <= 0.1 ? chalk.green('🟢 Healthy') :
                   monsterRate <= 0.3 ? chalk.yellow('🟡 Watch') :
                   chalk.red('🔴 Needs Help');

    authorTable.push([
      chalk.white(author.slice(0, 19)),
      chalk.cyan(`${stats.commits}`),
      avgLoc > 300 ? chalk.red(`${avgLoc}`) : chalk.green(`${avgLoc}`),
      stats.monsters > 0 ? chalk.red(`${stats.monsters}`) : chalk.green('0'),
      health,
    ]);
  }

  console.log(authorTable.toString());

  // Recommendation
  console.log(chalk.gray('\n  💡 Tip: Teams that keep PRs under 200 LOC see 40% faster review times.\n'));

  return { commitAnalysis, monsterCommits, authorStats };
}
