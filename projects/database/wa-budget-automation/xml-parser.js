/**
 * XML Parser for WA Budget Bills
 * Handles parsing of XML-formatted budget bills from WA Legislature
 */

import { XMLParser } from 'fast-xml-parser';
import { readFileSync } from 'fs';

/**
 * Parse XML budget bill file
 */
export function parseXMLBill(filePath) {
  console.log(`Parsing XML file: ${filePath}`);

  const xmlContent = readFileSync(filePath, 'utf-8');

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    parseTagValue: false,
    parseAttributeValue: false,
    trimValues: true,
    ignoreDeclaration: true,
    removeNSPrefix: true
  });

  const parsed = parser.parse(xmlContent);

  return parsed;
}

/**
 * Extract sections from parsed XML
 * WA bills use <section> tags with nested structure
 */
export function extractSections(parsedXML) {
  const sections = [];

  // Navigate the XML structure - actual structure may vary
  // This is a template that should be adjusted based on actual bill XML
  const body = parsedXML?.bill?.body || parsedXML?.body;

  if (!body) {
    console.warn('Could not find bill body in XML');
    return sections;
  }

  // Extract section elements
  const sectionElements = Array.isArray(body.section) ? body.section : [body.section];

  for (const section of sectionElements) {
    if (!section) continue;

    sections.push({
      number: section['@_number'] || section['@_id'],
      title: extractSectionTitle(section),
      content: extractSectionContent(section),
      subsections: extractSubsections(section),
      raw: section
    });
  }

  return sections;
}

/**
 * Extract section title
 */
function extractSectionTitle(section) {
  return section.title || section.heading || section['@_title'] || '';
}

/**
 * Extract section content as text
 */
function extractSectionContent(section) {
  if (typeof section === 'string') return section;
  if (section['#text']) return section['#text'];

  // Recursively extract text from nested elements
  let text = '';
  for (const [key, value] of Object.entries(section)) {
    if (key.startsWith('@_')) continue; // Skip attributes
    if (key === 'subsection') continue; // Handle separately

    if (typeof value === 'string') {
      text += value + ' ';
    } else if (typeof value === 'object') {
      text += extractSectionContent(value) + ' ';
    }
  }

  return text.trim();
}

/**
 * Extract subsections
 */
function extractSubsections(section) {
  const subsections = [];

  if (!section.subsection) return subsections;

  const subsectionElements = Array.isArray(section.subsection)
    ? section.subsection
    : [section.subsection];

  for (const subsec of subsectionElements) {
    if (!subsec) continue;

    subsections.push({
      number: subsec['@_number'] || subsec['@_id'],
      content: extractSectionContent(subsec),
      raw: subsec
    });
  }

  return subsections;
}

/**
 * Extract table data from section
 * Budget bills often have appropriations in table format
 */
export function extractTables(section) {
  const tables = [];

  if (!section.table && !section.raw?.table) {
    return tables;
  }

  const tableElements = Array.isArray(section.raw?.table)
    ? section.raw.table
    : [section.raw?.table];

  for (const table of tableElements) {
    if (!table) continue;

    const rows = extractTableRows(table);
    tables.push({
      caption: table.caption || '',
      headers: rows[0] || [],
      data: rows.slice(1),
      raw: table
    });
  }

  return tables;
}

/**
 * Extract rows from table
 */
function extractTableRows(table) {
  const rows = [];

  if (!table.tr) return rows;

  const rowElements = Array.isArray(table.tr) ? table.tr : [table.tr];

  for (const row of rowElements) {
    if (!row) continue;

    const cells = [];
    const cellElements = Array.isArray(row.td) ? row.td : [row.td];

    for (const cell of cellElements) {
      if (cell === undefined) continue;
      cells.push(typeof cell === 'object' ? cell['#text'] || '' : cell);
    }

    rows.push(cells);
  }

  return rows;
}

/**
 * Find sections by pattern (e.g., agency sections)
 */
export function findSectionsByPattern(sections, pattern) {
  return sections.filter(section => {
    const title = section.title.toLowerCase();
    const content = section.content.toLowerCase();

    if (typeof pattern === 'string') {
      return title.includes(pattern.toLowerCase()) || content.includes(pattern.toLowerCase());
    } else if (pattern instanceof RegExp) {
      return pattern.test(title) || pattern.test(content);
    }

    return false;
  });
}

/**
 * Extract metadata from bill XML
 */
export function extractBillMetadata(parsedXML) {
  const bill = parsedXML?.bill || parsedXML;

  return {
    billId: bill['@_id'] || '',
    billNumber: bill['@_number'] || '',
    session: bill['@_session'] || '',
    title: bill.title || '',
    sponsor: bill.sponsor || '',
    effectiveDate: bill['@_effective'] || bill.effectiveDate || ''
  };
}
