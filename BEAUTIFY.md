# Streaks — Beautification & Navigation Spec

**Purpose.** Upgrade the app from raw Tailwind on a single page to a polished, multi-page product with a nav shell, a design system, and a consistent visual identity.

**Working style — spec-driven development.**
This document is a **sequence of gated phases**. An executing agent (or you, working manually) MUST:

1. Read only the current phase.
2. Execute exactly what the phase specifies — no scope creep, no "while I'm here" changes.
3. Verify every item in that phase's **Acceptance Criteria**.
4. **Stop** and wait for the user to type `approve phase N` before starting phase N+1.
5. If any acceptance criterion fails, stop and report — do not proceed with partial success.

Phases are numbered 0–7. Phase 0 is a read-only audit; the rest are execution phases. Each phase declares its scope, deliverables, files touched, and how to verify.

---

## Design direction — Neon Grid

Chosen aesthetic: dark, data-forward, single vivid accent. The full token set is defined in Phase 1. If the user wants the alternate **Warm Journal** direction instead, they will say so before Phase 1 begins; only the token file changes, everything else is identical.

**Design tokens (Neon Grid):**

| Token           | Value       | Purpose                            |
|-----------------|-------------|------------------------------------|
| `bg`            | `#0A0A0B`   | Page background                    |
| `surface`       | `#141416`   | Cards, elevated panels             |
| `border`        | `#26262A`   | Dividers, card borders             |
| `fg`            | `#F4F4F5`   | Primary text                       |
| `fg-muted`      | `#71717A`   | Secondary text, labels             |
| `lime`          | `#A3E635`   | Primary accent, streaks, CTAs      |
| `flame`         | `#F97316`   | Warnings, missed logs              |
| `buddy`         | `#818CF8`   | Buddy-related UI accents           |

**Fonts:** Geist Sans (body/UI), Geist Mono (numbers, dates, labels).

---

## Target file structure

By end of Phase 7:

```
app/
├── layout.tsx              # Fonts, Providers, AppShell wrapper
├── page.tsx                # Dashboard (overview)
├── habits/
│   └── page.tsx            # Manage habits — list, add, delete
├── log/
│   └── page.tsx            # Today's log — quick-entry UI
├── buddy/
│   └── page.tsx            # Invite / redeem / view buddy
├── summaries/
│   └── page.tsx            # All past weekly summaries
└── components/
    ├── AppShell.tsx        # Topbar + main content area
    ├── NavLink.tsx         # Active-aware nav link
    ├── HabitRow.tsx        # (moved from page.tsx)
    ├── NewHabitForm.tsx    # (moved)
    ├── BuddySection.tsx    # (moved and split)
    ├── WeeklySummary.tsx   # (moved)
    ├── StatCard.tsx        # New — small metric card
    └── EmptyState.tsx      # New — reusable empty state
```

No changes to `convex/`. Backend stays exactly as-is. This is a frontend-only refactor.

---

## Phase 0 — Audit (read-only)

**Scope.** Understand the current state. No file changes.

**Deliverables.** Print a short report covering:
- Which files currently exist in `app/`.
- Every component defined in `app/page.tsx` (name + roughly what it does).
- Every Convex query/mutation currently called from the frontend (`useQuery` / `useMutation` calls).
- Current dependencies in `package.json` related to UI (`tailwindcss`, anything else visual).
- Any existing routes beyond `/`.

**Acceptance criteria.**
- [ ] Report is printed to the terminal.
- [ ] No files were created, modified, or deleted.
- [ ] User has read the report.

**Gate.** User types `approve phase 0`.

---

## Phase 1 — Design tokens and fonts

**Scope.** Install shadcn/ui, register the Neon Grid color tokens in Tailwind, wire up Geist fonts in the root layout. **No visual changes to any page yet** — this phase only prepares the tools.

**Steps.**
1. Run `npx shadcn@latest init`. When prompted:
   - Style: **Default**
   - Base color: **Neutral**
   - CSS variables: **Yes**
2. Install fonts and icons:
   ```bash
   npm install geist lucide-react
   ```
3. Update `tailwind.config.ts` — add the Neon Grid color palette under `theme.extend.colors` (values from the token table above). Do not remove existing config; extend it.
4. Update `app/layout.tsx`:
   - Import `GeistSans` from `geist/font/sans` and `GeistMono` from `geist/font/mono`.
   - Add both `variable`s to the `<html>` className, plus the `dark` class.
   - Set `<body>` className to `bg-bg text-fg font-sans antialiased`.
5. In `app/globals.css`, ensure the default background/foreground CSS vars don't fight the new tokens. If shadcn added conflicting `--background` / `--foreground` variables, override them in `.dark { ... }` to use the Neon Grid values.

**Files touched.** `tailwind.config.ts`, `app/layout.tsx`, `app/globals.css`, `components.json` (new, from shadcn init), `package.json`.

**Acceptance criteria.**
- [ ] `npm run dev` starts without errors.
- [ ] `localhost:3000` still shows the existing dashboard — no crashes.
- [ ] The page background is now near-black (`#0A0A0B`).
- [ ] Text renders in Geist Sans (visibly different from the default system font).
- [ ] `git status` shows only the files listed above as modified/created.
- [ ] Convex `dev` process still healthy (types regenerate on `convex/` changes).

**Gate.** User types `approve phase 1`.

---

## Phase 2 — Install shadcn primitives

**Scope.** Add the shadcn components used across the redesign. No page edits.

**Steps.**
1. Run:
   ```bash
   npx shadcn@latest add button card input select label dialog badge separator
   ```
2. Verify each component appears under `components/ui/`.
3. Do a smoke test: temporarily import a `<Button>` from `components/ui/button` into `app/page.tsx` and render it in a corner. Confirm it looks correct with the dark theme. **Remove the smoke test before finishing this phase.**

**Files touched.** `components/ui/*.tsx` (new files created by shadcn), `package.json` (dependency additions).

**Acceptance criteria.**
- [ ] All 8 files exist under `components/ui/`.
- [ ] Smoke-test button rendered correctly with dark bg, lime accent when styled `variant="default"` (adjust variant if needed).
- [ ] Smoke test removed; `app/page.tsx` restored to its pre-smoke-test state.
- [ ] Existing app still runs without errors.

**Gate.** User types `approve phase 2`.

---

## Phase 3 — Routing structure and AppShell

**Scope.** Create the folder-based routes and the shared navigation shell. Each new route is a **stub page** (just the page title) — real content moves in later phases.

**Steps.**
1. Create the following route files, each containing a Server Component that renders a single `<h1>` with the page name:
   - `app/habits/page.tsx` → `Habits`
   - `app/log/page.tsx` → `Log`
   - `app/buddy/page.tsx` → `Buddy`
   - `app/summaries/page.tsx` → `Summaries`
2. Create `app/components/AppShell.tsx` — a Client Component (`"use client"`) that renders:
   - A topbar with the wordmark `streaks` in Geist Mono on the left, a horizontal nav in the center, sign-out button on the right.
   - Nav items: Today (`/`), Habits (`/habits`), Log (`/log`), Buddy (`/buddy`), Summaries (`/summaries`).
   - Active-link styling: use `usePathname()` from `next/navigation`; active link gets `bg-surface text-fg`, inactive gets `text-fg-muted hover:text-fg`.
   - Below the topbar, a `<main className="max-w-4xl mx-auto p-6">{children}</main>`.
3. Wrap `{children}` in `<AppShell>` inside `app/layout.tsx`. Sign-out button moves from `page.tsx` into `AppShell`.
4. Keep the auth gate at the layout level: unauthenticated users see the sign-in screen (no shell); authenticated users see the shell with nested pages.

**Files touched.** `app/habits/page.tsx`, `app/log/page.tsx`, `app/buddy/page.tsx`, `app/summaries/page.tsx`, `app/components/AppShell.tsx`, `app/layout.tsx`, `app/page.tsx` (only to remove sign-out button and any structural chrome now handled by AppShell).

**Acceptance criteria.**
- [ ] All five nav routes load without errors when signed in.
- [ ] Unauthenticated users see only the sign-in screen (no shell, no nav).
- [ ] The active nav link is visually distinct on each page.
- [ ] Sign-out button in the topbar signs out and returns to the sign-in screen.
- [ ] Dashboard (`/`) still shows all existing content (weekly summary, habits, buddy section) — nothing lost yet.
- [ ] Mobile viewport (~380px) is not broken; nav can be temporarily horizontal-scroll, will be polished in Phase 7.

**Gate.** User types `approve phase 3`.

---

## Phase 4 — Migrate components into their own files

**Scope.** Extract each large component from `app/page.tsx` into its own file under `app/components/`. **No visual redesign in this phase** — copy the JSX as-is, only change the file location.

**Steps.**
1. For each of these components in `app/page.tsx`, create a new file at `app/components/<Name>.tsx` and move the entire component:
   - `HabitRow.tsx`
   - `NewHabitForm.tsx`
   - `BuddySection.tsx`
   - `WeeklySummary.tsx`
2. Each moved file must start with `"use client"` and import its own dependencies (`useQuery`, `useMutation`, `api`, `useState`, etc.).
3. Update `app/page.tsx` to import from the new locations.
4. `app/page.tsx` should now be short — mostly composition of `<Dashboard>` (which itself is the composition of `<WeeklySummary />`, `<HabitRow />` list, `<BuddySection />`) and the auth gate.

**Files touched.** 4 new files under `app/components/`, `app/page.tsx` (imports updated).

**Acceptance criteria.**
- [ ] `app/page.tsx` no longer contains the JSX or logic of the four extracted components.
- [ ] App runs and looks **identical** to before this phase.
- [ ] All previously working features still work: log a habit, streak updates live, buddy invite/redeem, weekly summary displays.
- [ ] Two-window reactive test still passes (log in one window, streak updates in the other).

**Gate.** User types `approve phase 4`.

---

## Phase 5 — Redesign the Dashboard (`/`)

**Scope.** Now the actual visual work begins, one page at a time. This phase redesigns **only** the dashboard page. Other pages stay as stubs.

**Dashboard spec:**
- Header row: `<h1>Dashboard</h1>` on the left; on the right, a `<div className="font-mono text-sm text-fg-muted">` showing today's date as `YYYY-MM-DD · Wxx` (week number).
- Stat cards row (3 cards in a grid): use a new `StatCard.tsx` component. Cards show:
  - "Longest streak" — the max streak across all habits, unit "days"
  - "Habits today" — `hitCount / totalCount`
  - "Week completion" — percentage of (habit × day) cells hit this week
  - Values in Geist Mono, large; labels in Geist Sans, small, muted.
- Weekly summary card: reuse `WeeklySummary.tsx` but restyle:
  - `bg-surface`, `border border-border`, `rounded-lg`, `border-l-4 border-l-buddy`.
  - Small uppercase mono label: `WEEKLY COACH · WEEK 33`.
  - Body text in Geist Sans, leading-relaxed.
- Today section:
  - Small uppercase mono label `TODAY` above.
  - Habit rows using redesigned `HabitRow.tsx` — see below.

**HabitRow redesign:**
- `bg-surface`, `border border-border`, `rounded-lg`, `p-4`, flex layout.
- Left: habit name in Geist Sans (medium weight), streak badge below in Geist Mono lime (e.g. `🔥 12`).
- Middle: thin progress bar (`h-1`, `rounded-full`, `bg-border` track, `bg-lime` fill) — width = `min(current/target, 1) * 100%`.
- Right: the numeric input, styled as `bg-transparent border border-border rounded-md px-2 py-1 w-20 text-right font-mono focus:border-lime focus:outline-none`.
- If `hit`, add a small `<CheckCircle2>` icon from lucide-react in lime.

**StatCard component (new):**
```tsx
// app/components/StatCard.tsx
export function StatCard({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="text-xs font-mono text-fg-muted uppercase">{label}</div>
      <div className="mt-2 font-mono text-2xl">
        {value} <span className="text-fg-muted text-sm">{unit}</span>
      </div>
    </div>
  );
}
```

**Stat calculations.** Add a new query `convex/habits.ts::dashboardStats` that returns `{ longestStreak, hitToday, totalHabits, weekCompletion }`. This is the one small backend addition allowed in this phase — computing on the server keeps the frontend simple. If the user prefers no backend change, compute in the frontend from existing queries; ask them.

**Files touched.** `app/page.tsx`, `app/components/HabitRow.tsx`, `app/components/WeeklySummary.tsx`, `app/components/StatCard.tsx` (new), possibly `convex/habits.ts` (one added query).

**Acceptance criteria.**
- [ ] Dashboard matches the spec: header row, 3 stat cards, weekly summary card, today section with redesigned habit rows.
- [ ] Streak numbers render in Geist Mono, lime color.
- [ ] Progress bars animate smoothly (or at least render correctly) as values change.
- [ ] Two-window reactive test still passes.
- [ ] No console errors.
- [ ] All other pages (Habits, Log, Buddy, Summaries) still show their stub content.

**Gate.** User types `approve phase 5`.

---

## Phase 6 — Redesign the four subpages

**Scope.** Fill in real UI for `/habits`, `/log`, `/buddy`, `/summaries`. Each is a self-contained mini-spec below. Execute in order and stop for review between each subpage if the user asks; otherwise complete all four.

### 6a — `/habits`
- Page header: `<h1>Habits</h1>` + subtitle "Define the habits you're tracking."
- Two-column layout on desktop (`md:grid-cols-[1fr_320px] gap-6`), stacked on mobile:
  - Left: list of existing habits. Each is a `bg-surface border border-border rounded-lg p-4` row showing name, type badge, target, and a lucide `<Trash2>` icon button on the right that calls a new `deleteHabit` mutation.
  - Right: `<NewHabitForm />`, restyled with shadcn `<Input>`, `<Select>`, `<Button>` primitives, wrapped in a card.
- Backend addition: `convex/habits.ts::deleteHabit` mutation with `assertOwnsHabit` check. Also delete related logs.

### 6b — `/log`
- Page header: `<h1>Log today</h1>` + today's date in mono.
- One habit per full-width `bg-surface border border-border rounded-lg p-6` block, stacked vertically.
- Each block: habit name (large), current value / target (mono), and type-appropriate control:
  - **Numeric:** `<Input type="number">` plus `+` / `−` step buttons at the habit's natural increment (e.g. 100 for steps, 0.5 for hours).
  - **Duration:** same as numeric but with 0.5 hr steps.
  - **Boolean:** a single large `<Button>` that toggles between "Mark done" and "Done ✓" (lime background when done).
- Auto-save on change (already the case via `logHabit` upsert) — show a small "Saved" toast using shadcn `<Toast>` or a simple fading label.

### 6c — `/buddy`
- Two states, mutually exclusive:
  - **Not paired:** two cards side by side (or stacked on mobile):
    - "Generate an invite" card with a `<Button>` and, once clicked, the code displayed large in Geist Mono with a copy button (lucide `<Copy>`).
    - "Redeem a code" card with an `<Input>` and a `<Button>`.
  - **Paired:** a header showing "Paired with {buddy.name}" and a grid of the buddy's habits with today's ✅ / ⬜ status. Update live.
- Both states use `bg-surface border border-border rounded-lg p-6` cards.

### 6d — `/summaries`
- Page header: `<h1>Weekly summaries</h1>` + subtitle "Your AI coach's reflections."
- Backend addition: `convex/summaries.ts::listAllSummaries` query returning all summaries for the current user, sorted `desc` by `weekStart`.
- Render each summary as a `bg-surface border border-border rounded-lg p-6` card with:
  - Mono uppercase label: `WEEK OF {weekStart}`.
  - Body text in Geist Sans, leading-relaxed.
  - Buddy-violet `border-l-4 border-l-buddy` on the leftmost card (most recent), muted on older ones.
- Empty state: use a new `EmptyState.tsx` component with an icon (`<Sparkles />`), title "No summaries yet", description "Your first weekly summary will appear here after Sunday."

**EmptyState component (new):**
```tsx
export function EmptyState({ icon: Icon, title, description }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-16">
      <Icon className="mx-auto h-8 w-8 text-fg-muted" />
      <h3 className="mt-4 font-medium">{title}</h3>
      <p className="mt-1 text-sm text-fg-muted">{description}</p>
    </div>
  );
}
```

**Files touched.** 4 subpage `page.tsx` files, several component files under `app/components/`, `convex/habits.ts` (delete mutation), `convex/summaries.ts` (list query), `app/components/EmptyState.tsx` (new).

**Acceptance criteria (per subpage).**
- [ ] Page matches its spec above.
- [ ] All backend additions have ownership/auth checks where applicable.
- [ ] Reactive updates work: log a habit on `/log`, see the value update on `/` when navigating back (verify via two windows).
- [ ] Buddy pairing test: sign in as two GitHub accounts in two browsers, pair them, log a habit in one, see the ✅ appear on the other's `/buddy` page live.
- [ ] Empty states render correctly for pages with no data.
- [ ] Delete-habit confirmation dialog appears before deletion (use shadcn `<Dialog>`).

**Gate.** User types `approve phase 6`.

---

## Phase 7 — Polish

**Scope.** The final layer that makes it feel designed.

**Steps.**
1. **Loading states.** Everywhere `useQuery` returns `undefined`, render a skeleton or a subtle spinner instead of blank/"Loading...". Use a `<Skeleton>` component from shadcn or a plain `bg-surface animate-pulse rounded-lg h-N`.
2. **Toasts.** Add `sonner` (`npm install sonner`) or shadcn's toast. Fire toasts on: successful habit creation, successful habit deletion, buddy code copied, buddy paired.
3. **Mobile nav.** Below `md`, collapse the topbar nav into a lucide `<Menu>` hamburger that opens a full-screen sheet (shadcn `<Sheet>`). Sign-out button moves inside the sheet on mobile.
4. **Small animations.** Add `transition-colors` to nav links and buttons. Add a `transition-all duration-300` to progress bars so their width animates when values change.
5. **Favicon + metadata.** Update `app/layout.tsx` metadata: `title: "Streaks"`, `description: "A habit tracker with an accountability buddy, built on Convex."`. Add a simple favicon (single-color lime flame emoji-as-SVG is fine).
6. **README screenshot.** Take a screenshot of the redesigned dashboard, save as `docs/screenshot.png`, add to the README under a "Screenshots" heading.

**Files touched.** Many small edits across `app/components/` and `app/`, `package.json` (sonner), `docs/screenshot.png` (new), `README.md`.

**Acceptance criteria.**
- [ ] No blank flashes when navigating between pages — skeletons or existing content is always visible.
- [ ] Toasts appear for the four listed actions.
- [ ] Mobile viewport at 380px has a working hamburger menu; all pages usable.
- [ ] Progress bars animate smoothly.
- [ ] Favicon appears in the browser tab.
- [ ] README has a screenshot.

**Gate.** User types `approve phase 7`. Project is done.

---

## Rules for the executing agent

- **Never skip acceptance criteria.** If one fails, stop and explain what failed.
- **Never touch `convex/` files** except for the specific additions called out in Phases 5 and 6 (`dashboardStats`, `deleteHabit`, `listAllSummaries`). All other backend work is out of scope.
- **Never install packages not listed** in the phase steps.
- **Never redesign a page in an earlier phase than the one that owns it.** Phase 5 owns the dashboard; Phase 6 owns the subpages. Don't front-load work.
- **After each phase, print a summary** of what changed and wait for `approve phase N` before moving on.
- **If the user says `revise phase N`,** re-read the phase, apply the feedback, and re-verify acceptance criteria before requesting approval again.

---

## Quick reference — commands the executing agent will run

```bash
# Phase 1
npx shadcn@latest init
npm install geist lucide-react

# Phase 2
npx shadcn@latest add button card input select label dialog badge separator

# Phase 7
npm install sonner

# Verification (any phase)
npm run dev              # frontend
npx convex dev           # backend (keep running throughout)
```

---

## If the user wants Warm Journal instead of Neon Grid

Only Phase 1 changes. Replace the token table and font imports with:

- Tokens: `paper #FAF7F2`, `ink #1F1B16`, `ink-muted #6B6157`, `ember #C2410C` (accent), `moss #65A30D` (success), `rule #EDE6DC` (borders). No `dark` class on `<html>`.
- Fonts: **Fraunces** (serif, headings) and **Inter** (sans, body), both via `next/font/google`.
- Card style: white background, `rounded-2xl`, `shadow-sm`, warm off-white page bg.

All later phases execute identically — only the token names and a few classes differ.
