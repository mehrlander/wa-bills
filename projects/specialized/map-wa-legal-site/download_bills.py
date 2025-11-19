#!/usr/bin/env python3
"""
Download Washington State Legislative Bills from lawfilesext.leg.wa.gov

This script automates downloading bills and saves them to a local directory
structure that mirrors the website organization.
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path
from urllib.parse import quote
from typing import List, Dict, Optional
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


class WABillDownloader:
    """Downloads bills from Washington State Legislature website."""

    BASE_URL = "https://lawfilesext.leg.wa.gov"

    def __init__(self, output_dir: str = "bills", delay: float = 1.0):
        """
        Initialize the downloader.

        Args:
            output_dir: Directory to save downloaded bills
            delay: Delay in seconds between requests (be respectful)
        """
        self.output_dir = Path(output_dir)
        self.delay = delay
        self.session = self._create_session()
        self.stats = {
            'downloaded': 0,
            'skipped': 0,
            'failed': 0
        }

    def _create_session(self) -> requests.Session:
        """Create a session with retry logic."""
        session = requests.Session()
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        # Set a user agent to identify the bot
        session.headers.update({
            'User-Agent': 'WA-Bills-GitHub-Archive-Bot/1.0 (Educational/Research Purpose)'
        })
        return session

    def construct_url(self, biennium: str, chamber: str, bill_number: str,
                     format_type: str = "Pdf", bill_type: str = "Bills",
                     category: str = None) -> str:
        """
        Construct URL for a bill.

        Args:
            biennium: e.g., "2023-24"
            chamber: "House" or "Senate"
            bill_number: e.g., "1234" or "1234-S"
            format_type: "Pdf" or "Htm"
            bill_type: "Bills", "Session Laws", etc.
            category: Optional subdirectory like "Senate Bills", "House Bills"

        Returns:
            Full URL to the bill
        """
        ext = "pdf" if format_type == "Pdf" else "htm"

        # Construct the category path
        if category is None:
            category = f"{chamber} Bills"

        # URL encode spaces
        category_encoded = quote(category, safe='')

        path = f"/Biennium/{biennium}/{format_type}/{bill_type}/{category_encoded}/{bill_number}.{ext}"
        return f"{self.BASE_URL}{path}"

    def download_bill(self, url: str, output_path: Path,
                     skip_existing: bool = True) -> bool:
        """
        Download a single bill.

        Args:
            url: URL to download from
            output_path: Local path to save to
            skip_existing: Skip if file already exists

        Returns:
            True if downloaded, False if skipped or failed
        """
        # Check if already exists
        if skip_existing and output_path.exists():
            print(f"⏭️  Skipping (exists): {output_path.name}")
            self.stats['skipped'] += 1
            return False

        # Create parent directories
        output_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            print(f"⬇️  Downloading: {url}")
            response = self.session.get(url, timeout=30)

            # Check if successful
            if response.status_code == 200:
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                print(f"✅ Saved: {output_path}")
                self.stats['downloaded'] += 1
                return True
            elif response.status_code == 404:
                print(f"❌ Not found (404): {url}")
                self.stats['failed'] += 1
                return False
            else:
                print(f"❌ Failed ({response.status_code}): {url}")
                self.stats['failed'] += 1
                return False

        except requests.exceptions.RequestException as e:
            print(f"❌ Error downloading {url}: {e}")
            self.stats['failed'] += 1
            return False
        finally:
            # Be respectful with rate limiting
            time.sleep(self.delay)

    def download_bill_spec(self, spec: Dict) -> bool:
        """
        Download a bill from a specification dict.

        Args:
            spec: Dictionary with bill details (biennium, chamber, number, etc.)

        Returns:
            True if successful
        """
        biennium = spec['biennium']
        chamber = spec.get('chamber', 'House')
        bill_number = spec['number']
        format_type = spec.get('format', 'Pdf')
        bill_type = spec.get('type', 'Bills')
        category = spec.get('category')

        # Construct URL
        url = self.construct_url(
            biennium, chamber, bill_number,
            format_type, bill_type, category
        )

        # Construct local path that mirrors the URL structure
        ext = "pdf" if format_type == "Pdf" else "htm"
        category_name = category or f"{chamber} Bills"

        output_path = (
            self.output_dir /
            biennium /
            format_type /
            bill_type /
            category_name /
            f"{bill_number}.{ext}"
        )

        return self.download_bill(url, output_path)

    def download_from_config(self, config_path: str):
        """
        Download bills specified in a JSON config file.

        Args:
            config_path: Path to JSON configuration file
        """
        with open(config_path, 'r') as f:
            config = json.load(f)

        bills = config.get('bills', [])
        print(f"📋 Found {len(bills)} bills to download")
        print("=" * 60)

        for bill in bills:
            self.download_bill_spec(bill)

        # Print summary
        print("=" * 60)
        print("📊 Download Summary:")
        print(f"   ✅ Downloaded: {self.stats['downloaded']}")
        print(f"   ⏭️  Skipped: {self.stats['skipped']}")
        print(f"   ❌ Failed: {self.stats['failed']}")

    def download_range(self, biennium: str, chamber: str,
                      start: int, end: int, format_type: str = "Pdf"):
        """
        Download a range of bill numbers.

        Args:
            biennium: e.g., "2023-24"
            chamber: "House" or "Senate"
            start: Starting bill number
            end: Ending bill number (inclusive)
            format_type: "Pdf" or "Htm"
        """
        print(f"📋 Downloading {chamber} bills {start}-{end} for {biennium}")
        print("=" * 60)

        for num in range(start, end + 1):
            bill_spec = {
                'biennium': biennium,
                'chamber': chamber,
                'number': str(num),
                'format': format_type
            }
            self.download_bill_spec(bill_spec)

        # Print summary
        print("=" * 60)
        print("📊 Download Summary:")
        print(f"   ✅ Downloaded: {self.stats['downloaded']}")
        print(f"   ⏭️  Skipped: {self.stats['skipped']}")
        print(f"   ❌ Failed: {self.stats['failed']}")


def main():
    parser = argparse.ArgumentParser(
        description='Download WA State Legislative Bills'
    )
    parser.add_argument(
        '--config',
        help='Path to JSON config file with bill specifications',
        default='bills_config.json'
    )
    parser.add_argument(
        '--output-dir',
        help='Output directory for downloaded bills',
        default='bills'
    )
    parser.add_argument(
        '--delay',
        help='Delay between requests in seconds',
        type=float,
        default=1.0
    )
    parser.add_argument(
        '--biennium',
        help='Biennium (e.g., 2023-24) for range download'
    )
    parser.add_argument(
        '--chamber',
        help='Chamber (House or Senate) for range download',
        choices=['House', 'Senate']
    )
    parser.add_argument(
        '--start',
        help='Starting bill number for range download',
        type=int
    )
    parser.add_argument(
        '--end',
        help='Ending bill number for range download',
        type=int
    )
    parser.add_argument(
        '--format',
        help='Format type (Pdf or Htm)',
        choices=['Pdf', 'Htm'],
        default='Pdf'
    )

    args = parser.parse_args()

    downloader = WABillDownloader(
        output_dir=args.output_dir,
        delay=args.delay
    )

    # Range download mode
    if args.biennium and args.chamber and args.start and args.end:
        downloader.download_range(
            args.biennium,
            args.chamber,
            args.start,
            args.end,
            args.format
        )
    # Config file mode
    elif os.path.exists(args.config):
        downloader.download_from_config(args.config)
    else:
        print(f"❌ Config file not found: {args.config}")
        print("\nUsage examples:")
        print("  # Download from config file:")
        print(f"  python {sys.argv[0]} --config bills_config.json")
        print("\n  # Download range of bills:")
        print(f"  python {sys.argv[0]} --biennium 2023-24 --chamber House --start 1000 --end 1010")
        sys.exit(1)


if __name__ == "__main__":
    main()
