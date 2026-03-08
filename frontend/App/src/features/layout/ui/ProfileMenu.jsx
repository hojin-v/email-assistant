import { LogOut, Moon, Settings } from "lucide-react";
import { useNavigate } from "react-router";

export function ProfileMenu({ open, theme, onToggle, onThemeChange, onClose }) {
  const navigate = useNavigate();
  const nextThemeLabel = theme === "light" ? "다크" : "라이트";

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center gap-2 rounded-xl px-1 py-1 transition hover:bg-[#F8FAFC]"
        onClick={onToggle}
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1E2A3A] text-xs font-semibold text-white">
          김
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium text-foreground">김호진</span>
          <span className="block text-[11px] text-muted-foreground">관리자</span>
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+10px)] z-30 w-[220px] rounded-2xl border border-border bg-card p-3 shadow-xl">
          <div className="rounded-xl bg-muted/50 px-3 py-3">
            <p className="text-sm font-semibold text-foreground">김호진</p>
            <p className="mt-1 text-xs text-muted-foreground">관리자 · user@gmail.com</p>
          </div>

          <div className="my-3 h-px bg-border" />

          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-foreground transition hover:bg-muted/60"
            onClick={() => {
              onClose();
              navigate("/app/settings");
            }}
          >
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span>설정</span>
          </button>

          <div className="mt-1 flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-foreground">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-muted-foreground" />
              <span>테마</span>
            </div>
            <button
              type="button"
              className="rounded-full bg-secondary px-2 py-1 text-[11px] font-medium text-muted-foreground transition hover:bg-muted"
              onClick={onThemeChange}
            >
              {nextThemeLabel}
            </button>
          </div>

          <div className="my-3 h-px bg-border" />

          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-[#DC2626] transition hover:bg-[#FEF2F2] dark:hover:bg-[#3F1D24]"
            onClick={onClose}
          >
            <LogOut className="h-4 w-4" />
            <span>로그아웃</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
