/**
 * Washington State Bill Data Extractor
 *
 * Comprehensive extraction library for parsing Washington State legislative bills
 * in both XML and HTML formats. Supports budget bills, appropriations, and statutory references.
 *
 * @module bill-extractor
 */

const fs = require('fs');

/**
 * Main BillExtractor class
 */
class BillExtractor {
  constructor(content, format = 'xml') {
    this.content = content;
    this.format = format.toLowerCase();
  }

  /**
   * Extract all data from the bill
   */
  extractAll() {
    return {
      metadata: this.extractMetadata(),
      structure: this.extractStructure(),
      appropriations: this.extractAppropriations(),
      agencies: this.extractAgencies(),
      sections: this.extractSections(),
      statutoryReferences: this.extractStatutoryReferences(),
      dates: this.extractDates(),
      fiscalNotes: this.extractFiscalNotes(),
      vetoes: this.extractVetoes(),
      programs: this.extractPrograms(),
      conditions: this.extractConditions()
    };
  }

  /**
   * Extract bill metadata
   */
  extractMetadata() {
    const metadata = {
      shortId: null,
      longId: null,
      title: null,
      description: null,
      chapterLaw: null,
      legislature: null,
      session: null,
      sponsors: null,
      effectiveDate: null,
      billType: null,
      passageInfo: {}
    };

    // Short bill ID
    const shortIdMatch = this.content.match(/<ShortBillId>(.*?)<\/ShortBillId>/);
    if (shortIdMatch) metadata.shortId = shortIdMatch[1];

    // Long bill ID
    const longIdMatch = this.content.match(/<LongBillId>(.*?)<\/LongBillId>/);
    if (longIdMatch) metadata.longId = longIdMatch[1];

    // Brief description
    const descMatch = this.content.match(/<BriefDescription>(.*?)<\/BriefDescription>/);
    if (descMatch) metadata.description = this.cleanText(descMatch[1]);

    // Chapter law
    const chapterMatch = this.content.match(/<ChapterLaw[^>]*>(\d+)<\/ChapterLaw>/);
    if (chapterMatch) metadata.chapterLaw = chapterMatch[1];

    // Legislature
    const legMatch = this.content.match(/<Legislature>(.*?)<\/Legislature>/);
    if (legMatch) metadata.legislature = this.cleanText(legMatch[1]);

    // Session
    const sessionMatch = this.content.match(/<Session>(.*?)<\/Session>/);
    if (sessionMatch) metadata.session = this.cleanText(sessionMatch[1]);

    // Sponsors
    const sponsorsMatch = this.content.match(/<Sponsors>(.*?)<\/Sponsors>/);
    if (sponsorsMatch) metadata.sponsors = this.cleanText(sponsorsMatch[1]);

    // Bill type (from session law caption or description)
    const captionMatch = this.content.match(/<SessionLawCaption>(.*?)<\/SessionLawCaption>/);
    if (captionMatch) {
      metadata.billType = this.cleanText(captionMatch[1]);
    } else if (metadata.description) {
      if (metadata.description.toLowerCase().includes('appropriation')) {
        metadata.billType = 'Appropriations/Budget Bill';
      }
    }

    // Passage information
    const senatePassMatch = this.content.match(/<PassedBy chamber="s">[\s\S]*?<PassedDate>(.*?)<\/PassedDate>[\s\S]*?<Yeas>(\d+)<\/Yeas>[\s\S]*?<Nays>(\d+)<\/Nays>/);
    if (senatePassMatch) {
      metadata.passageInfo.senate = {
        date: senatePassMatch[1],
        yeas: parseInt(senatePassMatch[2]),
        nays: parseInt(senatePassMatch[3])
      };
    }

    const housePassMatch = this.content.match(/<PassedBy chamber="h">[\s\S]*?<PassedDate>(.*?)<\/PassedDate>[\s\S]*?<Yeas>(\d+)<\/Yeas>[\s\S]*?<Nays>(\d+)<\/Nays>/);
    if (housePassMatch) {
      metadata.passageInfo.house = {
        date: housePassMatch[1],
        yeas: parseInt(housePassMatch[2]),
        nays: parseInt(housePassMatch[3])
      };
    }

    // Effective date
    const effDateMatch = this.content.match(/<EffectiveDate>(.*?)<\/EffectiveDate>/s);
    if (effDateMatch) {
      metadata.effectiveDate = this.cleanText(effDateMatch[1]);
    }

    return metadata;
  }

  /**
   * Extract bill structure (parts, divisions)
   */
  extractStructure() {
    const structure = {
      parts: [],
      totalSections: 0
    };

    // Extract parts
    const partPattern = /<Part[^>]*>[\s\S]*?<P>(PART [IVXLCDM]+)<\/P>[\s\S]*?<P>(.*?)<\/P>/g;
    let match;
    while ((match = partPattern.exec(this.content)) !== null) {
      structure.parts.push({
        partNumber: this.cleanText(match[1]),
        title: this.cleanText(match[2])
      });
    }

    // Count sections
    const sectionMatches = this.content.match(/<BillSection[^>]*>/g);
    structure.totalSections = sectionMatches ? sectionMatches.length : 0;

    return structure;
  }

  /**
   * Extract all appropriations with detailed information
   */
  extractAppropriations() {
    const appropriations = [];

    // Pattern to match appropriation sections
    const sectionPattern = /<BillSection[^>]*>([\s\S]*?)<\/BillSection>/g;
    let sectionMatch;

    while ((sectionMatch = sectionPattern.exec(this.content)) !== null) {
      const sectionContent = sectionMatch[1];

      // Extract section number
      const secNumMatch = sectionContent.match(/<BillSectionNumber>[\s\S]*?<Value[^>]*>(.*?)<\/Value>/);
      const sectionNumber = secNumMatch ? secNumMatch[1] : null;

      // Extract agency name
      const agencyMatch = sectionContent.match(/<Department>[\s\S]*?<DeptName>[\s\S]*?<P>(.*?)<\/P>/);
      const agency = agencyMatch ? this.cleanText(agencyMatch[1]) : null;

      // Extract agency code
      const agencyCodeMatch = sectionContent.match(/<Appropriations[^>]*agency="(\d+)"/);
      const agencyCode = agencyCodeMatch ? agencyCodeMatch[1] : null;

      // Extract individual appropriations
      const appropPattern = /<Appropriation>([\s\S]*?)<\/Appropriation>/g;
      let appropMatch;

      while ((appropMatch = appropPattern.exec(sectionContent)) !== null) {
        const appropContent = appropMatch[1];

        // Extract account name
        const accountMatch = appropContent.match(/<AccountName>([\s\S]*?)<\/AccountName>/);
        let accountName = null;
        let fiscalYear = null;

        if (accountMatch) {
          const accountText = this.cleanText(accountMatch[1]);
          accountName = accountText;

          // Extract fiscal year if present
          const fyMatch = accountText.match(/\(FY (\d{4})\)/);
          if (fyMatch) {
            fiscalYear = fyMatch[1];
          }
        }

        // Extract dollar amount
        const amountMatch = appropContent.match(/<DollarAmount>(.*?)<\/DollarAmount>/);
        const amountStr = amountMatch ? amountMatch[1].replace(/[$,]/g, '') : '0';
        const amount = parseInt(amountStr, 10);

        if (accountName && amount) {
          appropriations.push({
            sectionNumber,
            agency,
            agencyCode,
            account: accountName,
            fiscalYear,
            amount,
            amountFormatted: this.formatCurrency(amount)
          });
        }
      }

      // Also extract totals
      const totalMatch = sectionContent.match(/<AppropriationTotal>[\s\S]*?<DollarAmount>(.*?)<\/DollarAmount>/);
      if (totalMatch && agency) {
        const totalStr = totalMatch[1].replace(/[$,]/g, '');
        const totalAmount = parseInt(totalStr, 10);

        appropriations.push({
          sectionNumber,
          agency,
          agencyCode,
          account: 'TOTAL APPROPRIATION',
          fiscalYear: null,
          amount: totalAmount,
          amountFormatted: this.formatCurrency(totalAmount),
          isTotal: true
        });
      }
    }

    return appropriations;
  }

  /**
   * Extract all agencies
   */
  extractAgencies() {
    const agencies = [];
    const agencyMap = new Map();

    const sectionPattern = /<BillSection[^>]*>([\s\S]*?)<\/BillSection>/g;
    let match;

    while ((match = sectionPattern.exec(this.content)) !== null) {
      const sectionContent = match[1];

      // Extract section number
      const secNumMatch = sectionContent.match(/<BillSectionNumber>[\s\S]*?<Value[^>]*>(.*?)<\/Value>/);
      const sectionNumber = secNumMatch ? secNumMatch[1] : null;

      // Extract agency
      const agencyMatch = sectionContent.match(/<Department>[\s\S]*?<DeptName>[\s\S]*?<P>(.*?)<\/P>/);
      if (agencyMatch) {
        const agencyName = this.cleanText(agencyMatch[1]);

        // Extract agency code
        const codeMatch = sectionContent.match(/<Appropriations[^>]*agency="(\d+)"/);
        const agencyCode = codeMatch ? codeMatch[1] : null;

        if (!agencyMap.has(agencyName)) {
          agencyMap.set(agencyName, {
            name: agencyName,
            code: agencyCode,
            sections: []
          });
        }

        if (sectionNumber) {
          agencyMap.get(agencyName).sections.push(sectionNumber);
        }
      }
    }

    return Array.from(agencyMap.values());
  }

  /**
   * Extract all bill sections
   */
  extractSections() {
    const sections = [];

    const sectionPattern = /<BillSection[^>]*>([\s\S]*?)<\/BillSection>/g;
    let match;

    while ((match = sectionPattern.exec(this.content)) !== null) {
      const sectionContent = match[1];
      const sectionTag = this.content.substring(match.index, match.index + 100);

      // Extract section number
      const secNumMatch = sectionContent.match(/<BillSectionNumber>[\s\S]*?<Value[^>]*>(.*?)<\/Value>/);
      const sectionNumber = secNumMatch ? secNumMatch[1] : null;

      // Extract agency
      const agencyMatch = sectionContent.match(/<Department>[\s\S]*?<DeptName>[\s\S]*?<P>(.*?)<\/P>/);
      const agency = agencyMatch ? this.cleanText(agencyMatch[1]) : null;

      // Check if vetoed
      const isVetoed = /veto="[^"]*"/.test(sectionTag);

      // Extract veto type
      let vetoType = null;
      const vetoTypeMatch = sectionTag.match(/veto="([^"]*)"/);
      if (vetoTypeMatch) {
        vetoType = vetoTypeMatch[1];
      }

      // Check for veto note
      const hasVetoNote = /<SeeVetoNote>/.test(sectionContent);

      sections.push({
        sectionNumber,
        agency,
        isVetoed,
        vetoType,
        hasVetoNote
      });
    }

    return sections;
  }

  /**
   * Extract statutory references (RCW)
   */
  extractStatutoryReferences() {
    const rcwPattern = /RCW\s+([\d\.]+)/g;
    const rcwSet = new Set();
    let match;

    while ((match = rcwPattern.exec(this.content)) !== null) {
      rcwSet.add(match[1]);
    }

    return Array.from(rcwSet).sort().map(rcw => ({
      type: 'RCW',
      reference: rcw,
      fullReference: `RCW ${rcw}`
    }));
  }

  /**
   * Extract dates
   */
  extractDates() {
    const dates = [];

    // Effective date
    const effDateMatch = this.content.match(/<EffectiveDate>(.*?)<\/EffectiveDate>/s);
    if (effDateMatch) {
      dates.push({
        type: 'effective_date',
        date: this.cleanText(effDateMatch[1])
      });
    }

    // Passage dates
    const senatePassMatch = this.content.match(/<PassedBy chamber="s">[\s\S]*?<PassedDate>(.*?)<\/PassedDate>/);
    if (senatePassMatch) {
      dates.push({
        type: 'senate_passage',
        date: senatePassMatch[1]
      });
    }

    const housePassMatch = this.content.match(/<PassedBy chamber="h">[\s\S]*?<PassedDate>(.*?)<\/PassedDate>/);
    if (housePassMatch) {
      dates.push({
        type: 'house_passage',
        date: housePassMatch[1]
      });
    }

    // Approval date
    const approvalMatch = this.content.match(/<ApprovedDate>(.*?)<\/ApprovedDate>/);
    if (approvalMatch) {
      dates.push({
        type: 'approval',
        date: this.cleanText(approvalMatch[1])
      });
    }

    // Filed date
    const filedMatch = this.content.match(/<FiledDate>(.*?)<\/FiledDate>/);
    if (filedMatch) {
      dates.push({
        type: 'filed',
        date: this.cleanText(filedMatch[1])
      });
    }

    return dates;
  }

  /**
   * Extract fiscal notes and impacts
   */
  extractFiscalNotes() {
    const fiscalNotes = [];

    // Look for fiscal year mentions in appropriations
    const fyPattern = /fiscal year (\d{4})|FY (\d{4})/gi;
    const fiscalYears = new Set();
    let match;

    while ((match = fyPattern.exec(this.content)) !== null) {
      fiscalYears.add(match[1] || match[2]);
    }

    // Look for biennium mentions
    const bienniumPattern = /(\d{4})-(\d{4})\s+(?:fiscal\s+)?biennium/gi;
    const biennia = [];
    while ((match = bienniumPattern.exec(this.content)) !== null) {
      biennia.push({
        startYear: match[1],
        endYear: match[2],
        description: `${match[1]}-${match[2]} Fiscal Biennium`
      });
    }

    return {
      fiscalYears: Array.from(fiscalYears).sort(),
      biennia
    };
  }

  /**
   * Extract vetoed items
   */
  extractVetoes() {
    const vetoes = [];

    const vetoSectionPattern = /<BillSection[^>]*veto="([^"]*)"[^>]*>([\s\S]*?)<\/BillSection>/g;
    let match;

    while ((match = vetoSectionPattern.exec(this.content)) !== null) {
      const vetoType = match[1];
      const sectionContent = match[2];

      // Extract section number
      const secNumMatch = sectionContent.match(/<BillSectionNumber>[\s\S]*?<Value[^>]*>(.*?)<\/Value>/);
      const sectionNumber = secNumMatch ? secNumMatch[1] : null;

      // Extract agency
      const agencyMatch = sectionContent.match(/<Department>[\s\S]*?<DeptName>[\s\S]*?<P>(.*?)<\/P>/);
      const agency = agencyMatch ? this.cleanText(agencyMatch[1]) : null;

      // Check for veto note
      const vetoNoteMatch = sectionContent.match(/<SeeVetoNote>(.*?)<\/SeeVetoNote>/);
      const vetoNote = vetoNoteMatch ? this.cleanText(vetoNoteMatch[1]) : null;

      // Extract line vetoes
      const lineVetoes = [];
      const lineVetoPattern = /<TextRun lineVeto="yes">(.*?)<\/TextRun>/g;
      let lineMatch;
      while ((lineMatch = lineVetoPattern.exec(sectionContent)) !== null) {
        lineVetoes.push(this.cleanText(lineMatch[1]));
      }

      vetoes.push({
        sectionNumber,
        agency,
        vetoType,
        vetoNote,
        lineVetoes
      });
    }

    return vetoes;
  }

  /**
   * Extract programs mentioned in the bill
   */
  extractPrograms() {
    const programs = [];

    // Look for program mentions in conditions and limitations
    const programPattern = /(?:program|initiative|project)[\s\S]{0,200}(?:provided solely|appropriation)/gi;
    const matches = this.content.match(programPattern);

    if (matches) {
      // Extract unique programs (simplified - could be enhanced)
      const seen = new Set();
      matches.forEach(match => {
        const cleaned = this.cleanText(match).substring(0, 200);
        if (!seen.has(cleaned)) {
          seen.add(cleaned);
          programs.push({
            description: cleaned
          });
        }
      });
    }

    return programs.slice(0, 50); // Limit to first 50
  }

  /**
   * Extract conditions and limitations
   */
  extractConditions() {
    const conditions = [];

    // Find all conditions and limitations sections
    const conditionPattern = /<P[^>]*>The appropriations in this section are subject to the following conditions and limitations:<\/P>([\s\S]*?)(?=<BillSection|<Part|$)/g;
    let match;
    let conditionNum = 0;

    while ((match = conditionPattern.exec(this.content)) !== null && conditionNum < 100) {
      const conditionContent = match[1];

      // Extract individual numbered conditions
      const itemPattern = /<P[^>]*>\((\d+)\)(.*?)<\/P>/g;
      let itemMatch;

      while ((itemMatch = itemPattern.exec(conditionContent)) !== null) {
        conditions.push({
          number: itemMatch[1],
          text: this.cleanText(itemMatch[2]).substring(0, 500)
        });
        conditionNum++;
        if (conditionNum >= 100) break;
      }
    }

    return conditions;
  }

  /**
   * Calculate appropriation statistics
   */
  calculateAppropriationStats(appropriations) {
    const totalsOnly = appropriations.filter(a => a.isTotal);
    const nonTotals = appropriations.filter(a => !a.isTotal);

    const amounts = nonTotals.map(a => a.amount);
    const totalAmounts = totalsOnly.map(a => a.amount);

    return {
      totalCount: appropriations.length,
      nonTotalCount: nonTotals.length,
      totalAppropriationsCount: totalsOnly.length,
      grandTotal: amounts.reduce((sum, amt) => sum + amt, 0),
      grandTotalFormatted: this.formatCurrency(amounts.reduce((sum, amt) => sum + amt, 0)),
      agencyTotals: totalAmounts.reduce((sum, amt) => sum + amt, 0),
      agencyTotalsFormatted: this.formatCurrency(totalAmounts.reduce((sum, amt) => sum + amt, 0)),
      minAmount: Math.min(...amounts),
      maxAmount: Math.max(...amounts),
      averageAmount: Math.floor(amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length),
      byFiscalYear: this.groupByFiscalYear(nonTotals),
      byAccount: this.groupByAccount(nonTotals)
    };
  }

  /**
   * Group appropriations by fiscal year
   */
  groupByFiscalYear(appropriations) {
    const byYear = {};

    appropriations.forEach(approp => {
      if (approp.fiscalYear) {
        if (!byYear[approp.fiscalYear]) {
          byYear[approp.fiscalYear] = {
            year: approp.fiscalYear,
            count: 0,
            total: 0
          };
        }
        byYear[approp.fiscalYear].count++;
        byYear[approp.fiscalYear].total += approp.amount;
      }
    });

    // Format totals
    Object.values(byYear).forEach(fy => {
      fy.totalFormatted = this.formatCurrency(fy.total);
    });

    return byYear;
  }

  /**
   * Group appropriations by account type
   */
  groupByAccount(appropriations) {
    const byAccount = {};

    appropriations.forEach(approp => {
      const accountType = this.categorizeAccount(approp.account);

      if (!byAccount[accountType]) {
        byAccount[accountType] = {
          type: accountType,
          count: 0,
          total: 0
        };
      }
      byAccount[accountType].count++;
      byAccount[accountType].total += approp.amount;
    });

    // Format totals
    Object.values(byAccount).forEach(act => {
      act.totalFormatted = this.formatCurrency(act.total);
    });

    return byAccount;
  }

  /**
   * Categorize account by type
   */
  categorizeAccount(accountName) {
    const name = accountName.toLowerCase();

    if (name.includes('general fund')) return 'General Fund';
    if (name.includes('federal')) return 'Federal';
    if (name.includes('private') || name.includes('local')) return 'Private/Local';
    if (name.includes('account') || name.includes('trust')) return 'Special Account/Trust';

    return 'Other';
  }

  /**
   * Format currency
   */
  formatCurrency(amount) {
    return '$' + amount.toLocaleString('en-US');
  }

  /**
   * Clean text by removing XML tags and extra whitespace
   */
  cleanText(text) {
    return text
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

/**
 * Convenience function to load and extract from a file
 */
function extractFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const format = filePath.endsWith('.xml') ? 'xml' : 'html';
  const extractor = new BillExtractor(content, format);
  return extractor.extractAll();
}

/**
 * Calculate summary statistics
 */
function calculateSummary(data) {
  const extractor = new BillExtractor('', 'xml');
  const stats = extractor.calculateAppropriationStats(data.appropriations);

  return {
    billInfo: {
      id: data.metadata.shortId,
      type: data.metadata.billType,
      description: data.metadata.description
    },
    structure: {
      totalSections: data.structure.totalSections,
      totalParts: data.structure.parts.length,
      totalAgencies: data.agencies.length
    },
    appropriations: stats,
    references: {
      rcwCount: data.statutoryReferences.length,
      vetoedSections: data.vetoes.length
    },
    dates: data.dates
  };
}

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BillExtractor,
    extractFromFile,
    calculateSummary
  };
}

// Export for browser global
if (typeof window !== 'undefined') {
  window.BillExtractor = BillExtractor;
  window.extractFromFile = extractFromFile;
  window.calculateSummary = calculateSummary;
}
