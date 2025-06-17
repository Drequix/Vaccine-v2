"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"

export default function AuthPage() {
  // States for both forms
  const [loginIdentifier, setLoginIdentifier] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("")
  const [registerFullName, setRegisterFullName] = useState("")
  const [registerIdNumber, setRegisterIdNumber] = useState("")

  // General states
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Hooks
  const { login, loading } = useAuth()
  const [registerLoading, setRegisterLoading] = useState(false)
  const router = useRouter()
    const { toast } = useToast()
  const { theme } = useTheme()

  // Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ LoginIdentifier: loginIdentifier, Password: loginPassword }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Failed to login')
      login(data.token, data.user)
      if (data.user.role === 'Administrador') {
      router.push('/auth/admin-redirect');
    } else {
      router.push('/dashboard');
    }
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Register Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (registerPassword !== registerConfirmPassword) {
        toast({ variant: "destructive", title: "Error", description: "Las contraseñas no coinciden." })
        return
    }
    setRegisterLoading(true)
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/api/tutors`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                Nombres: registerFullName.split(' ')[0] || '',
                Apellidos: registerFullName.split(' ').slice(1).join(' ') || '',
                TipoIdentificacion: "Cédula",
                NumeroIdentificacion: registerIdNumber,
                Email: registerEmail,
                Password: registerPassword,
                Username: registerEmail, // Using email as username by default
                Telefono: "000-000-0000", // Dummy data as it's not in the new form
                Direccion: "N/A", // Dummy data as it's not in the new form
            }),
        });
        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "Error al registrar usuario")
        }
        toast({ title: "Registro exitoso", description: "Su cuenta ha sido creada. Ahora puede iniciar sesión." })
        // Switch to login tab after successful registration
        const loginTrigger = document.querySelector('[data-radix-collection-item][value="login"]');
        if (loginTrigger instanceof HTMLElement) {
            loginTrigger.click();
        }
    } catch (error) {
        toast({ variant: "destructive", title: "Error de registro", description: error instanceof Error ? error.message : "Error desconocido" })
    } finally {
        setRegisterLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <Image
                src={theme === 'light' ? '/images/logo-vacunas-rd.jpeg' : '/images/logo-vacunas-rd-dark.jpeg'}
                alt="VACUNAS RD - Logo oficial"
                width={80}
                height={80}
                className="rounded-lg mb-4 mx-auto"
            />
            <h2 className="text-2xl font-bold">Accede a tu cuenta</h2>
            <p className="text-muted-foreground">Gestiona tu información de vacunación de forma segura</p>
        </div>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>

          {/* Login Form */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Iniciar Sesión</CardTitle>
                <CardDescription>Ingresa tus credenciales para acceder al sistema.</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-identifier">Correo o Cédula</Label>
                    <Input id="login-identifier" value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} placeholder="nombre@ejemplo.com o 000-0000000-0" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <div className="relative">
                        <Input id="login-password" type={showPassword ? "text" : "password"} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                </CardContent>
                <CardContent>
                  <Button type="submit" className="w-full" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Iniciar Sesión'}</Button>
                </CardContent>
              </form>
            </Card>
          </TabsContent>

          {/* Register Form */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Crear Cuenta</CardTitle>
                <CardDescription>Regístrate para acceder a todos los servicios.</CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                   <div className="space-y-2">
                        <Label htmlFor="register-fullname">Nombres y Apellidos</Label>
                        <Input id="register-fullname" value={registerFullName} onChange={(e) => setRegisterFullName(e.target.value)} placeholder="Juan Pérez" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="register-id">Cédula de Identidad</Label>
                        <Input id="register-id" value={registerIdNumber} onChange={(e) => setRegisterIdNumber(e.target.value)} placeholder="000-0000000-0" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="register-email">Correo Electrónico</Label>
                        <Input id="register-email" type="email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} placeholder="nombre@ejemplo.com" required />
                    </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña</Label>
                     <div className="relative">
                        <Input id="register-password" type={showPassword ? "text" : "password"} value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirmar Contraseña</Label>
                     <div className="relative">
                        <Input id="register-confirm-password" type={showConfirmPassword ? "text" : "password"} value={registerConfirmPassword} onChange={(e) => setRegisterConfirmPassword(e.target.value)} required />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-2.5 text-gray-400">{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                  </div>
                </CardContent>
                <CardContent>
                  <Button type="submit" className="w-full" disabled={registerLoading}>{registerLoading ? <Loader2 className="animate-spin" /> : 'Registrarse'}</Button>
                </CardContent>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
