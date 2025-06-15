"use client"

import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

export function Header() {
  const { theme } = useTheme();

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src={theme === "light" ? "/images/logo-vacunas-rd.jpeg" : "/images/logo-vacunas-rd-dark.jpeg"}
              alt="VACUNAS RD - Logo oficial"
              width={48}
              height={48}
              className="rounded-lg"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">VACUNAS RD</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Ministerio de Salud Pública</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors"
            >
              Agendar cita
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors"
            >
              Centros
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors"
            >
              Mi Vacunación
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 font-medium flex items-center space-x-1 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Ayuda</span>
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <ModeToggle />
            <Link href="/login">
              <Button className="bg-green-600 hover:bg-green-700 text-white">Iniciar sesión / Registrarse</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
