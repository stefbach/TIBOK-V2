import DoctorDashboardClientLayout from "./DoctorDashboardClientLayout"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DoctorDashboardLayout({ children }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single()

  return (
    <DoctorDashboardClientLayout user={user} profile={profile}>
      {children}
    </DoctorDashboardClientLayout>
  )
}
