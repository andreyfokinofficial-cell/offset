import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const contentDir = path.join(root, 'content', 'articles');
const publicDir = path.join(root, 'public');
const distDir = path.join(root, 'dist');

function esc(s='') { return String(s).replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c])); }
function escAttr(s='') { return esc(s).replace(/'/g, '&#39;'); }
function fmtDate(iso='') {
  const [y,m,d] = String(iso).split('-');
  return y && m && d ? `${d}.${m}.${y}` : iso;
}

function unquote(value='') {
  const v = value.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    const inner = v.slice(1, -1);
    if (v.startsWith('"')) {
      return inner.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    return inner.replace(/''/g, "'");
  }
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null' || v === '~') return '';
  return v;
}

function parseFrontMatter(source, file) {
  const normalized = source.replace(/^\uFEFF/, '').replace(/\r/g, '');
  if (!normalized.startsWith('---\n')) {
    throw new Error(`${file}: article must start with YAML front matter delimited by ---`);
  }
  const end = normalized.indexOf('\n---\n', 4);
  if (end === -1) throw new Error(`${file}: closing --- for front matter was not found`);

  const header = normalized.slice(4, end);
  const body = normalized.slice(end + 5).trim();
  const data = {};

  for (const line of header.split('\n')) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const m = line.match(/^([A-Za-z][A-Za-z0-9_]*)\s*:\s*(.*)$/);
    if (!m) throw new Error(`${file}: invalid front matter line: ${line}`);
    data[m[1]] = unquote(m[2]);
  }
  return { data, body };
}

function inline(text='') {
  let s = esc(text);
  s = s.replace(/!\[([^\]]*)\]\(([^\s)]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_, alt, src, cap) => `<figure><img src="${src}" alt="${alt}" loading="lazy">${cap ? `<figcaption>${cap}</figcaption>` : ''}</figure>`);
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  return s;
}

function markdown(md='') {
  const lines = md.replace(/\r/g,'').split('\n');
  const out = [];
  let para = [];
  let list = null;
  let quote = [];
  const flushPara = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para=[]; } };
  const flushList = () => { if (list) { out.push(`</${list}>`); list=null; } };
  const flushQuote = () => { if (quote.length) { out.push(`<blockquote><p>${inline(quote.join(' '))}</p></blockquote>`); quote=[]; } };
  const flush = () => { flushPara(); flushList(); flushQuote(); };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { flush(); continue; }
    if (/^---+$/.test(line.trim())) { flush(); out.push('<hr>'); continue; }
    const h = line.match(/^(#{2,4})\s+(.+)$/);
    if (h) { flush(); out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); continue; }
    const q = line.match(/^>\s?(.*)$/);
    if (q) { flushPara(); flushList(); quote.push(q[1]); continue; }
    const ul = line.match(/^[-*]\s+(.+)$/);
    if (ul) { flushPara(); flushQuote(); if (list && list !== 'ul') flushList(); if (!list) { list='ul'; out.push('<ul>'); } out.push(`<li>${inline(ul[1])}</li>`); continue; }
    const ol = line.match(/^\d+\.\s+(.+)$/);
    if (ol) { flushPara(); flushQuote(); if (list && list !== 'ol') flushList(); if (!list) { list='ol'; out.push('<ol>'); } out.push(`<li>${inline(ol[1])}</li>`); continue; }
    const imageOnly = line.match(/^!\[([^\]]*)\]\(([^\s)]+)(?:\s+"([^"]*)")?\)$/);
    if (imageOnly) { flush(); out.push(`<figure><img src="${escAttr(imageOnly[2])}" alt="${escAttr(imageOnly[1])}" loading="lazy">${imageOnly[3] ? `<figcaption>${esc(imageOnly[3])}</figcaption>` : ''}</figure>`); continue; }
    flushQuote();
    para.push(line.trim());
  }
  flush();
  return out.join('\n');
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, {recursive:true});
  for (const entry of fs.readdirSync(src, {withFileTypes:true})) {
    const s = path.join(src, entry.name), d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDir(s,d) : fs.copyFileSync(s,d);
  }
}

function readArticles() {
  return fs.readdirSync(contentDir)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'))
    .map(file => {
      const source = fs.readFileSync(path.join(contentDir,file),'utf8');
      const {data, body} = parseFrontMatter(source, file);
      const fallbackSlug = path.basename(file, '.md');
      const a = {
        title: data.title || fallbackSlug,
        slug: data.slug || fallbackSlug,
        date: data.date || '',
        category: data.category || 'ARTICLE',
        excerpt: data.excerpt || '',
        featureImage: data.featureImage || '',
        featureImageAlt: data.featureImageAlt || '',
        draft: data.draft === true,
        body
      };
      if (!a.date) throw new Error(`${file}: date is required`);
      a._file = `content/articles/${file}`;
      a.url = `/articles/${a.slug}/`;
      a.displayDate = fmtDate(a.date);
      return a;
    })
    .filter(a => !a.draft)
    .sort((a,b)=> String(b.date).localeCompare(String(a.date)));
}

function searchData(articles) { return articles.map(a=>({title:a.title, excerpt:a.excerpt, category:a.category, date:a.displayDate, url:a.url})); }
function shell({title='OFFSET', description='Independent online publication', body, articles, canonical='/'}) {
  const data = JSON.stringify(searchData(articles)).replace(/</g,'\\u003c');
  return `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${escAttr(description)}">
<link rel="canonical" href="${canonical}"><link rel="stylesheet" href="/assets/styles.css">
<meta property="og:site_name" content="OFFSET"><meta property="og:title" content="${escAttr(title)}"><meta property="og:description" content="${escAttr(description)}"><meta property="og:type" content="article">
</head><body>
<header class="site-header shell"><a class="masthead" href="/" aria-label="OFFSET — главная">OFFSET</a><button class="search-open" type="button" data-search-open>SEARCH</button></header>
${body}
<footer class="site-footer shell"><span>OFFSET</span><span>© ${new Date().getFullYear()}</span></footer>
<div class="search-panel" data-search-panel aria-hidden="true"><div class="search-inner shell"><div class="search-top"><span class="search-label">SEARCH OFFSET</span><button class="action" type="button" data-search-close>CLOSE ×</button></div><input class="search-input" data-search-input type="search" placeholder="Search…" aria-label="Search articles"><div class="search-results" data-search-results></div></div></div>
<script>window.__OFFSET_ARTICLES__=${data};</script><script src="/assets/site.js" defer></script></body></html>`;
}

function card(a) {
  const image = a.featureImage ? `<a class="story-image-link" href="${a.url}" aria-label="Read ${escAttr(a.title)}"><img class="story-image" src="${escAttr(a.featureImage)}" alt="${escAttr(a.featureImageAlt || a.title)}" loading="lazy"></a>` : '';
  return `<article class="story-card ${a.featureImage ? 'has-image':''}"><div class="story-copy"><div class="meta"><span>${esc(a.category||'ARTICLE')}</span><time datetime="${escAttr(a.date)}">${esc(a.displayDate)}</time></div><h2 class="story-title"><a href="${a.url}">${esc(a.title)}</a></h2><p class="story-excerpt">${esc(a.excerpt||'')}</p><div class="story-actions"><a class="action" href="${a.url}">READ MORE →</a><button class="action" type="button" data-share data-share-url="${a.url}" data-share-title="${escAttr(a.title)}">SHARE ↗</button></div></div>${image}</article>`;
}

fs.rmSync(distDir,{recursive:true,force:true}); fs.mkdirSync(distDir,{recursive:true}); copyDir(publicDir,distDir);
const articles = readArticles();
const home = shell({ title:'OFFSET', description:'Independent online publication', articles, body:`<main class="shell"><section class="index-heading"><span>LATEST</span><span>${String(articles.length).padStart(2,'0')} ARTICLES</span></section><section class="story-list">${articles.map(card).join('\n')}</section></main>` });
fs.writeFileSync(path.join(distDir,'index.html'),home);

for (let i=0;i<articles.length;i++) {
  const a=articles[i], next=articles[i+1] || null;
  const dir=path.join(distDir,'articles',a.slug); fs.mkdirSync(dir,{recursive:true});
  const feature=a.featureImage ? `<figure class="article-feature"><img src="${escAttr(a.featureImage)}" alt="${escAttr(a.featureImageAlt||a.title)}"></figure>`:'';
  const nextHtml=next ? `<aside class="next shell"><span>NEXT</span><a href="${next.url}">${esc(next.title)} →</a></aside>`:'';
  const body=`<main class="article-page"><article><header class="article-header reading"><div class="meta"><span>${esc(a.category||'ARTICLE')}</span><time datetime="${escAttr(a.date)}">${esc(a.displayDate)}</time></div><h1 class="article-title">${esc(a.title)}</h1><p class="article-deck">${esc(a.excerpt||'')}</p><button class="action" type="button" data-share data-share-url="${a.url}" data-share-title="${escAttr(a.title)}">SHARE ↗</button></header>${feature}<div class="prose reading">${markdown(a.body)}</div><footer class="article-footer reading"><button class="action" type="button" data-share data-share-url="${a.url}" data-share-title="${escAttr(a.title)}">SHARE ARTICLE ↗</button></footer>${nextHtml}</article></main>`;
  fs.writeFileSync(path.join(dir,'index.html'), shell({title:`${a.title} — OFFSET`, description:a.excerpt||'', body, articles, canonical:a.url}));
}

const notFound=shell({title:'404 — OFFSET',description:'Page not found',articles,body:`<main class="error-page reading"><div class="meta"><span>404</span></div><h1>Page not found.</h1><a class="action" href="/">BACK TO OFFSET →</a></main>`});
fs.writeFileSync(path.join(distDir,'404.html'),notFound);

const siteUrl=(process.env.URL || process.env.DEPLOY_PRIME_URL || 'http://localhost:3000').replace(/\/$/,'');
const sitemap=['/'].concat(articles.map(a=>a.url)).map(u=>`<url><loc>${siteUrl}${u}</loc></url>`).join('');
fs.writeFileSync(path.join(distDir,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemap}</urlset>`);
fs.writeFileSync(path.join(distDir,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
console.log(`OFFSET built: ${articles.length} articles -> ${distDir}`);
