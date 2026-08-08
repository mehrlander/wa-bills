# tracker

The cross-session work tracker for **wa-bills**: the data home and research
archive for Washington State legislation.

Protocol: the web-tools portable tracker convention, operated through `/tasks`,
which owns the filing rules and the schema
([`docs/TRACKER.md`](https://github.com/mehrlander/web-tools/blob/main/docs/TRACKER.md)
is the contract). Only what is local to this instance is recorded below.

- **Placement**: `tracker/` at this repo's root, matching every other tracker in
  the estate.
- **Board command**: regenerate via `/tasks`, which runs the plugin-bundled
  generator against `tracker/tasks` into `tracker/board.md`.
- **Registry**: none (single tracker).
- **Standing permission**: adopting the tracker is standing permission to commit
  `tracker/tasks/*.md` and the rollups straight to `main`. Note the push in the
  reply rather than asking. Feature work still rides its branch and PR.

## Why it was stood up on 2026-08-08

This was the last data repo in the estate with no cross-session memory, and it
was the one other repos kept naming. budget-wa's lapse-outcome task calls this
store "the natural home for the status table"; fn-data carries an open task to
inventory `fiscal-notes/` and decide what migrates. Neither had anywhere here to
point, so the requests lived only in the asking repo's tracker, where the party
that would act on them does not read.

## Tasks that belong to another repo's tracker

Filing both sides of one outcome in two trackers splits it, which the filing
rules warn against. Where the decision is another store's to make, the task
stays there and this note records the pointer:

- The disposition of `fiscal-notes/` is
  [fn-data's](https://github.com/mehrlander/fn-data/blob/main/tracker/tasks/wa-bills-fiscalnotes-inventory-k7m4rb.md),
  since it turns on what that store already fetches. This repo acts on its
  finding rather than duplicating the question.
