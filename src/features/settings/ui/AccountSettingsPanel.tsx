import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  deleteMyAccount,
} from "../../../shared/api/auth";
import { getErrorMessage } from "../../../shared/api/http";
import { clearAppSession, updateAppSession } from "../../../shared/lib/app-session";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../app/components/ui/alert-dialog";
import { SectionCard } from "../../../shared/ui/primitives/SectionCard";
import { StateBanner } from "../../../shared/ui/primitives/StateBanner";
import type { AccountSettings } from "../../../shared/types";

interface AccountSettingsPanelProps {
  account: AccountSettings;
  scenarioId?: string | null;
}

export function AccountSettingsPanel({ account, scenarioId }: AccountSettingsPanelProps) {
  const navigate = useNavigate();
  const accountSaveErrorScenario = scenarioId === "settings-account-save-error";
  const passwordValidationScenario = scenarioId === "settings-password-validation-error";
  const deleteDialogScenario = scenarioId === "settings-account-delete-dialog-normal";
  const [profile, setProfile] = useState(account);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(deleteDialogScenario);
  const [passwords, setPasswords] = useState({
    current: passwordValidationScenario ? "current-password" : "",
    next: passwordValidationScenario ? "next-password" : "",
    confirm: passwordValidationScenario ? "different-password" : "",
  });

  useEffect(() => {
    let mounted = true;

    void getMyProfile()
      .then((nextProfile) => {
        if (!mounted) {
          return;
        }

        setProfile({
          name: nextProfile.name,
          email: nextProfile.email,
        });
      })
      .catch((error) => {
        if (!mounted) {
          return;
        }

        toast.error(getErrorMessage(error, "계정 정보를 불러오지 못했습니다."));
      })
      .finally(() => {
        if (!mounted) {
          return;
        }

        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleSaveProfile = async () => {
    if (!profile.name.trim()) {
      toast.error("이름을 입력하세요.");
      return;
    }

    if (accountSaveErrorScenario) {
      toast.error("계정 정보를 저장하지 못했습니다.");
      return;
    }

    setSavingProfile(true);

    try {
      const updatedProfile = await updateMyProfile(profile.name.trim());
      setProfile({
        name: updatedProfile.name,
        email: updatedProfile.email,
      });
      updateAppSession({
        userName: updatedProfile.name,
        userEmail: updatedProfile.email,
      });
      toast.success("계정 정보를 저장했습니다.");
    } catch (error) {
      toast.error(getErrorMessage(error, "계정 정보를 저장하지 못했습니다."));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.next || !passwords.confirm) {
      toast.error("비밀번호 필드를 모두 입력하세요.");
      return;
    }

    if (passwords.next !== passwords.confirm) {
      toast.error("새 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setChangingPassword(true);

    try {
      await changeMyPassword(passwords.current, passwords.next);
      setPasswords({ current: "", next: "", confirm: "" });
      toast.success("비밀번호를 변경했습니다.");
    } catch (error) {
      toast.error(getErrorMessage(error, "비밀번호를 변경하지 못했습니다."));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);

    try {
      await deleteMyAccount();
      clearAppSession();
      toast.success("회원 탈퇴가 완료되었습니다.");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "회원 탈퇴를 처리하지 못했습니다."));
    } finally {
      setDeletingAccount(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
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
                disabled={loading}
              />
            </label>
            <label className="block text-sm text-foreground">
              이메일
              <input
                value={profile.email}
                readOnly
                className="app-form-input mt-2 h-11 w-full rounded-xl px-4 text-sm opacity-80"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                이메일 주소는 현재 백엔드 계약상 수정할 수 없습니다.
              </p>
            </label>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              className="rounded-xl bg-[#1E2A3A] px-5 py-2.5 text-sm font-medium text-white"
              onClick={() => void handleSaveProfile()}
              disabled={loading || savingProfile}
            >
              {savingProfile ? "저장 중..." : "저장"}
            </button>
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
              onClick={() => void handleChangePassword()}
              disabled={changingPassword}
            >
              {changingPassword ? "변경 중..." : "변경"}
            </button>
          </div>
        </SectionCard>

        <SectionCard title="회원 탈퇴">
          <StateBanner
            title="탈퇴 후에는 계정을 복구할 수 없습니다"
            description="현재 계정 정보와 연결된 사용자 워크스페이스 접근이 비활성화됩니다. 탈퇴 전에 필요한 데이터가 있는지 확인해 주세요."
            tone="warning"
            className="mb-5"
          />
          <div className="flex flex-col gap-3 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-4 dark:border-[#5F2430] dark:bg-[#2A1419]">
            <p className="text-sm text-[#7F1D1D] dark:text-[#FCA5A5]">
              회원 탈퇴를 진행하면 현재 계정으로 로그인할 수 없게 됩니다.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                className="app-danger-button rounded-xl px-5 py-2.5 text-sm font-medium"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={deletingAccount}
              >
                회원 탈퇴
              </button>
            </div>
          </div>
        </SectionCard>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 회원 탈퇴를 진행할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              탈퇴 후에는 현재 계정으로 로그인할 수 없으며, 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingAccount}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDeleteAccount()}
              disabled={deletingAccount}
            >
              {deletingAccount ? "탈퇴 처리 중..." : "탈퇴"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
