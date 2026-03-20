import { useSearchParams } from "react-router";
import { Onboarding } from "../../app/components/Onboarding";

export function OnboardingPage() {
  const [searchParams] = useSearchParams();

  return <Onboarding scenarioId={searchParams.get("scenario")} />;
}
