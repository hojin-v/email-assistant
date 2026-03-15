import { useState } from "react";
import { PageHeader } from "../../shared/ui/primitives/PageHeader";
import { defaultSettingsState } from "../../entities/settings/model/default-settings";
import { SettingsTabs } from "../../features/settings/ui/SettingsTabs";
import { AccountSettingsPanel } from "../../features/settings/ui/AccountSettingsPanel";
import { NotificationSettingsPanel } from "../../features/settings/ui/NotificationSettingsPanel";
import { DisplaySettingsPanel } from "../../features/settings/ui/DisplaySettingsPanel";
import { EmailIntegrationSettingsPanel } from "../../features/settings/ui/EmailIntegrationSettingsPanel";
import { AdminInquirySettingsPanel } from "../../features/settings/ui/AdminInquirySettingsPanel";
import type {
  DisplaySettings,
  SettingsTabId,
} from "../../shared/types";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTabId>(
    defaultSettingsState.activeTab as SettingsTabId
  );

  return (
    <div className="mx-auto max-w-[1240px]">
      <PageHeader title="설정" description="계정 및 서비스 환경을 관리합니다" />
      <SettingsTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "account" ? <AccountSettingsPanel account={defaultSettingsState.account} /> : null}
      {activeTab === "notifications" ? (
        <NotificationSettingsPanel notifications={defaultSettingsState.notifications} />
      ) : null}
      {activeTab === "display" ? (
        <DisplaySettingsPanel display={defaultSettingsState.display as DisplaySettings} />
      ) : null}
      {activeTab === "email" ? (
        <EmailIntegrationSettingsPanel accounts={defaultSettingsState.emailAccounts} />
      ) : null}
      {activeTab === "support" ? <AdminInquirySettingsPanel /> : null}
    </div>
  );
}
