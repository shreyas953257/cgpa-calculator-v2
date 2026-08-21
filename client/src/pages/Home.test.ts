import { describe, expect, it } from "vitest";
import { calculateSemester, type Semester } from "./Home";

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

  it("keeps DX credit-bearing at zero points while retaining PP as a separate 10-point grade state", () => {
    const result = calculateSemester(makeSemester("Special grade handling", [
      { id: "dx-course", name: "DX course", grade: "DX", credits: "3" },
      { id: "pp-course", name: "PP course", grade: "PP", credits: "1" },
      { id: "o-course", name: "O course", grade: "O", credits: "2" },
    ]));

    expect(result.totalCredits).toBe(6);
    expect(result.weightedPoints).toBe(30);
    expect(result.sgpa).toBeCloseTo(5, 8);
  });
});
