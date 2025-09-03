
# 🧠 Sage Homepage Design System PRD

## Objective
Establish the foundational design system through the homepage of Sage — a minimal yet playful dispensary education tool. The homepage will be used to validate typography, spacing, color, interactivity, and layout decisions before extending to other pages.

## Design Inspiration
- [Der Baukasten](https://www.der-baukasten.com) – grid layout, modularity, minimalism
- [Geex Arts](https://www.geex-arts.com) – animated elements, bold type
- [Spectral Gradient Pack](https://ui8.net/basit/products/spectral-gradient--noisy-textured-background-pack?rel=muzli) – textured backgrounds, colorful noise layers
- [Karo Crafts](https://www.karocrafts.com) – soft playful motion, hover interactions

## 🏠 Homepage Goals

### Functional Elements
- **Sage Logo + Subtext**: "Powered by [Dispensary Name]"
- **Experience Level Selector**: New, Casual, Experienced (pill-style buttons)
- **Prompt Input Field**: Natural language input
- **Ask Sage CTA**: Prominent, animated button

### Visual Goals
- Lock down the following:
  - Font pairings
  - Button styles
  - Input field styling
  - Hover and focus states
  - Responsive layout rhythm (mobile/desktop)
  - Background gradient/noise treatment

## Design Tokens

```css
:root {
  --font-display: 'Poppins', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-size-base: 16px;
  --font-size-lg: 24px;
  --font-size-xl: 32px;

  --color-bg: #1a1a1a;
  --color-fg: #ffffff;
  --color-subtle: #aaaaaa;
  --color-accent: #5c6bc0;
  --color-hover: #7986cb;

  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-pill: 999px;
}
```

## Layout & Responsiveness
- Mobile-first grid using `max-width: 500px` center column
- Responsive collapse of experience buttons into dropdown on narrow screens
- Text scaling from 1rem → 2rem for headers
- Soft animations for all interactive elements (button hover, input focus)

## Deliverables
- `index.html` for layout structure
- `style.css` with design tokens & base UI components
- No Gemini logic or output section yet — this is purely for design system validation

---

Once homepage is locked, expand the PRD to include dynamic output for the results page.
