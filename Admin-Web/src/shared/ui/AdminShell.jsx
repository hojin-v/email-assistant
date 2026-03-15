import { NavLink, Outlet } from "react-router";
import { LayoutGrid, Users, FileText, MessageSquare } from "lucide-react";

const navItems = [
  { to: "/", label: "운영 대시보드", icon: LayoutGrid },
  { to: "/members", label: "회원 관리", icon: Users },
  { to: "/templates", label: "템플릿 관리", icon: FileText },
  { to: "/inquiries", label: "사용자 문의 대응", icon: MessageSquare },
];

export function AdminShell() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo-wrap">
          <div className="admin-logo-mark">EA</div>
          <div>
            <p className="admin-logo-title">EmailAssist Admin</p>
            <p className="admin-logo-sub">문서 기준 운영 구조</p>
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
