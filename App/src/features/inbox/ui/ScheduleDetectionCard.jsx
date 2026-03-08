import { CalendarDays, Clock3, MapPin, Sparkles, Users } from "lucide-react";

export function ScheduleDetectionCard({ schedule }) {
  if (!schedule?.detected) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[#E9D5FF] bg-[#FAF5FF] p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-[#8B5CF6]">
        <Sparkles className="h-4 w-4" />
        AI가 일정 정보를 감지했습니다
      </p>

      <div className="mt-4">
        <h3 className="text-base font-semibold text-[#1E2A3A]">{schedule.title}</h3>

        <div className="mt-4 space-y-2 text-sm text-[#64748B]">
          <p className="flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            {schedule.suggestedDate} {schedule.suggestedTime} ({schedule.duration})
          </p>
          <p className="flex items-center gap-2">
            {schedule.type === "video" ? <CalendarDays className="h-4 w-4" /> : <Users className="h-4 w-4" />}
            {schedule.type === "video" ? "화상회의" : "오프라인 미팅"}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {schedule.location}
          </p>
          <p className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {schedule.attendees.join(", ")}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" className="rounded-xl bg-[#8B5CF6] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#7C3AED]">
          캘린더에 추가
        </button>
        <button type="button" className="rounded-xl border border-[#D8B4FE] bg-white px-4 py-2 text-xs font-medium text-[#8B5CF6] transition hover:bg-[#F5F3FF]">
          내용 수정 후 추가
        </button>
        <button type="button" className="rounded-xl px-1 py-2 text-xs font-medium text-[#94A3B8] transition hover:text-[#64748B]">
          이 이메일에서 무시
        </button>
      </div>
    </div>
  );
}
