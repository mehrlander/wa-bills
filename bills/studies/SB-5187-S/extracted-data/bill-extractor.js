/**
 * Washington State Bill Data Extractor
 * Parses WA legislative bills (XML format) and extracts structured data
 * Designed for ESSB 5187 (Operating Budget Bill) and similar appropriations bills
 */

class WABillExtractor {
  constructor(xmlString) {
    this.parser = new DOMParser();
    this.xmlDoc = this.parser.parseFromString(xmlString, 'text/xml');
    this.data = {};
  }

  // Polyfill querySelector for xmldom
  querySelector(parent, selector) {
    if (parent.querySelector) {
      return parent.querySelector(selector);
    }
    // Fallback for xmldom
    return parent.getElementsByTagName(selector)[0] || null;
  }

  querySelectorAll(parent, selector) {
    if (parent.querySelectorAll) {
      return parent.querySelectorAll(selector);
    }
    // Fallback for xmldom
    return parent.getElementsByTagName(selector);
  }

  /**
   * Extract all data from the bill
   */
  extractAll() {
    this.data = {
      metadata: this.extractMetadata(),
      voting: this.extractVoting(),
      certification: this.extractCertification(),
      vetos: this.extractVetos(),
      structure: this.extractStructure(),
      agencies: this.extractAgencies(),
      appropriations: this.extractAppropriations(),
      statutoryReferences: this.extractStatutoryReferences(),
      dates: this.extractDates(),
      conditions: this.extractConditions(),
      fiscalImpacts: this.extractFiscalImpacts()
    };
    return this.data;
  }

  /**
   * Extract bill metadata (ID, session, sponsors, etc.)
   */
  extractMetadata() {
    const billHeading = this.querySelector(this.xmlDoc, 'BillHeading');
    if (!billHeading) return null;

    return {
      shortBillId: this.getTextContent(billHeading, 'ShortBillId'),
      longBillId: this.getTextContent(billHeading, 'LongBillId'),
      legislature: this.getTextContent(billHeading, 'Legislature'),
      session: this.getTextContent(billHeading, 'Session'),
      sponsors: this.getTextContent(billHeading, 'Sponsors'),
      briefDescription: this.getTextContent(billHeading, 'BriefDescription'),
      billTitle: this.getTextContent(this.xmlDoc, 'BillTitle'),
      readDate: this.getTextContent(billHeading, 'ReadDate'),
      plMessage: this.getTextContent(this.querySelector(billHeading, 'PLMessage'), 'Message'),
      plSession: this.getTextContent(this.querySelector(billHeading, 'PLMessage'), 'PLSession')
    };
  }

  /**
   * Extract voting data from both chambers
   */
  extractVoting() {
    const passage = this.xmlDoc.querySelector('Passage');
    if (!passage) return null;

    const chambers = passage.querySelectorAll('PassedBy');
    const votes = [];

    chambers.forEach(chamber => {
      const chamberType = chamber.getAttribute('chamber');
      votes.push({
        chamber: chamberType === 's' ? 'Senate' : 'House',
        chamberCode: chamberType,
        passedDate: this.getTextContent(chamber, 'PassedDate'),
        yeas: parseInt(this.getTextContent(chamber, 'Yeas')) || 0,
        nays: parseInt(this.getTextContent(chamber, 'Nays')) || 0,
        signer: this.getTextContent(chamber, 'Signer')
      });
    });

    return votes;
  }

  /**
   * Extract certification information
   */
  extractCertification() {
    const cert = this.xmlDoc.querySelector('EnrollingCertificate');
    if (!cert) return null;

    return {
      chapterLaw: this.getTextContent(cert, 'ChapterLaw'),
      year: cert.querySelector('ChapterLaw')?.getAttribute('year'),
      vetoAction: this.getTextContent(cert, 'VetoAction'),
      sessionLawCaption: this.getTextContent(cert, 'SessionLawCaption'),
      effectiveDate: this.getTextContent(cert, 'EffectiveDate'),
      approvedDate: this.getTextContent(cert, 'ApprovedDate'),
      filedDate: this.getTextContent(cert, 'FiledDate'),
      governor: this.getTextContent(cert, 'Governor'),
      certifier: this.getTextContent(cert, 'Certifier'),
      certifierPosition: this.getTextContent(cert, 'CertifierPosition')
    };
  }

  /**
   * Extract veto information
   */
  extractVetos() {
    const approvedDate = this.xmlDoc.querySelector('ApprovedDate');
    if (!approvedDate) return null;

    const text = approvedDate.textContent;
    const vetoMatch = text.match(/with the exception of (.+), which are vetoed/);

    if (vetoMatch) {
      const vetoedSections = vetoMatch[1].split(',').map(s => s.trim());
      return {
        hasVetos: true,
        vetoedSections: vetoedSections,
        approvalText: text
      };
    }

    return { hasVetos: false };
  }

  /**
   * Extract structural organization (parts, sections)
   */
  extractStructure() {
    const parts = [];
    const partElements = this.xmlDoc.querySelectorAll('Part');

    partElements.forEach((part, index) => {
      const partNum = index + 1;
      const firstP = part.querySelector('P');
      const partName = firstP ? firstP.textContent.trim() : '';

      // Get sections within this part
      const sections = [];
      const billSections = part.querySelectorAll('BillSection');

      billSections.forEach(section => {
        const sectionNum = this.getTextContent(section.querySelector('BillSectionNumber'), 'Value');
        const dept = section.querySelector('Department');

        sections.push({
          number: sectionNum,
          departmentIndex: dept ? this.getTextContent(dept, 'Index') : null,
          departmentName: dept ? this.getTextContent(dept.querySelector('DeptName'), 'P') : null,
          type: section.getAttribute('type')
        });
      });

      parts.push({
        number: partNum,
        name: partName,
        sectionCount: sections.length,
        sections: sections
      });
    });

    return {
      totalParts: parts.length,
      totalSections: this.xmlDoc.querySelectorAll('BillSection').length,
      parts: parts
    };
  }

  /**
   * Extract all agencies and their information
   */
  extractAgencies() {
    const agencies = [];
    const agencyMap = new Map();

    this.xmlDoc.querySelectorAll('Department').forEach(dept => {
      const index = this.getTextContent(dept, 'Index');
      const name = this.getTextContent(dept.querySelector('DeptName'), 'P');

      if (index && name && !agencyMap.has(index)) {
        const appropriationsElem = dept.parentElement.querySelector('Appropriations');
        const agencyCode = appropriationsElem?.getAttribute('agency');

        agencies.push({
          index: index,
          name: name,
          agencyCode: agencyCode
        });
        agencyMap.set(index, true);
      }
    });

    return agencies;
  }

  /**
   * Extract all appropriations with amounts and accounts
   */
  extractAppropriations() {
    const appropriations = [];

    this.xmlDoc.querySelectorAll('Appropriations').forEach((appSection, index) => {
      const agency = appSection.getAttribute('agency');
      const billSection = appSection.closest('BillSection');
      const sectionNum = this.getTextContent(billSection?.querySelector('BillSectionNumber'), 'Value');
      const dept = billSection?.querySelector('Department');
      const deptName = dept ? this.getTextContent(dept.querySelector('DeptName'), 'P') : null;

      const items = [];
      appSection.querySelectorAll('Appropriation').forEach(app => {
        const accountNameElem = app.querySelector('AccountName');
        const accountName = this.extractTextFromElement(accountNameElem);
        const amount = this.getTextContent(app, 'DollarAmount');
        const numericAmount = this.parseAmount(amount);

        items.push({
          accountName: accountName,
          amount: amount,
          numericAmount: numericAmount
        });
      });

      const total = this.getTextContent(appSection.querySelector('AppropriationTotal'), 'DollarAmount');

      appropriations.push({
        sectionNumber: sectionNum,
        agencyCode: agency,
        departmentName: deptName,
        items: items,
        total: total,
        totalNumeric: this.parseAmount(total)
      });
    });

    return appropriations;
  }

  /**
   * Extract statutory references (RCW, WAC, etc.)
   */
  extractStatutoryReferences() {
    const references = new Set();
    const rcwPattern = /RCW\s+[\d.]+/g;
    const chapterPattern = /chapter\s+[\d.]+\s+RCW/g;

    const billTitle = this.getTextContent(this.xmlDoc, 'BillTitle');
    if (billTitle) {
      const rcwMatches = billTitle.match(rcwPattern);
      if (rcwMatches) {
        rcwMatches.forEach(ref => references.add(ref));
      }
    }

    // Extract from all paragraph elements
    this.xmlDoc.querySelectorAll('P').forEach(p => {
      const text = p.textContent;
      const rcwMatches = text.match(rcwPattern);
      const chapterMatches = text.match(chapterPattern);

      if (rcwMatches) {
        rcwMatches.forEach(ref => references.add(ref));
      }
      if (chapterMatches) {
        chapterMatches.forEach(ref => references.add(ref));
      }
    });

    return Array.from(references).sort();
  }

  /**
   * Extract dates mentioned in the bill
   */
  extractDates() {
    const dates = {
      legislative: {
        readFirst: this.getTextContent(this.xmlDoc.querySelector('BillHistory'), 'ReadDate'),
        senatePassed: null,
        housePassed: null
      },
      executive: {
        approved: this.getTextContent(this.xmlDoc, 'ApprovedDate'),
        filed: this.getTextContent(this.xmlDoc, 'FiledDate'),
        effective: this.getTextContent(this.xmlDoc, 'EffectiveDate')
      },
      deadlines: []
    };

    // Extract voting dates
    const votes = this.extractVoting();
    if (votes && votes.length > 0) {
      votes.forEach(vote => {
        if (vote.chamber === 'Senate') {
          dates.legislative.senatePassed = vote.passedDate;
        } else if (vote.chamber === 'House') {
          dates.legislative.housePassed = vote.passedDate;
        }
      });
    }

    // Extract deadline dates from text
    const datePattern = /(?:by|no later than|before|after)\s+([A-Z][a-z]+\s+\d{1,2},\s+\d{4})/gi;
    this.xmlDoc.querySelectorAll('P').forEach(p => {
      const text = p.textContent;
      const matches = [...text.matchAll(datePattern)];
      matches.forEach(match => {
        dates.deadlines.push({
          date: match[1],
          context: text.substring(Math.max(0, match.index - 50), Math.min(text.length, match.index + match[0].length + 50))
        });
      });
    });

    return dates;
  }

  /**
   * Extract conditions and limitations
   */
  extractConditions() {
    const conditions = [];

    this.xmlDoc.querySelectorAll('BillSection').forEach(section => {
      const sectionNum = this.getTextContent(section.querySelector('BillSectionNumber'), 'Value');
      const dept = section.querySelector('Department');
      const deptName = dept ? this.getTextContent(dept.querySelector('DeptName'), 'P') : null;

      const paragraphs = section.querySelectorAll('P[prePadding="halfline"]');
      paragraphs.forEach((p, idx) => {
        const text = this.extractTextFromElement(p);

        // Check if this is a conditions paragraph
        if (text.includes('appropriations in this section are subject to') ||
            text.includes('provided solely')) {

          // Get all subsequent paragraphs that might be subsections
          const subsections = [];
          let nextP = p.nextElementSibling;
          while (nextP && nextP.tagName === 'P') {
            const subText = this.extractTextFromElement(nextP);
            if (subText.match(/^\(\d+\)|^\([a-z]\)/)) {
              subsections.push(subText);
            }
            nextP = nextP.nextElementSibling;
          }

          conditions.push({
            sectionNumber: sectionNum,
            departmentName: deptName,
            mainText: text,
            subsections: subsections
          });
        }
      });
    });

    return conditions;
  }

  /**
   * Extract fiscal impacts and funding data
   */
  extractFiscalImpacts() {
    const impacts = {
      totalAppropriations: 0,
      byFiscalYear: {
        'FY 2024': 0,
        'FY 2025': 0
      },
      byFundSource: {},
      byAgency: {}
    };

    // Calculate totals from appropriations
    this.xmlDoc.querySelectorAll('Appropriations').forEach(appSection => {
      const agency = appSection.getAttribute('agency');
      const dept = appSection.closest('BillSection')?.querySelector('Department');
      const deptName = dept ? this.getTextContent(dept.querySelector('DeptName'), 'P') : 'Unknown';

      if (!impacts.byAgency[deptName]) {
        impacts.byAgency[deptName] = {
          agencyCode: agency,
          total: 0,
          items: []
        };
      }

      appSection.querySelectorAll('Appropriation').forEach(app => {
        const accountName = this.extractTextFromElement(app.querySelector('AccountName'));
        const amount = this.getTextContent(app, 'DollarAmount');
        const numericAmount = this.parseAmount(amount);

        impacts.totalAppropriations += numericAmount;
        impacts.byAgency[deptName].total += numericAmount;

        // Determine fiscal year
        if (accountName.includes('FY 2024')) {
          impacts.byFiscalYear['FY 2024'] += numericAmount;
        } else if (accountName.includes('FY 2025')) {
          impacts.byFiscalYear['FY 2025'] += numericAmount;
        }

        // Extract fund source
        const fundMatch = accountName.match(/^([^—\-]+)(?:—|-)(?:State|Federal|Private)/);
        const fundSource = fundMatch ? fundMatch[1].trim() : 'Other';

        if (!impacts.byFundSource[fundSource]) {
          impacts.byFundSource[fundSource] = 0;
        }
        impacts.byFundSource[fundSource] += numericAmount;
      });
    });

    return impacts;
  }

  /**
   * Helper: Get text content from element
   */
  getTextContent(parent, selector) {
    if (!parent) return null;
    const element = typeof selector === 'string' ? parent.querySelector(selector) : parent;
    return element ? element.textContent.trim() : null;
  }

  /**
   * Helper: Extract text from element including nested TextRun elements
   */
  extractTextFromElement(element) {
    if (!element) return '';

    // Check for BudgetP or P elements with nested structure
    const budgetPs = element.querySelectorAll('BudgetP');
    if (budgetPs.length > 0) {
      return Array.from(budgetPs).map(p => p.textContent.trim()).join(' ');
    }

    return element.textContent.trim();
  }

  /**
   * Helper: Parse dollar amount to number
   */
  parseAmount(amountStr) {
    if (!amountStr) return 0;
    return parseFloat(amountStr.replace(/[$,]/g, '')) || 0;
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    if (!this.data || Object.keys(this.data).length === 0) {
      this.extractAll();
    }

    return {
      billId: this.data.metadata?.shortBillId,
      billTitle: this.data.certification?.sessionLawCaption,
      session: this.data.metadata?.session,
      effectiveDate: this.data.certification?.effectiveDate,
      totalSections: this.data.structure?.totalSections,
      totalParts: this.data.structure?.totalParts,
      totalAppropriations: this.data.appropriations?.length,
      totalAmount: this.data.fiscalImpacts?.totalAppropriations,
      hasVetos: this.data.vetos?.hasVetos,
      vetoedSectionsCount: this.data.vetos?.vetoedSections?.length || 0
    };
  }
}

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WABillExtractor;
}
