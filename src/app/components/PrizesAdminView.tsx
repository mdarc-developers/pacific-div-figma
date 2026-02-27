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
import {
  Award,
  HandHelping,
  Image,
  ImageIcon,
  Info,
  Pencil,
  PlusCircle,
  Trash2,
  Trophy,
  Upload,
  UserCheck,
} from "lucide-react";
import { PrizesImageView } from "@/app/components/PrizesImageView";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}

// ---------------------------------------------------------------------------
// Google Drive upload helpers
// ---------------------------------------------------------------------------

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const DRIVE_FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID as string | undefined;

// Cache the token for the browser session; Google access tokens expire in 1 h.
let cachedAccessToken: string | null = null;
let tokenExpiresAt = 0;

function getDateTimeStamp(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hours = String(now.getUTCHours()).padStart(2, "0");
  const minutes = String(now.getUTCMinutes()).padStart(2, "0");
  const seconds = String(now.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/** Return a cached Drive-scoped access token, re-authenticating only when expired. */
async function getGoogleAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < tokenExpiresAt) {
    return cachedAccessToken;
  }
  const provider = new GoogleAuthProvider();
  provider.addScope(DRIVE_SCOPE);
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken) throw new Error("No Google access token returned");
  cachedAccessToken = credential.accessToken;
  tokenExpiresAt = Date.now() + 55 * 60 * 1000; // refresh 5 min before 1-h expiry
  return cachedAccessToken;
}

interface DriveFile {
  id: string;
  name: string;
}

async function listDriveFiles(
  accessToken: string,
  conferenceId: string,
): Promise<DriveFile[]> {
  if (!DRIVE_FOLDER_ID) throw new Error("VITE_GOOGLE_DRIVE_FOLDER_ID is not set");
  // Sanitize: conference IDs should only contain word chars and hyphens.
  const safeId = conferenceId.replace(/[^a-zA-Z0-9\-_]/g, "");
  const q = encodeURIComponent(
    `'${DRIVE_FOLDER_ID}' in parents and (name contains '${safeId}-prize-' or name contains '${safeId}-prizewinner-') and trashed = false`,
  );
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) throw new Error(`Drive list failed: ${res.statusText}`);
  const data = await res.json() as { files?: DriveFile[] };
  return Array.isArray(data.files) ? data.files : [];
}

async function deleteDriveFile(accessToken: string, fileId: string): Promise<void> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok && res.status !== 404) throw new Error(`Drive delete failed: ${res.statusText}`);
}

async function uploadDriveFile(
  accessToken: string,
  filename: string,
  content: string,
): Promise<void> {
  if (!DRIVE_FOLDER_ID) throw new Error("VITE_GOOGLE_DRIVE_FOLDER_ID is not set");
  const metadata = { name: filename, parents: [DRIVE_FOLDER_ID] };
  const form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" }),
  );
  form.append("file", new Blob([content], { type: "text/plain" }));
  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    { method: "POST", headers: { Authorization: `Bearer ${accessToken}` }, body: form },
  );
  if (!res.ok) throw new Error(`Drive upload failed: ${res.statusText}`);
}

/**
 * Delete all previous prize/prizewinner files for this conference in the
 * designated Drive folder, then upload the new timestamped pair.
 */
async function saveToDrive(
  conferenceId: string,
  prizes: Prize[],
  winners: PrizeWinner[],
): Promise<void> {
  const accessToken = await getGoogleAccessToken();

  const existing = await listDriveFiles(accessToken, conferenceId);
  await Promise.all(existing.map((f) => deleteDriveFile(accessToken, f.id)));

  const stamp = getDateTimeStamp();
  const prizeContent = `import { Prize } from "@/types/conference";\n\nexport const samplePrizes: Prize[] = ${JSON.stringify(prizes, null, 2)};\n`;
  const winnerContent = `import { PrizeWinner } from "@/types/conference";\n\nexport const samplePrizeWinners: PrizeWinner[] = ${JSON.stringify(winners, null, 2)};\n`;

  await Promise.all([
    uploadDriveFile(accessToken, `data_${conferenceId}-prize-${stamp}.ts`, prizeContent),
    uploadDriveFile(accessToken, `data_${conferenceId}-prizewinner-${stamp}.ts`, winnerContent),
  ]);
}

// ---------------------------------------------------------------------------
// Prize form (create / edit)
// ---------------------------------------------------------------------------

const EMPTY_PRIZE: Omit<Prize, "id"> = {
  name: "",
  description: "",
  imageUrl: "/assets/prizes/",
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
  const [imagePickerOpen, setImagePickerOpen] = useState(false);

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
    <>
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
              <Label htmlFor="p-desc"><Info className="h-4 w-4" /> Description</Label>
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
              <Label htmlFor="p-donor"><HandHelping className="h-4 w-4" /> Donor</Label>
              <Input
                id="p-donor"
                value={form.donor}
                onChange={(e) => set("donor", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="p-image"><Image className="h-4 w-4" />Image</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="p-image"
                  value={form.imageUrl}
                  onChange={(e) => set("imageUrl", e.target.value)}
                    placeholder="https://… or select from library"
                    className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Browse image library"
                  onClick={() => setImagePickerOpen(true)}
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="Prize preview"
                  className="mt-2 h-20 w-auto rounded border object-contain"
                />
              )}
            </div>
            <div>
              <Label htmlFor="p-winner"><Award className="h-4 w-4" />Winner ID (optional)</Label>
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

      {/* Image picker dialog */}
      <Dialog open={imagePickerOpen} onOpenChange={setImagePickerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Image</DialogTitle>
          </DialogHeader>
          <PrizesImageView
            selectedUrl={form.imageUrl}
            onSelect={(url) => {
              set("imageUrl", url);
              setImagePickerOpen(false);
            }}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setImagePickerOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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
            <Award className="h-4 w-4" />
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
  conferenceId: string;
  initialPrizes: Prize[];
  initialWinners: PrizeWinner[];
}

export function PrizesAdminView({
  conferenceId,
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

  // ----- upload state -----
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleSaveToStorage = async () => {
    setUploading(true);
    setUploadError(null);
    try {
      await saveToDrive(conferenceId, prizes, winners);
    } catch (err) {
      console.error("PrizesAdminView: upload failed", err);
      const msg = err instanceof Error ? err.message : String(err);
      setUploadError(`Upload failed: ${msg}`);
    } finally {
      setUploading(false);
    }
  };

  // ----- render -----
  return (
    <div className="space-y-10">
      {/* ---- Save to Storage ---- */}
      <div className="flex flex-col items-end gap-1">
        <Button
          variant="outline"
          onClick={handleSaveToStorage}
          disabled={uploading}
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading…" : "Save to drive"}
        </Button>
        {uploadError && (
          <p className="text-sm text-red-500">{uploadError}</p>
        )}
      </div>

      {/* ---- Prizes section ---- */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
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
                  <Trophy className="h-5 w-5 mb-4" />
                  <span>{prize.name}
                    <img
                      className=""
                      alt="prize image"
                      src={prize.imageUrl}
                      width="200px"
                      height="200px"
                    /> </span>
                  <div className="gap-2">
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
                {prize.description &&
                  <p className="flex justify-center justify-between"><Info className="h-5 w-5" />{prize.description}</p>
                }
                <p className="flex">
                  <HandHelping className="h-4 w-4" />
                  <strong>Donor:</strong> {prize.donor}
                </p>
                {prize.winner && (
                  <p className="flex">
                    <Award className="h-4 w-4" />
                    <strong>Winner:</strong> {prize.winner}
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
                  <Award className="h-4 w-4" />
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
