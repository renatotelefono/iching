"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import HexagramView from "@/components/HexagramView";
import HEX_META from "@/data/hex_meta";
import { LineValue, toBits, kingWenNumber } from "@/utils/iching";

type Coin = "Testa" | "Croce";

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

export default function CoinToss({
  onComplete,
  resetSignal,
}: {
  onComplete: (lines: LineValue[]) => void;
  resetSignal?: number;
}) {
  const [lines, setLines] = useState<LineValue[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [coins, setCoins] = useState<Coin[]>(["Testa", "Testa", "Testa"]);

  useEffect(() => {
    setLines([]);
    setCoins(["Testa", "Testa", "Testa"]);
    setSpinning(false);
  }, [resetSignal]);

  async function startToss() {
    if (lines.length >= 6 || spinning) return;

    setSpinning(true);

    const interval = setInterval(() => {
      setCoins([tossCoin(), tossCoin(), tossCoin()]);
    }, 300);

    setTimeout(() => {
      clearInterval(interval);

      const results: Coin[] = [tossCoin(), tossCoin(), tossCoin()];
      setCoins(results);

      const line = calcLine(results);
      const newLines = [...lines, line];
      setLines(newLines);
      setSpinning(false);

      if (newLines.length === 6) {
        onComplete(newLines);
      }
    }, 500);
  }

  // Calcola numero e nome esagramma se completo
  const isComplete = lines.length === 6;
  const bits = isComplete ? toBits(lines) : null;
  const kw = bits ? kingWenNumber(bits) : null;
  const meta = kw ? HEX_META[kw] : null;

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h2 className="font-bold text-lg mb-2 text-center">Simulatore I Ching</h2>

      {/* PRIMA RIGA: bottone + monete */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={startToss}
          disabled={spinning || lines.length >= 6}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 disabled:opacity-50"
        >
          {lines.length < 6 ? "Lancia le monete" : "Esagramma completato"}
        </button>

        <div className="border rounded-lg shadow-sm bg-white p-4 flex justify-center gap-6 flex-wrap">
          {coins.map((c, i) => (
            <div
              key={i}
              className="w-20 h-24 flex flex-col items-center justify-start"
            >
              <Image
                src={c === "Testa" ? "/Testa.png" : "/Croce.png"}
                alt={c}
                width={80}
                height={80}
              />
              <span className="mt-2 text-xl font-bold font-[Verdana]">{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SECONDA RIGA: linee + esagramma centrati */}
      <div className="flex justify-center mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full items-start">
          {/* Colonna linee */}
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
                    <span className="text-gray-500">Lancio numero {lineNumber}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Colonna esagramma */}
          {isComplete && kw && meta && (
            <div className="border rounded-lg shadow-sm bg-white p-2">
              <p className="font-bold mb-2 text-center">
                {kw}. {meta.title} {meta.hanzi} ({meta.pinyin})
              </p>
              <HexagramView lines={lines} title="Esagramma" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
