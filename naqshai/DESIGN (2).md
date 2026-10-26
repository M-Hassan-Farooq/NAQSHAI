---
name: NAQSHAI
colors:
  surface: '#0c1324'
  surface-dim: '#0c1324'
  surface-bright: '#33394c'
  surface-container-lowest: '#070d1f'
  surface-container-low: '#151b2d'
  surface-container: '#191f31'
  surface-container-high: '#23293c'
  surface-container-highest: '#2e3447'
  on-surface: '#dce1fb'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#dce1fb'
  inverse-on-surface: '#2a3043'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#5de6ff'
  on-secondary: '#00363e'
  secondary-container: '#00cbe6'
  on-secondary-container: '#00515d'
  tertiary: '#ffb3af'
  on-tertiary: '#650911'
  tertiary-container: '#fc7c78'
  on-tertiary-container: '#711419'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#a2eeff'
  secondary-fixed-dim: '#2fd9f4'
  on-secondary-fixed: '#001f25'
  on-secondary-fixed-variant: '#004e5a'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3af'
  on-tertiary-fixed: '#410005'
  on-tertiary-fixed-variant: '#842225'
  background: '#0c1324'
  on-background: '#dce1fb'
  surface-variant: '#2e3447'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.08em
  mono-data:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  grid-margin: 24px
  gutter: 16px
  panel-padding: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system for this platform focuses on high-precision geospatial discovery and land analytics. The brand personality is authoritative, tech-forward, and sophisticated, catering to investors and developers navigating the Pakistani real estate landscape.

The visual style is **Glassmorphic Minimalism**. It utilizes a deep, nocturnal foundation to allow data layers and map elements to recede or advance through luminance rather than color. High-fidelity visuals are achieved through semi-transparent surfaces, background blurs, and razor-sharp 1px "micro-borders" that simulate an advanced heads-up display (HUD). The emotional response should be one of "total clarity" and "computational trust."

## Colors
The palette is built on a "Deep Sea" foundation to maximize the "glow" effect of data visualizations.

*   **Foundation:** The base is Slate-950 (#020617), providing a near-black canvas that eliminates visual noise.
*   **Primary (Emerald-500):** Used for actionable items, active land plots, and "verified" status indicators. It represents growth and precision.
*   **Secondary (Cyan-400):** Used for secondary data streams, transit overlays, and interactive map markers.
*   **Borders:** A consistent Slate-800 (#1e293b) is used for the 1px grid system to maintain structural integrity without high contrast.
*   **System Colors:** Use transparency (alphas) of the primary and secondary colors for "glowing" states rather than adding new hues.

## Typography
The typography system prioritizes legibility of complex data strings. **Inter** is the workhorse for the UI, providing a neutral and modern feel. **Geist** is introduced for labels and data points to provide a technical, "developer-tool" aesthetic that aligns with geospatial mapping.

Large headlines should use tight letter-spacing for a premium feel. Labels and data points should use uppercase and increased letter-spacing to distinguish them from prose. For mobile devices, headlines scale down by 20% to ensure map visibility remains the priority.

## Layout & Spacing
This design system utilizes a **Fixed-Fluid Hybrid** model. The main viewport is a fluid 12-column map container, while analytical side-panels are fixed-width (360px to 420px) to ensure data density is never compromised.

A 4px baseline grid governs all internal component spacing. Side panels use "Floating Glass" layouts with 24px margins from the screen edge, creating a sense of depth where the map is the bottom-most layer. Gutters are kept tight at 16px to maximize screen real estate for property listings and charts.

## Elevation & Depth
Depth is communicated through **Optical Translucency** rather than traditional drop shadows.

1.  **Level 0 (Map):** The base layer.
2.  **Level 1 (Panels):** Background: `rgba(2, 6, 23, 0.8)`. Backdrop blur: `12px`. Border: `1px solid rgba(30, 41, 59, 0.5)`.
3.  **Level 2 (Modals/Popovers):** Background: `rgba(15, 23, 42, 0.9)`. Backdrop blur: `20px`. Border: `1px solid rgba(16, 185, 129, 0.3)`. 

When an element is hovered, the 1px border should transition from Slate-800 to Emerald-500 to indicate interactivity.

## Shapes
The shape language is "Precision-Soft." While the design is tech-focused, slight rounding on corners prevents the UI from feeling aggressive or dated. 

Use `rounded-sm` (4px) for input fields and small buttons. Use `rounded-lg` (8px) for main side-panels and property cards. Circular shapes are reserved strictly for map markers and avatar icons.

## Components
- **Buttons:** Primary buttons use a solid Emerald-500 with black text for maximum contrast. Secondary buttons use a "Ghost" style with a 1px Slate-800 border and Cyan-400 text.
- **Glass Cards:** Used for property listings. Must feature a `backdrop-filter: blur()` and a subtle top-to-bottom gradient to simulate light hitting the edge of a glass pane.
- **Inputs:** Darker than the panel background (#0f172a) with an inset 1px border. On focus, the border glows Emerald-500 with a 4px outer soft glow.
- **Chips/Badges:** Small, technical tags for "Zoning Type" or "Price Sq/Ft." Use Geist Mono at 10px with a 10% opacity background of the label color.
- **Map Controls:** Compact, vertical stacks of glass icons (Zoom, Layer Toggle, North Point) positioned in the bottom-right or top-right of the viewport.
- **Data Tables:** Border-less rows with a 1px Slate-900 bottom divider. Highlighting a row should apply a 5% Emerald-500 tint.