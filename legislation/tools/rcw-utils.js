// rcw-utils.js - RCW classification, lookup, and display utilities

// ============================================================================
// PENSION CLASSIFICATION
// ============================================================================

export const PENSION_MAP = {
    systems: {
        "JRS": { ch: "2.10", name: "Judges 1971-1988" },
        "JRF": { ch: "2.12", name: "Judges pre-1971" },
        "JRA": { ch: "2.14", name: "Judicial DC 1988-2007" },
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
        "41.40.124": "Judicial Multiplier", "41.40.761": "Judicial Multiplier P2", 
        "41.45.0631": "WSPRS Rates", "41.50.770": "DCP", "41.50.780": "DCP Accounts",
        "41.26.130": "Disability Offset", "41.26.470": "Disability Offset", "41.37.230": "Disability Offset",
        "41.40.038": "L&I Service Credit", "41.37.060": "L&I Service Credit", "41.26.473": "L&I Service Credit",
        "41.26.048": "Line of Duty Death"
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
// RCW LOOKUPS (chapters & titles metadata)
// ============================================================================

const CHAPTERS_URL = 'https://raw.githubusercontent.com/mehrlander/wa-bills/main/legislation/tools/rcw-chapters.json';
const TITLES_URL = 'https://raw.githubusercontent.com/mehrlander/wa-bills/main/legislation/tools/rcw-titles.json';

let chapters = null, titles = null;
let byChapter = null, byTitle = null;

export const preload = async () => {
    if (!chapters) {
        [chapters, titles] = await Promise.all([
            fetch(CHAPTERS_URL).then(r => r.json()),
            fetch(TITLES_URL).then(r => r.json())
        ]);
        byChapter = Object.fromEntries(chapters.map(c => [c.Chapter, c]));
        byTitle = Object.fromEntries(titles.map(t => [t.title.toUpperCase(), t]));
    }
};

export const getChapterInfo = ch => byChapter?.[ch];
export const getTitleInfo = t => byTitle?.[t.toUpperCase()];

// ============================================================================
// DISPLAY UTILITIES (linkification & tooltips)
// ============================================================================

export const linkifyList = chapterStr => {
    if (!chapterStr || !byChapter) return chapterStr || '';
    return chapterStr.split(', ').filter(Boolean).map(ch => {
        const info = byChapter[ch];
        if (!info) return ch;
        return `<a href="${info.URL}" target="_blank" rel="noopener" class="link link-primary" data-chapter="${ch}">${ch}</a>`;
    }).join(', ');
};

export const linkifyTitles = titleStr => {
    if (!titleStr || !byTitle) return titleStr || '';
    return titleStr.split(', ').filter(Boolean).map(t => {
        const info = byTitle[t.toUpperCase()];
        if (!info) return t;
        const url = `https://app.leg.wa.gov/RCW/default.aspx?cite=${t}`;
        return `<a href="${url}" target="_blank" rel="noopener" class="link link-primary" data-title="${t}">${t}</a>`;
    }).join(', ');
};

export const chapterTooltip = (e) => {
    const ch = e.target?.dataset?.chapter;
    if (!ch) return;
    const info = byChapter?.[ch];
    return info ? `${ch}: ${info.Description}` : ch;
};

export const titleTooltip = (e) => {
    const t = e.target?.dataset?.title;
    if (!t) return;
    const info = byTitle?.[t.toUpperCase()];
    return info ? `Title ${t}: ${info.name}` : t;
};
