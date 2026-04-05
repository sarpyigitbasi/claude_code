# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

This is a multi-project repository containing web apps and experiments built with vanilla HTML/CSS/JS. No build step, bundler, or server is required for any file — open directly in a browser.

**Current projects:**
- `tictactoe.html` — two-player Tic Tac Toe game with score tracking
- `index.html` — AXIOM fictional AI company landing page (futuristic design showcase)

## Running any project

```bash
open tictactoe.html
open index.html
```

## Git workflow

After every meaningful change, commit with a clear descriptive message and push to GitHub:

```bash
git add <files>
git commit -m "short description of what changed and why"
git push
```

Commit at logical milestones — don't batch unrelated changes into one commit. This ensures we always have a recoverable version on GitHub at [sarpyigitbasi/claude_code](https://github.com/sarpyigitbasi/claude_code).

## Subagents

Specialized agents are defined in `.claude/agents/`:

- **code-reviewer** — audits files for bugs, logic errors, and edge cases, then fixes them directly
- **ui-ux-designer** — improves and builds UI/UX: layout, animations, accessibility, responsiveness

Invoke them by name, e.g. *"Ask the code-reviewer to review index.html"*.

## UI/UX skill

The **ui-ux-pro-max** skill is installed at `.claude/skills/ui-ux-pro-max/`. It activates automatically for UI/UX requests and provides:
- 67 UI styles (glassmorphism, claymorphism, brutalism, etc.)
- 161 industry-specific design system rules
- 57 font pairings, 161 color palettes
- Stack-specific guidelines including SwiftUI and React Native

## Firecrawl

The **Firecrawl CLI** (v1.12.2) is installed globally via `npx -y firecrawl-cli@latest init`. Eight skills from [firecrawl/cli](https://github.com/firecrawl/cli) are installed at `~/.agents/skills/firecrawl-*/` (symlinked to Claude Code): `firecrawl`, `firecrawl-agent`, `firecrawl-scrape`, `firecrawl-crawl`, `firecrawl-download`, `firecrawl-map`, `firecrawl-search`, `firecrawl-instruct`. Requires `firecrawl login` to authenticate before use.

## Supabase

The **Supabase CLI** (v2.84.2) is installed via Homebrew (`brew install supabase/tap/supabase`). The **supabase-postgres-best-practices** skill is installed from the official [supabase/agent-skills](https://github.com/supabase/agent-skills) repo at `~/.agents/skills/supabase-postgres-best-practices/` (symlinked to Claude Code). It activates automatically for Postgres query writing, schema design, and database optimization.

## Playwright CLI skill

The **playwright-cli** skill is installed at `.claude/skills/playwright-cli/`. It enables browser automation from the terminal using `playwright-cli` (installed globally via npm). Use it for:
- Opening and navigating web pages
- Clicking, typing, filling forms, drag-and-drop
- Taking screenshots and saving PDFs
- Mocking network requests
- Managing cookies, localStorage, sessionStorage
- Recording video and traces

Chrome is configured as the default browser.

## Architecture

All projects are single self-contained HTML files (HTML + CSS + vanilla JS). No frameworks or external dependencies beyond Google Fonts.
