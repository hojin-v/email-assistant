import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  adminNormalCaptures,
  adminFeatureMap,
  adminIaSections,
  userNormalCaptures,
  userFeatureMap,
  userIaSections,
} from "./artifact-data.mjs";

const toolDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(toolDir, "../..");
const defaultOutputRoot = path.resolve(repoRoot, "../email-assistant-artifacts/design-doc");

function getOutputRoot() {
  return path.resolve(process.env.EMAILASSIST_ARTIFACT_ROOT ?? defaultOutputRoot);
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function writeFile(targetPath, content) {
  await ensureDir(path.dirname(targetPath));
  await fs.writeFile(targetPath, content, "utf8");
}

function buildScenarioRoute(route, scenarioId, stateType) {
  if (stateType === "not-found" || route.includes("scenario=")) {
    return route;
  }

  const separator = route.includes("?") ? "&" : "?";
  return `${route}${separator}scenario=${scenarioId}`;
}

function toErrorOutputFile(outputFile) {
  return outputFile.replace(/^screenshots\//, "screenshots/error/");
}

function sanitizeFileName(text) {
  return text
    .replace(/[\\/:*?"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toScreenPrefix(item) {
  const routePath = getRoutePath(item.url ?? item.route);

  if (item.app === "user") {
    if (routePath === "/") return "A";
    if (routePath === "/onboarding") return "B";
    if (routePath === "/app") return "C";
    if (routePath === "/app/inbox") return "D";
    if (routePath === "/app/calendar") return "E";
    if (routePath === "/app/templates") return "F";
    if (routePath === "/app/profile") return "G";
    if (routePath === "/app/automation") return "H";
    if (routePath === "/app/settings") return "I";
    return "J";
  }

  if (routePath === "/admin") return "K";
  if (routePath === "/admin/users") return "L";
  if (routePath === "/admin/template-automation") return "M";
  if (routePath === "/admin/inquiries") return "N";
  if (routePath === "/admin/monitoring") return "O";
  return "P";
}

function stripScreenKeywords(title) {
  return title
    .replace(/\s*기본 화면$/, "")
    .replace(/\s*확인 다이얼로그$/, "")
    .replace(/\s*다이얼로그$/, "")
    .replace(/\s*화면$/, "")
    .replace(/\s*상태$/, "")
    .trim();
}

function toDocVariant(item) {
  const title = item.screenTitle ?? "";

  if (item.captureType === "error") {
    if (item.stateType === "validation") return "입력 오류";
    if (item.stateType === "empty") return "빈 상태";
    if (item.stateType === "load-error") return "조회 실패";
    if (item.stateType === "action-error") return "처리 실패";
    if (item.stateType === "permission") return "권한 없음";
    if (item.stateType === "disconnected") return "연동 오류";
    if (item.stateType === "not-found") return "잘못된 접근";
    if (item.stateType === "unexpected") return "시스템 오류";
    return "오류";
  }

  if (title.includes("확인 다이얼로그")) return "확인 팝업";
  if (title.includes("다이얼로그")) return "팝업";
  if (title.includes("드롭다운")) return "드롭다운";
  if (title.includes("완료")) return "완료";
  if (title.includes("진행")) return "진행";
  if (title.includes("단계")) return "단계";
  if (title.includes("상태")) return "상태";
  if (title.includes("기본 화면")) return "기본";
  return "정상";
}

function toDocBaseLabel(item) {
  const title = stripScreenKeywords(item.screenTitle ?? "");
  return title.replace(/\//g, " · ").trim();
}

function buildDocTitle(item, screenNumber) {
  return `${toDocBaseLabel(item)} 화면(${toDocVariant(item)}) - 화면번호 ${screenNumber}`;
}

function applyDesignDocMetadata(items) {
  const counters = new Map();

  return items.map((item, index) => {
    const prefix = toScreenPrefix(item);
    const key = prefix;
    const nextSequence = (counters.get(key) ?? 0) + 1;
    counters.set(key, nextSequence);
    const orderNumber = String(index + 1).padStart(2, "0");
    const screenNumber = `${prefix}${String(nextSequence).padStart(2, "0")}`;
    const docTitle = `${orderNumber}. ${buildDocTitle(item, screenNumber)}`;
    const directory = path.dirname(item.outputFile);
    const outputFile = path.join(directory, `${sanitizeFileName(docTitle)}.png`);

    return {
      ...item,
      orderNumber,
      screenNumber,
      docTitle,
      outputFile,
    };
  });
}

function toMarkdownList(sections) {
  return sections
    .map(
      (section) =>
        `## ${section.group}\n\n${section.items
          .map(
            (item) =>
              `- \`${item.path}\` | ${item.title}\n  ${item.note}`,
          )
          .join("\n\n")}`,
    )
    .join("\n\n");
}

function toFeatureMarkdown(items) {
  return items
    .map((item) => {
      const features = item.features.map((feature) => `- ${feature}`).join("\n");
      const scenarios = item.scenarios.map((scenario) => `- \`${scenario}\``).join("\n");

      return `## ${item.screen}\n\n- Route: \`${item.route}\`\n- 기능\n${features}\n- 스크린샷 시나리오\n${scenarios}`;
    })
    .join("\n\n");
}

function normalizeSentence(text) {
  const trimmed = text.trim();

  if (!trimmed) {
    return trimmed;
  }

  if (/[.!?]$/.test(trimmed) || trimmed.endsWith("다.") || trimmed.endsWith("요.")) {
    return trimmed;
  }

  return `${trimmed}이다.`;
}

function getRoutePath(route) {
  return route.split("?")[0] || "/";
}

function stripStateSuffix(title) {
  return title
    .replace(/\s*기본 화면$/, "")
    .replace(/\s*화면$/, "")
    .replace(/\s*상태$/, "")
    .trim();
}

function buildOverviewLine(item) {
  const title = item.screenTitle ?? "";
  const routePath = getRoutePath(item.url ?? item.route);
  const isAdmin = item.app === "admin";

  if (item.captureType === "error") {
    if (!isAdmin && routePath === "/") {
      return "인증 과정에서 예외가 발생했을 때 사용자에게 보여주는 오류 화면이다.";
    }
    if (isAdmin && routePath === "/admin") {
      return `${stripStateSuffix(title)} 상황이 발생했을 때 관리자에게 보여주는 예외 화면이다.`;
    }
    if (routePath === "/onboarding") {
      return "온보딩 과정에서 처리 실패나 예외가 발생했을 때 보여주는 화면이다.";
    }
    if (routePath.startsWith("/app")) {
      return `${stripStateSuffix(title)} 상황이 발생했을 때 사용자에게 보여주는 예외 화면이다.`;
    }
    if (
      routePath === "/admin/users" ||
      routePath === "/admin/template-automation" ||
      routePath === "/admin/inquiries" ||
      routePath === "/admin/monitoring"
    ) {
      return `${stripStateSuffix(title)} 상황이 발생했을 때 관리자에게 보여주는 예외 화면이다.`;
    }
    return "기능 사용 중 예외가 발생했을 때 표시되는 상태 화면이다.";
  }

  if (!isAdmin && routePath === "/") {
    if (title.includes("회원가입")) return "서비스를 처음 이용하는 사용자가 회원가입을 진행할 때 표시되는 화면이다.";
    if (title.includes("비밀번호 찾기")) return "로그인 화면에서 비밀번호 찾기를 선택했을 때 표시되는 화면이다.";
    if (title.includes("재설정 완료")) return "비밀번호 재설정이 정상적으로 완료된 뒤 사용자에게 안내하는 화면이다.";
    return "앱을 시작하면 가장 먼저 나타나는 로그인 화면이다.";
  }
  if (routePath === "/onboarding") {
    if (title.includes("회사 프로필")) return "온보딩 과정에서 회사 기본 정보를 입력하는 단계 화면이다.";
    if (title.includes("비즈니스 설정")) return "온보딩 과정에서 회사 기본 정보를 입력하는 단계 화면이다.";
    if (title.includes("자료 업로드")) return "온보딩 과정에서 업무 자료와 FAQ를 등록하는 단계 화면이다.";
    if (title.includes("카테고리")) return "온보딩 과정에서 카테고리와 분류 기준을 설정하는 단계 화면이다.";
    if (title.includes("생성 진행")) return "온보딩 입력이 끝난 뒤 템플릿 생성이 진행되는 상태 화면이다.";
    if (title.includes("완료")) return "온보딩을 모두 마친 뒤 서비스 시작을 안내하는 완료 화면이다.";
    return "로그인 후 최초 1회 진행하는 온보딩 시작 화면이다.";
  }
  if (routePath === "/app") return "온보딩 완료 후 진입하는 메인 대시보드 화면이다.";
  if (routePath === "/app/inbox") return "수신한 메일과 AI 답변 초안을 함께 확인하는 수신함 화면이다.";
  if (routePath === "/app/calendar") return title.includes("다이얼로그")
    ? "캘린더 기능에서 일정 생성, 수정, 삭제를 수행할 때 표시되는 팝업 화면이다."
    : "이메일 기반 일정과 직접 등록한 일정을 함께 관리하는 캘린더 화면이다.";
  if (routePath === "/app/templates") return title.includes("다이얼로그")
    ? "템플릿을 미리보기, 생성, 수정, 삭제할 때 표시되는 팝업 화면이다."
    : "카테고리별 템플릿을 조회하고 관리하는 템플릿 라이브러리 화면이다.";
  if (routePath === "/app/profile") return title.includes("다이얼로그")
    ? "비즈니스 프로필 관리 중 FAQ나 템플릿 재생성 작업을 수행할 때 표시되는 팝업 화면이다."
    : "회사 정보, 자료, FAQ를 관리하는 비즈니스 프로필 화면이다.";
  if (routePath === "/app/automation") return title.includes("다이얼로그")
    ? "자동화 규칙 등록과 삭제, 캘린더 연동 설정 시 표시되는 팝업 화면이다."
    : "카테고리별 자동화 규칙과 캘린더 연동 상태를 관리하는 화면이다.";
  if (routePath === "/app/settings") return title.includes("다이얼로그")
    ? "설정 메뉴에서 이메일 연동 확인이나 관리자 문의 작성 시 표시되는 팝업 화면이다."
    : "계정, 알림, 화면, 이메일 연동, 관리자 문의를 관리하는 설정 화면이다.";
  if (isAdmin && routePath === "/admin") return "관리자 로그인 후 처음 진입하는 운영 대시보드 화면이다.";
  if (routePath === "/admin/users") return title.includes("다이얼로그")
    ? "사용자 계정 운영 액션을 수행하기 전에 표시되는 확인 팝업 화면이다."
    : "사용자 목록과 상세 운영 정보를 확인하는 관리자 화면이다.";
  if (routePath === "/admin/template-automation") return title.includes("다이얼로그")
    ? "자동화 규칙을 생성하거나 삭제할 때 표시되는 관리자 팝업 화면이다."
    : "생성 템플릿 사용 현황과 자동화 규칙을 관리하는 관리자 화면이다.";
  if (routePath === "/admin/inquiries") return "사용자 문의 목록과 상세 내용을 확인하고 답변을 작성하는 관리자 화면이다.";
  if (routePath === "/admin/monitoring") return title.includes("다이얼로그")
    ? "실패 또는 대기 작업을 강제로 삭제하기 전에 표시되는 관리자 확인 팝업 화면이다."
    : "실패 또는 대기 상태의 작업을 정리하는 관리자 모니터링 화면이다.";

  return "해당 기능의 주요 UI 구성과 흐름을 보여주는 화면이다.";
}

function buildActionLine(item) {
  const title = item.screenTitle ?? "";
  const routePath = getRoutePath(item.url ?? item.route);
  const isAdmin = item.app === "admin";

  if (item.captureType === "error") {
    if (item.stateType === "validation") {
      return "필수 입력값을 다시 확인한 뒤 동일 화면에서 재입력할 수 있다.";
    }
    if (item.stateType === "empty") {
      return "현재 조건에 맞는 데이터가 없다는 점을 확인하고 다른 조건으로 다시 시도할 수 있다.";
    }
    if (item.stateType === "load-error") {
      return "재시도 버튼이나 다른 메뉴 이동을 통해 작업을 다시 시도할 수 있다.";
    }
    if (item.stateType === "action-error") {
      return "저장, 삭제, 발송 같은 작업 실패 안내를 확인한 뒤 다시 시도하거나 화면을 닫을 수 있다.";
    }
    if (item.stateType === "permission") {
      return "접근 가능한 화면으로 이동하거나 이전 메뉴로 복귀할 수 있다.";
    }
    if (item.stateType === "disconnected") {
      return "연동 상태를 확인하고 재연결 절차로 이동할 수 있다.";
    }
    if (item.stateType === "not-found") {
      return "대시보드나 로그인처럼 유효한 경로로 다시 이동할 수 있다.";
    }
    if (item.stateType === "unexpected") {
      return "현재 작업을 중단하고 메인 화면으로 복귀하거나 다시 시도할 수 있다.";
    }
    return "오류 안내를 확인한 뒤 다시 시도하거나 다른 화면으로 이동할 수 있다.";
  }

  if (!isAdmin && routePath === "/") {
    if (title.includes("회원가입")) return "이름, 이메일, 비밀번호를 입력해 가입을 진행할 수 있고 로그인 화면으로 다시 돌아갈 수 있다.";
    if (title.includes("비밀번호 찾기")) return "이름, 이메일, 새 비밀번호와 확인 비밀번호를 입력해 비밀번호를 다시 설정할 수 있다.";
    if (title.includes("재설정 완료")) return "로그인으로 돌아가기 버튼을 눌러 새 비밀번호로 다시 로그인할 수 있다.";
    return "아이디와 비밀번호를 입력해 로그인할 수 있고, 회원가입 또는 비밀번호 찾기 화면으로 이동할 수 있다.";
  }
  if (routePath === "/onboarding") {
    if (title.includes("회사 프로필")) return "회사명, 업종, 비즈니스 유형 같은 기본 정보를 입력하고 다음 단계로 이동할 수 있다.";
    if (title.includes("비즈니스 설정")) return "회사명, 업종, 비즈니스 유형 같은 기본 정보를 입력하고 다음 단계로 이동할 수 있다.";
    if (title.includes("자료 업로드")) return "회사 소개 자료와 FAQ를 등록하고 이후 카테고리 설정 단계로 넘어갈 수 있다.";
    if (title.includes("드롭다운")) return "추천 카테고리 목록을 펼쳐 필요한 항목을 선택할 수 있다.";
    if (title.includes("직접 추가")) return "추천 항목 외에 필요한 카테고리를 직접 입력해 목록에 추가할 수 있다.";
    if (title.includes("카테고리")) return "업종에 맞는 카테고리를 선택하고 템플릿 생성에 반영할 구성을 확인할 수 있다.";
    if (title.includes("생성 진행")) return "자동 생성 진행 상태를 확인하면서 완료될 때까지 대기할 수 있다.";
    if (title.includes("완료")) return "온보딩을 마치고 메인 서비스 화면으로 이동할 수 있다.";
    return "Gmail 계정을 연동하고 온보딩 다음 단계로 이동할 수 있다.";
  }
  if (routePath === "/app") return "핵심 지표, 최근 메일, 다가오는 일정을 한 화면에서 빠르게 확인할 수 있다.";
  if (routePath === "/app/inbox") return "메일 목록을 선택하고 본문, AI 초안, 일정 감지 결과를 함께 검토할 수 있다.";
  if (routePath === "/app/calendar") {
    if (title.includes("추가")) return "제목, 날짜, 시간, 유형을 입력해 새로운 일정을 등록할 수 있다.";
    if (title.includes("수정")) return "기존 일정의 제목, 시간, 유형을 바꾸고 저장할 수 있다.";
    if (title.includes("삭제")) return "일정 삭제 여부를 확인한 뒤 확정하거나 취소할 수 있다.";
    return "월간 일정 현황을 확인하고 원하는 날짜의 일정을 조회하거나 새로 추가할 수 있다.";
  }
  if (routePath === "/app/templates") {
    if (title.includes("미리보기")) return "선택한 템플릿의 내용을 실제 응답 형식으로 확인할 수 있다.";
    if (title.includes("수정")) return "제목과 본문을 수정해 템플릿 내용을 갱신할 수 있다.";
    if (title.includes("생성")) return "새 카테고리용 템플릿 제목과 본문을 입력해 등록할 수 있다.";
    if (title.includes("삭제")) return "선택한 템플릿을 삭제할지 확인한 뒤 확정하거나 취소할 수 있다.";
    return "카테고리별 템플릿을 검색하고 미리보기, 수정, 삭제 같은 관리 작업을 수행할 수 있다.";
  }
  if (routePath === "/app/profile") {
    if (title.includes("FAQ")) return title.includes("삭제")
      ? "기존 FAQ 항목을 삭제할지 확인한 뒤 확정하거나 취소할 수 있다."
      : "새 FAQ 항목을 입력해 저장하고 목록에 반영할 수 있다.";
    if (title.includes("재생성")) return "템플릿 재생성 범위를 선택하거나 일괄 재생성을 확정할 수 있다.";
    return "회사 기본 정보와 자료, FAQ를 수정하고 필요 시 템플릿 재생성으로 연결할 수 있다.";
  }
  if (routePath === "/app/automation") {
    if (title.includes("추가")) return "카테고리 규칙 조건과 연결 템플릿을 지정해 새 규칙을 등록할 수 있다.";
    if (title.includes("편집")) return "기존 카테고리 규칙의 조건과 연결 대상을 수정할 수 있다.";
    if (title.includes("삭제")) return "선택한 자동화 규칙을 삭제할지 확인한 뒤 확정하거나 취소할 수 있다.";
    if (title.includes("캘린더")) return "캘린더 자동 등록에 사용할 카테고리를 선택하고 반영할 수 있다.";
    return "자동 발송 규칙과 캘린더 연동 기준을 확인하고 필요한 규칙을 관리할 수 있다.";
  }
  if (routePath === "/app/settings") {
    if (title.includes("인증 확인")) return "Google OAuth를 마친 뒤 계정 연결을 확정하거나 팝업을 닫을 수 있다.";
    if (title.includes("문의")) return title.includes("다이얼로그")
      ? "문의 제목과 내용을 입력해 관리자에게 새 문의를 등록할 수 있다."
      : "계정, 알림, 화면 설정을 확인하고 이메일 연동 및 관리자 문의 탭으로 이동할 수 있다.";
    if (title.includes("이메일 연동")) return "연결된 Gmail 계정을 확인하고 새 계정 추가 흐름으로 이동할 수 있다.";
    return "계정 정보와 비밀번호 변경, 알림, 화면 옵션을 각 탭에서 조정할 수 있다.";
  }
  if (isAdmin && routePath === "/admin") return "운영 지표와 최근 처리 현황을 요약 카드와 차트로 확인할 수 있다.";
  if (routePath === "/admin/users") {
    if (title.includes("Google")) return "Google 연동 강제 해제를 확정하거나 취소할 수 있다.";
    if (title.includes("활성") || title.includes("비활성")) return "사용자 계정 상태 변경을 확정하거나 취소할 수 있다.";
    return "이름, 이메일, 업종 조건으로 사용자를 검색하고 상세 운영 정보를 확인할 수 있다.";
  }
  if (routePath === "/admin/template-automation") {
    if (title.includes("생성")) return "새 자동화 규칙 조건을 입력하고 저장할 수 있다.";
    if (title.includes("삭제")) return "선택한 자동화 규칙을 삭제할지 확인한 뒤 확정하거나 취소할 수 있다.";
    if (title.includes("규칙")) return "탭을 전환해 자동화 규칙 목록을 확인하고 관리할 수 있다.";
    return "생성 템플릿 사용 현황과 자동화 규칙을 탭별로 확인할 수 있다.";
  }
  if (routePath === "/admin/inquiries") return "문의 목록을 선택해 상세 내용을 보고 답변을 작성하거나 답변 이력을 확인할 수 있다.";
  if (routePath === "/admin/monitoring") {
    if (title.includes("삭제")) return "실패 또는 대기 작업을 강제로 삭제할지 확인한 뒤 확정하거나 취소할 수 있다.";
    return "실패 또는 대기 상태의 작업만 확인하고 강제 삭제를 진행할 수 있다.";
  }

  return "현재 화면의 주요 기능을 확인하고 다음 작업으로 이동할 수 있다.";
}

function getUserSectionLabel(item) {
  const routePath = getRoutePath(item.url ?? item.route);

  if (routePath === "/") return "01. 서비스 진입";
  if (routePath === "/onboarding") return "02. 온보딩";
  if (routePath === "/app") return "03. 대시보드";
  if (routePath === "/app/inbox") return "04. 수신함";
  if (routePath === "/app/calendar") return "05. 캘린더";
  if (routePath === "/app/templates") return "06. 템플릿 라이브러리";
  if (routePath === "/app/profile") return "07. 비즈니스 프로필";
  if (routePath === "/app/automation") return "08. 자동화 설정";
  if (routePath === "/app/settings") return "09. 설정";
  return "10. 공통 상태";
}

function getAdminSectionLabel(item) {
  const routePath = getRoutePath(item.url ?? item.route);

  if (routePath === "/admin") return "01. 운영 대시보드";
  if (routePath === "/admin/users") return "02. 사용자 관리";
  if (routePath === "/admin/template-automation") return "03. 템플릿 / 자동화 관리";
  if (routePath === "/admin/inquiries") return "04. 문의 대응";
  if (routePath === "/admin/monitoring") return "05. 시스템 운영 모니터링";
  return "06. 공통 상태";
}

function groupCaptureItems(items, getSectionLabel) {
  const sections = new Map();

  items.forEach((item) => {
    const label = getSectionLabel(item);
    const currentItems = sections.get(label) ?? [];
    currentItems.push(item);
    sections.set(label, currentItems);
  });

  return [...sections.entries()];
}

function buildSectionSummary(sectionLabel, items, screenLabel) {
  return `${sectionLabel} 구간의 ${screenLabel} 스크린샷을 설계서 작성 순서대로 정리한 목록이다.`;
}

function buildDescriptionBullets(item) {
  const title = item.screenTitle ?? "";
  const routePath = getRoutePath(item.url ?? item.route);
  const isAdmin = item.app === "admin";

  if (item.captureType === "error") {
    return [
      normalizeSentence(buildOverviewLine(item)),
      normalizeSentence(buildActionLine(item)),
    ];
  }

  if (!isAdmin && routePath === "/") {
    if (title.includes("회원가입")) {
      return [
        "서비스를 처음 이용하는 사용자가 회원가입을 진행할 때 표시되는 화면이다.",
        "이름, 이메일, 비밀번호를 입력해 회원가입을 진행할 수 있다.",
        "로그인 화면으로 다시 돌아갈 수 있다.",
      ];
    }
    if (title.includes("비밀번호 찾기")) {
      return [
        "로그인 화면에서 비밀번호 찾기를 선택했을 때 표시되는 화면이다.",
        "이름과 이메일을 입력한 뒤 새 비밀번호와 확인 비밀번호를 입력할 수 있다.",
        "비밀번호를 다시 설정한 뒤 로그인 화면으로 돌아갈 수 있다.",
      ];
    }
    if (title.includes("재설정 완료")) {
      return [
        "비밀번호 재설정이 정상적으로 완료된 뒤 사용자에게 안내하는 화면이다.",
        "로그인으로 돌아가기 버튼을 눌러 새 비밀번호로 다시 로그인할 수 있다.",
      ];
    }
    return [
      "앱을 시작하면 가장 먼저 나타나는 로그인 화면이다.",
      "아이디와 비밀번호를 입력해 로그인할 수 있다.",
      "회원가입 또는 비밀번호 찾기 화면으로 이동할 수 있다.",
    ];
  }

  if (!isAdmin && routePath === "/onboarding") {
    if (title.includes("회사 프로필")) {
      return [
        "온보딩 과정에서 회사 기본 정보를 입력하는 단계 화면이다.",
        "회사명, 업종, 비즈니스 유형 같은 기본 정보를 입력할 수 있다.",
        "다음 단계로 이동해 자료 업로드와 FAQ 설정을 진행할 수 있다.",
      ];
    }
    if (title.includes("자료 업로드")) {
      return [
        "온보딩 과정에서 업무 자료와 FAQ를 등록하는 단계 화면이다.",
        "회사 소개 자료와 FAQ를 등록해 서비스가 참고할 업무 문맥을 설정할 수 있다.",
        "입력이 끝나면 카테고리 설정 단계로 이동할 수 있다.",
      ];
    }
    if (title.includes("드롭다운")) {
      return [
        "온보딩 과정에서 카테고리와 분류 기준을 설정하는 단계 화면이다.",
        "추천 카테고리 목록을 펼쳐 필요한 항목을 선택할 수 있다.",
        "선택한 카테고리는 아래 미리보기 영역에 반영된다.",
      ];
    }
    if (title.includes("직접 추가")) {
      return [
        "온보딩 과정에서 카테고리와 분류 기준을 설정하는 단계 화면이다.",
        "추천 항목 외에 필요한 카테고리를 직접 입력해 목록에 추가할 수 있다.",
        "추가한 카테고리는 이후 템플릿 생성 기준에 함께 반영된다.",
      ];
    }
    if (title.includes("카테고리")) {
      return [
        "온보딩 과정에서 카테고리와 분류 기준을 설정하는 단계 화면이다.",
        "업종에 맞는 카테고리를 선택하고 템플릿 생성에 반영할 구성을 확인할 수 있다.",
        "설정이 끝나면 템플릿 생성 단계로 넘어갈 수 있다.",
      ];
    }
    if (title.includes("생성 진행")) {
      return [
        "온보딩 입력이 끝난 뒤 템플릿 생성이 진행되는 상태 화면이다.",
        "자동 생성 진행 상태를 확인하면서 완료될 때까지 대기할 수 있다.",
      ];
    }
    if (title.includes("완료")) {
      return [
        "온보딩을 모두 마친 뒤 서비스 시작을 안내하는 완료 화면이다.",
        "온보딩을 마치고 메인 서비스 화면으로 이동할 수 있다.",
      ];
    }
    return [
      "로그인 후 최초 1회 진행하는 온보딩 시작 화면이다.",
      "Gmail 계정을 연동하고 온보딩 다음 단계로 이동할 수 있다.",
    ];
  }

  if (!isAdmin && routePath === "/app/inbox") {
    if (title.includes("일정 감지")) {
      return [
        "수신함에서 메일 본문과 함께 일정 감지 제안을 보여주는 화면이다.",
        "감지된 일정 정보를 확인하고 캘린더에 바로 추가하거나 수정 후 추가할 수 있다.",
        "같은 화면에서 AI가 생성한 답변 초안도 함께 검토할 수 있다.",
      ];
    }
    if (title.includes("처리 완료")) {
      return [
        "처리 완료 상태의 메일과 발송된 답변 내용을 확인하는 화면이다.",
        "처리 완료 탭에서 이미 발송된 응답 내용을 읽기 전용으로 확인할 수 있다.",
      ];
    }
    if (title.includes("자동 발송")) {
      return [
        "자동 발송 처리된 메일과 발송 결과를 확인하는 화면이다.",
        "자동 발송 탭에서 자동 처리된 응답 내용을 읽기 전용으로 확인할 수 있다.",
      ];
    }
    return [
      "수신한 메일과 AI 답변 초안을 함께 확인하는 수신함 화면이다.",
      "메일 목록을 선택하고 본문, AI 초안, 일정 감지 결과를 함께 검토할 수 있다.",
    ];
  }

  return [
    normalizeSentence(buildOverviewLine(item)),
    normalizeSentence(buildActionLine(item)),
  ];
}

function buildScreenshotGuide(items, {
  title,
  screenLabel,
  getSectionLabel,
}) {
  const grouped = groupCaptureItems(items, getSectionLabel);

  return [
    `# ${title}`,
    "",
    "- 설계서 본문에는 스크린샷 1장 아래에 2~4개 bullet 설명을 붙이는 형식을 권장합니다.",
    "- 아래 문구는 각 이미지 아래에 바로 넣을 수 있는 기본 설명 초안입니다.",
    "- 파일 순서는 설계서 작성 순서와 동일하게 유지됩니다.",
    "",
    ...grouped.flatMap(([section, sectionItems]) => [
      `## ${section}`,
      "",
      `- ${buildSectionSummary(section, sectionItems, screenLabel)}`,
      "",
      ...sectionItems.flatMap((item) => {
        const relativePath = item.outputFile;
        const fileName = path.basename(relativePath);
        const title = item.docTitle ?? fileName.replace(/\.png$/, "");
        const bullets = buildDescriptionBullets(item);

        return [
          `### ${title}`,
          "",
          `이미지 파일: \`${relativePath}\``,
          "",
          ...bullets.map((bullet) => `- ${bullet}`),
          "",
        ];
      }),
    ]),
  ].join("\n");
}

function buildDesignDocOrderGuide() {
  return [
    "# 설계서 UI 산출물 정렬 가이드",
    "",
    "- 아래 순서대로 문서에 배치하면 메뉴구성도와 화면 설명 흐름을 자연스럽게 맞출 수 있습니다.",
    "- 각 화면 설명 문구는 `capture/*-guide.md` 파일의 bullet 설명을 그대로 사용하거나 짧게 다듬어 넣으면 됩니다.",
    "",
    "## 1. 사용자 메뉴구성",
    "",
    "- 참조 문서: `ia/user-ia.md`",
    "- 목적: 사용자 앱의 전체 메뉴 구조와 화면 이동 관계를 먼저 제시합니다.",
    "",
    "## 2. 사용자 화면(UI) 설계 - 정상 흐름",
    "",
    "- 참조 문서: `capture/user-normal-guide.md`",
    "- 정렬 기준: 로그인 -> 온보딩 -> 대시보드 -> 수신함 -> 캘린더 -> 템플릿 라이브러리 -> 비즈니스 프로필 -> 자동화 설정 -> 설정",
    "",
    "## 3. 사용자 화면(UI) 설계 - 예외 / 오류 흐름",
    "",
    "- 참조 문서: `capture/user-error-guide.md`",
    "- 정렬 기준: 정상 흐름과 같은 메뉴 순서를 유지하면서 화면별 오류 상태를 배치합니다.",
    "",
    "## 4. 관리자 메뉴구성",
    "",
    "- 참조 문서: `ia/admin-ia.md`",
    "- 목적: 관리자 콘솔의 전체 메뉴 구조와 운영 화면 분류를 먼저 제시합니다.",
    "",
    "## 5. 관리자 화면(UI) 설계 - 정상 흐름",
    "",
    "- 참조 문서: `capture/admin-normal-guide.md`",
    "- 정렬 기준: 운영 대시보드 -> 사용자 관리 -> 템플릿 / 자동화 관리 -> 문의 대응 -> 시스템 운영 모니터링",
    "",
    "## 6. 관리자 화면(UI) 설계 - 예외 / 오류 흐름",
    "",
    "- 참조 문서: `capture/admin-error-guide.md`",
    "- 정렬 기준: 정상 흐름과 같은 메뉴 순서를 유지하면서 화면별 오류 상태를 배치합니다.",
    "",
  ].join("\n");
}

export async function generateDesignArtifacts() {
  const outputRoot = getOutputRoot();
  const userScenarioPath = path.join(repoRoot, "frontend/App/src/shared/scenarios/user-scenarios.json");
  const adminScenarioPath = path.join(repoRoot, "frontend/App/src/admin/shared/scenarios/admin-scenarios.json");
  const userScenarios = await readJson(userScenarioPath);
  const adminScenarios = await readJson(adminScenarioPath);

  const captureManifest = applyDesignDocMetadata([
    ...userNormalCaptures.map((capture) => ({
      ...capture,
      app: "user",
      captureType: "normal",
      url: capture.route,
    })),
    ...adminNormalCaptures.map((capture) => ({
      ...capture,
      app: "admin",
      captureType: "normal",
      url: capture.route,
    })),
    ...userScenarios.map((scenario) => ({
      ...scenario,
      app: "user",
      captureType: "error",
      outputFile: toErrorOutputFile(scenario.outputFile),
      url: buildScenarioRoute(scenario.route, scenario.scenarioId, scenario.stateType),
    })),
    ...adminScenarios.map((scenario) => ({
      ...scenario,
      app: "admin",
      captureType: "error",
      outputFile: toErrorOutputFile(scenario.outputFile),
      url: buildScenarioRoute(scenario.route, scenario.scenarioId, scenario.stateType),
    })),
  ]);

  await Promise.all([
    writeFile(
      path.join(outputRoot, "ia/user-ia.md"),
      `# 사용자 앱 IA\n\n${toMarkdownList(userIaSections)}\n`,
    ),
    writeFile(
      path.join(outputRoot, "ia/admin-ia.md"),
      `# 관리자 앱 IA\n\n${toMarkdownList(adminIaSections)}\n`,
    ),
    writeFile(
      path.join(outputRoot, "feature-map/user-feature-map.md"),
      `# 사용자 앱 기능구성도\n\n${toFeatureMarkdown(userFeatureMap)}\n`,
    ),
    writeFile(
      path.join(outputRoot, "feature-map/admin-feature-map.md"),
      `# 관리자 앱 기능구성도\n\n${toFeatureMarkdown(adminFeatureMap)}\n`,
    ),
    writeFile(
      path.join(outputRoot, "capture/user-normal-guide.md"),
      `${buildScreenshotGuide(
        captureManifest.filter((item) => item.app === "user" && item.captureType === "normal"),
        {
          title: "사용자 앱 정상 화면 정렬 및 설명 가이드",
          screenLabel: "사용자 앱 정상 화면",
          getSectionLabel: getUserSectionLabel,
        },
      )}\n`,
    ),
    writeFile(
      path.join(outputRoot, "capture/admin-normal-guide.md"),
      `${buildScreenshotGuide(
        captureManifest.filter((item) => item.app === "admin" && item.captureType === "normal"),
        {
          title: "관리자 앱 정상 화면 정렬 및 설명 가이드",
          screenLabel: "관리자 앱 정상 화면",
          getSectionLabel: getAdminSectionLabel,
        },
      )}\n`,
    ),
    writeFile(
      path.join(outputRoot, "capture/user-error-guide.md"),
      `${buildScreenshotGuide(
        captureManifest.filter((item) => item.app === "user" && item.captureType === "error"),
        {
          title: "사용자 앱 오류 화면 정렬 및 설명 가이드",
          screenLabel: "사용자 앱 오류 화면",
          getSectionLabel: getUserSectionLabel,
        },
      )}\n`,
    ),
    writeFile(
      path.join(outputRoot, "capture/admin-error-guide.md"),
      `${buildScreenshotGuide(
        captureManifest.filter((item) => item.app === "admin" && item.captureType === "error"),
        {
          title: "관리자 앱 오류 화면 정렬 및 설명 가이드",
          screenLabel: "관리자 앱 오류 화면",
          getSectionLabel: getAdminSectionLabel,
        },
      )}\n`,
    ),
    writeFile(
      path.join(outputRoot, "capture/design-doc-order.md"),
      `${buildDesignDocOrderGuide()}\n`,
    ),
    writeFile(
      path.join(outputRoot, "capture/manifest.json"),
      `${JSON.stringify(captureManifest, null, 2)}\n`,
    ),
    writeFile(
      path.join(outputRoot, "README.md"),
      [
        "# EmailAssist 설계 산출물",
        "",
        "- 기본 출력 경로: `/home/hojin/Projects/email-assistant-artifacts/design-doc/`",
        "- 스크린샷 기준 뷰포트: `1440 x 1024`",
        "- 정상 화면은 `screenshots/normal/...`, 에러/빈 상태/예외 화면은 `screenshots/error/...`에 분리 저장됩니다.",
        "- 스크린샷 제목과 파일명 앞에는 설계서 삽입 순서 기준의 전체 순서 번호를 유지합니다. 예: `01. 로그인 화면(기본) - 화면번호 A01.png`",
        "- `capture/manifest.json`은 자동 캡처와 문서 링크의 기준 파일입니다.",
        "- `capture/design-doc-order.md`는 설계서 본문에 삽입할 권장 순서를 안내합니다.",
        "- `capture/user-normal-guide.md`, `capture/admin-normal-guide.md` 등은 각 이미지 아래에 넣을 설명 초안을 제공합니다.",
        "- `tools/design-capture/scaffold.mjs`는 IA, 기능구성도, 캡처 매니페스트를 생성합니다.",
        "- `tools/design-capture/capture.mjs`는 사용자 앱과 관리자 앱 preview 서버를 띄워 스크린샷을 생성합니다.",
      ].join("\n"),
    ),
  ]);

  const captureDirectories = [...new Set(
    captureManifest.map((item) => path.join(outputRoot, path.dirname(item.outputFile))),
  )];
  await Promise.all(captureDirectories.map((dirPath) => ensureDir(dirPath)));

  return {
    outputRoot,
    captureManifest,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const result = await generateDesignArtifacts();
  console.log(`Design artifacts scaffolded at ${result.outputRoot}`);
}
