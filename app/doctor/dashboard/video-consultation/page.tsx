import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StartConsultationClient } from "./start-consultation-client"

export default async function DoctorVideoConsultationPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  // Fetch the doctor's profile to ensure they have the correct role
  const { data: doctorProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (doctorProfile?.role !== "doctor") {
    // Or redirect to a generic dashboard or an error page
    return redirect("/dashboard?error=unauthorized")
  }

  // Fetch all patients to populate the selection dropdown
  const { data: patients, error } = await supabase.from("profiles").select("id, full_name").eq("role", "patient")

  if (error) {
    // Handle error appropriately
    return <div>Erreur lors de la récupération des patients: {error.message}</div>
  }

  return <StartConsultationClient patients={patients || []} doctorId={user.id} />
}
