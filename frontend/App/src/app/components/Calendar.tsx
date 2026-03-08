import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Mail,
  CalendarCheck,
  Video,
  MoreHorizontal,
  X,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  type: "meeting" | "call" | "video" | "deadline";
  location?: string;
  attendees: { name: string; email: string; company: string }[];
  fromEmail?: { sender: string; subject: string; id: string };
  color: string;
  confirmed: boolean;
  notes?: string;
}

const calendarEvents: CalendarEvent[] = [
  {
    id: "e1",
    title: "테크솔루션 엔터프라이즈 플랜 상담",
    date: "2026-03-04",
    startTime: "14:00",
    endTime: "15:00",
    type: "video",
    location: "Zoom 화상회의",
    attendees: [
      { name: "박민수", email: "minsu.park@techsolution.co.kr", company: "(주)테크솔루션" },
      { name: "김호진", email: "jisoo.kim@mycompany.co.kr", company: "우리회사" },
    ],
    fromEmail: { sender: "박민수", subject: "엔터프라이즈 플랜 가격 문의", id: "1" },
    color: "#3B82F6",
    confirmed: true,
    notes: "엔터프라이즈 플랜 가격, 50인 팀 할인, Google Workspace 연동 논의",
  },
  {
    id: "e2",
    title: "그린에너지 파트너십 미팅",
    date: "2026-03-05",
    startTime: "10:00",
    endTime: "11:30",
    type: "meeting",
    location: "본사 3층 회의실 A",
    attendees: [
      { name: "최영호", email: "youngho.choi@greenenergy.kr", company: "그린에너지" },
      { name: "김호진", email: "jisoo.kim@mycompany.co.kr", company: "우리회사" },
      { name: "이소라", email: "sora.lee@mycompany.co.kr", company: "우리회사" },
    ],
    fromEmail: { sender: "최영호", subject: "3월 파트너십 미팅 요청", id: "3" },
    color: "#8B5CF6",
    confirmed: false,
    notes: "전략적 파트너십 논의, 공동 마케팅 방안 검토",
  },
  {
    id: "e3",
    title: "디자인랩 계약 갱신 미팅",
    date: "2026-03-07",
    startTime: "15:00",
    endTime: "16:00",
    type: "video",
    location: "Google Meet",
    attendees: [
      { name: "정하나", email: "hana.jung@designlab.kr", company: "디자인랩" },
      { name: "김호진", email: "jisoo.kim@mycompany.co.kr", company: "우리회사" },
    ],
    fromEmail: { sender: "정하나", subject: "계약서 수정 요청 건", id: "4" },
    color: "#10B981",
    confirmed: true,
  },
  {
    id: "e4",
    title: "주간 팀 미팅",
    date: "2026-03-02",
    startTime: "09:00",
    endTime: "09:30",
    type: "call",
    attendees: [
      { name: "김호진", email: "jisoo.kim@mycompany.co.kr", company: "우리회사" },
    ],
    color: "#F59E0B",
    confirmed: true,
  },
  {
    id: "e5",
    title: "스마트물류 후속 미팅",
    date: "2026-03-10",
    startTime: "11:00",
    endTime: "12:00",
    type: "meeting",
    location: "본사 2층 회의실 B",
    attendees: [
      { name: "이지은", email: "jieun.lee@smartlogis.com", company: "스마트물류" },
      { name: "김호진", email: "jisoo.kim@mycompany.co.kr", company: "우리회사" },
    ],
    fromEmail: { sender: "이지은", subject: "배송 지연 관련 불만 접수", id: "2" },
    color: "#EF4444",
    confirmed: false,
    notes: "배송 지연 이슈 후속 조치 및 보상 방안 논의",
  },
  {
    id: "e6",
    title: "신규 서비스 론칭 프레젠테이션",
    date: "2026-03-12",
    startTime: "14:00",
    endTime: "16:00",
    type: "video",
    location: "Zoom 웨비나",
    attendees: [
      { name: "김호진", email: "jisoo.kim@mycompany.co.kr", company: "우리회사" },
    ],
    color: "#EC4899",
    confirmed: true,
  },
  {
    id: "e7",
    title: "퀀텀소프트 기술 지원 콜",
    date: "2026-03-02",
    startTime: "14:00",
    endTime: "14:30",
    type: "call",
    attendees: [
      { name: "한승우", email: "seungwoo@quantumsoft.kr", company: "퀀텀소프트" },
      { name: "김호진", email: "jisoo.kim@mycompany.co.kr", company: "우리회사" },
    ],
    fromEmail: { sender: "한승우", subject: "API 연동 기술 미팅 요청", id: "5" },
    color: "#6366F1",
    confirmed: true,
  },
  {
    id: "e8",
    title: "월간 성과 보고 마감",
    date: "2026-03-14",
    startTime: "18:00",
    endTime: "18:00",
    type: "deadline",
    attendees: [],
    color: "#EF4444",
    confirmed: true,
  },
];

const DAYS_KR = ["일", "월", "화", "수", "목", "금", "토"];
const MONTHS_KR = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const typeIcons: Record<string, typeof Video> = {
  meeting: Users,
  call: Clock,
  video: Video,
  deadline: CalendarCheck,
};

const typeLabels: Record<string, string> = {
  meeting: "대면 미팅",
  call: "전화",
  video: "화상회의",
  deadline: "마감",
};

export function Calendar() {
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(2); // March (0-indexed)
  const [selectedDate, setSelectedDate] = useState<string | null>("2026-03-02");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const trailingDays = Math.max(0, 42 - (firstDay + daysInMonth));

  const changeMonth = (direction: number) => {
    const nextDate = new Date(currentYear, currentMonth + direction, 1);
    const nextYear = nextDate.getFullYear();
    const nextMonth = nextDate.getMonth();
    const nextMonthDays = getDaysInMonth(nextYear, nextMonth);
    const currentDay = selectedDate ? Number(selectedDate.slice(-2)) : 1;
    const nextDay = Math.min(currentDay || 1, nextMonthDays);

    setCurrentYear(nextYear);
    setCurrentMonth(nextMonth);
    setSelectedDate(formatDate(nextYear, nextMonth, nextDay));
    setSelectedEvent(null);
  };

  const getEventsForDate = (dateStr: string) =>
    calendarEvents.filter((e) => e.date === dateStr);

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  const today = "2026-03-02";

  // Upcoming events from email
  const emailLinkedEvents = calendarEvents.filter((e) => e.fromEmail);
  const pendingEvents = calendarEvents.filter((e) => !e.confirmed);

  return (
    <div className="flex h-full w-full min-h-0 min-w-0 flex-col bg-background lg:flex-row">
      {/* Main calendar area */}
      <div className="scrollbar-none min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-4 lg:px-6 lg:py-5">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          {pendingEvents.length > 0 ? (
            <div className="flex items-start gap-3 rounded-xl border border-[#FFEDD5] bg-[#FFF7ED] p-4 lg:max-w-[640px]">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F59E0B]/15">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <div className="flex-1">
                <p className="mb-0.5 text-[13px] text-[#92400E]">
                  확인 대기 중인 일정이 {pendingEvents.length}건 있습니다
                </p>
                <p className="text-[11px] text-[#B45309]">
                  이메일에서 AI가 감지한 일정입니다. 확인하고 캘린더에 확정하세요.
                </p>
              </div>
            </div>
          ) : null}

          <button
            className={`flex items-center gap-2 rounded-lg bg-[#2DD4BF] px-4 py-2.5 text-[#1E2A3A] shadow-sm transition-colors hover:bg-[#14B8A6] ${
              pendingEvents.length > 0 ? "self-start lg:self-auto" : "self-end"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span className="text-[13px]">일정 추가</span>
          </button>
        </div>

        {/* Month navigation */}
        <div className="w-full overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0]">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-[#1E2A3A]">
              {currentYear}년 {MONTHS_KR[currentMonth]}
            </h3>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid w-full grid-cols-7 bg-[#F8FAFC]">
            {DAYS_KR.map((day) => (
              <div
                key={day}
                className={`py-2.5 text-center text-[12px] ${
                  day === "일"
                    ? "text-[#EF4444]"
                    : day === "토"
                    ? "text-[#3B82F6]"
                    : "text-[#94A3B8]"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid w-full grid-cols-7">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="h-[92px] border-t border-r border-[#F1F5F9] bg-[#FAFBFC] lg:h-[112px]"
              />
            ))}
            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = formatDate(currentYear, currentMonth, day);
              const dayEvents = getEventsForDate(dateStr);
              const visibleDayEvents = dayEvents.slice(0, 2);
              const emptyEventSlots = Math.max(0, 2 - visibleDayEvents.length);
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedDate;
              const dayOfWeek = (firstDay + i) % 7;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`relative h-[92px] border-t border-r border-[#F1F5F9] p-1.5 text-left transition-colors lg:h-[112px] ${
                    isSelected
                      ? "bg-[#2DD4BF]/5 ring-2 ring-inset ring-[#2DD4BF]/30"
                      : "hover:bg-[#F8FAFC]"
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[13px] ${
                      isToday
                        ? "bg-[#1E2A3A] text-white"
                        : dayOfWeek === 0
                        ? "text-[#EF4444]"
                        : dayOfWeek === 6
                        ? "text-[#3B82F6]"
                        : "text-[#1E2A3A]"
                    }`}
                  >
                    {day}
                  </span>
                  <div className="mt-1 flex min-h-[38px] flex-col gap-0.5">
                    {visibleDayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex h-[17px] items-center gap-1 rounded px-1.5 py-0.5 text-[10px] truncate cursor-pointer"
                        style={{
                          backgroundColor: `${ev.color}15`,
                          color: ev.color,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(ev);
                        }}
                      >
                        <span className="flex w-2.5 shrink-0 items-center justify-center">
                          {ev.fromEmail ? <Mail className="h-2.5 w-2.5 shrink-0" /> : <span className="h-2.5 w-2.5 opacity-0" />}
                        </span>
                        <span className="flex w-1.5 shrink-0 items-center justify-center">
                          {!ev.confirmed ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                          ) : (
                            <span className="h-1.5 w-1.5 opacity-0" />
                          )}
                        </span>
                        <span className="truncate">{ev.title}</span>
                      </div>
                    ))}
                    {Array.from({ length: emptyEventSlots }).map((_, emptyIndex) => (
                      <div key={`empty-slot-${dateStr}-${emptyIndex}`} className="h-[17px]" />
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[10px] text-[#94A3B8] px-1.5">
                        +{dayEvents.length - 2}개 더
                      </span>
                    )}
                  </div>
                </button>
              );
            })}

            {Array.from({ length: trailingDays }).map((_, i) => (
              <div
                key={`trailing-empty-${i}`}
                className="h-[92px] border-t border-r border-[#F1F5F9] bg-[#FAFBFC] lg:h-[112px]"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right sidebar - day detail / event detail */}
      <div className="scrollbar-none min-h-0 shrink-0 overflow-y-auto border-l border-[#E2E8F0] bg-white lg:w-[360px] xl:w-[400px]">
        {selectedEvent ? (
          /* Event detail */
          <div>
            <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0]">
              <h3 className="text-[14px] text-[#1E2A3A]">일정 상세</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 rounded-lg hover:bg-[#F1F5F9] text-[#94A3B8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Title with status */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedEvent.color }}
                  />
                  {!selectedEvent.confirmed && (
                    <span className="px-2 py-0.5 rounded-full bg-[#FFF7ED] text-[#D97706] text-[10px]">
                      확인 대기
                    </span>
                  )}
                  {selectedEvent.confirmed && (
                    <span className="px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A] text-[10px]">
                      확정됨
                    </span>
                  )}
                </div>
                <h2 className="text-[#1E2A3A] mb-1">{selectedEvent.title}</h2>
              </div>

              {/* Time & type */}
              <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg">
                {(() => {
                  const TypeIcon = typeIcons[selectedEvent.type];
                  return <TypeIcon className="w-4 h-4 text-[#64748B]" />;
                })()}
                <div>
                  <p className="text-[13px] text-[#1E2A3A]">
                    {selectedEvent.date.replace(/-/g, ".")} {selectedEvent.startTime} - {selectedEvent.endTime}
                  </p>
                  <p className="text-[11px] text-[#94A3B8]">
                    {typeLabels[selectedEvent.type]}
                  </p>
                </div>
              </div>

              {/* Location */}
              {selectedEvent.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#94A3B8] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[13px] text-[#1E2A3A]">
                      {selectedEvent.location}
                    </p>
                    {(selectedEvent.type === "video") && (
                      <button className="flex items-center gap-1 mt-1 text-[11px] text-[#2DD4BF] hover:text-[#14B8A6]">
                        <ExternalLink className="w-3 h-3" />
                        회의 링크 열기
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Attendees */}
              {selectedEvent.attendees.length > 0 && (
                <div>
                  <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider mb-2">
                    참석자
                  </p>
                  <div className="space-y-2">
                    {selectedEvent.attendees.map((a) => (
                      <div key={a.email} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#1E2A3A] flex items-center justify-center text-white text-[10px]">
                          {a.name[0]}
                        </div>
                        <div>
                          <p className="text-[12px] text-[#1E2A3A]">
                            {a.name}{" "}
                            <span className="text-[#94A3B8]">
                              · {a.company}
                            </span>
                          </p>
                          <p className="text-[10px] text-[#CBD5E1]">
                            {a.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Email source */}
              {selectedEvent.fromEmail && (
                <div className="p-3 bg-[#2DD4BF]/5 border border-[#2DD4BF]/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-3.5 h-3.5 text-[#0D9488]" />
                    <span className="text-[11px] text-[#0D9488]">
                      이메일에서 감지된 일정
                    </span>
                  </div>
                  <p className="text-[12px] text-[#1E2A3A]">
                    {selectedEvent.fromEmail.sender}님의 이메일
                  </p>
                  <p className="text-[11px] text-[#64748B] truncate">
                    "{selectedEvent.fromEmail.subject}"
                  </p>
                </div>
              )}

              {/* Notes */}
              {selectedEvent.notes && (
                <div>
                  <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider mb-2">
                    메모
                  </p>
                  <p className="text-[12px] text-[#64748B] leading-relaxed">
                    {selectedEvent.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-[#F1F5F9] flex gap-2">
                {!selectedEvent.confirmed ? (
                  <>
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2DD4BF] text-[#1E2A3A] rounded-lg hover:bg-[#14B8A6] transition-colors text-[13px]">
                      <CalendarCheck className="w-4 h-4" />
                      일정 확정
                    </button>
                    <button className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-[13px] text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
                      수정
                    </button>
                  </>
                ) : (
                  <>
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#E2E8F0] text-[#1E2A3A] rounded-lg hover:bg-[#F8FAFC] transition-colors text-[13px]">
                      수정
                    </button>
                    <button className="px-4 py-2.5 border border-[#E2E8F0] rounded-lg text-[13px] text-[#EF4444] hover:bg-[#FEF2F2] transition-colors">
                      삭제
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Day detail list */
          <div>
            <div className="p-4 border-b border-[#E2E8F0]">
              <h3 className="text-[14px] text-[#1E2A3A]">
                {selectedDate
                  ? `${selectedDate.replace(/-/g, ".")} 일정`
                  : "날짜를 선택하세요"}
              </h3>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                {selectedDateEvents.length > 0
                  ? `${selectedDateEvents.length}개 일정`
                  : "등록된 일정이 없습니다"}
              </p>
            </div>

            {selectedDateEvents.length === 0 && (
              <div className="px-4 py-4">
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                    <CalendarCheck className="h-5 w-5 text-[#CBD5E1]" />
                  </div>
                  <p className="mb-1 text-[13px] text-[#94A3B8]">
                    이 날에는 일정이 없습니다
                  </p>
                  <p className="text-[11px] text-[#CBD5E1]">
                    이메일에서 감지된 일정이 자동으로 추가됩니다
                  </p>
                </div>
              </div>
            )}

            <div className="divide-y divide-[#F1F5F9]">
              {selectedDateEvents.map((event) => {
                const TypeIcon = typeIcons[event.type];
                return (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="w-full text-left p-4 hover:bg-[#F8FAFC] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-1 h-12 rounded-full shrink-0 mt-0.5"
                        style={{ backgroundColor: event.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {!event.confirmed && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                          )}
                          <span className="text-[13px] text-[#1E2A3A] truncate">
                            {event.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-[#94A3B8]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.startTime} - {event.endTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <TypeIcon className="w-3 h-3" />
                            {typeLabels[event.type]}
                          </span>
                        </div>
                        {event.fromEmail && (
                          <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-[#2DD4BF]/10 rounded text-[10px] text-[#0D9488]">
                            <Mail className="w-2.5 h-2.5" />
                            {event.fromEmail.sender}님 이메일
                          </span>
                        )}
                      </div>
                      <MoreHorizontal className="w-4 h-4 text-[#CBD5E1] shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Email-linked upcoming events */}
            <div className="border-t border-[#E2E8F0]">
              <div className="px-4 pt-4 pb-2">
                <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  이메일에서 감지된 일정
                </p>
              </div>
              <div className="px-4 pb-4 space-y-2">
                {emailLinkedEvents.slice(0, 4).map((event) => (
                  <button
                    key={event.id}
                    onClick={() => {
                      setSelectedDate(event.date);
                      setSelectedEvent(event);
                    }}
                    className="w-full text-left p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] hover:border-[#CBD5E1] transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: event.color }}
                      />
                      <span className="text-[12px] text-[#1E2A3A] truncate flex-1">
                        {event.title}
                      </span>
                      {!event.confirmed && (
                        <span className="text-[9px] text-[#D97706] bg-[#FFF7ED] px-1.5 py-0.5 rounded-full">
                          대기
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#94A3B8]">
                      {event.date.replace(/-/g, ".")} {event.startTime}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
