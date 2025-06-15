"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, FileText, Phone, ExternalLink } from "lucide-react"

export function NewsAndInfo() {
  return (
    <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Últimas noticias y campañas</h2>

            <div className="space-y-6">
              <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 mb-2 border border-red-200 dark:border-red-700">
                        Importante
                      </Badge>
                      <CardTitle className="text-lg text-gray-900 dark:text-white">
                        Nueva campaña de vacunación contra la influenza 2024
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">Hace 2 días</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Inicia la campaña nacional de vacunación contra la influenza. Grupos prioritarios pueden agendar
                    desde hoy.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Leer más <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 dark:text-white">
                    Actualización del esquema de vacunación infantil
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">Hace 1 semana</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Nuevas recomendaciones para el calendario de vacunación en menores de 5 años.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Leer más <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Información importante</h3>

            <div className="space-y-4">
              <Card className="bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1" />
                    <div>
                      <p className="font-semibold text-blue-800 dark:text-blue-200">Vacunación segura</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Todas las vacunas son seguras y efectivas
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-green-600 dark:text-green-400 mt-1" />
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-200">Documentos necesarios</p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Solo necesitas tu cédula de identidad
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 dark:bg-orange-900 border-orange-200 dark:border-orange-700">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-1" />
                    <div>
                      <p className="font-semibold text-orange-800 dark:text-orange-200">¿Necesitas ayuda?</p>
                      <p className="text-sm text-orange-700 dark:text-orange-300">Línea gratuita: 800-VACUNA</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
