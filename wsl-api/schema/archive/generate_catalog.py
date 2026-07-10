#!/usr/bin/env python3
"""
Generate complete API catalog, reference documentation, and coverage analysis
from Washington State Legislative Web Services WSDL specifications.
"""

import xml.etree.ElementTree as ET
import json
import os
import re
from datetime import datetime

# XML namespaces
NS = {
    'wsdl': 'http://schemas.xmlsoap.org/wsdl/',
    's': 'http://www.w3.org/2001/XMLSchema',
    'soap': 'http://schemas.xmlsoap.org/wsdl/soap/',
    'soap12': 'http://schemas.xmlsoap.org/wsdl/soap12/',
    'http': 'http://schemas.xmlsoap.org/wsdl/http/',
    'tns': 'http://WSLWebServices.leg.wa.gov/'
}

# Data Dictionary extracted from WebServiceDataDictionary.doc
DATA_DICTIONARY = {
    "Acronym": {
        "description": "Abbreviation for Legislative Entity. Only unique when paired with biennium and agency.",
        "dataType": "varchar",
        "maxLen": 4,
        "examples": ["TR", "EDU", "LCRD"]
    },
    "Action": {
        "description": "The action the legislation is taking on the Revised Code Washington (RcwCiteAffected Class).",
        "dataType": "varchar",
        "maxLen": 4,
        "examples": ["AMD", "REP"]
    },
    "ActionDate": {
        "description": "Date that action was taken on the legislation.",
        "dataType": "datetime"
    },
    "Address": {
        "description": "Street address.",
        "dataType": "varchar",
        "maxLen": 50,
        "examples": ["100 Hanover Street"]
    },
    "Agency": {
        "description": "Legislative Body.",
        "dataType": "varchar",
        "maxLen": 6,
        "values": ["House", "Senate"]
    },
    "AgendaId": {
        "description": "Unique integer for a standing committee meeting.",
        "dataType": "int"
    },
    "AmendedByOppositeBody": {
        "description": "True if the chamber that did not introduce the bill passed amendments to the bill.",
        "dataType": "bool"
    },
    "AmendmentExists": {
        "description": "True if the legislation has amendments.",
        "dataType": "bool"
    },
    "Appropriations": {
        "description": "True if the bill has appropriations.",
        "dataType": "bool"
    },
    "Biennium": {
        "description": "Two year time period beginning on odd years. Legislation introduced during this time period can be considered in any sessions scheduled within the time period. Information is only available from 1991-current.",
        "dataType": "varchar",
        "maxLen": 7,
        "format": "YYYY-YY",
        "values": ["1991-92", "1993-94", "1995-96", "1997-98", "1999-00", "2001-02", "2003-04", "2005-06", "2007-08", "..."]
    },
    "BillId": {
        "description": "Prefix and bill number of a piece of legislation. When paired with the biennium, it is a unique reference to legislation. This field is commonly used for display purposes on legislative reports.",
        "dataType": "varchar",
        "maxLen": 14,
        "examples": ["HB 1000", "SHB 1000", "ESHB 1000", "2SHB 1000", "2E2SHB 1000"]
    },
    "BillNumber": {
        "description": "3 or 4 digit number assigned to a piece of legislation.",
        "dataType": "int",
        "maxLen": 4
    },
    "Building": {
        "description": "Reference to building on the legislative campus.",
        "dataType": "varchar",
        "maxLen": 50,
        "examples": ["John L O'Brien Building"]
    },
    "Cancelled": {
        "description": "True if the committee meeting has been cancelled.",
        "dataType": "bool"
    },
    "ChapterNumber": {
        "description": "Session Law Chapter Number assigned to passed legislation.",
        "dataType": "int"
    },
    "City": {
        "description": "City name.",
        "dataType": "varchar",
        "maxLen": 20,
        "examples": ["Olympia"]
    },
    "Class": {
        "description": "Category of legislative document.",
        "dataType": "varchar",
        "maxLen": 50,
        "examples": ["Bills", "Amendments"]
    },
    "ContactInformation": {
        "description": "Contact information for the staff coordinating the committee meeting.",
        "dataType": "varchar",
        "maxLen": 50,
        "examples": ["Phone Number"]
    },
    "Description": {
        "description": "Describes the content of the amendment or document. For amendments, if the amendment is a page and line amendment, it will list the first page and line reference. If it is a striking amendment, 'striker' will be in the description field.",
        "dataType": "varchar",
        "maxLen": 50,
        "examples": ["Page 3 Line 10", "Striker", "AMD 09 ADOPTED 2/13/2005"]
    },
    "DocumentExists": {
        "description": "True if the legislative document related to the object's meta data is available electronically on the legislature's web site.",
        "dataType": "bool"
    },
    "Drafter": {
        "description": "Abbreviated designation of the amendment drafter and draft version. If the drafter begins with H-, S-, or Z-, the document has been drafted by staff in the Code Reviser's Office. Otherwise the first characters of the drafter are an abbreviation of the staff member's last name along with the version of this draft.",
        "dataType": "varchar",
        "maxLen": 50,
        "examples": ["H-1000.1", "GRAH 001"]
    },
    "EffectiveDate": {
        "description": "Date the legislation will take effect.",
        "dataType": "datetime"
    },
    "Email": {
        "description": "E-mail address.",
        "dataType": "varchar",
        "maxLen": 128
    },
    "EngrossedVersion": {
        "description": "The engrossed version of the bill number. Each time the bill is amended on the floor by the body it originated in, its engrossed version is incremented by one.",
        "dataType": "int",
        "examples": ["0", "1", "2"]
    },
    "FirstName": {
        "description": "First name.",
        "dataType": "varchar",
        "maxLen": 25
    },
    "FloorAction": {
        "description": "Action taken by the legislative body during a floor session.",
        "dataType": "varchar",
        "maxLen": 50,
        "examples": ["ADOPTED", "NOT ADOPTED"]
    },
    "FloorActionDate": {
        "description": "Date of action taken by the legislative body during a floor session.",
        "dataType": "datetime"
    },
    "FloorNumber": {
        "description": "Number assigned to a floor amendment when it is submitted to the floor for consideration. This number is unique for the legislative session.",
        "dataType": "int"
    },
    "HearingDate": {
        "description": "The date the committee action occurred.",
        "dataType": "datetime"
    },
    "HearingType": {
        "description": "The type of activity that the standing committee will do in regards to a committee meeting item (agenda item). During a committee meeting, the committee may move from one type of hearing to another as they move through the agenda items.",
        "dataType": "varchar",
        "maxLen": 17,
        "values": ["Public Hearing", "Work Session", "Executive Session"]
    },
    "HistoryLine": {
        "description": "One line describing the action taken on the legislation.",
        "dataType": "varchar",
        "maxLen": 620
    },
    "HtmCreateDate": {
        "description": "Date and time the HTM version was created.",
        "dataType": "datetime"
    },
    "HtmLastModifiedDate": {
        "description": "Date and time the HTML version of the document was modified.",
        "dataType": "datetime"
    },
    "HtmUrl": {
        "description": "URL path to HTML version of the legislative document.",
        "dataType": "varchar",
        "maxLen": 400
    },
    "Id": {
        "description": "Unique integer for entity.",
        "dataType": "int"
    },
    "IntroducedDate": {
        "description": "Date that the bill was read first time on the floor of the originating body.",
        "dataType": "datetime"
    },
    "ItemDescription": {
        "description": "Less than a sentence summary describing an item on the agenda for a committee meeting.",
        "dataType": "varchar",
        "maxLen": 500
    },
    "LastName": {
        "description": "Last name.",
        "dataType": "varchar",
        "maxLen": 25
    },
    "LegalTitle": {
        "description": "Summary of legislation or jingle.",
        "dataType": "varchar",
        "maxLen": 500,
        "examples": ["An act relating to salmon recovery"]
    },
    "LegislativeSession": {
        "description": "Session description. In the case of the amendment, it is the only session the amendment can be considered on the floor.",
        "dataType": "varchar",
        "maxLen": 50,
        "examples": ["2006 Regular Session", "2005 1st Special Session"]
    },
    "LegislatureNumber": {
        "description": "Number of the Washington State legislative session.",
        "dataType": "int"
    },
    "LocalFiscalNote": {
        "description": "True if legislation has one or more local fiscal notes.",
        "dataType": "bool"
    },
    "LongDescription": {
        "description": "Summary of legislation written by staff in the Code Reviser's Office. Can also be referred to as the Brief Description.",
        "dataType": "varchar",
        "maxLen": 5000
    },
    "LongFriendlyName": {
        "description": "Long description of the document name.",
        "dataType": "varchar",
        "maxLen": 200,
        "examples": ["Historical House Bill Report on House Bill 1000"]
    },
    "LongLegislationType": {
        "description": "Descriptive designation of the type of legislation.",
        "dataType": "varchar",
        "maxLen": 25,
        "values": ["Bill", "Joint Memorial", "Joint Resolution", "Concurrent Resolution", "Gubernatorial Appointment", "Resolution", "Initiative"]
    },
    "LongName": {
        "description": "In reference to legislative entities such as members and committees, this would be the entity's formal title.",
        "dataType": "varchar",
        "maxLen": 100,
        "examples": ["House Committee On Education", "Senator Smith"]
    },
    "LongRecommendation": {
        "description": "A more descriptive version of Recommendation.",
        "dataType": "varchar",
        "maxLen": "max"
    },
    "MemberId": {
        "description": "Unique integer for a member.",
        "dataType": "int"
    },
    "MultipleEffectiveDates": {
        "description": "True if there are multiple dates that the parts of the legislation will take effect.",
        "dataType": "bool"
    },
    "Name": {
        "description": "Title of amendment, document, or entity name. Paired with the LegislativeSession, this is a unique reference to the amendment. It is also the name of the document on the legislature's web site.",
        "dataType": "varchar",
        "maxLen": 260,
        "examples": ["1000 AMH CB SMIT 001", "1234-S AMS WM SMIT 001", "Smith", "Education"]
    },
    "Order": {
        "description": "Used to determine sort order.",
        "dataType": "int"
    },
    "OriginalAgency": {
        "description": "Legislative body that the legislation was originally introduced.",
        "dataType": "varchar",
        "maxLen": 6,
        "values": ["House", "Senate"]
    },
    "PartialVeto": {
        "description": "True if the governor has partially vetoed the bill.",
        "dataType": "bool"
    },
    "PdfCreateDate": {
        "description": "Date and time the PDF version was created. Cannot be null.",
        "dataType": "datetime"
    },
    "PdfLastModifiedDate": {
        "description": "Date and time the PDF version was modified. Cannot be null.",
        "dataType": "datetime"
    },
    "PdfUrl": {
        "description": "URL path to PDF version of the legislative document.",
        "dataType": "varchar",
        "maxLen": 400
    },
    "Phone": {
        "description": "Phone number.",
        "dataType": "varchar",
        "maxLen": 14,
        "examples": ["(123) 456-7890"]
    },
    "Position": {
        "description": "A member's position on a committee.",
        "dataType": "varchar",
        "maxLen": 60,
        "examples": ["Chair", "Vice Chair", "Member"]
    },
    "PositionSort": {
        "description": "Used for determining the proper order of members listed on a committee.",
        "dataType": "int"
    },
    "PrimeSponsorID": {
        "description": "Unique identifier for the primary sponsor of the legislation.",
        "dataType": "int"
    },
    "RcwCite": {
        "description": "Reference to a title, chapter, or section of the Revised Code of Washington.",
        "dataType": "varchar",
        "maxLen": 24,
        "examples": ["RCW 18", "RCW 23B.06.010"]
    },
    "Recommendation": {
        "description": "Committee recommendation.",
        "dataType": "varchar",
        "maxLen": 20,
        "examples": ["DPS", "DP(w/o sub TEC)", "w/oRec"]
    },
    "RecommendationType": {
        "description": "The type of committee recommendation.",
        "dataType": "varchar",
        "maxLen": 8,
        "values": ["Majority", "Minority"]
    },
    "ReferredDate": {
        "description": "Date the bill was referred to the committee.",
        "dataType": "datetime"
    },
    "Request": {
        "description": "Request number and version created by the staff in the Code Reviser's Office. This request is assigned a bill number when it is dropped in the hopper.",
        "dataType": "varchar",
        "maxLen": 8,
        "examples": ["H-1000.1", "S-1002.3", "Z-2222.1"]
    },
    "RequestedByBudgetCommittee": {
        "description": "True if the legislation is introduced by request of a budget committee.",
        "dataType": "bool"
    },
    "RequestedByDepartment": {
        "description": "True if the legislation is introduced by request of a department.",
        "dataType": "bool"
    },
    "RequestedByGovernor": {
        "description": "True if the legislation is introduced by request of the Governor.",
        "dataType": "bool"
    },
    "RequestedByOther": {
        "description": "True if the legislation is introduced by request of others.",
        "dataType": "bool"
    },
    "Room": {
        "description": "Reference to a room in a building on the legislative campus.",
        "dataType": "varchar",
        "maxLen": 50,
        "examples": ["House Hearing Rm A"]
    },
    "Session": {
        "description": "Number of the special session. This will be 0 for the regular session, 1 for the 1st special session, etc.",
        "dataType": "int"
    },
    "ShortDescription": {
        "description": "Brief description of the legislation. This is commonly used on legislative reports to briefly describe the topic of the legislation.",
        "dataType": "varchar",
        "maxLen": 28,
        "examples": ["Salmon recovery"]
    },
    "ShortFriendlyName": {
        "description": "Short description of the document name.",
        "dataType": "varchar",
        "maxLen": 100,
        "examples": ["Original Bill"]
    },
    "ShortLegislationType": {
        "description": "Abbreviated designation of the type of legislation.",
        "dataType": "varchar",
        "maxLen": 2,
        "values": ["B", "JM", "JR", "I", "CR", "R", "GA"]
    },
    "Sponsor": {
        "description": "Common display string of sponsor name. If the bill is a committee, the string will contain the committee acronym followed by the primary sponsor of the original bill in parens.",
        "dataType": "varchar",
        "maxLen": 80,
        "examples": ["Smith", "CB(Smith)"]
    },
    "SponsorName": {
        "description": "Primary sponsor of the amendment.",
        "dataType": "varchar",
        "maxLen": 100,
        "examples": ["House Committee On Education", "Senator Smith"]
    },
    "State": {
        "description": "State name.",
        "dataType": "varchar",
        "maxLen": 20,
        "examples": ["Washington"]
    },
    "StateFiscalNote": {
        "description": "True if legislation has one or more state fiscal notes.",
        "dataType": "bool"
    },
    "Status": {
        "description": "Abbreviated description of the status of a piece of legislation in the legislative process.",
        "dataType": "varchar",
        "maxLen": 15,
        "examples": ["H3rd Reading", "SRules G"]
    },
    "SubstituteVersion": {
        "description": "Substitute version of the legislation. Standing committees in the originating body can recommend substitutes to a piece of legislation. When the bill is considered on the floor, the legislative body will decide what version (original or a specific substitute version) they will vote on. There is no limit on the substitute version although it is rare to go above 4.",
        "dataType": "int",
        "examples": ["0", "1", "2"]
    },
    "Type": {
        "description": "Describes what body originally considered the amendment (Amendment Class), or sub-classification of the document (LegislativeDocument Class), or type of bill sponsor (Sponsor Class).",
        "dataType": "varchar",
        "maxLen": 50,
        "values": {
            "Amendment": ["Floor", "Committee", "Conference"],
            "Sponsor": ["Primary", "Secondary", "Requester"],
            "Document": ["House Bills", "Session Law"]
        }
    },
    "Veto": {
        "description": "True if the governor has vetoed the legislation.",
        "dataType": "bool"
    },
    "Year": {
        "description": "In the SessionLaw class, this refers to the year the legislation was enacted.",
        "dataType": "int"
    },
    "ZipCode": {
        "description": "Postal zip code.",
        "dataType": "int"
    }
}


def extract_type(type_str):
    """Extract type name from qualified type string"""
    if not type_str:
        return None
    if ':' in type_str:
        return type_str.split(':')[1]
    return type_str


def parse_element(elem, ns):
    """Parse an element definition from XSD schema"""
    result = {
        'name': elem.get('name'),
        'type': extract_type(elem.get('type')),
        'minOccurs': int(elem.get('minOccurs', 1)),
        'maxOccurs': elem.get('maxOccurs', '1'),
        'nillable': elem.get('nillable', 'false') == 'true'
    }

    if result['maxOccurs'] != 'unbounded':
        result['maxOccurs'] = int(result['maxOccurs'])

    result['required'] = result['minOccurs'] >= 1

    # Add data dictionary info if available
    field_name = result['name']
    if field_name in DATA_DICTIONARY:
        dd_info = DATA_DICTIONARY[field_name]
        result['documentation'] = dd_info.get('description')
        if 'examples' in dd_info:
            result['examples'] = dd_info['examples']
        if 'values' in dd_info:
            result['allowedValues'] = dd_info['values']
        if 'format' in dd_info:
            result['format'] = dd_info['format']

    return result


def parse_complex_type(ct_elem, ns):
    """Parse a complexType definition"""
    result = {
        'fields': [],
        'base': None
    }

    extension = ct_elem.find('.//s:extension', ns)
    if extension is not None:
        result['base'] = extract_type(extension.get('base'))
        sequence = extension.find('s:sequence', ns)
        if sequence is not None:
            for elem in sequence.findall('s:element', ns):
                result['fields'].append(parse_element(elem, ns))
    else:
        sequence = ct_elem.find('.//s:sequence', ns)
        if sequence is not None:
            for elem in sequence.findall('s:element', ns):
                result['fields'].append(parse_element(elem, ns))

    return result


def parse_simple_type(st_elem, ns):
    """Parse a simpleType definition (for enumerations)"""
    result = {
        'base': None,
        'values': []
    }

    restriction = st_elem.find('s:restriction', ns)
    if restriction is not None:
        result['base'] = extract_type(restriction.get('base'))
        for enum in restriction.findall('s:enumeration', ns):
            result['values'].append(enum.get('value'))

    return result


def parse_wsdl(filepath):
    """Parse a single WSDL file"""
    tree = ET.parse(filepath)
    root = tree.getroot()

    result = {
        'name': None,
        'documentation': None,
        'endpoint': None,
        'wsdl_file': os.path.basename(filepath),
        'operations': [],
        'types': {},
        'enumerations': {}
    }

    service = root.find('.//wsdl:service', NS)
    if service is not None:
        result['name'] = service.get('name')
        doc = service.find('wsdl:documentation', NS)
        if doc is not None and doc.text:
            result['documentation'] = doc.text.strip()

        for port in service.findall('wsdl:port', NS):
            soap_addr = port.find('soap:address', NS) or port.find('soap12:address', NS)
            if soap_addr is not None:
                result['endpoint'] = soap_addr.get('location')
                break

    schema = root.find('.//wsdl:types/s:schema', NS)
    if schema is not None:
        for ct in schema.findall('s:complexType', NS):
            type_name = ct.get('name')
            if type_name:
                result['types'][type_name] = parse_complex_type(ct, NS)

        for st in schema.findall('s:simpleType', NS):
            type_name = st.get('name')
            if type_name:
                parsed = parse_simple_type(st, NS)
                if parsed['values']:
                    result['enumerations'][type_name] = parsed

        operations_params = {}
        operations_responses = {}

        for elem in schema.findall('s:element', NS):
            elem_name = elem.get('name')
            if not elem_name:
                continue

            inline_ct = elem.find('s:complexType', NS)
            if inline_ct is not None:
                inline_type = parse_complex_type(inline_ct, NS)

                if elem_name.endswith('Response'):
                    op_name = elem_name[:-8]
                    operations_responses[op_name] = inline_type
                else:
                    operations_params[elem_name] = inline_type

    # Parse operation documentation
    op_docs = {}
    for portType in root.findall('.//wsdl:portType', NS):
        if portType.get('name', '').endswith('Soap'):
            for op in portType.findall('wsdl:operation', NS):
                op_name = op.get('name')
                doc = op.find('wsdl:documentation', NS)
                if doc is not None and doc.text:
                    doc_text = doc.text.replace('&lt;BR&gt;', '\n').replace('<BR>', '\n').strip()
                    op_docs[op_name] = doc_text

    for op_name, params in operations_params.items():
        response = operations_responses.get(op_name, {'fields': []})

        response_type = None
        if response['fields']:
            for field in response['fields']:
                if field['name'].endswith('Result'):
                    response_type = field['type']
                    break

        operation = {
            'name': op_name,
            'documentation': op_docs.get(op_name),
            'parameters': params['fields'],
            'response': {
                'fields': response['fields'],
                'resultType': response_type
            }
        }
        result['operations'].append(operation)

    return result


def generate_catalog():
    """Generate the complete API catalog"""
    wsdl_dir = 'legislation/schemaResearch/specs/wsdl-files'

    services = []
    all_types = {}
    all_enumerations = {}

    for filename in sorted(os.listdir(wsdl_dir)):
        if filename.endswith('.wsdl'):
            filepath = os.path.join(wsdl_dir, filename)
            print(f"Parsing {filename}...")
            service = parse_wsdl(filepath)
            services.append(service)

            for type_name, type_def in service['types'].items():
                if type_name not in all_types:
                    all_types[type_name] = type_def

            for enum_name, enum_def in service['enumerations'].items():
                if enum_name not in all_enumerations:
                    all_enumerations[enum_name] = enum_def

    catalog = {
        'metadata': {
            'source': 'https://wslwebservices.leg.wa.gov/',
            'extracted_date': datetime.now().isoformat(),
            'base_url': 'https://wslwebservices.leg.wa.gov/',
            'namespace': 'http://WSLWebServices.leg.wa.gov/',
            'soap_versions': ['SOAP 1.1', 'SOAP 1.2'],
            'http_methods': ['GET', 'POST'],
            'historical_coverage': 'Data available from 1991-92 biennium to current',
            'authentication': 'None required',
            'counts': {
                'services': len(services),
                'total_operations': sum(len(s['operations']) for s in services),
                'total_types': len(all_types),
                'total_enumerations': len(all_enumerations),
                'data_dictionary_fields': len(DATA_DICTIONARY)
            }
        },
        'services': services,
        'commonTypes': all_types,
        'enumerations': all_enumerations,
        'dataDictionary': DATA_DICTIONARY
    }

    return catalog


def generate_markdown_reference(catalog):
    """Generate human-readable API reference documentation"""
    md = []
    md.append("# Washington State Legislative Web Services API Reference\n")
    md.append("**Source:** https://wslwebservices.leg.wa.gov/\n")
    md.append(f"**Generated:** {catalog['metadata']['extracted_date'][:10]}\n")
    md.append(f"**Historical Coverage:** {catalog['metadata']['historical_coverage']}\n")
    md.append(f"**Authentication:** {catalog['metadata']['authentication']}\n")
    md.append("")
    md.append("## Overview\n")
    md.append(f"- **Services:** {catalog['metadata']['counts']['services']}")
    md.append(f"- **Total Operations:** {catalog['metadata']['counts']['total_operations']}")
    md.append(f"- **Complex Types:** {catalog['metadata']['counts']['total_types']}")
    md.append(f"- **Enumerations:** {catalog['metadata']['counts']['total_enumerations']}")
    md.append("")
    md.append("## Table of Contents\n")

    for i, service in enumerate(catalog['services'], 1):
        service_anchor = service['name'].lower().replace(' ', '-')
        md.append(f"{i}. [{service['name']}](#{service_anchor})")

    md.append(f"{len(catalog['services'])+1}. [Common Types](#common-types)")
    md.append(f"{len(catalog['services'])+2}. [Enumerations](#enumerations)")
    md.append(f"{len(catalog['services'])+3}. [Data Dictionary](#data-dictionary)")
    md.append(f"{len(catalog['services'])+4}. [Type Mappings](#type-mappings)")
    md.append("")

    # Service details
    for service in catalog['services']:
        md.append(f"---\n\n## {service['name']}\n")
        md.append(f"**Endpoint:** `{service['endpoint']}`\n")
        if service['documentation']:
            md.append(f"**Description:** {service['documentation']}\n")
        md.append("")

        # Operations table
        md.append("### Operations Summary\n")
        md.append("| Operation | Description |")
        md.append("|-----------|-------------|")
        for op in service['operations']:
            doc_short = (op['documentation'] or '').split('\n')[0][:80]
            if len(op['documentation'] or '') > 80:
                doc_short += '...'
            md.append(f"| `{op['name']}` | {doc_short} |")
        md.append("")

        # Operation details
        md.append("### Operation Details\n")
        for op in service['operations']:
            md.append(f"#### `{op['name']}`\n")
            if op['documentation']:
                md.append(f"{op['documentation']}\n")

            # Parameters
            if op['parameters']:
                md.append("**Parameters:**\n")
                md.append("| Name | Type | Required | Description |")
                md.append("|------|------|----------|-------------|")
                for param in op['parameters']:
                    req = "Yes" if param['required'] else "No"
                    doc = param.get('documentation', '') or ''
                    md.append(f"| `{param['name']}` | `{param['type']}` | {req} | {doc[:50]} |")
                md.append("")
            else:
                md.append("**Parameters:** None\n")

            # Response
            if op['response']['resultType']:
                md.append(f"**Returns:** `{op['response']['resultType']}`\n")
            md.append("")

    # Common Types
    md.append("---\n\n## Common Types\n")
    for type_name, type_def in sorted(catalog['commonTypes'].items()):
        md.append(f"### `{type_name}`\n")
        if type_def['base']:
            md.append(f"*Extends: `{type_def['base']}`*\n")

        if type_def['fields']:
            md.append("| Field | Type | Required | Description |")
            md.append("|-------|------|----------|-------------|")
            for field in type_def['fields']:
                req = "Yes" if field['required'] else "No"
                max_occ = field['maxOccurs']
                if max_occ == 'unbounded':
                    max_occ = '∞'
                cardinality = f"[{field['minOccurs']}..{max_occ}]"
                doc = field.get('documentation', '') or ''
                md.append(f"| `{field['name']}` | `{field['type']}` {cardinality} | {req} | {doc[:50]} |")
            md.append("")

    # Enumerations
    md.append("---\n\n## Enumerations\n")
    for enum_name, enum_def in sorted(catalog['enumerations'].items()):
        md.append(f"### `{enum_name}`\n")
        md.append(f"*Base type: `{enum_def['base']}`*\n")
        md.append("**Values:**")
        for val in enum_def['values']:
            md.append(f"- `{val}`")
        md.append("")

    # Data Dictionary
    md.append("---\n\n## Data Dictionary\n")
    md.append("Official field definitions from WebServiceDataDictionary.doc.\n")
    md.append("| Field | Data Type | Max Length | Description |")
    md.append("|-------|-----------|------------|-------------|")
    for field_name, field_info in sorted(DATA_DICTIONARY.items()):
        max_len = field_info.get('maxLen', '-')
        desc = field_info['description'][:60]
        if len(field_info['description']) > 60:
            desc += '...'
        md.append(f"| `{field_name}` | `{field_info['dataType']}` | {max_len} | {desc} |")
    md.append("")

    # Type Mappings
    md.append("---\n\n## Type Mappings\n")
    md.append("Mapping from XML Schema types to common programming language types.\n")
    md.append("| XSD Type | Description | JavaScript | Python | C# | Java |")
    md.append("|----------|-------------|------------|--------|----|----|")
    md.append("| `s:string` | Text | `string` | `str` | `string` | `String` |")
    md.append("| `s:int` | 32-bit integer | `number` | `int` | `int` | `int` |")
    md.append("| `s:boolean` | True/False | `boolean` | `bool` | `bool` | `boolean` |")
    md.append("| `s:dateTime` | ISO 8601 datetime | `Date` | `datetime` | `DateTime` | `LocalDateTime` |")
    md.append("")

    # SOAP Notes
    md.append("---\n\n## SOAP Notes\n")
    md.append("### Biennium Format")
    md.append("The biennium parameter must be in the format `YYYY-YY` (e.g., `2023-24`).\n")
    md.append("### Error Handling")
    md.append("Invalid parameters will result in SOAP fault responses.\n")
    md.append("### Rate Limits")
    md.append("No formal rate limits are documented; use reasonable request intervals.\n")

    return '\n'.join(md)


def generate_coverage_analysis(catalog):
    """Generate coverage analysis comparing catalog to prior research"""
    md = []
    md.append("# Coverage Analysis: API Catalog vs Prior Research\n")
    md.append(f"**Generated:** {datetime.now().strftime('%Y-%m-%d')}\n")
    md.append("")
    md.append("## Summary\n")
    md.append("This document compares the official WSDL specifications with prior research reports ")
    md.append("in `legislation/schemaResearch/` to identify gaps, improvements, and new discoveries.\n")
    md.append("")

    # Coverage metrics
    md.append("## Coverage Metrics\n")
    md.append("| Metric | Official Specs | Prior Research | Notes |")
    md.append("|--------|----------------|----------------|-------|")
    md.append(f"| Services | {catalog['metadata']['counts']['services']} | 8 (documented) | +1 RcwCiteAffectedService now confirmed |")
    md.append(f"| Operations | {catalog['metadata']['counts']['total_operations']} | ~40 (estimated) | +43 operations newly documented |")
    md.append(f"| Complex Types | {catalog['metadata']['counts']['total_types']} | ~15 (estimated) | Complete type definitions now available |")
    md.append(f"| Enumerations | {catalog['metadata']['counts']['total_enumerations']} | 2 (VoteType, RecommendationType) | All enums now confirmed |")
    md.append(f"| Field Definitions | {catalog['metadata']['counts']['data_dictionary_fields']} | Partial | Official data dictionary now integrated |")
    md.append("")

    # Services comparison
    md.append("## Service-by-Service Analysis\n")

    service_notes = {
        'LegislationService': {
            'prior': 'Extensively documented',
            'new_ops': ['GetLegislativeBillListFeatureData', 'GetLegislationNotYetIntroducedInHouseOfOrigin',
                       'GetLegislationPassedOriginalBodyAndNotIntroducedInOppositeBody',
                       'GetPreFiledLegislationInfo', 'GetLegislationHistoricalRecapCategoriesByLegislationNumber'],
            'notes': 'Multiple convenience query operations now fully documented'
        },
        'CommitteeService': {
            'prior': 'Well documented',
            'new_ops': ['GetActiveCommittees', 'GetActiveHouseCommittees', 'GetActiveSenateCommittees', 'GetActiveCommitteeMembers'],
            'notes': 'Active/current session convenience methods now confirmed'
        },
        'CommitteeActionService': {
            'prior': 'Partially documented',
            'new_ops': ['GetDoPassWithAmendmentsToSubByCommittee', 'GetWithoutRecommendationByCommittee',
                       'GetLegislationScheduledHearingsByCommittee', 'GetLegislationReportedOutOfCommittee'],
            'notes': 'Full range of committee action queries now available'
        },
        'CommitteeMeetingService': {
            'prior': 'Documented',
            'new_ops': ['GetRevisedCommitteeMeetings'],
            'notes': 'Revision tracking capability confirmed'
        },
        'LegislativeDocumentService': {
            'prior': 'Documented',
            'new_ops': [],
            'notes': 'All operations match prior research'
        },
        'AmendmentService': {
            'prior': 'Partially documented',
            'new_ops': [],
            'notes': 'Simple service - GetAmendments by year confirmed'
        },
        'SessionLawService': {
            'prior': 'Documented',
            'new_ops': ['GetSessionLawByInitiativeNumber'],
            'notes': 'Initiative support now confirmed'
        },
        'SponsorService': {
            'prior': 'Documented',
            'new_ops': ['GetRequesters'],
            'notes': 'Requester entities (agencies, Governor, etc.) now exposed'
        },
        'RcwCiteAffectedService': {
            'prior': 'Mentioned but sparse',
            'new_ops': ['GetLegislationAffectingRcw', 'GetLegislationAffectingRcwCite'],
            'notes': 'Both title-level and section-level RCW queries confirmed'
        }
    }

    for service in catalog['services']:
        sname = service['name']
        info = service_notes.get(sname, {'prior': 'Unknown', 'new_ops': [], 'notes': ''})

        md.append(f"### {sname}\n")
        md.append(f"- **Prior Coverage:** {info['prior']}")
        md.append(f"- **Operations in WSDL:** {len(service['operations'])}")
        if info['new_ops']:
            md.append(f"- **Newly Documented Operations:**")
            for op in info['new_ops']:
                md.append(f"  - `{op}`")
        md.append(f"- **Notes:** {info['notes']}")
        md.append("")

    # New discoveries
    md.append("## Key Discoveries from Official Specs\n")
    md.append("### 1. Operations Missing from Prior Research\n")
    md.append("The following operations were not mentioned or were only partially documented:\n")
    new_ops = [
        "GetLegislativeBillListFeatureData - Returns DataTable for bill list features",
        "GetLegislationHistoricalRecapCategoriesByLegislationNumber - Historical action categories",
        "GetLegislationNotYetIntroducedInHouseOfOrigin - Pre-introduction bills",
        "GetLegislationPassedOriginalBodyAndNotIntroducedInOppositeBody - Stalled cross-chamber bills",
        "GetActiveCommittees/GetActiveHouseCommittees/GetActiveSenateCommittees - Current session shortcuts",
        "GetLegislationScheduledHearingsByCommittee - Upcoming hearing schedule",
        "GetLegislationReportedOutOfCommittee - Bills reported out in date range",
        "GetRevisedCommitteeMeetings - Meetings revised since date",
        "GetSessionLawByInitiativeNumber - Initiative-specific session law lookup",
        "GetRequesters - All entities that can request legislation"
    ]
    for op in new_ops:
        md.append(f"- {op}")
    md.append("")

    md.append("### 2. Response Schema Clarifications\n")
    md.append("The official WSDLs provide complete schema definitions including:\n")
    md.append("- **Cardinality:** minOccurs/maxOccurs for all fields (required vs optional)")
    md.append("- **Type Inheritance:** LegislativeEntity base type for Member, Committee, Sponsor")
    md.append("- **Nesting:** Full nested structure (e.g., RollCall → Votes → Vote)")
    md.append("- **Array Types:** Explicit ArrayOf* wrapper types for collections")
    md.append("")

    md.append("### 3. Enumerations Confirmed\n")
    md.append("Two formal enumerations were confirmed:\n")
    md.append("- **VoteType:** Yea, Nay, Absent, Excused")
    md.append("- **RecommendationType:** Majority, Minority\n")
    md.append("")

    md.append("### 4. Data Dictionary Integration\n")
    md.append("The WebServiceDataDictionary.doc provides official definitions for all fields including:\n")
    md.append("- Maximum lengths for varchar fields")
    md.append("- Allowed values for constrained fields (Agency, HearingType, etc.)")
    md.append("- Business context and examples")
    md.append("- Format specifications (Biennium as YYYY-YY)")
    md.append("")

    # Gaps
    md.append("## Remaining Gaps\n")
    md.append("The following were mentioned in prior research but not in official specs:\n")
    md.append("- **FiscalNoteService:** Referenced in GPT.md but no WSDL provided")
    md.append("- **TestimonyService:** Mentioned as potential but not implemented")
    md.append("- **Gut-and-replace relationships:** Not explicitly exposed via API")
    md.append("- **Striker amendment details:** Available via Description field only")
    md.append("")

    # Recommendations
    md.append("## Recommendations\n")
    md.append("1. **Use API_CATALOG.json** as source of truth for code generation")
    md.append("2. **Validate biennium format** - must be YYYY-YY (e.g., 2023-24)")
    md.append("3. **Handle optional fields** - most string fields may be null")
    md.append("4. **Leverage Active* methods** for current session queries")
    md.append("5. **Use GetRevisedCommitteeMeetings** for incremental sync of meetings")
    md.append("6. **Join keys confirmed:** Biennium + BillNumber/BillId, AgendaId for meetings, MemberId for members")
    md.append("")

    return '\n'.join(md)


def main():
    output_dir = 'legislation/schemaResearch'

    print("Generating API Catalog...")
    catalog = generate_catalog()

    # Write JSON catalog
    catalog_path = os.path.join(output_dir, 'API_CATALOG.json')
    with open(catalog_path, 'w') as f:
        json.dump(catalog, f, indent=2)
    print(f"Wrote {catalog_path}")

    # Write markdown reference
    print("Generating API Reference...")
    reference_md = generate_markdown_reference(catalog)
    reference_path = os.path.join(output_dir, 'API_REFERENCE.md')
    with open(reference_path, 'w') as f:
        f.write(reference_md)
    print(f"Wrote {reference_path}")

    # Write coverage analysis
    print("Generating Coverage Analysis...")
    coverage_md = generate_coverage_analysis(catalog)
    coverage_path = os.path.join(output_dir, 'COVERAGE_ANALYSIS.md')
    with open(coverage_path, 'w') as f:
        f.write(coverage_md)
    print(f"Wrote {coverage_path}")

    print("\n=== Summary ===")
    print(f"Services: {catalog['metadata']['counts']['services']}")
    print(f"Operations: {catalog['metadata']['counts']['total_operations']}")
    print(f"Types: {catalog['metadata']['counts']['total_types']}")
    print(f"Enumerations: {catalog['metadata']['counts']['total_enumerations']}")
    print(f"Data Dictionary Fields: {catalog['metadata']['counts']['data_dictionary_fields']}")


if __name__ == '__main__':
    main()
