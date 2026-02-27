import { useState, useRef, useEffect } from "react";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
  deleteObject,
} from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Button } from "@/app/components/ui/button";
import { ImageIcon, Trash2, Upload } from "lucide-react";

const STORAGE_PATH = "assets/prizes";

/** Remove path separators and non-printable chars to prevent path traversal. */
function sanitizeFilename(name: string): string {
  return name.replace(/[/\\]/g, "_").replace(/[^\w.\-]/g, "_");
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UploadedImage {
  name: string;
  url: string;
  path: string;
}

export interface PrizesImageViewProps {
  /** Called when the user clicks an image thumbnail (picker mode). */
  onSelect?: (url: string) => void;
  /** Highlights the currently-selected image URL. */
  selectedUrl?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PrizesImageView({
  onSelect,
  selectedUrl,
}: PrizesImageViewProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImages = async () => {
    try {
      const listRef = ref(storage, STORAGE_PATH);
      const result = await listAll(listRef);
      const items = await Promise.all(
        result.items.map(async (item) => ({
          name: item.name,
          url: await getDownloadURL(item),
          path: item.fullPath,
        })),
      );
      setImages(items);
    } catch (err) {
      console.error("PrizesImageView: failed to list images", err);
      setError("Failed to load images from storage.");
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    const safeName = sanitizeFilename(file.name);
    const storageRef = ref(storage, `${STORAGE_PATH}/${safeName}`);
    const task = uploadBytesResumable(storageRef, file);

    task.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        );
        setUploadProgress(progress);
      },
      (err) => {
        console.error("PrizesImageView: upload failed", err);
        setError(`Upload failed: ${err.message}`);
        setUploading(false);
      },
      async () => {
        setUploading(false);
        await loadImages();
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
    );
  };

  const handleDelete = async (img: UploadedImage) => {
    try {
      await deleteObject(ref(storage, img.path));
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
          disabled={uploading}
        >
          <Upload className="h-4 w-4 mr-1" />
          {uploading ? `Uploading… ${uploadProgress}%` : "Upload Image"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        {uploading && (
          <span className="text-sm text-gray-500">{uploadProgress}%</span>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Image grid */}
      {images.length === 0 ? (
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
                src={img.url}
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
