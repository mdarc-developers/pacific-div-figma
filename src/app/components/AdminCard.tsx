import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";

interface AdminCardProps {
  isPrizesAdmin?: boolean;
  isExhibitorAdmin?: boolean;
  isSessionAdmin?: boolean;
}

export function AdminCard({
  isPrizesAdmin = false,
  isExhibitorAdmin = false,
  isSessionAdmin = false,
}: AdminCardProps) {
  return (
    <Card className="border-green-300 dark:border-green-800">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium">Administrator</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {isPrizesAdmin && (
              <Button asChild variant="link" size="sm" className="px-0 h-auto">
                <Link to="/admin/prizes">Prizes Management →</Link>
              </Button>
            )}
            {isExhibitorAdmin && (
              <Button asChild variant="link" size="sm" className="px-0 h-auto">
                <Link to="/admin/exhibitors">Exhibitors Management →</Link>
              </Button>
            )}
            {isSessionAdmin && (
              <Button asChild variant="link" size="sm" className="px-0 h-auto">
                <Link to="/admin/sessions">Sessions Management →</Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
