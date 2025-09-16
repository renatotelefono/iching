/* eslint-disable react/no-unescaped-entities */
"use client";


import React, { useMemo, useState } from "react";
import HEX_TEXT_IT from "@/data/hexagrams.it.json";

/**
 * Next.js (App Router) – I Ching Reader – Pagina unica (app/page.tsx)
 * -------------------------------------------------------------------
 * - UI in italiano
 * - Metodo 3 monete (6 linee dal basso all’alto)
 * - Evidenzia linee che mutano (6/9) e calcola esagramma di relazione
 * - Trigrammi inferiore/superiore
 * - Numero KING WEN integrato via tabella 8×8 (lookup standard)
 * - Testi importati da /data/hexagrams.it.json (pubblico dominio + parafrasi)
 * - Opzioni di lettura: mostra tutte le linee mutanti / solo prima / solo ultima
 * - Calcolo Esagramma Nucleare e Complementare (scheda informativa)
 */

type LineValue = 6 | 7 | 8 | 9;
// Tipo per la preferenza di visualizzazione delle linee mutanti
type LineMode = "all" | "first" | "last";

function tossThreeCoins(): LineValue {
  const score = [0, 0, 0]
    .map(() => (Math.random() < 0.5 ? 2 : 3))
    .reduce((a, b) => a + b, 0);
  return score as LineValue; // 6,7,8,9
}

const isChanging = (v: LineValue) => v === 6 || v === 9;
const isYang = (v: LineValue) => v === 7 || v === 9; // per l’esagramma primario

function toBits(lines: LineValue[]): number[] {
  return lines.map((v) => (isYang(v) ? 1 : 0));
}

function mutate(lines: LineValue[]): LineValue[] {
  return lines.map((v) => (v === 6 ? 7 : v === 9 ? 8 : v));
}

function triVal(bits3: number[]): number {
  const rev = [...bits3].reverse(); // linea alta diventa indice 0
  return rev[0] + (rev[1] << 1) + (rev[2] << 2);
}



// Tabella King Wen 8×8 – righe=trigramma inferiore, colonne=trigramma superiore
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
function kingWenNumber(bits6: number[]): number {
  const lower = triVal([bits6[0], bits6[1], bits6[2]]);
  const upper = triVal([bits6[3], bits6[4], bits6[5]]);
  return KW_TABLE[tableIndexFromTriVal(lower)][tableIndexFromTriVal(upper)];
}



// Complementare: inversione yin/yang su tutte le 6 linee
const complementaryBits = (bits6: number[]) => bits6.map((b) => b ^ 1);

// Nucleare (Hu Gua): trigramma inferiore = linee 2–4; trigramma superiore = linee 3–5
function nuclearBits(bits6: number[]): number[] {
  const lower3 = [bits6[1], bits6[2], bits6[3]];
  const upper3 = [bits6[2], bits6[3], bits6[4]];
  return [...lower3, ...upper3];
}

// Metadati concisi – titoli + pinyin (per intestazioni)
const HEX_META: Record<number, { title: string; hanzi: string; pinyin: string }> = {
  1: { title: "Il Creativo", hanzi: "乾", pinyin: "Qián" },
  2: { title: "Il Ricettivo", hanzi: "坤", pinyin: "Kūn" },
  3: { title: "Difficoltà iniziale", hanzi: "屯", pinyin: "Zhūn" },
  4: { title: "L’Inesperienza", hanzi: "蒙", pinyin: "Méng" },
  5: { title: "L’Attesa", hanzi: "需", pinyin: "Xū" },
  6: { title: "Il Conflitto", hanzi: "訟", pinyin: "Sòng" },
  7: { title: "L’Esercito", hanzi: "師", pinyin: "Shī" },
  8: { title: "Tenersi uniti", hanzi: "比", pinyin: "Bǐ" },
  9: { title: "La Forza del piccolo", hanzi: "小畜", pinyin: "Xiǎo Xù" },
  10: { title: "Il Procedere", hanzi: "履", pinyin: "Lǚ" },
  11: { title: "La Pace", hanzi: "泰", pinyin: "Tài" },
  12: { title: "Il Ristagno", hanzi: "否", pinyin: "Pǐ" },
  // ... opzionale completare ulteriormente
} as const;

type HexTextLines = Partial<Record<"1" | "2" | "3" | "4" | "5" | "6", string>>;

type HexText = {
  title?: string;
  judgment?: string;
  image?: string;
  lines?: HexTextLines;
  notes?: string;
};

function getHexText(kw: number): HexText | null {
  // Il JSON importato è Record<string, HexText>
  const rec = (HEX_TEXT_IT as Record<string, HexText>)[String(kw)];
  return rec ?? null;
}

function LineGraphic({ yang, changing }: { yang: boolean; changing: boolean }) {
  return (
    <div className="flex-1 h-3 relative">
      {yang ? (
        <div className={`h-full rounded bg-neutral-900/90 ${changing ? "animate-pulse" : ""}`} />
      ) : (
        <div className="h-full flex items-center justify-between">
          <div className={`h-1.5 w-2/5 rounded bg-neutral-900/90 ${changing ? "animate-pulse" : ""}`} />
          <div className="h-1.5 w-6" />
          <div className={`h-1.5 w-2/5 rounded bg-neutral-900/90 ${changing ? "animate-pulse" : ""}`} />
        </div>
      )}
    </div>
  );
}

function HexagramView({ lines, title }: { lines: LineValue[]; title: string }) {
  return (
    <div className="w-full rounded-2xl border bg-white shadow-sm">
      <div className="px-4 py-3 border-b">
        <div className="text-base font-semibold">{title}</div>
      </div>
      <div className="p-4 space-y-2 flex flex-col">
        {[...lines].reverse().map((v, idx) => {
          const yang = isYang(v);
          const changing = isChanging(v);
          const lineNumber = lines.length - idx; // linea 6 in alto → linea 1 in basso
          return (
            <div key={idx} className="flex items-center gap-3">
              <LineGraphic yang={yang} changing={changing} />
              <div className="w-24 text-xs text-right text-neutral-500">
                linea {lineNumber} {changing ? "(muta)" : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}




export default function Page() {
  const [question, setQuestion] = useState("");
  const [lines, setLines] = useState<LineValue[]>([7, 8, 7, 8, 7, 8]);
  const [lineMode, setLineMode] = useState<LineMode>("all");

  const bits = useMemo(() => toBits(lines), [lines]);
  const relLines = useMemo(() => mutate(lines), [lines]);
  const relBits = useMemo(() => toBits(relLines), [relLines]);

  const lowerTri = bits.slice(0, 3);
  const upperTri = bits.slice(3, 6);
  const lowerTriRel = relBits.slice(0, 3);
  const upperTriRel = relBits.slice(3, 6);

  const kw = kingWenNumber(bits);
  const kwRel = kingWenNumber(relBits);

  const bitsNuclear = nuclearBits(bits);
  const kwNuclear = kingWenNumber(bitsNuclear);
  const bitsComplementary = complementaryBits(bits);
  const kwComplementary = kingWenNumber(bitsComplementary);

  const changing = lines
    .map((v, i) => (isChanging(v) ? i + 1 : null))
    .filter(Boolean) as number[];

  const displayedChanging = (() => {
    if (changing.length === 0) return [] as number[];
    if (lineMode === "first") return [changing[0]];
    if (lineMode === "last") return [changing[changing.length - 1]];
    return changing;
  })();

  function randomizeAll() {
    setLines(Array.from({ length: 6 }, () => tossThreeCoins()));
  }
  function setAllYin() {
    setLines([8, 8, 8, 8, 8, 8]);
  }

  function setLine(idx: number, v: LineValue) {
    setLines((prev) => {
      const copy = [...prev];
      copy[idx] = v;
      return copy;
    });
  }

function buildMeta(kw: number): { title: string; hanzi: string; pinyin: string } {
  if (HEX_META[kw]) return HEX_META[kw];

  const rec = (HEX_TEXT_IT as Record<string, HexText>)[String(kw)];
  if (rec?.title) {
    // rimuove il numero iniziale e il punto, se presenti (es. "34. Ta Chuang..." → "Ta Chuang...")
    const cleanTitle = rec.title.replace(/^\d+\.\s*/, "");
    return { title: cleanTitle, hanzi: "", pinyin: "" };
  }

  return { title: `Esagramma ${kw}`, hanzi: "", pinyin: "" };
}


const meta = buildMeta(kw);
const metaRel = buildMeta(kwRel);
const metaNuc = buildMeta(kwNuclear);
const metaComp = buildMeta(kwComplementary);

const txt = getHexText(kw);
const txtRel = getHexText(kwRel);
const txtNuc = getHexText(kwNuclear);
const txtComp = getHexText(kwComplementary);

 

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Lettura dell’I Ching</h1>
        <div className="flex gap-2">
          <button onClick={randomizeAll} className="px-3 py-2 rounded-xl bg-neutral-900 text-white text-sm shadow hover:opacity-90">Lancia 3 monete × 6</button>
          <button onClick={setAllYin} className="px-3 py-2 rounded-xl bg-white border text-sm shadow-sm hover:bg-neutral-50">Azzera (tutte yin)</button>
        </div>
      </header>

      <section className="rounded-2xl border bg-white shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Domanda (facoltativa)</label>
            <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Scrivi la tua intenzione/domanda…" className="w-full rounded-xl border px-3 py-2 text-sm" />

            <div className="pt-2 text-sm font-medium">Linee (dal basso all’alto)</div>
            <div className="space-y-2">
              {lines.map((v, i) => (
                <div key={i} className="flex items-center gap-3">
                  <select value={String(v)} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLine(i, Number(e.target.value) as LineValue)} className="w-56 rounded-xl border px-2 py-1.5 text-sm bg-white">
                    <option value="6">6 — yin vecchio (muta)</option>
                    <option value="7">7 — yang giovane</option>
                    <option value="8">8 — yin giovane</option>
                    <option value="9">9 — yang vecchio (muta)</option>
                  </select>
                  <div className="text-xs text-neutral-500">linea {i + 1}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 text-sm">
              <div className="rounded-xl border p-3">
                <div className="uppercase text-[11px] tracking-wide text-neutral-500">Trigrammi (primario)</div>
                <div>Inferiore: {triName(lowerTri)} · Superiore: {triName(upperTri)}</div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="uppercase text-[11px] tracking-wide text-neutral-500">Trigrammi (relazione)</div>
                <div>Inferiore: {triName(lowerTriRel)} · Superiore: {triName(upperTriRel)}</div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="uppercase text-[11px] tracking-wide text-neutral-500">Linee che mutano</div>
                <div>{changing.length ? changing.join(", ") : "(nessuna)"}</div>
                <div className="mt-2 flex items-center gap-2">
                  <label className="text-[11px] uppercase tracking-wide text-neutral-500">Mostra</label>
                  <select value={lineMode} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLineMode(e.target.value as LineMode)} className="rounded-lg border px-2 py-1 text-xs">
                    <option value="all">tutte</option>
                    <option value="first">solo la prima</option>
                    <option value="last">solo l’ultima</option>
                  </select>
                </div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="uppercase text-[11px] tracking-wide text-neutral-500">King Wen</div>
                <div className="text-xl font-semibold">{kw}</div>
              </div>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <HexagramView lines={lines} title="Esagramma primario" />
            <HexagramView lines={relLines} title="Esagramma di relazione" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-white shadow-sm p-4">
          <div className="text-sm font-semibold">Testo (primario)</div>
          <div className="mt-2 text-sm space-y-2">
            <div className="font-bold">{kw}. {meta.title} {meta.hanzi && <span className="text-neutral-500">{meta.hanzi} ({meta.pinyin})</span>}</div>
            {txt?.judgment && (
              <div>
                <div className="text-[11px] uppercase tracking-wide text-neutral-500">Giudizio</div>
                <p className="mt-1">{txt.judgment}</p>
              </div>
            )}
            {txt?.image && (
              <div>
                <div className="text-[11px] uppercase tracking-wide text-neutral-500">Immagine</div>
                <p className="mt-1">{txt.image}</p>
              </div>
            )}
            {question && (
              <p className="mt-1 text-neutral-600"><span className="font-medium">Domanda:</span> {question}</p>
            )}
            {!!displayedChanging.length && (
              <div className="pt-2">
                <div className="text-[11px] uppercase tracking-wide text-neutral-500">Linee secondo preferenza</div>
                <div className="mt-1 space-y-1">
                  {displayedChanging.map((n) => {
                    const k = String(n) as keyof HexTextLines;
                    const t = txt?.lines?.[k];
                    return (
                      <div key={n} className="rounded-lg border p-2">
                        <div className="text-xs font-medium">Linea {n}</div>
                        <div className="text-sm mt-0.5">{t || "(nessun testo inserito per questa linea)"} </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="rounded-2xl border bg-white shadow-sm p-4">
          <div className="text-sm font-semibold">Testo (di relazione)</div>
          <div className="mt-2 text-sm space-y-2">
            <div className="font-bold">{kwRel}. {metaRel.title} {metaRel.hanzi && <span className="text-neutral-500">{metaRel.hanzi} ({metaRel.pinyin})</span>}</div>
            {txtRel?.judgment && (
              <div>
                <div className="text-[11px] uppercase tracking-wide text-neutral-500">Giudizio</div>
                <p className="mt-1">{txtRel.judgment}</p>
              </div>
            )}
            {txtRel?.image && (
              <div>
                <div className="text-[11px] uppercase tracking-wide text-neutral-500">Immagine</div>
                <p className="mt-1">{txtRel.image}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-white shadow-sm p-4">
          <div className="text-sm font-semibold">Esagrammi correlati</div>
          <div className="mt-2 text-sm space-y-3">
            <div className="rounded-xl border p-3">
              <div className="text-xs uppercase tracking-wide text-neutral-500">Nucleare</div>
              <div className="font-semibold">{kwNuclear}. {metaNuc.title}</div>
              {txtNuc?.judgment && <p className="mt-1 text-neutral-700">{txtNuc.judgment}</p>}
            </div>
            <div className="rounded-xl border p-3">
              <div className="text-xs uppercase tracking-wide text-neutral-500">Complementare</div>
              <div className="font-semibold">{kwComplementary}. {metaComp.title}</div>
              {txtComp?.judgment && <p className="mt-1 text-neutral-700">{txtComp.judgment}</p>}
            </div>
          </div>
        </div>
        <div className="rounded-2xl border bg-white shadow-sm p-4">
          <div className="text-sm font-semibold">Note tecniche / contenuti</div>
          <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
            <li>I testi sono importati da <code>/data/hexagrams.it.json</code> (parafrasi + pubblico dominio).</li>
            <li>Per aggiornare, modifica quel file senza toccare il codice.</li>
            <li>Le linee visualizzate dipendono dalla preferenza scelta (tutte/prima/ultima).</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

function triName(triBits: number[]): string {
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
