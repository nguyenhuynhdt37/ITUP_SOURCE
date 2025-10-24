import EditNews from "@/components/admin/news/edit";

interface EditNewsPageProps {
  params: {
    id: string;
  };
}

const EditNewsPage = ({ params }: EditNewsPageProps) => {
  return <EditNews newsId={params.id} />;
};

export default EditNewsPage;
