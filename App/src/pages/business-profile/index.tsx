import { useSearchParams } from "react-router";
import { BusinessProfile } from "../../app/components/BusinessProfile";

export function BusinessProfilePage() {
  const [searchParams] = useSearchParams();

  return <BusinessProfile scenarioId={searchParams.get("scenario")} />;
}
