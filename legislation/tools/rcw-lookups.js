// rcw-lookup.js
const chapters = await fetch('...rcw-chapters.json').then(r => r.json());
const byChapter = Object.fromEntries(chapters.map(c => [c.Chapter, c]));

export const getChapterInfo = ch => byChapter[ch];
export const linkify = ch => {
    const info = byChapter[ch];
    return info ? `<a href="${info.URL}" target="_blank" class="tooltip" data-tip="${info.Description}">${ch}</a>` : ch;
};
export const linkifyList = chs => chs.split(', ').filter(Boolean).map(linkify).join(', ');
