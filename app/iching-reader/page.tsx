"use client";

import { useState } from "react";

export default function IchingReaderPage() {
  // 🔹 valori di default
  const [question, setQuestion] = useState("cosa farò domani");
  const [esagramma, setEsagramma] = useState("64");
  const [lineeMobili, setLineeMobili] = useState(["2", "3", "5"]);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/iching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          esagramma,
          lineeMobili,
        }),
      });

      const data = await res.json();
      setResponse(data.answer || "Nessuna risposta ricevuta");
    } catch (err) {
      console.error("Errore API:", err);
      setResponse("Errore nella consultazione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Consultazione I Ching</h1>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Inserisci la tua domanda..."
        className="border p-2 w-full h-28 mb-4"
      />

      <div className="mb-4">
        <input
          type="text"
          value={esagramma}
          onChange={(e) => setEsagramma(e.target.value)}
          className="border p-2 mr-2"
          placeholder="Esagramma"
        />
        <input
          type="text"
          value={lineeMobili.join(",")}
          onChange={(e) => setLineeMobili(e.target.value.split(","))}
          className="border p-2"
          placeholder="Linee mobili (es. 2,3,5)"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Consultazione in corso..." : "Consulta"}
      </button>

      {response && (
        <div className="mt-6 border p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Risposta:</h2>
          <p className="whitespace-pre-line">{response}</p>
        </div>
      )}
    </div>
  );
}
