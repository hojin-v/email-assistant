import { useSearchParams } from "react-router";
import { Calendar } from "../../app/components/Calendar";

export function CalendarPage() {
  const [searchParams] = useSearchParams();

  return <Calendar scenarioId={searchParams.get("scenario")} />;
}
