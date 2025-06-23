"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const errorMessage = searchParams.get("message")

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <CardTitle className="text-2xl font-bold text-red-700">Authentication Error</CardTitle>
          <CardDescription className="text-gray-600">Sorry, we couldn't sign you in.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              <strong>Details:</strong> {decodeURIComponent(errorMessage)}
            </p>
          )}
          <p className="text-sm text-gray-700">
            Please try signing in again. If the problem persists, ensure you have cookies enabled and try clearing your
            browser cache for this site.
          </p>
          <Link href="/start-consultation" passHref>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">Try Again</Button>
          </Link>
          <Link href="/" passHref>
            <Button variant="outline" className="w-full">
              Go to Homepage
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
