import { useNavigate } from "react-router";
import { AlertTriangle, CheckCircle2, FileText, PencilLine, Send, SkipForward } from "lucide-react";
import { toast } from "sonner";
import { emailStatusMeta } from "../../../entities/email/model/email-data";
import type { EmailItem, EmailStatus } from "../../../shared/types";

const metaByStatus = emailStatusMeta as Record<
  EmailStatus,
  { label: string; tone: string; banner: string }
>;

const templateNameByCategory: Record<string, string> = {
  가격문의: "가격 안내 템플릿",
  불만접수: "불만 접수 응답 템플릿",
  미팅요청: "미팅 조율 템플릿",
  계약문의: "계약 검토 응답 템플릿",
  기술지원: "기술 지원 템플릿",
};

const variableTypeByToken: Record<string, "auto" | "required"> = {
  "{{회사명}}": "auto",
  "{{가격}}": "auto",
  "{{할인율}}": "auto",
  "{{미팅일시}}": "auto",
  "{{날짜1}}": "auto",
  "{{시간1}}": "auto",
  "{{날짜2}}": "auto",
  "{{시간2}}": "auto",
  "{{담당자명}}": "required",
};

function getPanelTitle(status: EmailStatus) {
  if (status === "completed") {
    return "발송된 답변 내용";
  }
  if (status === "auto-sent") {
    return "자동 발송된 답변 내용";
  }

  return "매칭된 답변 템플릿";
}

function getPanelDescription(status: EmailStatus) {
  if (status !== "pending") {
    return "";
  }

  return "하이라이트된 항목을 확인하고 필요 시 수정 후 발송하세요";
}

function getVariableCounts(text: string) {
  const tokens = text.match(/{{[^}]+}}/g) || [];

  return tokens.reduce(
    (accumulator: { auto: number; required: number }, token: string) => {
      const type = variableTypeByToken[token] || "auto";

      if (type === "required") {
        accumulator.required += 1;
      } else {
        accumulator.auto += 1;
      }

      return accumulator;
    },
    { auto: 0, required: 0 }
  );
}

function renderDraftText(text: string, highlight: boolean) {
  return text.split(/({{[^}]+}})/).map((part: string, index: number) => {
    if (!part.startsWith("{{") || !part.endsWith("}}")) {
      return <span key={`${part}-${index}`}>{part}</span>;
    }

    if (!highlight) {
      return <span key={`${part}-${index}`}>{part}</span>;
    }

    const type = variableTypeByToken[part] || "auto";
    const className =
      type === "required"
        ? "rounded-md bg-[#FEF3C7] px-1.5 py-0.5 text-[#D97706] dark:bg-[#2A1D10] dark:text-[#F4C98A]"
        : "rounded-md bg-[#E6FAF8] px-1.5 py-0.5 text-[#0F766E] dark:bg-[#0B2728] dark:text-[#5EEAD4]";

    return (
      <span key={`${part}-${index}`} className={className}>
        {part}
      </span>
    );
  });
}

interface StatusBannerProps {
  status: EmailStatus;
  sentTime: string;
}

function StatusBanner({ status, sentTime }: StatusBannerProps) {
  if (!sentTime) {
    return null;
  }

  if (status === "completed") {
    return (
      <div className="app-success-pill inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium">
        <CheckCircle2 className="h-3.5 w-3.5" />
        처리 완료 · {sentTime} 발송됨
      </div>
    );
  }

  if (status === "auto-sent") {
    return (
      <div className="app-success-pill inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium">
        <Send className="h-3.5 w-3.5" />
        자동 발송됨 · {sentTime}
      </div>
    );
  }

  return null;
}

interface DraftPanelProps {
  email: EmailItem | null;
  onSend?: () => void;
  onEditSend?: () => void;
  onSkip?: () => void;
}

export function DraftPanel({
  email,
  onSend,
  onEditSend,
  onSkip,
}: DraftPanelProps) {
  const navigate = useNavigate();

  if (!email) {
    return null;
  }

  const handleOpenTemplate = () => {
    navigate("/app/templates", {
      state: {
        templateName,
        emailCategory: email.category,
      },
    });
  };

  const meta = metaByStatus[email.status];
  const readonly = email.status !== "pending";
  const templateName = templateNameByCategory[email.category] || "기본 답변 템플릿";
  const counts = getVariableCounts(email.draft);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-start gap-3">
        <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#CCFBF1] text-[#0F766E] dark:bg-[#0B2728] dark:text-[#5EEAD4]">
          <FileText className="h-4 w-4" />
        </span>

        <div className="min-w-0">
          <p className="text-base font-semibold text-[#1E2A3A] dark:text-foreground">{getPanelTitle(email.status)}</p>
          {getPanelDescription(email.status) ? (
            <p className="mt-1 text-xs text-[#94A3B8] dark:text-muted-foreground">{getPanelDescription(email.status)}</p>
          ) : null}
        </div>
      </div>

      <div className="app-soft-panel rounded-xl px-3 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="h-3.5 w-3.5 shrink-0 text-[#94A3B8] dark:text-muted-foreground" />
            <span className="truncate text-xs text-[#64748B] dark:text-muted-foreground">{templateName}</span>
          </div>
          <button
            type="button"
            className="shrink-0 text-xs font-medium text-[#14B8A6] dark:text-[#5EEAD4]"
            onClick={handleOpenTemplate}
          >
            템플릿 보기 →
          </button>
        </div>
      </div>

      {readonly ? (
        <div className="mt-4">
          <StatusBanner status={email.status} sentTime={email.sentTime} />
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-4 border-y border-border py-3 text-xs">
          <span className="inline-flex items-center gap-1.5 text-[#14B8A6] dark:text-[#5EEAD4]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            자동 완성 {counts.auto}개
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#F59E0B] dark:text-[#F4C98A]">
            <AlertTriangle className="h-3.5 w-3.5" />
            입력 필요 {counts.required}개
          </span>
        </div>
      )}

      <div className={`mt-4 rounded-2xl border border-border bg-card ${readonly ? "opacity-85" : ""}`}>
        <div className="space-y-4 border-b border-border px-4 py-4">
          <div>
            <p className="text-[11px] font-medium text-[#94A3B8] dark:text-muted-foreground">받는 사람</p>
            <p className="mt-1 text-sm text-[#1E2A3A] dark:text-foreground">
              {email.sender} &lt;{email.senderEmail}&gt;
            </p>
          </div>

          <div>
            <p className="text-[11px] font-medium text-[#94A3B8] dark:text-muted-foreground">제목</p>
            <p className="mt-1 text-sm text-[#1E2A3A] dark:text-foreground">Re: {email.subject}</p>
          </div>
        </div>

        <div className="px-4 py-4">
          <div className="whitespace-pre-wrap text-sm leading-8 text-[#475569] dark:text-muted-foreground">
            {renderDraftText(email.draft, !readonly)}
          </div>
        </div>
      </div>

      {readonly ? null : (
        <div className="mt-5">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="app-cta-accent inline-flex min-w-[126px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
              onClick={() => {
                if (onSend) {
                  onSend();
                  return;
                }
                toast.success("답변을 발송했습니다.");
              }}
            >
              <Send className="h-4 w-4" />
              발송하기
            </button>

            <button
              type="button"
              className="app-secondary-button inline-flex min-w-[126px] items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
              onClick={() => {
                if (onEditSend) {
                  onEditSend();
                  return;
                }
                toast.success("초안을 검토 후 발송했습니다.");
              }}
            >
              <PencilLine className="h-4 w-4" />
              편집 후 발송
            </button>
          </div>

          <button
            type="button"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#94A3B8] transition hover:text-[#64748B] dark:text-muted-foreground dark:hover:text-foreground"
            onClick={() => {
              if (onSkip) {
                onSkip();
                return;
              }
              toast("이 메일을 건너뛰었습니다.");
            }}
          >
            <SkipForward className="h-4 w-4" />
            건너뛰기
          </button>
        </div>
      )}

      <p className="mt-3 text-xs text-[#94A3B8] dark:text-muted-foreground">{meta.banner}</p>
    </div>
  );
}
