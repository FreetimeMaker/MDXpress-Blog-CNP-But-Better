import { base, routes } from './site-data.js';
import { postPath } from './post-routes.js';

const params = new URLSearchParams(location.search);
const legacy = params.get('post');
const canonical = document.querySelector('link[rel="canonical"]');
if (legacy) {
  const post = routes.find(p => p.slug === legacy);
  if (post) location.replace(base + postPath(post.route) + location.hash);
} else if (canonical && location.pathname.startsWith(base + '/blog/')) {
  const target = new URL(canonical.href);
  if (target.pathname !== location.pathname) history.replaceState(null, '', target.pathname + location.search + location.hash);
}
const list = document.querySelector('#post-list');
if (list) {
  const filters = [...new Set((params.get('category') || '').split(',').map(s=>s.trim()).filter(Boolean))];
  const matches = (a,b) => a.toLowerCase() === b.toLowerCase();
  const title = filters.length ? `My Blogs: ${filters.length > 1 ? filters.slice(0,-1).join(', ') + ' & ' + filters.at(-1) : filters[0]}` : 'My Blogs';
  document.title = title;
  document.querySelector('h1 strong').textContent = title;
  for (const link of document.querySelectorAll('#category-filter a')) {
    const category = link.textContent;
    const active = filters.some(f=>matches(f,category));
    const next = active ? filters.filter(f=>!matches(f,category)) : [...filters,category];
    link.href = base + '/blog/' + (next.length ? '?category=' + encodeURIComponent(next.join(',')) : '');
    link.classList.toggle('active',active);
    if (active) link.textContent += ' ✕';
  }
  if (filters.length) {
    const clear = document.createElement('a'); clear.textContent = 'Clear All'; clear.href = base + '/blog/';
    document.querySelector('#category-filter').append(clear);
  }
  let count = 0;
  for (const item of list.children) {
    item.hidden = !filters.every(f=>JSON.parse(item.dataset.categories).some(c=>matches(c,f)));
    if (!item.hidden) count++;
  }
  const empty = document.querySelector('#empty-posts');
  empty.hidden = count > 0;
  empty.textContent = filters.length ? `No posts found matching all selected categories: ${filters.join(', ')}` : 'No posts found.';
}
