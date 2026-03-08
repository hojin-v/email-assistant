import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  ExternalLink,
  Calendar,
  ChevronRight,
} from "lucide-react";

const connectedAccounts = [
  {
    id: "1",
    type: "Gmail",
    email: "support@mycompany.co.kr",
    status: "connected",
    icon: "G",
    color: "#EA4335",
  },
  {
    id: "2",
    type: "Outlook",
    email: "info@mycompany.co.kr",
    status: "connected",
    icon: "O",
    color: "#0078D4",
  },
];

interface CategoryRule {
  id: string;
  name: string;
  keywords: string[];
  template: string;
  autoSend: boolean;
  color: string;
}

const initialRules: CategoryRule[] = [
  {
    id: "1",
    name: "가격문의",
    keywords: ["가격", "요금", "플랜", "할인", "견적"],
    template: "가격 안내 템플릿",
    autoSend: false,
    color: "#3B82F6",
  },
  {
    id: "2",
    name: "불만접수",
    keywords: ["불만", "지연", "오류", "불편", "사과"],
    template: "불만 대응 템플릿",
    autoSend: false,
    color: "#EF4444",
  },
  {
    id: "3",
    name: "미팅요청",
    keywords: ["미팅", "회의", "일정", "약속", "화상"],
    template: "미팅 일정 확인 템플릿",
    autoSend: true,
    color: "#8B5CF6",
  },
  {
    id: "4",
    name: "기술지원",
    keywords: ["기술", "버그", "오류", "설치", "연동"],
    template: "기술 지원 접수 템플릿",
    autoSend: false,
    color: "#F59E0B",
  },
  {
    id: "5",
    name: "계약문의",
    keywords: ["계약", "서명", "갱신", "해지", "조건"],
    template: "계약 안내 템플릿",
    autoSend: false,
    color: "#10B981",
  },
  {
    id: "6",
    name: "배송문의",
    keywords: ["배송", "주문", "택배", "도착", "추적"],
    template: "배송 현황 안내 템플릿",
    autoSend: true,
    color: "#EC4899",
  },
];

export function AutomationSettings() {
  const [rules, setRules] = useState(initialRules);
  const [autoCalendar, setAutoCalendar] = useState(true);
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(true);

  const toggleAutoSend = (id: string) => {
    setRules(
      rules.map((r) => (r.id === id ? { ...r, autoSend: !r.autoSend } : r))
    );
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1200px] mx-auto">
      <div className="mb-8">
        <h1 className="text-[#1E2A3A] mb-1">자동화 설정</h1>
        <p className="text-[14px] text-[#64748B]">
          이메일 자동화의 동작 방식과 연결 계정을 관리합니다
        </p>
      </div>

      {/* Category Rules Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
          <h3 className="text-[#1E2A3A]">카테고리 규칙</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1E2A3A] text-white rounded-lg text-[13px] hover:bg-[#2A3A4E] transition-colors">
            <Plus className="w-4 h-4" />
            규칙 추가
          </button>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC]">
                <th className="text-left px-6 py-3 text-[11px] text-[#94A3B8] uppercase tracking-wider">
                  카테고리
                </th>
                <th className="text-left px-6 py-3 text-[11px] text-[#94A3B8] uppercase tracking-wider">
                  매칭 키워드
                </th>
                <th className="text-left px-6 py-3 text-[11px] text-[#94A3B8] uppercase tracking-wider">
                  지정 템플릿
                </th>
                <th className="text-center px-6 py-3 text-[11px] text-[#94A3B8] uppercase tracking-wider">
                  자동 발송
                </th>
                <th className="text-right px-6 py-3 text-[11px] text-[#94A3B8] uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-[#FAFBFC] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: rule.color }}
                      />
                      <span className="text-[13px] text-[#1E2A3A]">
                        {rule.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {rule.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="px-2 py-0.5 bg-[#F1F5F9] rounded text-[11px] text-[#64748B]"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[13px] text-[#64748B]">
                      {rule.template}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleAutoSend(rule.id)}
                      className={`relative w-10 h-5.5 rounded-full transition-colors ${
                        rule.autoSend ? "bg-[#2DD4BF]" : "bg-[#CBD5E1]"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform ${
                          rule.autoSend ? "left-5" : "left-0.5"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-md hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#1E2A3A] transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-[#FEF2F2] text-[#94A3B8] hover:text-[#EF4444] transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-[#F1F5F9]">
          {rules.map((rule) => (
            <div key={rule.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: rule.color }}
                  />
                  <span className="text-[14px] text-[#1E2A3A]">
                    {rule.name}
                  </span>
                </div>
                <button
                  onClick={() => toggleAutoSend(rule.id)}
                  className={`relative w-10 h-5.5 rounded-full transition-colors ${
                    rule.autoSend ? "bg-[#2DD4BF]" : "bg-[#CBD5E1]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform ${
                      rule.autoSend ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {rule.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="px-2 py-0.5 bg-[#F1F5F9] rounded text-[11px] text-[#64748B]"
                  >
                    {kw}
                  </span>
                ))}
              </div>
              <p className="text-[12px] text-[#94A3B8]">{rule.template}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Rules */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 mt-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[#1E2A3A]">캘린더 연동</h3>
          {!googleCalendarConnected && (
            <button className="flex items-center gap-2 px-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[13px] text-[#64748B] hover:bg-[#F1F5F9] transition-colors">
              <Plus className="w-4 h-4" />
              Google 캘린더 연결
            </button>
          )}
        </div>

        <div className="space-y-3">
          {/* Google Calendar Connection Status */}
          {googleCalendarConnected ? (
            <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#4285F4] text-white text-[14px]">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] text-[#1E2A3A]">
                    Google Calendar
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[10px] text-[#10B981]">
                    연결됨
                  </span>
                </div>
                <p className="text-[12px] text-[#94A3B8] truncate">
                  calendar@mycompany.co.kr
                </p>
              </div>
              <button className="p-2 text-[#94A3B8] hover:text-[#64748B] transition-colors">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0]">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#E2E8F0] text-[#94A3B8]">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] text-[#94A3B8]">
                  Google 캘린더를 연결하세요
                </p>
                <p className="text-[11px] text-[#CBD5E1]">
                  일정 자동 등록 기능을 사용하려면 캘린더 연동이 필요합니다
                </p>
              </div>
            </div>
          )}

          {/* Auto Registration Settings - Only show when connected */}
          {googleCalendarConnected && (
            <>
              <div className="pt-3 border-t border-[#E2E8F0]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-[13px] text-[#1E2A3A] mb-1">
                      일정 자동 등록
                    </h4>
                    <p className="text-[11px] text-[#94A3B8]">
                      미팅 요청 및 일정 관련 이메일을 자동으로 Google 캘린더에 등록합니다
                    </p>
                  </div>
                  <button
                    onClick={() => setAutoCalendar(!autoCalendar)}
                    className={`relative w-10 h-5.5 rounded-full transition-colors ${
                      autoCalendar ? "bg-[#2DD4BF]" : "bg-[#CBD5E1]"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform ${
                        autoCalendar ? "left-5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>

                {/* Category selection when enabled */}
                {autoCalendar && (
                  <div className="mt-3 p-3 bg-white rounded-lg border border-[#E2E8F0]">
                    <p className="text-[11px] text-[#64748B] uppercase tracking-wide mb-2">
                      자동 등록 카테고리
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-1 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-md text-[11px] flex items-center gap-1.5">
                        <Check className="w-3 h-3" />
                        미팅요청
                      </span>
                      <button className="px-2.5 py-1 bg-[#F1F5F9] text-[#64748B] rounded-md text-[11px] hover:bg-[#E2E8F0] transition-colors">
                        + 카테고리 추가
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}