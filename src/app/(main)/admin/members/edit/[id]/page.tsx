import EditMember from "@/components/admin/members/edit";

interface EditMemberPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditMemberPage({ params }: EditMemberPageProps) {
  const { id } = await params;
  return <EditMember memberId={id} />;
}
