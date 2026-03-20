import { useMemo } from "react";
import { useSearchParams } from "react-router";
import {
  dashboardMetrics,
  emailDomainDistribution,
  mailProcessingByPeriod,
  recentDashboardInquiries,
  recentSevenDayTrend,
} from "../shared/mock/adminData";
import { MetricCard } from "../shared/ui/MetricCard";
import { PageHeader } from "../shared/ui/PageHeader";
import { AdminStateNotice } from "../shared/ui/AdminStateNotice";
import { AdminStatePage } from "../shared/ui/AdminStatePage";
import { StatusBadge } from "../shared/ui/StatusBadge";

export function DashboardPage() {
  const [searchParams] = useSearchParams();
  const scenarioId = searchParams.get("scenario");
  const loadErrorScenario = scenarioId === "admin-dashboard-load-error";
  const trendErrorScenario =
    scenarioId === "admin-dashboard-trend-error" ||
    scenarioId === "admin-dashboard-queue-error";
  const permissionScenario = scenarioId === "admin-permission-denied";
  const unexpectedScenario = scenarioId === "admin-unexpected-error";

  const maxProcessed = useMemo(
    () => Math.max(...mailProcessingByPeriod.map((item) => item.total)),
    [],
  );
  const maxTrendProcessed = useMemo(
    () => Math.max(...recentSevenDayTrend.map((item) => item.processed)),
    [],
  );

  if (permissionScenario) {
    return (
      <AdminStatePage
        title="이 화면을 볼 권한이 없습니다"
        description="운영 대시보드 접근 권한이 없는 계정입니다. 관리자에게 권한을 요청해 주세요."
        tone="permission"
      />
    );
  }

  if (unexpectedScenario) {
    return (
      <AdminStatePage
        title="예기치 않은 오류가 발생했습니다"
        description="운영 대시보드 데이터를 렌더링하는 중 알 수 없는 문제가 발생했습니다."
      />
    );
  }

  if (loadErrorScenario) {
    return (
      <AdminStatePage
        title="운영 대시보드를 불러오지 못했습니다"
        description="운영 지표와 메일 처리 통계를 가져오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요."
      />
    );
  }

  return (
    <section className="admin-page">
      <PageHeader
        title="운영 대시보드"
        description="가입자 현황, 메일 처리량, 초안 생성 추이, 최근 문의 접수 현황을 한 화면에서 확인합니다."
      />

      <div className="admin-card-grid admin-card-grid--five">
        {dashboardMetrics.map((card) => (
          <MetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            hint={card.hint}
          />
        ))}
      </div>

      <div className="admin-split-grid">
        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h2>기간별 메일 처리량</h2>
              <p className="admin-panel-subtitle">
                일자별 총 처리량과 AI 분석 완료량, 초안 생성량을 함께 봅니다.
              </p>
            </div>
            <span className="admin-panel-note">최근 7일</span>
          </div>

          <div className="admin-stack">
            {mailProcessingByPeriod.map((item) => (
              <article key={item.label} className="admin-bar-row">
                <div className="admin-bar-meta">
                  <strong>{item.label}</strong>
                  <span>
                    총 {item.total}건 · 분석 {item.analyzed}건 · 초안 {item.drafted}건
                  </span>
                </div>
                <div className="admin-bar-track">
                  <div
                    className="admin-bar-fill"
                    style={{ width: `${(item.total / maxProcessed) * 100}%` }}
                  />
                  <div
                    className="admin-bar-overlay"
                    style={{ width: `${(item.analyzed / maxProcessed) * 100}%` }}
                  />
                </div>
                <div className="admin-inline-stat-row">
                  <span>초안 생성 비율</span>
                  <strong>{Math.round((item.drafted / item.total) * 100)}%</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h2>도메인별 이메일 분포</h2>
              <p className="admin-panel-subtitle">
                주요 수신 도메인별 비중과 오늘 처리 건수를 확인합니다.
              </p>
            </div>
            <span className="admin-panel-note">오늘 기준</span>
          </div>

          <div className="admin-stack">
            {emailDomainDistribution.map((item) => (
              <article key={item.label} className="admin-list-card">
                <div className="admin-list-card-row">
                  <div>
                    <h3>{item.label}</h3>
                    <p>{item.count}</p>
                  </div>
                  <strong>{item.share}%</strong>
                </div>
                <div className="admin-progress">
                  <div
                    className={`admin-progress-bar admin-progress-bar--${item.color}`}
                    style={{ width: `${item.share}%` }}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="admin-split-grid">
        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h2>최근 7일 처리 추이</h2>
              <p className="admin-panel-subtitle">
                일자별 처리량과 성공률을 세로 막대 차트로 요약합니다.
              </p>
            </div>
            <span className="admin-panel-note">메일 작업 성공률</span>
          </div>

          {trendErrorScenario ? (
            <AdminStateNotice
              title="최근 처리 추이를 불러오지 못했습니다"
              description="시계열 통계 패널 응답이 지연되고 있습니다. 잠시 후 다시 확인해 주세요."
            />
          ) : (
            <div className="admin-mini-chart">
              {recentSevenDayTrend.map((item) => (
                <div key={item.day} className="admin-mini-chart-item">
                  <div className="admin-mini-chart-column">
                    <div
                      className="admin-mini-chart-bar"
                      style={{ height: `${Math.max((item.processed / maxTrendProcessed) * 180, 36)}px` }}
                    />
                  </div>
                  <strong>{item.day}</strong>
                  <span>{item.processed}건</span>
                  <span>성공률 {item.successRate}%</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h2>최근 문의 접수</h2>
              <p className="admin-panel-subtitle">
                운영팀이 빠르게 확인해야 하는 최신 문의를 요약합니다.
              </p>
            </div>
            <span className="admin-panel-note">최근 3건</span>
          </div>

          <div className="admin-stack">
            {recentDashboardInquiries.map((inquiry) => (
              <article key={inquiry.id} className="admin-list-card">
                <div className="admin-list-card-row">
                  <div>
                    <h3>{inquiry.title}</h3>
                    <p>
                      {inquiry.requester} · {inquiry.company}
                    </p>
                  </div>
                  <StatusBadge>{inquiry.status}</StatusBadge>
                </div>
                <div className="admin-inline-stat-row">
                  <span>{inquiry.id}</span>
                  <strong>{inquiry.receivedAt}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
