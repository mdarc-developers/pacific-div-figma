import { useState, useRef, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { ImageIcon, RefreshCw, Trash2, Upload } from "lucide-react";
import { getGoogleAccessToken, deleteDriveFile } from "@/lib/googleDrive";

const DRIVE_FOLDER_PRIZES_ID = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_PRIZES_ID as string | undefined;

/** Remove path separators and non-printable chars to prevent path traversal. */
function sanitizeFilename(name: string): string {
  return name.replace(/[/\\]/g, "_").replace(/[^\w.-]/g, "_");
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UploadedImage {
  name: string;
  url: string;
  path: string; // Drive file ID
  previewUrl?: string; // blob URL for in-browser preview
}

export interface PrizesImageViewProps {
  /** Called when the user clicks an image thumbnail (picker mode). */
  onSelect?: (url: string) => void;
  /** Highlights the currently-selected image URL. */
  selectedUrl?: string;
}

// ---------------------------------------------------------------------------
// Drive helpers
// ---------------------------------------------------------------------------

interface DriveImageFile {
  id: string;
  name: string;
}

async function listDrivePrizeImages(accessToken: string): Promise<DriveImageFile[]> {
  if (!DRIVE_FOLDER_PRIZES_ID) throw new Error("VITE_GOOGLE_DRIVE_FOLDER_PRIZES_ID is not set");
  const q = encodeURIComponent(`'${DRIVE_FOLDER_PRIZES_ID}' in parents and trashed = false`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) throw new Error(`Drive list failed: ${res.statusText}`);
  const data = await res.json() as { files?: DriveImageFile[] };
  return Array.isArray(data.files) ? data.files : [];
}

async function uploadDrivePrizeImage(
  accessToken: string,
  filename: string,
  file: File,
): Promise<string> {
  if (!DRIVE_FOLDER_PRIZES_ID) throw new Error("VITE_GOOGLE_DRIVE_FOLDER_PRIZES_ID is not set");
  const metadata = { name: filename, parents: [DRIVE_FOLDER_PRIZES_ID] };
  const form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" }),
  );
  form.append("file", file);
  const uploadRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    { method: "POST", headers: { Authorization: `Bearer ${accessToken}` }, body: form },
  );
  if (!uploadRes.ok) throw new Error(`Drive upload failed: ${uploadRes.statusText}`);
  const data = await uploadRes.json() as { id: string };

  // Make the file publicly readable so it can be used in <img> tags
  const permRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${data.id}/permissions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    },
  );
  if (!permRes.ok) throw new Error(`Drive set permissions failed: ${permRes.statusText}`);

  return data.id;
}

function driveImageUrl(fileId: string): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
}

async function fetchDriveImageBlobUrl(accessToken: string, fileId: string): Promise<string> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) throw new Error(`Failed to fetch image preview for ${fileId}: ${res.statusText}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PrizesImageView({
  onSelect,
  selectedUrl,
}: PrizesImageViewProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach(URL.revokeObjectURL);
    };
  }, []);

  const loadImages = async () => {
    setLoading(true);
    setError(null);
    // Revoke any previously created blob URLs before loading fresh ones
    blobUrlsRef.current.forEach(URL.revokeObjectURL);
    blobUrlsRef.current = [];
    try {
      const accessToken = await getGoogleAccessToken();
      const files = await listDrivePrizeImages(accessToken);
      const imageList = await Promise.all(
        files.map(async (f) => {
          const previewUrl = await fetchDriveImageBlobUrl(accessToken, f.id);
          blobUrlsRef.current.push(previewUrl);
          return {
            name: f.name,
            url: driveImageUrl(f.id),
            path: f.id,
            previewUrl,
          };
        }),
      );
      setImages(imageList);
      setLoaded(true);
    } catch (err) {
      console.error("PrizesImageView: failed to list images", err);
      setError("Failed to load images from Drive.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    const safeName = sanitizeFilename(file.name);
    try {
      const accessToken = await getGoogleAccessToken();
      await uploadDrivePrizeImage(accessToken, safeName, file);
      await loadImages();
    } catch (err) {
      console.error("PrizesImageView: upload failed", err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Upload failed: ${msg}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (img: UploadedImage) => {
    try {
      const accessToken = await getGoogleAccessToken();
      await deleteDriveFile(accessToken, img.path);
      setImages((prev) => prev.filter((i) => i.path !== img.path));
    } catch (err) {
      console.error(`PrizesImageView: failed to delete ${img.name}`, err);
      setError(`Failed to delete "${img.name}".`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload controls */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || loading}
        >
          <Upload className="h-4 w-4 mr-1" />
          {uploading ? "Uploading…" : "Upload Image"}
        </Button>
        {!loaded ? (
          <Button
            variant="outline"
            size="sm"
            onClick={loadImages}
            disabled={loading || uploading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Loading…" : "Load Images"}
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={loadImages}
            disabled={loading || uploading}
            aria-label="Refresh image list"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Image grid */}
      {!loaded ? (
        <p className="text-sm text-gray-500">Click &ldquo;Load Images&rdquo; to browse uploaded prize images.</p>
      ) : images.length === 0 ? (
        <p className="text-sm text-gray-500">No images uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img) => (
            <div
              key={img.path}
              className={`relative border-2 rounded-md overflow-hidden group ${
                selectedUrl === img.url
                  ? "border-blue-500"
                  : "border-transparent hover:border-gray-300"
              } ${onSelect ? "cursor-pointer" : ""}`}
              onClick={() => onSelect?.(img.url)}
            >
              <img
                src={img.previewUrl ?? img.url}
                alt={img.name}
                className="w-full h-24 object-cover"
              />

              {/* Overlay with action buttons */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {onSelect && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-7 w-7"
                    aria-label={`Select ${img.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(img.url);
                    }}
                  >
                    <ImageIcon className="h-3 w-3" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-7 w-7"
                  aria-label={`Delete ${img.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(img);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              <p className="text-xs truncate px-1 py-0.5 bg-white/80 dark:bg-gray-800/80">
                {img.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
