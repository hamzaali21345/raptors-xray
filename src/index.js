/**
 * Incisio — Programmatic API
 * Use this to integrate Incisio into your own tools.
 */

export { scanCurrentDiff, scanCommitRange } from './core/scanner.js';
export { analyzeComplexity } from './core/complexity.js';
export { suggestSplits } from './core/splitter.js';
export { generateReport } from './report/htmlReport.js';
export { printTerminalReport } from './report/terminalReport.js';
export { installHook, removeHook } from './hooks/gitHook.js';
export { analyzeHistory } from './core/history.js';
