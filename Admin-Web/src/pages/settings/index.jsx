function PageFrame({ title, description }) {
  return (
    <section className="page-frame">
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

export function SettingsPage() {
  return <PageFrame title="Settings" description="System-level configuration." />;
}
