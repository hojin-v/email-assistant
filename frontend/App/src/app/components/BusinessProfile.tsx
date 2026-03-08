import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Building2,
  FileText,
  Upload,
  X,
  Pencil,
  Trash2,
  Plus,
  AlertTriangle,
  Save,
  ArrowRight,
} from "lucide-react";

const toneOptions = [
  { id: "formal", label: "격식체" },
  { id: "neutral", label: "중립" },
  { id: "friendly", label: "친근한" },
];

interface UploadedFile {
  id: string;
  name: string;
  uploadDate: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export function BusinessProfile() {
  const navigate = useNavigate();
  const [businessType, setBusinessType] = useState("saas");
  const [tone, setTone] = useState("neutral");
  const [description, setDescription] = useState(
    "비즈니스 이메일 자동화 SaaS 플랫폼으로, AI 기반 이메일 응답 및 템플릿 생성 기능을 제공합니다."
  );
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    { id: "1", name: "비즈니스_매뉴얼.pdf", uploadDate: "2025.01.15" },
    { id: "2", name: "제품_가이드.docx", uploadDate: "2025.03.01" },
  ]);
  const [faqItems, setFAQItems] = useState<FAQItem[]>([
    {
      id: "1",
      question: "환불 정책은?",
      answer: "14일 이내 전액 환불 가능합니다.",
    },
    {
      id: "2",
      question: "기술 지원 시간은?",
      answer: "평일 09:00 ~ 18:00 (KST)",
    },
  ]);
  const [hasChanges, setHasChanges] = useState(true);

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(uploadedFiles.filter((f) => f.id !== id));
    setHasChanges(true);
  };

  const handleRemoveFAQ = (id: string) => {
    setFAQItems(faqItems.filter((f) => f.id !== id));
    setHasChanges(true);
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[#1E2A3A] mb-1">비즈니스 프로필</h1>
        <p className="text-[14px] text-[#64748B]">
          AI 템플릿 생성에 사용되는 비즈니스 정보를 관리합니다
        </p>
      </div>

      {/* Section 1: Company Profile */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-5 h-5 text-[#2DD4BF]" />
          <h3 className="text-[#1E2A3A]">회사 프로필</h3>
        </div>

        <div className="space-y-5">
          {/* Business Type */}
          <div>
            <label className="block text-[13px] text-[#1E2A3A] mb-2">
              업종 / 비즈니스 유형
            </label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E2A3A] outline-none focus:ring-2 focus:ring-[#2DD4BF]/30 focus:border-[#2DD4BF]"
            >
              <option value="saas">SaaS / 소프트웨어</option>
              <option value="ecommerce">이커머스</option>
              <option value="consulting">컨설팅</option>
              <option value="manufacturing">제조업</option>
              <option value="finance">금융 / 보험</option>
              <option value="healthcare">헬스케어</option>
              <option value="education">교육</option>
              <option value="other">기타</option>
            </select>
          </div>

          {/* Tone Selection */}
          <div>
            <label className="block text-[13px] text-[#1E2A3A] mb-2">
              이메일 어조
            </label>
            <div className="flex gap-2">
              {toneOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setTone(option.id)}
                  className={`px-4 py-2 rounded-lg text-[13px] transition-all ${
                    tone === option.id
                      ? "bg-[#2DD4BF] text-[#1E2A3A]"
                      : "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:border-[#CBD5E1]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product/Service Description */}
          <div>
            <label className="block text-[13px] text-[#1E2A3A] mb-2">
              제품/서비스 설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E2A3A] placeholder:text-[#94A3B8] outline-none focus:ring-2 focus:ring-[#2DD4BF]/30 focus:border-[#2DD4BF] resize-none"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-3 border-t border-[#E2E8F0]">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#1E2A3A] text-white rounded-lg text-[13px] hover:bg-[#2A3A4E] transition-colors">
              <Save className="w-4 h-4" />
              저장
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Business Materials */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <FileText className="w-5 h-5 text-[#2DD4BF]" />
          <h3 className="text-[#1E2A3A]">비즈니스 자료</h3>
        </div>

        {/* Uploaded Files */}
        <div className="mb-6">
          <h4 className="text-[13px] text-[#1E2A3A] mb-3">업로드된 파일</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] group hover:border-[#CBD5E1] transition-colors"
              >
                <FileText className="w-5 h-5 text-[#64748B]" />
                <span className="flex-1 text-[13px] text-[#1E2A3A]">
                  {file.name}
                </span>
                <span className="text-[11px] text-[#94A3B8]">
                  {file.uploadDate} 업로드
                </span>
                <button
                  onClick={() => handleRemoveFile(file.id)}
                  className="p-1.5 rounded-md hover:bg-[#FEF2F2] text-[#94A3B8] hover:text-[#EF4444] transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Add File Button */}
            <button className="w-full flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg border-2 border-dashed border-[#E2E8F0] hover:border-[#2DD4BF] hover:bg-[#2DD4BF]/5 transition-all text-left group">
              <div className="w-5 h-5 flex items-center justify-center text-[#94A3B8] group-hover:text-[#2DD4BF]">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-[13px] text-[#94A3B8] group-hover:text-[#1E2A3A] transition-colors">
                파일 추가
              </span>
            </button>
          </div>
        </div>

        {/* FAQ Items */}
        <div>
          <h4 className="text-[13px] text-[#1E2A3A] mb-3">
            FAQ / 매뉴얼 직접 입력
          </h4>
          <div className="space-y-2">
            {faqItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] group hover:border-[#CBD5E1] transition-colors"
              >
                <div className="flex-1">
                  <p className="text-[13px] text-[#1E2A3A] mb-1">
                    Q: {item.question}
                  </p>
                  <p className="text-[12px] text-[#64748B]">
                    A: {item.answer}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded-md hover:bg-white text-[#94A3B8] hover:text-[#1E2A3A] transition-all">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemoveFAQ(item.id)}
                    className="p-1.5 rounded-md hover:bg-[#FEF2F2] text-[#94A3B8] hover:text-[#EF4444] transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Add FAQ Button */}
            <button className="w-full flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-lg border-2 border-dashed border-[#E2E8F0] hover:border-[#2DD4BF] hover:bg-[#2DD4BF]/5 transition-all text-left group">
              <div className="w-5 h-5 flex items-center justify-center text-[#94A3B8] group-hover:text-[#2DD4BF]">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-[13px] text-[#94A3B8] group-hover:text-[#1E2A3A] transition-colors">
                항목 추가
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Material Change Warning Banner */}
      {hasChanges && (
        <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-xl p-5">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[14px] text-[#92400E] mb-1">
                비즈니스 자료가 변경되었습니다.
              </p>
              <p className="text-[12px] text-[#B45309]">
                영향받는 템플릿 8개가 있습니다.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-[#1E2A3A] text-white rounded-lg text-[13px] hover:bg-[#2A3A4E] transition-colors">
              템플릿 일괄 재생성
            </button>
            <button className="px-4 py-2 bg-white border border-[#E2E8F0] text-[#64748B] rounded-lg text-[13px] hover:bg-[#F8FAFC] transition-colors">
              개별 선택 후 재생성
            </button>
            <button
              onClick={() => setHasChanges(false)}
              className="px-4 py-2 text-[#64748B] rounded-lg text-[13px] hover:text-[#1E2A3A] transition-colors"
            >
              나중에
            </button>
          </div>
        </div>
      )}
      
      {/* Footer Link */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-1 text-[12px] text-[#94A3B8] hover:text-[#64748B] transition-colors"
        >
          초기 온보딩 설정 다시 보기
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}