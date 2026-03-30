import { writeFileSync, readFileSync, existsSync, mkdirSync, chmodSync } from 'fs';
import path from 'path';
import simpleGit from 'simple-git';

const HOOK_CONTENT = `#!/bin/sh
# Incisio Pre-Push Hook
# Automatically scans your changes for Monster PRs before pushing

echo ""
echo "🔬 Incisio: Scanning your changes before push..."
echo ""

# Run Incisio scan
node "$(dirname "$0")/../../node_modules/.bin/incisio" scan 2>/dev/null || npx incisio scan 2>/dev/null || {
  # Fallback: run directly
  SCRIPT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
  node "$SCRIPT_DIR/src/cli.js" scan
}

EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo ""
  echo "⚠️  Incisio detected issues. Push continues anyway."
  echo "   Run 'incisio scan --report' for a detailed HTML report."
  echo ""
fi

# Always allow push (informational only, not blocking)
exit 0
`;

const HOOK_CONTENT_WINDOWS = `@echo off
REM Incisio Pre-Push Hook
REM Automatically scans your changes for Monster PRs before pushing

echo.
echo 🔬 Incisio: Scanning your changes before push...
echo.

node "%~dp0\\..\\..\\src\\cli.js" scan

echo.
exit /b 0
`;

/**
 * Install a pre-push git hook that runs Incisio automatically
 */
export async function installHook() {
  const git = simpleGit();

  // Find git root
  const root = await git.revparse(['--show-toplevel']);
  const gitRoot = root.trim();
  const hooksDir = path.join(gitRoot, '.git', 'hooks');

  if (!existsSync(hooksDir)) {
    mkdirSync(hooksDir, { recursive: true });
  }

  const isWindows = process.platform === 'win32';

  // Write pre-push hook
  const hookPath = path.join(hooksDir, 'pre-push');
  const content = isWindows ? HOOK_CONTENT_WINDOWS : HOOK_CONTENT;

  // Backup existing hook
  if (existsSync(hookPath)) {
    const existing = readFileSync(hookPath, 'utf-8');
    if (!existing.includes('Incisio')) {
      writeFileSync(hookPath + '.backup', existing, 'utf-8');
      console.log(`  📋 Existing pre-push hook backed up to ${hookPath}.backup`);
    }
  }

  writeFileSync(hookPath, content, 'utf-8');

  // Make executable on Unix
  if (!isWindows) {
    try { chmodSync(hookPath, '755'); } catch (e) { /* ok */ }
  }

  console.log(`  📂 Hook installed at: ${hookPath}`);
}

/**
 * Remove the Incisio pre-push hook
 */
export async function removeHook() {
  const git = simpleGit();
  const root = await git.revparse(['--show-toplevel']);
  const gitRoot = root.trim();
  const hookPath = path.join(gitRoot, '.git', 'hooks', 'pre-push');

  if (existsSync(hookPath)) {
    const content = readFileSync(hookPath, 'utf-8');
    if (content.includes('Incisio')) {
      // Restore backup if exists
      const backupPath = hookPath + '.backup';
      if (existsSync(backupPath)) {
        const backup = readFileSync(backupPath, 'utf-8');
        writeFileSync(hookPath, backup, 'utf-8');
        console.log('  📋 Original pre-push hook restored from backup.');
      } else {
        const { unlinkSync } = await import('fs');
        unlinkSync(hookPath);
      }
      console.log('  🗑️  Incisio hook removed.');
    } else {
      console.log('  ℹ️  Pre-push hook exists but was not installed by Incisio. Skipping.');
    }
  } else {
    console.log('  ℹ️  No pre-push hook found.');
  }
}
