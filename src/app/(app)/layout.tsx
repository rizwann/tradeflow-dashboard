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
    <div className="relative min-h-dvh overflow-x-hidden bg-transparent">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[26rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),transparent_58%)] dark:bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.14),transparent_58%)]"
      />
      <div
        aria-hidden="true"
        className="surface-orb left-[12%] top-24 z-0 h-64 w-64 bg-primary/10"
      />
      <div
        aria-hidden="true"
        className="surface-orb bottom-0 right-[8%] z-0 h-72 w-72 bg-accent/18"
      />

      <div className="relative z-10 flex min-h-dvh min-w-0">
        <Sidebar role={role} />

        <div className="flex min-h-0 min-h-dvh min-w-0 flex-1 flex-col overflow-x-hidden">
          <Header fullName={profile.full_name} role={role} />

          <main className="min-h-0 min-w-0 flex-1 px-3 py-4 sm:px-4 lg:px-6 lg:py-7">
            <div className="mx-auto min-w-0 max-w-[1640px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
