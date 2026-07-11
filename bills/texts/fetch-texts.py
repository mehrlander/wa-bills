#!/usr/bin/env python3
"""Populate bills/texts/ from lawfilesext.leg.wa.gov per manifest.json.

Walks the corpus in 36 chunks (biennium x format x chamber), newest
biennium first. Within a chunk, 3 curl workers with a per-request pause
hold the aggregate rate near 4 requests/second. A file already on disk
at the manifest's exact byte size is skipped, so reruns resume where the
last run stopped. After each chunk the script verifies sizes, commits,
and pushes, so progress survives an interrupted session.

Usage:
    python3 bills/texts/fetch-texts.py [--dry-run] [--no-git] [--only 2025-26]

Failures land in the log and in fetch-failures.txt beside the log; the
script continues past them. Rerun to retry.
"""

import argparse
import json
import os
import subprocess
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
TEXTS = REPO / "bills" / "texts"
BASE = "https://lawfilesext.leg.wa.gov/Biennium"
WORKERS = 3
PAUSE = 0.15  # seconds per worker between requests; ~4-6 req/s aggregate

BIENNIA = ["2025-26", "2023-24", "2021-22", "2019-20", "2017-18",
           "2015-16", "2013-14", "2011-12", "2009-10"]
FORMATS = ["Xml", "Htm"]
CHAMBERS = ["House", "Senate"]

TRAILER = ("Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>\n"
           "Claude-Session: https://claude.ai/code/session_01M9eSFKFpXUEU9GZXasatiG")

log_lock = threading.Lock()


def log(msg, logfile):
    line = f"{time.strftime('%Y-%m-%d %H:%M:%S')} {msg}"
    with log_lock:
        print(line, flush=True)
        with open(logfile, "a") as f:
            f.write(line + "\n")


def fetch_one(entry, failfile, logfile):
    b, fmt, ch, name, size = (entry["biennium"], entry["fmt"],
                              entry["chamber"], entry["name"], entry["size"])
    out = TEXTS / b / fmt / ch / name
    if out.exists() and out.stat().st_size == size:
        return "skip"
    out.parent.mkdir(parents=True, exist_ok=True)
    url = f"{BASE}/{b}/{fmt}/Bills/{ch}%20Bills/{name}"
    r = subprocess.run(
        ["curl", "-sS", "--fail", "--retry", "3", "--retry-delay", "2",
         "-o", str(out), url],
        capture_output=True, text=True)
    time.sleep(PAUSE)
    if r.returncode != 0:
        with log_lock:
            with open(failfile, "a") as f:
                f.write(f"{b}/{fmt}/{ch}/{name}\t{r.stderr.strip()}\n")
        log(f"FAIL {b}/{fmt}/{ch}/{name}: {r.stderr.strip()}", logfile)
        out.unlink(missing_ok=True)
        return "fail"
    if out.stat().st_size != size:
        # Listing sizes are authoritative; a mismatch means a partial or
        # changed file. Record it, keep the bytes for inspection.
        with log_lock:
            with open(failfile, "a") as f:
                f.write(f"{b}/{fmt}/{ch}/{name}\tsize "
                        f"{out.stat().st_size} != {size}\n")
        return "sizemismatch"
    return "ok"


def git(args, check=True):
    return subprocess.run(["git", "-C", str(REPO)] + args,
                          capture_output=True, text=True, check=check)


def push_with_retry(branch, logfile):
    for i, delay in enumerate([0, 2, 4, 8, 16]):
        if delay:
            time.sleep(delay)
        r = git(["push", "-u", "origin", branch], check=False)
        if r.returncode == 0:
            return True
        log(f"push attempt {i + 1} failed: {r.stderr.strip()[:300]}", logfile)
    return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--no-git", action="store_true")
    ap.add_argument("--only", help="restrict to one biennium")
    ap.add_argument("--logdir", default="/tmp/claude-0/-home-user-wa-bills/"
                    "dc737e7d-ada4-5037-9f38-020df3e65451/scratchpad")
    args = ap.parse_args()

    logdir = Path(args.logdir)
    logdir.mkdir(parents=True, exist_ok=True)
    logfile = logdir / "fetch-texts.log"
    failfile = logdir / "fetch-failures.txt"

    manifest = json.load(open(TEXTS / "manifest.json"))
    branch = git(["rev-parse", "--abbrev-ref", "HEAD"]).stdout.strip()
    log(f"start: {len(manifest)} manifest entries, branch {branch}", logfile)

    by_chunk = {}
    for e in manifest:
        by_chunk.setdefault((e["biennium"], e["fmt"], e["chamber"]),
                            []).append(e)

    grand = {"ok": 0, "skip": 0, "fail": 0, "sizemismatch": 0}
    for b in BIENNIA:
        if args.only and b != args.only:
            continue
        for fmt in FORMATS:
            for ch in CHAMBERS:
                chunk = by_chunk.get((b, fmt, ch), [])
                if not chunk:
                    continue
                t0 = time.time()
                log(f"chunk {b}/{fmt}/{ch}: {len(chunk)} files, "
                    f"{sum(e['size'] for e in chunk) / 1e6:.0f} MB", logfile)
                if args.dry_run:
                    continue
                counts = {"ok": 0, "skip": 0, "fail": 0, "sizemismatch": 0}
                with ThreadPoolExecutor(max_workers=WORKERS) as ex:
                    for res in ex.map(
                            lambda e: fetch_one(e, failfile, logfile), chunk):
                        counts[res] += 1
                        grand[res] += 1
                log(f"chunk {b}/{fmt}/{ch} done in "
                    f"{(time.time() - t0) / 60:.1f} min: {counts}", logfile)
                if args.no_git:
                    continue
                git(["add", f"bills/texts/{b}/{fmt}/{ch}"], check=False)
                staged = git(["diff", "--cached", "--name-only"]).stdout
                if not staged.strip():
                    log(f"chunk {b}/{fmt}/{ch}: nothing new to commit",
                        logfile)
                    continue
                n = len(staged.strip().splitlines())
                msg = (f"Add {b} {fmt} {ch} bill texts ({n} files)"
                       f"\n\n{TRAILER}")
                r = git(["commit", "-m", msg], check=False)
                if r.returncode != 0:
                    log(f"commit failed: {r.stderr.strip()[:300]}", logfile)
                    continue
                if push_with_retry(branch, logfile):
                    log(f"pushed {b}/{fmt}/{ch}", logfile)
                else:
                    log(f"PUSH FAILED for {b}/{fmt}/{ch}; continuing, "
                        f"commits accumulate locally", logfile)

    log(f"all chunks done: {grand}", logfile)
    if grand["fail"] or grand["sizemismatch"]:
        log(f"see {failfile}", logfile)
        sys.exit(1)


if __name__ == "__main__":
    main()
