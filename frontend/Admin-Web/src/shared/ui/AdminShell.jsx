import { NavLink, Outlet } from "react-router";
import { LayoutGrid, Users, Inbox, FileText, Settings, History } from "lucide-react";

const navItems = [
  { to: "/", label: "운영 대시보드", icon: LayoutGrid },
  { to: "/users", label: "사용자 관리", icon: Users },
  { to: "/inbox-monitor", label: "수신함 모니터링", icon: Inbox },
  { to: "/templates", label: "템플릿 운영", icon: FileText },
  { to: "/settings", label: "운영 설정", icon: Settings },
  { to: "/audit-log", label: "감사 로그", icon: History },
];

export function AdminShell() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo-wrap">
          <div className="admin-logo-mark">EA</div>
          <div>
            <p className="admin-logo-title">EmailAssist Admin</p>
            <p className="admin-logo-sub">임시 운영화면 v1</p>
          </div>
        </div>

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
              <item.icon size={16} />
              <span>{item.label}</span>
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
