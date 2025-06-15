import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, FileText, Bell } from "lucide-react"

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Todo lo que necesitas para tu vacunación</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Servicios diseñados para hacer tu experiencia más fácil y segura
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center hover:shadow-lg transition-shadow bg-gray-900 border-gray-700">
            <CardHeader>
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-blue-400" />
              </div>
              <CardTitle className="text-xl text-white">Agenda en línea</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-gray-400">
                Programa tu cita de vacunación de forma rápida y sencilla, 24/7
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow bg-gray-900 border-gray-700">
            <CardHeader>
              <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-green-400" />
              </div>
              <CardTitle className="text-xl text-white">Ubica tu centro</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-gray-400">
                Encuentra el centro de vacunación más cercano a tu ubicación
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow bg-gray-900 border-gray-700">
            <CardHeader>
              <div className="w-16 h-16 bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-purple-400" />
              </div>
              <CardTitle className="text-xl text-white">Certificado digital</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-gray-400">
                Descarga tu certificado de vacunación oficial al instante
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow bg-gray-900 border-gray-700">
            <CardHeader>
              <div className="w-16 h-16 bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-orange-400" />
              </div>
              <CardTitle className="text-xl text-white">Recordatorios</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base text-gray-400">
                Recibe notificaciones automáticas para tus próximas dosis
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
