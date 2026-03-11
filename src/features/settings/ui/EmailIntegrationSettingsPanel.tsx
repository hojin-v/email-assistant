import { useState } from "react";
import { Plus } from "lucide-react";
import type { EmailAccount } from "../../../shared/types";
import { toast } from "sonner";
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

function AccountProviderIcon({ provider }: AccountProviderIconProps) {
  if (provider === "Gmail") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EA4335] text-sm font-semibold text-white">
        G
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#64748B] text-sm font-semibold text-white">
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
      <section className="rounded-[24px] border border-border bg-card px-5 py-6 shadow-sm lg:px-6">
        <h2 className="text-xl font-semibold text-foreground">연결된 이메일 계정</h2>

        <div className="mt-6 space-y-3">
          {items.map((account: EmailAccount) => (
            <div
              key={account.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-[#E2E8F0] px-4 py-5"
            >
              <div className="flex items-center gap-4">
                <AccountProviderIcon provider={account.provider} />

                <div>
                  <p className="text-xl font-medium text-[#0F172A]">{account.email}</p>
                  <span className="mt-2 inline-flex rounded-full bg-[#ECFDF5] px-2 py-1 text-[11px] font-medium text-[#10B981]">
                    {account.status}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="rounded-xl border border-[#EF4444] px-4 py-2 text-sm font-medium text-[#EF4444] transition hover:bg-[#FEF2F2]"
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
            className="flex w-full items-center justify-center gap-2 rounded-[18px] border border-dashed border-[#D7E0EB] px-4 py-6 text-base font-medium text-[#64748B] transition hover:bg-[#F8FAFC]"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>계정 추가</span>
          </button>
        </div>
      </section>

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
            className="h-11 w-full rounded-xl border border-border bg-background px-4"
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
              className="rounded-xl bg-[#1E2A3A] px-4 py-2 text-sm text-white"
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
