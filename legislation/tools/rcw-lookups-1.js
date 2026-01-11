// rcw-lookups.js - RCW chapter lookup and linkification utilities
const CHAPTERS_URL = 'https://raw.githubusercontent.com/mehrlander/wa-bills/main/legislation/tools/rcw-chapters.json';

let chapters = null;
let byChapter = null;

const ensureLoaded = async () => {
    if (!chapters) {
        chapters = await fetch(CHAPTERS_URL).then(r => r.json());
        byChapter = Object.fromEntries(chapters.map(c => [c.Chapter, c]));
    }
};

export const getChapterInfo = async ch => {
    await ensureLoaded();
    return byChapter[ch];
};

export const linkify = (ch, info) => {
    if (!info) return ch;
    const tip = `${info.Description} (Title ${info.Title}: ${info.Title_Name})`;
    return `<a href="${info.URL}" target="_blank" rel="noopener" class="link link-primary tooltip tooltip-bottom" data-tip="${tip.replace(/"/g, '&quot;')}">${ch}</a>`;
};

export const linkifyList = async chapterStr => {
    if (!chapterStr) return '';
    await ensureLoaded();
    return chapterStr.split(', ').filter(Boolean).map(ch => linkify(ch, byChapter[ch])).join(', ');
};

export const linkifyTitles = async titleStr => {
    if (!titleStr) return '';
    await ensureLoaded();
    // For titles, just show title number with tooltip of title name
    const titleNames = {};
    chapters.forEach(c => { titleNames[c.Title] = c.Title_Name; });
    return titleStr.split(', ').filter(Boolean).map(t => {
        const name = titleNames[t];
        return name ? `<span class="tooltip tooltip-bottom" data-tip="${name.replace(/"/g, '&quot;')}">${t}</span>` : t;
    }).join(', ');
};
