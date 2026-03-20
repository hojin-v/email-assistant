import { NavLink, Outlet } from "react-router";
import { Activity, Bot, LayoutGrid, MessageSquare, Users } from "lucide-react";

const navItems = [
  { to: "/", label: "운영 대시보드", icon: LayoutGrid },
  { to: "/users", label: "사용자 관리", icon: Users },
  { to: "/template-automation", label: "템플릿 / 자동화 관리", icon: Bot },
  { to: "/inquiries", label: "사용자 문의 대응", icon: MessageSquare },
  { to: "/monitoring", label: "시스템 운영 모니터링", icon: Activity },
];

export function AdminShell() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo-wrap">
          <div className="admin-logo-mark">EA</div>
          <div>
            <p className="admin-logo-title">EmailAssist Admin</p>
            <p className="admin-logo-sub">운영 콘솔 프로토타입</p>
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
