"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteFooter } from "@/components/home-sections";
import { SiteHeader } from "@/components/site-header";
import { ApiError, apiRequest } from "@/lib/api";

type Account = {
  id: number;
  email: string;
  first_name: string;
};

type Activity = {
  id: number;
  tool: "tts" | "translation";
  text: string;
  language: string;
  voice: string;
  source_language: string;
  target_language: string;
  result: Record<string, unknown>;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest<Account>("/api/v1/auth/me/"),
      apiRequest<Activity[]>("/api/v1/account/history/"),
    ])
      .then(([user, history]) => {
        if (!active) return;
        setAccount(user);
        setActivities(history);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        if (
          cause instanceof ApiError &&
          (cause.status === 401 || cause.status === 403)
        ) {
          router.replace("/login");
          return;
        }
        setError(
          cause instanceof Error
            ? cause.message
            : "Your account information could not be loaded.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [router]);

  async function signOut() {
    setSigningOut(true);
    setError("");
    try {
      await apiRequest("/api/v1/auth/logout/", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : "You could not be signed out. Please try again.",
      );
      setSigningOut(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="dashboard-page">
        <div className="dashboard-inner">
          <div className="dashboard-heading">
            <div>
              <p className="landing-kicker">YOUR EFFECOM</p>
              <h1>Activity dashboard</h1>
              {account && <p>Signed in as {account.email}</p>}
            </div>
            <button
              type="button"
              className="landing-button landing-button-secondary"
              onClick={signOut}
              disabled={signingOut || loading}
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
          {error && (
            <p className="tool-error" role="alert">
              {error}
            </p>
          )}
          {loading ? (
            <p role="status">Loading your activity…</p>
          ) : (
            <>
              <div className="dashboard-shortcuts">
                <Link href="/products/translation">Try translation</Link>
                <Link href="/products/text-to-speech">Try text-to-speech</Link>
              </div>
              <section className="activity-section">
                <h2>Recent activity</h2>
                {activities.length === 0 ? (
                  <p className="activity-empty">
                    Your successful signed-in translations and speech requests
                    will appear here.
                  </p>
                ) : (
                  <ol className="activity-list">
                    {activities.map((activity) => (
                      <li key={activity.id} className="activity-card">
                        <div className="activity-card-heading">
                          <h3>
                            {activity.tool === "tts"
                              ? "Text-to-Speech"
                              : "Translation"}
                          </h3>
                          <time dateTime={activity.created_at}>
                            {new Date(activity.created_at).toLocaleString()}
                          </time>
                        </div>
                        <p className="activity-source">{activity.text}</p>
                        {activity.tool === "tts" ? (
                          <p className="activity-meta">
                            {activity.language.toUpperCase()} · {activity.voice}
                          </p>
                        ) : (
                          <p className="activity-meta">
                            {activity.source_language.toUpperCase()} →{" "}
                            {activity.target_language.toUpperCase()}
                          </p>
                        )}
                        <details>
                          <summary>View provider result</summary>
                          <pre>{JSON.stringify(activity.result, null, 2)}</pre>
                        </details>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
