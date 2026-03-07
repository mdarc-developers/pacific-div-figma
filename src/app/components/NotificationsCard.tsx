import { Bell } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Separator } from "@/app/components/ui/separator";

interface NotificationsCardProps {
  smsEnabled: boolean;
  phoneNumber: string;
  onSmsEnabledChange: (value: boolean) => void;
  onPhoneNumberChange: (value: string) => void;
}

export function NotificationsCard({
  smsEnabled,
  phoneNumber,
  onSmsEnabledChange,
  onPhoneNumberChange,
}: NotificationsCardProps) {
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
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <Label htmlFor="sms-alerts" className="text-sm font-medium cursor-pointer">
                SMS alerts
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive prize winner notifications by text
              </p>
            </div>
            <Checkbox
              id="sms-alerts"
              checked={smsEnabled}
              onCheckedChange={(checked) => onSmsEnabledChange(checked === true)}
              aria-label="Enable SMS alerts"
            />
          </div>
          {smsEnabled && (
            <div className="space-y-1">
              <Label htmlFor="phone-number" className="text-xs text-muted-foreground">
                Mobile phone number
              </Label>
              <Input
                id="phone-number"
                type="tel"
                placeholder="e.g. +1 555 123 4567"
                value={phoneNumber}
                onChange={(e) => onPhoneNumberChange(e.target.value)}
                aria-label="Mobile phone number for SMS alerts"
                className="text-sm"
              />
            </div>
          )}
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
