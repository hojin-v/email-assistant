const tabs = [
  { id: "account", label: "계정" },
  { id: "notifications", label: "알림" },
  { id: "display", label: "화면" },
  { id: "email", label: "이메일 연동" },
];

export function SettingsTabs({ activeTab, onChange }) {
  return (
    <div className="mb-6 border-b border-border">
      <div className="flex flex-wrap gap-5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`border-b-2 pb-3 text-sm transition ${
              activeTab === tab.id
                ? "border-[#2DD4BF] text-[#0F766E]"
                : "border-transparent text-slate-400"
            }`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
