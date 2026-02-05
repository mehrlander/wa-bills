(() => {
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
  const L = { D: 1, L: 2, LR: 3, U: 4, UR: 5 };
  const LN = { 1: 'digit', 2: 'lower', 3: 'lower-roman', 4: 'upper', 5: 'upper-roman' };
  const isR = s => /^(m{0,4})(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3})$/i.test(s) && s.length > 0;

  const getT = (m, pM, pL) => {
    const low = m.toLowerCase(), isL = m === low;
    if (/^\d+$/.test(m)) return L.D;
    if (m.length > 1 && isR(m)) return isL ? L.LR : L.UR;
    if (m.length === 1 && /^[ivx]$/i.test(m)) {
      const pCode = pM?.toLowerCase().charCodeAt(0);
      return (pL === (isL ? L.L : L.U) && low.charCodeAt(0) === pCode + 1) ? (isL ? L.L : L.U) : (isL ? L.LR : L.UR);
    }
    return /^[a-z]+$/i.test(m) ? (isL ? L.L : L.U) : null;
  };

  const getOwnDeco = (el) => {
    if (el.closest('a')) return null;
    const s = getComputedStyle(el).textDecoration, ps = el.parentElement ? getComputedStyle(el.parentElement).textDecoration : '';
    if (s === ps) return null;
    return s.includes('line-through') ? 'del' : s.includes('underline') ? 'ins' : null;
  };

  const state = { pM: null, pL: null, path: [] };
  const getHier = (ms, isDel) => {
    if (!ms.length) return { level: 0, levelName: '', path: '', ms: '' };
    let deep = 0;
    ms.forEach(m => {
      const t = getT(m, state.pM, state.pL) || L.D;
      if (t > deep) deep = t;
      if (!isDel) {
        while (state.path.length && state.path[state.path.length - 1].level >= t) state.path.pop();
        state.path.push({ m, level: t });
        [state.pM, state.pL] = [m, t];
      }
    });
    return { level: deep, levelName: LN[deep] || '', path: state.path.map(p => `(${p.m})`).join(''), ms: ms.map(m => `(${m})`).join('') };
  };

  $$('span[style*="font-weight:bold"]').filter(s => /^Sec\.\s+\d+\./.test(s.textContent.trim()) && !s.closest('[data-section]')).forEach(sec => {
    const start = sec.closest('div');
    if (!start) return;
    const nodes = [start];
    let n = start.nextElementSibling;
    while (n && !n.textContent.includes('--- END ---') && !$$('span[style*="font-weight:bold"]', n).some(s => /^Sec\.\s+\d+\./.test(s.textContent))) {
      nodes.push(n); n = n.nextElementSibling;
    }
    const wrap = document.createElement('div');
    wrap.dataset.section = sec.textContent.match(/\d+/)[0];
    wrap.dataset.isNew = start.textContent.includes('NEW SECTION');
    start.before(wrap); 
    wrap.append(...nodes);
  });

  const divMap = new Map();
  $$('div:not([data-section])').forEach(div => {
    if (div.querySelector('div')) return;
    const mMatch = (div.textContent || '').trim().match(/^\s*(?:\(\([^)]+\)\))?((?:\([^)]+\))+)/);
    const ms = mMatch?.[1]?.match(/\(([^()]+)\)/g)?.map(x => x.replace(/[()]/g, '')) || [];
    if (ms.length) divMap.set(div, getHier(ms, getComputedStyle(div).textDecoration.includes('line-through')));
  });

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, n => n.textContent.trim() ? 1 : 2);
  const rows = [];
  let n;
  while (n = walker.nextNode()) {
    const p = n.parentElement;
    if (['SCRIPT', 'STYLE'].includes(p.tagName)) continue;
    let type = getOwnDeco(p);
    if (type === 'del') {
      const b = p.previousSibling?.textContent?.trimEnd().endsWith('(('), a = p.nextSibling?.textContent?.trimStart().startsWith('))');
      type = (b && a) ? 'del' : b ? 'del-start' : a ? 'del-end' : 'del-middle';
    } else if (type === 'ins') type = n.textContent.trim() === 'NEW SECTION.' ? 'ins-new-section' : 'ins';
    
    const h = divMap.get(p.closest('div:not([data-section])')) || { level: 0, levelName: '', path: '', ms: '' };
    const sec = p.closest('[data-section]');
    rows.push({ 
      sec: sec?.dataset.section || '', 
      isNew: sec?.dataset.isNew === 'true', 
      type: type || '', 
      level: h.level,
      levelName: h.levelName,
      path: h.path, 
      text: n.textContent.trim().slice(0, 80) 
    });
  }

  console.table(rows);
  return rows;
})();
