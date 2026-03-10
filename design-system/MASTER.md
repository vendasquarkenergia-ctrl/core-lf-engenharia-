+----------------------------------------------------------------------------------------+
|  TARGET: LF ENGENHARIA - RECOMMENDED DESIGN SYSTEM                                     |
+----------------------------------------------------------------------------------------+
|                                                                                        |
|  PATTERN: Executive Dashboard + Real-Time Monitoring                                   |
|     Conversion: High data-density with clear visual hierarchy                          |
|     Structure:                                                                         |
|       1. Global Filters (Sticky)                                                       |
|       2. Top-Level KPIs (Critical Metrics)                                             |
|       3. Main Analytics (Time-Series / Trends)                                         |
|       4. Secondary Breakdowns (Categorical)                                            |
|       5. Actionable Feed / Alerts                                                      |
|                                                                                        |
|  STYLE: Glassmorphism + Bento Box Grid                                                 |
|     Keywords: Translucency, deep dark backgrounds, subtle neon accents, premium feel   |
|     Best For: Modern B2B SaaS, Financial Dashboards, Executive Tools                   |
|     Performance: High (GPU Accelerated Blur) | Accessibility: High Contrast Text       |
|                                                                                        |
|  COLORS:                                                                               |
|     Background: #0A0A0A to #050505 (Deep Navy/Black Gradient)                          |
|     Cards/Panels: rgba(23, 23, 23, 0.8) with backdrop-blur-2xl                         |
|     Borders: rgba(255, 255, 255, 0.05)                                                 |
|     Primary/Brand: #C19A42 (Premium Gold)                                              |
|     Success: #10B981 (Emerald) or #25D366 (WhatsApp Green)                             |
|     Danger: #EF4444 (Red)                                                              |
|     Text Primary: #F5F5F7 (Apple Off-White)                                            |
|                                                                                        |
|  TYPOGRAPHY: Inter / Geist                                                             |
|     Mood: Technical, clean, highly legible at small sizes                              |
|     Weights: 400 (Body), 500 (Labels), 600/700 (KPIs/Headers)                          |
|     Tracking: Tighter tracking (-0.02em to -0.04em) on large numbers                   |
|                                                                                        |
|  KEY EFFECTS:                                                                          |
|     Soft Glows: Box shadows with primary colors at 15-20% opacity                      |
|     Transitions: 200-300ms ease-out on all interactive elements                        |
|     Staggered Entry: Framer Motion staggerChildren for grid items                      |
|                                                                                        |
|  AVOID (Anti-patterns):                                                                |
|     Large blocks of pure white text (causes eye strain on dark mode)                   |
|     Opaque/flat gray cards (ruins the glassmorphism depth)                             |
|     Generic blue/red without opacity adjustments                                       |
|     Sharp corners (stick to rounded-2xl or rounded-3xl)                                |
|                                                                                        |
|  PRE-DELIVERY CHECKLIST:                                                               |
|     [ ] Empty states properly styled with muted icons                                  |
|     [ ] Hover states on all clickable elements (subtle background shift)               |
|     [ ] Focus states visible for keyboard nav                                          |
|     [ ] Responsive breakpoints respected (stacking bento grids on mobile)              |
|                                                                                        |
+----------------------------------------------------------------------------------------+
