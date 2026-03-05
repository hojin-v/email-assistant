function PageFrame({ title, description }) {
  return (
    <section className="page-frame">
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

export function AutomationSettingsPage() {
  return <PageFrame title="Automation Settings" description="Automation settings page implementation starts here." />;
}
