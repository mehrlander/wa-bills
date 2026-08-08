---
id: adopt-current-conventions-p9k3wd
title: Decide whether the handoff-prompt convention stays copied here
status: backlog
opened: 2026-08-08
---
# Decide whether the handoff-prompt convention stays copied here

Most of `CLAUDE.md` is a restatement of the post-merge handoff-prompt
convention: fence it, cite the merged PR, point rather than quote, shape each
issue as symptom / cause / fixes, keep it short. That text is portable, and the
upstream version lives in web-tools'
[`docs/SURFACING.md`](https://github.com/mehrlander/web-tools/blob/main/docs/SURFACING.md)
under Post-merge handoff.

It was accurate when written and has been overtaken in one respect worth
naming: upstream now sits inside a wider course (guide PR, wrap-up, closing
states, the tracker as the follow-up axis) that this copy does not mention, so
a session reading only this file gets the ending without the lifecycle. The
copy also cannot know when upstream changes, which is the ordinary failure of
a private restatement of a public convention.

Not a defect to fix on sight, because a local copy is sometimes the right call:
chat-histories keeps one deliberately, with a paragraph saying which upstream
parts it dropped and why. The question is which of the two this repo wants.

## Definition of done

Either the section defers to upstream and names only what is local here, or it
keeps the copy and says explicitly which upstream material it is declining, in
the manner of chat-histories' provenance paragraph. Both are acceptable; an
undated copy that claims neither is not.

## Progress log
- 2026-08-08: filed when the tracker was stood up. The stale skill name in the
  same file (`web-tools-conventions`, retired) was fixed in the standup commit
  rather than filed, since it had no decision attached.
