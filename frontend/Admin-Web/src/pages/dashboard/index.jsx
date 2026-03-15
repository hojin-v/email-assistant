import {
  dailyThroughput,
  dashboardMetrics,
  departmentUsage,
  domainDistribution,
  messagePipeline,
} from "../../shared/mock/adminData";
import { MetricCard } from "../../shared/ui/MetricCard";
import { PageHeader } from "../../shared/ui/PageHeader";
import { StatusBadge } from "../../shared/ui/StatusBadge";

export function DashboardPage() {
  return (
    <section className="admin-page">
      <PageHeader
        title="운영 대시보드"
        description="도메인별 메일 흐름, 하루 처리량, 자동 분류 정확도, 부서별 사용량을 문서 기준으로 요약합니다."
      />

      <div className="admin-card-grid">
        {dashboardMetrics.map((card, index) => (
          <MetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            hint={card.hint}
            tone={index === 2 ? "accent" : "default"}
          />
        ))}
      </div>

      <div className="admin-split-grid">
        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>도메인별 메일 비율</h2>
            <span className="admin-panel-note">최근 24시간</span>
          </div>

          <div className="admin-stack">
            {domainDistribution.map((item) => (
              <article key={item.domain} className="admin-list-card">
                <div className="admin-list-card-row">
                  <div>
                    <h3>{item.domain}</h3>
                    <p>{item.volume}</p>
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

        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>하루 처리량</h2>
            <span className="admin-panel-note">시간대별 자동화 비중</span>
          </div>

          <div className="admin-stack">
            {dailyThroughput.map((slot) => (
              <article key={slot.slot} className="admin-bar-row">
                <div className="admin-bar-meta">
                  <strong>{slot.slot}</strong>
                  <span>
                    총 {slot.processed}건 · 자동 {slot.automated}건
                  </span>
                </div>
                <div className="admin-bar-track">
                  <div
                    className="admin-bar-fill"
                    style={{ width: `${Math.min(slot.processed / 3, 100)}%` }}
                  />
                  <div
                    className="admin-bar-overlay"
                    style={{ width: `${Math.min(slot.automated / 3, 100)}%` }}
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
            <h2>부서별 사용량</h2>
            <span className="admin-panel-note">좌석 수와 주요 도메인</span>
          </div>

          <div className="admin-stack">
            {departmentUsage.map((department) => (
              <article key={department.name} className="admin-list-card">
                <div className="admin-list-card-row">
                  <div>
                    <h3>{department.name}</h3>
                    <p>주요 도메인: {department.domain}</p>
                  </div>
                  <strong>{department.usageRate}%</strong>
                </div>
                <div className="admin-progress">
                  <div
                    className="admin-progress-bar admin-progress-bar--navy"
                    style={{ width: `${department.usageRate}%` }}
                  />
                </div>
                <p className="admin-inline-note">좌석 수 {department.seats}명</p>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <div>
              <h2>메일 처리 방식</h2>
              <p className="admin-panel-subtitle">{messagePipeline.label}</p>
            </div>
            <StatusBadge>정상</StatusBadge>
          </div>

          <p className="admin-panel-copy">{messagePipeline.summary}</p>

          <div className="admin-stage-grid">
            {messagePipeline.stages.map((stage) => (
              <article key={stage.name} className="admin-stage-card">
                <div className="admin-list-card-row">
                  <strong>{stage.name}</strong>
                  <StatusBadge>{stage.status}</StatusBadge>
                </div>
                <p>{stage.desc}</p>
              </article>
            ))}
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>큐</th>
                  <th>대기 건수</th>
                  <th>지연 시간</th>
                  <th>실패 건수</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {messagePipeline.queues.map((queue) => (
                  <tr key={queue.name}>
                    <td>{queue.name}</td>
                    <td>{queue.pending}</td>
                    <td>{queue.lag}</td>
                    <td>{queue.failures}</td>
                    <td>
                      <StatusBadge>{queue.status}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
}
