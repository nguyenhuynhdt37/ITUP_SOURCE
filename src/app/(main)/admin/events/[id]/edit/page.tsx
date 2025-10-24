import { EditEvent } from "@/components/admin/events/edit";

interface EditEventPageProps {
  params: {
    id: string;
  };
}

const EditEventPage = ({ params }: EditEventPageProps) => {
  return <EditEvent eventId={params.id} />;
};

export default EditEventPage;
