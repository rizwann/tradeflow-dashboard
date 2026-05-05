import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { UserRole } from "@/types/app"

export async function getCurrentUserProfile() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .single()

  if (error || !profile) {
    redirect("/login")
  }

  return {
    user,
    profile: {
      id: profile.id,
      fullName: profile.full_name,
      role: profile.role as UserRole,
    },
  }
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await getCurrentUserProfile()

  if (!allowedRoles.includes(session.profile.role)) {
    redirect("/dashboard")
  }

  return session
}

export async function requireAdmin() {
  return requireRole(["admin"])
}
