import { useMemo, useRef, useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useFormContext } from '@/context/FormContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { PrintReport } from '@/components/assesment/PrintReport';
import { TAB_SCORE_KEYS } from '@/lib/scoring';
import { departmentOptions, designationOptions, FormData, labelFor } from '@/types/formTypes';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Loader2,
  MoreHorizontal,
  Printer,
  RotateCcw,
  Save,
  Send,
  Upload,
  XCircle,
} from 'lucide-react';
import '@/App.css';

interface TabConfig {
  id: string;
  path: string;
  label: string;
  icon: string;
  section: string;
}

const tabs: TabConfig[] = [
  { id: 'personal', path: '/form/personal', label: 'Personal Info', icon: '👤', section: 'Items 1–10' },
  { id: 'programs', path: '/form/programs', label: 'Programmes Attended', icon: '📚', section: 'Item 11' },
  { id: 'teaching', path: '/form/teaching', label: 'Teaching Activities', icon: '📖', section: 'Items 12.1–12.2' },
  { id: 'examination', path: '/form/examination', label: 'Guidance & Exams', icon: '📝', section: 'Items 12.3–12.4' },
  { id: 'activities', path: '/form/activities', label: 'Co-Curricular', icon: '🎯', section: 'Item 13' },
  { id: 'research', path: '/form/research', label: 'Papers & Books', icon: '🔬', section: 'Items 14–15' },
  { id: 'projects', path: '/form/projects', label: 'Projects & Consultancy', icon: '💼', section: 'Item 16' },
  { id: 'guidance', path: '/form/guidance', label: 'Research Guidance', icon: '🎓', section: 'Item 17' },
  { id: 'other', path: '/form/other', label: 'Other Information', icon: 'ℹ️', section: 'Items 18–19' },
];

const any = <T,>(rows: T[], pick: (r: T) => unknown) => rows.some((r) => Boolean(pick(r)));

function isSectionFilled(tabId: string, d: FormData): boolean {
  switch (tabId) {
    case 'personal':
      return Boolean(d.name.trim() && d.department && d.designation);
    case 'programs':
      return any(d.programs, (p) => p.title);
    case 'teaching':
      return any([...d.oddSemester, ...d.evenSemester], (c) => c.courseCode || c.courseTitle);
    case 'examination':
      return Boolean(
        d.examinationApi ||
          d.projectGuidanceApi ||
          d.projectsGuided ||
          d.abEvaluated.ug ||
          d.abEvaluated.pg ||
          Object.values(d.questionPapersSet.ug).some(Boolean) ||
          Object.values(d.questionPapersSet.pg).some(Boolean)
      );
    case 'activities':
      return (
        any([...d.studentActivities, ...d.departmentActivities, ...d.instituteActivities], (a) => a.activity) ||
        any(d.lectures, (l) => l.title) ||
        any(d.articles, (a) => a.title)
      );
    case 'research':
      return any(d.publications, (p) => p.title) || any(d.books, (b) => b.title);
    case 'projects':
      return any(d.researchProjects, (p) => p.title);
    case 'guidance':
      return any(d.guidance, (g) => g.enrolName);
    case 'other':
      return any(d.membership, (m) => m.body) || any(d.achievements, (a) => a.description) || Boolean(d.otherInfo);
    default:
      return false;
  }
}

export default function FormLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { formData, lastSaved, isSaving, submission, apiScores, issues, saveDraftNow, resetForm, exportJSON, importJSON, submitForm, setCertified } =
    useFormContext();

  const [reviewOpen, setReviewOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  const currentTabIdx = Math.max(0, tabs.findIndex((t) => location.pathname.startsWith(t.path)));
  const currentTab = tabs[currentTabIdx];

  const filled = useMemo(() => tabs.map((t) => isSectionFilled(t.id, formData)), [formData]);
  const filledCount = filled.filter(Boolean).length;
  const progressPercent = Math.round((filledCount / tabs.length) * 100);

  const errors = issues.filter((i) => i.level === 'error');
  const warnings = issues.filter((i) => i.level === 'warning');

  const initials = useMemo(() => {
    const parts = formData.name
      .replace(/^(dr|prof|mr|mrs|ms)\.?\s+/i, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) return 'FA';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [formData.name]);

  const ayLabel = formData.academicYear.replace('-', ' – ');

  useEffect(() => {
    document.title = `${currentTab.label} · Faculty Self Assessment ${formData.academicYear}`;
  }, [currentTab.label, formData.academicYear]);

  // Ctrl/Cmd+S saves the draft instead of the browser "save page" dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveDraftNow();
        toast({ title: 'Draft saved', description: 'Saved in this browser.' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [saveDraftNow]);

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= tabs.length) return;
    navigate(tabs[idx].path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openReview = () => {
    setSubmitError(null);
    setReviewOpen(true);
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    const result = await submitForm();
    setSubmitting(false);
    if (!result.ok) {
      setSubmitError(result.message);
      return;
    }
    setSuccessMessage(result.message);
    setReviewOpen(false);
    setSuccessOpen(true);
  };

  const handleImport = async (file?: File) => {
    if (!file) return;
    if (!window.confirm('Replace everything currently in the form with the contents of this backup file?')) return;
    const result = await importJSON(file);
    toast({ title: result.ok ? 'Backup restored' : 'Import failed', description: result.message, variant: result.ok ? 'default' : 'destructive' });
  };

  const handlePrint = () => {
    setReviewOpen(false);
    setSuccessOpen(false);
    // Let the dialogs unmount so they don't end up in the printout.
    setTimeout(() => window.print(), 150);
  };

  const tabIssues = (tabId: string) => issues.filter((i) => i.tab === tabId);
  const tabPoints = (tabId: string) => TAB_SCORE_KEYS[tabId].reduce((a, k) => a + apiScores.byKey[k].counted, 0);

  return (
    <div className="app-container">
      <a href="#form-content" className="skip-link">
        Skip to form
      </a>

      <header className="header" role="banner">
        <div className="header-content">
          <div className="profile-header">
            <div className="avatar-initials" aria-hidden="true">
              {initials}
            </div>
            <div className="profile-info">
              <h1>{formData.name || 'Faculty Member'}</h1>
              <p>
                {formData.department ? labelFor(departmentOptions, formData.department) : 'Department not selected'}
                {' • '}
                {formData.designation ? labelFor(designationOptions, formData.designation) : 'Designation not selected'}
              </p>
            </div>
          </div>

          <div className="university-info">
            <h2>JAYPEE UNIVERSITY OF INFORMATION TECHNOLOGY</h2>
            <h3>Annual Self Assessment – Faculty (PBAS)</h3>
            <div className="header-meta">
              <span>
                Academic Year: <strong>{ayLabel}</strong>
              </span>
              <span className="draft-pill" aria-live="polite">
                {isSaving ? (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Saving…
                  </span>
                ) : lastSaved ? (
                  <span className="flex items-center gap-1" title={lastSaved.toLocaleString()}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Draft saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                ) : (
                  <span>Not saved yet</span>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="header-actions-bar">
          <div className="header-stats">
            <div className="stat-pill">
              <span className="stat-label">Total API score</span>
              <span className="stat-value">{apiScores.total}</span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">Sections filled</span>
              <span className="stat-value">
                {filledCount} / {tabs.length}
              </span>
            </div>
          </div>

          <div className="header-buttons">
            <button
              type="button"
              onClick={() => {
                saveDraftNow();
                toast({ title: 'Draft saved', description: 'Saved in this browser. Use Export to keep a backup file.' });
              }}
              className="action-btn"
              title="Save draft in this browser (Ctrl+S)"
            >
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </button>
            <button type="button" onClick={openReview} className="action-btn highlight">
              <FileSpreadsheet className="w-4 h-4 text-cyan-300" />
              <span>Review & Submit</span>
            </button>
            <button type="button" onClick={handlePrint} className="action-btn" title="Print the complete form, or save it as PDF">
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="action-btn" aria-label="More actions">
                  <MoreHorizontal className="w-4 h-4" />
                  <span>More</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white">
                <DropdownMenuItem onSelect={exportJSON}>
                  <Download className="w-4 h-4 mr-2" /> Export backup (.json)
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => fileInput.current?.click()}>
                  <Upload className="w-4 h-4 mr-2" /> Import backup…
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={resetForm} className="text-rose-600 focus:text-rose-700">
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset form
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                handleImport(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </div>
        </div>
      </header>

      <div className="progress-strip" aria-label="Assessment form progress">
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Sections filled"
          />
        </div>
        <div className="progress-info">
          <span>
            Section {currentTabIdx + 1} of {tabs.length}: <strong>{currentTab.label}</strong>
          </span>
          <span>
            {filledCount} of {tabs.length} sections have entries
          </span>
        </div>
      </div>

      {submission && (
        <div className="submitted-banner" role="status">
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {submission.mode === 'server' ? 'Submitted' : 'Finalised on this device'} on {new Date(submission.submittedAt).toLocaleString()}.
            Any changes you make now need to be submitted again.
          </span>
        </div>
      )}

      <main className="main-wrapper">
        <div className="main-content">
          <nav className="sidebar" aria-label="Form sections">
            <div className="sidebar-container">
              <div className="sidebar-header">
                <h4>Assessment Sections</h4>
                <span className="sidebar-badge">{tabs.length} sections</span>
              </div>
              <ul className="sidebar-tabs-list">
                {tabs.map((tab, idx) => {
                  const isActive = idx === currentTabIdx;
                  const ti = tabIssues(tab.id);
                  const hasError = ti.some((i) => i.level === 'error');
                  const pts = tabPoints(tab.id);
                  return (
                    <li key={tab.id}>
                      <Link to={tab.path} className={isActive ? 'tab-button active' : 'tab-button'} aria-current={isActive ? 'page' : undefined}>
                        <span className="tab-icon" aria-hidden="true">
                          {tab.icon}
                        </span>
                        <div className="tab-details">
                          <span className="tab-title">{tab.label}</span>
                          <span className="tab-subtext">
                            {tab.section}
                            {pts > 0 && ` · ${pts} pts`}
                          </span>
                        </div>
                        {hasError ? (
                          <AlertTriangle className="tab-check-icon tab-warn-icon" aria-label="Section has errors" />
                        ) : (
                          filled[idx] && <CheckCircle2 className="tab-check-icon" aria-label="Section has entries" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          <section className="content-area">
            <div className="content-card" id="form-content">
              <Outlet />
            </div>

            <div className="step-navigation-bar">
              <button
                type="button"
                onClick={() => goTo(currentTabIdx - 1)}
                disabled={currentTabIdx === 0}
                className={`nav-step-btn prev ${currentTabIdx === 0 ? 'disabled' : ''}`}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span>Previous</span>
              </button>

              <div className="step-actions-center">
                <button type="button" onClick={openReview} className="quick-review-btn">
                  <FileSpreadsheet className="w-4 h-4 mr-1 text-blue-600" />
                  Scorecard ({apiScores.total} pts)
                </button>
              </div>

              {currentTabIdx < tabs.length - 1 ? (
                <button type="button" onClick={() => goTo(currentTabIdx + 1)} className="nav-step-btn next">
                  <span>Next: {tabs[currentTabIdx + 1].label}</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button type="button" onClick={openReview} className="nav-step-btn submit">
                  <Send className="w-4 h-4 mr-1" />
                  <span>Review & Submit</span>
                </button>
              )}
            </div>
          </section>
        </div>
      </main>

      <PrintReport />

      {/* Review & scorecard */}
      <Dialog open={reviewOpen} onOpenChange={(o) => !submitting && setReviewOpen(o)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1e3a5f]">Self-Assessment Scorecard · {ayLabel}</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Check your API points and fix any problems before final submission.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500 block">Faculty name</span>
                <span className="font-semibold text-slate-800">{formData.name || 'Not filled'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Department</span>
                <span className="font-semibold text-slate-800">{formData.department ? labelFor(departmentOptions, formData.department) : 'Not selected'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Designation</span>
                <span className="font-semibold text-slate-800">{formData.designation ? labelFor(designationOptions, formData.designation) : 'Not selected'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Pay scale / pay</span>
                <span className="font-semibold text-slate-800">{formData.payScale || 'Not filled'}</span>
              </div>
            </div>

            {(errors.length > 0 || warnings.length > 0) && (
              <div className="space-y-2">
                {[...errors, ...warnings].map((issue, i) => {
                  const tab = tabs.find((t) => t.id === issue.tab);
                  return (
                    <div key={i} className={`review-issue ${issue.level === 'error' ? 'is-error' : 'is-warning'}`}>
                      {issue.level === 'error' ? <XCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                      <span className="flex-1">{issue.message}</span>
                      {tab && (
                        <button
                          type="button"
                          className="review-issue-link"
                          onClick={() => {
                            setReviewOpen(false);
                            navigate(tab.path);
                          }}
                        >
                          Go to {tab.label}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Claimed</th>
                    <th className="py-2.5 px-3 text-right">Counted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {apiScores.rows.map((r) => (
                    <tr key={r.key}>
                      <td className="py-2 px-3 font-medium text-slate-800 whitespace-nowrap">{r.item}</td>
                      <td className="py-2 px-3 text-slate-600">
                        {r.label}
                        {r.cap !== undefined && <span className="text-slate-400"> (max {r.cap})</span>}
                      </td>
                      <td className="py-2 px-3 text-right">{r.claimed}</td>
                      <td className={`py-2 px-3 text-right font-semibold ${r.claimed > r.counted ? 'text-amber-700' : ''}`}>{r.counted}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50/80 font-bold text-[#1e3a5f] border-t-2 border-slate-300">
                    <td colSpan={2} className="py-3 px-3 text-base">
                      Grand total self-assessed API score
                    </td>
                    <td className="py-3 px-3 text-right">{apiScores.claimedTotal}</td>
                    <td className="py-3 px-3 text-right text-base">{apiScores.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <label className={`certification-box ${formData.certified ? 'is-checked' : ''}`}>
              <input type="checkbox" checked={formData.certified} onChange={(e) => setCertified(e.target.checked)} />
              <span>
                I certify that the data entered is accurate and corresponds to my official academic performance during academic year {ayLabel}.
              </span>
            </label>

            {submitError && (
              <div className="review-issue is-error" role="alert">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-1" />
                Print
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={exportJSON}>
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setReviewOpen(false)} disabled={submitting}>
                Continue editing
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-[#1e3a5f] hover:bg-[#2d5a87] text-white"
                onClick={handleFinalSubmit}
                disabled={submitting || errors.length > 0 || !formData.certified}
                title={errors.length ? 'Fix the errors listed above first' : !formData.certified ? 'Tick the certification box first' : undefined}
              >
                {submitting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
                {submission ? 'Re-submit' : 'Confirm & Submit'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-slate-800">Assessment {submission?.mode === 'server' ? 'submitted' : 'finalised'}</DialogTitle>
            <DialogDescription className="text-center text-sm text-slate-600">{successMessage}</DialogDescription>
          </DialogHeader>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
            <p>
              <strong>Faculty:</strong> {formData.name}
            </p>
            <p>
              <strong>Department:</strong> {labelFor(departmentOptions, formData.department)}
            </p>
            <p>
              <strong>Academic year:</strong> {ayLabel}
            </p>
            <p>
              <strong>Total API counted:</strong> {apiScores.total} points
            </p>
            {submission?.id && (
              <p>
                <strong>Reference:</strong> {submission.id}
              </p>
            )}
          </div>

          <DialogFooter className="sm:justify-center gap-2">
            <Button type="button" variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1" />
              Print copy
            </Button>
            <Button type="button" className="bg-[#1e3a5f] hover:bg-[#2d5a87] text-white" onClick={() => setSuccessOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
