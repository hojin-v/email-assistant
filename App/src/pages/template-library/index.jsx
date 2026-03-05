function PageFrame({ title, description }) {
  return (
    <section className="page-frame">
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

export function TemplateLibraryPage() {
  return <PageFrame title="Template Library" description="Template search and detail modal will be implemented." />;
}
