import DocumentDetail from "@/components/(home)/documents/[id]";

interface DocumentPageProps {
  params: {
    id: string;
  };
}

export default function DocumentPage({ params }: DocumentPageProps) {
  // DocumentDetail reads the id from useParams internally; no props needed
  return <DocumentDetail />;
}
