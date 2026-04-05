import { useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Upload } from "lucide-react";

export interface AssetsData {
  logoFile: File | null;
  programFile: File | null;
  mapFiles: File[];
}

interface Props {
  data: AssetsData;
  slug: string;
  onChange: (data: AssetsData) => void;
}

export function SubmitConventionAssets({ data, slug, onChange }: Props) {
  const logoRef = useRef<HTMLInputElement>(null);
  const programRef = useRef<HTMLInputElement>(null);
  const mapsRef = useRef<HTMLInputElement>(null);

  const logoUrl = data.logoFile
    ? `/assets/images/${data.logoFile.name}`
    : null;
  const programUrl = data.programFile
    ? `/assets/programs/${data.programFile.name}`
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Logo image <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            Small logo for the conference header. Preferably PNG or GIF with
            transparent background; JPG is accepted and can be converted. Will
            be placed in <code>public/assets/images/</code>.
          </p>
          <input
            ref={logoRef}
            type="file"
            accept="image/png,image/gif,image/jpeg,image/jpg"
            className="hidden"
            onChange={(e) =>
              onChange({ ...data, logoFile: e.target.files?.[0] ?? null })
            }
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => logoRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            {data.logoFile ? data.logoFile.name : "Choose logo…"}
          </Button>
          {logoUrl && (
            <p className="text-xs text-muted-foreground mt-1">
              Path: <code>{logoUrl}</code>
            </p>
          )}
        </div>

        {/* Program PDF */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Conference program (PDF) <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            PDF with as much detail as possible (sessions, exhibitors,
            schedule). A PDF printout of web pages is acceptable as a last
            resort. Will be placed in <code>public/assets/programs/</code>.
          </p>
          <input
            ref={programRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) =>
              onChange({ ...data, programFile: e.target.files?.[0] ?? null })
            }
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => programRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            {data.programFile ? data.programFile.name : "Choose program PDF…"}
          </Button>
          {programUrl && (
            <p className="text-xs text-muted-foreground mt-1">
              Path: <code>{programUrl}</code>
            </p>
          )}
        </div>

        {/* Maps */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Map image(s) <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            At least one map image (PNG, JPG, PDF, or SVG). Multiple files are
            accepted. Will be placed in <code>public/assets/maps/</code>. For
            each map, provide the original pixel dimensions and the desired
            display order.
          </p>
          <input
            ref={mapsRef}
            type="file"
            accept="image/*,application/pdf,image/svg+xml"
            multiple
            className="hidden"
            onChange={(e) =>
              onChange({
                ...data,
                mapFiles: e.target.files ? Array.from(e.target.files) : [],
              })
            }
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => mapsRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            {data.mapFiles.length > 0
              ? `${data.mapFiles.length} file(s) selected`
              : "Choose map(s)…"}
          </Button>
          {data.mapFiles.length > 0 && (
            <ul className="mt-2 text-xs text-muted-foreground list-disc list-inside">
              {data.mapFiles.map((f, i) => (
                <li key={i}>
                  <code>/assets/maps/{f.name}</code>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* LoFi data note */}
        {slug && (
          <div className="rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 text-xs text-muted-foreground">
            <p className="font-medium mb-1">
              Data file: <code>src/data/{slug}-2026.ts</code>
            </p>
            <p>
              Provide at least one validated user profile (prize-admin,
              forums-admin, session-admin, exhibitor-admin) and calculated map
              entries{" "}
              <code>
                export const conferenceMaps: MapImage[] = [{"{"}id, name, url,
                order, origWidthNum, origHeightNum{"}"}]
              </code>{" "}
              in the Context notes field.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
