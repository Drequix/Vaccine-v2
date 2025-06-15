"use client"

import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Shield, FileText } from "lucide-react"

export function Hero() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900 border border-green-200 dark:border-green-700">
                VACUNAS RD - República Dominicana
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                Tu Vacunación en un solo lugar
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Consulta tu historial, agenda tu cita y mantente protegido. Acceso fácil y seguro a toda tu
                información de vacunación.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 w-full">
                  Acceder al sistema
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 w-full"
                >
                  Ver centros cercanos
                </Button>
              </Link>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>+2M usuarios registrados</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>100% seguro y confiable</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <Image
              src="/images/mujer-vacunada-feliz.jpeg"
              alt="Mujer feliz mostrando vendaje después de vacunarse, haciendo gesto de pulgar hacia arriba"
              width={600}
              height={500}
              className="rounded-2xl shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Certificado Digital</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Descarga instantánea</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
