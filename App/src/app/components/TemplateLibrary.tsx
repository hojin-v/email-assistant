import { useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  Filter,
  MoreHorizontal,
} from "lucide-react";

interface Template {
  id: string;
  subject: string;
  body: string;
  confidence: number;
  category: string;
  updatedAt: string;
}

const categories = [
  { id: "all", name: "전체", count: 24 },
  { id: "price", name: "가격문의", count: 5 },
  { id: "complaint", name: "불만접수", count: 4 },
  { id: "meeting", name: "미팅요청", count: 3 },
  { id: "tech", name: "기술지원", count: 4 },
  { id: "contract", name: "계약문의", count: 3 },
  { id: "shipping", name: "배송문의", count: 3 },
  { id: "refund", name: "환불요청", count: 2 },
];

const templates: Template[] = [
  {
    id: "1",
    subject: "가격 안내 드립니다 - {{제품명}} 관련",
    body: "안녕하세요, {{고객명}}님. 문의하신 {{제품명}}의 가격 정보를 안내드립니다. 현재 기본 플랜은 월 49,000원부터 시작하며...",
    confidence: 96,
    category: "가격문의",
    updatedAt: "2시간 전",
  },
  {
    id: "2",
    subject: "가격표 및 할인 조건 안내",
    body: "안녕하세요, {{고객명}}님. 요청하신 가격표를 첨부하여 보내드립니다. 연간 결제 시 20% 할인이 적용되며...",
    confidence: 92,
    category: "가격문의",
    updatedAt: "1일 전",
  },
  {
    id: "3",
    subject: "불편을 드려 죄송합니다 - {{이슈번호}} 관련",
    body: "안녕하세요, {{고객명}}님. 말씀하신 불편 사항에 대해 진심으로 사과드립니다. 담당 부서에서 즉시 확인 후...",
    confidence: 94,
    category: "불만접수",
    updatedAt: "3시간 전",
  },
  {
    id: "4",
    subject: "미팅 일정 확인 - {{날짜}} {{시간}}",
    body: "안녕하세요, {{고객명}}님. 요청하신 미팅 일정을 아래와 같이 확인드립니다. 일시: {{날짜}} {{시간}}...",
    confidence: 89,
    category: "미팅요청",
    updatedAt: "5시간 전",
  },
  {
    id: "5",
    subject: "기술 지원 요청 접수 완료 - 티켓 #{{티켓번호}}",
    body: "안녕하세요, {{고객명}}님. 기술 지원 요청이 정상적으로 접수되었습니다. 담당 엔지니어가 배정되어 24시간 이내에...",
    confidence: 91,
    category: "기술지원",
    updatedAt: "1일 전",
  },
  {
    id: "6",
    subject: "계약 조건 검토 결과 안내",
    body: "안녕하세요, {{고객명}}님. 요청하신 계약 조건 검토가 완료되었습니다. 주요 변경 사항은 아래와 같습니다...",
    confidence: 87,
    category: "계약문의",
    updatedAt: "2일 전",
  },
  {
    id: "7",
    subject: "배송 현황 안내 - 주문번호 {{주문번호}}",
    body: "안녕하세요, {{고객명}}님. 주문하신 상품의 배송 현황을 안내드립니다. 현재 배송 중이며 {{예상일자}}에...",
    confidence: 93,
    category: "배송문의",
    updatedAt: "4시간 전",
  },
  {
    id: "8",
    subject: "환불 처리 완료 안내",
    body: "안녕하세요, {{고객명}}님. 요청하신 환불 처리가 완료되었습니다. 환불 금액은 {{금액}}원이며, 영업일 기준 3-5일...",
    confidence: 95,
    category: "환불요청",
    updatedAt: "6시간 전",
  },
];

const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 animate-pulse">
    <div className="h-4 bg-[#F1F5F9] rounded w-3/4 mb-3" />
    <div className="h-3 bg-[#F1F5F9] rounded w-full mb-2" />
    <div className="h-3 bg-[#F1F5F9] rounded w-2/3 mb-4" />
    <div className="flex justify-between items-center">
      <div className="h-5 bg-[#F1F5F9] rounded w-16" />
      <div className="flex gap-2">
        <div className="h-7 w-7 bg-[#F1F5F9] rounded" />
        <div className="h-7 w-7 bg-[#F1F5F9] rounded" />
      </div>
    </div>
  </div>
);

export function TemplateLibrary() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);

  const filteredTemplates = templates.filter((t) => {
    const matchesCategory =
      activeCategory === "all" || t.category === categories.find((c) => c.id === activeCategory)?.name;
    const matchesSearch =
      !searchQuery ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getConfidenceColor = (score: number) => {
    if (score >= 95) return "bg-[#10B981]/10 text-[#10B981]";
    if (score >= 90) return "bg-[#2DD4BF]/10 text-[#0D9488]";
    if (score >= 85) return "bg-[#F59E0B]/10 text-[#D97706]";
    return "bg-[#94A3B8]/10 text-[#64748B]";
  };

  const handleToggleLoading = () => {
    setIsLoading(true);
    setShowEmpty(false);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="flex h-full w-full min-h-0 min-w-0 overflow-hidden bg-background">
      {/* Left sidebar - categories */}
      <div className="scrollbar-none hidden w-[240px] shrink-0 overflow-y-auto border-r border-[#E2E8F0] bg-white p-4 lg:block">
        <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider mb-3 px-3">
          카테고리
        </p>
        <div className="space-y-0.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setShowEmpty(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-colors ${
                activeCategory === cat.id
                  ? "bg-[#1E2A3A] text-white"
                  : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E2A3A]"
              }`}
            >
              <span>{cat.name}</span>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                  activeCategory === cat.id
                    ? "bg-white/20 text-white"
                    : "bg-[#F1F5F9] text-[#94A3B8]"
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
        {/* Top bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="템플릿 검색..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E2A3A] placeholder:text-[#94A3B8] outline-none focus:ring-2 focus:ring-[#2DD4BF]/30 focus:border-[#2DD4BF]"
            />
          </div>

          {/* Mobile category filter */}
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="lg:hidden px-3 py-2.5 bg-white border border-[#E2E8F0] rounded-lg text-[13px] text-[#1E2A3A]"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <button className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-lg text-[13px] text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
            <Filter className="w-4 h-4" />
            필터
          </button>

          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#2DD4BF] text-[#1E2A3A] rounded-lg hover:bg-[#14B8A6] transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[13px] hidden sm:inline">새 템플릿 생성</span>
          </button>
        </div>

        {/* Loading skeleton state */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {showEmpty && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-[#CBD5E1]" />
            </div>
            <h3 className="text-[#1E2A3A] mb-2">템플릿이 없습니다</h3>
            <p className="text-[13px] text-[#94A3B8] mb-6 max-w-[320px]">
              이 카테고리에는 아직 생성된 템플릿이 없습니다. AI를 활용하여 새
              템플릿을 생성해 보세요.
            </p>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#2DD4BF] text-[#1E2A3A] rounded-lg hover:bg-[#14B8A6] transition-colors">
              <Plus className="w-4 h-4" />
              <span className="text-[13px]">첫 번째 템플릿 생성</span>
            </button>
          </div>
        )}

        {/* Template cards */}
        {!isLoading && !showEmpty && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-xl border border-[#E2E8F0] p-5 hover:shadow-md hover:border-[#CBD5E1] transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="inline-flex px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[11px] text-[#64748B]">
                    {template.category}
                  </span>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[#94A3B8] hover:text-[#64748B]">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="text-[14px] text-[#1E2A3A] mb-2 line-clamp-1">
                  {template.subject}
                </h4>
                <p className="text-[12px] text-[#94A3B8] line-clamp-2 mb-4 min-h-[36px]">
                  {template.body}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9]">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ${getConfidenceColor(
                      template.confidence
                    )}`}
                  >
                    {template.confidence}% 정확도
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded-md hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#1E2A3A] transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-[#FEF2F2] text-[#94A3B8] hover:text-[#EF4444] transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-[#CBD5E1] mt-2">
                  {template.updatedAt} 수정됨
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
