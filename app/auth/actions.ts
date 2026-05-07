"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { type ActionState } from "@/lib/action-state";
import { createClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function safeNextPath(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return "/dashboard";
}

function validateAuthForm(formData: FormData) {
  const email = normalizeEmail(getString(formData, "email"));
  const password = getString(formData, "password");
  const fieldErrors: Record<string, string> = {};

  if (!email || !email.includes("@")) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (password.length < 8) {
    fieldErrors.password = "Password must be at least 8 characters.";
  }

  return {
    email,
    password,
    fieldErrors,
    isValid: Object.keys(fieldErrors).length === 0,
  };
}

export async function signInAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { email, password, fieldErrors, isValid } = validateAuthForm(formData);
  const next = safeNextPath(getString(formData, "next"));

  if (!isValid) {
    return {
      status: "error",
      message: "Fix the highlighted fields and try again.",
      fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  redirect(next);
}

export async function signUpAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { email, password, fieldErrors, isValid } = validateAuthForm(formData);

  if (!isValid) {
    return {
      status: "error",
      message: "Fix the highlighted fields and try again.",
      fieldErrors,
    };
  }

  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/dashboard`,
    },
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  if (data.session) {
    redirect("/dashboard");
  }

  return {
    status: "success",
    message:
      "Account created. Check your email to confirm your account, then sign in.",
  };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/sign-in");
}
