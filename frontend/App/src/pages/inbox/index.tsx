import { useEffect, useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useSearchParams } from "react-router";
import { EmailListPanel } from "../../features/inbox/ui/EmailListPanel";
import { InboxStatusTabs } from "../../features/inbox/ui/InboxStatusTabs";
import { EmailThreadPanel } from "../../features/inbox/ui/EmailThreadPanel";
import { DraftPanel } from "../../features/inbox/ui/DraftPanel";
import { emailItems } from "../../entities/email/model/email-data";
import type { EmailItem, EmailStatus } from "../../shared/types";
import { toast } from "sonner";
import { StateBanner } from "../../shared/ui/primitives/StateBanner";
import { StatePanel } from "../../shared/ui/primitives/StatePanel";

type InboxStatus = "all" | EmailStatus;

export function InboxPage() {
  const [searchParams] = useSearchParams();
  const scenarioId = searchParams.get("scenario");
  const emptyScenario = scenarioId === "inbox-empty";
  const listErrorScenario = scenarioId === "inbox-list-error";
  const threadErrorScenario = scenarioId === "inbox-thread-error";
  const draftSendErrorScenario = scenarioId === "inbox-draft-send-error";
  const scheduleDetectErrorScenario = scenarioId === "inbox-schedule-detect-error";
  const [emails, setEmails] = useState<EmailItem[]>(() =>
    emptyScenario ? [] : (emailItems as EmailItem[])
  );
  const [activeStatus, setActiveStatus] = useState<InboxStatus>("pending");
  const [selectedEmailId, setSelectedEmailId] = useState(emptyScenario ? "" : "1");
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  useEffect(() => {
    if (emptyScenario) {
      setEmails([]);
      setSelectedEmailId("");
      setMobileDetailOpen(false);
      return;
    }

    setEmails(emailItems as EmailItem[]);
    setSelectedEmailId("1");
  }, [emptyScenario]);

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

    if (draftSendErrorScenario) {
      toast.error("답변을 발송하지 못했습니다.");
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

    if (draftSendErrorScenario) {
      toast.error("수정본 발송을 완료하지 못했습니다.");
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

  const draftBanner =
    draftSendErrorScenario
      ? {
          title: "답변 발송을 완료하지 못했습니다",
          description: "초안은 유지되었으며, 네트워크 상태를 확인한 뒤 다시 발송할 수 있습니다.",
          tone: "error" as const,
        }
      : scheduleDetectErrorScenario
      ? {
          title: "일정 감지 제안을 불러오지 못했습니다",
          description: "이 메일의 일정 후보를 해석하지 못했습니다. 캘린더 화면에서 수동으로 일정을 추가할 수 있습니다.",
          tone: "warning" as const,
        }
      : null;

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
              {threadErrorScenario ? (
                <StatePanel
                  title="메일 상세를 표시할 수 없습니다"
                  description="선택한 메일 본문과 메타데이터를 불러오는 중 문제가 발생했습니다."
                  className="min-h-[280px]"
                />
              ) : (
                <EmailThreadPanel email={selectedEmail} />
              )}
            </div>

            <div className="rounded-[24px] border border-border bg-card p-4 shadow-sm">
              {draftBanner ? (
                <StateBanner
                  title={draftBanner.title}
                  description={draftBanner.description}
                  tone={draftBanner.tone}
                  className="mb-4"
                />
              ) : null}
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
              {listErrorScenario ? (
                <StatePanel
                  title="메일 목록을 불러오지 못했습니다"
                  description="수신함 목록 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요."
                  className="min-h-[320px]"
                />
              ) : visibleEmails.length === 0 ? (
                <StatePanel
                  title="표시할 이메일이 없습니다"
                  description="현재 필터 조건에 맞는 메일이 없습니다. 다른 상태 탭을 선택해 보세요."
                  tone="empty"
                  className="min-h-[320px]"
                />
              ) : (
                <EmailListPanel
                  emails={visibleEmails}
                  selectedEmailId={selectedEmail?.id}
                  onSelect={handleSelectEmail}
                />
              )}
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
              {listErrorScenario ? (
                <StatePanel
                  title="메일 목록을 불러오지 못했습니다"
                  description="메일 인덱스 응답을 확인할 수 없습니다. 다시 시도해 주세요."
                  className="min-h-[520px]"
                />
              ) : visibleEmails.length === 0 ? (
                <StatePanel
                  title="선택한 상태에 메일이 없습니다"
                  description="검토할 메일이 모두 처리되었거나 필터 조건에 맞는 항목이 없습니다."
                  tone="empty"
                  className="min-h-[520px]"
                />
              ) : (
                <EmailListPanel
                  emails={visibleEmails}
                  selectedEmailId={selectedEmail?.id}
                  onSelect={(id: string) => setSelectedEmailId(id)}
                />
              )}
            </div>
          </div>
        </div>

        <div className="min-h-0 border-r border-border bg-card">
          <div className="scrollbar-none h-full overflow-y-auto px-5 py-5">
            {threadErrorScenario ? (
              <StatePanel
                title="메일 상세를 불러오지 못했습니다"
                description="선택한 메일의 본문과 분류 정보를 확인하는 중 오류가 발생했습니다."
                className="min-h-[540px]"
              />
            ) : (
              <EmailThreadPanel email={selectedEmail} />
            )}
          </div>
        </div>

        <div className="min-h-0 bg-card">
          <div className="scrollbar-none h-full overflow-y-auto px-5 py-5">
            {draftBanner ? (
              <StateBanner
                title={draftBanner.title}
                description={draftBanner.description}
                tone={draftBanner.tone}
                className="mb-4"
              />
            ) : null}
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
