// app/api/monete/route.ts
import { NextResponse } from "next/server";

function tossCoin() {
  return Math.random() < 0.5 ? "Testa" : "Croce";
}

function calcLine(values: string[]) {
  const sum = values.reduce((s, v) => s + (v === "Testa" ? 3 : 2), 0);
  switch (sum) {
    case 6: return 6; // yin vecchio (muta)
    case 7: return 7; // yang giovane
    case 8: return 8; // yin giovane
    case 9: return 9; // yang vecchio (muta)
  }
}

export async function GET() {
  const lines: number[] = [];
  for (let i = 0; i < 6; i++) {
    lines.push(calcLine([tossCoin(), tossCoin(), tossCoin()])!);
  }
  return NextResponse.json({ lines });
}
