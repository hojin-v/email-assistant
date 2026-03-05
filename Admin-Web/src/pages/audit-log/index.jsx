function PageFrame({ title, description }) {
  return (
    <section className="page-frame">
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

export function AuditLogPage() {
  return <PageFrame title="Audit Log" description="Track admin actions and policy changes." />;
}
