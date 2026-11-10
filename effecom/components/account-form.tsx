"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/api";

type AccountFormProps = {
  mode: "login" | "register";
};

export function AccountForm({ mode }: AccountFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";

  function validate() {
    const errors: Record<string, string> = {};
    if (!email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Password is required.";
    else if (isRegister && password.length < 8)
      errors.password = "Password must be at least 8 characters.";
    if (isRegister && !firstName.trim())
      errors.firstName = "First name is required.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await apiRequest(
        isRegister ? "/api/v1/auth/register/" : "/api/v1/auth/login/",
        {
          method: "POST",
          body: JSON.stringify(
            isRegister
              ? { email: email.trim(), first_name: firstName.trim(), password }
              : { email: email.trim(), password },
          ),
        },
      );
      router.replace("/dashboard");
      router.refresh();
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : "We could not complete your request.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="account-panel">
      <p className="landing-kicker">EFFECOM ACCOUNT</p>
      <h1>{isRegister ? "Create your account" : "Welcome back"}</h1>
      <p className="account-panel-intro">
        {isRegister
          ? "Save your translation and text-to-speech activity in one place."
          : "Sign in to see your recent communication tool activity."}
      </p>
      <form className="account-form" onSubmit={submit}>
        {isRegister && (
          <label>
            First name
            <input
              autoComplete="given-name"
              maxLength={150}
              required
              value={firstName}
              onChange={(event) => {
                setFirstName(event.target.value);
                setFieldErrors((e) => ({ ...e, firstName: "" }));
              }}
            />
            {fieldErrors.firstName && (
              <span className="tool-error">{fieldErrors.firstName}</span>
            )}
          </label>
        )}
        <label>
          Email
          <input
            autoComplete="email"
            type="email"
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setFieldErrors((e) => ({ ...e, email: "" }));
            }}
          />
          {fieldErrors.email && (
            <span className="tool-error">{fieldErrors.email}</span>
          )}
        </label>
        <label>
          Password
          <input
            autoComplete={isRegister ? "new-password" : "current-password"}
            type="password"
            minLength={isRegister ? 8 : undefined}
            required
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setFieldErrors((e) => ({ ...e, password: "" }));
            }}
          />
          {fieldErrors.password && (
            <span className="tool-error">{fieldErrors.password}</span>
          )}
        </label>
        {error && (
          <p className="tool-error" role="alert">
            {error}
          </p>
        )}
        <button
          className="landing-button landing-button-primary tool-submit"
          type="submit"
          disabled={loading}
        >
          {loading ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
        </button>
      </form>
      <p className="account-switch">
        {isRegister ? "Already have an account?" : "New to EFFECOM?"}{" "}
        <Link href={isRegister ? "/login" : "/register"}>
          {isRegister ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </section>
  );
}
