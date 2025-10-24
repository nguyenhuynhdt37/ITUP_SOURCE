/**
 * Generate URL-friendly slug from title
 * @param title - The title to convert to slug
 * @returns URL-friendly slug
 */
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters except word chars, spaces, and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading and trailing hyphens
};

/**
 * Validate if a slug is valid
 * @param slug - The slug to validate
 * @returns boolean indicating if slug is valid
 */
export const isValidSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length > 0;
};

/**
 * Check if a slug is unique in the database
 * @param slug - The slug to check
 * @param table - The table name to check against
 * @param excludeId - ID to exclude from check (for updates)
 * @returns Promise<boolean> indicating if slug is unique
 */
export const isSlugUnique = async (
  slug: string,
  table: string = "news",
  excludeId?: string
): Promise<boolean> => {
  try {
    const { createClientComponentClient } = await import(
      "@supabase/auth-helpers-nextjs"
    );
    const supabase = createClientComponentClient();

    let query = supabase.from(table).select("id").eq("slug", slug);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query;

    if (error) {
      console.log("Error checking slug uniqueness:", error);
      return false;
    }

    return data.length === 0;
  } catch (error) {
    console.log("Error checking slug uniqueness:", error);
    return false;
  }
};
