"use client";

import { Loader2, LogIn } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

import { signInAction } from "@/app/auth/actions";
import { idleActionState } from "@/lib/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SignInFormProps = {
  nextPath?: string;
};

export function SignInForm({ nextPath = "/dashboard" }: SignInFormProps) {
  const [state, formAction, isPending] = useActionState(
    signInAction,
    idleActionState,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={nextPath} />
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
          autoComplete="current-password"
          aria-describedby={
            state.fieldErrors?.password ? "password-error" : undefined
          }
          required
        />
        {state.fieldErrors?.password ? (
          <p className="text-sm font-medium text-destructive" id="password-error">
            {state.fieldErrors.password}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}

      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
        Sign in
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link className="font-semibold text-primary underline-offset-4 hover:underline" href="/auth/sign-up">
          Create an account
        </Link>
      </p>
    </form>
  );
}
