import { Link } from "react-router";
import { ArrowRight, Mail, Target, Link as LinkIcon, FileText, CalendarDays, Video, Users } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { emailItems, getPendingEmailCount } from "../../entities/email/model/email-data";
import { calendarEvents } from "../../entities/calendar/model/calendar-data";
import { SectionCard } from "../../shared/ui/primitives/SectionCard";
import { StatusBadge } from "../../shared/ui/primitives/StatusBadge";

const weeklyData = [
  { name: "가격문의", value: 42, color: "#3B82F6" },
  { name: "불만접수", value: 18, color: "#EF4444" },
  { name: "미팅요청", value: 31, color: "#8B5CF6" },
  { name: "기술지원", value: 24, color: "#F59E0B" },
];

export function DashboardPage() {
  const pendingCount = getPendingEmailCount();
  const statCards = [
    { label: "오늘 처리된 이메일", value: "47", note: "어제 대비 +5", icon: Mail, tone: "teal" },
    { label: "검토 대기 중인 초안", value: String(pendingCount), note: pendingCount ? "즉시 확인 필요" : "없음", icon: FileText, tone: "amber" },
    { label: "템플릿 매칭률", value: "96%", note: "전주 대비 +2%", icon: Target, tone: "teal" },
    { label: "이메일 계정 상태", value: "정상 연결", note: "user@gmail.com", icon: LinkIcon, tone: "green" },
  ];

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border bg-white p-5 shadow-sm dark:bg-card ${
              card.tone === "amber" && pendingCount
                ? "border-[#FDE68A] dark:border-[#4A3417] dark:bg-[#17120D]"
                : "border-[#E2E8F0] dark:border-border"
            }`}
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8FAFC] dark:bg-[#1E293B]">
              <card.icon className="h-5 w-5 text-[#1E2A3A] dark:text-foreground" />
            </div>
            <p className="text-2xl font-semibold text-[#1E2A3A] dark:text-foreground">{card.value}</p>
            <p className="mt-1 text-sm text-[#64748B] dark:text-muted-foreground">{card.label}</p>
            <p
              className={`mt-2 text-xs ${
                card.tone === "amber" && pendingCount
                  ? "text-[#D97706] dark:text-[#F4C98A]"
                  : "text-[#94A3B8] dark:text-muted-foreground"
              }`}
            >
              {card.note}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <SectionCard
            title="다가오는 일정"
            action={
              <Link to="/app/calendar" className="inline-flex items-center gap-2 text-sm font-medium text-[#0F766E]">
                캘린더 보기
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          >
            <div className="space-y-3">
              {calendarEvents.map((event) => (
                <div key={event.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#E2E8F0] px-4 py-4">
                  <div className="h-12 w-1 rounded-full bg-[#2DD4BF]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-[#1E2A3A]">{event.title}</p>
                      {!event.approved ? <StatusBadge label="등록 대기" tone="warning" /> : null}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {event.dateLabel} {event.timeLabel}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        {event.type === "video" ? <Video className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
                        {event.source}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="최근 수신 이메일"
            action={
              <Link to="/app/inbox" className="inline-flex items-center gap-2 text-sm font-medium text-[#0F766E]">
                전체 보기
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          >
            <div className="space-y-3">
              {emailItems.slice(0, 4).map((email) => (
                <div key={email.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#E2E8F0] px-4 py-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1E2A3A] text-sm font-semibold text-white">
                    {email.sender.slice(0, 1)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#1E2A3A]">
                      {email.sender} · {email.company}
                    </p>
                    <p className="mt-1 truncate text-sm text-[#64748B]">{email.subject}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge label={email.category} tone="teal" />
                    <StatusBadge
                      label={email.status === "pending" ? "검토 대기" : email.status === "completed" ? "처리 완료" : "자동 발송"}
                      tone={email.status === "pending" ? "warning" : email.status === "completed" ? "neutral" : "success"}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <SectionCard title="이번 주 요약" description="3월 3일 - 3월 9일">
          <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
            <div className="mx-auto h-[220px] w-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={weeklyData} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {weeklyData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {weeklyData.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-xl bg-[#F8FAFC] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-[#1E2A3A]">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-[#64748B]">{item.value}건</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
