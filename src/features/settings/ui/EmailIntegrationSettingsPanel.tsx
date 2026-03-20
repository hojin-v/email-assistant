import { useEffect, useState } from "react";
import { CheckCircle2, Plus } from "lucide-react";
import { useSearchParams } from "react-router";
import type { EmailAccount } from "../../../shared/types";
import { toast } from "sonner";
import { SectionCard } from "../../../shared/ui/primitives/SectionCard";
import { StateBanner } from "../../../shared/ui/primitives/StateBanner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../app/components/ui/dialog";
import {
  deriveGoogleIntegrationEmail,
  getAppSession,
  setConnectedEmails,
} from "../../../shared/lib/app-session";

interface AccountProviderIconProps {
  provider: string;
}

function GmailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M3.75 6.5v10.75a1.25 1.25 0 0 0 1.25 1.25h2.1V10.2L12 13.7l4.9-3.5v8.3H19a1.25 1.25 0 0 0 1.25-1.25V6.5l-1.88 1.33L12 12.2 5.63 7.83 3.75 6.5Z"
        fill="#EA4335"
      />
      <path d="M3.75 6.5 5.63 7.83V18.5H5A1.25 1.25 0 0 1 3.75 17.25V6.5Z" fill="#4285F4" />
      <path d="M20.25 6.5v10.75A1.25 1.25 0 0 1 19 18.5h-.63V7.83l1.88-1.33Z" fill="#34A853" />
      <path d="M20.25 6.5v.24L18.37 8.1 12 12.45 5.63 8.1 3.75 6.74V6.5a1.25 1.25 0 0 1 2-.98L12 9.92l6.25-4.4a1.25 1.25 0 0 1 2 .98Z" fill="#FBBC04" />
    </svg>
  );
}

function AccountProviderIcon({ provider }: AccountProviderIconProps) {
  if (provider === "Gmail") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F1F5F9] bg-white shadow-sm dark:border-border dark:bg-[#131D2F]">
        <GmailIcon />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#64748B] text-sm font-semibold text-white dark:bg-[#22324A]">
      {provider.slice(0, 1)}
    </div>
  );
}

interface EmailIntegrationSettingsPanelProps {
  accounts: EmailAccount[];
  scenarioId?: string | null;
}

function buildGmailAccount(email: string): EmailAccount {
  return {
    id: `gmail-${email}`,
    provider: "Gmail",
    email,
    status: "정상 연결",
  };
}

const GOOGLE_OAUTH_PENDING_KEY = "emailassist-google-oauth-pending";

function deriveAdditionalGmailEmail(baseEmail: string, existingEmails: string[]) {
  const normalizedBaseEmail = deriveGoogleIntegrationEmail(baseEmail);

  if (!existingEmails.includes(normalizedBaseEmail)) {
    return normalizedBaseEmail;
  }

  const [localPart, domain = "gmail.com"] = normalizedBaseEmail.split("@");
  let suffix = 2;

  while (existingEmails.includes(`${localPart}+${suffix}@${domain}`)) {
    suffix += 1;
  }

  return `${localPart}+${suffix}@${domain}`;
}

export function EmailIntegrationSettingsPanel({
  accounts,
  scenarioId,
}: EmailIntegrationSettingsPanelProps) {
  const session = getAppSession();
  const oauthVerifyNormalScenario =
    scenarioId === "settings-email-oauth-verify-normal";
  const oauthErrorScenario = scenarioId === "settings-email-oauth-error";
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<EmailAccount[]>(() => {
    if (session.connectedEmails.length) {
      return session.connectedEmails.map(buildGmailAccount);
    }

    if (session.connectedEmail) {
      return [buildGmailAccount(session.connectedEmail)];
    }

    const initialGmailAccounts = accounts.filter(
      (account) => account.provider === "Gmail",
    );

    if (initialGmailAccounts.length) {
      return initialGmailAccounts.map((account) => ({
        ...account,
        id: account.id || `gmail-${account.email}`,
      }));
    }

    return [];
  });
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [verificationReady, setVerificationReady] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  const syncConnectedAccounts = (updater: (current: EmailAccount[]) => EmailAccount[]) => {
    setItems((current) => {
      const nextItems = updater(current);
      setConnectedEmails(nextItems.map((item) => item.email));
      return nextItems;
    });
  };

  const clearOauthReturnState = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(GOOGLE_OAUTH_PENDING_KEY);
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete("google_oauth");
    setSearchParams(nextSearchParams, { replace: true });
    setVerificationDialogOpen(false);
    setVerificationReady(false);
    setVerificationEmail("");
  };

  const handleConfirmOAuth = () => {
    if (oauthErrorScenario) {
      toast.error("Google 인증 응답을 확인하지 못했습니다.");
      return;
    }

    syncConnectedAccounts((current) => {
      if (current.some((item) => item.email === verificationEmail)) {
        return current;
      }

      return [...current, buildGmailAccount(verificationEmail)];
    });

    toast.success("Google OAuth 인증이 확인되어 Gmail 계정을 추가했습니다.");
    clearOauthReturnState();
  };

  const handleAddAccount = () => {
    const nextEmail = deriveAdditionalGmailEmail(
      session.userEmail,
      items.map((item) => item.email),
    );

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(GOOGLE_OAUTH_PENDING_KEY, nextEmail);
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("tab", "email");
    nextSearchParams.set("google_oauth", "returned");
    setSearchParams(nextSearchParams);
  };

  useEffect(() => {
    if (searchParams.get("google_oauth") !== "returned" || verificationReady) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const pendingEmail = window.sessionStorage.getItem(GOOGLE_OAUTH_PENDING_KEY);

    if (!pendingEmail) {
      clearOauthReturnState();
      return;
    }

    setVerificationDialogOpen(true);
    setVerificationReady(true);
    setVerificationEmail(pendingEmail);
  }, [searchParams, verificationReady]);

  useEffect(() => {
    if (oauthVerifyNormalScenario) {
      setVerificationDialogOpen(true);
      setVerificationReady(true);
      setVerificationEmail(
        deriveAdditionalGmailEmail(
          session.userEmail,
          items.map((item) => item.email),
        ),
      );
      return;
    }

    if (!oauthErrorScenario) {
      return;
    }

    setVerificationDialogOpen(true);
    setVerificationReady(true);
    setVerificationEmail(items[0]?.email ?? deriveGoogleIntegrationEmail(session.userEmail));
  }, [items, oauthErrorScenario, oauthVerifyNormalScenario, session.userEmail]);

  return (
    <>
      <SectionCard title="연결된 이메일 계정">
        {oauthErrorScenario ? (
          <StateBanner
            title="Google 인증 확인을 완료하지 못했습니다"
            description="OAuth 복귀 응답을 검증하지 못했습니다. 계정 추가를 다시 시도해 주세요."
            tone="error"
            className="mb-5"
          />
        ) : null}
        <div className="mt-6 space-y-3">
          {items.map((account: EmailAccount) => (
            <div
              key={account.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-[#E2E8F0] bg-card px-4 py-4 dark:border-border"
            >
              <div className="flex items-center gap-4">
                <AccountProviderIcon provider={account.provider} />

                <div>
                  <p className="text-base font-medium text-[#0F172A] dark:text-foreground">
                    {account.email}
                  </p>
                  <span className="app-success-pill mt-2 inline-flex rounded-full px-2 py-1 text-[11px] font-medium">
                    {account.status}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="app-danger-button rounded-xl px-4 py-2 text-sm font-medium"
                onClick={() => {
                  syncConnectedAccounts((current) =>
                    current.filter((item) => item.id !== account.id)
                  );
                  toast.success("Gmail 계정 연결을 해제했습니다.");
                }}
              >
                연결 해제
              </button>
            </div>
          ))}

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-[18px] border border-dashed border-[#D7E0EB] px-4 py-5 text-sm font-medium text-[#64748B] transition hover:bg-[#F8FAFC] dark:border-border dark:text-muted-foreground dark:hover:bg-[#131D2F]"
            onClick={handleAddAccount}
          >
            <Plus className="h-4 w-4" />
            <span>계정 추가</span>
          </button>
        </div>
      </SectionCard>

      <Dialog
        open={verificationDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            clearOauthReturnState();
            return;
          }

          setVerificationDialogOpen(open);
        }}
      >
          <DialogContent className="sm:max-w-[460px]">
            <DialogHeader className="text-center sm:text-center">
              <DialogTitle>Google 인증 확인</DialogTitle>
              <DialogDescription className="mx-auto max-w-[320px] break-keep text-center">
                Google OAuth 인증을 마쳤다면 아래에서 계정 연결을 완료해 주세요.
              </DialogDescription>
            </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-3 text-center">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full ${
                oauthErrorScenario
                  ? "bg-[#FECACA]/30 dark:bg-[#3F1D24]"
                  : "bg-[#2DD4BF]/10 dark:bg-[#0F766E]/20"
              }`}
            >
              <CheckCircle2
                className={`h-8 w-8 ${
                  oauthErrorScenario
                    ? "text-[#DC2626] dark:text-[#FCA5A5]"
                    : "text-[#0F766E] dark:text-[#5EEAD4]"
                }`}
              />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">{verificationEmail}</p>
              {oauthErrorScenario ? (
                <p className="text-sm text-muted-foreground">
                  Google 인증 결과를 확인하지 못했습니다. OAuth를 다시 진행한 뒤 다시 시도해 주세요.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  인증이 완료되면 이 Gmail 계정이 이메일 연동 목록에 추가됩니다.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="justify-center sm:justify-center">
            <button
              type="button"
              className="app-cta-primary rounded-xl px-4 py-2 text-sm"
              onClick={handleConfirmOAuth}
            >
              인증 확인
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
