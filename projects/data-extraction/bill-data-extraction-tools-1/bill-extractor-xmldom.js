/**
 * Washington State Bill Data Extractor (xmldom compatible)
 * Parses WA legislative bills (XML format) and extracts structured data
 * Designed for ESSB 5187 (Operating Budget Bill) and similar appropriations bills
 */

class WABillExtractor {
  constructor(xmlString) {
    this.parser = new DOMParser();
    this.xmlDoc = this.parser.parseFromString(xmlString, 'text/xml');
    this.data = {};
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
    const billHeading = this.xmlDoc.getElementsByTagName('BillHeading')[0];
    if (!billHeading) return null;

    const plMessage = billHeading.getElementsByTagName('PLMessage')[0];

    return {
      shortBillId: this.getTextContent(billHeading, 'ShortBillId'),
      longBillId: this.getTextContent(billHeading, 'LongBillId'),
      legislature: this.getTextContent(billHeading, 'Legislature'),
      session: this.getTextContent(billHeading, 'Session'),
      sponsors: this.getTextContent(billHeading, 'Sponsors'),
      briefDescription: this.getTextContent(billHeading, 'BriefDescription'),
      billTitle: this.getTextContent(this.xmlDoc, 'BillTitle'),
      readDate: this.getTextContent(billHeading, 'ReadDate'),
      plMessage: plMessage ? this.getTextContent(plMessage, 'Message') : null,
      plSession: plMessage ? this.getTextContent(plMessage, 'PLSession') : null
    };
  }

  /**
   * Extract voting data from both chambers
   */
  extractVoting() {
    const passage = this.xmlDoc.getElementsByTagName('Passage')[0];
    if (!passage) return null;

    const chambers = passage.getElementsByTagName('PassedBy');
    const votes = [];

    for (let i = 0; i < chambers.length; i++) {
      const chamber = chambers[i];
      const chamberType = chamber.getAttribute('chamber');
      votes.push({
        chamber: chamberType === 's' ? 'Senate' : 'House',
        chamberCode: chamberType,
        passedDate: this.getTextContent(chamber, 'PassedDate'),
        yeas: parseInt(this.getTextContent(chamber, 'Yeas')) || 0,
        nays: parseInt(this.getTextContent(chamber, 'Nays')) || 0,
        signer: this.getTextContent(chamber, 'Signer')
      });
    }

    return votes;
  }

  /**
   * Extract certification information
   */
  extractCertification() {
    const cert = this.xmlDoc.getElementsByTagName('EnrollingCertificate')[0];
    if (!cert) return null;

    const chapterLaw = cert.getElementsByTagName('ChapterLaw')[0];

    return {
      chapterLaw: this.getTextContent(cert, 'ChapterLaw'),
      year: chapterLaw ? chapterLaw.getAttribute('year') : null,
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
    const approvedDate = this.xmlDoc.getElementsByTagName('ApprovedDate')[0];
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
    const partElements = this.xmlDoc.getElementsByTagName('Part');

    for (let i = 0; i < partElements.length; i++) {
      const part = partElements[i];
      const partNum = i + 1;
      const firstP = part.getElementsByTagName('P')[0];
      const partName = firstP ? firstP.textContent.trim() : '';

      // Get sections within this part
      const sections = [];
      const billSections = part.getElementsByTagName('BillSection');

      for (let j = 0; j < billSections.length; j++) {
        const section = billSections[j];
        const sectionNumElem = section.getElementsByTagName('BillSectionNumber')[0];
        const valueElem = sectionNumElem ? sectionNumElem.getElementsByTagName('Value')[0] : null;
        const sectionNum = valueElem ? valueElem.textContent : null;

        const dept = section.getElementsByTagName('Department')[0];
        const deptIndex = dept ? dept.getElementsByTagName('Index')[0] : null;
        const deptName = dept ? dept.getElementsByTagName('DeptName')[0] : null;
        const deptNameP = deptName ? deptName.getElementsByTagName('P')[0] : null;

        sections.push({
          number: sectionNum,
          departmentIndex: deptIndex ? deptIndex.textContent : null,
          departmentName: deptNameP ? deptNameP.textContent : null,
          type: section.getAttribute('type')
        });
      }

      parts.push({
        number: partNum,
        name: partName,
        sectionCount: sections.length,
        sections: sections
      });
    }

    return {
      totalParts: parts.length,
      totalSections: this.xmlDoc.getElementsByTagName('BillSection').length,
      parts: parts
    };
  }

  /**
   * Extract all agencies and their information
   */
  extractAgencies() {
    const agencies = [];
    const agencyMap = new Map();
    const depts = this.xmlDoc.getElementsByTagName('Department');

    for (let i = 0; i < depts.length; i++) {
      const dept = depts[i];
      const indexElem = dept.getElementsByTagName('Index')[0];
      const index = indexElem ? indexElem.textContent : null;

      const deptName = dept.getElementsByTagName('DeptName')[0];
      const nameP = deptName ? deptName.getElementsByTagName('P')[0] : null;
      const name = nameP ? nameP.textContent : null;

      if (index && name && !agencyMap.has(index)) {
        // Find agency code from parent Appropriations element
        let agencyCode = null;
        let parent = dept.parentNode;
        while (parent && !agencyCode) {
          if (parent.tagName === 'BillSection') {
            const appsElem = parent.getElementsByTagName('Appropriations')[0];
            if (appsElem) {
              agencyCode = appsElem.getAttribute('agency');
            }
            break;
          }
          parent = parent.parentNode;
        }

        agencies.push({
          index: index,
          name: name,
          agencyCode: agencyCode
        });
        agencyMap.set(index, true);
      }
    }

    return agencies;
  }

  /**
   * Extract all appropriations with amounts and accounts
   */
  extractAppropriations() {
    const appropriations = [];
    const appSections = this.xmlDoc.getElementsByTagName('Appropriations');

    for (let i = 0; i < appSections.length; i++) {
      const appSection = appSections[i];
      const agency = appSection.getAttribute('agency');

      // Find parent BillSection
      let billSection = appSection.parentNode;
      while (billSection && billSection.tagName !== 'BillSection') {
        billSection = billSection.parentNode;
      }

      let sectionNum = null;
      let deptName = null;

      if (billSection) {
        const sectionNumElem = billSection.getElementsByTagName('BillSectionNumber')[0];
        const valueElem = sectionNumElem ? sectionNumElem.getElementsByTagName('Value')[0] : null;
        sectionNum = valueElem ? valueElem.textContent : null;

        const dept = billSection.getElementsByTagName('Department')[0];
        const deptNameElem = dept ? dept.getElementsByTagName('DeptName')[0] : null;
        const deptNameP = deptNameElem ? deptNameElem.getElementsByTagName('P')[0] : null;
        deptName = deptNameP ? deptNameP.textContent : null;
      }

      const items = [];
      const apps = appSection.getElementsByTagName('Appropriation');

      for (let j = 0; j < apps.length; j++) {
        const app = apps[j];
        const accountNameElem = app.getElementsByTagName('AccountName')[0];
        const accountName = this.extractTextFromElement(accountNameElem);
        const amountElem = app.getElementsByTagName('DollarAmount')[0];
        const amount = amountElem ? amountElem.textContent : null;
        const numericAmount = this.parseAmount(amount);

        items.push({
          accountName: accountName,
          amount: amount,
          numericAmount: numericAmount
        });
      }

      const totalElem = appSection.getElementsByTagName('AppropriationTotal')[0];
      const totalDollarElem = totalElem ? totalElem.getElementsByTagName('DollarAmount')[0] : null;
      const total = totalDollarElem ? totalDollarElem.textContent : null;

      appropriations.push({
        sectionNumber: sectionNum,
        agencyCode: agency,
        departmentName: deptName,
        items: items,
        total: total,
        totalNumeric: this.parseAmount(total)
      });
    }

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
    const paragraphs = this.xmlDoc.getElementsByTagName('P');
    for (let i = 0; i < paragraphs.length; i++) {
      const text = paragraphs[i].textContent;
      const rcwMatches = text.match(rcwPattern);
      const chapterMatches = text.match(chapterPattern);

      if (rcwMatches) {
        rcwMatches.forEach(ref => references.add(ref));
      }
      if (chapterMatches) {
        chapterMatches.forEach(ref => references.add(ref));
      }
    }

    return Array.from(references).sort();
  }

  /**
   * Extract dates mentioned in the bill
   */
  extractDates() {
    const dates = {
      legislative: {
        readFirst: this.getTextContent(this.xmlDoc, 'ReadDate'),
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

    // Extract deadline dates from text (sample only to avoid processing all text)
    const datePattern = /(?:by|no later than|before|after)\s+([A-Z][a-z]+\s+\d{1,2},\s+\d{4})/gi;
    const paragraphs = this.xmlDoc.getElementsByTagName('P');
    let count = 0;
    for (let i = 0; i < paragraphs.length && count < 100; i++) {
      const text = paragraphs[i].textContent;
      const matches = [...text.matchAll(datePattern)];
      matches.forEach(match => {
        dates.deadlines.push({
          date: match[1],
          context: text.substring(Math.max(0, match.index - 50), Math.min(text.length, match.index + match[0].length + 50))
        });
        count++;
      });
    }

    return dates;
  }

  /**
   * Extract conditions and limitations
   */
  extractConditions() {
    const conditions = [];
    const billSections = this.xmlDoc.getElementsByTagName('BillSection');

    for (let i = 0; i < billSections.length && i < 50; i++) { // Limit to first 50 sections for performance
      const section = billSections[i];
      const sectionNumElem = section.getElementsByTagName('BillSectionNumber')[0];
      const valueElem = sectionNumElem ? sectionNumElem.getElementsByTagName('Value')[0] : null;
      const sectionNum = valueElem ? valueElem.textContent : null;

      const dept = section.getElementsByTagName('Department')[0];
      const deptNameElem = dept ? dept.getElementsByTagName('DeptName')[0] : null;
      const deptNameP = deptNameElem ? deptNameElem.getElementsByTagName('P')[0] : null;
      const deptName = deptNameP ? deptNameP.textContent : null;

      const paragraphs = section.getElementsByTagName('P');
      for (let j = 0; j < paragraphs.length; j++) {
        const p = paragraphs[j];
        const prePadding = p.getAttribute('prePadding');
        if (prePadding === 'halfline') {
          const text = this.extractTextFromElement(p);

          if (text.includes('appropriations in this section are subject to') ||
              text.includes('provided solely')) {
            const subsections = [];

            // Collect subsequent paragraphs that might be subsections
            for (let k = j + 1; k < paragraphs.length && k < j + 20; k++) {
              const nextP = paragraphs[k];
              const subText = this.extractTextFromElement(nextP);
              if (subText.match(/^\(\d+\)|^\([a-z]\)/)) {
                subsections.push(subText);
              }
            }

            conditions.push({
              sectionNumber: sectionNum,
              departmentName: deptName,
              mainText: text,
              subsections: subsections
            });
          }
        }
      }
    }

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

    const appSections = this.xmlDoc.getElementsByTagName('Appropriations');

    for (let i = 0; i < appSections.length; i++) {
      const appSection = appSections[i];
      const agency = appSection.getAttribute('agency');

      let billSection = appSection.parentNode;
      while (billSection && billSection.tagName !== 'BillSection') {
        billSection = billSection.parentNode;
      }

      let deptName = 'Unknown';
      if (billSection) {
        const dept = billSection.getElementsByTagName('Department')[0];
        const deptNameElem = dept ? dept.getElementsByTagName('DeptName')[0] : null;
        const deptNameP = deptNameElem ? deptNameElem.getElementsByTagName('P')[0] : null;
        deptName = deptNameP ? deptNameP.textContent : 'Unknown';
      }

      if (!impacts.byAgency[deptName]) {
        impacts.byAgency[deptName] = {
          agencyCode: agency,
          total: 0,
          items: []
        };
      }

      const apps = appSection.getElementsByTagName('Appropriation');
      for (let j = 0; j < apps.length; j++) {
        const app = apps[j];
        const accountNameElem = app.getElementsByTagName('AccountName')[0];
        const accountName = this.extractTextFromElement(accountNameElem);
        const amountElem = app.getElementsByTagName('DollarAmount')[0];
        const amount = amountElem ? amountElem.textContent : null;
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
      }
    }

    return impacts;
  }

  /**
   * Helper: Get text content from element
   */
  getTextContent(parent, tagName) {
    if (!parent) return null;
    const elements = parent.getElementsByTagName(tagName);
    return elements.length > 0 ? elements[0].textContent.trim() : null;
  }

  /**
   * Helper: Extract text from element including nested structure
   */
  extractTextFromElement(element) {
    if (!element) return '';

    // Check for BudgetP elements
    const budgetPs = element.getElementsByTagName('BudgetP');
    if (budgetPs.length > 0) {
      let text = '';
      for (let i = 0; i < budgetPs.length; i++) {
        text += budgetPs[i].textContent.trim() + ' ';
      }
      return text.trim();
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
