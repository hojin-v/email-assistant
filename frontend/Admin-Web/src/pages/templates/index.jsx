const templates = [
  { name: "가격문의 기본 응답", category: "가격문의", version: "v3", status: "운영중" },
  { name: "불만접수 1차 안내", category: "불만접수", version: "v2", status: "운영중" },
  { name: "미팅요청 일정조율", category: "미팅요청", version: "v5", status: "검토중" },
];

export function TemplatesPage() {
  return (
    <section className="admin-page">
      <header className="admin-page-head">
        <h1>템플릿 운영</h1>
        <p>카테고리별 템플릿 버전과 운영 상태를 확인합니다.</p>
      </header>

      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>템플릿명</th>
                <th>카테고리</th>
                <th>버전</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((tpl) => (
                <tr key={tpl.name}>
                  <td>{tpl.name}</td>
                  <td>{tpl.category}</td>
                  <td>{tpl.version}</td>
                  <td>{tpl.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
