"use client";

import React, { useMemo, useState } from "react";

/**
 * Next.js (App Router) – I Ching Reader – Pagina unica (app/page.tsx)
 * -------------------------------------------------------------------
 * - UI in italiano
 * - Metodo 3 monete (6 linee dal basso all'alto)
 * - Evidenzia linee che mutano (6/9) e calcola esagramma di relazione
 * - Trigrammi inferiore/superiore
 * - Numero KING WEN integrato via tabella 8×8 (fonte: tabella di lookup Wikipedia)
 * - Nomi IT + micro-sommari originali per tutti i 64 esagrammi (breve, non derivati da traduzioni coperte da copyright)
 *
 * Istruzioni veloci
 * 1) Crea un progetto Next.js + Tailwind (o usa un progetto esistente)
 * 2) Salva questo file come app/page.tsx
 * 3) Assicurati di avere Tailwind attivo (npx create-next-app -e with-tailwind)
 * 4) Avvia: npm run dev
 *
 * Facoltativo: aggiungi un layout minimale (app/layout.tsx) se non già presente:
 * -------------------------------------------------------------
 * export const metadata = { title: "Lettura I Ching" };
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html lang="it">
 *       <body className="min-h-dvh bg-neutral-50 text-neutral-900 antialiased">{children}</body>
 *     </html>
 *   );
 * }
 */

// Tipi di linea (3 monete): 6 yin vecchio (muta), 7 yang giovane, 8 yin giovane, 9 yang vecchio (muta)
type LineValue = 6 | 7 | 8 | 9;

function tossThreeCoins(): LineValue {
  const score = [0, 0, 0]
    .map(() => (Math.random() < 0.5 ? 2 : 3)) // 2 = yin (croce), 3 = yang (testa)
    .reduce((a, b) => a + b, 0);
  return score as LineValue; // 6,7,8,9
}

const isChanging = (v: LineValue) => v === 6 || v === 9;
const isYang = (v: LineValue) => v === 7 || v === 9; // per l'esagramma primario

// Converte le 6 linee (dal basso all'alto) in bit (yin=0, yang=1)
function toBits(lines: LineValue[]): number[] {
  return lines.map((v) => (isYang(v) ? 1 : 0));
}

// Applica mutazioni: 6→7 (yin→yang) e 9→8 (yang→yin)
function mutate(lines: LineValue[]): LineValue[] {
  return lines.map((v) => (v === 6 ? 7 : v === 9 ? 8 : v));
}

// Converte 3 bit (trigramma dal basso all'alto) in valore decimale Fu Xi (0..7)
function triVal(bits3: number[]): number {
  // bit0 = linea più bassa, bit2 = linea più alta del trigramma
  return bits3[0] + (bits3[1] << 1) + (bits3[2] << 2);
}

// Tabella King Wen 8×8 – righe=trigramma inferiore, colonne=trigramma superiore
// Ordine delle intestazioni (righe e colonne): [☰, ☱, ☲, ☳, ☴, ☵, ☶, ☷]
// Numeri presi dalla tabella di lookup pubblica (Heaven/Lake/Fire/Thunder/Wind/Water/Mountain/Earth)
const KW_TABLE: number[][] = [
  /* lower ☰ */ [1, 43, 14, 34, 9, 5, 26, 11],
  /* lower ☱ */ [10, 58, 38, 54, 61, 60, 41, 19],
  /* lower ☲ */ [13, 49, 30, 55, 37, 63, 22, 36],
  /* lower ☳ */ [25, 17, 21, 51, 42, 3, 27, 24],
  /* lower ☴ */ [44, 28, 50, 32, 57, 48, 18, 46],
  /* lower ☵ */ [6, 47, 64, 40, 59, 29, 4, 7],
  /* lower ☶ */ [33, 31, 56, 62, 53, 39, 52, 15],
  /* lower ☷ */ [12, 45, 35, 16, 20, 8, 23, 2],
];

// Mappa da valore Fu Xi (0..7) all'indice di tabella (0..7) secondo l'ordine [☰, ☱, ☲, ☳, ☴, ☵, ☶, ☷]
// Con binari 111=7 (☰) ... 000=0 (☷), l'indice tabellare = 7 - triVal
const tableIndexFromTriVal = (v: number) => 7 - v;

function kingWenNumber(bits6: number[]): number {
  const lower = triVal(bits6.slice(0, 3));
  const upper = triVal(bits6.slice(3, 6));
  const r = tableIndexFromTriVal(lower);
  const c = tableIndexFromTriVal(upper);
  return KW_TABLE[r][c];
}

// Nomi IT + riassunti ultrabrevi (64) – originali e sintetici
// chiave = numero King Wen (1..64)
const HEX_META: Record<number, { title: string; hanzi: string; pinyin: string; summary: string }> = {
  1: { title: "Il Creativo", hanzi: "乾", pinyin: "Qián", summary: "Forza originaria, iniziativa lucida, procedi con rettitudine." },
  2: { title: "Il Ricettivo", hanzi: "坤", pinyin: "Kūn", summary: "Ricettività fertile: segui, nutri, dai forma con costanza umile." },
  3: { title: "Difficoltà iniziale", hanzi: "屯", pinyin: "Zhūn", summary: "Inizio caotico: organizza, chiedi aiuto, persevera con pazienza." },
  4: { title: "L'Inesperienza", hanzi: "蒙", pinyin: "Méng", summary: "Ignoranza da educare: disciplina, imparare, evitare precipitazione." },
  5: { title: "L'Attesa", hanzi: "需", pinyin: "Xū", summary: "Attendere nel giusto luogo: preparati, confida nel tempo giusto." },
  6: { title: "Il Conflitto", hanzi: "訟", pinyin: "Sòng", summary: "Divergenza di interessi: chiarisci, evita liti sterili, misura i passi." },
  7: { title: "L'Esercito", hanzi: "師", pinyin: "Shī", summary: "Coordinare molti: leadership sobria, disciplina, obiettivo comune." },
  8: { title: "Tenersi uniti", hanzi: "比", pinyin: "Bǐ", summary: "Coesione: scegli alleanze sincere, fedeltà, centratura etica." },
  9: { title: "La Forza del piccolo", hanzi: "小畜", pinyin: "Xiǎo Xù", summary: "Piccola accumulazione: trattieni, cura i dettagli, non forzare." },
 10: { title: "Il Procedere", hanzi: "履", pinyin: "Lǚ", summary: "Camminare su terreno delicato: rispetto, misura, buone maniere." },
 11: { title: "La Pace", hanzi: "泰", pinyin: "Tài", summary: "Scambio armonioso cielo-terra: prosperità, apertura, equilibrio." },
 12: { title: "Il Ristagno", hanzi: "否", pinyin: "Pǐ", summary: "Blocchi e chiusure: ritirati un poco, purifica, mantieni integrità." },
 13: { title: "La Comunità", hanzi: "同人", pinyin: "Tóng Rén", summary: "Unirsi tra pari: trasparenza, obiettivo condiviso, fiducia reciproca." },
 14: { title: "Grande Possesso", hanzi: "大有", pinyin: "Dà Yǒu", summary: "Abbondanza matura: usa bene le risorse, generosità e misura." },
 15: { title: "La Modestia", hanzi: "謙", pinyin: "Qiān", summary: "Forza quieta: riduci gli eccessi, semplicità che apre le porte." },
 16: { title: "L'Entusiasmo", hanzi: "豫", pinyin: "Yù", summary: "Preparare e motivare: ritmo, musica interiore, guida ispirante." },
 17: { title: "Il Seguire", hanzi: "隨", pinyin: "Suí", summary: "Seguire il corso: adattabilità, evitare protagonismo, fedeltà al vero." },
 18: { title: "Correggere", hanzi: "蠱", pinyin: "Gǔ", summary: "Riparare il rovinato: igiene morale, rimediare a vecchie colpe." },
 19: { title: "L'Avvicinarsi", hanzi: "臨", pinyin: "Lín", summary: "Avvicinarsi con benevolenza: preparare il terreno, responsabilità." },
 20: { title: "La Contemplazione", hanzi: "觀", pinyin: "Guān", summary: "Guardare dall'alto: esempio morale, chiarire la visione, educare." },
 21: { title: "Mordere attraverso", hanzi: "噬嗑", pinyin: "Shì Kè", summary: "Rimuovere gli ostacoli: decisione, sanzione giusta, franchezza." },
 22: { title: "La Grazia", hanzi: "賁", pinyin: "Bì", summary: "Forma e bellezza: cura l'essenziale, evitare l'apparenza vuota." },
 23: { title: "Lo Sgretolamento", hanzi: "剝", pinyin: "Bō", summary: "Decadimento: elimina il superfluo, proteggi il nucleo, ritira." },
 24: { title: "Il Ritorno", hanzi: "復", pinyin: "Fù", summary: "Ritorno al centro: nuovo ciclo, piccolo movimento favorevole." },
 25: { title: "L'Innocenza", hanzi: "無妄", pinyin: "Wú Wàng", summary: "Semplicità fiduciosa: agisci senza secondi fini, rettitudine." },
 26: { title: "Grande Accumulare", hanzi: "大畜", pinyin: "Dà Xù", summary: "Frenare e coltivare: accumula virtù e forza, cura interiore." },
 27: { title: "Il Nutrimento", hanzi: "頤", pinyin: "Yí", summary: "Come e cosa nutri: parole e cibo giusti, coerenza quotidiana." },
 28: { title: "Grande Preponderanza", hanzi: "大過", pinyin: "Dà Guò", summary: "Sovraccarico: sostieni la trave, agisci presto, evita rotture." },
 29: { title: "L'Abissale (Acqua)", hanzi: "坎", pinyin: "Kǎn", summary: "Pericolo ricorrente: tenacia elastica, verità, navigare al centro." },
 30: { title: "L'Aderente (Fuoco)", hanzi: "離", pinyin: "Lí", summary: "Chiarezza che aderisce: illumina con misura, attaccarsi al vero." },
 31: { title: "Influenza reciproca", hanzi: "咸", pinyin: "Xián", summary: "Tocco sottile: attrazione sincera, rispetto, piccole iniziative." },
 32: { title: "La Durata", hanzi: "恆", pinyin: "Héng", summary: "Costanza creativa: persevera nel giusto, evita rigidità cieca." },
 33: { title: "La Ritirata", hanzi: "遯", pinyin: "Dùn", summary: "Arretrare per forza maggiore: dignità, prepara il ritorno." },
 34: { title: "La Grande Forza", hanzi: "大壯", pinyin: "Dà Zhuàng", summary: "Potenza in ascesa: usa forza con etica, non travolgere." },
 35: { title: "Il Progresso", hanzi: "晉", pinyin: "Jìn", summary: "Avanzare alla luce: merito riconosciuto, gratitudine, chiarezza." },
 36: { title: "Oscuramento della luce", hanzi: "明夷", pinyin: "Míng Yí", summary: "Luce ferita: proteggi l'interiore, agisci discretamente." },
 37: { title: "La Famiglia", hanzi: "家人", pinyin: "Jiā Rén", summary: "Ordine domestico: ruoli chiari, calore, responsabilità reciproca." },
 38: { title: "L'Opposizione", hanzi: "睽", pinyin: "Kuí", summary: "Divergenza di vedute: accordi parziali, autonomia rispettosa." },
 39: { title: "L'Impedimento", hanzi: "蹇", pinyin: "Jiǎn", summary: "Ostacolo duro: chiedi aiuto, cambia strada, non intestardirti." },
 40: { title: "La Liberazione", hanzi: "解", pinyin: "Xiè", summary: "Sciogliere i nodi: dopo l'affanno, sollievo; riprendi con misura." },
 41: { title: "La Diminuzione", hanzi: "損", pinyin: "Sǔn", summary: "Togliere per riequilibrare: sacrificio utile, sobrietà fertile." },
 42: { title: "L'Accrescimento", hanzi: "益", pinyin: "Yì", summary: "Aumentare il bene: dono e scambio, generosità fruttuosa." },
 43: { title: "Risolutezza", hanzi: "夬", pinyin: "Guài", summary: "Decisione netta: espelli ciò che nuoce, parla con verità." },
 44: { title: "L'Incontro", hanzi: "姤", pinyin: "Gòu", summary: "Forza minore incontra maggiore: prudenza, non farti sedurre." },
 45: { title: "La Raccolta", hanzi: "萃", pinyin: "Cuì", summary: "Radunare risorse e persone: invito sincero, organizzazione." },
 46: { title: "L'Ascendere", hanzi: "升", pinyin: "Shēng", summary: "Salire gradualmente: impegno costante, piccoli passi in alto." },
 47: { title: "L'Oppressione", hanzi: "困", pinyin: "Kùn", summary: "Strettoie e fatica: mantieni dignità, chiedi sostegno giusto." },
 48: { title: "Il Pozzo", hanzi: "井", pinyin: "Jǐng", summary: "Fonte comune: rinnovare, mantenere pulita la risorsa per tutti." },
 49: { title: "La Rivoluzione", hanzi: "革", pinyin: "Gé", summary: "Cambio di pelle: prepara il consenso, agisci al momento esatto." },
 50: { title: "Il Crogiolo", hanzi: "鼎", pinyin: "Dǐng", summary: "Trasformare e nutrire: raffina, consacra, sostieni il nuovo." },
 51: { title: "Il Tuono", hanzi: "震", pinyin: "Zhèn", summary: "Scossa improvvisa: non farti travolgere, rispondi prontamente." },
 52: { title: "La Quiete", hanzi: "艮", pinyin: "Gèn", summary: "Fermarsi: raccoglimento, limiti sani, radicarsi nel presente." },
 53: { title: "Sviluppo graduale", hanzi: "漸", pinyin: "Jiàn", summary: "Crescita lenta: fiducia nei processi, stabilità che matura." },
 54: { title: "Le Nozze della fanciulla", hanzi: "歸妹", pinyin: "Guī Mèi", summary: "Impegni asimmetrici: misura, dignità, non svenderti." },
 55: { title: "L'Abbondanza", hanzi: "豐", pinyin: "Fēng", summary: "Pienezza temporanea: celebra ma organizza bene la sovrabbondanza." },
 56: { title: "Il Viandante", hanzi: "旅", pinyin: "Lǚ", summary: "Fuori casa: regole chiare, sobrietà, onora chi ti ospita." },
 57: { title: "Il Vento (Penetrare)", hanzi: "巽", pinyin: "Xùn", summary: "Influsso penetrante: delicatezza costante, convincere senza forzare." },
 58: { title: "La Gioia", hanzi: "兌", pinyin: "Duì", summary: "Letizia condivisa: dialogo franco, alleggerire con misura." },
 59: { title: "La Dispersione", hanzi: "渙", pinyin: "Huàn", summary: "Sciogliere e diffondere: ricomporre i cuori, unire dopo lo sparpaglio." },
 60: { title: "La Limitazione", hanzi: "節", pinyin: "Jié", summary: "Confini e regole: misura porta libertà, non rigidità cieca." },
 61: { title: "Verità interiore", hanzi: "中孚", pinyin: "Zhōng Fú", summary: "Fiducia al centro: sincerità calma, ponte tra le parti." },
 62: { title: "Piccola Preponderanza", hanzi: "小過", pinyin: "Xiǎo Guò", summary: "Eccesso del piccolo: prudenza, non sollevare grandi oneri." },
 63: { title: "Dopo il compimento", hanzi: "既濟", pinyin: "Jì Jì", summary: "Fatto ma instabile: attenzione, manutenzione, evitare compiacenza." },
 64: { title: "Prima del compimento", hanzi: "未濟", pinyin: "Wèi Jì", summary: "Quasi pronto: ultima attenzione, resta flessibile fino alla fine." },
};

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
  const vis = [...lines].reverse();
  return (
    <div className="w-full rounded-2xl border bg-white shadow-sm">
      <div className="px-4 py-3 border-b">
        <div className="text-base font-semibold">{title}</div>
      </div>
      <div className="p-4 space-y-2">
        {vis.map((v, idxFromTop) => {
          const idx = 5 - idxFromTop; // indice dal basso (1..6)
          const yang = isYang(v);
          const changing = isChanging(v);
          return (
            <div key={idx} className="flex items-center gap-3">
              <LineGraphic yang={yang} changing={changing} />
              <div className="w-24 text-xs text-right text-neutral-500">linea {idx + 1} {changing ? "(muta)" : ""}</div>
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

  const bits = useMemo(() => toBits(lines), [lines]);
  const relLines = useMemo(() => mutate(lines), [lines]);
  const relBits = useMemo(() => toBits(relLines), [relLines]);

  const lowerTri = bits.slice(0, 3);
  const upperTri = bits.slice(3, 6);
  const lowerTriRel = relBits.slice(0, 3);
  const upperTriRel = relBits.slice(3, 6);

  const kw = kingWenNumber(bits);
  const kwRel = kingWenNumber(relBits);

  const changing = lines
    .map((v, i) => (isChanging(v) ? i + 1 : null))
    .filter(Boolean) as number[];

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

  const meta = HEX_META[kw];
  const metaRel = HEX_META[kwRel];

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Lettura dell'I Ching</h1>
        <div className="flex gap-2">
          <button onClick={randomizeAll} className="px-3 py-2 rounded-xl bg-neutral-900 text-white text-sm shadow hover:opacity-90">Lancia 3 monete × 6</button>
          <button onClick={setAllYin} className="px-3 py-2 rounded-xl bg-white border text-sm shadow-sm hover:bg-neutral-50">Azzera (tutte yin)</button>
        </div>
      </header>

      <section className="rounded-2xl border bg-white shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Domanda (facoltativa)</label>
            <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Scrivi la tua intenzione/domanda..." className="w-full rounded-xl border px-3 py-2 text-sm" />

            <div className="pt-2 text-sm font-medium">Linee (dal basso all'alto)</div>
            <div className="space-y-2">
              {lines.map((v, i) => (
                <div key={i} className="flex items-center gap-3">
                  <select value={String(v)} onChange={(e) => setLine(i, Number(e.target.value) as LineValue)} className="w-56 rounded-xl border px-2 py-1.5 text-sm bg-white">
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
          <div className="mt-2 text-sm">
            <div className="font-bold">{kw}. {meta?.title} <span className="text-neutral-500">{meta?.hanzi} ({meta?.pinyin})</span></div>
            <p className="mt-1">{meta?.summary || "—"}</p>
            {question && (
              <p className="mt-2 text-neutral-600"><span className="font-medium">Domanda:</span> {question}</p>
            )}
          </div>
        </div>
        <div className="rounded-2xl border bg-white shadow-sm p-4">
          <div className="text-sm font-semibold">Testo (di relazione)</div>
          <div className="mt-2 text-sm">
            <div className="font-bold">{kwRel}. {metaRel?.title} <span className="text-neutral-500">{metaRel?.hanzi} ({metaRel?.pinyin})</span></div>
            <p className="mt-1">{metaRel?.summary || "—"}</p>
          </div>
        </div>
      </section>

      <footer className="rounded-2xl border bg-white shadow-sm p-4">
        <div className="text-sm font-semibold">Note tecniche / prossimi passi</div>
        <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
          <li>Se vuoi il metodo con gli steli d'achillea, possiamo aggiungerlo (probabilità diverse).</li>
          <li>Per testi più lunghi, carica un tuo database o aggiungi campi ai 64 record.</li>
          <li>Per storicizzare le letture, salva data/domanda/esagrammi in localStorage o DB.</li>
        </ul>
      </footer>
    </div>
  );
}

function triName(triBits: number[]): string {
  // Valore Fu Xi 0..7 con bit dal basso all'alto
  const v = triVal(triBits);
  // Etichette nell'ordine del valore binario 0..7
  const names = [
    "☷ Terra (Kun)", // 000 = 0
    "☶ Monte (Gen)", // 001 = 1
    "☵ Acqua (Kan)", // 010 = 2
    "☴ Vento (Xun)", // 011 = 3
    "☳ Tuono (Zhen)", // 100 = 4
    "☲ Fuoco (Li)", // 101 = 5
    "☱ Lago (Dui)", // 110 = 6
    "☰ Cielo (Qian)", // 111 = 7
  ];
  return names[v] ?? `Trigramma ${v}`;
}
