const inboxQueue = [
  { id: "Q-1032", type: "검토 대기", count: 9, latest: "1분 전" },
  { id: "Q-1033", type: "자동 발송 실패", count: 2, latest: "4분 전" },
  { id: "Q-1034", type: "미분류 이메일", count: 5, latest: "8분 전" },
];

export function InboxMonitorPage() {
  return (
    <section className="admin-page">
      <header className="admin-page-head">
        <h1>수신함 모니터링</h1>
        <p>실시간 처리 큐와 오류를 모니터링합니다.</p>
      </header>

      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>큐 ID</th>
                <th>유형</th>
                <th>건수</th>
                <th>최신 이벤트</th>
              </tr>
            </thead>
            <tbody>
              {inboxQueue.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.type}</td>
                  <td>{row.count}</td>
                  <td>{row.latest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
