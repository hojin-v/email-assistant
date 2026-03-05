function PageFrame({ title, description }) {
  return (
    <section className="page-frame">
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

export function InboxMonitorPage() {
  return <PageFrame title="Inbox Monitor" description="Monitor queue, pending drafts, and processing statuses." />;
}
