import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // 🔹 Supporta sia i nomi nuovi che quelli vecchi
    const body = await req.json();
    const question = body.question;
    const hexagram = body.hexagram || body.esagramma;
    const changingLines = body.changingLines || body.lineeMobili;

    // 1. Carica hexagrams
    const hexPath = path.resolve("data", "hexagrams.it.json");
    const raw = fs.readFileSync(hexPath, "utf-8");
    const hexagrams = JSON.parse(raw);

    // 2. Usa l’esagramma passato dal frontend
    const hex = hexagrams[String(hexagram)];
    if (!hex) {
      return NextResponse.json(
        { error: `Esagramma ${hexagram} non trovato` },
        { status: 400 }
      );
    }

    // 3. Prepara linee mobili
    const selectedLines = (changingLines || []).map(
      (n: number) => `Linea ${n}: ${hex.lines?.[n]}`
    );

    // 4. Contesto per GPT
    const context = `
Domanda: ${question}

Esagramma: ${hex.title}
Giudizio: ${hex.judgment}
Immagine: ${hex.image}

Linee mobili:
${selectedLines.length > 0 ? selectedLines.join("\n") : "(nessuna)"}
`;

    // 5. Chiamata a OpenAI
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Sei un interprete dell'I Ching. Fornisci una risposta chiara, saggia e pratica.",
        },
        { role: "user", content: context },
      ],
    });

    const answer = completion.choices[0].message?.content || "";

    // 6. Scrivi risposta su file
    const outPath = path.resolve("public", "risposta.txt");
    fs.writeFileSync(outPath, answer, "utf-8");

    return NextResponse.json({ answer });
  } catch (err: any) {
    console.error("Errore API:", err);
    return NextResponse.json(
      { error: "Errore durante la consultazione" },
      { status: 500 }
    );
  }
}
