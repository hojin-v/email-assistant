import { FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  Settings,
  Shield,
  UserRound,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  createAuthenticatedSession,
  deriveNameFromEmail,
} from "../../shared/lib/app-session";

type AuthMode = "login" | "signup";

type LoginForm = {
  email: string;
  password: string;
};

type SignupForm = {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
};

const leftPanelContent: Record<AuthMode, { title: string; subtitle: string }> = {
  login: {
    title: "반복되는 업무 이메일을\n더 빠르게 처리하세요",
    subtitle: "EmailAssist는 이메일 분류, 답변 초안 생성,\n업무 설정 자동화를 한 흐름으로 돕는 서비스입니다",
  },
  signup: {
    title: "몇 단계만 거치면\n준비가 끝납니다",
    subtitle: "회원가입 후 온보딩에서 이메일 연결과\n업무 설정을 한 번에 완료할 수 있습니다",
  },
};

export function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: "",
    password: "",
  });
  const [signupForm, setSignupForm] = useState<SignupForm>({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const isLogin = mode === "login";
  const panelText = leftPanelContent[mode];

  const handleLoginSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      toast.error("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    createAuthenticatedSession({
      name: deriveNameFromEmail(loginForm.email.trim()) || "사용자",
      email: loginForm.email.trim(),
    });

    toast.success("로그인되었습니다. 온보딩으로 이동합니다.");
    navigate("/onboarding");
  };

  const handleSignupSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !signupForm.name.trim() ||
      !signupForm.email.trim() ||
      !signupForm.password.trim() ||
      !signupForm.passwordConfirm.trim()
    ) {
      toast.error("회원가입 정보를 모두 입력해주세요.");
      return;
    }

    if (signupForm.password !== signupForm.passwordConfirm) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }

    createAuthenticatedSession({
      name: signupForm.name.trim(),
      email: signupForm.email.trim(),
    });

    toast.success("회원가입이 완료되었습니다. 온보딩으로 이동합니다.");
    navigate("/onboarding");
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex w-[40%] bg-gradient-to-b from-[#1E2A3A] to-[#263548] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#2DD4BF]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#2DD4BF]/3 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-[#2DD4BF]/20 flex items-center justify-center">
            <Mail className="w-5 h-5 text-[#2DD4BF]" />
          </div>
          <span className="text-white/90 text-[15px] tracking-tight">
            업무용 이메일 자동화
          </span>
        </div>

        <div className="relative z-10 -mt-8">
          <h1 className="text-white text-[34px] leading-[1.3] tracking-tight whitespace-pre-line mb-5">
            {panelText.title}
          </h1>
          <p className="text-white/50 text-[15px] leading-relaxed whitespace-pre-line">
            {panelText.subtitle}
          </p>
        </div>

        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-[#2DD4BF]/60 shrink-0" />
            <span className="text-white/40 text-[13px]">
              서비스 로그인 후 Google 계정 연동을 별도로 진행합니다
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Zap className="w-4 h-4 text-[#2DD4BF]/60 shrink-0" />
            <span className="text-white/40 text-[13px]">
              온보딩 완료까지 평균 3분 내외
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4 text-[#2DD4BF]/60 shrink-0" />
            <span className="text-white/40 text-[13px]">
              이후 설정은 템플릿, 프로필, 자동화 화면에서 조정할 수 있습니다
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-[#F8FAFC] flex flex-col min-h-screen">
        <div className="px-6 sm:px-10 pt-8 pb-2">
          <div className="flex items-center gap-2 max-w-[600px]">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2DD4BF] text-white">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-[11px]">
                1
              </div>
              <span className="text-[13px] whitespace-nowrap">로그인</span>
            </div>
            <div className="w-6 h-px shrink-0 bg-[#CBD5E1] hidden sm:block" />
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#94A3B8]">
              <div className="w-5 h-5 rounded-full border-2 border-[#CBD5E1] flex items-center justify-center shrink-0 text-[11px]">
                2
              </div>
              <span className="text-[13px] hidden sm:inline whitespace-nowrap">온보딩</span>
            </div>
            <div className="w-6 h-px shrink-0 bg-[#CBD5E1] hidden sm:block" />
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#94A3B8]">
              <div className="w-5 h-5 rounded-full border-2 border-[#CBD5E1] flex items-center justify-center shrink-0 text-[11px]">
                3
              </div>
              <span className="text-[13px] hidden sm:inline whitespace-nowrap">시작</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-8">
          <div className="w-full max-w-[560px]">
            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0]/60 p-8 sm:p-10">
              <div className="lg:hidden text-center mb-8">
                <div className="w-12 h-12 rounded-xl bg-[#1E2A3A] flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-[#2DD4BF]" />
                </div>
                <p className="text-[13px] text-[#94A3B8]">업무용 이메일 자동화</p>
              </div>

              <div className="mb-8 mx-auto max-w-[460px] text-center">
                <h2 className="text-[#1E2A3A] text-[20px] mb-2">
                  {isLogin ? "계정에 로그인하세요" : "새 계정을 만들어 시작하세요"}
                </h2>
                <p className="text-[14px] text-[#94A3B8]">
                  {isLogin
                    ? "로그인 후 온보딩에서 이메일 연결과 초기 설정을 진행합니다"
                    : "회원가입 후 온보딩에서 이메일 연동과 비즈니스 설정을 완료합니다"}
                </p>
              </div>

              <div className="mb-6 flex rounded-xl bg-[#F8FAFC] p-1">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-[13px] font-medium transition-colors ${
                    isLogin
                      ? "bg-white text-[#1E2A3A] shadow-sm"
                      : "text-[#64748B] hover:text-[#1E2A3A]"
                  }`}
                >
                  로그인
                </button>
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-[13px] font-medium transition-colors ${
                    !isLogin
                      ? "bg-white text-[#1E2A3A] shadow-sm"
                      : "text-[#64748B] hover:text-[#1E2A3A]"
                  }`}
                >
                  회원가입
                </button>
              </div>

              {isLogin ? (
                <form className="space-y-4" onSubmit={handleLoginSubmit}>
                  <label className="block text-[13px] text-[#1E2A3A] mb-2">
                    이메일
                    <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                      <Mail className="h-4 w-4 text-[#94A3B8]" />
                      <input
                        type="email"
                        value={loginForm.email}
                        onChange={(event) =>
                          setLoginForm((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        placeholder="name@company.com"
                        className="w-full bg-transparent text-[14px] text-[#1E2A3A] outline-none placeholder:text-[#94A3B8]"
                      />
                    </div>
                  </label>

                  <label className="block text-[13px] text-[#1E2A3A] mb-2">
                    비밀번호
                    <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                      <Lock className="h-4 w-4 text-[#94A3B8]" />
                      <input
                        type="password"
                        value={loginForm.password}
                        onChange={(event) =>
                          setLoginForm((current) => ({
                            ...current,
                            password: event.target.value,
                          }))
                        }
                        placeholder="비밀번호를 입력하세요"
                        className="w-full bg-transparent text-[14px] text-[#1E2A3A] outline-none placeholder:text-[#94A3B8]"
                      />
                    </div>
                  </label>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1E2A3A] text-white rounded-xl hover:bg-[#2A3A4E] transition-colors"
                  >
                    로그인하고 계속하기
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form className="space-y-4" onSubmit={handleSignupSubmit}>
                  <label className="block text-[13px] text-[#1E2A3A] mb-2">
                    이름
                    <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                      <UserRound className="h-4 w-4 text-[#94A3B8]" />
                      <input
                        type="text"
                        value={signupForm.name}
                        onChange={(event) =>
                          setSignupForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        placeholder="이름을 입력하세요"
                        className="w-full bg-transparent text-[14px] text-[#1E2A3A] outline-none placeholder:text-[#94A3B8]"
                      />
                    </div>
                  </label>

                  <label className="block text-[13px] text-[#1E2A3A] mb-2">
                    이메일
                    <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                      <Mail className="h-4 w-4 text-[#94A3B8]" />
                      <input
                        type="email"
                        value={signupForm.email}
                        onChange={(event) =>
                          setSignupForm((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        placeholder="name@company.com"
                        className="w-full bg-transparent text-[14px] text-[#1E2A3A] outline-none placeholder:text-[#94A3B8]"
                      />
                    </div>
                  </label>

                  <label className="block text-[13px] text-[#1E2A3A] mb-2">
                    비밀번호
                    <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                      <Lock className="h-4 w-4 text-[#94A3B8]" />
                      <input
                        type="password"
                        value={signupForm.password}
                        onChange={(event) =>
                          setSignupForm((current) => ({
                            ...current,
                            password: event.target.value,
                          }))
                        }
                        placeholder="비밀번호를 입력하세요"
                        className="w-full bg-transparent text-[14px] text-[#1E2A3A] outline-none placeholder:text-[#94A3B8]"
                      />
                    </div>
                  </label>

                  <label className="block text-[13px] text-[#1E2A3A] mb-2">
                    비밀번호 확인
                    <div className="mt-2 flex items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
                      <CheckCircle2 className="h-4 w-4 text-[#94A3B8]" />
                      <input
                        type="password"
                        value={signupForm.passwordConfirm}
                        onChange={(event) =>
                          setSignupForm((current) => ({
                            ...current,
                            passwordConfirm: event.target.value,
                          }))
                        }
                        placeholder="비밀번호를 다시 입력하세요"
                        className="w-full bg-transparent text-[14px] text-[#1E2A3A] outline-none placeholder:text-[#94A3B8]"
                      />
                    </div>
                  </label>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#2DD4BF] text-[#1E2A3A] rounded-xl hover:bg-[#14B8A6] transition-colors"
                  >
                    회원가입하고 계속하기
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
