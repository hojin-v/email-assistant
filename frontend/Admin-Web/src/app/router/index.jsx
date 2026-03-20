import { createBrowserRouter, Navigate } from "react-router";
import { AdminShell } from "../../shared/ui/AdminShell";
import { DashboardPage } from "../../pages/dashboard";
import { UsersPage } from "../../pages/members";
import { TemplateAutomationPage } from "../../pages/templates";
import { InquiriesPage } from "../../pages/inquiries";
import { MonitoringPage } from "../../pages/monitoring";
import { NotFoundPage } from "../../pages/not-found";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AdminShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "template-automation", element: <TemplateAutomationPage /> },
      { path: "inquiries", element: <InquiriesPage /> },
      { path: "monitoring", element: <MonitoringPage /> },
      { path: "members", element: <Navigate replace to="/users" /> },
      { path: "templates", element: <Navigate replace to="/template-automation" /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
