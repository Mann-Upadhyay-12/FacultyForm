
import { useState } from 'react';
import { useFormState } from '@/hooks/useFormState';
import type { Tab, TabId } from '@/types/assessment';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  BookOpen, 
  GraduationCap, 
  ClipboardCheck, 
  Target, 
  FileText, 
  Briefcase, 
  Users,
  Info,
  Send,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { PersonalInfoTab } from './tabs/PersonalInfoTab';
import { ProgramsTab } from './tabs/ProgramsTab';
import { TeachingTab } from './tabs/TeachingTab';
import { ExaminationTab } from './tabs/ExaminationTab';
import { ActivitiesTab } from './tabs/ActivitiesTab';
import { ResearchTab } from './tabs/ResearchTab';
import { ProjectsTab } from './tabs/ProjectsTab';
import { GuidanceTab } from './tabs/GuidanceTab';
import { OtherInfoTab } from './tabs/OtherInfoTab';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

const tabs: Tab[] = [
  { id: 'personal', label: 'Personal Info', icon: 'User', description: 'Basic details (Items 1-10)' },
  { id: 'programs', label: 'Programs', icon: 'BookOpen', description: 'Courses attended (Item 11)' },
  { id: 'teaching', label: 'Teaching', icon: 'GraduationCap', description: 'Teaching activities (Item 12)' },
  { id: 'examination', label: 'Examination', icon: 'ClipboardCheck', description: 'Exam duties (Item 12.4)' },
  { id: 'activities', label: 'Activities', icon: 'Target', description: 'Co-curricular (Item 13)' },
  { id: 'research', label: 'Research', icon: 'FileText', description: 'Publications (Items 14-15)' },
  { id: 'projects', label: 'Projects', icon: 'Briefcase', description: 'Sponsored projects (Item 16)' },
  { id: 'guidance', label: 'Guidance', icon: 'Users', description: 'Research guidance (Item 17)' },
  { id: 'other', label: 'Other Info', icon: 'Info', description: 'Memberships (Items 18-19)' },
];

const iconMap: Record<string, React.ElementType> = {
  User, BookOpen, GraduationCap, ClipboardCheck, Target, FileText, Briefcase, Users, Info
};

export function SelfAssessmentForm() {
  const [activeTab, setActiveTab] = useState<TabId>('personal');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const {
    formData,
    handleChange,
    handleNestedChange,
    handleArrayChange,
    addArrayItem,
    removeArrayItem,
    toggleEdit,
    isEditing
  } = useFormState();

  const currentTabIndex = tabs.findIndex(t => t.id === activeTab);
  const progress = ((currentTabIndex + 1) / tabs.length) * 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data ready for backend:', JSON.stringify(formData, null, 2));
    toast({
      title: "Form Submitted Successfully!",
      description: "Your self-assessment form has been saved. It will be reviewed by the HoD.",
    });
  };

  const goToNextTab = () => {
    if (currentTabIndex < tabs.length - 1) {
      setActiveTab(tabs[currentTabIndex + 1].id);
    }
  };

  const goToPreviousTab = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabs[currentTabIndex - 1].id);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <PersonalInfoTab
            formData={formData}
            isEditing={isEditing}
            toggleEdit={toggleEdit}
            handleChange={handleChange}
          />
        );
      case 'programs':
        return (
          <ProgramsTab
            formData={formData}
            isEditing={isEditing}
            toggleEdit={toggleEdit}
            handleArrayChange={handleArrayChange}
            addArrayItem={addArrayItem}
            removeArrayItem={removeArrayItem}
          />
        );
      case 'teaching':
        return (
          <TeachingTab
            formData={formData}
            isEditing={isEditing}
            toggleEdit={toggleEdit}
            handleChange={handleChange}
            handleArrayChange={handleArrayChange}
            addArrayItem={addArrayItem}
            removeArrayItem={removeArrayItem}
          />
        );
      case 'examination':
        return (
          <ExaminationTab
            formData={formData}
            isEditing={isEditing}
            toggleEdit={toggleEdit}
            handleChange={handleChange}
            handleNestedChange={handleNestedChange}
          />
        );
      case 'activities':
        return (
          <ActivitiesTab
            formData={formData}
            isEditing={isEditing}
            toggleEdit={toggleEdit}
            handleChange={handleChange}
            handleArrayChange={handleArrayChange}
            addArrayItem={addArrayItem}
            removeArrayItem={removeArrayItem}
          />
        );
      case 'research':
        return (
          <ResearchTab
            formData={formData}
            isEditing={isEditing}
            toggleEdit={toggleEdit}
            handleArrayChange={handleArrayChange}
            addArrayItem={addArrayItem}
            removeArrayItem={removeArrayItem}
          />
        );
      case 'projects':
        return (
          <ProjectsTab
            formData={formData}
            isEditing={isEditing}
            toggleEdit={toggleEdit}
            handleArrayChange={handleArrayChange}
            addArrayItem={addArrayItem}
            removeArrayItem={removeArrayItem}
          />
        );
      case 'guidance':
        return (
          <GuidanceTab
            formData={formData}
            isEditing={isEditing}
            toggleEdit={toggleEdit}
            handleArrayChange={handleArrayChange}
            addArrayItem={addArrayItem}
            removeArrayItem={removeArrayItem}
          />
        );
      case 'other':
        return (
          <OtherInfoTab
            formData={formData}
            isEditing={isEditing}
            toggleEdit={toggleEdit}
            handleChange={handleChange}
            handleArrayChange={handleArrayChange}
            addArrayItem={addArrayItem}
            removeArrayItem={removeArrayItem}
          />
        );
      default:
        return null;
    }
  };

  const SidebarContent = ({ onTabClick }: { onTabClick?: () => void }) => (
    <nav className="space-y-1">
      {tabs.map((tab, index) => {
        const IconComponent = iconMap[tab.icon];
        const isActive = activeTab === tab.id;
        const isCompleted = index < currentTabIndex;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              onTabClick?.();
            }}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200
              ${isActive 
                ? 'bg-sidebar-accent text-sidebar-foreground border-l-4 border-sidebar-primary' 
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              }
            `}
          >
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0
              ${isCompleted ? 'bg-success text-success-foreground' : isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'bg-sidebar-accent'}
            `}>
              <IconComponent className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{tab.label}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{tab.description}</p>
            </div>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 bg-sidebar p-0">
                <div className="p-6 border-b border-sidebar-border">
                  <h2 className="text-lg font-heading font-semibold text-sidebar-foreground">
                    Form Sections
                  </h2>
                </div>
                <div className="p-4">
                  <SidebarContent onTabClick={() => setMobileMenuOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>

            {/* Title */}
            <div className="flex-1 lg:flex-none">
              <h1 className="text-lg lg:text-xl font-heading font-bold text-foreground">
                Annual Self Assessment
              </h1>
              <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">
                Jaypee University of Information Technology, Waknaghat
              </p>
            </div>

            {/* Progress indicator */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  Step {currentTabIndex + 1} of {tabs.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tabs[currentTabIndex].label}
                </p>
              </div>
              <div className="w-32">
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile progress bar */}
        <div className="md:hidden px-4 pb-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Step {currentTabIndex + 1} of {tabs.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-72 flex-shrink-0 border-r border-border bg-sidebar min-h-[calc(100vh-4rem)] sticky top-16">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-sm font-medium text-sidebar-foreground/60 uppercase tracking-wide mb-2">
                Form Sections
              </h2>
            </div>
            <SidebarContent />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <form onSubmit={handleSubmit}>
            <div className="p-4 lg:p-8 max-w-4xl mx-auto">
              {/* Tab Title */}
              <div className="mb-6">
                <h2 className="text-2xl lg:text-3xl font-heading font-bold text-foreground">
                  {tabs[currentTabIndex].label}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {tabs[currentTabIndex].description}
                </p>
              </div>

              {/* Tab Content */}
              <div className="animate-fade-in">
                {renderTabContent()}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPreviousTab}
                  disabled={currentTabIndex === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex gap-3">
                  {currentTabIndex === tabs.length - 1 ? (
                    <Button type="submit" className="gap-2 bg-success hover:bg-success/90">
                      <Send className="h-4 w-4" />
                      Submit Form
                    </Button>
                  ) : (
                    <Button type="button" onClick={goToNextTab} className="gap-2">
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
