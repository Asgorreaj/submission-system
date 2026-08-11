import DashboardLayout from "@/components/DashboardLayout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout allowedRoles={["Admin"]}>{children}</DashboardLayout>;
}