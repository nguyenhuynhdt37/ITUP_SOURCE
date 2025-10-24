import { EditDocument } from "@/components/admin/documents/edit";

interface EditDocumentPageProps {
  params: {
    id: string;
  };
}

export default function EditDocumentPageRoute({
  params,
}: EditDocumentPageProps) {
  return <EditDocument documentId={params.id} />;
}
