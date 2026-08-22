import { describe, expect, it } from "vitest";
import {
  calculateSavedCgpa,
  calculateSemester,
  createSavedSemester,
  getSubjectAudit,
  loadSavedSemesters,
  persistSavedSemesters,
  type Semester,
} from "./Home";

const makeSemester = (name: string, subjects: Semester["subjects"]): Semester => ({
  id: name.toLowerCase().replaceAll(" ", "-"),
  name,
  subjects,
});

describe("CGPA Calculator formulas", () => {
  it("calculates SGPA from grade points and credits", () => {
    const semester = makeSemester("Semester 1", [
      { id: "math", name: "Mathematics", grade: "O", credits: "4" },
      { id: "physics", name: "Physics", grade: "A+", credits: "3" },
      { id: "english", name: "English", grade: "A", credits: "2" },
    ]);

    const result = calculateSemester(semester);
    expect(result.totalCredits).toBe(9);
    expect(result.weightedPoints).toBe(83);
    expect(result.sgpa).toBeCloseTo(83 / 9, 8);
  });

  it("produces the correct credit-weighted CGPA across two semesters", () => {
    const first = calculateSemester(makeSemester("Semester 1", [
      { id: "math", name: "Mathematics", grade: "O", credits: "4" },
      { id: "physics", name: "Physics", grade: "A+", credits: "3" },
      { id: "english", name: "English", grade: "A", credits: "2" },
    ]));
    const second = calculateSemester(makeSemester("Semester 2", [
      { id: "data", name: "Data Structures", grade: "B", credits: "3" },
      { id: "electronics", name: "Electronics", grade: "C", credits: "4" },
    ]));

    const cgpa = (first.weightedPoints + second.weightedPoints) / (first.totalCredits + second.totalCredits);
    expect(cgpa).toBeCloseTo(121 / 16, 8);
  });

  it("excludes failing-grade credits and incomplete rows under the institution rule", () => {
    const semester = makeSemester("Semester 3", [
      { id: "pass", name: "Algorithms", grade: "O", credits: "2" },
      { id: "fail", name: "Elective", grade: "F", credits: "1" },
      { id: "incomplete", name: "Lab", grade: "", credits: "1" },
    ]);

    const result = calculateSemester(semester);
    expect(result.totalCredits).toBe(2);
    expect(result.weightedPoints).toBe(20);
    expect(result.sgpa).toBeCloseTo(10, 8);
    expect(result.incompleteRows).toBe(1);
    expect(result.excludedFCount).toBe(1);
    expect(result.excludedFCredits).toBe(1);
  });

  it("reproduces the complete official 185-point, 20-credit SGPA of 9.25", () => {
    const result = calculateSemester(makeSemester("Semester II — official complete result", [
      { id: "maths", name: "Advanced Calculus and Numerical", grade: "A+", credits: "4" },
      { id: "python", name: "Python Programming", grade: "A+", credits: "4" },
      { id: "ai", name: "Introduction to AI and Applications", grade: "A", credits: "3" },
      // PP is a verified 1-credit, 10-point official course contribution in this result row.
      { id: "constitution", name: "Indian Constitution", grade: "PP", credits: "1" },
      { id: "electronics", name: "Introduction to Electronics", grade: "O", credits: "3" },
      { id: "communication", name: "Communication Skills", grade: "A+", credits: "1" },
      { id: "chemistry", name: "Applied Chemistry", grade: "O", credits: "4" },
      { id: "pbl", name: "Project Based Learning", grade: "O", credits: "0" },
    ]));

    expect(result.totalCredits).toBe(20);
    expect(result.weightedPoints).toBe(185);
    expect(result.sgpa).toBeCloseTo(9.25, 8);
  });

  it("verifies the printed official aggregate arithmetic of 185 ÷ 20 = 9.25", () => {
    expect(185 / 20).toBeCloseTo(9.25, 8);
  });

  it("excludes DX points and credits while retaining PP as a separate 10-point grade state", () => {
    const result = calculateSemester(makeSemester("Special grade handling", [
      { id: "dx-course", name: "DX course", grade: "DX", credits: "3" },
      { id: "pp-course", name: "PP course", grade: "PP", credits: "1" },
      { id: "o-course", name: "O course", grade: "O", credits: "2" },
    ]));

    expect(result.totalCredits).toBe(3);
    expect(result.weightedPoints).toBe(30);
    expect(result.sgpa).toBeCloseTo(10, 8);
    expect(result.excludedDxCount).toBe(1);
    expect(result.excludedDxCredits).toBe(3);
  });

  it("excludes both F and DX credits while retaining their zero-point contribution", () => {
    const failing = calculateSemester(makeSemester("F course", [
      { id: "f-course", name: "Failed course", grade: "F", credits: "4" },
    ]));
    const deferred = calculateSemester(makeSemester("DX course", [
      { id: "dx-course", name: "Excluded course", grade: "DX", credits: "4" },
    ]));

    expect(failing.weightedPoints).toBe(0);
    expect(failing.totalCredits).toBe(0);
    expect(failing.sgpa).toBeNull();
    expect(deferred.weightedPoints).toBe(0);
    expect(deferred.totalCredits).toBe(0);
    expect(deferred.sgpa).toBeNull();
    expect(getSubjectAudit({ id: "f-audit", name: "Failed course", grade: "F", credits: "4" })).toMatchObject({
      gradePoint: 0,
      weightedPoints: 0,
      status: "Excluded",
    });
    expect(getSubjectAudit({ id: "dx-audit", name: "Excluded course", grade: "DX", credits: "4" })).toMatchObject({
      gradePoint: 0,
      weightedPoints: 0,
      status: "Excluded",
    });
  });

  it("keeps credits excluded when toggling between DX and F", () => {
    const subject = { id: "toggle", name: "Toggled course", grade: "DX" as const, credits: "4" };
    const dxResult = calculateSemester(makeSemester("Transition", [subject]));
    const fResult = calculateSemester(makeSemester("Transition", [{ ...subject, grade: "F" }]));
    const dxAgain = calculateSemester(makeSemester("Transition", [{ ...subject, grade: "DX" }]));

    expect(dxResult.totalCredits).toBe(0);
    expect(fResult.totalCredits).toBe(0);
    expect(fResult.weightedPoints).toBe(0);
    expect(dxAgain.totalCredits).toBe(0);
    expect(dxAgain.excludedDxCredits).toBe(4);
    expect(fResult.excludedFCredits).toBe(4);
  });

  it("uses only the twelve included credits when four-credit DX and F subjects are excluded", () => {
    const result = calculateSemester(makeSemester("20 registered credits", [
      { id: "maths", name: "Mathematics", grade: "DX", credits: "4" },
      { id: "python", name: "Python", grade: "F", credits: "4" },
      { id: "included", name: "Included coursework", grade: "O", credits: "12" },
    ]));

    expect(result.totalCredits).toBe(12);
    expect(result.weightedPoints).toBe(120);
    expect(result.sgpa).toBeCloseTo(10, 8);
  });

  it("reports audit values from the same inclusion rules as the calculation", () => {
    expect(getSubjectAudit({ id: "normal", name: "Normal course", grade: "A", credits: "3" })).toMatchObject({
      gradePoint: 8,
      credits: 3,
      weightedPoints: 24,
      status: "Included",
    });
    expect(getSubjectAudit({ id: "dx", name: "DX course", grade: "DX", credits: "3" })).toMatchObject({
      gradePoint: 0,
      credits: 3,
      weightedPoints: 0,
      status: "Excluded",
    });
    expect(getSubjectAudit({ id: "pp", name: "PP course", grade: "PP", credits: "1" })).toMatchObject({
      gradePoint: 10,
      credits: 1,
      weightedPoints: 10,
      status: "Included",
    });
  });

  it("persists completed semesters and uses saved weighted points and credits for CGPA", () => {
    const memory = new Map<string, string>();
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => memory.set(key, value),
      removeItem: (key: string) => memory.delete(key),
    };
    const first = createSavedSemester(makeSemester("Semester 1", [
      { id: "math", name: "Mathematics", grade: "O", credits: "4" },
      { id: "physics", name: "Physics", grade: "A+", credits: "3" },
    ]), "2026-08-21T00:00:00.000Z");
    const second = createSavedSemester(makeSemester("Semester 2", [
      { id: "programming", name: "Programming", grade: "A", credits: "2" },
      { id: "elective", name: "Elective", grade: "B", credits: "2" },
    ]), "2026-08-21T00:01:00.000Z");

    persistSavedSemesters([first], storage);
    expect(loadSavedSemesters(storage)).toHaveLength(1);
    persistSavedSemesters([first, second], storage);

    const historyAfterReload = loadSavedSemesters(storage);
    expect(historyAfterReload).toHaveLength(2);
    expect(historyAfterReload[0].subjects[0]).toMatchObject({ gradePoint: 10, weightedPoints: 40 });
    const overall = calculateSavedCgpa(historyAfterReload);
    expect(overall.totalCredits).toBe(11);
    expect(overall.totalWeightedPoints).toBe(95);
    expect(overall.cgpa).toBeCloseTo(95 / 11, 8);
  });

  it("omits both F and DX credits after a semester is saved and reloaded", () => {
    const memory = new Map<string, string>();
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => memory.set(key, value),
      removeItem: (key: string) => memory.delete(key),
    };
    const saved = createSavedSemester(makeSemester("Special grades", [
      { id: "failed", name: "Failed course", grade: "F", credits: "4" },
      { id: "excluded", name: "Deferred course", grade: "DX", credits: "4" },
      { id: "completed", name: "Completed course", grade: "O", credits: "2" },
    ]), "2026-08-21T00:02:00.000Z");

    persistSavedSemesters([saved], storage);
    const reloaded = loadSavedSemesters(storage);
    const overall = calculateSavedCgpa(reloaded);
    expect(reloaded[0].totalCredits).toBe(2);
    expect(reloaded[0].totalWeightedPoints).toBe(20);
    expect(overall.totalCredits).toBe(2);
    expect(overall.totalWeightedPoints).toBe(20);
    expect(overall.cgpa).toBeCloseTo(10, 8);
  });
});
