import { WithRoleAuth } from "@/components/auth/with-role-auth";

export default function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WithRoleAuth requiredRole="Personal del Centro de Vacunación">{children}</WithRoleAuth>;
}
