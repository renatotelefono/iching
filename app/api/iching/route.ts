import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const question = body.question;

    // 🔹 ricevi primario e relazione
    const primaryHex = body.esagrammaPrimario || body.hexagram || body.esagramma;
    const relationHex = body.esagrammaRelazione || body.hexagramRel || null;

    const changingLines = body.changingLines || body.lineeMobili;

    // 1. Carica esagrammi dal file
    const hexPath = path.resolve("data", "hexagrams.it.json");
    const raw = fs.readFileSync(hexPath, "utf-8");
    const hexagrams = JSON.parse(raw);

    const hexPrimary = hexagrams[String(primaryHex)];
    const hexRelation = relationHex ? hexagrams[String(relationHex)] : null;

    if (!hexPrimary) {
      return NextResponse.json(
        { error: `Esagramma primario ${primaryHex} non trovato` },
        { status: 400 }
      );
    }

    // 2. Prepara le linee mobili
    const selectedLines = (changingLines || []).map(
      (n: number) => `Linea ${n}: ${hexPrimary.lines?.[n]}`
    );

    // 3. Costruisci contesto per GPT
    const context = `
Domanda: ${question}

Esagramma primario: ${hexPrimary.title}
Giudizio: ${hexPrimary.judgment}
Immagine: ${hexPrimary.image}

Linee mobili:
${selectedLines.length > 0 ? selectedLines.join("\n") : "(nessuna)"}

${
  hexRelation
    ? `Esagramma di relazione: ${hexRelation.title}
Giudizio: ${hexRelation.judgment}
Immagine: ${hexRelation.image}`
    : ""
}
`;

    // 4. Chiamata a OpenAI
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

    return NextResponse.json({ answer });
  } catch (err: any) {
    console.error("Errore API:", err);
    return NextResponse.json(
      { error: "Errore durante la consultazione" },
      { status: 500 }
    );
  }
}
