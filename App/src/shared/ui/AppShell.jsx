import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet } from "react-router";
import { useUiStore } from "../../app/store/uiStore";
import { GlobalSearch } from "../../features/search/ui/GlobalSearch";
import { NotificationPanel } from "../../features/notifications/ui/NotificationPanel";
import { ProfileMenu } from "../../features/profile-menu/ui/ProfileMenu";

const navItems = [
  { to: "/app", label: "Dashboard" },
  { to: "/app/inbox", label: "Inbox" },
  { to: "/app/calendar", label: "Calendar" },
  { to: "/app/templates", label: "Template Library" },
  { to: "/app/automation", label: "Automation Settings" },
  { to: "/app/profile", label: "Business Profile" },
  { to: "/app/settings", label: "Settings" },
  { to: "/app/onboarding", label: "Onboarding Wizard" },
];

export function AppShell() {
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([
    { id: "n1", title: "New email arrived", read: false },
    { id: "n2", title: "Draft waiting for review", read: false },
    { id: "n3", title: "Daily automation summary", read: true },
  ]);

  const searchOpen = useUiStore((state) => state.searchOpen);
  const notificationOpen = useUiStore((state) => state.notificationOpen);
  const profileOpen = useUiStore((state) => state.profileOpen);

  const setSearchOpen = useUiStore((state) => state.setSearchOpen);
  const setNotificationOpen = useUiStore((state) => state.setNotificationOpen);
  const setProfileOpen = useUiStore((state) => state.setProfileOpen);

  const rootRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setSearchOpen(false);
        setNotificationOpen(false);
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setNotificationOpen, setProfileOpen, setSearchOpen]);

  const overlayOpen = searchOpen || notificationOpen || profileOpen;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  return (
    <div className="app-layout">
      {overlayOpen ? <div className="dimmed-overlay" /> : null}

      <aside className="sidebar">
        <div className="logo">EmailAssist</div>
        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/app"}
              className={({ isActive }) =>
                isActive ? "nav-item nav-item--active" : "nav-item"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="content" ref={rootRef}>
        <header className="topbar">
          <GlobalSearch
            open={searchOpen}
            query={searchQuery}
            setQuery={setSearchQuery}
            onToggle={() => setSearchOpen(!searchOpen)}
            onClose={() => setSearchOpen(false)}
          />
          <NotificationPanel
            open={notificationOpen}
            onToggle={() => setNotificationOpen(!notificationOpen)}
            markAllRead={markAllRead}
            notifications={notifications}
          />
          <ProfileMenu
            open={profileOpen}
            onToggle={() => setProfileOpen(!profileOpen)}
            onClose={() => setProfileOpen(false)}
          />
        </header>

        <Outlet />
      </main>
    </div>
  );
}
