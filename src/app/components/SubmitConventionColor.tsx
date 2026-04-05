import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";

export interface ColorData {
  primaryColor: string;
  secondaryColor: string;
}

interface Props {
  data: ColorData;
  onChange: (data: ColorData) => void;
}

export function SubmitConventionColor({ data, onChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Colors</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Choose brand colors for your conference in HTML hex notation (e.g.{" "}
          <code>#1A2B3C</code>). These are used for the conference header and
          accent styling. Values must be between{" "}
          <code>#000000</code> and <code>#FFFFFF</code>.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="submit-primary-color"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block"
            >
              Primary color <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.primaryColor || "#000000"}
                onChange={(e) =>
                  onChange({ ...data, primaryColor: e.target.value })
                }
                className="h-9 w-10 rounded border cursor-pointer bg-transparent"
                aria-label="Primary color picker"
              />
              <Input
                id="submit-primary-color"
                placeholder="#000000"
                value={data.primaryColor}
                maxLength={7}
                onChange={(e) =>
                  onChange({ ...data, primaryColor: e.target.value })
                }
                className="font-mono"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="submit-secondary-color"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block"
            >
              Secondary color <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.secondaryColor || "#FFFFFF"}
                onChange={(e) =>
                  onChange({ ...data, secondaryColor: e.target.value })
                }
                className="h-9 w-10 rounded border cursor-pointer bg-transparent"
                aria-label="Secondary color picker"
              />
              <Input
                id="submit-secondary-color"
                placeholder="#FFFFFF"
                value={data.secondaryColor}
                maxLength={7}
                onChange={(e) =>
                  onChange({ ...data, secondaryColor: e.target.value })
                }
                className="font-mono"
              />
            </div>
          </div>
        </div>
        {(data.primaryColor || data.secondaryColor) && (
          <div
            className="rounded-lg p-4 flex items-center justify-center text-sm font-medium border"
            style={{
              backgroundColor: data.primaryColor || "#000000",
              color: data.secondaryColor || "#FFFFFF",
            }}
          >
            Color preview
          </div>
        )}
      </CardContent>
    </Card>
  );
}
