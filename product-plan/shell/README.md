# Application Shell

## Overview

The CoParent shell provides a calm, professional navigation experience that wraps all sections. It uses a sidebar pattern that keeps navigation accessible while maximizing content space. The design emphasizes trust and clarity, reflecting the "Calm Harbor" aesthetic.

## Navigation Structure

- **Dashboard** → Home/overview (default landing)
- **Calendar** → Calendar & Scheduling section
- **Messages** → Messaging & Permissions section
- **Expenses** → Expenses & Finances section
- **Documents** → Information Repository section
- **Timeline** → Timeline & Photos section
- **Settings** → User preferences (bottom section, separated)

## User Menu

- Location: Bottom of sidebar, above settings
- Contents:
  - User avatar (initials-based, gradient background)
  - User name
  - Role label ("Parent")
  - Logout action (via dropdown or settings)

## Layout Pattern

- Fixed sidebar navigation on the left (260px width)
- Logo and app name at sidebar top with border separator
- Main navigation items with icons
- Settings separated at bottom with border
- User card at very bottom
- Content area fills remaining space with padding

## Responsive Behavior

- **Desktop (1024px+):** Fixed 260px sidebar, content fills remaining space
- **Tablet (768px-1023px):** Collapsible sidebar with hamburger toggle, overlay when open
- **Mobile (<768px):** Sidebar becomes slide-out drawer, hamburger menu in header

## Design Notes

- Uses teal (primary) for active states and key accents
- Uses rose (secondary) for notifications and alerts
- Uses slate (neutral) for backgrounds, text, and borders
- Inter font for all text
- Icons from lucide-react, 20px size
- Active nav items have teal background tint and teal text
- Hover states use subtle background change
- Smooth transitions (200ms) on all interactive elements

## Components Provided

- `AppShell.tsx` — Main layout wrapper
- `MainNav.tsx` — Navigation component with all nav items
- `UserMenu.tsx` — User menu with avatar and logout

## Props

### AppShell

- `children` — Content to render in main area
- `userName` — Current user's name
- `userAvatar` — Optional avatar URL (shows initials if not provided)
- `onLogout` — Callback when user clicks logout
- `activePath` — Current route path for highlighting active nav item

### MainNav

- `activePath` — Current route for highlighting active item
- `onNavigate` — Callback when nav item is clicked (receives path)

### UserMenu

- `userName` — User's name to display
- `userAvatar` — Optional avatar URL
- `onLogout` — Logout callback

## Visual Reference

See screenshots for shell design (if available).
