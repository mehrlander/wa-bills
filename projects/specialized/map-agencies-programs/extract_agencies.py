#!/usr/bin/env python3
"""
Extract and analyze agencies, programs, and organizational relationships from WA state bills.
"""

import json
import re
import xml.etree.ElementTree as ET
from collections import defaultdict, Counter
from pathlib import Path
from typing import Dict, List, Set, Tuple
import html


class AgencyExtractor:
    def __init__(self):
        self.agencies = defaultdict(lambda: {
            'bills': set(),
            'appropriations': [],
            'actions': defaultdict(list),
            'programs': set(),
            'relationships': defaultdict(set),
            'total_funding': 0.0,
            'mentions': 0
        })

        # Common WA state agency patterns
        self.agency_patterns = [
            # Department patterns
            r'department of [\w\s,]+',
            r'office of [\w\s,]+',
            r'commission on [\w\s,]+',
            r'board of [\w\s,]+',
            r'council (?:on|for) [\w\s,]+',
            r'division of [\w\s,]+',
            r'bureau of [\w\s,]+',
            r'agency (?:on|for|of) [\w\s,]+',
            r'authority (?:on|for|of) [\w\s,]+',
            r'center for [\w\s,]+',
            r'institute (?:on|for|of) [\w\s,]+',
            r'task force (?:on|for) [\w\s,]+',
            r'committee (?:on|for) [\w\s,]+',
        ]

        # Action verbs that indicate context
        self.action_patterns = {
            'funding': [
                r'appropriat(?:ed|ion)',
                r'fund(?:ed|ing|s)',
                r'grant(?:ed|s)',
                r'allocat(?:ed|ion)',
                r'budget(?:ed)?',
                r'provid(?:ed|ing) solely',
                r'\$[\d,]+',
            ],
            'creation': [
                r'establish(?:ed|ing|es)?',
                r'creat(?:ed|ing|es)?',
                r'form(?:ed|ing)?',
                r'new (?:program|office|department|division)',
                r'institur(?:ed|ing)?',
            ],
            'modification': [
                r'amend(?:ed|ing|s)?',
                r'modify(?:ing|ied|ies)?',
                r'chang(?:ed|ing|es)?',
                r'revis(?:ed|ing|es)?',
                r'update(?:d|ing|s)?',
                r'alter(?:ed|ing|s)?',
            ],
            'transfer': [
                r'transfer(?:red|ring|s)?',
                r'reassign(?:ed|ing|s)?',
                r'moved?',
                r'shift(?:ed|ing|s)?',
                r'relocation',
            ],
            'collaboration': [
                r'collaborat(?:e|ion|ing)',
                r'partner(?:ship|ing)?',
                r'coordinat(?:e|ion|ing)',
                r'cooperat(?:e|ion|ing)',
                r'work(?:ing)? with',
                r'in consultation with',
            ],
            'oversight': [
                r'oversee(?:ing|s)?',
                r'supervis(?:e|ion|ing)',
                r'monitor(?:ing|s)?',
                r'review(?:ing|s)?',
                r'audit(?:ing|s)?',
                r'evaluat(?:e|ion|ing)',
            ],
            'reporting': [
                r'report(?:ing|s)?',
                r'submit(?:ting|s)?',
                r'provid(?:e|ing) (?:information|data)',
                r'notif(?:y|ication)',
            ],
        }

        self.namespace = {'doc': 'http://leg.wa.gov/2012/document'}

    def normalize_agency_name(self, name: str) -> str:
        """Normalize agency names for consistent identification."""
        # Remove extra whitespace
        name = ' '.join(name.split())

        # Convert to title case for consistency
        name = name.strip().title()

        # Handle common abbreviations
        replacements = {
            'Dcyf': 'DCYF',
            'Dshs': 'DSHS',
            'Doh': 'DOH',
            'Dnr': 'DNR',
            'Wdfw': 'WDFW',
            'Wsda': 'WSDA',
            'Ospi': 'OSPI',
            'Uw': 'UW',
            'Wwu': 'WWU',
            'Wsu': 'WSU',
            'Gov ': 'GOV ',
            'Rco': 'RCO',
            'Ots': 'OTS',
            'Ofm': 'OFM',
        }

        for old, new in replacements.items():
            name = name.replace(old, new)

        return name

    def extract_dollar_amount(self, text: str) -> float:
        """Extract dollar amount from text."""
        # Look for patterns like $123,456,789 or $123.456 million
        amounts = re.findall(r'\$[\d,]+(?:\.\d+)?', text)
        total = 0.0

        for amount in amounts:
            try:
                # Remove $ and commas, convert to float
                value = float(amount.replace('$', '').replace(',', ''))

                # Check for million/billion multipliers in nearby text
                context = text[max(0, text.index(amount)-20):min(len(text), text.index(amount)+50)]
                if 'million' in context.lower():
                    value *= 1_000_000
                elif 'billion' in context.lower():
                    value *= 1_000_000_000

                total += value
            except (ValueError, AttributeError):
                continue

        return total

    def detect_action_context(self, text: str) -> Set[str]:
        """Detect what actions are being performed based on text context."""
        actions = set()
        text_lower = text.lower()

        for action_type, patterns in self.action_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    actions.add(action_type)
                    break

        return actions

    def extract_agencies_from_xml(self, xml_file: Path) -> None:
        """Extract agencies and programs from a single XML bill file."""
        print(f"Processing {xml_file.name}...")

        try:
            tree = ET.parse(xml_file)
            root = tree.getroot()
        except ET.ParseError as e:
            print(f"  Error parsing {xml_file}: {e}")
            return

        bill_id = xml_file.stem

        # Extract from Department tags (explicit agency sections)
        for dept in root.findall('.//doc:Department', self.namespace):
            dept_name_elem = dept.find('.//doc:DeptName', self.namespace)
            if dept_name_elem is not None:
                # Get the text content
                dept_text = ''.join(dept_name_elem.itertext()).strip()
                # Remove "FOR THE" prefix
                dept_text = re.sub(r'^FOR THE\s+', '', dept_text, flags=re.IGNORECASE)

                agency_name = self.normalize_agency_name(dept_text)

                if agency_name:
                    self.agencies[agency_name]['bills'].add(bill_id)
                    self.agencies[agency_name]['mentions'] += 1

                    # Get parent BillSection for context - find manually
                    section = None
                    for elem in root.iter():
                        if dept in list(elem):
                            if elem.tag.endswith('BillSection'):
                                section = elem
                                break

                    if section is not None:
                        section_text = ''.join(section.itertext())

                        # Extract appropriations
                        appropriations = section.findall('.//doc:Appropriation', self.namespace)
                        for app in appropriations:
                            app_text = ''.join(app.itertext())
                            amount = self.extract_dollar_amount(app_text)

                            if amount > 0:
                                account_name = app.find('.//doc:AccountName', self.namespace)
                                account = ''.join(account_name.itertext()).strip() if account_name is not None else 'Unknown'

                                self.agencies[agency_name]['appropriations'].append({
                                    'bill': bill_id,
                                    'amount': amount,
                                    'account': account
                                })
                                self.agencies[agency_name]['total_funding'] += amount

                        # Detect actions
                        actions = self.detect_action_context(section_text)
                        for action in actions:
                            self.agencies[agency_name]['actions'][action].append({
                                'bill': bill_id,
                                'context': section_text[:200]
                            })

        # Extract from all text content to find additional agency mentions
        full_text = ''.join(root.itertext())

        # Find agency mentions using patterns
        for pattern in self.agency_patterns:
            matches = re.finditer(pattern, full_text, re.IGNORECASE)
            for match in matches:
                agency_name = self.normalize_agency_name(match.group(0))

                if agency_name and len(agency_name) > 5:  # Filter out very short matches
                    self.agencies[agency_name]['bills'].add(bill_id)
                    self.agencies[agency_name]['mentions'] += 1

                    # Get surrounding context for action detection
                    start = max(0, match.start() - 200)
                    end = min(len(full_text), match.end() + 200)
                    context = full_text[start:end]

                    actions = self.detect_action_context(context)
                    for action in actions:
                        self.agencies[agency_name]['actions'][action].append({
                            'bill': bill_id,
                            'context': context[:200]
                        })

        # Extract program mentions
        program_patterns = [
            r'[\w\s]+ program',
            r'[\w\s]+ initiative',
            r'[\w\s]+ project',
            r'[\w\s]+ service',
        ]

        for pattern in program_patterns:
            matches = re.finditer(pattern, full_text, re.IGNORECASE)
            for match in matches:
                program = match.group(0).strip().title()
                if len(program) > 10 and len(program) < 100:  # Filter reasonable lengths
                    # Try to associate with nearby agency
                    start = max(0, match.start() - 500)
                    nearby_text = full_text[start:match.start()]

                    for agency_pattern in self.agency_patterns[:5]:  # Check main patterns
                        agency_matches = list(re.finditer(agency_pattern, nearby_text, re.IGNORECASE))
                        if agency_matches:
                            agency_name = self.normalize_agency_name(agency_matches[-1].group(0))
                            if agency_name:
                                self.agencies[agency_name]['programs'].add(program)
                                break

    def extract_relationships(self) -> None:
        """Extract relationships between agencies based on co-mentions and actions."""
        # Build relationship graph based on transfer and collaboration actions
        for agency_name, agency_data in self.agencies.items():
            # Check transfer actions
            for transfer_action in agency_data['actions'].get('transfer', []):
                context = transfer_action['context'].lower()

                # Find other agencies mentioned in transfer context
                for other_agency in self.agencies.keys():
                    if other_agency != agency_name and other_agency.lower() in context:
                        self.agencies[agency_name]['relationships']['transfer'].add(other_agency)
                        self.agencies[other_agency]['relationships']['transfer_from'].add(agency_name)

            # Check collaboration actions
            for collab_action in agency_data['actions'].get('collaboration', []):
                context = collab_action['context'].lower()

                for other_agency in self.agencies.keys():
                    if other_agency != agency_name and other_agency.lower() in context:
                        self.agencies[agency_name]['relationships']['collaboration'].add(other_agency)
                        self.agencies[other_agency]['relationships']['collaboration'].add(agency_name)

            # Check oversight relationships
            for oversight_action in agency_data['actions'].get('oversight', []):
                context = oversight_action['context'].lower()

                for other_agency in self.agencies.keys():
                    if other_agency != agency_name and other_agency.lower() in context:
                        self.agencies[agency_name]['relationships']['oversees'].add(other_agency)
                        self.agencies[other_agency]['relationships']['overseen_by'].add(agency_name)

    def generate_agency_index(self) -> Dict:
        """Generate the agency index JSON structure."""
        index = {}

        for agency_name, agency_data in sorted(self.agencies.items()):
            # Count actions by type
            action_counts = {
                action_type: len(actions)
                for action_type, actions in agency_data['actions'].items()
            }

            index[agency_name] = {
                'bills': sorted(list(agency_data['bills'])),
                'mention_count': agency_data['mentions'],
                'total_appropriations': agency_data['total_funding'],
                'appropriation_details': [
                    {
                        'bill': app['bill'],
                        'amount': app['amount'],
                        'account': app['account']
                    }
                    for app in sorted(agency_data['appropriations'],
                                     key=lambda x: x['amount'], reverse=True)
                ],
                'action_types': action_counts,
                'programs': sorted(list(agency_data['programs']))[:20],  # Top 20 programs
                'total_programs': len(agency_data['programs'])
            }

        return index

    def generate_agency_network(self) -> Dict:
        """Generate the agency network JSON structure."""
        nodes = []
        edges = []

        # Create nodes
        for agency_name, agency_data in self.agencies.items():
            nodes.append({
                'id': agency_name,
                'label': agency_name,
                'mentions': agency_data['mentions'],
                'funding': agency_data['total_funding'],
                'bills': len(agency_data['bills']),
                'programs': len(agency_data['programs'])
            })

        # Create edges
        edge_id = 0
        for agency_name, agency_data in self.agencies.items():
            for rel_type, related_agencies in agency_data['relationships'].items():
                for related_agency in related_agencies:
                    edges.append({
                        'id': edge_id,
                        'source': agency_name,
                        'target': related_agency,
                        'type': rel_type
                    })
                    edge_id += 1

        return {
            'nodes': nodes,
            'edges': edges
        }

    def generate_markdown_report(self, index: Dict, network: Dict) -> str:
        """Generate a comprehensive markdown report."""
        report = ["# Washington State Agency and Program Analysis"]
        report.append(f"\n## Overview\n")
        report.append(f"- **Total Agencies Identified**: {len(index)}")
        report.append(f"- **Total Relationships**: {len(network['edges'])}")

        total_funding = sum(data['total_appropriations'] for data in index.values())
        report.append(f"- **Total Appropriations Tracked**: ${total_funding:,.2f}")

        # Most frequently mentioned agencies
        report.append(f"\n## Most Frequently Mentioned Agencies\n")
        sorted_by_mentions = sorted(
            index.items(),
            key=lambda x: x[1]['mention_count'],
            reverse=True
        )[:20]

        report.append("| Rank | Agency | Mentions | Bills | Appropriations |")
        report.append("|------|--------|----------|-------|----------------|")
        for i, (agency, data) in enumerate(sorted_by_mentions, 1):
            bills_str = ', '.join(data['bills'][:3])
            if len(data['bills']) > 3:
                bills_str += f" (+{len(data['bills'])-3} more)"

            funding_str = f"${data['total_appropriations']:,.0f}" if data['total_appropriations'] > 0 else "N/A"
            report.append(f"| {i} | {agency} | {data['mention_count']} | {bills_str} | {funding_str} |")

        # Agencies with highest appropriations
        report.append(f"\n## Top Funded Agencies\n")
        sorted_by_funding = sorted(
            [(a, d) for a, d in index.items() if d['total_appropriations'] > 0],
            key=lambda x: x[1]['total_appropriations'],
            reverse=True
        )[:20]

        report.append("| Rank | Agency | Total Appropriations | # of Appropriations |")
        report.append("|------|--------|---------------------|---------------------|")
        for i, (agency, data) in enumerate(sorted_by_funding, 1):
            report.append(
                f"| {i} | {agency} | ${data['total_appropriations']:,.2f} | "
                f"{len(data['appropriation_details'])} |"
            )

        # New programs being created
        report.append(f"\n## Agencies with Most Programs\n")
        sorted_by_programs = sorted(
            [(a, d) for a, d in index.items() if d['total_programs'] > 0],
            key=lambda x: x[1]['total_programs'],
            reverse=True
        )[:20]

        report.append("| Agency | Program Count | Sample Programs |")
        report.append("|--------|---------------|-----------------|")
        for agency, data in sorted_by_programs:
            sample_programs = ', '.join(data['programs'][:3])
            if data['total_programs'] > 3:
                sample_programs += f" (+{data['total_programs']-3} more)"
            report.append(f"| {agency} | {data['total_programs']} | {sample_programs} |")

        # Organizational changes
        report.append(f"\n## Organizational Changes and Relationships\n")

        # Transfers
        transfers = [
            (agency, data) for agency, data in index.items()
            if 'transfer' in data['action_types'] or 'transfer_from' in [
                rel for rels in self.agencies[agency]['relationships'].values() for rel in rels
            ]
        ]

        if transfers:
            report.append(f"\n### Transfers ({len(transfers)} agencies involved)\n")
            for agency, data in sorted(transfers, key=lambda x: x[1]['action_types'].get('transfer', 0), reverse=True)[:10]:
                transfer_count = data['action_types'].get('transfer', 0)
                if transfer_count > 0:
                    report.append(f"- **{agency}**: {transfer_count} transfer actions")

        # Collaborations
        report.append(f"\n### Inter-Agency Collaboration\n")
        collab_count = sum(1 for e in network['edges'] if e['type'] == 'collaboration')
        report.append(f"Total collaboration relationships identified: {collab_count}")

        if collab_count > 0:
            report.append("\nTop collaborative agencies:")
            collab_agencies = defaultdict(int)
            for edge in network['edges']:
                if edge['type'] == 'collaboration':
                    collab_agencies[edge['source']] += 1

            for agency, count in sorted(collab_agencies.items(), key=lambda x: x[1], reverse=True)[:10]:
                report.append(f"- **{agency}**: {count} collaborations")

        # Action type summary
        report.append(f"\n## Action Type Summary\n")
        all_actions = defaultdict(int)
        for agency_data in index.values():
            for action_type, count in agency_data['action_types'].items():
                all_actions[action_type] += count

        report.append("| Action Type | Total Count |")
        report.append("|-------------|-------------|")
        for action_type, count in sorted(all_actions.items(), key=lambda x: x[1], reverse=True):
            report.append(f"| {action_type.title()} | {count} |")

        return '\n'.join(report)


def main():
    extractor = AgencyExtractor()

    # Find all XML files
    xml_files = list(Path('.').glob('*.xml'))
    print(f"Found {len(xml_files)} XML bill files")

    # Extract from each file
    for xml_file in xml_files:
        extractor.extract_agencies_from_xml(xml_file)

    # Extract relationships
    print("\nExtracting relationships...")
    extractor.extract_relationships()

    # Generate outputs
    print("\nGenerating outputs...")

    # Agency index
    agency_index = extractor.generate_agency_index()
    with open('agency-index.json', 'w') as f:
        json.dump(agency_index, f, indent=2, default=lambda x: list(x) if isinstance(x, set) else x)
    print(f"✓ Generated agency-index.json ({len(agency_index)} agencies)")

    # Agency network
    agency_network = extractor.generate_agency_network()
    with open('agency-network.json', 'w') as f:
        json.dump(agency_network, f, indent=2)
    print(f"✓ Generated agency-network.json ({len(agency_network['nodes'])} nodes, {len(agency_network['edges'])} edges)")

    # Markdown report
    report = extractor.generate_markdown_report(agency_index, agency_network)
    with open('agency-report.md', 'w') as f:
        f.write(report)
    print(f"✓ Generated agency-report.md")

    print("\n✓ Extraction complete!")


if __name__ == '__main__':
    main()
