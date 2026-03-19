import { useState } from "react";
import { useSearchParams } from "react-router";
import {
  accessPolicies,
  departmentPolicies,
  memberSummary,
  members,
} from "../../shared/mock/adminData";
import { MetricCard } from "../../shared/ui/MetricCard";
import { PageHeader } from "../../shared/ui/PageHeader";
import { AdminStateNotice } from "../../shared/ui/AdminStateNotice";
import { AdminStatePage } from "../../shared/ui/AdminStatePage";
import { StatusBadge } from "../../shared/ui/StatusBadge";

export function MembersPage() {
  const [searchParams] = useSearchParams();
  const scenarioId = searchParams.get("scenario");
  const loadErrorScenario = scenarioId === "admin-members-load-error";
  const emptyScenario = scenarioId === "admin-members-empty";
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("전체");

  const departments = ["전체", ...new Set(members.map((member) => member.department))];
  const filteredMembers = (emptyScenario ? [] : members).filter((member) => {
    const matchesDepartment =
      department === "전체" || member.department === department;
    const keyword = search.trim().toLowerCase();
    const matchesSearch =
      keyword.length === 0 ||
      [member.name, member.email, member.role, member.taxonomyScope]
        .join(" ")
        .toLowerCase()
        .includes(keyword);

    return matchesDepartment && matchesSearch;
  });

  if (loadErrorScenario) {
    return (
      <AdminStatePage
        title="회원 관리 화면을 불러오지 못했습니다"
        description="회원 목록과 부서 정책 데이터를 가져오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요."
      />
    );
  }

  return (
    <section className="admin-page">
      <PageHeader
        title="회원 관리"
        description="사용자 조회, 소속 부서 정책, 업종 / 카테고리 운영 범위를 한 화면에서 확인합니다."
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
            업종 / 카테고리 운영 범위는 부서 정책과 함께 보여줍니다.
          </span>
        </div>

        <div className="admin-table-wrap">
          {filteredMembers.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>이메일</th>
                  <th>부서</th>
                  <th>권한</th>
                  <th>상태</th>
                  <th>운영 범위</th>
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
                    <td>{member.taxonomyScope}</td>
                    <td>{member.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <AdminStateNotice
              title="조건에 맞는 회원이 없습니다"
              description="검색어나 부서 필터를 조정하면 다른 회원을 확인할 수 있습니다."
            />
          )}
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
            <h2>업종 / 카테고리 운영 정책</h2>
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
