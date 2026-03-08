import { StatusBadge } from "../../../shared/ui/primitives/StatusBadge";
import { emailStatusMeta } from "../../../entities/email/model/email-data";
import { ScheduleDetectionCard } from "./ScheduleDetectionCard";

export function EmailThreadPanel({ email }) {
  if (!email) {
    return null;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge label={email.category} tone="teal" />
        <StatusBadge label={emailStatusMeta[email.status].label} tone={emailStatusMeta[email.status].tone} />
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-[28px] font-semibold leading-tight text-[#1E2A3A]">{email.subject}</h2>

          <div className="mt-4 flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1E2A3A] text-xs font-semibold text-white">
              {email.sender.slice(0, 1)}
            </span>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#1E2A3A]">
                {email.sender}
                <span className="ml-2 text-[#94A3B8]">{email.company}</span>
              </p>
              <p className="truncate text-xs text-[#94A3B8]">{email.senderEmail}</p>
            </div>
          </div>
        </div>

        <span className="text-xs text-[#94A3B8]">{email.receivedDate} · {email.time}</span>
      </div>

      <div className="rounded-2xl border border-[#E2E8F0] bg-[#FBFDFF] p-5">
        <pre className="whitespace-pre-wrap font-sans text-[14px] leading-8 text-[#475569]">{email.body}</pre>
      </div>

      <ScheduleDetectionCard schedule={email.schedule} />
    </div>
  );
}
