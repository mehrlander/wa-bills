(() => {
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
  
  const getOwnDeco = (el) => {
    if (el.closest('a')) return null;
    const style = getComputedStyle(el).textDecoration;
    const pStyle = el.parentElement ? getComputedStyle(el.parentElement).textDecoration : '';
    if (style === pStyle) return null;
    if (style.includes('line-through')) return 'del';
    if (style.includes('underline')) return 'ins';
    return null;
  };

  // 1. Group Sections
  $$('span[style*="font-weight:bold"]')
    .filter(s => /^Sec\.\s+\d+\./.test(s.textContent.trim()) && !s.closest('[data-section]'))
    .forEach(sec => {
      const startDiv = sec.closest('div');
      if (!startDiv) return;
      const nodes = [startDiv];
      let next = startDiv.nextElementSibling;
      while (next && !next.textContent.includes('--- END ---') && !$$('span[style*="font-weight:bold"]', next).some(s => /^Sec\.\s+\d+\./.test(s.textContent))) {
        nodes.push(next);
        next = next.nextElementSibling;
      }
      const wrap = document.createElement('div');
      wrap.dataset.section = sec.textContent.match(/\d+/)[0];
      if (startDiv.textContent.includes('NEW SECTION')) wrap.dataset.isNew = "true";
      
      startDiv.before(wrap);
      wrap.append(...nodes);
    });

  // 2. Parse Text Nodes
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, n => n.textContent.trim() ? 1 : 2);
  const rows = [];
  let n;
  while (n = walker.nextNode()) {
    const p = n.parentElement;
    if (['SCRIPT', 'STYLE'].includes(p.tagName)) continue;
    let type = getOwnDeco(p);
    if (type === 'del') {
      const b = p.previousSibling?.textContent?.trimEnd().endsWith('((');
      const a = p.nextSibling?.textContent?.trimStart().startsWith('))');
      type = (b && a) ? 'del' : b ? 'del-start' : a ? 'del-end' : 'del-middle';
    } else if (type === 'ins') {
      type = n.textContent.trim() === 'NEW SECTION.' ? 'ins-new-section' : 'ins';
    }
    const secWrap = p.closest('[data-section]');
    rows.push({
      sec: secWrap?.dataset.section || '',
      isNew: !!secWrap?.dataset.isNew,
      type: type || '',
      text: n.textContent.trim().slice(0, 80)
    });
  }
  console.table(rows);
  return rows;
})();
