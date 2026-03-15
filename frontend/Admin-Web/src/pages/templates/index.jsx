import { useState } from "react";
import {
  templateApprovalQueue,
  templateSummary,
  templates,
} from "../../shared/mock/adminData";
import { MetricCard } from "../../shared/ui/MetricCard";
import { PageHeader } from "../../shared/ui/PageHeader";
import { StatusBadge } from "../../shared/ui/StatusBadge";

export function TemplatesPage() {
  const [selectedDomain, setSelectedDomain] = useState("전체");
  const domains = ["전체", ...new Set(templates.map((template) => template.domain))];
  const filteredTemplates =
    selectedDomain === "전체"
      ? templates
      : templates.filter((template) => template.domain === selectedDomain);

  return (
    <section className="admin-page">
      <PageHeader
        title="템플릿 관리"
        description="도메인별 템플릿 CRUD 구조, 정확도 통계, AI 자동 생성 템플릿 승인 대기를 문서 기준으로 재구성합니다."
        actions={
          <div className="admin-button-row">
            <button type="button" className="admin-button" disabled>
              새 템플릿 생성 준비 중
            </button>
            <button type="button" className="admin-button admin-button--ghost" disabled>
              일괄 승인 정책 준비 중
            </button>
          </div>
        }
      />

      <div className="admin-card-grid admin-card-grid--three">
        {templateSummary.map((item, index) => (
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
          <h2>도메인별 템플릿 목록</h2>
          <div className="admin-chip-row">
            {domains.map((domain) => (
              <button
                key={domain}
                type="button"
                onClick={() => setSelectedDomain(domain)}
                className={
                  selectedDomain === domain
                    ? "admin-chip admin-chip--active"
                    : "admin-chip"
                }
              >
                {domain}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>도메인</th>
                <th>템플릿명</th>
                <th>카테고리</th>
                <th>정확도</th>
                <th>버전</th>
                <th>상태</th>
                <th>승인</th>
              </tr>
            </thead>
            <tbody>
              {filteredTemplates.map((template) => (
                <tr key={template.name}>
                  <td>{template.domain}</td>
                  <td>{template.name}</td>
                  <td>{template.category}</td>
                  <td>{template.accuracy}</td>
                  <td>{template.version}</td>
                  <td>
                    <StatusBadge>{template.status}</StatusBadge>
                  </td>
                  <td>
                    <StatusBadge>{template.approval}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-head">
          <h2>AI 자동 생성 템플릿 승인 대기</h2>
          <span className="admin-panel-note">관리자 승인 전 배포 불가</span>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>템플릿명</th>
                <th>도메인</th>
                <th>생성 시각</th>
                <th>신뢰도</th>
                <th>검토 담당</th>
              </tr>
            </thead>
            <tbody>
              {templateApprovalQueue.map((template) => (
                <tr key={template.name}>
                  <td>{template.name}</td>
                  <td>{template.domain}</td>
                  <td>{template.generatedAt}</td>
                  <td>{template.confidence}</td>
                  <td>{template.reviewer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
