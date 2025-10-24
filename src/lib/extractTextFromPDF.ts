export async function extractTextFromPDF(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/pdf-extract", { method: "POST", body: form });
  const data = await res.json();

  if (data.error) throw new Error(data.error);
  return data.text || data.note || "";
}
