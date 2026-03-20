import { useSearchParams } from "react-router";
import { TemplateLibrary } from "../../app/components/TemplateLibrary";

export function TemplateLibraryPage() {
  const [searchParams] = useSearchParams();

  return <TemplateLibrary scenarioId={searchParams.get("scenario")} />;
}
