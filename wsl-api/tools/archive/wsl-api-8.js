// wsl-api.js - WSL Web Services API utilities
import { XMLParser } from 'https://cdn.jsdelivr.net/npm/fast-xml-parser@4.5.1/+esm';
import { flatten } from 'https://cdn.jsdelivr.net/npm/flat@6.0.0/+esm';
export { PENSION_MAP, classifyPensionBill } from 'https://cdn.jsdelivr.net/gh/mehrlander/wa-bills@main/legislation/tools/pension-rcw.js';
import { classifyPensionBill } from 'https://cdn.jsdelivr.net/gh/mehrlander/wa-bills@main/legislation/tools/pension-rcw.js';

const parser = new XMLParser({ 
    ignoreNameSpace: true, 
    parseAttributeValue: true, 
    isArray: (name) => ['RcwCiteAffected','LegislationInfo','CommitteeAction','CommitteeReferral','LegislativeStatus','CommitteeRecommendation'].includes(name) 
});
const BASE = 'https://wslwebservices.leg.wa.gov';

export const ABBR = {
    'Companions.Companion.': 'c.',
    'CurrentStatus.': 'cs.',
    'ShortLegislationType.': 'slt.',
    'RCW.': 'r.'
};

/** CORE UTILITIES **/
export const sanitize = v => {
    if (v === null || v === undefined || String(v).trim() === '') return null;
    let val = String(v).trim();
    if (val === 'true') return '1';
    if (val === 'false') return '0';
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
    for (let k in f) {
        let key = k.trim();
        if (['Companions', '', '\r', 'PK_Count'].includes(key)) continue;
        let val = sanitize(f[key]);
        if (val === null) continue;
        Object.entries(ABBR).forEach(([long, short]) => {
            if (key.startsWith(long)) key = key.replace(long, short);
        });
        out[key] = val;
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

const getBillNumber = (b) => b?.BillNumber || b?.BillId?.match(/\d+/)?.[0];

/** BASE FETCHERS - Legislation & Sponsors **/
export const getLegislation = (sinceDate) => fetchAndParse(`${BASE}/LegislationService.asmx/GetLegislationIntroducedSince?sinceDate=${sinceDate}`);
export const getPrefiles = () => fetchAndParse(`${BASE}/LegislationService.asmx/GetPrefiledLegislation`);
export const getSponsors = (biennium) => fetchAndParse(`${BASE}/SponsorService.asmx/GetSponsors?biennium=${biennium}`);

/** BASE FETCHERS - RCW, Actions, Referrals, History **/
export const getRcw = async (biennium, billId) => {
    const res = await fetchAndParse(`${BASE}/LegislationService.asmx/GetRcwCitesAffected?biennium=${biennium}&billId=${billId}`);
    return res.map(r => r.RcwCite).filter(Boolean);
};

const flattenRecs = (recs = []) => {
    const out = {}, maj = recs.find(r => r.RecommendationType === 'Majority'), min = recs.find(r => r.RecommendationType === 'Minority');
    if (maj) { out['r.MajorityCode'] = maj.Recommendation; out['r.MajorityLong'] = maj.LongRecommendation; out['r.MajoritySigned'] = maj.MembersSigned; }
    if (min) { out['r.MinorityCode'] = min.Recommendation; out['r.MinorityLong'] = min.LongRecommendation; out['r.MinoritySigned'] = min.MembersSigned; }
    return out;
};

export const getActions = async (billNumber, biennium = '2025-26') => {
    const p = await fetchRaw(`${BASE}/CommitteeActionService.asmx/GetCommitteeExecutiveActionsByBill?biennium=${biennium}&billNumber=${billNumber}`);
    return (p.ArrayOfCommitteeAction?.CommitteeAction || []).map(a => ({
        AgendaId: String(a.AgendaId), HearingDate: sanitize(a.HearingDate), BillId: a.LegislationInfo?.BillId,
        BillNumber: String(a.LegislationInfo?.BillNumber || ''), DisplayNumber: String(a.LegislationInfo?.DisplayNumber || ''),
        Committee: a.Committee?.Acronym, CommitteeLong: a.Committee?.LongName, Agency: a.Committee?.Agency,
        ReferredTo: a.ReferredToCommittee?.Acronym || null, ReferredToLong: a.ReferredToCommittee?.LongName || null,
        ...flattenRecs(a.CommitteeRecommendations?.CommitteeRecommendation)
    }));
};

export const getReferrals = async (billNumber, biennium = '2025-26') => {
    const p = await fetchRaw(`${BASE}/CommitteeActionService.asmx/GetCommitteeReferralsByBill?biennium=${biennium}&billNumber=${billNumber}`);
    return (p.ArrayOfCommitteeReferral?.CommitteeReferral || []).map(r => ({
        BillId: r.LegislationInfo?.BillId, BillNumber: String(r.LegislationInfo?.BillNumber || ''),
        DisplayNumber: String(r.LegislationInfo?.DisplayNumber || ''), Committee: r.Committee?.Acronym,
        CommitteeLong: r.Committee?.LongName, Agency: r.Committee?.Agency, ReferredDate: sanitize(r.ReferredDate)
    }));
};

export const getHistory = async (billNumber, biennium = '2025-26', beginDate = '1/1/2025', endDate = '12/31/2026') => {
    const p = await fetchRaw(`${BASE}/LegislationService.asmx/GetLegislativeStatusChangesByBillNumber?biennium=${biennium}&billNumber=${billNumber}&beginDate=${beginDate}&endDate=${endDate}`);
    return (p.ArrayOfLegislativeStatus?.LegislativeStatus || []).map(s => ({
        BillId: s.BillId, ActionDate: sanitize(s.ActionDate), HistoryLine: s.HistoryLine,
        Status: s.Status, AmendmentsExist: s.AmendmentsExist ? '1' : '0'
    }));
};

/** SINGLE-OBJECT ENRICHMENT FUNCTIONS **/
export const withRcw = async (b, biennium = '2025-26') => {
    const billId = b.BillId;
    if (!billId) return b;
    const rcws = await getRcw(biennium, billId);
    b['r.Rcws'] = rcws.length ? rcws.join('|') : 'none';
    if (rcws.length) {
        const cats = classifyPensionBill(rcws);
        b['r.PensionLabels'] = cats.PensionLabels.join('|');
        b['r.AdjacentLabels'] = cats.AdjacentLabels.join('|');
        b['r.PensionRcws'] = cats.PensionRcws.join('|');
        b['r.AdjacentRcws'] = cats.AdjacentRcws.join('|');
        b['r.isPension'] = cats.hasPension ? '1' : '0';
    }
    return b;
};

export const withActions = async (b, biennium = '2025-26') => {
    const bn = getBillNumber(b);
    if (!bn) return b;
    const acts = await getActions(bn, biennium);
    b['a.Count'] = String(acts.length);
    if (acts.length) {
        const last = acts[acts.length - 1];
        b['a.LastDate'] = last.HearingDate;
        b['a.LastCommittee'] = last.Committee;
        b['a.LastMajorityCode'] = last['r.MajorityCode'] || '';
        b['a.LastMinorityCode'] = last['r.MinorityCode'] || '';
        b['a.Committees'] = [...new Set(acts.map(a => a.Committee))].join('|');
    }
    return b;
};

export const withReferrals = async (b, biennium = '2025-26') => {
    const bn = getBillNumber(b);
    if (!bn) return b;
    const refs = await getReferrals(bn, biennium);
    b['ref.Count'] = String(refs.length);
    if (refs.length) {
        b['ref.Committees'] = [...new Set(refs.map(r => r.Committee))].join('|');
        b['ref.FirstDate'] = refs[0].ReferredDate;
        b['ref.LastDate'] = refs[refs.length - 1].ReferredDate;
    }
    return b;
};

export const withHistory = async (b, biennium = '2025-26', beginDate = '1/1/2025', endDate = '12/31/2026') => {
    const bn = getBillNumber(b);
    if (!bn) return b;
    const hist = await getHistory(bn, biennium, beginDate, endDate);
    b['h.Count'] = String(hist.length);
    if (hist.length) {
        const last = hist[hist.length - 1];
        b['h.FirstDate'] = hist[0].ActionDate;
        b['h.LastDate'] = last.ActionDate;
        b['h.LastLine'] = last.HistoryLine;
        b['h.Status'] = last.Status;
    }
    return b;
};

export const withSponsors = (b, sponsorsMap) => {
    const sp = sponsorsMap[b.PrimeSponsorID];
    if (sp) {
        b['ps.LongName'] = sp.LongName;
        b['ps.Agency'] = sp.Agency;
        b['ps.Acronym'] = sp.Acronym;
    }
    return b;
};
