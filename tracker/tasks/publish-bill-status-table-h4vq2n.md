---
id: publish-bill-status-table-h4vq2n
title: Publish the bill-status table here, where two other stores are asking for it
status: backlog
opened: 2026-08-08
---
# Publish the bill-status table here, where two other stores are asking for it

Two repos need to know whether a bill passed, and neither can get it from here
today as a table.

budget-wa's
[resolve-lapse-outcomes](https://github.com/mehrlander/budget-wa/blob/main/tracker/tasks/resolve-lapse-outcomes-k2q8vt.md)
has to resolve the bills cited in budget lapse provisions. Its cite already
parses into chamber, number, and version prefix, so the join key exists; the
task records that "the missing side is a bill-status source," and names this
repo as "the natural home for the status table."

fn-data did not wait. Its `wa-bills-enrichment-16mzmw`, closed 2026-07-25, read
this repo's `wsl-api/data/GetLegislationSinceHistorical` and built
`joined/bill-outcomes.csv`: 30,045 rows, biennium and bill number keyed, with
`passed`, `vetoed`, `partialVeto`, `chapterLaw`, `effectiveDate`, and sponsor.
That is the table budget-wa is asking for, derived from this store's own data
and published in a different store, where a third consumer would not think to
look.

## Definition of done

- A committed bill-status table under `wsl-api/`, derived from the metadata
  already held here, with the derivation committed beside it.
- The residue named rather than dropped: bills whose status is absent or
  ambiguous, and any biennium the source does not cover.
- fn-data's `joined/bill-outcomes.csv` reconciled against it, and one of the two
  declared derived from the other rather than both standing as independent
  answers to the same question.
- budget-wa's lapse task pointed at the published table.

## Approach

Read fn-data's `tools/build-bill-outcomes.py` before writing anything. It has
already solved the join, so the open question is placement and reconciliation,
not method. The honest outcome may be that fn-data's builder moves here and
fn-data fetches the result, which is cheaper than a second implementation.

## Progress log
- 2026-08-08: filed when the tracker was stood up. Both consumers were found in
  their own trackers rather than here, which is the reason this repo needed one.
