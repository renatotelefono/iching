import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== "string" || question.trim().length < 5) {
      return NextResponse.json(
        { error: "Domanda troppo breve o mancante" },
        { status: 400 }
      );
    }

    const prompt = `
L'utente ha scritto la seguente domanda per consultare l'I Ching:

"${question}"

Il tuo compito è:
1. Correggere eventuali errori grammaticali o ambiguità.
2. Riformularla in modo chiaro, neutro e conciso, mantenendo il significato originale.
3. Non aggiungere interpretazioni o giudizi, restituisci solo la domanda finale, pronta per essere confermata.

Rispondi SOLO con la versione riformulata della domanda.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 80,
      temperature: 0.5,
    });

    const validatedQuestion = completion.choices[0].message?.content?.trim();

    if (!validatedQuestion) {
      return NextResponse.json(
        { error: "Impossibile ottenere la domanda validata" },
        { status: 500 }
      );
    }

    return NextResponse.json({ validatedQuestion });
  } catch (error: any) {
    console.error("Errore API OpenAI:", error);
    return NextResponse.json(
      {
        error: "Errore durante la validazione della domanda",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
