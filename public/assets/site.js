(() => {
  const panel = document.querySelector('[data-search-panel]');
  const input = document.querySelector('[data-search-input]');
  const results = document.querySelector('[data-search-results]');
  const open = document.querySelector('[data-search-open]');
  const close = document.querySelector('[data-search-close]');
  const articles = window.__OFFSET_ARTICLES__ || [];

  function render(query = '') {
    if (!results) return;
    const q = query.trim().toLocaleLowerCase();
    const filtered = q ? articles.filter(a => `${a.title} ${a.excerpt} ${a.category}`.toLocaleLowerCase().includes(q)) : articles.slice(0, 8);
    results.innerHTML = filtered.length ? filtered.map(a => `
      <a class="search-result" href="${a.url}">
        <small>${escapeHtml(a.category || 'ARTICLE')} · ${escapeHtml(a.date)}</small>
        <strong>${escapeHtml(a.title)}</strong>
      </a>`).join('') : '<div class="empty">Nothing found.</div>';
  }

  function escapeHtml(value='') {
    return String(value).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  function showSearch() {
    if (!panel) return;
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    render(input?.value || '');
    setTimeout(() => input?.focus(), 30);
  }
  function hideSearch() {
    if (!panel) return;
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    open?.focus();
  }

  open?.addEventListener('click', showSearch);
  close?.addEventListener('click', hideSearch);
  input?.addEventListener('input', e => render(e.target.value));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel?.classList.contains('is-open')) hideSearch();
    if (e.key === '/' && !panel?.classList.contains('is-open') && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) {
      e.preventDefault(); showSearch();
    }
  });

  document.querySelectorAll('[data-share]').forEach(button => {
    button.addEventListener('click', async () => {
      const url = button.dataset.shareUrl || location.href;
      const title = button.dataset.shareTitle || document.title;
      const original = button.textContent;
      try {
        if (navigator.share) {
          await navigator.share({ title, url });
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(url);
          button.textContent = 'COPIED ✓';
          setTimeout(() => button.textContent = original, 1500);
        } else {
          window.prompt('Copy this link:', url);
        }
      } catch (error) {
        if (error?.name !== 'AbortError') window.prompt('Copy this link:', url);
      }
    });
  });
})();
