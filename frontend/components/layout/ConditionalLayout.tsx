'use client'

import { usePathname } from 'next/navigation'
import type React from 'react'
import Header from '@/components/header'
import Footer from '@/components/footer'

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  if (isHomePage) {
    return <>{children}</> 
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
