/**
 * Washington State Bill Extraction Library
 * Extracts structured data from WA Legislature XML bill files
 * Designed for capital budget bills with funding appropriations
 */

class WaBillExtractor {
  constructor(xmlString) {
    this.parser = new DOMParser();
    this.doc = this.parser.parseFromString(xmlString, 'text/xml');
    this.data = {};
    this.isNodeJS = typeof window === 'undefined';
  }

  /**
   * querySelector polyfill for xmldom (Node.js)
   */
  querySelector(selector, parent = null) {
    const root = parent || this.doc;
    const tagName = selector.replace(/^\w+/, match => match);

    // Handle attribute selectors
    if (selector.includes('[')) {
      const match = selector.match(/(\w+)\[(\w+)="?(\w+)"?\]/);
      if (match) {
        const [, tag, attr, value] = match;
        const elements = root.getElementsByTagName(tag);
        for (let i = 0; i < elements.length; i++) {
          if (elements[i].getAttribute(attr) === value) {
            return elements[i];
          }
        }
        return null;
      }
    }

    // Simple tag selector
    const elements = root.getElementsByTagName(selector);
    return elements && elements.length > 0 ? elements[0] : null;
  }

  /**
   * querySelectorAll polyfill for xmldom (Node.js)
   */
  querySelectorAll(selector, parent = null) {
    const root = parent || this.doc;

    // Handle :scope > selector for direct children
    if (selector.includes(':scope >')) {
      const childSelector = selector.replace(':scope >', '').trim();
      const result = [];
      if (root.childNodes) {
        for (let i = 0; i < root.childNodes.length; i++) {
          const node = root.childNodes[i];
          if (node.nodeType === 1 && node.tagName === childSelector) {
            result.push(node);
          }
        }
      }
      return result;
    }

    // Handle attribute selectors
    if (selector.includes('[')) {
      const match = selector.match(/(\w+)\[(\w+)(?:="?(\w+)"?)?\]/);
      if (match) {
        const [, tag, attr, value] = match;
        const elements = root.getElementsByTagName(tag);
        const result = [];
        for (let i = 0; i < elements.length; i++) {
          if (value) {
            if (elements[i].getAttribute(attr) === value) {
              result.push(elements[i]);
            }
          } else if (elements[i].hasAttribute(attr)) {
            result.push(elements[i]);
          }
        }
        return result;
      }
    }

    // Simple tag selector
    const elements = root.getElementsByTagName(selector);
    return elements ? Array.from(elements) : [];
  }

  /**
   * Extract all structured data from the bill
   */
  extractAll() {
    return {
      metadata: this.extractMetadata(),
      structure: this.extractStructure(),
      agencies: this.extractAgencies(),
      projects: this.extractProjects(),
      appropriations: this.extractAppropriations(),
      grants: this.extractGrantProjects(),
      statutoryReferences: this.extractStatutoryReferences(),
      dates: this.extractDates(),
      fiscalSummary: this.calculateFiscalSummary()
    };
  }

  /**
   * Extract bill metadata (header information)
   */
  extractMetadata() {
    const billHeading = this.querySelector('BillHeading');
    const enrollingCert = this.querySelector('EnrollingCertificate');

    const billEl = this.querySelector('Bill');
    const metadata = {
      shortId: this.getTextContent('ShortBillId'),
      longId: this.getTextContent('LongBillId'),
      billType: billEl ? billEl.getAttribute('type') : 'bill',
      legislature: this.getTextContent('Legislature'),
      session: this.getTextContent('Session'),
      sponsors: this.getTextContent('Sponsors'),
      briefDescription: this.getTextContent('BriefDescription'),
      billTitle: this.getTextContent('BillTitle')
    };

    // Enrolling certificate data
    if (enrollingCert) {
      metadata.chapterLaw = this.getTextContent('ChapterLaw', enrollingCert);
      const chapterEl = this.querySelector('ChapterLaw', enrollingCert);
      metadata.chapterYear = chapterEl ? chapterEl.getAttribute('year') : null;
      metadata.vetoAction = this.getTextContent('VetoAction', enrollingCert);
      metadata.sessionLawCaption = this.getTextContent('SessionLawCaption', enrollingCert);
      metadata.effectiveDate = this.getTextContent('EffectiveDate', enrollingCert);
      metadata.approvedDate = this.getTextContent('ApprovedDate', enrollingCert);
      metadata.filedDate = this.getTextContent('FiledDate', enrollingCert);
      metadata.governor = this.getTextContent('Governor', enrollingCert);

      // Passage information
      const passages = this.querySelectorAll('PassedBy', enrollingCert);
      metadata.passage = [];
      passages.forEach(passage => {
        metadata.passage.push({
          chamber: passage.getAttribute('chamber'),
          date: this.getTextContent('PassedDate', passage),
          yeas: parseInt(this.getTextContent('Yeas', passage)) || 0,
          nays: parseInt(this.getTextContent('Nays', passage)) || 0,
          signer: this.getTextContent('Signer', passage)
        });
      });
    }

    // Veto information
    const vetoNote = this.querySelector('VetoNote');
    if (vetoNote) {
      metadata.vetoNote = this.getTextContent('VetoNote');
      metadata.vetoedSections = [];
      this.querySelectorAll('BillSection[veto="section"]').forEach(section => {
        const sectionNum = this.getTextContent('Value', this.querySelector('BillSectionNumber', section));
        metadata.vetoedSections.push(sectionNum);
      });
    }

    return metadata;
  }

  /**
   * Extract bill structure (parts and sections)
   */
  extractStructure() {
    const parts = [];
    const partElements = this.querySelectorAll('Part');

    partElements.forEach((partEl, idx) => {
      const partTexts = this.querySelectorAll(':scope > P', partEl);
      const partName = Array.from(partTexts).map(p => p.textContent.trim()).join(' - ');

      const sections = [];
      let currentPart = partEl;
      let nextPart = partElements[idx + 1];

      // Get all BillSections between this Part and the next
      let node = partEl.nextElementSibling;
      while (node && node !== nextPart) {
        if (node.tagName === 'BillSection') {
          const sectionNum = this.getTextContent('Value', this.querySelector('BillSectionNumber', node));
          const deptName = this.getTextContent('DeptName', node);
          const projectName = this.getTextContent('CapitalProjectName', node);

          sections.push({
            number: sectionNum,
            department: deptName,
            project: projectName,
            type: node.getAttribute('type'),
            action: node.getAttribute('action'),
            vetoed: node.getAttribute('veto') === 'section'
          });
        }
        node = node.nextElementSibling;
      }

      parts.push({
        name: partName || `Part ${idx + 1}`,
        sections: sections
      });
    });

    return {
      parts: parts,
      totalSections: this.querySelectorAll('BillSection').length
    };
  }

  /**
   * Extract all agencies/departments mentioned in the bill
   */
  extractAgencies() {
    const agencies = new Map();

    this.querySelectorAll('Department').forEach(dept => {
      const name = this.getTextContent('DeptName', dept);
      const index = this.getTextContent('Index', dept);

      if (name) {
        const key = index || name;
        if (!agencies.has(key)) {
          agencies.set(key, {
            name: name,
            index: index,
            projectCount: 0,
            totalAppropriation: 0,
            totalReappropriation: 0,
            projects: []
          });
        }
      }
    });

    // Count projects per agency
    this.querySelectorAll('BillSection').forEach(section => {
      const deptName = this.getTextContent('DeptName', section);
      if (deptName) {
        const agency = Array.from(agencies.values()).find(a => a.name === deptName);
        if (agency) {
          agency.projectCount++;
          const projectName = this.getTextContent('CapitalProjectName', section);
          if (projectName) {
            const projectMatch = projectName.match(/\((\d+)\)/);
            const projectId = projectMatch ? projectMatch[1] : null;
            agency.projects.push({
              name: projectName.replace(/\s*\(\d+\)\s*$/, '').trim(),
              id: projectId
            });
          }
        }
      }
    });

    return Array.from(agencies.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  /**
   * Extract all capital projects with their details
   */
  extractProjects() {
    const projects = [];

    this.querySelectorAll('BillSection').forEach(section => {
      const projectNameEl = this.querySelector('CapitalProjectName', section);
      if (!projectNameEl) return;

      const projectName = projectNameEl.textContent.trim();
      const projectMatch = projectName.match(/\((\d+)\)/);
      const projectId = projectMatch ? projectMatch[1] : null;

      const sectionNum = this.getTextContent('Value', this.querySelector('BillSectionNumber', section));
      const deptName = this.getTextContent('DeptName', section);

      // Get conditions and limitations
      const conditions = [];
      this.querySelectorAll('P', section).forEach(p => {
        const text = p.textContent.trim();
        if (text.includes('subject to the following conditions') ||
            text.includes('provided solely') ||
            text.includes('appropriation in this section')) {
          conditions.push(text);
        }
      });

      // Get agency code from Appropriations element
      const appropEl = this.querySelector('Appropriations[agency]', section);
      const agencyCode = appropEl ? appropEl.getAttribute('agency') : null;

      projects.push({
        id: projectId,
        name: projectName.replace(/\s*\(\d+\)\s*$/, '').trim(),
        section: sectionNum,
        department: deptName,
        agencyCode: agencyCode,
        conditions: conditions,
        sectionType: section.getAttribute('type'),
        sectionAction: section.getAttribute('action'),
        vetoed: section.getAttribute('veto') === 'section'
      });
    });

    return projects;
  }

  /**
   * Extract all appropriations (funding data)
   */
  extractAppropriations() {
    const appropriations = [];

    this.querySelectorAll('Appropriations').forEach(appropGroup => {
      const agency = appropGroup.getAttribute('agency');
      const project = appropGroup.getAttribute('project');
      const appropType = appropGroup.getAttribute('appropType');

      // Find the section number - walk up the tree
      let section = appropGroup.parentNode;
      while (section && section.tagName !== 'BillSection') {
        section = section.parentNode;
      }
      const sectionNum = section ? this.getTextContent('Value', this.querySelector('BillSectionNumber', section)) : null;
      const projectName = section ? this.getTextContent('CapitalProjectName', section) : null;

      this.querySelectorAll('Appropriation', appropGroup).forEach(approp => {
        const accountName = this.getTextContent('AccountName', approp).replace(/\s+/g, ' ').trim();
        const amount = this.parseCurrency(this.getTextContent('DollarAmount', approp));

        if (appropType === 'biennia') {
          // These are summary rows (Prior Biennia, Future Biennia, Total)
          const isPrior = accountName.includes('Prior Biennia');
          const isFuture = accountName.includes('Future Biennia');

          appropriations.push({
            section: sectionNum,
            project: project,
            projectName: projectName,
            agency: agency,
            type: isPrior ? 'prior_biennia' : (isFuture ? 'future_biennia' : 'appropriation'),
            account: accountName,
            amount: amount,
            isTotal: false
          });
        } else {
          // Regular appropriations or reappropriations
          appropriations.push({
            section: sectionNum,
            project: project,
            projectName: projectName,
            agency: agency,
            type: appropType,
            account: accountName,
            amount: amount,
            isTotal: false
          });
        }
      });

      // Get subtotals and totals
      this.querySelectorAll('AppropriationSubTotal', appropGroup).forEach(subtotal => {
        const amount = this.parseCurrency(this.getTextContent('DollarAmount', subtotal));
        appropriations.push({
          section: sectionNum,
          project: project,
          projectName: projectName,
          agency: agency,
          type: appropType + '_subtotal',
          account: 'Subtotal',
          amount: amount,
          isTotal: true
        });
      });

      this.querySelectorAll('AppropriationTotal', appropGroup).forEach(total => {
        const amount = this.parseCurrency(this.getTextContent('DollarAmount', total));
        appropriations.push({
          section: sectionNum,
          project: project,
          projectName: projectName,
          agency: agency,
          type: 'total',
          account: 'Total',
          amount: amount,
          isTotal: true
        });
      });
    });

    return appropriations;
  }

  /**
   * Extract individual grant projects (from project lists within sections)
   */
  extractGrantProjects() {
    const grants = [];

    this.querySelectorAll('BillSection').forEach(section => {
      const sectionNum = this.getTextContent('Value', this.querySelector('BillSectionNumber', section));
      const deptName = this.getTextContent('DeptName', section);
      const programName = this.getTextContent('CapitalProjectName', section);

      // Look for grant lists - these are P elements with Leader and dollar amounts
      // that appear after "provided solely for the following list of projects"
      let inGrantList = false;

      this.querySelectorAll('P', section).forEach(p => {
        const text = p.textContent.trim();

        if (text.includes('provided solely for the following list of projects')) {
          inGrantList = true;
          return;
        }

        if (inGrantList) {
          const leader = this.querySelector('Leader', p);
          if (leader) {
            // This is a grant line
            const fullText = p.textContent;
            const parts = fullText.split('.');

            if (parts.length >= 2) {
              const grantName = parts.slice(0, -1).join('.').trim();
              const amountText = parts[parts.length - 1].trim();
              const amount = this.parseCurrency(amountText);

              if (amount > 0) {
                grants.push({
                  section: sectionNum,
                  program: programName,
                  department: deptName,
                  grantee: grantName,
                  amount: amount
                });
              }
            }
          } else if (text.length < 10 || !text.includes('$')) {
            // Short text or no dollar sign might mean end of list
            // But don't end if it looks like a continuation line
            if (!text.match(/^[A-Z]/) && !p.getAttribute('indent')) {
              inGrantList = false;
            }
          }
        }
      });
    });

    return grants;
  }

  /**
   * Extract statutory references (RCW citations)
   */
  extractStatutoryReferences() {
    const references = new Set();

    // RCW references in BillTitle
    const billTitle = this.getTextContent('BillTitle');
    if (billTitle) {
      const rcwPattern = /RCW\s+\d+\.\d+\.\d+/g;
      const matches = billTitle.match(rcwPattern);
      if (matches) {
        matches.forEach(ref => references.add(ref));
      }
    }

    // RCW references in section citations
    this.querySelectorAll('SectionCite').forEach(cite => {
      const titleNum = this.getTextContent('TitleNumber', cite);
      const chapterNum = this.getTextContent('ChapterNumber', cite);
      const sectionNum = this.getTextContent('SectionNumber', cite);

      if (titleNum && chapterNum && sectionNum) {
        references.add(`RCW ${titleNum}.${chapterNum}.${sectionNum}`);
      }
    });

    // RCW references in condition text
    this.querySelectorAll('P').forEach(p => {
      const text = p.textContent;
      const rcwPattern = /RCW\s+\d+\.\d+\.\d+/g;
      const matches = text.match(rcwPattern);
      if (matches) {
        matches.forEach(ref => references.add(ref));
      }
    });

    return Array.from(references).sort();
  }

  /**
   * Extract and categorize all dates in the bill
   */
  extractDates() {
    const dates = {
      fiscalYears: [],
      passageDates: [],
      effectiveDate: null,
      approvedDate: null,
      filedDate: null,
      otherDates: []
    };

    // Fiscal year definitions
    this.querySelectorAll('P').forEach(p => {
      const text = p.textContent.trim();
      const fyMatch = text.match(/"Fiscal year (\d+)" or "FY (\d+)" means the period beginning (\w+ \d+, \d+), and ending (\w+ \d+, \d+)/);
      if (fyMatch) {
        dates.fiscalYears.push({
          year: fyMatch[1],
          abbreviation: `FY ${fyMatch[2]}`,
          startDate: fyMatch[3],
          endDate: fyMatch[4]
        });
      }
    });

    // Passage dates
    this.querySelectorAll('PassedBy').forEach(passage => {
      dates.passageDates.push({
        chamber: passage.getAttribute('chamber'),
        date: this.getTextContent('PassedDate', passage)
      });
    });

    // Official dates
    dates.effectiveDate = this.getTextContent('EffectiveDate');
    dates.approvedDate = this.getTextContent('ApprovedDate');
    dates.filedDate = this.getTextContent('FiledDate');

    return dates;
  }

  /**
   * Calculate fiscal summary across all appropriations
   */
  calculateFiscalSummary() {
    const summary = {
      totalAppropriation: 0,
      totalReappropriation: 0,
      totalPriorBiennia: 0,
      totalFutureBiennia: 0,
      grandTotal: 0,
      byAgency: {},
      byAccount: {},
      bySectionCount: 0
    };

    this.querySelectorAll('Appropriations').forEach(appropGroup => {
      const agency = appropGroup.getAttribute('agency');
      const appropType = appropGroup.getAttribute('appropType');

      if (!summary.byAgency[agency]) {
        summary.byAgency[agency] = {
          appropriation: 0,
          reappropriation: 0,
          total: 0
        };
      }

      this.querySelectorAll('Appropriation', appropGroup).forEach(approp => {
        const accountName = this.getTextContent('AccountName', approp).replace(/\s+/g, ' ').trim();
        const amount = this.parseCurrency(this.getTextContent('DollarAmount', approp));

        if (!summary.byAccount[accountName]) {
          summary.byAccount[accountName] = 0;
        }
        summary.byAccount[accountName] += amount;

        if (appropType === 'appropriation') {
          summary.totalAppropriation += amount;
          summary.byAgency[agency].appropriation += amount;
        } else if (appropType === 'reappropriation') {
          summary.totalReappropriation += amount;
          summary.byAgency[agency].reappropriation += amount;
        } else if (appropType === 'biennia') {
          if (accountName.includes('Prior Biennia')) {
            summary.totalPriorBiennia += amount;
          } else if (accountName.includes('Future Biennia')) {
            summary.totalFutureBiennia += amount;
          }
        }
      });

      // Get totals
      this.querySelectorAll('AppropriationTotal', appropGroup).forEach(total => {
        const amount = this.parseCurrency(this.getTextContent('DollarAmount', total));
        summary.byAgency[agency].total = Math.max(summary.byAgency[agency].total, amount);
      });
    });

    summary.grandTotal = summary.totalAppropriation + summary.totalReappropriation;
    summary.bySectionCount = this.querySelectorAll('BillSection').length;

    return summary;
  }

  /**
   * Query functions for browser-based analysis
   */

  /**
   * Get all appropriations for a specific agency
   */
  getAppropriationsByAgency(agencyCode) {
    const appropriations = this.extractAppropriations();
    return appropriations.filter(a => a.agency === agencyCode);
  }

  /**
   * Get all grants for a specific program
   */
  getGrantsByProgram(programName) {
    const grants = this.extractGrantProjects();
    return grants.filter(g =>
      g.program && g.program.toLowerCase().includes(programName.toLowerCase())
    );
  }

  /**
   * Search projects by keyword
   */
  searchProjects(keyword) {
    const projects = this.extractProjects();
    const lower = keyword.toLowerCase();
    return projects.filter(p =>
      p.name.toLowerCase().includes(lower) ||
      (p.department && p.department.toLowerCase().includes(lower))
    );
  }

  /**
   * Get total funding by account type
   */
  getFundingByAccount(accountName) {
    const appropriations = this.extractAppropriations();
    return appropriations
      .filter(a => a.account.toLowerCase().includes(accountName.toLowerCase()) && !a.isTotal)
      .reduce((sum, a) => sum + a.amount, 0);
  }

  /**
   * Helper: Get text content from element
   */
  getTextContent(selector, parent = null) {
    const el = this.querySelector(selector, parent);
    return el ? el.textContent.trim() : '';
  }

  /**
   * Helper: Parse currency string to number
   */
  parseCurrency(str) {
    if (!str) return 0;
    const cleaned = str.replace(/[$,]/g, '');
    return parseFloat(cleaned) || 0;
  }
}

// Export for Node.js if available
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WaBillExtractor;
}
