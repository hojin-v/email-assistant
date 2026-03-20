import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useSearchParams } from "react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../app/components/ui/select";
import {
  generatedTemplates,
  initialAutomationRules,
  templateCategoryStats,
  templateSummary,
  userIndustryOptions,
} from "../shared/mock/adminData";
import { MetricCard } from "../shared/ui/MetricCard";
import { PageHeader } from "../shared/ui/PageHeader";
import { AdminModal } from "../shared/ui/AdminModal";
import { AdminStateNotice } from "../shared/ui/AdminStateNotice";
import { AdminStatePage } from "../shared/ui/AdminStatePage";
import { StatusBadge } from "../shared/ui/StatusBadge";

const emptyRuleDraft = {
  name: "",
  category: "견적 요청",
  trigger: "",
  action: "",
  status: "활성",
};

const presetRuleDraft = {
  name: "계약 일정 우선 등록",
  category: "미팅/일정 조율",
  trigger: "메일 본문에 미팅 일정, 시간, 장소가 모두 포함되면",
  action: "캘린더 초안을 생성하고 담당자 검토 상태로 전환",
  status: "활성",
};

export function TemplateAutomationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const scenarioId = searchParams.get("scenario");
  const loadErrorScenario =
    scenarioId === "admin-template-automation-load-error" ||
    scenarioId === "admin-templates-load-error";
  const templatesEmptyScenario = scenarioId === "admin-template-automation-templates-empty";
  const rulesEmptyScenario = scenarioId === "admin-template-automation-rules-empty";
  const ruleDialogScenario = scenarioId === "admin-template-automation-rule-dialog-normal";
  const ruleDeleteDialogScenario =
    scenarioId === "admin-template-automation-rule-delete-dialog-normal";
  const ruleSaveErrorScenario = scenarioId === "admin-template-automation-rule-save-error";
  const activeTab = searchParams.get("tab") === "rules" ? "rules" : "templates";

  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [templateItems] = useState(templatesEmptyScenario ? [] : generatedTemplates);
  const [ruleItems, setRuleItems] = useState(
    rulesEmptyScenario ? [] : initialAutomationRules,
  );
  const [ruleDialogOpen, setRuleDialogOpen] = useState(
    ruleDialogScenario || ruleSaveErrorScenario,
  );
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [ruleDraft, setRuleDraft] = useState(
    ruleDialogScenario || ruleSaveErrorScenario ? presetRuleDraft : emptyRuleDraft,
  );
  const [deleteTarget, setDeleteTarget] = useState(
    ruleDeleteDialogScenario ? initialAutomationRules[0] ?? null : null,
  );
  const [ruleErrorNotice, setRuleErrorNotice] = useState(
    ruleSaveErrorScenario
      ? "자동화 규칙 저장 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요."
      : "",
  );

  const categories = useMemo(
    () => ["all", ...new Set(templateItems.map((item) => item.category))],
    [templateItems],
  );

  const filteredTemplates = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return templateItems.filter((item) => {
      const matchesKeyword =
        keyword.length === 0 ||
        [item.title, item.category, item.id].join(" ").toLowerCase().includes(keyword);
      const matchesIndustry = industry === "all" || item.industry === industry;
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;

      return matchesKeyword && matchesIndustry && matchesCategory;
    });
  }, [categoryFilter, industry, search, templateItems]);

  const filteredCategoryStats = useMemo(
    () =>
      templateCategoryStats.filter((item) => {
        const matchesIndustry =
          industry === "all" ||
          item.industryLabel ===
            userIndustryOptions.find((option) => option.value === industry)?.label;
        const matchesCategory =
          categoryFilter === "all" || item.category === categoryFilter;

        return matchesIndustry && matchesCategory;
      }),
    [categoryFilter, industry],
  );

  const openCreateRule = () => {
    setEditingRuleId(null);
    setRuleDraft(emptyRuleDraft);
    setRuleErrorNotice("");
    setRuleDialogOpen(true);
  };

  const openEditRule = (rule) => {
    setEditingRuleId(rule.id);
    setRuleDraft({
      name: rule.name,
      category: rule.category,
      trigger: rule.trigger,
      action: rule.action,
      status: rule.status,
    });
    setRuleErrorNotice("");
    setRuleDialogOpen(true);
  };

  const handleSaveRule = () => {
    if (
      !ruleDraft.name.trim() ||
      !ruleDraft.category.trim() ||
      !ruleDraft.trigger.trim() ||
      !ruleDraft.action.trim()
    ) {
      return;
    }

    if (ruleSaveErrorScenario) {
      setRuleErrorNotice("자동화 규칙 저장 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    if (editingRuleId) {
      setRuleItems((current) =>
        current.map((rule) =>
          rule.id === editingRuleId
            ? {
                ...rule,
                name: ruleDraft.name.trim(),
                category: ruleDraft.category,
                trigger: ruleDraft.trigger.trim(),
                action: ruleDraft.action.trim(),
                status: ruleDraft.status,
                updatedAt: "방금 전",
              }
            : rule,
        ),
      );
    } else {
      setRuleItems((current) => [
        {
          id: `rule-${Date.now()}`,
          name: ruleDraft.name.trim(),
          category: ruleDraft.category,
          trigger: ruleDraft.trigger.trim(),
          action: ruleDraft.action.trim(),
          status: ruleDraft.status,
          updatedAt: "방금 전",
        },
        ...current,
      ]);
    }

    setRuleErrorNotice("");
    setRuleDialogOpen(false);
  };

  const handleDeleteRule = () => {
    if (!deleteTarget) {
      return;
    }

    setRuleItems((current) => current.filter((rule) => rule.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const updateTab = (tab) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", tab);
    setSearchParams(nextParams);
  };

  if (loadErrorScenario) {
    return (
      <AdminStatePage
        title="템플릿 / 자동화 관리 화면을 불러오지 못했습니다"
        description="생성 템플릿 통계와 자동화 규칙 데이터를 가져오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요."
      />
    );
  }

  return (
    <section className="admin-page">
      <PageHeader
        title="템플릿 / 자동화 관리"
        description="생성된 템플릿 사용 현황과 자동화 규칙을 함께 관리합니다. 관리자는 사전 배포형 원본이 아니라 생성 결과와 운영 규칙을 확인합니다."
        actions={
          activeTab === "rules" ? (
            <button type="button" className="admin-button" onClick={openCreateRule}>
              <Plus size={14} />
              규칙 생성
            </button>
          ) : null
        }
      />

      <div className="admin-card-grid admin-card-grid--four">
        {templateSummary.map((card) => (
          <MetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            hint={card.hint}
          />
        ))}
      </div>

      <div className="admin-chip-row">
        <button
          type="button"
          className={activeTab === "templates" ? "admin-chip admin-chip--active" : "admin-chip"}
          onClick={() => updateTab("templates")}
        >
          템플릿 관리
        </button>
        <button
          type="button"
          className={activeTab === "rules" ? "admin-chip admin-chip--active" : "admin-chip"}
          onClick={() => updateTab("rules")}
        >
          자동화 규칙 관리
        </button>
      </div>

      {activeTab === "templates" ? (
        <>
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h2>생성 템플릿 목록</h2>
                <p className="admin-panel-subtitle">
                  사용자별로 생성된 템플릿 결과와 사용 현황을 조회합니다.
                </p>
              </div>
              <span className="admin-panel-note">{filteredTemplates.length}개 표시</span>
            </div>

            <div className="admin-toolbar">
              <div className="admin-toolbar-group">
                <div className="admin-input-wrap app-input-shell">
                  <Search size={14} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="admin-input admin-input--compact bg-transparent text-sm placeholder:text-muted-foreground"
                    placeholder="템플릿명 / 카테고리 / ID 검색"
                  />
                </div>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger className="app-form-input h-11 min-w-[148px] rounded-xl px-4 text-sm">
                    <SelectValue placeholder="전체 업종" />
                  </SelectTrigger>
                  <SelectContent className="app-select-content rounded-2xl p-1">
                    <SelectItem value="all" className="app-select-item rounded-xl px-3 py-2.5 text-sm">
                      전체 업종
                    </SelectItem>
                    {userIndustryOptions.map((item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                        className="app-select-item rounded-xl px-3 py-2.5 text-sm"
                      >
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="app-form-input h-11 min-w-[156px] rounded-xl px-4 text-sm">
                    <SelectValue placeholder="전체 카테고리" />
                  </SelectTrigger>
                  <SelectContent className="app-select-content rounded-2xl p-1">
                    <SelectItem value="all" className="app-select-item rounded-xl px-3 py-2.5 text-sm">
                      전체 카테고리
                    </SelectItem>
                    {categories
                      .filter((item) => item !== "all")
                      .map((item) => (
                        <SelectItem
                          key={item}
                          value={item}
                          className="app-select-item rounded-xl px-3 py-2.5 text-sm"
                        >
                          {item}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <span className="admin-toolbar-note">
                LLM이 생성한 템플릿 결과와 사용 횟수를 기준으로 정렬합니다.
              </span>
            </div>

            {templatesEmptyScenario ? (
              <AdminStateNotice
                title="생성 템플릿 결과가 없습니다"
                description="아직 사용자가 생성한 템플릿이 없어 통계와 목록이 비어 있습니다."
                tone="empty"
                compact
              />
            ) : null}

            {filteredTemplates.length > 0 ? (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>템플릿</th>
                      <th>카테고리</th>
                      <th>업종</th>
                      <th>사용 횟수</th>
                      <th>연결 사용자</th>
                      <th>최근 생성</th>
                      <th>품질</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTemplates.map((template) => (
                      <tr key={template.id}>
                        <td>
                          <strong>{template.title}</strong>
                          <div className="admin-table-subcopy">{template.id}</div>
                        </td>
                        <td>{template.category}</td>
                        <td>{userIndustryOptions.find((item) => item.value === template.industry)?.label}</td>
                        <td>{template.useCount}회</td>
                        <td>{template.userCount}명</td>
                        <td>{template.generatedAt}</td>
                        <td>
                          <StatusBadge>{template.quality}</StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <AdminStateNotice
                title="조건에 맞는 템플릿이 없습니다"
                description="검색어나 업종 필터를 조정하면 다른 생성 템플릿 결과를 확인할 수 있습니다."
                tone="empty"
              />
            )}
          </section>

          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h2>카테고리별 사용 현황 통계</h2>
                <p className="admin-panel-subtitle">
                  카테고리별 생성 템플릿 수와 사용 누적 횟수를 비교합니다.
                </p>
              </div>
            </div>

            <div className="admin-card-grid admin-card-grid--four">
              {filteredCategoryStats.map((item) => (
                <article key={item.id} className="admin-list-card">
                  <div className="admin-list-card-row">
                    <div>
                      <h3>{item.category}</h3>
                      <p>{item.industryLabel}</p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="admin-color-dot"
                      style={{ background: item.color }}
                    />
                  </div>
                  <div className="admin-inline-stat-row">
                    <span>생성 템플릿 수</span>
                    <strong>{item.templateCount}개</strong>
                  </div>
                  <div className="admin-inline-stat-row">
                    <span>누적 사용 횟수</span>
                    <strong>{item.usageCount}회</strong>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h2>자동화 규칙 목록</h2>
              <p className="admin-panel-subtitle">
                분류 키워드, 적용 카테고리, 자동화 액션 규칙을 생성하고 수정합니다.
              </p>
            </div>
            <span className="admin-panel-note">{ruleItems.length}개 규칙</span>
          </div>

          {ruleErrorNotice ? (
            <AdminStateNotice
              title="자동화 규칙 저장에 실패했습니다"
              description={ruleErrorNotice}
              tone="error"
              compact
            />
          ) : null}

          {ruleItems.length > 0 ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>규칙명</th>
                    <th>카테고리</th>
                    <th>조건</th>
                    <th>동작</th>
                    <th>상태</th>
                    <th>최근 수정</th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {ruleItems.map((rule) => (
                    <tr key={rule.id}>
                      <td>{rule.name}</td>
                      <td>{rule.category}</td>
                      <td>{rule.trigger}</td>
                      <td>{rule.action}</td>
                      <td>
                        <StatusBadge>{rule.status}</StatusBadge>
                      </td>
                      <td>{rule.updatedAt}</td>
                      <td>
                        <div className="admin-button-row">
                          <button
                            type="button"
                            className="admin-icon-button"
                            onClick={() => openEditRule(rule)}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            className="admin-icon-button admin-icon-button--danger"
                            onClick={() => setDeleteTarget(rule)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <AdminStateNotice
              title="등록된 자동화 규칙이 없습니다"
              description="새 규칙을 생성하면 카테고리 분류와 초안 생성 동작을 직접 제어할 수 있습니다."
              tone="empty"
            />
          )}
        </section>
      )}

      <AdminModal
        open={ruleDialogOpen}
        title={editingRuleId ? "자동화 규칙 수정" : "자동화 규칙 생성"}
        description="규칙명, 카테고리, 조건, 동작을 입력하면 즉시 목록에 반영됩니다."
        onClose={() => setRuleDialogOpen(false)}
        width={680}
        footer={
          <>
            <button
              type="button"
              className="admin-button admin-button--ghost"
              onClick={() => setRuleDialogOpen(false)}
            >
              취소
            </button>
            <button type="button" className="admin-button" onClick={handleSaveRule}>
              저장
            </button>
          </>
        }
      >
        <div className="admin-stack">
          {ruleErrorNotice ? (
            <AdminStateNotice
              title="자동화 규칙 저장에 실패했습니다"
              description={ruleErrorNotice}
              tone="error"
              compact
            />
          ) : null}

          <div className="admin-form-grid admin-form-grid--single">
            <label className="admin-field">
              <span>규칙명</span>
              <input
                value={ruleDraft.name}
                onChange={(event) => setRuleDraft((current) => ({ ...current, name: event.target.value }))}
                className="admin-input app-form-input"
                placeholder="예: 환불 요청 우선 검토"
              />
            </label>
            <label className="admin-field">
              <span>카테고리</span>
              <Select
                value={ruleDraft.category}
                onValueChange={(value) => setRuleDraft((current) => ({ ...current, category: value }))}
              >
                <SelectTrigger className="app-form-input h-11 w-full rounded-xl px-4 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="app-select-content rounded-2xl p-1">
                  {categories
                    .filter((item) => item !== "all")
                    .map((item) => (
                      <SelectItem
                        key={item}
                        value={item}
                        className="app-select-item rounded-xl px-3 py-2.5 text-sm"
                      >
                        {item}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </label>
            <label className="admin-field">
              <span>조건</span>
              <textarea
                value={ruleDraft.trigger}
                onChange={(event) => setRuleDraft((current) => ({ ...current, trigger: event.target.value }))}
                className="admin-textarea app-form-input"
                rows={4}
                placeholder="키워드나 분류 조건을 입력하세요"
              />
            </label>
            <label className="admin-field">
              <span>동작</span>
              <textarea
                value={ruleDraft.action}
                onChange={(event) => setRuleDraft((current) => ({ ...current, action: event.target.value }))}
                className="admin-textarea app-form-input"
                rows={4}
                placeholder="초안 생성, 담당자 검토, 캘린더 등록 등 동작을 입력하세요"
              />
            </label>
            <label className="admin-field">
              <span>상태</span>
              <Select
                value={ruleDraft.status}
                onValueChange={(value) => setRuleDraft((current) => ({ ...current, status: value }))}
              >
                <SelectTrigger className="app-form-input h-11 w-full rounded-xl px-4 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="app-select-content rounded-2xl p-1">
                  <SelectItem value="활성" className="app-select-item rounded-xl px-3 py-2.5 text-sm">
                    활성
                  </SelectItem>
                  <SelectItem value="비활성" className="app-select-item rounded-xl px-3 py-2.5 text-sm">
                    비활성
                  </SelectItem>
                </SelectContent>
              </Select>
            </label>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        open={Boolean(deleteTarget)}
        title="자동화 규칙을 삭제할까요?"
        description="삭제된 규칙은 즉시 목록에서 제거되며, 이후 들어오는 메일에는 적용되지 않습니다."
        onClose={() => setDeleteTarget(null)}
        footer={
          <>
            <button
              type="button"
              className="admin-button admin-button--ghost"
              onClick={() => setDeleteTarget(null)}
            >
              취소
            </button>
            <button type="button" className="admin-button" onClick={handleDeleteRule}>
              삭제
            </button>
          </>
        }
      >
        {deleteTarget ? (
          <div className="admin-list-card">
            <h3>{deleteTarget.name}</h3>
            <p>{deleteTarget.category}</p>
            <p className="admin-inline-note">{deleteTarget.trigger}</p>
          </div>
        ) : null}
      </AdminModal>
    </section>
  );
}
