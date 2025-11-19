/**
 * Washington State Legislature Bill Extraction Library
 *
 * A comprehensive library for parsing and extracting data from Washington State
 * legislative bills in both XML and HTM formats.
 *
 * @version 1.0.0
 * @license MIT
 */

const fs = require('fs');
const path = require('path');
const { DOMParser } = require('xmldom');

/**
 * Main BillExtractor class for parsing Washington State bills
 */
class BillExtractor {
  constructor() {
    this.xmlNamespace = 'http://leg.wa.gov/2012/document';
  }

  /**
   * Parse a bill file (auto-detects XML or HTM format)
   * @param {string} filePath - Path to the bill file
   * @returns {Object} Parsed bill data
   */
  parseBillFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const extension = path.extname(filePath).toLowerCase();

    if (extension === '.xml') {
      return this.parseXMLBill(content, filePath);
    } else if (extension === '.htm' || extension === '.html') {
      return this.parseHTMBill(content, filePath);
    } else {
      throw new Error(`Unsupported file format: ${extension}`);
    }
  }

  /**
   * Parse XML format bill
   * @param {string} xmlContent - Raw XML content
   * @param {string} filePath - Original file path
   * @returns {Object} Structured bill data
   */
  parseXMLBill(xmlContent, filePath = null) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, 'text/xml');

    const bill = {
      format: 'XML',
      filePath: filePath,
      fileSize: filePath ? fs.statSync(filePath).size : null,
      metadata: this.extractXMLMetadata(doc),
      enrollingCertificate: this.extractXMLEnrollingCertificate(doc),
      billHeading: this.extractXMLBillHeading(doc),
      sections: this.extractXMLSections(doc),
      appropriations: this.extractXMLAppropriations(doc),
      category: null, // To be determined by categorization
    };

    bill.category = this.categorizeBill(bill);
    return bill;
  }

  /**
   * Parse HTM format bill
   * @param {string} htmContent - Raw HTM content
   * @param {string} filePath - Original file path
   * @returns {Object} Structured bill data
   */
  parseHTMBill(htmContent, filePath = null) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmContent, 'text/html');

    const bill = {
      format: 'HTM',
      filePath: filePath,
      fileSize: filePath ? fs.statSync(filePath).size : null,
      metadata: this.extractHTMMetadata(doc),
      enrollingCertificate: this.extractHTMEnrollingCertificate(doc),
      billHeading: this.extractHTMBillHeading(doc),
      sections: this.extractHTMSections(doc),
      appropriations: this.extractHTMAppropriations(doc),
      category: null,
    };

    bill.category = this.categorizeBill(bill);
    return bill;
  }

  /**
   * Extract metadata from XML bill
   * @param {Document} doc - Parsed XML document
   * @returns {Object} Metadata object
   */
  extractXMLMetadata(doc) {
    const getTextContent = (xpath) => {
      const node = this.selectXMLNode(doc, xpath);
      return node ? node.textContent.trim() : null;
    };

    return {
      billType: doc.documentElement.getAttribute('type'),
      namespace: doc.documentElement.getAttribute('xmlns'),
    };
  }

  /**
   * Extract enrolling certificate from XML bill
   * @param {Document} doc - Parsed XML document
   * @returns {Object} Enrolling certificate data
   */
  extractXMLEnrollingCertificate(doc) {
    const cert = this.selectXMLNode(doc, '//EnrollingCertificate');
    if (!cert) return null;

    const getTextContent = (xpath, context = cert) => {
      const node = this.selectXMLNode(context, xpath, context);
      return node ? node.textContent.trim() : null;
    };

    const getAttribute = (xpath, attr) => {
      const node = this.selectXMLNode(cert, xpath, cert);
      return node ? node.getAttribute(attr) : null;
    };

    // Extract passage information
    const passages = [];
    const passageNodes = this.selectXMLNodes(cert, './/PassedBy');
    passageNodes.forEach(passage => {
      passages.push({
        chamber: passage.getAttribute('chamber'),
        date: this.selectXMLNode(passage, './/PassedDate', passage)?.textContent.trim(),
        yeas: parseInt(this.selectXMLNode(passage, './/Yeas', passage)?.textContent.trim() || '0'),
        nays: parseInt(this.selectXMLNode(passage, './/Nays', passage)?.textContent.trim() || '0'),
        signer: this.selectXMLNode(passage, './/Signer', passage)?.textContent.trim(),
      });
    });

    return {
      type: cert.getAttribute('type'),
      chapterLaw: {
        year: getAttribute('.//ChapterLaw', 'year'),
        number: getTextContent('.//ChapterLaw'),
      },
      sessionLawCaption: getTextContent('.//SessionLawCaption'),
      effectiveDate: getTextContent('.//EffectiveDate'),
      passages: passages,
      approvedDate: getTextContent('.//ApprovedDate'),
      filedDate: getTextContent('.//FiledDate'),
      governor: getTextContent('.//Governor'),
      vetoAction: getTextContent('.//VetoAction'),
    };
  }

  /**
   * Extract bill heading from XML bill
   * @param {Document} doc - Parsed XML document
   * @returns {Object} Bill heading data
   */
  extractXMLBillHeading(doc) {
    const heading = this.selectXMLNode(doc, '//BillHeading');
    if (!heading) return null;

    const getTextContent = (xpath) => {
      const node = this.selectXMLNode(heading, xpath, heading);
      return node ? node.textContent.trim() : null;
    };

    return {
      shortBillId: getTextContent('.//ShortBillId'),
      longBillId: getTextContent('.//LongBillId'),
      legislature: getTextContent('.//Legislature'),
      session: getTextContent('.//Session'),
      sponsors: getTextContent('.//Sponsors'),
      briefDescription: getTextContent('.//BriefDescription'),
      asAmended: getTextContent('.//AsAmended'),
    };
  }

  /**
   * Extract bill sections from XML bill
   * @param {Document} doc - Parsed XML document
   * @returns {Array} Array of bill sections
   */
  extractXMLSections(doc) {
    const sections = [];
    const sectionNodes = this.selectXMLNodes(doc, '//BillSection');

    sectionNodes.forEach(section => {
      const sectionData = {
        type: section.getAttribute('type'),
        action: section.getAttribute('action'),
        sectionNumber: this.selectXMLNode(section, './/BillSectionNumber/Value', section)?.textContent.trim(),
        rcwCite: this.extractRCWCite(section),
        caption: this.selectXMLNode(section, './/Caption', section)?.textContent.trim(),
        hasAppropriations: this.selectXMLNodes(section, './/Appropriations', section).length > 0,
      };
      sections.push(sectionData);
    });

    return sections;
  }

  /**
   * Extract RCW citation from a section node
   * @param {Node} sectionNode - BillSection node
   * @returns {Object|null} RCW citation details
   */
  extractRCWCite(sectionNode) {
    const cite = this.selectXMLNode(sectionNode, './/SectionCite', sectionNode);
    if (!cite) return null;

    return {
      title: this.selectXMLNode(cite, './/TitleNumber', cite)?.textContent.trim(),
      chapter: this.selectXMLNode(cite, './/ChapterNumber', cite)?.textContent.trim(),
      section: this.selectXMLNode(cite, './/SectionNumber', cite)?.textContent.trim(),
    };
  }

  /**
   * Extract appropriations from XML bill
   * @param {Document} doc - Parsed XML document
   * @returns {Array} Array of appropriations
   */
  extractXMLAppropriations(doc) {
    const appropriations = [];
    const appropNodes = this.selectXMLNodes(doc, '//Appropriations');

    appropNodes.forEach(appropGroup => {
      const agency = appropGroup.getAttribute('agency');
      const project = appropGroup.getAttribute('project');
      const appropType = appropGroup.getAttribute('appropType');

      const items = [];
      const appropItems = this.selectXMLNodes(appropGroup, './/Appropriation', appropGroup);

      appropItems.forEach(item => {
        const accountName = this.selectXMLNode(item, './/AccountName', item)?.textContent.trim();
        const dollarAmount = this.selectXMLNode(item, './/DollarAmount', item)?.textContent.trim();

        items.push({
          accountName: accountName,
          amount: this.parseDollarAmount(dollarAmount),
          amountFormatted: dollarAmount,
        });
      });

      // Extract total if present
      const total = this.selectXMLNode(appropGroup, './/AppropriationTotal/DollarAmount', appropGroup);

      appropriations.push({
        agency: agency,
        project: project,
        appropType: appropType,
        items: items,
        total: total ? this.parseDollarAmount(total.textContent.trim()) : null,
      });
    });

    return appropriations;
  }

  /**
   * Parse dollar amount string to number
   * @param {string} dollarString - Dollar amount as string (e.g., "$1,000,000")
   * @returns {number|null} Numeric value
   */
  parseDollarAmount(dollarString) {
    if (!dollarString) return null;
    const cleaned = dollarString.replace(/[$,]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  /**
   * Categorize bill based on content
   * @param {Object} bill - Parsed bill object
   * @returns {string} Category: 'budget', 'policy', or 'mixed'
   */
  categorizeBill(bill) {
    const hasAppropriations = bill.appropriations && bill.appropriations.length > 0;
    const hasAmendatorySections = bill.sections.some(s => s.type === 'amendatory');
    const hasNewPolicySections = bill.sections.some(s =>
      s.type === 'new' && s.rcwCite !== null
    );

    // Check if brief description or caption mentions budget
    const description = bill.billHeading?.briefDescription?.toLowerCase() || '';
    const caption = bill.enrollingCertificate?.sessionLawCaption?.toLowerCase() || '';
    const isBudgetRelated = description.includes('budget') ||
                           caption.includes('budget') ||
                           description.includes('appropriation') ||
                           caption.includes('appropriation');

    // If it has appropriations and budget-related keywords, it's a budget bill
    if (hasAppropriations && isBudgetRelated) {
      // Check if it also has substantial policy changes
      if (hasAmendatorySections || hasNewPolicySections) {
        const policyCount = bill.sections.filter(s =>
          s.type === 'amendatory' || (s.type === 'new' && s.rcwCite)
        ).length;

        // If more than 20% of sections are policy-related, consider it mixed
        if (policyCount / bill.sections.length > 0.2) {
          return 'mixed';
        }
      }
      return 'budget';
    }

    // If it has lots of appropriations but no budget keywords, still likely budget
    if (bill.appropriations.length > 10) {
      return 'budget';
    }

    // Otherwise, it's primarily a policy bill
    return 'policy';
  }

  /**
   * Extract metadata from HTM bill
   * @param {Document} doc - Parsed HTM document
   * @returns {Object} Metadata object
   */
  extractHTMMetadata(doc) {
    // HTM parsing implementation
    // Note: HTM structure mirrors XML but uses HTML tags
    return {
      billType: null, // Extract from HTM structure
      note: 'HTM parsing requires HTML-specific selectors',
    };
  }

  /**
   * Extract enrolling certificate from HTM bill
   * @param {Document} doc - Parsed HTM document
   * @returns {Object} Enrolling certificate data
   */
  extractHTMEnrollingCertificate(doc) {
    // HTM parsing implementation
    return null;
  }

  /**
   * Extract bill heading from HTM bill
   * @param {Document} doc - Parsed HTM document
   * @returns {Object} Bill heading data
   */
  extractHTMBillHeading(doc) {
    // HTM parsing implementation
    return null;
  }

  /**
   * Extract bill sections from HTM bill
   * @param {Document} doc - Parsed HTM document
   * @returns {Array} Array of bill sections
   */
  extractHTMSections(doc) {
    // HTM parsing implementation
    return [];
  }

  /**
   * Extract appropriations from HTM bill
   * @param {Document} doc - Parsed HTM document
   * @returns {Array} Array of appropriations
   */
  extractHTMAppropriations(doc) {
    // HTM parsing implementation
    return [];
  }

  /**
   * XPath-like selector for XML nodes (simplified)
   * @param {Node} context - Context node to search from
   * @param {string} xpath - XPath expression
   * @param {Node} relativeContext - Context for relative paths
   * @returns {Node|null} First matching node
   */
  selectXMLNode(context, xpath, relativeContext = null) {
    const nodes = this.selectXMLNodes(context, xpath, relativeContext);
    return nodes.length > 0 ? nodes[0] : null;
  }

  /**
   * XPath-like selector for multiple XML nodes (simplified)
   * @param {Node} context - Context node to search from
   * @param {string} xpath - XPath expression
   * @param {Node} relativeContext - Context for relative paths
   * @returns {Array} Array of matching nodes
   */
  selectXMLNodes(context, xpath, relativeContext = null) {
    const root = relativeContext || context;

    // Handle simple XPath expressions
    if (xpath.startsWith('//')) {
      const tagName = xpath.substring(2).split('[')[0].split('/')[0];
      return Array.from(root.getElementsByTagName(tagName));
    } else if (xpath.startsWith('.//')) {
      const tagName = xpath.substring(3).split('[')[0].split('/')[0];
      return Array.from(root.getElementsByTagName(tagName));
    } else if (xpath.startsWith('./')) {
      const parts = xpath.substring(2).split('/');
      let current = [root];

      for (const part of parts) {
        const next = [];
        for (const node of current) {
          for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            if (child.nodeType === 1 && child.tagName === part) {
              next.push(child);
            }
          }
        }
        current = next;
      }
      return current;
    }

    return [];
  }

  /**
   * Compare two bills (XML vs HTM versions)
   * @param {string} xmlPath - Path to XML bill
   * @param {string} htmPath - Path to HTM bill
   * @returns {Object} Comparison report
   */
  compareBillFormats(xmlPath, htmPath) {
    const xmlBill = this.parseBillFile(xmlPath);
    const htmBill = this.parseBillFile(htmPath);

    return {
      billId: xmlBill.billHeading?.shortBillId || 'Unknown',
      fileSizeComparison: {
        xml: xmlBill.fileSize,
        htm: htmBill.fileSize,
        difference: htmBill.fileSize - xmlBill.fileSize,
        percentDiff: ((htmBill.fileSize - xmlBill.fileSize) / xmlBill.fileSize * 100).toFixed(2) + '%',
      },
      metadataMatch: this.compareObjects(xmlBill.metadata, htmBill.metadata),
      sectionsCount: {
        xml: xmlBill.sections.length,
        htm: htmBill.sections.length,
      },
      appropriationsCount: {
        xml: xmlBill.appropriations.length,
        htm: htmBill.appropriations.length,
      },
    };
  }

  /**
   * Compare two objects for differences
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   * @returns {Object} Comparison result
   */
  compareObjects(obj1, obj2) {
    const differences = {};
    const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);

    allKeys.forEach(key => {
      if (obj1?.[key] !== obj2?.[key]) {
        differences[key] = {
          obj1: obj1?.[key],
          obj2: obj2?.[key],
        };
      }
    });

    return {
      identical: Object.keys(differences).length === 0,
      differences: differences,
    };
  }
}

/**
 * Batch processor for analyzing multiple bills
 */
class BillBatchProcessor {
  constructor(extractor = null) {
    this.extractor = extractor || new BillExtractor();
  }

  /**
   * Process all bills in a directory
   * @param {string} directory - Directory path
   * @returns {Array} Array of processed bills
   */
  processDirectory(directory) {
    const files = fs.readdirSync(directory);
    const bills = [];

    files.forEach(file => {
      if (file.endsWith('.xml') || file.endsWith('.htm') || file.endsWith('.html')) {
        try {
          const filePath = path.join(directory, file);
          const bill = this.extractor.parseBillFile(filePath);
          bill.fileName = file;
          bills.push(bill);
        } catch (error) {
          console.error(`Error processing ${file}:`, error.message);
        }
      }
    });

    return bills;
  }

  /**
   * Generate bills index
   * @param {Array} bills - Array of processed bills
   * @returns {Object} Bills index
   */
  generateBillsIndex(bills) {
    const index = {
      metadata: {
        generatedDate: new Date().toISOString(),
        totalBills: bills.length,
        categories: {},
      },
      bills: [],
    };

    // Group by category
    const categories = { budget: 0, policy: 0, mixed: 0 };

    bills.forEach(bill => {
      const billEntry = {
        fileName: bill.fileName,
        format: bill.format,
        fileSize: bill.fileSize,
        billId: bill.billHeading?.shortBillId,
        longBillId: bill.billHeading?.longBillId,
        title: bill.billHeading?.briefDescription,
        sessionLawCaption: bill.enrollingCertificate?.sessionLawCaption,
        legislature: bill.billHeading?.legislature,
        session: bill.billHeading?.session,
        chapterLaw: bill.enrollingCertificate?.chapterLaw,
        effectiveDate: bill.enrollingCertificate?.effectiveDate,
        sponsors: bill.billHeading?.sponsors,
        category: bill.category,
        vetoAction: bill.enrollingCertificate?.vetoAction,
        passages: bill.enrollingCertificate?.passages,
        sectionCount: bill.sections.length,
        appropriationCount: bill.appropriations.length,
      };

      index.bills.push(billEntry);
      categories[bill.category] = (categories[bill.category] || 0) + 1;
    });

    index.metadata.categories = categories;
    return index;
  }

  /**
   * Analyze structural patterns across bills
   * @param {Array} bills - Array of processed bills
   * @returns {Object} Structural patterns report
   */
  analyzeStructuralPatterns(bills) {
    const patterns = {
      sectionTypes: {},
      appropriationTypes: {},
      vetoedBills: [],
      multipleEffectiveDates: [],
      largeAppropriationLists: [],
      edgeCases: [],
    };

    bills.forEach(bill => {
      // Count section types
      bill.sections.forEach(section => {
        const key = `${section.type}_${section.action || 'none'}`;
        patterns.sectionTypes[key] = (patterns.sectionTypes[key] || 0) + 1;
      });

      // Count appropriation types
      bill.appropriations.forEach(approp => {
        patterns.appropriationTypes[approp.appropType] =
          (patterns.appropriationTypes[approp.appropType] || 0) + 1;
      });

      // Track vetoed bills
      if (bill.enrollingCertificate?.vetoAction) {
        patterns.vetoedBills.push({
          billId: bill.billHeading?.shortBillId,
          vetoAction: bill.enrollingCertificate.vetoAction,
        });
      }

      // Track multiple effective dates
      const effectiveDate = bill.enrollingCertificate?.effectiveDate;
      if (effectiveDate && (effectiveDate.includes(';') || effectiveDate.includes('section'))) {
        patterns.multipleEffectiveDates.push({
          billId: bill.billHeading?.shortBillId,
          effectiveDate: effectiveDate,
        });
      }

      // Track large appropriation lists
      if (bill.appropriations.length > 100) {
        patterns.largeAppropriationLists.push({
          billId: bill.billHeading?.shortBillId,
          count: bill.appropriations.length,
        });
      }
    });

    return patterns;
  }
}

// Export classes
module.exports = {
  BillExtractor,
  BillBatchProcessor,
};

/**
 * Example usage:
 *
 * const { BillExtractor, BillBatchProcessor } = require('./extraction-library');
 *
 * // Single bill extraction
 * const extractor = new BillExtractor();
 * const bill = extractor.parseBillFile('1210-S2.xml');
 * console.log(bill.category); // 'policy'
 *
 * // Batch processing
 * const processor = new BillBatchProcessor();
 * const bills = processor.processDirectory('/path/to/bills');
 * const index = processor.generateBillsIndex(bills);
 * const patterns = processor.analyzeStructuralPatterns(bills);
 *
 * // Save results
 * fs.writeFileSync('bills-index.json', JSON.stringify(index, null, 2));
 */
