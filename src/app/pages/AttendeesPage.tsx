import { useSearchParams } from "react-router-dom";
import { AttendeesView } from "@/app/components/AttendeesView";

export function AttendeesPage() {
  const [searchParams] = useSearchParams();
  const highlightAttendeeId = searchParams.get("highlight") ?? undefined;
  return <AttendeesView highlightAttendeeId={highlightAttendeeId} />;
}
