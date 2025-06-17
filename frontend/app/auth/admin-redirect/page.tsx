'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminRedirectPage() {
  const router = useRouter()

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4 bg-card text-card-foreground dark:bg-gray-900 dark:text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Login as Administrator</CardTitle>
          <CardDescription>You have successfully logged in as an administrator. Please choose your destination.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Button 
            variant="outline"
            className="w-full bg-white text-black hover:bg-gray-200 dark:bg-gray-100 dark:text-black dark:hover:bg-gray-300"
            onClick={() => router.push('/dashboard')}>
            Go to Personal Tutor View
          </Button>
          <Button 
            variant="default"
            className="w-full bg-gray-800 text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
            onClick={() => router.push('/admin')}> 
            Proceed to Admin Portal
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
