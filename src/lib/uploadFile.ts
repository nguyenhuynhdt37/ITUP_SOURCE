/**
 * Upload file to Supabase Storage
 * @param file - File to upload
 * @param folder - Folder path (e.g., "baiviet/content", "users/avatars")
 * @param bucket - Supabase bucket name (default: "clb-assets")
 * @returns Promise<string> - Public URL of uploaded file
 */
export const uploadFile = async (
  file: File,
  folder: string,
  bucket: string = "clb-assets"
): Promise<string> => {
  try {
    // Import Supabase client
    const { createClientComponentClient } = await import(
      "@supabase/auth-helpers-nextjs"
    );
    const supabase = createClientComponentClient();

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const uploadPath = `${folder}/${fileName}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uploadPath, file);

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.log("Error uploading file:", error);
    throw error;
  }
};

/**
 * Upload multiple files to Supabase Storage
 * @param files - Array of files to upload
 * @param folder - Folder path
 * @param bucket - Supabase bucket name (default: "clb-assets")
 * @returns Promise<string[]> - Array of public URLs
 */
export const uploadMultipleFiles = async (
  files: File[],
  folder: string,
  bucket: string = "clb-assets"
): Promise<string[]> => {
  try {
    const uploadPromises = files.map((file) =>
      uploadFile(file, folder, bucket)
    );
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.log("Error uploading multiple files:", error);
    throw error;
  }
};

/**
 * Delete file from Supabase Storage
 * @param url - Public URL of file to delete
 * @param bucket - Supabase bucket name (default: "clb-assets")
 * @returns Promise<boolean> - Success status
 */
export const deleteFile = async (
  url: string,
  bucket: string = "clb-assets"
): Promise<boolean> => {
  try {
    const { createClientComponentClient } = await import(
      "@supabase/auth-helpers-nextjs"
    );
    const supabase = createClientComponentClient();

    // Extract file path from URL
    const urlParts = url.split("/");
    const filePath = urlParts.slice(-2).join("/"); // Get last 2 parts (folder/filename)

    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.log("Error deleting file:", error);
    return false;
  }
};

/**
 * Get file info from URL
 * @param url - Public URL of file
 * @returns Object with file information
 */
export const getFileInfo = (url: string) => {
  const urlParts = url.split("/");
  const fileName = urlParts[urlParts.length - 1];
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

  return {
    fileName,
    extension,
    url,
    isImage: ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension),
    isVideo: ["mp4", "avi", "mov", "wmv", "flv", "webm"].includes(extension),
    isAudio: ["mp3", "wav", "flac", "aac", "ogg"].includes(extension),
    isDocument: [
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
      "txt",
    ].includes(extension),
    isArchive: ["zip", "rar", "7z", "tar", "gz"].includes(extension),
    isCode: [
      "js",
      "ts",
      "jsx",
      "tsx",
      "html",
      "css",
      "scss",
      "json",
      "xml",
    ].includes(extension),
  };
};
