import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  FileText,
  Tags,
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  Plus,
  Check,
  Sparkles,
  Loader2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  businessTypeOptions,
  categoryColorPalette,
  getBusinessTypeLabel,
  getRecommendedCategoriesForDomain,
  recommendedCategoryOptions,
  type RecommendedCategoryOption,
} from "../../shared/config/onboarding-options";

const toneOptions = [
  {
    id: "formal",
    label: "격식체",
    desc: "존경어를 사용한 공식적인 어조",
    emoji: "🏢",
  },
  {
    id: "neutral",
    label: "중립",
    desc: "자연스럽고 균형 잡힌 어조",
    emoji: "⚖️",
  },
  {
    id: "friendly",
    label: "친근한",
    desc: "따뜻하고 친절한 어조",
    emoji: "😊",
  },
];

const steps = [
  { icon: Building2, label: "회사 프로필" },
  { icon: FileText, label: "비즈니스 자료" },
  { icon: Tags, label: "이메일 카테고리" },
];

export function OnboardingWizard() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const generationTimeoutsRef = useRef<number[]>([]);
  const categoryComposerRef = useRef<HTMLDivElement | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [tone, setTone] = useState("neutral");
  const [businessType, setBusinessType] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [faqText, setFaqText] = useState("");
  const [categories, setCategories] = useState<RecommendedCategoryOption[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [templateProgress, setTemplateProgress] = useState(0);

  const clearGenerationTimeouts = () => {
    generationTimeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    generationTimeoutsRef.current = [];
  };

  useEffect(() => clearGenerationTimeouts, []);

  useEffect(() => {
    setCategories(getRecommendedCategoriesForDomain(businessType));
    setNewCategory("");
    setCategoryDropdownOpen(false);
  }, [businessType]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!categoryComposerRef.current?.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const availableCategorySuggestions = recommendedCategoryOptions.filter(
    (option) => !categories.some((category) => category.name === option.name),
  );

  const groupedCategorySuggestions = useMemo(
    () =>
      businessTypeOptions
        .map((option) => ({
          businessType: option,
          items: availableCategorySuggestions.filter(
            (category) => category.domain === option.value,
          ),
        }))
        .filter((group) => group.items.length > 0),
    [availableCategorySuggestions],
  );

  const handleUploadedFiles = (files: FileList | null) => {
    const nextFile = files?.[0];

    if (!nextFile) {
      return;
    }

    setUploadedFile(nextFile.name);
    toast.success(`${nextFile.name} 파일을 추가했습니다.`);
  };

  const handleStartGeneration = () => {
    clearGenerationTimeouts();
    setIsGenerating(true);
    setGenerationStep(0);
    setTemplateProgress(0);

    generationTimeoutsRef.current = [
      window.setTimeout(() => setGenerationStep(1), 800),
      window.setTimeout(() => setGenerationStep(2), 1600),
      window.setTimeout(() => setTemplateProgress(1), 2000),
      window.setTimeout(() => setTemplateProgress(2), 2400),
      window.setTimeout(() => setTemplateProgress(3), 2800),
      window.setTimeout(() => setTemplateProgress(4), 3200),
      window.setTimeout(() => setTemplateProgress(5), 3600),
      window.setTimeout(() => setGenerationStep(3), 4000),
      window.setTimeout(() => {
        setIsGenerating(false);
        setIsCompleted(true);
      }, 5000),
    ];
  };

  const handleCancelGeneration = () => {
    clearGenerationTimeouts();
    setIsGenerating(false);
    setGenerationStep(0);
    setTemplateProgress(0);
    toast.message("템플릿 생성은 나중에 다시 시작할 수 있습니다.");
    navigate("/app");
  };

  const handleRemoveCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  const handleAddCategory = () => {
    const categoryName = newCategory.trim();

    if (categoryName) {
      if (categories.some((category) => category.name === categoryName)) {
        toast.error("이미 추가된 카테고리입니다.");
        return;
      }

      const recommendedCategory = availableCategorySuggestions.find(
        (option) => option.name === categoryName,
      );

      setCategories([
        ...categories,
        recommendedCategory ?? {
          id: Date.now().toString(),
          name: categoryName,
          domain: businessType || "사용자 정의",
          color: categoryColorPalette[Math.floor(Math.random() * categoryColorPalette.length)],
        },
      ]);
      setNewCategory("");
      setCategoryDropdownOpen(false);
    }
  };

  const handleSelectSuggestedCategory = (category: RecommendedCategoryOption) => {
    setCategories((current) => [...current, category]);
    setNewCategory("");
    setCategoryDropdownOpen(false);
  };

  return (
    <div className="p-4 lg:p-8 max-w-[900px] mx-auto">
      <div className="mb-8">
        <h1 className="text-[#1E2A3A] mb-1">온보딩 설정</h1>
        <p className="text-[14px] text-[#64748B]">
          이메일 자동화를 시작하기 위한 초기 설정을 진행합니다
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => setCurrentStep(i)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg w-full transition-all ${
                i === currentStep
                  ? "bg-[#1E2A3A] text-white shadow-lg shadow-[#1E2A3A]/20"
                  : i < currentStep
                  ? "bg-[#2DD4BF]/10 text-[#0D9488]"
                  : "bg-white text-[#94A3B8] border border-[#E2E8F0]"
              }`}
            >
              {i < currentStep ? (
                <Check className="w-4 h-4 shrink-0" />
              ) : (
                <step.icon className="w-4 h-4 shrink-0" />
              )}
              <span className="text-[13px] hidden sm:inline">{step.label}</span>
            </button>
            {i < steps.length - 1 && (
              <ChevronRight className="w-4 h-4 text-[#CBD5E1] shrink-0 hidden sm:block" />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-6 lg:p-8">
        {currentStep === 0 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-[#1E2A3A] mb-1">회사 프로필 설정</h3>
              <p className="text-[13px] text-[#94A3B8]">
                AI가 맞춤형 이메일 응답을 생성하기 위한 기본 정보입니다
              </p>
            </div>

            <div>
              <label className="block text-[13px] text-[#1E2A3A] mb-2">
                업종 / 비즈니스 유형
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E2A3A] outline-none focus:ring-2 focus:ring-[#2DD4BF]/30 focus:border-[#2DD4BF]"
              >
                <option value="">선택하세요</option>
                {businessTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] text-[#1E2A3A] mb-2">
                제품/서비스 설명
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="고객에게 제공하는 주요 제품이나 서비스를 설명해 주세요. 이 정보를 바탕으로 AI가 적절한 이메일 응답을 생성합니다."
                rows={5}
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E2A3A] placeholder:text-[#94A3B8] outline-none focus:ring-2 focus:ring-[#2DD4BF]/30 focus:border-[#2DD4BF] resize-none"
              />
            </div>

            <div>
              <label className="block text-[13px] text-[#1E2A3A] mb-3">
                이메일 어조 선택
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {toneOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setTone(option.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      tone === option.id
                        ? "border-[#2DD4BF] bg-[#2DD4BF]/5"
                        : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                    }`}
                  >
                    <span className="text-[20px] mb-2 block">
                      {option.emoji}
                    </span>
                    <p className="text-[14px] text-[#1E2A3A] mb-0.5">
                      {option.label}
                    </p>
                    <p className="text-[12px] text-[#94A3B8]">{option.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-[#1E2A3A] mb-1">비즈니스 자료 업로드</h3>
              <p className="text-[13px] text-[#94A3B8]">
                비즈니스 매뉴얼이나 FAQ 문서를 업로드하면 더 정확한 응답을
                생성합니다
              </p>
            </div>

            {/* Drag & drop zone */}
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          handleUploadedFiles(e.dataTransfer.files);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
                          isDragging
                            ? "border-[#2DD4BF] bg-[#2DD4BF]/5"
                            : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          className="hidden"
                          onChange={(e) => handleUploadedFiles(e.target.files)}
                        />
                        <Upload className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
                        <p className="text-[14px] text-[#1E2A3A] mb-1">
                          파일을 여기에 드래그하거나 클릭하여 업로드
              </p>
              <p className="text-[12px] text-[#94A3B8]">
                PDF, DOCX, TXT 형식 지원 (최대 10MB)
              </p>
            </div>

            {uploadedFile && (
              <div className="flex items-center gap-3 p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg">
                <FileText className="w-5 h-5 text-[#10B981]" />
                <span className="flex-1 text-[13px] text-[#1E2A3A]">
                  {uploadedFile}
                </span>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="text-[#94A3B8] hover:text-[#EF4444]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="relative">
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-[#E2E8F0]" />
                <span className="text-[12px] text-[#94A3B8]">또는</span>
                <div className="flex-1 h-px bg-[#E2E8F0]" />
              </div>
            </div>

            <div>
              <label className="block text-[13px] text-[#1E2A3A] mb-2">
                FAQ / 매뉴얼 내용 직접 입력
              </label>
              <textarea
                value={faqText}
                onChange={(e) => setFaqText(e.target.value)}
                placeholder={`Q: 환불 정책은 어떻게 되나요?\nA: 구매 후 14일 이내에 환불 요청이 가능하며, 사용 이력이 없는 경우 전액 환불됩니다.\n\nQ: 기술 지원 운영 시간은?\nA: 평일 09:00 ~ 18:00 (KST) 동안 기술 지원팀이 운영됩니다.`}
                rows={8}
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E2A3A] placeholder:text-[#94A3B8] outline-none focus:ring-2 focus:ring-[#2DD4BF]/30 focus:border-[#2DD4BF] resize-none"
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-[#1E2A3A]">이메일 카테고리 설정</h3>
                <span className="flex items-center gap-1 px-2 py-0.5 bg-[#2DD4BF]/10 rounded-full text-[11px] text-[#0D9488]">
                  <Sparkles className="w-3 h-3" />
                  AI 추천
                </span>
              </div>
              <p className="text-[13px] text-[#94A3B8]">
                선택한 업종 / 비즈니스 유형에 해당하는 카테고리는 기본 등록되며, 다른 업종의 카테고리도 추가할 수 있습니다.
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-[13px] text-[#64748B]">
              선택한 업종 / 비즈니스 유형:{" "}
              <span className="font-medium text-[#1E2A3A]">
                {businessType ? getBusinessTypeLabel(businessType) : "아직 선택되지 않음"}
              </span>
            </div>

            {categories.length ? (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg group hover:border-[#CBD5E1] transition-colors"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="rounded-full bg-[#F8FAFC] px-2 py-0.5 text-[10px] font-medium text-[#64748B]">
                      {getBusinessTypeLabel(cat.domain)}
                    </span>
                    <span className="text-[13px] text-[#1E2A3A]">{cat.name}</span>
                    <button
                      onClick={() => handleRemoveCategory(cat.id)}
                      className="text-[#CBD5E1] hover:text-[#EF4444] transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
                <div className="rounded-xl border border-dashed border-[#D7E0EB] bg-[#F8FAFC] px-4 py-6 text-center text-[13px] text-[#94A3B8]">
                  먼저 회사 프로필 단계에서 업종 / 비즈니스 유형을 선택하면 해당 업종의 추천 카테고리가 표시됩니다.
                </div>
            )}

            <div ref={categoryComposerRef} className="relative space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                  onFocus={() => setCategoryDropdownOpen(true)}
                  onClick={() => setCategoryDropdownOpen(true)}
                  placeholder="새 카테고리 추가..."
                  className="flex-1 px-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[14px] text-[#1E2A3A] placeholder:text-[#94A3B8] outline-none focus:ring-2 focus:ring-[#2DD4BF]/30 focus:border-[#2DD4BF]"
                />
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2.5 bg-[#1E2A3A] text-white rounded-lg hover:bg-[#2A3A4E] transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-[13px] hidden sm:inline">추가</span>
                </button>
              </div>
              {categoryDropdownOpen ? (
                <div className="scrollbar-soft absolute left-0 right-0 top-full z-20 mt-2 max-h-[320px] overflow-y-auto rounded-xl border border-[#E2E8F0] bg-white p-3 shadow-xl">
                  <p className="mb-3 text-[12px] font-medium text-[#64748B]">
                    추천 카테고리
                  </p>
                  {groupedCategorySuggestions.length ? (
                    <div className="space-y-3">
                      {groupedCategorySuggestions.map((group) => (
                        <div key={group.businessType.value}>
                          <p className="mb-2 text-[11px] font-semibold text-[#94A3B8]">
                            {group.businessType.label}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {group.items.map((option) => (
                              <button
                                key={option.id}
                                type="button"
                                className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-[12px] text-[#1E2A3A] transition hover:border-[#2DD4BF] hover:bg-[#F0FDFA]"
                                onClick={() => handleSelectSuggestedCategory(option)}
                              >
                                {option.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12px] text-[#94A3B8]">
                      추천할 카테고리가 더 없습니다. 직접 입력해서 추가할 수 있습니다.
                    </p>
                  )}
                </div>
              ) : null}
              <p className="text-[12px] text-[#94A3B8]">
                입력창을 클릭하면 아직 추가하지 않은 다른 업종의 추천 카테고리도 함께 표시됩니다. 직접 입력해서 임의 카테고리를 추가할 수도 있습니다.
              </p>
            </div>

            {/* Preview */}
            <div className="bg-[#F8FAFC] rounded-xl p-5 border border-[#E2E8F0]">
              <p className="text-[13px] text-[#64748B] mb-3">
                카테고리 미리보기
              </p>
                        <div className="scrollbar-soft max-h-[320px] space-y-2 overflow-y-auto pr-1">
                          {categories.map((cat) => (
                            <div
                              key={cat.id}
                              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#E2E8F0]"
                            >
                              <span
                                className="w-1 h-8 rounded-full"
                                style={{ backgroundColor: cat.color }}
                              />
                              <div className="flex-1">
                                <p className="text-[13px] text-[#1E2A3A]">{cat.name}</p>
                                <p className="text-[11px] text-[#94A3B8]">
                                  {getBusinessTypeLabel(cat.domain)} 기준 추천 카테고리
                                </p>
                              </div>
                              <span className="text-[11px] text-[#94A3B8]">
                                템플릿 0개
                              </span>
                            </div>
                          ))}
                          {!categories.length ? (
                            <div className="rounded-lg border border-dashed border-[#D7E0EB] bg-white px-4 py-5 text-center text-[12px] text-[#94A3B8]">
                              선택된 업종 / 비즈니스 유형이 없어서 미리보기를 표시할 수 없습니다.
                            </div>
                          ) : null}
                        </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {!isGenerating && !isCompleted && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] transition-colors ${
              currentStep === 0
                ? "text-[#CBD5E1] cursor-not-allowed"
                : "text-[#64748B] hover:text-[#1E2A3A] hover:bg-white border border-[#E2E8F0]"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            이전
          </button>
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentStep ? "bg-[#2DD4BF]" : "bg-[#E2E8F0]"
                }`}
              />
            ))}
          </div>
          {currentStep === steps.length - 1 ? (
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={handleStartGeneration}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] bg-[#2DD4BF] text-[#1E2A3A] hover:bg-[#14B8A6] transition-colors"
              >
                템플릿 생성 시작
                <ChevronRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-[#94A3B8] text-right max-w-[300px]">
                설정한 카테고리를 기반으로 AI가 맞춤 템플릿을 자동 생성합니다
              </p>
            </div>
          ) : (
            <button
              onClick={() =>
                setCurrentStep(Math.min(steps.length - 1, currentStep + 1))
              }
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] bg-[#1E2A3A] text-white hover:bg-[#2A3A4E] transition-colors"
            >
              다음
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Template Generation Loading Screen */}
      {isGenerating && (
        <div className="fixed inset-0 bg-[#F8FAFC] flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-8 max-w-[500px] w-full mx-4">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#2DD4BF]/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#2DD4BF] animate-spin" />
              </div>
            </div>

            <h2 className="text-[#1E2A3A] text-center mb-2">
              맞춤 템플릿을 생성하고 있습니다
            </h2>
            <p className="text-[13px] text-[#94A3B8] text-center mb-8">
              입력하신 비즈니스 정보를 분석하여 카테고리별 템플릿을 만들고 있습니다
            </p>

            {/* Progress Steps */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                {generationStep > 0 ? (
                  <Check className="w-5 h-5 text-[#2DD4BF] shrink-0 mt-0.5" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-[#E2E8F0] shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`text-[13px] ${generationStep > 0 ? "text-[#1E2A3A]" : "text-[#94A3B8]"}`}>
                    회사 프로필 분석 완료
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                {generationStep > 1 ? (
                  <Check className="w-5 h-5 text-[#2DD4BF] shrink-0 mt-0.5" />
                ) : generationStep === 1 ? (
                  <Loader2 className="w-5 h-5 text-[#2DD4BF] animate-spin shrink-0 mt-0.5" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-[#E2E8F0] shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`text-[13px] ${generationStep > 1 ? "text-[#1E2A3A]" : generationStep === 1 ? "text-[#1E2A3A]" : "text-[#94A3B8]"}`}>
                    비즈니스 자료 학습 완료
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                {generationStep > 2 ? (
                  <Check className="w-5 h-5 text-[#2DD4BF] shrink-0 mt-0.5" />
                ) : generationStep === 2 ? (
                  <Loader2 className="w-5 h-5 text-[#2DD4BF] animate-spin shrink-0 mt-0.5" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-[#E2E8F0] shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`text-[13px] mb-2 ${generationStep >= 2 ? "text-[#1E2A3A]" : "text-[#94A3B8]"}`}>
                    카테고리별 템플릿 생성 중
                  </p>
                  {generationStep === 2 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#64748B]">가격문의</span>
                        <span className="text-[#94A3B8]">{templateProgress}/5</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2DD4BF] transition-all duration-300"
                          style={{ width: `${(templateProgress / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                {generationStep > 3 ? (
                  <Check className="w-5 h-5 text-[#2DD4BF] shrink-0 mt-0.5" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-[#E2E8F0] shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`text-[13px] ${generationStep > 3 ? "text-[#1E2A3A]" : "text-[#94A3B8]"}`}>
                    키워드 및 분류 규칙 설정
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mb-4">
              <p className="text-[12px] text-[#94A3B8]">약 30초~1분 소요됩니다</p>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleCancelGeneration}
                className="text-[12px] text-[#94A3B8] hover:text-[#64748B] transition-colors"
              >
                취소하고 나중에 설정하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Generation Complete Screen */}
      {isCompleted && (
        <div className="fixed inset-0 bg-[#F8FAFC] flex items-center justify-center z-50">
          <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-8 max-w-[600px] w-full mx-4">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-[#2DD4BF]/10 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-[#2DD4BF]" />
              </div>
            </div>

            <h2 className="text-[#1E2A3A] text-center mb-2">
              {categories.length * 3}개의 템플릿이 생성되었습니다
            </h2>
            <p className="text-[13px] text-[#94A3B8] text-center mb-8">
              카테고리별 템플릿을 확인하고 필요시 수정해보세요
            </p>

            {/* Category Chips Summary */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {categories.slice(0, 6).map((cat) => (
                <div
                  key={cat.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-[12px] text-[#64748B]">
                    {cat.name} 3개
                  </span>
                </div>
              ))}
            </div>

            {/* Info Box */}
            <div className="p-4 bg-[#2DD4BF]/5 border border-[#2DD4BF]/20 rounded-lg mb-8">
              <p className="text-[12px] text-[#0D9488] leading-relaxed">
                💡 템플릿은 언제든지 수정하거나 새로 추가할 수 있습니다.
                비즈니스 자료가 변경되면 템플릿을 재생성할 수 있습니다.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/app/templates")}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-[#2DD4BF] text-[#1E2A3A] rounded-lg hover:bg-[#14B8A6] transition-colors"
              >
                템플릿 확인하기
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("/app/settings")}
                className="flex-1 px-5 py-3 bg-white border border-[#E2E8F0] text-[#64748B] rounded-lg hover:bg-[#F8FAFC] transition-colors"
              >
                이메일 계정 연결하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
