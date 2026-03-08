import { createBrowserRouter } from "react-router";
import { AppShell } from "../../shared/ui/AppShell";

export const router = createBrowserRouter([
  {
    path: "/",
    lazy: async () => {
      const module = await import("../../pages/first-time-setup");
      return { Component: module.FirstTimeSetupPage };
    },
  },
  {
    path: "/app",
    element: <AppShell />,
    children: [
      {
        index: true,
        lazy: async () => {
          const module = await import("../../pages/dashboard");
          return { Component: module.DashboardPage };
        },
      },
      {
        path: "inbox",
        lazy: async () => {
          const module = await import("../../pages/inbox");
          return { Component: module.InboxPage };
        },
      },
      {
        path: "calendar",
        lazy: async () => {
          const module = await import("../../pages/calendar");
          return { Component: module.CalendarPage };
        },
      },
      {
        path: "templates",
        lazy: async () => {
          const module = await import("../../pages/template-library");
          return { Component: module.TemplateLibraryPage };
        },
      },
      {
        path: "automation",
        lazy: async () => {
          const module = await import("../../pages/automation-settings");
          return { Component: module.AutomationSettingsPage };
        },
      },
      {
        path: "profile",
        lazy: async () => {
          const module = await import("../../pages/business-profile");
          return { Component: module.BusinessProfilePage };
        },
      },
      {
        path: "settings",
        lazy: async () => {
          const module = await import("../../pages/settings");
          return { Component: module.SettingsPage };
        },
      },
      {
        path: "onboarding",
        lazy: async () => {
          const module = await import("../../pages/onboarding-wizard");
          return { Component: module.OnboardingWizardPage };
        },
      },
    ],
  },
]);
