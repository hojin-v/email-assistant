import { Plus } from "lucide-react";

function AccountProviderIcon({ provider }) {
  if (provider === "Gmail") {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EA4335] text-sm font-semibold text-white">
        G
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#64748B] text-sm font-semibold text-white">
      {provider.slice(0, 1)}
    </div>
  );
}

export function EmailIntegrationSettingsPanel({ accounts }) {
  return (
    <section className="rounded-[24px] border border-border bg-card px-5 py-6 shadow-sm lg:px-6">
      <h2 className="text-xl font-semibold text-foreground">연결된 이메일 계정</h2>

      <div className="mt-6 space-y-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-[#E2E8F0] px-4 py-5"
          >
            <div className="flex items-center gap-4">
              <AccountProviderIcon provider={account.provider} />

              <div>
                <p className="text-xl font-medium text-[#0F172A]">{account.email}</p>
                <span className="mt-2 inline-flex rounded-full bg-[#ECFDF5] px-2 py-1 text-[11px] font-medium text-[#10B981]">
                  {account.status}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="rounded-xl border border-[#EF4444] px-4 py-2 text-sm font-medium text-[#EF4444] transition hover:bg-[#FEF2F2]"
            >
              연결 해제
            </button>
          </div>
        ))}

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-[18px] border border-dashed border-[#D7E0EB] px-4 py-6 text-base font-medium text-[#64748B] transition hover:bg-[#F8FAFC]"
        >
          <Plus className="h-4 w-4" />
          <span>계정 추가</span>
        </button>
      </div>
    </section>
  );
}
