# iPhone / Safari cache fix

Replace only `index.html` with this version.

The important changes are:

```html
<link rel="stylesheet" href="styles.css?v=20260912-3">
<script src="script.js?v=20260912-3"></script>
```

The version query makes Safari treat the assets as new URLs instead of reusing an older cached `script.js`.

## Future updates

Whenever `script.js` or `styles.css` changes, increment the version in `index.html`.

Examples:

- `script.js?v=4`
- `styles.css?v=4`

or use a date/release number.

`data.json` already uses a changing query parameter in JavaScript, so its content is fetched fresh.
