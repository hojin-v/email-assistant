import { NavLink, Outlet } from "react-router";

const navItems = [
  { to: "/", label: "Admin Dashboard" },
  { to: "/users", label: "Users" },
  { to: "/inbox-monitor", label: "Inbox Monitor" },
  { to: "/templates", label: "Templates" },
  { to: "/settings", label: "Settings" },
  { to: "/audit-log", label: "Audit Log" },
];

export function AdminShell() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">EmailAssist Admin</div>
        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                isActive ? "admin-nav-item admin-nav-item--active" : "admin-nav-item"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
