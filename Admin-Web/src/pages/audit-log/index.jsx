const events = [
  { at: "2026-03-05 09:10", actor: "김호진", action: "알림 임계치 변경", target: "설정 > 알림" },
  { at: "2026-03-05 08:32", actor: "박민수", action: "템플릿 버전 배포", target: "가격문의 v3" },
  { at: "2026-03-05 08:11", actor: "시스템", action: "자동 발송 실패 감지", target: "큐 Q-1033" },
];

export function AuditLogPage() {
  return (
    <section className="admin-page">
      <header className="admin-page-head">
        <h1>감사 로그</h1>
        <p>운영자/시스템 변경 이력을 확인합니다.</p>
      </header>

      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>시간</th>
                <th>주체</th>
                <th>행동</th>
                <th>대상</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={`${event.at}-${event.actor}`}>
                  <td>{event.at}</td>
                  <td>{event.actor}</td>
                  <td>{event.action}</td>
                  <td>{event.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
