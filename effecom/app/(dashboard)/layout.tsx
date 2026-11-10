import { ProtectedDashboard } from "@/components/dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedDashboard>{children}</ProtectedDashboard>;
}
