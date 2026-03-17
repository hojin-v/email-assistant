import { useState } from "react";
import { SectionCard } from "../../../shared/ui/primitives/SectionCard";
import type { AccountSettings } from "../../../shared/types";
import { toast } from "sonner";

interface AccountSettingsPanelProps {
  account: AccountSettings;
}

export function AccountSettingsPanel({ account }: AccountSettingsPanelProps) {
  const [profile, setProfile] = useState(account);
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  return (
    <div className="space-y-6">
      <SectionCard title="기본 정보">
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
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            className="rounded-xl bg-[#1E2A3A] px-5 py-2.5 text-sm font-medium text-white"
            onClick={() => toast.success("계정 정보를 저장했습니다.")}
          >
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
