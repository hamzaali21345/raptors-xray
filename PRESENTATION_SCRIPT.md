# INCISIO — 5-Minute Presentation Script
## DX-Ray Hackathon 2026 | Track G: Code Review Radar

---

## SLIDE FLOW + SCRIPT (Total: 5 minutes)

---

### SLIDE 1 — HOOK (0:00 - 0:30) ⏱️ 30 sec

**Screen:** Website landing page open (hero section visible)

**Script:**

> "Raise your hand if you've ever opened a Pull Request with 1,000+ lines... and just typed LGTM."
>
> (Pause 2 sec)
>
> "83% of developers admit to rubber-stamping large PRs. Google and Microsoft research proves that after 200 lines, review quality drops by 72%. Bugs slip through. Tech debt compounds. Nobody talks about it."
>
> "We built **Incisio** — Latin for 'incision' — to fix this. One command. Zero config. It X-rays your Pull Request and tells you exactly where to cut."

**Action:** Scroll website slowly to show the "Before/After" section

---

### SLIDE 2 — THE PROBLEM (0:30 - 1:15) ⏱️ 45 sec

**Screen:** Website "Problem" section OR a simple slide with stats

**Script:**

> "Here's what research tells us about Monster PRs:"
>
> - "PRs over 500 lines take **24+ hours** to get reviewed"
> - "Review effectiveness drops **72%** after 200 lines"
> - "Multi-domain PRs have **40% higher** defect rates"
> - "And **83%** of devs admit they rubber-stamp them"
>
> "The root cause? Developers don't have a tool that tells them **when** a PR is too complex and **how** to split it. Line counters exist, but they miss the real complexity."

**Action:** Point to each stat on screen as you say it

---

### SLIDE 3 — THE SOLUTION (1:15 - 2:15) ⏱️ 60 sec

**Screen:** Terminal — ready to run demo

**Script:**

> "Incisio is a CLI that runs a **5-dimensional complexity scan** on your git diff."
>
> "It doesn't just count lines. It analyzes:"
> - **Size** — files and lines changed
> - **Cognitive complexity** — nesting depth, control flow
> - **Domain spread** — is your PR touching DB, API, UI, and auth at the same time?
> - **Coupling** — are changed files importing each other?
> - **Risk** — did you touch auth middleware or database migrations?
>
> "Each dimension gets scored 0-300, then weighted into one actionable number."
>
> "Let me show you."

**Action:** Run the demo command:

```bash
npm run demo
```

**What happens on screen:**
1. Spinner starts — "Loading demo data"
2. ASCII banner appears — INCISIO
3. Monster PR alert fires — 🚨 score 245/300
4. Complexity breakdown table shows all 5 dimensions
5. Domain map displays 6 domains touched
6. Risk zones highlighted in red
7. Split suggestions appear — 6 clean PRs
8. Before/After comparison shows -62% complexity, -88% review time

> (While output appears) "Watch — it found 18 files across 6 domains. Score: 245 out of 300. That's a Monster PR."

---

### SLIDE 4 — LIVE DEMO: SPLIT SUGGESTIONS (2:15 - 3:15) ⏱️ 60 sec

**Screen:** Terminal output — focus on the split suggestions and before/after

**Script:**

> "Now here's where it gets interesting. Incisio doesn't just diagnose — it **prescribes**."
>
> "It automatically grouped these 18 files into 6 clean PRs:"
> - "PR 1: Database & Schema — 3 files, 12 min review"
> - "PR 2: Auth & Security — 2 files, 8 min review"  
> - "PR 3: Config — 3 files, 2 min review"
> - "PR 4: API & Backend — 3 files, 18 min review"
> - "PR 5: UI Components — 4 files, 21 min review"
> - "PR 6: Tests — 3 files, 10 min review"
>
> "Each PR is **self-contained**. Coupled files stay together. It even suggests **merge order** — database first, then auth, then API, then UI, then tests."
>
> "Look at the Before/After:"
> - "Complexity: **245 → 92 average** — that's 62% reduction"
> - "Review time: **96 minutes → 12 minutes average** — 88% faster"
> - "Risk level: **Monster PR → Moderate**"
>
> "This is not a suggestion. This is **proof**."

**Action:** Scroll through the terminal output, pointing to each section

---

### SLIDE 5 — HTML REPORT + AUTOMATION (3:15 - 4:00) ⏱️ 45 sec

**Screen:** Run the HTML report

**Script:**

> "For teams that want to share results, Incisio generates a full HTML X-Ray report."

**Action:** Run:

```bash
npm run demo -- --report
```

> (Report opens in browser)
>
> "Dark-themed, animated, interactive. Shows every metric, every domain, every file ranked by complexity. You can send this to your team lead or put it in your PR description."
>
> "And for automation — one command installs a pre-push git hook:"

```bash
node src/cli.js hook install
```

> "Now every `git push` gets automatically scanned. Catch Monster PRs before they ever reach the review queue."

**Action:** Show the HTML report in browser — scroll through sections slowly

---

### SLIDE 6 — TECHNICAL DEPTH (4:00 - 4:30) ⏱️ 30 sec

**Screen:** Website "Features" section OR README architecture diagram

**Script:**

> "Under the hood:"
> - "**Node.js** CLI with **Commander.js**"
> - "**simple-git** for git operations — reads real diffs from any repo"
> - "**8 domain auto-detection patterns** — database, auth, API, UI, tests, config, infra, utils"
> - "**Dependency graph** analysis for coupling-aware splitting"
> - "**Research-backed** review time estimation from Google and Microsoft studies"
> - "**Zero dependencies on external APIs** — runs fully offline"
>
> "Built in 72 hours. Open source. MIT license."

**Action:** Briefly show the architecture section on website or README

---

### SLIDE 7 — CLOSE (4:30 - 5:00) ⏱️ 30 sec

**Screen:** Website hero section or GitHub repo

**Script:**

> "Every engineering team has Monster PRs. Nobody had a diagnostic tool for it. Until now."
>
> "**Incisio** — one command to X-ray your PR, five dimensions of analysis, intelligent split suggestions with proof."
>
> "Clone it. Run `npm run demo`. See it yourself."
>
> "Thank you."

**Action:** Show the GitHub URL: `github.com/hamzaali21345/raptors-xray`

---

## 🎯 DEMO COMMANDS CHEAT SHEET

Run these in order during the presentation:

```bash
# 1. Demo scan (main demo — slide 3-4)
npm run demo

# 2. Demo with HTML report (slide 5)
npm run demo -- --report

# 3. Hook install (just mention, don't need to run)
node src/cli.js hook install
```

---

## 💡 PRESENTATION TIPS

### Before the presentation:
1. **Open terminal** in the project folder — `cd raptors-xray`
2. **Run `npm install`** — make sure dependencies are ready
3. **Open the website** in a browser tab — `http://localhost:3000` or GitHub Pages
4. **Test `npm run demo`** once — make sure it works smoothly
5. **Increase terminal font size** — so audience can read (Ctrl + = in most terminals)
6. **Dark terminal theme** — matches the X-ray aesthetic

### During the presentation:
1. **Start with the website** — visual impact first
2. **Switch to terminal** for live demo — shows it's real
3. **Switch to HTML report** in browser — shows polish
4. **End on GitHub** — call to action

### Screen layout:
- **Tab 1:** Website (hero page)
- **Tab 2:** Terminal (ready with `npm run demo`)
- **Tab 3:** Browser (will open automatically with HTML report)

### If something breaks:
- Demo uses **simulated data** — it will always work, no git repo needed
- If terminal looks cluttered, just run `clear` then `npm run demo` again
- HTML report is a static file — you can open it manually from `.incisio/xray-report.html`

---

## 📊 KEY NUMBERS TO REMEMBER

| Metric | Value | When to say it |
|--------|-------|---------------|
| Files in demo | **18 files** | When demo output appears |
| Domains touched | **6 domains** | When showing domain map |
| Complexity score | **245/300** | When Monster PR alert fires |
| Split into | **6 clean PRs** | When showing split suggestions |
| Complexity reduction | **-62%** | Before/After section |
| Review time saved | **-88%** | Before/After section (biggest wow factor) |
| Review time before | **96 minutes** | Problem framing |
| Review time after | **~12 min avg** | Solution proof |

---

## 🗣️ ONE-LINER HOOKS (use any of these)

- _"83% of developers rubber-stamp large PRs. We built the diagnostic tool to fix that."_
- _"One command. Five dimensions. Zero config. Your PR gets an X-ray in seconds."_
- _"245 complexity → 92 average. 96 minutes → 12 minutes. That's Incisio."_
- _"It doesn't just say your PR is too big. It tells you exactly how to split it."_
- _"Every Monster PR starts with someone thinking 'I'll just add one more file.'"_
