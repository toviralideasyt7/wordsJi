# Design Tokens System

This directory contains the design tokens system for the WordAuditor application, providing a centralized and consistent approach to styling.

## Overview

The design tokens system includes:

- **Color Palettes**: Primary (Indigo), Secondary (Purple), Success (Green), Warning (Yellow), and Neutral (Gray) colors
- **Typography Scale**: Font families, sizes, weights, and line heights
- **Spacing Scale**: Consistent spacing values from 0 to 96
- **Animation Tokens**: Duration (fast: 100ms, normal: 200ms, slow: 300ms) and easing functions

## Usage

### In TypeScript/JavaScript

```typescript
import { designTokens, getColor, createTransition } from '$lib/design';

// Access colors
const primaryColor = designTokens.colors.light.primary[5]; // #6366f1

// Use utility functions
const color = getColor('light', 'primary', 5);
const transition = createTransition('all', 'normal', 'easeInOut');
```

### In Svelte Components

```svelte
<script>
  import { designTokens } from '$lib/design';
</script>

<div style="color: {designTokens.colors.light.primary[5]}">
  Primary colored text
</div>
```

### With Tailwind CSS

The design tokens are automatically integrated with Tailwind CSS:

```html
<!-- Use custom color classes -->
<div class="bg-primary-500 text-white">Primary background</div>
<div class="bg-success-500">Success background</div>

<!-- Use custom transition durations -->
<div class="transition-fast">Fast transition</div>
<div class="transition-normal">Normal transition</div>
```

### With CSS Custom Properties

CSS custom properties are available for dynamic theme switching:

```css
.my-element {
  background-color: var(--color-primary-500);
  color: var(--color-text-primary);
  transition: all var(--duration-normal) var(--easing-in-out);
}
```

## Theme Switching

The system supports light and dark themes. To switch themes, add the `data-theme` attribute to the root element:

```html
<!-- Light theme (default) -->
<html>

<!-- Dark theme -->
<html data-theme="dark">
```

## Color Palettes

### Primary (Indigo)
- 50-900 shades available
- Main brand color
- Use for primary actions and highlights

### Secondary (Purple)
- 50-900 shades available
- Complementary brand color
- Use for secondary actions

### Success (Green)
- 50-900 shades available
- Wordle correct letter color
- Use for success states and positive feedback

### Warning (Yellow)
- 50-900 shades available
- Wordle present letter color
- Use for warnings and caution states

### Neutral (Gray)
- 50-900 shades available
- Wordle absent letter color
- Use for text, borders, and backgrounds

## Typography

### Font Families
- **Sans**: System font stack for body text
- **Mono**: Monospace font stack for code

### Font Sizes
- xs (12px) to 9xl (128px)
- Use semantic names: base, lg, xl, 2xl, etc.

### Font Weights
- thin (100) to black (900)
- Common: normal (400), medium (500), semibold (600), bold (700)

### Line Heights
- none (1) to loose (2)
- Default: normal (1.5)

## Spacing

Consistent spacing scale from 0 to 96:
- 0, 1 (4px), 2 (8px), 3 (12px), 4 (16px), 6 (24px), 8 (32px), 12 (48px), 16 (64px), etc.

## Animations

### Durations
- **fast**: 100ms - Quick interactions
- **normal**: 200ms - Standard transitions
- **slow**: 300ms - Deliberate animations

### Easing Functions
- **easeIn**: Accelerating from zero velocity
- **easeOut**: Decelerating to zero velocity
- **easeInOut**: Acceleration until halfway, then deceleration

## File Structure

```
src/lib/design/
├── tokens.ts       # Core design token definitions
├── utils.ts        # Utility functions for accessing tokens
├── index.ts        # Public API exports
└── README.md       # This file
```

## Best Practices

1. **Use tokens consistently**: Always use design tokens instead of hardcoded values
2. **Prefer Tailwind classes**: Use Tailwind utility classes when possible for better performance
3. **Use CSS custom properties for dynamic values**: When you need runtime theme switching
4. **Follow the spacing scale**: Use the predefined spacing values for consistency
5. **Respect animation durations**: Use the standard durations for consistent feel

## Examples

### Button Component

```svelte
<script>
  import { createTransition } from '$lib/design';
</script>

<button
  class="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg"
  style="transition: {createTransition('background-color', 'fast', 'easeOut')}"
>
  Click me
</button>
```

### Card Component

```svelte
<div class="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6">
  <h2 class="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
    Card Title
  </h2>
  <p class="text-neutral-600 dark:text-neutral-300">
    Card content goes here
  </p>
</div>
```
