// wsl-api.js - WSL Web Services API utilities
import { XMLParser } from 'https://cdn.jsdelivr.net/npm/fast-xml-parser@4.5.1/+esm';
import { flatten } from 'https://cdn.jsdelivr.net/npm/flat@6.0.0/+esm';
export { 
    PENSION_MAP, 
    classifyPensionBill,
    preload,
    getChapterInfo,
    getTitleInfo,
    getCiteInfo,
    linkifyList,
    linkifyTitles,
    chapterTooltip,
    titleTooltip,
    buildRcwPopup,
    buildChapterPopup,
    buildTitlePopup,
    buildPensionPopup,
    buildAdjacentPopup
} from './rcw-utils-6.js';
import { classifyPensionBill } from './rcw-utils-6.js';

const parser = new XMLParser({ 
    ignoreNameSpace: true, 
    parseAttributeValue: true, 
    isArray: (name) => ['RcwCiteAffected','LegislationInfo','CommitteeAction','CommitteeReferral','LegislativeStatus','CommitteeRecommendation'].includes(name) 
});
const BASE = 'https://wslwebservices.leg.wa.gov';

export const ABBR = {
    'Companions.Companion.': 'c.',
    'CurrentStatus.': 'cs.',
    'RCW.': 'r.'
};

const REQUESTED_BY_MAP = {
    'RequestedByGovernor': 'Governor',
    'RequestedByBudgetCommittee': 'BudgetCommittee',
    'RequestedByDepartment': 'Department',
    'RequestedByOther': 'Other'
};

export const sanitize = v => {
    if (v === null || v === undefined || String(v).trim() === '') return null;
    let val = String(v).trim();
    if (val === 'true' || v === true) return '1';
    if (val === 'false' || v === false) return '0';
    if (val.startsWith('0001-01-01')) return null;
    const iso = val.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
        const [y, m, d] = iso.split('-');
        return `${+m}/${+d}/${y}`;
    }
    return val;
};

export const transform = r => {
    if (!r) return null;
    const f = flatten(r), out = {};
    const requestedByActive = [];

    for (let k in f) {
        let key = k.trim();
        
        // Handle the double-nested LegislationType keys from the raw XML
        if (['Companions', '', '\r', 'PK_Count'].includes(key) || key.includes('LegislationType')) continue;

        let val = sanitize(f[key]);
        if (val === null) continue;

        if (REQUESTED_BY_MAP[key]) {
            if (val === '1') requestedByActive.push(REQUESTED_BY_MAP[key]);
            continue;
        }

        Object.entries(ABBR).forEach(([long, short]) => {
            if (key.startsWith(long)) key = key.replace(long, short);
        });
        out[key] = val;
    }

    if (requestedByActive.length > 0) {
        out['RequestedBy'] = requestedByActive.join(', ');
    }

    return out;
};

export const consolidate = (recs, pk = 'BillId') => {
    const g = {};
    recs.forEach(r => { if (r?.[pk]) (g[r[pk]] = g[r[pk]] || []).push(r); });
    return Object.entries(g).map(([id, grp]) => {
        const res = grp.length === 1 ? { ...grp[0] } : { PK_Count: String(grp.length) };
        if (grp.length > 1) {
            const keys = [...new Set(grp.flatMap(Object.keys))];
            keys.forEach(k => {
                const v = [...new Set(grp.map(x => x[k]).filter(y => y != null))];
                res[k] = v.length > 1 ? v.sort().join('|') : v[0];
            });
        } else { res.PK_Count = '1'; }
        return res;
    });
};

const findArray = obj => {
    if (Array.isArray(obj)) return obj;
    if (obj && typeof obj === 'object') {
        for (const v of Object.values(obj)) {
            const found = findArray(v);
            if (found) return found;
        }
    }
    return null;
};

export const fetchAndParse = async (url) => {
    const res = await fetch(url);
    const xml = await res.text();
    const parsed = parser.parse(xml);
    const arr = findArray(parsed) || [parsed];
    return arr.map(transform).filter(Boolean);
};

const fetchRaw = async (url) => parser.parse(await (await fetch(url)).text());

export const getBillNumber = (b) => b?.BillNumber || b?.BillId?.match(/\d+/)?.[0];

export const getLegislation = async (sinceDate) => {
    const res = await fetch(`${BASE}/LegislationService.asmx/GetLegislationIntroducedSince?sinceDate=${sinceDate}`);
    const xml = await res.text();
    const parsed = parser.parse(xml);
    const arr = findArray(parsed) || [parsed];
    return arr
        .filter(item => {
            // Fix: Accessing nested object property
            const type = item.ShortLegislationType?.ShortLegislationType || 
                         item.LegislationInfo?.ShortLegislationType?.ShortLegislationType;
            return type === 'B';
        })
        .map(transform)
        .filter(Boolean);
};

export const getPrefiles = async () => {
    const res = await fetch(`${BASE}/LegislationService.asmx/GetPrefiledLegislation`);
    const xml = await res.text();
    const parsed = parser.parse(xml);
    const arr = findArray(parsed) || [parsed];
    return arr
        .filter(item => {
            const type = item.ShortLegislationType?.ShortLegislationType || 
                         item.LegislationInfo?.ShortLegislationType?.ShortLegislationType;
            return type === 'B';
        })
        .map(transform)
        .filter(Boolean);
};

export const getSponsors = (biennium) => fetchAndParse(`${BASE}/SponsorService.asmx/GetSponsors?biennium=${biennium}`);

export const getRcwFor = async (b, biennium = '2025-26') => {
    const billId = b?.BillId || b;
    if (!billId) return null;
    const res = await fetchAndParse(`${BASE}/LegislationService.asmx/GetRcwCitesAffected?biennium=${biennium}&billId=${billId}`);
    const rcws = res.map(r => r.RcwCite).filter(Boolean);
    const cats = classifyPensionBill(rcws);
    return {
        BillId: billId,
        Rcws: rcws.length ? rcws.join('|') : 'none',
        PensionLabels: cats.PensionLabels.join('|'),
        AdjacentLabels: cats.AdjacentLabels.join('|'),
        PensionRcws: cats.PensionRcws.join('|'),
        AdjacentRcws: cats.AdjacentRcws.join('|'),
        isPension: cats.hasPension ? '1' : '0'
    };
};

const flattenRecs = (recs = []) => {
    const out = {}, maj = recs.find(r => r.RecommendationType === 'Majority'), min = recs.find(r => r.RecommendationType === 'Minority');
    if (maj) { out['r.MajorityCode'] = maj.Recommendation; out['r.MajorityLong'] = maj.LongRecommendation; out['r.MajoritySigned'] = maj.MembersSigned; }
    if (min) { out['r.MinorityCode'] = min.Recommendation; out['r.MinorityLong'] = min.LongRecommendation; out['r.MinoritySigned'] = min.MembersSigned; }
    return out;
};

export const getActionsFor = async (b, biennium = '2025-26') => {
    const bn = getBillNumber(b);
    if (!bn) return [];
    const p = await fetchRaw(`${BASE}/CommitteeActionService.asmx/GetCommitteeExecutiveActionsByBill?biennium=${biennium}&billNumber=${bn}`);
    return (p.ArrayOfCommitteeAction?.CommitteeAction || []).map(a => ({
        BillNumber: bn,
        AgendaId: String(a.AgendaId), 
        HearingDate: sanitize(a.HearingDate), 
        BillId: a.LegislationInfo?.BillId,
        DisplayNumber: String(a.LegislationInfo?.DisplayNumber || ''),
        Committee: a.Committee?.Acronym, 
        CommitteeLong: a.Committee?.LongName, 
        Agency: a.Committee?.Agency,
        ReferredTo: a.ReferredToCommittee?.Acronym || null, 
        ReferredToLong: a.ReferredToCommittee?.LongName || null,
        ...flattenRecs(a.CommitteeRecommendations?.CommitteeRecommendation)
    }));
};

export const getReferralsFor = async (b, biennium = '2025-26') => {
    const bn = getBillNumber(b);
    if (!bn) return [];
    const p = await fetchRaw(`${BASE}/CommitteeActionService.asmx/GetCommitteeReferralsByBill?biennium=${biennium}&billNumber=${bn}`);
    return (p.ArrayOfCommitteeReferral?.CommitteeReferral || []).map(r => ({
        BillNumber: bn,
        BillId: r.LegislationInfo?.BillId,
        DisplayNumber: String(r.LegislationInfo?.DisplayNumber || ''), 
        Committee: r.Committee?.Acronym,
        CommitteeLong: r.Committee?.LongName, 
        Agency: r.Committee?.Agency, 
        ReferredDate: sanitize(r.ReferredDate)
    }));
};

export const getHistoryFor = async (b, biennium = '2025-26', beginDate = '1/1/2025', endDate = '12/31/2026') => {
    const bn = getBillNumber(b);
    if (!bn) return [];
    const p = await fetchRaw(`${BASE}/LegislationService.asmx/GetLegislativeStatusChangesByBillNumber?biennium=${biennium}&billNumber=${bn}&beginDate=${beginDate}&endDate=${endDate}`);
    return (p.ArrayOfLegislativeStatus?.LegislativeStatus || []).map(s => ({
        BillNumber: bn,
        BillId: s.BillId, 
        ActionDate: sanitize(s.ActionDate), 
        HistoryLine: s.HistoryLine,
        Status: s.Status, 
        AmendmentsExist: s.AmendmentsExist ? '1' : '0'
    }));
};

export const joinRcw = (bill, rcwsMap) => {
    const rcw = rcwsMap[bill.BillId];
    if (rcw) {
        bill['r.Rcws'] = rcw.Rcws;
        bill['r.PensionLabels'] = rcw.PensionLabels;
        bill['r.AdjacentLabels'] = rcw.AdjacentLabels;
        bill['r.PensionRcws'] = rcw.PensionRcws;
        bill['r.AdjacentRcws'] = rcw.AdjacentRcws;
        bill['r.isPension'] = rcw.isPension;
    }
    return bill;
};

export const joinActions = (bill, actionsMap) => {
    const bn = getBillNumber(bill);
    const acts = actionsMap[bn];
    if (acts?.length) {
        const last = acts[acts.length - 1];
        bill['a.Count'] = String(acts.length);
        bill['a.LastDate'] = last.HearingDate;
        bill['a.LastCommittee'] = last.Committee;
        bill['a.LastMajorityCode'] = last['r.MajorityCode'] || '';
        bill['a.LastMinorityCode'] = last['r.MinorityCode'] || '';
        bill['a.Committees'] = [...new Set(acts.map(a => a.Committee))].join('|');
    }
    return bill;
};

export const joinReferrals = (bill, referralsMap) => {
    const bn = getBillNumber(bill);
    const refs = referralsMap[bn];
    if (refs?.length) {
        bill['ref.Count'] = String(refs.length);
        bill['ref.Committees'] = [...new Set(refs.map(r => r.Committee))].join('|');
        bill['ref.FirstDate'] = refs[0].ReferredDate;
        bill['ref.LastDate'] = refs[refs.length - 1].ReferredDate;
    }
    return bill;
};

export const joinHistory = (bill, historyMap) => {
    const bn = getBillNumber(bill);
    const hist = historyMap[bn];
    if (hist?.length) {
        const last = hist[hist.length - 1];
        bill['h.Count'] = String(hist.length);
        bill['h.FirstDate'] = hist[0].ActionDate;
        bill['h.LastDate'] = last.ActionDate;
        bill['h.LastLine'] = last.HistoryLine;
        bill['h.Status'] = last.Status;
    }
    return bill;
};

export const joinSponsors = (bill, sponsorsMap) => {
    const sp = sponsorsMap[bill.PrimeSponsorID];
    if (sp) {
        bill['ps.LongName'] = sp.LongName;
        bill['ps.Agency'] = sp.Agency;
        bill['ps.Acronym'] = sp.Acronym;
    }
    return bill;
};

export const groupWithCompanions = (bills) => {
    const byNumber = {};
    bills.forEach(b => {
        const num = b.BillNumber;
        if (!byNumber[num]) byNumber[num] = [];
        byNumber[num].push(b);
    });
    
    const groups = [];
    const seen = new Set();
    
    Object.entries(byNumber).forEach(([num, bills]) => {
        if (seen.has(num)) return;
        seen.add(num);
        
        const group = { numbers: [num], bills: [...bills] };
        
        // Check for companion
        for (const b of bills) {
            const companionNum = b['c.BillId']?.replace(/[A-Z\s]/g, '');
            if (companionNum && byNumber[companionNum] && !seen.has(companionNum)) {
                seen.add(companionNum);
                group.numbers.push(companionNum);
                group.bills.push(...byNumber[companionNum]);
            }
        }
        
        groups.push(group);
    });
    
    return groups;
};
