function PageFrame({ title, description }) {
  return (
    <section className="page-frame">
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

export function OnboardingWizardPage() {
  return <PageFrame title="Onboarding Wizard" description="Onboarding flow implementation starts here." />;
}
