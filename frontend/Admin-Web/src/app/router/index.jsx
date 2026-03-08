import { createBrowserRouter } from "react-router";
import { AdminShell } from "../../shared/ui/AdminShell";
import { DashboardPage } from "../../pages/dashboard";
import { UsersPage } from "../../pages/users";
import { InboxMonitorPage } from "../../pages/inbox-monitor";
import { TemplatesPage } from "../../pages/templates";
import { SettingsPage } from "../../pages/settings";
import { AuditLogPage } from "../../pages/audit-log";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AdminShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "inbox-monitor", element: <InboxMonitorPage /> },
      { path: "templates", element: <TemplatesPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "audit-log", element: <AuditLogPage /> },
    ],
  },
]);
