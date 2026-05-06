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
    <div className="relative min-h-screen overflow-x-hidden bg-transparent">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-80 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.12),transparent_55%)]"
      />

      <div className="relative z-10 flex min-w-0">
        <Sidebar role={role} />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Header fullName={profile.full_name} role={role} />

          <main className="min-w-0 flex-1 px-3 py-4 sm:px-4 lg:px-6 lg:py-6">
            <div className="mx-auto min-w-0 max-w-[1600px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
