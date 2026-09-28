# BuzNeet Question Bank Specification

The app question bank is source-first and chapter-first.

## Question types

- `ncert`: original questions derived from specific NCERT concepts/sections. These must not reproduce NCERT text verbatim.
- `mcq`: original or permissively licensed NEET-style MCQs.
- `ar`: original Assertion–Reason questions derived from NCERT concepts, plus reusable A/R PYQs when the source license permits.
- `pyq`: previous-year questions only when their text is legally reusable/licensed. NTA pages are used as authoritative source references, not as permission to bulk-republish copyrighted paper text.

## Required fields

`id`, `chapterId`, `mode`, `prompt`, `options`, `answer`, `difficulty`, `reviewStatus`, `sourceType`.

For NCERT-derived questions, include `citation.book`, `citation.chapter`, and a source reference where available.

For licensed questions, include `sourceId`, `sourceLicense`, and `sourceQuestionId`.

## Quality rules

1. No seed cycling or wording-only variants.
2. No duplicate prompts.
3. No duplicate concepts disguised with changed wording.
4. Every question must map to one existing BuzNeet chapter.
5. Answer and explanation must agree after option shuffling.
6. Out-of-syllabus questions are rejected.
7. A/R questions must have meaningful assertion/reason pairs; generic template filler is rejected.
8. Every bundled source must have an explicit license/permission record.

## Target

The chapter target in `data/chapters.json` is the desired upper-level planning target. The importer should fill each chapter from real/reusable source material first; it must not manufacture filler questions just to hit the target.
