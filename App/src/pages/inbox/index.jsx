import { useMemo, useState } from "react";

const initialEmails = [
  { id: "e1", sender: "Park", subject: "Enterprise pricing inquiry", status: "pending" },
  { id: "e2", sender: "Lee", subject: "Delivery complaint", status: "auto-sent" },
  { id: "e3", sender: "Choi", subject: "Partnership request", status: "pending" },
  { id: "e4", sender: "Jung", subject: "Contract update request", status: "completed" },
];

const tabs = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "completed", label: "Completed" },
  { id: "auto-sent", label: "Auto Sent" },
];

function getStatusClass(status) {
  if (status === "pending") return "status-chip status-chip--pending";
  if (status === "auto-sent") return "status-chip status-chip--sent";
  return "status-chip status-chip--completed";
}

export function InboxPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedEmailId, setSelectedEmailId] = useState(initialEmails[0].id);

  const pendingCount = useMemo(
    () => initialEmails.filter((email) => email.status === "pending").length,
    []
  );

  const emails = useMemo(() => {
    if (activeTab === "all") return initialEmails;
    return initialEmails.filter((email) => email.status === activeTab);
  }, [activeTab]);

  const selectedEmail = emails.find((email) => email.id === selectedEmailId) || emails[0];

  return (
    <section className="inbox-layout">
      <aside className="page-frame inbox-column inbox-column--left">
        <h1>Inbox</h1>
        <div className="tab-row">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? "tab-btn tab-btn--active" : "tab-btn"}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.id === "pending" && pendingCount > 0 ? <span className="count-badge">{pendingCount}</span> : null}
            </button>
          ))}
        </div>

        <div className="row-list">
          {emails.map((email) => (
            <button
              key={email.id}
              type="button"
              className={selectedEmail?.id === email.id ? "row-item row-item--active" : "row-item"}
              onClick={() => setSelectedEmailId(email.id)}
            >
              <div>
                <strong>{email.sender}</strong>
                <p>{email.subject}</p>
              </div>
              <span className={getStatusClass(email.status)}>{email.status}</span>
            </button>
          ))}
        </div>
      </aside>

      <article className="page-frame inbox-column">
        <h2>Email body</h2>
        <p>
          {selectedEmail
            ? `${selectedEmail.sender}: ${selectedEmail.subject}`
            : "No email in this filter yet."}
        </p>
      </article>

      <article className="page-frame inbox-column">
        <h2>AI draft</h2>
        <p>Draft panel behavior by status will be implemented next.</p>
      </article>
    </section>
  );
}
