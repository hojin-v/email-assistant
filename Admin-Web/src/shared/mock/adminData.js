import {
  businessTypeOptions,
  getBusinessTypeLabel,
  getRecommendedCategoriesForDomain,
  recommendedCategoryOptions,
} from "../config/onboardingOptions";

export const dashboardMetrics = [
  {
    label: "도메인별 메일 비율",
    value: "4개 도메인",
    hint: "support가 전체 메일의 38%",
  },
  {
    label: "하루 처리량",
    value: "1,284건",
    hint: "자동 처리 74%, 수동 처리 26%",
  },
  {
    label: "자동 분류 정확도",
    value: "94.8%",
    hint: "지난주 대비 +1.6%",
  },
  {
    label: "부서별 사용량",
    value: "6개 부서",
    hint: "CS팀이 전체 사용량의 32%",
  },
];

export const domainDistribution = [
  { domain: "고객지원", share: 38, volume: "489건", color: "teal" },
  { domain: "영업", share: 24, volume: "308건", color: "navy" },
  { domain: "파트너십", share: 21, volume: "270건", color: "amber" },
  { domain: "인사/총무", share: 17, volume: "217건", color: "slate" },
];

export const dailyThroughput = [
  { slot: "09시", processed: 142, automated: 112 },
  { slot: "11시", processed: 214, automated: 161 },
  { slot: "13시", processed: 188, automated: 143 },
  { slot: "15시", processed: 246, automated: 182 },
  { slot: "17시", processed: 193, automated: 144 },
];

export const departmentUsage = [
  { name: "CS팀", seats: 12, usageRate: 32, domain: "고객지원" },
  { name: "영업팀", seats: 8, usageRate: 24, domain: "영업" },
  { name: "운영팀", seats: 6, usageRate: 18, domain: "파트너십" },
  { name: "인사팀", seats: 4, usageRate: 14, domain: "인사/총무" },
  { name: "재무팀", seats: 3, usageRate: 7, domain: "결제/정산" },
  { name: "기획팀", seats: 2, usageRate: 5, domain: "내부 요청" },
];

export const messagePipeline = {
  label: "RabbitMQ 기반 비동기 메시지 처리",
  summary:
    "메일 수신 이후 업종/카테고리 분류, LLM 초안 생성, 운영 정책 반영, 발송 대기까지 비동기 큐로 분리해 병목을 줄입니다.",
  stages: [
    {
      name: "ingest.queue",
      desc: "메일 수집과 메타데이터 정규화",
      status: "정상",
    },
    {
      name: "classify.queue",
      desc: "도메인 분류 및 우선순위 계산",
      status: "정상",
    },
    {
      name: "approval.queue",
      desc: "업종/카테고리 기준 반영 및 운영 검토",
      status: "주의",
    },
    {
      name: "dispatch.queue",
      desc: "최종 발송 및 실패 재시도",
      status: "정상",
    },
  ],
  queues: [
    { name: "approval.queue", pending: 18, lag: "2m 04s", failures: 1, status: "주의" },
    { name: "dispatch.queue", pending: 6, lag: "34s", failures: 0, status: "정상" },
    { name: "retry.queue", pending: 3, lag: "49s", failures: 2, status: "점검" },
  ],
};

export const memberSummary = [
  { label: "전체 사용자", value: "35명", hint: "활성 31명 / 대기 4명" },
  { label: "운영 관리자", value: "6명", hint: "업종/카테고리 관리 권한 보유" },
  { label: "소속 부서", value: "6개", hint: "부서별 정책 분리" },
];

export const members = [
  {
    name: "김호진",
    email: "admin@company.com",
    department: "운영팀",
    role: "슈퍼 관리자",
    status: "활성",
    taxonomyScope: "전 업종 / 전 카테고리",
    lastActive: "오늘 09:32",
  },
  {
    name: "박민수",
    email: "ops1@company.com",
    department: "CS팀",
    role: "운영 관리자",
    status: "활성",
    taxonomyScope: "고객지원 / 인사 / 공통업무",
    lastActive: "오늘 08:50",
  },
  {
    name: "이진아",
    email: "ops2@company.com",
    department: "영업팀",
    role: "부서 관리자",
    status: "활성",
    taxonomyScope: "영업 / 마케팅",
    lastActive: "어제 18:14",
  },
  {
    name: "정하늘",
    email: "partner@company.com",
    department: "파트너십팀",
    role: "검토 전용",
    status: "대기",
    taxonomyScope: "마케팅 / 제휴 관련 카테고리 열람",
    lastActive: "초대 발송됨",
  },
  {
    name: "윤서영",
    email: "hr@company.com",
    department: "인사팀",
    role: "운영 담당자",
    status: "활성",
    taxonomyScope: "인사 / 공통업무",
    lastActive: "오늘 07:48",
  },
];

export const departmentPolicies = [
  { name: "CS팀", owner: "박민수", members: 12, policy: "고객지원 업종과 카테고리 기준 검토" },
  { name: "영업팀", owner: "이진아", members: 8, policy: "영업 / 마케팅 카테고리 운영과 품질 피드백" },
  { name: "운영팀", owner: "김호진", members: 6, policy: "전 업종 분류 기준과 공통 정책 관리" },
];

export const accessPolicies = [
  {
    title: "업종 기반 운영 범위",
    desc: "부서별로 관리 가능한 업종 / 비즈니스 유형 범위를 분리합니다.",
  },
  {
    title: "카테고리 기준 검토",
    desc: "분류 기준은 사용자 앱 온보딩과 동일한 카테고리 체계를 유지합니다.",
  },
  {
    title: "읽기 전용 계정",
    desc: "문의 열람과 운영 기준 확인만 가능한 계정을 제공합니다.",
  },
];

const categoryCounts = businessTypeOptions.map((option) => ({
  ...option,
  count: getRecommendedCategoriesForDomain(option.value).length,
}));

const busiestBusinessType = categoryCounts.reduce((current, next) =>
  next.count > current.count ? next : current
);

export const taxonomySummary = [
  {
    label: "업종 / 비즈니스 유형",
    value: `${businessTypeOptions.length}개`,
    hint: "App 온보딩과 동일한 기준 사용",
  },
  {
    label: "기본 카테고리",
    value: `${recommendedCategoryOptions.length}개`,
    hint: "LLM 분류와 초안 생성 프롬프트에 공통 반영",
  },
  {
    label: "최다 카테고리 업종",
    value: busiestBusinessType.label,
    hint: `${busiestBusinessType.count}개 카테고리 구성`,
  },
];

export const businessTypeRegistry = businessTypeOptions.map((option) => {
  const categories = getRecommendedCategoriesForDomain(option.value);

  return {
    value: option.value,
    label: option.label,
    categoryCount: categories.length,
    previewCategories: categories.slice(0, 3).map((category) => category.name),
    color: categories[0]?.color ?? "#617081",
    note:
      option.value === "Sales"
        ? "견적, 계약, 가격 협상, 미팅 조율처럼 매출 연결 흐름을 우선 분류합니다."
        : option.value === "Marketing & PR"
        ? "협찬/제휴, 광고, 인터뷰, 캠페인 등 외부 커뮤니케이션 흐름을 다룹니다."
        : option.value === "HR"
        ? "채용, 면접, 증명서, 휴가처럼 구성원 운영 메일을 중심으로 구성합니다."
        : option.value === "Finance"
        ? "세금계산서, 비용 처리, 입금 확인, 정산 문의를 기본 분류로 사용합니다."
        : option.value === "Customer Support"
        ? "불만 접수, 기술 지원, 환불, 사용법 문의 등 고객 응대 흐름을 다룹니다."
        : option.value === "IT/Ops"
        ? "시스템 오류, 계정 생성, 권한 변경 등 운영 지원 메일을 다룹니다."
        : "공지, 내부 보고, 자료 요청, 협조 요청 등 공통 업무 메일을 묶습니다.",
  };
});

export const categoryCatalog = recommendedCategoryOptions.map((category, index) => ({
  id: category.id,
  name: category.name,
  domain: category.domain,
  domainLabel: getBusinessTypeLabel(category.domain),
  color: category.color,
  sortKey: String(index + 1).padStart(2, "0"),
  usage: "분류 기준 + LLM 템플릿 생성 입력값",
}));

export const categoryGovernance = [
  {
    title: "업종 / 비즈니스 유형 우선 적용",
    desc: "관리자 웹의 업종 기준은 사용자 앱 온보딩과 비즈니스 프로필에서 선택하는 값과 완전히 동일해야 합니다.",
  },
  {
    title: "카테고리 기준 단일 소스 유지",
    desc: "카테고리는 업종별 기본 추천값으로 관리하고, LLM은 이 카테고리와 비즈니스 프로필 정보를 조합해 초안을 생성합니다.",
  },
  {
    title: "사전 배포형 템플릿 운영 제거",
    desc: "관리자 웹에서는 템플릿을 미리 만들어 배포하지 않고, 분류 기준과 생성 입력값만 관리합니다.",
  },
];

export const inquirySummary = [
  { label: "열린 문의", value: "14건", hint: "오늘 신규 5건" },
  { label: "답변 기록", value: "286건", hint: "관리자 작성 기준" },
  { label: "재확인 필요", value: "3건", hint: "추가 답변 요청" },
];

export const inquiries = [
  {
    id: "INQ-2041",
    requester: "김유리",
    company: "Acme Corp",
    domain: "영업",
    status: "답변 완료",
    latestResponder: "이진아",
    updatedAt: "오늘 09:14",
    summary: "엔터프라이즈 플랜 견적과 도입 일정 문의",
  },
  {
    id: "INQ-2038",
    requester: "정소민",
    company: "Prime Support",
    domain: "고객지원",
    status: "추가 확인",
    latestResponder: "박민수",
    updatedAt: "오늘 08:22",
    summary: "환불 요청 이후 처리 지연에 대한 재문의",
  },
  {
    id: "INQ-2031",
    requester: "오세훈",
    company: "Link Partners",
    domain: "파트너십",
    status: "검토중",
    latestResponder: "김호진",
    updatedAt: "어제 17:40",
    summary: "공동 마케팅 제안서 검토 진행 상태 확인",
  },
];

export const responseHistory = {
  "INQ-2041": [
    {
      at: "오늘 08:55",
      author: "이진아",
      channel: "관리자 답변",
      note: "고객사 규모 기준 견적 범위와 추천 플랜을 안내했습니다.",
    },
    {
      at: "오늘 09:14",
      author: "시스템",
      channel: "기록 저장",
      note: "답변 템플릿 v4 사용 이력을 문의 기록에 저장했습니다.",
    },
  ],
  "INQ-2038": [
    {
      at: "오늘 08:02",
      author: "박민수",
      channel: "관리자 답변",
      note: "환불 접수 상태와 예상 완료 시점을 재안내했습니다.",
    },
    {
      at: "오늘 08:22",
      author: "고객",
      channel: "추가 문의",
      note: "결제 수단별 환불 차이 여부를 재질문했습니다.",
    },
  ],
  "INQ-2031": [
    {
      at: "어제 17:05",
      author: "김호진",
      channel: "관리자 메모",
      note: "법무 검토 완료 후 파트너십팀이 회신 예정입니다.",
    },
    {
      at: "어제 17:40",
      author: "시스템",
      channel: "기록 저장",
      note: "문의 상태를 검토중으로 변경하고 내부 기록을 저장했습니다.",
    },
  ],
};
