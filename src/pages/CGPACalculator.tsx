import { useState } from 'react';
import { Plus, Trash2, RotateCcw, BookOpen, GraduationCap } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { store } from '@/lib/store';
import { GRADES, GRADE_POINTS } from '@/types';
import type { Subject } from '@/types';

/* ── helpers ── */
const newSubject = (): Subject => ({
  id: crypto.randomUUID(),
  name: '',
  credits: 3,
  grade: 'S',
});

interface CGPASemester {
  id: string;
  label: string;
  sgpa: string;
  credits: string;
}

const newCGPASem = (n: number): CGPASemester => ({
  id: crypto.randomUUID(),
  label: `Semester ${n}`,
  sgpa: '',
  credits: '',
});

/* ── component ── */
const CGPACalculator = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'sgpa' | 'cgpa'>('sgpa');

  // SGPA state
  const [subjects, setSubjects] = useState<Subject[]>(() =>
    store.get('sgpa_subjects', [newSubject()])
  );

  // CGPA state
  const [cgpaSemesters, setCgpaSemesters] = useState<CGPASemester[]>(() =>
    store.get('cgpa_semesters', [newCGPASem(1)])
  );

  /* ── SGPA logic ── */
  const saveSubjects = (s: Subject[]) => { setSubjects(s); store.set('sgpa_subjects', s); };

  const addSubject = () => saveSubjects([...subjects, newSubject()]);

  const removeSubject = (i: number) => {
    if (subjects.length <= 1) return;
    const u = [...subjects]; u.splice(i, 1); saveSubjects(u);
  };

  const updateSubject = (i: number, field: keyof Subject, value: string | number) => {
    const u = [...subjects];
    (u[i] as any)[field] = value;
    saveSubjects(u);
  };

  const weighted = (s: Subject) => (GRADE_POINTS[s.grade] ?? 0) * s.credits;
  const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
  const totalWeighted = subjects.reduce((sum, s) => sum + weighted(s), 0);
  const sgpa = totalCredits ? +(totalWeighted / totalCredits).toFixed(2) : 0;

  const resetSGPA = () => saveSubjects([newSubject()]);

  /* ── CGPA logic ── */
  const saveCGPA = (s: CGPASemester[]) => { setCgpaSemesters(s); store.set('cgpa_semesters', s); };

  const addCGPASem = () => saveCGPA([...cgpaSemesters, newCGPASem(cgpaSemesters.length + 1)]);

  const removeCGPASem = (i: number) => {
    if (cgpaSemesters.length <= 1) return;
    const u = [...cgpaSemesters]; u.splice(i, 1); saveCGPA(u);
  };

  const updateCGPASem = (i: number, field: 'sgpa' | 'credits', value: string) => {
    const u = [...cgpaSemesters]; u[i] = { ...u[i], [field]: value }; saveCGPA(u);
  };

  const validSems = cgpaSemesters.filter(s => {
    const sg = parseFloat(s.sgpa); const cr = parseFloat(s.credits);
    return !isNaN(sg) && !isNaN(cr) && cr > 0 && sg >= 0 && sg <= 10;
  });
  const cgpaTotalCredits = validSems.reduce((sum, s) => sum + parseFloat(s.credits), 0);
  const cgpaTotalWeighted = validSems.reduce((sum, s) => sum + parseFloat(s.sgpa) * parseFloat(s.credits), 0);
  const cgpa = cgpaTotalCredits ? +(cgpaTotalWeighted / cgpaTotalCredits).toFixed(2) : 0;

  const resetCGPA = () => saveCGPA([newCGPASem(1)]);

  return (
    <div className="cs-page pb-8">
      <div className="mb-4">
        <BackButton />
      </div>

      <h1 className="text-xl font-bold text-foreground mb-1">GPA Calculator</h1>
      <p className="text-xs text-muted-foreground mb-5">Calculate your SGPA &amp; CGPA accurately</p>

      {/* Tab Switcher */}
      <div className="flex bg-secondary rounded-2xl p-1 mb-5">
        {(['sgpa', 'cgpa'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === t ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            {t === 'sgpa' ? <BookOpen className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ═══════ SGPA TAB ═══════ */}
      {tab === 'sgpa' && (
        <>
          {/* Result Card */}
          <div className="cs-card-elevated p-5 mb-5 text-center">
            <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">Semester GPA</p>
            <p className="text-4xl font-extrabold text-primary mt-1">{sgpa}</p>
            <div className="flex justify-center gap-6 mt-3 text-xs text-muted-foreground">
              <span>Credits: <strong className="text-foreground">{totalCredits}</strong></span>
              <span>Weighted: <strong className="text-foreground">{totalWeighted}</strong></span>
            </div>
          </div>

          {/* Subject List */}
          <div className="space-y-3 mb-4">
            {subjects.map((sub, i) => (
              <div key={sub.id} className="cs-card p-3">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Subject name"
                    value={sub.name}
                    onChange={(e) => updateSubject(i, 'name', e.target.value)}
                    className="flex-1 bg-secondary text-foreground rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
                  />
                  {subjects.length > 1 && (
                    <button onClick={() => removeSubject(i)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Grade</label>
                    <select
                      value={sub.grade}
                      onChange={(e) => updateSubject(i, 'grade', e.target.value)}
                      className="w-full bg-secondary text-foreground rounded-lg px-3 py-2 text-sm outline-none"
                    >
                      {GRADES.map(g => (
                        <option key={g} value={g}>{g} ({GRADE_POINTS[g]})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Credits</label>
                    <select
                      value={sub.credits}
                      onChange={(e) => updateSubject(i, 'credits', parseFloat(e.target.value))}
                      className="w-full bg-secondary text-foreground rounded-lg px-3 py-2 text-sm outline-none"
                    >
                      {[0.5, 1, 1.5, 2, 2.5, 3, 4, 5].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-16 text-center">
                    <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Score</label>
                    <div className="bg-accent/10 text-accent rounded-lg px-2 py-2 text-sm font-bold">
                      {weighted(sub)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={addSubject} className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add Subject
            </button>
            <button onClick={resetSGPA} className="py-3 px-4 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </>
      )}

      {/* ═══════ CGPA TAB ═══════ */}
      {tab === 'cgpa' && (
        <>
          {/* Result Card */}
          <div className="cs-card-elevated p-5 mb-5 text-center">
            <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">Cumulative GPA</p>
            <p className="text-4xl font-extrabold text-accent mt-1">{cgpa}</p>
            <div className="flex justify-center gap-6 mt-3 text-xs text-muted-foreground">
              <span>Semesters: <strong className="text-foreground">{validSems.length}</strong></span>
              <span>Total Credits: <strong className="text-foreground">{cgpaTotalCredits}</strong></span>
            </div>
          </div>

          {/* Semester List */}
          <div className="space-y-3 mb-4">
            {cgpaSemesters.map((sem, i) => {
              const sg = parseFloat(sem.sgpa); const cr = parseFloat(sem.credits);
              const semWeighted = (!isNaN(sg) && !isNaN(cr)) ? +(sg * cr).toFixed(2) : 0;
              const isValid = !isNaN(sg) && !isNaN(cr) && cr > 0 && sg >= 0 && sg <= 10;

              return (
                <div key={sem.id} className="cs-card p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-foreground">{sem.label}</span>
                    <div className="flex items-center gap-2">
                      {isValid && (
                        <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded-lg">
                          {semWeighted}
                        </span>
                      )}
                      {cgpaSemesters.length > 1 && (
                        <button onClick={() => removeCGPASem(i)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">SGPA</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        placeholder="0.00"
                        value={sem.sgpa}
                        onChange={(e) => updateCGPASem(i, 'sgpa', e.target.value)}
                        className="w-full bg-secondary text-foreground rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Credits</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="0"
                        value={sem.credits}
                        onChange={(e) => updateCGPASem(i, 'credits', e.target.value)}
                        className="w-full bg-secondary text-foreground rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button onClick={addCGPASem} className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add Semester
            </button>
            <button onClick={resetCGPA} className="py-3 px-4 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CGPACalculator;
