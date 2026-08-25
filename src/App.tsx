import { useEffect, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ToastProvider } from "@/components/ui";
import { Onboarding } from "@/components/global/Onboarding";
import { useSettings } from "@/store/settings";
import { seedDemoIfEmpty } from "@/lib/demo";

const Dashboard = lazy(() => import("@/pages/Dashboard").then((m) => ({ default: m.Dashboard })));
const NewAssessment = lazy(() => import("@/pages/NewAssessment").then((m) => ({ default: m.NewAssessment })));
const AssessmentWorkspace = lazy(() => import("@/pages/AssessmentWorkspace").then((m) => ({ default: m.AssessmentWorkspace })));
const PentestFlow = lazy(() => import("@/pages/PentestFlow").then((m) => ({ default: m.PentestFlow })));
const Learn = lazy(() => import("@/pages/Learn").then((m) => ({ default: m.Learn })));
const LessonPage = lazy(() => import("@/pages/LessonPage").then((m) => ({ default: m.LessonPage })));
const Services = lazy(() => import("@/pages/Services").then((m) => ({ default: m.Services })));
const ServiceDetail = lazy(() => import("@/pages/ServiceDetail").then((m) => ({ default: m.ServiceDetail })));
const CategoryPage = lazy(() => import("@/pages/CategoryPage").then((m) => ({ default: m.CategoryPage })));
const Labs = lazy(() => import("@/pages/Labs").then((m) => ({ default: m.Labs })));
const LabDetail = lazy(() => import("@/pages/LabDetail").then((m) => ({ default: m.LabDetail })));
const QuickReference = lazy(() => import("@/pages/QuickReference").then((m) => ({ default: m.QuickReference })));
const MyCommands = lazy(() => import("@/pages/MyCommands").then((m) => ({ default: m.MyCommands })));
const Glossary = lazy(() => import("@/pages/Glossary").then((m) => ({ default: m.Glossary })));
const PortLookup = lazy(() => import("@/pages/PortLookup").then((m) => ({ default: m.PortLookup })));
const Progress = lazy(() => import("@/pages/Progress").then((m) => ({ default: m.Progress })));
const Settings = lazy(() => import("@/pages/Settings").then((m) => ({ default: m.Settings })));
const NotFound = lazy(() => import("@/pages/NotFound").then((m) => ({ default: m.NotFound })));

export default function App() {
  const theme = useSettings((s) => s.theme);
  const reducedMotion = useSettings((s) => s.reducedMotion);

  // Ensure theme is applied on first paint (store rehydrate also does this).
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-reduced-motion", String(reducedMotion));
  }, [theme, reducedMotion]);

  useEffect(() => {
    seedDemoIfEmpty();
  }, []);

  return (
    <ToastProvider>
      <Onboarding />
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<NewAssessment />} />
          <Route path="/a/:id" element={<AssessmentWorkspace />} />
          <Route path="/flow" element={<PentestFlow />} />

          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/:id" element={<LessonPage />} />

          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetail />} />

          <Route path="/web" element={<CategoryPage categoryId="web" />} />
          <Route path="/linux" element={<CategoryPage categoryId="linux" />} />
          <Route path="/windows" element={<CategoryPage categoryId="windows" />} />
          <Route path="/ad" element={<CategoryPage categoryId="ad" />} />

          <Route path="/labs" element={<Labs />} />
          <Route path="/labs/:id" element={<LabDetail />} />

          <Route path="/reference" element={<QuickReference />} />
          <Route path="/my-commands" element={<MyCommands />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/ports" element={<PortLookup />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />

          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}
