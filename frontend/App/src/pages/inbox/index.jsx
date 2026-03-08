import { useEffect, useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { EmailListPanel } from "../../features/inbox/ui/EmailListPanel";
import { InboxStatusTabs } from "../../features/inbox/ui/InboxStatusTabs";
import { EmailThreadPanel } from "../../features/inbox/ui/EmailThreadPanel";
import { DraftPanel } from "../../features/inbox/ui/DraftPanel";
import { getEmailsByStatus, getPendingEmailCount } from "../../entities/email/model/email-data";

export function InboxPage() {
  const [activeStatus, setActiveStatus] = useState("pending");
  const [selectedEmailId, setSelectedEmailId] = useState("1");
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const visibleEmails = useMemo(() => getEmailsByStatus(activeStatus), [activeStatus]);

  useEffect(() => {
    if (!visibleEmails.length) {
      setSelectedEmailId("");
      setMobileDetailOpen(false);
      return;
    }

    if (!visibleEmails.some((item) => item.id === selectedEmailId)) {
      setSelectedEmailId(visibleEmails[0].id);
    }
  }, [selectedEmailId, visibleEmails]);

  const selectedEmail = visibleEmails.find((item) => item.id === selectedEmailId) || visibleEmails[0] || null;

  const handleStatusChange = (status) => {
    setActiveStatus(status);
    setMobileDetailOpen(false);
  };

  const handleSelectEmail = (id) => {
    setSelectedEmailId(id);
    setMobileDetailOpen(true);
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
              <DraftPanel email={selectedEmail} />
            </div>
          </div>
        ) : (
          <div className="border-b border-border bg-card">
            <div className="px-4 pt-4">
              <InboxStatusTabs
                activeStatus={activeStatus}
                pendingCount={getPendingEmailCount()}
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
                pendingCount={getPendingEmailCount()}
                onChange={handleStatusChange}
              />
            </div>
          </div>

          <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-3 py-4">
            <div>
              <EmailListPanel
                emails={visibleEmails}
                selectedEmailId={selectedEmail?.id}
                onSelect={(id) => setSelectedEmailId(id)}
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
            <DraftPanel email={selectedEmail} />
          </div>
        </div>
      </div>
    </div>
  );
}
