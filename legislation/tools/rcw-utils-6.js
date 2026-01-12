// rcw-utils.js - RCW classification, lookup, and display utilities

// ============================================================================
// PENSION CLASSIFICATION
// ============================================================================

export const PENSION_MAP = {
    systems: {
        "JRS": { ch: "2.10", name: "Judges 1971-1988" },
        "JRF": { ch: "2.12", name: "Judges pre-1971" },
        "JRA": { ch: "2.14", name: "Judicial DC 2007+" },
        "LEOFF": { ch: "41.26", name: "Law Enforcement & Fire Fighters", plans: { "1": [40, 160], "2": [400, 560] } },
        "TRS": { ch: "41.32", name: "Teachers", plans: { "1": [240, 530], "2": [700, 830], "3": [831, 920] } },
        "SERS": { ch: "41.35", name: "School Employees", plans: { "2": [30, 299], "3": [500, 650] } },
        "PSERS": { ch: "41.37", name: "Public Safety Employees" },
        "PERS": { ch: "41.40", name: "Public Employees", plans: { "1": [120, 370], "2": [600, 780], "3": [780, 920] } },
        "WSPRS": { ch: "43.43", name: "State Patrol", rcws: [120, 320], plans: { "1": [120, 200], "2": [200, 320] } }
    },
    general: { 
        "41.34": "Plan 3 DC", "41.45": "Funding", "41.50": "DRS", "41.54": "Portability" 
    },
    governance: { 
        "41.04": { label: "SCPP", rcws: [276, 278, 281] }, "43.33A": "WSIB", "44.44": "OSA / SCPP" 
    },
    adjacent: { 
        "6.15": "Exempt",
        "26.16": "Marital",
        "26.18": "Support",
        "41.28": "Local fire",
        "41.44": "Local city",
        "51.08": "L&I defs",
        "51.32": "L&I ben",
        "74.20A": "DCS"
    },
    special: { 
        "41.50.770": "DCP", "41.50.780": "DCP Accounts"
    }
};

const inRange = (sec, r) => !r || (r.length === 2 ? +sec >= r[0] && +sec <= r[1] : r.includes(+sec));

const findInMap = (ch, sec) => {
    const full = sec ? `${ch}.${sec}` : ch, m = [];
    if (PENSION_MAP.special[full]) m.push({ cat: 'system', label: PENSION_MAP.special[full], rcw: full });
    
    Object.entries(PENSION_MAP.systems).forEach(([sys, d]) => {
        if (d.ch !== ch || !inRange(sec, d.rcws)) return;
        const plan = sec && d.plans && Object.entries(d.plans).find(([, r]) => +sec >= r[0] && +sec <= r[1]);
        m.push({ cat: 'system', sys, plan: plan?.[0] || null, rcw: full });
    });

    if (PENSION_MAP.general[ch]) m.push({ cat: 'general', label: PENSION_MAP.general[ch], rcw: full });
    const g = PENSION_MAP.governance[ch];
    if (g && (typeof g === 'string' ? true : inRange(sec, g.rcws))) m.push({ cat: 'governance', label: g.label || g, rcw: full });
    if (PENSION_MAP.adjacent[ch]) m.push({ cat: 'adjacent', label: PENSION_MAP.adjacent[ch], rcw: ch });
    
    return m;
};

export const classifyPensionBill = (rcwList = []) => {
    const pension = [], adjacent = [], rcwsP = [], rcwsA = [];
    
    rcwList.forEach(cite => {
        const parts = cite.split('.');
        const ch = parts.slice(0, 2).join('.');
        const sec = parts[2] || null;

        findInMap(ch, sec).forEach(m => {
            if (['system', 'general', 'governance'].includes(m.cat)) { 
                pension.push(m); rcwsP.push(cite); 
            } else if (m.cat === 'adjacent') { 
                adjacent.push(m.label); rcwsA.push(cite); 
            }
        });
    });

    const sysStore = {}, otherLabels = [];
    pension.forEach(m => {
        if (m.sys) {
            sysStore[m.sys] = sysStore[m.sys] || { plans: new Set() };
            if (m.plan) sysStore[m.sys].plans.add(m.plan);
        } else { otherLabels.push(m.label); }
    });

    const sysLabels = Object.entries(sysStore).map(([sys, d]) => {
        const plans = [...d.plans].sort();
        return plans.length ? `${sys} ${plans.join('/')}` : sys;
    });

    return {
        PensionLabels: [...new Set([...sysLabels, ...otherLabels])].sort(),
        PensionRcws: [...new Set(rcwsP)].sort(),
        AdjacentLabels: [...new Set(adjacent)].sort(),
        AdjacentRcws: [...new Set(rcwsA)].sort(),
        hasPension: (pension.length > 0),
        hasAdjacent: (adjacent.length > 0)
    };
};

// ============================================================================
// RCW LOOKUPS (chapters, titles, and full hierarchy)
// ============================================================================

const CHAPTERS_URL = 'https://raw.githubusercontent.com/mehrlander/wa-bills/main/legislation/tools/rcw-chapters.json';
const TITLES_URL = 'https://raw.githubusercontent.com/mehrlander/wa-bills/main/legislation/tools/rcw-titles.json';
const FULL_URL = 'https://raw.githubusercontent.com/mehrlander/wa-bills/main/legislation/tools/rcw-full.json';

let chapters = null, titles = null, full = null;
let byChapter = null, byTitle = null, byCite = null;

export const preload = async () => {
    if (!chapters) {
        [chapters, titles, full] = await Promise.all([
            fetch(CHAPTERS_URL).then(r => r.json()),
            fetch(TITLES_URL).then(r => r.json()),
            fetch(FULL_URL).then(r => r.json())
        ]);
        byChapter = Object.fromEntries(chapters.map(c => [c.Chapter, c]));
        byTitle = Object.fromEntries(titles.map(t => [t.title.toUpperCase(), t]));
        byCite = Object.fromEntries(full.map(f => [f.Cite, f]));
    }
};

export const getChapterInfo = ch => byChapter?.[ch];
export const getTitleInfo = t => byTitle?.[t.toUpperCase()];
export const getCiteInfo = cite => byCite?.[cite];

// ============================================================================
// DISPLAY UTILITIES (linkification & tooltips)
// ============================================================================

const rcwUrl = cite => `https://app.leg.wa.gov/RCW/default.aspx?cite=${cite}`;

const groupByChapter = (fullRcws) => {
    const byChap = {};
    (fullRcws || '').split('|').filter(Boolean).forEach(r => {
        const ch = r.split('.').slice(0, 2).join('.');
        (byChap[ch] = byChap[ch] || []).push(r);
    });
    return byChap;
};

const groupByTitle = (rcwList) => {
    const byTit = {};
    rcwList.forEach(r => {
        const t = r.split('.')[0];
        (byTit[t] = byTit[t] || []).push(r);
    });
    return byTit;
};

const getChapterLabel = (ch) => {
    for (const [sys, d] of Object.entries(PENSION_MAP.systems)) {
        if (d.ch === ch) return { label: sys, type: 'system' };
    }
    if (PENSION_MAP.general[ch]) return { label: PENSION_MAP.general[ch], type: 'general' };
    const g = PENSION_MAP.governance[ch];
    if (g) return { label: typeof g === 'string' ? g : g.label, type: 'governance' };
    if (PENSION_MAP.adjacent[ch]) return { label: PENSION_MAP.adjacent[ch], type: 'adjacent' };
    return null;
};

export const linkifyList = (chapterStr, fullRcws) => {
    if (!chapterStr || !byChapter) return chapterStr || '';
    const byChap = groupByChapter(fullRcws);
    
    return chapterStr.split(', ').filter(Boolean).map(ch => {
        const info = byChapter[ch];
        const rcws = byChap[ch] || [];
        if (!info) return ch;
        return `<a href="${info.URL}" target="_blank" rel="noopener" class="link link-primary" data-chapter="${ch}" data-rcws="${rcws.join('|')}">${ch}</a>`;
    }).join(', ');
};

export const linkifyTitles = titleStr => {
    if (!titleStr || !byTitle) return titleStr || '';
    return titleStr.split(', ').filter(Boolean).map(t => {
        const info = byTitle[t.toUpperCase()];
        if (!info) return t;
        return `<a href="${rcwUrl(t)}" target="_blank" rel="noopener" class="link link-primary" data-title="${t}">${t}</a>`;
    }).join(', ');
};

export const chapterTooltip = (e) => {
    const ch = e.target?.dataset?.chapter;
    if (!ch) return;
    const info = byChapter?.[ch];
    if (!info) return ch;
    
    const rcws = (e.target?.dataset?.rcws || '').split('|').filter(Boolean);
    const sections = rcws.map(r => r.split('.').slice(2).join('.')).filter(Boolean).sort((a, b) => +a - +b);
    const detail = sections.length ? `\nSections: ${sections.join(', ')}` : '';
    return `${ch}: ${info.Description}${detail}`;
};

export const titleTooltip = (e) => {
    const t = e.target?.dataset?.title;
    if (!t) return;
    const info = byTitle?.[t.toUpperCase()];
    return info ? `Title ${t}: ${info.name}` : t;
};

// ============================================================================
// POPUP BUILDERS
// ============================================================================

const buildChapterBlock = (ch, rcws, badgeClass = 'badge-secondary') => {
    const chInfo = byCite?.[ch];
    const chName = chInfo?.Name || byChapter?.[ch]?.Description || '';
    const chMeta = getChapterLabel(ch);
    const chBadge = chMeta ? `<span class="badge badge-xs ${badgeClass} ml-1">${chMeta.label}</span>` : '';
    
    const sectionHtml = rcws
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map(rcw => {
            const secInfo = byCite?.[rcw];
            const secName = secInfo?.Name || '';
            const special = PENSION_MAP.special[rcw];
            const secBadge = special ? `<span class="badge badge-xs badge-primary ml-1">${special}</span>` : '';
            return `<div class="ml-4 py-0.5">
                <a href="${rcwUrl(rcw)}" target="_blank" class="link link-primary text-sm">${rcw}</a>
                <span class="text-base-content/60 text-sm">${secName}</span>${secBadge}
            </div>`;
        }).join('');
    
    return `<div class="mt-2">
        <div class="font-medium">
            <a href="${rcwUrl(ch)}" target="_blank" class="link link-secondary">${ch}</a>
            <span class="text-base-content/70">${chName}</span>${chBadge}
        </div>
        ${sectionHtml}
    </div>`;
};

const buildTitleBlock = (t, rcwsInTitle, badgeClass = 'badge-secondary') => {
    const titleInfo = byCite?.[t];
    const titleName = titleInfo?.Name || '';
    
    const byChap = {};
    rcwsInTitle.forEach(r => {
        const ch = r.split('.').slice(0, 2).join('.');
        (byChap[ch] = byChap[ch] || []).push(r);
    });
    
    const chapterHtml = Object.entries(byChap)
        .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
        .map(([ch, rcws]) => buildChapterBlock(ch, rcws, badgeClass))
        .join('');
    
    return `<div class="[&:not(:last-child)]:mb-3">        
        <div class="font-bold border-b border-base-300 pb-1">
            <a href="${rcwUrl(t)}" target="_blank" class="link">${t}</a>
            <span class="text-base-content/80">${titleName}</span>
        </div>
        ${chapterHtml}
    </div>`;
};

export const buildRcwPopup = (rcwListStr, options = {}) => {
    const { emptyMessage = 'No RCWs', badgeClass = 'badge-secondary' } = options;
    const rcwList = (rcwListStr || '').split('|').filter(Boolean);
    if (!rcwList.length) return `<div class="p-3 text-base-content/50">${emptyMessage}</div>`;
    
    const byTit = groupByTitle(rcwList);
    const titleNums = Object.keys(byTit).sort((a, b) => +a - +b);
    
    const sections = titleNums.map(t => buildTitleBlock(t, byTit[t], badgeClass)).join('');
    
    return `<div class="p-3 max-w-md max-h-96 overflow-auto">${sections}</div>`;
};

export const buildPensionPopup = (rcwListStr) => {
    return buildRcwPopup(rcwListStr, { 
        emptyMessage: 'No pension RCWs', 
        badgeClass: 'badge-secondary' 
    });
};

export const buildAdjacentPopup = (rcwListStr) => {
    return buildRcwPopup(rcwListStr, { 
        emptyMessage: 'No adjacent RCWs', 
        badgeClass: 'badge-warning' 
    });
};

export const buildChapterPopup = (chapter, rcwListStr) => {
    const rcwList = (rcwListStr || '').split('|').filter(Boolean)
        .filter(r => r.startsWith(chapter + '.'));
    if (!rcwList.length) return `<div class="p-3 text-base-content/50">No sections in ${chapter}</div>`;
    
    const chInfo = byCite?.[chapter];
    const chName = chInfo?.Name || byChapter?.[chapter]?.Description || '';
    const chMeta = getChapterLabel(chapter);
    const chBadge = chMeta ? `<span class="badge badge-xs badge-secondary ml-1">${chMeta.label}</span>` : '';
    
    const sectionHtml = rcwList
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map(rcw => {
            const secInfo = byCite?.[rcw];
            const secName = secInfo?.Name || '';
            const special = PENSION_MAP.special[rcw];
            const badge = special ? `<span class="badge badge-xs badge-primary ml-1">${special}</span>` : '';
            return `<div class="py-0.5">
                <a href="${rcwUrl(rcw)}" target="_blank" class="link link-primary">${rcw}</a>
                <span class="text-base-content/60 text-sm">${secName}</span>${badge}
            </div>`;
        }).join('');
    
    return `<div class="p-3 max-w-md max-h-96 overflow-auto">
        <div class="font-bold border-b border-base-300 pb-1 mb-2">
            <a href="${rcwUrl(chapter)}" target="_blank" class="link">${chapter}</a>
            <span class="text-base-content/80">${chName}</span>${chBadge}
        </div>
        ${sectionHtml}
    </div>`;
};

export const buildTitlePopup = (title, rcwListStr) => {
    const rcwList = (rcwListStr || '').split('|').filter(Boolean)
        .filter(r => r.split('.')[0] === title);
    if (!rcwList.length) return `<div class="p-3 text-base-content/50">No RCWs in Title ${title}</div>`;
    
    return buildTitleBlock(title, rcwList);
};
