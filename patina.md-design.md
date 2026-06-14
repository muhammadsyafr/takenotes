---
version: alpha
name: Patina Calm UI
description: A soft, airy product system with a trustworthy blue accent, rounded cards, and spacious editorial hierarchy.
colors:
  primary: "#0A94F5"
  secondary: "#5F7690"
  tertiary: "#DCE7F1"
  neutral: "#F6F6F7"
  surface: "#FFFFFF"
  on-surface: "#0A3350"
  error: "#E25555"
  border: "#00000014"
  muted: "#9AA6B2"
typography:
  headline-display:
    fontFamily: Manrope
    fontSize: 76px
    fontWeight: 600
    lineHeight: 85.12px
    letterSpacing: -2.66px
  headline-lg:
    fontFamily: Manrope
    fontSize: 51px
    fontWeight: 600
    lineHeight: 61px
    letterSpacing: 0px
  headline-md:
    fontFamily: Manrope
    fontSize: 35px
    fontWeight: 600
    lineHeight: 42px
    letterSpacing: 0px
  headline-sm:
    fontFamily: -apple-system
    fontSize: 24px
    fontWeight: 600
    lineHeight: 24.4px
    letterSpacing: 0px
  body-lg:
    fontFamily: General Sans
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0px
  body-md:
    fontFamily: General Sans
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: 0px
  body-sm:
    fontFamily: General Sans
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0px
  label-lg:
    fontFamily: General Sans
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0px
  label-md:
    fontFamily: General Sans
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0px
  label-sm:
    fontFamily: General Sans
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0px
  caption:
    fontFamily: General Sans
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0.02em
rounded:
  none: 0px
  sm: 12px
  md: 22px
  lg: 30px
  xl: 999px
  full: 9999px
spacing:
  xs: 2px
  sm: 12px
  md: 20px
  lg: 28px
  xl: 66px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.full}"
    padding: "18px 42px"
    minHeight: "57px"
    minWidth: "184px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "#111111"
    typography: "{typography.body-lg}"
    rounded: "{rounded.md}"
    padding: "18px 42px"
    minHeight: "57px"
    minWidth: "184px"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: "0px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "#111111"
    rounded: "{rounded.lg}"
    padding: "24px"
    size: "auto"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "14px 16px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "10px 16px"
---

# Patina Calm UI

## Overview
Patina feels like a quiet personal assistant: polished, reassuring, and intentionally low-noise. The visual tone is airy and spacious, with soft surfaces and a restrained blue accent that gives the product a modern, trustworthy feel. It is aimed at people who want clarity and gentle prioritization rather than dense, high-energy dashboards.

## Colors
- **Primary (#0A94F5):** A vivid, approachable blue used for the main call to action, active accents, and moments that should feel clickable and alive.
- **Secondary (#5F7690):** A muted slate-blue for supportive text and secondary hierarchy when the brand color would be too strong.
- **Tertiary (#DCE7F1):** A pale cool tint that works well for subtle highlights, soft backgrounds, and calm informational separation.
- **Neutral (#F6F6F7):** The dominant page wash, creating the bright, breathable backdrop that defines the interface.
- **Surface (#FFFFFF):** The card and control surface color; it keeps content crisp and layered above the neutral canvas.
- **On-surface (#0A3350):** A deep navy text color used for headlines and body copy to maintain strong contrast without looking harsh.
- **Border (#00000014):** A nearly invisible hairline border that adds structure to cards and controls without introducing visual weight.
- **Muted (#9AA6B2):** A soft gray-blue for timestamps, helper text, and low-priority UI detail.
- **Error (#E25555):** A warm alert red for destructive or invalid states; it should remain sparingly used.

## Typography
Headlines use Manrope with a confident 600 weight, giving the brand its rounded, editorial presence. The display hierarchy is large and expressive: `headline-display` is used for the hero message, while `headline-lg`, `headline-md`, and `headline-sm` step down cleanly for app sections and card titles.

Body and label text rely on General Sans at 500 weight, which keeps the interface feeling contemporary and slightly conversational. `body-md` and `body-sm` should handle most content and supporting copy, while `label-sm` and `caption` are best for chips, timestamps, and metadata. Letter spacing is generally tight and neutral; only very small captions may benefit from a subtle positive spacing for clarity.

## Layout & Spacing
The layout is centered and intentionally generous, with a large hero area above a wide application preview. Content is organized in a fixed, presentation-style frame rather than a dense responsive grid, which helps the product feel calm and focused. The spacing system is modest and rhythmic: `2px`, `12px`, `20px`, `28px`, and `66px` create a progression from tight internal gaps to large section breathing room.

Sections should use ample vertical padding and avoid crowding around primary actions. Cards sit on soft offsets with consistent internal padding around `24px`, and controls should maintain comfortable touch targets with clear separation. The overall convention is “few, larger blocks” instead of many small fragments.

## Elevation & Depth
Depth is subtle and mostly achieved through shadows, borders, and tonal contrast rather than dramatic layering. Cards use a faint border with a soft shadow to lift them off the pale background, while the hero and page wash remain nearly flat. The result is a gentle, modern depth model that feels premium without becoming glossy.

Use shadow sparingly and keep it soft; the interface should never feel heavily stacked or busy. Where possible, prefer white surfaces on the neutral canvas and use the border token for definition instead of stronger outlines.

## Shapes
The shape language is rounded and friendly, with pill buttons and generously curved cards. Large radii create a smooth, approachable feel that matches the calm assistant concept. Interactive elements should lean toward soft geometry rather than sharp corners, with the `full` radius reserved for primary actions and chips.

## Components
Buttons are highly rounded and airy. `button-primary` is the main action style: blue background, white text, 18px/42px padding, and a minimum height of 57px. It should feel prominent but not heavy. `button-secondary` uses a white surface, dark text, and a soft rounded rectangle shape for less important actions. `button-link` is minimal and text-only, suitable for inline navigation or secondary actions.

Cards should use the `card` style: white background, a 1px translucent border, `rounded.lg`, and `24px` padding. Card content should be calm and content-first, with strong typographic hierarchy and very limited decoration. Cards may contain compact headers, date tiles, summary panels, and small metadata rows.

Inputs should follow the same calm surface treatment as cards, with soft rounding and clear focus states. They should read as embedded controls rather than loud form fields. Chips should be pill-shaped, lightly bordered or surface-based, and sized for short prompts or suggestions; keep their typography small and readable.

Lists, menus, and sidebar rows should remain understated, using spacing and light background states instead of heavy dividers. Selected states can be suggested with a faint fill or subtle contrast shift. Icons should stay thin and simple so they do not compete with the large text blocks.

## Do's and Don'ts
- Do keep large areas of negative space around hero content and primary actions.
- Do use Manrope for headings and General Sans for body, labels, and UI controls.
- Do rely on white cards and subtle borders to create depth.
- Do keep buttons rounded and generously padded for a calm, touch-friendly feel.
- Don't introduce saturated secondary colors that compete with the primary blue.
- Don't use heavy shadows, hard outlines, or sharp-cornered UI unless absolutely necessary.
- Don't crowd cards with dense content; favor short summaries and clear hierarchy.
- Don't mix inconsistent type families or weights across similar elements.