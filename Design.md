---
name: Intern-View
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#cfc2d6'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#988d9f'
  outline-variant: '#4d4354'
  surface-tint: '#ddb7ff'
  primary: '#ddb7ff'
  on-primary: '#490080'
  primary-container: '#b76dff'
  on-primary-container: '#400071'
  inverse-primary: '#842bd2'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb2b7'
  on-tertiary: '#67001b'
  tertiary-container: '#ff516a'
  on-tertiary-container: '#5b0017'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#f0dbff'
  primary-fixed-dim: '#ddb7ff'
  on-primary-fixed: '#2c0051'
  on-primary-fixed-variant: '#6900b3'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
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
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The brand personality is high-energy, analytical, and technical. It targets developers and engineering managers who value precision but crave a modern, vibrant aesthetic. This design system utilizes a **Technical Modernism** style—mixing the efficiency of developer tools with the high-impact energy of a modern SaaS startup.

The visual narrative is built on the "Threaded Developer Workspace" metaphor. It uses wireframe-inspired borders to represent structural integrity and "logical threads" to connect data points. The emotional response should be one of intense focus, clarity, and the satisfying feeling of "debugging" a complex human interaction. It avoids the heaviness of traditional enterprise tools by using vibrant accents and deep, atmospheric surfaces.

## Colors
The palette is optimized for a deep-canvas dark mode that minimizes eye strain while highlighting critical data points.

- **Primary (Electric Purple):** Used for "Stitch" accents, active focus states, and primary navigation threads. It represents the connective tissue of the platform.
- **Secondary (Emerald):** Reserved for success states, stable metrics, and "positive signal" logic.
- **Accent/Warning (Crimson):** High-visibility color for "Pushback" indicators, cognitive gaps, and critical errors.
- **Surface (Indigo Charcoal):** The base canvas color. Use slightly lighter variants for nested containers to maintain hierarchy.
- **Borders:** All borders use a low-opacity white (10-15%) or a dimmed version of the primary color to maintain the wireframe aesthetic without visual clutter.

## Typography
This design system employs a pairing of **Inter** for core UI and communication, and **JetBrains Mono** for technical data, metadata, and "system" labels.

Headlines are bold and tight, providing a strong sense of hierarchy. Body text is kept clean and legible. The monospaced font is used strategically for any data that feels "outputted" by the system—such as timestamps, score counts, and status indicators—to reinforce the developer-centric feel. Use `label-caps` for section headers and table column titles to create a distinct, categorized look.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. Navigation and sidebar elements are fixed-width to emulate a workspace/IDE, while the main content area (the "Canvas") is fluid with a maximum width of 1440px to ensure readability.

We use a strict 4px baseline grid. Components are spaced using 8px (sm), 16px (md), and 24px (lg) increments to create a predictable rhythm. Layouts should utilize "Threaded Columns"—where vertical lines (borders) visually separate columns, extending to the full height of the container to mimic a structural wireframe. Mobile layouts collapse into a single column, maintaining 16px side margins and using the same wireframe dividers horizontally.

## Elevation & Depth
In this system, depth is conveyed through **Tonal Layering** and **Wireframe Outlines** rather than traditional shadows.

1.  **Canvas (Level 0):** The darkest Indigo Charcoal (#0f172a).
2.  **Panels (Level 1):** Slightly lighter surface (+2-4% lightness) with a subtle 1px border (#ffffff at 10% opacity).
3.  **Popovers/Modals (Level 2):** Use a background blur (12px) behind the surface to create a "glass" effect that suggests it is floating above the workspace. 
4.  **The "Stitch" Effect:** Use a primary purple neon glow (outer glow, 4px blur, 30% opacity) specifically for active focus states or connected data nodes to make them pop against the dark background.

Avoid heavy drop shadows; let the contrast between the deep surface and the vibrant primary accents define the hierarchy.

## Shapes
The shape language is "Engineering Crisp." We use **Soft (0.25rem)** roundedness for buttons and inputs to keep the UI approachable but professional. 

Larger containers like cards or panels use **rounded-lg (0.5rem)**. The only exception to the soft-corner rule is for "Terminal" or "Code" blocks, which can remain sharp (0px) to distinguish them from the standard UI elements. High-action elements like "Add" buttons or tags can use **rounded-xl (0.75rem)** for a slightly more modern, tactile feel.

## Components
- **Buttons:** Primary buttons are solid Electric Purple with white text. Secondary buttons are outlined with 1px primary-colored borders. All buttons use `label-caps` typography for a "command" feel.
- **Threaded Lists:** List items are separated by subtle horizontal wireframe lines. The "Active" state is indicated by a vertical 2px purple "thread" on the left edge.
- **Status Chips:** Use `code-md` typography. Emerald background with 10% opacity for "Stable," Crimson for "Gap," and Purple for "Processing."
- **Input Fields:** Deep charcoal background with a 1px border that turns Electric Purple on focus. Labels sit just above the field in `label-caps`.
- **Data Cards:** No shadows. Instead, use a 1px border. When a card represents a "Cognitive Gap," the top border should be thickened to 3px and colored Crimson.
- **Logic Connectors:** 1px dashed lines (Purple) that visually connect one card to another, reinforcing the "Intern-View" analysis narrative.

- **Pushback Warning Node:** When the agent triggers a "Brutal Pushback", the chat container's border shifts from the standard outline to `error` (Crimson, #ffb4ab). The `label-caps` header changes to "⚠️ AGENT PUSHBACK" to visually warn the user that their previous answer was rejected for lacking depth. 
- **Trap Door Indicator:** When a Trap Door question is asked, display a muted, tiny `code-md` tag below the agent's message reading `[Context: Recalling previous gap on Day X]`.