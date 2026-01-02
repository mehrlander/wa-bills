(async()=>{
let s=document.createElement('script');s.src='https://cdn.jsdelivr.net/combine/npm/jquery,npm/jszip,npm/tabulator-tables';document.head.appendChild(s);
let l=document.createElement('link');l.rel='stylesheet';l.href='https://cdn.jsdelivr.net/npm/tabulator-tables/dist/css/tabulator_simple.min.css';document.head.appendChild(l);
await new Promise(r=>s.onload=r);
const [{XMLParser},{flatten}]=await Promise.all([import('https://cdn.jsdelivr.net/npm/fast-xml-parser/+esm'),import('https://cdn.jsdelivr.net/npm/flat/+esm')]);
const parser=new XMLParser();

const tBtn = `padding:2px 6px; font-size:0.75rem; height:22px; cursor:pointer; border:1px solid #ccc; border-radius:2px; background:#f8f9fa; display:inline-flex; align-items:center; text-decoration:none; color:black; font-family:sans-serif; white-space:nowrap;`;
const tInp = `height:22px; padding:0 4px; font-size:0.75rem; border:1px solid #ccc; border-radius:2px; box-sizing:border-box; border:1px solid #ccc;`;

const cmMap = {
    "APPROPRIATIONS": "APP", "WAYS & MEANS": "WM", "FINANCE": "FIN", "TRANSPORTATION": "TRAN",
    "HEALTH & LONG-TERM CARE": "HLTC", "HUMAN SERVICES": "HS", "LAW & JUSTICE": "L&J",
    "AGRICULTURE & NATURAL RESOURCES": "AGNR", "LABOR & COMMERCE": "L&C",
    "LABOR & WORKPLACE STANDARDS": "LWS", "COMMUNITY SAFETY": "CS",
    "POSTSECONDARY EDUCATION & WORKFORCE": "PEW", "STATE GOVERNMENT & TRIBAL RELATIONS": "SGTR",
    "CONSUMER PROTECTION & BUSINESS": "CPB", "ENVIRONMENT, ENERGY & TECHNOLOGY": "EET",
    "EARLY LEARNING & K-12 EDUCATION": "ELK12", "HIGHER EDUCATION & WORKFORCE DEVELOPMENT": "HEWD",
    "CAPITAL BUDGET": "CAP", "CIVIL RIGHTS & JUDICIARY": "CRJ", "EDUCATION": "ED",
    "ENVIRONMENT & ENERGY": "E&E", "HEALTH CARE & WELLNESS": "HCW", "HOUSING": "HSG",
    "LOCAL GOVERNMENT": "LG", "TECHNOLOGY, ECONOMIC DEVELOPMENT, & VETERANS": "TEDV",
    "BUSINESS, FINANCIAL SERVICES & TRADE": "BFST", "EARLY LEARNING & HUMAN SERVICES": "ELHS"
};

const categorize = (s='', a='') => {
    const sl = s.toLowerCase(), al = a.toLowerCase();
    const ch = s.startsWith('H') ? 'H-' : s.startsWith('S') ? 'S-' : '';
    if (sl.includes('vetoed')) return 'VETOED';
    if (s.startsWith('C ') || s.startsWith('Chapter')) return 'ENACTED';
    if (al.includes('substituted')) return 'SUBSTITUTED';
    if (sl.includes('confirmed')) return 'CONFIRMED';
    if (sl.includes('rules')) {
        let rType = sl.includes('rules 3') || sl.includes('rules 3c') ? 'RULES 3' : sl.includes('rules x') ? 'RULES X' : 'RULES 2';
        let sub = al.includes('consideration') ? ' CON' : al.includes('review') ? ' REV' : al.includes('resolution') ? ' RES' : '';
        return ch + rType + sub;
    }
    if (al.includes('referred to')) {
        const match = a.match(/referred to ([^.]+)/i);
        const fullName = match ? match[1].trim().toUpperCase() : 'COMM';
        const fr = al.includes('first reading') ? ' 1' : '';
        return ch + (cmMap[fullName] || fullName) + fr;
    }
    if (sl.includes('reading')) return ch + 'FLOOR';
    if (s.includes('Passed 3rd')) return ch + 'PASSED';
    return 'OTHER';
};

$('body').html(`
<div id="hdr" style="padding:4px; font-family:sans-serif; border-bottom:1px solid #ddd; display:flex; gap:6px; align-items:center; background:#f4f4f4; position:sticky; top:0; z-index:100;">
  <input type="date" id="d" value="2025-03-01" style="${tInp}">
  <button id="b" style="${tBtn} background:#e1e1e1;">Load</button>
  <div id="act" style="display:none; gap:6px; align-items:center; border-left:1px solid #ccc; padding-left:6px;">
    <a id="dl" style="${tBtn} background:#007bff; color:white; border-color:#0056b3;">ZIP</a>
    <button id="cp" style="${tBtn}">CSV</button>
  </div>
  <span id="s" style="font-size:0.7rem; color:#666;"></span>
</div>
<div id="content"></div>
<div id="footer" style="padding:10px; font-family:sans-serif; background:#f9f9f9; border-top:1px solid #eee;">
  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
    <p style="font-size:0.75rem; font-weight:bold; margin:0;">Normalized Inventory:</p>
    <button id="cpInv" style="${tBtn}">Copy Inventory</button>
  </div>
  <textarea id="statusList" style="width:100%; height:150px; font-size:0.75rem; font-family:monospace; border:1px solid #ccc; border-radius:3px; padding:5px; background:white;" readonly></textarea>
</div>
`);

$('#b').on('click',async()=>{
$('#s').text('Loading...'); $('#act').hide();
let d=new Date($('#d').val()),
x=await(await fetch(`/LegislationService.asmx/GetLegislationIntroducedSince?sinceDate=${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`)).text(),
parsed=parser.parse(x),
raw=parsed.ArrayOfLegislation?.Legislation||[],
v=t=>t===true?1:t===false?0:typeof t==='string'?(t.startsWith('0001')?null:t.trim().replace(/T00:00:00$/,'')):t,
short=s=>s.replace(/^CurrentStatus\./,'cs.').replace(/^ShortLegislationType\./,'slt.').replace(/^Companions\./,'comp.').replace(/^ActionDate$/,'cs.ActionDate'),
norm=o=>Object.fromEntries(Object.entries(flatten(o)).map(([k,val])=>[short(k),v(val)])),
items=raw.map(norm),
k=[...new Set(items.flatMap(Object.keys))].sort();

const groups = {};
items.forEach(i => {
    let s = i['cs.Status'] || '', a = i['cs.HistoryLine'] || '', cat = categorize(s, a);
    let nS = s.replace(/^C \d+ L \d+/, '{CIT}').replace(/^Chapter \d+/, '{CIT}');
    let nA = a.replace(/\d{1,2}\/\d{1,2}\/\d{4}/g, '{DATE}').replace(/yeas, \d+; nays, \d+; absent, \d+; excused, \d+/, '{VOTES}').replace(/First reading/i, '{1}');
    const full = `${nS} | ${nA}`;
    if(!groups[cat]) groups[cat] = new Set();
    groups[cat].add(full);
});
let invText = '';
Object.keys(groups).sort().forEach(cat => { invText += `--- ${cat} ---\n${[...groups[cat]].sort().join('\n')}\n\n`; });
$('#statusList').val(invText.trim());
$('#cpInv').off('click').on('click',()=>{navigator.clipboard.writeText(invText.trim());$('#cpInv').text('Copied!')});

const fmtDate=d=>(d && !d.startsWith('0001')) ? d.split('T')[0] : null;

const tx=recs=>{
  let flat = [], gp=new Map();
  recs.filter(r=>r['slt.ShortLegislationType']?.trim()==='B').forEach(r=>{
      let key=`${r.Biennium}|${r.BillNumber}`; (gp.get(key)||gp.set(key,[]).get(key)).push(r);
  });
  [...gp.values()].forEach(vs=>{
    vs.sort((a,b)=>(a.SubstituteVersion-b.SubstituteVersion)||(a.EngrossedVersion-b.EngrossedVersion));
    let f=vs[0], billPassed = vs.some(vr => vr['cs.Status']?.startsWith('C ') || vr['cs.Status']?.startsWith('Chapter'));
    vs.forEach(vr=>{
      flat.push({
        bill: `${f.BillNumber} - ${f.ShortDescription||''}`, billPassed, num: f.BillNumber,
        ver: vr.BillId ? vr.BillId.replace(new RegExp(`\\s*${f.BillNumber}\\s*`, 'g'), '').trim() : '',
        status: vr['cs.Status'], actionLine: vr['cs.HistoryLine'], active: vr.Active == 1, sponsor: (vr.Sponsor||'').match(/\(([^)]+)\)/)?.[1]||vr.Sponsor,
        intro: fmtDate(vr.IntroducedDate),
        actionDate: fmtDate(vr['cs.ActionDate']),
        fn: (vr.StateFiscalNote==1&&vr.LocalFiscalNote==1)?'SFN,Loc':vr.StateFiscalNote==1?'SFN':vr.LocalFiscalNote==1?'Loc':null,
        req: ['G','D','B','O'].filter((_,j)=>[vr.RequestedByGovernor,vr.RequestedByDepartment,vr.RequestedByBudgetCommittee,vr.RequestedByOther][j]==1).join('')||null,
        approp: vr.Appropriations == 1 ? 1 : 0,
        companion: vr['comp.Companion.BillId']||vr['comp.Companion']||null
      });
    });
  });
  return flat.sort((a,b)=>a.num-b.num);
};

$('#content').html(`
<div style="display:flex; align-items:center; gap:8px; margin:4px; font-family:sans-serif;">
  <p style="margin:0; font-size:0.75rem; font-weight:bold;">Raw (${items.length})</p>
  <input type="text" id="f1" placeholder="Filter cols..." style="${tInp} width:120px;">
</div>
<div id="t1"></div>
<div style="display:flex; align-items:center; gap:8px; margin:8px 4px 4px 4px; font-family:sans-serif;">
  <p style="margin:0; font-size:0.75rem; font-weight:bold;">Bills (${[...new Set(items.map(x=>x.BillNumber))].length})</p>
  <input type="text" id="f2" placeholder="Filter cols..." style="${tInp} width:120px;">
  <button id="exp" style="${tBtn} margin-left:auto;">± Expand</button>
</div>
<div id="t2"></div>
`);

new Tabulator('#t1',{ 
  data:items, columns:k.map(f=>({title:f, field:f, maxWidth:300})), 
  height:300, layout:'fitData', nestedFieldSeparator:false, columnDefaults:{headerFilter:"input"}
});

let expanded = true;
const tab2 = new Tabulator('#t2',{
  data:tx(items), height:600, layout:'fitData', groupBy:"bill", groupStartOpen:true, nestedFieldSeparator:false,
  rowFormatter:r=>{ if(r.getData().active === false){ r.getElement().style.opacity = "0.5"; r.getElement().style.color = "#777"; } },
  columns:[
    {title:'Version', field:'ver', width:80},
    {title:'Status/Action', field:'status', maxWidth:1000, formatter:c=>{
        const d=c.getData(); const s=d.status||'', a=d.actionLine||'';
        const cat = categorize(s, a);
        let color = '#f8f9fa', text = '#333', border = '#ccc';
        if(cat === 'ENACTED') { color = '#2e7d32'; text = 'white'; border = '#1b5e20'; }
        else if(cat === 'VETOED') { color = '#c62828'; text = 'white'; border = '#b71c1c'; }
        else if (cat === 'SUBSTITUTED') { color = '#6c757d'; text = 'white'; }
        else if (cat === 'CONFIRMED') { color = '#0277bd'; text = 'white'; border = '#01579b'; }
        else if (cat.includes('RULES')) { color = (cat.includes('X')) ? '#f8d7da' : '#e7f3ff'; border = (cat.includes('X')) ? '#f5c6cb' : '#b8daff'; }
        else if (cat.includes('APP') || cat.includes('WM') || cat.includes('FIN')) { color = '#fff3cd'; border = '#ffeeba'; }
        else if (cat.includes('FLOOR')) { color = '#f0f0f0'; border = '#d0d0d0'; }
        else if (cat.includes('PASSED')) { color = '#6f42c1'; text = 'white'; }
        else if (cat !== 'OTHER') { color = '#ffffff'; border = '#dee2e6'; }
        let pillText = cat, dAction = a, dStatus = s;
        if(cat === 'ENACTED') {
            const m = a.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
            pillText = `ENACTED eff: ${m ? m[0] : 'TBD'}`;
            dAction = a.replace(/Effective date\s+\d{1,2}\/\d{1,2}\/\d{4}\.?\s*/i, '').trim();
            dStatus = ''; 
        } else if (cat !== 'OTHER') { dAction = ''; dStatus = ''; } else { dAction = a; }
        const pill = cat !== 'OTHER' ? `<span style="background:${color}; color:${text}; border:1px solid ${border}; padding:1px 6px; border-radius:10px; font-size:0.6rem; font-weight:bold; margin-right:8px; display:inline-flex; align-items:center; vertical-align:middle;">${pillText}</span>` : '';
        const combined = [dStatus, dAction].filter(Boolean).join(' | ');
        return `<div style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:0.8rem; padding:2px 0;">${pill} ${combined}</div>`;
    }},
    {title:'Sponsor', field:'sponsor', width:120},
    {title:'Intro', field:'intro'},
    {title:'Action', field:'actionDate'},
    {title:'FN', field:'fn'},
    {title:'Req', field:'req'},
    {title:'App', field:'approp'},
    {title:'Comp', field:'companion'}
  ]
});

tab2.on("renderComplete", () => {
    tab2.getGroups().forEach(g => {
        if(g.getRows().length > 0 && g.getRows()[0].getData().billPassed) {
            const el = g.getElement(); el.style.backgroundColor = "#e8f5e9"; el.style.borderLeft = "4px solid #4caf50";
        }
    });
});

$('#exp').on('click', () => {
    expanded = !expanded;
    tab2.getGroups().forEach(g => expanded ? g.show() : g.hide());
    $('#exp').text(expanded ? '± Collapse' : '± Expand');
});

const filterCols = (id, tableId) => {
  $(`#${id}`).on('input', e => {
    const q = e.target.value.toLowerCase();
    Tabulator.findTable(`#${tableId}`)[0].getColumns().forEach(col => {
      const title = col.getDefinition().title?.toLowerCase() || "";
      if (title.includes(q) || col.getField() === undefined) col.show(); else col.hide();
    });
  });
};
filterCols('f1', 't1'); filterCols('f2', 't2');
$('#act').css('display','flex'); $('#s').text('');
})})()
