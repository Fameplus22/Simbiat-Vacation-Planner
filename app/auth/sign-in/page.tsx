import Link from "next/link";

import { SignInForm } from "@/components/auth/sign-in-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SignInPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const nextParam = params?.next;
  const nextPath =
    typeof nextParam === "string" && nextParam.startsWith("/") ? nextParam : "/dashboard";

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Link className="text-sm font-semibold text-primary" href="/">
            Vacation Planner
          </Link>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Open your private trip dashboard and continue planning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm nextPath={nextPath} />
        </CardContent>
      </Card>
    </main>
  );
}
