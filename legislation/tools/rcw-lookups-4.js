// rcw-lookups.js - RCW chapter lookup and linkification utilities
const CHAPTERS_URL = 'https://raw.githubusercontent.com/mehrlander/wa-bills/main/legislation/tools/rcw-chapters.json';
const TITLES_URL = 'https://raw.githubusercontent.com/mehrlander/wa-bills/main/legislation/tools/rcw-titles.json';

let chapters = null, titles = null;
let byChapter = null, byTitle = null;

const ensureLoaded = async () => {
    if (!chapters) {
        [chapters, titles] = await Promise.all([
            fetch(CHAPTERS_URL).then(r => r.json()),
            fetch(TITLES_URL).then(r => r.json())
        ]);
        byChapter = Object.fromEntries(chapters.map(c => [c.Chapter, c]));
        byTitle = Object.fromEntries(titles.map(t => [t.title.toUpperCase(), t]));
    }
};

export const getChapterInfo = async ch => {
    await ensureLoaded();
    return byChapter[ch];
};

export const getTitleInfo = async t => {
    await ensureLoaded();
    return byTitle[t.toUpperCase()];
};

const tip = (text, content) => `<span class="rcw-tip" data-tip="${text.replace(/"/g, '&quot;')}">${content}</span>`;

export const linkify = (ch, info) => {
    if (!info) return ch;
    const text = `${info.Description} (Title ${info.Title}: ${info.Title_Name})`;
    return tip(text, `<a href="${info.URL}" target="_blank" rel="noopener" class="link link-primary">${ch}</a>`);
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
        const info = byTitle[t.toUpperCase()];
        if (!info) return t;
        const titleUrl = `https://app.leg.wa.gov/RCW/default.aspx?cite=${t}`;
        return tip(info.name, `<a href="${titleUrl}" target="_blank" rel="noopener" class="link link-primary">${t}</a>`);
    }).join(', ');
};

export const tooltipStyles = `
.rcw-tip { position: relative; }
.rcw-tip::after {
    content: attr(data-tip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding: 4px 8px;
    background: white;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 11px;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    opacity: 0;
    pointer-events: none;
    z-index: 1000;
}
.rcw-tip:hover::after { opacity: 1; }
`;
