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

  it("reproduces Shreyas M’s official revaluation SGPA of 3.95", () => {
    const result = calculateSemester(makeSemester("Semester II — official revaluation", [
      // The official result labels this zero-point course as DX; F is the calculator-scale equivalent (0 points).
      { id: "maths", name: "Advanced Calculus and Numerical", grade: "F", credits: "4" },
      { id: "python", name: "Python Programming", grade: "F", credits: "4" },
      { id: "ai", name: "Introduction to AI and Applications", grade: "B", credits: "3" },
      { id: "electronics", name: "Introduction to Electronics", grade: "C", credits: "3" },
      { id: "communication", name: "Communication Skills", grade: "A+", credits: "1" },
      { id: "chemistry", name: "Applied Chemistry", grade: "B+", credits: "4" },
      { id: "pbl", name: "Project Based Learning", grade: "A+", credits: "1" },
    ]));

    expect(result.totalCredits).toBe(20);
    expect(result.weightedPoints).toBe(79);
    expect(result.sgpa).toBeCloseTo(3.95, 8);
  });
});
