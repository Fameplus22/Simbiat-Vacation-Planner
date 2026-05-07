"use client";

import { Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

import { signUpAction } from "@/app/auth/actions";
import { idleActionState } from "@/lib/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(
    signUpAction,
    idleActionState,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
          required
        />
        {state.fieldErrors?.email ? (
          <p className="text-sm font-medium text-destructive" id="email-error">
            {state.fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          aria-describedby={
            state.fieldErrors?.password ? "password-error" : undefined
          }
          required
        />
        <p className="text-sm text-muted-foreground">
          Use at least 8 characters. Keep it unique to this account.
        </p>
        {state.fieldErrors?.password ? (
          <p className="text-sm font-medium text-destructive" id="password-error">
            {state.fieldErrors.password}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p
          className={
            state.status === "success"
              ? "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800"
              : "rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
          }
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
        Create account
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already planning?{" "}
        <Link className="font-semibold text-primary underline-offset-4 hover:underline" href="/auth/sign-in">
          Sign in
        </Link>
      </p>
    </form>
  );
}
