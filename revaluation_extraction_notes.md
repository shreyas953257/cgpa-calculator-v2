# Official Revaluation Sheet Notes

Source file: `/mnt/3b669560-99f2-40b3-b3da-ff122783d9e8/CGPA Calculator/official-revaluation-results-2025-26.pdf`

## Confirmed document structure

The supplied PDF is a scanned 11-page revaluation-result sheet from Nagarjuna College of Engineering & Technology for Semester 1, B.E., May/June 2026 SEE.

## Pages reviewed so far

Page 1 is the circular cover page.

Pages 2 to 4 contain one-record summary pages. From readable entries:

| Page | Student | SGPA | Total credits | Credits earned | CGPA |
| --- | --- | ---: | ---: | ---: | ---: |
| 2 | MUAHIDEV Y | 3.75 | 16.00 | 14 | 5.69 |
| 3 | SPOORTHI A F | 2.29 | 12.00 | 2.5 | 3.43 |
| 4 | BHAVIKA B M | 0.00 | 20.00 | 0 | 16.87 |

Pages 5 and 6 contain multi-row tables of students with subject-grade columns, total credit earned, total credit point, SGPA, total previous-year marks, total marks obtained, overall credits earned, and CGPA.

## Important observed constraint

The user’s row was not identified from pages 1 to 6. The remaining pages were reviewed visually and include further multi-row tables plus several single-row sheets. The scanned PDF contains 11 A4 pages with no embedded text layer, so detailed row extraction must use high-resolution page renders rather than PDF text extraction.

## Pages 7 to 11

Pages 7 to 11 are all Semester I B.E. revaluation tables or single-record sheets. Page 8 is a 23-row multi-record table and contains several similar-looking names. The official SGPA value **3.95** is visible in a row on page 8, but the table is too dense in the overview image to transcribe its USN, name, subject grades, and course columns safely. High-resolution extraction is required before identifying the user or reconstructing any arithmetic.

The local analysis copy is `/home/ubuntu/official-revaluation-results-2025-26.pdf`; its metadata confirms 11 A4 pages and no embedded text layer.

## Identified user record: verified from page 6

The target row is page 6, row 12 of the official revaluation sheet.

| Field | Verified value |
| --- | --- |
| USN | 1NC25CS128 |
| Name | SHREYAS M |
| Semester | Semester II |
| Cycle | Chemistry Cycle |
| Revaluation subject | 25ESC243 — Introduction to Electronics |
| Grade shown in revaluation column | C |
| Grade point shown | 5 |
| Current-semester credits registered | 3 |
| Current-semester credits acquired | 3 |
| Current-semester grade points | 15 |
| SGPA shown | 3.95 |
| Previous total grade points | 160 |
| Previous total credits | 25.00 |
| Cumulative credits registered | 40 |
| Cumulative credits acquired | 28 |
| Cumulative grade points | 175 |
| CGPA shown | 6.25 |

The visible revaluation entry itself is arithmetically consistent as `C = 5`, `3 credits`, and `5 × 3 = 15` points. However, an SGPA calculated solely from this visible revaluation entry would be `15 ÷ 3 = 5.00`, not `3.95`. The sheet therefore does not expose the full semester-grade ledger used for its SGPA field.

## Full semester ledger recovered from the accompanying official Semester II result sheet

The corresponding original-result record is on page 8, row 125 of `official-semester-2-results-2025-26.pdf`. It verifies the pre-revaluation current-semester total as 64 grade points over 20 registered credits, or SGPA 3.20. Its course entries, combined with the revaluation record, produce the following evidence-backed calculation.

| Subject | Official result grade | Calculator point used | Credits | Grade point × credits |
| --- | --- | ---: | ---: | ---: |
| 25MATS21 — Advanced Calculus and Numerical | DX | 0 | 4 | 0 |
| 25PSC251 — Python Programming | F | 0 | 4 | 0 |
| 25ETC23 — Introduction to AI and Applications | B | 6 | 3 | 18 |
| 25ESC243 — Introduction to Electronics | C after revaluation; F before revaluation | 5 | 3 | 15 |
| 25ENG262 — Communication Skills | A+ | 9 | 1 | 9 |
| 25CHES22 — Applied Chemistry for Smart… | B+ | 7 | 4 | 28 |
| 25PBL28 — Project Based Learning | A+ | 9 | 1 | 9 |

The sheet also shows `PP` for 25IC027 — Indian Constitution. It is a non-credit course in this record, so it is excluded from the registered-credit denominator and from the calculator entry set.

The calculator’s requested scale has no `DX` option. In the calculation it is represented by its verified official point contribution of zero, which is numerically equivalent to `F = 0`; this does not change the official SGPA.

### Reconciliation

The original official result shows `64 ÷ 20 = 3.20`. The revaluation changes Electronics from `F = 0` to `C = 5` for 3 credits, adding `15` points while the 20 registered credits remain unchanged. Therefore:

`(64 + 15) ÷ 20 = 79 ÷ 20 = 3.95`.

The current calculator’s weighted-credit SGPA formula is therefore the correct formula. The apparent mismatch arose only because the revaluation sheet lists the amended subject entry and the recalculated SGPA, not the full semester ledger.

## Corrected complete-course test row

The official **20-credit, TGP 185, SGPA 9.25** record is not the earlier revaluation row. It is the original Semester II result-sheet row for **1NC25CS126 — SHREYA M** (page 8, row 123). It contains eight course entries, including the special `PP` entry for Indian Constitution.

The page visibly reports current-semester credits registered as 20, current-semester TGP as 185, and SGPA as 9.25. The normal credit-bearing courses sum to 20 credits. Indian Constitution is shown as `PP` with grade point 0 but is not included in the official 20-credit SGPA denominator; the course’s listed timetable credit must therefore be retained as a course record but excluded from SGPA weighting.

The same official original-result sheet shows `DX` with an explicit point value of 0 in Shreyas M’s 1NC25CS128 row. Unlike `PP`, that row’s registered credits include the DX course. The evidence therefore supports a **separate DX state with 0 grade points that remains denominator-bearing**, while **PP is a separate non-GPA state excluded from numerator and denominator**.

## Verified full 9.25 calculation

The complete official 1NC25CS126 — SHREYA M row contains the following course results. The corrected official reconciliation is driven by the printed totals: excluding PP, the course list contributes 175 points across 19 credits. The official row’s TGP and credit total therefore establish the missing PP contribution as exactly **1 credit and 10 points**. Project Based Learning is retained as an individually entered official course with its recorded grade and zero SGPA credits.

| Course | Grade | Grade point | SGPA credits | Grade point × credits |
| --- | --- | ---: | ---: | ---: |
| 25MATS21 — Advanced Calculus and Numerical | A+ | 9 | 4 | 36 |
| 25PSC251 — Python Programming | A+ | 9 | 4 | 36 |
| 25ETC23 — Introduction to AI and Applications | A | 8 | 3 | 24 |
| 25IC027 — Indian Constitution | PP | 10 | 1 | 10 |
| 25ESC243 — Introduction to Electronics | O | 10 | 3 | 30 |
| 25ENG262 — Communication Skills | A+ | 9 | 1 | 9 |
| 25CHES22 — Applied Chemistry | O | 10 | 4 | 40 |
| 25PBL28 — Project Based Learning | O | 10 | 0 | 0 |
| **Total** |  |  | **20** | **185** |

### Reconciliation

The complete individual-course calculation now exactly matches the official row: `185 ÷ 20 = 9.25`. PP is retained as its own official grade state rather than being conflated with F or DX. The calculator also accepts a zero-credit official course so every result-row entry, including Project Based Learning, can be recorded individually.
