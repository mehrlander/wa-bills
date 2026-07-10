/**
 * Washington State Bill Data Extraction Library
 * Extracts structured data from WA legislative bills (XML and HTM formats)
 */

class BillExtractor {
  constructor(xmlContent) {
    this.xmlContent = xmlContent;
    this.data = {};
  }

  /**
   * Extract all data from the bill
   */
  extractAll() {
    this.data = {
      metadata: this.extractMetadata(),
      sections: this.extractSections(),
      rcwReferences: this.extractRCWReferences(),
      agencies: this.extractAgencies(),
      dates: this.extractDates(),
      programs: this.extractPrograms(),
      fiscalImpacts: this.extractFiscalImpacts(),
      statutoryReferences: this.extractStatutoryReferences(),
      history: this.extractHistory(),
      amendments: this.extractAmendments()
    };
    return this.data;
  }

  /**
   * Extract bill metadata
   */
  extractMetadata() {
    const metadata = {};

    // Bill identification
    const shortBillId = this.extractTagContent('ShortBillId');
    const longBillId = this.extractTagContent('LongBillId');
    const billType = this.extractAttribute('Bill', 'type');

    // Session and legislature info
    const legislature = this.extractTagContent('Legislature');
    const session = this.extractTagContent('Session');

    // Sponsors
    const sponsors = this.extractTagContent('Sponsors');

    // Brief description
    const briefDescription = this.extractTagContent('BriefDescription');
    const billTitle = this.extractTagContent('BillTitle');

    // Chapter law and certification
    const chapterLaw = this.extractTagContent('ChapterLaw');
    const chapterYear = this.extractAttribute('ChapterLaw', 'year');
    const sessionLawCaption = this.extractTagContent('SessionLawCaption');

    // Effective dates
    const effectiveDate = this.extractTagContent('EffectiveDate');

    // Passage information
    const housePassage = this.extractPassageInfo('h');
    const senatePassage = this.extractPassageInfo('s');

    // Approval and filing
    const approvedDate = this.extractTagContent('ApprovedDate');
    const filedDate = this.extractTagContent('FiledDate');
    const governor = this.extractTagContent('Governor');

    return {
      billId: shortBillId,
      longBillId: longBillId,
      billType: billType,
      legislature: legislature,
      session: session,
      sponsors: sponsors,
      briefDescription: briefDescription,
      title: billTitle,
      chapterLaw: chapterLaw,
      chapterYear: chapterYear,
      sessionLawCaption: sessionLawCaption,
      effectiveDate: effectiveDate,
      passage: {
        house: housePassage,
        senate: senatePassage
      },
      approvedDate: approvedDate,
      filedDate: filedDate,
      governor: governor
    };
  }

  /**
   * Extract passage information for a chamber
   */
  extractPassageInfo(chamber) {
    const pattern = new RegExp(`<PassedBy chamber="${chamber}">([\\s\\S]*?)</PassedBy>`);
    const match = this.xmlContent.match(pattern);
    if (!match) return null;

    const passageText = match[1];
    const date = this.extractFromText(passageText, '<PassedDate>(.*?)</PassedDate>');
    const yeas = this.extractFromText(passageText, '<Yeas>(.*?)</Yeas>');
    const nays = this.extractFromText(passageText, '<Nays>(.*?)</Nays>');
    const signer = this.extractFromText(passageText, '<Signer>(.*?)</Signer>');

    return {
      date: date,
      yeas: parseInt(yeas) || 0,
      nays: parseInt(nays) || 0,
      signer: signer
    };
  }

  /**
   * Extract all bill sections
   */
  extractSections() {
    const sections = [];
    const sectionPattern = /<BillSection[^>]*>([\s\S]*?)<\/BillSection>/g;
    let match;

    while ((match = sectionPattern.exec(this.xmlContent)) !== null) {
      const sectionContent = match[0];
      const sectionData = this.parseBillSection(sectionContent);
      sections.push(sectionData);
    }

    return sections;
  }

  /**
   * Parse individual bill section
   */
  parseBillSection(sectionContent) {
    // Extract attributes
    const typeMatch = sectionContent.match(/type="([^"]*)"/);
    const actionMatch = sectionContent.match(/action="([^"]*)"/);

    // Extract section number
    const sectionNumber = this.extractFromText(sectionContent, '<Value[^>]*>(.*?)</Value>');

    // Extract RCW citation if present
    const rcwCitation = this.extractRCWCitation(sectionContent);

    // Extract caption if present
    const caption = this.extractFromText(sectionContent, '<Caption>(.*?)</Caption>');

    // Count paragraphs
    const paragraphCount = (sectionContent.match(/<P[^>]*>/g) || []).length;

    return {
      type: typeMatch ? typeMatch[1] : null,
      action: actionMatch ? actionMatch[1] : null,
      sectionNumber: sectionNumber,
      rcwCitation: rcwCitation,
      caption: caption,
      paragraphCount: paragraphCount,
      hasAmendments: sectionContent.includes('amendingStyle')
    };
  }

  /**
   * Extract RCW citation from section
   */
  extractRCWCitation(text) {
    const pattern = /<SectionCite>[\s\S]*?<TitleNumber>(\d+)<\/TitleNumber>[\s\S]*?<ChapterNumber>([\d.]+)<\/ChapterNumber>[\s\S]*?<SectionNumber>([\d.]+)<\/SectionNumber>/;
    const match = text.match(pattern);
    if (!match) return null;

    return `RCW ${match[1]}.${match[2]}.${match[3]}`;
  }

  /**
   * Extract all RCW references from the bill
   */
  extractRCWReferences() {
    const references = [];
    const pattern = /RCW\s+(\d+)\.(\d+)\.(\d+)/g;
    let match;

    while ((match = pattern.exec(this.xmlContent)) !== null) {
      const rcw = `RCW ${match[1]}.${match[2]}.${match[3]}`;
      if (!references.includes(rcw)) {
        references.push(rcw);
      }
    }

    return references.sort();
  }

  /**
   * Extract agency references
   */
  extractAgencies() {
    const agencies = new Set();
    const agencyPatterns = [
      /department of ([^<]+?)(?:<|\.)/gi,
      /(?:state )?board of ([^<]+?)(?:<|\.)/gi,
      /(?:state )?commission (?:of |on )?([^<]+?)(?:<|\.)/gi,
      /(?:state )?office of ([^<]+?)(?:<|\.)/gi,
      /Washington (?:state )?([^<]+? (?:authority|agency|commission|board|office|department))/gi
    ];

    agencyPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(this.xmlContent)) !== null) {
        const agency = this.cleanText(match[0]);
        if (agency.length > 5 && agency.length < 100) {
          agencies.add(agency);
        }
      }
    });

    return Array.from(agencies).sort();
  }

  /**
   * Extract program references
   */
  extractPrograms() {
    const programs = new Set();
    const programPatterns = [
      /([A-Z][a-z]+\s+){1,5}program/g,
      /([A-Z][a-z]+\s+){1,5}act/g
    ];

    programPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(this.xmlContent)) !== null) {
        const program = this.cleanText(match[0]);
        if (program.length > 10 && program.length < 100) {
          programs.add(program);
        }
      }
    });

    return Array.from(programs).sort();
  }

  /**
   * Extract fiscal impacts and monetary amounts
   */
  extractFiscalImpacts() {
    const impacts = [];

    // Extract dollar amounts
    const dollarPattern = /\$([0-9,]+(?:\.\d{2})?)/g;
    let match;

    while ((match = dollarPattern.exec(this.xmlContent)) !== null) {
      const context = this.xmlContent.substring(
        Math.max(0, match.index - 200),
        Math.min(this.xmlContent.length, match.index + 200)
      );

      impacts.push({
        amount: match[1],
        context: this.cleanText(context)
      });
    }

    // Look for budget/fiscal keywords
    const fiscalKeywords = ['appropriation', 'budget', 'fiscal', 'fund', 'account'];
    const fiscalReferences = [];

    fiscalKeywords.forEach(keyword => {
      const pattern = new RegExp(`([^<]{0,100}${keyword}[^<]{0,100})`, 'gi');
      let match;
      while ((match = pattern.exec(this.xmlContent)) !== null) {
        fiscalReferences.push({
          keyword: keyword,
          context: this.cleanText(match[1])
        });
      }
    });

    return {
      monetaryAmounts: impacts,
      fiscalReferences: fiscalReferences.slice(0, 50) // Limit to avoid too much data
    };
  }

  /**
   * Extract dates mentioned in the bill
   */
  extractDates() {
    const dates = {};

    // Specific date types
    dates.passedHouse = this.extractFromText(
      this.xmlContent,
      /<PassedBy chamber="h">[\s\S]*?<PassedDate>(.*?)<\/PassedDate>/
    );
    dates.passedSenate = this.extractFromText(
      this.xmlContent,
      /<PassedBy chamber="s">[\s\S]*?<PassedDate>(.*?)<\/PassedDate>/
    );
    dates.approved = this.extractTagContent('ApprovedDate');
    dates.filed = this.extractTagContent('FiledDate');
    dates.effective = this.extractTagContent('EffectiveDate');
    dates.readFirstTime = this.extractFromText(
      this.xmlContent,
      /<ReadDate>(.*?)<\/ReadDate>/
    );

    // Extract all date patterns
    const datePattern = /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/g;
    const allDates = [];
    let match;

    while ((match = datePattern.exec(this.xmlContent)) !== null) {
      if (!allDates.includes(match[0])) {
        allDates.push(match[0]);
      }
    }

    dates.allMentioned = allDates;

    return dates;
  }

  /**
   * Extract statutory references
   */
  extractStatutoryReferences() {
    const references = {
      rcw: this.extractRCWReferences(),
      usc: [],
      cfr: []
    };

    // U.S.C. references
    const uscPattern = /(\d+\s+U\.S\.C\.\s+(?:Sec\.\s+)?\d+[a-z]?)/gi;
    let match;
    while ((match = uscPattern.exec(this.xmlContent)) !== null) {
      if (!references.usc.includes(match[1])) {
        references.usc.push(match[1]);
      }
    }

    // C.F.R. references
    const cfrPattern = /(\d+\s+C\.F\.R\.\s+(?:Part\s+)?\d+(?:\.\d+)?)/gi;
    while ((match = cfrPattern.exec(this.xmlContent)) !== null) {
      if (!references.cfr.includes(match[1])) {
        references.cfr.push(match[1]);
      }
    }

    return references;
  }

  /**
   * Extract legislative history
   */
  extractHistory() {
    const historyPattern = /<History>(.*?)<\/History>/g;
    const histories = [];
    let match;

    while ((match = historyPattern.exec(this.xmlContent)) !== null) {
      histories.push(this.cleanText(match[1]));
    }

    return histories;
  }

  /**
   * Extract amendment information
   */
  extractAmendments() {
    const amendments = {
      strikethrough: [],
      additions: []
    };

    // Count amendments
    const strikeMatches = this.xmlContent.match(/<TextRun amendingStyle="strike">/g) || [];
    const addMatches = this.xmlContent.match(/<TextRun amendingStyle="add">/g) || [];

    amendments.strikeCount = strikeMatches.length;
    amendments.addCount = addMatches.length;

    // Extract sample amendments (first 10 of each type)
    const strikePattern = /<TextRun amendingStyle="strike">(.*?)<\/TextRun>/g;
    const addPattern = /<TextRun amendingStyle="add">(.*?)<\/TextRun>/g;

    let count = 0;
    let match;
    while ((match = strikePattern.exec(this.xmlContent)) !== null && count < 10) {
      amendments.strikethrough.push(this.cleanText(match[1]));
      count++;
    }

    count = 0;
    while ((match = addPattern.exec(this.xmlContent)) !== null && count < 10) {
      amendments.additions.push(this.cleanText(match[1]));
      count++;
    }

    return amendments;
  }

  // Utility methods

  extractTagContent(tagName) {
    const pattern = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\/${tagName}>`, 'i');
    const match = this.xmlContent.match(pattern);
    return match ? this.cleanText(match[1]) : null;
  }

  extractAttribute(tagName, attributeName) {
    const pattern = new RegExp(`<${tagName}[^>]*${attributeName}="([^"]*)"`, 'i');
    const match = this.xmlContent.match(pattern);
    return match ? match[1] : null;
  }

  extractFromText(text, pattern) {
    if (typeof pattern === 'string') {
      pattern = new RegExp(pattern);
    }
    const match = text.match(pattern);
    return match ? this.cleanText(match[1]) : null;
  }

  cleanText(text) {
    return text
      .replace(/<[^>]+>/g, '') // Remove XML tags
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .trim();
  }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BillExtractor;
}
