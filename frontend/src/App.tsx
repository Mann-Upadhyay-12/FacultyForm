import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FormProvider } from "@/context/FormContext";
import FormLayout from "@/components/layout/FormLayout";
import PersonalInfoPage from "@/pages/form/PersonalInfoPage";
import ProgramsPage from "@/pages/form/ProgramsPage";
import TeachingPage from "@/pages/form/TeachingPage";
import ExaminationPage from "@/pages/form/ExaminationPage";
import ActivitiesPage from "@/pages/form/ActivitiesPage";
import ResearchPage from "@/pages/form/ResearchPage";
import ProjectsPage from "@/pages/form/ProjectsPage";
import GuidancePage from "@/pages/form/GuidancePage";
import OtherInfoPage from "@/pages/form/OtherInfoPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FormProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/form/personal" replace />} />
            <Route path="/form" element={<FormLayout />}>
              <Route index element={<Navigate to="personal" replace />} />
              <Route path="personal" element={<PersonalInfoPage />} />
              <Route path="programs" element={<ProgramsPage />} />
              <Route path="teaching" element={<TeachingPage />} />
              <Route path="examination" element={<ExaminationPage />} />
              <Route path="activities" element={<ActivitiesPage />} />
              <Route path="research" element={<ResearchPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="guidance" element={<GuidancePage />} />
              <Route path="other" element={<OtherInfoPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </FormProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
