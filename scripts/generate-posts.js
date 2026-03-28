// scripts/generate-posts.js
// Scans the posts/ directory, reads metadata from each HTML file,
// and writes posts.json to the site root.
//
// Metadata is read from <meta> tags in each post file:
//   <meta name="post-title"   content="..." />
//   <meta name="post-date"    content="YYYY-MM-DD" />
//   <meta name="post-tags"    content="tag one, tag two" />
//   <meta name="post-excerpt" content="A short teaser." />

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = join(__dirname, '..', 'posts');
const OUTPUT    = join(__dirname, '..', 'posts.json');

// Pull a single <meta name="X" content="Y"> value from raw HTML
function getMeta(html, name) {
  const re = new RegExp(
    `<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`,
    'i'
  );
  const m = html.match(re);
  if (m) return m[1].trim();

  // Also match content-before-name order
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`,
    'i'
  );
  const m2 = html.match(re2);
  return m2 ? m2[1].trim() : null;
}

async function main() {
  let files;
  try {
    files = await readdir(POSTS_DIR);
  } catch {
    console.error(`Could not read posts directory: ${POSTS_DIR}`);
    process.exit(1);
  }

  const htmlFiles = files.filter(f => f.endsWith('.html'));

  if (htmlFiles.length === 0) {
    console.log('No post files found — writing empty posts.json');
    await writeFile(OUTPUT, JSON.stringify([], null, 2));
    return;
  }

  const posts = [];

  for (const file of htmlFiles) {
    const filepath = join(POSTS_DIR, file);
    const html = await readFile(filepath, 'utf8');

    const title   = getMeta(html, 'post-title');
    const date    = getMeta(html, 'post-date');
    const tags    = getMeta(html, 'post-tags');
    const excerpt = getMeta(html, 'post-excerpt');

    if (!title || !date) {
      console.warn(`Skipping ${file} — missing post-title or post-date meta tag`);
      continue;
    }

    posts.push({
      title,
      date,
      tags:    tags ? tags.split(',').map(t => t.trim()) : [],
      excerpt: excerpt || '',
      url:     `posts/${file}`,
    });
  }

  // Sort newest first
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  await writeFile(OUTPUT, JSON.stringify(posts, null, 2));
  console.log(`Wrote ${posts.length} post(s) to posts.json`);
}

main();