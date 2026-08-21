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
      { id: "math", name: "Mathematics", grade: "A+", credits: "4" },
      { id: "physics", name: "Physics", grade: "A", credits: "3" },
      { id: "english", name: "English", grade: "B+", credits: "2" },
    ]);

    const result = calculateSemester(semester);
    expect(result.totalCredits).toBe(9);
    expect(result.weightedPoints).toBe(83);
    expect(result.sgpa).toBeCloseTo(83 / 9, 8);
  });

  it("produces the correct credit-weighted CGPA across two semesters", () => {
    const first = calculateSemester(makeSemester("Semester 1", [
      { id: "math", name: "Mathematics", grade: "A+", credits: "4" },
      { id: "physics", name: "Physics", grade: "A", credits: "3" },
      { id: "english", name: "English", grade: "B+", credits: "2" },
    ]));
    const second = calculateSemester(makeSemester("Semester 2", [
      { id: "data", name: "Data Structures", grade: "B", credits: "3" },
      { id: "electronics", name: "Electronics", grade: "C", credits: "4" },
    ]));

    const cgpa = (first.weightedPoints + second.weightedPoints) / (first.totalCredits + second.totalCredits);
    expect(cgpa).toBeCloseTo(8, 8);
  });

  it("includes a failing grade with zero points and excludes incomplete rows", () => {
    const semester = makeSemester("Semester 3", [
      { id: "pass", name: "Algorithms", grade: "A+", credits: "2" },
      { id: "fail", name: "Elective", grade: "F", credits: "1" },
      { id: "incomplete", name: "Lab", grade: "", credits: "1" },
    ]);

    const result = calculateSemester(semester);
    expect(result.totalCredits).toBe(3);
    expect(result.weightedPoints).toBe(20);
    expect(result.sgpa).toBeCloseTo(20 / 3, 8);
    expect(result.incompleteRows).toBe(1);
  });
});

