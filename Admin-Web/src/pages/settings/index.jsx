export function SettingsPage() {
  return (
    <section className="admin-page">
      <header className="admin-page-head">
        <h1>운영 설정</h1>
        <p>알림 임계치, 자동화 정책, 접근 권한 기본값을 설정합니다.</p>
      </header>

      <section className="admin-panel">
        <div className="admin-setting-grid">
          <article className="admin-card">
            <p className="admin-card-label">검토 대기 알림 임계치</p>
            <p className="admin-card-value">3건 이상</p>
            <p className="admin-card-hint">초안 누적 시 즉시 알림</p>
          </article>
          <article className="admin-card">
            <p className="admin-card-label">자동 발송 실패 알림</p>
            <p className="admin-card-value">ON</p>
            <p className="admin-card-hint">오류 발생 즉시 전송</p>
          </article>
          <article className="admin-card">
            <p className="admin-card-label">로그 보관 기간</p>
            <p className="admin-card-value">90일</p>
            <p className="admin-card-hint">감사 로그 자동 보관</p>
          </article>
        </div>
      </section>
    </section>
  );
}
