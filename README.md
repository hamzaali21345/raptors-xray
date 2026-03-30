# 🔬 Incisio

**PR Complexity Scorer & Smart Splitter — X-ray your Pull Requests**

> Built for [DX-Ray Hackathon 2026](https://dxrayhack.com) · Track G: Code Review Radar

---

## The Problem

Every engineering team has experienced it: a Pull Request with **+1,000 lines**, touching **15 files** across **database, API, UI, and tests**. Reviewers open it, feel overwhelmed, and... leave it for tomorrow. And the next day. And the next.

**Monster PRs are the silent killer of code review velocity.**

- 🕐 Average time-to-first-review exceeds **24 hours**
- 📉 Review quality drops **drastically** after 200 LOC
- 🔄 Large PRs have **40% higher** defect rates
- 😰 Reviewer fatigue leads to rubber-stamp approvals

## The Solution

**Incisio** is a CLI tool that acts as an **X-ray scanner for your Pull Requests**. It doesn't just count lines — it performs a **multi-dimensional complexity analysis** and provides **intelligent split suggestions** based on domain clustering and dependency analysis.

### What Makes Incisio Different?

| Feature | Basic LOC Counter | Incisio |
|---------|:-----------------:|:----------:|
| Line count | ✅ | ✅ |
| Cognitive complexity analysis | ❌ | ✅ |
| Domain auto-detection (DB/API/UI/Auth) | ❌ | ✅ |
| Cross-file coupling analysis | ❌ | ✅ |
| Risk zone identification | ❌ | ✅ |
| Smart split suggestions | ❌ | ✅ |
| Dependency-aware splitting | ❌ | ✅ |
| Review time estimation | ❌ | ✅ |
| Before/After impact metrics | ❌ | ✅ |
| Beautiful X-Ray HTML report | ❌ | ✅ |
| Git hook integration | ❌ | ✅ |

---

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/hamzaali21345/raptors-xray.git
cd raptors-xray
npm install

# Run a demo (no git repo needed)
npm run demo

# Scan your current changes
npm run scan

# Generate a full HTML X-Ray report
npm run report
```

## 📋 Commands

### `incisio scan`
Scan current git diff for PR complexity.

```bash
node src/cli.js scan                    # Scan against main branch
node src/cli.js scan -b develop         # Scan against develop branch
node src/cli.js scan --report           # Also generate HTML report
node src/cli.js scan -t 100             # Set custom threshold
node src/cli.js scan --json             # Output as JSON
```

### `incisio report`
Generate a full HTML X-Ray report and open it in your browser.

```bash
node src/cli.js report
node src/cli.js report -b develop
```

### `incisio history`
Analyze git history to find Monster PR patterns on your team.

```bash
node src/cli.js history                 # Analyze last 50 commits
node src/cli.js history -n 100          # Analyze last 100 commits
node src/cli.js history -b develop      # Analyze develop branch
```

### `incisio hook`
Install/remove a pre-push git hook for automatic scanning.

```bash
node src/cli.js hook install            # Auto-scan before every push
node src/cli.js hook remove             # Remove the hook
```

### `incisio demo`
Run a demo with simulated Monster PR data.

```bash
node src/cli.js demo                    # Terminal output only
node src/cli.js demo --report           # Also generate HTML report
```

---

## 🧠 How It Works

### Multi-Dimensional Complexity Score (0-300)

Incisio computes **5 independent metrics**, each scored 0-300, then combines them with weighted averaging:

| Metric | Weight | What It Measures |
|--------|--------|-----------------|
| **📏 Size** | 25% | Lines changed, files touched, average changes per file |
| **🧠 Cognitive** | 25% | Nesting depth, control flow complexity, callback patterns |
| **🌐 Domain Spread** | 20% | How many layers (DB/API/UI/Auth/Config) are touched |
| **🔗 Coupling** | 15% | Import dependencies between changed files |
| **⚠️ Risk** | 15% | Critical paths (auth, security, DB migrations) |

### Severity Levels

| Score | Severity | What It Means |
|-------|----------|--------------|
| 0-50 | ✅ CLEAN | Ship it. Reviewers will love you. |
| 51-100 | ⚠️ MODERATE | Manageable. Keep an eye on it. |
| 101-150 | 🔶 COMPLEX | Consider splitting. Review quality at risk. |
| 151-250 | 🚨 MONSTER PR | Split immediately. Reviewers will hate this. |
| 251-300 | 💀 CATASTROPHIC | Emergency intervention needed. |

### Smart Split Algorithm

1. **Domain Detection** — Auto-classifies files into DB, API, UI, Auth, Config, Tests, Infrastructure, Utils
2. **Coupling Analysis** — Builds import/dependency graph between changed files
3. **Cluster Formation** — Groups files by domain, keeping coupled files together
4. **Merge Order** — Suggests PR merge order (DB → Auth → API → UI → Tests)
5. **Before/After Metrics** — Shows quantifiable improvement from splitting

### Review Time Estimation

Based on research from Microsoft & Google studies on code review efficiency:
- Base: ~4 minutes per 100 LOC
- Multiplied by complexity factor
- Adjusted for domain risk

---

## 📊 Sample Output

```
🚨  MONSTER PR DETECTED!  🚨

Complexity Score: 187/300
Severity: MONSTER PR
Est. Review Time: 47 minutes

📊 COMPLEXITY BREAKDOWN
┌──────────────────┬────────┬──────────────────────┐
│ Metric           │ Score  │ Bar                  │
├──────────────────┼────────┼──────────────────────┤
│ 📏 Size          │ 142    │ █████████░░░░░░░░░░░ │
│ 🧠 Cognitive     │ 98     │ ██████░░░░░░░░░░░░░░ │
│ 🌐 Domain Spread │ 120    │ ████████░░░░░░░░░░░░ │
│ 🔗 Coupling      │ 45     │ ███░░░░░░░░░░░░░░░░░ │
│ ⚠️ Risk          │ 89     │ █████░░░░░░░░░░░░░░░ │
└──────────────────┴────────┴──────────────────────┘

✂️  SMART SPLIT SUGGESTIONS

  PR #1: Database & Schema Changes (3 files, 198 changes, ~8 min review)
  PR #2: Authentication & Security Updates (2 files, 143 changes, ~12 min review)
  PR #3: API & Backend Logic (3 files, 271 changes, ~15 min review)
  PR #4: UI Components & Frontend (4 files, 311 changes, ~14 min review)
  PR #5: Test Suite Updates (3 files, 170 changes, ~7 min review)

📊 BEFORE vs AFTER SPLIT
┌──────────────┬───────────────┬───────────────┬─────────────┐
│ Metric       │ Before (1 PR) │ After (5 PRs) │ Improvement │
├──────────────┼───────────────┼───────────────┼─────────────┤
│ Complexity   │ 187/300       │ ~42/300 avg   │ 78%         │
│ Review Time  │ 47 min        │ ~11 min avg   │ 77%         │
│ Risk Level   │ MONSTER PR    │ CLEAN         │ ⬇️ Reduced  │
└──────────────┴───────────────┴───────────────┴─────────────┘
```

---

## 🏗️ Architecture

```
incisio/
├── src/
│   ├── cli.js                    # CLI entry point (Commander.js)
│   ├── core/
│   │   ├── scanner.js            # Git diff parser
│   │   ├── complexity.js         # Multi-dimensional complexity analyzer
│   │   ├── splitter.js           # Smart split algorithm
│   │   └── history.js            # Git history pattern analyzer
│   ├── report/
│   │   ├── terminalReport.js     # Beautiful terminal output
│   │   └── htmlReport.js         # X-Ray HTML report generator
│   ├── hooks/
│   │   └── gitHook.js            # Git hook installer
│   └── demo/
│       └── demo.js               # Demo with simulated data
├── package.json
├── README.md
└── .gitignore
```

## 🛠️ Tech Stack

- **Node.js** — Runtime
- **Commander.js** — CLI framework
- **simple-git** — Git operations
- **chalk + boxen + cli-table3** — Beautiful terminal UI
- **ora** — Spinners and progress
- **open** — Open HTML reports in browser

## 📚 Research & References

- [Google: Modern Code Review (2018)](https://dl.acm.org/doi/10.1145/3183519.3183525) — Effectiveness of code review
- [Microsoft: Code Review Quality (2015)](https://www.microsoft.com/en-us/research/publication/code-reviews-do-not-find-bugs/) — Impact of PR size on review quality
- [SmartBear: Best Practices](https://smartbear.com/learn/code-review/best-practices-for-peer-code-review/) — 200-400 LOC optimal review size
- [Cognitive Complexity (SonarSource)](https://www.sonarsource.com/docs/CognitiveComplexity.pdf) — Cognitive complexity model

## 🏆 DX-Ray Hackathon 2026

This tool was built for the [DX-Ray Hackathon 2026](https://dxrayhack.com) — Track G: Code Review Radar.

**Bonus Challenges Addressed:**
- ✅ **Real Data Demo** — Scan any real git repository
- ✅ **Before & After** — Quantifiable improvement metrics with every scan
- ✅ **Open Source Ready** — npm-publishable package with full docs
- ✅ **Cross-Track Integration** — Connects Code Review (Track G) with Build & CI insights (Track A)

---

## 📄 License

MIT

---

*Built with ❤️ and too much caffeine during DX-Ray Hackathon 2026*
