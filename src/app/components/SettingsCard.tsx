import { MonitorCog, Moon, Sun } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/app/components/ui/toggle-group";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import type { Theme } from "@/app/contexts/ThemeContext";

interface SettingsCardProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

function isTheme(value: string): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

export function SettingsCard({ theme, onThemeChange }: SettingsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium">Theme</p>
            <p className="text-xs text-muted-foreground">
              Appearance preference
            </p>
          </div>
          <ToggleGroup
            type="single"
            value={theme}
            onValueChange={(value) => {
              if (!value || !isTheme(value)) return;
              onThemeChange(value);
            }}
            variant="outline"
            size="sm"
            aria-label="Theme"
          >
            <ToggleGroupItem
              value="light"
              aria-label="Light theme"
              title="Light theme"
            >
              <Sun className="h-4 w-4" /> Light
            </ToggleGroupItem>
            <ToggleGroupItem
              value="system"
              aria-label="System theme"
              title="System theme"
            >
              <MonitorCog className="h-4 w-4" /> System
            </ToggleGroupItem>
            <ToggleGroupItem
              value="dark"
              aria-label="Dark theme"
              title="Dark theme"
            >
              <Moon className="h-4 w-4" /> Dark
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardContent>
    </Card>
  );
}
