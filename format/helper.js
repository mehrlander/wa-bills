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

  const isolateDelParens = () => {
    $$('span').filter(el => getComputedStyle(el).textDecoration.includes('line-through')).forEach(delSpan => {
      const prev = delSpan.previousSibling;
      if (prev?.nodeType === 3 && prev.textContent.endsWith('((')) {
        const text = prev.textContent;
        if (text === '((') {
          const wrapper = document.createElement('span');
          wrapper.dataset.delOpen = 'true';
          wrapper.textContent = '((';
          prev.replaceWith(wrapper);
        } else {
          prev.textContent = text.slice(0, -2);
          const wrapper = document.createElement('span');
          wrapper.dataset.delOpen = 'true';
          wrapper.textContent = '((';
          delSpan.before(wrapper);
        }
      }

      const next = delSpan.nextSibling;
      if (next?.nodeType === 3 && next.textContent.trimStart().startsWith('))')) {
        const text = next.textContent;
        const trimmed = text.trimStart();
        const leadingWs = text.slice(0, text.length - trimmed.length);
        
        if (trimmed === '))') {
          const wrapper = document.createElement('span');
          wrapper.dataset.delClose = 'true';
          wrapper.textContent = text;
          next.replaceWith(wrapper);
        } else {
          const wrapper = document.createElement('span');
          wrapper.dataset.delClose = 'true';
          wrapper.textContent = leadingWs + '))';
          next.textContent = trimmed.slice(2);
          delSpan.after(wrapper);
        }
      }
    });
  };

  isolateDelParens();

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

  divMap.forEach((h, div) => {
    div.dataset.level = h.level;
    div.dataset.levelName = h.levelName;
    div.dataset.path = h.path;
    div.dataset.markers = h.ms;
  });

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, n => n.textContent.trim() ? 1 : 2);
  const rows = [];
  let n;
  while (n = walker.nextNode()) {
    const p = n.parentElement;
    if (['SCRIPT', 'STYLE'].includes(p.tagName)) continue;
    
    let type = null;
    if (p.dataset.delOpen) {
      type = 'del-open';
    } else if (p.dataset.delClose) {
      type = 'del-close';
    } else {
      type = getOwnDeco(p);
      if (type === 'del') {
        const b = p.previousSibling?.textContent?.trimEnd().endsWith('((') || p.previousElementSibling?.dataset.delOpen;
        const a = p.nextSibling?.textContent?.trimStart().startsWith('))') || p.nextElementSibling?.dataset.delClose;
        type = (b && a) ? 'del' : b ? 'del-start' : a ? 'del-end' : 'del-middle';
      } else if (type === 'ins') {
        type = n.textContent.trim() === 'NEW SECTION.' ? 'ins-new-section' : 'ins';
      }
    }
    
    const h = divMap.get(p.closest('div:not([data-section])')) || { level: 0, levelName: '', path: '', ms: '' };
    const sec = p.closest('[data-section]');
    rows.push({ 
      sec: sec?.dataset.section ? parseInt(sec.dataset.section, 10) : null, 
      isNew: sec?.dataset.isNew === 'true', 
      type: type || '', 
      level: h.level,
      levelName: h.levelName,
      path: h.path, 
      text: n.textContent.trim().slice(0, 80) 
    });
  }

  const isDel = t => t && t.startsWith('del');
  const isIns = t => t && t.startsWith('ins');
  
  let editIdx = 0;
  let runType = null;
  
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const curType = isDel(r.type) ? 'del' : isIns(r.type) ? 'ins' : null;
    
    if (curType) {
      if (curType === runType) {
        r._runIdx = editIdx;
        r._runType = runType;
      } else {
        editIdx++;
        runType = curType;
        r._runIdx = editIdx;
        r._runType = runType;
      }
    } else {
      runType = null;
    }
  }

  const runs = new Map();
  rows.forEach((r, i) => {
    if (r._runIdx) {
      const existing = runs.get(r._runIdx);
      if (existing) {
        existing.endRow = i;
      } else {
        runs.set(r._runIdx, { type: r._runType, startRow: i, endRow: i });
      }
    }
  });

  const runList = [...runs.entries()].sort((a, b) => a[1].startRow - b[1].startRow);
  
  for (let i = 0; i < runList.length - 1; i++) {
    const [delIdx, del] = runList[i];
    const [insIdx, ins] = runList[i + 1];
    if (del.type === 'del' && ins.type === 'ins' && ins.startRow === del.endRow + 1) {
      rows.forEach(r => {
        if (r._runIdx === insIdx) r._runIdx = delIdx;
      });
      runs.get(delIdx).type = 'sub';
      runs.get(delIdx).endRow = ins.endRow;
      runs.delete(insIdx);
    }
  }

  const finalRuns = [...runs.entries()].sort((a, b) => a[1].startRow - b[1].startRow);
  const runToFinalIdx = new Map();
  finalRuns.forEach(([runIdx, run], i) => {
    runToFinalIdx.set(runIdx, { editIndex: i + 1, editType: run.type });
  });

  rows.forEach(r => {
    if (r._runIdx && runToFinalIdx.has(r._runIdx)) {
      const { editIndex, editType } = runToFinalIdx.get(r._runIdx);
      r.editType = editType;
      r.editIndex = editIndex;
    } else {
      r.editType = '';
      r.editIndex = null;
    }
    delete r._runIdx;
    delete r._runType;
  });

  console.table(rows);
  return rows;
})();
