import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Outlet, useLocation } from "react-router";
import { Menu } from "lucide-react";
import { useUiStore } from "../../app/store/uiStore";
import { notificationItems as initialNotifications } from "../../entities/notification/model/notification-data";
import { AppSidebar } from "../../features/layout/ui/AppSidebar";
import { GlobalSearchPanel } from "../../features/layout/ui/GlobalSearchPanel";
import { NotificationPanel } from "../../features/layout/ui/NotificationPanel";
import { ProfileMenu } from "../../features/layout/ui/ProfileMenu";
import type { NotificationItem } from "../types";

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    initialNotifications as NotificationItem[]
  );
  const [notificationFilter, setNotificationFilter] = useState<"all" | "unread">("all");
  const { resolvedTheme, setTheme } = useTheme();
  const location = useLocation();

  const searchOpen = useUiStore((state) => state.searchOpen);
  const notificationOpen = useUiStore((state) => state.notificationOpen);
  const profileOpen = useUiStore((state) => state.profileOpen);
  const setSearchOpen = useUiStore((state) => state.setSearchOpen);
  const setNotificationOpen = useUiStore((state) => state.setNotificationOpen);
  const setProfileOpen = useUiStore((state) => state.setProfileOpen);

  const panelsRef = useRef<HTMLDivElement | null>(null);
  const showSearch = ["/app/inbox", "/app/calendar", "/app/templates"].some((path) =>
    location.pathname.startsWith(path)
  );
  const contentLayoutClass = showSearch ? "h-screen" : "min-h-screen";
  const mainLayoutClass = showSearch
    ? "min-h-0 flex-1 overflow-hidden px-0 py-0"
    : "flex-1 px-4 py-4 lg:px-6 lg:py-6";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelsRef.current && !panelsRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
        setNotificationOpen(false);
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setNotificationOpen, setProfileOpen, setSearchOpen]);

  useEffect(() => {
    if (!showSearch && searchOpen) {
      setSearchOpen(false);
    }
  }, [searchOpen, setSearchOpen, showSearch]);

  const theme = resolvedTheme === "dark" ? "dark" : "light";
  const desktopSidebarOffset = collapsed ? "lg:pl-[88px]" : "lg:pl-[270px]";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {mobileOpen ? <div className="fixed inset-0 z-20 bg-[#0F172A]/30" /> : null}

      <div className="min-h-screen">
        <AppSidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onToggleCollapse={() => setCollapsed((value) => !value)}
          onCloseMobile={() => setMobileOpen(false)}
        />

        <div
          className={`relative z-30 flex min-w-0 flex-col transition-[padding] duration-300 ${desktopSidebarOffset} ${contentLayoutClass}`}
        >
          <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:px-6">
            <div ref={panelsRef} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted/60 lg:hidden"
                  onClick={() => setMobileOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </button>

                {showSearch ? (
                  <GlobalSearchPanel
                    open={searchOpen}
                    query={searchQuery}
                    setQuery={setSearchQuery}
                    onToggle={() => setSearchOpen(!searchOpen)}
                    onClose={() => setSearchOpen(false)}
                  />
                ) : null}
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <NotificationPanel
                  open={notificationOpen}
                  notifications={notifications}
                  activeFilter={notificationFilter}
                  onToggle={() => setNotificationOpen(!notificationOpen)}
                  onFilterChange={setNotificationFilter}
                  onMarkAllRead={() =>
                    setNotifications((current) => current.map((item) => ({ ...item, read: true })))
                  }
                  onNotificationRead={(id: string) =>
                    setNotifications((current) =>
                      current.map((item) => (item.id === id ? { ...item, read: true } : item))
                    )
                  }
                />

                <ProfileMenu
                  open={profileOpen}
                  theme={theme}
                  onToggle={() => setProfileOpen(!profileOpen)}
                  onThemeChange={() => setTheme(theme === "light" ? "dark" : "light")}
                  onClose={() => setProfileOpen(false)}
                />
              </div>
            </div>
          </header>

          <main className={mainLayoutClass}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
