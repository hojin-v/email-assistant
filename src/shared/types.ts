export type EmailStatus = "pending" | "completed" | "auto-sent";

export type StatusBadgeTone =
  | "warning"
  | "success"
  | "neutral"
  | "teal"
  | "red";

export type SearchSectionKey = "inbox" | "calendar" | "templates";

export type SettingsTabId =
  | "account"
  | "notifications"
  | "display"
  | "email"
  | "support";

export interface SearchIndexItem {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  path: string;
}

export interface DetectedSchedule {
  detected: true;
  title: string;
  suggestedDate: string;
  suggestedTime: string;
  duration: string;
  type: "video" | "meeting";
  location: string;
  attendees: string[];
}

export interface UndetectedSchedule {
  detected: false;
}

export type EmailSchedule = DetectedSchedule | UndetectedSchedule;

export interface EmailItem {
  id: string;
  sender: string;
  senderEmail: string;
  company: string;
  subject: string;
  preview: string;
  summary: string;
  body: string;
  time: string;
  receivedDate: string;
  category: string;
  confidence: number;
  status: EmailStatus;
  sentTime: string;
  schedule: EmailSchedule;
  draft: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  content: string;
  time: string;
  actionLabel: string;
  actionPath: string;
  read: boolean;
  tone: "teal" | "amber" | "red";
}

export interface AccountSettings {
  name: string;
  email: string;
}

export interface NotificationSettings {
  newEmail: boolean;
  draftQueue: boolean;
  draftThreshold: number;
  accountError: boolean;
  unclassified: boolean;
  calendarQueue: boolean;
  dailySummary: boolean;
}

export interface DisplayWidget {
  id: string;
  label: string;
  visible: boolean;
}

export interface DisplaySettings {
  theme: "light" | "dark";
  widgets: DisplayWidget[];
}

export interface EmailAccount {
  id: string;
  provider: string;
  email: string;
  status: string;
}
