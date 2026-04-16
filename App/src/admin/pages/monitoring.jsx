import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { useSearchParams } from "react-router";
import { processingJobs } from "../shared/mock/adminData";
import { PageHeader } from "../shared/ui/PageHeader";
import { AdminModal } from "../shared/ui/AdminModal";
import { AdminStateNotice } from "../shared/ui/AdminStateNotice";
import { AdminStatePage } from "../shared/ui/AdminStatePage";
import { StatusBadge } from "../shared/ui/StatusBadge";

const deletableStatuses = new Set(["실패", "대기"]);

export function MonitoringPage() {
  const [searchParams] = useSearchParams();
  const scenarioId = searchParams.get("scenario");
  const loadErrorScenario = scenarioId === "admin-monitoring-load-error";
  const emptyScenario = scenarioId === "admin-monitoring-empty";
  const deleteDialogScenario = scenarioId === "admin-monitoring-delete-dialog-normal";
  const deleteErrorScenario = scenarioId === "admin-monitoring-delete-error";

  const availableJobs = useMemo(
    () => processingJobs.filter((job) => deletableStatuses.has(job.status)),
    [],
  );

  const initialJobs = emptyScenario ? [] : availableJobs;
  const initialDeleteTarget =
    deleteDialogScenario || deleteErrorScenario
      ? initialJobs[0] ?? null
      : null;

  const [jobs, setJobs] = useState(initialJobs);
  const [deleteTarget, setDeleteTarget] = useState(initialDeleteTarget);
  const [deleteErrorNotice, setDeleteErrorNotice] = useState(
    deleteErrorScenario
      ? "작업 강제 삭제 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요."
      : "",
  );

  useEffect(() => {
    const nextJobs = emptyScenario ? [] : availableJobs;
    setJobs(nextJobs);
    setDeleteTarget((deleteDialogScenario || deleteErrorScenario) ? nextJobs[0] ?? null : null);
  }, [availableJobs, deleteDialogScenario, deleteErrorScenario, emptyScenario]);

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
        title="삭제 대상 작업을 불러오지 못했습니다"
        description="실패 또는 대기 상태의 작업 목록을 가져오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요."
      />
    );
  }

  return (
    <section className="admin-page">
      <PageHeader
        title="시스템 운영 모니터링"
        description="실패 또는 대기 상태의 메일 처리 작업만 확인하고 강제 삭제합니다."
      />

      <section className="admin-panel">
        <div className="admin-panel-head">
          <div>
            <h2>강제 삭제 대상 작업</h2>
            <p className="admin-panel-subtitle">
              실패 또는 대기 상태의 작업만 표시됩니다.
            </p>
          </div>
          <span className="admin-panel-note">{jobs.length}건</span>
        </div>

        {deleteErrorNotice ? (
          <AdminStateNotice
            title="작업 강제 삭제를 처리하지 못했습니다"
            description={deleteErrorNotice}
            tone="error"
            compact
          />
        ) : null}

        <div className="admin-stack">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <article key={job.id} className="admin-list-card admin-job-card">
                <div className="admin-job-card-main">
                  <div className="admin-list-card-row">
                    <div>
                      <h3>{job.id}</h3>
                      <p>
                        {job.jobType} · {job.category}
                      </p>
                    </div>
                    <StatusBadge>{job.status}</StatusBadge>
                  </div>

                  <div className="admin-job-card-meta">
                    <span>
                      {job.userName} · {job.userEmail}
                    </span>
                    <span>생성 {job.createdAt}</span>
                    <span>갱신 {job.updatedAt}</span>
                  </div>

                  {job.failureReason ? (
                    <p className="admin-inline-note">실패 원인: {job.failureReason}</p>
                  ) : (
                    <p className="admin-inline-note">현재 대기 상태 작업입니다.</p>
                  )}
                </div>

                <div className="admin-button-row admin-button-row--spaced admin-job-card-actions">
                  <button
                    type="button"
                    className="admin-button admin-button--sm"
                    onClick={() => setDeleteTarget(job)}
                  >
                    <Trash2 size={14} />
                    강제 삭제
                  </button>
                </div>
              </article>
            ))
          ) : (
            <AdminStateNotice
              title="강제 삭제할 작업이 없습니다"
              description="현재 실패 또는 대기 상태의 작업이 없어 정리할 항목이 없습니다."
              tone="empty"
            />
          )}
        </div>
      </section>

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
              ) : (
                <p className="admin-inline-note">현재 대기 상태 작업입니다.</p>
              )}
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
