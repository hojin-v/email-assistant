import { useState } from "react";
import {
  accessPolicies,
  departmentPolicies,
  memberSummary,
  members,
} from "../../shared/mock/adminData";
import { MetricCard } from "../../shared/ui/MetricCard";
import { PageHeader } from "../../shared/ui/PageHeader";
import { StatusBadge } from "../../shared/ui/StatusBadge";

export function MembersPage() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("전체");

  const departments = ["전체", ...new Set(members.map((member) => member.department))];
  const filteredMembers = members.filter((member) => {
    const matchesDepartment =
      department === "전체" || member.department === department;
    const keyword = search.trim().toLowerCase();
    const matchesSearch =
      keyword.length === 0 ||
      [member.name, member.email, member.role, member.templateScope]
        .join(" ")
        .toLowerCase()
        .includes(keyword);

    return matchesDepartment && matchesSearch;
  });

  return (
    <section className="admin-page">
      <PageHeader
        title="회원 관리"
        description="사용자 조회, 소속 부서 정책, 템플릿 접근 권한 구조를 한 화면에서 확인합니다."
        actions={
          <button type="button" className="admin-button admin-button--ghost" disabled>
            부서/권한 편집 준비 중
          </button>
        }
      />

      <div className="admin-card-grid admin-card-grid--three">
        {memberSummary.map((item, index) => (
          <MetricCard
            key={item.label}
            label={item.label}
            value={item.value}
            hint={item.hint}
            tone={index === 0 ? "accent" : "default"}
          />
        ))}
      </div>

      <section className="admin-panel">
        <div className="admin-toolbar">
          <div className="admin-toolbar-group">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="admin-input"
              placeholder="이름, 이메일, 권한, 접근 범위 검색"
            />
            <select
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              className="admin-select"
            >
              {departments.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <span className="admin-toolbar-note">
            템플릿 접근 범위는 부서 정책과 함께 보여줍니다.
          </span>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>이메일</th>
                <th>부서</th>
                <th>권한</th>
                <th>상태</th>
                <th>템플릿 접근 범위</th>
                <th>최근 활동</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.email}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{member.department}</td>
                  <td>{member.role}</td>
                  <td>
                    <StatusBadge>{member.status}</StatusBadge>
                  </td>
                  <td>{member.templateScope}</td>
                  <td>{member.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="admin-split-grid">
        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>소속 부서 관리</h2>
            <button type="button" className="admin-button admin-button--ghost" disabled>
              부서 추가 준비 중
            </button>
          </div>

          <div className="admin-stack">
            {departmentPolicies.map((departmentItem) => (
              <article key={departmentItem.name} className="admin-list-card">
                <div>
                  <h3>{departmentItem.name}</h3>
                  <p>{departmentItem.policy}</p>
                </div>
                <dl className="admin-meta-grid">
                  <div>
                    <dt>부서 관리자</dt>
                    <dd>{departmentItem.owner}</dd>
                  </div>
                  <div>
                    <dt>구성원</dt>
                    <dd>{departmentItem.members}명</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-head">
            <h2>템플릿 접근 권한 정책</h2>
            <span className="admin-panel-note">문서 기준 권한 구조</span>
          </div>

          <div className="admin-stack">
            {accessPolicies.map((policy) => (
              <article key={policy.title} className="admin-list-card">
                <div>
                  <h3>{policy.title}</h3>
                  <p>{policy.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
