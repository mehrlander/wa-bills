/**
 * Washington State Bill Extraction Library
 *
 * A general-purpose library for parsing and extracting data from Washington State
 * legislative bills in both XML and HTM formats.
 *
 * This library is designed to handle structural variations across different bill types
 * (budget, policy, mixed) and future bills with similar formats.
 *
 * @module extraction-library
 */

/**
 * Bill type enumeration
 */
const BillType = {
  BUDGET: 'budget',
  POLICY: 'policy',
  MIXED: 'mixed',
  UNKNOWN: 'unknown'
};

/**
 * Format type enumeration
 */
const FormatType = {
  XML: 'xml',
  HTM: 'htm',
  HTML: 'html'
};

/**
 * Extracts text content from XML/HTML, removing tags
 * @param {string} text - Text with potential HTML/XML tags
 * @returns {string} Clean text
 */
function stripTags(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts all matches for a regex pattern
 * @param {string} content - Content to search
 * @param {RegExp} pattern - Regex pattern (must have global flag)
 * @returns {Array} Array of matches
 */
function extractAll(content, pattern) {
  const matches = [];
  let match;
  while ((match = pattern.exec(content)) !== null) {
    matches.push(match);
  }
  return matches;
}

/**
 * Extracts basic bill metadata from XML format
 * @param {string} content - XML content
 * @param {string} filename - Original filename
 * @returns {Object} Metadata object
 */
function extractXMLMetadata(content, filename) {
  const metadata = {
    filename,
    format: FormatType.XML,
    billNumber: filename.replace(/\.(xml|htm|html)$/, ''),
  };

  // Extract ShortBillId
  const shortBillMatch = content.match(/<ShortBillId>(.*?)<\/ShortBillId>/);
  if (shortBillMatch) {
    metadata.billNumber = stripTags(shortBillMatch[1]);
  }

  // Extract LongBillId
  const longBillMatch = content.match(/<LongBillId>(.*?)<\/LongBillId>/);
  if (longBillMatch) {
    metadata.longBillId = stripTags(longBillMatch[1]);
  }

  // Extract bill title
  const titleMatch = content.match(/<BillTitle>(.*?)<\/BillTitle>/s);
  if (titleMatch) {
    metadata.title = stripTags(titleMatch[1]);
  }

  // Extract brief description
  const briefMatch = content.match(/<BriefDescription>(.*?)<\/BriefDescription>/s);
  if (briefMatch) {
    metadata.briefDescription = stripTags(briefMatch[1]);
  }

  // Extract sponsors
  const sponsorMatch = content.match(/<Sponsors>(.*?)<\/Sponsors>/s);
  if (sponsorMatch) {
    metadata.sponsors = stripTags(sponsorMatch[1]);
  }

  // Extract session information
  const sessionMatch = content.match(/<Session>(.*?)<\/Session>/);
  if (sessionMatch) {
    metadata.session = stripTags(sessionMatch[1]);
  }

  // Extract legislature
  const legislatureMatch = content.match(/<Legislature>(.*?)<\/Legislature>/);
  if (legislatureMatch) {
    metadata.legislature = stripTags(legislatureMatch[1]);
  }

  // Extract chapter law
  const chapterMatch = content.match(/<ChapterLaw year="(\d+)">(.*?)<\/ChapterLaw>/);
  if (chapterMatch) {
    metadata.chapterLaw = {
      year: chapterMatch[1],
      chapter: chapterMatch[2]
    };
  }

  // Extract effective date
  const effectiveMatch = content.match(/<EffectiveDate>(.*?)<\/EffectiveDate>/s);
  if (effectiveMatch) {
    metadata.effectiveDate = stripTags(effectiveMatch[1]);
  }

  // Extract passage information
  const passageMatches = extractAll(content, /<PassedBy chamber="([hs])">.*?<PassedDate>(.*?)<\/PassedDate>.*?<Yeas>(\d+)<\/Yeas>.*?<Nays>(\d+)<\/Nays>.*?<\/PassedBy>/gs);
  metadata.passage = passageMatches.map(m => ({
    chamber: m[1] === 'h' ? 'House' : 'Senate',
    date: stripTags(m[2]),
    yeas: parseInt(m[3]),
    nays: parseInt(m[4])
  }));

  // Extract veto information
  metadata.hasVeto = content.includes('<VetoAction>') || content.includes('veto="line"');
  const vetoMatch = content.match(/<VetoAction>(.*?)<\/VetoAction>/);
  if (vetoMatch) {
    metadata.vetoAction = stripTags(vetoMatch[1]);
  }

  return metadata;
}

/**
 * Extracts appropriations and fiscal data from XML format
 * @param {string} content - XML content
 * @returns {Object} Fiscal data
 */
function extractXMLFiscalData(content) {
  const fiscalData = {
    appropriations: [],
    dollarAmounts: [],
    fiscalNotes: [],
    accounts: new Set(),
    totalAppropriations: 0
  };

  // Extract structured appropriations
  const appropPattern = /<Appropriation>.*?<AccountName>.*?<BudgetP[^>]*>(.*?)<\/BudgetP>.*?<\/AccountName>.*?<DollarAmount>\$([\d,]+)<\/DollarAmount>.*?<\/Appropriation>/gs;
  const appropMatches = extractAll(content, appropPattern);

  appropMatches.forEach(match => {
    const account = stripTags(match[1]);
    const amount = match[2];
    const numericAmount = parseInt(amount.replace(/,/g, ''));

    fiscalData.appropriations.push({
      account,
      amount,
      numericAmount
    });

    fiscalData.accounts.add(account);
    fiscalData.totalAppropriations += numericAmount;
  });

  // Extract all dollar amounts (for broader analysis)
  const dollarPattern = /\$(\d{1,3}(?:,\d{3})*)/g;
  const dollarMatches = extractAll(content, dollarPattern);
  fiscalData.dollarAmounts = dollarMatches.map(m => ({
    formatted: m[1],
    numeric: parseInt(m[1].replace(/,/g, ''))
  }));

  // Extract fiscal year references
  const fyPattern = /(?:fiscal year|FY)\s*(\d{4})/gi;
  const fyMatches = extractAll(content, fyPattern);
  fiscalData.fiscalYears = [...new Set(fyMatches.map(m => m[1]))];

  fiscalData.accounts = Array.from(fiscalData.accounts);

  return fiscalData;
}

/**
 * Extracts agencies and departments from XML format
 * @param {string} content - XML content
 * @returns {Array} Array of agency objects
 */
function extractXMLAgencies(content) {
  const agencies = [];
  const agencySet = new Set();

  // Extract from Department tags
  const deptPattern = /<Department>.*?<DeptName>.*?<P>(.*?)<\/P>.*?<\/DeptName>.*?<\/Department>/gs;
  const deptMatches = extractAll(content, deptPattern);

  deptMatches.forEach(match => {
    let agency = stripTags(match[1]);
    agency = agency.replace(/^FOR THE /i, '').trim();

    if (agency && !agencySet.has(agency)) {
      agencySet.add(agency);
      agencies.push({
        name: agency,
        source: 'Department'
      });
    }
  });

  // Extract from Index tags (alternative agency identification)
  const indexPattern = /<Index>(.*?)<\/Index>/g;
  const indexMatches = extractAll(content, indexPattern);

  indexMatches.forEach(match => {
    const agency = stripTags(match[1]);

    if (agency && !agencySet.has(agency)) {
      agencySet.add(agency);
      agencies.push({
        name: agency,
        source: 'Index'
      });
    }
  });

  return agencies;
}

/**
 * Extracts bill sections and structure from XML format
 * @param {string} content - XML content
 * @returns {Object} Section data
 */
function extractXMLSections(content) {
  const sections = {
    sections: [],
    parts: [],
    totalSections: 0,
    sectionTypes: {}
  };

  // Extract bill sections
  const sectionPattern = /<BillSection[^>]*type="([^"]*)"[^>]*>.*?<BillSectionNumber>.*?<Value[^>]*>(\d+)<\/Value>/gs;
  const sectionMatches = extractAll(content, sectionPattern);

  sectionMatches.forEach(match => {
    const type = match[1] || 'unknown';
    const number = parseInt(match[2]);

    sections.sections.push({
      number,
      type
    });

    sections.sectionTypes[type] = (sections.sectionTypes[type] || 0) + 1;
  });

  sections.totalSections = sections.sections.length;

  // Extract parts (used in budget bills)
  const partPattern = /<Part[^>]*>.*?<P>(PART [IVXLCDM]+)<\/P>.*?<P>(.*?)<\/P>/gs;
  const partMatches = extractAll(content, partPattern);

  partMatches.forEach(match => {
    sections.parts.push({
      part: stripTags(match[1]),
      title: stripTags(match[2])
    });
  });

  return sections;
}

/**
 * Extracts amendments and changes from XML format
 * @param {string} content - XML content
 * @returns {Object} Amendment data
 */
function extractXMLAmendments(content) {
  const amendments = {
    hasAmendments: false,
    strikethroughs: 0,
    additions: 0,
    rcwReferences: []
  };

  // Check for amendment markers
  amendments.hasAmendments = content.includes('amendingStyle="strike"') ||
                             content.includes('amendingStyle="add"');

  // Count strikethroughs
  const strikePattern = /<TextRun amendingStyle="strike">/g;
  const strikeMatches = content.match(strikePattern);
  amendments.strikethroughs = strikeMatches ? strikeMatches.length : 0;

  // Count additions
  const addPattern = /<TextRun amendingStyle="add">/g;
  const addMatches = content.match(addPattern);
  amendments.additions = addMatches ? addMatches.length : 0;

  // Extract RCW references
  const rcwPattern = /RCW\s+(\d+(?:\.\d+)+)/g;
  const rcwMatches = extractAll(content, rcwPattern);
  amendments.rcwReferences = [...new Set(rcwMatches.map(m => m[1]))];

  return amendments;
}

/**
 * Analyzes structural elements present in the bill
 * @param {string} content - Bill content
 * @param {string} format - Format type (xml or htm)
 * @returns {Object} Structure analysis
 */
function analyzeStructure(content, format) {
  if (format === FormatType.XML) {
    return {
      format: FormatType.XML,
      elements: {
        certifiedBill: content.includes('<CertifiedBill'),
        enrollingCertificate: content.includes('<EnrollingCertificate'),
        billHeading: content.includes('<BillHeading'),
        billBody: content.includes('<BillBody'),
        billTitle: content.includes('<BillTitle'),
        billSection: content.includes('<BillSection'),
        part: content.includes('<Part'),
        appropriations: content.includes('<Appropriations'),
        amendments: content.includes('amendingStyle'),
        tables: content.includes('<Table'),
        enactedClause: content.includes('<EnactedClause'),
        history: content.includes('<History'),
        caption: content.includes('<Caption'),
      },
      namespace: content.includes('xmlns="http://leg.wa.gov/2012/document"'),
    };
  } else {
    return {
      format: FormatType.HTM,
      elements: {
        doctype: content.includes('<!DOCTYPE'),
        html: content.includes('<html'),
        head: content.includes('<head'),
        body: content.includes('<body'),
        tables: /<table/i.test(content),
        strikethrough: /<strike/i.test(content) || /<del/i.test(content),
        inserts: /<ins/i.test(content) || /<u/i.test(content),
        styles: /<style/i.test(content),
        divs: /<div/i.test(content),
        paragraphs: /<p/i.test(content),
      }
    };
  }
}

/**
 * Categorizes bill type based on content analysis
 * @param {Object} fiscalData - Fiscal data object
 * @param {Object} sections - Sections object
 * @param {Object} agencies - Agencies array
 * @returns {string} Bill type
 */
function categorizeBillType(fiscalData, sections, agencies) {
  const appropCount = fiscalData.appropriations.length;
  const dollarCount = fiscalData.dollarAmounts.length;
  const agencyCount = agencies.length;

  // Budget bills have extensive appropriations and agencies
  if (appropCount > 50 || (agencyCount > 20 && appropCount > 10)) {
    return BillType.BUDGET;
  }

  // Mixed bills have some fiscal elements
  if (appropCount > 0 || dollarCount > 10) {
    return BillType.MIXED;
  }

  // Policy bills have minimal or no fiscal data
  return BillType.POLICY;
}

/**
 * Main extraction function for XML bills
 * @param {string} content - XML content
 * @param {string} filename - Original filename
 * @returns {Object} Complete bill data
 */
function extractXMLBill(content, filename) {
  const metadata = extractXMLMetadata(content, filename);
  const fiscalData = extractXMLFiscalData(content);
  const agencies = extractXMLAgencies(content);
  const sectionData = extractXMLSections(content);
  const amendments = extractXMLAmendments(content);
  const structure = analyzeStructure(content, FormatType.XML);

  const billType = categorizeBillType(fiscalData, sectionData, agencies);

  return {
    ...metadata,
    type: billType,
    agencies,
    fiscal: fiscalData,
    sections: sectionData,
    amendments,
    structure,
    stats: {
      agencyCount: agencies.length,
      appropriationCount: fiscalData.appropriations.length,
      dollarAmountCount: fiscalData.dollarAmounts.length,
      sectionCount: sectionData.totalSections,
      partCount: sectionData.parts.length,
      rcwReferenceCount: amendments.rcwReferences.length,
    }
  };
}

/**
 * Basic extraction for HTM bills
 * @param {string} content - HTM content
 * @param {string} filename - Original filename
 * @returns {Object} Basic bill data
 */
function extractHTMBill(content, filename) {
  const metadata = {
    filename,
    format: FormatType.HTM,
    billNumber: filename.replace(/\.(xml|htm|html)$/, ''),
  };

  // Extract title
  const titleMatch = content.match(/<title>(.*?)<\/title>/i);
  if (titleMatch) {
    metadata.title = stripTags(titleMatch[1]);
  }

  // Look for bill number in content
  const billNumMatch = content.match(/(?:HOUSE|SENATE)\s+BILL\s+(\d+(?:-[A-Z]\d*)?)/i);
  if (billNumMatch) {
    metadata.billNumber = billNumMatch[0];
  }

  // Extract fiscal data
  const fiscalData = {
    dollarAmounts: [],
    appropriations: []
  };

  const dollarPattern = /\$(\d{1,3}(?:,\d{3})*)/g;
  const dollarMatches = extractAll(content, dollarPattern);
  fiscalData.dollarAmounts = dollarMatches.map(m => ({
    formatted: m[1],
    numeric: parseInt(m[1].replace(/,/g, ''))
  }));

  const structure = analyzeStructure(content, FormatType.HTM);

  // Categorize type based on dollar amounts
  let billType = BillType.POLICY;
  if (fiscalData.dollarAmounts.length > 100) {
    billType = BillType.BUDGET;
  } else if (fiscalData.dollarAmounts.length > 5) {
    billType = BillType.MIXED;
  }

  return {
    ...metadata,
    type: billType,
    fiscal: fiscalData,
    structure,
    stats: {
      dollarAmountCount: fiscalData.dollarAmounts.length,
    }
  };
}

/**
 * Auto-detects format and extracts bill data
 * @param {string} content - Bill content
 * @param {string} filename - Original filename
 * @returns {Object} Extracted bill data
 */
function extractBill(content, filename) {
  // Detect format
  const isXML = content.includes('<?xml') || filename.endsWith('.xml');

  if (isXML) {
    return extractXMLBill(content, filename);
  } else {
    return extractHTMBill(content, filename);
  }
}

/**
 * Extracts key entities from all bills for normalized storage
 * @param {Array} bills - Array of extracted bill objects
 * @returns {Object} Normalized entities
 */
function extractEntities(bills) {
  const entities = {
    bills: [],
    agencies: [],
    appropriations: [],
    accounts: [],
    fiscalYears: [],
    rcwReferences: [],
  };

  const agencyMap = new Map();
  const accountMap = new Map();
  const fySet = new Set();
  const rcwSet = new Set();

  bills.forEach(bill => {
    // Add bill summary
    entities.bills.push({
      billNumber: bill.billNumber,
      type: bill.type,
      title: bill.title,
      session: bill.session,
      filename: bill.filename,
    });

    // Extract agencies
    if (bill.agencies) {
      bill.agencies.forEach(agency => {
        if (!agencyMap.has(agency.name)) {
          agencyMap.set(agency.name, {
            name: agency.name,
            billsAppearingIn: []
          });
        }
        agencyMap.get(agency.name).billsAppearingIn.push(bill.billNumber);
      });
    }

    // Extract appropriations
    if (bill.fiscal && bill.fiscal.appropriations) {
      bill.fiscal.appropriations.forEach(approp => {
        entities.appropriations.push({
          billNumber: bill.billNumber,
          account: approp.account,
          amount: approp.amount,
          numericAmount: approp.numericAmount
        });

        if (!accountMap.has(approp.account)) {
          accountMap.set(approp.account, {
            account: approp.account,
            totalAmount: 0,
            occurrences: 0
          });
        }
        const acct = accountMap.get(approp.account);
        acct.totalAmount += approp.numericAmount;
        acct.occurrences++;
      });
    }

    // Extract fiscal years
    if (bill.fiscal && bill.fiscal.fiscalYears) {
      bill.fiscal.fiscalYears.forEach(fy => fySet.add(fy));
    }

    // Extract RCW references
    if (bill.amendments && bill.amendments.rcwReferences) {
      bill.amendments.rcwReferences.forEach(rcw => rcwSet.add(rcw));
    }
  });

  entities.agencies = Array.from(agencyMap.values());
  entities.accounts = Array.from(accountMap.values());
  entities.fiscalYears = Array.from(fySet).sort();
  entities.rcwReferences = Array.from(rcwSet).sort();

  return entities;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BillType,
    FormatType,
    stripTags,
    extractAll,
    extractXMLMetadata,
    extractXMLFiscalData,
    extractXMLAgencies,
    extractXMLSections,
    extractXMLAmendments,
    analyzeStructure,
    categorizeBillType,
    extractXMLBill,
    extractHTMBill,
    extractBill,
    extractEntities,
  };
}
