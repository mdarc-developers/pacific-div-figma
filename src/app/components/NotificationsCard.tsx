import { useState, useEffect } from "react";
import { Bell, Plus } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
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
  const [pendingPhone, setPendingPhone] = useState(phoneNumber);

  // Sync local input when the saved value changes (e.g. loaded from Firestore)
  useEffect(() => {
    setPendingPhone(phoneNumber);
  }, [phoneNumber]);

  const handleSavePhone = () => {
    const trimmed = pendingPhone.trim();
    if (!trimmed) return;
    onPhoneNumberChange(trimmed);
  };

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
              <Label
                htmlFor="sms-alerts"
                className="text-sm font-medium cursor-pointer"
              >
                SMS alerts
              </Label>
              <p className="text-xs text-muted-foreground">
                Receive prize winner notifications by text
              </p>
            </div>
            <Checkbox
              id="sms-alerts"
              checked={smsEnabled}
              onCheckedChange={(checked) =>
                onSmsEnabledChange(checked === true)
              }
              aria-label="Enable SMS alerts"
            />
          </div>
          {smsEnabled && (
            <div className="space-y-1">
              <Label
                htmlFor="phone-number"
                className="text-xs text-muted-foreground"
              >
                Mobile phone number
              </Label>
              <div className="flex gap-2">
                <Input
                  id="phone-number"
                  type="tel"
                  placeholder="e.g. +1 555 123 4567"
                  value={pendingPhone}
                  onChange={(e) => setPendingPhone(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSavePhone();
                  }}
                  aria-label="Mobile phone number for SMS alerts"
                  className="text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSavePhone}
                  disabled={!pendingPhone.trim()}
                  aria-label="Save phone number"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
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
