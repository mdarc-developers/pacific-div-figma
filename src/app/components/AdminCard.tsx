import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
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
          <Link
            to="/admin/prizes"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Prizes Management →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
