# Typography Configuration

## Google Fonts Import

Add to your HTML `<head>` or CSS:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

## Font Usage

- **Headings:** Inter (weights: 600, 700)
- **Body text:** Inter (weights: 400, 500, 600)
- **Code/technical:** IBM Plex Mono (weights: 400, 500)

## Tailwind Configuration

If using Tailwind CSS, configure fonts in your theme:

```js
theme: {
  extend: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      mono: ['IBM Plex Mono', 'monospace'],
    },
  },
}
```

## Typography Scale

- **Headings:** Use `font-sans font-semibold` or `font-bold`
- **Body:** Use `font-sans font-normal` or `font-medium`
- **Labels:** Use `font-sans font-medium`
- **Code:** Use `font-mono`

## Design Aesthetic

The "Calm Harbor" aesthetic uses Inter's clean, professional letterforms to create a trustworthy, calming experience. Generous line height and spacing reduce visual stress.
