import { Loader2 } from "lucide-react"

export default function AdminLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
    </div>
  )
}
