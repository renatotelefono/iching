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
    case 6: return 6; // yin vecchio (muta)
    case 7: return 7; // yang giovane
    case 8: return 8; // yin giovane
    case 9: return 9; // yang vecchio (muta)
    default: return 8;
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

  // 🔹 Reset interno quando cambia resetSignal
  useEffect(() => {
    setLines([]);
    setCoins(["Testa", "Testa", "Testa"]);
    setSpinning(false);
  }, [resetSignal]);

  async function startToss() {
    if (lines.length >= 6 || spinning) return;

    setSpinning(true);

    setTimeout(() => {
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
    <div className="p-4 border rounded-lg bg-gray-50 text-center">
      <h2 className="font-bold text-lg mb-2">Simulatore I Ching</h2>

      <button
        onClick={startToss}
        disabled={spinning || lines.length >= 6}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 disabled:opacity-50"
      >
        {lines.length < 6 ? "Lancia le monete" : "Esagramma completato"}
      </button>

      <div className="flex justify-center gap-6 mt-4">
        {coins.map((c, i) => (
          <div
            key={i}
            className={`w-20 h-20 rounded-full flex items-center justify-center ${
              spinning ? "animate-spin" : ""
            }`}
          >
            <Image
              src={c === "Testa" ? "/Testa.png" : "/Croce.png"}
              alt={c}
              width={80}
              height={80}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 text-left font-mono text-sm">
        {lines.slice().reverse().map((line, i) => (
          <div key={i}>
            Linea {lines.length - i}: {line}
          </div>
        ))}
      </div>
    </div>
  );
}
