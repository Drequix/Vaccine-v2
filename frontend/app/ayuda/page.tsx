"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, HelpCircle } from "lucide-react"

const faqData = [
    {
      id: "1",
      question: "¿Cómo puedo agendar una cita de vacunación?",
      answer:
        "Puedes agendar tu cita de tres formas: 1) A través de nuestra plataforma web ingresando a 'Agendar cita', 2) Llamando al 800-VACUNA (822-862), o 3) Visitando directamente cualquier centro de vacunación autorizado. Necesitarás tu cédula de identidad y seleccionar el centro más cercano a tu ubicación.",
    },
    {
      id: "2",
      question: "¿Qué documentos necesito para vacunarme?",
      answer:
        "Solo necesitas tu cédula de identidad dominicana vigente. En caso de menores de edad, se requiere la cédula del menor (si la tiene) o acta de nacimiento, acompañado de un adulto responsable con su cédula.",
    },
    {
      id: "3",
      question: "¿Cómo descargo mi certificado de vacunación?",
      answer:
        "Una vez vacunado, puedes descargar tu certificado digital ingresando a 'Mi Vacunación' con tu cédula. El certificado estará disponible 24 horas después de recibir la vacuna y tiene validez oficial para viajes y trámites.",
    },
    {
      id: "4",
      question: "¿Las vacunas son gratuitas?",
      answer:
        "Sí, todas las vacunas del esquema nacional de vacunación son completamente gratuitas para todos los ciudadanos dominicanos y residentes legales. No se cobra ningún tipo de tarifa por la vacuna ni por el certificado digital.",
    },
    {
      id: "5",
      question: "¿Puedo cambiar o cancelar mi cita?",
      answer:
        "Sí, puedes modificar o cancelar tu cita hasta 2 horas antes de la hora programada. Ingresa a 'Mi Vacunación' con tu cédula, busca tu cita activa y selecciona 'Modificar' o 'Cancelar'. También puedes llamar al 800-VACUNA.",
    },
    {
      id: "6",
      question: "¿Qué hago si perdí mi carnet de vacunación físico?",
      answer:
        "No te preocupes, tu historial de vacunación está guardado digitalmente en nuestro sistema. Puedes acceder a 'Mi Vacunación' para ver tu historial completo y descargar un nuevo certificado digital que tiene la misma validez que el carnet físico.",
    },
];

export default function AyudaPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFAQ = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <section id="help" className="py-12 md:py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Centro de Ayuda</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Encuentra respuestas a tus preguntas sobre vacunación y el uso de nuestra plataforma.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar en preguntas frecuentes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-green-500"
            />
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
                {filteredFAQ.map((item) => (
                    <AccordionItem key={item.id} value={item.id}>
                        <AccordionTrigger className="text-lg font-semibold text-left">{item.question}</AccordionTrigger>
                        <AccordionContent className="text-base text-gray-600 dark:text-gray-400">
                            {item.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            {filteredFAQ.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 mt-8">No se encontraron resultados para tu búsqueda.</p>
            )}
        </div>
      </div>
    </section>
  )
}
