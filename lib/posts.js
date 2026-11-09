import fs from 'node:fs';
import path from 'node:path';

const postsDirectory = () => path.join(process.cwd(), 'public', 'blogs');

export function readPost(slug) {
    if (typeof slug !== 'string' || !slug || /[\\/\x00]/.test(slug) || slug === '.' || slug === '..') {
        return null;
    }

    let markdown;
    try {
        markdown = fs.readFileSync(path.join(postsDirectory(), `${slug}.md`), 'utf8');
    } catch (error) {
        if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return null;
        throw error;
    }

    const title = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim()
        || slug.replace(/[-_]+/g, ' ');
    const categoryLine = markdown.match(/^.*Categories:\s*(.*?)\s*$/im)?.[1] || '';
    const categories = [...new Set(categoryLine.replace(/\*\*|__/g, '').split(',')
        .map(category => category.trim()).filter(Boolean))];

    return { slug, title, categories, markdown };
}

export function listPosts() {
    return fs.readdirSync(postsDirectory(), { withFileTypes: true })
        .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
        .map(entry => readPost(entry.name.slice(0, -3)))
        .filter(Boolean);
}
