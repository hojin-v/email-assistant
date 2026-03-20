import { useEffect, useMemo, useState } from "react";
import { MessageSquareMore, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { SectionCard } from "../../../shared/ui/primitives/SectionCard";
import { StateBanner } from "../../../shared/ui/primitives/StateBanner";
import { StatusBadge } from "../../../shared/ui/primitives/StatusBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../app/components/ui/dialog";

type SupportTicketStatus = "PENDING" | "ANSWERED";
type SupportTicketFilter = "all" | SupportTicketStatus;

interface SupportTicket {
  ticketId: string;
  title: string;
  content: string;
  status: SupportTicketStatus;
  createdAt: string;
  repliedAt?: string;
  adminReply?: string;
}

const initialTickets: SupportTicket[] = [
  {
    ticketId: "T-240315-01",
    title: "캘린더 등록 대기 일정이 동기화되지 않습니다",
    content:
      "미팅 일정 조율 메일에서 감지된 일정이 승인 후에도 캘린더 화면에 보이지 않습니다. 확인 부탁드립니다.",
    status: "PENDING",
    createdAt: "2026.03.15 09:20",
  },
  {
    ticketId: "T-240313-04",
    title: "템플릿 재생성 이후 기존 초안이 유지되는지 문의합니다",
    content:
      "비즈니스 자료를 수정한 뒤 템플릿 재생성을 실행하면 이미 생성된 초안이 바뀌는지 확인하고 싶습니다.",
    status: "ANSWERED",
    createdAt: "2026.03.13 14:05",
    repliedAt: "2026.03.13 16:40",
    adminReply:
      "이미 생성된 초안은 자동으로 덮어쓰지 않고, 이후 새로 생성되는 초안부터 갱신된 템플릿을 사용합니다.",
  },
];

function formatTicketStatus(status: SupportTicketStatus) {
  return status === "ANSWERED"
    ? { label: "답변 완료", tone: "success" as const }
    : { label: "답변 대기", tone: "warning" as const };
}

interface AdminInquirySettingsPanelProps {
  scenarioId?: string | null;
}

export function AdminInquirySettingsPanel({
  scenarioId,
}: AdminInquirySettingsPanelProps) {
  const supportDialogNormalScenario = scenarioId === "settings-support-dialog-normal";
  const supportSubmitErrorScenario = scenarioId === "settings-support-submit-error";
  const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
  const [activeFilter, setActiveFilter] = useState<SupportTicketFilter>("all");
  const [selectedTicketId, setSelectedTicketId] = useState(initialTickets[0]?.ticketId ?? "");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");

  useEffect(() => {
    if (supportDialogNormalScenario) {
      setDialogOpen(true);
      setDraftTitle("캘린더 등록 자동화 동작 문의");
      setDraftContent(
        "미팅 요청 메일에서 감지된 일정이 어떤 조건일 때 자동 등록되는지 확인하고 싶습니다.",
      );
      return;
    }

    if (!supportSubmitErrorScenario) {
      return;
    }

    setDialogOpen(true);
    setDraftTitle("캘린더 등록 실패 문의");
    setDraftContent(
      "일정 추가 후 저장을 눌렀지만 캘린더에 반영되지 않습니다. 로그를 확인하고 싶습니다.",
    );
  }, [supportDialogNormalScenario, supportSubmitErrorScenario]);

  const visibleTickets = useMemo(
    () =>
      activeFilter === "all"
        ? tickets
        : tickets.filter((ticket) => ticket.status === activeFilter),
    [activeFilter, tickets],
  );

  const selectedTicket =
    visibleTickets.find((ticket) => ticket.ticketId === selectedTicketId) ??
    visibleTickets[0] ??
    null;

  const submitTicket = () => {
    if (!draftTitle.trim() || !draftContent.trim()) {
      toast.error("문의 제목과 내용을 모두 입력하세요.");
      return;
    }

    if (supportSubmitErrorScenario) {
      toast.error("문의 등록을 완료하지 못했습니다.");
      return;
    }

    const ticket: SupportTicket = {
      ticketId: `T-${Date.now()}`,
      title: draftTitle.trim(),
      content: draftContent.trim(),
      status: "PENDING",
      createdAt: "방금 전",
    };

    setTickets((current) => [ticket, ...current]);
    setSelectedTicketId(ticket.ticketId);
    setActiveFilter("all");
    setDraftTitle("");
    setDraftContent("");
    setDialogOpen(false);
    toast.success("관리자 문의를 등록했습니다.");
  };

  return (
    <>
      <SectionCard
        title="관리자 문의"
        description="문의 작성, 처리 상태 확인, 관리자 답변 열람"
        action={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1E2A3A] px-4 py-2 text-sm font-medium text-white"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            문의 작성
          </button>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "전체" },
                { id: "PENDING", label: "답변 대기" },
                { id: "ANSWERED", label: "답변 완료" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                    activeFilter === filter.id
                      ? "bg-[#1E2A3A] text-white"
                      : "bg-[#F1F5F9] text-[#64748B]"
                  }`}
                  onClick={() => setActiveFilter(filter.id as SupportTicketFilter)}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {visibleTickets.map((ticket) => {
                const statusMeta = formatTicketStatus(ticket.status);

                return (
                  <button
                    key={ticket.ticketId}
                    type="button"
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                      selectedTicket?.ticketId === ticket.ticketId
                        ? "border-[#2DD4BF] bg-[#F0FDFA]"
                        : "border-border bg-card hover:border-[#CBD5E1]"
                    }`}
                    onClick={() => setSelectedTicketId(ticket.ticketId)}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {ticket.title}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{ticket.ticketId}</p>
                      </div>
                      <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />
                    </div>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{ticket.content}</p>
                    <p className="mt-3 text-[11px] text-slate-400">{ticket.createdAt}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-[#F8FAFC] p-5">
            {selectedTicket ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{selectedTicket.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      문의 ID {selectedTicket.ticketId} · {selectedTicket.createdAt}
                    </p>
                  </div>
                  <StatusBadge
                    label={formatTicketStatus(selectedTicket.status).label}
                    tone={formatTicketStatus(selectedTicket.status).tone}
                  />
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="mb-2 text-xs font-medium text-[#94A3B8]">문의 내용</p>
                  <p className="whitespace-pre-wrap text-sm text-foreground">{selectedTicket.content}</p>
                </div>

                <div className="rounded-2xl border border-border bg-card p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <MessageSquareMore className="h-4 w-4 text-[#0F766E]" />
                    <p className="text-xs font-medium text-[#94A3B8]">관리자 답변</p>
                  </div>
                  {selectedTicket.adminReply ? (
                    <>
                      <p className="whitespace-pre-wrap text-sm text-foreground">
                        {selectedTicket.adminReply}
                      </p>
                      <p className="mt-3 text-[11px] text-slate-400">
                        {selectedTicket.repliedAt} 답변 완료
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      아직 관리자 답변이 등록되지 않았습니다. 답변이 작성되면 이 탭에서 바로 확인할 수 있습니다.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 text-center">
                <div>
                  <MessageSquareMore className="mx-auto h-10 w-10 text-[#94A3B8]" />
                  <p className="mt-4 text-sm font-medium text-foreground">표시할 문의가 없습니다</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    새 문의를 작성하면 처리 상태와 관리자 답변을 이 화면에서 확인할 수 있습니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>관리자 문의 작성</DialogTitle>
            <DialogDescription>
              설정, 연동, 템플릿, 일정 동작 관련 문의를 등록할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          {supportSubmitErrorScenario ? (
            <StateBanner
              title="문의 등록을 완료하지 못했습니다"
              description="문의 저장 응답이 지연되고 있습니다. 내용을 유지한 채 다시 시도해 주세요."
              tone="error"
            />
          ) : null}

          <div className="space-y-4">
            <label className="block text-sm text-foreground">
              제목
              <input
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                placeholder="문의 제목을 입력하세요"
                className="app-form-input mt-2 h-11 w-full rounded-xl px-4 text-sm"
              />
            </label>

            <label className="block text-sm text-foreground">
              내용
              <textarea
                value={draftContent}
                onChange={(event) => setDraftContent(event.target.value)}
                rows={6}
                placeholder="관리자에게 전달할 문의 내용을 자세히 입력하세요"
                className="app-form-input mt-2 w-full resize-none rounded-xl px-4 py-3 text-sm"
              />
            </label>
          </div>

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
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E2A3A] px-4 py-2 text-sm text-white"
              onClick={submitTicket}
            >
              <Send className="h-4 w-4" />
              문의 등록
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
