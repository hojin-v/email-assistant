import { useState } from "react";
import {
  inquiries,
  inquirySummary,
  responseHistory,
} from "../../shared/mock/adminData";
import { MetricCard } from "../../shared/ui/MetricCard";
import { PageHeader } from "../../shared/ui/PageHeader";
import { StatusBadge } from "../../shared/ui/StatusBadge";

export function InquiriesPage() {
  const [selectedId, setSelectedId] = useState(inquiries[0]?.id ?? "");
  const selectedInquiry =
    inquiries.find((inquiry) => inquiry.id === selectedId) ?? inquiries[0];
  const history = responseHistory[selectedInquiry?.id] ?? [];

  return (
    <section className="admin-page">
      <PageHeader
        title="사용자 문의 대응"
        description="문의별 관리자 답변 기록을 저장하고, 최근 응답 이력을 운영 관점에서 확인합니다."
        actions={
          <button type="button" className="admin-button admin-button--ghost" disabled>
            답변 작성 UI 준비 중
          </button>
        }
      />

      <div className="admin-card-grid admin-card-grid--three">
        {inquirySummary.map((item, index) => (
          <MetricCard
            key={item.label}
            label={item.label}
            value={item.value}
            hint={item.hint}
            tone={index === 1 ? "accent" : "default"}
          />
        ))}
      </div>

      <div className="admin-master-detail">
        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>문의 리스트</h2>
            <span className="admin-panel-note">최근 업데이트 순</span>
          </div>

          <div className="admin-stack">
            {inquiries.map((inquiry) => {
              const isSelected = inquiry.id === selectedInquiry.id;

              return (
                <button
                  key={inquiry.id}
                  type="button"
                  onClick={() => setSelectedId(inquiry.id)}
                  className={
                    isSelected
                      ? "admin-master-item admin-master-item--active"
                      : "admin-master-item"
                  }
                >
                  <div className="admin-master-item-head">
                    <strong>{inquiry.id}</strong>
                    <StatusBadge>{inquiry.status}</StatusBadge>
                  </div>
                  <p className="admin-master-item-title">
                    {inquiry.requester} · {inquiry.company}
                  </p>
                  <p className="admin-master-item-copy">{inquiry.summary}</p>
                  <div className="admin-master-item-meta">
                    <span>{inquiry.domain}</span>
                    <span>{inquiry.latestResponder}</span>
                    <span>{inquiry.updatedAt}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h2>답변 기록 저장</h2>
              <p className="admin-panel-subtitle">
                {selectedInquiry.id} · {selectedInquiry.requester} / {selectedInquiry.company}
              </p>
            </div>
            <StatusBadge>{selectedInquiry.status}</StatusBadge>
          </div>

          <div className="admin-detail-card">
            <dl className="admin-meta-grid">
              <div>
                <dt>도메인</dt>
                <dd>{selectedInquiry.domain}</dd>
              </div>
              <div>
                <dt>최근 답변자</dt>
                <dd>{selectedInquiry.latestResponder}</dd>
              </div>
              <div>
                <dt>최근 업데이트</dt>
                <dd>{selectedInquiry.updatedAt}</dd>
              </div>
            </dl>
            <p className="admin-detail-copy">{selectedInquiry.summary}</p>
          </div>

          <div className="admin-timeline">
            {history.map((item) => (
              <article key={`${item.at}-${item.author}`} className="admin-timeline-item">
                <div className="admin-timeline-marker" />
                <div className="admin-timeline-content">
                  <div className="admin-timeline-meta">
                    <strong>{item.author}</strong>
                    <span>{item.channel}</span>
                    <span>{item.at}</span>
                  </div>
                  <p>{item.note}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
