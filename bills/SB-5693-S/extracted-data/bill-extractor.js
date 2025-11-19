/**
 * Washington State Bill Data Extraction Library
 * Extracts structured data from WA legislative bills (XML and HTML formats)
 * Compatible with browser and Node.js environments
 */

(function(global) {
  'use strict';

  const BillExtractor = {
    version: '1.0.0',

    /**
     * Extract all data from XML content
     * @param {string} xmlContent - The XML content of the bill
     * @returns {Object} Complete extracted bill data
     */
    extractFromXML: function(xmlContent) {
      const parser = this._getXMLParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

      return {
        metadata: this.extractMetadata(xmlDoc),
        agencies: this.extractAgencies(xmlDoc),
        appropriations: this.extractAppropriations(xmlDoc),
        statutoryReferences: this.extractStatutoryReferences(xmlDoc),
        dates: this.extractDates(xmlDoc),
        fiscalImpacts: this.extractFiscalImpacts(xmlDoc),
        programs: this.extractPrograms(xmlDoc),
        vetoes: this.extractVetoes(xmlDoc),
        billSections: this.extractBillSections(xmlDoc)
      };
    },

    /**
     * Extract bill metadata
     * @param {XMLDocument} xmlDoc
     * @returns {Object}
     */
    extractMetadata: function(xmlDoc) {
      return {
        billId: this._getTextContent(xmlDoc, 'ShortBillId'),
        longBillId: this._getTextContent(xmlDoc, 'LongBillId'),
        billType: 'Supplemental Operating Budget',
        sessionLawCaption: this._getTextContent(xmlDoc, 'SessionLawCaption'),
        chapterLaw: this._getTextContent(xmlDoc, 'ChapterLaw'),
        chapterYear: this._getAttr(xmlDoc, 'ChapterLaw', 'year'),
        legislature: this._getTextContent(xmlDoc, 'Legislature'),
        session: this._getTextContent(xmlDoc, 'Session'),
        sponsors: this._getTextContent(xmlDoc, 'Sponsors'),
        briefDescription: this._getTextContent(xmlDoc, 'BriefDescription'),
        vetoAction: this._getTextContent(xmlDoc, 'VetoAction')
      };
    },

    /**
     * Extract all agencies/departments
     * @param {XMLDocument} xmlDoc
     * @returns {Array}
     */
    extractAgencies: function(xmlDoc) {
      const agencies = [];
      const deptElements = xmlDoc.getElementsByTagName('Department');

      for (let i = 0; i < deptElements.length; i++) {
        const dept = deptElements[i];
        const indexEl = dept.getElementsByTagName('Index')[0];
        const deptNameEl = dept.getElementsByTagName('DeptName')[0];

        const agencyCode = dept.parentElement &&
          dept.parentElement.tagName === 'BillSectionHeader' &&
          dept.parentElement.nextElementSibling &&
          dept.parentElement.nextElementSibling.getAttribute('agency');

        agencies.push({
          name: indexEl ? this._getElementText(indexEl) : '',
          displayName: deptNameEl ? this._getElementText(deptNameEl) : '',
          agencyCode: agencyCode || '',
          sectionNumber: this._findSectionNumber(dept)
        });
      }

      return agencies;
    },

    /**
     * Extract all appropriations with amounts and accounts
     * @param {XMLDocument} xmlDoc
     * @returns {Array}
     */
    extractAppropriations: function(xmlDoc) {
      const appropriations = [];
      const appropElements = xmlDoc.getElementsByTagName('Appropriations');

      for (let i = 0; i < appropElements.length; i++) {
        const appropSection = appropElements[i];
        const agencyCode = appropSection.getAttribute('agency');
        const agency = this._findAgencyName(appropSection);
        const sectionNumber = this._findSectionNumber(appropSection);

        const appropItems = appropSection.getElementsByTagName('Appropriation');

        for (let j = 0; j < appropItems.length; j++) {
          const item = appropItems[j];
          const accountEl = item.getElementsByTagName('AccountName')[0];
          const amountEl = item.getElementsByTagName('DollarAmount')[0];

          if (accountEl && amountEl) {
            const account = this._getElementText(accountEl).trim();
            const amountData = this._parseAmountWithChanges(amountEl);

            if (account && (amountData.newAmount || amountData.oldAmount)) {
              appropriations.push({
                agency: agency,
                agencyCode: agencyCode,
                sectionNumber: sectionNumber,
                accountName: account,
                fiscalYear: this._extractFiscalYear(account),
                oldAmount: amountData.oldAmount,
                newAmount: amountData.newAmount,
                changeAmount: amountData.changeAmount,
                isNew: amountData.isNew,
                isStrike: amountData.isStrike
              });
            }
          }
        }

        // Also extract totals
        const totals = appropSection.getElementsByTagName('AppropriationTotal');
        for (let k = 0; k < totals.length; k++) {
          const totalEl = totals[k];
          const amountEl = totalEl.getElementsByTagName('DollarAmount')[0];

          if (amountEl) {
            const amountData = this._parseAmountWithChanges(amountEl);

            appropriations.push({
              agency: agency,
              agencyCode: agencyCode,
              sectionNumber: sectionNumber,
              accountName: 'TOTAL APPROPRIATION',
              fiscalYear: null,
              oldAmount: amountData.oldAmount,
              newAmount: amountData.newAmount,
              changeAmount: amountData.changeAmount,
              isTotal: true,
              isNew: amountData.isNew,
              isStrike: amountData.isStrike
            });
          }
        }
      }

      return appropriations;
    },

    /**
     * Extract statutory references (RCW citations)
     * @param {XMLDocument} xmlDoc
     * @returns {Array}
     */
    extractStatutoryReferences: function(xmlDoc) {
      const references = new Set();
      const textContent = xmlDoc.documentElement.textContent;

      // Match RCW patterns like "RCW 12.34.567" or "chapter 12.34 RCW"
      const rcwPattern = /\b(?:RCW\s+(\d+\.\d+\.\d+)|chapter\s+(\d+\.\d+)\s+RCW)\b/g;
      let match;

      while ((match = rcwPattern.exec(textContent)) !== null) {
        const rcw = match[1] || match[2];
        if (rcw) {
          references.add(rcw);
        }
      }

      // Also check SectionCite elements
      const sectionCites = xmlDoc.getElementsByTagName('SectionCite');
      for (let i = 0; i < sectionCites.length; i++) {
        const cite = this._getElementText(sectionCites[i]);
        if (cite) references.add(cite);
      }

      return Array.from(references).sort();
    },

    /**
     * Extract all dates mentioned in the bill
     * @param {XMLDocument} xmlDoc
     * @returns {Object}
     */
    extractDates: function(xmlDoc) {
      return {
        effectiveDate: this._getTextContent(xmlDoc, 'EffectiveDate'),
        senatePassed: this._getPassageDate(xmlDoc, 's'),
        housePassed: this._getPassageDate(xmlDoc, 'h'),
        approved: this._getTextContent(xmlDoc, 'ApprovedDate'),
        filed: this._getTextContent(xmlDoc, 'FiledDate'),
        readFirstTime: this._extractFirstReading(xmlDoc),
        allMentionedDates: this._extractAllDates(xmlDoc)
      };
    },

    /**
     * Extract fiscal impact data
     * @param {XMLDocument} xmlDoc
     * @returns {Object}
     */
    extractFiscalImpacts: function(xmlDoc) {
      const appropriations = this.extractAppropriations(xmlDoc);

      const byFiscalYear = {};
      const byAgency = {};
      let totalOld = 0;
      let totalNew = 0;

      appropriations.forEach(approp => {
        if (approp.isTotal && !approp.fiscalYear) {
          // Skip grand totals to avoid double counting
          return;
        }

        const oldVal = this._parseMoneyValue(approp.oldAmount);
        const newVal = this._parseMoneyValue(approp.newAmount);

        if (approp.fiscalYear) {
          if (!byFiscalYear[approp.fiscalYear]) {
            byFiscalYear[approp.fiscalYear] = { old: 0, new: 0, change: 0 };
          }
          byFiscalYear[approp.fiscalYear].old += oldVal;
          byFiscalYear[approp.fiscalYear].new += newVal;
          byFiscalYear[approp.fiscalYear].change += (newVal - oldVal);
        }

        const agencyKey = approp.agency || approp.agencyCode || 'Unknown';
        if (!byAgency[agencyKey]) {
          byAgency[agencyKey] = { old: 0, new: 0, change: 0, agencyCode: approp.agencyCode };
        }
        byAgency[agencyKey].old += oldVal;
        byAgency[agencyKey].new += newVal;
        byAgency[agencyKey].change += (newVal - oldVal);

        totalOld += oldVal;
        totalNew += newVal;
      });

      return {
        byFiscalYear: byFiscalYear,
        byAgency: byAgency,
        total: {
          old: totalOld,
          new: totalNew,
          change: totalNew - totalOld
        }
      };
    },

    /**
     * Extract programs and grants mentioned in conditions and limitations
     * @param {XMLDocument} xmlDoc
     * @returns {Array}
     */
    extractPrograms: function(xmlDoc) {
      const programs = [];
      const paragraphs = xmlDoc.getElementsByTagName('P');

      for (let i = 0; i < paragraphs.length; i++) {
        const text = this._getElementText(paragraphs[i]);

        // Look for "provided solely for" pattern
        if (text.includes('provided solely for')) {
          const amounts = this._extractMoneyAmounts(text);
          const sectionNum = this._findSectionNumber(paragraphs[i]);

          programs.push({
            sectionNumber: sectionNum,
            description: text.substring(0, 500), // First 500 chars
            amounts: amounts,
            fullText: text
          });
        }
      }

      return programs;
    },

    /**
     * Extract veto information
     * @param {XMLDocument} xmlDoc
     * @returns {Array}
     */
    extractVetoes: function(xmlDoc) {
      const vetoes = [];
      const allSections = xmlDoc.getElementsByTagName('BillSection');

      for (let i = 0; i < allSections.length; i++) {
        const section = allSections[i];
        if (section.hasAttribute('veto')) {
          const vetoType = section.getAttribute('veto');
          const sectionNum = this._findSectionNumber(section);

          // Find line vetoes within the section
          const allTextRuns = section.getElementsByTagName('TextRun');
          const lineVetoTexts = [];
          for (let j = 0; j < allTextRuns.length; j++) {
            if (allTextRuns[j].getAttribute('lineVeto') === 'yes') {
              lineVetoTexts.push(this._getElementText(allTextRuns[j]));
            }
          }

          vetoes.push({
            sectionNumber: sectionNum,
            vetoType: vetoType,
            lineVetoes: lineVetoTexts,
            hasLineVetoes: lineVetoTexts.length > 0
          });
        }
      }

      return vetoes;
    },

    /**
     * Extract bill sections structure
     * @param {XMLDocument} xmlDoc
     * @returns {Array}
     */
    extractBillSections: function(xmlDoc) {
      const sections = [];
      const billSections = xmlDoc.getElementsByTagName('BillSection');

      for (let i = 0; i < billSections.length; i++) {
        const section = billSections[i];
        const header = section.getElementsByTagName('BillSectionHeader')[0];

        if (header) {
          const sectionNum = this._findSectionNumber(section);
          const dept = section.getElementsByTagName('Department')[0];
          const agency = dept ? this._getElementText(dept.getElementsByTagName('Index')[0]) : '';

          sections.push({
            sectionNumber: sectionNum,
            type: section.getAttribute('type'),
            action: section.getAttribute('action'),
            agency: agency,
            hasVeto: section.hasAttribute('veto'),
            vetoType: section.getAttribute('veto')
          });
        }
      }

      return sections;
    },

    // ==================== Helper Methods ====================

    _getXMLParser: function() {
      if (typeof DOMParser !== 'undefined') {
        return new DOMParser();
      } else if (typeof require !== 'undefined') {
        // Node.js environment
        const { DOMParser } = require('xmldom');
        return new DOMParser();
      }
      throw new Error('No XML parser available');
    },

    _getTextContent: function(xmlDoc, tagName) {
      const elements = xmlDoc.getElementsByTagName(tagName);
      return elements.length > 0 ? this._getElementText(elements[0]) : '';
    },

    _getElementText: function(element) {
      if (!element) return '';
      return element.textContent || element.text || '';
    },

    _getAttr: function(xmlDoc, tagName, attrName) {
      const elements = xmlDoc.getElementsByTagName(tagName);
      return elements.length > 0 ? elements[0].getAttribute(attrName) : '';
    },

    _findSectionNumber: function(element) {
      // Walk up the DOM to find the section number
      let current = element;
      while (current && current.tagName !== 'Bill') {
        if (current.tagName === 'BillSection') {
          const header = current.getElementsByTagName('BillSectionHeader')[0];
          if (header) {
            const numEl = header.getElementsByTagName('BillSectionNumber')[0];
            if (numEl) {
              const valueEl = numEl.getElementsByTagName('Value')[0];
              if (valueEl) {
                return this._getElementText(valueEl);
              }
            }
          }
        }
        current = current.parentElement;
      }
      return '';
    },

    _findAgencyName: function(element) {
      // Walk up to find Department element
      let current = element;
      while (current && current.tagName !== 'Bill') {
        const dept = current.getElementsByTagName('Department')[0];
        if (dept) {
          const indexEl = dept.getElementsByTagName('Index')[0];
          if (indexEl) {
            return this._getElementText(indexEl);
          }
        }
        current = current.parentElement;
      }
      return '';
    },

    _parseAmountWithChanges: function(amountElement) {
      const result = {
        oldAmount: null,
        newAmount: null,
        changeAmount: null,
        isNew: false,
        isStrike: false
      };

      if (!amountElement) return result;

      const textRuns = amountElement.getElementsByTagName('TextRun');

      for (let i = 0; i < textRuns.length; i++) {
        const run = textRuns[i];
        const style = run.getAttribute('amendingStyle');
        const text = this._getElementText(run).trim();

        if (style === 'strike') {
          result.oldAmount = text;
          result.isStrike = true;
        } else if (style === 'add') {
          result.newAmount = text;
          result.isNew = true;
        } else if (!style && text) {
          // No amending style means it's unchanged
          result.oldAmount = text;
          result.newAmount = text;
        }
      }

      // If no TextRuns, get direct text
      if (textRuns.length === 0) {
        const text = this._getElementText(amountElement).trim();
        if (text) {
          result.oldAmount = text;
          result.newAmount = text;
        }
      }

      // Calculate change
      if (result.oldAmount && result.newAmount) {
        const oldVal = this._parseMoneyValue(result.oldAmount);
        const newVal = this._parseMoneyValue(result.newAmount);
        result.changeAmount = newVal - oldVal;
      }

      return result;
    },

    _parseMoneyValue: function(moneyString) {
      if (!moneyString) return 0;
      // Remove $, commas, and convert to number
      const cleaned = moneyString.replace(/[$,]/g, '');
      return parseFloat(cleaned) || 0;
    },

    _extractFiscalYear: function(accountName) {
      if (!accountName) return null;

      if (accountName.includes('FY 2022')) return 'FY 2022';
      if (accountName.includes('FY 2023')) return 'FY 2023';
      if (accountName.includes('fiscal year 2022')) return 'FY 2022';
      if (accountName.includes('fiscal year 2023')) return 'FY 2023';

      return null;
    },

    _getPassageDate: function(xmlDoc, chamber) {
      const allPassedBy = xmlDoc.getElementsByTagName('PassedBy');
      for (let i = 0; i < allPassedBy.length; i++) {
        if (allPassedBy[i].getAttribute('chamber') === chamber) {
          const dateEl = allPassedBy[i].getElementsByTagName('PassedDate')[0];
          if (dateEl) {
            return {
              date: this._getElementText(dateEl),
              yeas: this._getElementText(allPassedBy[i].getElementsByTagName('Yeas')[0]),
              nays: this._getElementText(allPassedBy[i].getElementsByTagName('Nays')[0])
            };
          }
        }
      }
      return null;
    },

    _extractFirstReading: function(xmlDoc) {
      const readDate = this._getTextContent(xmlDoc, 'ReadDate');
      if (readDate) {
        const match = readDate.match(/(\d{2}\/\d{2}\/\d{2})/);
        return match ? match[1] : readDate;
      }
      return '';
    },

    _extractAllDates: function(xmlDoc) {
      const dates = [];
      const datePattern = /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/g;
      const datePattern2 = /\b\d{2}\/\d{2}\/\d{2}\b/g;

      const text = xmlDoc.documentElement.textContent;

      let match;
      while ((match = datePattern.exec(text)) !== null) {
        if (!dates.includes(match[0])) {
          dates.push(match[0]);
        }
      }

      while ((match = datePattern2.exec(text)) !== null) {
        if (!dates.includes(match[0])) {
          dates.push(match[0]);
        }
      }

      return dates;
    },

    _extractMoneyAmounts: function(text) {
      const amounts = [];
      const pattern = /\$[\d,]+/g;
      let match;

      while ((match = pattern.exec(text)) !== null) {
        amounts.push(match[0]);
      }

      return amounts;
    }
  };

  // Export for different environments
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = BillExtractor;
  } else if (typeof define === 'function' && define.amd) {
    define([], function() { return BillExtractor; });
  } else {
    global.BillExtractor = BillExtractor;
  }

})(typeof window !== 'undefined' ? window : this);
