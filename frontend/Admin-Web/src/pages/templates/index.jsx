import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import {
  businessTypeRegistry,
  categoryCatalog,
  categoryGovernance,
  taxonomySummary,
} from "../../shared/mock/adminData";
import { MetricCard } from "../../shared/ui/MetricCard";
import { PageHeader } from "../../shared/ui/PageHeader";
import { AdminStateNotice } from "../../shared/ui/AdminStateNotice";
import { AdminStatePage } from "../../shared/ui/AdminStatePage";

export function TemplatesPage() {
  const [searchParams] = useSearchParams();
  const scenarioId = searchParams.get("scenario");
  const loadErrorScenario = scenarioId === "admin-templates-load-error";
  const governanceErrorScenario = scenarioId === "admin-templates-approval-error";
  const [selectedBusinessType, setSelectedBusinessType] = useState("전체");

  const businessTypeOptions = useMemo(
    () => ["전체", ...businessTypeRegistry.map((item) => item.label)],
    [],
  );

  const filteredCategories = useMemo(
    () =>
      selectedBusinessType === "전체"
        ? categoryCatalog
        : categoryCatalog.filter((item) => item.domainLabel === selectedBusinessType),
    [selectedBusinessType],
  );

  if (loadErrorScenario) {
    return (
      <AdminStatePage
        title="업종 / 카테고리 관리 화면을 불러오지 못했습니다"
        description="업종 기준과 카테고리 카탈로그를 가져오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요."
      />
    );
  }

  return (
    <section className="admin-page">
      <PageHeader
        title="업종 / 카테고리 관리"
        description="사용자 앱 온보딩과 비즈니스 프로필에서 사용하는 업종 / 비즈니스 유형, 카테고리 기준을 동일하게 관리합니다. 관리자는 템플릿을 미리 배포하지 않고, LLM이 참고할 분류 기준만 유지합니다."
        actions={
          <div className="admin-button-row">
            <button type="button" className="admin-button" disabled>
              분류 기준 편집 준비 중
            </button>
            <button type="button" className="admin-button admin-button--ghost" disabled>
              App 기준 동기화 확인
            </button>
          </div>
        }
      />

      <div className="admin-card-grid admin-card-grid--three">
        {taxonomySummary.map((item, index) => (
          <MetricCard
            key={item.label}
            label={item.label}
            value={item.value}
            hint={item.hint}
            tone={index === 1 ? "accent" : index === 2 ? "warn" : "default"}
          />
        ))}
      </div>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h2>업종 / 비즈니스 유형 목록</h2>
            <p className="admin-panel-subtitle">
              App 온보딩의 업종 선택값과 동일한 기준으로 관리합니다.
            </p>
          </div>
          <span className="admin-panel-note">
            총 {businessTypeRegistry.length}개 유형
          </span>
        </div>

        <div className="admin-card-grid admin-card-grid--three">
          {businessTypeRegistry.map((item) => (
            <article key={item.value} className="admin-list-card">
              <div className="admin-list-card-row">
                <div>
                  <h3>{item.label}</h3>
                  <p>{item.categoryCount}개 카테고리 기본 제공</p>
                </div>
                <span
                  aria-hidden="true"
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 999,
                    background: item.color,
                    flexShrink: 0,
                  }}
                />
              </div>
              <p>{item.note}</p>
              <p className="admin-inline-note">
                예시 카테고리: {item.previewCategories.join(", ")}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h2>카테고리 카탈로그</h2>
            <p className="admin-panel-subtitle">
              업종 / 비즈니스 유형별 추천 카테고리를 그대로 노출합니다.
            </p>
          </div>

          <div className="admin-chip-row">
            {businessTypeOptions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSelectedBusinessType(item)}
                className={
                  selectedBusinessType === item
                    ? "admin-chip admin-chip--active"
                    : "admin-chip"
                }
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>업종 / 비즈니스 유형</th>
                <th>카테고리</th>
                <th>식별 ID</th>
                <th>색상</th>
                <th>적용 방식</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <tr key={category.id}>
                  <td>{category.sortKey}</td>
                  <td>{category.domainLabel}</td>
                  <td>{category.name}</td>
                  <td>{category.id}</td>
                  <td>
                    <div className="admin-list-card-row" style={{ justifyContent: "flex-start" }}>
                      <span
                        aria-hidden="true"
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          background: category.color,
                          flexShrink: 0,
                        }}
                      />
                      <span>{category.color}</span>
                    </div>
                  </td>
                  <td>{category.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h2>LLM 생성 기준</h2>
            <p className="admin-panel-subtitle">
              템플릿을 사전 배포하지 않고, 업종 / 카테고리와 비즈니스 프로필을 조합해 초안을 생성합니다.
            </p>
          </div>
          <span className="admin-panel-note">운영 원칙</span>
        </div>

        {governanceErrorScenario ? (
          <AdminStateNotice
            title="카테고리 운영 원칙을 불러오지 못했습니다"
            description="운영 규칙 패널 응답이 지연되고 있습니다. 잠시 후 다시 확인해 주세요."
          />
        ) : (
          <div className="admin-stack">
            {categoryGovernance.map((policy) => (
              <article key={policy.title} className="admin-list-card">
                <div>
                  <h3>{policy.title}</h3>
                  <p>{policy.desc}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
