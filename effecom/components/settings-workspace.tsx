"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Switch } from "@/components/ui/switch";

type Preferences = { reduceMotion: boolean; compactActivity: boolean };
const storageKey = "effecom-preferences-v1";
const defaults: Preferences = { reduceMotion: false, compactActivity: false };
const preferenceEvent = "effecom-preferences-change";

function getPreferencesSnapshot(): string {
  try {
    return localStorage.getItem(storageKey) ?? "";
  } catch {
    return "";
  }
}

function parsePreferences(snapshot: string): Preferences {
  try {
    return snapshot ? { ...defaults, ...JSON.parse(snapshot) as Partial<Preferences> } : defaults;
  } catch {
    return defaults;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(preferenceEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(preferenceEvent, callback);
  };
}

export function SettingsWorkspace() {
  const snapshot = useSyncExternalStore(subscribe, getPreferencesSnapshot, () => "");
  const preferences = parsePreferences(snapshot);

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = String(preferences.reduceMotion);
    document.documentElement.dataset.compactActivity = String(preferences.compactActivity);
  }, [preferences.reduceMotion, preferences.compactActivity]);

  function updatePreference(key: keyof Preferences, value: boolean) {
    const updated = { ...preferences, [key]: value };
    localStorage.setItem(storageKey, JSON.stringify(updated));
    window.dispatchEvent(new Event(preferenceEvent));
  }

  return (
    <section className="workspace-panel">
      <div className="workspace-panel-heading">
        <div><p className="landing-kicker">PREFERENCES</p><h2>Settings</h2></div>
        <span className="local-save-label">Saved on this device</span>
      </div>
      <div className="settings-list">
        <label className="settings-row" htmlFor="reduce-motion">
          <span><strong>Reduce motion</strong><span>Limit interface animations and smooth scrolling.</span></span>
          <Switch id="reduce-motion" checked={preferences.reduceMotion} onCheckedChange={(checked) => updatePreference("reduceMotion", checked)} />
        </label>
        <label className="settings-row" htmlFor="compact-activity">
          <span><strong>Compact activity list</strong><span>Use tighter spacing for recent activity entries.</span></span>
          <Switch id="compact-activity" checked={preferences.compactActivity} onCheckedChange={(checked) => updatePreference("compactActivity", checked)} />
        </label>
      </div>
    </section>
  );
}