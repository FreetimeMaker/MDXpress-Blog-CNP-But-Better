# MD Blog Template

A minimal Markdown blog that builds to a static GitHub Pages site. Posts stay in
this repository: no remote API, database, serverless functions, or runtime server
is required on the deployed site.

## Local development

Use Node.js 24 or newer.

```sh
npm install
npm test
npm run dev
```

Open `http://localhost:3000`. `npm run dev` rebuilds once and starts a static
preview; rerun it after editing content. `PORT` changes the preview port.
`npm run build` produces `dist/`, which can be hosted by any static web server.

## Content and customization

- `public/md/index.md`: homepage Markdown.
- `public/blogs/*.md`: local posts, read through `lib/posts.js` at build time.
- First `# Heading`: post title. `Categories: News, Projects` (optionally bold)
  supplies categories; metadata and level-one headings are omitted from the body.
- Titles generate clean URLs, e.g. `Hello World!` → `/blog/hello-world/`.
  Filename URLs remain as static aliases with a canonical link. Duplicate titles,
  overlapping title/filename routes and unsafe filenames fail the build rather
  than silently replacing a post. Renaming a title changes its canonical URL;
  keep the filename stable to preserve that alias.
- Category selection is case-insensitive and requires **all** selected categories.
  Filters use `?category=News,Projects`; JavaScript is required for filtering,
  but the full listing and post content are pre-rendered and readable without it.
- Theme preference is saved locally. Discord-style timestamps such as
  `<t:1788281760:F>` and `<t:1788281760:R>` display in the reader's locale and
  timezone and refresh every 30 seconds. These enhancements require JavaScript.
- `public/views/home.html`, `public/styles/style.css`, and `public/favicons/`
  control branding and appearance. Rendered Markdown is sanitized at build time.

## GitHub Pages

1. Use this template and push your changes to `main`.
2. In repository **Settings → Pages**, select **GitHub Actions** as the source.
3. The included `.github/workflows/pages.yml` installs, tests, builds and deploys
   `dist/`. It obtains the site URL from Pages configuration, including the
   repository prefix for project sites.

For a manual build, set the complete deployment URL (including any path prefix):

```sh
SITE_URL=https://example.github.io/my-blog/ npm run build
SITE_URL=https://example.github.io/my-blog/ node server.js
```

Preview at `http://localhost:3000/my-blog/` in this case. Use the same `SITE_URL`
for build and preview. With no `SITE_URL`, builds target the domain root and use
root-relative canonical links. With it, canonical links are absolute. Internal
site navigation, assets and category links respect the prefix; author-written
root-relative Markdown links must include the desired deployment path themselves.

No production domain or CNAME is supplied. Configure your own custom domain in
Pages settings if desired. Generated output includes `.nojekyll`.

## Layout

```text
lib/posts.js              Local Markdown loader
scripts/build.js          Static HTML generation and sanitization
public/blogs/             Markdown posts
public/md/index.md        Homepage
public/scripts/           Theme, timestamps, category and alias navigation
public/views/home.html    Shared page template
server.js                 Local static preview only
 tests/site.test.js        Route, build, browser and preview regressions
```

`npm test` builds a temporary project-path configuration, checks the generated
pages and preview server, then restores a root-path build. No remote post service
is contacted. Obsolete Vercel handlers and routing configuration have been removed.

Crafted by [Freetime Maker](mailto:FreetimeMaker@proton.me), based on
[MDXpress Blog](https://github.com/eshan-singh78/MDXpress-Blog/).
