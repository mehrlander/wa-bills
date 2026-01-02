(async () => {
  await new Promise(r => document.head.appendChild(Object.assign(document.createElement('script'), {
    src: 'https://cdn.jsdelivr.net/combine/npm/jquery,npm/jszip,npm/tabulator-tables,npm/@tailwindcss/browser@4',
    onload: r
  })));

  $('style').filter((_, e) => !e.textContent.includes('tailwindcss')).remove();
  $('<link rel=stylesheet href="https://cdn.jsdelivr.net/npm/tabulator-tables/dist/css/tabulator_simple.min.css">').appendTo('head');

  const [{ XMLParser }, { flatten }] = await Promise.all([
    import('https://cdn.jsdelivr.net/npm/fast-xml-parser/+esm'),
    import('https://cdn.jsdelivr.net/npm/flat/+esm')
  ]);

  const cmMap = { APPROPRIATIONS: "APP", "WAYS & MEANS": "WM", FINANCE: "FIN", TRANSPORTATION: "TRAN", "HEALTH & LONG-TERM CARE": "HLTC", "HUMAN SERVICES": "HS", "LAW & JUSTICE": "L&J", "AGRICULTURE & NATURAL RESOURCES": "AGNR", "LABOR & COMMERCE": "L&C", "LABOR & WORKPLACE STANDARDS": "LWS", "COMMUNITY SAFETY": "CS", "POSTSECONDARY EDUCATION & WORKFORCE": "PEW", "STATE GOVERNMENT & TRIBAL RELATIONS": "SGTR", "CONSUMER PROTECTION & BUSINESS": "CPB", "ENVIRONMENT, ENERGY & TECHNOLOGY": "EET", "EARLY LEARNING & K-12 EDUCATION": "ELK12", "HIGHER EDUCATION & WORKFORCE DEVELOPMENT": "HEWD", "CAPITAL BUDGET": "CAP", "CIVIL RIGHTS & JUDICIARY": "CRJ", EDUCATION: "ED", "ENVIRONMENT & ENERGY": "E&E", "HEALTH CARE & WELLNESS": "HCW", HOUSING: "HSG", "LOCAL GOVERNMENT": "LG", "TECHNOLOGY, ECONOMIC DEVELOPMENT, & VETERANS": "TEDV", "BUSINESS, FINANCIAL SERVICES & TRADE": "BFST", "EARLY LEARNING & HUMAN SERVICES": "ELHS" };
  
  const pillStyle = cat => {
    const styles = { ENACTED: ['#dcfce7', '#166534', '#bbf7d0'], VETOED: ['#fee2e2', '#991b1b', '#fecaca'], SUBSTITUTED: ['#f1f5f9', '#475569', '#e2e8f0'], CONFIRMED: ['#e0f2fe', '#075985', '#bae6fd'], PREFILED: ['#f1f5f9', '#475569', '#e2e8f0'], PASSED: ['#f3e8ff', '#6b21a8', '#e9d5ff'], FLOOR: ['#f8fafc', '#334155', '#e2e8f0'] };
    for (let [k, v] of Object.entries(styles)) if (cat.includes(k)) return v;
    if (/RULES/.test(cat)) return cat.includes('X') ? ['#fff1f2', '#9f1239', '#ffe4e6'] : ['#eff6ff', '#1e40af', '#dbeafe'];
    if (/APP|WM|FIN/.test(cat)) return ['#fef9c3', '#854d0e', '#fef08a'];
    return ['#f8fafc', '#475569', '#e2e8f0'];
  };

  const categorize = (s = '', a = '') => {
    const lc = (s + ' ' + a).toLowerCase(), ch = /^[HS]/.test(s) ? s[0] + '-' : '';
    if (/vetoed/.test(lc)) return 'VETOED';
    if (/^c |^chapter/.test(lc)) return 'ENACTED';
    if (/substituted/.test(lc)) return 'SUBSTITUTED';
    if (/confirmed/.test(lc)) return 'CONFIRMED';
    if (/prefiled/.test(lc)) return ch + 'PREFILED';
    if (/rules/.test(lc)) {
      const rt = /rules 3/.test(lc) ? 'RULES 3' : /rules x/.test(lc) ? 'RULES X' : 'RULES 2';
      const sub = /consideration/.test(lc) ? ' CON' : /review/.test(lc) ? ' REV' : /resolution/.test(lc) ? ' RES' : '';
      return ch + rt + sub;
    }
    if (/referred to/.test(lc)) {
      const nm = (a.match(/referred to ([^.]+)/i) || [])[1]?.trim().toUpperCase() || 'COMM';
      return ch + (cmMap[nm] || nm) + (/first reading/.test(lc) ? ' 1' : '');
    }
    if (/reading/.test(lc)) return ch + 'FLOOR';
    if (/passed 3rd/.test(lc)) return ch + 'PASSED';
    return 'OTHER';
  };

  const dateStr = d => d?.split?.('T')[0] || d;
  const norm = t => t === true ? 1 : t === false ? 0 : typeof t === 'string' ? (t.startsWith('0001') ? null : t.trim().replace(/T00:00:00$/, '')) : t;
  const shorten = s => s.replace(/^CurrentStatus\./, 'cs.').replace(/^ShortLegislationType\./, 'slt.').replace(/^Companions\./, 'comp.');
  const findArray = o => Array.isArray(o) ? o : o && typeof o === 'object' ? Object.values(o).map(findArray).find(Boolean) : null;
  const yearOf = s => s ? +String(s).slice(0, 4) : null;

  const transform = recs => {
    const groups = new Map();
    recs.filter(r => r['slt.ShortLegislationType']?.trim() === 'B').forEach(r => {
      const cId = r['comp.Companion.BillId'] || r['comp.Companion'], cNum = cId ? parseInt(cId.replace(/\D/g, '')) : null;
      const pair = cNum ? [r.BillNumber, cNum].sort((a, b) => a - b).join(' / ') : String(r.BillNumber);
      (groups.get(pair) || groups.set(pair, []).get(pair)).push(r);
    });
    return [...groups].flatMap(([pair, vs]) => {
      vs.sort((a, b) => a.BillNumber - b.BillNumber || a.SubstituteVersion - b.SubstituteVersion || a.EngrossedVersion - b.EngrossedVersion);
      const f = vs[0], passedId = vs.find(v => /^C |^Chapter/.test(v['cs.Status'] || ''))?.BillId, nowYr = new Date().getFullYear();
      const current = vs.some(v => {
        const cat = categorize(v['cs.Status'] || '', v['cs.HistoryLine'] || ''), ay = yearOf(v['cs.ActionDate']), iy = yearOf(v.IntroducedDate);
        return ay === nowYr || iy === nowYr || ((ay === nowYr - 1 || iy === nowYr - 1) && cat.includes('PREFILED'));
      }) ? 1 : 0;
      return vs.map(r => ({
        group: pair, groupDesc: f.ShortDescription || '', passedId, num: Math.min(...vs.map(v => v.BillNumber)),
        ver: r.BillId || '', status: r['cs.Status'], actionLine: r['cs.HistoryLine'], active: r.Active == 1,
        sponsor: (r.Sponsor || '').match(/\(([^)]+)\)/)?.[1] || r.Sponsor,
        intro: dateStr(r.IntroducedDate), action: dateStr(r['cs.ActionDate']),
        fn: [r.StateFiscalNote && 'SFN', r.LocalFiscalNote && 'Loc'].filter(Boolean).join(',') || null,
        req: ['G', 'D', 'B', 'O'].filter((_, i) => [r.RequestedByGovernor, r.RequestedByDepartment, r.RequestedByBudgetCommittee, r.RequestedByOther][i] == 1).join('') || null,
        approp: r.Appropriations == 1 ? 1 : 0, current
      }));
    }).sort((a, b) => a.num - b.num);
  };

  const fmtJSON = x => x ? JSON.stringify(x, null, 2) : "// No record selected";

  $('body').addClass('h-screen flex flex-col overflow-hidden font-sans bg-slate-100 text-slate-900');
  $('body').html(`
<header id="hdr" class="flex-none shadow-md z-10">
  <div class="flex items-center gap-3 p-2 bg-slate-800 text-slate-100 border-b border-slate-900">
    <div class="flex items-center gap-1.5">
      <input type="date" id="d" value="2025-03-01" class="h-6 px-2 text-xs bg-slate-700 border border-slate-600 rounded outline-none text-white">
      <button id="b" class="h-6 px-4 text-xs font-bold bg-blue-600 border border-blue-500 rounded hover:bg-blue-500 cursor-pointer text-white transition-colors">Load Data</button>
    </div>
    <div id="view-toggle" class="hidden items-center ml-2">
      <button class="toggle-btn active px-3 h-6 text-xs bg-slate-700 border border-slate-600 rounded-l hover:bg-slate-600 [&.active]:bg-slate-100 [&.active]:text-slate-900 cursor-pointer transition-all" data-view="processed">Processed Bills</button>
      <button class="toggle-btn px-3 h-6 text-xs bg-slate-700 border border-slate-600 rounded-r border-l-0 hover:bg-slate-600 [&.active]:bg-slate-100 [&.active]:text-slate-900 cursor-pointer transition-all" data-view="raw">Raw XML</button>
    </div>
    <span id="s" class="ml-auto text-[10px] text-slate-400 font-bold uppercase tracking-widest"></span>
  </div>
  <div id="filters" class="flex items-center gap-6 p-2 bg-white border-b border-slate-200">
    <div class="flex items-center gap-2">
      <input type="text" id="q" placeholder="Filter bills..." class="h-7 px-2 text-xs border border-slate-200 rounded w-64 outline-none focus:ring-1 focus:ring-blue-100 transition-all">
    </div>
    <div class="flex items-center gap-2 border-l border-slate-200 pl-4">
      <label class="text-[10px] font-bold text-slate-400 uppercase">Action Since</label>
      <input type="date" id="fDate" class="h-7 px-2 text-xs border border-slate-200 rounded outline-none focus:ring-1 focus:ring-blue-100">
    </div>
    <div class="flex items-center gap-4 border-l border-slate-200 pl-4">
      <label class="flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer"><input type="checkbox" id="fApp" class="w-3.5 h-3.5 accent-blue-600"> Approp</label>
      <label class="flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer"><input type="checkbox" id="fCur" class="w-3.5 h-3.5 accent-blue-600"> Current</label>
    </div>
  </div>
</header>
<main class="flex-1 flex flex-col min-h-0">
  <div id="processed-view" class="view-pane flex flex-col h-full active">
    <div id="t2" class="flex-none bg-white"></div>
    <div class="flex flex-col md:flex-row flex-1 min-h-0 p-2 gap-2 bg-slate-100">
      <pre id="t2-sel" class="flex-1 overflow-auto p-2 text-[11px] bg-white border border-slate-200 rounded shadow-sm"></pre>
      <pre id="t2-grp" class="flex-1 overflow-auto p-2 text-[11px] bg-white border border-slate-200 rounded shadow-sm"></pre>
    </div>
  </div>
  <div id="raw-view" class="view-pane hidden flex-col h-full">
    <div id="t1" class="flex-none bg-white"></div>
    <div class="flex-1 min-h-0 p-2 bg-slate-100"><pre id="t1-sel" class="h-full overflow-auto p-2 text-[11px] bg-white border border-slate-200 rounded shadow-sm"></pre></div>
  </div>
</main>
`);

  // Initialize filter date to match loader date
  $('#fDate').val($('#d').val());
  // Update filter date when loader date changes
  $('#d').on('change', function() { $('#fDate').val($(this).val()); });

  let tableRaw, tableProc, fullRawData = [], fullProcData = [];

  $('.toggle-btn').on('click', function() {
    const v = $(this).data('view');
    $('.toggle-btn').removeClass('active'); $(this).addClass('active');
    $('.view-pane').addClass('hidden').removeClass('flex'); $(`#${v}-view`).removeClass('hidden').addClass('flex');
    if (v === 'raw' && tableRaw) tableRaw.redraw(); if (v === 'processed' && tableProc) tableProc.redraw();
  });

  const applyFilters = () => {
    const q = $('#q').val().toLowerCase(), 
          onlyA = $('#fApp').is(':checked'), 
          onlyC = $('#fCur').is(':checked'),
          since = $('#fDate').val();

    if (tableProc) {
      const validGroups = new Set(), gd = new Map();
      fullProcData.forEach(r => { if (!gd.has(r.group)) gd.set(r.group, []); gd.get(r.group).push(r); });
      for (let [gn, rows] of gd) {
        const matchQ = !q || rows.some(r => (gn + r.groupDesc + r.status + r.sponsor + r.ver).toLowerCase().includes(q));
        const matchA = !onlyA || rows.some(r => r.approp);
        const matchC = !onlyC || rows.some(r => r.current);
        const matchD = !since || rows.some(r => r.action >= since);
        if (matchQ && matchA && matchC && matchD) validGroups.add(gn);
      }
      tableProc.setFilter(r => validGroups.has(r.group));
      $('#s').text(`${validGroups.size} GROUPS FOUND`);
    }
    
    if (tableRaw) {
      tableRaw.setFilter(r => 
        (!q || Object.values(r).some(v => String(v).toLowerCase().includes(q))) && 
        (!onlyA || r.Appropriations == 1) && 
        (!onlyC || r.Active == 1) &&
        (!since || r['cs.ActionDate'] >= since)
      );
    }
  };

  $('#q, #fApp, #fCur, #fDate').on('input change', applyFilters);

  $('#b').on('click', async () => {
    $('#s').text('FETCHING...');
    const dv = new Date($('#d').val()), ds = `${dv.getMonth() + 1}/${dv.getDate()}/${dv.getFullYear()}`;
    const urls = [`/LegislationService.asmx/GetLegislationIntroducedSince?sinceDate=${ds}`, `/LegislationService.asmx/GetPrefiledLegislation`];
    const resps = await Promise.all(urls.map(u => fetch(u).then(r => r.text())));
    const parser = new XMLParser(), seen = new Set();
    fullRawData = resps.flatMap(x => findArray(parser.parse(x)) || []).filter(r => !seen.has(r.BillId) && seen.add(r.BillId))
      .map(o => Object.fromEntries(Object.entries(flatten(o)).map(([k, v]) => [shorten(k), norm(v)])));

    tableRaw = new Tabulator('#t1', { data: fullRawData, height: 400, layout: 'fitData', selectableRows: 1, columns: [...new Set(fullRawData.flatMap(Object.keys))].sort().map(f => ({ title: f, field: f, maxWidth: 300 })) }).on("rowSelectionChanged", d => $('#t1-sel').text(fmtJSON(d[0])));

    fullProcData = transform(fullRawData);

    const statusFmt = c => {
      const { status: s = '', actionLine: a = '' } = c.getData(), cat = categorize(s, a), [bg, fg, border] = pillStyle(cat);
      const eff = (a.match(/\d{1,2}\/\d{1,2}\/\d{4}/) || ['TBD'])[0];
      const pillTxt = cat === 'ENACTED' ? `Eff: ${eff}` : cat;
      const pill = cat === 'OTHER' ? '' : `<span style="background:${bg}; color:${fg}; border:1px solid ${border}; padding:1px 6px; border-radius:4px; font-size:.75rem; font-weight:500; margin-right:8px; text-transform:uppercase">${pillTxt}</span>`;
      const txt = cat === 'ENACTED' ? a.replace(/Effective date\s+\d{1,2}\/\d{1,2}\/\d{4}\.?\s*/i, '').trim() : cat === 'OTHER' ? [s, a].filter(Boolean).join(' | ') : '';
      return `<div class="flex items-center justify-center w-full h-full text-[.8rem] whitespace-nowrap overflow-hidden text-ellipsis">${pill}${txt}</div>`;
    };

    const datePill = c => {
      const v = c.getValue(), { current } = c.getData();
      if (!v) return '';
      let display = v;
      if (current) {
        const d = new Date(v + 'T12:00:00');
        display = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      const style = current ? `background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe;` : `color:#64748b;`;
      return `<div class="flex items-center justify-center h-full"><span style="${style} padding:1px 6px; border-radius:4px; font-weight:500; font-size:.75rem">${display}</span></div>`;
    };

    tableProc = new Tabulator('#t2', {
      data: fullProcData, height: 400, layout: 'fitData', groupBy: "group", selectableRows: 1,
      groupHeader: (v, n, d) => {
        const passed = d[0].passedId;
        const links = v.split(' / ').map(num => `<a href="https://app.leg.wa.gov/billsummary?BillNumber=${num.trim()}&Year=2025" target="_blank" style="color:#2563eb; font-weight:bold; text-decoration:underline">${num.trim()}</a>${passed?.includes(num.trim()) ? ' ✓' : ''}`).join(' / ');
        return `<span>${links}</span> - <span style="font-weight:normal; color:#475569">${d[0].groupDesc}</span> <span style="font-size:.7rem; color:#94a3b8; margin-left:4px">(${n})</span>`;
      },
      rowFormatter: r => { if (!r.getData().active) { r.getElement().style.opacity = .5; r.getElement().style.color = '#777' } },
      columns: ['ver', 'status', 'sponsor', 'intro', 'action', 'fn', 'req', 'approp', 'current'].map(f => ({
        title: f.toUpperCase(), field: f, hozAlign: "center", vertAlign: "middle",
        ...{
          ver: { width: 100 },
          status: { maxWidth: 800, formatter: statusFmt, hozAlign: "left" },
          sponsor: { width: 120 },
          intro: { formatter: datePill, width: 95 },
          action: { formatter: datePill, width: 95 },
          approp: { width: 60, formatter: c => c.getValue() ? '<div style="color:#16a34a; font-weight:bold">✓</div>' : '' },
          current: { width: 60, formatter: c => c.getValue() ? '<div style="color:#16a34a; font-weight:bold">✓</div>' : '' }
        }[f]
      }))
    });

    tableProc.on("renderComplete", () => tableProc.getGroups().forEach(g => {
      const el = g.getElement(), passed = !!g.getRows()[0]?.getData().passedId;
      el.style.backgroundColor = passed ? "#f0fdf4" : "#f1f5f9";
      el.style.borderLeft = `4px solid ${passed ? "#22c55e" : "#94a3b8"}`;
    }));

    tableProc.on("rowSelectionChanged", d => {
      $('#t2-sel').text(fmtJSON(d[0]));
      if (d[0]) {
        const grp = tableProc.getGroups().find(g => g.getKey() === d[0].group);
        $('#t2-grp').text(fmtJSON(grp ? { group: grp.getKey(), count: grp.getRows().length, data: grp.getRows().map(r => r.getData()) } : null));
      }
    });

    $('#view-toggle').removeClass('hidden').addClass('flex');
    applyFilters();
  });
})();
