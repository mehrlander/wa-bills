// xl-data.js - Focused Data SDK
window.xl = {
    // Standardized Sanitization (Handling Excel date bug and nulls)
    sanitize: (v) => {
        if (v === null || v === undefined || String(v).trim() === "") return null;
        if (v === true || v === 'true' || v === 1 || v === '1') return "1";
        if (v === false || v === 'false' || v === 0 || v === '0') return "0";
        let val = String(v).trim();
        
        // Excel Date Bug Check (+1 day offset for 1900 leap year bug)
        if (/^\d{5}$/.test(val)) {
            const n = parseInt(val);
            if (n > 40000 && n < 60000) {
                const dt = luxon.DateTime.fromJSDate(new Date(Math.round((n - 25569 + 1) * 86400 * 1000)));
                if (dt.isValid) return dt.toFormat('M/d/yyyy');
            }
        }
        
        // General ISO Date formatting
        const iso = val.split('T')[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(iso) && !val.startsWith('0001')) {
            const dt = luxon.DateTime.fromISO(iso);
            return dt.isValid ? dt.toFormat('M/d/yyyy') : val;
        }
        return val;
    },

    // TSV Serialization
    toTsv: (arr) => {
        if (!arr?.length) return "";
        const keys = [...new Set(arr.flatMap(Object.keys))];
        return [keys.join('\t'), ...arr.map(r => keys.map(k => String(r[k] ?? "").replace(/\t/g, " ")).join('\t'))].join('\n');
    },

    // TSV Parsing
    fromTsv: (txt) => {
        const lines = txt.split(/\r?\n/).filter(l => l.trim() !== "");
        if (lines.length < 2) return [];
        const heads = lines[0].split('\t').map(h => h.trim());
        return lines.slice(1).map(l => {
            const cells = l.split('\t');
            return Object.fromEntries(heads.map((h, i) => [h, cells[i] || null]));
        });
    },

    // Excel Workbook Table Extraction
    parseWorkbook: async (file) => {
        const D = new DOMParser();
        const X = (s, q, f = n => n) => [...D.parseFromString(s, "text/xml").querySelectorAll(q)].map(f);
        const Attr = (e, k) => e.getAttribute(k) || "";
        const C = s => [...s].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0) - 1;
        const N = i => { let s = "", n = i; while (n >= 0) { s = String.fromCharCode(n % 26 + 65) + s; n = Math.floor(n / 26) - 1 } return s };

        const z = await JSZip.loadAsync(file);
        const T = p => z.files[p]?.async("string");
        const ss = await T("xl/sharedStrings.xml"), S = ss ? X(ss, "si", s => s.querySelector("t")?.textContent || "") : [];
        
        let W = {}, R = {};
        for (let p of Object.keys(z.files).filter(p => /worksheets\/sheet\d+\.xml$/.test(p))) {
            let m = await T(p); W[p] = {};
            X(m, "c", c => { 
                let r = Attr(c, "r"), t = Attr(c, "t"), v = c.querySelector("v")?.textContent || ""; 
                W[p][r] = t == "s" ? S[+v] ?? "" : v 
            });
            let l = await T(p.replace("worksheets/", "worksheets/_rels/") + ".rels");
            l && X(l, "Relationship", r => Attr(r, "Target").match(/table(\d+)/)?.[1] && (R["xl/tables/table" + RegExp.$1 + ".xml"] = p));
        }

        const tables = {};
        for (const p of Object.keys(z.files).filter(p => /tables\/table\d+\.xml$/.test(p))) {
            let m = await T(p), t = D.parseFromString(m, "text/xml").querySelector("table");
            let [, a, b, c, d] = Attr(t, "ref").match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/);
            let K = X(m, "tableColumn", col => Attr(col, "name")), V = W[R[p]] || {};
            tables[Attr(t, "displayName")] = [...Array(d - b | 0)].map((_, i) => 
                Object.fromEntries(K.map((k, j) => [k, String(V[N(C(a) + j) + (+b + i + 1)] ?? "").trim()]))
            );
        }
        return tables;
    }
};
