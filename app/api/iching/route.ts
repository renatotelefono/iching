import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    // 1. Carica hexagrams
    const hexPath = path.resolve("data", "hexagrams.it.json");
    const raw = fs.readFileSync(hexPath, "utf-8");
    const hexagrams = JSON.parse(raw);

    // 2. Esagramma casuale
    const keys = Object.keys(hexagrams);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const hex = hexagrams[randomKey];

    // 3. Due linee mobili casuali
    const lines = Object.keys(hex.lines);
    const randomLines = lines
      .sort(() => 0.5 - Math.random())
      .slice(0, 2)
      .map((n) => `Linea ${n}: ${hex.lines[n]}`);

    // 4. Contesto per GPT
    const context = `
Domanda: ${question}

Esagramma: ${hex.title}
Giudizio: ${hex.judgment}
Immagine: ${hex.image}

Linee mobili:
${randomLines.join("\n")}
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
