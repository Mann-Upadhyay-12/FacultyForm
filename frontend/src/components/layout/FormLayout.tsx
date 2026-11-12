import { useState, useMemo } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useFormContext } from '@/context/FormContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  LogOut,
  Printer,
  RotateCcw,
  Save,
  Send,
  Sparkles
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
  { id: 'personal', path: '/form/personal', label: 'Personal Info', icon: '👤', section: 'Items 1-10' },
  { id: 'programs', path: '/form/programs', label: 'Programs Attended', icon: '📚', section: 'Item 11' },
  { id: 'teaching', path: '/form/teaching', label: 'Teaching Activities', icon: '📖', section: 'Item 12.1-2' },
  { id: 'examination', path: '/form/examination', label: 'Examination Duties', icon: '📝', section: 'Item 12.3-4' },
  { id: 'activities', path: '/form/activities', label: 'Co-Curricular', icon: '🎯', section: 'Item 13' },
  { id: 'research', path: '/form/research', label: 'Research & Pubs', icon: '🔬', section: 'Items 14-15' },
  { id: 'projects', path: '/form/projects', label: 'Projects & Consultancy', icon: '💼', section: 'Item 16' },
  { id: 'guidance', path: '/form/guidance', label: 'Research Guidance', icon: '🎓', section: 'Item 17' },
  { id: 'other', path: '/form/other', label: 'Other Information', icon: 'ℹ️', section: 'Items 18-19' }
];

export default function FormLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    formData,
    lastSaved,
    isSaving,
    apiScores,
    saveDraftNow,
    resetForm,
    exportJSON,
    handleSubmit,
    signOut,
    userEmail
  } = useFormContext();

  const [reviewOpen, setReviewOpen] = useState(false);
  const [submitSuccessOpen, setSubmitSuccessOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  // Active tab determination
  const currentTabIdx = useMemo(() => {
    const idx = tabs.findIndex(
      (t) => location.pathname === t.path || (location.pathname === '/form' && t.id === 'personal')
    );
    return idx >= 0 ? idx : 0;
  }, [location.pathname]);

  const currentTab = tabs[currentTabIdx];
  const progressPercent = Math.round(((currentTabIdx + 1) / tabs.length) * 100);

  // User initials calculation
  const initials = useMemo(() => {
    if (!formData.name.trim()) return 'FA';
    const parts = formData.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [formData.name]);

  // Section completion check for sidebar indicators
  const isSectionFilled = (tabId: string): boolean => {
    switch (tabId) {
      case 'personal':
        return Boolean(formData.name && formData.department && formData.designation);
      case 'programs':
        return formData.programs.some((p) => Boolean(p.title));
      case 'teaching':
        return formData.oddSemester.some((c) => Boolean(c.courseCode)) || formData.evenSemester.some((c) => Boolean(c.courseCode));
      case 'examination':
        return Boolean(formData.examinationApi || formData.abEvaluated.ug || formData.questionPapersSet.ug.t1);
      case 'activities':
        return (
          formData.studentActivities.some((a) => Boolean(a.activity)) ||
          formData.departmentActivities.some((a) => Boolean(a.activity)) ||
          formData.instituteActivities.some((a) => Boolean(a.activity))
        );
      case 'research':
        return formData.publications.some((p) => Boolean(p.title)) || formData.books.some((b) => Boolean(b.title));
      case 'projects':
        return formData.researchProjects.some((p) => Boolean(p.title));
      case 'guidance':
        return formData.guidance.some((g) => Boolean(g.enrolName));
      case 'other':
        return formData.membership.some((m) => Boolean(m.body)) || Boolean(formData.otherInfo);
      default:
        return false;
    }
  };

  const goToNextTab = () => {
    if (currentTabIdx < tabs.length - 1) {
      navigate(tabs[currentTabIdx + 1].path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevTab = () => {
    if (currentTabIdx > 0) {
      navigate(tabs[currentTabIdx - 1].path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    const error = await handleSubmit();
    setSubmitting(false);
    if (error) {
      setSubmitError(error);
      return;
    }
    setReviewOpen(false);
    setSubmitSuccessOpen(true);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="header" role="banner">
        <div className="header-content">
          <div className="profile-header">
            <div className="avatar-initials" aria-hidden="true">
              {initials}
            </div>
            <div className="profile-info">
              <h1>{formData.name || 'Faculty Member'}</h1>
              <p>
                {formData.department ? `${formData.department} Department` : 'Department'}
                {' • '}
                {formData.designation || 'Designation'}
              </p>
            </div>
          </div>

          <div className="university-info">
            <h2>JAYPEE UNIVERSITY OF INFORMATION TECHNOLOGY</h2>
            <h3>Annual Self Assessment - Faculty (PBAS)</h3>
            <div className="header-meta">
              <span>Academic Year: <strong>2023 - 2024</strong></span>
              <span className="draft-pill">
                {isSaving ? (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Saving...
                  </span>
                ) : lastSaved ? (
                  <span className="flex items-center gap-1" title={lastSaved.toLocaleString()}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Draft saved
                  </span>
                ) : (
                  <span>Ready</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Action Bar inside Header */}
        <div className="header-actions-bar">
          <div className="header-stats">
            <div className="stat-pill">
              <span className="stat-label">Total API Score:</span>
              <span className="stat-value">{apiScores.total.toFixed(1)}</span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">Active Step:</span>
              <span className="stat-value">{currentTabIdx + 1} of {tabs.length}</span>
            </div>
          </div>

          <div className="header-buttons">
            <button
              type="button"
              onClick={saveDraftNow}
              className="action-btn"
              title="Save draft to your account"
            >
              <Save className="w-4 h-4 mr-1 text-slate-200" />
              <span>Save Draft</span>
            </button>

            <button
              type="button"
              onClick={() => setReviewOpen(true)}
              className="action-btn highlight"
              title="Open Assessment Scorecard Summary"
            >
              <FileSpreadsheet className="w-4 h-4 mr-1 text-cyan-300" />
              <span>Review Summary</span>
            </button>

            <button
              type="button"
              onClick={exportJSON}
              className="action-btn"
              title="Download backup JSON copy"
            >
              <Download className="w-4 h-4 mr-1 text-slate-200" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="action-btn"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4 mr-1 text-slate-200" />
              <span>Print Form</span>
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="action-btn text-rose-200 hover:text-white"
              title="Reset Form to blank"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="action-btn"
              title={userEmail ? `Signed in as ${userEmail}` : 'Log out'}
            >
              <LogOut className="w-4 h-4 mr-1 text-slate-200" />
              <span>{signingOut ? 'Logging out…' : 'Log Out'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Progress Strip */}
      <div className="progress-strip" aria-label="Assessment Form Progress">
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <div className="progress-info">
          <span>Section {currentTabIdx + 1} of {tabs.length}: <strong>{currentTab.label}</strong></span>
          <span>{progressPercent}% completed</span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="main-wrapper">
        <div className="main-content">
          {/* Navigation Sidebar / Mobile Scrollable Bar */}
          <nav className="sidebar" aria-label="Form Sections Navigation">
            <div className="sidebar-container">
              <div className="sidebar-header">
                <h4>Assessment Sections</h4>
                <span className="sidebar-badge">{tabs.length} Tabs</span>
              </div>
              <ul className="sidebar-tabs-list">
                {tabs.map((tab) => {
                  const isActive = location.pathname === tab.path || (location.pathname === '/form' && tab.id === 'personal');
                  const filled = isSectionFilled(tab.id);

                  return (
                    <li key={tab.id}>
                      <Link
                        to={tab.path}
                        className={isActive ? 'tab-button active' : 'tab-button'}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <span className="tab-icon" aria-hidden="true">{tab.icon}</span>
                        <div className="tab-details">
                          <span className="tab-title">{tab.label}</span>
                          <span className="tab-subtext">{tab.section}</span>
                        </div>
                        {filled && (
                          <CheckCircle2
                            className="tab-check-icon"
                            aria-label="Section contains data"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          {/* Form Content Area */}
          <section className="content-area">
            <div className="content-card">
              <Outlet />
            </div>

            {/* Step Navigation Bar */}
            <div className="step-navigation-bar">
              <button
                type="button"
                onClick={goToPrevTab}
                disabled={currentTabIdx === 0}
                className={`nav-step-btn prev ${currentTabIdx === 0 ? 'disabled' : ''}`}
                aria-label="Previous Section"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span>Previous Section</span>
              </button>

              <div className="step-actions-center">
                <button
                  type="button"
                  onClick={() => setReviewOpen(true)}
                  className="quick-review-btn"
                >
                  <Sparkles className="w-4 h-4 mr-1 text-blue-600" />
                  Scorecard ({apiScores.total.toFixed(1)} pts)
                </button>
              </div>

              {currentTabIdx < tabs.length - 1 ? (
                <button
                  type="button"
                  onClick={goToNextTab}
                  className="nav-step-btn next"
                  aria-label={`Next section: ${tabs[currentTabIdx + 1].label}`}
                >
                  <span>Next: {tabs[currentTabIdx + 1].label}</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setReviewOpen(true)}
                  className="nav-step-btn submit"
                >
                  <Send className="w-4 h-4 mr-1" />
                  <span>Review & Submit</span>
                </button>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Review & Scorecard Modal */}
      <Dialog
        open={reviewOpen}
        onOpenChange={(open) => {
          setReviewOpen(open);
          if (!open) setSubmitError(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white border border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1e3a5f]">
              Faculty Self-Assessment Scorecard Summary
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Review your self-assessed API scores before final submission.
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-4">
            {/* Faculty Snapshot */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500 block">Faculty Name:</span>
                  <span className="font-semibold text-slate-800">{formData.name || 'Not filled'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Department:</span>
                  <span className="font-semibold text-slate-800">{formData.department || 'Not selected'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Designation:</span>
                  <span className="font-semibold text-slate-800">{formData.designation || 'Not selected'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Pay Scale / Pay:</span>
                  <span className="font-semibold text-slate-800">{formData.payScale || 'Not filled'}</span>
                </div>
              </div>
            </div>

            {/* Scorecard Table */}
            <div>
              <h4 className="font-semibold text-slate-700 text-sm mb-2">Category-Wise API Points</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Section</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-right">Self API</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2 px-3 font-medium text-slate-800">11</td>
                      <td className="py-2 px-3 text-slate-600">Orientation, Refresher, FDPs & Courses</td>
                      <td className="py-2 px-3 text-right font-semibold">{apiScores.programs.toFixed(1)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-slate-800">12.1-2</td>
                      <td className="py-2 px-3 text-slate-600">Teaching, Learning & Curriculum</td>
                      <td className="py-2 px-3 text-right font-semibold">{apiScores.teaching.toFixed(1)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-slate-800">12.3-4</td>
                      <td className="py-2 px-3 text-slate-600">Examination & Evaluation Duties</td>
                      <td className="py-2 px-3 text-right font-semibold">{apiScores.examination.toFixed(1)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-slate-800">13</td>
                      <td className="py-2 px-3 text-slate-600">Co-Curricular & Student/Inst. Activities</td>
                      <td className="py-2 px-3 text-right font-semibold">{apiScores.activities.toFixed(1)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-slate-800">14-15</td>
                      <td className="py-2 px-3 text-slate-600">Research Papers & Book Publications</td>
                      <td className="py-2 px-3 text-right font-semibold">{apiScores.research.toFixed(1)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-slate-800">16</td>
                      <td className="py-2 px-3 text-slate-600">Sponsored Projects & Consultancy</td>
                      <td className="py-2 px-3 text-right font-semibold">{apiScores.projects.toFixed(1)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-slate-800">17</td>
                      <td className="py-2 px-3 text-slate-600">Research Guidance (Ph.D./M.Tech)</td>
                      <td className="py-2 px-3 text-right font-semibold">{apiScores.guidance.toFixed(1)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-slate-800">18-19</td>
                      <td className="py-2 px-3 text-slate-600">Professional Memberships & Other Info</td>
                      <td className="py-2 px-3 text-right font-semibold">{apiScores.other.toFixed(1)}</td>
                    </tr>
                    <tr className="bg-slate-50/80 font-bold text-[#1e3a5f] border-t-2 border-slate-300">
                      <td colSpan={2} className="py-3 px-3 text-base">Grand Total Self-Assessed API Score</td>
                      <td className="py-3 px-3 text-right text-base text-[#1e3a5f]">{apiScores.total.toFixed(1)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Certification Notice */}
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-900 leading-relaxed">
              <strong>Certification reminder:</strong> By submitting, you certify that the data entered is accurate and corresponds to your official academic performance during academic year 2023 - 2024.
            </div>

            {submitError && (
              <div role="alert" className="bg-red-50 border border-red-200 p-3 rounded-lg text-sm text-red-700">
                {submitError}
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 justify-between">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4 mr-1" />
                Print
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={exportJSON}
              >
                <Download className="w-4 h-4 mr-1" />
                Export JSON
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setReviewOpen(false)}
              >
                Continue Editing
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-[#1e3a5f] hover:bg-[#2d5a87] text-white"
                onClick={handleFinalSubmit}
                disabled={submitting}
              >
                <Send className="w-4 h-4 mr-1" />
                {submitting ? 'Submitting…' : 'Confirm & Submit'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submission Success Dialog */}
      <Dialog open={submitSuccessOpen} onOpenChange={setSubmitSuccessOpen}>
        <DialogContent className="max-w-md bg-white border border-slate-200">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-slate-800">
              Assessment Submitted Successfully!
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-slate-600">
              Your Annual Self Assessment for <strong>2023 - 2024</strong> has been recorded and submitted for HoD and Directorate evaluation.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
            <p><strong>Candidate:</strong> {formData.name}</p>
            <p><strong>Department:</strong> {formData.department || 'CSE & IT'}</p>
            <p><strong>Total API Reported:</strong> {apiScores.total.toFixed(1)} Points</p>
            <p><strong>Submission Status:</strong> Ready for HoD Verification</p>
          </div>

          <DialogFooter className="sm:justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4 mr-1" />
              Print Copy
            </Button>
            <Button
              type="button"
              className="bg-[#1e3a5f] hover:bg-[#2d5a87] text-white"
              onClick={() => setSubmitSuccessOpen(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
