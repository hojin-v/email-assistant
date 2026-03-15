import { createBrowserRouter, Navigate } from "react-router";
import { AdminShell } from "../../shared/ui/AdminShell";
import { DashboardPage } from "../../pages/dashboard";
import { MembersPage } from "../../pages/members";
import { TemplatesPage } from "../../pages/templates";
import { InquiriesPage } from "../../pages/inquiries";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AdminShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "members", element: <MembersPage /> },
      { path: "templates", element: <TemplatesPage /> },
      { path: "inquiries", element: <InquiriesPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
