import { useState } from "react";
import { Prize, PrizeWinner } from "@/types/conference";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Pencil, PlusCircle, Trash2, Trophy, UserCheck } from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}

// ---------------------------------------------------------------------------
// Prize form (create / edit)
// ---------------------------------------------------------------------------

const EMPTY_PRIZE: Omit<Prize, "id"> = {
  name: "",
  description: "",
  imageUrl: "",
  category: "Prize",
  donor: "",
  winner: undefined,
};

interface PrizeFormProps {
  open: boolean;
  initial: Prize | null;
  onSave: (prize: Prize) => void;
  onClose: () => void;
}

function PrizeForm({ open, initial, onSave, onClose }: PrizeFormProps) {
  const [form, setForm] = useState<Omit<Prize, "id">>(
    initial ? { ...initial } : { ...EMPTY_PRIZE },
  );

  // Reset whenever the dialog is (re)opened
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) setForm(initial ? { ...initial } : { ...EMPTY_PRIZE });
    if (!isOpen) onClose();
  };

  const set = (field: keyof Omit<Prize, "id">, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave({ id: initial?.id ?? newId("p"), ...form });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Prize" : "Add Prize"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="p-name">Name *</Label>
            <Input
              id="p-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="p-desc">Description</Label>
            <Input
              id="p-desc"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="p-category">Category</Label>
            <Input
              id="p-category"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="p-donor">Donor</Label>
            <Input
              id="p-donor"
              value={form.donor}
              onChange={(e) => set("donor", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="p-image">Image URL</Label>
            <Input
              id="p-image"
              value={form.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="p-winner">Winner ID (optional)</Label>
            <Input
              id="p-winner"
              value={form.winner ?? ""}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  winner: e.target.value || undefined,
                }))
              }
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
// PrizeWinner form (create / edit)
// ---------------------------------------------------------------------------

const EMPTY_WINNER: Omit<PrizeWinner, "id"> = {
  prizeId: [],
  winningTicket: "",
  winnerCallsign: undefined,
  winnerName: undefined,
  winnerEmail: undefined,
  drawing: undefined,
  notifiedAt: undefined,
  claimedAt: undefined,
};

interface WinnerFormProps {
  open: boolean;
  initial: PrizeWinner | null;
  onSave: (winner: PrizeWinner) => void;
  onClose: () => void;
}

function WinnerForm({ open, initial, onSave, onClose }: WinnerFormProps) {
  const [form, setForm] = useState<Omit<PrizeWinner, "id">>(
    initial ? { ...initial } : { ...EMPTY_WINNER },
  );

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) setForm(initial ? { ...initial } : { ...EMPTY_WINNER });
    if (!isOpen) onClose();
  };

  const setStr = (
    field: keyof Omit<PrizeWinner, "id" | "prizeId">,
    value: string,
  ) => setForm((prev) => ({ ...prev, [field]: value || undefined }));

  const handleSave = () => {
    if (!form.winningTicket.trim()) return;
    onSave({ id: initial?.id ?? newId("winner"), ...form });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Winner" : "Add Winner"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="w-ticket">Winning Ticket *</Label>
            <Input
              id="w-ticket"
              value={form.winningTicket}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  winningTicket: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="w-prizes">Prize IDs (comma-separated)</Label>
            <Input
              id="w-prizes"
              value={form.prizeId.join(", ")}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  prizeId: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="w-callsign">Callsign</Label>
            <Input
              id="w-callsign"
              value={form.winnerCallsign ?? ""}
              onChange={(e) => setStr("winnerCallsign", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="w-name">Winner Name</Label>
            <Input
              id="w-name"
              value={form.winnerName ?? ""}
              onChange={(e) => setStr("winnerName", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="w-email">Winner Email</Label>
            <Input
              id="w-email"
              type="email"
              value={form.winnerEmail ?? ""}
              onChange={(e) => setStr("winnerEmail", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="w-drawing">Drawing Type</Label>
            <Input
              id="w-drawing"
              value={form.drawing ?? ""}
              onChange={(e) => setStr("drawing", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="w-notified">Notified At</Label>
            <Input
              id="w-notified"
              value={form.notifiedAt ?? ""}
              onChange={(e) => setStr("notifiedAt", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="w-claimed">Claimed At</Label>
            <Input
              id="w-claimed"
              value={form.claimedAt ?? ""}
              onChange={(e) => setStr("claimedAt", e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!form.winningTicket.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Delete confirmation dialog
// ---------------------------------------------------------------------------

interface DeleteDialogProps {
  open: boolean;
  label: string;
  onConfirm: () => void;
  onClose: () => void;
}

function DeleteDialog({ open, label, onConfirm, onClose }: DeleteDialogProps) {
  const handleDelete = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete &ldquo;{label}&rdquo;?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          This action cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main admin view
// ---------------------------------------------------------------------------

export interface PrizesAdminViewProps {
  initialPrizes: Prize[];
  initialWinners: PrizeWinner[];
}

export function PrizesAdminView({
  initialPrizes,
  initialWinners,
}: PrizesAdminViewProps) {
  // ----- prizes state -----
  const [prizes, setPrizes] = useState<Prize[]>(initialPrizes);
  const [prizeForm, setPrizeForm] = useState<{
    open: boolean;
    item: Prize | null;
  }>({ open: false, item: null });
  const [prizeDelete, setPrizeDelete] = useState<Prize | null>(null);

  const savePrize = (prize: Prize) => {
    setPrizes((prev) => {
      const idx = prev.findIndex((p) => p.id === prize.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = prize;
        return next;
      }
      return [...prev, prize];
    });
  };

  const deletePrize = (id: string) =>
    setPrizes((prev) => prev.filter((p) => p.id !== id));

  // ----- winners state -----
  const [winners, setWinners] = useState<PrizeWinner[]>(initialWinners);
  const [winnerForm, setWinnerForm] = useState<{
    open: boolean;
    item: PrizeWinner | null;
  }>({ open: false, item: null });
  const [winnerDelete, setWinnerDelete] = useState<PrizeWinner | null>(null);

  const saveWinner = (winner: PrizeWinner) => {
    setWinners((prev) => {
      const idx = prev.findIndex((w) => w.id === winner.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = winner;
        return next;
      }
      return [...prev, winner];
    });
  };

  const deleteWinner = (id: string) =>
    setWinners((prev) => prev.filter((w) => w.id !== id));

  // ----- render -----
  return (
    <div className="space-y-10">
      {/* ---- Prizes section ---- */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Prizes
          </h2>
          <Button
            size="sm"
            onClick={() => setPrizeForm({ open: true, item: null })}
          >
            <PlusCircle className="h-4 w-4" />
            Add Prize
          </Button>
        </div>

        <div className="space-y-3">
          {prizes.map((prize) => (
            <Card key={prize.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{prize.name}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={`Edit ${prize.name}`}
                      onClick={() => setPrizeForm({ open: true, item: prize })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      aria-label={`Delete ${prize.name}`}
                      onClick={() => setPrizeDelete(prize)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>
                  <strong>Category:</strong> {prize.category}
                </p>
                <p>
                  <strong>Donor:</strong> {prize.donor}
                </p>
                {prize.description && <p>{prize.description}</p>}
                {prize.winner && (
                  <p>
                    <strong>Winner ID:</strong> {prize.winner}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
          {prizes.length === 0 && (
            <p className="text-gray-500 text-sm">No prizes yet.</p>
          )}
        </div>
      </section>

      {/* ---- Prize Winners section ---- */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Prize Winners
          </h2>
          <Button
            size="sm"
            onClick={() => setWinnerForm({ open: true, item: null })}
          >
            <PlusCircle className="h-4 w-4" />
            Add Winner
          </Button>
        </div>

        <div className="space-y-3">
          {winners.map((winner) => (
            <Card key={winner.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>
                    Ticket {winner.winningTicket}
                    {winner.winnerCallsign && ` — ${winner.winnerCallsign}`}
                    {winner.winnerName && ` (${winner.winnerName})`}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={`Edit winner ${winner.id}`}
                      onClick={() =>
                        setWinnerForm({ open: true, item: winner })
                      }
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      aria-label={`Delete winner ${winner.id}`}
                      onClick={() => setWinnerDelete(winner)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>
                  <strong>Prize IDs:</strong> {winner.prizeId.join(", ") || "—"}
                </p>
                {winner.drawing && (
                  <p>
                    <strong>Drawing:</strong> {winner.drawing}
                  </p>
                )}
                {winner.notifiedAt && (
                  <p>
                    <strong>Notified:</strong> {winner.notifiedAt}
                  </p>
                )}
                {winner.claimedAt && (
                  <p>
                    <strong>Claimed:</strong> {winner.claimedAt}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
          {winners.length === 0 && (
            <p className="text-gray-500 text-sm">No winners yet.</p>
          )}
        </div>
      </section>

      {/* ---- Dialogs ---- */}
      <PrizeForm
        open={prizeForm.open}
        initial={prizeForm.item}
        onSave={savePrize}
        onClose={() => setPrizeForm({ open: false, item: null })}
      />

      <WinnerForm
        open={winnerForm.open}
        initial={winnerForm.item}
        onSave={saveWinner}
        onClose={() => setWinnerForm({ open: false, item: null })}
      />

      <DeleteDialog
        open={prizeDelete !== null}
        label={prizeDelete?.name ?? ""}
        onConfirm={() => prizeDelete && deletePrize(prizeDelete.id)}
        onClose={() => setPrizeDelete(null)}
      />

      <DeleteDialog
        open={winnerDelete !== null}
        label={`Ticket ${winnerDelete?.winningTicket ?? ""}`}
        onConfirm={() => winnerDelete && deleteWinner(winnerDelete.id)}
        onClose={() => setWinnerDelete(null)}
      />
    </div>
  );
}
