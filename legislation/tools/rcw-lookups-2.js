// rcw-lookups.js - RCW chapter lookup and linkification utilities
const CHAPTERS_URL = 'https://raw.githubusercontent.com/mehrlander/wa-bills/main/legislation/tools/rcw-chapters.json';

let chapters = null;
let byChapter = null;
let byTitle = null;

const ensureLoaded = async () => {
    if (!chapters) {
        chapters = await fetch(CHAPTERS_URL).then(r => r.json());
        byChapter = Object.fromEntries(chapters.map(c => [c.Chapter, c]));
        // Group by title - keep first chapter's info for title-level data
        byTitle = {};
        chapters.forEach(c => {
            if (!byTitle[c.Title]) byTitle[c.Title] = c;
        });
    }
};

export const getChapterInfo = async ch => {
    await ensureLoaded();
    return byChapter[ch];
};

export const getTitleInfo = async t => {
    await ensureLoaded();
    return byTitle[t];
};

export const linkify = (ch, info) => {
    if (!info) return ch;
    const tip = `${info.Description} (Title ${info.Title}: ${info.Title_Name})`;
    return `<a href="${info.URL}" target="_blank" rel="noopener" class="link link-primary" title="${tip.replace(/"/g, '&quot;')}">${ch}</a>`;
};

export const linkifyList = async chapterStr => {
    if (!chapterStr) return '';
    await ensureLoaded();
    return chapterStr.split(', ').filter(Boolean).map(ch => linkify(ch, byChapter[ch])).join(', ');
};

export const linkifyTitles = async titleStr => {
    if (!titleStr) return '';
    await ensureLoaded();
    return titleStr.split(', ').filter(Boolean).map(t => {
        const info = byTitle[t];
        if (!info) return t;
        // Construct title-level URL from chapter URL pattern
        const titleUrl = `https://app.leg.wa.gov/RCW/default.aspx?cite=${t}`;
        return `<a href="${titleUrl}" target="_blank" rel="noopener" class="link link-primary" title="${info.Title_Name.replace(/"/g, '&quot;')}">${t}</a>`;
    }).join(', ');
};
