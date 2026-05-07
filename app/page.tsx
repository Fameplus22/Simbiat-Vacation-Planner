import { ArrowRight, CheckCircle2, ClipboardList, MapPinned } from "lucide-react";
import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-dvh">
      <SiteHeader userEmail={user?.email} />

      <section className="relative overflow-hidden">
        <div
          aria-label="Coastal travel overlook with bright blue water"
          className="absolute inset-0 -z-10 bg-cover bg-center"
          role="img"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-slate-950/55" />
        </div>

        <div className="mx-auto grid min-h-[82dvh] max-w-6xl items-center gap-10 px-4 py-16 text-white sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
          <div className="max-w-2xl space-y-6">
            <p className="inline-flex rounded-md bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur">
              Secure trip planning foundation
            </p>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight tracking-normal sm:text-5xl">
                Vacation Planner
              </h1>
              <p className="max-w-xl text-lg leading-8 text-white/88">
                Start with the essentials: sign in, create a draft trip, allocate
                days across cities, and keep every account plan isolated.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={user ? "/dashboard" : "/auth/sign-up"}>
                  {user ? "Open dashboard" : "Start planning"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                className="border-white/40 bg-white/10 text-white hover:bg-white/20"
                size="lg"
                variant="outline"
              >
                <Link href={user ? "/trips/new" : "/auth/sign-in"}>
                  {user ? "Create a trip" : "Sign in"}
                </Link>
              </Button>
            </div>
          </div>

          <Card className="border-white/25 bg-white/90 text-foreground shadow-xl">
            <CardHeader>
              <CardTitle>Draft trip workspace</CardTitle>
              <CardDescription>
                Phase 1 focuses on the first secure planning loop.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  icon: MapPinned,
                  title: "Choose a country",
                  text: "Capture the destination without adding booking noise.",
                },
                {
                  icon: ClipboardList,
                  title: "Allocate days by city",
                  text: "Keep the trip length and city plan aligned.",
                },
                {
                  icon: CheckCircle2,
                  title: "Save a private draft",
                  text: "Supabase RLS keeps rows scoped to the signed-in user.",
                },
              ].map((item) => (
                <div className="flex gap-3 rounded-lg border border-border bg-background p-3" key={item.title}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-semibold">{item.title}</h2>
                    <p className="text-sm leading-6 text-muted-foreground">{item.text}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Auth first</CardTitle>
            <CardDescription>
              Email/password sign-up and sign-in are wired through Supabase SSR.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Protected workspace</CardTitle>
            <CardDescription>
              Dashboard and trip creation are server-protected, not just hidden in the UI.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Draft trips</CardTitle>
            <CardDescription>
              Save country, cities, trip length, and city day allocations.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </main>
  );
}
