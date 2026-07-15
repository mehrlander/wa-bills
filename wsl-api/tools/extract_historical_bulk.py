#!/usr/bin/env python3
"""
Split a bulk GetLegislationIntroducedSince XML pull into per-biennium CSVs
matching the column set already used in
data/GetLegislationSinceHistorical/csv/*.csv, so transform_bills.py can
build JSON from the output unchanged.

The WSL API's documented floor is 1991 (GetLegislationByYear returns
"Information is only available back to 1991." for earlier years). Any
sinceDate at or before 1991-01-01 returns everything the service has, every
biennium from 1991-92 through the current one, in a single response:

    curl -o bulk.xml \
      "https://wslwebservices.leg.wa.gov/LegislationService.asmx/GetLegislationIntroducedSince?sinceDate=1990-01-01"

That response is ~165 MB and is not checked in anywhere; only the derived
CSV/JSON are kept, matching how every other biennium in this directory is
stored. This script does the split; transform_bills.py does the CSV -> JSON
step, same as it already does for the other biennia.

Usage:
    python3 extract_historical_bulk.py bulk.xml [--biennia 1991-92,1993-94,...] [--out-dir DIR]

With no --biennia, every biennium found in the file is extracted.
"""

import argparse
import csv
import sys
from pathlib import Path
from xml.etree import ElementTree as ET

COLUMNS = [
    'Active', 'Appropriations', 'Biennium', 'BillId', 'BillNumber',
    'Companions', 'Companions.Companion.Biennium', 'Companions.Companion.BillId',
    'Companions.Companion.Status', 'CurrentStatus.ActionDate',
    'CurrentStatus.AmendedByOppositeBody', 'CurrentStatus.AmendmentsExist',
    'CurrentStatus.BillId', 'CurrentStatus.HistoryLine', 'CurrentStatus.PartialVeto',
    'CurrentStatus.Status', 'CurrentStatus.Veto', 'EngrossedVersion',
    'IntroducedDate', 'LegalTitle', 'LocalFiscalNote', 'LongDescription',
    'OriginalAgency', 'PrimeSponsorID', 'Request', 'RequestedByBudgetCommittee',
    'RequestedByDepartment', 'RequestedByGovernor', 'RequestedByOther',
    'ShortDescription', 'ShortLegislationType.LongLegislationType',
    'ShortLegislationType.ShortLegislationType', 'Sponsor', 'StateFiscalNote',
    'SubstituteVersion',
]


def bool01(text):
    if text is None:
        return '0'
    return '1' if text.strip().lower() == 'true' else '0'


def text_of(el, path):
    child = el.find(path)
    return child.text.strip() if child is not None and child.text else ''


def date_only(text):
    return text.split('T')[0] if text else ''


def strip_ns(el):
    if '}' in el.tag:
        el.tag = el.tag.split('}', 1)[1]
    for child in el:
        strip_ns(child)
    return el


def flatten_record(leg):
    row = {c: '' for c in COLUMNS}

    row['Active'] = bool01(text_of(leg, 'Active'))
    row['Appropriations'] = bool01(text_of(leg, 'Appropriations'))
    row['Biennium'] = text_of(leg, 'Biennium')
    row['BillId'] = text_of(leg, 'BillId')
    row['BillNumber'] = text_of(leg, 'BillNumber')

    comp = leg.find('Companions/Companion')
    if comp is not None:
        row['Companions.Companion.Biennium'] = text_of(comp, 'Biennium')
        row['Companions.Companion.BillId'] = text_of(comp, 'BillId')
        row['Companions.Companion.Status'] = text_of(comp, 'Status')

    cs = leg.find('CurrentStatus')
    if cs is not None:
        row['CurrentStatus.ActionDate'] = date_only(text_of(cs, 'ActionDate'))
        row['CurrentStatus.AmendedByOppositeBody'] = bool01(text_of(cs, 'AmendedByOppositeBody'))
        row['CurrentStatus.AmendmentsExist'] = bool01(text_of(cs, 'AmendmentsExist'))
        row['CurrentStatus.BillId'] = text_of(cs, 'BillId')
        row['CurrentStatus.HistoryLine'] = text_of(cs, 'HistoryLine')
        row['CurrentStatus.PartialVeto'] = bool01(text_of(cs, 'PartialVeto'))
        row['CurrentStatus.Status'] = text_of(cs, 'Status')
        row['CurrentStatus.Veto'] = bool01(text_of(cs, 'Veto'))

    row['EngrossedVersion'] = text_of(leg, 'EngrossedVersion')
    row['IntroducedDate'] = date_only(text_of(leg, 'IntroducedDate'))
    row['LegalTitle'] = text_of(leg, 'LegalTitle')
    row['LocalFiscalNote'] = bool01(text_of(leg, 'LocalFiscalNote'))
    row['LongDescription'] = text_of(leg, 'LongDescription')
    row['OriginalAgency'] = text_of(leg, 'OriginalAgency')
    row['PrimeSponsorID'] = text_of(leg, 'PrimeSponsorID')
    row['Request'] = text_of(leg, 'Request')
    row['RequestedByBudgetCommittee'] = bool01(text_of(leg, 'RequestedByBudgetCommittee'))
    row['RequestedByDepartment'] = bool01(text_of(leg, 'RequestedByDepartment'))
    row['RequestedByGovernor'] = bool01(text_of(leg, 'RequestedByGovernor'))
    row['RequestedByOther'] = bool01(text_of(leg, 'RequestedByOther'))
    row['ShortDescription'] = text_of(leg, 'ShortDescription')

    slt = leg.find('ShortLegislationType')
    if slt is not None:
        row['ShortLegislationType.LongLegislationType'] = text_of(slt, 'LongLegislationType')
        row['ShortLegislationType.ShortLegislationType'] = text_of(slt, 'ShortLegislationType')

    row['Sponsor'] = text_of(leg, 'Sponsor')
    row['StateFiscalNote'] = bool01(text_of(leg, 'StateFiscalNote'))
    row['SubstituteVersion'] = text_of(leg, 'SubstituteVersion')

    return row


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('xml_path', type=Path)
    parser.add_argument('--biennia', help='Comma-separated list, e.g. 1991-92,1993-94. Default: all found.')
    parser.add_argument('--out-dir', type=Path, default=Path('csv'))
    args = parser.parse_args()

    target = set(args.biennia.split(',')) if args.biennia else None
    args.out_dir.mkdir(parents=True, exist_ok=True)

    writers, files, counts = {}, {}, {}
    total_seen = 0

    for event, el in ET.iterparse(str(args.xml_path), events=('end',)):
        tag = el.tag.rsplit('}', 1)[-1]
        if tag != 'Legislation':
            continue
        total_seen += 1
        strip_ns(el)

        biennium = text_of(el, 'Biennium')
        if target is None or biennium in target:
            if biennium not in writers:
                f = open(args.out_dir / f'{biennium}.csv', 'w', newline='', encoding='utf-8')
                w = csv.DictWriter(f, fieldnames=COLUMNS, lineterminator='\n')
                w.writeheader()
                writers[biennium] = w
                files[biennium] = f
                counts[biennium] = 0
            writers[biennium].writerow(flatten_record(el))
            counts[biennium] += 1

        el.clear()
        if total_seen % 200000 == 0:
            print(f'...{total_seen} Legislation elements scanned', file=sys.stderr)

    for f in files.values():
        f.close()

    print(f'Total Legislation elements scanned: {total_seen}')
    for b in sorted(counts):
        print(f'{b}: {counts[b]} rows (all legislation types; filter to type B before/after JSON build)')


if __name__ == '__main__':
    main()
