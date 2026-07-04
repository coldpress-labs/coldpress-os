# Prototype Mode: clickable-html

HTML/CSS prototype with brand tokens applied. Authored by `prototype` skill Step 2 when `mode == clickable-html` (typically `design-led` or `WDS` archetype).

## Expected directory shape

```
_context/design/prototype/{date}/
├── manifest.json
├── index.html                            # entry / nav / hub
├── tokens.css                            # imports brand-guidelines tokens
├── style.css                             # shared layout
├── screens/
│   ├── <screen-name>.html               # one per ux-design-spec Section 4 entry
│   └── ...
└── assets/                               # images / icons / fonts
```

OR `external-tool-reference.md` if user prefers a Figma/Penpot/etc. link instead of HTML.

## index.html (hub)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prototype — <Project Name></title>
  <link rel="stylesheet" href="tokens.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header role="banner">
    <h1>Prototype</h1>
  </header>
  <main role="main">
    <h2>Screens</h2>
    <ul>
      <li><a href="screens/<screen-name>.html"><Screen Name></a></li>
      <!-- one per screen -->
    </ul>
  </main>
</body>
</html>
```

## tokens.css (CSS custom properties from brand-guidelines)

```css
:root {
  /* Colour */
  --color-primary: <from brand-guidelines>;
  /* Typography */
  --font-body: <from brand-guidelines>;
  /* Spacing */
  --space-md: <from brand-guidelines>;
  /* Motion */
  --duration-quick: <from brand-guidelines>;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-quick: 0ms;
  }
}
```

## screen template

```html
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Screen: <Name></title>
  <link rel="stylesheet" href="../tokens.css"><link rel="stylesheet" href="../style.css">
</head>
<body>
  <!-- PRD US-7 AC-1: Search input must accept query within 300ms -->
  <main role="main">
    <!-- screen content per ux-design-spec wireframe -->
  </main>
  <nav><a href="../index.html">← Back to hub</a></nav>
</body>
</html>
```
