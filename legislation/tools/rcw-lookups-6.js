// rcw-lookups.js - RCW chapter lookup and linkification utilities
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

export const linkifyList = chapterStr => {
    if (!chapterStr || !byChapter) return { html: chapterStr || '', tip: '' };
    const parts = chapterStr.split(', ').filter(Boolean);
    const tips = [];
    const html = parts.map(ch => {
        const info = byChapter[ch];
        if (!info) return ch;
        tips.push(`${ch}: ${info.Description}`);
        return `<a href="${info.URL}" target="_blank" rel="noopener" class="link link-primary">${ch}</a>`;
    }).join(', ');
    return { html, tip: tips.join('\n') };
};

export const linkifyTitles = titleStr => {
    if (!titleStr || !byTitle) return { html: titleStr || '', tip: '' };
    const parts = titleStr.split(', ').filter(Boolean);
    const tips = [];
    const html = parts.map(t => {
        const info = byTitle[t.toUpperCase()];
        if (!info) return t;
        tips.push(`${t}: ${info.name}`);
        const titleUrl = `https://app.leg.wa.gov/RCW/default.aspx?cite=${t}`;
        return `<a href="${titleUrl}" target="_blank" rel="noopener" class="link link-primary">${t}</a>`;
    }).join(', ');
    return { html, tip: tips.join('\n') };
};
