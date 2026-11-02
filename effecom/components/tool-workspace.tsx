"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/api";

type ToolOptions = {
  languages: { code: string; name: string }[];
  voices: { language: string; name: string }[];
  max_text_length: number;
};

type ToolWorkspaceProps = {
  tool: "text-to-speech" | "translation";
};

function findResponseValue(
  value: unknown,
  keys: string[],
): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  for (const [key, nested] of Object.entries(value)) {
    if (
      keys.includes(key.toLowerCase()) &&
      typeof nested === "string" &&
      nested.length > 0
    ) {
      return nested;
    }
    const found = findResponseValue(nested, keys);
    if (found) return found;
  }
  return undefined;
}

export function ToolWorkspace({ tool }: ToolWorkspaceProps) {
  const [options, setOptions] = useState<ToolOptions | null>(null);
  const [text, setText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [voiceLanguage, setVoiceLanguage] = useState("");
  const [voice, setVoice] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    apiRequest<ToolOptions>("/api/v1/auth/options/")
      .then((data) => {
        if (!active) return;
        setOptions(data);
        const english = data.languages.find(({ code }) => code === "eng");
        const initialSource = "";
        const initialTarget =
          english?.code ??
          data.languages[0]?.code ??
          "";
        setSourceLanguage(initialSource);
        setTargetLanguage(initialTarget);
        const initialVoice = data.voices[0];
        if (initialVoice) {
          setVoiceLanguage(initialVoice.language);
          setVoice(initialVoice.name);
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Could not load available languages and voices.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const voices = useMemo(
    () =>
      options?.voices.filter(({ language }) => language === voiceLanguage) ??
      [],
    [options, voiceLanguage],
  );
  const isTranslation = tool === "translation";
  const audioUrl = findResponseValue(result, [
    "audio_url",
    "audiourl",
    "url",
  ]);
  const translatedText = findResponseValue(result, [
    "translation",
    "translated_text",
    "translatedtext",
    "text",
  ]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const payload = isTranslation
        ? {
            text,
            ...(sourceLanguage ? { source_language: sourceLanguage } : {}),
            target_language: targetLanguage,
          }
        : {
            text,
            language: voiceLanguage,
            voice,
          };
      const data = await apiRequest<Record<string, unknown>>(
        isTranslation ? "/api/v1/translate/" : "/api/v1/tts/",
        { method: "POST", body: JSON.stringify(payload) },
      );
      setResult(data);
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The request could not be completed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="tool-workspace" aria-labelledby="tool-form-title">
      <h2 id="tool-form-title">
        {isTranslation ? "Translate a message" : "Listen to your text"}
      </h2>
      <p className="tool-workspace-intro">
        Try it without an account. Sign in if you want successful requests to
        appear in your activity history.
        {isTranslation &&
          " Choose a source language or let Sunbird detect it automatically. Complete sentences work best."}
      </p>
      <form className="tool-form" onSubmit={submit}>
        {isTranslation ? (
          <div className="tool-language-row">
            <label>
              From (optional)
              <select
                value={sourceLanguage}
                onChange={(event) => {
                  const language = event.target.value;
                  setSourceLanguage(language);
                  if (language && language === targetLanguage) {
                    setTargetLanguage(
                      options?.languages.find(
                        ({ code }) => code !== language,
                      )?.code ?? "",
                    );
                  }
                }}
                disabled={!options}
              >
                <option value="">Detect automatically</option>
                {options?.languages.map(({ code, name }) => (
                  <option value={code} key={code}>
                    {name} ({code})
                  </option>
                ))}
              </select>
            </label>
            <label>
              To
              <select
                required
                value={targetLanguage}
                onChange={(event) => setTargetLanguage(event.target.value)}
                disabled={!options}
              >
                {options?.languages
                  .filter(({ code }) => !sourceLanguage || code !== sourceLanguage)
                  .map(({ code, name }) => (
                    <option value={code} key={code}>
                      {name} ({code})
                    </option>
                  ))}
              </select>
            </label>
          </div>
        ) : (
          <div className="tool-language-row">
            <label>
              Language
              <select
                required
                value={voiceLanguage}
                onChange={(event) => {
                  const language = event.target.value;
                  setVoiceLanguage(language);
                  setVoice(
                    options?.voices.find((item) => item.language === language)
                      ?.name ?? "",
                  );
                }}
                disabled={!options}
              >
                {[...new Set(options?.voices.map(({ language }) => language))].map(
                  (language) => (
                    <option value={language} key={language}>
                      {options?.languages.find(
                        (item) => item.code === language,
                      )?.name ?? language.toUpperCase()}
                    </option>
                  ),
                )}
              </select>
            </label>
            <label>
              Voice
              <select
                required
                value={voice}
                onChange={(event) => setVoice(event.target.value)}
                disabled={voices.length === 0}
              >
                {voices.map(({ name }) => (
                  <option value={name} key={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        <label>
          Text
          <textarea
            required
            maxLength={options?.max_text_length ?? 2000}
            rows={5}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={
              isTranslation
                ? "Write the message you want to translate"
                : "Write something you would like to hear"
            }
          />
          <span className="tool-character-count">
            {text.length}/{options?.max_text_length ?? 2000}
          </span>
        </label>
        <button
          className="landing-button landing-button-primary tool-submit"
          type="submit"
          disabled={loading || !options || !text.trim()}
        >
          {loading
            ? "Working…"
            : isTranslation
              ? "Translate text"
              : "Generate speech"}
        </button>
      </form>

      {error && (
        <p className="tool-error" role="alert">
          {error}
        </p>
      )}
      {result && (
        <section className="tool-result" aria-live="polite">
          <h3>{isTranslation ? "Translation result" : "Your audio"}</h3>
          {audioUrl && (
            <audio controls preload="none" src={audioUrl}>
              Your browser does not support audio playback.
            </audio>
          )}
          {translatedText && isTranslation ? (
            <p className="tool-translated-text">{translatedText}</p>
          ) : (
            <pre>{JSON.stringify(result, null, 2)}</pre>
          )}
          {isTranslation && !translatedText && (
            <p className="tool-result-note">
              The provider returned this response:
            </p>
          )}
        </section>
      )}
    </section>
  );
}
