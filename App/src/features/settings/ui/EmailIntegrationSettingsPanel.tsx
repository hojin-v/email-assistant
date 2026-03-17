import { useState } from "react";
import { Plus } from "lucide-react";
import type { EmailAccount } from "../../../shared/types";
import { toast } from "sonner";
import { SectionCard } from "../../../shared/ui/primitives/SectionCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../app/components/ui/dialog";

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
}

export function EmailIntegrationSettingsPanel({
  accounts,
}: EmailIntegrationSettingsPanelProps) {
  const [items, setItems] = useState<EmailAccount[]>(accounts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draftEmail, setDraftEmail] = useState("");

  return (
    <>
      <SectionCard title="연결된 이메일 계정">
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
                  setItems((current) =>
                    current.filter((item) => item.id !== account.id)
                  );
                  toast.success("이메일 계정 연결을 해제했습니다.");
                }}
              >
                연결 해제
              </button>
            </div>
          ))}

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-[18px] border border-dashed border-[#D7E0EB] px-4 py-5 text-sm font-medium text-[#64748B] transition hover:bg-[#F8FAFC] dark:border-border dark:text-muted-foreground dark:hover:bg-[#131D2F]"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>계정 추가</span>
          </button>
        </div>
      </SectionCard>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>이메일 계정 추가</DialogTitle>
            <DialogDescription>
              새로 연결할 Gmail 또는 Outlook 주소를 입력하세요.
            </DialogDescription>
          </DialogHeader>

          <input
            value={draftEmail}
            onChange={(event) => setDraftEmail(event.target.value)}
            placeholder="name@company.com"
            className="app-form-input h-11 w-full rounded-xl px-4 text-sm"
          />

          <DialogFooter>
            <button
              type="button"
              className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground"
              onClick={() => setDialogOpen(false)}
            >
              취소
            </button>
            <button
              type="button"
              className="app-cta-primary rounded-xl px-4 py-2 text-sm"
              onClick={() => {
                if (!draftEmail.trim()) {
                  toast.error("이메일 주소를 입력하세요.");
                  return;
                }
                setItems((current) => [
                  ...current,
                  {
                    id: String(Date.now()),
                    provider: draftEmail.includes("outlook") ? "Outlook" : "Gmail",
                    email: draftEmail.trim(),
                    status: "정상 연결",
                  },
                ]);
                setDraftEmail("");
                setDialogOpen(false);
                toast.success("이메일 계정을 추가했습니다.");
              }}
            >
              추가
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
