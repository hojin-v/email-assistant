export type AppSession = {
  authenticated: boolean;
  onboardingCompleted: boolean;
  userName: string;
  userEmail: string;
  connectedEmail: string;
};

const STORAGE_KEY = "emailassist-app-session";

const defaultSession: AppSession = {
  authenticated: false,
  onboardingCompleted: false,
  userName: "",
  userEmail: "",
  connectedEmail: "",
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function writeSession(session: AppSession) {
  if (!canUseStorage()) {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function getAppSession(): AppSession {
  if (!canUseStorage()) {
    return defaultSession;
  }

  const raw = window.sessionStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return defaultSession;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppSession>;

    return {
      ...defaultSession,
      ...parsed,
      authenticated: parsed.authenticated === true,
      onboardingCompleted: parsed.onboardingCompleted === true,
      userName: parsed.userName ?? "",
      userEmail: parsed.userEmail ?? "",
      connectedEmail: parsed.connectedEmail ?? "",
    };
  } catch {
    return defaultSession;
  }
}

export function createAuthenticatedSession({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const session: AppSession = {
    ...defaultSession,
    authenticated: true,
    onboardingCompleted: false,
    userName: name,
    userEmail: email,
  };

  writeSession(session);
  return session;
}

export function updateAppSession(partial: Partial<AppSession>) {
  const nextSession = {
    ...getAppSession(),
    ...partial,
  };

  writeSession(nextSession);
  return nextSession;
}

export function markOnboardingComplete() {
  return updateAppSession({ onboardingCompleted: true });
}

export function setConnectedEmail(connectedEmail: string) {
  return updateAppSession({ connectedEmail });
}

export function clearAppSession() {
  if (!canUseStorage()) {
    return;
  }

  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function deriveNameFromEmail(email: string) {
  const localPart = email.split("@")[0] ?? "user";

  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
