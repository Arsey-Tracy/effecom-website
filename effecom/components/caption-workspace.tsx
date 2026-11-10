"use client";

import { useEffect, useState } from "react";
import { Download, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";

type CaptionLine = { id: number; text: string; duration: number };
type ToolOptions = { stt_languages: { code: string; name: string }[] };

function findTranscript(value: unknown): string {
  if (!value || typeof value !== "object") return "";
  for (const [key, nested] of Object.entries(value)) {
    if (key.toLowerCase() === "audio_transcription" && typeof nested === "string") return nested;
    const found = findTranscript(nested);
    if (found) return found;
  }
  return "";
}

function splitIntoLines(text: string): CaptionLine[] {
  const parts = text.match(/[^.!?]+[.!?]?/g)?.map((part) => part.trim()).filter(Boolean) ?? [];
  const sentences = parts.length ? parts : text.trim() ? [text.trim()] : [];
  return sentences.map((part, index) => ({ id: Date.now() + index, text: part, duration: 3 }));
}

function formatTime(seconds: number) {
  const milliseconds = Math.max(0, Math.round(seconds * 1000));
  const hours = Math.floor(milliseconds / 3_600_000);
  const minutes = Math.floor((milliseconds % 3_600_000) / 60_000);
  const wholeSeconds = Math.floor((milliseconds % 60_000) / 1000);
  const remainder = milliseconds % 1000;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(wholeSeconds).padStart(2, "0")},${String(remainder).padStart(3, "0")}`;
}

export function CaptionWorkspace() {
  const [options, setOptions] = useState<ToolOptions | null>(null);
  const [language, setLanguage] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [lines, setLines] = useState<CaptionLine[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    apiRequest<ToolOptions>("/api/v1/auth/options/")
      .then((data) => {
        if (!active) return;
        setOptions(data);
        setLanguage(data.stt_languages[0]?.code ?? "");
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Speech languages could not be loaded.");
      })
      .finally(() => { if (active) setLoadingOptions(false); });
    return () => { active = false; };
  }, []);

  async function transcribe() {
    setError("");
    setMessage("");
    if (!audioFile) {
      setError("Choose a WAV recording first.");
      return;
    }
    const formData = new FormData();
    formData.append("audio", audioFile);
    formData.append("language", language);
    setProcessing(true);
    try {
      const result = await apiRequest<Record<string, unknown>>("/api/v1/stt/", { method: "POST", body: formData });
      const transcript = findTranscript(result);
      if (!transcript) throw new Error("The speech service returned no transcript.");
      setLines(splitIntoLines(transcript));
      setMessage("Transcript ready. Review the wording and timing before exporting.");
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "The recording could not be transcribed.");
    } finally {
      setProcessing(false);
    }
  }

  function exportSrt() {
    const entries: string[] = [];
    let cursor = 0;
    lines.forEach((line, index) => {
      const end = cursor + Math.max(0.1, line.duration);
      entries.push(`${index + 1}\n${formatTime(cursor)} --> ${formatTime(end)}\n${line.text.trim()}`);
      cursor = end;
    });
    const blob = new Blob([`${entries.join("\n\n")}\n`], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "effecom-captions.srt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="caption-workspace">
      <section className="workspace-panel">
        <div className="workspace-panel-heading"><div><p className="landing-kicker">AUDIO TO SUBTITLES</p><h2>Create a caption file</h2></div></div>
        <p className="workspace-description">Transcribe a WAV recording, review the generated caption segments, then download an SRT file.</p>
        <div className="caption-source-form">
          <label className="app-field">
            <span>Audio language</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value)} disabled={loadingOptions || !options?.stt_languages.length}>
              {options?.stt_languages.map(({ code, name }) => <option value={code} key={code}>{name} ({code})</option>)}
            </select>
          </label>
          <label className="app-field"><span>WAV recording</span><Input type="file" accept="audio/wav,.wav" onChange={(event) => setAudioFile(event.target.files?.[0] ?? null)} /></label>
          <Button type="button" onClick={transcribe} disabled={processing || loadingOptions || !options || !audioFile}>{processing ? "Transcribing…" : "Transcribe recording"}</Button>
        </div>
        <p className="app-field-note">Caption boundaries are estimated from sentence breaks. Edit each segment’s duration to align the subtitles with your video.</p>
        {error && <p className="tool-error" role="alert">{error}</p>}
        {message && <p className="app-success" role="status">{message}</p>}
      </section>
      <section className="workspace-panel caption-editor">
        <div className="workspace-panel-heading">
          <div><p className="landing-kicker">CAPTION EDITOR</p><h2>Subtitle segments <span className="caption-count">{lines.length}</span></h2></div>
          <div className="caption-actions">
            <Button type="button" variant="outline" onClick={() => setLines((current) => [...current, { id: Date.now(), text: "", duration: 3 }])}><Plus aria-hidden="true" /> Add line</Button>
            <Button type="button" onClick={exportSrt} disabled={!lines.length || lines.some((line) => !line.text.trim())}><Download aria-hidden="true" /> Export SRT</Button>
          </div>
        </div>
        {lines.length ? (
          <ol className="caption-list">
            {lines.map((line, index) => (
              <li className="caption-row" key={line.id}>
                <span className="caption-index">{String(index + 1).padStart(2, "0")}</span>
                <Textarea aria-label={`Caption ${index + 1} text`} rows={2} value={line.text} onChange={(event) => setLines((current) => current.map((item) => item.id === line.id ? { ...item, text: event.target.value } : item))} />
                <label className="caption-duration"><span>Duration (sec)</span><Input aria-label={`Caption ${index + 1} duration in seconds`} type="number" min="0.5" max="30" step="0.5" value={line.duration} onChange={(event) => setLines((current) => current.map((item) => item.id === line.id ? { ...item, duration: Math.max(0.5, Number(event.target.value) || 0.5) } : item))} /></label>
                <Button type="button" variant="ghost" size="icon" aria-label={`Remove caption ${index + 1}`} onClick={() => setLines((current) => current.filter((item) => item.id !== line.id))}><Trash2 aria-hidden="true" /></Button>
              </li>
            ))}
          </ol>
        ) : <p className="activity-empty">Transcribe a WAV recording or add a line to start editing captions.</p>}
      </section>
    </div>
  );
}