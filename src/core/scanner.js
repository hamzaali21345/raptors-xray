import simpleGit from 'simple-git';
import path from 'path';
import { readFileSync, existsSync } from 'fs';

const git = simpleGit();

/**
 * Scan current git diff against a target branch.
 * Returns structured data about all changed files.
 */
export async function scanCurrentDiff(targetBranch = 'main') {
  const diffSummary = await getDiffSummary(targetBranch);
  if (!diffSummary) return null;

  const files = [];

  for (const file of diffSummary.files) {
    const fileData = {
      path: file.file,
      insertions: file.insertions,
      deletions: file.deletions,
      changes: file.changes,
      binary: file.binary || false,
      extension: path.extname(file.file).slice(1).toLowerCase(),
      directory: path.dirname(file.file),
      filename: path.basename(file.file),
      content: null,
      diffContent: null,
    };

    // Try to read the full file content for deeper analysis
    try {
      if (existsSync(file.file) && !file.binary) {
        fileData.content = readFileSync(file.file, 'utf-8');
      }
    } catch (e) {
      // File might be deleted
    }

    // Get the actual diff content for this file
    try {
      fileData.diffContent = await git.diff([targetBranch, '--', file.file]);
    } catch (e) {
      try {
        fileData.diffContent = await git.diff(['HEAD', '--', file.file]);
      } catch (e2) {
        // Fallback: try staged diff
        try {
          fileData.diffContent = await git.diff(['--cached', '--', file.file]);
        } catch (e3) {
          // no diff available
        }
      }
    }

    files.push(fileData);
  }

  return {
    targetBranch,
    totalFiles: files.length,
    totalInsertions: diffSummary.insertions,
    totalDeletions: diffSummary.deletions,
    totalChanges: diffSummary.insertions + diffSummary.deletions,
    files,
  };
}

async function getDiffSummary(targetBranch) {
  // Try multiple strategies to get diff
  const strategies = [
    () => git.diffSummary([targetBranch]),
    () => git.diffSummary([`origin/${targetBranch}`]),
    () => git.diffSummary(['HEAD']),
    () => git.diffSummary(['--cached']),
    () => git.diffSummary(),
  ];

  for (const strategy of strategies) {
    try {
      const result = await strategy();
      if (result && result.files && result.files.length > 0) {
        return result;
      }
    } catch (e) {
      continue;
    }
  }

  return null;
}

/**
 * Scan a specific commit or range for analysis
 */
export async function scanCommitRange(fromRef, toRef) {
  try {
    const diffSummary = await git.diffSummary([fromRef, toRef]);
    const files = diffSummary.files.map(file => ({
      path: file.file,
      insertions: file.insertions,
      deletions: file.deletions,
      changes: file.changes,
      binary: file.binary || false,
      extension: path.extname(file.file).slice(1).toLowerCase(),
      directory: path.dirname(file.file),
      filename: path.basename(file.file),
    }));

    return {
      fromRef,
      toRef,
      totalFiles: files.length,
      totalInsertions: diffSummary.insertions,
      totalDeletions: diffSummary.deletions,
      totalChanges: diffSummary.insertions + diffSummary.deletions,
      files,
    };
  } catch (e) {
    return null;
  }
}
