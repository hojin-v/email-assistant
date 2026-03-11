import { useEffect, useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { EmailListPanel } from "../../features/inbox/ui/EmailListPanel";
import { InboxStatusTabs } from "../../features/inbox/ui/InboxStatusTabs";
import { EmailThreadPanel } from "../../features/inbox/ui/EmailThreadPanel";
import { DraftPanel } from "../../features/inbox/ui/DraftPanel";
import { emailItems } from "../../entities/email/model/email-data";
import type { EmailItem, EmailStatus } from "../../shared/types";
import { toast } from "sonner";

type InboxStatus = "all" | EmailStatus;

export function InboxPage() {
  const [emails, setEmails] = useState<EmailItem[]>(emailItems as EmailItem[]);
  const [activeStatus, setActiveStatus] = useState<InboxStatus>("pending");
  const [selectedEmailId, setSelectedEmailId] = useState("1");
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const visibleEmails = useMemo<EmailItem[]>(
    () =>
      activeStatus === "all"
        ? emails
        : emails.filter((item: EmailItem) => item.status === activeStatus),
    [activeStatus, emails]
  );

  useEffect(() => {
    if (!visibleEmails.length) {
      setSelectedEmailId("");
      setMobileDetailOpen(false);
      return;
    }

    if (!visibleEmails.some((item: EmailItem) => item.id === selectedEmailId)) {
      setSelectedEmailId(visibleEmails[0].id);
    }
  }, [selectedEmailId, visibleEmails]);

  const selectedEmail =
    visibleEmails.find((item: EmailItem) => item.id === selectedEmailId) ||
    visibleEmails[0] ||
    null;

  const handleStatusChange = (status: InboxStatus) => {
    setActiveStatus(status);
    setMobileDetailOpen(false);
  };

  const handleSelectEmail = (id: string) => {
    setSelectedEmailId(id);
    setMobileDetailOpen(true);
  };

  const updateSelectedEmail = (
    updater: (current: EmailItem) => EmailItem,
    successMessage: string
  ) => {
    setEmails((current) =>
      current.map((item) =>
        item.id === selectedEmailId ? updater(item) : item
      )
    );
    toast.success(successMessage);
  };

  const pendingCount = emails.filter((item: EmailItem) => item.status === "pending").length;

  const handleSend = () => {
    if (!selectedEmail) {
      return;
    }

    updateSelectedEmail(
      (item) => ({
        ...item,
        status: "completed",
        sentTime: "방금 전",
      }),
      "답변을 발송했습니다."
    );
  };

  const handleEditSend = () => {
    if (!selectedEmail) {
      return;
    }

    updateSelectedEmail(
      (item) => ({
        ...item,
        status: "completed",
        sentTime: "방금 전",
        draft: `${item.draft}\n\n[검토 후 발송됨]`,
      }),
      "수정본을 발송했습니다."
    );
  };

  const handleSkip = () => {
    if (!selectedEmail) {
      return;
    }

    updateSelectedEmail(
      (item) => ({
        ...item,
        status: "auto-sent",
        sentTime: "방금 전",
      }),
      "이메일을 건너뛰고 자동 처리 상태로 이동했습니다."
    );
  };

  return (
    <div className="h-full w-full min-w-0 bg-background">
      <div className="scrollbar-none h-full overflow-y-auto xl:hidden">
        {mobileDetailOpen && selectedEmail ? (
          <div className="space-y-4 px-4 py-4">
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm text-[#64748B] transition hover:text-[#1E2A3A]"
              onClick={() => setMobileDetailOpen(false)}
            >
              <ChevronLeft className="h-4 w-4" />
              목록으로
            </button>

            <div className="rounded-[24px] border border-border bg-card p-4 shadow-sm">
              <EmailThreadPanel email={selectedEmail} />
            </div>

            <div className="rounded-[24px] border border-border bg-card p-4 shadow-sm">
              <DraftPanel
                email={selectedEmail}
                onSend={handleSend}
                onEditSend={handleEditSend}
                onSkip={handleSkip}
              />
            </div>
          </div>
        ) : (
          <div className="border-b border-border bg-card">
            <div className="px-4 pt-4">
              <InboxStatusTabs
                activeStatus={activeStatus}
                pendingCount={pendingCount}
                onChange={handleStatusChange}
              />
            </div>

            <div className="px-2 py-2">
              <EmailListPanel
                emails={visibleEmails}
                selectedEmailId={selectedEmail?.id}
                onSelect={handleSelectEmail}
              />
            </div>
          </div>
        )}
      </div>

      <div className="hidden h-full min-h-0 xl:grid xl:grid-cols-[320px_minmax(0,1fr)_390px]">
        <div className="flex min-h-0 flex-col border-r border-border bg-card">
          <div className="px-5 pt-5">
            <div>
              <InboxStatusTabs
                activeStatus={activeStatus}
                pendingCount={pendingCount}
                onChange={handleStatusChange}
              />
            </div>
          </div>

          <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-3 py-4">
            <div>
              <EmailListPanel
                emails={visibleEmails}
                selectedEmailId={selectedEmail?.id}
                onSelect={(id: string) => setSelectedEmailId(id)}
              />
            </div>
          </div>
        </div>

        <div className="min-h-0 border-r border-border bg-card">
          <div className="scrollbar-none h-full overflow-y-auto px-5 py-5">
            <EmailThreadPanel email={selectedEmail} />
          </div>
        </div>

        <div className="min-h-0 bg-card">
          <div className="scrollbar-none h-full overflow-y-auto px-5 py-5">
            <DraftPanel
              email={selectedEmail}
              onSend={handleSend}
              onEditSend={handleEditSend}
              onSkip={handleSkip}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
