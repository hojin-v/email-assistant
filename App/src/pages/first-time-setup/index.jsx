import { Link } from "react-router";

export function FirstTimeSetupPage() {
  return (
    <section className="page-frame">
      <h1>First Time Setup</h1>
      <p>Entry page for initial setup flow.</p>
      <Link className="cta-link" to="/app">Enter App</Link>
    </section>
  );
}
