---
version: 1.0.0
name: Minimal Workspace
description: A focused writing and collaboration system based on the Notebook Simulator template.
colors:
  bg-primary: "#ffffff"
  bg-sidebar: "#fbfbfc"
  bg-accent: "#f4f4f5"
  text-primary: "#18181b"
  text-secondary: "#71717a"
  text-muted: "#a1a1aa"
  border-light: "#f4f4f5"
  border-standard: "#e4e4e7"
  brand-dark: "#18181b"
  brand-active: "#16a34a"
typography:
  font-family: "'IBM Plex', sans-serif"
  h1:
    size: "3rem"
    weight: "600"
    tracking: "-0.025em"
  h2:
    size: "1.5rem"
    weight: "600"
    tracking: "-0.025em"
  h3:
    size: "1.25rem"
    weight: "600"
    tracking: "-0.025em"
  body:
    size: "1rem"
    weight: "400"
    line-height: "1.625"
  caption:
    size: "0.75rem"
    weight: "500"
    tracking: "0.025em"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "24px"
  xl: "48px"
  gutter: "1.5rem"
rounded:
  none: "0px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "999px"
components:
  sidebar:
    width: "256px"
    bg: "#fbfbfc"
    border: "1px solid #e4e4e7"
  button-primary:
    bg: "#18181b"
    text: "#ffffff"
    shadow: "0 0 15px rgba(24,24,27,0.3)"
  floating-toolbar:
    bg: "#ffffff"
    border: "1px solid rgba(228,228,231,0.8)"
    shadow: "0 8px 30px rgba(0,0,0,0.12)"
  editor-container:
    max-width: "700px"
    padding: "4rem"
  code-block:
    bg: "#fbfbfc"
    font: "monospace"
    border: "1px solid #e4e4e7"
motion:
  standard: "300ms cubic-bezier(0.4, 0, 0.2, 1)"
  fast: "200ms ease-out"
---

## Overview

The Minimal Workspace system is designed for high-density document editing and hierarchical organization. It prioritizes white space, typographic hierarchy, and subtle interactive states to create a distraction-free editorial experience.

## Colors

The palette is strictly grayscale to ensure content remains the focus. Accents are reserved for functional states: brand-dark for primary actions, and brand-active for success states. Selection uses a translucent zinc tint to maintain legibility.

## Typography

Built on the 'IBM Plex' typeface. Headings use semi-bold weights with tight tracking to evoke a professional, structured feel. Body copy uses a generous line height (1.625) to prevent fatigue during long reading sessions.

## Spacing

A strict 4px/8px baseline grid is used. Larger sections utilize 'lg' (24px) for grouped elements and 'xl' (48px) for major document section breaks.

## Layout

- **Sidebar Stack**: Fixed-width (256px) left column with flex-column navigation.
- **Main Layer**: Flex-1 container with a centered readable-width editor (700px max-width).
- **Layering**: Header is sticky (z-30) with a backdrop-blur. The floating toolbar (z-30) stays anchored at the bottom-center.

## Elevation & Depth

- **Base**: Flat white.
- **Level 1**: Sidebar/Header with subtle 1px border separation.
- **Level 2**: Hover states on cards and buttons use soft shadows (0 0 10px rgba(0,0,0,0.05)).
- **Level 3**: Floating toolbars and active modals use high-diffusion shadows (0 8px 30px rgba(0,0,0,0.12)).

## Shapes

Use 'md' (6px) for standard interface elements like buttons and inputs. Use 'lg' (8px) for container-level components like code blocks and the editor's focus states.

## Components

- **Sidebar Nav**: Vertical list of links with semi-transparent active states and hover-based translation effects.
- **Editor**: A contenteditable-driven canvas with custom placeholder rendering via the :before pseudo-element.
- **Task Checklist**: Interactive list items with hidden-until-hover drag handles and custom-styled checkbox inputs.
- **Code Simulator**: Mono-spaced block with syntax highlighting and a hover-activated copy utility.
- **Formatting Toolbar**: A floating button group with semantic separators and active toggle states.

## Motion

- **Hover-Translate**: Buttons and list items should translate -1px on Y-axis to provide tactile feedback.
- **Scale-Active**: Interactive icons and buttons scale to 0.9x or 0.95x on click.
- **Transitions**: All background-color and shadow changes follow the 300ms standard curve.

## Do's and Don'ts

- **Do** use zinc-50 for hover backgrounds on white surfaces.
- **Do** maintain the 700px max-width for long-form text content.
- **Don't** use vibrant colors for navigation icons; keep them zinc-400 until hover.
- **Don't** use heavy borders; prefer zinc-200 at 50-80% opacity.

## Accessibility

- Maintain a minimum contrast ratio of 4.5:1 for body text (zinc-700 on white).
- Every interactive button must have a clear :active scale state for mobile touch feedback.
- Use focus-within rings (zinc-200/50) for search inputs to assist keyboard navigation.
