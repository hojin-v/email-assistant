import { useState } from "react";
import { SectionCard } from "../../../shared/ui/primitives/SectionCard";
import { StateBanner } from "../../../shared/ui/primitives/StateBanner";
import type { AccountSettings } from "../../../shared/types";
import { toast } from "sonner";

interface AccountSettingsPanelProps {
  account: AccountSettings;
  scenarioId?: string | null;
}

export function AccountSettingsPanel({ account, scenarioId }: AccountSettingsPanelProps) {
  const accountSaveErrorScenario = scenarioId === "settings-account-save-error";
  const passwordValidationScenario = scenarioId === "settings-password-validation-error";
  const [profile, setProfile] = useState(account);
  const [passwords, setPasswords] = useState({
    current: passwordValidationScenario ? "current-password" : "",
    next: passwordValidationScenario ? "next-password" : "",
    confirm: passwordValidationScenario ? "different-password" : "",
  });

  return (
    <div className="space-y-6">
      <SectionCard title="기본 정보">
        {accountSaveErrorScenario ? (
          <StateBanner
            title="계정 정보를 저장하지 못했습니다"
            description="프로필 업데이트 요청을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요."
            tone="error"
            className="mb-5"
          />
        ) : null}
        <div className="space-y-4">
          <label className="block text-sm text-foreground">
            이름
            <input
              value={profile.name}
              onChange={(event) =>
                setProfile((current) => ({ ...current, name: event.target.value }))
              }
              className="app-form-input mt-2 h-11 w-full rounded-xl px-4 text-sm"
            />
          </label>
          <label className="block text-sm text-foreground">
            이메일
            <input
              value={profile.email}
              onChange={(event) =>
                setProfile((current) => ({ ...current, email: event.target.value }))
              }
              className="app-form-input mt-2 h-11 w-full rounded-xl px-4 text-sm"
            />
          </label>
        </div>
      </SectionCard>

      <SectionCard title="비밀번호 변경">
        {passwordValidationScenario ? (
          <StateBanner
            title="비밀번호 변경 정보를 다시 확인해 주세요"
            description="새 비밀번호와 확인 값이 일치하지 않아 변경을 진행할 수 없습니다."
            tone="warning"
            className="mb-5"
          />
        ) : null}
        <div className="space-y-4">
          {["현재 비밀번호", "새 비밀번호", "새 비밀번호 확인"].map((label) => (
            <label key={label} className="block text-sm text-foreground">
              {label}
              <input
                type="password"
                value={
                  label === "현재 비밀번호"
                    ? passwords.current
                    : label === "새 비밀번호"
                    ? passwords.next
                    : passwords.confirm
                }
                onChange={(event) =>
                  setPasswords((current) => ({
                    ...current,
                    [label === "현재 비밀번호"
                      ? "current"
                      : label === "새 비밀번호"
                      ? "next"
                      : "confirm"]: event.target.value,
                  }))
                }
                className="app-form-input mt-2 h-11 w-full rounded-xl px-4 text-sm"
              />
              {passwordValidationScenario && label === "새 비밀번호 확인" ? (
                <p className="mt-2 text-xs text-[#B45309] dark:text-[#E7C18A]">
                  새 비밀번호 확인 값이 서로 다릅니다.
                </p>
              ) : null}
            </label>
          ))}
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            className="rounded-xl bg-[#1E2A3A] px-5 py-2.5 text-sm font-medium text-white"
            onClick={() => {
              if (!passwords.current || !passwords.next || !passwords.confirm) {
                toast.error("비밀번호 필드를 모두 입력하세요.");
                return;
              }
              if (passwords.next !== passwords.confirm) {
                toast.error("새 비밀번호 확인이 일치하지 않습니다.");
                return;
              }
              setPasswords({ current: "", next: "", confirm: "" });
              toast.success("비밀번호를 변경했습니다.");
            }}
          >
            변경
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
