import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  Building2,
  FileText,
  Pencil,
  Trash2,
  Plus,
  AlertTriangle,
  Save,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { businessTypeOptions } from "../../shared/config/onboarding-options";
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

interface FAQDraft {
  question: string;
  answer: string;
}

const impactedTemplates = [
  "가격 안내 템플릿",
  "미팅 일정 확인 템플릿",
  "기술 지원 접수 템플릿",
  "계약 안내 템플릿",
];

const emptyFaqDraft: FAQDraft = {
  question: "",
  answer: "",
};

export function BusinessProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [businessType, setBusinessType] = useState("Sales");
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
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqDraft, setFaqDraft] = useState<FAQDraft>(emptyFaqDraft);
  const [faqDeleteTarget, setFaqDeleteTarget] = useState<FAQItem | null>(null);
  const [regenerateMode, setRegenerateMode] = useState<"bulk" | "select" | null>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([
    impactedTemplates[0],
    impactedTemplates[1],
  ]);

  const impactedCount = useMemo(
    () => impactedTemplates.length + uploadedFiles.length + faqItems.length - 2,
    [faqItems.length, uploadedFiles.length]
  );

  const markChanged = () => setHasChanges(true);

  const handleSaveProfile = () => {
    setHasChanges(false);
    toast.success("비즈니스 프로필을 저장했습니다.");
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles((current) => current.filter((file) => file.id !== id));
    markChanged();
    toast.success("파일을 제거했습니다.");
  };

  const openFaqDialog = (item?: FAQItem) => {
    setEditingFaqId(item?.id || null);
    setFaqDraft(
      item
        ? { question: item.question, answer: item.answer }
        : emptyFaqDraft
    );
    setFaqDialogOpen(true);
  };

  const handleSaveFaq = () => {
    if (!faqDraft.question.trim() || !faqDraft.answer.trim()) {
      toast.error("질문과 답변을 모두 입력하세요.");
      return;
    }

    if (editingFaqId) {
      setFAQItems((current: FAQItem[]) =>
        current.map((item: FAQItem) =>
          item.id === editingFaqId
            ? {
                ...item,
                question: faqDraft.question.trim(),
                answer: faqDraft.answer.trim(),
              }
            : item
        )
      );
      toast.success("FAQ 항목을 수정했습니다.");
    } else {
      setFAQItems((current: FAQItem[]) => [
        ...current,
        {
          id: String(Date.now()),
          question: faqDraft.question.trim(),
          answer: faqDraft.answer.trim(),
        },
      ]);
      toast.success("FAQ 항목을 추가했습니다.");
    }

    markChanged();
    setFaqDialogOpen(false);
  };

  const handleDeleteFaq = () => {
    if (!faqDeleteTarget) {
      return;
    }

    setFAQItems((current: FAQItem[]) =>
      current.filter((item: FAQItem) => item.id !== faqDeleteTarget.id)
    );
    setFaqDeleteTarget(null);
    markChanged();
    toast.success("FAQ 항목을 삭제했습니다.");
  };

  const handleFileSelection = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    const newFiles = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      uploadDate: "오늘",
    }));

    setUploadedFiles((current) => [...newFiles, ...current]);
    markChanged();
    toast.success(`${files.length}개 파일을 추가했습니다.`);
    event.target.value = "";
  };

  const handleRegenerateTemplates = () => {
    const targetCount =
      regenerateMode === "bulk"
        ? impactedCount
        : selectedTemplates.length;

    setHasChanges(false);
    setRegenerateMode(null);
    toast.success(`템플릿 ${targetCount}개를 재생성했습니다.`);
  };

  return (
    <>
      <div className="mx-auto max-w-[1200px] p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="mb-1 text-[#1E2A3A]">비즈니스 프로필</h1>
          <p className="text-[14px] text-[#64748B]">
            AI 템플릿 생성에 사용되는 비즈니스 정보를 관리합니다
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#2DD4BF]" />
            <h3 className="text-[#1E2A3A]">회사 프로필</h3>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-[13px] text-[#1E2A3A]">
                업종 / 비즈니스 유형
              </label>
              <select
                value={businessType}
                onChange={(event) => {
                  setBusinessType(event.target.value);
                  markChanged();
                }}
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-[14px] text-[#1E2A3A] outline-none focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#2DD4BF]/30"
              >
                {businessTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[13px] text-[#1E2A3A]">
                이메일 어조
              </label>
              <div className="flex gap-2">
                {toneOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setTone(option.id);
                      markChanged();
                    }}
                    className={`rounded-lg px-4 py-2 text-[13px] transition-all ${
                      tone === option.id
                        ? "bg-[#2DD4BF] text-[#1E2A3A]"
                        : "border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:border-[#CBD5E1]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[13px] text-[#1E2A3A]">
                제품/서비스 설명
              </label>
              <textarea
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                  markChanged();
                }}
                rows={4}
                className="w-full resize-none rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-[14px] text-[#1E2A3A] outline-none focus:border-[#2DD4BF] focus:ring-2 focus:ring-[#2DD4BF]/30"
              />
            </div>

            <div className="flex justify-end border-t border-[#E2E8F0] pt-3">
              <button
                onClick={handleSaveProfile}
                className="flex items-center gap-2 rounded-lg bg-[#1E2A3A] px-4 py-2 text-[13px] text-white transition-colors hover:bg-[#2A3A4E]"
              >
                <Save className="h-4 w-4" />
                저장
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#2DD4BF]" />
            <h3 className="text-[#1E2A3A]">비즈니스 자료</h3>
          </div>

          <div className="mb-6">
            <h4 className="mb-3 text-[13px] text-[#1E2A3A]">업로드된 파일</h4>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="group flex items-center gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 transition-colors hover:border-[#CBD5E1]"
                >
                  <FileText className="h-5 w-5 text-[#64748B]" />
                  <span className="flex-1 text-[13px] text-[#1E2A3A]">
                    {file.name}
                  </span>
                  <span className="text-[11px] text-[#94A3B8]">
                    {file.uploadDate} 업로드
                  </span>
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    className="rounded-md p-1.5 text-[#94A3B8] opacity-0 transition-all hover:bg-[#FEF2F2] hover:text-[#EF4444] group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              <button
                onClick={() => fileInputRef.current?.click()}
                className="group flex w-full items-center gap-3 rounded-lg border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-3 text-left transition-all hover:border-[#2DD4BF] hover:bg-[#2DD4BF]/5"
              >
                <div className="flex h-5 w-5 items-center justify-center text-[#94A3B8] group-hover:text-[#2DD4BF]">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-[13px] text-[#94A3B8] transition-colors group-hover:text-[#1E2A3A]">
                  파일 추가
                </span>
              </button>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-[13px] text-[#1E2A3A]">
              FAQ / 매뉴얼 직접 입력
            </h4>
            <div className="space-y-2">
              {faqItems.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-start gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 transition-colors hover:border-[#CBD5E1]"
                >
                  <div className="flex-1">
                    <p className="mb-1 text-[13px] text-[#1E2A3A]">
                      Q: {item.question}
                    </p>
                    <p className="text-[12px] text-[#64748B]">
                      A: {item.answer}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openFaqDialog(item)}
                      className="rounded-md p-1.5 text-[#94A3B8] transition-all hover:bg-white hover:text-[#1E2A3A]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setFaqDeleteTarget(item)}
                      className="rounded-md p-1.5 text-[#94A3B8] transition-all hover:bg-[#FEF2F2] hover:text-[#EF4444]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => openFaqDialog()}
                className="group flex w-full items-center gap-3 rounded-lg border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-3 text-left transition-all hover:border-[#2DD4BF] hover:bg-[#2DD4BF]/5"
              >
                <div className="flex h-5 w-5 items-center justify-center text-[#94A3B8] group-hover:text-[#2DD4BF]">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-[13px] text-[#94A3B8] transition-colors group-hover:text-[#1E2A3A]">
                  항목 추가
                </span>
              </button>
            </div>
          </div>
        </div>

        {hasChanges ? (
          <div className="rounded-xl border border-[#FDE68A] bg-[#FEF3C7] p-5">
            <div className="mb-4 flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#D97706]" />
              <div className="flex-1">
                <p className="mb-1 text-[14px] text-[#92400E]">
                  비즈니스 자료가 변경되었습니다.
                </p>
                <p className="text-[12px] text-[#B45309]">
                  영향받는 템플릿 {impactedCount}개가 있습니다.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setRegenerateMode("bulk")}
                className="rounded-lg bg-[#1E2A3A] px-4 py-2 text-[13px] text-white transition-colors hover:bg-[#2A3A4E]"
              >
                템플릿 일괄 재생성
              </button>
              <button
                onClick={() => setRegenerateMode("select")}
                className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-[13px] text-[#64748B] transition-colors hover:bg-[#F8FAFC]"
              >
                개별 선택 후 재생성
              </button>
              <button
                onClick={() => setHasChanges(false)}
                className="rounded-lg px-4 py-2 text-[13px] text-[#64748B] transition-colors hover:text-[#1E2A3A]"
              >
                나중에
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1 text-[12px] text-[#94A3B8] transition-colors hover:text-[#64748B]"
          >
            초기 온보딩 설정 다시 보기
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelection}
        />
      </div>

      <Dialog open={faqDialogOpen} onOpenChange={setFaqDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>
              {editingFaqId ? "FAQ 항목 수정" : "FAQ 항목 추가"}
            </DialogTitle>
            <DialogDescription>
              자주 쓰는 답변이나 운영 정책을 직접 입력해 템플릿 품질을 높일 수
              있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <label className="block space-y-2 text-sm text-foreground">
              <span>질문</span>
              <input
                value={faqDraft.question}
                onChange={(event) =>
                  setFaqDraft((current) => ({
                    ...current,
                    question: event.target.value,
                  }))
                }
                className="h-11 w-full rounded-xl border border-border bg-background px-4"
              />
            </label>
            <label className="block space-y-2 text-sm text-foreground">
              <span>답변</span>
              <textarea
                rows={5}
                value={faqDraft.answer}
                onChange={(event) =>
                  setFaqDraft((current) => ({
                    ...current,
                    answer: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-border bg-background px-4 py-3"
              />
            </label>
          </div>

          <DialogFooter>
            <button
              type="button"
              className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground"
              onClick={() => setFaqDialogOpen(false)}
            >
              취소
            </button>
            <button
              type="button"
              className="rounded-xl bg-[#1E2A3A] px-4 py-2 text-sm text-white"
              onClick={handleSaveFaq}
            >
              저장
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(faqDeleteTarget)} onOpenChange={(open) => !open && setFaqDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>FAQ 항목을 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              "{faqDeleteTarget?.question}" 항목이 비즈니스 자료에서 제거됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFaq}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={Boolean(regenerateMode)} onOpenChange={(open) => !open && setRegenerateMode(null)}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>
              {regenerateMode === "bulk"
                ? "영향받는 템플릿 일괄 재생성"
                : "재생성할 템플릿 선택"}
            </DialogTitle>
            <DialogDescription>
              {regenerateMode === "bulk"
                ? `현재 변경 내용을 기준으로 템플릿 ${impactedCount}개를 다시 생성합니다.`
                : "변경된 비즈니스 자료를 반영할 템플릿을 선택하세요."}
            </DialogDescription>
          </DialogHeader>

          {regenerateMode === "select" ? (
            <div className="space-y-2">
              {impactedTemplates.map((template) => {
                const selected = selectedTemplates.includes(template);
                return (
                  <button
                    key={template}
                    type="button"
                    onClick={() =>
                      setSelectedTemplates((current) =>
                        selected
                          ? current.filter((item) => item !== template)
                          : [...current, template]
                      )
                    }
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${
                      selected
                        ? "border-[#2DD4BF] bg-[#2DD4BF]/5 text-[#0F766E]"
                        : "border-border bg-background text-foreground"
                    }`}
                  >
                    <span>{template}</span>
                    <span>{selected ? "선택됨" : "선택"}</span>
                  </button>
                );
              })}
            </div>
          ) : null}

          <DialogFooter>
            <button
              type="button"
              className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground"
              onClick={() => setRegenerateMode(null)}
            >
              취소
            </button>
            <button
              type="button"
              className="rounded-xl bg-[#1E2A3A] px-4 py-2 text-sm text-white"
              onClick={handleRegenerateTemplates}
            >
              재생성 시작
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
