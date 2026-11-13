import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, access } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { createPostRoutes, slugify } from '../public/scripts/post-routes.js';
import { listPosts } from '../lib/posts.js';
import { server } from '../server.js';

const build = site => execFileSync(process.execPath, ['scripts/build.js'], {env:{...process.env,SITE_URL:site},stdio:'pipe'});
test('title routes are portable, unique and retain filename aliases', () => {
 assert.equal(slugify('Héllo World!'), 'hello-world');
 for (const slug of ['..','a/b','CON','x%20','x.']) assert.throws(()=>createPostRoutes([{slug,title:'Hello'}]));
 assert.throws(()=>createPostRoutes([{slug:'a',title:'Hello'},{slug:'b',title:'Hello'}]));
 assert.throws(()=>createPostRoutes([{slug:'hello',title:'Other'},{slug:'b',title:'Hello'}]));
});
test('local static build, project base, filtering, aliases and preview', async () => {
 build('https://example.test/template/');
 try {
 const posts = createPostRoutes(listPosts());
 for (const post of posts) {
   const html = await readFile(`dist/blog/${post.route}/index.html`,'utf8');
   assert.equal(await readFile(`dist/blog/${post.slug}/index.html`,'utf8'),html);
   assert.match(html, /<article>/);
   assert.match(html, /discord-timestamp/);
   assert.ok(html.includes(`https://example.test/template/blog/${post.route}/`));
   assert.doesNotMatch(html, /api.free-time.me|blog.free-time.me|Loading…/);
 }
 await assert.rejects(access('dist/CNAME'));
 const html = await readFile('dist/blog/index.html','utf8');
 const dom = new JSDOM(html,{url:'https://example.test/template/blog/?category=missing,other',runScripts:'outside-only'});
 let source = await readFile('public/scripts/blog.js','utf8');
 source = source.replace(/^import .*;\n/gm,'');
 dom.window.eval(`const base='/template';const routes=[];const postPath=s=>'/blog/'+s+'/';\n${source}`);
 assert.equal(dom.window.document.title,'My Blogs: missing & other');
 assert.equal(dom.window.document.querySelector('#empty-posts').hidden,false);
 assert.ok([...dom.window.document.querySelector('#post-list').children].every(n=>n.hidden));
 assert.equal(dom.window.document.querySelector('.brand').getAttribute('href'),'/template/');
 dom.window.close();
 // Preview uses the same deployment prefix as the artifact.
 process.env.SITE_URL='https://example.test/template/';
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin = `http://127.0.0.1:${server.address().port}`;
 try {
 for (const [path,status] of [['/template/',200],['/template/blog/',200],['/template/blog/'+posts[0].route+'/',200],['/template/missing',404],['/outside',404]]) {
   assert.equal((await fetch(origin+path)).status,status,path);
 }
 const head = await fetch(origin+'/template/',{method:'HEAD'}); assert.equal(await head.text(),'');
 assert.equal((await fetch(origin+'/template/',{method:'POST'})).status,405);
 assert.equal((await fetch(origin+'/template/%zz')).status,400);
 } finally { await new Promise(resolve=>server.close(resolve)); delete process.env.SITE_URL; }
 } finally { build(''); }
});
test('theme persistence and timestamp styles tolerate invalid dates', async () => {
 const dom = new JSDOM('<button class="theme-toggle"></button><time class="discord-timestamp" data-timestamp="1788281760" data-style="R"></time><time class="discord-timestamp" data-timestamp="99999999999999999999"></time>',{url:'https://example.test/',runScripts:'outside-only'});
 dom.window.localStorage.setItem('theme','dark');
 dom.window.setInterval = () => 0;
 const source = (await readFile('public/scripts/theme.js','utf8')).replace('export function','function');
 dom.window.eval(source);
 assert.ok(dom.window.document.body.classList.contains('dark-mode'));
 const button = dom.window.document.querySelector('button');
 assert.equal(button.getAttribute('aria-pressed'),'true');
 button.click();
 assert.equal(dom.window.localStorage.getItem('theme'),'light');
 assert.equal(button.getAttribute('aria-pressed'),'false');
 assert.ok(dom.window.document.querySelector('time').dateTime);
 assert.equal(dom.window.document.querySelectorAll('time')[1].textContent,'');
 dom.window.close();
});
