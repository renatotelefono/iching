"use client";

import { useState, useMemo } from "react";
import {
  LineValue,
  toBits,
  mutate,
  complementaryBits,
  nuclearBits,
  kingWenNumber,
  isChanging,
  getTrigrams,
} from "@/utils/iching";

import HEX_META from "@/data/hex_meta";
import HEX_TEXT_IT from "@/data/hexagrams.it.json";

import HexagramView from "@/components/HexagramView";
import ExplanationPanel from "@/components/ExplanationPanel";
import CoinToss from "@/components/CoinToss";

type HexTextLines = Partial<Record<"1" | "2" | "3" | "4" | "5" | "6", string>>;
type HexText = {
  title?: string;
  judgment?: string;
  image?: string;
  lines?: HexTextLines;
  notes?: string;
};

function getHexText(kw: number): HexText | null {
  const rec = (HEX_TEXT_IT as Record<string, HexText>)[String(kw)];
  return rec ?? null;
}

export default function Page() {
  // ─────────────────────────────────────────────
  // Stati principali
  // ─────────────────────────────────────────────
  const [lines, setLines] = useState<LineValue[]>([7, 8, 7, 8, 7, 8]);
  const [question, setQuestion] = useState("");
  const [validatedQuestion, setValidatedQuestion] = useState<string | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [validating, setValidating] = useState(false);
  const [tossCount, setTossCount] = useState(0);
  const [lineMode, setLineMode] = useState<"all" | "first" | "last">("all");

  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationText, setExplanationText] = useState("");

  const [interpretazione, setInterpretazione] = useState("");
  const [loadingInterp, setLoadingInterp] = useState(false);

  const [coinTossKey, setCoinTossKey] = useState(0);

  // ─────────────────────────────────────────────
  // Calcoli principali I Ching
  // ─────────────────────────────────────────────
  const bits = useMemo(() => toBits(lines), [lines]);
  const relLines = useMemo(() => mutate(lines), [lines]);
  const relBits = useMemo(() => toBits(relLines), [relLines]);

  const kw = kingWenNumber(bits);
  const kwRel = kingWenNumber(relBits);
  const kwNuclear = kingWenNumber(nuclearBits(bits));
  const kwComplementary = kingWenNumber(complementaryBits(bits));

  const txt = getHexText(kw);
  const txtRel = getHexText(kwRel);
  const txtNuc = getHexText(kwNuclear);
  const txtComp = getHexText(kwComplementary);

  const meta = HEX_META[kw];
  const metaRel = HEX_META[kwRel];
  const metaNuc = HEX_META[kwNuclear];
  const metaComp = HEX_META[kwComplementary];

  const changing = lines
    .map((v, i) => (isChanging(v) ? i + 1 : null))
    .filter(Boolean) as number[];

  const displayedChanging = (() => {
    if (changing.length === 0) return [];
    if (lineMode === "first") return [changing[0]];
    if (lineMode === "last") return [changing[changing.length - 1]];
    return changing;
  })();

  const trigramsPrimary = getTrigrams(bits);
  const trigramsRelation = getTrigrams(relBits);

  // ─────────────────────────────────────────────
  // Validazione domanda con OpenAI
  // ─────────────────────────────────────────────
  async function handleValidateQuestion() {
    if (!question.trim()) return;

    setValidating(true);
    setValidatedQuestion(null);
    setIsConfirmed(false);

    try {
      const res = await fetch("/api/validateQuestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      if (data.validatedQuestion) {
        setValidatedQuestion(data.validatedQuestion);
      } else {
        alert("Errore nella validazione della domanda.");
      }
    } catch (err) {
      console.error("Errore durante la validazione:", err);
      alert("Errore di connessione all'API di validazione.");
    } finally {
      setValidating(false);
    }
  }

  // ─────────────────────────────────────────────
  // Interpretazione con API interna /api/iching
  // ─────────────────────────────────────────────
  async function handleInterpretazione() {
    setLoadingInterp(true);
    try {
      const res = await fetch("/api/iching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: validatedQuestion || question,
          esagrammaPrimario: kw,
          esagrammaRelazione: kwRel,
          esagrammaNucleare: kwNuclear,
          esagrammaComplementare: kwComplementary,
          lineeMobili: displayedChanging,
        }),
      });

      const data = await res.json();
      setInterpretazione(data.answer || "Nessuna risposta ricevuta");
    } catch (err) {
      console.error("Errore API interpretazione:", err);
      setInterpretazione("Errore durante la consultazione");
    } finally {
      setLoadingInterp(false);
    }
  }

  // ─────────────────────────────────────────────
  // Reset e spiegazione
  // ─────────────────────────────────────────────
  function resetApp() {
    setTossCount(0);
    window.location.reload();
  }

  async function handleExplain() {
    try {
      const res = await fetch("/spiegazione.txt");
      const text = await res.text();
      setExplanationText(text);
      setShowExplanation(true);
    } catch {
      setExplanationText("Errore: impossibile caricare spiegazione.txt");
      setShowExplanation(true);
    }
  }

  // ─────────────────────────────────────────────
  // Rendering
  // ─────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 relative">
      {/* Header */}
      <header className="flex items-center justify-center">
        <div className="flex gap-2">
          <button
            onClick={handleInterpretazione}
            className="px-3 py-2 rounded-xl bg-green-600 text-white text-sm shadow hover:opacity-90 
             disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loadingInterp || !isConfirmed || tossCount !== 1}
          >
            {loadingInterp ? "Aspetta.." : "Lettura"}
          </button>

          <button
            onClick={handleExplain}
            className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm shadow hover:opacity-90"
          >
            Istruzioni
          </button>

          <button
            onClick={resetApp}
            className="px-3 py-2 rounded-xl bg-white border text-sm shadow-sm hover:bg-neutral-50"
          >
            Nuova Domanda
          </button>
        </div>
      </header>

      {/* Pannello spiegazione */}
      {showExplanation && (
        <ExplanationPanel
          text={explanationText}
          onClose={() => setShowExplanation(false)}
          onBackToCoins={() => {
            setShowExplanation(false);
            setTossCount(0);
            setCoinTossKey((k) => k + 1);
          }}
        />
      )}

      {/* ──────────────────────────────── */}
      {/* Riquadro DOMANDA */}
      {/* ──────────────────────────────── */}
      <div className="rounded-xl border bg-white shadow-sm p-4 space-y-3">
        <label className="text-sm font-medium">
          La tua domanda <span className="text-red-500">*</span>
        </label>

        <input
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
            setValidatedQuestion(null);
            setIsConfirmed(false);
          }}
          placeholder="Scrivi la domanda da porre all'I Ching"
          className="w-full rounded-lg border px-3 py-2 text-sm mt-1 placeholder-gray-400"
        />

        {!validatedQuestion && (
          <button
            onClick={handleValidateQuestion}
            disabled={validating || !question.trim()}
            className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm shadow hover:opacity-90 disabled:opacity-50"
          >
            {validating ? "Analisi in corso..." : "Conferma domanda con l’IA"}
          </button>
        )}

        {validatedQuestion && !isConfirmed && (
          <div className="mt-3 border-t pt-3 text-sm">
            <p><b>Domanda interpretata:</b> {validatedQuestion}</p>
            <p className="text-neutral-500 mt-1">Confermi che è questa la tua domanda?</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setIsConfirmed(true)}
                className="px-3 py-1 rounded-xl bg-green-600 text-white text-sm"
              >
                Sì, confermo
              </button>
              <button
                onClick={() => {
                  setValidatedQuestion(null);
                  setIsConfirmed(false);
                }}
                className="px-3 py-1 rounded-xl bg-gray-400 text-white text-sm"
              >
                No, voglio modificarla
              </button>
            </div>
          </div>
        )}

        {isConfirmed && (
          <p className="mt-2 text-green-700 text-sm">
            ✅ Domanda confermata. Puoi lanciare le monete.
          </p>
        )}
      </div>

      {/* ──────────────────────────────── */}
      {/* Simulatore monete */}
      {/* ──────────────────────────────── */}
      <CoinToss
        key={coinTossKey}
        onComplete={(newLines) => {
          setLines(newLines);
          setTossCount((prev) => prev + 1);
        }}
        disabled={!isConfirmed}
      />

      {/* ──────────────────────────────── */}
      {/* Se c’è interpretazione */}
      {/* ──────────────────────────────── */}
      {interpretazione && (
        <>
          <div className="mt-4 border p-4 rounded bg-gray-50">
            <h2 className="font-bold">Interpretazione</h2>
            <p className="whitespace-pre-line">{interpretazione}</p>
          </div>

          {/* Riquadro principale */}
          <div className="rounded-xl border bg-white shadow-sm p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonna sinistra */}
            <section className="space-y-4">
              {/* Linee manuali */}
              <div>
                <h3 className="text-sm font-semibold">Linee (dal basso all’alto)</h3>
                <div className="space-y-2">
                  {lines.map((v, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <select
                        value={String(v)}
                        onChange={(e) =>
                          setLines((prev) => {
                            const copy = [...prev];
                            copy[i] = Number(e.target.value) as LineValue;
                            return copy;
                          })
                        }
                        className="w-56 rounded-lg border px-2 py-1 text-sm bg-white"
                      >
                        <option value="6">6 — yin vecchio (muta)</option>
                        <option value="7">7 — yang giovane</option>
                        <option value="8">8 — yin giovane</option>
                        <option value="9">9 — yang vecchio (muta)</option>
                      </select>
                      <div className="text-xs text-neutral-500">linea {i + 1}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trigrammi e King Wen */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="rounded-lg border p-2 text-xs">
                  <span className="font-semibold">Trigrammi (primario)</span>
                  <br />
                  Inferiore: {trigramsPrimary.lower.name} {trigramsPrimary.lower.symbol} ·{" "}
                  Superiore: {trigramsPrimary.upper.name} {trigramsPrimary.upper.symbol}
                </div>
                <div className="rounded-lg border p-2 text-xs">
                  <span className="font-semibold">Trigrammi (relazione)</span>
                  <br />
                  Inferiore: {trigramsRelation.lower.name} {trigramsRelation.lower.symbol} ·{" "}
                  Superiore: {trigramsRelation.upper.name} {trigramsRelation.upper.symbol}
                </div>
                <div className="rounded-lg border p-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Linee che mutano</span>
                    <select
                      value={lineMode}
                      onChange={(e) => setLineMode(e.target.value as any)}
                      className="rounded-lg border px-2 py-1 text-sm"
                    >
                      <option value="all">Tutte</option>
                      <option value="first">Solo la prima</option>
                      <option value="last">Solo l’ultima</option>
                    </select>
                  </div>
                  {displayedChanging.length === 0 ? (
                    <p className="text-sm text-neutral-500">(nessuna)</p>
                  ) : (
                    <p className="text-sm">{displayedChanging.join(", ")}</p>
                  )}
                </div>
                <div className="rounded-lg border p-2 font-bold flex flex-col items-center justify-center text-lg">
                  <span className="text-xs font-medium text-neutral-500">King Wen</span>
                  {kw}
                </div>
              </div>
            </section>

            {/* Colonna destra: esagrammi grafici */}
            <div className="space-y-6">
              <section>
                <p className="font-bold">
                  {kw}. {meta?.title} {meta?.hanzi} ({meta?.pinyin})
                </p>
                <HexagramView lines={lines} title="Esagramma primario" />
              </section>
              <section>
                <p className="font-bold">
                  {kwRel}. {metaRel?.title} {metaRel?.hanzi} ({metaRel?.pinyin})
                </p>
                <HexagramView lines={relLines} title="Esagramma di relazione" />
              </section>
            </div>
          </div>

          {/* Testi esagrammi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="rounded-xl border bg-white shadow-sm p-4">
              <h2 className="text-base font-bold">Testo (primario)</h2>
              <p className="font-semibold">
                {kw}. {meta?.title} {meta?.hanzi} ({meta?.pinyin})
              </p>
              {txt?.judgment && (
                <>
                  <h3 className="mt-2 text-sm font-semibold">Giudizio</h3>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{txt.judgment}</p>
                </>
              )}
              {txt?.image && (
                <>
                  <h3 className="mt-4 text-sm font-semibold">Immagine</h3>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{txt.image}</p>
                </>
              )}
            </section>

            <section className="rounded-xl border bg-white shadow-sm p-4">
              <h2 className="text-base font-bold">Testo (di relazione)</h2>
              <p className="font-semibold">
                {kwRel}. {metaRel?.title} {metaRel?.hanzi} ({metaRel?.pinyin})
              </p>
              {txtRel?.judgment && (
                <>
                  <h3 className="mt-2 text-sm font-semibold">Giudizio</h3>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{txtRel.judgment}</p>
                </>
              )}
              {txtRel?.image && (
                <>
                  <h3 className="mt-4 text-sm font-semibold">Immagine</h3>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{txtRel.image}</p>
                </>
              )}
            </section>
          </div>

          {/* Linee mutanti */}
          <section className="rounded-xl border bg-white shadow-sm p-4">
            <h2 className="text-base font-bold">Linee che mutano</h2>
            {displayedChanging.length === 0 ? (
              <p className="text-sm text-neutral-500">(nessuna)</p>
            ) : (
              <ul className="list-disc ml-5 text-sm">
                {displayedChanging.map((n) => {
                  const key = String(n) as keyof HexTextLines;
                  return (
                    <li key={n}>
                      Linea {n}:{" "}
                      <span className="whitespace-pre-wrap">{txt?.lines?.[key]}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Esagrammi correlati */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="rounded-xl border bg-white shadow-sm p-4">
              <h2 className="text-base font-bold">Esagramma nucleare</h2>
              <p className="font-semibold">
                {kwNuclear}. {metaNuc?.title} {metaNuc?.hanzi} ({metaNuc?.pinyin})
              </p>
              {txtNuc?.judgment && (
                <>
                  <h3 className="mt-2 text-sm font-semibold">Giudizio</h3>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{txtNuc.judgment}</p>
                </>
              )}
              {txtNuc?.image && (
                <>
                  <h3 className="mt-4 text-sm font-semibold">Immagine</h3>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{txtNuc.image}</p>
                </>
              )}
            </section>

            <section className="rounded-xl border bg-white shadow-sm p-4">
              <h2 className="text-base font-bold">Esagramma complementare</h2>
              <p className="font-semibold">
                {kwComplementary}. {metaComp?.title} {metaComp?.hanzi} ({metaComp?.pinyin})
              </p>
              {txtComp?.judgment && (
                <>
                  <h3 className="mt-2 text-sm font-semibold">Giudizio</h3>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{txtComp.judgment}</p>
                </>
              )}
              {txtComp?.image && (
                <>
                  <h3 className="mt-4 text-sm font-semibold">Immagine</h3>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{txtComp.image}</p>
                </>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
