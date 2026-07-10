/**
 * WA Bills Extraction Library - Node.js Optimized Version
 * Uses native getElementsByTagName for xmldom compatibility
 *
 * @author Claude Code
 * @version 1.0.0
 */

const BillExtractorNode = (function() {
  'use strict';

  // ==================== XML PARSING UTILITIES ====================

  /**
   * Parse XML string into DOM document
   * @param {string} xmlString - Raw XML content
   * @returns {Document} Parsed XML document
   */
  function parseXML(xmlString) {
    const parser = new DOMParser();
    return parser.parseFromString(xmlString, 'text/xml');
  }

  /**
   * Get text content from element
   * @param {Element} element - XML element
   * @returns {string} Combined text content
   */
  function getTextContent(element) {
    if (!element) return '';
    return (element.textContent || '').trim();
  }

  /**
   * Get first element by tag name
   * @param {Element} parent - Parent element
   * @param {string} tagName - Tag name to find
   * @returns {Element|null} First matching element
   */
  function getElement(parent, tagName) {
    if (!parent) return null;
    const elements = parent.getElementsByTagName(tagName);
    return elements.length > 0 ? elements[0] : null;
  }

  /**
   * Get all elements by tag name as array
   * @param {Element} parent - Parent element
   * @param {string} tagName - Tag name to find
   * @returns {Array} Array of elements
   */
  function getElements(parent, tagName) {
    if (!parent) return [];
    return Array.from(parent.getElementsByTagName(tagName));
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

  function extractMetadata(xmlDoc) {
    const billHeading = getElement(xmlDoc, 'BillHeading');
    const enrollingCert = getElement(xmlDoc, 'EnrollingCertificate');

    const metadata = {
      billId: getTextContent(getElement(billHeading, 'ShortBillId')),
      longBillId: getTextContent(getElement(billHeading, 'LongBillId')),
      legislature: getTextContent(getElement(billHeading, 'Legislature')),
      session: getTextContent(getElement(billHeading, 'Session')),
      sponsors: getTextContent(getElement(billHeading, 'Sponsors')),
      description: getTextContent(getElement(billHeading, 'BriefDescription')),
      billType: xmlDoc.documentElement.getAttribute('type') || 'bill',
      readDate: getTextContent(getElement(billHeading, 'ReadDate')),
      chapterLaw: getTextContent(getElement(enrollingCert, 'ChapterLaw')),
      vetoAction: getTextContent(getElement(enrollingCert, 'VetoAction')),
      sessionLawCaption: getTextContent(getElement(enrollingCert, 'SessionLawCaption')),
      effectiveDate: getTextContent(getElement(enrollingCert, 'EffectiveDate')),
      passage: [],
      certifier: null,
      approvedDate: getTextContent(getElement(enrollingCert, 'ApprovedDate')),
      filedDate: getTextContent(getElement(enrollingCert, 'FiledDate')),
      governor: getTextContent(getElement(enrollingCert, 'Governor'))
    };

    // Extract passage information
    const passageElements = getElements(xmlDoc, 'PassedBy');
    metadata.passage = passageElements.map(pb => ({
      chamber: pb.getAttribute('chamber'),
      date: getTextContent(getElement(pb, 'PassedDate')),
      yeas: parseInt(getTextContent(getElement(pb, 'Yeas'))) || 0,
      nays: parseInt(getTextContent(getElement(pb, 'Nays'))) || 0,
      signer: getTextContent(getElement(pb, 'Signer'))
    }));

    // Extract certificate information
    const certificate = getElement(enrollingCert, 'Certificate');
    if (certificate) {
      metadata.certifier = {
        name: getTextContent(getElement(certificate, 'Certifier')),
        position: getTextContent(getElement(certificate, 'CertifierPosition'))
      };
    }

    return metadata;
  }

  // ==================== SECTION EXTRACTION ====================

  function extractSections(xmlDoc) {
    const sections = [];
    const billSections = getElements(xmlDoc, 'BillSection');

    billSections.forEach(section => {
      const sectionHeader = getElement(section, 'BillSectionHeader');
      const sectionNumberEl = getElement(sectionHeader, 'Value');

      const sectionData = {
        sectionNumber: getTextContent(sectionNumberEl),
        type: section.getAttribute('type') || '',
        action: section.getAttribute('action') || '',
        department: null,
        projectName: '',
        projectId: null,
        text: []
      };

      // Extract project name
      const projectNameEl = getElement(section, 'CapitalProjectName');
      if (projectNameEl) {
        const projectName = getTextContent(projectNameEl);
        sectionData.projectName = projectName;

        // Extract project ID from project name (format: "Name (ID)")
        const projectIdMatch = projectName.match(/\((\d+)\)$/);
        if (projectIdMatch) {
          sectionData.projectId = projectIdMatch[1];
          sectionData.projectName = projectName.replace(/\s*\(\d+\)$/, '').trim();
        }
      }

      // Extract department
      const dept = getElement(sectionHeader, 'Department');
      if (dept) {
        sectionData.department = {
          name: getTextContent(getElement(dept, 'DeptName')),
          index: getTextContent(getElement(dept, 'Index'))
        };
      }

      sections.push(sectionData);
    });

    return sections;
  }

  // ==================== APPROPRIATION EXTRACTION ====================

  function extractAppropriations(xmlDoc) {
    const appropriations = [];
    const appropElements = getElements(xmlDoc, 'Appropriations');

    appropElements.forEach(approp => {
      const agency = approp.getAttribute('agency') || '';
      const project = approp.getAttribute('project') || '';
      const appropType = approp.getAttribute('appropType') || '';

      const appropData = {
        agency: agency,
        projectId: project,
        type: appropType,
        items: [],
        subtotal: null,
        total: null
      };

      // Extract individual appropriation line items
      const items = getElements(approp, 'Appropriation');
      items.forEach(item => {
        const accountName = getTextContent(getElement(item, 'AccountName'));
        const dollarAmountEl = getElement(item, 'DollarAmount');
        const dollarAmount = getTextContent(dollarAmountEl);

        if (accountName && dollarAmount) {
          appropData.items.push({
            account: accountName.replace(/—/g, '-'),
            amount: parseDollarAmount(dollarAmount),
            amountFormatted: dollarAmount
          });
        }
      });

      // Extract subtotal
      const subtotalEl = getElement(approp, 'AppropriationSubTotal');
      if (subtotalEl) {
        const dollarEl = getElement(subtotalEl, 'DollarAmount');
        if (dollarEl) {
          appropData.subtotal = parseDollarAmount(getTextContent(dollarEl));
        }
      }

      // Extract total
      const totalEl = getElement(approp, 'AppropriationTotal');
      if (totalEl) {
        const dollarEl = getElement(totalEl, 'DollarAmount');
        if (dollarEl) {
          appropData.total = parseDollarAmount(getTextContent(dollarEl));
        }
      }

      appropriations.push(appropData);
    });

    return appropriations;
  }

  // ==================== AGENCY EXTRACTION ====================

  function extractAgencies(xmlDoc) {
    const agencyMap = new Map();
    const departments = getElements(xmlDoc, 'Department');

    departments.forEach(dept => {
      const name = getTextContent(getElement(dept, 'DeptName'));
      const index = getTextContent(getElement(dept, 'Index'));

      if (name && !agencyMap.has(name)) {
        agencyMap.set(name, {
          name: name,
          indexName: index || null
        });
      }
    });

    // Extract agency codes from Appropriations
    const appropElements = getElements(xmlDoc, 'Appropriations');
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

  function extractAccounts(xmlDoc) {
    const accountSet = new Set();
    const accountElements = getElements(xmlDoc, 'AccountName');

    accountElements.forEach(account => {
      const accountName = getTextContent(account);
      if (accountName) {
        const cleaned = accountName.replace(/—/g, '-').replace(/\s+/g, ' ').trim();
        accountSet.add(cleaned);
      }
    });

    return Array.from(accountSet).sort();
  }

  // ==================== STATUTORY REFERENCE EXTRACTION ====================

  function extractRCWReferences(xmlDoc) {
    const rcwSet = new Set();

    // Extract from BillTitle
    const billTitle = getTextContent(getElement(xmlDoc, 'BillTitle'));
    if (billTitle) {
      const rcwMatches = billTitle.matchAll(/RCW\s+(\d+\.\d+\.\d+)/g);
      for (const match of rcwMatches) {
        rcwSet.add(match[1]);
      }
    }

    // Extract from SectionCite elements
    const sectionCites = getElements(xmlDoc, 'SectionCite');
    sectionCites.forEach(cite => {
      const title = getTextContent(getElement(cite, 'TitleNumber'));
      const chapter = getTextContent(getElement(cite, 'ChapterNumber'));
      const section = getTextContent(getElement(cite, 'SectionNumber'));
      if (title && chapter && section) {
        rcwSet.add(`${title}.${chapter}.${section}`);
      }
    });

    return Array.from(rcwSet).sort();
  }

  // ==================== PROJECT EXTRACTION ====================

  function extractProjects(xmlDoc) {
    const projectMap = new Map();
    const sections = getElements(xmlDoc, 'BillSection');

    // First pass: collect project metadata
    sections.forEach(section => {
      const projectNameEl = getElement(section, 'CapitalProjectName');
      if (!projectNameEl) return;

      const projectName = getTextContent(projectNameEl);
      const projectIdMatch = projectName.match(/\((\d+)\)$/);
      if (!projectIdMatch) return;

      const projectId = projectIdMatch[1];
      const cleanName = projectName.replace(/\s*\(\d+\)$/, '').trim();

      if (!projectMap.has(projectId)) {
        const sectionHeader = getElement(section, 'BillSectionHeader');
        const dept = getElement(sectionHeader, 'Department');
        const sectionNumberEl = getElement(sectionHeader, 'Value');

        projectMap.set(projectId, {
          projectId: projectId,
          projectName: cleanName,
          sectionNumber: getTextContent(sectionNumberEl),
          department: getTextContent(getElement(dept, 'DeptName')),
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
          }
        });
      }
    });

    // Second pass: add appropriation details
    const appropElements = getElements(xmlDoc, 'Appropriations');
    appropElements.forEach(approp => {
      const projectId = approp.getAttribute('project');
      const appropType = approp.getAttribute('appropType');

      if (!projectMap.has(projectId)) return;

      const project = projectMap.get(projectId);
      const items = [];

      const itemElements = getElements(approp, 'Appropriation');
      itemElements.forEach(item => {
        const account = getTextContent(getElement(item, 'AccountName'));
        const amountEl = getElement(item, 'DollarAmount');
        const amount = getTextContent(amountEl);

        if (account && amount) {
          items.push({
            account: account.replace(/—/g, '-'),
            amount: parseDollarAmount(amount),
            amountFormatted: amount
          });
        }
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

  function extractDates(xmlDoc) {
    const dates = {
      effectiveDate: getTextContent(getElement(xmlDoc, 'EffectiveDate')),
      approvedDate: getTextContent(getElement(xmlDoc, 'ApprovedDate')),
      filedDate: getTextContent(getElement(xmlDoc, 'FiledDate')),
      readDate: getTextContent(getElement(xmlDoc, 'ReadDate')),
      passageDates: []
    };

    const passageElements = getElements(xmlDoc, 'PassedBy');
    passageElements.forEach(pb => {
      dates.passageDates.push({
        chamber: pb.getAttribute('chamber'),
        date: getTextContent(getElement(pb, 'PassedDate'))
      });
    });

    return dates;
  }

  // ==================== VETO EXTRACTION ====================

  function extractVetos(xmlDoc) {
    const vetoAction = getTextContent(getElement(xmlDoc, 'VetoAction'));
    const approvedDate = getTextContent(getElement(xmlDoc, 'ApprovedDate'));

    const vetos = {
      hasVeto: vetoAction.toLowerCase().includes('veto'),
      vetoType: vetoAction,
      vetoedSections: [],
      vetoNotes: []
    };

    // Extract vetoed sections from approved date text
    const vetoMatch = approvedDate.match(/with the exception of sections? ([^,]+(?:, [^,]+)*), which (?:is|are) vetoed/);
    if (vetoMatch) {
      const sectionList = vetoMatch[1];
      vetos.vetoedSections = sectionList.split(/,\s*(?:and\s+)?/).map(s => s.trim()).filter(s => s);
    }

    // Extract veto notes
    const vetoNoteElements = getElements(xmlDoc, 'VetoNote');
    vetoNoteElements.forEach(note => {
      vetos.vetoNotes.push({
        section: note.getAttribute('section'),
        text: getTextContent(note)
      });
    });

    return vetos;
  }

  // ==================== PARTS/STRUCTURE EXTRACTION ====================

  function extractParts(xmlDoc) {
    const parts = [];
    const partElements = getElements(xmlDoc, 'Part');

    partElements.forEach((part, index) => {
      // Get direct child P elements of Part
      const childElements = Array.from(part.childNodes).filter(n => n.nodeType === 1 && n.tagName === 'P');
      const partTexts = childElements.map(p => getTextContent(p));
      const partNumber = index + 1;
      const partName = partTexts.join(' - ');

      parts.push({
        partNumber: partNumber,
        partName: partName
      });
    });

    return parts;
  }

  // ==================== MAIN EXTRACTION FUNCTION ====================

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
    parseXML: parseXML,
    parseDollarAmount: parseDollarAmount,
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
    extractAll: extractAll
  };
})();

module.exports = BillExtractorNode;
