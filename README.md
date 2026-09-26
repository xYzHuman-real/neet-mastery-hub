# NEET Mastery Hub

Content foundation for a NEET preparation app.

## Data hierarchy

**Subject → Unit → Chapter → Topic → Questions**

The official NMC NEET UG 2026 syllabus remains the top-level syllabus layer. NCERT chapters/topics are mapped underneath those units. The NMC published the updated NEET UG 2026 syllabus notice on 23 December 2025.

## Current coverage

- **Physics:** 20/20 official NEET UG 2026 units
- **Chemistry:** 20/20 official NEET UG 2026 units
- **Biology:** 10/10 official NEET UG 2026 units
- **Chapter layer:** 87 chapter/syllabus-section records mapped to units
- **Lessons:** 87 chapter-level lesson records
- **Questions:** 117 NEET-style MCQs
- **Chapter coverage:** every chapter/syllabus-section record has at least one question
- **Question schema:** `data/question.schema.json`

## Files

- `data/syllabus.json` — official 50-unit syllabus layer
- `data/chapters.json` — NCERT chapter mapping plus practical/syllabus sections
- `data/lessons.json` — app-ready chapter lessons
- `data/questions.json` — question bank
- `data/question.schema.json` — validation schema

## Chapter records

Chapter records include:

- `id`
- `subject`
- `class`
- `ncertChapter`
- `unitId`
- `topics`
- `chapterType` where a syllabus section is not a standalone NCERT chapter

The practical/syllabus sections are explicitly marked instead of pretending they are NCERT textbook chapters.

## Question records

Each question follows the requested structure:

```json
{
  "id": "phy-q1",
  "chapterId": "phy-c1",
  "mode": "mcq",
  "prompt": "...",
  "options": ["...", "...", "...", "..."],
  "answer": 0,
  "difficulty": "easy",
  "citation": {
    "book": "NCERT Physics XI",
    "chapter": "Units and Measurements",
    "page": null,
    "line": null,
    "reference": "..."
  }
}
```

Page and line are intentionally nullable. They should only be populated after verifying the exact NCERT edition/page numbering used by the app; they are not guessed.

## NCERT alignment

Questions are original questions based on NCERT concepts and the official NEET syllabus. The app should **not reproduce NCERT textbook passages line-by-line**. Page/line metadata can be added later from a specific NCERT edition when verified.

## Next expansion

The schema already supports `mcq`, `numerical`, `statement`, and `match` modes. The current bank is a foundation; additional chapter-specific question sets can be added without changing the data model.


## Question-bank minimum

Every chapter has a hard minimum target of **50 questions**. With 87 chapters, the complete bank must contain at least **4,350 questions**. The repository includes `scripts/validateQuestionMinimum.mjs` to fail validation whenever a chapter is below 50.

Question records should use `topicId`, `sourceType`, and `reviewStatus`. Exact NCERT page/line citations must not be invented; they should remain null until verified against the intended textbook edition.
