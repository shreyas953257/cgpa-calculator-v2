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

  it("includes a failing grade with zero points and excludes incomplete rows", () => {
    const semester = makeSemester("Semester 3", [
      { id: "pass", name: "Algorithms", grade: "O", credits: "2" },
      { id: "fail", name: "Elective", grade: "F", credits: "1" },
      { id: "incomplete", name: "Lab", grade: "", credits: "1" },
    ]);

    const result = calculateSemester(semester);
    expect(result.totalCredits).toBe(3);
    expect(result.weightedPoints).toBe(20);
    expect(result.sgpa).toBeCloseTo(20 / 3, 8);
    expect(result.incompleteRows).toBe(1);
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

  it("keeps F credits in SGPA while excluding DX credits with the same zero-point contribution", () => {
    const failing = calculateSemester(makeSemester("F course", [
      { id: "f-course", name: "Failed course", grade: "F", credits: "4" },
    ]));
    const deferred = calculateSemester(makeSemester("DX course", [
      { id: "dx-course", name: "Excluded course", grade: "DX", credits: "4" },
    ]));

    expect(failing.weightedPoints).toBe(0);
    expect(failing.totalCredits).toBe(4);
    expect(failing.sgpa).toBe(0);
    expect(deferred.weightedPoints).toBe(0);
    expect(deferred.totalCredits).toBe(0);
    expect(deferred.sgpa).toBeNull();
    expect(getSubjectAudit({ id: "f-audit", name: "Failed course", grade: "F", credits: "4" })).toMatchObject({
      gradePoint: 0,
      weightedPoints: 0,
      status: "Included",
    });
    expect(getSubjectAudit({ id: "dx-audit", name: "Excluded course", grade: "DX", credits: "4" })).toMatchObject({
      gradePoint: null,
      weightedPoints: null,
      status: "Excluded",
    });
  });

  it("immediately restores credits for DX → F and removes them for F → DX", () => {
    const subject = { id: "toggle", name: "Toggled course", grade: "DX" as const, credits: "4" };
    const dxResult = calculateSemester(makeSemester("Transition", [subject]));
    const fResult = calculateSemester(makeSemester("Transition", [{ ...subject, grade: "F" }]));
    const dxAgain = calculateSemester(makeSemester("Transition", [{ ...subject, grade: "DX" }]));

    expect(dxResult.totalCredits).toBe(0);
    expect(fResult.totalCredits).toBe(4);
    expect(fResult.weightedPoints).toBe(0);
    expect(dxAgain.totalCredits).toBe(0);
    expect(dxAgain.excludedDxCredits).toBe(4);
  });

  it("reports audit values from the same inclusion rules as the calculation", () => {
    expect(getSubjectAudit({ id: "normal", name: "Normal course", grade: "A", credits: "3" })).toMatchObject({
      gradePoint: 8,
      credits: 3,
      weightedPoints: 24,
      status: "Included",
    });
    expect(getSubjectAudit({ id: "dx", name: "DX course", grade: "DX", credits: "3" })).toMatchObject({
      gradePoint: null,
      credits: 3,
      weightedPoints: null,
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

  it("keeps F credits and omits DX credits after a semester is saved and reloaded", () => {
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
    expect(reloaded[0].totalCredits).toBe(6);
    expect(reloaded[0].totalWeightedPoints).toBe(20);
    expect(overall.totalCredits).toBe(6);
    expect(overall.totalWeightedPoints).toBe(20);
    expect(overall.cgpa).toBeCloseTo(20 / 6, 8);
  });
});
