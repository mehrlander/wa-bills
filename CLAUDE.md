## Working conventions

Run the `web-tools` skill (`/portable:web-tools`) at the start of any session that will modify files.

These are your portable conventions for Claude Code web sessions: surfacing primitives (explicit markdown, `[new]/[main]/[diff]` per-file links, screenshots, branch anchors, session diffs), plus the guide-PR lifecycle that begins when a PR opens. The canonical sources are [`docs/CONVENTIONS.md`](https://github.com/mehrlander/web-tools/blob/main/docs/CONVENTIONS.md) and [`docs/SURFACING.md`](https://github.com/mehrlander/web-tools/blob/main/docs/SURFACING.md) in your public repo `mehrlander/web-tools`; the skill fetches both fresh each session so this repo doesn't keep a stale copy. Local `CLAUDE.md` rules override the portable defaults.

## Project tracker

This repo runs the portable tracker, stood up 2026-08-08. Task files are `tracker/tasks/<id>.md`, the rollups are `tracker/board.md` and `tracker/board.json`, and both commit directly to `main`. Local extension points and the standing permission are in [`tracker/README.md`](tracker/README.md); the convention itself is upstream in [`docs/TRACKER.md`](https://github.com/mehrlander/web-tools/blob/main/docs/TRACKER.md), operated through `/tasks`.

## Post-merge handoff

A recurring pattern: the user merges, then surfaces a bug or the next round of work. That belongs to a new session, but the current session has the context to assess results and set the course.

When asked for a handoff prompt (HP):

**Wrap it in a fenced markdown code block.** The user often copies on mobile, so a fence makes it one tap. Use four backticks outside if the prompt itself contains triple-backtick code.

**Reference the merged PR by number (or commit SHA).** The new session has the same repo access and can read any file. The PR reference grounds it in exactly what shipped.

**Point, don't quote.** Name the relevant files and functions. Don't paste file contents; the new session can open them.

**Tone is factual, not prescriptive.** Hedge suppositions. Don't rank options, recommend one, or editorialize. Don't tell the new session to commit, push, branch, or open a PR. Decision-making and workflow sit with the new session and the user.

**Shape each issue as symptom, cause, fixes.** Label causes *suspected* or *confirmed*. Label fixes *possible* or *likely*. The labels are the hedge: don't soften the prose around them.

**Propose diagnostic tests where they'd move a cause from suspected to confirmed.** The test should produce serialized output the user can share back. A second or third test that removes remaining doubt is welcome. Test results, once returned, become part of the picture, but a passing test confirms what it tested, not everything adjacent.

**Close with: "Look through the relevant files, assess, and propose how to proceed."** Or near-equivalent. The new session's first move is to form a view and bring it to the user, not to start changing things.

**Keep it short.** One context paragraph. One section per issue.
