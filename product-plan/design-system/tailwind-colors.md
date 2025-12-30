# Tailwind Color Configuration

## Color Choices

- **Primary:** `teal` — Used for buttons, links, key accents, active navigation states
- **Secondary:** `rose` — Used for notifications, alerts, warnings
- **Neutral:** `slate` — Used for backgrounds, text, borders, subtle UI elements

## Usage Examples

**Primary button:**
```
bg-teal-600 hover:bg-teal-700 text-white
```

**Secondary badge:**
```
bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200
```

**Neutral text:**
```
text-slate-600 dark:text-slate-400
```

**Active navigation:**
```
bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300
```

## Color Scale Reference

All colors use Tailwind's built-in color scales (50-950). Examples:

- `teal-50` — Lightest teal
- `teal-600` — Primary teal (default for buttons)
- `teal-950` — Darkest teal

- `rose-100` — Light rose (badges)
- `rose-600` — Primary rose (alerts)

- `slate-100` — Light gray background
- `slate-600` — Body text
- `slate-900` — Headings, dark text
