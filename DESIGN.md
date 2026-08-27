---
name: Better Planner
description: A warm, paper-and-ink personal ledger for tasks, routines, projects, and everything else worth tracking.
colors:
  panel: "#fdf8ec"
  stone: "#e9e0cf"
  line: "#b8b3a6"
  ink: "#14130f"
  ink-faint: "#625f59"
  oxblood: "#7a2330"
  cobalt: "#1e3ae0"
  vermillion: "#b33618"
  moss: "#276b4d"
  mustard: "#b8790f"
  plum: "#7a3466"
  teal: "#157a7a"
typography:
  display:
    fontFamily: "Archivo, Arial, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Archivo, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.05em"
rounded:
  flat: "0px"
  sm: "8px"
  md: "10px"
  full: "999px"
components:
  button-primary:
    backgroundColor: "{colors.oxblood}"
    textColor: "{colors.panel}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 1rem"
  button-outline:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 1rem"
  card:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.md}"
    padding: "1rem"
  field:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 0.75rem"
---

# Design System: Better Planner

## Overview

**Creative North Star: "The Desk Ledger"**

Better Planner reads as a well-used ledger book left open on a desk, not a piece of software. Cream paper (`panel`) sits on a slightly darker stone tabletop (`stone`); near-black ink (`ink`) does the writing; and exactly one accent — oxblood, a deep ledger-red — gets to act like a stamp, marking only what actually needs the user's attention (a call to action, a focused field, an active nav state). Six more colors exist purely as filing colors: each life domain is assigned one and it shows up everywhere that domain needs to be told apart from another — a tab on the binder rail, a flag tacked to a card, a dot next to a row — the same way colored folder tabs work in a physical filing system. Nothing here is decorative; every color, border, and shadow is doing an identification job.

The system is quiet and disciplined on purpose. It carries no gradients, no glassmorphism, no glowing surfaces, and no "AI product" sheen — that entire register is the confirmed anti-reference. Numbers and metadata (timestamps, percentages, streak counts, tab captions) are set in JetBrains Mono, uppercase, letter-spaced, so they read like a stamped or typewritten ledger entry rather than app UI chrome. Headlines are bold, uppercase, tight-tracked Archivo, present only where a screen needs to announce what it is. Everything else is quiet, dense, and built to be scanned dozens of times a day without ceremony.

A second, load-bearing rule sits underneath the palette: the app deliberately splits its corners into two families. Functional controls the user touches — buttons, fields, cards — get a soft radius, because they're meant to feel like usable objects. Physical-artifact elements — binder tabs, card flags, the ledger's own rule-lines, progress bars — stay perfectly sharp, because they're meant to feel like paper and ink, not UI chrome. The one deliberate exception is the mini calendar's day marker, which goes fully circular, borrowing the read of a rubber date-stamp.

**Key Characteristics:**
- Warm cream-on-stone paper surfaces with near-black ink text; no dark mode, no gradients, no glass.
- One accent (oxblood) reserved exclusively for call-to-action, focus, and active states — never for identity or decoration.
- Six domain colors act as a filing-tab system, cycling consistently across tabs, card flags, and row markers.
- JetBrains Mono, uppercase and letter-spaced, exclusively for numbers, timestamps, and stamped labels; Archivo for everything else.
- A hard split between soft-radius functional controls and sharp-edged "paper" artifacts, with one circular exception (the date stamp).
- Ledger rule-lines replace nested cards as the list pattern — rows are divided by a line, never boxed inside another box.

## Colors

The palette reads as a warm study-lamp scene: cream paper, a stone desk, ink, and a single wax-seal red. Domain colors are pulled in only where a specific life area needs to be told apart from another.

### Primary
- **Oxblood** (`#7a2330`): The one accent in the entire system. Used only for primary buttons, focus rings, the active bottom-nav icon, streak badges, and the "top three" sparkle mark. Never used to identify a domain — that job belongs to the thread palette below, so the two kinds of color never compete for the same meaning.

### Secondary — Domain Thread Palette
Six colors, cycled by index across every domain a user creates. The same domain always maps to the same color (tab, flag, row dot) as long as domain order is stable.
- **Cobalt** (`#1e3ae0`): Thread 0.
- **Vermillion** (`#b33618`): Thread 1. Doubles as the fixed danger/overdue/high-priority signal everywhere in the app (task priority dots, "needs a look" slipping-project warnings, form errors) — when it appears outside the thread rail, it always means "something is wrong or late," never "this is domain N." Darkened from an earlier `#e0431e` to clear WCAG AA text contrast (5.73:1 on panel, 4.64:1 on stone) since this color is used as text, not just fills/dots.
- **Moss** (`#276b4d`): Thread 2. Also the fixed color for every native checkbox (`accent-moss`) — completion state is always moss, regardless of which domain the item belongs to, so "done" reads the same everywhere.
- **Mustard** (`#b8790f`): Thread 3. Also the fixed medium-priority signal on task rows.
- **Plum** (`#7a3466`): Thread 4.
- **Teal** (`#157a7a`): Thread 5.

### Neutral
- **Panel** (`#fdf8ec`): The paper. Background for every card, field, modal, and input — the surface things are "written on."
- **Stone** (`#e9e0cf`): The desk. Page background, and the hover/active fill for outline buttons and nav rows — always sits just behind panel, never in front of it.
- **Line** (`#b8b3a6`): Every border and ledger rule-line.
- **Ink** (`#14130f`): Primary text and the strongest borders (card outlines, the top rule of a ledger, button/tab borders).
- **Ink Faint** (`#625f59`): Secondary text — timestamps, section labels, placeholder copy, inactive nav.

### Named Rules
**The One Accent Rule.** Oxblood is the only color allowed to mean "act here." If a new interactive state needs color, reach for stone (hover), ink (default), or a semantic override (vermillion for danger, moss for done) before ever reusing oxblood for something that isn't a call to action.

**The Thread Rule.** The six domain colors identify *which domain*, and nothing else. Priority, danger, and completion state borrow individual thread colors (vermillion, mustard, moss) as fixed semantic meanings — but a thread color never appears assigned to two different meanings on the same screen.

## Typography

**Display/Body Font:** Archivo (with Arial, sans-serif fallback) — one family carrying both roles via its weight axis (400/500/600 for body, 500/700/900 for display), rather than pairing two separate typefaces.
**Label/Mono Font:** JetBrains Mono (with monospace fallback).

**Character:** A single confident grotesque doing all the talking, with monospace reserved as a second voice for anything numeric or stamped — the contrast between the two is the entire typographic system.

### Hierarchy
- **Display** (700–900 weight, 1.875–3rem depending on context, tight/leading-none): Page titles and section-defining numbers. Always uppercase, always tight-tracked. The heaviest weight (900/"black") is reserved for the big stat digits on the Today dashboard (top-three count, open-task count, routines-done count) — a number that size is meant to be read before anything else on the page.
- **Body** (400–600 weight, 0.875rem, normal case): All row text, form labels, buttons, and section sub-headers ("Top three today," "Open tasks"). Section sub-headers use medium weight (500) at 0.875rem in ink-faint rather than promoting to the display face — they're wayfinding, not headlines.
- **Label** (600 weight, 0.6–0.75rem, uppercase, 0.04–0.06em tracking): Timestamps, percentages, streak counts, tab captions, card-flag text, status-select values. This is the "stamped ledger entry" voice — it never appears in a paragraph, only as a short, isolated piece of metadata.

### Named Rules
**The Two-Voice Rule.** Archivo speaks for structure and identity (titles, buttons, body copy); JetBrains Mono speaks for data (numbers, dates, statuses). A string never switches faces mid-sentence, and mono is never used for anything a user would call "content."

## Layout

Desktop is a fixed 224px (`w-56`) left sidebar (logo, primary+secondary nav, the Capture control anchored at the bottom) plus a binder-tab rail (one vertical, rotated tab per domain, hidden below `md`) running down the inside edge of the content column, with content itself centered in a `max-w-5xl` column. Mobile collapses the sidebar into a sticky top bar (logo + Capture) and adds a fixed bottom tab bar (four primary destinations plus a "More" overflow) — the binder-tab rail disappears entirely rather than trying to compress, per the rule that a fixed vertical strip has nowhere sensible to go on a narrow viewport.

Content grids favor one clear asymmetric split over a balanced one: the Today dashboard runs `1.4fr / 1fr` at `lg` (primary lists left, secondary/glanceable cards right), collapsing to a single stacked column below that. Card grids (e.g. the top-three row) use a simple `sm:grid-cols-3`. Spacing follows Tailwind's default scale directly — no custom spacing tokens are defined — with `gap-3`–`gap-4` inside a component, `gap-6`–`gap-8` between sections, and `px-4 py-3` (mobile) / `px-8 py-8` (desktop) as the page-edge padding.

Lists never nest cards inside cards. A `.ledger` container (a 3px ink top rule) holds `.ledger-row` children separated by a single 1px line, with no border on the last row — this is the list primitive used everywhere a scrollable set of tasks, routines, or checklist items appears, deliberately replacing the "card inside a card" pattern that stacks padding on padding.

## Elevation & Depth

The system is almost entirely flat. Depth comes from the ink/line borders and the panel-on-stone color step, not from shadow. The one shadow that exists is a soft, ambient double-shadow on `.card` (`0 1px 2px rgba(20,19,15,0.06), 0 6px 20px rgba(20,19,15,0.06)`) — just enough to read as a sheet of paper resting slightly off the desk, never a directional or "lifted" effect. Buttons get an even quieter version of the same shadow (`0 1px 2px rgba(20,19,15,0.14)`) purely to keep them from looking pasted flat onto the page; it disappears entirely on disabled buttons.

### Shadow Vocabulary
- **Paper lift** (`box-shadow: 0 1px 2px rgba(20,19,15,0.06), 0 6px 20px rgba(20,19,15,0.06)`): Cards, modals. Ambient, not directional — always present, never a hover/active response.
- **Button lift** (`box-shadow: 0 1px 2px rgba(20,19,15,0.14)`): Enabled buttons only, both variants.
- **Focus ring** (`box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-oxblood) 18–40%, transparent)`): Fields and buttons on `:focus-visible`. The only *at-rest-family* shadow that responds to state.
- **Drag lift** (`box-shadow: 0 14px 30px rgba(20,19,15,0.32)`, paired with a slight rotate+scale): The one exception to the ceiling below, used only on the calendar task card actively being dragged. A card genuinely lifted off the desk into your hand casts a bigger, darker shadow than one resting on it — this is that moment, and it ends the instant the card is dropped back down.

### Named Rules
**The Paper-Not-Glass Rule.** At-rest shadows are soft, low-opacity, and ambient — they simulate paper sitting on a desk, never glass, plastic, or a floating panel. No at-rest shadow exceeds 20px of blur or 14% opacity; only the transient Drag Lift state is allowed past that ceiling, and only for as long as the item is actually being dragged.

## Shapes

Two corner families, used to keep "thing you touch" and "thing that's paper" visually distinct at a glance. **Soft** (8px on fields and buttons, 10px on cards) marks a functional control. **Flat** (0px) marks a physical-artifact element: binder tabs, card-flags, ledger rule-lines, milestone progress bars, and the day-card's own outer corners (which round only on the side away from its colored spine, `0 8px 8px 0`, so the spine itself reads as a cut edge). The single break from both families is the mini-calendar day marker, which is fully circular (`border-radius: 999px`) — a deliberate "rubber stamp" read for today's date.

### Named Rules
**The Touch-vs-Paper Rule.** If a corner needs rounding, ask first whether the element is something the user interacts with (round it, 8–10px) or something that represents a physical ledger artifact (leave it sharp). Don't split the difference with a small "safe" radius on either side.

## Components

### Buttons
- **Shape:** 8px radius, 1px solid border (`ink` for primary/outline alike).
- **Primary** (`.btn`): Oxblood fill, panel text, `0.5rem 1rem` padding. The only button color allowed in the system for a genuine call-to-action (Save, Add, Sign in).
- **Outline** (`.btn-outline`): Panel fill, ink text, ink border. Used for every secondary action (Voice toggle, milestone +/-, cancel-adjacent actions).
- **Hover / Focus:** Primary dims to 92% opacity on hover; outline fills to stone on hover. Both get the oxblood focus-ring on `:focus-visible` and scale to 97% on `:active` — every press gets the same tactile squash regardless of variant.
- **Disabled:** 45% opacity, cursor `not-allowed`, shadow removed entirely (a disabled button should not look liftable).

### Cards
- **Corner Style:** 10px radius.
- **Background:** Panel, 1px line border.
- **Shadow Strategy:** Paper Lift (see Elevation & Depth) — constant, not stateful.
- **Card Flag** (signature): A sharp-cornered oxblood/thread-colored tab protruding `-0.85rem` above the card's top edge, carrying the domain name in mono/uppercase/label type. Stands in for a full border-color treatment wherever a card needs to announce its domain without room for a persistent border.

### Inputs / Fields
- **Style:** Panel background, 1px line border, 8px radius, `0.5rem 0.75rem` padding, inherited font.
- **Focus:** Border shifts to oxblood plus the oxblood focus-ring glow — the only state change, no layout shift.
- **Grouping:** `.field-row` lays labeled fields out with `flex-wrap` and per-field width hints (`.field-wide`, `.field-narrow`) so a native `<select>` never forces its column wider than its siblings.
- **Native controls kept native:** Checkboxes and selects are real `<input>`/`<select>` elements (tinted via `accent-moss` / the shared `.field` class), not custom-built widgets — the system leans on the browser's own controls rather than reskinning every primitive.

### Chips / Badges
- **Streak badge:** A sharp-edged oxblood-bordered rectangle, oxblood mono text, `{n}d streak` — appears only when a routine's streak is greater than zero.
- **Thread mark:** A 2px-radius, 12px square dot in the row's domain color with a slightly darkened border (`color-mix` 70% toward black) — the smallest unit of domain identification, used on dense rows where a full flag or tab would be too heavy.
- **Priority dot:** A 6px circular dot — vermillion (high), mustard (medium), ink-faint (low) — next to a task's checkbox.

### Navigation
- **Desktop sidebar:** Fixed 224px column, logo at top (display face, uppercase), nav links in body face with an icon (16px, lucide-react) and label; active state is a stone background fill, inactive is ink-faint text that darkens to ink on hover.
- **Binder tabs** (signature, desktop-only): One vertical tab per domain, `writing-mode: vertical-rl` and rotated 180°, filled with the domain's thread color, mono/uppercase caption, ink border on three sides (no left border, so it reads as protruding from the content column). Hover scales to 104% and brightens; active/press scales to 96%.
- **Mobile top bar:** Sticky, logo + Capture control only.
- **Mobile bottom nav:** Fixed, four primary destinations (icon 20px + 11px label) plus a "More" overflow; active state is oxblood, inactive is ink-faint — the only nav surface where oxblood, not stone, marks the active state.

### Modals
- Centered, top-anchored (`pt-24`) over an ink/40%-opacity backdrop; panel is a `.card` at `max-w-lg`. Entrance is a CSS `@starting-style` fade+scale (backdrop 0→1 opacity, panel 0.96→1 scale, both ≤180ms ease-out) — no JS-driven animation library. Every modal closes on Escape, backdrop click, or an explicit `X` button in the header.

### Capture Bar (signature component)
The system's single most load-bearing custom component. A `.btn`-styled "Capture" trigger (with a visible `⌘J` / `⊞J` kbd hint) opens a modal offering two entry paths side by side: a free-text field and a Web Speech API voice toggle (mic → recording square, live-transcribing into the same field). Submission posts to the AI parser and reports back a one-line confirmation (moss text) or error (vermillion text) inside the same modal before auto-closing. This is the physical embodiment of the product's "frictionless capture" positioning — it must stay the fastest possible path from thought to filed item, on every screen, on every device.

### Top-Three Sparkle (signature icon)
A custom two-layer SVG sparkle (not the stock Lucide star) marks a task as one of the day's top three: a full oxblood sparkle with a smaller mustard sparkle offset at its center. Unstarred state falls back to the plain outlined Lucide `Sparkle` icon in ink-faint. Toggling scales the icon to 90% on press for tactile feedback, matching every other pressable element in the system.

## Do's and Don'ts

### Do:
- **Do** keep oxblood exclusive to CTA/focus/active — see The One Accent Rule.
- **Do** assign each domain a thread color by stable index and reuse it identically across tabs, flags, and row dots — see The Thread Rule.
- **Do** set every number, timestamp, percentage, and status value in JetBrains Mono, uppercase, letter-spaced — see The Two-Voice Rule.
- **Do** use ledger rule-lines (`.ledger` / `.ledger-row`) for any list of rows; never wrap a list item in its own card.
- **Do** round functional controls (buttons, fields, cards) and leave physical-artifact elements (tabs, flags, progress bars, ledger rules) sharp — see The Touch-vs-Paper Rule.
- **Do** keep native `<input>`/`<select>`/checkbox elements native, styled via `.field`/`accent-*` rather than rebuilt as custom widgets.
- **Do** give every pressable element the same feedback contract: scale-to-97%-on-active, an oxblood focus-visible ring, and (where relevant) a hover state — consistency of feel matters more than per-component novelty.

### Don't:
- **Don't** introduce gradients, glassmorphism, glow, or any "AI product" sheen — the confirmed anti-reference is a generic glassy/gradient SaaS dashboard, and it does not belong anywhere in this system.
- **Don't** reuse a thread color for a second meaning on the same screen, or reuse oxblood for domain identity — colors carry exactly one meaning each.
- **Don't** exceed the Paper-Not-Glass shadow ceiling (20px blur / 14% opacity) on anything at rest — a heavier shadow reads as glass or plastic, not paper. The one named exception is Drag Lift, and only while the drag is live.
- **Don't** nest a card inside a card. If two pieces of content need separation inside one container, use a ledger rule-line or plain whitespace, not a second `.card`.
- **Don't** promote a section sub-header (e.g. "Top three today") to the display face — that hierarchy is reserved for page titles and the dashboard's headline stat numbers.
