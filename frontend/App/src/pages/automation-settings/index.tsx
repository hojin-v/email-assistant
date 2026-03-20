import { useSearchParams } from "react-router";
import { AutomationSettings } from "../../app/components/AutomationSettings";

export function AutomationSettingsPage() {
  const [searchParams] = useSearchParams();

  return <AutomationSettings scenarioId={searchParams.get("scenario")} />;
}
