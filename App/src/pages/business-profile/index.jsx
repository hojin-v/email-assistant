function PageFrame({ title, description }) {
  return (
    <section className="page-frame">
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

export function BusinessProfilePage() {
  return <PageFrame title="Business Profile" description="Business profile page implementation starts here." />;
}
