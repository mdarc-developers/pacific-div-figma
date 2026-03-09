import { useState, useMemo } from "react";
import { Exhibitor, Booth } from "@/types/conference";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Building2, Pencil, PlusCircle, Search, Trash2, X } from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}

// ---------------------------------------------------------------------------
// ExhibitorForm dialog
// ---------------------------------------------------------------------------

interface ExhibitorFormProps {
  open: boolean;
  initial: Exhibitor | null;
  onSave: (exhibitor: Exhibitor) => void;
  onClose: () => void;
}

function ExhibitorForm({ open, initial, onSave, onClose }: ExhibitorFormProps) {
  const blank: Exhibitor = {
    id: "",
    name: "",
    description: "",
    boothName: "",
    location: [],
    type: "",
    url: "",
    color: "",
  };
  const [form, setForm] = useState<Exhibitor>(initial ?? blank);

  // Reset when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) setForm(initial ?? blank);
    if (!isOpen) onClose();
  };

  const set = (field: keyof Exhibitor, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    const id = form.id.trim() || newId("exhibitor");
    onSave({ ...form, id });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit Exhibitor" : "Add Exhibitor"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1">
            <Label htmlFor="ex-id">ID</Label>
            <Input
              id="ex-id"
              value={form.id}
              onChange={(e) => set("id", e.target.value)}
              placeholder="auto-generated if blank"
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="ex-name">Name *</Label>
            <Input
              id="ex-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="ex-desc">Description</Label>
            <Input
              id="ex-desc"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="ex-booth">Booth Name</Label>
            <Input
              id="ex-booth"
              value={form.boothName}
              onChange={(e) => set("boothName", e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="ex-type">Type</Label>
            <Input
              id="ex-type"
              value={form.type ?? ""}
              onChange={(e) => set("type", e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="ex-url">URL</Label>
            <Input
              id="ex-url"
              value={form.url ?? ""}
              onChange={(e) => set("url", e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="ex-color">Color</Label>
            <Input
              id="ex-color"
              value={form.color ?? ""}
              onChange={(e) => set("color", e.target.value)}
              placeholder="#RRGGBB"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!form.name.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// DeleteDialog
// ---------------------------------------------------------------------------

interface DeleteDialogProps {
  open: boolean;
  name: string;
  onConfirm: () => void;
  onClose: () => void;
}

function DeleteDialog({ open, name, onConfirm, onClose }: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Exhibitor</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to delete <strong>{name}</strong>? This cannot
          be undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// ExhibitorAdminView
// ---------------------------------------------------------------------------

export interface ExhibitorAdminViewProps {
  conferenceId: string;
  initialExhibitors: Exhibitor[];
  /** All booths for this conference (used to derive zone labels). */
  allBooths?: Booth[];
}

export function ExhibitorAdminView({
  conferenceId,
  initialExhibitors,
  allBooths = [],
}: ExhibitorAdminViewProps) {
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>(initialExhibitors);
  const [form, setForm] = useState<{ open: boolean; item: Exhibitor | null }>({
    open: false,
    item: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<Exhibitor | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedZone, setSelectedZone] = useState("all");

  const saveExhibitor = (exhibitor: Exhibitor) => {
    setExhibitors((prev) => {
      const idx = prev.findIndex((e) => e.id === exhibitor.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = exhibitor;
        return next;
      }
      return [...prev, exhibitor];
    });
  };

  const deleteExhibitor = (id: string) =>
    setExhibitors((prev) => prev.filter((e) => e.id !== id));

  // Build a booth-id → zone lookup map from the provided booth data
  const boothZoneMap = useMemo<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    for (const booth of allBooths) {
      if (booth.locationZone) map[booth.id] = booth.locationZone;
    }
    return map;
  }, [allBooths]);

  // Derive the zone(s) for an exhibitor from its booth location IDs
  const getExhibitorZones = (exhibitor: Exhibitor): string[] => {
    const zones = new Set<string>();
    for (const locId of exhibitor.location ?? []) {
      const zone = boothZoneMap[locId];
      if (zone) zones.add(zone);
    }
    return Array.from(zones);
  };

  // Collect distinct types and zones for filter dropdowns
  const allTypes = useMemo(
    () =>
      Array.from(
        new Set(exhibitors.map((e) => e.type ?? "").filter(Boolean)),
      ).sort(),
    [exhibitors],
  );

  const allZones = useMemo(
    () =>
      Array.from(
        new Set(
          exhibitors.flatMap((e) => {
            const zones = new Set<string>();
            for (const locId of e.location ?? []) {
              const zone = boothZoneMap[locId];
              if (zone) zones.add(zone);
            }
            return Array.from(zones);
          }),
        ),
      ).sort(),
    [exhibitors, boothZoneMap],
  );

  const filteredExhibitors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return exhibitors
      .filter((e) => {
        if (q && !e.name.toLowerCase().includes(q) && !e.description?.toLowerCase().includes(q)) {
          return false;
        }
        if (selectedType !== "all" && (e.type ?? "") !== selectedType) {
          return false;
        }
        if (selectedZone !== "all") {
          if (!getExhibitorZones(e).includes(selectedZone)) return false;
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [exhibitors, searchQuery, selectedType, selectedZone, boothZoneMap]);

  const hasActiveFilter =
    searchQuery.trim() !== "" || selectedType !== "all" || selectedZone !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedZone("all");
  };

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Exhibitors
          <span className="text-sm text-gray-500 font-normal">
            ({conferenceId})
          </span>
        </h2>
        <Button size="sm" onClick={() => setForm({ open: true, item: null })}>
          <PlusCircle className="h-4 w-4" />
          Add Exhibitor
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search exhibitors…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
            aria-label="Search exhibitors"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[150px]" aria-label="Filter by type">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {allTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {allZones.length > 0 && (
          <Select value={selectedZone} onValueChange={setSelectedZone}>
            <SelectTrigger className="w-[150px]" aria-label="Filter by zone">
              <SelectValue placeholder="All Zones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Zones</SelectItem>
              {allZones.map((zone) => (
                <SelectItem key={zone} value={zone}>
                  {zone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {hasActiveFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-1 text-muted-foreground"
            aria-label="Clear filters"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Result count when filtering */}
      {hasActiveFilter && (
        <p className="text-sm text-muted-foreground">
          Showing {filteredExhibitors.length} of {exhibitors.length} exhibitor
          {filteredExhibitors.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Exhibitor cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filteredExhibitors.map((exhibitor) => {
          const zones = getExhibitorZones(exhibitor);
          return (
          <Card key={exhibitor.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base leading-tight">
                  {exhibitor.name}
                </CardTitle>
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => setForm({ open: true, item: exhibitor })}
                    aria-label={`Edit ${exhibitor.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-red-500 hover:text-red-600"
                    onClick={() => setDeleteTarget(exhibitor)}
                    aria-label={`Delete ${exhibitor.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
              {exhibitor.description && <p>{exhibitor.description}</p>}
              {exhibitor.boothName && (
                <p>
                  <strong>Booth:</strong> {exhibitor.boothName}
                </p>
              )}
              {zones.length > 0 && (
                <p>
                  <strong>Zone:</strong> {zones.join(", ")}
                </p>
              )}
              {exhibitor.type && (
                <p>
                  <strong>Type:</strong> {exhibitor.type}
                </p>
              )}
              {exhibitor.url && (
                <p>
                  <strong>URL:</strong>{" "}
                  <a
                    href={exhibitor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 underline break-all"
                  >
                    {exhibitor.url}
                  </a>
                </p>
              )}
              <p className="text-xs text-gray-400">ID: {exhibitor.id}</p>
            </CardContent>
          </Card>
          );
        })}
        {filteredExhibitors.length === 0 && (
          <p className="text-gray-500 text-sm col-span-2">
            {hasActiveFilter ? "No exhibitors match the current filters." : "No exhibitors yet."}
          </p>
        )}
      </div>

      {/* Dialogs */}
      <ExhibitorForm
        open={form.open}
        initial={form.item}
        onSave={saveExhibitor}
        onClose={() => setForm({ open: false, item: null })}
      />

      <DeleteDialog
        open={deleteTarget !== null}
        name={deleteTarget?.name ?? ""}
        onConfirm={() => {
          if (deleteTarget) deleteExhibitor(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
