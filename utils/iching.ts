// utils/iching.ts

// Tipo di linea (6 = yin vecchio, 7 = yang giovane, 8 = yin giovane, 9 = yang vecchio)
export type LineValue = 6 | 7 | 8 | 9;

// Modalità di visualizzazione delle linee mutanti
export type LineMode = "all" | "first" | "last";

// --- Funzioni base ---

export function tossThreeCoins(): LineValue {
  const score = [0, 0, 0]
    .map(() => (Math.random() < 0.5 ? 2 : 3))
    .reduce((a, b) => a + b, 0);
  return score as LineValue;
}

export const isChanging = (v: LineValue) => v === 6 || v === 9;
export const isYang = (v: LineValue) => v === 7 || v === 9;

export function toBits(lines: LineValue[]): number[] {
  return lines.map((v) => (isYang(v) ? 1 : 0));
}

export function mutate(lines: LineValue[]): LineValue[] {
  return lines.map((v) => (v === 6 ? 7 : v === 9 ? 8 : v));
}

// --- Trigrammi / King Wen ---

export function triVal(bits3: number[]): number {
  const rev = [...bits3].reverse();
  return rev[0] + (rev[1] << 1) + (rev[2] << 2);
}

// Tabella King Wen (8×8)
const KW_TABLE: number[][] = [
  [1, 43, 14, 34, 9, 5, 26, 11],
  [10, 58, 38, 54, 61, 60, 41, 19],
  [13, 49, 30, 55, 37, 63, 22, 36],
  [25, 17, 21, 51, 42, 3, 27, 24],
  [44, 28, 50, 32, 57, 48, 18, 46],
  [6, 47, 64, 40, 59, 29, 4, 7],
  [33, 31, 56, 62, 53, 39, 52, 15],
  [12, 45, 35, 16, 20, 8, 23, 2],
];

const tableIndexFromTriVal = (v: number) => 7 - v;

export function kingWenNumber(bits6: number[]): number {
  const lower = triVal([bits6[0], bits6[1], bits6[2]]);
  const upper = triVal([bits6[3], bits6[4], bits6[5]]);
  return KW_TABLE[tableIndexFromTriVal(lower)][tableIndexFromTriVal(upper)];
}

// --- Esagrammi derivati ---

export const complementaryBits = (bits6: number[]) => bits6.map((b) => b ^ 1);

export function nuclearBits(bits6: number[]): number[] {
  const lower3 = [bits6[1], bits6[2], bits6[3]];
  const upper3 = [bits6[2], bits6[3], bits6[4]];
  return [...lower3, ...upper3];
}

// --- Utility nomi trigrammi ---

export function triName(triBits: number[]): string {
  const v = triVal(triBits);
  const names = [
    "☷ Terra (Kun)",
    "☶ Monte (Gen)",
    "☵ Acqua (Kan)",
    "☴ Vento (Xun)",
    "☳ Tuono (Zhen)",
    "☲ Fuoco (Li)",
    "☱ Lago (Dui)",
    "☰ Cielo (Qian)",
  ];
  return names[v] ?? `Trigramma ${v}`;
}
// dizionario trigrammi
const TRIGRAMS: Record<string, { name: string; symbol: string }> = {
  "111": { name: "Cielo (Qián)", symbol: "☰" },
  "000": { name: "Terra (Kūn)", symbol: "☷" },
  "010": { name: "Acqua (Kǎn)", symbol: "☵" },
  "101": { name: "Fuoco (Lí)", symbol: "☲" },
  "100": { name: "Monte (Gèn)", symbol: "☶" },
  "001": { name: "Tuono (Zhèn)", symbol: "☳" },
  "011": { name: "Vento/Legno (Xùn)", symbol: "☴" },
  "110": { name: "Lago (Duì)", symbol: "☱" },
};

export function getTrigrams(bits: number[]) {
  if (bits.length !== 6) {
    throw new Error("I bits devono essere 6 (esagramma)");
  }

  // i trigrammi sono 3 linee ciascuno
  const lower = bits.slice(0, 3).join(""); // linee 1-3 (dal basso)
  const upper = bits.slice(3, 6).join(""); // linee 4-6

  return {
    lower: TRIGRAMS[lower] || { name: "?", symbol: "" },
    upper: TRIGRAMS[upper] || { name: "?", symbol: "" },
  };
}
