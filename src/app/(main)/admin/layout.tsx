import { Header } from "@/components/admin/shared/header";
import { Sidebar } from "@/components/admin/shared/sidebar";
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a4d] to-[#2d2d6d]">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
