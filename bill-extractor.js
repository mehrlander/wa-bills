/**
 * WA Bills Extraction Library
 * Comprehensive extraction tools for Washington State legislative bills
 * Supports both XML and HTML formats
 *
 * @author Claude Code
 * @version 1.0.0
 */

const BillExtractor = (function() {
  'use strict';

  // ==================== XML PARSING UTILITIES ====================

  /**
   * Parse XML string into DOM document
   * @param {string} xmlString - Raw XML content
   * @returns {Document} Parsed XML document
   */
  function parseXML(xmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');

    // Add querySelector polyfill for Node.js xmldom
    if (!doc.querySelector) {
      doc.querySelector = function(selector) {
        return this.getElementsByTagName(selector)[0] || null;
      };
      doc.querySelectorAll = function(selector) {
        return Array.from(this.getElementsByTagName(selector));
      };
    }

    // Add querySelector to all elements
    const addQueryMethods = (el) => {
      if (!el.querySelector) {
        el.querySelector = function(selector) {
          return this.getElementsByTagName(selector)[0] || null;
        };
        el.querySelectorAll = function(selector) {
          return Array.from(this.getElementsByTagName(selector));
        };
      }
    };

    // Walk the tree and add methods
    const walkTree = (node) => {
      if (node.nodeType === 1) {  // Element node
        addQueryMethods(node);
      }
      for (let i = 0; i < node.childNodes.length; i++) {
        walkTree(node.childNodes[i]);
      }
    };
    walkTree(doc);

    return doc;
  }

  /**
   * Get text content from element, handling nested TextRun elements
   * @param {Element} element - XML element
   * @returns {string} Combined text content
   */
  function getTextContent(element) {
    if (!element) return '';
    return element.textContent.trim();
  }

  /**
   * Extract dollar amount from formatted string
   * @param {string} dollarStr - Dollar string (e.g., "$1,234,567")
   * @returns {number} Numeric amount
   */
  function parseDollarAmount(dollarStr) {
    if (!dollarStr) return 0;
    const cleaned = dollarStr.replace(/[$,]/g, '');
    return parseFloat(cleaned) || 0;
  }

  // ==================== METADATA EXTRACTION ====================

  /**
   * Extract bill metadata from XML document
   * @param {Document} xmlDoc - Parsed XML document
   * @returns {Object} Bill metadata
   */
  function extractMetadata(xmlDoc) {
    const billHeading = xmlDoc.querySelector('BillHeading');
    const enrollingCert = xmlDoc.querySelector('EnrollingCertificate');

    const metadata = {
      billId: getTextContent(billHeading?.querySelector('ShortBillId')),
      longBillId: getTextContent(billHeading?.querySelector('LongBillId')),
      legislature: getTextContent(billHeading?.querySelector('Legislature')),
      session: getTextContent(billHeading?.querySelector('Session')),
      sponsors: getTextContent(billHeading?.querySelector('Sponsors')),
      description: getTextContent(billHeading?.querySelector('BriefDescription')),
      billType: xmlDoc.documentElement.getAttribute('type') || 'bill',
      readDate: getTextContent(billHeading?.querySelector('ReadDate')),
      chapterLaw: getTextContent(enrollingCert?.querySelector('ChapterLaw')),
      vetoAction: getTextContent(enrollingCert?.querySelector('VetoAction')),
      sessionLawCaption: getTextContent(enrollingCert?.querySelector('SessionLawCaption')),
      effectiveDate: getTextContent(enrollingCert?.querySelector('EffectiveDate')),
    };

    // Extract passage information
    const passageElements = xmlDoc.querySelectorAll('PassedBy');
    metadata.passage = Array.from(passageElements).map(pb => ({
      chamber: pb.getAttribute('chamber'),
      date: getTextContent(pb.querySelector('PassedDate')),
      yeas: parseInt(getTextContent(pb.querySelector('Yeas'))) || 0,
      nays: parseInt(getTextContent(pb.querySelector('Nays'))) || 0,
      signer: getTextContent(pb.querySelector('Signer'))
    }));

    // Extract certificate information
    const certificate = enrollingCert?.querySelector('Certificate');
    if (certificate) {
      metadata.certifier = {
        name: getTextContent(certificate.querySelector('Certifier')),
        position: getTextContent(certificate.querySelector('CertifierPosition'))
      };
    }

    // Extract approval/filing dates
    metadata.approvedDate = getTextContent(enrollingCert?.querySelector('ApprovedDate'));
    metadata.filedDate = getTextContent(enrollingCert?.querySelector('FiledDate'));
    metadata.governor = getTextContent(enrollingCert?.querySelector('Governor'));

    return metadata;
  }

  // ==================== SECTION EXTRACTION ====================

  /**
   * Extract all bill sections
   * @param {Document} xmlDoc - Parsed XML document
   * @returns {Array} Array of section objects
   */
  function extractSections(xmlDoc) {
    const sections = [];
    const billSections = xmlDoc.querySelectorAll('BillSection');

    billSections.forEach(section => {
      const sectionHeader = section.querySelector('BillSectionHeader');
      const sectionNumber = sectionHeader?.querySelector('BillSectionNumber Value');

      const sectionData = {
        sectionNumber: getTextContent(sectionNumber),
        type: section.getAttribute('type'),
        action: section.getAttribute('action'),
        department: null,
        projectName: getTextContent(section.querySelector('CapitalProjectName')),
        projectId: null,
        text: []
      };

      // Extract project ID from project name (format: "Name (ID)")
      const projectName = sectionData.projectName;
      const projectIdMatch = projectName?.match(/\((\d+)\)$/);
      if (projectIdMatch) {
        sectionData.projectId = projectIdMatch[1];
        sectionData.projectName = projectName.replace(/\s*\(\d+\)$/, '').trim();
      }

      // Extract department
      const dept = sectionHeader?.querySelector('Department');
      if (dept) {
        sectionData.department = {
          name: getTextContent(dept.querySelector('DeptName')),
          index: getTextContent(dept.querySelector('Index'))
        };
      }

      // Extract all paragraph text
      const paragraphs = section.querySelectorAll('P');
      paragraphs.forEach(p => {
        const text = getTextContent(p);
        if (text) {
          sectionData.text.push(text);
        }
      });

      sections.push(sectionData);
    });

    return sections;
  }

  // ==================== APPROPRIATION EXTRACTION ====================

  /**
   * Extract all appropriations data
   * @param {Document} xmlDoc - Parsed XML document
   * @returns {Array} Array of appropriation objects
   */
  function extractAppropriations(xmlDoc) {
    const appropriations = [];
    const appropElements = xmlDoc.querySelectorAll('Appropriations');

    appropElements.forEach(approp => {
      const agency = approp.getAttribute('agency');
      const project = approp.getAttribute('project');
      const appropType = approp.getAttribute('appropType');

      const appropData = {
        agency: agency,
        projectId: project,
        type: appropType,
        items: []
      };

      // Extract individual appropriation line items
      const items = approp.querySelectorAll('Appropriation');
      items.forEach(item => {
        const accountName = getTextContent(item.querySelector('AccountName'));
        const dollarAmount = getTextContent(item.querySelector('DollarAmount'));

        appropData.items.push({
          account: accountName,
          amount: parseDollarAmount(dollarAmount),
          amountFormatted: dollarAmount
        });
      });

      // Extract subtotal if present
      const subtotal = approp.querySelector('AppropriationSubTotal DollarAmount');
      if (subtotal) {
        appropData.subtotal = parseDollarAmount(getTextContent(subtotal));
      }

      // Extract total if present
      const total = approp.querySelector('AppropriationTotal DollarAmount');
      if (total) {
        appropData.total = parseDollarAmount(getTextContent(total));
      }

      appropriations.push(appropData);
    });

    return appropriations;
  }

  // ==================== AGENCY EXTRACTION ====================

  /**
   * Extract all unique agencies/departments
   * @param {Document} xmlDoc - Parsed XML document
   * @returns {Array} Array of unique agency objects
   */
  function extractAgencies(xmlDoc) {
    const agencyMap = new Map();
    const departments = xmlDoc.querySelectorAll('Department');

    departments.forEach(dept => {
      const name = getTextContent(dept.querySelector('DeptName'));
      const index = getTextContent(dept.querySelector('Index'));

      if (name && !agencyMap.has(name)) {
        agencyMap.set(name, {
          name: name,
          indexName: index || null
        });
      }
    });

    // Also extract from Appropriations agency codes
    const appropElements = xmlDoc.querySelectorAll('Appropriations');
    const agencyCodes = new Set();
    appropElements.forEach(approp => {
      const code = approp.getAttribute('agency');
      if (code) agencyCodes.add(code);
    });

    return {
      departments: Array.from(agencyMap.values()),
      agencyCodes: Array.from(agencyCodes).sort()
    };
  }

  // ==================== ACCOUNT EXTRACTION ====================

  /**
   * Extract all unique account types
   * @param {Document} xmlDoc - Parsed XML document
   * @returns {Array} Array of unique account names
   */
  function extractAccounts(xmlDoc) {
    const accountSet = new Set();
    const accountElements = xmlDoc.querySelectorAll('AccountName');

    accountElements.forEach(account => {
      const accountName = getTextContent(account);
      if (accountName) {
        // Clean up account name (remove em-dashes and extra spaces)
        const cleaned = accountName.replace(/—/g, '-').replace(/\s+/g, ' ').trim();
        accountSet.add(cleaned);
      }
    });

    return Array.from(accountSet).sort();
  }

  // ==================== STATUTORY REFERENCE EXTRACTION ====================

  /**
   * Extract all RCW (Revised Code of Washington) references
   * @param {Document} xmlDoc - Parsed XML document
   * @returns {Array} Array of RCW citation objects
   */
  function extractRCWReferences(xmlDoc) {
    const rcwSet = new Set();

    // Method 1: Extract from BillTitle
    const billTitle = getTextContent(xmlDoc.querySelector('BillTitle'));
    if (billTitle) {
      const rcwMatches = billTitle.matchAll(/RCW\s+(\d+\.\d+\.\d+)/g);
      for (const match of rcwMatches) {
        rcwSet.add(match[1]);
      }
    }

    // Method 2: Extract from SectionCite elements
    const sectionCites = xmlDoc.querySelectorAll('SectionCite');
    sectionCites.forEach(cite => {
      const title = getTextContent(cite.querySelector('TitleNumber'));
      const chapter = getTextContent(cite.querySelector('ChapterNumber'));
      const section = getTextContent(cite.querySelector('SectionNumber'));
      if (title && chapter && section) {
        rcwSet.add(`${title}.${chapter}.${section}`);
      }
    });

    // Method 3: Extract from all text content
    const allText = xmlDoc.documentElement.textContent;
    const rcwMatches = allText.matchAll(/RCW\s+(\d+\.\d+\.\d+)/g);
    for (const match of rcwMatches) {
      rcwSet.add(match[1]);
    }

    return Array.from(rcwSet).sort();
  }

  // ==================== PROJECT EXTRACTION ====================

  /**
   * Extract all capital projects with consolidated financial data
   * @param {Document} xmlDoc - Parsed XML document
   * @returns {Array} Array of project objects
   */
  function extractProjects(xmlDoc) {
    const projectMap = new Map();
    const sections = xmlDoc.querySelectorAll('BillSection');

    sections.forEach(section => {
      const projectNameEl = section.querySelector('CapitalProjectName');
      if (!projectNameEl) return;

      const projectName = getTextContent(projectNameEl);
      const projectIdMatch = projectName.match(/\((\d+)\)$/);
      if (!projectIdMatch) return;

      const projectId = projectIdMatch[1];
      const cleanName = projectName.replace(/\s*\(\d+\)$/, '').trim();

      if (!projectMap.has(projectId)) {
        const sectionHeader = section.querySelector('BillSectionHeader');
        const dept = sectionHeader?.querySelector('Department');
        const sectionNumber = sectionHeader?.querySelector('BillSectionNumber Value');

        projectMap.set(projectId, {
          projectId: projectId,
          projectName: cleanName,
          sectionNumber: getTextContent(sectionNumber),
          department: getTextContent(dept?.querySelector('DeptName')),
          appropriations: {
            reappropriation: [],
            appropriation: [],
            biennia: []
          },
          fiscalSummary: {
            currentBiennium: 0,
            reappropriation: 0,
            priorBiennia: 0,
            futureBiennia: 0,
            total: 0
          },
          conditions: []
        });
      }

      // Extract conditions and limitations
      const paragraphs = section.querySelectorAll('P');
      const conditions = [];
      paragraphs.forEach(p => {
        const text = getTextContent(p);
        if (text && (text.includes('provided solely') || text.includes('subject to'))) {
          conditions.push(text);
        }
      });
      projectMap.get(projectId).conditions = conditions;
    });

    // Add appropriation details
    const appropElements = xmlDoc.querySelectorAll('Appropriations');
    appropElements.forEach(approp => {
      const projectId = approp.getAttribute('project');
      const appropType = approp.getAttribute('appropType');

      if (!projectMap.has(projectId)) return;

      const project = projectMap.get(projectId);
      const items = [];

      approp.querySelectorAll('Appropriation').forEach(item => {
        const account = getTextContent(item.querySelector('AccountName'));
        const amount = getTextContent(item.querySelector('DollarAmount'));
        items.push({
          account: account,
          amount: parseDollarAmount(amount),
          amountFormatted: amount
        });
      });

      if (appropType === 'reappropriation') {
        project.appropriations.reappropriation = items;
        project.fiscalSummary.reappropriation = items.reduce((sum, i) => sum + i.amount, 0);
      } else if (appropType === 'appropriation') {
        project.appropriations.appropriation = items;
        project.fiscalSummary.currentBiennium = items.reduce((sum, i) => sum + i.amount, 0);
      } else if (appropType === 'biennia') {
        project.appropriations.biennia = items;
        items.forEach(item => {
          if (item.account.includes('Prior Biennia')) {
            project.fiscalSummary.priorBiennia = item.amount;
          } else if (item.account.includes('Future Biennia')) {
            project.fiscalSummary.futureBiennia = item.amount;
          } else if (item.account.includes('TOTAL')) {
            project.fiscalSummary.total = item.amount;
          }
        });
      }
    });

    return Array.from(projectMap.values());
  }

  // ==================== FISCAL IMPACT EXTRACTION ====================

  /**
   * Extract overall fiscal summary across all projects
   * @param {Document} xmlDoc - Parsed XML document
   * @returns {Object} Fiscal impact summary
   */
  function extractFiscalImpact(xmlDoc) {
    const projects = extractProjects(xmlDoc);

    const summary = {
      totalCurrentBiennium: 0,
      totalReappropriation: 0,
      totalPriorBiennia: 0,
      totalFutureBiennia: 0,
      grandTotal: 0,
      byAccount: {},
      byDepartment: {},
      projectCount: projects.length
    };

    projects.forEach(project => {
      summary.totalCurrentBiennium += project.fiscalSummary.currentBiennium;
      summary.totalReappropriation += project.fiscalSummary.reappropriation;
      summary.totalPriorBiennia += project.fiscalSummary.priorBiennia;
      summary.totalFutureBiennia += project.fiscalSummary.futureBiennia;
      summary.grandTotal += project.fiscalSummary.total;

      // Aggregate by department
      const dept = project.department || 'Unknown';
      if (!summary.byDepartment[dept]) {
        summary.byDepartment[dept] = {
          currentBiennium: 0,
          reappropriation: 0,
          total: 0,
          projectCount: 0
        };
      }
      summary.byDepartment[dept].currentBiennium += project.fiscalSummary.currentBiennium;
      summary.byDepartment[dept].reappropriation += project.fiscalSummary.reappropriation;
      summary.byDepartment[dept].total += project.fiscalSummary.total;
      summary.byDepartment[dept].projectCount++;

      // Aggregate by account
      [...project.appropriations.appropriation, ...project.appropriations.reappropriation].forEach(item => {
        const account = item.account;
        if (!summary.byAccount[account]) {
          summary.byAccount[account] = 0;
        }
        summary.byAccount[account] += item.amount;
      });
    });

    return summary;
  }

  // ==================== DATE EXTRACTION ====================

  /**
   * Extract all significant dates from the bill
   * @param {Document} xmlDoc - Parsed XML document
   * @returns {Object} Date information
   */
  function extractDates(xmlDoc) {
    const dates = {
      effectiveDate: getTextContent(xmlDoc.querySelector('EffectiveDate')),
      approvedDate: getTextContent(xmlDoc.querySelector('ApprovedDate')),
      filedDate: getTextContent(xmlDoc.querySelector('FiledDate')),
      readDate: getTextContent(xmlDoc.querySelector('ReadDate')),
      passageDates: []
    };

    const passageElements = xmlDoc.querySelectorAll('PassedBy');
    passageElements.forEach(pb => {
      dates.passageDates.push({
        chamber: pb.getAttribute('chamber'),
        date: getTextContent(pb.querySelector('PassedDate'))
      });
    });

    return dates;
  }

  // ==================== VETO EXTRACTION ====================

  /**
   * Extract veto information
   * @param {Document} xmlDoc - Parsed XML document
   * @returns {Object} Veto data
   */
  function extractVetos(xmlDoc) {
    const vetoAction = getTextContent(xmlDoc.querySelector('VetoAction'));
    const approvedDate = getTextContent(xmlDoc.querySelector('ApprovedDate'));

    const vetos = {
      hasVeto: vetoAction.includes('veto'),
      vetoType: vetoAction,
      vetoedSections: [],
      vetoNotes: []
    };

    // Extract vetoed sections from approved date text
    const vetoMatch = approvedDate.match(/with the exception of sections? ([^,]+(?:, [^,]+)*), which (?:is|are) vetoed/);
    if (vetoMatch) {
      const sectionList = vetoMatch[1];
      vetos.vetoedSections = sectionList.split(',').map(s => s.trim());
    }

    // Extract veto notes
    const vetoNoteElements = xmlDoc.querySelectorAll('VetoNote');
    vetoNoteElements.forEach(note => {
      vetos.vetoNotes.push({
        section: note.getAttribute('section'),
        text: getTextContent(note)
      });
    });

    return vetos;
  }

  // ==================== PARTS/STRUCTURE EXTRACTION ====================

  /**
   * Extract bill part structure
   * @param {Document} xmlDoc - Parsed XML document
   * @returns {Array} Array of part objects
   */
  function extractParts(xmlDoc) {
    const parts = [];
    const partElements = xmlDoc.querySelectorAll('Part');

    partElements.forEach((part, index) => {
      const partTexts = Array.from(part.querySelectorAll(':scope > P')).map(p => getTextContent(p));
      const partNumber = index + 1;
      const partName = partTexts.join(' - ');

      const sections = [];
      let currentElement = part.nextElementSibling;

      while (currentElement && currentElement.tagName !== 'Part') {
        if (currentElement.tagName === 'BillSection') {
          const sectionNumber = getTextContent(currentElement.querySelector('BillSectionNumber Value'));
          if (sectionNumber) {
            sections.push(sectionNumber);
          }
        }
        currentElement = currentElement.nextElementSibling;
      }

      parts.push({
        partNumber: partNumber,
        partName: partName,
        sectionCount: sections.length,
        sectionNumbers: sections
      });
    });

    return parts;
  }

  // ==================== MAIN EXTRACTION FUNCTION ====================

  /**
   * Extract all structured data from bill XML
   * @param {string} xmlString - Raw XML content
   * @returns {Object} Complete extracted data
   */
  function extractAll(xmlString) {
    const xmlDoc = parseXML(xmlString);

    return {
      metadata: extractMetadata(xmlDoc),
      parts: extractParts(xmlDoc),
      sections: extractSections(xmlDoc),
      projects: extractProjects(xmlDoc),
      appropriations: extractAppropriations(xmlDoc),
      agencies: extractAgencies(xmlDoc),
      accounts: extractAccounts(xmlDoc),
      rcwReferences: extractRCWReferences(xmlDoc),
      fiscalImpact: extractFiscalImpact(xmlDoc),
      dates: extractDates(xmlDoc),
      vetos: extractVetos(xmlDoc),
      extractedAt: new Date().toISOString()
    };
  }

  // ==================== PUBLIC API ====================

  return {
    // Parsing utilities
    parseXML: parseXML,
    parseDollarAmount: parseDollarAmount,

    // Entity extraction functions
    extractMetadata: extractMetadata,
    extractSections: extractSections,
    extractAppropriations: extractAppropriations,
    extractAgencies: extractAgencies,
    extractAccounts: extractAccounts,
    extractRCWReferences: extractRCWReferences,
    extractProjects: extractProjects,
    extractFiscalImpact: extractFiscalImpact,
    extractDates: extractDates,
    extractVetos: extractVetos,
    extractParts: extractParts,

    // Complete extraction
    extractAll: extractAll
  };
})();

// Export for Node.js if available
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BillExtractor;
}
