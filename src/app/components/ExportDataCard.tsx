import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { exportAndDownloadUserData } from "@/services/exportDataService";

interface ExportDataCardProps {
  uid: string;
}

export function ExportDataCard({ uid }: ExportDataCardProps) {
  const [exporting, setExporting] = useState<"json" | "csv" | null>(null);
  const [exportError, setExportError] = useState<string>("");

  const handleExport = async (format: "json" | "csv") => {
    setExportError("");
    setExporting(format);
    try {
      await exportAndDownloadUserData(uid, format);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to export data";
      setExportError(message);
    } finally {
      setExporting(null);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Export My Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Download a copy of all data associated with your account including
          bookmarks, votes, notes, raffle tickets, and settings.
        </p>
        <p className="text-xs text-muted-foreground">
          <strong>Data retention notice:</strong> Conference data is available
          for export up to <strong>90 days</strong> after the conference ends,
          after which it is automatically deleted.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={exporting !== null}
            onClick={() => handleExport("json")}
          >
            <Download className="h-4 w-4" />
            {exporting === "json" ? "Exporting…" : "Export as JSON"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={exporting !== null}
            onClick={() => handleExport("csv")}
          >
            <Download className="h-4 w-4" />
            {exporting === "csv" ? "Exporting…" : "Export as CSV"}
          </Button>
        </div>
        {exportError && (
          <p className="text-xs text-destructive">{exportError}</p>
        )}
      </CardContent>
    </Card>
  );
}
