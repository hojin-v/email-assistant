import { useState } from "react";
import { GripVertical, Moon, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";

function WidgetToggle({ checked, onToggle }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      className={`relative inline-flex h-7 w-12 items-center rounded-full p-1 transition ${
        checked ? "bg-[#2DD4BF]" : "bg-[#CBD5E1]"
      }`}
      onClick={onToggle}
    >
      <span
        className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function DisplaySettingsPanel({ display }) {
  const { resolvedTheme, setTheme } = useTheme();
  const currentTheme = resolvedTheme === "dark" ? "dark" : "light";
  const [widgets, setWidgets] = useState(display.widgets);

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-border bg-card px-5 py-6 shadow-sm lg:px-6">
        <h2 className="text-xl font-semibold text-foreground">테마</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {["light", "dark"].map((themeOption) => {
            const isActive = currentTheme === themeOption;
            const isLight = themeOption === "light";

            return (
              <button
                key={themeOption}
                type="button"
                aria-pressed={isActive}
                className={`rounded-[18px] border p-4 transition ${
                  isActive
                    ? "border-[#2DD4BF] shadow-[0_0_0_1px_rgba(45,212,191,0.15)]"
                    : "border-border hover:border-[#CBD5E1]"
                }`}
                onClick={() => setTheme(themeOption)}
              >
                <div
                  className={`flex h-[112px] items-center justify-center rounded-[14px] border ${
                    isLight
                      ? "border-[#E2E8F0] bg-white"
                      : "border-[#223147] bg-[#1E2A3A]"
                  }`}
                >
                  {isLight ? (
                    <SunMedium className="h-10 w-10 text-[#F59E0B]" />
                  ) : (
                    <Moon className="h-10 w-10 text-[#FBBF24]" />
                  )}
                </div>

                <p className="mt-3 text-center text-sm font-semibold text-[#475569]">
                  {isLight ? "라이트" : "다크"}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[24px] border border-border bg-card px-5 py-6 shadow-sm lg:px-6">
        <h2 className="text-xl font-semibold text-foreground">대시보드 위젯 설정</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          대시보드에 표시할 섹션과 순서를 설정합니다
        </p>

        <div className="mt-5 space-y-2.5">
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className="flex items-center justify-between rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-[#94A3B8]" />
                <span className="text-sm font-medium text-[#334155]">{widget.label}</span>
              </div>

              <WidgetToggle
                checked={widget.visible}
                onToggle={() =>
                  setWidgets((current) =>
                    current.map((item) =>
                      item.id === widget.id ? { ...item, visible: !item.visible } : item
                    )
                  )
                }
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          className="rounded-xl bg-[#1E2A3A] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#2A3A4E]"
        >
          저장
        </button>
      </div>
    </div>
  );
}
