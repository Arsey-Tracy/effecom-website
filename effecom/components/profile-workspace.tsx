"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";

type Account = { id: number; email: string; first_name: string };

export function ProfileWorkspace() {
  const [account, setAccount] = useState<Account | null>(null);
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    apiRequest<Account>("/api/v1/auth/me/")
      .then((data) => {
        if (!active) return;
        setAccount(data);
        setFirstName(data.first_name);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Profile could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaved(false);
    if (!firstName.trim()) {
      setError("Enter your first name.");
      return;
    }
    setSaving(true);
    try {
      const updated = await apiRequest<Account>("/api/v1/auth/me/", {
        method: "PATCH",
        body: JSON.stringify({ first_name: firstName.trim() }),
      });
      setAccount(updated);
      setFirstName(updated.first_name);
      setSaved(true);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Profile could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="workspace-panel">
      <div className="workspace-panel-heading"><div><p className="landing-kicker">ACCOUNT DETAILS</p><h2>Profile</h2></div></div>
      {loading ? <p role="status">Loading profile…</p> : (
        <form className="app-form" onSubmit={submit}>
          <label className="app-field">
            <span>First name</span>
            <Input autoComplete="given-name" maxLength={150} required value={firstName} onChange={(event) => setFirstName(event.target.value)} />
          </label>
          <label className="app-field">
            <span>Email address</span>
            <Input type="email" value={account?.email ?? ""} readOnly aria-describedby="email-note" />
            <span id="email-note" className="app-field-note">Email changes are not available in this prototype.</span>
          </label>
          {error && <p className="tool-error" role="alert">{error}</p>}
          {saved && <p className="app-success" role="status">Profile updated.</p>}
          <Button type="submit" disabled={saving || loading}>{saving ? "Saving…" : "Save profile"}</Button>
        </form>
      )}
    </section>
  );
}