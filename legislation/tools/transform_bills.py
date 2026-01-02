#!/usr/bin/env python3
"""
Transform CSV legislation files to condensed bill schema.

Filters to bills only (type B), groups by (Biennium, BillNumber),
and outputs JSON files organized by biennium.
"""

import csv
import json
from pathlib import Path
from collections import defaultdict
from datetime import datetime


def encode_requested_by(row: dict) -> str | None:
    """Combine RequestedBy booleans into G/D/B/O string."""
    codes = []
    if row.get('RequestedByGovernor') == '1':
        codes.append('G')
    if row.get('RequestedByDepartment') == '1':
        codes.append('D')
    if row.get('RequestedByBudgetCommittee') == '1':
        codes.append('B')
    if row.get('RequestedByOther') == '1':
        codes.append('O')
    return ''.join(codes) if codes else None


def encode_fiscal_note(row: dict) -> str | None:
    """Combine fiscal booleans into SWF/Loc/SWF,Loc/null."""
    state = row.get('StateFiscalNote') == '1'
    local = row.get('LocalFiscalNote') == '1'

    if state and local:
        return 'SWF,Loc'
    elif state:
        return 'SWF'
    elif local:
        return 'Loc'
    return None


def parse_date(date_str: str) -> str | None:
    """Parse date string to YYYY-MM-DD format."""
    if not date_str:
        return None
    # Handle ISO format dates like 2023-01-09
    try:
        dt = datetime.fromisoformat(date_str.split('T')[0])
        return dt.strftime('%Y-%m-%d')
    except ValueError:
        return date_str


def determine_passed(status: str) -> bool:
    """Determine if bill passed based on status."""
    if not status:
        return False
    # Status starting with 'C ' indicates passed into law (chapter)
    return status.startswith('C ') or status.startswith('Chapter')


def extract_chamber(original_agency: str) -> str:
    """Extract chamber code from OriginalAgency."""
    if original_agency == 'House':
        return 'H'
    elif original_agency == 'Senate':
        return 'S'
    return original_agency[0] if original_agency else 'H'


def transform_biennium(csv_path: Path) -> list[dict]:
    """Transform a single biennium CSV file to condensed schema."""

    # Read and filter to bills only
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = [r for r in reader if r.get('ShortLegislationType.ShortLegislationType') == 'B']

    # Group by (Biennium, BillNumber)
    groups = defaultdict(list)
    for row in rows:
        key = (row['Biennium'], row['BillNumber'])
        groups[key].append(row)

    bills = []

    for (biennium, bill_number), versions in groups.items():
        # Sort versions by (SubstituteVersion, EngrossedVersion)
        versions.sort(key=lambda r: (
            int(r.get('SubstituteVersion') or 0),
            int(r.get('EngrossedVersion') or 0)
        ))

        # Use first row for stable fields (earliest version has intro date)
        first = versions[0]

        # Find active version (or highest if none active)
        active_versions = [v for v in versions if v.get('Active') == '1']
        if active_versions:
            # If multiple active, use highest version
            active_versions.sort(key=lambda r: (
                int(r.get('SubstituteVersion') or 0),
                int(r.get('EngrossedVersion') or 0)
            ))
            final_version = active_versions[-1]
        else:
            # No active version, use highest
            final_version = versions[-1]

        # Build versions array
        version_array = []
        for v in versions:
            version_obj = {
                'id': v['BillId'],
                'sub': int(v.get('SubstituteVersion') or 0),
                'eng': int(v.get('EngrossedVersion') or 0),
                'active': v.get('Active') == '1',
                'status': v.get('CurrentStatus.Status') or None
            }
            # Add optional fields if present
            if v.get('CurrentStatus.ActionDate'):
                version_obj['date'] = parse_date(v['CurrentStatus.ActionDate'])
            if v.get('CurrentStatus.AmendedByOppositeBody') == '1':
                version_obj['amended'] = True
            if v.get('CurrentStatus.AmendmentsExist') == '1':
                version_obj['amendments'] = True
            version_array.append(version_obj)

        # Extract companion (take first if exists)
        companion = None
        if first.get('Companions.Companion.BillId'):
            companion = first['Companions.Companion.BillId']

        # Build final status object
        final_obj = {
            'status': final_version.get('CurrentStatus.Status') or None,
            'action': final_version.get('CurrentStatus.HistoryLine') or None,
            'date': parse_date(final_version.get('CurrentStatus.ActionDate')),
            'passed': determine_passed(final_version.get('CurrentStatus.Status', '')),
            'vetoed': final_version.get('CurrentStatus.Veto') == '1',
            'partial_veto': final_version.get('CurrentStatus.PartialVeto') == '1'
        }

        # Build bill record
        bill = {
            'bien': biennium,
            'num': int(bill_number),
            'chamber': extract_chamber(first.get('OriginalAgency', '')),
            'intro': parse_date(first.get('IntroducedDate')),
            'short': first.get('ShortDescription') or None,
            'long': first.get('LongDescription') or None,
            'sponsor': first.get('Sponsor') or None,
            'sponsor_id': int(first['PrimeSponsorID']) if first.get('PrimeSponsorID') else None,
            'req': encode_requested_by(first),
            'fn': encode_fiscal_note(first),
            'approp': first.get('Appropriations') == '1',
            'companion': companion,
            'versions': version_array,
            'final': final_obj
        }

        bills.append(bill)

    # Sort by bill number
    bills.sort(key=lambda b: b['num'])

    return bills


def main():
    """Main entry point."""
    csv_dir = Path(__file__).parent / 'csv'
    output_dir = Path(__file__).parent / 'json'
    output_dir.mkdir(exist_ok=True)

    csv_files = sorted(csv_dir.glob('*.csv'))

    for csv_path in csv_files:
        biennium = csv_path.stem  # e.g., "2023-24"
        print(f"Processing {biennium}...")

        bills = transform_biennium(csv_path)

        output_path = output_dir / f'{biennium}.json'
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(bills, f, indent=2)

        print(f"  -> {len(bills)} bills written to {output_path.name}")

    print("Done!")


if __name__ == '__main__':
    main()
