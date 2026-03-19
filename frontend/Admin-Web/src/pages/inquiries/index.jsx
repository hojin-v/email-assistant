import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { Send } from "lucide-react";
import {
  inquiries,
  inquirySummary,
  responseHistory,
} from "../../shared/mock/adminData";
import { MetricCard } from "../../shared/ui/MetricCard";
import { PageHeader } from "../../shared/ui/PageHeader";
import { AdminStateNotice } from "../../shared/ui/AdminStateNotice";
import { AdminStatePage } from "../../shared/ui/AdminStatePage";
import { StatusBadge } from "../../shared/ui/StatusBadge";

export function InquiriesPage() {
  const [searchParams] = useSearchParams();
  const scenarioId = searchParams.get("scenario");
  const loadErrorScenario = scenarioId === "admin-inquiries-load-error";
  const emptyScenario = scenarioId === "admin-inquiries-empty";
  const [inquiryItems, setInquiryItems] = useState(emptyScenario ? [] : inquiries);
  const [historyMap, setHistoryMap] = useState(responseHistory);
  const [selectedId, setSelectedId] = useState(
    (emptyScenario ? [] : inquiries)[0]?.id ?? "",
  );
  const [replyDraft, setReplyDraft] = useState("");
  const [saveNotice, setSaveNotice] = useState("");

  useEffect(() => {
    if (emptyScenario) {
      setInquiryItems([]);
      setSelectedId("");
      return;
    }

    setInquiryItems(inquiries);
    setSelectedId((current) => current || inquiries[0]?.id || "");
  }, [emptyScenario]);

  const selectedInquiry =
    inquiryItems.find((inquiry) => inquiry.id === selectedId) ?? inquiryItems[0];
  const history = historyMap[selectedInquiry?.id] ?? [];

  const latestAdminReply = useMemo(
    () => history.find((item) => item.channel === "관리자 답변"),
    [history],
  );

  useEffect(() => {
    setReplyDraft("");
    setSaveNotice("");
  }, [selectedId]);

  const handleSubmitReply = () => {
    const trimmedReply = replyDraft.trim();

    if (!selectedInquiry || !trimmedReply) {
      return;
    }

    const nextReply = {
      at: "방금 전",
      author: "김호진",
      channel: "관리자 답변",
      note: trimmedReply,
    };

    const nextSystemLog = {
      at: "방금 전",
      author: "시스템",
      channel: "기록 저장",
      note: "문의 상태를 답변 완료로 변경하고 답변 이력을 저장했습니다.",
    };

    setHistoryMap((current) => ({
      ...current,
      [selectedInquiry.id]: [nextReply, nextSystemLog, ...(current[selectedInquiry.id] ?? [])],
    }));

    setInquiryItems((current) =>
      current.map((item) =>
        item.id === selectedInquiry.id
          ? {
              ...item,
              status: "답변 완료",
              latestResponder: "김호진",
              updatedAt: "방금 전",
            }
          : item,
      ),
    );

    setReplyDraft("");
    setSaveNotice("문의 답변을 저장했고, 상태를 답변 완료로 갱신했습니다.");
  };

  if (loadErrorScenario) {
    return (
      <AdminStatePage
        title="문의 대응 화면을 불러오지 못했습니다"
        description="문의 목록과 답변 이력 데이터를 가져오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요."
      />
    );
  }

  return (
    <section className="admin-page">
      <PageHeader
        title="사용자 문의 대응"
        description="문의별 관리자 답변 기록을 저장하고, 최근 응답 이력을 운영 관점에서 확인합니다."
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
            {inquiryItems.length > 0 ? inquiryItems.map((inquiry) => {
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
            }) : (
              <AdminStateNotice
                title="대기 중인 문의가 없습니다"
                description="새 사용자 문의가 등록되면 이 목록에 표시됩니다."
                tone="empty"
              />
            )}
          </div>
        </section>

        <section className="admin-panel">
          {selectedInquiry ? (
            <>
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

              <div className="admin-detail-card">
                <div className="admin-panel-head" style={{ marginBottom: 12 }}>
                  <div>
                    <h2>답변 작성</h2>
                    <p className="admin-panel-subtitle">
                      문의 목록에서 항목을 선택한 뒤 이 영역에서 바로 답변을 작성합니다.
                    </p>
                  </div>
                  {latestAdminReply ? (
                    <span className="admin-panel-note">
                      최근 답변: {latestAdminReply.author} · {latestAdminReply.at}
                    </span>
                  ) : (
                    <span className="admin-panel-note">아직 저장된 답변이 없습니다</span>
                  )}
                </div>

                <textarea
                  value={replyDraft}
                  onChange={(event) => setReplyDraft(event.target.value)}
                  style={{
                    width: "100%",
                    minHeight: 164,
                    border: "1px solid var(--line)",
                    borderRadius: 16,
                    background: "#f8fbf8",
                    padding: "14px 16px",
                    color: "inherit",
                    resize: "vertical",
                    lineHeight: 1.6,
                    font: "inherit",
                  }}
                  placeholder={
                    selectedInquiry.status === "답변 완료"
                      ? "추가 안내가 필요하면 후속 답변을 작성하세요"
                      : "선택한 문의에 대한 관리자 답변을 입력하세요"
                  }
                />

                {saveNotice ? (
                  <div
                    style={{
                      marginTop: 12,
                      border: "1px solid rgba(45, 143, 125, 0.24)",
                      borderRadius: 12,
                      background: "#eef8f5",
                      color: "#155346",
                      fontSize: 12,
                      padding: "10px 12px",
                    }}
                  >
                    {saveNotice}
                  </div>
                ) : null}

                <div className="admin-toolbar" style={{ marginTop: 14, marginBottom: 0 }}>
                  <span className="admin-toolbar-note">
                    저장 시 상태는 `답변 완료`로 갱신되고 이력에 바로 반영됩니다.
                  </span>
                  <div className="admin-button-row">
                    <button
                      type="button"
                      className="admin-button admin-button--ghost"
                      onClick={() => setReplyDraft("")}
                      disabled={!replyDraft.trim()}
                    >
                      초기화
                    </button>
                    <button
                      type="button"
                      className="admin-button"
                      onClick={handleSubmitReply}
                      disabled={!replyDraft.trim()}
                    >
                      <Send size={14} />
                      답변 저장
                    </button>
                  </div>
                </div>
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
            </>
          ) : (
            <AdminStateNotice
              title="확인할 문의가 없습니다"
              description="문의가 접수되면 이 영역에서 상세 정보와 답변 이력을 확인할 수 있습니다."
              tone="empty"
            />
          )}
        </section>
      </div>
    </section>
  );
}
