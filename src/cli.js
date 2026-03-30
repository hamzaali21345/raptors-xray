#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';
import { scanCurrentDiff } from './core/scanner.js';
import { analyzeComplexity } from './core/complexity.js';
import { suggestSplits } from './core/splitter.js';
import { generateReport } from './report/htmlReport.js';
import { printTerminalReport } from './report/terminalReport.js';
import { installHook, removeHook } from './hooks/gitHook.js';
import { analyzeHistory } from './core/history.js';
import { runDemo } from './demo/demo.js';
import open from 'open';
import { existsSync } from 'fs';
import path from 'path';

const program = new Command();

const BANNER = chalk.hex('#00FFAA').bold(`
 ██╗███╗   ██╗ ██████╗██╗███████╗██╗ ██████╗ 
 ██║████╗  ██║██╔════╝██║██╔════╝██║██╔═══██╗
 ██║██╔██╗ ██║██║     ██║███████╗██║██║   ██║
 ██║██║╚██╗██║██║     ██║╚════██║██║██║   ██║
 ██║██║ ╚████║╚██████╗██║███████║██║╚██████╔╝
 ╚═╝╚═╝  ╚═══╝ ╚═════╝╚═╝╚══════╝╚═╝ ╚═════╝ 
`);

const TAGLINE = chalk.gray('  X-ray your Pull Requests. Expose Monster PRs. Ship Clean Code.\n');

program
  .name('incisio')
  .description('Incisio — X-ray your Pull Requests, expose Monster PRs, ship clean code')
  .version('1.0.0');

program
  .command('scan')
  .description('Scan current staged/unstaged changes for PR complexity')
  .option('-b, --branch <branch>', 'Compare against a specific branch', 'main')
  .option('-t, --threshold <number>', 'Complexity threshold for Monster PR alert', '150')
  .option('--report', 'Also generate an HTML X-Ray report')
  .option('--json', 'Output results as JSON')
  .action(async (options) => {
    console.log(BANNER);
    console.log(TAGLINE);

    const spinner = ora({
      text: chalk.cyan('Initiating PR X-Ray scan...'),
      spinner: 'dots12'
    }).start();

    try {
      // Step 1: Scan git diff
      spinner.text = chalk.cyan('Scanning git diff...');
      const diffData = await scanCurrentDiff(options.branch);

      if (!diffData || diffData.files.length === 0) {
        spinner.warn(chalk.yellow('No changes detected. Stage some changes or specify a different branch with -b'));
        process.exit(0);
      }

      spinner.text = chalk.cyan(`Found ${diffData.files.length} changed files. Analyzing complexity...`);

      // Step 2: Analyze complexity
      const complexityReport = analyzeComplexity(diffData);

      // Step 3: Generate split suggestions
      spinner.text = chalk.cyan('Computing smart split suggestions...');
      const splits = suggestSplits(complexityReport);

      spinner.succeed(chalk.green('PR X-Ray scan complete!\n'));

      // Step 4: Print terminal report
      printTerminalReport(complexityReport, splits, parseInt(options.threshold));

      // Step 5: Generate HTML report if requested
      if (options.report) {
        const reportSpinner = ora({
          text: chalk.cyan('Generating X-Ray HTML report...'),
          spinner: 'dots12'
        }).start();

        const reportPath = await generateReport(complexityReport, splits);
        reportSpinner.succeed(chalk.green(`X-Ray report saved to: ${reportPath}`));
        await open(reportPath);
      }

      // Step 6: JSON output
      if (options.json) {
        console.log(JSON.stringify({ complexity: complexityReport, splits }, null, 2));
      }

    } catch (error) {
      spinner.fail(chalk.red(`Scan failed: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('report')
  .description('Generate a full HTML X-Ray report for current changes')
  .option('-b, --branch <branch>', 'Compare against a specific branch', 'main')
  .action(async (options) => {
    console.log(BANNER);
    console.log(TAGLINE);

    const spinner = ora({ text: chalk.cyan('Generating full X-Ray report...'), spinner: 'dots12' }).start();

    try {
      const diffData = await scanCurrentDiff(options.branch);
      if (!diffData || diffData.files.length === 0) {
        spinner.warn(chalk.yellow('No changes detected.'));
        process.exit(0);
      }

      const complexityReport = analyzeComplexity(diffData);
      const splits = suggestSplits(complexityReport);
      const reportPath = await generateReport(complexityReport, splits);

      spinner.succeed(chalk.green(`X-Ray report generated: ${reportPath}`));
      await open(reportPath);
    } catch (error) {
      spinner.fail(chalk.red(`Report generation failed: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('history')
  .description('Analyze git history to find Monster PR patterns')
  .option('-n, --count <number>', 'Number of recent commits to analyze', '50')
  .option('-b, --branch <branch>', 'Branch to analyze', 'main')
  .action(async (options) => {
    console.log(BANNER);
    console.log(TAGLINE);

    const spinner = ora({ text: chalk.cyan('Analyzing git history...'), spinner: 'dots12' }).start();

    try {
      const historyReport = await analyzeHistory(parseInt(options.count), options.branch);
      spinner.succeed(chalk.green('History analysis complete!\n'));
      // Print history report handled inside analyzeHistory
    } catch (error) {
      spinner.fail(chalk.red(`History analysis failed: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('hook')
  .description('Manage git hooks for automatic PR scanning')
  .argument('<action>', 'install or remove')
  .action(async (action) => {
    if (action === 'install') {
      await installHook();
      console.log(chalk.green('✅ Pre-push hook installed! Incisio will auto-scan before every push.'));
    } else if (action === 'remove') {
      await removeHook();
      console.log(chalk.green('✅ Pre-push hook removed.'));
    } else {
      console.log(chalk.red('Unknown action. Use "install" or "remove".'));
    }
  });

program
  .command('demo')
  .description('Run a demo scan with sample data to showcase Incisio')
  .option('--report', 'Also generate HTML report')
  .action(async (options) => {
    console.log(BANNER);
    console.log(TAGLINE);
    await runDemo(options.report);
  });

program.parse();
