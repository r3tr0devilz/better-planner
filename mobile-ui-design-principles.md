# Mobile UI Design Principles - Quick Reference

A working reference for designing mobile UI from scratch, distilled from a video on desktop-to-mobile design differences.

## Navigation

- Desktop sidebars don't translate to mobile - two main options:
  1. **Bottom bar** - consolidate sidebar links into a few key icons, often floating with the primary action broken out. Max 5 links, 3-4 is ideal.
  2. **Sidebar-as-homepage** - if too many important links exist, turn the sidebar into a full homepage instead (add recent items at top, actions/counts to the side so it isn't lopsided). This frees the bottom for a large search bar or action button (Notion-style).
- Maintain a minimum 44px tap target for all navigation elements (fat-finger rule).
- Top bar: bell icon + "more" menu is a safe default starting point.
- Navigation actions are contextual - they should change depending on the page/screen the user is on.

## Scale

- Don't assume smaller screen means smaller type/spacing - type scale often stays similar to desktop or gets larger.
- Reference: iOS base font size is 17px, macOS base is 13px.
- Accept that you can only fit a fraction of what a desktop dashboard shows (e.g. pick one of: action bar, gallery, calendar, tasks, scratchpad - not all of them).

## Content Layout

- Desktop dashboards can lay content out in two directions at once (rows and columns).
- Mobile sections should pick **one direction only** per section - either stack vertically or scroll horizontally off-page, never both.
- Four core building blocks for any mobile app screen:
  1. Cards
  2. Text/links
  3. Images
  4. Inputs
- Avoid double-nesting cards (card inside card) - it stacks padding on padding and cramps space. Prefer whitespace grouping instead of nested containers.

## One Screen, One Job

- Each screen should do exactly one thing (home screen is the main exception).
- Don't clutter a focused screen (e.g. a notes editor) with unrelated content (e.g. recent notes, suggested templates).
- To add new functionality, prefer a new page/sheet over cramming a new layout into the existing screen.

### Bottom Sheets

- Use bottom sheets when the user needs a secondary action without leaving context (e.g. picking a template while editing a note).
- Structure: title, search bar, confirm (check) and cancel (X) actions, list of options.
- Any height is fine. Keeps user in context, gesture-friendly.

### Plus Button Pattern

- A floating "+" button either opens a small action menu or jumps straight into an input/keyboard for immediate creation.

## Gestures

- **Swipe right** = go back. Smooth version: move current background left ~35% and animate the new screen in from the right simultaneously.
- **Bottom sheets**: zoom background out slightly as the sheet rises, zoom back in on dismiss.
- **Swipe up** = search (used by Slack, similar in Apple's UI).
- **Long press** = mobile equivalent of right-click. Typically blurs the rest of the screen, shows contextual actions, and slightly zooms the element. Can be elevated into a rich preview (iOS-style).
- Gestures can be relied on heavily as long as the user is taught/onboarded on how to use them.

## Dynamism (Contextual Actions)

- Actions/UI chrome should not be persistent everywhere - show and hide based on context.
- Example: entering a note editor hides the navbar and reveals note-specific actions (text formatting, sharing).
- Example: a template picker sheet reduces UI down to just what's needed (confirm + cancel).
- Animate these transitions in/out deliberately - it's a core part of perceived polish.

## Empty States

- Design for the *first-use* state, not just the ideal, fully-populated state.
- First-use empty state: draw attention to the primary action (e.g. the plus button), use a full-screen empty state, add a simple popover/tooltip explaining how it works. Avoid pre-filling with "start adding X, Y, Z" cards.
- Search/no-results empty state: needs supporting imagery, a clear acknowledgment that no results matched the query, optional suggestions (e.g. for typos), and an action to exit/reset the empty state.

## Quick Checklist When Starting a New Mobile Screen

- [ ] What is the single job of this screen?
- [ ] Bottom bar or full-page nav pattern - which fits this app?
- [ ] Are tap targets >= 44px?
- [ ] Is type scale actually mobile-appropriate (not just shrunk desktop)?
- [ ] Does each section scroll in only one direction?
- [ ] Any double-nested cards to flatten?
- [ ] Does this need a bottom sheet instead of a new full page?
- [ ] What gestures are relevant here, and are they discoverable/onboarded?
- [ ] Which chrome/actions should hide or change on this screen?
- [ ] Have I designed the empty state (first-use and no-results)?
