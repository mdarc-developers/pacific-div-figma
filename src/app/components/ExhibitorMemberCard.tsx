import { Store } from "lucide-react";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Exhibitor } from "@/types/conference";

interface ExhibitorMemberCardProps {
  isExhibitorMember: boolean;
  onIsExhibitorMemberChange: (value: boolean) => void;
  exhibitorMemberId: string;
  onExhibitorMemberIdChange: (value: string) => void;
  exhibitors: Exhibitor[];
}

export function ExhibitorMemberCard({
  isExhibitorMember,
  onIsExhibitorMemberChange,
  exhibitorMemberId,
  onExhibitorMemberIdChange,
  exhibitors,
}: ExhibitorMemberCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-1.5">
          <Store className="h-3.5 w-3.5" aria-hidden="true" />
          Exhibitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 justify-end">
          <Label
            htmlFor="exhibitor-member"
            className="text-sm font-medium cursor-pointer"
          >
            I am exhibiting at this conference
          </Label>
          <Checkbox
            id="exhibitor-member"
            checked={isExhibitorMember}
            onCheckedChange={(checked) => {
              const value = checked === true;
              onIsExhibitorMemberChange(value);
              if (!value) {
                onExhibitorMemberIdChange("");
              }
            }}
          />
        </div>
        {isExhibitorMember && exhibitors.length > 0 && (
          <Select
            value={exhibitorMemberId}
            onValueChange={onExhibitorMemberIdChange}
          >
            <SelectTrigger
              className="w-full text-sm"
              aria-label="Select your exhibitor"
            >
              <SelectValue placeholder="Select exhibitor…" />
            </SelectTrigger>
            <SelectContent>
              {exhibitors.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {isExhibitorMember && exhibitors.length === 0 && (
          <p className="text-xs text-muted-foreground italic">
            No exhibitors available for this conference.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
