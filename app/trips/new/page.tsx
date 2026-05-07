import { requireUser } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { TripForm } from "@/components/trips/trip-form";

export const dynamic = "force-dynamic";

export default async function NewTripPage() {
  const user = await requireUser();

  return (
    <main className="min-h-dvh">
      <SiteHeader userEmail={user.email} />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Create a draft trip</CardTitle>
            <CardDescription>
              Save the basic plan now. Recommendations, budgets, and bookings are Phase 2.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TripForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
