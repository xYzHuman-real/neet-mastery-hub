# NEET Mastery Hub

Content foundation for a NEET preparation app.

## Current coverage

- **Physics:** 20/20 official NEET UG 2026 units
- **Chemistry:** 20/20 official NEET UG 2026 units
- **Biology:** 10/10 official NEET UG 2026 units
- **Lessons:** 50 unit-level lesson records, each expanded with 3 granular topic groups
- **Questions:** 100 NEET-style MCQs, with two questions mapped to every syllabus unit
- **Question schema:** `data/question.schema.json`

## Lesson data

Each lesson includes:

- `id`
- `subject`
- `unit`
- `title`
- `topics`
- `questionModes`
- `estimatedMinutes`
- `examFocus`
- `questionCount`
- `ncertAligned`

The topic groups are based on the official NMC NEET UG 2026 syllabus. They are intended as app navigation/lesson metadata rather than reproductions of textbook text.

## Question data

Each question follows the requested structure:

```json
{
  "id": "phy-q21",
  "chapterId": "phy-u1",
  "mode": "mcq",
  "prompt": "...",
  "options": ["...", "...", "...", "..."],
  "answer": 0,
  "difficulty": "easy",
  "explanation": "...",
  "citation": {
    "book": "NCERT Physics XI",
    "chapter": "...",
    "page": null,
    "line": null,
    "reference": "..."
  }
}
```

Page and line are intentionally nullable. They should only be populated after verifying the exact NCERT edition/page numbering used by the app; they are not guessed.

## Source boundary

The syllabus coverage follows the NMC's published **NEET (UG) 2026** syllabus. NMC published the updated syllabus notice on 23 December 2025, and NTA also lists the NEET UG 2026 syllabus notice.

## Next content expansion

The data model is ready for additional question modes such as numerical, statement/assertion-reasoning, and match-the-following without changing the core question structure.
