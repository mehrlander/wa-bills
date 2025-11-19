/**
 * Washington State Legislative Bill Data Extractor
 * Parses XML and HTML bill formats to extract structured data
 * Version 1.0.0
 */

const BillExtractor = (function() {
  'use strict';

  /**
   * Parse XML content from string
   */
  function parseXML(xmlString) {
    const parser = new DOMParser();
    return parser.parseFromString(xmlString, 'text/xml');
  }

  /**
   * Parse HTML content from string
   */
  function parseHTML(htmlString) {
    const parser = new DOMParser();
    return parser.parseFromString(htmlString, 'text/html');
  }

  /**
   * Extract text content from XML element, handling TextRun elements
   */
  function getTextContent(element) {
    if (!element) return '';

    // Handle TextRun elements
    const textRuns = element.querySelectorAll('TextRun');
    if (textRuns.length > 0) {
      return Array.from(textRuns).map(tr => tr.textContent).join('');
    }

    return element.textContent.trim();
  }

  /**
   * Extract dollar amount from text, removing formatting
   */
  function parseDollarAmount(text) {
    if (!text) return null;

    // Remove strikethrough markers and get clean amount
    const cleanText = text.replace(/\(\(/g, '').replace(/\)\)/g, '');

    // Match dollar amounts like $59,938,000 or ($59,938,000)
    const match = cleanText.match(/\$[\d,]+/);
    if (!match) return null;

    const amount = match[0].replace(/[$,]/g, '');
    return parseInt(amount, 10);
  }

  /**
   * Determine if text is an amendment (add or strike)
   */
  function getAmendmentType(element) {
    if (!element) return null;

    const textRuns = element.querySelectorAll('TextRun');
    for (let tr of textRuns) {
      const style = tr.getAttribute('amendingStyle');
      if (style === 'add') return 'add';
      if (style === 'strike') return 'strike';
    }
    return null;
  }

  /**
   * Extract bill metadata from XML
   */
  function extractBillMetadata(doc) {
    const metadata = {
      billId: null,
      longBillId: null,
      legislature: null,
      session: null,
      sponsors: null,
      briefDescription: null,
      chapterLaw: null,
      vetoAction: null,
      effectiveDate: null,
      passageInfo: []
    };

    // Basic bill info
    const shortId = doc.querySelector('ShortBillId');
    if (shortId) metadata.billId = getTextContent(shortId);

    const longId = doc.querySelector('LongBillId');
    if (longId) metadata.longBillId = getTextContent(longId);

    const legislature = doc.querySelector('Legislature');
    if (legislature) metadata.legislature = getTextContent(legislature);

    const session = doc.querySelector('Session');
    if (session) metadata.session = getTextContent(session);

    const sponsors = doc.querySelector('Sponsors');
    if (sponsors) metadata.sponsors = getTextContent(sponsors);

    const brief = doc.querySelector('BriefDescription');
    if (brief) metadata.briefDescription = getTextContent(brief);

    // Enrolling certificate info
    const chapter = doc.querySelector('ChapterLaw');
    if (chapter) {
      metadata.chapterLaw = {
        year: chapter.getAttribute('year'),
        number: getTextContent(chapter)
      };
    }

    const veto = doc.querySelector('VetoAction');
    if (veto) metadata.vetoAction = getTextContent(veto);

    const effectiveDate = doc.querySelector('EffectiveDate');
    if (effectiveDate) metadata.effectiveDate = getTextContent(effectiveDate);

    // Passage information
    const passedBy = doc.querySelectorAll('PassedBy');
    passedBy.forEach(passage => {
      const chamber = passage.getAttribute('chamber');
      const date = passage.querySelector('PassedDate');
      const yeas = passage.querySelector('Yeas');
      const nays = passage.querySelector('Nays');
      const signer = passage.querySelector('Signer');

      metadata.passageInfo.push({
        chamber: chamber,
        date: date ? getTextContent(date) : null,
        yeas: yeas ? parseInt(getTextContent(yeas), 10) : null,
        nays: nays ? parseInt(getTextContent(nays), 10) : null,
        signer: signer ? getTextContent(signer) : null
      });
    });

    return metadata;
  }

  /**
   * Extract all agencies mentioned in the bill
   */
  function extractAgencies(doc) {
    const agencies = [];
    const seen = new Set();

    // From Department elements
    const depts = doc.querySelectorAll('Department');
    depts.forEach(dept => {
      const index = dept.querySelector('Index');
      const name = dept.querySelector('DeptName');

      if (index) {
        const agencyName = getTextContent(index);
        if (!seen.has(agencyName)) {
          agencies.push({
            name: agencyName,
            displayName: name ? getTextContent(name) : agencyName,
            type: 'department'
          });
          seen.add(agencyName);
        }
      }
    });

    return agencies;
  }

  /**
   * Extract appropriations data
   */
  function extractAppropriations(doc) {
    const appropriations = [];

    const sections = doc.querySelectorAll('BillSection');
    sections.forEach((section, sectionIndex) => {
      const sectionNumber = section.querySelector('BillSectionNumber Value');
      const sectionNum = sectionNumber ? getTextContent(sectionNumber) : null;

      const department = section.querySelector('Department Index');
      const agencyCode = section.querySelector('Appropriations');
      const agency = agencyCode ? agencyCode.getAttribute('agency') : null;

      const appropElements = section.querySelectorAll('Appropriation');
      appropElements.forEach((approp, appropIndex) => {
        const accountName = approp.querySelector('AccountName BudgetP');
        const dollarAmount = approp.querySelector('DollarAmount');

        if (accountName && dollarAmount) {
          const amountText = getTextContent(dollarAmount);
          const amount = parseDollarAmount(amountText);
          const amendmentType = getAmendmentType(dollarAmount);

          appropriations.push({
            section: sectionNum,
            agency: department ? getTextContent(department) : null,
            agencyCode: agency,
            accountName: getTextContent(accountName),
            amount: amount,
            amountFormatted: amountText,
            amendmentType: amendmentType,
            fiscalYear: extractFiscalYear(getTextContent(accountName))
          });
        }
      });
    });

    return appropriations;
  }

  /**
   * Extract fiscal year from account name
   */
  function extractFiscalYear(text) {
    if (!text) return null;

    if (text.includes('FY 2024')) return 2024;
    if (text.includes('FY 2025')) return 2025;
    if (text.includes('FY 2026')) return 2026;

    return null;
  }

  /**
   * Extract statutory references (RCW citations)
   */
  function extractStatutoryReferences(doc) {
    const references = [];
    const seen = new Set();

    // From bill title
    const title = doc.querySelector('BillTitle');
    if (title) {
      const titleText = getTextContent(title);
      const rcwMatches = titleText.matchAll(/RCW\s+([\d.]+)/g);
      for (let match of rcwMatches) {
        const rcw = match[1];
        if (!seen.has(rcw)) {
          references.push({
            type: 'RCW',
            reference: rcw,
            context: 'bill_title'
          });
          seen.add(rcw);
        }
      }
    }

    // From UncodCite elements
    const uncodCites = doc.querySelectorAll('UncodCite');
    uncodCites.forEach(cite => {
      const text = getTextContent(cite);
      if (text && !seen.has(text)) {
        references.push({
          type: 'uncodified',
          reference: text,
          context: 'section_header'
        });
        seen.add(text);
      }
    });

    return references;
  }

  /**
   * Extract dates mentioned in the bill
   */
  function extractDates(doc) {
    const dates = [];

    // Effective date
    const effectiveDate = doc.querySelector('EffectiveDate');
    if (effectiveDate) {
      dates.push({
        type: 'effective_date',
        date: getTextContent(effectiveDate),
        context: 'bill_metadata'
      });
    }

    // Passage dates
    const passedDates = doc.querySelectorAll('PassedDate');
    passedDates.forEach(pd => {
      dates.push({
        type: 'passage_date',
        date: getTextContent(pd),
        context: 'passage_info'
      });
    });

    // Filed date
    const filedDate = doc.querySelector('FiledDate');
    if (filedDate) {
      dates.push({
        type: 'filed_date',
        date: getTextContent(filedDate),
        context: 'bill_metadata'
      });
    }

    // Approved date
    const approvedDate = doc.querySelector('ApprovedDate');
    if (approvedDate) {
      dates.push({
        type: 'approved_date',
        date: getTextContent(approvedDate),
        context: 'bill_metadata'
      });
    }

    return dates;
  }

  /**
   * Extract fiscal impact data
   */
  function extractFiscalImpacts(doc) {
    const impacts = {
      totalAppropriations: 0,
      byFiscalYear: {},
      byAgency: {},
      amendments: {
        increases: [],
        decreases: []
      }
    };

    const appropriations = extractAppropriations(doc);

    appropriations.forEach(approp => {
      if (approp.amount) {
        impacts.totalAppropriations += approp.amount;

        // By fiscal year
        if (approp.fiscalYear) {
          if (!impacts.byFiscalYear[approp.fiscalYear]) {
            impacts.byFiscalYear[approp.fiscalYear] = 0;
          }
          impacts.byFiscalYear[approp.fiscalYear] += approp.amount;
        }

        // By agency
        if (approp.agency) {
          if (!impacts.byAgency[approp.agency]) {
            impacts.byAgency[approp.agency] = 0;
          }
          impacts.byAgency[approp.agency] += approp.amount;
        }

        // Track amendments
        if (approp.amendmentType === 'add') {
          impacts.amendments.increases.push(approp);
        } else if (approp.amendmentType === 'strike') {
          impacts.amendments.decreases.push(approp);
        }
      }
    });

    return impacts;
  }

  /**
   * Extract conditions and limitations
   */
  function extractConditionsAndLimitations(doc) {
    const conditions = [];

    const sections = doc.querySelectorAll('BillSection');
    sections.forEach(section => {
      const sectionNumber = section.querySelector('BillSectionNumber Value');
      const sectionNum = sectionNumber ? getTextContent(sectionNumber) : null;

      // Look for paragraphs with conditions
      const paragraphs = section.querySelectorAll('P');
      paragraphs.forEach(p => {
        const text = getTextContent(p);

        // Check if this is a conditions paragraph
        if (text.toLowerCase().includes('conditions and limitations') ||
            text.toLowerCase().includes('provided solely')) {

          conditions.push({
            section: sectionNum,
            text: text,
            hasProvidedSolely: text.toLowerCase().includes('provided solely')
          });
        }
      });
    });

    return conditions;
  }

  /**
   * Extract program information
   */
  function extractPrograms(doc) {
    const programs = [];
    const seen = new Set();

    // Programs are often mentioned in conditions and limitations
    const conditions = extractConditionsAndLimitations(doc);
    conditions.forEach(condition => {
      const text = condition.text;

      // Look for program mentions (this is a heuristic)
      const programMatches = text.matchAll(/(\w+\s+program)/gi);
      for (let match of programMatches) {
        const program = match[1];
        if (!seen.has(program.toLowerCase())) {
          programs.push({
            name: program,
            section: condition.section,
            context: 'conditions_and_limitations'
          });
          seen.add(program.toLowerCase());
        }
      }
    });

    return programs;
  }

  /**
   * Extract account information
   */
  function extractAccounts(doc) {
    const accounts = [];
    const seen = new Set();

    const appropriations = extractAppropriations(doc);
    appropriations.forEach(approp => {
      const accountName = approp.accountName;
      if (accountName && !seen.has(accountName)) {
        accounts.push({
          name: accountName,
          fiscalYear: approp.fiscalYear,
          type: determineAccountType(accountName)
        });
        seen.add(accountName);
      }
    });

    return accounts;
  }

  /**
   * Determine account type from account name
   */
  function determineAccountType(accountName) {
    const lower = accountName.toLowerCase();

    if (lower.includes('general fund—state')) return 'general_fund_state';
    if (lower.includes('general fund—federal')) return 'general_fund_federal';
    if (lower.includes('general fund—private')) return 'general_fund_private';
    if (lower.includes('account—state')) return 'special_account_state';
    if (lower.includes('account—federal')) return 'special_account_federal';

    return 'other';
  }

  /**
   * Main extraction function - extracts all data from XML
   */
  function extractFromXML(xmlString) {
    const doc = parseXML(xmlString);

    return {
      metadata: extractBillMetadata(doc),
      agencies: extractAgencies(doc),
      appropriations: extractAppropriations(doc),
      statutoryReferences: extractStatutoryReferences(doc),
      dates: extractDates(doc),
      fiscalImpacts: extractFiscalImpacts(doc),
      conditionsAndLimitations: extractConditionsAndLimitations(doc),
      programs: extractPrograms(doc),
      accounts: extractAccounts(doc),
      billType: determineBillType(doc)
    };
  }

  /**
   * Determine bill type
   */
  function determineBillType(doc) {
    const brief = doc.querySelector('BriefDescription');
    const briefText = brief ? getTextContent(brief).toLowerCase() : '';

    const title = doc.querySelector('SessionLawCaption');
    const titleText = title ? getTextContent(title).toLowerCase() : '';

    const combined = briefText + ' ' + titleText;

    if (combined.includes('supplemental') && combined.includes('operating')) {
      return {
        category: 'budget',
        subcategory: 'supplemental_operating',
        description: 'Supplemental Operating Budget'
      };
    } else if (combined.includes('operating') && combined.includes('budget')) {
      return {
        category: 'budget',
        subcategory: 'operating',
        description: 'Operating Budget'
      };
    } else if (combined.includes('capital') && combined.includes('budget')) {
      return {
        category: 'budget',
        subcategory: 'capital',
        description: 'Capital Budget'
      };
    } else if (combined.includes('transportation') && combined.includes('budget')) {
      return {
        category: 'budget',
        subcategory: 'transportation',
        description: 'Transportation Budget'
      };
    }

    return {
      category: 'general_legislation',
      subcategory: null,
      description: 'General Legislation'
    };
  }

  /**
   * Extract from HTML format
   */
  function extractFromHTML(htmlString) {
    const doc = parseHTML(htmlString);

    // HTML extraction would follow similar patterns
    // For now, return a basic structure
    return {
      metadata: extractBillMetadataFromHTML(doc),
      note: 'HTML extraction is simplified - XML format recommended for complete data'
    };
  }

  /**
   * Extract metadata from HTML
   */
  function extractBillMetadataFromHTML(doc) {
    const metadata = {
      billId: null,
      legislature: null,
      session: null,
      sponsors: null,
      effectiveDate: null
    };

    // Try to extract from HTML structure
    const body = doc.body;
    if (!body) return metadata;

    const text = body.textContent;

    // Extract bill ID
    const billMatch = text.match(/ENGROSSED SUBSTITUTE SENATE BILL (\d+)/);
    if (billMatch) metadata.billId = 'ESSB ' + billMatch[1];

    // Extract legislature
    const legMatch = text.match(/(\d+)(?:TH|th) LEGISLATURE/);
    if (legMatch) metadata.legislature = legMatch[1] + 'th Legislature';

    // Extract session
    const sessionMatch = text.match(/(\d+) REGULAR SESSION/);
    if (sessionMatch) metadata.session = sessionMatch[1] + ' Regular Session';

    return metadata;
  }

  /**
   * Public API
   */
  return {
    extractFromXML: extractFromXML,
    extractFromHTML: extractFromHTML,

    // Individual extraction functions for granular use
    extractBillMetadata: function(xmlString) {
      return extractBillMetadata(parseXML(xmlString));
    },
    extractAgencies: function(xmlString) {
      return extractAgencies(parseXML(xmlString));
    },
    extractAppropriations: function(xmlString) {
      return extractAppropriations(parseXML(xmlString));
    },
    extractStatutoryReferences: function(xmlString) {
      return extractStatutoryReferences(parseXML(xmlString));
    },
    extractDates: function(xmlString) {
      return extractDates(parseXML(xmlString));
    },
    extractFiscalImpacts: function(xmlString) {
      return extractFiscalImpacts(parseXML(xmlString));
    },
    extractConditionsAndLimitations: function(xmlString) {
      return extractConditionsAndLimitations(parseXML(xmlString));
    },
    extractPrograms: function(xmlString) {
      return extractPrograms(parseXML(xmlString));
    },
    extractAccounts: function(xmlString) {
      return extractAccounts(parseXML(xmlString));
    }
  };
})();

// For Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BillExtractor;
}
