<div align="center">

<img src="https://img.shields.io/badge/DX--Ray_Hackathon-2026-00d4ff?style=for-the-badge&labelColor=0a0e17" alt="DX-Ray 2026" />
<img src="https://img.shields.io/badge/Track_G-Code_Review_Radar-a855f7?style=for-the-badge&labelColor=0a0e17" alt="Track G" />
<img src="https://img.shields.io/badge/Node.js-18+-00ff88?style=for-the-badge&logo=node.js&labelColor=0a0e17" alt="Node" />
<img src="https://img.shields.io/badge/License-MIT-38bdf8?style=for-the-badge&labelColor=0a0e17" alt="MIT" />

<br/><br/>

# `INCISIO`

### _Latin for "incision" — a precise surgical cut._

**The CLI that X-rays your Pull Requests, exposes Monster PRs,<br/>and tells you exactly where to make the cut.**

<br/>

```
  ██╗███╗   ██╗ ██████╗██╗███████╗██╗ ██████╗
  ██║████╗  ██║██╔════╝██║██╔════╝██║██╔═══██╗
  ██║██╔██╗ ██║██║     ██║███████╗██║██║   ██║
  ██║██║╚██╗██║██║     ██║╚════██║██║██║   ██║
  ██║██║ ╚████║╚██████╗██║███████║██║╚██████╔╝
  ╚═╝╚═╝  ╚═══╝ ╚═════╝╚═╝╚══════╝╚═╝ ╚═════╝
```

_Stop reviewing 1,000-line Pull Requests. Start shipping clean code._

[**View Website**](https://hamzaali21345.github.io/raptors-xray/) · [**Report Bug**](https://github.com/hamzaali21345/raptors-xray/issues) · [**Get Started**](#-quick-start)

</div>

---

<br/>

## 💀 The Problem Nobody Talks About

<table>
<tr>
<td width="50%">

### Your team's dirty secret:

Every sprint, someone opens a Pull Request with **+1,000 lines**, touching **18 files** across **6 different domains** — database, auth, API, UI, config, tests.

The reviewer opens it. Scrolls. Scrolls more. Gives up. Types **"LGTM"** and approves.

**Bugs ship. Tech debt compounds. Nobody says anything.**

</td>
<td width="50%">

### The research is clear:

| Metric | Impact |
|--------|--------|
| **24h+** | Time to first review for PRs > 500 LOC |
| **-72%** | Review effectiveness after 200 lines |
| **+40%** | Defect rate in multi-domain PRs |
| **83%** | Developers who rubber-stamp large PRs |

_Sources: Google, Microsoft Research, SmartBear_

</td>
</tr>
</table>

<br/>

## 🔬 The Solution: Incisio

**Incisio is not a line counter.** It's a full diagnostic X-ray for your Pull Requests.

One command. Zero config. Five dimensions of analysis. Intelligent split suggestions.

```
$ incisio scan

🚨🚨🚨 MONSTER PR DETECTED 🚨🚨🚨

Complexity Score ··· 245/300
Severity ·········· MONSTER PR
Review Time ······· 96 minutes
Files Changed ····· 18
Domains Touched ··· 6

✂️ RECOMMENDED SPLITS

  1. Database & Schema ····· 3 files · ~12 min review
  2. Auth & Security ······· 2 files · ~8 min review
  3. Configuration ········· 3 files · ~2 min review
  4. API & Backend ········· 3 files · ~18 min review
  5. UI Components ········· 4 files · ~21 min review
  6. Test Suite ············ 3 files · ~10 min review

── IMPACT ────────────────────────
Complexity  245 → 92 avg  (-62%)
Review Time 96m → 12m avg (-88%)
Risk Level  MONSTER → MODERATE
```

<br/>

## ⚡ Quick Start

```bash
# 1. Clone
git clone https://github.com/hamzaali21345/raptors-xray.git
cd raptors-xray && npm install

# 2. Try the demo (no git repo needed)
npm run demo

# 3. Scan your real changes
node src/cli.js scan

# 4. Get a full HTML X-Ray report
node src/cli.js scan --report
```

> **That's it.** No config files. No API keys. No setup wizard. No account signup. Clone → Install → Scan.

<br/>

## 🧬 5-Dimensional Complexity Engine

Most tools count lines. **Incisio runs a full diagnostic.**

<table>
<tr>
<th>Dimension</th>
<th>Weight</th>
<th>What It Measures</th>
</tr>
<tr>
<td>📏 <strong>Size</strong></td>
<td><code>25%</code></td>
<td>Lines changed, files touched, average changes per file</td>
</tr>
<tr>
<td>🧠 <strong>Cognitive</strong></td>
<td><code>25%</code></td>
<td>Nesting depth, control flow complexity, callback hell patterns</td>
</tr>
<tr>
<td>🌐 <strong>Domain Spread</strong></td>
<td><code>20%</code></td>
<td>How many layers — DB, API, UI, Auth, Config — are mixed together</td>
</tr>
<tr>
<td>🔗 <strong>Coupling</strong></td>
<td><code>15%</code></td>
<td>Import dependencies and cross-file connections between changed files</td>
</tr>
<tr>
<td>⚠️ <strong>Risk</strong></td>
<td><code>15%</code></td>
<td>Critical paths: auth middleware, DB migrations, security configs</td>
</tr>
</table>

### Severity Scale

```
  0-50   ✅ CLEAN        →  Ship it. Reviewers will love you.
 51-100  ⚠️ MODERATE     →  Manageable. Keep an eye on it.
101-150  🔶 COMPLEX      →  Consider splitting. Quality at risk.
151-250  🚨 MONSTER PR   →  Split immediately. Reviewers will hate this.
251-300  💀 CATASTROPHIC  →  Emergency intervention needed.
```

<br/>

## ✂️ Smart Split Algorithm

Incisio doesn't randomly divide files. It **understands your codebase**:

```
Step 1  DETECT    →  Auto-classify files into 8 domains
Step 2  ANALYZE   →  Build import/dependency graph
Step 3  CLUSTER   →  Group by domain, keep coupled files together
Step 4  ORDER     →  Suggest merge order (DB → Auth → API → UI → Tests)
Step 5  MEASURE   →  Show before/after proof
```

**Each suggested PR is self-contained, independently reviewable, and dependency-aware.**

<br/>

## 📊 Before / After — Real Proof

Every scan shows quantifiable improvement:

```
┌──────────────┬──────────────────┬──────────────────┬─────────────────┐
│ Metric       │ Before (1 PR)    │ After (6 PRs)    │ Improvement     │
├──────────────┼──────────────────┼──────────────────┼─────────────────┤
│ Complexity   │ 245/300          │ ~92/300 avg      │ ▼ 62% reduction │
│ Review Time  │ 96 minutes       │ ~12 min avg      │ ▼ 88% faster    │
│ Risk Level   │ 🚨 MONSTER PR   │ ⚠️ MODERATE      │ ▼ De-escalated  │
│ Domains/PR   │ 6 mixed          │ 1 per PR         │ ✅ Clean        │
└──────────────┴──────────────────┴──────────────────┴─────────────────┘
```

<br/>

## 📋 All Commands

| Command | What It Does |
|---------|-------------|
| `incisio scan` | Scan git diff for complexity — terminal output |
| `incisio scan --report` | Scan + generate HTML X-Ray report |
| `incisio scan -b develop` | Scan against a specific branch |
| `incisio scan --json` | Output raw JSON for CI integration |
| `incisio report` | Generate full HTML report + open in browser |
| `incisio history` | Analyze git log for Monster PR patterns |
| `incisio hook install` | Auto-scan before every `git push` |
| `incisio hook remove` | Remove the pre-push hook |
| `incisio demo` | Run with simulated Monster PR data |
| `incisio demo --report` | Demo + generate HTML report |

<br/>

## 🔬 X-Ray HTML Report

Incisio generates a **dark-themed, interactive HTML report** you can share with your team:

- Animated complexity bars with shimmer effects
- Color-coded domain map with file breakdown
- Risk zone highlighting
- Split suggestions with merge order
- Before/After impact dashboard
- Opens automatically in your browser

```bash
node src/cli.js scan --report
# → Report saved to .incisio/xray-report.html
```

<br/>

## 🏗️ Architecture

```
incisio/
├── src/
│   ├── cli.js                    # CLI entry point (Commander.js)
│   ├── index.js                  # Programmatic API exports
│   ├── core/
│   │   ├── scanner.js            # Git diff parser (simple-git)
│   │   ├── complexity.js         # 5-dimensional complexity analyzer
│   │   ├── splitter.js           # Smart split algorithm
│   │   └── history.js            # Git history pattern analyzer
│   ├── report/
│   │   ├── terminalReport.js     # Beautiful CLI output (chalk + boxen)
│   │   └── htmlReport.js         # X-Ray HTML report generator
│   ├── hooks/
│   │   └── gitHook.js            # Pre-push hook installer
│   └── demo/
│       └── demo.js               # Realistic Monster PR simulation
├── docs/                         # Showcase website
│   ├── index.html
│   ├── style.css
│   └── script.js
├── package.json
├── LICENSE
└── README.md                     # You are here
```

<br/>

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Runtime | **Node.js 18+** | Universal, fast, npm ecosystem |
| CLI Framework | **Commander.js** | Industry standard for Node CLIs |
| Git Operations | **simple-git** | Clean API for git diff/log |
| Terminal UI | **chalk + boxen + cli-table3** | Beautiful, colorful output |
| Spinners | **ora** | Professional loading states |
| Browser | **open** | Auto-launch HTML reports |

<br/>

## 📚 Research Foundation

Incisio's scoring model is grounded in peer-reviewed research:

| Source | Finding |
|--------|---------|
| [Google — Modern Code Review (2018)](https://dl.acm.org/doi/10.1145/3183519.3183525) | Review effectiveness drops with PR size |
| [Microsoft — Code Review Quality (2015)](https://www.microsoft.com/en-us/research/publication/code-reviews-do-not-find-bugs/) | PRs over 200 LOC miss critical bugs |
| [SmartBear — Best Practices](https://smartbear.com/learn/code-review/best-practices-for-peer-code-review/) | 200-400 LOC is optimal review size |
| [SonarSource — Cognitive Complexity](https://www.sonarsource.com/docs/CognitiveComplexity.pdf) | Cognitive complexity model for code analysis |

<br/>

## 🏆 DX-Ray Hackathon 2026

<table>
<tr>
<td>

Built for the [**DX-Ray Hackathon 2026**](https://dxrayhack.com) — **Track G: Code Review Radar**

**Bonus Challenges Completed:**

| Challenge | Status |
|-----------|--------|
| Real Data Demo | ✅ Scan any live git repo |
| Before & After Metrics | ✅ Quantifiable proof with every scan |
| Open Source Ready | ✅ npm-publishable with full docs |
| Cross-Track Integration | ✅ Code Review (G) + Build & CI (A) |
| Showcase Website | ✅ Premium dark theme with animations |

</td>
</tr>
</table>

<br/>

---

<div align="center">

**MIT License** · Built with precision during [DX-Ray Hackathon 2026](https://dxrayhack.com)

_Every Monster PR starts with someone thinking "I'll just add one more file."_

<br/>

**[Star this repo](https://github.com/hamzaali21345/raptors-xray)** if Incisio saved your team's code review sanity.

</div>
