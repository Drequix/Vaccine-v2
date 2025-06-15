import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Shield, FileText, CheckCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function HeroSection() {
  return (
    <section className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge className="border-blue-400 text-blue-300 bg-blue-900/50">
                <Users className="w-4 h-4 mr-2" />
                Para toda la familia
              </Badge>
              <Badge className="border-green-400 text-green-300 bg-green-900/50">
                <Shield className="w-4 h-4 mr-2" />
                Seguro y confiable
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Tu portal de vacunación, <span className="text-green-400">moderno y eficiente</span>
            </h1>
            <p className="mt-4 text-lg text-gray-300 max-w-2xl">
              Agenda tus citas, consulta tu historial y accede a tu certificado digital de forma rápida y segura.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                Agendar mi cita
              </Button>
              <Button size="lg" variant="outline" className="border-gray-400 text-white hover:bg-gray-800 hover:text-white">
                Ver centros de vacunación
              </Button>
            </div>
            <div className="flex items-center space-x-8 text-sm pt-4">
              <div className="text-center">
                <p className="font-bold text-lg">+500 mil</p>
                <p className="text-sm text-gray-400">Dosis aplicadas</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">+1.2 millones</p>
                <p className="text-sm text-gray-400">Usuarios registrados</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">98%</p>
                <p className="text-sm text-gray-400">Satisfacción</p>
              </div>
            </div>
          </div>

          {/* Image Content */}
          <div className="relative">
            <Image
              src="/images/mujer-vacunada-feliz.jpg"
              alt="Mujer sonriendo feliz después de ser vacunada"
              width={600}
              height={500}
              className="rounded-2xl shadow-2xl"
            />
            <div className="absolute bottom-6 right-6 bg-green-900/50 backdrop-blur-md p-4 rounded-xl border border-green-400/30">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-7 h-7 text-green-400" />
                <div>
                  <p className="text-sm font-bold text-white">Certificado Digital</p>
                  <p className="text-sm text-green-300">Descargado con éxito</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
