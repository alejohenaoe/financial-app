# Premium Mobile Design System — Principles & Patterns

A reusable, app-agnostic guide to building modern, Apple-inspired mobile-first interfaces that feel fast, calm, and native. Use this as a north star for any product, not just one app.

## 1. Design Philosophy

- Clarity over decoration. Every element earns its place. Remove anything that doesn't help the user act or understand.
- Content first. The interface recedes; data and actions lead. Chrome is quiet, content is loud.
- Speed is a feature. Interactions feel instant. Prefer optimistic UI, short transitions, and immediate feedback.
- Depth through subtlety. Hierarchy comes from spacing, weight, and soft shadows — not heavy borders or saturated blocks.
- Familiar, not novel. Lean on native platform conventions (iOS/Material) so users never have to learn your UI.
- One idea per screen. Each view has a single primary job and a single primary action.

## 2. Layout & Structure

### Mobile-first canvas

- Design for a single column, ~390–440px wide.
- On larger screens, center the app in a phone-shaped frame with generous margins rather than stretching content.
- Respect safe areas (notch, home indicator) with env(safe-area-inset-*).

### The three-zone shell

- Header — sticky, translucent, blurred background. Large title on primary screens; compact title with a back affordance on detail screens.
- Scrollable content — the main work area; hide scrollbars for a native feel.
- Bottom navigation — 3–5 top-level destinations, always reachable, with an active-state pill/highlight.

### Grouping

- Group related rows into cards with rounded corners and a subtle shadow.
- Precede each group with a small, uppercase, muted section label (iOS "grouped list" style).
- Separate rows within a card with hairline dividers, not gaps.

### Whitespace

- Be generous. Whitespace is the primary tool for hierarchy and calm.
- Use a consistent spacing scale (e.g. 4 / 8 / 12 / 16 / 20 / 24 px).
- Let breathing room, not lines, define regions.

## 3. Color System

### Principles

- Light mode by default, with a fully considered dark mode.
- Use a neutral grayscale foundation so accents and semantic colors stand out.
- Define all colors as semantic tokens (e.g. background, foreground, card, primary, muted, border) — never hardcode raw hex in components.
- Prefer a perceptually uniform color space (OKLCH) so light/dark variants and mixes stay balanced.

### Recommended token roles

- background / foreground — App canvas and default text
- card / card-foreground — Grouped surfaces and their text
- primary / primary-foreground — Brand accent + text on it
- secondary / muted — Quiet fills and de-emphasized surfaces
- muted-foreground — Secondary/label text
- border / input / ring — Hairlines, fields, focus rings
- destructive — Dangerous actions

### Semantic status colors

- Green = positive / income / success.
- Red = negative / expense / danger.
- Give each a solid tone plus a muted tint for backgrounds/badges.
- Keep everything else neutral so status colors read instantly.

### Contrast

- Meet WCAG AA for text in both themes.
- Verify accents on both light and dark surfaces before shipping.

## 4. Typography

- System font stack for a native feel and zero load cost (-apple-system, "SF Pro Display", "Segoe UI", Roboto, ...).
- Large, bold titles (28–34px) on primary screens; tight letter-spacing (~-0.02em) for a refined look.
- Clear scale: Large Title → Section Title → Body → Caption/Label.
- Body text ~15–17px for comfortable reading.
- Labels/captions ~11–13px, often uppercase and muted for group headers.
- Use weight (regular / medium / semibold / bold), not many sizes, to signal hierarchy.
- Use tabular figures for numbers, currency, and any aligned data.

## 5. Shape, Elevation & Materials

### Corners

- Soft, rounded corners everywhere. Define a radius scale and derive component radii from a base token (e.g. cards ~16–24px, buttons ~12–16px, pills full).
- Larger surfaces get larger radii; keep it consistent.

### Shadows

- Subtle and layered. Combine a tight contact shadow with a soft, wide ambient shadow. Avoid harsh, single-offset drop shadows.
- Reserve stronger elevation for floating elements (sheets, FABs, dialogs).
- Suggested tiers: card (resting), nav (bottom bar, upward), float (modals/overlays).

### Translucency

- Use frosted/blurred backgrounds (backdrop-blur) on headers and nav bars so content subtly shows through — a hallmark of native iOS depth.

## 6. Motion & Transitions

- Purposeful, quick, smooth. Most transitions land in 200–320ms.
- Use ease-out / spring-like curves (e.g. cubic-bezier(0.22, 1, 0.36, 1)) for a natural, decelerating feel.
- Animate transforms and opacity (cheap, GPU-friendly); avoid animating layout.
- Provide feedback on every touch: press states, ripples, or scale-downs.
- Support gestures where natural (swipe-to-delete, swipe-back, pull actions).
- Respect prefers-reduced-motion — reduce or remove non-essential animation.

## 7. Component Patterns

Build a small set of reusable, composable primitives:

- Page header — sticky, blurred; large-title and compact-with-back variants.
- Bottom tab bar — icon + label, active pill, safe-area padding.
- Grouped list / card — rounded container, section label, hairline rows.
- List row — leading icon avatar, title, trailing value/chevron; tappable.
- Swipe row — reveals contextual actions (edit/delete) on horizontal drag.
- Category / icon avatar — colored circular badge encoding a category.
- Bottom sheet / drawer — for create/edit forms and secondary actions.
- Segmented control & tabs — switch views without leaving the screen.
- Buttons — primary (filled accent), secondary (muted fill), destructive, and ghost/text variants.
- Inputs & selects — large tap targets, clear focus rings, inline validation.
- Keep components stateless where possible and drive them with tokens so theming is automatic.

## 8. Interaction Principles

- Everything actionable is obvious and tappable. Cards, rows, and buttons all lead somewhere.
- Minimum 44×44px tap targets.
- Every list item opens a detail view; details support edit and delete.
- Confirm destructive actions with a dialog; make the safe choice the default.
- Give immediate feedback via toasts/snackbars for success and errors.
- Navigate, don't reload. Client-side transitions keep context and speed.

## 9. State Design (Don't skip these)

- Empty states — friendly illustration/icon, one line of guidance, and a clear call-to-action to add the first item.
- Loading states — skeletons that mirror final layout (preferred) or subtle spinners; never a blank screen.
- Error states — plain-language message plus a retry action.
- Success feedback — brief, non-blocking confirmation.
- Edge cases — long text truncates gracefully; large numbers stay aligned; zero/negative values read clearly.

## 10. Accessibility

- Sufficient color contrast in both themes.
- Never rely on color alone — pair status color with icon, sign, or label.
- Full keyboard/focus support with visible focus rings.
- Semantic roles and ARIA labels on interactive elements.
- Honor system settings: dark mode, reduced motion, larger text.

## 11. Quality Checklist

- Single primary action per screen
- Consistent spacing scale applied
- All colors from semantic tokens (no raw hex in components)
- Light and dark modes both verified
- Rounded corners and shadows consistent across components
- Transitions ≤ ~320ms with ease-out/spring curves
- Tap targets ≥ 44px
- Empty, loading, and error states designed
- Destructive actions confirmed
- Tabular numerals for all aligned data
- Safe areas respected
- prefers-reduced-motion handled

A design system is a set of shared decisions. Keep the decisions few, make them consistent, and let restraint do the heavy lifting.