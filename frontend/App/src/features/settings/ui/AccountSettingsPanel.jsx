import { SectionCard } from "../../../shared/ui/primitives/SectionCard";

export function AccountSettingsPanel({ account }) {
  return (
    <div className="space-y-6">
      <SectionCard title="기본 정보">
        <div className="space-y-4">
          <label className="block text-sm text-foreground">
            이름
            <input
              defaultValue={account.name}
              className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-[#2DD4BF]"
            />
          </label>
          <label className="block text-sm text-foreground">
            이메일
            <input
              defaultValue={account.email}
              className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-[#2DD4BF]"
            />
          </label>
        </div>
        <div className="mt-5 flex justify-end">
          <button type="button" className="rounded-xl bg-[#1E2A3A] px-5 py-2.5 text-sm font-medium text-white">
            저장
          </button>
        </div>
      </SectionCard>

      <SectionCard title="비밀번호 변경">
        <div className="space-y-4">
          {["현재 비밀번호", "새 비밀번호", "새 비밀번호 확인"].map((label) => (
            <label key={label} className="block text-sm text-foreground">
              {label}
              <input
                type="password"
                className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-[#2DD4BF]"
              />
            </label>
          ))}
        </div>
        <div className="mt-5 flex justify-end">
          <button type="button" className="rounded-xl bg-[#1E2A3A] px-5 py-2.5 text-sm font-medium text-white">
            변경
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
