function PageFrame({ title, description }) {
  return (
    <section className="page-frame">
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

export function TemplatesPage() {
  return <PageFrame title="Templates" description="Template catalog and policy linkage." />;
}
