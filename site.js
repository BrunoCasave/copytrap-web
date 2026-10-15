(() => {
  'use strict';
  const english = {
    heading:'Our official website is on its way.',
    body:'Game details and release news will appear here.',
    release:'Planned for March 2027', contact:'Contact ↗',
    art:'Copy Trap title artwork'
  };
  const japanese = Object.fromEntries([...document.querySelectorAll('[data-copy]')].map(el => [el.dataset.copy, el.textContent]));
  japanese.art = document.querySelector('[data-alt="art"]').alt;
  function setLanguage(lang, updateUrl = false) {
    const copy = lang === 'en' ? english : japanese;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-copy]').forEach(el => { el.textContent = copy[el.dataset.copy]; });
    document.querySelector('[data-alt="art"]').alt = copy.art;
    document.querySelectorAll('[data-lang]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.lang === lang)));
    document.title = lang === 'en' ? 'Copy Trap — Coming Soon' : 'Copy Trap — 公式サイト準備中';
    if (updateUrl) {
      const url = new URL(location.href); url.searchParams.set('lang', lang);
      try { history.replaceState(null, '', url); } catch { /* Local file previews may restrict history. */ }
    }
  }
  document.querySelectorAll('[data-lang]').forEach(el => el.addEventListener('click', () => setLanguage(el.dataset.lang, true)));
  const lang = new URL(location.href).searchParams.get('lang');
  setLanguage(lang === 'ja' || lang === 'en' ? lang : navigator.language.startsWith('ja') ? 'ja' : 'en');
})();
