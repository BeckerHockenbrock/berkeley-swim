# Self-hosted fonts

Both families are used under the SIL Open Font License 1.1 (full text in
`OFL.txt`). They were previously loaded from `fonts.googleapis.com`; serving
them from this origin drops a render-blocking third-party request, keeps the
installed PWA's typography working offline, and avoids sending visitor IPs to
Google.

| File | Family | Copyright |
|---|---|---|
| `source-sans-3-latin.woff2`, `source-sans-3-italic-latin.woff2` | [Source Sans 3](https://fonts.google.com/specimen/Source+Sans+3) | 2010–2023 Adobe Systems Incorporated |
| `teko-latin.woff2` | [Teko](https://fonts.google.com/specimen/Teko) | 2023 The Teko Project Authors |

Each file is a **variable** font covering its whole declared weight range in one
download (Source Sans 3 400–700, Teko 500–700), subset to **latin** only — the
app is English-only. That's ~58 KB for the entire type system.

To refresh them, re-request the Google Fonts CSS2 API with a modern browser
user-agent, keep only the `/* latin */` `@font-face` blocks, and download the
`.woff2` each one points at. The `@font-face` declarations live in
`src/index.css`.
