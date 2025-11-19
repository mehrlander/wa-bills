/**
 * Washington State Budget Bill Extractor
 *
 * A comprehensive JavaScript library for extracting structured data from
 * Washington State budget bills in HTM format.
 *
 * Supports extraction of:
 * - Bill metadata (number, title, session, chapter, etc.)
 * - Sections with agency names and appropriations
 * - Fund types and fiscal year allocations
 * - Provisos (conditions and limitations)
 * - Statutory references (RCW citations)
 * - Bill references
 * - Veto information
 */

class BillExtractor {
  constructor(htmlContent) {
    this.html = htmlContent;
    this.parser = new DOMParser();
    this.doc = this.parser.parseFromString(htmlContent, 'text/html');
  }

  /**
   * Extract all data from the bill
   * @returns {Object} Complete structured bill data
   */
  extractAll() {
    return {
      metadata: this.extractMetadata(),
      parts: this.extractParts(),
      sections: this.extractSections(),
      appropriationsSummary: this.generateAppropriationsSummary(),
      rcwReferences: this.extractRCWReferences(),
      billReferences: this.extractBillReferences(),
      vetoInformation: this.extractVetoInformation(),
      fiscalImpact: this.calculateFiscalImpact()
    };
  }

  /**
   * Extract bill metadata
   * @returns {Object} Bill metadata
   */
  extractMetadata() {
    const text = this.doc.body.textContent;
    const html = this.html;

    const billNumberMatch = html.match(/(?:ENGROSSED )?(?:SUBSTITUTE )?(?:HOUSE|SENATE) BILL (\d+(?:-S)?)/i);
    const chapterMatch = text.match(/Chapter (\d+), Laws of (\d{4})/);
    const sessionMatch = text.match(/(\d+)(?:ST|ND|RD|TH) LEGISLATURE/);
    const yearMatch = text.match(/(\d{4}) (?:REGULAR|SPECIAL) SESSION/);
    const effectiveDateMatch = html.match(/EFFECTIVE DATE:.*?(\w+ \d+, \d{4})/);
    const titleMatch = html.match(/style="text-align:center;">([A-Z ]+)<\/div>\s*<div style="text-align:center;margin-top:3em;margin-bottom:5em/);
    const vetoMatch = html.match(/\(partial veto\)/i);

    // Extract sponsors
    const sponsorsMatch = html.match(/<!-- field: Sponsors -->(.*?)<!-- field: -->/);
    let sponsors = '';
    if (sponsorsMatch) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = sponsorsMatch[1];
      sponsors = tempDiv.textContent.trim();
    }

    // Extract caption
    const captionMatch = html.match(/<!-- field: CaptionsTitles -->(.*?)<!-- field: -->/s);
    let caption = '';
    if (captionMatch) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = captionMatch[1];
      caption = tempDiv.textContent.trim();
    }

    return {
      billNumber: billNumberMatch ? billNumberMatch[0] : null,
      billType: this.determineBillType(),
      chamber: this.html.includes('SENATE BILL') ? 'Senate' : 'House',
      chapter: chapterMatch ? {
        number: chapterMatch[1],
        year: chapterMatch[2]
      } : null,
      session: sessionMatch ? sessionMatch[1] + sessionMatch[0].match(/(ST|ND|RD|TH)/)[0] : null,
      sessionYear: yearMatch ? yearMatch[1] : null,
      effectiveDate: effectiveDateMatch ? effectiveDateMatch[1] : null,
      title: titleMatch ? titleMatch[1].trim() : null,
      sponsors: sponsors,
      caption: caption,
      hasPartialVeto: !!vetoMatch
    };
  }

  /**
   * Determine the bill type based on content analysis
   * @returns {string} Bill type
   */
  determineBillType() {
    const html = this.html.toLowerCase();
    const text = this.doc.body.textContent.toLowerCase();

    if (text.includes('operating budget') || html.includes('operating budget')) {
      return 'Operating Budget';
    } else if (text.includes('capital budget')) {
      return 'Capital Budget';
    } else if (text.includes('transportation budget')) {
      return 'Transportation Budget';
    } else if (text.includes('supplemental')) {
      return 'Supplemental Budget';
    }
    return 'Budget Bill';
  }

  /**
   * Extract bill parts (major divisions)
   * @returns {Array} Array of parts with titles
   */
  extractParts() {
    const parts = [];
    const partRegex = /<div style="font-weight:bold;text-align:center;">PART ([IVX]+)<\/div>\s*<div style="font-weight:bold;text-align:center;">(.*?)<\/div>/g;

    let match;
    while ((match = partRegex.exec(this.html)) !== null) {
      parts.push({
        partNumber: match[1],
        title: match[2].trim()
      });
    }

    return parts;
  }

  /**
   * Extract all sections with appropriations
   * @returns {Array} Array of section objects
   */
  extractSections() {
    const sections = [];
    const sectionRegex = /<span style="font-weight:bold;padding-right:0\.1in;">Sec\. (\d+)\.\s*<\/span><span style="font-weight:bold;"><span>(.*?)<\/span><\/span><!-- field: --><\/div>(.*?)(?=<div style="margin-top:0\.25in;text-indent:0\.5in;"><!-- field: BeginningSection --|<div style="margin-top:0\.1in;font-weight:bold;text-align:center;">--- END ---|$))/gs;

    let match;
    while ((match = sectionRegex.exec(this.html)) !== null) {
      const sectionNumber = match[1];
      const agencyName = this.cleanText(match[2]);
      const content = match[3];

      sections.push({
        sectionNumber: parseInt(sectionNumber),
        agencyName: agencyName,
        appropriations: this.extractAppropriations(content),
        provisos: this.extractProvisos(content),
        totalAppropriation: this.extractTotalAppropriation(content),
        fte: this.extractFTE(content)
      });
    }

    return sections;
  }

  /**
   * Extract appropriations from section content
   * @param {string} content Section HTML content
   * @returns {Array} Array of appropriation objects
   */
  extractAppropriations(content) {
    const appropriations = [];
    const lines = content.split(/<\/tr>/);

    for (const line of lines) {
      if (!line.includes('Appropriation') || line.includes('TOTAL APPROPRIATION')) {
        continue;
      }

      const fundMatch = line.match(/<div>(.*?)<\/div>/);
      const amountMatch = line.match(/text-align:right;">\$([0-9,]+)<\/div>/);

      if (fundMatch && amountMatch) {
        const fundText = this.cleanText(fundMatch[1]);
        const amount = parseInt(amountMatch[1].replace(/,/g, ''));

        // Parse fund type and fiscal year
        const fiscalYearMatch = fundText.match(/\(FY (\d{4})\)/);
        const fundType = fundText.replace(/\(FY \d{4}\)/, '').trim().replace(/—/g, '-');

        appropriations.push({
          fundType: fundType,
          fiscalYear: fiscalYearMatch ? parseInt(fiscalYearMatch[1]) : null,
          amount: amount
        });
      }
    }

    return appropriations;
  }

  /**
   * Extract total appropriation for a section
   * @param {string} content Section HTML content
   * @returns {number|null} Total appropriation amount
   */
  extractTotalAppropriation(content) {
    const totalMatch = content.match(/TOTAL APPROPRIATION.*?text-align:right;">\$([0-9,]+)<\/div>/s);
    return totalMatch ? parseInt(totalMatch[1].replace(/,/g, '')) : null;
  }

  /**
   * Extract FTE information
   * @param {string} content Section HTML content
   * @returns {Object|null} FTE information
   */
  extractFTE(content) {
    const fteMatch = content.match(/FTE\s+(\d+\.\d+)/);
    return fteMatch ? parseFloat(fteMatch[1]) : null;
  }

  /**
   * Extract provisos (conditions and limitations)
   * @param {string} content Section HTML content
   * @returns {Array} Array of proviso objects
   */
  extractProvisos(content) {
    const provisos = [];

    // Match subsection provisos
    const provisoRegex = /<div style="text-indent:0\.5in;">\((\d+)\)(.*?)<\/div>/g;
    let match;

    while ((match = provisoRegex.exec(content)) !== null) {
      const subsection = match[1];
      const text = this.cleanText(match[2]);

      // Extract dollar amounts from proviso
      const amounts = [];
      const amountRegex = /\$([0-9,]+)/g;
      let amountMatch;
      while ((amountMatch = amountRegex.exec(text)) !== null) {
        amounts.push(parseInt(amountMatch[1].replace(/,/g, '')));
      }

      // Extract bill references
      const billRefs = this.extractBillReferencesFromText(text);

      // Determine if it's "provided solely"
      const isProvidedSolely = text.toLowerCase().includes('provided solely');

      provisos.push({
        subsection: parseInt(subsection),
        text: text,
        amounts: amounts,
        billReferences: billRefs,
        isProvidedSolely: isProvidedSolely
      });
    }

    return provisos;
  }

  /**
   * Extract RCW references
   * @returns {Array} Array of unique RCW citations
   */
  extractRCWReferences() {
    const rcwRefs = new Set();
    const rcwRegex = /href='http:\/\/app\.leg\.wa\.gov\/RCW\/default\.aspx\?cite=([\d.A-Z]+)'/g;

    let match;
    while ((match = rcwRegex.exec(this.html)) !== null) {
      rcwRefs.add(match[1]);
    }

    return Array.from(rcwRefs).sort();
  }

  /**
   * Extract bill references from entire document
   * @returns {Array} Array of unique bill references
   */
  extractBillReferences() {
    const billRefs = new Set();
    const text = this.doc.body.textContent;

    // Pattern: House Bill No. 1234, Senate Bill No. 5678, etc.
    const patterns = [
      /(?:Engrossed )?(?:Substitute )?(?:Second Substitute )?House Bill No\. (\d+)/gi,
      /(?:Engrossed )?(?:Substitute )?(?:Second Substitute )?Senate Bill No\. (\d+)/gi,
      /\bHB (\d+)\b/g,
      /\bSB (\d+)\b/g,
      /\bESSB (\d+)\b/g,
      /\bEHB (\d+)\b/g
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        billRefs.add(match[0]);
      }
    });

    return Array.from(billRefs).sort();
  }

  /**
   * Extract bill references from text
   * @param {string} text Text to search
   * @returns {Array} Array of bill references found in text
   */
  extractBillReferencesFromText(text) {
    const billRefs = [];
    const patterns = [
      /(?:Engrossed )?(?:Substitute )?(?:Second Substitute )?House Bill No\. (\d+)/gi,
      /(?:Engrossed )?(?:Substitute )?(?:Second Substitute )?Senate Bill No\. (\d+)/gi
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        billRefs.push(match[0]);
      }
    });

    return billRefs;
  }

  /**
   * Extract veto information
   * @returns {Object|null} Veto information
   */
  extractVetoInformation() {
    if (!this.html.includes('partial veto')) {
      return null;
    }

    const vetoedSections = [];
    const vetoRegex = /Section (\d+(?:\(\d+\))?)[^<]*?(?:vetoed|I have vetoed)/gi;

    let match;
    while ((match = vetoRegex.exec(this.html)) !== null) {
      vetoedSections.push(match[1]);
    }

    // Extract veto message
    const vetoMessageMatch = this.html.match(/<div style="text-indent:0pt;margin-top:4\.5pt;"><span style="font-weight:bold;">.*?VETO MESSAGE.*?<\/span><\/div>(.*?)<div style="margin-top:0\.1in;font-weight:bold;text-align:center;">--- END ---<\/div>/s);

    return {
      hasVeto: true,
      vetoedSections: [...new Set(vetoedSections)],
      vetoMessage: vetoMessageMatch ? this.cleanText(vetoMessageMatch[1]) : null
    };
  }

  /**
   * Generate appropriations summary
   * @returns {Object} Summary of appropriations by fund type and fiscal year
   */
  generateAppropriationsSummary() {
    const sections = this.extractSections();
    const summary = {
      totalAppropriations: 0,
      byFundType: {},
      byFiscalYear: {},
      byAgency: []
    };

    sections.forEach(section => {
      if (section.totalAppropriation) {
        summary.totalAppropriations += section.totalAppropriation;
      }

      section.appropriations.forEach(app => {
        // By fund type
        if (!summary.byFundType[app.fundType]) {
          summary.byFundType[app.fundType] = 0;
        }
        summary.byFundType[app.fundType] += app.amount;

        // By fiscal year
        if (app.fiscalYear) {
          if (!summary.byFiscalYear[app.fiscalYear]) {
            summary.byFiscalYear[app.fiscalYear] = 0;
          }
          summary.byFiscalYear[app.fiscalYear] += app.amount;
        }
      });

      // By agency
      if (section.totalAppropriation) {
        summary.byAgency.push({
          sectionNumber: section.sectionNumber,
          agencyName: section.agencyName,
          totalAppropriation: section.totalAppropriation
        });
      }
    });

    // Sort agencies by appropriation amount (descending)
    summary.byAgency.sort((a, b) => b.totalAppropriation - a.totalAppropriation);

    return summary;
  }

  /**
   * Calculate fiscal impact
   * @returns {Object} Fiscal impact analysis
   */
  calculateFiscalImpact() {
    const sections = this.extractSections();
    const impact = {
      totalBienniumBudget: 0,
      fiscalYear2022: 0,
      fiscalYear2023: 0,
      generalFundState: 0,
      generalFundFederal: 0,
      otherFunds: 0,
      agencyCount: sections.length
    };

    sections.forEach(section => {
      section.appropriations.forEach(app => {
        if (app.fiscalYear === 2022) {
          impact.fiscalYear2022 += app.amount;
        } else if (app.fiscalYear === 2023) {
          impact.fiscalYear2023 += app.amount;
        }

        if (app.fundType.includes('General Fund-State')) {
          impact.generalFundState += app.amount;
        } else if (app.fundType.includes('General Fund-Federal')) {
          impact.generalFundFederal += app.amount;
        } else {
          impact.otherFunds += app.amount;
        }
      });
    });

    impact.totalBienniumBudget = impact.fiscalYear2022 + impact.fiscalYear2023;

    return impact;
  }

  /**
   * Clean text by removing HTML tags and extra whitespace
   * @param {string} text Text to clean
   * @returns {string} Cleaned text
   */
  cleanText(text) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    return tempDiv.textContent.replace(/\s+/g, ' ').trim();
  }
}

// Utility functions for working with extracted data

/**
 * Search sections by agency name
 * @param {Array} sections Array of section objects
 * @param {string} query Search query
 * @returns {Array} Matching sections
 */
function searchByAgency(sections, query) {
  const lowerQuery = query.toLowerCase();
  return sections.filter(s =>
    s.agencyName.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Search sections by fund type
 * @param {Array} sections Array of section objects
 * @param {string} fundType Fund type to search for
 * @returns {Array} Matching sections
 */
function searchByFundType(sections, fundType) {
  return sections.filter(s =>
    s.appropriations.some(a =>
      a.fundType.toLowerCase().includes(fundType.toLowerCase())
    )
  );
}

/**
 * Find sections with provisos containing specific text
 * @param {Array} sections Array of section objects
 * @param {string} query Search query
 * @returns {Array} Matching sections
 */
function searchProvisos(sections, query) {
  const lowerQuery = query.toLowerCase();
  return sections.filter(s =>
    s.provisos.some(p =>
      p.text.toLowerCase().includes(lowerQuery)
    )
  );
}

/**
 * Get top N agencies by appropriation
 * @param {Array} sections Array of section objects
 * @param {number} n Number of top agencies to return
 * @returns {Array} Top N agencies
 */
function getTopAgencies(sections, n = 10) {
  return sections
    .filter(s => s.totalAppropriation)
    .sort((a, b) => b.totalAppropriation - a.totalAppropriation)
    .slice(0, n)
    .map(s => ({
      agency: s.agencyName,
      amount: s.totalAppropriation,
      section: s.sectionNumber
    }));
}

/**
 * Format currency
 * @param {number} amount Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BillExtractor,
    searchByAgency,
    searchByFundType,
    searchProvisos,
    getTopAgencies,
    formatCurrency
  };
}
