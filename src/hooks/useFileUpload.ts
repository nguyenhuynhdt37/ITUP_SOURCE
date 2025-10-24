"use client";

import { deleteFile, uploadFile, uploadMultipleFiles } from "@/lib/uploadFile";
import { useState } from "react";

interface UseFileUploadOptions {
  folder: string;
  bucket?: string;
  multiple?: boolean;
}

export const useFileUpload = ({
  folder,
  bucket = "clb-assets",
  multiple = false,
}: UseFileUploadOptions) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (files: File | File[]): Promise<string | string[]> => {
    setUploading(true);
    setError(null);

    try {
      if (multiple && Array.isArray(files)) {
        const urls = await uploadMultipleFiles(files, folder, bucket);
        return urls;
      } else if (!multiple && !Array.isArray(files)) {
        const url = await uploadFile(files, folder, bucket);
        return url;
      } else {
        throw new Error("Invalid file type for upload mode");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const remove = async (url: string): Promise<boolean> => {
    try {
      return await deleteFile(url, bucket);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Delete failed";
      setError(errorMessage);
      return false;
    }
  };

  return {
    upload,
    remove,
    uploading,
    error,
  };
};
