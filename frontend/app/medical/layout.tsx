import { WithRoleAuth } from "@/components/auth/with-role-auth";

export default function MedicalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WithRoleAuth requiredRole="Medico">{children}</WithRoleAuth>;
}
