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

  // 1. Splinter Inline Subsections
  $$('div').forEach(div => {
    const tgt = [...div.childNodes].find(n => n.nodeType === 1 && n.style.textIndent && /^\(\d+\)/.test(n.textContent.trim()));
    if (!tgt) return;
    const nxt = document.createElement('div');
    nxt.style.textIndent = "0.5in";
    while (tgt.firstChild) nxt.append(tgt.firstChild);
    while (tgt.nextSibling) nxt.append(tgt.nextSibling);
    tgt.remove();
    div.after(nxt);
    if (div.lastChild?.nodeType === 3) div.lastChild.textContent = div.lastChild.textContent.trimEnd();
  });

  // 2. Isolate Deletion Parentheses
  $$('span').filter(el => getComputedStyle(el).textDecoration.includes('line-through')).forEach(del => {
    const p = del.previousSibling, n = del.nextSibling;
    if (p?.nodeType === 3 && p.textContent.endsWith('((')) {
      const w = document.createElement('span');
      w.dataset.delOpen = 'true'; w.textContent = '((';
      p.textContent === '((' ? p.replaceWith(w) : (p.textContent = p.textContent.slice(0, -2), del.before(w));
    }
    if (n?.nodeType === 3 && n.textContent.trimStart().startsWith('))')) {
      const t = n.textContent, tr = t.trimStart(), w = document.createElement('span');
      w.dataset.delClose = 'true'; w.textContent = t.slice(0, t.length - tr.length) + '))';
      tr === '))' ? n.replaceWith(w) : (n.textContent = tr.slice(2), del.after(w));
    }
  });

  // 3. Hierarchical State Tracking
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

  // 4. Wrap Sections
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

  // 5. Apply Hierarchy Metadata
  const divMap = new Map();
  $$('div:not([data-section])').forEach(div => {
    if (div.querySelector('div')) return;
    const ms = (div.textContent || '').trim().match(/^\s*(?:\(\([^)]+\)\))?((?:\([^)]+\))+)/)?.[1]?.match(/\(([^()]+)\)/g)?.map(x => x.replace(/[()]/g, '')) || [];
    if (ms.length) divMap.set(div, getHier(ms, getComputedStyle(div).textDecoration.includes('line-through')));
  });

  divMap.forEach((h, div) => Object.assign(div.dataset, { level: h.level, levelName: h.levelName, path: h.path, markers: h.ms }));

  // 6. Generate Row Data
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, n => n.textContent.trim() ? 1 : 2);
  const rows = [];
  let nNode;
  
  while (nNode = walker.nextNode()) {
    const p = nNode.parentElement;
    if (['SCRIPT', 'STYLE'].includes(p.tagName)) continue;
    
    let type = p.dataset.delOpen ? 'del-open' : p.dataset.delClose ? 'del-close' : getOwnDeco(p) || '';
    if (type === 'del') {
      const b = p.previousSibling?.textContent?.trimEnd().endsWith('((') || p.previousElementSibling?.dataset.delOpen;
      const a = p.nextSibling?.textContent?.trimStart().startsWith('))') || p.nextElementSibling?.dataset.delClose;
      type = (b && a) ? 'del' : b ? 'del-start' : a ? 'del-end' : 'del-middle';
    } else if (type === 'ins') {
      type = nNode.textContent.trim() === 'NEW SECTION.' ? 'ins-new-section' : 'ins';
    }
    
    const h = divMap.get(p.closest('div:not([data-section])')) || { level: 0, levelName: '', path: '', ms: '' };
    const sec = p.closest('[data-section]');
    rows.push({ 
      sec: sec?.dataset.section ? parseInt(sec.dataset.section, 10) : null, 
      isNew: sec?.dataset.isNew === 'true', 
      type, 
      level: h.level, levelName: h.levelName, path: h.path, 
      text: nNode.textContent.trim().slice(0, 80) 
    });
  }

  // 7. Calculate Edit Runs
  let editIdx = 0, runType = null;
  rows.forEach(r => {
    const cur = r.type?.startsWith('del') ? 'del' : r.type?.startsWith('ins') ? 'ins' : null;
    if (cur) {
      if (cur !== runType) { editIdx++; runType = cur; }
      r._rI = editIdx; r._rT = runType;
    } else runType = null;
  });

  const runs = new Map();
  rows.forEach((r, i) => {
    if (r._rI) runs.has(r._rI) ? (runs.get(r._rI).end = i) : runs.set(r._rI, { t: r._rT, start: i, end: i });
  });

  const rL = [...runs.entries()].sort((a, b) => a[1].start - b[1].start);
  for (let i = 0; i < rL.length - 1; i++) {
    const [dI, d] = rL[i], [iI, ins] = rL[i + 1];
    if (d.t === 'del' && ins.t === 'ins' && ins.start === d.end + 1) {
      rows.forEach(r => { if (r._rI === iI) r._rI = dI; });
      d.t = 'sub'; d.end = ins.end; runs.delete(iI);
    }
  }

  const fMap = new Map([...runs.entries()].sort((a, b) => a[1].start - b[1].start).map(([id, r], i) => [id, { i: i + 1, t: r.t }]));
  
  rows.forEach(r => {
    if (r._rI && fMap.has(r._rI)) {
      const f = fMap.get(r._rI);
      r.editType = f.t; r.editIndex = f.i;
    } else { r.editType = ''; r.editIndex = null; }
    delete r._rI; delete r._rT;
  });

  console.table(rows);
  return rows;
})();

(function() {
  const ea = (s, cb, ctx = document) => ctx.querySelectorAll(s).forEach(cb);

  const hasOwnDeco = (el, type) => {
    const has = e => (window.getComputedStyle(e).textDecoration || '').includes(type);
    return has(el) && (!el.parentElement || !has(el.parentElement));
  };

  const wrapRange = (start, end, wrapper) => {
    start.before(wrapper);
    for (let n = start; n;) {
      const next = n.nextSibling;
      wrapper.append(n);
      if (n === end) break;
      n = next;
    }
    return wrapper;
  };

  const addTags = (el, tag, isIns) => {
    const markerClass = isIns ? 'tag-marker-ins' : 'tag-marker-del';
    const marker = (text) => `<span class="tag-marker ${markerClass}">&lt;${text}&gt;</span>`;
    el.insertAdjacentHTML('afterbegin', marker(tag));
    el.insertAdjacentHTML('beforeend', marker('/' + tag));
  };

  const contentNode = document.body;

  // Single-pass DOM scan using ea()
  ea('*', el => {
    if (['SCRIPT', 'STYLE'].includes(el.tagName) || !el.offsetParent || !el.textContent.trim() || el.closest('a')) return;

    if (hasOwnDeco(el, 'line-through')) el.setAttribute('data-src-del', '');
    if (hasOwnDeco(el, 'underline')) el.setAttribute('data-src-ins', '');
  }, contentNode);

  const findNextSrc = (el, attr) => {
    for (let n = el.nextSibling; n; n = n.nextSibling) {
      if (n.nodeType === 3 && /^\s*$/.test(n.textContent)) continue;
      if (n.nodeType === 3) return null;
      if (n.nodeType === 1) return n.hasAttribute(attr) ? n : null;
    }
    return null;
  };

  const findNextIns = el => {
    for (let n = el.nextSibling; n; n = n.nextSibling) {
      if (n.nodeType === 3 && !/^[\s\(\)\[\],.]*$/.test(n.textContent)) return null;
      if (n.nodeType === 1) {
        if (n.hasAttribute('data-src-ins')) return n;
        if (n.hasAttribute('data-src-del')) return null;
      }
    }
    return null;
  };

  const processed = new Set();
  const chains = [];

  ea('[data-src-del]', del => {
    if (processed.has(del)) return;
    const ins = findNextIns(del);
    if (ins) {
      processed.add(del); processed.add(ins);
      chains.push({ type: 'sub', elements: [del], insElements: [ins] });
      return;
    }

    const chain = [del];
    processed.add(del);
    for (let next = findNextSrc(del, 'data-src-del'); next && !processed.has(next) && !findNextIns(next); next = findNextSrc(next, 'data-src-del')) {
      chain.push(next);
      processed.add(next);
    }
    chains.push({ type: 'del', elements: chain });
  }, contentNode);

  ea('[data-src-ins]', ins => {
    if (processed.has(ins)) return;
    const chain = [ins];
    processed.add(ins);
    for (let next = findNextSrc(ins, 'data-src-ins'); next && !processed.has(next); next = findNextSrc(ins, 'data-src-ins')) {
      chain.push(next);
      processed.add(next);
    }
    chains.push({ type: 'ins', elements: chain });
  }, contentNode);

  chains.forEach(chain => {
    const mkWrapper = type => {
      const w = document.createElement('span');
      w.setAttribute('data-edit', type);
      return w;
    };

    if (chain.type === 'sub') {
      const [del, ins] = [chain.elements[0], chain.insElements[0]];

      addTags(del, 'del', false);
      addTags(ins, 'ins', true);

      // Flag for IIFE 2 so it can override standard red/green backgrounds
      del.setAttribute('data-sub-part', '');
      ins.setAttribute('data-sub-part', '');

      if (del.parentElement === ins.parentElement) {
        wrapRange(del, ins, mkWrapper('sub'));
      } else {
        [del, ins].forEach(e => {
          const w = mkWrapper('sub');
          e.before(w); w.append(e);
        });
      }
    } else {
      chain.elements.forEach(e => {
        addTags(e, chain.type, chain.type === 'ins');
        wrapRange(e, e, mkWrapper(chain.type));
      });
    }
  });
})();
