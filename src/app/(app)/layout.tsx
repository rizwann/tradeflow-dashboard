import { redirect } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { createClient } from "@/lib/supabase/server"
import type { UserRole } from "@/types/app"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single()

  if (error || !profile) {
    redirect("/login")
  }

  const role = profile.role as UserRole

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent">
      <div className="flex min-w-0">
        <Sidebar role={role} />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Header fullName={profile.full_name} role={role} />

          <main className="min-w-0 flex-1 px-3 py-4 sm:px-4 lg:px-6 lg:py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
