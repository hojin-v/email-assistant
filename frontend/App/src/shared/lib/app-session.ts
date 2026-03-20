export type UserRole = "USER" | "ADMIN";

export type AppSession = {
  authenticated: boolean;
  onboardingCompleted: boolean;
  role: UserRole;
  userName: string;
  userEmail: string;
  clientIp: string;
  adminVpnApproved: boolean;
  connectedEmail: string;
  connectedEmails: string[];
};

type MockAuthAccount = {
  email: string;
  name: string;
  role: UserRole;
  password: string;
};

export const ADMIN_VPN_CIDR = "192.168.0.0/24";
export const DEFAULT_MOCK_CLIENT_IP = "192.168.0.42";
export const ADMIN_IP_DENIED_MOCK_CLIENT_IP = "203.0.113.25";

const mockAuthAccounts: MockAuthAccount[] = [
  {
    email: "admin@admin",
    name: "운영 관리자",
    role: "ADMIN",
    password: "admin",
  },
  {
    email: "ops@emailassist.com",
    name: "운영 담당자",
    role: "ADMIN",
    password: "admin",
  },
];

const STORAGE_KEY = "emailassist-app-session";

const defaultSession: AppSession = {
  authenticated: false,
  onboardingCompleted: false,
  role: "USER",
  userName: "",
  userEmail: "",
  clientIp: "",
  adminVpnApproved: false,
  connectedEmail: "",
  connectedEmails: [],
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

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
      role: parsed.role === "ADMIN" ? "ADMIN" : "USER",
      userName: parsed.userName ?? "",
      userEmail: parsed.userEmail ?? "",
      clientIp: parsed.clientIp ?? "",
      adminVpnApproved: parsed.adminVpnApproved === true,
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
  role = "USER",
  clientIp = DEFAULT_MOCK_CLIENT_IP,
  adminVpnApproved = false,
}: {
  name: string;
  email: string;
  role?: UserRole;
  clientIp?: string;
  adminVpnApproved?: boolean;
}) {
  const session: AppSession = {
    ...defaultSession,
    authenticated: true,
    onboardingCompleted: role === "ADMIN",
    role,
    userName: name,
    userEmail: email,
    clientIp,
    adminVpnApproved,
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

export function resolveMockAuthAccount(email: string): MockAuthAccount {
  const normalizedEmail = normalizeEmail(email);
  const account = mockAuthAccounts.find((item) => item.email === normalizedEmail);

  if (account) {
    return account;
  }

  return {
    email: normalizedEmail,
    name: deriveNameFromEmail(normalizedEmail) || "사용자",
    role: "USER",
    password: "",
  };
}

export function validateMockAccountPassword(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const account = mockAuthAccounts.find((item) => item.email === normalizedEmail);

  if (!account) {
    return true;
  }

  return account.password === password.trim();
}

export function isVpnIpAllowed(ip: string, cidr = ADMIN_VPN_CIDR) {
  const [network, maskBits] = cidr.split("/");
  const normalizedMask = Number(maskBits);

  if (!network || Number.isNaN(normalizedMask) || normalizedMask !== 24) {
    return false;
  }

  const ipParts = ip.split(".");
  const networkParts = network.split(".");

  if (ipParts.length !== 4 || networkParts.length !== 4) {
    return false;
  }

  return ipParts.slice(0, 3).join(".") === networkParts.slice(0, 3).join(".");
}

export function isAdminSession(session: AppSession) {
  return session.authenticated && session.role === "ADMIN";
}

export function canAccessAdmin(session: AppSession) {
  return isAdminSession(session) && session.adminVpnApproved;
}

export function canAccessUserWorkspace(session: AppSession) {
  return session.authenticated && session.role === "USER";
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
