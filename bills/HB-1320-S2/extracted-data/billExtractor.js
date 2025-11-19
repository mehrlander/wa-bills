/**
 * Washington State Bill Extraction Library
 * Parses WA legislative bills in XML format and extracts structured data
 *
 * @version 1.0.0
 * @author Bill Document Analysis System
 */

const BillExtractor = (function() {
    'use strict';

    /**
     * Parse XML string into DOM Document
     * @param {string} xmlString - XML content as string
     * @returns {Document} Parsed XML document
     */
    function parseXML(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

        // Check for parsing errors (browser only)
        if (typeof xmlDoc.querySelector === 'function') {
            const parserError = querySelector(xmlDoc, 'parsererror');
            if (parserError) {
                throw new Error('XML parsing error: ' + parserError.textContent);
            }
        }

        return xmlDoc;
    }

    /**
     * Helper to query elements - works with both browser DOM and xmldom
     * @param {Element|Document} element - Element to query from
     * @param {string} selector - CSS selector
     * @returns {Element|null} First matching element
     */
    function querySelector(element, selector) {
        if (!element) return null;
        if (typeof element.querySelector === 'function') {
            return element.querySelector(selector);
        }
        // Fallback for xmldom - convert simple selectors to getElementsByTagName
        const tagName = selector.replace(/^[>\s]+/, '').split(/[\s>,]/)[0].trim();
        const elements = element.getElementsByTagName(tagName);
        return elements.length > 0 ? elements[0] : null;
    }

    /**
     * Helper to query all elements - works with both browser DOM and xmldom
     * @param {Element|Document} element - Element to query from
     * @param {string} selector - CSS selector
     * @returns {Array<Element>} Array of matching elements
     */
    function querySelectorAll(element, selector) {
        if (!element) return [];
        if (typeof element.querySelectorAll === 'function') {
            return Array.from(element.querySelectorAll(selector));
        }
        // Fallback for xmldom - convert simple selectors to getElementsByTagName
        // For comma-separated selectors, split and query each
        const selectors = selector.split(',').map(s => s.trim());
        const results = [];
        selectors.forEach(sel => {
            const tagName = sel.replace(/^[>\s]+/, '').split(/[\s>]/)[0].trim();
            const elements = element.getElementsByTagName(tagName);
            results.push(...Array.from(elements));
        });
        return results;
    }

    /**
     * Get text content from XML element, handling TextRun elements
     * @param {Element} element - XML element
     * @returns {string} Concatenated text content
     */
    function getTextContent(element) {
        if (!element) return '';

        // Handle TextRun elements by concatenating all text
        const textRuns = querySelectorAll(element, 'TextRun');
        if (textRuns.length > 0) {
            return textRuns.map(tr => tr.textContent).join('');
        }

        return element.textContent.trim();
    }

    /**
     * Extract bill metadata (identifiers, session info, etc.)
     * @param {Document} xmlDoc - Parsed XML document
     * @returns {Object} Bill metadata
     */
    function extractBillMetadata(xmlDoc) {
        const billHeading = querySelector(xmlDoc, 'BillHeading');
        const enrollingCert = querySelector(xmlDoc, 'EnrollingCertificate');
        const chapterLawElem = enrollingCert ? querySelector(enrollingCert, 'ChapterLaw') : null;
        const billElem = querySelector(xmlDoc, 'Bill');
        const certBillElem = querySelector(xmlDoc, 'CertifiedBill');

        return {
            shortId: getTextContent(billHeading ? querySelector(billHeading, 'ShortBillId') : null),
            longId: getTextContent(billHeading ? querySelector(billHeading, 'LongBillId') : null),
            asAmended: getTextContent(billHeading ? querySelector(billHeading, 'AsAmended') : null),
            legislature: getTextContent(billHeading ? querySelector(billHeading, 'Legislature') : null),
            session: getTextContent(billHeading ? querySelector(billHeading, 'Session') : null),
            sponsors: getTextContent(billHeading ? querySelector(billHeading, 'Sponsors') : null),
            briefDescription: getTextContent(billHeading ? querySelector(billHeading, 'BriefDescription') : null),
            chapterLaw: {
                number: getTextContent(chapterLawElem),
                year: chapterLawElem ? chapterLawElem.getAttribute('year') : null
            },
            sessionLawCaption: getTextContent(enrollingCert ? querySelector(enrollingCert, 'SessionLawCaption') : null),
            billType: billElem ? billElem.getAttribute('type') : null,
            certifiedBillType: certBillElem ? certBillElem.getAttribute('type') : null
        };
    }

    /**
     * Extract voting records from both chambers
     * @param {Document} xmlDoc - Parsed XML document
     * @returns {Object} Voting records
     */
    function extractVotingRecords(xmlDoc) {
        const passedByElements = querySelectorAll(xmlDoc, 'PassedBy');
        const votes = {
            house: null,
            senate: null
        };

        passedByElements.forEach(passedBy => {
            const chamber = passedBy.getAttribute('chamber');
            const voteData = {
                chamber: chamber === 'h' ? 'House' : 'Senate',
                date: getTextContent(querySelector(passedBy, 'PassedDate')),
                yeas: parseInt(getTextContent(querySelector(passedBy, 'Yeas')), 10),
                nays: parseInt(getTextContent(querySelector(passedBy, 'Nays')), 10),
                signer: getTextContent(querySelector(passedBy, 'Signer'))
            };

            if (chamber === 'h') {
                votes.house = voteData;
            } else if (chamber === 's') {
                votes.senate = voteData;
            }
        });

        return votes;
    }

    /**
     * Extract key dates (effective dates, approval dates, etc.)
     * @param {Document} xmlDoc - Parsed XML document
     * @returns {Object} Important dates
     */
    function extractDates(xmlDoc) {
        return {
            effectiveDate: getTextContent(querySelector(xmlDoc, 'EffectiveDate')),
            approvedDate: getTextContent(querySelector(xmlDoc, 'ApprovedDate')),
            filedDate: getTextContent(querySelector(xmlDoc, 'FiledDate')),
            readFirstTime: getTextContent(querySelector(xmlDoc, 'ReadDate')),
            governor: getTextContent(querySelector(xmlDoc, 'Governor'))
        };
    }

    /**
     * Extract certification information
     * @param {Document} xmlDoc - Parsed XML document
     * @returns {Object} Certificate details
     */
    function extractCertificate(xmlDoc) {
        const certificate = querySelector(xmlDoc, 'Certificate');
        if (!certificate) return null;

        return {
            certifier: getTextContent(querySelector(certificate, 'Certifier')),
            certifierPosition: getTextContent(querySelector(certificate, 'CertifierPosition')),
            text: getTextContent(querySelector(certificate, 'P'))
        };
    }

    /**
     * Extract all RCW (Revised Code of Washington) statutory references
     * @param {Document} xmlDoc - Parsed XML document
     * @returns {Array} List of RCW citations with context
     */
    function extractRCWReferences(xmlDoc) {
        const rcwRefs = [];
        const sectionCites = querySelectorAll(xmlDoc, 'SectionCite');

        sectionCites.forEach(cite => {
            const title = getTextContent(querySelector(cite, 'TitleNumber'));
            const chapter = getTextContent(querySelector(cite, 'ChapterNumber'));
            const section = getTextContent(querySelector(cite, 'SectionNumber'));

            if (title || chapter || section) {
                rcwRefs.push({
                    type: 'RCW',
                    title: title,
                    chapter: chapter,
                    section: section,
                    fullCitation: [title, chapter, section].filter(Boolean).join('.')
                });
            }
        });

        // Also extract RCW references from text content
        const billTitle = querySelector(xmlDoc, 'BillTitle');
        if (billTitle) {
            const titleText = getTextContent(billTitle);
            const rcwPattern = /RCW\s+([\d.]+)/g;
            let match;
            while ((match = rcwPattern.exec(titleText)) !== null) {
                rcwRefs.push({
                    type: 'RCW',
                    fullCitation: match[1],
                    context: 'BillTitle'
                });
            }
        }

        // Deduplicate based on fullCitation
        const uniqueRefs = [];
        const seen = new Set();
        rcwRefs.forEach(ref => {
            if (ref.fullCitation && !seen.has(ref.fullCitation)) {
                seen.add(ref.fullCitation);
                uniqueRefs.push(ref);
            }
        });

        return uniqueRefs;
    }

    /**
     * Extract federal law references (USC, CFR)
     * @param {Document} xmlDoc - Parsed XML document
     * @returns {Array} List of federal citations
     */
    function extractFederalReferences(xmlDoc) {
        const federalRefs = [];
        const allText = xmlDoc.documentElement.textContent;

        // Pattern for U.S.C. references
        const uscPattern = /(\d+)\s+U\.S\.C\.\s+Sec\.\s+([\d.]+(?:\([a-z0-9]+\))*)/gi;
        let match;

        while ((match = uscPattern.exec(allText)) !== null) {
            federalRefs.push({
                type: 'USC',
                title: match[1],
                section: match[2],
                fullCitation: `${match[1]} U.S.C. Sec. ${match[2]}`
            });
        }

        // Pattern for C.F.R. references
        const cfrPattern = /(\d+)\s+C\.F\.R\.\s+Sec\.\s+([\d.]+)/gi;
        while ((match = cfrPattern.exec(allText)) !== null) {
            federalRefs.push({
                type: 'CFR',
                title: match[1],
                section: match[2],
                fullCitation: `${match[1]} C.F.R. Sec. ${match[2]}`
            });
        }

        // Deduplicate
        const uniqueRefs = [];
        const seen = new Set();
        federalRefs.forEach(ref => {
            if (!seen.has(ref.fullCitation)) {
                seen.add(ref.fullCitation);
                uniqueRefs.push(ref);
            }
        });

        return uniqueRefs;
    }

    /**
     * Extract all bill sections with metadata
     * @param {Document} xmlDoc - Parsed XML document
     * @returns {Array} List of sections
     */
    function extractSections(xmlDoc) {
        const billSections = querySelectorAll(xmlDoc, 'BillSection');
        const sections = [];

        billSections.forEach((section, index) => {
            const header = querySelector(section, 'BillSectionHeader');
            const sectionNum = header ? querySelector(header, 'BillSectionNumber Value') : null;
            const caption = header ? querySelector(header, 'SectionCaption, Caption') : null;
            const sectionCite = header ? querySelector(header, 'SectionCite') : null;

            const sectionData = {
                index: index + 1,
                number: sectionNum ? getTextContent(sectionNum) : null,
                caption: caption ? getTextContent(caption) : null,
                type: section.getAttribute('type'),
                action: section.getAttribute('action'),
                citation: null,
                content: getTextContent(section)
            };

            // Extract citation if present
            if (sectionCite) {
                sectionData.citation = {
                    title: getTextContent(querySelector(sectionCite, 'TitleNumber')),
                    chapter: getTextContent(querySelector(sectionCite, 'ChapterNumber')),
                    section: getTextContent(querySelector(sectionCite, 'SectionNumber'))
                };
            }

            // Extract history notes
            const history = querySelector(section, 'History');
            if (history) {
                sectionData.history = getTextContent(history);
            }

            sections.push(sectionData);
        });

        return sections;
    }

    /**
     * Extract bill parts/divisions
     * @param {Document} xmlDoc - Parsed XML document
     * @returns {Array} List of parts
     */
    function extractParts(xmlDoc) {
        const partElements = querySelectorAll(xmlDoc, 'Part');
        const parts = [];

        partElements.forEach((part, index) => {
            const paragraphs = querySelectorAll(part, 'P');
            const partText = paragraphs.map(p => getTextContent(p)).join(' ');

            parts.push({
                index: index + 1,
                title: partText,
                rawText: partText
            });
        });

        return parts;
    }

    /**
     * Extract definitions from the bill
     * @param {Document} xmlDoc - Parsed XML document
     * @returns {Array} List of definitions
     */
    function extractDefinitions(xmlDoc) {
        const definitions = [];
        const sections = querySelectorAll(xmlDoc, 'BillSection');

        sections.forEach(section => {
            const caption = querySelector(section, 'SectionCaption');
            if (caption && getTextContent(caption).toUpperCase().includes('DEFINITIONS')) {
                // This is a definitions section
                const paragraphs = querySelectorAll(section, 'P');

                paragraphs.forEach(p => {
                    const text = getTextContent(p);
                    // Look for definition patterns like: (1) "Term" means...
                    const defPattern = /^\((\d+)\)\s*"([^"]+)"\s+(.+)/;
                    const match = text.match(defPattern);

                    if (match) {
                        definitions.push({
                            number: match[1],
                            term: match[2],
                            definition: match[3],
                            fullText: text
                        });
                    }
                });
            }
        });

        return definitions;
    }

    /**
     * Extract agency and department references
     * @param {Document} xmlDoc - Parsed XML document
     * @returns {Array} List of agencies mentioned
     */
    function extractAgencies(xmlDoc) {
        const agencies = new Set();
        const agencyPatterns = [
            /department of ([a-z\s,]+)/gi,
            /([a-z\s]+) department/gi,
            /(administrative office of the courts)/gi,
            /(office of [a-z\s]+)/gi
        ];

        const fullText = xmlDoc.documentElement.textContent;

        agencyPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(fullText)) !== null) {
                const agency = match[0].trim();
                // Clean up and standardize
                if (agency.length > 5 && agency.length < 100) {
                    agencies.add(agency.toLowerCase()
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')
                    );
                }
            }
        });

        return Array.from(agencies).sort();
    }

    /**
     * Extract programs and initiatives referenced
     * @param {Document} xmlDoc - Parsed XML document
     * @returns {Array} List of programs/initiatives
     */
    function extractPrograms(xmlDoc) {
        const programs = [];
        const fullText = xmlDoc.documentElement.textContent;

        // Pattern for Initiative Measures
        const initiativePattern = /Initiative Measure No\.\s*(\d+)/gi;
        let match;

        const seen = new Set();
        while ((match = initiativePattern.exec(fullText)) !== null) {
            const initiative = `Initiative Measure No. ${match[1]}`;
            if (!seen.has(initiative)) {
                seen.add(initiative);
                programs.push({
                    type: 'Initiative',
                    name: initiative,
                    number: match[1]
                });
            }
        }

        // Look for protection order types
        const protectionOrderTypes = [
            'domestic violence protection order',
            'vulnerable adult protection order',
            'antiharassment protection order',
            'sexual assault protection order',
            'stalking protection order',
            'extreme risk protection order'
        ];

        protectionOrderTypes.forEach(orderType => {
            const regex = new RegExp(orderType, 'i');
            if (regex.test(fullText)) {
                programs.push({
                    type: 'Protection Order',
                    name: orderType.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                });
            }
        });

        return programs;
    }

    /**
     * Extract fiscal information (costs, funding, appropriations)
     * @param {Document} xmlDoc - Parsed XML document
     * @returns {Object} Fiscal data
     */
    function extractFiscalData(xmlDoc) {
        const fiscal = {
            amounts: [],
            fiscalNotes: [],
            fundingProvisions: []
        };

        const fullText = xmlDoc.documentElement.textContent;

        // Pattern for dollar amounts
        const dollarPattern = /\$[\d,]+(?:,\d{3})*(?:\.\d{2})?/g;
        let match;

        const amounts = new Set();
        while ((match = dollarPattern.exec(fullText)) !== null) {
            amounts.add(match[0]);
        }
        fiscal.amounts = Array.from(amounts);

        // Look for funding-related sections
        const sections = querySelectorAll(xmlDoc, 'BillSection');
        sections.forEach(section => {
            const text = getTextContent(section);

            if (/funding|appropriation|fiscal|budget/i.test(text)) {
                const caption = querySelector(section, 'SectionCaption, Caption');
                fiscal.fundingProvisions.push({
                    section: getTextContent(querySelector(section, 'BillSectionNumber Value')),
                    caption: caption ? getTextContent(caption) : null,
                    text: text.substring(0, 500) // First 500 chars
                });
            }
        });

        return fiscal;
    }

    /**
     * Extract legislative actions (amending, repealing, adding)
     * @param {Document} xmlDoc - Parsed XML document
     * @returns {Object} Categorized legislative actions
     */
    function extractLegislativeActions(xmlDoc) {
        const actions = {
            amending: [],
            repealing: [],
            adding: [],
            recodifying: [],
            reenacting: []
        };

        const sections = querySelectorAll(xmlDoc, 'BillSection');

        sections.forEach(section => {
            const action = section.getAttribute('action');
            const sectionNum = getTextContent(querySelector(section, 'BillSectionNumber Value'));
            const caption = getTextContent(querySelector(section, 'SectionCaption, Caption'));
            const citation = querySelector(section, 'SectionCite');

            const actionData = {
                section: sectionNum,
                caption: caption,
                citation: citation ? {
                    title: getTextContent(querySelector(citation, 'TitleNumber')),
                    chapter: getTextContent(querySelector(citation, 'ChapterNumber')),
                    section: getTextContent(querySelector(citation, 'SectionNumber'))
                } : null
            };

            switch(action) {
                case 'amend':
                    actions.amending.push(actionData);
                    break;
                case 'repeal':
                    actions.repealing.push(actionData);
                    break;
                case 'addsect':
                case 'addchap':
                    actions.adding.push({...actionData, addType: action});
                    break;
                case 'recod':
                    actions.recodifying.push(actionData);
                    break;
                case 'remd':
                    actions.reenacting.push(actionData);
                    break;
            }
        });

        return actions;
    }

    /**
     * Extract complete bill data - main entry point
     * @param {string} xmlString - XML content as string
     * @returns {Object} Complete extracted bill data
     */
    function extractBillData(xmlString) {
        const xmlDoc = parseXML(xmlString);

        return {
            metadata: extractBillMetadata(xmlDoc),
            votes: extractVotingRecords(xmlDoc),
            dates: extractDates(xmlDoc),
            certificate: extractCertificate(xmlDoc),
            statutoryReferences: {
                rcw: extractRCWReferences(xmlDoc),
                federal: extractFederalReferences(xmlDoc)
            },
            sections: extractSections(xmlDoc),
            parts: extractParts(xmlDoc),
            definitions: extractDefinitions(xmlDoc),
            agencies: extractAgencies(xmlDoc),
            programs: extractPrograms(xmlDoc),
            fiscal: extractFiscalData(xmlDoc),
            legislativeActions: extractLegislativeActions(xmlDoc),
            statistics: {
                totalSections: querySelectorAll(xmlDoc, 'BillSection').length,
                totalParts: querySelectorAll(xmlDoc, 'Part').length,
                totalRCWReferences: extractRCWReferences(xmlDoc).length,
                totalDefinitions: extractDefinitions(xmlDoc).length
            }
        };
    }

    /**
     * Query extracted data using JSONPath-like syntax
     * Requires lodash from CDN
     * @param {Object} data - Extracted bill data
     * @param {string} path - Dot-notation path to data
     * @returns {*} Queried data
     */
    function query(data, path) {
        if (typeof _ !== 'undefined') {
            return _.get(data, path);
        } else {
            // Fallback if lodash not available
            return path.split('.').reduce((obj, key) => obj && obj[key], data);
        }
    }

    /**
     * Search for text within bill data
     * @param {Object} data - Extracted bill data
     * @param {string} searchTerm - Term to search for
     * @returns {Object} Search results
     */
    function search(data, searchTerm) {
        const results = {
            sections: [],
            definitions: [],
            agencies: []
        };

        const term = searchTerm.toLowerCase();

        // Search sections
        data.sections.forEach(section => {
            if ((section.caption && section.caption.toLowerCase().includes(term)) ||
                (section.content && section.content.toLowerCase().includes(term))) {
                results.sections.push(section);
            }
        });

        // Search definitions
        data.definitions.forEach(def => {
            if ((def.term && def.term.toLowerCase().includes(term)) ||
                (def.definition && def.definition.toLowerCase().includes(term))) {
                results.definitions.push(def);
            }
        });

        // Search agencies
        data.agencies.forEach(agency => {
            if (agency.toLowerCase().includes(term)) {
                results.agencies.push(agency);
            }
        });

        return results;
    }

    // Public API
    return {
        parseXML,
        extractBillData,
        extractBillMetadata,
        extractVotingRecords,
        extractDates,
        extractRCWReferences,
        extractFederalReferences,
        extractSections,
        extractParts,
        extractDefinitions,
        extractAgencies,
        extractPrograms,
        extractFiscalData,
        extractLegislativeActions,
        query,
        search
    };
})();

// Export for Node.js if available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BillExtractor;
}
