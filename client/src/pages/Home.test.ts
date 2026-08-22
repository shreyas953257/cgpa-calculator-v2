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

const makeStorage = () => {
  const memory = new Map<string, string>();
  return {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => memory.set(key, value),
    removeItem: (key: string) => memory.delete(key),
  };
};

describe("CGPA Calculator formulas", () => {
  it("calculates SGPA from normal grades and registered credits", () => {
    const result = calculateSemester(makeSemester("Semester 1", [
      { id: "math", name: "Mathematics", grade: "O", credits: "4" },
      { id: "physics", name: "Physics", grade: "A+", credits: "3" },
      { id: "english", name: "English", grade: "A", credits: "2" },
    ]));

    expect(result.totalCredits).toBe(9);
    expect(result.earnedCredits).toBe(9);
    expect(result.weightedPoints).toBe(83);
    expect(result.sgpa).toBeCloseTo(83 / 9, 8);
  });

  it("produces the correct credit-weighted CGPA across two saved semesters", () => {
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

  it("keeps F registered credits while assigning zero earned credits and zero points", () => {
    const result = calculateSemester(makeSemester("F course", [
      { id: "failed", name: "Failed course", grade: "F", credits: "4" },
    ]));

    expect(result.totalCredits).toBe(4);
    expect(result.earnedCredits).toBe(0);
    expect(result.weightedPoints).toBe(0);
    expect(result.sgpa).toBe(0);
    expect(getSubjectAudit({ id: "failed-audit", name: "Failed course", grade: "F", credits: "4" })).toMatchObject({
      gradePoint: 0,
      credits: 4,
      earnedCredits: 0,
      weightedPoints: 0,
      status: "Included",
    });
  });

  it("keeps DX registered credits while assigning zero earned credits and zero points", () => {
    const result = calculateSemester(makeSemester("DX course", [
      { id: "dx", name: "Deferred course", grade: "DX", credits: "4" },
    ]));

    expect(result.totalCredits).toBe(4);
    expect(result.earnedCredits).toBe(0);
    expect(result.weightedPoints).toBe(0);
    expect(result.sgpa).toBe(0);
    expect(getSubjectAudit({ id: "dx-audit", name: "Deferred course", grade: "DX", credits: "4" })).toMatchObject({
      gradePoint: 0,
      credits: 4,
      earnedCredits: 0,
      weightedPoints: 0,
      status: "Included",
    });
  });

  it("keeps the same registered credits and zero earned credits when toggling F and DX", () => {
    const dxResult = calculateSemester(makeSemester("Transition", [
      { id: "toggle", name: "Toggled course", grade: "DX", credits: "4" },
    ]));
    const fResult = calculateSemester(makeSemester("Transition", [
      { id: "toggle", name: "Toggled course", grade: "F", credits: "4" },
    ]));

    expect(dxResult.totalCredits).toBe(4);
    expect(dxResult.earnedCredits).toBe(0);
    expect(fResult.totalCredits).toBe(4);
    expect(fResult.earnedCredits).toBe(0);
  });

  it("records 20 total credits, 12 earned credits, and SGPA 3.95 for the official revaluation case", () => {
    const result = calculateSemester(makeSemester("Official 3.95 result", [
      { id: "maths", name: "Mathematics", grade: "DX", credits: "4" },
      { id: "chemistry", name: "Chemistry", grade: "B+", credits: "4" },
      { id: "python", name: "Python", grade: "F", credits: "4" },
      { id: "ec", name: "Electronics", grade: "C", credits: "3" },
      { id: "ai", name: "Artificial Intelligence", grade: "B", credits: "3" },
      { id: "english", name: "English", grade: "A+", credits: "1" },
      { id: "pbl", name: "Project Based Learning", grade: "A+", credits: "1" },
    ]));

    expect(result.totalCredits).toBe(20);
    expect(result.earnedCredits).toBe(12);
    expect(result.weightedPoints).toBe(79);
    expect(result.sgpa).toBeCloseTo(3.95, 8);
  });

  it("retains the complete official 185-point, 20-credit SGPA of 9.25", () => {
    const result = calculateSemester(makeSemester("Official 9.25 result", [
      { id: "maths", name: "Advanced Calculus and Numerical", grade: "A+", credits: "4" },
      { id: "python", name: "Python Programming", grade: "A+", credits: "4" },
      { id: "ai", name: "Introduction to AI and Applications", grade: "A", credits: "3" },
      { id: "constitution", name: "Indian Constitution", grade: "PP", credits: "1" },
      { id: "electronics", name: "Introduction to Electronics", grade: "O", credits: "3" },
      { id: "communication", name: "Communication Skills", grade: "A+", credits: "1" },
      { id: "chemistry", name: "Applied Chemistry", grade: "O", credits: "4" },
      { id: "pbl", name: "Project Based Learning", grade: "O", credits: "0" },
    ]));

    expect(result.totalCredits).toBe(20);
    expect(result.earnedCredits).toBe(20);
    expect(result.weightedPoints).toBe(185);
    expect(result.sgpa).toBeCloseTo(9.25, 8);
  });

  it("shows 20 total credits and 12 earned credits when four-credit F and DX courses receive zero credit", () => {
    const result = calculateSemester(makeSemester("20 registered credits", [
      { id: "maths", name: "Mathematics", grade: "DX", credits: "4" },
      { id: "python", name: "Python", grade: "F", credits: "4" },
      { id: "included", name: "Included coursework", grade: "O", credits: "12" },
    ]));

    expect(result.totalCredits).toBe(20);
    expect(result.earnedCredits).toBe(12);
    expect(result.weightedPoints).toBe(120);
    expect(result.sgpa).toBeCloseTo(6, 8);
  });

  it("persists saved semesters with registered and earned credits for CGPA", () => {
    const storage = makeStorage();
    const saved = createSavedSemester(makeSemester("Special grades", [
      { id: "failed", name: "Failed course", grade: "F", credits: "4" },
      { id: "deferred", name: "Deferred course", grade: "DX", credits: "4" },
      { id: "completed", name: "Completed course", grade: "O", credits: "2" },
    ]), "2026-08-21T00:02:00.000Z");

    persistSavedSemesters([saved], storage);
    const afterReload = loadSavedSemesters(storage);
    const overall = calculateSavedCgpa(afterReload);

    expect(afterReload).toHaveLength(1);
    expect(afterReload[0].totalCredits).toBe(10);
    expect(afterReload[0].earnedCredits).toBe(2);
    expect(afterReload[0].totalWeightedPoints).toBe(20);
    expect(overall.totalCredits).toBe(10);
    expect(overall.earnedCredits).toBe(2);
    expect(overall.cgpa).toBeCloseTo(2, 8);
  });
});
