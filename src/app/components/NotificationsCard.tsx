import { useState, useEffect } from "react";
import { Bell, Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

const MINUTES_OPTIONS = [5, 10, 15, 30, 60];

interface NotificationsCardProps {
  smsEnabled: boolean;
  phoneNumber: string;
  minutesBefore: number;
  onSmsEnabledChange: (value: boolean) => void;
  onPhoneNumberChange: (value: string) => void;
  onMinutesBeforeChange: (value: number) => void;
  emailEnabled: boolean;
  onEmailEnabledChange: (value: boolean) => void;
}

export function NotificationsCard({
  smsEnabled,
  phoneNumber,
  minutesBefore,
  onSmsEnabledChange,
  onPhoneNumberChange,
  onMinutesBeforeChange,
  emailEnabled,
  onEmailEnabledChange,
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
          <div>
            <Label
              htmlFor="minutes-before"
              className="text-sm font-medium cursor-pointer"
            >
              Minutes before session
            </Label>
            <p className="text-xs text-muted-foreground">
              Notify this many minutes before a bookmarked session or forum
            </p>
          </div>
          <Select
            value={String(
              MINUTES_OPTIONS.includes(minutesBefore) ? minutesBefore : 10,
            )}
            onValueChange={(v) => onMinutesBeforeChange(Number(v))}
          >
            <SelectTrigger
              id="minutes-before"
              className="w-24 text-sm"
              aria-label="Minutes before session notification"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MINUTES_OPTIONS.map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {m} min
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Separator />
        <div className="flex items-center justify-between gap-2">
          <div>
            <Label
              htmlFor="email-alerts"
              className="text-sm font-medium cursor-pointer"
            >
              Email alerts
            </Label>
            <p className="text-xs text-muted-foreground">
              Receive prize winner notifications by email
            </p>
          </div>
          <Checkbox
            id="email-alerts"
            checked={emailEnabled}
            onCheckedChange={(checked) =>
              onEmailEnabledChange(checked === true)
            }
            aria-label="Enable email alerts"
          />
        </div>
      </CardContent>
    </Card>
  );
}
