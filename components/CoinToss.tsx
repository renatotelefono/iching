"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type LineValue = 6 | 7 | 8 | 9;

function tossCoin(): "Testa" | "Croce" {
  return Math.random() < 0.5 ? "Testa" : "Croce";
}

function calcLine(values: ("Testa" | "Croce")[]): LineValue {
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
  const [coins, setCoins] = useState<("Testa" | "Croce")[]>(["Testa", "Testa", "Testa"]);

  useEffect(() => {
    setLines([]);
    setCoins(["Testa", "Testa", "Testa"]);
    setSpinning(false);
  }, [resetSignal]);

  async function startToss() {
    if (lines.length >= 6 || spinning) return;

    setSpinning(true);

    const interval = setInterval(() => {
      setCoins([
        Math.random() < 0.5 ? "Testa" : "Croce",
        Math.random() < 0.5 ? "Testa" : "Croce",
        Math.random() < 0.5 ? "Testa" : "Croce",
      ]);
    }, 150);

    setTimeout(() => {
      clearInterval(interval);

      const results: ("Testa" | "Croce")[] = [tossCoin(), tossCoin(), tossCoin()];
      setCoins(results);

      const line = calcLine(results);
      const newLines = [...lines, line];
      setLines(newLines);
      setSpinning(false);

      if (newLines.length === 6) {
        onComplete(newLines);
      }
    }, 1500);
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h2 className="font-bold text-lg mb-2 text-center">Simulatore I Ching</h2>

      <button
        onClick={startToss}
        disabled={spinning || lines.length >= 6}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 disabled:opacity-50 w-full"
      >
        {lines.length < 6 ? "Lancia le monete" : "Esagramma completato"}
      </button>

      {/* Layout a due colonne: linee a sinistra, monete a destra */}
      <div className="flex justify-center items-start gap-8 mt-6">
        
        {/* Colonna linee */}
<div className="text-left font-mono text-sm">
  <p className="font-bold mb-2">Linee (dal basso all’alto)</p>
  <div className="border rounded-lg p-2 bg-white shadow-sm">
    {Array.from({ length: 6 }, (_, idx) => {
      const lineValue = lines[idx];
      const lineNumber = idx + 1;
      return (
        <div
          key={idx}
          className="flex items-center justify-between mb-1 px-2 py-1 border rounded-md bg-gray-50"
        >
          <span>
            {lineValue !== undefined ? renderLineLabel(lineValue) : ""}
          </span>
          <span className="text-gray-500">linea {lineNumber}</span>
        </div>
      );
    })}
  </div>
</div>


        {/* Colonna monete */}
        <div className="flex justify-center gap-6">
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
              <span className="mt-2 text-sm font-medium">{c}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
