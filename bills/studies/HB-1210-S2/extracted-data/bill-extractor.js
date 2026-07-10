/**
 * WA Bills Extraction Library
 * Extracts structured data from Washington State legislative bills
 * Supports both XML and HTM formats
 */

// For Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  var fs = require('fs');
}

const BillExtractor = {
  /**
   * Parse XML bill format
   * @param {string} xmlContent - Raw XML content
   * @returns {object} Parsed bill data
   */
  parseXML: function(xmlContent) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

    const bill = {
      format: 'xml',
      metadata: this.extractMetadata(xmlDoc),
      enrollingInfo: this.extractEnrollingInfo(xmlDoc),
      sections: this.extractSections(xmlDoc),
      statutoryReferences: this.extractStatutoryReferences(xmlDoc),
      effectiveDates: this.extractEffectiveDates(xmlDoc),
      fiscalInfo: this.extractFiscalInfo(xmlDoc),
      agencies: this.extractAgencies(xmlDoc)
    };

    return bill;
  },

  /**
   * Parse HTM bill format
   * @param {string} htmlContent - Raw HTML content
   * @returns {object} Parsed bill data
   */
  parseHTML: function(htmlContent) {
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(htmlContent, 'text/html');

    const bill = {
      format: 'html',
      metadata: this.extractMetadataFromHTML(htmlDoc),
      enrollingInfo: this.extractEnrollingInfoFromHTML(htmlDoc),
      sections: this.extractSectionsFromHTML(htmlDoc),
      statutoryReferences: this.extractStatutoryReferencesFromHTML(htmlDoc),
      effectiveDates: this.extractEffectiveDatesFromHTML(htmlDoc),
      fiscalInfo: this.extractFiscalInfoFromHTML(htmlDoc),
      agencies: this.extractAgenciesFromHTML(htmlDoc)
    };

    return bill;
  },

  /**
   * Extract bill metadata
   */
  extractMetadata: function(xmlDoc) {
    const billHeading = xmlDoc.querySelector('BillHeading');
    if (!billHeading) return {};

    return {
      shortId: this.getTextContent(billHeading, 'ShortBillId'),
      longId: this.getTextContent(billHeading, 'LongBillId'),
      legislature: this.getTextContent(billHeading, 'Legislature'),
      session: this.getTextContent(billHeading, 'Session'),
      sponsors: this.getTextContent(billHeading, 'Sponsors'),
      briefDescription: this.getTextContent(billHeading, 'BriefDescription'),
      billTitle: this.getTextContent(xmlDoc, 'BillTitle')
    };
  },

  /**
   * Extract enrolling certificate information
   */
  extractEnrollingInfo: function(xmlDoc) {
    const cert = xmlDoc.querySelector('EnrollingCertificate');
    if (!cert) return {};

    const housePassage = cert.querySelector('PassedBy[chamber="h"]');
    const senatePassage = cert.querySelector('PassedBy[chamber="s"]');

    return {
      chapterLaw: this.getTextContent(cert, 'ChapterLaw'),
      sessionLawCaption: this.getTextContent(cert, 'SessionLawCaption'),
      house: housePassage ? {
        passedDate: this.getTextContent(housePassage, 'PassedDate'),
        yeas: this.getTextContent(housePassage, 'Yeas'),
        nays: this.getTextContent(housePassage, 'Nays'),
        signer: this.getTextContent(housePassage, 'Signer')
      } : null,
      senate: senatePassage ? {
        passedDate: this.getTextContent(senatePassage, 'PassedDate'),
        yeas: this.getTextContent(senatePassage, 'Yeas'),
        nays: this.getTextContent(senatePassage, 'Nays'),
        signer: this.getTextContent(senatePassage, 'Signer')
      } : null,
      approvedDate: this.getTextContent(cert, 'ApprovedDate'),
      filedDate: this.getTextContent(cert, 'FiledDate'),
      governor: this.getTextContent(cert, 'Governor')
    };
  },

  /**
   * Extract all bill sections
   */
  extractSections: function(xmlDoc) {
    const sections = [];
    const billSections = xmlDoc.querySelectorAll('BillSection');

    billSections.forEach((section, index) => {
      const header = section.querySelector('BillSectionHeader');
      const sectionNum = header ? this.getTextContent(header, 'Value') : (index + 1).toString();

      const sectionData = {
        number: sectionNum,
        type: section.getAttribute('type'),
        action: section.getAttribute('action'),
        rcw: this.extractRCWFromSection(section),
        caption: this.getTextContent(header, 'Caption'),
        content: this.getSectionContent(section),
        amendments: this.extractAmendments(section)
      };

      sections.push(sectionData);
    });

    return sections;
  },

  /**
   * Extract RCW citation from section
   */
  extractRCWFromSection: function(section) {
    const cite = section.querySelector('SectionCite');
    if (!cite) return null;

    return {
      title: this.getTextContent(cite, 'TitleNumber'),
      chapter: this.getTextContent(cite, 'ChapterNumber'),
      section: this.getTextContent(cite, 'SectionNumber'),
      full: [
        this.getTextContent(cite, 'TitleNumber'),
        this.getTextContent(cite, 'ChapterNumber'),
        this.getTextContent(cite, 'SectionNumber')
      ].filter(Boolean).join('.')
    };
  },

  /**
   * Extract all statutory references from bill
   */
  extractStatutoryReferences: function(xmlDoc) {
    const references = new Set();
    const billTitle = xmlDoc.querySelector('BillTitle');

    if (billTitle) {
      const titleText = billTitle.textContent;
      const rcwMatches = titleText.matchAll(/RCW\s+([\d.A-Z]+)/g);
      for (const match of rcwMatches) {
        references.add(match[1]);
      }
    }

    // Also extract from section citations
    const sectionCites = xmlDoc.querySelectorAll('SectionCite');
    sectionCites.forEach(cite => {
      const title = this.getTextContent(cite, 'TitleNumber');
      const chapter = this.getTextContent(cite, 'ChapterNumber');
      const section = this.getTextContent(cite, 'SectionNumber');

      if (title && chapter && section) {
        references.add(`${title}.${chapter}.${section}`);
      }
    });

    return Array.from(references).sort();
  },

  /**
   * Extract effective dates
   */
  extractEffectiveDates: function(xmlDoc) {
    const dates = [];
    const effectiveDate = xmlDoc.querySelector('EffectiveDate');

    if (effectiveDate) {
      const text = effectiveDate.textContent;
      dates.push({
        type: 'primary',
        date: text,
        sections: 'all'
      });

      // Parse specific section effective dates
      const sectionMatches = text.matchAll(/section[s]?\s+([\d,\s]+),\s+which\s+take[s]?\s+effect\s+([^;.]+)/gi);
      for (const match of sectionMatches) {
        const sections = match[1].split(/[,\s]+/).filter(Boolean);
        const date = match[2].trim();
        dates.push({
          type: 'specific',
          date: date,
          sections: sections
        });
      }
    }

    return dates;
  },

  /**
   * Extract fiscal impact information
   */
  extractFiscalInfo: function(xmlDoc) {
    // This bill is terminology replacement, so no fiscal impacts
    // For budget bills, this would extract appropriations, fund transfers, etc.
    const fiscal = {
      hasFiscalImpact: false,
      appropriations: [],
      fundTransfers: [],
      fiscalNotes: []
    };

    // Check for fiscal note references
    const billText = xmlDoc.textContent;
    if (billText.includes('appropriation') || billText.includes('fiscal note')) {
      fiscal.hasFiscalImpact = true;
    }

    return fiscal;
  },

  /**
   * Extract agencies mentioned in bill
   */
  extractAgencies: function(xmlDoc) {
    const agencies = new Set();
    const text = xmlDoc.textContent;

    // Common WA state agencies
    const agencyPatterns = [
      /department of (\w+(?:\s+\w+)?)/gi,
      /liquor (?:and|&amp;) cannabis board/gi,
      /washington state patrol/gi,
      /office of (\w+(?:\s+\w+)?)/gi,
      /commission on (\w+(?:\s+\w+)?)/gi,
      /utilities and transportation commission/gi
    ];

    agencyPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        agencies.add(match[0]);
      }
    });

    return Array.from(agencies).sort();
  },

  /**
   * Extract amendments (strike/add content)
   */
  extractAmendments: function(section) {
    const amendments = {
      strikes: [],
      additions: []
    };

    const strikes = section.querySelectorAll('TextRun[amendingStyle="strike"]');
    strikes.forEach(strike => {
      const text = strike.textContent.trim();
      if (text) amendments.strikes.push(text);
    });

    const additions = section.querySelectorAll('TextRun[amendingStyle="add"]');
    additions.forEach(add => {
      const text = add.textContent.trim();
      if (text) amendments.additions.push(text);
    });

    return amendments;
  },

  /**
   * Get section content as plain text
   */
  getSectionContent: function(section) {
    const paragraphs = section.querySelectorAll('P');
    return Array.from(paragraphs).map(p => p.textContent.trim()).filter(Boolean);
  },

  /**
   * HTML extraction methods
   */
  extractMetadataFromHTML: function(htmlDoc) {
    const text = htmlDoc.body.textContent;

    return {
      shortId: this.extractPattern(text, /(\d+[A-Z]*\s+(?:SUBSTITUTE\s+)?HOUSE BILL\s+\d+)/i),
      session: this.extractPattern(text, /(\d{4}\s+(?:REGULAR|SPECIAL)\s+SESSION)/i),
      legislature: this.extractPattern(text, /(\d+(?:st|nd|rd|th)\s+LEGISLATURE)/i),
      briefDescription: this.extractPattern(text, /RELATING TO ([^.]+)/i),
      sponsors: this.extractPattern(text, /By\s+(.+?)(?=READ FIRST TIME)/s)
    };
  },

  extractEnrollingInfoFromHTML: function(htmlDoc) {
    const text = htmlDoc.body.textContent;

    return {
      chapterLaw: this.extractPattern(text, /Chapter\s+(\d+),\s+Laws\s+of\s+(\d{4})/i),
      sessionLawCaption: this.extractPattern(text, /Chapter \d+[^\n]+\n+([^\n]+)/i),
      house: {
        passedDate: this.extractPattern(text, /Passed by the House\s+([^\n]+)/i),
        yeas: this.extractPattern(text, /Yeas\s+(\d+)/i),
        nays: this.extractPattern(text, /Nays\s+(\d+)/i)
      }
    };
  },

  extractSectionsFromHTML: function(htmlDoc) {
    // HTML format has sections in a more linearized format
    // Would need more sophisticated parsing
    return [];
  },

  extractStatutoryReferencesFromHTML: function(htmlDoc) {
    const text = htmlDoc.body.textContent;
    const references = new Set();

    const rcwMatches = text.matchAll(/RCW\s+([\d.A-Z]+)/g);
    for (const match of rcwMatches) {
      references.add(match[1]);
    }

    return Array.from(references).sort();
  },

  extractEffectiveDatesFromHTML: function(htmlDoc) {
    const text = htmlDoc.body.textContent;
    const effectiveDateMatch = text.match(/EFFECTIVE DATE:\s*([^—]+(?:—[^.]+)?\.)/i);

    if (effectiveDateMatch) {
      return [{
        type: 'primary',
        date: effectiveDateMatch[1].trim()
      }];
    }

    return [];
  },

  extractFiscalInfoFromHTML: function(htmlDoc) {
    return {
      hasFiscalImpact: false,
      appropriations: [],
      fundTransfers: [],
      fiscalNotes: []
    };
  },

  extractAgenciesFromHTML: function(htmlDoc) {
    return this.extractAgencies({ textContent: htmlDoc.body.textContent });
  },

  /**
   * Utility functions
   */
  getTextContent: function(parent, selector) {
    const element = parent.querySelector ? parent.querySelector(selector) : null;
    return element ? element.textContent.trim() : '';
  },

  extractPattern: function(text, pattern) {
    const match = text.match(pattern);
    return match ? match[1].trim() : '';
  }
};

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BillExtractor;
}

// Export for browser
if (typeof window !== 'undefined') {
  window.BillExtractor = BillExtractor;
}
