#!/usr/bin/env node

/**
 * Node.js script to extract data from HB 5092-S HTM file
 * Uses jsdom for HTML parsing in Node.js environment
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Read the HTML file
const htmlPath = path.join(__dirname, '5092-S.htm');
console.log('Reading HTML file:', htmlPath);
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Create JSDOM instance
const dom = new JSDOM(htmlContent);
const { window } = dom;
const { document } = window;

// Make DOMParser available globally
global.DOMParser = window.DOMParser;
global.document = document;

// BillExtractor class adapted for Node.js
class BillExtractor {
  constructor(htmlContent) {
    this.html = htmlContent;
    this.doc = document;
  }

  extractAll() {
    console.log('Extracting metadata...');
    const metadata = this.extractMetadata();

    console.log('Extracting parts...');
    const parts = this.extractParts();

    console.log('Extracting sections...');
    const sections = this.extractSections();

    console.log('Generating appropriations summary...');
    const appropriationsSummary = this.generateAppropriationsSummary(sections);

    console.log('Extracting RCW references...');
    const rcwReferences = this.extractRCWReferences();

    console.log('Extracting bill references...');
    const billReferences = this.extractBillReferences();

    console.log('Extracting veto information...');
    const vetoInformation = this.extractVetoInformation();

    console.log('Calculating fiscal impact...');
    const fiscalImpact = this.calculateFiscalImpact(sections);

    return {
      metadata,
      parts,
      sections,
      appropriationsSummary,
      rcwReferences,
      billReferences,
      vetoInformation,
      fiscalImpact
    };
  }

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

    const sponsorsMatch = html.match(/<!-- field: Sponsors -->(.*?)<!-- field: -->/);
    let sponsors = '';
    if (sponsorsMatch) {
      sponsors = this.cleanText(sponsorsMatch[1]);
    }

    const captionMatch = html.match(/<!-- field: CaptionsTitles -->(.*?)<!-- field: -->/s);
    let caption = '';
    if (captionMatch) {
      caption = this.cleanText(captionMatch[1]);
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

  extractSections() {
    const sections = [];
    const sectionRegex = /<span style="font-weight:bold;padding-right:0\.1in;">Sec\. (\d+)\.\s*<\/span><span style="font-weight:bold;"><span>(.*?)<\/span><\/span><!-- field: --><\/div>(.*?)(?=<div style="margin-top:0\.25in;text-indent:0\.5in;"><!-- field: BeginningSection --|<div style="margin-top:0\.1in;font-weight:bold;text-align:center;">--- END ---|$)/gs;

    let match;
    let count = 0;
    while ((match = sectionRegex.exec(this.html)) !== null) {
      count++;
      if (count % 50 === 0) {
        console.log(`  Processed ${count} sections...`);
      }

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

    console.log(`  Total sections extracted: ${sections.length}`);
    return sections;
  }

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

  extractTotalAppropriation(content) {
    const totalMatch = content.match(/TOTAL APPROPRIATION.*?text-align:right;">\$([0-9,]+)<\/div>/s);
    return totalMatch ? parseInt(totalMatch[1].replace(/,/g, '')) : null;
  }

  extractFTE(content) {
    const fteMatch = content.match(/FTE\s+(\d+\.\d+)/);
    return fteMatch ? parseFloat(fteMatch[1]) : null;
  }

  extractProvisos(content) {
    const provisos = [];
    const provisoRegex = /<div style="text-indent:0\.5in;">\((\d+)\)(.*?)<\/div>/g;
    let match;

    while ((match = provisoRegex.exec(content)) !== null) {
      const subsection = match[1];
      const text = this.cleanText(match[2]);

      const amounts = [];
      const amountRegex = /\$([0-9,]+)/g;
      let amountMatch;
      while ((amountMatch = amountRegex.exec(text)) !== null) {
        amounts.push(parseInt(amountMatch[1].replace(/,/g, '')));
      }

      const billRefs = this.extractBillReferencesFromText(text);
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

  extractRCWReferences() {
    const rcwRefs = new Set();
    const rcwRegex = /href='http:\/\/app\.leg\.wa\.gov\/RCW\/default\.aspx\?cite=([\d.A-Z]+)'/g;

    let match;
    while ((match = rcwRegex.exec(this.html)) !== null) {
      rcwRefs.add(match[1]);
    }

    return Array.from(rcwRefs).sort();
  }

  extractBillReferences() {
    const billRefs = new Set();
    const text = this.doc.body.textContent;

    const patterns = [
      /(?:Engrossed )?(?:Substitute )?(?:Second Substitute )?House Bill No\. (\d+)/gi,
      /(?:Engrossed )?(?:Substitute )?(?:Second Substitute )?Senate Bill No\. (\d+)/gi
    ];

    patterns.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      while ((match = regex.exec(text)) !== null) {
        billRefs.add(match[0]);
      }
    });

    return Array.from(billRefs).sort();
  }

  extractBillReferencesFromText(text) {
    const billRefs = [];
    const patterns = [
      /(?:Engrossed )?(?:Substitute )?(?:Second Substitute )?House Bill No\. (\d+)/gi,
      /(?:Engrossed )?(?:Substitute )?(?:Second Substitute )?Senate Bill No\. (\d+)/gi
    ];

    patterns.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      while ((match = regex.exec(text)) !== null) {
        billRefs.push(match[0]);
      }
    });

    return billRefs;
  }

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

    const vetoMessageMatch = this.html.match(/<div style="text-indent:0pt;margin-top:4\.5pt;"><span style="font-weight:bold;">.*?VETO MESSAGE.*?<\/span><\/div>(.*?)<div style="margin-top:0\.1in;font-weight:bold;text-align:center;">--- END ---<\/div>/s);

    return {
      hasVeto: true,
      vetoedSections: [...new Set(vetoedSections)],
      vetoMessage: vetoMessageMatch ? this.cleanText(vetoMessageMatch[1]) : null
    };
  }

  generateAppropriationsSummary(sections) {
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
        if (!summary.byFundType[app.fundType]) {
          summary.byFundType[app.fundType] = 0;
        }
        summary.byFundType[app.fundType] += app.amount;

        if (app.fiscalYear) {
          if (!summary.byFiscalYear[app.fiscalYear]) {
            summary.byFiscalYear[app.fiscalYear] = 0;
          }
          summary.byFiscalYear[app.fiscalYear] += app.amount;
        }
      });

      if (section.totalAppropriation) {
        summary.byAgency.push({
          sectionNumber: section.sectionNumber,
          agencyName: section.agencyName,
          totalAppropriation: section.totalAppropriation
        });
      }
    });

    summary.byAgency.sort((a, b) => b.totalAppropriation - a.totalAppropriation);

    return summary;
  }

  calculateFiscalImpact(sections) {
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

  cleanText(text) {
    // Remove HTML tags
    const cleaned = text.replace(/<[^>]*>/g, ' ');
    // Normalize whitespace
    return cleaned.replace(/\s+/g, ' ').trim();
  }
}

// Main execution
console.log('Starting extraction process...\n');
const extractor = new BillExtractor(htmlContent);
const data = extractor.extractAll();

// Save to JSON file
const outputPath = path.join(__dirname, 'hb5092-data.json');
console.log('\nSaving to JSON file:', outputPath);
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

console.log('\n✓ Extraction complete!');
console.log(`\nSummary:`);
console.log(`  Bill: ${data.metadata.billNumber}`);
console.log(`  Type: ${data.metadata.billType}`);
console.log(`  Chapter: ${data.metadata.chapter.number}, Laws of ${data.metadata.chapter.year}`);
console.log(`  Parts: ${data.parts.length}`);
console.log(`  Sections: ${data.sections.length}`);
console.log(`  Total Budget: $${(data.fiscalImpact.totalBienniumBudget / 1000000000).toFixed(2)}B`);
console.log(`  RCW References: ${data.rcwReferences.length}`);
console.log(`  Bill References: ${data.billReferences.length}`);
console.log(`  Vetoed Sections: ${data.vetoInformation ? data.vetoInformation.vetoedSections.length : 0}`);
