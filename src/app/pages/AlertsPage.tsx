import { AlertsView, AlertHistoryView } from "@/app/components/AlertsView";
import { useAuth } from "../contexts/AuthContext";
import { useAlertHistoryContext } from "../contexts/AlertHistoryContext";

export function AlertsPage() {
  const { user } = useAuth();
  const { alertHistory, clearHistory } = useAlertHistoryContext();

  if (!user) {
    return <AlertsView />;
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <AlertHistoryView alertHistory={alertHistory} onClear={clearHistory} />
    </div>
  );
}

