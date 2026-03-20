import { useEffect, useMemo, useState } from "react";
import { Filter, Search, Trash2 } from "lucide-react";
import { useSearchParams } from "react-router";
import { processingJobLogs, processingJobs } from "../../shared/mock/adminData";
import { MetricCard } from "../../shared/ui/MetricCard";
import { PageHeader } from "../../shared/ui/PageHeader";
import { AdminModal } from "../../shared/ui/AdminModal";
import { AdminStateNotice } from "../../shared/ui/AdminStateNotice";
import { AdminStatePage } from "../../shared/ui/AdminStatePage";
import { StatusBadge } from "../../shared/ui/StatusBadge";

export function MonitoringPage() {
  const [searchParams] = useSearchParams();
  const scenarioId = searchParams.get("scenario");
  const loadErrorScenario = scenarioId === "admin-monitoring-load-error";
  const emptyScenario = scenarioId === "admin-monitoring-empty";
  const deleteDialogScenario = scenarioId === "admin-monitoring-delete-dialog-normal";
  const deleteErrorScenario = scenarioId === "admin-monitoring-delete-error";
  const initialDeleteTarget =
    deleteDialogScenario || deleteErrorScenario
      ? processingJobs.find((job) => job.status === "실패" || job.status === "대기") ?? null
      : null;
  const [jobs, setJobs] = useState(emptyScenario ? [] : processingJobs);
  const [selectedJobId, setSelectedJobId] = useState(
    (emptyScenario ? [] : processingJobs)[0]?.id ?? "",
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(initialDeleteTarget);
  const [deleteErrorNotice, setDeleteErrorNotice] = useState(
    deleteErrorScenario
      ? "작업 강제 삭제 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요."
      : "",
  );

  useEffect(() => {
    if (emptyScenario) {
      setJobs([]);
      setSelectedJobId("");
      return;
    }

    setJobs(processingJobs);
    setSelectedJobId((current) => current || processingJobs[0]?.id || "");
  }, [emptyScenario]);

  const filteredJobs = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesStatus = statusFilter === "all" || job.status === statusFilter;
      const matchesKeyword =
        keyword.length === 0 ||
        [job.id, job.userName, job.userEmail, job.jobType, job.category]
          .join(" ")
          .toLowerCase()
          .includes(keyword);

      return matchesStatus && matchesKeyword;
    });
  }, [jobs, search, statusFilter]);

  useEffect(() => {
    if (!filteredJobs.length) {
      setSelectedJobId("");
      return;
    }

    if (!filteredJobs.some((job) => job.id === selectedJobId)) {
      setSelectedJobId(filteredJobs[0].id);
    }
  }, [filteredJobs, selectedJobId]);

  const selectedJob =
    filteredJobs.find((job) => job.id === selectedJobId) ?? filteredJobs[0] ?? null;
  const logs = processingJobLogs[selectedJob?.id] ?? [];

  const summaryCards = useMemo(
    () => [
      {
        label: "전체 작업",
        value: `${jobs.length}건`,
        hint: "최근 메일 처리 작업",
      },
      {
        label: "성공",
        value: `${jobs.filter((job) => job.status === "성공").length}건`,
        hint: "정상 완료",
      },
      {
        label: "실패",
        value: `${jobs.filter((job) => job.status === "실패").length}건`,
        hint: "원인 로그 확인 필요",
      },
      {
        label: "대기",
        value: `${jobs.filter((job) => job.status === "대기").length}건`,
        hint: "강제 삭제 가능",
      },
    ],
    [jobs],
  );

  const handleDeleteJob = () => {
    if (!deleteTarget) {
      return;
    }

    if (deleteErrorScenario) {
      setDeleteErrorNotice("작업 강제 삭제 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    setJobs((current) => current.filter((job) => job.id !== deleteTarget.id));
    setDeleteErrorNotice("");
    setDeleteTarget(null);
  };

  if (loadErrorScenario) {
    return (
      <AdminStatePage
        title="시스템 운영 모니터링을 불러오지 못했습니다"
        description="최근 메일 처리 작업과 실패 로그 데이터를 가져오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요."
      />
    );
  }

  return (
    <section className="admin-page">
      <PageHeader
        title="시스템 운영 모니터링"
        description="최근 메일 처리 작업의 상태, 실패 원인 로그, 대기/실패 작업 정리 액션을 확인합니다."
      />

      <div className="admin-card-grid admin-card-grid--four">
        {summaryCards.map((card, index) => (
          <MetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            hint={card.hint}
            tone={index === 2 ? "warn" : index === 1 ? "accent" : "default"}
          />
        ))}
      </div>

      <div className="admin-master-detail">
        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h2>최근 메일 처리 작업</h2>
              <p className="admin-panel-subtitle">
                성공, 실패, 대기 상태별로 작업을 조회합니다.
              </p>
            </div>
            <span className="admin-panel-note">{filteredJobs.length}건 표시</span>
          </div>

          <div className="admin-toolbar">
            <div className="admin-toolbar-group">
              <div className="admin-input-wrap">
                <Search size={14} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="admin-input admin-input--compact"
                  placeholder="작업 ID / 사용자 / 유형 검색"
                />
              </div>
            </div>
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
                className={statusFilter === "성공" ? "admin-chip admin-chip--active" : "admin-chip"}
                onClick={() => setStatusFilter("성공")}
              >
                성공
              </button>
              <button
                type="button"
                className={statusFilter === "실패" ? "admin-chip admin-chip--active" : "admin-chip"}
                onClick={() => setStatusFilter("실패")}
              >
                실패
              </button>
              <button
                type="button"
                className={statusFilter === "대기" ? "admin-chip admin-chip--active" : "admin-chip"}
                onClick={() => setStatusFilter("대기")}
              >
                대기
              </button>
            </div>
          </div>

          <div className="admin-stack">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => {
                const isSelected = job.id === selectedJob?.id;

                return (
                  <button
                    key={job.id}
                    type="button"
                    className={isSelected ? "admin-master-item admin-master-item--active" : "admin-master-item"}
                    onClick={() => setSelectedJobId(job.id)}
                  >
                    <div className="admin-master-item-head">
                      <strong>{job.id}</strong>
                      <StatusBadge>{job.status}</StatusBadge>
                    </div>
                    <p className="admin-master-item-title">
                      {job.jobType} · {job.category}
                    </p>
                    <p className="admin-master-item-copy">
                      {job.userName} · {job.userEmail}
                    </p>
                    <div className="admin-master-item-meta">
                      <span>{job.emailDomain}</span>
                      <span>{job.createdAt}</span>
                      <span>{job.failureReason || "오류 없음"}</span>
                    </div>
                  </button>
                );
              })
            ) : (
              <AdminStateNotice
                title="조건에 맞는 작업이 없습니다"
                description="상태 필터나 검색어를 변경하면 다른 작업을 확인할 수 있습니다."
                tone="empty"
              />
            )}
          </div>
        </section>

        <section className="admin-panel">
          {selectedJob ? (
            <>
              <div className="admin-panel-head">
                <div>
                  <h2>작업 상세</h2>
                  <p className="admin-panel-subtitle">
                    {selectedJob.jobType} · {selectedJob.id}
                  </p>
                </div>
                {selectedJob.status === "실패" || selectedJob.status === "대기" ? (
                  <button
                    type="button"
                    className="admin-button"
                    onClick={() => setDeleteTarget(selectedJob)}
                  >
                    <Trash2 size={14} />
                    강제 삭제
                  </button>
                ) : null}
              </div>

              {deleteErrorNotice ? (
                <AdminStateNotice
                  title="작업 강제 삭제를 처리하지 못했습니다"
                  description={deleteErrorNotice}
                  tone="error"
                  compact
                />
              ) : null}

              <div className="admin-detail-card">
                <dl className="admin-meta-grid">
                  <div>
                    <dt>사용자</dt>
                    <dd>{selectedJob.userName}</dd>
                  </div>
                  <div>
                    <dt>이메일</dt>
                    <dd>{selectedJob.userEmail}</dd>
                  </div>
                  <div>
                    <dt>도메인</dt>
                    <dd>{selectedJob.emailDomain}</dd>
                  </div>
                  <div>
                    <dt>작업 유형</dt>
                    <dd>{selectedJob.jobType}</dd>
                  </div>
                  <div>
                    <dt>카테고리</dt>
                    <dd>{selectedJob.category}</dd>
                  </div>
                  <div>
                    <dt>상태</dt>
                    <dd>{selectedJob.status}</dd>
                  </div>
                  <div>
                    <dt>생성 시각</dt>
                    <dd>{selectedJob.createdAt}</dd>
                  </div>
                  <div>
                    <dt>최종 갱신</dt>
                    <dd>{selectedJob.updatedAt}</dd>
                  </div>
                  <div>
                    <dt>실패 원인</dt>
                    <dd>{selectedJob.failureReason || "없음"}</dd>
                  </div>
                </dl>
              </div>

              <div className="admin-detail-card">
                <div className="admin-panel-head">
                  <div>
                    <h2>실행 로그</h2>
                    <p className="admin-panel-subtitle">
                      작업 시작부터 현재 상태까지의 로그를 시간 순으로 확인합니다.
                    </p>
                  </div>
                </div>

                <div className="admin-timeline">
                  {logs.map((log) => (
                    <article key={`${selectedJob.id}-${log.at}-${log.level}`} className="admin-timeline-item">
                      <div className="admin-timeline-marker" />
                      <div className="admin-timeline-content">
                        <div className="admin-timeline-meta">
                          <strong>{log.level}</strong>
                          <span>{log.at}</span>
                        </div>
                        <p>{log.message}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <AdminStateNotice
              title="확인할 작업이 없습니다"
              description="왼쪽 목록에서 작업을 선택하면 상세 정보와 로그가 표시됩니다."
              tone="empty"
            />
          )}
        </section>
      </div>

      <AdminModal
        open={Boolean(deleteTarget)}
        title="이 작업을 강제 삭제할까요?"
        description="실패 또는 대기 상태의 작업만 삭제할 수 있으며, 삭제 후에는 이 목록에서 즉시 제거됩니다."
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
            <button type="button" className="admin-button" onClick={handleDeleteJob}>
              삭제
            </button>
          </>
        }
      >
        {deleteTarget ? (
          <div className="admin-stack">
            <div className="admin-list-card">
              <div className="admin-list-card-row">
                <div>
                  <h3>{deleteTarget.id}</h3>
                  <p>
                    {deleteTarget.userName} · {deleteTarget.jobType}
                  </p>
                </div>
                <StatusBadge>{deleteTarget.status}</StatusBadge>
              </div>
              {deleteTarget.failureReason ? (
                <p className="admin-inline-note">실패 원인: {deleteTarget.failureReason}</p>
              ) : null}
            </div>
            {deleteErrorScenario ? (
              <AdminStateNotice
                title="삭제 요청이 실패했습니다"
                description="현재 작업 상태가 잠시 변경되어 삭제할 수 없습니다. 새로고침 후 다시 시도해 주세요."
                tone="error"
                compact
              />
            ) : null}
          </div>
        ) : null}
      </AdminModal>
    </section>
  );
}
