const users = [
  { name: "김호진", role: "관리자", email: "admin@company.com", status: "활성" },
  { name: "박민수", role: "운영", email: "ops1@company.com", status: "활성" },
  { name: "이진아", role: "운영", email: "ops2@company.com", status: "대기" },
];

export function UsersPage() {
  return (
    <section className="admin-page">
      <header className="admin-page-head">
        <h1>사용자 관리</h1>
        <p>운영자 권한과 계정 상태를 관리합니다.</p>
      </header>

      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>권한</th>
                <th>이메일</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.email}>
                  <td>{user.name}</td>
                  <td>{user.role}</td>
                  <td>{user.email}</td>
                  <td>{user.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
