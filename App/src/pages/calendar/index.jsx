function PageFrame({ title, description }) {
  return (
    <section className="page-frame">
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

export function CalendarPage() {
  return <PageFrame title="Calendar" description="Calendar page implementation starts here." />;
}
