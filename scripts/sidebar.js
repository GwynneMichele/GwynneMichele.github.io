// scripts/sidebar.js
// Fetches posts.json and populates the #sidebar-recent-posts element.
// Include on every page that has a sidebar.
//
// Automatically resolves the correct path to posts.json whether the
// current page is at the root or one folder deep (posts/, projects/, pages/).

const SIDEBAR_COUNT = 3;

async function initSidebar() {
  const el = document.getElementById('sidebar-recent-posts');
  if (!el) return;

  // Resolve path to posts.json relative to current page depth
  const depth = (window.location.pathname.match(/\//g) || []).length - 1;
  const prefix = depth > 1 ? '../' : '';
  const url = `${prefix}posts.json`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const posts = await res.json();

    const recent = posts.slice(0, SIDEBAR_COUNT);

    if (recent.length === 0) {
      el.innerHTML = '<li><span class="post-date">No posts yet.</span></li>';
      return;
    }

    el.innerHTML = recent.map(p => `
      <li>
        <a href="${prefix}${p.url}">${p.title}</a>
        <span class="post-date">${p.date}</span>
      </li>
    `).join('');

  } catch (err) {
    console.warn('sidebar.js: could not load posts.json', err);
    el.innerHTML = '<li><span class="post-date">—</span></li>';
  }
}

initSidebar();