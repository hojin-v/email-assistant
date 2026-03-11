import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
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
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
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

interface CalendarEventDraft {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: CalendarEvent["type"];
  location: string;
  attendeesText: string;
  notes: string;
}

const initialEvents: CalendarEvent[] = [
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

function draftFromEvent(event: CalendarEvent): CalendarEventDraft {
  return {
    title: event.title,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    type: event.type,
    location: event.location || "",
    attendeesText: event.attendees.map((attendee) => attendee.name).join(", "),
    notes: event.notes || "",
  };
}

function buildAttendees(attendeesText: string) {
  return attendeesText
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name, index) => ({
      name,
      email: `guest${index + 1}@example.com`,
      company: "외부 참석자",
    }));
}

const typeIcons: Record<CalendarEvent["type"], typeof Video> = {
  meeting: Users,
  call: Clock,
  video: Video,
  deadline: CalendarCheck,
};

const typeLabels: Record<CalendarEvent["type"], string> = {
  meeting: "대면 미팅",
  call: "전화",
  video: "화상회의",
  deadline: "마감",
};

const colorByType: Record<CalendarEvent["type"], string> = {
  meeting: "#8B5CF6",
  call: "#F59E0B",
  video: "#3B82F6",
  deadline: "#EF4444",
};

export function Calendar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(2);
  const [selectedDate, setSelectedDate] = useState<string | null>("2026-03-02");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [draft, setDraft] = useState<CalendarEventDraft>({
    title: "",
    date: "2026-03-02",
    startTime: "09:00",
    endTime: "10:00",
    type: "meeting",
    location: "",
    attendeesText: "",
    notes: "",
  });
  const [deleteTarget, setDeleteTarget] = useState<CalendarEvent | null>(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const trailingDays = Math.max(0, 42 - (firstDay + daysInMonth));

  const selectedEvent =
    events.find((event) => event.id === selectedEventId) || null;

  useEffect(() => {
    const state = location.state as
      | {
          prefillEvent?: Partial<CalendarEvent> & {
            title: string;
            date: string;
            startTime: string;
            endTime: string;
            type: CalendarEvent["type"];
            location?: string;
            notes?: string;
            fromEmail?: CalendarEvent["fromEmail"];
          };
          autoSubmit?: boolean;
        }
      | null;

    if (!state?.prefillEvent) {
      return;
    }

    const prefillDraft: CalendarEventDraft = {
      title: state.prefillEvent.title,
      date: state.prefillEvent.date,
      startTime: state.prefillEvent.startTime,
      endTime: state.prefillEvent.endTime,
      type: state.prefillEvent.type,
      location: state.prefillEvent.location || "",
      attendeesText: state.prefillEvent.fromEmail?.sender || "",
      notes: state.prefillEvent.notes || "",
    };

    setSelectedDate(prefillDraft.date);

    if (state.autoSubmit) {
      const newEvent: CalendarEvent = {
        id: String(Date.now()),
        title: prefillDraft.title,
        date: prefillDraft.date,
        startTime: prefillDraft.startTime,
        endTime: prefillDraft.endTime,
        type: prefillDraft.type,
        location: prefillDraft.location,
        attendees: buildAttendees(prefillDraft.attendeesText),
        fromEmail: state.prefillEvent.fromEmail,
        color: colorByType[prefillDraft.type],
        confirmed: false,
        notes: prefillDraft.notes,
      };
      setEvents((current) => [newEvent, ...current]);
      setSelectedEventId(newEvent.id);
      toast.success("일정을 캘린더에 추가했습니다.");
    } else {
      setDraft(prefillDraft);
      setEditorMode("create");
      setEditorOpen(true);
    }

    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

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
    setSelectedEventId(null);
  };

  const getEventsForDate = (dateStr: string) =>
    events.filter((event) => event.date === dateStr);

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const emailLinkedEvents = useMemo(
    () => events.filter((event) => event.fromEmail),
    [events]
  );
  const pendingEvents = useMemo(
    () => events.filter((event) => !event.confirmed),
    [events]
  );

  const openCreateDialog = () => {
    setEditorMode("create");
    setDraft({
      title: "",
      date: selectedDate || "2026-03-02",
      startTime: "09:00",
      endTime: "10:00",
      type: "meeting",
      location: "",
      attendeesText: "",
      notes: "",
    });
    setEditorOpen(true);
  };

  const openEditDialog = (event: CalendarEvent) => {
    setEditorMode("edit");
    setSelectedEventId(event.id);
    setDraft(draftFromEvent(event));
    setEditorOpen(true);
  };

  const handleSaveEvent = () => {
    if (!draft.title.trim()) {
      toast.error("일정 제목을 입력하세요.");
      return;
    }

    if (editorMode === "edit" && selectedEvent) {
      setEvents((current) =>
        current.map((event) =>
          event.id === selectedEvent.id
            ? {
                ...event,
                title: draft.title.trim(),
                date: draft.date,
                startTime: draft.startTime,
                endTime: draft.endTime,
                type: draft.type,
                location: draft.location,
                attendees: buildAttendees(draft.attendeesText),
                color: colorByType[draft.type],
                notes: draft.notes,
              }
            : event
        )
      );
      toast.success("일정을 수정했습니다.");
    } else {
      const newEvent: CalendarEvent = {
        id: String(Date.now()),
        title: draft.title.trim(),
        date: draft.date,
        startTime: draft.startTime,
        endTime: draft.endTime,
        type: draft.type,
        location: draft.location,
        attendees: buildAttendees(draft.attendeesText),
        color: colorByType[draft.type],
        confirmed: draft.type === "deadline",
        notes: draft.notes,
      };
      setEvents((current) => [newEvent, ...current]);
      setSelectedEventId(newEvent.id);
      toast.success("새 일정을 추가했습니다.");
    }

    setSelectedDate(draft.date);
    setEditorOpen(false);
  };

  const handleConfirmEvent = () => {
    if (!selectedEvent) {
      return;
    }

    setEvents((current) =>
      current.map((event) =>
        event.id === selectedEvent.id ? { ...event, confirmed: true } : event
      )
    );
    toast.success("일정을 확정했습니다.");
  };

  const handleDeleteEvent = () => {
    if (!deleteTarget) {
      return;
    }

    setEvents((current) =>
      current.filter((event) => event.id !== deleteTarget.id)
    );
    if (selectedEventId === deleteTarget.id) {
      setSelectedEventId(null);
    }
    toast.success("일정을 삭제했습니다.");
    setDeleteTarget(null);
  };

  const openMeetingLink = () => {
    if (!selectedEvent) {
      return;
    }

    window.open(
      `https://calendar.google.com/calendar/u/0/r/eventedit/${selectedEvent.id}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const today = "2026-03-02";

  return (
    <>
      <div className="flex h-full w-full min-h-0 min-w-0 flex-col bg-background lg:flex-row">
        <div className="scrollbar-none min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-4 lg:px-6 lg:py-5">
          <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            {pendingEvents.length > 0 ? (
              <div className="flex items-start gap-3 rounded-xl border border-[#FFEDD5] bg-[#FFF7ED] p-4 lg:max-w-[640px]">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F59E0B]/15">
                  <Sparkles className="h-4 w-4 text-[#F59E0B]" />
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
              onClick={openCreateDialog}
              className={`flex items-center gap-2 rounded-lg bg-[#2DD4BF] px-4 py-2.5 text-[#1E2A3A] shadow-sm transition-colors hover:bg-[#14B8A6] ${
                pendingEvents.length > 0 ? "self-start lg:self-auto" : "self-end"
              }`}
            >
              <Plus className="h-4 w-4" />
              <span className="text-[13px]">일정 추가</span>
            </button>
          </div>

          <div className="w-full overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] p-4">
              <button
                onClick={() => changeMonth(-1)}
                className="rounded-lg p-2 text-[#64748B] transition-colors hover:bg-[#F1F5F9]"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="text-[#1E2A3A]">
                {currentYear}년 {MONTHS_KR[currentMonth]}
              </h3>
              <button
                onClick={() => changeMonth(1)}
                className="rounded-lg p-2 text-[#64748B] transition-colors hover:bg-[#F1F5F9]"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

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

            <div className="grid w-full grid-cols-7">
              {Array.from({ length: firstDay }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="h-[92px] border-r border-t border-[#F1F5F9] bg-[#FAFBFC] lg:h-[112px]"
                />
              ))}

              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const dateStr = formatDate(currentYear, currentMonth, day);
                const dayEvents = getEventsForDate(dateStr);
                const visibleDayEvents = dayEvents.slice(0, 2);
                const isToday = dateStr === today;
                const isSelected = dateStr === selectedDate;
                const dayOfWeek = (firstDay + index) % 7;

                return (
                  <button
                    key={day}
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setSelectedEventId(null);
                    }}
                    className={`relative h-[92px] border-r border-t border-[#F1F5F9] p-1.5 text-left transition-colors lg:h-[112px] ${
                      isSelected
                        ? "bg-[#2DD4BF]/5 ring-2 ring-inset ring-[#2DD4BF]/30"
                        : "hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[13px] ${
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
                      {visibleDayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex h-[17px] cursor-pointer items-center gap-1 truncate rounded px-1.5 py-0.5 text-[10px]"
                          style={{
                            backgroundColor: `${event.color}15`,
                            color: event.color,
                          }}
                          onClick={(eventClick) => {
                            eventClick.stopPropagation();
                            setSelectedEventId(event.id);
                            setSelectedDate(event.date);
                          }}
                        >
                          <span className="flex w-2.5 shrink-0 items-center justify-center">
                            {event.fromEmail ? (
                              <Mail className="h-2.5 w-2.5 shrink-0" />
                            ) : (
                              <span className="h-2.5 w-2.5 opacity-0" />
                            )}
                          </span>
                          <span className="flex w-1.5 shrink-0 items-center justify-center">
                            {!event.confirmed ? (
                              <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                            ) : (
                              <span className="h-1.5 w-1.5 opacity-0" />
                            )}
                          </span>
                          <span className="truncate">{event.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 2 ? (
                        <span className="px-1.5 text-[10px] text-[#94A3B8]">
                          +{dayEvents.length - 2}개 더
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}

              {Array.from({ length: trailingDays }).map((_, index) => (
                <div
                  key={`trailing-${index}`}
                  className="h-[92px] border-r border-t border-[#F1F5F9] bg-[#FAFBFC] lg:h-[112px]"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="scrollbar-none min-h-0 shrink-0 overflow-y-auto border-l border-[#E2E8F0] bg-white lg:w-[360px] xl:w-[400px]">
          {selectedEvent ? (
            <div>
              <div className="flex items-center justify-between border-b border-[#E2E8F0] p-4">
                <h3 className="text-[14px] text-[#1E2A3A]">일정 상세</h3>
                <button
                  onClick={() => setSelectedEventId(null)}
                  className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-[#F1F5F9]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-5 p-5">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: selectedEvent.color }}
                    />
                    {!selectedEvent.confirmed ? (
                      <span className="rounded-full bg-[#FFF7ED] px-2 py-0.5 text-[10px] text-[#D97706]">
                        확인 대기
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#F0FDF4] px-2 py-0.5 text-[10px] text-[#16A34A]">
                        확정됨
                      </span>
                    )}
                  </div>
                  <h2 className="mb-1 text-[#1E2A3A]">{selectedEvent.title}</h2>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-[#F8FAFC] p-3">
                  {(() => {
                    const TypeIcon = typeIcons[selectedEvent.type];
                    return <TypeIcon className="h-4 w-4 text-[#64748B]" />;
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

                {selectedEvent.location ? (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#94A3B8]" />
                    <div>
                      <p className="text-[13px] text-[#1E2A3A]">
                        {selectedEvent.location}
                      </p>
                      {selectedEvent.type === "video" ? (
                        <button
                          onClick={openMeetingLink}
                          className="mt-1 flex items-center gap-1 text-[11px] text-[#2DD4BF] hover:text-[#14B8A6]"
                        >
                          <ExternalLink className="h-3 w-3" />
                          회의 링크 열기
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {selectedEvent.attendees.length > 0 ? (
                  <div>
                    <p className="mb-2 text-[11px] uppercase tracking-wider text-[#94A3B8]">
                      참석자
                    </p>
                    <div className="space-y-2">
                      {selectedEvent.attendees.map((attendee) => (
                        <div key={attendee.email} className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1E2A3A] text-[10px] text-white">
                            {attendee.name[0]}
                          </div>
                          <div>
                            <p className="text-[12px] text-[#1E2A3A]">
                              {attendee.name}
                              <span className="text-[#94A3B8]"> · {attendee.company}</span>
                            </p>
                            <p className="text-[10px] text-[#CBD5E1]">{attendee.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {selectedEvent.fromEmail ? (
                  <div className="rounded-lg border border-[#2DD4BF]/20 bg-[#2DD4BF]/5 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-[#0D9488]" />
                      <span className="text-[11px] text-[#0D9488]">
                        이메일에서 감지된 일정
                      </span>
                    </div>
                    <p className="text-[12px] text-[#1E2A3A]">
                      {selectedEvent.fromEmail.sender}님의 이메일
                    </p>
                    <p className="truncate text-[11px] text-[#64748B]">
                      "{selectedEvent.fromEmail.subject}"
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate("/app/inbox")}
                      className="mt-2 text-[11px] text-[#0D9488] underline-offset-4 hover:underline"
                    >
                      원본 이메일 보기
                    </button>
                  </div>
                ) : null}

                {selectedEvent.notes ? (
                  <div>
                    <p className="mb-2 text-[11px] uppercase tracking-wider text-[#94A3B8]">
                      메모
                    </p>
                    <p className="text-[12px] leading-relaxed text-[#64748B]">
                      {selectedEvent.notes}
                    </p>
                  </div>
                ) : null}

                <div className="flex gap-2 border-t border-[#F1F5F9] pt-3">
                  {!selectedEvent.confirmed ? (
                    <>
                      <button
                        onClick={handleConfirmEvent}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#2DD4BF] px-4 py-2.5 text-[13px] text-[#1E2A3A] transition-colors hover:bg-[#14B8A6]"
                      >
                        <CalendarCheck className="h-4 w-4" />
                        일정 확정
                      </button>
                      <button
                        onClick={() => openEditDialog(selectedEvent)}
                        className="rounded-lg border border-[#E2E8F0] px-4 py-2.5 text-[13px] text-[#64748B] transition-colors hover:bg-[#F8FAFC]"
                      >
                        수정
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => openEditDialog(selectedEvent)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-[13px] text-[#1E2A3A] transition-colors hover:bg-[#F8FAFC]"
                      >
                        <Pencil className="h-4 w-4" />
                        수정
                      </button>
                      <button
                        onClick={() => setDeleteTarget(selectedEvent)}
                        className="rounded-lg border border-[#E2E8F0] px-4 py-2.5 text-[13px] text-[#EF4444] transition-colors hover:bg-[#FEF2F2]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="border-b border-[#E2E8F0] p-4">
                <h3 className="text-[14px] text-[#1E2A3A]">
                  {selectedDate ? `${selectedDate.replace(/-/g, ".")} 일정` : "날짜를 선택하세요"}
                </h3>
                <p className="mt-0.5 text-[11px] text-[#94A3B8]">
                  {selectedDateEvents.length > 0
                    ? `${selectedDateEvents.length}개 일정`
                    : "등록된 일정이 없습니다"}
                </p>
              </div>

              {selectedDateEvents.length === 0 ? (
                <div className="px-4 py-4">
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                      <CalendarCheck className="h-5 w-5 text-[#CBD5E1]" />
                    </div>
                    <p className="mb-1 text-[13px] text-[#94A3B8]">
                      이 날에는 일정이 없습니다
                    </p>
                    <p className="text-[11px] text-[#CBD5E1]">
                      직접 추가하거나 이메일에서 감지된 일정을 등록할 수 있습니다
                    </p>
                    <button
                      onClick={openCreateDialog}
                      className="mt-4 rounded-lg bg-[#1E2A3A] px-4 py-2 text-[12px] text-white"
                    >
                      일정 추가
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="divide-y divide-[#F1F5F9]">
                {selectedDateEvents.map((event) => {
                  const TypeIcon = typeIcons[event.type];
                  return (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEventId(event.id)}
                      className="w-full p-4 text-left transition-colors hover:bg-[#F8FAFC]"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="mt-0.5 h-12 w-1 shrink-0 rounded-full"
                          style={{ backgroundColor: event.color }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            {!event.confirmed ? (
                              <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                            ) : null}
                            <span className="truncate text-[13px] text-[#1E2A3A]">
                              {event.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-[#94A3B8]">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {event.startTime} - {event.endTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <TypeIcon className="h-3 w-3" />
                              {typeLabels[event.type]}
                            </span>
                          </div>
                          {event.fromEmail ? (
                            <span className="mt-1.5 inline-flex items-center gap-1 rounded bg-[#2DD4BF]/10 px-2 py-0.5 text-[10px] text-[#0D9488]">
                              <Mail className="h-2.5 w-2.5" />
                              {event.fromEmail.sender}님 이메일
                            </span>
                          ) : null}
                        </div>
                        <MoreHorizontal className="h-4 w-4 shrink-0 text-[#CBD5E1]" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-[#E2E8F0]">
                <div className="px-4 pb-2 pt-4">
                  <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#94A3B8]">
                    <Sparkles className="h-3 w-3" />
                    이메일에서 감지된 일정
                  </p>
                </div>
                <div className="space-y-2 px-4 pb-4">
                  {emailLinkedEvents.slice(0, 4).map((event) => (
                    <button
                      key={event.id}
                      onClick={() => {
                        setSelectedDate(event.date);
                        setSelectedEventId(event.id);
                      }}
                      className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-left transition-colors hover:border-[#CBD5E1]"
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: event.color }}
                        />
                        <span className="flex-1 truncate text-[12px] text-[#1E2A3A]">
                          {event.title}
                        </span>
                        {!event.confirmed ? (
                          <span className="rounded-full bg-[#FFF7ED] px-1.5 py-0.5 text-[9px] text-[#D97706]">
                            대기
                          </span>
                        ) : null}
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

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editorMode === "edit" ? "일정 수정" : "일정 추가"}
            </DialogTitle>
            <DialogDescription>
              캘린더에 표시할 일정 정보를 입력하세요.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-foreground">
              <span>제목</span>
              <input
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, title: event.target.value }))
                }
                className="h-11 w-full rounded-xl border border-border bg-background px-4"
              />
            </label>

            <label className="space-y-2 text-sm text-foreground">
              <span>유형</span>
              <select
                value={draft.type}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    type: event.target.value as CalendarEvent["type"],
                  }))
                }
                className="h-11 w-full rounded-xl border border-border bg-background px-4"
              >
                <option value="meeting">대면 미팅</option>
                <option value="video">화상회의</option>
                <option value="call">전화</option>
                <option value="deadline">마감</option>
              </select>
            </label>

            <label className="space-y-2 text-sm text-foreground">
              <span>날짜</span>
              <input
                type="date"
                value={draft.date}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, date: event.target.value }))
                }
                className="h-11 w-full rounded-xl border border-border bg-background px-4"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-2 text-sm text-foreground">
                <span>시작</span>
                <input
                  type="time"
                  value={draft.startTime}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      startTime: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-border bg-background px-4"
                />
              </label>
              <label className="space-y-2 text-sm text-foreground">
                <span>종료</span>
                <input
                  type="time"
                  value={draft.endTime}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      endTime: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-border bg-background px-4"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm text-foreground md:col-span-2">
              <span>장소 또는 링크</span>
              <input
                value={draft.location}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, location: event.target.value }))
                }
                className="h-11 w-full rounded-xl border border-border bg-background px-4"
              />
            </label>

            <label className="space-y-2 text-sm text-foreground md:col-span-2">
              <span>참석자</span>
              <input
                value={draft.attendeesText}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    attendeesText: event.target.value,
                  }))
                }
                placeholder="이름을 쉼표로 구분하세요"
                className="h-11 w-full rounded-xl border border-border bg-background px-4"
              />
            </label>

            <label className="space-y-2 text-sm text-foreground md:col-span-2">
              <span>메모</span>
              <textarea
                rows={4}
                value={draft.notes}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, notes: event.target.value }))
                }
                className="w-full rounded-xl border border-border bg-background px-4 py-3"
              />
            </label>
          </div>

          <DialogFooter>
            <button
              type="button"
              className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground"
              onClick={() => setEditorOpen(false)}
            >
              취소
            </button>
            <button
              type="button"
              className="rounded-xl bg-[#1E2A3A] px-4 py-2 text-sm text-white"
              onClick={handleSaveEvent}
            >
              저장
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>일정을 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.title}" 일정은 캘린더에서 제거됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEvent}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
