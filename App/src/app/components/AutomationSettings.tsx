import { useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  ExternalLink,
  Calendar,
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

interface CategoryRule {
  id: string;
  name: string;
  keywords: string[];
  template: string;
  autoSend: boolean;
  color: string;
}

interface RuleDraft {
  name: string;
  keywordsText: string;
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

const colorOptions = ["#3B82F6", "#EF4444", "#8B5CF6", "#F59E0B", "#10B981", "#EC4899"];

const emptyRuleDraft: RuleDraft = {
  name: "",
  keywordsText: "",
  template: "",
  autoSend: false,
  color: colorOptions[0],
};

export function AutomationSettings() {
  const [rules, setRules] = useState<CategoryRule[]>(initialRules);
  const [autoCalendar, setAutoCalendar] = useState(true);
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(true);
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleDraft, setRuleDraft] = useState<RuleDraft>(emptyRuleDraft);
  const [deleteTarget, setDeleteTarget] = useState<CategoryRule | null>(null);
  const [autoCalendarCategories, setAutoCalendarCategories] = useState<string[]>(["미팅요청"]);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  const availableCategories = useMemo(
    () => rules.map((rule) => rule.name),
    [rules]
  );

  const toggleAutoSend = (id: string) => {
    setRules((current) =>
      current.map((rule) =>
        rule.id === id ? { ...rule, autoSend: !rule.autoSend } : rule
      )
    );
  };

  const openRuleDialog = (rule?: CategoryRule) => {
    setEditingRuleId(rule?.id || null);
    setRuleDraft(
      rule
        ? {
            name: rule.name,
            keywordsText: rule.keywords.join(", "),
            template: rule.template,
            autoSend: rule.autoSend,
            color: rule.color,
          }
        : emptyRuleDraft
    );
    setRuleDialogOpen(true);
  };

  const handleSaveRule = () => {
    const keywords = ruleDraft.keywordsText
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean);

    if (!ruleDraft.name.trim() || !ruleDraft.template.trim() || !keywords.length) {
      toast.error("카테고리명, 키워드, 템플릿을 모두 입력하세요.");
      return;
    }

    if (editingRuleId) {
      setRules((current) =>
        current.map((rule) =>
          rule.id === editingRuleId
            ? {
                ...rule,
                name: ruleDraft.name.trim(),
                keywords,
                template: ruleDraft.template.trim(),
                autoSend: ruleDraft.autoSend,
                color: ruleDraft.color,
              }
            : rule
        )
      );
      toast.success("카테고리 규칙을 수정했습니다.");
    } else {
      setRules((current) => [
        ...current,
        {
          id: String(Date.now()),
          name: ruleDraft.name.trim(),
          keywords,
          template: ruleDraft.template.trim(),
          autoSend: ruleDraft.autoSend,
          color: ruleDraft.color,
        },
      ]);
      toast.success("새 카테고리 규칙을 추가했습니다.");
    }

    setRuleDialogOpen(false);
  };

  const handleDeleteRule = () => {
    if (!deleteTarget) {
      return;
    }

    setRules((current) =>
      current.filter((rule) => rule.id !== deleteTarget.id)
    );
    setAutoCalendarCategories((current) =>
      current.filter((category) => category !== deleteTarget.name)
    );
    setDeleteTarget(null);
    toast.success("카테고리 규칙을 삭제했습니다.");
  };

  const handleConnectCalendar = () => {
    setGoogleCalendarConnected(true);
    toast.success("Google 캘린더를 연결했습니다.");
  };

  const handleDisconnectCalendar = () => {
    setGoogleCalendarConnected(false);
    setAutoCalendar(false);
    toast("Google 캘린더 연결을 해제했습니다.");
  };

  const handleApplyCalendarCategories = () => {
    setCategoryDialogOpen(false);
    toast.success("자동 등록 카테고리를 업데이트했습니다.");
  };

  return (
    <>
      <div className="mx-auto max-w-[1200px] p-4 lg:p-8">
        <div className="mb-8">
          <h1 className="mb-1 text-[#1E2A3A] dark:text-foreground">자동화 설정</h1>
          <p className="text-[14px] text-[#64748B] dark:text-muted-foreground">
            이메일 자동화의 동작 방식과 연결 계정을 관리합니다
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm dark:border-border dark:bg-card">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] p-6 dark:border-border">
            <h3 className="text-[#1E2A3A] dark:text-foreground">카테고리 규칙</h3>
            <button
              onClick={() => openRuleDialog()}
              className="app-cta-primary flex items-center gap-2 rounded-lg px-4 py-2 text-[13px]"
            >
              <Plus className="h-4 w-4" />
              규칙 추가
            </button>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-[#111A28]">
                  <th className="px-6 py-3 text-left text-[11px] uppercase tracking-wider text-[#94A3B8] dark:text-muted-foreground">
                    카테고리
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] uppercase tracking-wider text-[#94A3B8] dark:text-muted-foreground">
                    매칭 키워드
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] uppercase tracking-wider text-[#94A3B8] dark:text-muted-foreground">
                    지정 템플릿
                  </th>
                  <th className="px-6 py-3 text-center text-[11px] uppercase tracking-wider text-[#94A3B8] dark:text-muted-foreground">
                    자동 발송
                  </th>
                  <th className="px-6 py-3 text-right text-[11px] uppercase tracking-wider text-[#94A3B8] dark:text-muted-foreground">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] dark:divide-border">
                {rules.map((rule) => (
                  <tr
                    key={rule.id}
                    className="transition-colors hover:bg-[#FAFBFC] dark:hover:bg-[#131D2F]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: rule.color }}
                        />
                        <span className="text-[13px] text-[#1E2A3A] dark:text-foreground">
                          {rule.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {rule.keywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="rounded bg-[#F1F5F9] px-2 py-0.5 text-[11px] text-[#64748B] dark:bg-[#1E293B] dark:text-muted-foreground"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] text-[#64748B] dark:text-muted-foreground">
                        {rule.template}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleAutoSend(rule.id)}
                        className={`relative h-5.5 w-10 rounded-full transition-colors ${
                          rule.autoSend ? "bg-[#2DD4BF] dark:bg-[#0F766E]" : "bg-[#CBD5E1] dark:bg-[#334155]"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-transform ${
                            rule.autoSend ? "left-5" : "left-0.5"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openRuleDialog(rule)}
                          className="rounded-md p-1.5 text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-[#1E2A3A] dark:text-muted-foreground dark:hover:bg-[#1E293B] dark:hover:text-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(rule)}
                          className="rounded-md p-1.5 text-[#94A3B8] transition-colors hover:bg-[#FEF2F2] hover:text-[#EF4444] dark:text-muted-foreground dark:hover:bg-[#3F1D24] dark:hover:text-[#FCA5A5]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-[#F1F5F9] dark:divide-border md:hidden">
            {rules.map((rule) => (
              <div key={rule.id} className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: rule.color }}
                    />
                    <span className="text-[14px] text-[#1E2A3A] dark:text-foreground">{rule.name}</span>
                  </div>
                  <button
                    onClick={() => toggleAutoSend(rule.id)}
                    className={`relative h-5.5 w-10 rounded-full transition-colors ${
                      rule.autoSend ? "bg-[#2DD4BF] dark:bg-[#0F766E]" : "bg-[#CBD5E1] dark:bg-[#334155]"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-transform ${
                        rule.autoSend ? "left-5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {rule.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded bg-[#F1F5F9] px-2 py-0.5 text-[11px] text-[#64748B] dark:bg-[#1E293B] dark:text-muted-foreground"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
                <p className="text-[12px] text-[#94A3B8] dark:text-muted-foreground">{rule.template}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => openRuleDialog(rule)}
                    className="app-secondary-button flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-[12px]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    편집
                  </button>
                  <button
                    onClick={() => setDeleteTarget(rule)}
                    className="app-danger-button flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-[12px]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm dark:border-border dark:bg-card">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-[#1E2A3A] dark:text-foreground">캘린더 연동</h3>
            {!googleCalendarConnected ? (
              <button
                onClick={handleConnectCalendar}
                className="app-secondary-button flex items-center gap-2 rounded-lg px-4 py-2 text-[13px]"
              >
                <Plus className="h-4 w-4" />
                Google 캘린더 연결
              </button>
            ) : null}
          </div>

          <div className="space-y-3">
            {googleCalendarConnected ? (
              <div className="app-soft-surface flex items-center gap-4 rounded-xl p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4285F4] text-white text-[14px]">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] text-[#1E2A3A] dark:text-foreground">
                      Google Calendar
                    </span>
                    <span className="app-success-pill rounded-full px-2 py-0.5 text-[10px]">
                      연결됨
                    </span>
                  </div>
                  <p className="truncate text-[12px] text-[#94A3B8] dark:text-muted-foreground">
                    calendar@mycompany.co.kr
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      window.open(
                        "https://calendar.google.com",
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                    className="rounded-md p-2 text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-[#64748B] dark:text-muted-foreground dark:hover:bg-[#1E293B] dark:hover:text-foreground"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleDisconnectCalendar}
                    className="app-secondary-button rounded-lg px-3 py-1.5 text-[12px]"
                  >
                    해제
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-4 dark:border-border dark:bg-[#131D2F]">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E2E8F0] text-[#94A3B8] dark:bg-[#1E293B] dark:text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] text-[#94A3B8] dark:text-muted-foreground">
                    Google 캘린더를 연결하세요
                  </p>
                  <p className="text-[11px] text-[#CBD5E1] dark:text-[#64748B]">
                    일정 자동 등록 기능을 사용하려면 캘린더 연동이 필요합니다
                  </p>
                </div>
              </div>
            )}

            {googleCalendarConnected ? (
              <div className="border-t border-[#E2E8F0] pt-3 dark:border-border">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h4 className="mb-1 text-[13px] text-[#1E2A3A] dark:text-foreground">
                      일정 자동 등록
                    </h4>
                    <p className="text-[11px] text-[#94A3B8] dark:text-muted-foreground">
                      미팅 요청 및 일정 관련 이메일을 자동으로 Google 캘린더에 등록합니다
                    </p>
                  </div>
                  <button
                    onClick={() => setAutoCalendar((current) => !current)}
                    className={`relative h-5.5 w-10 rounded-full transition-colors ${
                      autoCalendar ? "bg-[#2DD4BF] dark:bg-[#0F766E]" : "bg-[#CBD5E1] dark:bg-[#334155]"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-transform ${
                        autoCalendar ? "left-5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>

                {autoCalendar ? (
                  <div className="mt-3 rounded-lg border border-[#E2E8F0] bg-white p-3 dark:border-border dark:bg-[#131D2F]">
                    <p className="mb-2 text-[11px] uppercase tracking-wide text-[#64748B] dark:text-muted-foreground">
                      자동 등록 카테고리
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {autoCalendarCategories.map((category) => (
                        <span
                          key={category}
                          className="flex items-center gap-1.5 rounded-md bg-[#8B5CF6]/10 px-2.5 py-1 text-[11px] text-[#8B5CF6] dark:bg-[#1B1430] dark:text-[#C4B5FD]"
                        >
                          <Check className="h-3 w-3" />
                          {category}
                        </span>
                      ))}
                      <button
                        onClick={() => setCategoryDialogOpen(true)}
                        className="app-secondary-button rounded-md px-2.5 py-1 text-[11px]"
                      >
                        + 카테고리 추가
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>
              {editingRuleId ? "카테고리 규칙 수정" : "카테고리 규칙 추가"}
            </DialogTitle>
            <DialogDescription>
              이메일 분류와 템플릿 자동 연결 규칙을 설정합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <label className="block space-y-2 text-sm text-foreground">
              <span>카테고리명</span>
              <input
                value={ruleDraft.name}
                onChange={(event) =>
                  setRuleDraft((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="app-form-input h-11 w-full rounded-xl px-4 text-sm"
              />
            </label>

            <label className="block space-y-2 text-sm text-foreground">
              <span>매칭 키워드</span>
              <input
                value={ruleDraft.keywordsText}
                onChange={(event) =>
                  setRuleDraft((current) => ({
                    ...current,
                    keywordsText: event.target.value,
                  }))
                }
                placeholder="쉼표로 구분하세요"
                className="app-form-input h-11 w-full rounded-xl px-4 text-sm"
              />
            </label>

            <label className="block space-y-2 text-sm text-foreground">
              <span>지정 템플릿</span>
              <input
                value={ruleDraft.template}
                onChange={(event) =>
                  setRuleDraft((current) => ({
                    ...current,
                    template: event.target.value,
                  }))
                }
                className="app-form-input h-11 w-full rounded-xl px-4 text-sm"
              />
            </label>

            <div className="space-y-2 text-sm text-foreground">
              <span className="block">표시 색상</span>
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() =>
                      setRuleDraft((current) => ({
                        ...current,
                        color,
                      }))
                    }
                    className={`h-8 w-8 rounded-full border-2 ${
                      ruleDraft.color === color ? "border-[#1E2A3A]" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setRuleDraft((current) => ({
                  ...current,
                  autoSend: !current.autoSend,
                }))
              }
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm ${
                ruleDraft.autoSend
                  ? "border-[#2DD4BF] bg-[#2DD4BF]/5 text-[#0F766E]"
                  : "border-border bg-background text-muted-foreground"
              }`}
            >
              자동 발송 사용
              <span>{ruleDraft.autoSend ? "ON" : "OFF"}</span>
            </button>
          </div>

          <DialogFooter>
            <button
              type="button"
              className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground"
              onClick={() => setRuleDialogOpen(false)}
            >
              취소
            </button>
            <button
              type="button"
              className="rounded-xl bg-[#1E2A3A] px-4 py-2 text-sm text-white"
              onClick={handleSaveRule}
            >
              저장
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>규칙을 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.name}" 카테고리 규칙이 제거됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRule}>
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>자동 등록 카테고리 선택</DialogTitle>
            <DialogDescription>
              Google 캘린더에 자동으로 등록할 이메일 카테고리를 고르세요.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {availableCategories.map((category) => {
              const selected = autoCalendarCategories.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    setAutoCalendarCategories((current) =>
                      selected
                        ? current.filter((item) => item !== category)
                        : [...current, category]
                    )
                  }
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${
                    selected
                      ? "border-[#2DD4BF] bg-[#2DD4BF]/5 text-[#0F766E]"
                      : "border-border bg-background text-foreground"
                  }`}
                >
                  <span>{category}</span>
                  <span>{selected ? "선택됨" : "선택"}</span>
                </button>
              );
            })}
          </div>

          <DialogFooter>
            <button
              type="button"
              className="rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground"
              onClick={() => setCategoryDialogOpen(false)}
            >
              취소
            </button>
            <button
              type="button"
              className="rounded-xl bg-[#1E2A3A] px-4 py-2 text-sm text-white"
              onClick={handleApplyCalendarCategories}
            >
              적용
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
