# Archived self-hosted fonts

These font files powered the earlier City-inspired design. The current
interface uses the platform system font stack and does not preload or precache
them; they remain here only as licensed design-history assets. Both families
are available under the SIL Open Font License 1.1 (full text in `OFL.txt`).

| File | Family | Copyright |
|---|---|---|
| `source-sans-3-latin.woff2`, `source-sans-3-italic-latin.woff2` | [Source Sans 3](https://fonts.google.com/specimen/Source+Sans+3) | 2010–2023 Adobe Systems Incorporated |
| `teko-latin.woff2` | [Teko](https://fonts.google.com/specimen/Teko) | 2023 The Teko Project Authors |

Each file is a **variable** font covering its whole declared weight range in one
file (Source Sans 3 400–700, Teko 500–700), subset to **latin** only.

If a future design deliberately restores them, add local `@font-face`
declarations and PWA caching at the same time so installed typography stays
available offline.
