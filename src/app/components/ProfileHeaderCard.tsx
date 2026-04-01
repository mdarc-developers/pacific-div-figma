import { AlertCircle, Camera, CheckCircle, LogOut } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import type { User } from "firebase/auth";
import { useRef, useState } from "react";

interface ProfileHeaderCardProps {
  user: User;
  initials: string;
  onLogout: () => void;
}

export function ProfileHeaderCard({
  user,
  initials,
  onLogout,
}: ProfileHeaderCardProps) {
  const isGoogleUser = user.providerData.some(
    (p) => p.providerId === "google.com",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localPhotoURL, setLocalPhotoURL] = useState<string | null>(null);

  const displayPhotoURL = localPhotoURL ?? user.photoURL;

  const handleAvatarClick = () => {
    if (isGoogleUser) {
      window.open(
        "https://myaccount.google.com/",
        "_blank",
        "noopener,noreferrer",
      );
    } else {
      fileInputRef.current?.click();
    }
  };

  const MAX_FILE_SIZE_MB = 5;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setUploadError(`Image must be smaller than ${MAX_FILE_SIZE_MB} MB.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const storageRef = ref(storage, `profile-images/${user.uid}/profile`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await updateProfile(user, { photoURL: downloadURL });
      setLocalPhotoURL(downloadURL);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Failed to upload profile picture",
      );
    } finally {
      setUploading(false);
      // Clear the input so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const avatarTooltipText = isGoogleUser
    ? "Change your profile picture at myaccount.google.com"
    : "Click to upload a new profile picture";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="relative h-16 w-16 shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group"
                onClick={handleAvatarClick}
                disabled={uploading}
                aria-label={avatarTooltipText}
              >
                <Avatar className="h-16 w-16 text-2xl pointer-events-none">
                  {displayPhotoURL && (
                    <AvatarImage
                      src={displayPhotoURL}
                      alt="Profile picture"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <AvatarFallback className="text-xl font-semibold">
                    {uploading ? "…" : initials}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <Camera className="h-5 w-5 text-white" />
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent>{avatarTooltipText}</TooltipContent>
          </Tooltip>
          {!isGoogleUser && (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          )}
          <div className="flex-1 min-w-0">
            {user.displayName && (
              <p className="text-lg font-semibold truncate">
                {user.displayName}
              </p>
            )}
            <p className="text-sm text-muted-foreground truncate">
              {user.email}
            </p>
            <div className="mt-1.5">
              {user.emailVerified ? (
                <Badge
                  variant="outline"
                  className="gap-1 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700"
                >
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="gap-1 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700"
                >
                  <AlertCircle className="h-3 w-3" />
                  Not verified
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="logout-button border-2 border-solid shadow-md"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
        {uploadError && (
          <p className="mt-2 text-sm text-destructive">{uploadError}</p>
        )}
      </CardContent>
    </Card>
  );
}
