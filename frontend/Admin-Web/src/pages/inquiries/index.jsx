import { useEffect, useMemo, useState } from "react";
import { Filter, Send } from "lucide-react";
import { useSearchParams } from "react-router";
import { inquiries, responseHistory } from "../../shared/mock/adminData";
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
  const replyErrorScenario = scenarioId === "admin-inquiries-reply-error";
  const [inquiryItems, setInquiryItems] = useState(emptyScenario ? [] : inquiries);
  const [historyMap, setHistoryMap] = useState(responseHistory);
  const [selectedId, setSelectedId] = useState(
    (emptyScenario ? [] : inquiries)[0]?.id ?? "",
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [replyDraft, setReplyDraft] = useState(
    replyErrorScenario ? "안녕하세요. 확인 후 다시 안내드리겠습니다." : "",
  );
  const [saveNotice, setSaveNotice] = useState("");
  const [errorNotice, setErrorNotice] = useState(
    replyErrorScenario
      ? "관리자 답변 저장 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요."
      : "",
  );

  useEffect(() => {
    if (emptyScenario) {
      setInquiryItems([]);
      setSelectedId("");
      return;
    }

    setInquiryItems(inquiries);
    setSelectedId((current) => current || inquiries[0]?.id || "");
  }, [emptyScenario]);

  const filteredInquiries = useMemo(
    () =>
      statusFilter === "all"
        ? inquiryItems
        : inquiryItems.filter((item) => item.status === statusFilter),
    [inquiryItems, statusFilter],
  );

  useEffect(() => {
    if (!filteredInquiries.length) {
      setSelectedId("");
      return;
    }

    if (!filteredInquiries.some((item) => item.id === selectedId)) {
      setSelectedId(filteredInquiries[0].id);
    }
  }, [filteredInquiries, selectedId]);

  const selectedInquiry =
    filteredInquiries.find((inquiry) => inquiry.id === selectedId) ?? filteredInquiries[0] ?? null;
  const history = historyMap[selectedInquiry?.id] ?? [];

  const summaryCards = useMemo(
    () => [
      {
        label: "전체 문의",
        value: `${inquiryItems.length}건`,
        hint: "관리자 문의 전체 건수",
      },
      {
        label: "답변 전",
        value: `${inquiryItems.filter((item) => item.status === "답변전").length}건`,
        hint: "우선 확인 필요",
      },
      {
        label: "답변 완료",
        value: `${inquiryItems.filter((item) => item.status === "답변완료").length}건`,
        hint: "관리자 회신 완료",
      },
    ],
    [inquiryItems],
  );

  const handleSubmitReply = () => {
    const trimmedReply = replyDraft.trim();

    if (!selectedInquiry || !trimmedReply) {
      return;
    }

    if (replyErrorScenario) {
      setSaveNotice("");
      setErrorNotice("관리자 답변 저장 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    const nextReply = {
      at: "방금 전",
      author: "관리자",
      channel: "관리자 답변",
      note: trimmedReply,
    };

    const nextSystemLog = {
      at: "방금 전",
      author: "시스템",
      channel: "상태 갱신",
      note: "문의 상태를 답변완료로 변경하고 답변 이력을 저장했습니다.",
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
              status: "답변완료",
              latestResponder: "관리자",
              updatedAt: "방금 전",
            }
          : item,
      ),
    );

    setReplyDraft("");
    setErrorNotice("");
    setSaveNotice("답변을 저장했고 문의 상태를 답변완료로 갱신했습니다.");
  };

  useEffect(() => {
    setReplyDraft(replyErrorScenario ? "안녕하세요. 확인 후 다시 안내드리겠습니다." : "");
    setSaveNotice("");
    setErrorNotice(
      replyErrorScenario
        ? "관리자 답변 저장 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요."
        : "",
    );
  }, [replyErrorScenario, selectedId]);

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
        title="문의 대응"
        description="상태별 문의를 확인하고, 상세 내용과 답변 이력을 보면서 관리자 답변을 작성합니다."
      />

      <div className="admin-card-grid admin-card-grid--three">
        {summaryCards.map((card, index) => (
          <MetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            hint={card.hint}
            tone={index === 1 ? "warn" : index === 2 ? "accent" : "default"}
          />
        ))}
      </div>

      <div className="admin-master-detail">
        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h2>문의 목록</h2>
              <p className="admin-panel-subtitle">
                답변 상태별로 필터링하고 최근 문의부터 확인합니다.
              </p>
            </div>
            <span className="admin-panel-note">{filteredInquiries.length}건 표시</span>
          </div>

          <div className="admin-toolbar">
            <div className="admin-toolbar-group">
              <span className="admin-filter-label">
                <Filter size={14} />
                상태
              </span>
              <button
                type="button"
                className={statusFilter === "all" ? "admin-chip admin-chip--active" : "admin-chip"}
                onClick={() => setStatusFilter("all")}
              >
                전체
              </button>
              <button
                type="button"
                className={statusFilter === "답변전" ? "admin-chip admin-chip--active" : "admin-chip"}
                onClick={() => setStatusFilter("답변전")}
              >
                답변전
              </button>
              <button
                type="button"
                className={statusFilter === "답변완료" ? "admin-chip admin-chip--active" : "admin-chip"}
                onClick={() => setStatusFilter("답변완료")}
              >
                답변완료
              </button>
            </div>
          </div>

          <div className="admin-stack">
            {filteredInquiries.length > 0 ? (
              filteredInquiries.map((inquiry) => {
                const isSelected = inquiry.id === selectedInquiry?.id;

                return (
                  <button
                    key={inquiry.id}
                    type="button"
                    onClick={() => setSelectedId(inquiry.id)}
                    className={isSelected ? "admin-master-item admin-master-item--active" : "admin-master-item"}
                  >
                    <div className="admin-master-item-head">
                      <strong>{inquiry.id}</strong>
                      <StatusBadge>{inquiry.status}</StatusBadge>
                    </div>
                    <p className="admin-master-item-title">{inquiry.title}</p>
                    <p className="admin-master-item-copy">
                      {inquiry.requester} · {inquiry.company}
                    </p>
                    <div className="admin-master-item-meta">
                      <span>{inquiry.industry}</span>
                      <span>{inquiry.latestResponder}</span>
                      <span>{inquiry.updatedAt}</span>
                    </div>
                  </button>
                );
              })
            ) : (
              <AdminStateNotice
                title="조건에 맞는 문의가 없습니다"
                description="다른 상태 필터를 선택하면 문의 목록을 다시 확인할 수 있습니다."
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
                  <h2>문의 상세</h2>
                  <p className="admin-panel-subtitle">
                    {selectedInquiry.requester} · {selectedInquiry.company}
                  </p>
                </div>
                <StatusBadge>{selectedInquiry.status}</StatusBadge>
              </div>

              <div className="admin-detail-card">
                <dl className="admin-meta-grid">
                  <div>
                    <dt>문의 제목</dt>
                    <dd>{selectedInquiry.title}</dd>
                  </div>
                  <div>
                    <dt>이메일</dt>
                    <dd>{selectedInquiry.email}</dd>
                  </div>
                  <div>
                    <dt>업종</dt>
                    <dd>{selectedInquiry.industry}</dd>
                  </div>
                  <div>
                    <dt>접수 시각</dt>
                    <dd>{selectedInquiry.createdAt}</dd>
                  </div>
                  <div>
                    <dt>최근 업데이트</dt>
                    <dd>{selectedInquiry.updatedAt}</dd>
                  </div>
                  <div>
                    <dt>최근 응답자</dt>
                    <dd>{selectedInquiry.latestResponder}</dd>
                  </div>
                </dl>
              </div>

              <div className="admin-detail-card">
                <h3>문의 내용</h3>
                <p className="admin-detail-copy">{selectedInquiry.content}</p>
              </div>

              <div className="admin-detail-card">
                <div className="admin-panel-head" style={{ marginBottom: 12 }}>
                  <div>
                    <h2>관리자 답변 작성</h2>
                    <p className="admin-panel-subtitle">
                      답변 저장 시 상태는 자동으로 답변완료로 변경됩니다.
                    </p>
                  </div>
                </div>

                <textarea
                  value={replyDraft}
                  onChange={(event) => setReplyDraft(event.target.value)}
                  className="admin-textarea"
                  rows={6}
                  placeholder="고객에게 전달할 관리자 답변을 입력하세요"
                />

                {errorNotice ? (
                  <div className="admin-feedback">{errorNotice}</div>
                ) : null}

                {saveNotice ? (
                  <div className="admin-feedback admin-feedback--success">{saveNotice}</div>
                ) : null}

                <div className="admin-button-row" style={{ justifyContent: "flex-end", marginTop: 14 }}>
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

              <div className="admin-detail-card">
                <div className="admin-panel-head">
                  <div>
                    <h2>답변 이력</h2>
                    <p className="admin-panel-subtitle">
                      문의 접수부터 관리자 답변까지의 기록입니다.
                    </p>
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
              </div>
            </>
          ) : (
            <AdminStateNotice
              title="확인할 문의가 없습니다"
              description="왼쪽 목록에서 문의를 선택하면 상세 내용과 답변 이력이 표시됩니다."
              tone="empty"
            />
          )}
        </section>
      </div>
    </section>
  );
}
