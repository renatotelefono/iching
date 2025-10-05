"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import HexagramView from "@/components/HexagramView";
import HEX_META from "@/data/hex_meta";
import { LineValue, toBits, kingWenNumber } from "@/utils/iching";

type Coin = "Testa" | "Croce";

// ─────────────────────────────────────────────
// Funzioni di utilità
// ─────────────────────────────────────────────
function tossCoin(): Coin {
  return Math.random() < 0.5 ? "Testa" : "Croce";
}

function calcLine(values: Coin[]): LineValue {
  const sum = values.reduce((s, v) => s + (v === "Testa" ? 3 : 2), 0);
  switch (sum) {
    case 6: return 6;
    case 7: return 7;
    case 8: return 8;
    case 9: return 9;
    default: return 8;
  }
}

function renderLineLabel(value: LineValue): string {
  switch (value) {
    case 6: return "6 — yin vecchio (muta)";
    case 7: return "7 — yang giovane";
    case 8: return "8 — yin giovane";
    case 9: return "9 — yang vecchio (muta)";
    default: return "";
  }
}

// ─────────────────────────────────────────────
// Componente principale
// ─────────────────────────────────────────────
export default function CoinToss({
  onComplete,
  resetSignal,
  disabled,
}: {
  onComplete: (lines: LineValue[]) => void;
  resetSignal?: number;
  disabled?: boolean;
}) {
  const [lines, setLines] = useState<LineValue[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [coins, setCoins] = useState<Coin[]>(["Testa", "Testa", "Testa"]);
  const [rotations, setRotations] = useState<number[]>([0, 0, 0]);
  const [showLabels, setShowLabels] = useState(true);
  const [pendingLine, setPendingLine] = useState<LineValue | null>(null);

  // 🔁 Reset completo quando cambia resetSignal
  useEffect(() => {
    setLines([]);
    setCoins(["Testa", "Testa", "Testa"]);
    setSpinning(false);
    setRotations([0, 0, 0]);
    setShowLabels(true);
    setPendingLine(null);
  }, [resetSignal]);

  // 🎲 Funzione di lancio monete
  async function startToss() {
    if (disabled || spinning || lines.length >= 6) return;

    setSpinning(true);
    setShowLabels(false);

    // animazione rotazione continua
    const interval = setInterval(() => {
      setCoins([tossCoin(), tossCoin(), tossCoin()]);
      setRotations((r) => r.map((val) => val + 360));
    }, 150);

    // ferma animazione e calcola il risultato
    setTimeout(() => {
      clearInterval(interval);

      const results: Coin[] = [tossCoin(), tossCoin(), tossCoin()];
      setCoins(results);
      setRotations((r) =>
        r.map((val, i) => val + (results[i] === "Testa" ? 0 : 180))
      );

      const line = calcLine(results);
      setPendingLine(line);
      setSpinning(false);
    }, 600);
  }

  // 🔹 Aggiorna linee dopo l’animazione
  function handleAnimationEnd(i: number) {
    if (i !== coins.length - 1) return;
    setShowLabels(true);

    if (pendingLine !== null) {
      const newLines = [...lines, pendingLine];
      setLines(newLines);
      setPendingLine(null);

      if (newLines.length === 6) {
        onComplete(newLines);
      }
    }
  }

  // 🔸 Esagramma finale se completo
  const isComplete = lines.length === 6;
  const bits = isComplete ? toBits(lines) : null;
  const kw = bits ? kingWenNumber(bits) : null;
  const meta = kw ? HEX_META[kw] : null;

  // ─────────────────────────────────────────────
  // Rendering
  // ─────────────────────────────────────────────
  return (
    <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
      <h2 className="font-bold text-lg mb-3 text-center">Consultazione I Ching</h2>

      {/* Bottone principale */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={startToss}
          disabled={disabled || spinning || lines.length >= 6}
          className="px-5 py-2 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700 disabled:opacity-50"
        >
          {disabled
            ? "Conferma prima la domanda"
            : spinning
            ? "Lancio in corso..."
            : lines.length < 6
            ? "Lancia le monete"
            : "Hai completato i 6 lanci"}
        </button>

        {/* Monete */}
        <div className="border rounded-lg shadow-sm bg-white p-4 flex justify-center gap-6 flex-wrap">
          {coins.map((c, i) => (
            <div
              key={i}
              className="w-20 h-24 flex flex-col items-center justify-start perspective-1000"
            >
              <div
                className="w-20 h-20"
                style={{
                  transition: "transform 0.5s cubic-bezier(0.5, 0, 1, 1)",
                  transform: `rotateY(${rotations[i]}deg)`,
                }}
                onTransitionEnd={() => handleAnimationEnd(i)}
              >
                <Image
                  src={c === "Testa" ? "/Testa.png" : "/Croce.png"}
                  alt={c}
                  width={80}
                  height={80}
                />
              </div>
              {showLabels && (
                <span className="mt-2 text-xl font-bold font-[Verdana]">{c}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Linee e risultato */}
      <div className="flex justify-center mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full items-start">
          {/* Lista linee */}
          <div className="border rounded-lg shadow-sm bg-white p-2 text-left font-mono text-sm">
            <p className="font-bold mb-2">Linee (dal basso all’alto)</p>
            <div className="border rounded-lg p-2 bg-gray-50">
              {Array.from({ length: 6 }, (_, idx) => {
                const lineValue = lines[idx];
                const lineNumber = idx + 1;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between mb-1 px-2 py-1 border rounded-md bg-white"
                  >
                    <span>
                      {lineValue !== undefined ? renderLineLabel(lineValue) : ""}
                    </span>
                    <span className="text-gray-500">. {lineNumber}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Esagramma finale */}
          {isComplete && kw && meta && (
            <div className="border rounded-lg shadow-sm bg-white p-2">
              <p className="font-bold mb-2 text-center">
                {kw}. {meta.title} {meta.hanzi} ({meta.pinyin})
              </p>
              <HexagramView lines={lines} title="Esagramma primario" />
            </div>
          )}
        </div>
      </div>

      {/* Stato utente */}
      {!isComplete && (
        <p className="text-center text-sm text-gray-500 mt-4">
          {disabled
            ? "⚠️ Devi prima confermare la domanda per poter lanciare le monete."
            : lines.length === 0
            ? "Premi 'Lancia le monete' per iniziare."
            : `Linea ${lines.length + 1} di 6 in preparazione...`}
        </p>
      )}
    </div>
  );
}
