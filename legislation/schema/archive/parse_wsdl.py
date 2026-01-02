#!/usr/bin/env python3
"""
Parse all WA Legislative Web Services WSDL files to extract:
- Services, endpoints, operations
- Request parameters with types and required/optional
- Response schemas with complex types
- Enumerations
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

    # Handle maxOccurs="unbounded"
    if result['maxOccurs'] != 'unbounded':
        result['maxOccurs'] = int(result['maxOccurs'])

    # Determine required/optional
    result['required'] = result['minOccurs'] >= 1

    return result

def parse_complex_type(ct_elem, ns):
    """Parse a complexType definition"""
    result = {
        'fields': [],
        'base': None
    }

    # Check for extension (inheritance)
    extension = ct_elem.find('.//s:extension', ns)
    if extension is not None:
        result['base'] = extract_type(extension.get('base'))
        # Get fields from extension
        sequence = extension.find('s:sequence', ns)
        if sequence is not None:
            for elem in sequence.findall('s:element', ns):
                result['fields'].append(parse_element(elem, ns))
    else:
        # Direct sequence
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
    """Parse a single WSDL file and extract all relevant information"""
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

    # Get service name and documentation
    service = root.find('.//wsdl:service', NS)
    if service is not None:
        result['name'] = service.get('name')
        doc = service.find('wsdl:documentation', NS)
        if doc is not None and doc.text:
            result['documentation'] = doc.text.strip()

        # Get SOAP endpoint
        for port in service.findall('wsdl:port', NS):
            soap_addr = port.find('soap:address', NS) or port.find('soap12:address', NS)
            if soap_addr is not None:
                result['endpoint'] = soap_addr.get('location')
                break

    # Parse schema types
    schema = root.find('.//wsdl:types/s:schema', NS)
    if schema is not None:
        # Parse complex types
        for ct in schema.findall('s:complexType', NS):
            type_name = ct.get('name')
            if type_name:
                result['types'][type_name] = parse_complex_type(ct, NS)

        # Parse simple types (enumerations)
        for st in schema.findall('s:simpleType', NS):
            type_name = st.get('name')
            if type_name:
                parsed = parse_simple_type(st, NS)
                if parsed['values']:
                    result['enumerations'][type_name] = parsed

        # Parse element definitions (operations and inline types)
        operations_params = {}
        operations_responses = {}

        for elem in schema.findall('s:element', NS):
            elem_name = elem.get('name')
            if not elem_name:
                continue

            # Parse inline complex type if exists
            inline_ct = elem.find('s:complexType', NS)
            if inline_ct is not None:
                inline_type = parse_complex_type(inline_ct, NS)

                if elem_name.endswith('Response'):
                    op_name = elem_name[:-8]  # Remove 'Response'
                    operations_responses[op_name] = inline_type
                else:
                    operations_params[elem_name] = inline_type

    # Parse port types for operation documentation
    op_docs = {}
    for portType in root.findall('.//wsdl:portType', NS):
        # Only look at SOAP port type (not HTTP GET/POST)
        if portType.get('name', '').endswith('Soap'):
            for op in portType.findall('wsdl:operation', NS):
                op_name = op.get('name')
                doc = op.find('wsdl:documentation', NS)
                if doc is not None and doc.text:
                    # Clean HTML entities
                    doc_text = doc.text.replace('&lt;BR&gt;', '\n').replace('<BR>', '\n').strip()
                    op_docs[op_name] = doc_text

    # Build operations list
    for op_name, params in operations_params.items():
        response = operations_responses.get(op_name, {'fields': []})

        # Get response result type
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

def parse_data_dictionary(filepath):
    """Parse the WebServiceDataDictionary.doc file"""
    import olefile

    ole = olefile.OleFileIO(filepath)
    stream = ole.openstream("WordDocument")
    data = stream.read()
    ole.close()

    # Extract raw text
    text_chars = []
    for byte in data:
        if 32 <= byte < 127 or byte in [10, 13, 9]:
            text_chars.append(chr(byte))
        else:
            if text_chars and text_chars[-1] != ' ':
                text_chars.append(' ')
    raw_text = ''.join(text_chars)

    # Clean up
    raw_text = re.sub(r' +', ' ', raw_text)
    raw_text = re.sub(r'\n +', '\n', raw_text)

    # Find the data dictionary section
    start_idx = raw_text.find("Web Service Data DictionaryData Element")
    if start_idx == -1:
        return {}

    raw_text = raw_text[start_idx:]

    # Extract field definitions
    # Pattern: FieldName Description DataType MaxLen Values
    fields = {}

    # Known field names to look for (extracted from the document)
    field_patterns = [
        (r'Acronym\s+([^v]+?)varchar\s+(\d+)', 'Acronym', 'varchar'),
        (r'Action\s+\(RcwCiteAffected Class\)\s+([^v]+?)varchar\s+(\d+)', 'Action', 'varchar'),
        (r'ActionDate\s+([^d]+?)datetime', 'ActionDate', 'datetime'),
        (r'Address\s+([^v]+?)varchar\s+(\d+)', 'Address', 'varchar'),
        (r'Agency\s+Legislative Body\s+varchar\s+6\s+\[([^\]]+)\]', 'Agency', 'varchar'),
        (r'AgendaId\s+([^i]+?)int', 'AgendaId', 'int'),
        (r'AmendedByOppositeBody\s+([^b]+?)bool', 'AmendedByOppositeBody', 'bool'),
        (r'AmendmentExists\s+([^b]+?)bool', 'AmendmentExists', 'bool'),
        (r'Appropriations\s+([^b]+?)bool', 'Appropriations', 'bool'),
        (r'Biennium\s+([^v]+?)varchar\s+(\d+)', 'Biennium', 'varchar'),
        (r'BillId\s+([^v]+?)varchar\s+(\d+)', 'BillId', 'varchar'),
        (r'BillNumber\s+([^i]+?)int\s+(\d+)', 'BillNumber', 'int'),
        (r'Building\s+([^v]+?)varchar\s+(\d+)', 'Building', 'varchar'),
        (r'Cancelled\s+([^B]+?)Bool', 'Cancelled', 'bool'),
        (r'ChapterNumber\s+([^i]+?)int', 'ChapterNumber', 'int'),
        (r'City\s+([^v]+?)varchar\s+(\d+)', 'City', 'varchar'),
        (r'Class\s+([^v]+?)varchar\s+(\d+)', 'Class', 'varchar'),
        (r'ContactInformation\s+([^v]+?)varchar\s+(\d+)', 'ContactInformation', 'varchar'),
    ]

    return fields  # Return extracted field definitions

def main():
    wsdl_dir = 'legislation/schemaResearch/specs/wsdl-files'
    output_dir = 'legislation/schemaResearch'

    services = []
    all_types = {}
    all_enumerations = {}

    # Parse all WSDL files
    for filename in sorted(os.listdir(wsdl_dir)):
        if filename.endswith('.wsdl'):
            filepath = os.path.join(wsdl_dir, filename)
            print(f"Parsing {filename}...")
            service = parse_wsdl(filepath)
            services.append(service)

            # Collect types across services
            for type_name, type_def in service['types'].items():
                if type_name not in all_types:
                    all_types[type_name] = type_def

            for enum_name, enum_def in service['enumerations'].items():
                if enum_name not in all_enumerations:
                    all_enumerations[enum_name] = enum_def

    # Build the catalog
    catalog = {
        'metadata': {
            'source': 'https://wslwebservices.leg.wa.gov/',
            'extracted_date': datetime.now().isoformat(),
            'base_url': 'https://wslwebservices.leg.wa.gov/',
            'counts': {
                'services': len(services),
                'total_operations': sum(len(s['operations']) for s in services),
                'total_types': len(all_types),
                'total_enumerations': len(all_enumerations)
            }
        },
        'services': services,
        'commonTypes': all_types,
        'enumerations': all_enumerations
    }

    # Write JSON catalog
    output_path = os.path.join(output_dir, 'API_CATALOG.json')
    with open(output_path, 'w') as f:
        json.dump(catalog, f, indent=2)

    print(f"\nWrote catalog to {output_path}")
    print(f"Services: {catalog['metadata']['counts']['services']}")
    print(f"Operations: {catalog['metadata']['counts']['total_operations']}")
    print(f"Types: {catalog['metadata']['counts']['total_types']}")
    print(f"Enumerations: {catalog['metadata']['counts']['total_enumerations']}")

if __name__ == '__main__':
    main()
