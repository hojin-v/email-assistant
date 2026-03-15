const toneByLabel = {
  활성: "ok",
  운영중: "ok",
  정상: "ok",
  "승인 완료": "ok",
  "답변 완료": "ok",
  대기: "muted",
  초안: "muted",
  검토중: "muted",
  "추가 확인": "warn",
  "개선 필요": "warn",
  주의: "warn",
  점검: "danger",
  "승인 대기": "danger",
};

export function StatusBadge({ children }) {
  const tone = toneByLabel[children] ?? "muted";

  return <span className={`status status--${tone}`}>{children}</span>;
}
