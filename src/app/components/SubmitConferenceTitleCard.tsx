import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";

export interface TitleData {
  submitterEmail: string;
  slug: string;
}

interface Props {
  data: TitleData;
  onChange: (data: TitleData) => void;
}

export function SubmitConferenceTitleCard({ data, onChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label
            htmlFor="submit-email"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block"
          >
            Your email address <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-muted-foreground mb-1">
            Used to contact you with questions about your submission.
          </p>
          <Input
            id="submit-email"
            type="email"
            placeholder="you@example.com"
            value={data.submitterEmail}
            onChange={(e) =>
              onChange({ ...data, submitterEmail: e.target.value })
            }
          />
        </div>
        <div>
          <label
            htmlFor="submit-slug"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block"
          >
            Short identifier (slug) <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-muted-foreground mb-1">
            A unique 3–12 character lowercase identifier used as a key (e.g.{" "}
            <code>pacificon</code> or <code>hamfest26</code>). Letters, digits,
            and hyphens only. Will be used as{" "}
            <code>&lt;slug&gt;-2026</code> in the data files.
          </p>
          <Input
            id="submit-slug"
            placeholder="e.g. pacificon"
            value={data.slug}
            maxLength={12}
            onChange={(e) =>
              onChange({
                ...data,
                slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
              })
            }
          />
          {data.slug.length > 0 &&
            (data.slug.length < 3 || data.slug.length > 12) && (
              <p className="text-xs text-red-500 mt-1">
                Slug must be between 3 and 12 characters.
              </p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
