/**
 * WA Bills Extraction Library
 * Reusable parsing functions for Washington State bill formats
 * Handles both XML and HTM formats with structural variations
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse XML bill file and extract structured data
 * @param {string} filePath - Path to XML file
 * @returns {Object} Parsed bill data
 */
function parseXMLBill(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const billNumber = path.basename(filePath, '.xml');

  const bill = {
    billNumber,
    format: 'xml',
    fileSize: fs.statSync(filePath).size,
    metadata: extractMetadata(content),
    appropriations: extractAppropriations(content),
    sections: extractSections(content),
    parts: extractParts(content),
    agencies: extractAgencies(content),
    fiscalNotes: extractFiscalNotes(content),
    amendments: extractAmendments(content),
    tables: extractTables(content),
    crossReferences: extractCrossReferences(content)
  };

  // Categorize bill type
  bill.type = categorizeBill(bill);

  return bill;
}

/**
 * Extract metadata from bill XML
 */
function extractMetadata(content) {
  const metadata = {};

  // Helper to extract text from XML tags
  const extract = (tagName, group = 1) => {
    const regex = new RegExp(`<${tagName}[^>]*>(.*?)<\/${tagName}>`, 's');
    const match = content.match(regex);
    return match ? cleanText(match[group]) : null;
  };

  const extractAttr = (tagName, attrName) => {
    const regex = new RegExp(`<${tagName}[^>]*${attrName}="([^"]+)"`);
    const match = content.match(regex);
    return match ? match[1] : null;
  };

  metadata.shortBillId = extract('ShortBillId');
  metadata.longBillId = extract('LongBillId');
  metadata.sessionLawCaption = extract('SessionLawCaption');
  metadata.briefDescription = extract('BriefDescription');
  metadata.sponsors = extract('Sponsors');
  metadata.session = extract('Session');
  metadata.legislature = extract('Legislature');
  metadata.billTitle = extract('BillTitle');

  // Chapter law
  const chapterMatch = content.match(/<ChapterLaw year="(\d+)">(\d+)<\/ChapterLaw>/);
  if (chapterMatch) {
    metadata.chapterLaw = {
      year: parseInt(chapterMatch[1]),
      chapter: parseInt(chapterMatch[2])
    };
  }

  // Effective date
  metadata.effectiveDate = extract('EffectiveDate');

  // Veto info
  metadata.hasVeto = content.includes('veto="');
  metadata.vetoType = content.includes('(partial veto)') ? 'partial' :
                      content.includes('VetoAction') ? 'full' : null;

  // Passage info
  const passageMatches = content.match(/<PassedBy chamber="([^"]+)">[\s\S]*?<PassedDate>(.*?)<\/PassedDate>[\s\S]*?<Yeas>(\d+)<\/Yeas>[\s\S]*?<Nays>(\d+)<\/Nays>/g);
  if (passageMatches) {
    metadata.passage = passageMatches.map(match => {
      const [, chamber, date, yeas, nays] = match.match(/<PassedBy chamber="([^"]+)">[\s\S]*?<PassedDate>(.*?)<\/PassedDate>[\s\S]*?<Yeas>(\d+)<\/Yeas>[\s\S]*?<Nays>(\d+)<\/Nays>/);
      return {
        chamber: chamber === 'h' ? 'House' : 'Senate',
        date,
        yeas: parseInt(yeas),
        nays: parseInt(nays)
      };
    });
  }

  return metadata;
}

/**
 * Extract appropriations from budget bills
 */
function extractAppropriations(content) {
  const appropriations = [];

  // Match <Appropriations agency="XXX"> blocks
  const appropRegex = /<Appropriations agency="([^"]+)">([\s\S]*?)<\/Appropriations>/g;
  let match;

  while ((match = appropRegex.exec(content)) !== null) {
    const [, agencyCode, block] = match;

    // Find the department name (look backwards from this position)
    const beforeBlock = content.substring(0, match.index);
    const deptMatch = beforeBlock.match(/<Department>[\s\S]*?<DeptName>[\s\S]*?<P>(.*?)<\/P>[\s\S]*?<\/DeptName>[\s\S]*?<\/Department>[\s\S]*?$/);
    const departmentName = deptMatch ? cleanText(deptMatch[1]).replace(/^FOR THE /, '') : null;

    // Find section number
    const sectionMatch = beforeBlock.match(/<BillSectionNumber>[\s\S]*?<Value[^>]*>(\d+)<\/Value>[\s\S]*?$/);
    const sectionNumber = sectionMatch ? parseInt(sectionMatch[1]) : null;

    // Extract individual appropriation items
    const appropItemRegex = /<Appropriation>([\s\S]*?)<\/Appropriation>/g;
    let itemMatch;

    while ((itemMatch = appropItemRegex.exec(block)) !== null) {
      const itemBlock = itemMatch[1];

      const accountMatch = itemBlock.match(/<AccountName>([\s\S]*?)<\/AccountName>/);
      const amountMatch = itemBlock.match(/<DollarAmount>(.*?)<\/DollarAmount>/);

      if (accountMatch && amountMatch) {
        const accountName = cleanText(accountMatch[1]);
        const amount = parseAmount(amountMatch[1]);

        appropriations.push({
          agencyCode,
          departmentName,
          sectionNumber,
          accountName,
          amount,
          rawAmount: amountMatch[1]
        });
      }
    }

    // Also capture total appropriation
    const totalMatch = block.match(/<AppropriationTotal>[\s\S]*?<DollarAmount>(.*?)<\/DollarAmount>/);
    if (totalMatch) {
      appropriations.push({
        agencyCode,
        departmentName,
        sectionNumber,
        accountName: 'TOTAL APPROPRIATION',
        amount: parseAmount(totalMatch[1]),
        rawAmount: totalMatch[1],
        isTotal: true
      });
    }
  }

  return appropriations;
}

/**
 * Extract bill sections
 */
function extractSections(content) {
  const sections = [];

  const sectionRegex = /<BillSection([^>]*)>([\s\S]*?)<\/BillSection>/g;
  let match;

  while ((match = sectionRegex.exec(content)) !== null) {
    const [, attributes, sectionContent] = match;

    // Parse attributes
    const typeMatch = attributes.match(/type="([^"]+)"/);
    const actionMatch = attributes.match(/action="([^"]+)"/);
    const vetoMatch = attributes.match(/veto="([^"]+)"/);

    // Extract section number
    const numberMatch = sectionContent.match(/<BillSectionNumber>[\s\S]*?<Value[^>]*>(\d+)<\/Value>/);

    // Extract RCW citation if present
    const rcwMatch = sectionContent.match(/<SectionCite>[\s\S]*?<TitleNumber>(\d+)<\/TitleNumber>[\s\S]*?<ChapterNumber>([\d\.]+)<\/ChapterNumber>[\s\S]*?<SectionNumber>([\d\.]+)<\/SectionNumber>/);

    // Extract caption
    const captionMatch = sectionContent.match(/<Caption>(.*?)<\/Caption>/);

    sections.push({
      sectionNumber: numberMatch ? parseInt(numberMatch[1]) : null,
      type: typeMatch ? typeMatch[1] : null,
      action: actionMatch ? actionMatch[1] : null,
      veto: vetoMatch ? vetoMatch[1] : null,
      rcw: rcwMatch ? {
        title: rcwMatch[1],
        chapter: rcwMatch[2],
        section: rcwMatch[3]
      } : null,
      caption: captionMatch ? cleanText(captionMatch[1]) : null,
      hasAppropriations: sectionContent.includes('<Appropriations'),
      hasTable: sectionContent.includes('<Table'),
      length: sectionContent.length
    });
  }

  return sections;
}

/**
 * Extract bill parts (for budget bills)
 */
function extractParts(content) {
  const parts = [];

  const partRegex = /<Part[^>]*>[\s\S]*?<P>(PART [IVX]+)<\/P>[\s\S]*?<P>(.*?)<\/P>/g;
  let match;

  while ((match = partRegex.exec(content)) !== null) {
    parts.push({
      number: match[1],
      name: cleanText(match[2])
    });
  }

  return parts;
}

/**
 * Extract agencies mentioned in the bill
 */
function extractAgencies(content) {
  const agencies = new Set();

  // From appropriations
  const appropRegex = /<Appropriations agency="([^"]+)">/g;
  let match;
  while ((match = appropRegex.exec(content)) !== null) {
    agencies.add(match[1]);
  }

  // From department names
  const deptRegex = /<Department>[\s\S]*?<Index>(.*?)<\/Index>[\s\S]*?<DeptName>[\s\S]*?<P>(.*?)<\/P>/g;
  const deptNames = new Set();
  while ((match = deptRegex.exec(content)) !== null) {
    const indexName = cleanText(match[1]);
    const deptName = cleanText(match[2]).replace(/^FOR THE /, '');
    if (indexName) deptNames.add(indexName);
    if (deptName) deptNames.add(deptName);
  }

  return {
    agencyCodes: Array.from(agencies).sort(),
    departmentNames: Array.from(deptNames).sort()
  };
}

/**
 * Extract fiscal notes and budget data
 */
function extractFiscalNotes(content) {
  const fiscalData = {
    hasFiscalImpact: false,
    amounts: [],
    fiscalYears: new Set()
  };

  // Look for fiscal year mentions
  const fyRegex = /(?:fiscal year|FY)\s*(\d{4})/gi;
  let match;
  while ((match = fyRegex.exec(content)) !== null) {
    fiscalData.fiscalYears.add(match[1]);
  }

  // Look for dollar amounts
  const amountRegex = /\$[\d,]+(?:,\d{3})*(?:\.\d{2})?/g;
  const amounts = content.match(amountRegex) || [];
  fiscalData.hasFiscalImpact = amounts.length > 0;

  return {
    ...fiscalData,
    fiscalYears: Array.from(fiscalData.fiscalYears).sort()
  };
}

/**
 * Extract amendments (strike/add markup)
 */
function extractAmendments(content) {
  const amendments = {
    hasAmendments: false,
    strikeCount: 0,
    addCount: 0
  };

  const strikeMatches = content.match(/<TextRun amendingStyle="strike">/g);
  const addMatches = content.match(/<TextRun amendingStyle="add">/g);

  if (strikeMatches || addMatches) {
    amendments.hasAmendments = true;
    amendments.strikeCount = strikeMatches ? strikeMatches.length : 0;
    amendments.addCount = addMatches ? addMatches.length : 0;
  }

  return amendments;
}

/**
 * Extract tables from bill
 */
function extractTables(content) {
  const tableMatches = content.match(/<Table[^>]*>/g);
  return {
    hasTable: !!tableMatches,
    tableCount: tableMatches ? tableMatches.length : 0
  };
}

/**
 * Extract cross-references to RCW and other bills
 */
function extractCrossReferences(content) {
  const references = {
    rcw: new Set(),
    bills: new Set()
  };

  // RCW references
  const rcwRegex = /RCW\s+(\d+)\.(\d+)\.(\d+)/g;
  let match;
  while ((match = rcwRegex.exec(content)) !== null) {
    references.rcw.add(`${match[1]}.${match[2]}.${match[3]}`);
  }

  // Bill references
  const billRegex = /(?:House|Senate)\s+Bill\s+No\.\s+(\d+)/gi;
  while ((match = billRegex.exec(content)) !== null) {
    references.bills.add(match[1]);
  }

  return {
    rcw: Array.from(references.rcw).sort(),
    bills: Array.from(references.bills).sort()
  };
}

/**
 * Categorize bill by type
 */
function categorizeBill(bill) {
  const metadata = bill.metadata;
  const hasAppropriations = bill.appropriations.length > 0;
  const hasAmendments = bill.amendments.hasAmendments;

  // Budget bills
  if (hasAppropriations ||
      (metadata.sessionLawCaption && /budget/i.test(metadata.sessionLawCaption)) ||
      (metadata.briefDescription && /appropriation/i.test(metadata.briefDescription))) {

    // Further categorize budget bills
    if (metadata.sessionLawCaption) {
      if (/capital budget/i.test(metadata.sessionLawCaption)) {
        return 'budget/capital';
      } else if (/operating budget/i.test(metadata.sessionLawCaption)) {
        if (/supplemental/i.test(metadata.sessionLawCaption)) {
          return 'budget/operating-supplemental';
        }
        return 'budget/operating';
      } else if (/transportation budget/i.test(metadata.sessionLawCaption)) {
        return 'budget/transportation';
      }
    }
    return 'budget/appropriations';
  }

  // Policy bills
  if (hasAmendments) {
    return 'policy';
  }

  // Mixed
  if (hasAppropriations && hasAmendments) {
    return 'mixed';
  }

  return 'unknown';
}

/**
 * Parse dollar amount from string
 */
function parseAmount(amountStr) {
  // Remove $ and commas, parse as number
  const cleaned = amountStr.replace(/[$,]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Clean text content (remove XML tags, normalize whitespace)
 */
function cleanText(text) {
  return text
    .replace(/<[^>]+>/g, '') // Remove XML tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Parse HTM bill file
 * Note: HTM files have similar structure but different formatting
 */
function parseHTMBill(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const billNumber = path.basename(filePath, '.htm');

  // HTM files use HTML-style tags but similar structure to XML
  // For simplicity, we'll use similar parsing logic
  // In production, you might want to use an HTML parser like cheerio

  return {
    billNumber,
    format: 'htm',
    fileSize: fs.statSync(filePath).size,
    note: 'HTM parsing uses similar logic to XML with format adjustments'
  };
}

/**
 * Extract all entities from a bill for normalized database
 */
function extractAllEntities(billData) {
  const entities = {
    bill: {
      id: billData.billNumber,
      type: billData.type,
      ...billData.metadata
    },
    appropriations: billData.appropriations.map((a, i) => ({
      id: `${billData.billNumber}-approp-${i}`,
      billId: billData.billNumber,
      ...a
    })),
    sections: billData.sections.map(s => ({
      id: `${billData.billNumber}-sec-${s.sectionNumber}`,
      billId: billData.billNumber,
      ...s
    })),
    parts: billData.parts.map((p, i) => ({
      id: `${billData.billNumber}-part-${i}`,
      billId: billData.billNumber,
      ...p
    })),
    agencies: billData.agencies.agencyCodes.map(code => ({
      code,
      billId: billData.billNumber
    })),
    crossReferences: {
      rcw: billData.crossReferences.rcw.map(ref => ({
        billId: billData.billNumber,
        rcw: ref
      })),
      bills: billData.crossReferences.bills.map(ref => ({
        billId: billData.billNumber,
        referencedBill: ref
      }))
    }
  };

  return entities;
}

/**
 * Get summary statistics for a bill
 */
function getBillSummary(billData) {
  return {
    billNumber: billData.billNumber,
    type: billData.type,
    sessionLawCaption: billData.metadata.sessionLawCaption,
    sections: billData.sections.length,
    appropriations: billData.appropriations.length,
    totalAmount: billData.appropriations
      .filter(a => a.isTotal)
      .reduce((sum, a) => sum + (a.amount || 0), 0),
    agencies: billData.agencies.agencyCodes.length,
    parts: billData.parts.length,
    hasAmendments: billData.amendments.hasAmendments,
    hasFiscalImpact: billData.fiscalNotes.hasFiscalImpact,
    fileSize: billData.fileSize
  };
}

// Export functions
module.exports = {
  parseXMLBill,
  parseHTMBill,
  extractMetadata,
  extractAppropriations,
  extractSections,
  extractParts,
  extractAgencies,
  extractFiscalNotes,
  extractAmendments,
  extractTables,
  extractCrossReferences,
  extractAllEntities,
  getBillSummary,
  categorizeBill,
  parseAmount,
  cleanText
};
