"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  
  const { login, user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      if (user.role?.trim().toLowerCase() === "administrador") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, router]);

    const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ LoginIdentifier: email, Password: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
      }

      login(data.token, data.user);

    } catch (err: any) {
      setError(err.message);
    }
  };

  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tu correo electrónico o tu número de identificación para acceder a tu cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Correo o Identificación</Label>
              <Input
                id="email"
                type="text"
                placeholder="nombre@ejemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/register" className="text-sm text-blue-600 hover:underline">
              ¿No tienes cuenta? Regístrate
            </Link>
            <Button disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Iniciar Sesión
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
