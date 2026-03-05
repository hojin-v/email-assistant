function PageFrame({ title, description }) {
  return (
    <section className="page-frame">
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

export function UsersPage() {
  return <PageFrame title="Users" description="Admin user and role management." />;
}
