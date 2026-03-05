import { Link } from "react-router";

const stats = [
  { id: "emails", label: "Processed emails today", value: "47", sub: "+5 vs yesterday" },
  { id: "pending", label: "Drafts pending review", value: "3", sub: "Needs review now", alert: true },
  { id: "match", label: "Template match rate", value: "96%", sub: "+2% vs last week" },
  { id: "account", label: "Email account status", value: "Connected", sub: "user@gmail.com", success: true },
];

const recentEmails = [
  { id: "e1", sender: "Park", subject: "Enterprise pricing inquiry", status: "pending" },
  { id: "e2", sender: "Lee", subject: "Delay complaint reception", status: "auto-sent" },
  { id: "e3", sender: "Choi", subject: "Partnership meeting request", status: "completed" },
];

function getStatusClass(status) {
  if (status === "pending") return "status-chip status-chip--pending";
  if (status === "auto-sent") return "status-chip status-chip--sent";
  return "status-chip status-chip--completed";
}

export function DashboardPage() {
  return (
    <section className="dashboard">
      <div className="page-frame">
        <h1>Dashboard</h1>
        <p>Action-focused overview based on the Figma direction.</p>
      </div>

      <div className="action-banner">
        <div>There are 3 drafts waiting for review.</div>
        <Link to="/app/inbox" className="cta-link">
          Review now
        </Link>
      </div>

      <div className="stat-grid">
        {stats.map((stat) => (
          <article
            key={stat.id}
            className={
              stat.alert
                ? "stat-card stat-card--alert"
                : stat.success
                ? "stat-card stat-card--success"
                : "stat-card"
            }
          >
            <p className="stat-value">{stat.value}</p>
            <p className="stat-label">{stat.label}</p>
            <p className="stat-sub">{stat.sub}</p>
          </article>
        ))}
      </div>

      <section className="page-frame">
        <div className="section-head">
          <h2>Recent emails</h2>
          <Link to="/app/inbox" className="cta-link">
            View all
          </Link>
        </div>
        <div className="row-list">
          {recentEmails.map((email) => (
            <div key={email.id} className="row-item">
              <div>
                <strong>{email.sender}</strong>
                <p>{email.subject}</p>
              </div>
              <span className={getStatusClass(email.status)}>{email.status}</span>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
