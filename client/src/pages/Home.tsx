/**
 * Academic Ledger design: editorial study-planner layout, Ledger Teal actions,
 * warm paper surfaces, clear numerical hierarchy, and supportive validation.
 */
import { Button } from "@/components/ui/button";
import {
  BookOpenCheck,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  GraduationCap,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

export type Grade = "" | "O" | "A+" | "A" | "B+" | "B" | "C" | "P" | "F" | "PP" | "DX";

export type Subject = {
  id: string;
  name: string;
  grade: Grade;
  credits: string;
};

export type Semester = {
  id: string;
  name: string;
  subjects: Subject[];
};

export type SemesterCalculation = {
  totalCredits: number;
  weightedPoints: number;
  sgpa: number | null;
  validSubjectCount: number;
  incompleteRows: number;
};

const gradePoints: Record<Exclude<Grade, "">, number> = {
  O: 10,
  "A+": 9,
  A: 8,
  "B+": 7,
  B: 6,
  C: 5,
  P: 4,
  F: 0,
  PP: 0,
  DX: 0,
};

const gradeOptions: [Exclude<Grade, "">, number][] = [
  ["O", 10], ["A+", 9], ["A", 8], ["B+", 7], ["B", 6], ["C", 5], ["P", 4], ["F", 0], ["PP", 0], ["DX", 0],
];

const createId = () => Math.random().toString(36).slice(2, 10);

const createSubject = (): Subject => ({
  id: createId(),
  name: "",
  grade: "",
  credits: "",
});

const createSemester = (number: number): Semester => ({
  id: createId(),
  name: `Semester ${number}`,
  subjects: [createSubject()],
});

const hasPositiveCredits = (value: string) => {
  const numericValue = Number(value);
  return value.trim() !== "" && Number.isFinite(numericValue) && numericValue > 0;
};

const isSubjectComplete = (subject: Subject) =>
  subject.name.trim() !== "" && subject.grade !== "" && hasPositiveCredits(subject.credits);

// Official result evidence: PP is recorded but excluded from SGPA credits and points; DX remains a zero-point, credit-bearing state.
const isSgpaIncluded = (subject: Subject) => isSubjectComplete(subject) && subject.grade !== "PP";

const isSubjectTouched = (subject: Subject) =>
  subject.name.trim() !== "" || subject.grade !== "" || subject.credits.trim() !== "";

const getSubjectError = (subject: Subject) => {
  if (!isSubjectTouched(subject) || isSubjectComplete(subject)) return null;
  if (subject.name.trim() === "") return "Add a subject name.";
  if (subject.grade === "") return "Choose a grade.";
  if (!hasPositiveCredits(subject.credits)) return "Credits must be greater than 0.";
  return null;
};

export const calculateSemester = (semester: Semester): SemesterCalculation => {
  const validSubjects = semester.subjects.filter(isSgpaIncluded);
  const totalCredits = validSubjects.reduce((sum, subject) => sum + Number(subject.credits), 0);
  const weightedPoints = validSubjects.reduce(
    (sum, subject) => sum + gradePoints[subject.grade as Exclude<Grade, "">] * Number(subject.credits),
    0,
  );

  return {
    totalCredits,
    weightedPoints,
    sgpa: totalCredits > 0 ? weightedPoints / totalCredits : null,
    validSubjectCount: validSubjects.length,
    incompleteRows: semester.subjects.filter(
      (subject) => isSubjectTouched(subject) && !isSubjectComplete(subject),
    ).length,
  };
};

function ResultStamp({
  label,
  value,
  note,
  featured = false,
}: {
  label: string;
  value: string;
  note: string;
  featured?: boolean;
}) {
  return (
    <div className={`result-stamp ${featured ? "result-stamp-featured" : ""}`}>
      <span className="result-stamp-label">{label}</span>
      <strong className="result-stamp-value">{value}</strong>
      <span className="result-stamp-note">{note}</span>
    </div>
  );
}

export default function Home() {
  const [semesters, setSemesters] = useState<Semester[]>(() => [createSemester(1)]);

  const calculations = useMemo(
    () => semesters.map((semester) => ({ semester, calculation: calculateSemester(semester) })),
    [semesters],
  );

  const eligibleSemesters = calculations.filter(
    ({ calculation }) => calculation.totalCredits > 0 && calculation.incompleteRows === 0,
  );
  const overallCredits = eligibleSemesters.reduce(
    (sum, { calculation }) => sum + calculation.totalCredits,
    0,
  );
  const overallWeightedPoints = eligibleSemesters.reduce(
    (sum, { calculation }) => sum + calculation.weightedPoints,
    0,
  );
  const cgpa = overallCredits > 0 ? overallWeightedPoints / overallCredits : null;
  const pendingSemesterCount = calculations.filter(
    ({ calculation }) => calculation.incompleteRows > 0,
  ).length;

  const updateSemester = (semesterId: string, update: (semester: Semester) => Semester) => {
    setSemesters((current) => current.map((semester) => (semester.id === semesterId ? update(semester) : semester)));
  };

  const updateSubject = (
    semesterId: string,
    subjectId: string,
    field: keyof Omit<Subject, "id">,
    value: string,
  ) => {
    updateSemester(semesterId, (semester) => ({
      ...semester,
      subjects: semester.subjects.map((subject) =>
        subject.id === subjectId ? { ...subject, [field]: value } : subject,
      ),
    }));
  };

  const addSubject = (semesterId: string) => {
    updateSemester(semesterId, (semester) => ({
      ...semester,
      subjects: [...semester.subjects, createSubject()],
    }));
  };

  const removeSubject = (semesterId: string, subjectId: string) => {
    updateSemester(semesterId, (semester) => ({
      ...semester,
      subjects: semester.subjects.filter((subject) => subject.id !== subjectId),
    }));
  };

  const addSemester = () => {
    setSemesters((current) => [...current, createSemester(current.length + 1)]);
  };

  const removeSemester = (semesterId: string) => {
    setSemesters((current) => (current.length > 1 ? current.filter((semester) => semester.id !== semesterId) : current));
  };

  const resetCalculator = () => setSemesters([createSemester(1)]);

  return (
    <div className="min-h-screen bg-[#f7f3ea] text-[#1f2a28] selection:bg-[#b8e0da]">
      <header className="border-b border-[#d9d3c6] bg-[#fbfaf6]/90 backdrop-blur-sm">
        <div className="container flex min-h-18 items-center justify-between gap-4 py-3">
          <a href="#calculator" className="brand-lockup focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e766e] focus-visible:ring-offset-4">
            <img src="/manus-storage/gradebook-logo_37220e98.png" alt="" className="h-10 w-10 object-contain" />
            <span>
              <strong>Gradebook</strong>
              <small>CGPA calculator</small>
            </span>
          </a>
          <p className="hidden text-right text-xs leading-5 text-[#64716c] sm:block">
            Grade points × credits,<br />
            kept simple.
          </p>
        </div>
      </header>

      <main id="calculator" className="container pb-12 pt-6 sm:pb-16 sm:pt-10">
        <section className="hero-ledger relative overflow-hidden rounded-[1.75rem] border border-[#d9d3c6] bg-[#efe9db] px-5 py-7 sm:px-8 sm:py-9">
          <img
            src="/manus-storage/gradebook-hero-ledger_5218b0b4.jpg"
            alt=""
            className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[54%] object-cover object-right opacity-65 mix-blend-multiply md:block"
          />
          <div className="relative max-w-2xl">
            <div className="eyebrow"><BookOpenCheck size={14} /> Academic record</div>
            <h1>Keep each semester <em>in view.</em></h1>
            <p>
              Add your subjects, choose a grade, and enter credits. Your semester SGPA and final CGPA update as you go—no marks required.
            </p>
          </div>
        </section>

        <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:gap-8">
          <section className="order-2 space-y-5 lg:order-1" aria-label="Semester entry">
            <div className="flex flex-wrap items-end justify-between gap-4 px-1">
              <div>
                <div className="eyebrow">Your semesters</div>
                <h2 className="section-heading">The working ledger</h2>
              </div>
              <Button onClick={addSemester} className="bg-[#0e766e] text-white hover:bg-[#095f59] active:scale-[.97]">
                <Plus size={17} /> Add semester
              </Button>
            </div>

            {calculations.map(({ semester, calculation }, semesterIndex) => (
              <article key={semester.id} className="semester-chapter" aria-labelledby={`semester-heading-${semester.id}`}>
                <div className="semester-chapter-header">
                  <div className="relative min-w-0 flex-1">
                    <span className="semester-index">{String(semesterIndex + 1).padStart(2, "0")}</span>
                    <label className="sr-only" htmlFor={`semester-name-${semester.id}`}>Semester name</label>
                    <input
                      id={`semester-name-${semester.id}`}
                      value={semester.name}
                      onChange={(event) => updateSemester(semester.id, (current) => ({ ...current, name: event.target.value }))}
                      className="semester-name-input"
                      placeholder="e.g. Semester 1"
                    />
                    <p id={`semester-heading-${semester.id}`} className="semester-subtitle">Subjects, grade points, and credits</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ResultStamp
                      label="SGPA"
                      value={calculation.sgpa === null ? "—" : calculation.sgpa.toFixed(2)}
                      note={calculation.totalCredits > 0 ? `${calculation.totalCredits} credits` : "Add a complete row"}
                    />
                    {semesters.length > 1 && (
                      <button
                        type="button"
                        className="icon-button-danger"
                        onClick={() => removeSemester(semester.id)}
                        aria-label={`Remove ${semester.name || `semester ${semesterIndex + 1}`}`}
                      >
                        <Trash2 size={17} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="subjects-label-row" aria-hidden="true">
                  <span>Subject</span><span>Grade</span><span>Credits</span><span />
                </div>

                <div className="space-y-3">
                  {semester.subjects.length === 0 ? (
                    <div className="empty-subject-state">
                      <ClipboardList size={20} />
                      <span>No subjects yet. Add the first one for this semester.</span>
                    </div>
                  ) : (
                    semester.subjects.map((subject, subjectIndex) => {
                      const error = getSubjectError(subject);
                      return (
                        <div key={subject.id} className="subject-row">
                          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-[minmax(0,1fr)_136px_112px_42px] md:items-start">
                            <div className="sm:col-span-2 md:col-span-1">
                              <label className="field-label md:sr-only" htmlFor={`subject-name-${subject.id}`}>Subject name</label>
                              <input
                                id={`subject-name-${subject.id}`}
                                type="text"
                                value={subject.name}
                                onChange={(event) => updateSubject(semester.id, subject.id, "name", event.target.value)}
                                className={error && subject.name.trim() === "" ? "form-control form-control-error" : "form-control"}
                                placeholder={`Subject ${subjectIndex + 1}`}
                                autoComplete="off"
                              />
                            </div>
                            <div>
                              <label className="field-label md:sr-only" htmlFor={`grade-${subject.id}`}>Grade</label>
                              <select
                                id={`grade-${subject.id}`}
                                value={subject.grade}
                                onChange={(event) => updateSubject(semester.id, subject.id, "grade", event.target.value as Grade)}
                                className={error && subject.grade === "" ? "form-control form-control-error" : "form-control"}
                                aria-invalid={Boolean(error && subject.grade === "")}
                              >
                                <option value="">Select grade</option>
                                {gradeOptions.map(([grade, point]) => <option key={grade} value={grade}>{grade === "PP" ? "PP · excluded from SGPA" : `${grade} · ${point} points`}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="field-label md:sr-only" htmlFor={`credits-${subject.id}`}>Credits</label>
                              <input
                                id={`credits-${subject.id}`}
                                type="number"
                                inputMode="decimal"
                                min="0.01"
                                step="0.5"
                                value={subject.credits}
                                onChange={(event) => updateSubject(semester.id, subject.id, "credits", event.target.value)}
                                className={error && !hasPositiveCredits(subject.credits) ? "form-control form-control-error" : "form-control"}
                                placeholder="Credits"
                                aria-invalid={Boolean(error && !hasPositiveCredits(subject.credits))}
                              />
                            </div>
                            <button
                              type="button"
                              className="remove-subject-button"
                              onClick={() => removeSubject(semester.id, subject.id)}
                              aria-label={`Remove ${subject.name || `subject ${subjectIndex + 1}`}`}
                            >
                              <Trash2 size={17} />
                              <span className="md:sr-only">Remove subject</span>
                            </button>
                          </div>
                          {error && <p className="input-error"><CircleAlert size={14} /> {error}</p>}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="semester-footer">
                  <div>
                    {calculation.incompleteRows > 0 ? (
                      <p className="validation-note"><CircleAlert size={15} /> {calculation.incompleteRows} incomplete {calculation.incompleteRows === 1 ? "row is" : "rows are"} excluded until complete.</p>
                    ) : calculation.validSubjectCount > 0 ? (
                      <p className="calculation-note"><ChevronRight size={15} /> SGPA = Σ(grade point × credits) ÷ total credits</p>
                    ) : (
                      <p className="calculation-note"><ChevronRight size={15} /> Complete a subject row to calculate SGPA.</p>
                    )}
                  </div>
                  <Button variant="outline" onClick={() => addSubject(semester.id)} className="border-[#b8c9c5] bg-[#fbfaf6] text-[#0e766e] hover:bg-[#e2f0ed] active:scale-[.97]">
                    <Plus size={16} /> Add subject
                  </Button>
                </div>
              </article>
            ))}

            <section className="grade-key" aria-labelledby="grade-key-heading">
              <div>
                <div className="eyebrow">Reference</div>
                <h2 id="grade-key-heading" className="text-lg font-semibold">Grade scale</h2>
              </div>
              <div className="grade-pills" aria-label="Grade point values">
                {gradeOptions.map(([grade, point]) => <span key={grade}><b>{grade}</b> {grade === "PP" ? "excluded" : point}</span>)}
              </div>
            </section>
          </section>

          <aside className="order-1 lg:order-2 lg:sticky lg:top-5" aria-label="Overall calculation summary">
            <section className="overall-card relative overflow-hidden">
              <img src="/manus-storage/gradebook-formula_b08efe24.jpg" alt="" className="overall-seal" />
              <div className="relative">
                <div className="eyebrow text-[#bfe6df]"><GraduationCap size={14} /> Overall standing</div>
                <p className="overall-card-heading">Your cumulative result</p>
                <ResultStamp
                  featured
                  label="FINAL CGPA"
                  value={cgpa === null ? "—" : cgpa.toFixed(2)}
                  note={overallCredits > 0 ? `${overallCredits} credits recorded` : "Complete a semester to record standing"}
                />
                <div className="overall-rule" />
                <dl className="summary-list">
                  <div><dt>Semesters recorded</dt><dd>{eligibleSemesters.length}</dd></div>
                  <div><dt>Credits recorded</dt><dd>{overallCredits || "—"}</dd></div>
                  <div><dt>Semesters to review</dt><dd>{pendingSemesterCount ? pendingSemesterCount : "None"}</dd></div>
                </dl>
                <p className="overall-formula">CGPA = Σ(SGPA × semester credits) ÷ Σ(semester credits)</p>
              </div>
            </section>

            <section className="side-note relative overflow-hidden">
              <img src="/manus-storage/gradebook-semester_6c21de1e.jpg" alt="" className="side-note-art" />
              <div className="relative max-w-[65%]">
                <div className="eyebrow">Ledger note</div>
                <p>A subject is recorded once its name, grade, and credits are complete. Correct a highlighted field to include its semester.</p>
              </div>
            </section>

            <Button variant="outline" onClick={resetCalculator} className="mt-4 w-full border-[#c7bdb0] bg-transparent text-[#6a4f3f] hover:bg-[#eee1d6] active:scale-[.97]">
              <RefreshCw size={16} /> Clear this ledger
            </Button>
          </aside>
        </div>
      </main>
    </div>
  );
}
