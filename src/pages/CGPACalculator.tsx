import { useState, useRef } from 'react';
import { Plus, Trash2, RotateCcw, BookOpen, GraduationCap, Download, Share2, History, FileText, ChevronRight, CheckCircle2, Eye } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { useNavigate } from 'react-router-dom';
import { store } from '@/lib/store';
import { GRADES, GRADE_POINTS } from '@/types';
import type { Subject, UserProfile } from '@/types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

interface SavedResult {
  id: string;
  date: string;
  title: string;
  gpa: number;
  credits: number;
  type: 'SGPA' | 'CGPA';
  status: string;
  data: any[]; 
}

const getAcademicStatus = (gpa: number) => {
  if (gpa >= 9.0) return 'Outstanding Performance';
  if (gpa >= 8.0) return 'Strong Academic Progress';
  if (gpa >= 7.0) return 'Good Standing';
  if (gpa >= 6.0) return 'Satisfactory';
  return 'Needs Improvement';
};

/* ── component ── */
const CGPACalculator = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'sgpa' | 'cgpa'>('sgpa');
  const [isExporting, setIsExporting] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  const profile = store.get('profile', { name: 'Student', course: 'B.Tech', year: 1, semester: 1 }) as UserProfile;

  // States
  const [subjects, setSubjects] = useState<Subject[]>(() => store.get('sgpa_subjects', [newSubject()]));
  const [cgpaSemesters, setCgpaSemesters] = useState<CGPASemester[]>(() => store.get('cgpa_semesters', [newCGPASem(1)]));
  const [savedHistory, setSavedHistory] = useState<SavedResult[]>(() => store.get('gpa_history', []));

  // Snapshot active export data so the PDF renders consistently whether from current or history
  const [exportSnapshot, setExportSnapshot] = useState<SavedResult | null>(null);

  /* ── SGPA logic ── */
  const saveSubjects = (s: Subject[]) => { setSubjects(s); store.set('sgpa_subjects', s); };
  const addSubject = () => saveSubjects([...subjects, newSubject()]);
  const removeSubject = (i: number) => {
    if (subjects.length <= 1) return;
    const u = [...subjects]; u.splice(i, 1); saveSubjects(u);
  };
  const updateSubject = (i: number, field: keyof Subject, value: string | number) => {
    const u = [...subjects]; (u[i] as any)[field] = value; saveSubjects(u);
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

  /* ── Export & History logic ── */
  const saveCurrentToHistory = () => {
    const isSgpa = tab === 'sgpa';
    const gpaVal = isSgpa ? sgpa : cgpa;
    if (gpaVal === 0) return alert('Calculate a valid GPA first.');

    const title = isSgpa ? `Semester ${profile.semester || 1} Academic Summary` : 'Cumulative Academic Summary';
    const newRecord: SavedResult = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      title,
      gpa: gpaVal,
      credits: isSgpa ? totalCredits : cgpaTotalCredits,
      type: isSgpa ? 'SGPA' : 'CGPA',
      status: getAcademicStatus(gpaVal),
      data: isSgpa ? subjects : validSems
    };
    
    const updatedHistory = [newRecord, ...savedHistory];
    setSavedHistory(updatedHistory);
    store.set('gpa_history', updatedHistory);
    alert('Academic result saved to history.');
  };

  const handleExport = async (action: 'download' | 'share' | 'preview', record?: SavedResult) => {
    const isSgpa = tab === 'sgpa';
    const gpaVal = isSgpa ? sgpa : cgpa;
    
    // If not exporting from history, check current validity
    if (!record && gpaVal === 0) return alert('Calculate a valid GPA before exporting.');

    const exportData: SavedResult = record || {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      title: isSgpa ? `Semester ${profile.semester || 1} Academic Summary` : 'Cumulative Academic Summary',
      gpa: gpaVal,
      credits: isSgpa ? totalCredits : cgpaTotalCredits,
      type: isSgpa ? 'SGPA' : 'CGPA',
      status: getAcademicStatus(gpaVal),
      data: isSgpa ? subjects : validSems
    };

    setExportSnapshot(exportData);
    setIsExporting(true);

    // Wait for state to reflect in hidden div
    setTimeout(async () => {
      if (!pdfRef.current) return setIsExporting(false);
      
      const element = pdfRef.current;
      element.style.display = 'block';

      try {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        const fileName = `${exportData.title.replace(/ /g, '_')}.pdf`;

        if (action === 'download') {
          pdf.save(fileName);
          // Auto-save if it wasn't from history
          if (!record) {
            const updatedHistory = [exportData, ...savedHistory];
            setSavedHistory(updatedHistory);
            store.set('gpa_history', updatedHistory);
          }
        } else if (action === 'share') {
          const blob = pdf.output('blob');
          const file = new File([blob], fileName, { type: 'application/pdf' });
          if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: exportData.title,
              text: 'Here is my academic performance summary.',
              files: [file]
            });
          } else {
            pdf.save(fileName); 
            alert('Sharing not fully supported. File downloaded instead.');
          }
        } else if (action === 'preview') {
          const blob = pdf.output('blob');
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
        }
      } catch (err) {
        console.error('PDF Error:', err);
        alert('Failed to generate document.');
      } finally {
        element.style.display = 'none';
        setIsExporting(false);
        setExportSnapshot(null);
      }
    }, 100);
  };

  return (
    <div className="cs-page pb-8">
      <div className="mb-4">
        <BackButton />
      </div>

      <h1 className="text-xl font-bold text-foreground mb-1">Academic Result Utility</h1>
      <p className="text-xs text-muted-foreground mb-5">Calculate, manage, and export your academic performance</p>

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
      <div className={tab === 'sgpa' ? 'block' : 'hidden'}>
        <div className="cs-card-elevated p-5 mb-5 text-center relative overflow-hidden">
          <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">Semester GPA</p>
          <p className="text-5xl font-extrabold text-primary mt-1">{sgpa}</p>
          <div className="flex justify-center gap-6 mt-3 text-xs text-muted-foreground">
            <span>Credits: <strong className="text-foreground">{totalCredits}</strong></span>
            <span>Weighted: <strong className="text-foreground">{totalWeighted}</strong></span>
          </div>
          {sgpa > 0 && (
            <div className="mt-4 inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-[11px] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {getAcademicStatus(sgpa)}
            </div>
          )}
        </div>

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

        <div className="flex gap-3 mb-6">
          <button onClick={addSubject} className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add Subject
          </button>
          <button onClick={resetSGPA} className="py-3 px-4 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      {/* ═══════ CGPA TAB ═══════ */}
      <div className={tab === 'cgpa' ? 'block' : 'hidden'}>
        <div className="cs-card-elevated p-5 mb-5 text-center relative overflow-hidden">
          <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">Cumulative GPA</p>
          <p className="text-5xl font-extrabold text-accent mt-1">{cgpa}</p>
          <div className="flex justify-center gap-6 mt-3 text-xs text-muted-foreground">
            <span>Semesters: <strong className="text-foreground">{validSems.length}</strong></span>
            <span>Total Credits: <strong className="text-foreground">{cgpaTotalCredits}</strong></span>
          </div>
          {cgpa > 0 && (
            <div className="mt-4 inline-flex items-center gap-1.5 bg-accent/10 text-accent px-3 py-1.5 rounded-full text-[11px] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {getAcademicStatus(cgpa)}
            </div>
          )}
        </div>

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

        <div className="flex gap-3 mb-6">
          <button onClick={addCGPASem} className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Add Semester
          </button>
          <button onClick={resetCGPA} className="py-3 px-4 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      {/* ═══════ PREMIUM EXPORT ACTIONS ═══════ */}
      <div className="space-y-3 mb-8">
        <button 
          onClick={() => handleExport('download')}
          disabled={isExporting}
          className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 disabled:opacity-70 disabled:active:scale-100"
        >
          {isExporting ? <RotateCcw className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
          Export Academic Summary
        </button>
        
        <div className="flex gap-3">
          <button 
            onClick={saveCurrentToHistory}
            className="flex-1 bg-secondary text-secondary-foreground font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <History className="w-4 h-4" /> Save
          </button>
          <button 
            onClick={() => handleExport('preview')}
            disabled={isExporting}
            className="flex-1 bg-secondary text-secondary-foreground font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-70 disabled:active:scale-100"
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
          {navigator.share && (
            <button 
              onClick={() => handleExport('share')}
              disabled={isExporting}
              className="px-6 bg-secondary text-secondary-foreground font-semibold py-3 rounded-xl flex items-center justify-center transition-transform active:scale-95 disabled:opacity-70 disabled:active:scale-100"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ═══════ RESULT HISTORY ═══════ */}
      {savedHistory.length > 0 && (
        <section className="mb-6">
          <p className="cs-section-title mb-3">Result History</p>
          <div className="space-y-3">
            {savedHistory.map((record) => (
              <div key={record.id} className="cs-card p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{record.title}</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(record.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{record.gpa.toFixed(2)}</p>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase">{record.type}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-3 border-t border-border mt-1">
                  <button 
                    onClick={() => handleExport('preview', record)}
                    className="flex-1 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors hover:bg-secondary/80"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                  <button 
                    onClick={() => handleExport('download', record)}
                    className="flex-1 py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors hover:bg-primary/20"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  {navigator.share && (
                    <button 
                      onClick={() => handleExport('share', record)}
                      className="flex-[0.5] py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors hover:bg-secondary/80"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════ HIDDEN PDF TEMPLATE ═══════ */}
      <div 
        ref={pdfRef} 
        style={{ display: 'none', position: 'fixed', top: -9999, left: -9999, width: 800, backgroundColor: '#ffffff', padding: 40, fontFamily: 'sans-serif' }}
      >
        {exportSnapshot && (
          <div className="w-full text-[#111827]">
            <div className="flex justify-between items-start border-b-2 border-[#E5E7EB] pb-6 mb-6">
              <div>
                <h1 className="text-3xl font-extrabold" style={{ margin: 0 }}>CampuSync</h1>
                <h2 className="text-xl font-medium text-[#4B5563] mt-1" style={{ margin: 0 }}>
                  Academic Performance Summary
                </h2>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#111827] text-lg">{profile.name || 'Student'}</p>
                <p className="text-sm text-[#4B5563] mt-1">{profile.course || 'B.Tech'} - Year {profile.year || 1}</p>
                <p className="text-sm text-[#4B5563]">Generated: {new Date().toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            <div className="flex justify-between items-center mb-8 bg-[#F3F4F6] p-6 rounded-xl">
              <div>
                <p className="text-sm font-bold tracking-wider text-[#6B7280] uppercase mb-1">{exportSnapshot.title}</p>
                <p className="text-lg font-semibold text-[#111827]">{exportSnapshot.status}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold tracking-wider text-[#6B7280] uppercase mb-1">{exportSnapshot.type}</p>
                <p className="text-5xl font-extrabold text-[#2563EB]">{exportSnapshot.gpa.toFixed(2)}</p>
                <p className="text-sm font-medium text-[#4B5563] mt-2">Total Credits: {exportSnapshot.credits}</p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '2px solid #E5E7EB' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', color: '#374151', fontSize: '14px', textTransform: 'uppercase' }}>
                    {exportSnapshot.type === 'SGPA' ? 'Subject Name' : 'Semester'}
                  </th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', color: '#374151', fontSize: '14px', textTransform: 'uppercase' }}>Credits</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', color: '#374151', fontSize: '14px', textTransform: 'uppercase' }}>
                    {exportSnapshot.type === 'SGPA' ? 'Grade' : 'SGPA'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {exportSnapshot.type === 'SGPA' 
                  ? (exportSnapshot.data as Subject[]).map((sub, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <td style={{ padding: '16px', fontWeight: '500', color: '#111827' }}>{sub.name || `Subject ${i + 1}`}</td>
                        <td style={{ padding: '16px', textAlign: 'center', color: '#4B5563' }}>{sub.credits}</td>
                        <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', color: '#111827' }}>{sub.grade}</td>
                      </tr>
                    ))
                  : (exportSnapshot.data as CGPASemester[]).map((sem, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <td style={{ padding: '16px', fontWeight: '500', color: '#111827' }}>{sem.label}</td>
                        <td style={{ padding: '16px', textAlign: 'center', color: '#4B5563' }}>{sem.credits || '-'}</td>
                        <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', color: '#111827' }}>{sem.sgpa || '-'}</td>
                      </tr>
                    ))
                }
              </tbody>
            </table>

            <div className="mt-12 pt-6 border-t border-[#E5E7EB] text-center">
              <p className="text-sm font-semibold text-[#111827]">This is an unofficial academic summary.</p>
              <p className="text-xs text-[#6B7280] mt-1">Generated electronically by the CampuSync application.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CGPACalculator;
