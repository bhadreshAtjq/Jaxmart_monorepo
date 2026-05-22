---
name: Industrial Integrity System
colors:
  surface: '#F6F8FB'
  surface-dim: '#C6D4E5'
  surface-bright: '#F6F8FB'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#F1F4F8'
  surface-container: '#EBF0F6'
  surface-container-high: '#E1E8F1'
  surface-container-highest: '#D7E1ED'
  on-surface: '#121358'
  on-surface-variant: '#4E5D78'
  inverse-surface: '#121358'
  inverse-on-surface: '#F6F8FB'
  outline: '#7B8C9F'
  outline-variant: '#D0D9E4'
  surface-tint: '#232F72'
  primary: '#232F72'
  on-primary: '#ffffff'
  primary-container: '#121358'
  on-primary-container: '#E8EAF6'
  inverse-primary: '#8FA4D6'
  secondary: '#36ADA3'
  on-secondary: '#ffffff'
  secondary-container: '#E3F5F3'
  on-secondary-container: '#165A54'
  tertiary: '#2F578A'
  on-tertiary: '#ffffff'
  tertiary-container: '#EEF2F6'
  on-tertiary-container: '#1E3A5F'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#E8EAF6'
  primary-fixed-dim: '#8FA4D6'
  on-primary-fixed: '#121358'
  on-primary-fixed-variant: '#232F72'
  secondary-fixed: '#E3F5F3'
  secondary-fixed-dim: '#85D3CB'
  on-secondary-fixed: '#0E3330'
  on-secondary-fixed-variant: '#165A54'
  tertiary-fixed: '#EEF2F6'
  tertiary-fixed-dim: '#A0B7D1'
  on-tertiary-fixed: '#102137'
  on-tertiary-fixed-variant: '#1E3A5F'
  background: '#F6F8FB'
  on-background: '#121358'
  surface-variant: '#EBF0F6'
typography:
  display-lg:
    fontFamily: Raleway
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Raleway
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Raleway
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Source Sans 3
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Source Sans 3
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Source Sans 3
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Source Sans 3
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin: 32px
  max-width: 1280px
---

## Brand & Style

This design system is built for the high-stakes world of B2B industrial technology. It balances the "Jade" (stability, value, growth) with the "Quest" (precision, discovery, forward movement). The brand personality is **authoritative yet accessible**, designed to evoke a sense of **unshakeable reliability and modern efficiency**.

The visual style is **Corporate / Modern** with a focus on **Precision Minimalism**. It uses a structured layout and high-quality typography to communicate professional rigor. While the base is clean and functional, the use of the emerald gradient provides a subtle nod to technological sophistication and "green" industrial futures. All remnants of energetic oranges are replaced by the steadying presence of deep navy and emerald.

## Colors

The palette is anchored by a premium Navy and Steel Blue light theme, utilizing **Deep Navy (#232F72 / #121358)** to provide an institutional weight suitable for B2B contracts, alongside **Steel Blue (#2F578A)** for functional components. The vibrant **Teal (#36ADA3)** serves as a key accent and secondary action indicator to represent modern tech, verification status, and dynamic brand highlights.

- **Primary:** Navy (#232F72) for primary headers, main structures, and critical navigation items.
- **Secondary / Accent:** Teal (#36ADA3) for active status chips, tags, input highlight focus, search accents, and verification badges.
- **Tertiary:** Steel Blue (#2F578A) for layout borders, secondary text, and scrollbars.
- **Backgrounds:** Clean, professional off-white/light blue surfaces (#F6F8FB) with low-contrast borders to maintain a spacious, modern, and structured B2B environment.

## Typography

The typography system relies on **Raleway** for headers/headlines to deliver an engineered and impactful brand feel, combined with **Source Sans 3** for body text and labels to ensure exceptional legibility in data-dense B2B applications.

Use high-contrast weights (SemiBold vs Regular) to establish hierarchy rather than relying solely on size or color.

## Layout & Spacing

The system uses a **Fixed Grid** model for desktop to ensure data visualizations remain readable and don't overstretch. 

- **Grid:** 12-column system with 24px gutters.
- **Rhythm:** An 8px linear scale (8, 16, 24, 32, 48, 64) governs all padding and margins.
- **Mobile:** Transitions to a 4-column fluid grid with 16px side margins. 
- **Content Density:** High density is preferred for dashboards, while marketing pages should utilize the 64px spacing increments to create "breathing room" between value propositions.

## Elevation & Depth

To maintain a professional, industrial look, this design system avoids heavy drop shadows. Instead, it uses **Tonal Layering** and **Low-Contrast Outlines**.

1.  **Level 0 (Background):** Slate-50 (#f8fafc) background.
2.  **Level 1 (Surface):** Pure White card surfaces with a 1px border of Slate-200.
3.  **Level 2 (Interaction):** Very soft, diffused shadows (0px 4px 12px rgba(30, 58, 138, 0.05)) are used only for active components like modals or dropdowns.

Depth is primarily signaled through color saturation rather than physical shadows—darker surfaces appear "closer" to the user.

## Shapes

The shape language is strictly defined by an **8px (0.5rem)** radius. This provides a "softened industrial" feel—enough to feel modern and user-friendly, but sharp enough to appear disciplined and architectural. 

- **Standard Buttons & Inputs:** 8px.
- **Cards & Modals:** 12px (rounded-lg) to accommodate nested 8px elements.
- **Chips:** Should use the 8px radius rather than a pill shape to maintain the professional, structured aesthetic.

## Components

### Buttons
- **Primary:** Gradient from Navy (#232F72) to Steel Blue (#2F578A) with white text, hovering to a slightly darker gradient (#1C265B to #244774) for a blue-dominant modern B2B action layout. 12px radius (rounded-xl).
- **Secondary:** Light Navy tint (#232F72/10) with Navy text and borders.
- **Success:** Solid Teal (#36ADA3) background with white text.

### Input Fields
- White background with a Slate-300 1px border. 
- On focus: Border changes to Navy, and a subtle 2px "ring" of Emerald-100 appears around the element.

### Cards
- White background, 1px Slate-200 border. No shadow unless hovered. 
- Titles should be in Navy to immediately anchor the user's eye.

### Chips & Badges
- Used for status indicators (e.g., "Active", "Pending"). 
- Use the 8px radius. 
- **Active status:** Emerald background with dark green text. **Draft status:** Light Navy background with Navy text.

### Data Tables
- Header row in light Slate-100 with Bold Navy text.
- Row separators in 1px Slate-100.
- Use JetBrains Mono for all numeric values to ensure column alignment.