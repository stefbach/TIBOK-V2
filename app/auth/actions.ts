"use server"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect(`/login?message=Could not authenticate user: ${error.message}`)
  }

  // Redirect based on role after login
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single()

  if (profile?.role === "doctor") {
    return redirect("/doctor/dashboard")
  }

  return redirect("/dashboard")
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("full_name") as string
  const role = formData.get("role") as string
  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role, // This data is passed to the trigger
      },
    },
  })

  if (error) {
    return redirect(`/login?message=Could not create user: ${error.message}`)
  }

  // For now, we redirect to a confirmation message page.
  // Supabase sends a confirmation email by default.
  return redirect("/login?message=Check email to continue sign in process")
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  return redirect("/login")
}
