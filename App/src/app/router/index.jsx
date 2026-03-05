import { createBrowserRouter } from "react-router";
import { AppShell } from "../../shared/ui/AppShell";
import { DashboardPage } from "../../pages/dashboard";
import { InboxPage } from "../../pages/inbox";
import { CalendarPage } from "../../pages/calendar";
import { TemplateLibraryPage } from "../../pages/template-library";
import { AutomationSettingsPage } from "../../pages/automation-settings";
import { BusinessProfilePage } from "../../pages/business-profile";
import { SettingsPage } from "../../pages/settings";
import { OnboardingWizardPage } from "../../pages/onboarding-wizard";
import { FirstTimeSetupPage } from "../../pages/first-time-setup";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <FirstTimeSetupPage />,
  },
  {
    path: "/app",
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "inbox", element: <InboxPage /> },
      { path: "calendar", element: <CalendarPage /> },
      { path: "templates", element: <TemplateLibraryPage /> },
      { path: "automation", element: <AutomationSettingsPage /> },
      { path: "profile", element: <BusinessProfilePage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "onboarding", element: <OnboardingWizardPage /> },
    ],
  },
]);
