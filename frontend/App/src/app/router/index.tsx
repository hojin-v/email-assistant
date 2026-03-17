import type { ReactNode } from "react";
import { Navigate, createBrowserRouter } from "react-router";
import { AppShell } from "../../shared/ui/AppShell";
import { getAppSession } from "../../shared/lib/app-session";

function AuthEntryGate({ children }: { children: ReactNode }) {
  const session = getAppSession();

  if (session.authenticated && session.onboardingCompleted) {
    return <Navigate replace to="/app" />;
  }

  if (session.authenticated) {
    return <Navigate replace to="/onboarding" />;
  }

  return <>{children}</>;
}

function OnboardingGate({ children }: { children: ReactNode }) {
  const session = getAppSession();

  if (!session.authenticated) {
    return <Navigate replace to="/" />;
  }

  if (session.onboardingCompleted) {
    return <Navigate replace to="/app" />;
  }

  return <>{children}</>;
}

function AppGate() {
  const session = getAppSession();

  if (!session.authenticated) {
    return <Navigate replace to="/" />;
  }

  if (!session.onboardingCompleted) {
    return <Navigate replace to="/onboarding" />;
  }

  return <AppShell />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    lazy: async () => {
      const module = await import("../../pages/auth");
      return {
        Component: () => (
          <AuthEntryGate>
            <module.AuthRoutePage />
          </AuthEntryGate>
        ),
      };
    },
  },
  {
    path: "/onboarding",
    lazy: async () => {
      const module = await import("../../pages/onboarding");
      return {
        Component: () => (
          <OnboardingGate>
            <module.OnboardingPage />
          </OnboardingGate>
        ),
      };
    },
  },
  {
    path: "/app",
    element: <AppGate />,
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
    ],
  },
]);
