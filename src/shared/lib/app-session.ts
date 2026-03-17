export type AppSession = {
  authenticated: boolean;
  onboardingCompleted: boolean;
  userName: string;
  userEmail: string;
  connectedEmail: string;
  connectedEmails: string[];
};

const STORAGE_KEY = "emailassist-app-session";

const defaultSession: AppSession = {
  authenticated: false,
  onboardingCompleted: false,
  userName: "",
  userEmail: "",
  connectedEmail: "",
  connectedEmails: [],
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
    const connectedEmails = Array.isArray(parsed.connectedEmails)
      ? parsed.connectedEmails.filter(
          (email): email is string => typeof email === "string" && email.trim().length > 0,
        )
      : parsed.connectedEmail
      ? [parsed.connectedEmail]
      : [];
    const primaryConnectedEmail =
      parsed.connectedEmail ?? connectedEmails[connectedEmails.length - 1] ?? "";

    return {
      ...defaultSession,
      ...parsed,
      authenticated: parsed.authenticated === true,
      onboardingCompleted: parsed.onboardingCompleted === true,
      userName: parsed.userName ?? "",
      userEmail: parsed.userEmail ?? "",
      connectedEmail: primaryConnectedEmail,
      connectedEmails,
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
  const current = getAppSession();
  const connectedEmails = connectedEmail
    ? Array.from(new Set([...current.connectedEmails.filter(Boolean), connectedEmail]))
    : [];

  return updateAppSession({
    connectedEmail,
    connectedEmails,
  });
}

export function setConnectedEmails(connectedEmails: string[]) {
  const normalized = Array.from(
    new Set(
      connectedEmails.filter(
        (email): email is string => typeof email === "string" && email.trim().length > 0,
      ),
    ),
  );

  return updateAppSession({
    connectedEmail: normalized[normalized.length - 1] ?? "",
    connectedEmails: normalized,
  });
}

export function deriveGoogleIntegrationEmail(userEmail: string) {
  const normalizedEmail = userEmail.trim().toLowerCase();

  if (!normalizedEmail) {
    return "user@gmail.com";
  }

  if (normalizedEmail.endsWith("@gmail.com")) {
    return normalizedEmail;
  }

  const localPart = normalizedEmail.split("@")[0] ?? "user";
  return `${localPart || "user"}@gmail.com`;
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
