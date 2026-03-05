function PageFrame({ title, description }) {
  return (
    <section className="page-frame">
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

export function DashboardPage() {
  return <PageFrame title="Admin Dashboard" description="Operations summary and system health." />;
}
