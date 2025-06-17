"use client"

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

interface WithRoleAuthProps {
  children: ReactNode;
  requiredRole: string;
}

export function WithRoleAuth({ children, requiredRole }: WithRoleAuthProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return; // Wait until authentication status is determined
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (user?.role !== requiredRole) {
      router.replace("/dashboard"); // Or an unauthorized page
    }
  }, [user, isAuthenticated, loading, router, requiredRole]);

  if (loading || !isAuthenticated || user?.role !== requiredRole) {
    // Render a loading state or null while checking auth and redirecting
    return <div>Verificando acceso...</div>; // Or a loading spinner
  }

  return <>{children}</>;
}
