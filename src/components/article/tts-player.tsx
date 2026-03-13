"use client";

import { useEffect, useRef, useState } from "react";

interface TTSPlayerProps {
  headline: string;
  dek?: string | null;
  bodyHtml?: string | null;
}

const PRESETS = [
  { id: "anchor",  label: "Undead Anchor",   rate: 0.95, pitch: 0.75 },
  { id: "oracle",  label: "The Oracle",       rate: 0.80, pitch: 0.55 },
  { id: "herald",  label: "Breaking Herald",  rate: 1.15, pitch: 1.10 },
  { id: "specter", label: "The Specter",      rate: 0.70, pitch: 0.85 },
] as const;

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;
type PresetId = typeof PRESETS[number]["id"];
type Speed = typeof SPEEDS[number];

function extractText(
  headline: string,
  dek: string | null | undefined,
  bodyHtml: string | null | undefined
): string {
  const parts = [headline];
  if (dek) parts.push(dek);
  if (bodyHtml) {
    const div = document.createElement("div");
    div.innerHTML = bodyHtml;
    parts.push((div.textContent ?? "").replace(/\s+/g, " ").trim());
  }
  return parts.join(". ");
}

function pickBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const enUS = voices.filter(v => v.lang === "en-US");
  return (
    enUS.find(v => v.name.startsWith("Google")) ??
    enUS.find(v => v.name.includes("Neural")) ??
    enUS[0] ??
    voices.find(v => v.lang.startsWith("en")) ??
    null
  );
}

export function TTSPlayer({ headline, dek, bodyHtml }: TTSPlayerProps) {
  const [mounted,   setMounted]   = useState(false);
  const [supported, setSupported] = useState(false);
  const [voices,    setVoices]    = useState<SpeechSynthesisVoice[]>([]);
  const [isOpen,    setIsOpen]    = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [preset,    setPreset]    = useState<PresetId>("anchor");
  const [speed,     setSpeed]     = useState<Speed>(1);

  const utteranceRef   = useRef<SpeechSynthesisUtterance | null>(null);
  const textRef        = useRef("");
  const totalLenRef    = useRef(0);
  const voicesRef      = useRef<SpeechSynthesisVoice[]>([]);
  const resumeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
    if (!("speechSynthesis" in window)) return;
    setSupported(true);
    const synth = window.speechSynthesis;
    const load = () => {
      voicesRef.current = synth.getVoices();
      setVoices(voicesRef.current);
    };
    load();
    synth.addEventListener("voiceschanged", load);
    return () => synth.removeEventListener("voiceschanged", load);
  }, []);

  useEffect(() => () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    if (resumeTimerRef.current) clearInterval(resumeTimerRef.current);
  }, []);

  function clearResumeTimer() {
    if (resumeTimerRef.current) {
      clearInterval(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }

  function startSpeaking(presetId: PresetId, spd: Speed) {
    const synth = window.speechSynthesis;
    synth.cancel();
    clearResumeTimer();

    const activePreset = PRESETS.find(p => p.id === presetId) ?? PRESETS[0];
    const utt = new SpeechSynthesisUtterance(textRef.current);

    const voice = pickBestVoice(voicesRef.current);
    if (voice) utt.voice = voice;

    utt.rate  = activePreset.rate * spd;
    utt.pitch = activePreset.pitch;

    utt.onboundary = (e) => {
      if (totalLenRef.current > 0 && e.charIndex != null) {
        setProgress(e.charIndex / totalLenRef.current);
      }
    };

    utt.onend = () => {
      setIsPlaying(false);
      setProgress(1);
      clearResumeTimer();
    };

    utt.onerror = () => {
      setIsPlaying(false);
      clearResumeTimer();
    };

    utt.onstart = () => setIsPlaying(true);

    utteranceRef.current = utt;
    synth.speak(utt);

    resumeTimerRef.current = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 10000);
  }

  function handleOpen() {
    const text = extractText(headline, dek, bodyHtml);
    textRef.current     = text;
    totalLenRef.current = text.length;
    setIsOpen(true);
  }

  function handlePlayPause() {
    const synth = window.speechSynthesis;
    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
    } else if (utteranceRef.current && synth.paused) {
      synth.resume();
      setIsPlaying(true);
    } else {
      startSpeaking(preset, speed);
    }
  }

  function handleStop() {
    window.speechSynthesis.cancel();
    clearResumeTimer();
    utteranceRef.current = null;
    setIsPlaying(false);
    setProgress(0);
    setIsOpen(false);
  }

  function handleClose() {
    handleStop();
  }

  function handlePresetChange(newPreset: PresetId) {
    setPreset(newPreset);
    if (isPlaying || utteranceRef.current) {
      setProgress(0);
      startSpeaking(newPreset, speed);
    }
  }

  function handleSpeedChange(newSpeed: Speed) {
    setSpeed(newSpeed);
    if (isPlaying || utteranceRef.current) {
      setProgress(0);
      startSpeaking(preset, newSpeed);
    }
  }

  if (!mounted) return null;

  return (
    <>
      {supported && (
        <button
          onClick={handleOpen}
          aria-label="Listen to this article"
          className="mt-3 flex items-center gap-1.5 font-barlow text-[11px] uppercase tracking-wider text-garnet-bright hover:text-parchment"
        >
          <span aria-hidden>▶</span> Listen to article
        </button>
      )}

      {isOpen && (
        <div
          role="region"
          aria-label="Article audio player"
          className="fixed bottom-0 left-0 right-0 z-[200] border-t border-seam bg-chamber"
        >
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {isPlaying ? "Playing" : "Paused"}
          </div>

          <div className="mx-auto flex max-w-[1380px] items-center gap-3 px-3 py-2 sm:gap-4 sm:px-4">
            <button
              aria-label={isPlaying ? "Pause" : "Play article"}
              aria-pressed={isPlaying}
              onClick={handlePlayPause}
              className="flex h-8 w-8 items-center justify-center rounded border border-seam bg-graphite text-parchment hover:border-garnet hover:text-garnet-bright focus-visible:outline-2 focus-visible:outline-garnet"
            >
              {isPlaying ? "⏸" : "▶"}
            </button>

            <button
              aria-label="Stop playback"
              onClick={handleStop}
              className="flex h-8 w-8 items-center justify-center rounded border border-seam bg-graphite text-parchment hover:border-garnet hover:text-garnet-bright focus-visible:outline-2 focus-visible:outline-garnet"
            >
              ⏹
            </button>

            <select
              value={preset}
              onChange={e => handlePresetChange(e.target.value as PresetId)}
              aria-label="Voice preset"
              className="rounded border border-seam bg-graphite px-2 py-1 font-barlow text-[11px] uppercase tracking-wider text-stone focus:border-garnet focus:outline-none"
            >
              {PRESETS.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>

            <select
              value={speed}
              onChange={e => handleSpeedChange(Number(e.target.value) as Speed)}
              aria-label="Playback speed"
              className="rounded border border-seam bg-graphite px-2 py-1 font-barlow text-[11px] uppercase tracking-wider text-stone focus:border-garnet focus:outline-none"
            >
              {SPEEDS.map(s => (
                <option key={s} value={s}>{s}×</option>
              ))}
            </select>

            <span
              className="min-w-0 flex-1 truncate font-barlow text-[11px] uppercase tracking-wider text-ash"
              aria-hidden
            >
              {headline}
            </span>

            <div
              role="progressbar"
              aria-label="Article progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              className="h-1.5 w-24 overflow-hidden rounded-full bg-graphite sm:w-32"
            >
              <div
                className="h-full bg-garnet transition-all duration-300"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            <button
              aria-label="Close audio player"
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded border border-seam bg-graphite text-ash hover:text-parchment focus-visible:outline-2 focus-visible:outline-garnet"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
