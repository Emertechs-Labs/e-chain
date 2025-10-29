# 🎨 Design Tokens - Mobile-First Enhanced

<div align="center">

![Design Tokens](https://img.shields.io/badge/Echain-Design_Tokens-00D4FF?style=for-the-badge&logo=css3&logoColor=white)
![CSS Custom Properties](https://img.shields.io/badge/CSS_Custom_Properties-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Mobile First](https://img.shields.io/badge/Mobile_First-34C759?style=for-the-badge&logo=apple&logoColor=white)

**Complete design token system for the Echain platform**

*CSS custom properties, TypeScript types, and mobile-optimized design system variables*

</div>

---

## Overview - Mobile-First Evolution

Design tokens are the smallest pieces of a design system. They represent design decisions and are used to maintain consistency across all platforms and implementations. The Echain design system uses CSS custom properties (CSS variables) as the source of truth for all design tokens, with enhanced mobile-first optimization and preserved color harmony.

### Mobile-First Principles
```
📱 Touch-First Tokens: 44px minimum touch targets with haptic feedback support
🎯 Responsive Scaling: Fluid tokens that adapt to all screen sizes
⚡ Performance Optimized: Battery-conscious animations and efficient rendering
♿ Inclusive by Default: Accessibility built-in from the ground up
🎨 Preserved Harmony: Signature cyan-blue-purple gradient maintained across devices
🔄 Adaptive Variants: Context-aware token switching based on device capabilities
```

### Mobile-Specific Token Categories
```
🎯 Touch Targets: Minimum 44px interactive elements
📏 Adaptive Spacing: Fluid spacing that scales with viewport
📝 Mobile Typography: Enhanced readability on small screens
🎭 Contextual Animations: Motion that adapts to device capabilities
🔋 Battery Aware: Reduced animations on low power
📱 Safe Areas: iOS notch and Android navigation support
```

## 📱 Mobile-First Design Tokens

### Touch Target System

#### Minimum Touch Targets
```css
:root {
  /* Apple and Android recommended minimum touch targets */
  --touch-target-min: 44px;        /* iOS/Android standard */
  --touch-target-comfortable: 48px; /* Enhanced comfort */
  --touch-target-large: 52px;      /* Accessibility preference */

  /* Touch target padding calculations */
  --touch-target-padding-sm: calc((var(--touch-target-min) - var(--text-base)) / 2);
  --touch-target-padding-md: calc((var(--touch-target-comfortable) - var(--text-base)) / 2);
  --touch-target-padding-lg: calc((var(--touch-target-large) - var(--text-lg)) / 2);
}
```

#### Touch Interaction Tokens
```css
:root {
  /* Haptic feedback patterns (when supported) */
  --haptic-light: 50ms;
  --haptic-medium: 100ms;
  --haptic-heavy: 200ms;

  /* Touch delay prevention */
  --touch-delay: 0ms;  /* Modern browsers eliminate 300ms delay */

  /* Active state feedback */
  --touch-active-scale: 0.98;
  --touch-active-opacity: 0.8;
}
```

### Adaptive Spacing System - Mobile Enhanced

#### Fluid Spacing Scale
```css
:root {
  /* Base spacing unit: 0.25rem (4px) */
  --space-px: 1px;
  --space-0: 0;

  /* Mobile-optimized spacing scale */
  --space-1: 0.25rem;    /* 4px - Icon spacing */
  --space-2: 0.5rem;     /* 8px - Tight spacing */
  --space-3: 0.75rem;    /* 12px - Component padding */
  --space-4: 1rem;       /* 16px - Standard spacing */
  --space-5: 1.25rem;    /* 20px - Card padding */
  --space-6: 1.5rem;     /* 24px - Section spacing */
  --space-8: 2rem;       /* 32px - Large gaps */
  --space-10: 2.5rem;    /* 40px - Hero sections */
  --space-12: 3rem;      /* 48px - Major sections */
  --space-16: 4rem;      /* 64px - Page sections */
  --space-20: 5rem;      /* 80px - Hero spacing */
  --space-24: 6rem;      /* 96px - Large layouts */

  /* Touch-optimized spacing */
  --space-touch-xs: max(var(--space-3), var(--touch-target-padding-sm));
  --space-touch-sm: max(var(--space-4), var(--touch-target-padding-md));
  --space-touch-md: max(var(--space-6), var(--touch-target-padding-lg));
  --space-touch-lg: calc(var(--touch-target-large) + var(--space-2));
}
```

#### Contextual Spacing
```css
:root {
  /* Device-aware spacing adjustments */
  --space-mobile-compact: var(--space-touch-xs);
  --space-mobile-regular: var(--space-touch-sm);
  --space-mobile-expanded: var(--space-touch-md);

  /* Content density based spacing */
  --space-content-dense: var(--space-2);
  --space-content-normal: var(--space-4);
  --space-content-loose: var(--space-6);

  /* Orientation-aware spacing */
  --space-portrait-multiplier: 1;
  --space-landscape-multiplier: 0.8;
}
```

### Mobile Typography System - Enhanced Readability

#### Fluid Typography Scale
```css
:root {
  /* Mobile-first fluid typography */
  --text-xs: clamp(0.75rem, 2vw, 0.875rem);     /* 12px → 14px */
  --text-sm: clamp(0.875rem, 2.5vw, 1rem);      /* 14px → 16px */
  --text-base: clamp(1rem, 3vw, 1.125rem);      /* 16px → 18px */
  --text-lg: clamp(1.125rem, 3.5vw, 1.25rem);   /* 18px → 20px */
  --text-xl: clamp(1.25rem, 4vw, 1.5rem);       /* 20px → 24px */
  --text-2xl: clamp(1.5rem, 5vw, 2rem);         /* 24px → 32px */
  --text-3xl: clamp(2rem, 6vw, 2.5rem);         /* 32px → 40px */
  --text-4xl: clamp(2.5rem, 7vw, 3rem);         /* 40px → 48px */
  --text-5xl: clamp(3rem, 8vw, 3.5rem);         /* 48px → 56px */
  --text-6xl: clamp(3.5rem, 10vw, 4rem);        /* 56px → 64px */

  /* Touch-friendly font sizes */
  --text-touch-sm: max(var(--text-sm), 16px);
  --text-touch-base: max(var(--text-base), 18px);
  --text-touch-lg: max(var(--text-lg), 20px);
}
```

#### Enhanced Font Settings for Mobile
```css
:root {
  /* Mobile-optimized font stacks */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Fira Mono', Consolas, 'Liberation Mono', Menlo, Monaco, monospace;

  /* Mobile font rendering optimizations */
  --font-smoothing: antialiased;
  --webkit-font-smoothing: antialiased;
  --moz-osx-font-smoothing: grayscale;

  /* Enhanced line heights for mobile readability */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-mobile: 1.6;  /* Slightly more spacing on mobile */
}
```

### Mobile Color Adaptations

#### Context-Aware Color Tokens
```css
:root {
  /* Lighting condition adaptations */
  --color-adaptive-primary: var(--echain-primary-500);
  --color-adaptive-secondary: var(--echain-primary-400);
  --color-adaptive-accent: var(--echain-primary-600);

  /* High contrast mode (accessibility) */
  --color-high-contrast-primary: #0066cc;
  --color-high-contrast-secondary: #0099ff;
  --color-high-contrast-accent: #003d82;

  /* Low light environments */
  --color-low-light-primary: #1d4ed8;
  --color-low-light-secondary: #3b82f6;
  --color-low-light-accent: #1e40af;
}

/* Dynamic color switching based on device capabilities */
@media (prefers-contrast: high) {
  --color-adaptive-primary: var(--color-high-contrast-primary);
  --color-adaptive-secondary: var(--color-high-contrast-secondary);
  --color-adaptive-accent: var(--color-high-contrast-accent);
}

/* Low light adaptation (if detectable) */
@media (prefers-color-scheme: dark) and (max-resolution: 150dpi) {
  --color-adaptive-primary: var(--color-low-light-primary);
  --color-adaptive-secondary: var(--color-low-light-secondary);
  --color-adaptive-accent: var(--color-low-light-accent);
}
```

#### Semantic Colors
```css
:root {
  /* Success States */
  --success-50: 236 253 245;
  --success-500: 34 197 94;
  --success-600: 22 163 74;
  --success-700: 21 128 61;

  /* Error States */
  --destructive-50: 254 242 242;
  --destructive-500: 239 68 68;
  --destructive-600: 220 38 38;
  --destructive-700: 185 28 28;
}
```

### Neutral Colors

#### Grayscale
```css
:root {
  /* Pure Whites and Blacks */
  --white: 255 255 255;
  --black: 0 0 0;

  /* Neutral Grays */
  --gray-50: 249 250 251;
  --gray-100: 243 244 246;
  --gray-200: 229 231 235;
  --gray-300: 209 213 219;
  --gray-400: 156 163 175;
  --gray-500: 107 114 128;
  --gray-600: 75 85 99;
  --gray-700: 55 65 81;
  --gray-800: 31 41 55;
  --gray-900: 17 24 39;
  --gray-950: 3 7 18;
}
```

### Theme Variables

#### Light Theme
```css
[data-theme="light"] {
  /* Background Colors */
  --background: var(--white);
  --foreground: var(--gray-900);
  --muted: var(--gray-100);
  --muted-foreground: var(--gray-600);

  /* Card Colors */
  --card: var(--white);
  --card-foreground: var(--gray-900);

  /* Popover Colors */
  --popover: var(--white);
  --popover-foreground: var(--gray-900);

  /* Primary Colors */
  --primary: var(--echain-primary-600);
  --primary-foreground: var(--white);

  /* Secondary Colors */
  --secondary: var(--gray-100);
  --secondary-foreground: var(--gray-900);

  /* Accent Colors */
  --accent: var(--echain-primary-100);
  --accent-foreground: var(--echain-primary-700);

  /* Border Colors */
  --border: var(--gray-200);
  --input: var(--gray-200);
  --ring: var(--echain-primary-500);
}
```

#### Dark Theme
```css
[data-theme="dark"] {
  /* Background Colors */
  --background: var(--gray-950);
  --foreground: var(--gray-50);
  --muted: var(--gray-800);
  --muted-foreground: var(--gray-400);

  /* Card Colors */
  --card: var(--gray-900);
  --card-foreground: var(--gray-50);

  /* Popover Colors */
  --popover: var(--gray-900);
  --popover-foreground: var(--gray-50);

  /* Primary Colors */
  --primary: var(--echain-primary-400);
  --primary-foreground: var(--gray-900);

  /* Secondary Colors */
  --secondary: var(--gray-800);
  --secondary-foreground: var(--gray-50);

  /* Accent Colors */
  --accent: var(--echain-primary-800);
  --accent-foreground: var(--echain-primary-200);

  /* Border Colors */
  --border: var(--gray-700);
  --input: var(--gray-700);
  --ring: var(--echain-primary-400);
}
```

## 📐 Spacing System

### Spacing Scale
```css
:root {
  /* Base spacing unit: 0.25rem (4px) */
  --space-px: 1px;
  --space-0: 0;
  --space-1: 0.25rem;    /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
  --space-24: 6rem;      /* 96px */
}
```

## 📝 Typography System

### Font Families
```css
:root {
  /* Primary font stack */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

  /* Monospace for code */
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Fira Mono', Consolas, 'Liberation Mono', Menlo, Monaco, monospace;
}
```

### Font Sizes
```css
:root {
  /* Standard size scale */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
  --text-5xl: 3rem;        /* 48px */
  --text-6xl: 3.75rem;     /* 60px */
}
```

### Font Weights
```css
:root {
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### Line Heights
```css
:root {
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
}
```

## 🔄 Border Radius System

### Border Radius Scale
```css
:root {
  --radius-none: 0;
  --radius-sm: 0.125rem;     /* 2px */
  --radius-md: 0.375rem;     /* 6px */
  --radius-lg: 0.5rem;       /* 8px */
  --radius-xl: 0.75rem;      /* 12px */
  --radius-2xl: 1rem;        /* 16px */
  --radius-3xl: 1.5rem;      /* 24px */
  --radius-full: 9999px;     /* Fully rounded */
}
```

## 🌟 Shadow System

### Elevation Shadows
```css
:root {
  /* Subtle shadows for cards and surfaces */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);

  /* Inner shadows for inputs */
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
}
```

## 📏 Size System

### Width and Height Utilities
```css
:root {
  /* Fixed sizes */
  --size-0: 0;
  --size-px: 1px;
  --size-0-5: 0.125rem;    /* 2px */
  --size-1: 0.25rem;       /* 4px */
  --size-1-5: 0.375rem;    /* 6px */
  --size-2: 0.5rem;        /* 8px */
  --size-2-5: 0.625rem;    /* 10px */
  --size-3: 0.75rem;       /* 12px */
  --size-3-5: 0.875rem;    /* 14px */
  --size-4: 1rem;          /* 16px */
  --size-5: 1.25rem;       /* 20px */
  --size-6: 1.5rem;        /* 24px */
  --size-7: 1.75rem;       /* 28px */
  --size-8: 2rem;          /* 32px */
  --size-9: 2.25rem;       /* 36px */
  --size-10: 2.5rem;       /* 40px */
  --size-11: 2.75rem;      /* 44px */
  --size-12: 3rem;         /* 48px */
  --size-14: 3.5rem;       /* 56px */
  --size-16: 4rem;         /* 64px */
  --size-20: 5rem;         /* 80px */
  --size-24: 6rem;         /* 96px */
  --size-28: 7rem;         /* 112px */
  --size-32: 8rem;         /* 128px */
  --size-36: 9rem;         /* 144px */
  --size-40: 10rem;        /* 160px */
  --size-44: 11rem;        /* 176px */
  --size-48: 12rem;        /* 192px */
  --size-52: 13rem;        /* 208px */
  --size-56: 14rem;        /* 224px */
  --size-60: 15rem;        /* 240px */
  --size-64: 16rem;        /* 256px */
  --size-72: 18rem;        /* 288px */
  --size-80: 20rem;        /* 320px */
  --size-96: 24rem;        /* 384px */

  /* Fractional sizes */
  --size-1-2: 50%;
  --size-1-3: 33.333333%;
  --size-2-3: 66.666667%;
  --size-1-4: 25%;
  --size-2-4: 50%;
  --size-3-4: 75%;
  --size-1-5: 20%;
  --size-2-5: 40%;
  --size-3-5: 60%;
  --size-4-5: 80%;
  --size-full: 100%;
  --size-min: min-content;
  --size-max: max-content;
  --size-fit: fit-content;
}
```

## ⚡ Animation System

### Duration Tokens
```css
:root {
  --duration-75: 75ms;
  --duration-100: 100ms;
  --duration-150: 150ms;
  --duration-200: 200ms;
  --duration-300: 300ms;
  --duration-500: 500ms;
  --duration-700: 700ms;
  --duration-1000: 1000ms;
}
```

### Easing Functions
```css
:root {
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in-expo: cubic-bezier(0.95, 0.05, 0.795, 0.035);
  --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
  --ease-in-back: cubic-bezier(0.6, -0.28, 0.735, 0.045);
  --ease-out-back: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

## 📱 Mobile-First Breakpoint System

### Content-Driven Breakpoints
```css
:root {
  /* Mobile-first, content-driven breakpoints */
  --breakpoint-compact: 320px;   /* iPhone SE, small phones - 1 column */
  --breakpoint-regular: 375px;  /* iPhone standard, most phones - 1 column */
  --breakpoint-expanded: 428px; /* iPhone Max, small tablets - 1-2 columns */
  --breakpoint-large: 768px;    /* iPad, small laptops - 2-3 columns */
  --breakpoint-extra-large: 1024px; /* Desktop, large tablets - 3-4 columns */
  --breakpoint-ultra: 1440px;   /* Large desktops, ultra-wide - 4+ columns */

  /* Touch-friendly breakpoint aliases */
  --mobile: var(--breakpoint-compact);
  --tablet: var(--breakpoint-large);
  --desktop: var(--breakpoint-extra-large);
  --wide: var(--breakpoint-ultra);
}
```

#### Responsive Container Queries
```css
/* Container query support for component-level responsiveness */
@container (min-width: 320px) {
  .component {
    --component-spacing: var(--space-touch-sm);
  }
}

@container (min-width: 768px) {
  .component {
    --component-spacing: var(--space-6);
  }
}
```

## ⚡ Mobile-Optimized Animation System

### Battery-Aware Duration Tokens
```css
:root {
  /* Performance-optimized durations */
  --duration-instant: 0ms;
  --duration-fast: 150ms;      /* Quick interactions */
  --duration-normal: 300ms;    /* Standard transitions */
  --duration-slow: 500ms;      /* Complex animations */

  /* Reduced motion support */
  --duration-reduced: 0ms;

  /* Battery-aware scaling */
  --duration-battery-low: calc(var(--duration-normal) * 0.5);
  --duration-battery-critical: var(--duration-instant);
}
```

### Touch-Optimized Easing Functions
```css
:root {
  /* Mobile-optimized easing curves */
  --ease-touch: cubic-bezier(0.25, 0.46, 0.45, 0.94);  /* iOS-style bounce */
  --ease-material: cubic-bezier(0.4, 0.0, 0.2, 1);     /* Material Design */
  --ease-natural: cubic-bezier(0.34, 1.56, 0.64, 1);   /* Natural feeling */

  /* Performance easing for mobile */
  --ease-performance: cubic-bezier(0.4, 0.0, 0.2, 1);  /* GPU accelerated */
}
```

### Haptic Animation Tokens
```css
:root {
  /* Haptic feedback animation patterns */
  --animation-haptic-light: vibrate 50ms;
  --animation-haptic-medium: vibrate 100ms;
  --animation-haptic-heavy: vibrate 200ms;

  /* Visual feedback for haptic actions */
  --animation-touch-feedback: scale(0.98) translateZ(0);
  --animation-touch-feedback-duration: 100ms;
}
```

### Reduced Motion Support
```css
/* Respect user preferences for motion */
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast: var(--duration-reduced);
    --duration-normal: var(--duration-reduced);
    --duration-slow: var(--duration-reduced);
    --animation-haptic-light: none;
    --animation-haptic-medium: none;
    --animation-haptic-heavy: none;
  }
}
```

## 🎨 Mobile Theme Switching Optimizations

### Adaptive Color System
```css
:root {
  /* Light theme (default) */
  --theme-surface: var(--color-neutral-50);
  --theme-text: var(--color-neutral-900);
  --theme-border: var(--color-neutral-200);

  /* Dark theme */
  --theme-surface-dark: var(--color-neutral-900);
  --theme-text-dark: var(--color-neutral-50);
  --theme-border-dark: var(--color-neutral-700);

  /* High contrast theme */
  --theme-surface-high: var(--color-neutral-0);
  --theme-text-high: var(--color-neutral-1000);
  --theme-border-high: var(--color-neutral-900);
}

@media (prefers-color-scheme: dark) {
  :root {
    --theme-surface: var(--theme-surface-dark);
    --theme-text: var(--theme-text-dark);
    --theme-border: var(--theme-border-dark);
  }
}

@media (prefers-contrast: high) {
  :root {
    --theme-surface: var(--theme-surface-high);
    --theme-text: var(--theme-text-high);
    --theme-border: var(--theme-border-high);
  }
}
```

### Context-Aware Theme Adaptation
```css
/* Battery optimization - reduce animations on low battery */
@media (max-device-battery: 20%) {
  :root {
    --duration-normal: var(--duration-battery-low);
    --duration-slow: var(--duration-battery-critical);
  }
}

/* Data saver mode - reduce image quality and animations */
@media (prefers-reduced-data: reduce) {
  :root {
    --animation-complex: none;
    --image-quality: low;
  }
}
```

## 📊 Mobile Performance Tokens

### Memory-Efficient Patterns
```css
:root {
  /* GPU acceleration hints */
  --gpu-layer: transform3d(0, 0, 0);
  --gpu-composite: opacity;

  /* Memory-conscious animation limits */
  --animation-max-elements: 10;
  --animation-batch-size: 3;

  /* Touch event optimization */
  --touch-debounce: 16ms;  /* ~60fps */
  --touch-throttle: 8ms;   /* ~120fps */
}
```

### Network-Aware Tokens
```css
:root {
  /* Connection-aware loading strategies */
  --loading-strategy-slow: skeleton;
  --loading-strategy-fast: immediate;

  /* Progressive enhancement levels */
  --enhancement-basic: 1;
  --enhancement-enhanced: 2;
  --enhancement-premium: 3;
}
```

## 🔧 Implementation Guidelines

### Mobile-First Token Usage
```css
/* Always start with mobile defaults */
.component {
  padding: var(--space-touch-sm);
  font-size: var(--text-mobile-body);
  min-height: var(--touch-target-min);
}

/* Progressive enhancement for larger screens */
@media (min-width: 768px) {
  .component {
    padding: var(--space-4);
    font-size: var(--text-body);
  }
}
```

### Performance-First Implementation
```css
/* Use CSS containment for performance */
.component {
  contain: layout style paint;
}

/* Optimize for touch interactions */
.touch-target {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
```

## 🔧 Usage in Code

### CSS Usage
```css
/* Using design tokens in CSS */
.my-component {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  padding: var(--space-4);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
}
```

### Tailwind CSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... other color definitions
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        '3xs': ['0.5rem', { lineHeight: '0.625rem' }],
      },
    },
  },
};
```

### TypeScript Usage
```typescript
// types/design-tokens.ts
export type ColorToken =
  | 'background'
  | 'foreground'
  | 'muted'
  | 'muted-foreground'
  | 'primary'
  | 'primary-foreground'
  | 'secondary'
  | 'secondary-foreground'
  | 'accent'
  | 'accent-foreground'
  | 'destructive'
  | 'destructive-foreground'
  | 'success'
  | 'success-foreground';

export type SpacingToken =
  | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '8' | '10'
  | '12' | '16' | '20' | '24';

export type FontSizeToken =
  | 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'
  | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl';

export type BorderRadiusToken =
  | 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';

// Utility functions
export const getColor = (token: ColorToken): string => `hsl(var(--${token}))`;
export const getSpacing = (token: SpacingToken): string => `var(--space-${token})`;
export const getFontSize = (token: FontSizeToken): string => `var(--text-${token})`;
export const getBorderRadius = (token: BorderRadiusToken): string => `var(--radius-${token})`;
```

### React Component Usage
```tsx
// components/Button.tsx
import { getColor, getSpacing, getBorderRadius } from '@/lib/design-tokens';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = ({ variant = 'primary', size = 'md', children }: ButtonProps) => {
  const baseStyles = {
    padding: getSpacing(size === 'sm' ? '2' : size === 'lg' ? '4' : '3'),
    borderRadius: getBorderRadius('md'),
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-medium)',
  };

  const variantStyles = {
    primary: {
      backgroundColor: getColor('primary'),
      color: getColor('primary-foreground'),
    },
    secondary: {
      backgroundColor: getColor('secondary'),
      color: getColor('secondary-foreground'),
    },
    accent: {
      backgroundColor: getColor('accent'),
      color: getColor('accent-foreground'),
    },
  };

  return (
    <button
      style={{ ...baseStyles, ...variantStyles[variant] }}
      className="transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
      style={{ '--tw-ring-color': getColor('ring') } as any}
    >
      {children}
    </button>
  );
};
```

## 🔄 Theme Switching

### CSS-in-JS Theme Provider
```typescript
// lib/theme-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove existing theme
    root.classList.remove('light', 'dark');

    // Determine resolved theme
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const resolved = theme === 'system' ? systemTheme : theme;

    // Apply theme
    root.classList.add(resolved);
    root.setAttribute('data-theme', resolved);
    setResolvedTheme(resolved);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

## 📊 Token Validation

### Design Token Testing
```typescript
// tests/design-tokens.test.ts
import { getColor, getSpacing, getFontSize } from '@/lib/design-tokens';

describe('Design Tokens', () => {
  describe('Color tokens', () => {
    it('should return valid CSS for color tokens', () => {
      expect(getColor('primary')).toBe('hsl(var(--primary))');
      expect(getColor('background')).toBe('hsl(var(--background))');
    });
  });

  describe('Spacing tokens', () => {
    it('should return valid CSS for spacing tokens', () => {
      expect(getSpacing('4')).toBe('var(--space-4)');
      expect(getSpacing('8')).toBe('var(--space-8)');
    });
  });

  describe('Font size tokens', () => {
    it('should return valid CSS for font size tokens', () => {
      expect(getFontSize('base')).toBe('var(--text-base)');
      expect(getFontSize('lg')).toBe('var(--text-lg)');
    });
  });
});
```

## 🚀 Future Enhancements

### Planned Token Additions
- **Animation tokens**: More granular control over motion design
- **Z-index tokens**: Standardized layering system
- **Opacity tokens**: Consistent transparency values
- **Aspect ratio tokens**: Standardized proportions for media
- **Grid tokens**: Consistent layout spacing for complex grids

### Advanced Features
- **Dynamic theming**: Runtime theme switching with user preferences
- **High contrast mode**: Enhanced accessibility for users with visual impairments
- **Reduced motion**: Respecting user preferences for motion sensitivity
- **Color scheme variants**: Multiple color palettes for different use cases

---

**Design tokens provide the foundation for a consistent, scalable, and maintainable design system. They ensure that design decisions are centralized and can be easily updated across the entire platform.**