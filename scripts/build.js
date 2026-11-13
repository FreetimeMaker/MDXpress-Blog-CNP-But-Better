import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { listPosts } from '../lib/posts.js';
import { createPostRoutes, postPath } from '../public/scripts/post-routes.js';

process.chdir(fileURLToPath(new URL('../', import.meta.url)));
const configured = process.env.SITE_URL || '';
const site = configured ? new URL(configured) : null;
if (site && (!['http:', 'https:'].includes(site.protocol) || site.search || site.hash || site.username || site.password)) throw new Error('SITE_URL must be an HTTP(S) URL without credentials, query or fragment');
const base = site ? site.pathname.replace(/\/$/, '') : '';
const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const purify = createDOMPurify(new JSDOM('').window);
const render = markdown => purify.sanitize(marked.parse(markdown.replace(/^# .*\n?/gm, '').replace(/^.*Categories:.*\n?/gim, '').replace(/<t:(\d+)(?::([tTdDfFR]))?>/g, (_, stamp, style='f') => `<time class="discord-timestamp" data-timestamp="${stamp}" data-style="${style}"></time>`)));
// Validate all title/filename paths before touching the previous build.
const posts = createPostRoutes(listPosts());
const template = await readFile('public/views/home.html', 'utf8');
const url = path => base + path;
function page(title, content, canonical, back='/blog/') {
  return template.replaceAll('{{title}}', escape(title)).replace('{{content}}', () => content)
    .replace('href="/blog"', `href="${back}"`)
    .replace(/(href|src)="\/(?!\/)/g, `$1="${base}/`)
    .replace('</head>', `${canonical ? `<link rel="canonical" href="${escape(site ? site.origin + url(canonical) : url(canonical))}">` : ''}</head>`)
    .replace('</body>', `<script type="module" src="${url('/scripts/blog.js')}"></script></body>`);
}
async function write(path, text) { await mkdir(`dist/${path.substring(0,path.lastIndexOf('/'))}`, {recursive:true}); await writeFile(`dist/${path}`, text); }
await rm('dist', {recursive:true, force:true});
await mkdir('dist', {recursive:true});
for (const dir of ['styles','favicons','scripts']) await cp(`public/${dir}`, `dist/${dir}`, {recursive:true});
const home = await readFile('public/md/index.md','utf8');
await write('index.html', page(home.match(/^# (.+)/m)?.[1] || 'Homepage', render(home), '/', '/blog/'));
const categories = [...new Set(posts.flatMap(p=>p.categories))].sort();
const filterUrl = category => url('/blog/') + '?category=' + encodeURIComponent(category);
const tags = values => values.map(c=>`<a class="category-tag" href="${escape(filterUrl(c))}">${escape(c)}</a>`).join(' ');
const cloud = `<div id="category-filter" class="categories-container"><strong>Filter by:</strong> ${tags(categories)}</div>`;
const items = posts.map(p=>`<li data-categories="${escape(JSON.stringify(p.categories))}"><a href="${url(postPath(p.route))}">${escape(p.title)}</a> <span class="categories">${tags(p.categories)}</span></li>`).join('');
await write('blog/index.html', page('My Blogs', `${cloud}<ul id="post-list">${items}</ul><p id="empty-posts"${posts.length ? ' hidden' : ''}>No posts found.</p>`, '/blog/', '/'));
for (const post of posts) {
 const html = page(post.title, `<div class="categories-container">${tags(post.categories)}</div><article>${render(post.markdown)}</article>`, postPath(post.route));
 for (const slug of new Set([post.route,post.slug])) await write(`blog/${slug}/index.html`, html);
}
await write('scripts/site-data.js', `export const base = ${JSON.stringify(base)};\nexport const routes = ${JSON.stringify(posts.map(({slug,route})=>({slug,route})))};\n`);
await write('404.html', page('Page not found', '<p>This page does not exist.</p>', null, '/'));
await write('.nojekyll','');
console.log(`Generated homepage and ${posts.length} local posts with filename aliases (base: ${base || '/'}).`);
