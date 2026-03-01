import { Bell } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Separator } from "@/app/components/ui/separator";

export function NotificationsCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">Email alerts</p>
          <Badge variant="secondary" className="text-xs">
            Coming soon
          </Badge>
        </div>
        <Separator />
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">SMS alerts</p>
          <Badge variant="secondary" className="text-xs">
            Coming soon
          </Badge>
        </div>
        <Separator />
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">Messages</p>
          <Badge variant="secondary" className="text-xs">
            Coming soon
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
