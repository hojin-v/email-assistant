import { Link, useSearchParams } from "react-router";
import { ArrowRight, Mail, Target, Link as LinkIcon, FileText, CalendarDays, Video, Users } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { emailItems, getPendingEmailCount } from "../../entities/email/model/email-data";
import { calendarEvents } from "../../entities/calendar/model/calendar-data";
import { AppStatePage } from "../../shared/ui/primitives/AppStatePage";
import { SectionCard } from "../../shared/ui/primitives/SectionCard";
import { StatePanel } from "../../shared/ui/primitives/StatePanel";
import { StatusBadge } from "../../shared/ui/primitives/StatusBadge";

const weeklyData = [
  { name: "가격문의", value: 42, color: "#3B82F6" },
  { name: "불만접수", value: 18, color: "#EF4444" },
  { name: "미팅요청", value: 31, color: "#8B5CF6" },
  { name: "기술지원", value: 24, color: "#F59E0B" },
];

export function DashboardPage() {
  const [searchParams] = useSearchParams();
  const scenarioId = searchParams.get("scenario");
  const pendingCount = getPendingEmailCount();
  const showFullLoadError =
    scenarioId === "dashboard-load-error" ||
    scenarioId === "global-service-unavailable";
  const showPermissionError = scenarioId === "global-session-expired";
  const showUnexpectedError = scenarioId === "global-unexpected-error";
  const showCalendarPanelError = scenarioId === "dashboard-calendar-panel-error";
  const showEmailPanelError = scenarioId === "dashboard-email-panel-error";
  const statCards = [
    { label: "오늘 처리된 이메일", value: "47", note: "어제 대비 +5", icon: Mail, tone: "teal" },
    { label: "검토 대기 중인 초안", value: String(pendingCount), note: pendingCount ? "즉시 확인 필요" : "없음", icon: FileText, tone: "amber" },
    { label: "템플릿 매칭률", value: "96%", note: "전주 대비 +2%", icon: Target, tone: "teal" },
    { label: "이메일 계정 상태", value: "정상 연결", note: "user@gmail.com", icon: LinkIcon, tone: "green" },
  ];

  if (showPermissionError) {
    return (
      <AppStatePage
        title="세션이 만료되었습니다"
        description="보안을 위해 세션이 종료되었습니다. 다시 로그인한 뒤 계속 진행해 주세요."
        tone="permission"
        action={
          <Link
            to="/"
            className="app-cta-primary inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium"
          >
            로그인으로 이동
          </Link>
        }
      />
    );
  }

  if (showUnexpectedError) {
    return (
      <AppStatePage
        title="예기치 않은 오류가 발생했습니다"
        description="대시보드 데이터를 렌더링하는 중 알 수 없는 문제가 발생했습니다. 잠시 후 다시 시도해 주세요."
      />
    );
  }

  if (showFullLoadError) {
    return (
      <AppStatePage
        title="대시보드를 불러오지 못했습니다"
        description="요약 지표와 최근 활동 데이터를 가져오는 중 문제가 발생했습니다. 연결 상태를 확인한 뒤 다시 시도해 주세요."
      />
    );
  }

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
            {showCalendarPanelError ? (
              <StatePanel
                title="일정 데이터를 불러오지 못했습니다"
                description="다가오는 일정 패널 응답이 지연되고 있습니다. 캘린더 화면에서 다시 확인해 주세요."
              />
            ) : (
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
            )}
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
            {showEmailPanelError ? (
              <StatePanel
                title="최근 메일 패널을 표시할 수 없습니다"
                description="수신 메일 목록 응답을 확인하지 못했습니다. 수신함에서 전체 목록을 확인해 주세요."
              />
            ) : (
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
            )}
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
