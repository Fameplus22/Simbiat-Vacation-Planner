import Link from "next/link";

import { SignUpForm } from "@/components/auth/sign-up-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Link className="text-sm font-semibold text-primary" href="/">
            Vacation Planner
          </Link>
          <CardTitle>Create account</CardTitle>
          <CardDescription>
            Create a secure account before saving draft vacation plans.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
      </Card>
    </main>
  );
}
