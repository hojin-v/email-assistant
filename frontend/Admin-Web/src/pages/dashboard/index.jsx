const overviewCards = [
  { label: "검토 대기 초안", value: "24건", hint: "지난 1시간 +4" },
  { label: "자동 발송 성공률", value: "96.2%", hint: "전일 대비 +0.8%" },
  { label: "이메일 연동 오류", value: "3건", hint: "즉시 확인 필요", alert: true },
  { label: "미분류 이메일", value: "11건", hint: "규칙 업데이트 필요" },
];

const queueRows = [
  { name: "가격문의", pending: 7, avg: "1m 22s", status: "정상" },
  { name: "불만접수", pending: 4, avg: "2m 10s", status: "주의" },
  { name: "미팅요청", pending: 6, avg: "1m 04s", status: "정상" },
  { name: "기술지원", pending: 7, avg: "3m 31s", status: "주의" },
];

export function DashboardPage() {
  return (
    <section className="admin-page">
      <header className="admin-page-head">
        <h1>운영 대시보드</h1>
        <p>서비스 상태와 처리 큐를 한 번에 확인합니다.</p>
      </header>

      <div className="admin-card-grid">
        {overviewCards.map((card) => (
          <article key={card.label} className={card.alert ? "admin-card admin-card--alert" : "admin-card"}>
            <p className="admin-card-label">{card.label}</p>
            <p className="admin-card-value">{card.value}</p>
            <p className="admin-card-hint">{card.hint}</p>
          </article>
        ))}
      </div>

      <section className="admin-panel">
        <h2>카테고리별 처리 큐</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>카테고리</th>
                <th>대기 건수</th>
                <th>평균 처리시간</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {queueRows.map((row) => (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td>{row.pending}</td>
                  <td>{row.avg}</td>
                  <td>
                    <span className={row.status === "주의" ? "status status--warn" : "status status--ok"}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
