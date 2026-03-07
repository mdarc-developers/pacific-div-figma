import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";

export function AdminCard() {
  return (
    <Card className="border-green-300 dark:border-green-800">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium">Administrator</p>
          </div>
          <Button asChild variant="link" size="sm" className="px-0">
            <Link to="/admin/prizes">Prizes Management →</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
